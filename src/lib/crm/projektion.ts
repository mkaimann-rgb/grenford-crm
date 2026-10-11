/**
 * Projektion der Fachmodule auf die einheitliche Vorgangsansicht (Vorhaben-Form),
 * damit Kontakt-, Unternehmens- und Objektseiten alle Vorgänge eines Stammsatzes zeigen –
 * ohne Daten zu kopieren. Reine Funktionen, getestet in projektion.test.mts.
 */
import type { Geschaeftsbereich, ID, Vorhaben, VorhabenStatus } from "./types.ts";
import {
  PHASEN_INVESTMENT, PHASEN_PROJECTS, PHASEN_PROPERTY, PIPELINE_STUFEN, phaseTitel,
  type Akquise, type Beteiligter, type InvestmentProjekt, type Kaeuferprozess, type Phase, type PropertyMandat,
  type ProjectsMandat, type ProjectsProjekt, type Provisionsbeteiligung, type Ref, type Ankaufsprofil, type Suchauftrag,
  type Interessent, type GUPartner, type Empfehlungspartner,
} from "./module.ts";

export type ModulDaten = {
  akquise: Akquise[];
  investmentProjekte: InvestmentProjekt[];
  kaeuferprozesse: Kaeuferprozess[];
  propertyMandate: PropertyMandat[];
  projectsMandate: ProjectsMandat[];
  projectsProjekte: ProjectsProjekt[];
  provisionsbeteiligungen: Provisionsbeteiligung[];
  ankaufsprofile: Ankaufsprofil[];
  suchauftraege: Suchauftrag[];
  interessenten: Interessent[];
  guPartner: GUPartner[];
  empfehlungspartner: Empfehlungspartner[];
};

/** Fortschritt in % aus der Unterphase */
export function fortschritt(phasen: Phase[], code: string) {
  const alle = phasen.flatMap((p) => p.unter.map((u) => u.code));
  const k = alle.indexOf(code);
  return k < 0 ? 0 : Math.round(((k + 1) / alle.length) * 100);
}

const statusVon = (s: string): VorhabenStatus =>
  s === "Abgeschlossen" || s === "Gekauft" || s === "Übernommen" || s === "Ausgezahlt" ? "Abgeschlossen"
  : s === "Pausiert" || s === "Abgesagt" || s === "Verloren" || s === "Inaktiv" || s === "Storniert" ? "Pausiert"
  : s === "In Vorbereitung" || s === "Planung" || s === "In Prüfung" ? "In Planung"
  : s === "Angebot" ? "Angebotsphase" : "Aktiv";

const bet = (r: Ref | undefined, rolle: string): Beteiligter[] => (r ? [{ ...r, rolle }] : []);

/** Eintrag für das Vorgangsverzeichnis: Titel, Bereich, Link */
export type VorgangInfo = { id: ID; titel: string; typ: string; bereich: Geschaeftsbereich | null; href: string; status: string; objektId?: ID };

export const HREF = {
  akquise: (id: ID) => `/akquise/pipeline/${id}`,
  invest: (id: ID) => `/investment/projekte/${id}`,
  investKp: (id: ID) => `/investment/kaeuferprozesse/${id}`,
  mandat: (id: ID) => `/property/objekte/${id}`,
  propKp: (id: ID) => `/property/kaeuferprozesse/${id}`,
  pmandat: (id: ID) => `/projects/mandate/${id}`,
  projekt: (id: ID) => `/projects/projekte/${id}`,
  beteiligung: (id: ID) => `/netzwerk/provisionsbeteiligte/${id}`,
  ankauf: (id: ID) => `/investment/ankaufsprofile?id=${id}`,
  suchI: (id: ID) => `/investment/suchauftraege?id=${id}`,
  suchP: (id: ID) => `/property/suchauftraege?id=${id}`,
  interessent: (id: ID) => `/property/interessenten?id=${id}`,
  gu: (id: ID) => `/projects/gu-partner?id=${id}`,
  ep: (id: ID) => `/netzwerk/empfehlungspartner?id=${id}`,
};

