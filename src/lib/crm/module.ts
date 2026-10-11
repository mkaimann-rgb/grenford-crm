/**
 * Datenmodell der Fachmodule (Phasen B–G): Akquise, Investment, Property, Projects,
 * Netzwerk, Provisionen und Systemdaten.
 *
 * Grundsätze (siehe docs/UMSETZUNGSPLAN.md):
 * - Stammdaten (Unternehmen, Personen, Objekte) existieren genau einmal; Module verweisen per ID (Ref).
 * - Jeder fachliche Vorgang hat eine eigene ID, einen Geschäftsbereich und eigene Beteiligte mit Rollen.
 * - Struktur entspricht 1:1 den Tabellen in supabase/migrations (spätere Datenbank).
 */
import type { Geschaeftsbereich, ID } from "./types.ts";
import type { Auszahlung, Forderung, Verbindlichkeit, Zahlungseingang } from "../finanzen/logic.ts";


/** Verweis auf einen Stammsatz (Person oder Unternehmen) */
export type Ref = { art: "person" | "unternehmen"; id: ID };
/** Beteiligte eines Vorgangs mit Rolle in genau diesem Vorgang */
/** Beteiligter mit Rolle im Vorgang; `pruefen` = Rolle/Zuordnung fachlich nicht eindeutig belegt */
export type Beteiligter = Ref & { rolle: string; pruefen?: string };

export type Unterphase = { code: string; titel: string };
export type Phase = { code: string; titel: string; unter: Unterphase[] };

const P = (code: string, titel: string, unter: string[]): Phase => ({ code, titel, unter: unter.map((t, i) => ({ code: `${code}${i + 1}`, titel: t })) });

/** Investment – Prozessphasen A–F (Vorlage „02_Investment_Käuferprozesse“) */
export const PHASEN_INVESTMENT: Phase[] = [
  P("A", "Akquise", ["Erstkontakt", "NDA", "Datenraum"]),
  P("B", "Analyse", ["Marktanalyse", "Bewertung", "Strategie"]),
  P("C", "Vermarktung", ["Teaser", "Käuferansprache", "Konkrete Interessenten", "Angebote"]),
  P("D", "Verhandlung", ["LOI", "Due Diligence", "Kaufvertrag"]),
  P("E", "Notar / Closing", ["Notartermin", "Beurkundung", "Übergabe"]),
  P("F", "Nachbetreuung", ["Zahlung", "Reporting", "Follow-up"]),
];

/** Property – Prozessphasen A–E (Vorlage „02_Property_Käuferprozesse“) */
export const PHASEN_PROPERTY: Phase[] = [
  P("A", "Erstkontakt", ["Erstkontakt", "NDA", "Suchkriterien"]),
  P("B", "Analyse", ["Finanzierungsnachweis", "Besichtigung", "Bewertung"]),
  P("C", "Verhandlung", ["Angebot", "Kaufpreisverhandlung", "Entwurf Kaufvertrag", "Due Diligence"]),
  P("D", "Notar / Closing", ["Notartermin", "Beurkundung", "Kaufpreiszahlung"]),
  P("E", "Nachbetreuung", ["Übergabe", "Reporting", "Follow-up"]),
];

/**
 * Projects – Projektphasen A–F. Hauptphasen gemäß Vorlage „03_Projects_Projektprozesse“
 * (Akquise → Projektaufnahme → Angebotsphase → GU-Auswahl → Vertragsabschluss → Begleitung).
 * Die Unterphasen sind in der Vorlage nicht ausgeführt – VORLÄUFIGER VORSCHLAG, vom Auftraggeber vorläufig
 * beibehalten, fachlich noch nicht endgültig freigegeben (Stand 2026-10).
 */
