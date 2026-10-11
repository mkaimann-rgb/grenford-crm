/**
 * Vorgänge (Vorhaben) und Objekte je Geschäftsbereich.
 *
 * Trennung von drei Ebenen:
 *  1. Geschäftsbereich des Kontakts (Person/Unternehmen.bereiche) – siehe bereiche.ts
 *  2. Geschäftsbereich des einzelnen Vorgangs (Vorhaben.geschaeftsbereich)
 *  3. Rolle des Kontakts im Vorgang (Vorhaben.rolle, unternehmenRolle, beteiligte[].rolle)
 *
 * Reine Funktionen ohne React – getestet in vorgaenge.test.mts.
 */
import type { Geschaeftsbereich, ID, Objekt, Person, Unternehmen, Vorhaben } from "./types.ts";

export type Einstufung = { geschaeftsbereich: Geschaeftsbereich | null; rolle: string; pruefen?: string };

const SANIERUNG = /sanierung|modernisierung|renovierung|neubau|innenausbau|umbau|bad|küche|dach|fassade|fenster|heizung|elektro|maler/i;

/**
 * Eindeutige Einstufung eines Vorgangs aus Kundenrolle und Vorgangsart.
 * Nicht eindeutige Fälle bekommen geschaeftsbereich = null bzw. einen Prüfhinweis – nie eine geratene Zuordnung.
 */
export function einstufen(v: Pick<Vorhaben, "bereich" | "art">): Einstufung {
  if (v.bereich === "sanierung") return { geschaeftsbereich: "Projects", rolle: "Sanierungskunde" };
  const art = v.art;
  if (art === "Kauf (Eigennutzung)" || art === "Suchauftrag") return { geschaeftsbereich: "Property", rolle: "Kaufinteressent" };
  if (art === "Verkauf") return { geschaeftsbereich: "Property", rolle: "Verkäufer" };
  if (art === "Ferienimmobilie") return { geschaeftsbereich: "Property", rolle: "Privatkunde", pruefen: "Rolle unklar: Kaufinteressent oder Eigentümer der Ferienimmobilie" };
  if (art === "Kauf (Kapitalanlage)") return { geschaeftsbereich: null, rolle: "Kaufinteressent (Kapitalanlage)", pruefen: "Kapitalanlage: Investment oder Property – bitte festlegen" };
  if (SANIERUNG.test(art)) return { geschaeftsbereich: "Projects", rolle: "Bauherr" };
  return { geschaeftsbereich: null, rolle: "Privatkunde", pruefen: `Vorgangsart „${art}“ keinem Geschäftsbereich eindeutig zuzuordnen` };
}

/** Typische Rollen je Geschäftsbereich (Auswahlhilfe im Formular, Freitext bleibt möglich) */
export const ROLLEN_JE_BEREICH: Record<Geschaeftsbereich, string[]> = {
  Investment: ["Investor", "Verkäufer", "Bestandshalter", "Projektentwickler", "Empfehlungspartner", "Provisionsbeteiligter"],
  Property: ["Kaufinteressent", "Verkäufer", "Eigentümer", "Vermieter", "Mieter", "Empfehlungspartner"],
  Projects: ["Bauherr", "Sanierungskunde", "Eigentümer", "GU-Partner", "Ausführender Betrieb", "Finanzierer"],
};

/** Vorgangsarten je Geschäftsbereich (Auswahlhilfe) */
export const VORGANGSARTEN: Record<Geschaeftsbereich, string[]> = {
  Investment: ["Investment-Transaktion", "Ankauf", "Verkauf", "Bewertung / Analyse"],
  Property: ["Kauf (Eigennutzung)", "Verkauf", "Vermietung", "Suchauftrag", "Ferienimmobilie"],
  Projects: ["Sanierung / Modernisierung", "Komplettsanierung", "Teilsanierung", "Neubau / Innenausbau", "Bad / Innenausbau", "Küche / Innenausbau", "Renovierung"],
};