/** Verzeichnis aller Modul-Datensätze (für Verweise, Aktivitäten-Bezüge, Finanzreferenzen) */
export function vorgangsIndex(m: ModulDaten): Map<ID, VorgangInfo> {
  const idx = new Map<ID, VorgangInfo>();
  const add = (i: VorgangInfo) => idx.set(i.id, i);
  for (const a of m.akquise) add({ id: a.id, titel: a.titel, typ: "Akquise", bereich: a.bereich, href: HREF.akquise(a.id), status: a.status, objektId: a.objektId });
  for (const p of m.investmentProjekte) add({ id: p.id, titel: p.titel, typ: "Investment-Projekt", bereich: "Investment", href: HREF.invest(p.id), status: p.status, objektId: p.objektId });
  for (const p of m.propertyMandate) add({ id: p.id, titel: p.id, typ: `Property-Mandat (${p.mandatstyp})`, bereich: "Property", href: HREF.mandat(p.id), status: p.status, objektId: p.objektId });
  for (const k of m.kaeuferprozesse) {
    const parent = k.bereich === "Investment" ? m.investmentProjekte.find((p) => p.id === k.projektId) : m.propertyMandate.find((p) => p.id === k.projektId);
    add({ id: k.id, titel: `Käuferprozess ${k.id}`, typ: `Käuferprozess ${k.bereich}`, bereich: k.bereich, href: k.bereich === "Investment" ? HREF.investKp(k.id) : HREF.propKp(k.id), status: k.status, objektId: parent?.objektId });
  }
  for (const p of m.projectsMandate) add({ id: p.id, titel: `Mandat ${p.id}`, typ: "Projects-Mandat", bereich: "Projects", href: HREF.pmandat(p.id), status: p.status, objektId: p.objektId });
  for (const p of m.projectsProjekte) add({ id: p.id, titel: p.titel, typ: "Projects-Projekt", bereich: "Projects", href: HREF.projekt(p.id), status: p.status, objektId: p.objektId });
  for (const b of m.provisionsbeteiligungen) add({ id: b.id, titel: `Provisionsbeteiligung ${b.id}`, typ: "Provisionsbeteiligung", bereich: b.bereich, href: HREF.beteiligung(b.id), status: b.status });
  for (const a of m.ankaufsprofile) add({ id: a.id, titel: `Ankaufsprofil ${a.id}`, typ: "Ankaufsprofil", bereich: "Investment", href: HREF.ankauf(a.id), status: a.status });
  for (const s of m.suchauftraege) add({ id: s.id, titel: `Suchauftrag ${s.id}`, typ: `Suchauftrag ${s.bereich}`, bereich: s.bereich, href: s.bereich === "Investment" ? HREF.suchI(s.id) : HREF.suchP(s.id), status: s.status });
  for (const i of m.interessenten) add({ id: i.id, titel: `Interessent ${i.id}`, typ: "Interessent", bereich: "Property", href: HREF.interessent(i.id), status: i.status });
  for (const g of m.guPartner) add({ id: g.id, titel: `GU-Partner ${g.id}`, typ: "GU-Partner", bereich: "Projects", href: HREF.gu(g.id), status: g.status });
  for (const e of m.empfehlungspartner) add({ id: e.id, titel: `Empfehlungspartner ${e.id}`, typ: "Empfehlungspartner", bereich: null, href: HREF.ep(e.id), status: e.status });
  return idx;
}

const v = (x: Partial<Vorhaben> & Pick<Vorhaben, "id" | "titel" | "art" | "geschaeftsbereich" | "status">): Vorhaben => ({
  ort: "", beschreibung: "", budget: 0, fortschritt: 0, zeithorizont: "", rolle: "", herkunft: "abgeleitet", ...x,
});

/**
 * Vorgänge aus den Fachmodulen in Vorhaben-Form (nur Anzeige). Die Beteiligten tragen ihre Rolle
 * im jeweiligen Vorgang; vorgaengeVonPerson/-Unternehmen ordnen sie Kontakten zu.
 */