export const PHASEN_PROJECTS: Phase[] = [
  P("A", "Akquise", ["Erstgespräch", "Bedarfsermittlung"]),
  P("B", "Projektaufnahme", ["Vor-Ort-Termin / Aufmaß", "Leistungsbeschreibung"]),
  P("C", "Angebotsphase", ["Anfrage an GU-Partner", "Angebote eingegangen", "Angebotsvergleich (Renovation Memo)"]),
  P("D", "GU-Auswahl", ["Kundengespräch", "Vergabeentscheidung durch Kunden"]),
  P("E", "Vertragsabschluss", ["Bauvertrag Kunde – GU", "Vergütungsvereinbarung"]),
  P("F", "Begleitung", ["Ausführung", "Abnahme", "Abrechnung"]),
];

/** Provisionsbeteiligung – Schritte 1–4 (Vorlage „02_Netzwerk_Provisionsbeteiligung“) */
export const PHASEN_BETEILIGUNG: Phase[] = [
  { code: "1", titel: "Vereinbarung", unter: [{ code: "1.1", titel: "Erstkontakt" }, { code: "1.2", titel: "Verhandlung" }, { code: "1.3", titel: "Beteiligungsvereinbarung" }] },
  { code: "2", titel: "Projektlaufzeit", unter: [{ code: "2.1", titel: "Zusammenarbeit" }, { code: "2.2", titel: "Meilensteine" }, { code: "2.3", titel: "Leistungsnachweis" }] },
  { code: "3", titel: "Provisionsberechnung", unter: [{ code: "3.1", titel: "Courtage erzielt" }, { code: "3.2", titel: "Anteil berechnet" }, { code: "3.3", titel: "Abrechnung vorbereitet" }] },
  { code: "4", titel: "Auszahlung", unter: [{ code: "4.1", titel: "Rechnung gestellt" }, { code: "4.2", titel: "Zahlung erfolgt" }, { code: "4.3", titel: "Abschluss" }] },
];

/** Akquise-Pipeline – Stufen 1–7 (Vorlage „Akquise-Pipeline“) */
export const PIPELINE_STUFEN = [
  { titel: "Neu", text: "Lead eingegangen" },
  { titel: "Kontakt", text: "Erstkontakt erfolgt" },
  { titel: "Qualifizierung", text: "Bedarf & Potenzial" },
  { titel: "Unterlagen", text: "Informationen sammeln" },
  { titel: "Konditionen", text: "Vergütung abstimmen" },
  { titel: "Vertrag / Mandat", text: "Vereinbarung vorbereiten" },
  { titel: "Wartet auf Unterschrift", text: "Vertrag liegt vor" },
] as const;

export const PRIORITAETEN_MODUL = ["Niedrig", "Normal", "Hoch"] as const;

type Basis = {
  id: ID;
  erstelltAm: string;
  verantwortlichId: ID;
  /** Interne Bemerkung */
  notiz?: string;
};

export const AKQUISE_STATUS = ["Aktiv", "Pausiert", "Übernommen", "Verloren"] as const;
export type Akquise = Basis & {
  titel: string;
  bereich: Geschaeftsbereich;
  quelle: string;
  objektart: string;
  tags: string[];
  /** 0–6 = Stufe 1–7 */
  stufe: number;
  status: (typeof AKQUISE_STATUS)[number];
  prioritaet: string;
  wahrscheinlichkeit: number;
  volumen: number;
  kunde?: Ref;
  ansprechpartnerId?: ID;
  /** Eigentümer/Verkäufer – kann (noch) unbekannt sein */
  eigentuemer?: Ref;
  eigentuemerHinweis?: string;
  vermittler?: Beteiligter;
  objektId?: ID;
  ort: string;
  wiedervorlage?: string;
  naechsterSchritt: string;
  erwarteterAbschluss: string;
  /** Netto-Courtage bzw. Vergütung gesamt (erwartet) */
  courtageNetto: number;
  /** Anteil GRENFORD an der Courtage in % */
  eigenerAnteil: number;
  kooperationsart: string;
  vereinbarung: string;
  checkliste: { text: string; erledigt: boolean; datum?: string }[];
  bewertung: string;
  empfehlungspartnerId?: ID;
  /** Nach „Qualifizieren & übernehmen“: Verweis auf den Vorgang im Geschäftsbereich */
  uebernahme?: { id: ID; datum: string };
};

