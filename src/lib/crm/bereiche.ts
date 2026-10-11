/**
 * Geschäftsbereichslogik (Investment / Property / Projects).
 *
 * - Zuordnungen hängen am zentralen Stammsatz (keine Kopien je Bereich).
 * - Ableitungen erfolgen nur aus eindeutigen Beziehungen; mehrdeutige Fälle
 *   werden als „Bereich prüfen“ gekennzeichnet statt willkürlich zugeordnet.
 * - Dieselben Regeln prüfen später die Konsistenz mit Investment-Projekten,
 *   Property-Mandaten und Projects-Vorhaben (siehe `bereichsHinweise`).
 */
import type { BereichsZuordnung, Geschaeftsbereich, Person, Unternehmen, Unternehmensart, Vorhaben } from "./types.ts";
import { GESCHAEFTSBEREICHE } from "./types.ts";

export type Ableitung = { bereich: Geschaeftsbereich; funktion: string; grund: string };
export type Ergebnis = { zuordnungen: Ableitung[]; unklar: string[] };

/** Unternehmensart → Geschäftsbereich (null = nicht eindeutig) */
const ART_BEREICH: Record<Unternehmensart, Geschaeftsbereich | null> = {
  Investor: "Investment",
  Projektentwickler: "Investment",
  Bestandshalter: "Investment",
  "Family Office": "Investment",
  Vermögensverwalter: "Investment",
  Generalunternehmer: "Projects",
  Küchenstudio: "Projects",
  Makler: null,
  Finanzierer: null,
  Sonstige: null,
};

/** Interesse / Vorhabensart einer Privatperson → Geschäftsbereich (null = nicht eindeutig) */
export function interesseBereich(interesse: string): Geschaeftsbereich | null {
  if (/^Kauf \(Eigennutzung\)|^Verkauf|Ferienimmobilie|Suchauftrag/.test(interesse)) return "Property";
  if (/Sanierung|Modernisierung|Neubau|Innenausbau|Renovierung|Bad|Küche|Fassade|Dach|Heizung|Elektro|Maler|Fenster|Umbau|Teilsanierung|Komplettsanierung/.test(interesse)) return "Projects";
  return null; // z. B. „Kauf (Kapitalanlage)“: Investment oder Property
}

function merge(list: Ableitung[]): Ableitung[] {
  const m = new Map<Geschaeftsbereich, Ableitung>();
  for (const a of list) {
    const alt = m.get(a.bereich);
    if (!alt) m.set(a.bereich, { ...a });
    else {
      // Funktion: die erste (spezifischste, explizite Beziehungen stehen vorne) bleibt erhalten
      if (!alt.funktion) alt.funktion = a.funktion;
      if (!alt.grund.includes(a.grund)) alt.grund = `${alt.grund}; ${a.grund}`;
    }
  }
  return GESCHAEFTSBEREICHE.filter((b) => m.has(b)).map((b) => m.get(b)!);
}

/** Ableitung für ein Unternehmen aus Unternehmensarten und expliziten Beziehungen */
export function ableitenUnternehmen(u: Pick<Unternehmen, "arten">, explizit: Ableitung[] = []): Ergebnis {
  const zu: Ableitung[] = [...explizit];
  const unklar: string[] = [];
  for (const art of u.arten) {
    const b = ART_BEREICH[art];
    if (b) zu.push({ bereich: b, funktion: art, grund: `Unternehmensart „${art}“` });
    else if (!explizit.length) unklar.push(`Unternehmensart „${art}“ ist keinem Bereich eindeutig zuzuordnen`);
  }
  return { zuordnungen: merge(zu), unklar: zu.length ? [] : unklar };
}