export function modulVorgaenge(m: ModulDaten): Vorhaben[] {
  const out: Vorhaben[] = [];
  for (const a of m.akquise) {
    if (a.status === "Übernommen") continue; // lebt im übernommenen Vorgang weiter
    out.push(v({ id: a.id, referenz: a.id, href: HREF.akquise(a.id), titel: a.titel, art: `Akquise · ${PIPELINE_STUFEN[a.stufe].titel}`, geschaeftsbereich: a.bereich, status: statusVon(a.status), objektId: a.objektId, ort: a.ort, budget: a.volumen, fortschritt: Math.round(((a.stufe + 1) / 7) * 100),
      beteiligte: [...bet(a.kunde, "Kunde (Akquise)"), ...(a.ansprechpartnerId ? [{ art: "person" as const, id: a.ansprechpartnerId, rolle: "Ansprechpartner (Akquise)" }] : []), ...(a.vermittler ? [a.vermittler] : []), ...bet(a.eigentuemer, "Eigentümer / Verkäufer")], grund: "Akquise-Pipeline" }));
  }
  for (const p of m.investmentProjekte) {
    out.push(v({ id: p.id, referenz: p.id, href: HREF.invest(p.id), titel: p.titel, art: `Investment-Projekt · ${phaseTitel(PHASEN_INVESTMENT, p.phase)}`, geschaeftsbereich: "Investment", status: statusVon(p.status), objektId: p.objektId, ort: p.standort, budget: p.volumen, fortschritt: fortschritt(PHASEN_INVESTMENT, p.phase),
      beteiligte: dedupeBet([...bet(p.eigentuemer, "Verkäufer / Eigentümer"), ...p.beteiligte]), grund: "Modul Investment" }));
  }
  for (const k of m.kaeuferprozesse) {
    const parent = k.bereich === "Investment" ? m.investmentProjekte.find((p) => p.id === k.projektId) : m.propertyMandate.find((p) => p.id === k.projektId);
    const phasen = k.bereich === "Investment" ? PHASEN_INVESTMENT : PHASEN_PROPERTY;
    out.push(v({ id: k.id, referenz: k.id, href: k.bereich === "Investment" ? HREF.investKp(k.id) : HREF.propKp(k.id), titel: parent && "titel" in parent ? parent.titel : k.projektId, art: `Käuferprozess · ${phaseTitel(phasen, k.phase)}`, geschaeftsbereich: k.bereich, status: statusVon(k.status), objektId: parent?.objektId, budget: k.indikation, fortschritt: fortschritt(phasen, k.phase),
      beteiligte: dedupeBet([{ ...k.kaeufer, rolle: k.bereich === "Investment" ? "Käufer (Investor)" : "Kaufinteressent / Käufer" }, ...(k.ansprechpartnerId ? [{ art: "person" as const, id: k.ansprechpartnerId, rolle: "Ansprechpartner Käufer" }] : [])]), grund: `Käuferprozess zu ${k.projektId}` }));
  }
  for (const p of m.propertyMandate) {
    out.push(v({ id: p.id, referenz: p.id, href: HREF.mandat(p.id), titel: p.id, art: `Property-Mandat (${p.mandatstyp}) · ${phaseTitel(PHASEN_PROPERTY, p.phase)}`, geschaeftsbereich: "Property", status: statusVon(p.status), objektId: p.objektId, budget: p.preis, fortschritt: fortschritt(PHASEN_PROPERTY, p.phase),
      beteiligte: dedupeBet([...bet(p.eigentuemer, p.mandatstyp === "Vermietung" ? "Eigentümer / Vermieter" : "Eigentümer / Verkäufer"), ...p.beteiligte]), pruefen: p.eigentuemer ? undefined : "Eigentümer noch nicht eindeutig bekannt", grund: "Modul Property" }));
  }
  for (const p of m.projectsProjekte) {
    out.push(v({ id: p.id, referenz: p.id, href: HREF.projekt(p.id), titel: p.titel, art: `Projects-Projekt · ${phaseTitel(PHASEN_PROJECTS, p.phase)}`, geschaeftsbereich: "Projects", status: statusVon(p.status), objektId: p.objektId, budget: p.budget, fortschritt: fortschritt(PHASEN_PROJECTS, p.phase),
      beteiligte: dedupeBet([{ ...p.bauherr, rolle: "Bauherr" }, ...p.beteiligte]), grund: `Modul Projects (Mandat ${p.mandatId})` }));
  }
  for (const b of m.provisionsbeteiligungen) {
    out.push(v({ id: b.id, referenz: b.id, href: HREF.beteiligung(b.id), titel: `Provisionsbeteiligung zu ${b.referenz}`, art: b.art, geschaeftsbereich: b.bereich, status: statusVon(b.status), beteiligte: [{ ...b.beteiligter, rolle: "Provisionsbeteiligter" }], grund: "Netzwerk – Provisionsbeteiligte" }));
  }
  return out;
}

function dedupeBet(liste: Beteiligter[]) {
  const seen = new Set<string>();
  return liste.filter((b) => {
    const k = `${b.art}:${b.id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const refLabelArt = (r: Ref) => (r.art === "person" ? "Person" : "Unternehmen");