export const INVEST_STATUS = ["Aktiv", "In Prüfung", "Pausiert", "Abgeschlossen", "Abgesagt"] as const;
export type InvestmentProjekt = Basis & {
  titel: string;
  objektId: ID;
  assetklasse: string;
  standort: string;
  /** Kaufpreis (Indikation) */
  volumen: number;
  zielpreis: string;
  /** Unterphase, z. B. „C2“ */
  phase: string;
  status: (typeof INVEST_STATUS)[number];
  naechsterSchritt: string;
  wiedervorlage?: string;
  eigentuemer?: Ref;
  vermarktungsart: string;
  faktor?: number;
  rendite?: number;
  upside?: string;
  /** Netto-Courtage in % vom Kaufpreis (erwartet) */
  courtageSatz: number;
  tags: string[];
  beteiligte: Beteiligter[];
  akquiseId?: ID;
  empfehlungspartnerId?: ID;
  abschlussErwartet: string;
};

export const KAEUFER_STATUS = ["Aktiv", "Pausiert", "Abgesagt", "Gekauft"] as const;
/** Käuferprozess – eigener Vorgang je Käufer, Investment (INV-OPT) oder Property (PROP-OPT) */
export type Kaeuferprozess = Basis & {
  bereich: "Investment" | "Property";
  /** Investment-Projekt-ID bzw. Property-Mandats-ID */
  projektId: ID;
  kaeufer: Ref;
  ansprechpartnerId?: ID;
  typ: string;
  indikation: number;
  wahrscheinlichkeit: number;
  phase: string;
  status: (typeof KAEUFER_STATUS)[number];
  letzterKontakt: string;
  suchauftragId?: ID;
  /** Rolle/Stand fachlich nicht eindeutig belegt – sichtbar als Prüfhinweis */
  pruefen?: string;
};

export const PROFIL_STATUS = ["Aktiv", "In Prüfung", "In Verhandlung", "Platziert", "Inaktiv"] as const;
export type Ankaufsprofil = Basis & {
  unternehmenId?: ID;
  personId?: ID;
  investorentyp: string;
  assetklassen: string[];
  regionen: string[];
  volumenVon: number;
  volumenBis: number;
  renditeMin?: number;
  kriterien: string;
  status: (typeof PROFIL_STATUS)[number];
};

export const SUCH_STATUS = ["Aktiv", "In Prüfung", "In Verhandlung", "Platziert", "Abgeschlossen", "Inaktiv"] as const;
/** Suchauftrag – Investment (SRCH-I) oder Property (SRCH-P), fachlich getrennt über `bereich` */
export type Suchauftrag = Basis & {
  bereich: "Investment" | "Property";
  kunde: Ref;
  ansprechpartnerId?: ID;
  typ: string;
  /** Assetklasse (Investment) bzw. Objektart (Property) */
  objektart: string;
  regionen: string[];
  volumenVon: number;
  volumenBis: number;
  kriterien: string;
  status: (typeof SUCH_STATUS)[number];
  prioritaet: string;
  zielzeitraum: string;
  /** Property: Kauf oder Miete */
  mandatstyp?: string;
  /** Verknüpfte Investment-Projekte bzw. Property-Mandate */
  verknuepft: ID[];
};