/** Ableitung für eine Person aus Kundenrollen, Vorhaben, Firmenverknüpfungen und expliziten Beziehungen */
export function ableitenPerson(
  p: Pick<Person, "kontakte" | "privat" | "sanierung">,
  vorhaben: Pick<Vorhaben, "bereich" | "art" | "titel">[],
  firmen: Map<string, Pick<Unternehmen, "name" | "bereiche">>,
  explizit: Ableitung[] = [],
): Ergebnis {
  const zu: Ableitung[] = [...explizit];
  const unklar: string[] = [];
  for (const k of p.kontakte) {
    const u = firmen.get(k.unternehmenId);
    for (const z of u?.bereiche ?? []) zu.push({ bereich: z.bereich, funktion: k.rolle, grund: `Ansprechpartner von ${u!.name}` });
  }
  if (p.sanierung) zu.push({ bereich: "Projects", funktion: "Sanierungskunde", grund: "Kundenrolle Sanierungskunde" });
  for (const i of p.privat?.interessen ?? []) {
    const b = interesseBereich(i);
    const funktion = i.startsWith("Verkauf") ? "Verkäufer" : i.startsWith("Kauf") ? "Käufer" : "Privatkunde";
    if (b) zu.push({ bereich: b, funktion, grund: `Interesse „${i}“` });
    else unklar.push(`Interesse „${i}“: Investment oder Property – bitte prüfen`);
  }
  for (const v of vorhaben) {
    const b = v.bereich === "sanierung" ? "Projects" : interesseBereich(v.art);
    if (b) zu.push({ bereich: b, funktion: v.bereich === "sanierung" ? "Sanierungskunde" : "Privatkunde", grund: `Vorhaben „${v.titel}“` });
    else unklar.push(`Vorhaben „${v.titel}“ (${v.art}): Bereich nicht eindeutig`);
  }
  const zuordnungen = merge(zu);
  return { zuordnungen, unklar: [...new Set(unklar)] };
}

export function alsZuordnungen(a: Ableitung[]): BereichsZuordnung[] {
  return a.map((x) => ({ bereich: x.bereich, funktion: x.funktion, herkunft: "abgeleitet", grund: x.grund }));
}

/** Filter „mindestens einer der gewählten Bereiche“. Sonderwert PRUEFEN = ohne eindeutige Zuordnung. */
export const PRUEFEN = "Zu prüfen";
export function passtBereich(e: { bereiche: BereichsZuordnung[]; bereichPruefen?: string }, gewaehlt: string[]) {
  if (!gewaehlt.length) return true;
  return gewaehlt.some((g) => (g === PRUEFEN ? !!e.bereichPruefen || !e.bereiche.length : e.bereiche.some((z) => z.bereich === g)));
}

/**
 * Konsistenzprüfung: Bereiche, die sich aus aktuellen Beziehungen ergeben,
 * aber (noch) nicht zugeordnet sind. Wird später auch für Investment-Projekte,
 * Property-Mandate und Projects-Vorhaben verwendet.
 */
export function bereichsHinweise(zuordnungen: BereichsZuordnung[], abgeleitet: Ableitung[]): Ableitung[] {
  const vorhanden = new Set(zuordnungen.map((z) => z.bereich));
  return abgeleitet.filter((a) => !vorhanden.has(a.bereich));
}

/** Kurzlabel für kompakte Kennzeichnung */
export const BEREICH_KURZ: Record<Geschaeftsbereich, string> = { Investment: "INV", Property: "PROP", Projects: "PROJ" };

/** Formularwerte → Zuordnungen. Unveränderte Einträge behalten Herkunft und Begründung, Änderungen gelten als manuell. */
export function ausFormular(form: { bereich: string; funktion: string }[], alt: BereichsZuordnung[] = []): BereichsZuordnung[] {
  return GESCHAEFTSBEREICHE.filter((b) => form.some((x) => x.bereich === b)).map((b) => {
    const neu = form.find((x) => x.bereich === b)!;
    const vorher = alt.find((z) => z.bereich === b);
    return vorher && vorher.funktion === neu.funktion.trim() ? vorher : { bereich: b, funktion: neu.funktion.trim(), herkunft: "manuell" as const };
  });
}

/** Fehlende Bereiche aus einer Beziehung ergänzen (bestehende Zuordnungen bleiben unverändert) */
export function ergaenzeBereiche(alt: BereichsZuordnung[], neu: Ableitung[]): BereichsZuordnung[] {
  const fehlend = neu.filter((n) => !alt.some((z) => z.bereich === n.bereich));
  return fehlend.length ? ausFormular([...alt, ...fehlend.map((n) => ({ bereich: n.bereich, funktion: n.funktion }))], [...alt, ...alsZuordnungen(fehlend)]) : alt;
}