/** Normalisierung für die Objekt-Dublettenprüfung (Titel + Ort) */
export function objektSchluessel(titel: string, ort: string) {
  const n = (s: string) => s.toLowerCase().replace(/str\./g, "straße").replace(/strasse/g, "straße").replace(/[^a-z0-9äöüß]/g, "");
  return `${n(titel)}|${n(ort)}`;
}

/** Bestehendes Objekt mit gleichem Titel und Ort – verhindert doppelte Objekt-Stammsätze */
export function findeObjekt(objekte: Objekt[], titel: string, ort: string): Objekt | undefined {
  const k = objektSchluessel(titel, ort);
  return objekte.find((o) => objektSchluessel(o.titel, o.ort) === k);
}

export type VorgangZeile = {
  v: Vorhaben;
  objekt?: Objekt;
  /** Rolle DIESES Kontakts im Vorgang */
  rolle: string;
  /** gesetzt, wenn die Beziehung über ein verknüpftes Unternehmen besteht */
  ueber?: string;
  /** Weitere Vorgänge am selben Objekt (andere Bereiche oder Kontakte) */
  weitere: Vorhaben[];
};

function zeile(v: Vorhaben, rolle: string, alle: Vorhaben[], objekte: Map<ID, Objekt>, ueber?: string): VorgangZeile {
  const objekt = v.objektId ? objekte.get(v.objektId) : undefined;
  const weitere = v.objektId ? alle.filter((x) => x.objektId === v.objektId && x.id !== v.id) : [];
  return { v, objekt, rolle, ueber, weitere };
}

/** Alle Vorgänge einer Person: als Kunde, als Beteiligte und (nachrangig) über verknüpfte Unternehmen */
export function vorgaengeVonPerson(
  p: Pick<Person, "id" | "kontakte">,
  alle: Vorhaben[],
  objekteListe: Objekt[],
  firmen: Map<ID, Pick<Unternehmen, "name">>,
): VorgangZeile[] {
  const objekte = new Map(objekteListe.map((o) => [o.id, o]));
  const out: VorgangZeile[] = [];
  const gesehen = new Set<ID>();
  for (const v of alle) {
    if (v.personId === p.id) { out.push(zeile(v, v.rolle, alle, objekte)); gesehen.add(v.id); continue; }
    const b = v.beteiligte?.find((x) => x.art === "person" && x.id === p.id);
    if (b) { out.push(zeile(v, b.rolle, alle, objekte)); gesehen.add(v.id); }
  }
  for (const k of p.kontakte) {
    for (const v of alle) {
      if (gesehen.has(v.id)) continue;
      const rolle = v.unternehmenId === k.unternehmenId ? v.unternehmenRolle : v.beteiligte?.find((x) => x.art === "unternehmen" && x.id === k.unternehmenId)?.rolle;
      if (rolle) { out.push(zeile(v, rolle, alle, objekte, firmen.get(k.unternehmenId)?.name)); gesehen.add(v.id); }
    }
  }
  return out;
}

/** Alle Vorgänge eines Unternehmens (ausführend oder beteiligt) */
export function vorgaengeVonUnternehmen(u: Pick<Unternehmen, "id">, alle: Vorhaben[], objekteListe: Objekt[]): VorgangZeile[] {
  const objekte = new Map(objekteListe.map((o) => [o.id, o]));
  return alle.flatMap((v) => {
    const rolle = v.unternehmenId === u.id ? v.unternehmenRolle ?? "Beteiligtes Unternehmen" : v.beteiligte?.find((x) => x.art === "unternehmen" && x.id === u.id)?.rolle;
    return rolle ? [zeile(v, rolle, alle, objekte)] : [];
  });
}

/** Geschäftsbereiche, in denen ein Objekt vorkommt (je Bereich eigener Vorgang) */
export function bereicheDesObjekts(objektId: ID, alle: Vorhaben[]): Geschaeftsbereich[] {
  const s = new Set(alle.filter((v) => v.objektId === objektId && v.geschaeftsbereich).map((v) => v.geschaeftsbereich!));
  return (["Investment", "Property", "Projects"] as const).filter((b) => s.has(b));
}