export const MANDAT_STATUS = ["In Vorbereitung", "Aktiv", "In Prüfung", "In Verhandlung", "Beurkundung / Closing", "Abgeschlossen", "Inaktiv"] as const;
export const VERMARKTUNG_STATUS = ["Vorbereitung", "Exposé", "Vermarktung", "Angebot", "Verhandlung", "Verkauft", "Ruhend"] as const;
/** Property-Mandat – vom Objekt getrennt: ein Objekt kann über die Zeit mehrere Mandate haben */
export type PropertyMandat = Basis & {
  objektId: ID;
  mandatstyp: string;
  /** Eigentümer – leer, wenn (noch) nicht eindeutig bekannt */
  eigentuemer?: Ref;
  preis: number;
  /** Courtage in % (netto) */
  courtageSatz: number;
  courtageModell: string;
  status: (typeof MANDAT_STATUS)[number];
  vermarktung: (typeof VERMARKTUNG_STATUS)[number];
  phase: string;
  naechsterSchritt: string;
  wiedervorlage?: string;
  vertragVon: string;
  vertragBis: string;
  vermarktungsart: string;
  tags: string[];
  beteiligte: Beteiligter[];
  empfehlungspartnerId?: ID;
};

export const INTERESSENT_STATUS = ["Aktiv", "In Kontakt", "In Prüfung", "In Verhandlung", "Käufer", "Abgeschlossen", "Inaktiv"] as const;
/** Interessent = Rolle eines bestehenden Stammsatzes (keine Kopie) */
export type Interessent = Basis & {
  ref: Ref;
  ansprechpartnerId?: ID;
  typ: string;
  objektarten: string[];
  regionen: string[];
  budgetVon: number;
  budgetBis: number;
  kriterien: string;
  status: (typeof INTERESSENT_STATUS)[number];
  weitere: [string, string][];
};

export const PMANDAT_STATUS = ["Angebot", "In Verhandlung", "Planung", "Aktiv", "In Umsetzung", "In Prüfung", "Abgeschlossen", "Inaktiv"] as const;
/** Projects-Mandat = Kundenbeziehung und Beratungsauftrag; enthält ein oder mehrere Projekte */
export type ProjectsMandat = Basis & {
  kunde: Ref;
  objektId?: ID;
  kundentyp: string;
  sanierungsart: string;
  status: (typeof PMANDAT_STATUS)[number];
  /** Vergütung GRENFORD in % der provisionspflichtigen Netto-Bausumme */
  verguetungSatz: number;
  empfehlungspartnerId?: ID;
};

export const PROJEKT_STATUS = ["Aktiv", "Pausiert", "Abgeschlossen", "Abgesagt"] as const;
/** Projects-Projekt = konkrete Baumaßnahme innerhalb eines Mandats */
export type ProjectsProjekt = Basis & {
  mandatId: ID;
  titel: string;
  objektId?: ID;
  einheit: string;
  bauherr: Ref;
  leistungsumfang: string;
  budget: number;
  phase: string;
  status: (typeof PROJEKT_STATUS)[number];
  geplanterStart: string;
  geplantesEnde: string;
  verguetungSatz: number;
  ziele: string[];
  naechsterSchritt: string;
  wiedervorlage?: string;
  beteiligte: Beteiligter[];
  /** Vergabe – Entscheidung trifft der Kunde; GRENFORD dokumentiert nur */
  vergabe?: { angebotId: ID; datum: string; vergabesumme: number; auftraggeber: string };
  empfehlungspartnerId?: ID;
};

export const ANGEBOT_STATUS = ["Angefragt", "Eingegangen", "Abgelehnt", "Beauftragt"] as const;
export type Angebot = {
  id: ID;
  projektId: ID;
  guId: ID;
  datum?: string;
  summe?: number;
  umfang: string;
  status: (typeof ANGEBOT_STATUS)[number];
  /** Dateiname des Originalangebots (Ablage später Google Drive) */
  dokument?: string;
};

export const GU_STATUS = ["Aktiv", "In Prüfung", "In Verhandlung", "Inaktiv"] as const;
export type GUPartner = Basis & {
  unternehmenId: ID;
  ansprechpartnerId?: ID;
  kategorie: "Generalunternehmer" | "Fachpartner";
  gewerke: string[];
  regionen: string[];
  status: (typeof GU_STATUS)[number];
  bevorzugt: boolean;
  seit: string;
  vereinbarung: { status: string; datum?: string; provisionsregelung: string };
};

export const PARTNER_STATUS = ["Aktiv", "In Verhandlung", "Inaktiv"] as const;
export type Empfehlungspartner = Basis & {
  unternehmenId?: ID;
  personId: ID;
  kategorie: string;
  bereiche: Geschaeftsbereich[];
  /** Vertraglich vereinbarte Sätze – Standard aus Einstellungen, individuell überschreibbar */
  saetze: Partial<Record<Geschaeftsbereich, number>>;
  kooperation: { status: string; vom?: string; laufzeit: string };
  status: (typeof PARTNER_STATUS)[number];
  seit: string;
};

export const BETEILIGUNG_STATUS = ["In Verhandlung", "Aktiv", "Abgerechnet", "Ausgezahlt", "Storniert"] as const;
/** Provisionsbeteiligung – individuell vereinbarter Anteil an der GRENFORD-Provision (kein Standardsatz) */
export type Provisionsbeteiligung = Basis & {
  beteiligter: Ref;
  referenz: ID;
  bereich: Geschaeftsbereich;
  art: string;
  grund: string;
  anteil: number;
  /** Individuell vereinbarter Festbetrag – hat Vorrang vor dem Anteil */
  festbetrag?: number;
  /**
   * Vorrangiger externer Makleranteil (z. B. Gemeinschaftsgeschäft mit externem Makler): mindert die maßgebliche
   * GRENFORD-Netto-Courtage als Bemessungsgrundlage der Empfehlungsprovision. Interne Beteiligungen (false/leer) nicht.
   */
  vorrangig?: boolean;
  /** Berechnungsgrundlage: GRENFORD-Provision netto */
  basis: number;
  faelligkeit: string;
  status: (typeof BETEILIGUNG_STATUS)[number];
  phase: string;
  vereinbartAm: string;
  verbindlichkeitNr?: string;
};

export const PROVISION_STATUS = ["Erwartet", "Entstanden", "Abgerechnet"] as const;
/** Provisionsanspruch von GRENFORD – getrennt von Rechnung, Forderung und Zahlung */
export type Provision = {
  id: ID;
  referenz: ID;
  bereich: Geschaeftsbereich;
  art: string;
  zahler: string;
  zahlerRef?: Ref;
  basis: number;
  satz: number;
  betrag: number;
  status: (typeof PROVISION_STATUS)[number];
  datum: string;
  rechnungNr?: string;
};

export type Verlauf = { id: ID; ref: ID; zeit: string; text: string; benutzerId: ID };
export type Dokument = { id: ID; ref: ID; name: string; groesse: string; datum: string; ablage: "Testdaten" | "Google Drive" };

export type Einstellungen = {
  provisionsstandards: Record<Geschaeftsbereich, number>;
  benachrichtigungen: Record<string, boolean>;
  benutzer: { name: string; email: string; rolle: string };
};

// ---------- Logik ----------

export function phaseTitel(phasen: Phase[], code: string) {
  const p = phasen.find((x) => x.code === code[0]);
  const u = p?.unter.find((x) => x.code === code);
  return u ? `${p!.code} – ${u.titel}` : p ? `${p.code} – ${p.titel}` : code;
}

/** Index der Hauptphase (0-basiert) und Unterphase */
export function phasenIndex(phasen: Phase[], code: string) {
  const i = phasen.findIndex((x) => code.startsWith(x.code));
  const j = i >= 0 ? phasen[i].unter.findIndex((u) => u.code === code) : -1;
  return { i, j };
}

/** Nächste Unterphase (über Hauptphasengrenzen hinweg); null am Ende */
export function naechstePhase(phasen: Phase[], code: string): string | null {
  const alle = phasen.flatMap((p) => p.unter.map((u) => u.code));
  const k = alle.indexOf(code);
  if (k < 0) return alle[0];
  return k + 1 < alle.length ? alle[k + 1] : null;
}

/** Nächste freie Nummer eines Nummernkreises, z. B. INV-2026-008 */
export function naechsteNummer(prefix: string, vorhanden: string[], stellen = 3) {
  const re = new RegExp(`^${prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(\\d+)$`);
  const max = vorhanden.reduce((m, id) => {
    const t = re.exec(id);
    return t ? Math.max(m, Number(t[1])) : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(stellen, "0")}`;
}

/** Erwartete GRENFORD-Provision eines Investment-Projekts */
export const erwarteteCourtage = (p: Pick<InvestmentProjekt, "volumen" | "courtageSatz">) => Math.round((p.volumen * p.courtageSatz) / 100);

/**
 * Wahrscheinlichkeit eines Investment-Projekts bzw. Property-Mandats: abgeschlossen = 100 %,
 * sonst die höchste Wahrscheinlichkeit der nicht abgesagten Käuferprozesse, ohne Käuferprozess 10 %.
 */
export function vorgangsWahrscheinlichkeit(v: { id: ID; status: string }, kps: { projektId: string; wahrscheinlichkeit: number; status: string }[]) {
  if (v.status === "Abgeschlossen") return 100;
  const w = kps.filter((k) => k.projektId === v.id && k.status !== "Abgesagt").map((k) => k.wahrscheinlichkeit);
  return w.length ? Math.max(...w) : 10;
}

/** Rolle des Käufers im Käuferprozess: nur bei Status „Gekauft“ bestätigter Käufer, sonst Kaufinteressent */
export const kaeuferRolle = (k: { bereich: string; status: string }) =>
  k.status === "Gekauft" ? (k.bereich === "Investment" ? "Käufer (Investor)" : "Käufer") : k.bereich === "Investment" ? "Kaufinteressent (Investor)" : "Kaufinteressent";

/** Gewichteter Wert (Provision × Wahrscheinlichkeit) */
export const gewichtet = (betrag: number, wahrscheinlichkeit: number) => Math.round((betrag * wahrscheinlichkeit) / 100);

/** Vergütung Projects: Satz × provisionspflichtige Netto-Bausumme (inkl. vereinbarter Nachträge) */
export const projectsVerguetung = (bausumme: number, satz: number) => Math.round((bausumme * satz) / 100);

/** Empfehlungsprovision: projektbezogene Vereinbarung hat Vorrang vor dem Standardsatz */
export function empfehlungsprovision(basis: number, standardSatz: number, individuell?: { satz?: number; festbetrag?: number }) {
  if (individuell?.festbetrag !== undefined) return { satz: basis ? Math.round((individuell.festbetrag / basis) * 10000) / 100 : 0, betrag: individuell.festbetrag, quelle: "individuell vereinbart (Festbetrag)" };
  const satz = individuell?.satz ?? standardSatz;
  return { satz, betrag: Math.round((basis * satz) / 100), quelle: individuell?.satz !== undefined ? "individuell vereinbart" : "Standard laut Vertrag" };
}

/** Vergabe Projects: Nur wenn GRENFORD selbst Auftraggeber des GU ist, entsteht eine GRENFORD-Verbindlichkeit (Direktbeauftragung durch den Kunden: keine). */
export const vergabeErzeugtVerbindlichkeit = (auftraggeber: string) => auftraggeber === "GRENFORD";

/**
 * Bemessungsgrundlage der Empfehlungsprovision (Regel laut Auftraggeber, 2026-10):
 *  - Investment/Property: maßgebliche GRENFORD-Netto-Courtage des Vorgangs (Provisionsansprüche; entstanden,
 *    sonst erwartet) NACH Abzug vorrangiger externer Makleranteile. Interne Provisionsbeteiligungen werden
 *    nicht zusätzlich abgezogen.
 *  - Projects: vertraglich maßgebliche provisionspflichtige Netto-Bausumme inkl. vereinbarter Nachträge
 *    (Vergabesumme). Ohne Vergabe gibt es noch keine vertragliche Basis (0, „erwartet“).
 *  Satz: Standard aus den Einstellungen (10 % / 10 % / 3 %); individuelle Vereinbarungen haben Vorrang (empfehlungsprovision()).
 */
export function empfehlungsBemessung(
  referenz: ID,
  d: { provisionen: Provision[]; kaeuferprozesse: Pick<Kaeuferprozess, "id" | "projektId">[]; provisionsbeteiligungen: Provisionsbeteiligung[]; projectsProjekte: Pick<ProjectsProjekt, "id" | "vergabe">[] },
  bereichVorgabe?: Geschaeftsbereich | null,
) {
  const bereich: Geschaeftsbereich | null = bereichVorgabe ?? (referenz.startsWith("PRO-") ? "Projects" : referenz.startsWith("PROP") ? "Property" : referenz.startsWith("INV") ? "Investment" : null);
  if (bereich === "Projects") {
    const p = d.projectsProjekte.find((x) => x.id === referenz);
    const basis = p?.vergabe?.vergabesumme ?? 0;
    return { bereich, courtage: basis, abzug: 0, basis, art: "Netto-Bausumme inkl. vereinbarter Nachträge", erwartet: !p?.vergabe };
  }
  const zumVorgang = (r: ID) => r === referenz || d.kaeuferprozesse.some((k) => k.id === r && k.projektId === referenz);
  const prov = d.provisionen.filter((p) => zumVorgang(p.referenz));
  const entstanden = prov.filter((p) => p.status !== "Erwartet").reduce((s, p) => s + p.betrag, 0);
  const erwartet = prov.filter((p) => p.status === "Erwartet").reduce((s, p) => s + p.betrag, 0);
  const courtage = entstanden || erwartet;
  const abzug = d.provisionsbeteiligungen.filter((b) => b.vorrangig && b.status !== "Storniert" && zumVorgang(b.referenz)).reduce((s, b) => s + beteiligungsbetrag(b), 0);
  return { bereich, courtage, abzug, basis: Math.max(0, courtage - abzug), art: abzug ? "GRENFORD-Netto-Courtage nach Abzug externer Makleranteile" : "GRENFORD-Netto-Courtage", erwartet: !entstanden };
}

/** Provisionsbeteiligung: ausschließlich individueller Anteil, kein Standardsatz */
export const beteiligungsbetrag = (b: Pick<Provisionsbeteiligung, "basis" | "anteil" | "festbetrag">) => b.festbetrag ?? Math.round((b.basis * b.anteil) / 100);

/** Angebote für den Renovation-Memo-Vergleich anonymisieren: Partner A, B, C … (nach Eingang) */
export function anonymisiere(angebote: Angebot[]) {
  const eingegangen = angebote.filter((a) => a.summe !== undefined && a.status !== "Angefragt").sort((a, b) => (a.datum ?? "").localeCompare(b.datum ?? "") || a.id.localeCompare(b.id));
  return new Map(eingegangen.map((a, i) => [a.id, `Partner ${String.fromCharCode(65 + i)}`]));
}

/** Kennzahlen des Angebotsvergleichs */
export function angebotsvergleich(angebote: Angebot[]) {
  const mit = angebote.filter((a) => a.summe !== undefined && a.status !== "Angefragt");
  if (!mit.length) return null;
  const summen = mit.map((a) => a.summe!);
  const min = Math.min(...summen);
  const max = Math.max(...summen);
  return { anzahl: mit.length, min, max, spanne: max - min, guenstigstes: mit.find((a) => a.summe === min)!.id };
}

// ---------- Finanzen (gemeinsame Datenbasis aller Finanzansichten) ----------

/** Forderung = Rechnung an Kunden; Mahnstufe 0 = keine, 1 = 1. Mahnung, 2 = 2. Mahnung, 3 = Vollstreckung / rechtliche Eskalation (nur Nachverfolgung) */
export type ForderungCrm = Forderung & { referenz?: ID; kundeRef?: Ref; mahnstufe?: number; datum?: string; provisionId?: ID };
/** Verbindlichkeit von GRENFORD; `quelle` = Empfehlung, Provisionsbeteiligung oder Projekt mit GRENFORD als Zahlungsschuldner */
export type VerbindlichkeitCrm = Verbindlichkeit & { empfaengerRef?: Ref; quelle?: ID };
export type FinanzDaten = { forderungen: ForderungCrm[]; zahlungseingaenge: Zahlungseingang[]; verbindlichkeiten: VerbindlichkeitCrm[]; auszahlungen: Auszahlung[] };

export const MAHNSTUFEN = ["Keine Mahnung", "1. Mahnung", "2. Mahnung", "Vollstreckung / rechtliche Eskalation"] as const;

// ---------- Matching (Ankaufsprofile, Suchaufträge, Interessenten) ----------

const OBJEKTGRUPPEN: Record<string, string[]> = {
  wohnen: ["wohnen", "mfh", "mehrfamilienhaus", "wohnportfolio", "zinshaus", "eigentumswohnung", "wohnung", "penthouse", "einfamilienhaus", "wohn- und geschäftshaus"],
  gewerbe: ["gewerbe", "büro", "büro / gewerbe", "mixed-use", "wohn- und geschäftshaus"],
  hotel: ["hotel", "hotel / betreiber", "betreiber"],
  logistik: ["logistik", "light industrial"],
  living: ["co-living", "micro-living", "mikro-living", "senior living"],
  healthcare: ["healthcare", "pflege"],
  grundstueck: ["grundstück", "grundstücke"],
};

/** Prüft, ob eine Objektart zu einer gesuchten Kategorie passt (z. B. „Wohnen“ ↔ „Mehrfamilienhaus“) */
export function objektartPasst(gesucht: string, objektart: string) {
  const g = gesucht.toLowerCase().trim();
  const o = objektart.toLowerCase().trim();
  if (!g || !o) return false;
  if (o.includes(g) || g.includes(o)) return true;
  return Object.values(OBJEKTGRUPPEN).some((gr) => gr.some((x) => g.includes(x)) && gr.some((x) => o.includes(x)));
}

const REGION_ALIAS: Record<string, string[]> = { dach: ["deutschland", "österreich", "schweiz", "d-ch", "berlin", "hamburg", "münchen", "nrw", "leipzig", "potsdam", "erzgebirge", "ostsee", "süddeutschland", "bad reichenhall"], d: ["deutschland", "berlin", "hamburg", "münchen", "nrw", "leipzig", "potsdam", "erzgebirge", "ostsee", "süddeutschland"] };

export function regionPasst(regionen: string[], standort: string) {
  const s = standort.toLowerCase();
  return regionen.some((r) => {
    const x = r.toLowerCase().trim();
    return s.includes(x) || x.includes(s.split(/[-, ]/)[0]) || (REGION_ALIAS[x] ?? []).some((a) => s.includes(a));
  });
}

/**
 * Passende Vorgänge zu Suchkriterien: Objektart, Region, Volumen (Mio. €, ±20 % Toleranz).
 * Ergebnis mit Trefferquote 0–3 (3 = alle Kriterien erfüllt), nur Treffer ≥ 2.
 */
export function passend<T extends { id: string }>(
  kriterien: { objektarten: string[]; regionen: string[]; von: number; bis: number },
  kandidaten: T[],
  daten: (k: T) => { objektart: string; standort: string; volumen: number },
) {
  return kandidaten
    .map((k) => {
      const d = daten(k);
      const mio = d.volumen / 1e6;
      const score = Number(kriterien.objektarten.some((o) => objektartPasst(o, d.objektart))) + Number(regionPasst(kriterien.regionen, d.standort)) + Number(mio >= kriterien.von * 0.8 && mio <= kriterien.bis * 1.2);
      return { k, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);
}
