/**
 * ============================================================
 *  TESTDATEN – KEINE ECHTEN KUNDEN- ODER GESCHÄFTSDATEN
 * ============================================================
 * Alle Namen, Beträge, Termine und Vorgänge in dieser Datei sind
 * fiktive Beispielwerte aus der freigegebenen Dashboard-Visualisierung.
 * Sie dienen ausschließlich der Darstellung in Entwicklungsstufe 1 und
 * werden später durch Daten aus der Datenbank (Supabase) ersetzt.
 */

export const IS_TEST_DATA = true as const;

export type Bereich = "investment" | "property" | "projects";

export const testUser = { name: "Marco Kaimann", firstName: "Marco", initials: "MK" };

export const kpis = {
  umsatzYtd: { label: "Umsatz YTD (bezahlt)", value: 1_260_000, deltaPct: 28, trend: [3, 4.2, 4.4, 5.6, 4.1, 5.2, 5.5, 4.8, 5.0, 5.3] },
  offeneForderungen: { label: "Offene Forderungen", value: 482_000, deltaPct: -12, trend: [4.2, 5.4, 4.6, 5.6, 4.5, 4.0, 5.1, 5.6, 5.4] },
  pipeline: { label: "Pipeline (gewichtet)", value: 3_800_000, deltaPct: 22, trend: [2.0, 3.1, 4.2, 4.3, 5.2, 5.6, 5.4, 5.6] },
  aktiveVorgaenge: { label: "Aktive Vorgänge", value: 18, split: { investment: 7, property: 5, projects: 6 } },
};

/** Umsatzentwicklung 2026 in Tsd. € (Okt = aktueller Monat, danach Forecast) */
export const umsatzentwicklung = [
  { monat: "Jan", eingang: 75, ausgang: 35 },
  { monat: "Feb", eingang: 135, ausgang: 55 },
  { monat: "Mär", eingang: 100, ausgang: 60 },
  { monat: "Apr", eingang: 230, ausgang: 72 },
  { monat: "Mai", eingang: 180, ausgang: 115 },
  { monat: "Jun", eingang: 300, ausgang: 145 },
  { monat: "Jul", eingang: 170, ausgang: 105 },
  { monat: "Aug", eingang: 240, ausgang: 150 },
  { monat: "Sep", eingang: 335, ausgang: 198 },
  { monat: "Okt", eingang: 245, ausgang: 152, forecast: 245 },
  { monat: "Nov", ausgang: 225, forecast: 322 },
  { monat: "Dez", ausgang: 172, forecast: 400 },
] as { monat: string; eingang?: number; ausgang?: number; forecast?: number }[];
export const aktuellerMonat = "Okt";

/** Provisionen nach Geschäftsbereich in Mio. € */
export const provisionen = [
  { bereich: "Investment", bezahlt: 1.25, offen: 0.78, erwartet: 1.75 },
  { bereich: "Property", bezahlt: 0.6, offen: 0.38, erwartet: 1.08 },
  { bereich: "Projects", bezahlt: 0.78, offen: 0.48, erwartet: 1.2 },
];

export type TopEntry = {
  id: string;
  name: string;
  ort: string;
  phase?: string;
  volumenMio: number;
  fortschritt: number;
  bild: string;
};

export const topInvestmentDeals: TopEntry[] = [
  { id: "inv-1", name: "Montesana", ort: "Bad Reichenhall (DE/CH)", phase: "C – Vermarktung", volumenMio: 1.2, fortschritt: 60, bild: "/testbilder/inv-1.jpg" },
  { id: "inv-2", name: "Berlin-Schöneberg (MFH)", ort: "Berlin", phase: "C – Käuferansprache", volumenMio: 2.9, fortschritt: 70, bild: "/testbilder/inv-2.jpg" },
  { id: "inv-3", name: "das ERZ", ort: "Erzgebirge", phase: "B – Analyse", volumenMio: 0.8, fortschritt: 40, bild: "/testbilder/inv-3.jpg" },
];

export const topPropertyMandate: TopEntry[] = [
  { id: "prop-1", name: "Sömmeringstraße 35", ort: "Berlin", phase: "B – Vermarktung", volumenMio: 0.6, fortschritt: 50, bild: "/testbilder/prop-1.jpg" },
  { id: "prop-2", name: "Penthouse Charlottenburg", ort: "Berlin", phase: "C – Käuferansprache", volumenMio: 1.8, fortschritt: 60, bild: "/testbilder/prop-2.jpg" },
  { id: "prop-3", name: "Potsdamer Straße", ort: "Berlin", phase: "A – Akquise", volumenMio: 0.4, fortschritt: 30, bild: "/testbilder/prop-3.jpg" },
];

export const topProjects: TopEntry[] = [
  { id: "proj-1", name: "Potsdam (Neubau)", ort: "Potsdam", phase: "C – Vergabe", volumenMio: 0.7, fortschritt: 50, bild: "/testbilder/proj-1.jpg" },
  { id: "proj-2", name: "Swantehof", ort: "Sylt", phase: "B – Planung", volumenMio: 0.5, fortschritt: 40, bild: "/testbilder/proj-2.jpg" },
  { id: "proj-3", name: "Sanierungsberatung", ort: "Berlin", phase: "A – Angebot", volumenMio: 0.25, fortschritt: 20, bild: "/testbilder/proj-3.jpg" },
];

export type BelegStatus = "Überfällig" | "Offen" | "Entwurf" | "Fällig" | "Bezahlt";

export type Beleg = {
  nr: string;
  partei: string;
  betrag: number;
  faellig: string;
  status: BelegStatus;
};

/** Forderungen (Kunden), Verbindlichkeiten (Partner) und Zahlungen werden getrennt geführt. */
export const offeneForderungen: Beleg[] = [
  { nr: "RE-2026-015", partei: "Simple Invest (MFH Schöneberg)", betrag: 87_000, faellig: "15.09.2026", status: "Überfällig" },
  { nr: "RE-2026-016", partei: "Montesana AG", betrag: 273_950, faellig: "30.09.2026", status: "Offen" },
  { nr: "RE-2026-017", partei: "Privatkunde (Renovation)", betrag: 12_000, faellig: "10.10.2026", status: "Offen" },
  { nr: "RE-2026-018", partei: "Kay Brandes (Beratung)", betrag: 8_500, faellig: "25.10.2026", status: "Entwurf" },
  { nr: "RE-2026-019", partei: "Testkunde Nord GmbH", betrag: 42_300, faellig: "31.10.2026", status: "Entwurf" },
  { nr: "RE-2026-020", partei: "Testkunde Süd GmbH", betrag: 18_900, faellig: "05.11.2026", status: "Entwurf" },
  { nr: "RE-2026-021", partei: "Muster Immobilien KG", betrag: 27_400, faellig: "12.11.2026", status: "Entwurf" },
  { nr: "RE-2026-022", partei: "Beispiel Bau GmbH", betrag: 12_950, faellig: "20.11.2026", status: "Entwurf" },
];

export const verbindlichkeiten: Beleg[] = [
  { nr: "GS-2026-007", partei: "Empfehlungspartner A (Montesana)", betrag: 27_395, faellig: "15.10.2026", status: "Fällig" },
  { nr: "GS-2026-008", partei: "Provisionsbeteiligter B (Schöneberg)", betrag: 14_500, faellig: "20.10.2026", status: "Offen" },
  { nr: "GS-2026-009", partei: "Empfehlungspartner C (Potsdam)", betrag: 5_250, faellig: "02.10.2026", status: "Überfällig" },
  { nr: "GS-2026-010", partei: "Provisionsbeteiligter D (Sylt)", betrag: 9_800, faellig: "31.10.2026", status: "Offen" },
  { nr: "GS-2026-011", partei: "Empfehlungspartner E (Berlin)", betrag: 3_100, faellig: "15.11.2026", status: "Offen" },
];

export const bezahlt: Beleg[] = [
  { nr: "RE-2026-003", partei: "Testkunde West GmbH", betrag: 145_000, faellig: "28.02.2026", status: "Bezahlt" },
  { nr: "RE-2026-006", partei: "Muster Holding AG", betrag: 220_500, faellig: "30.04.2026", status: "Bezahlt" },
  { nr: "RE-2026-009", partei: "Beispiel Wohnbau KG", betrag: 98_000, faellig: "15.06.2026", status: "Bezahlt" },
  { nr: "RE-2026-012", partei: "Testkunde Ost GmbH", betrag: 185_250, faellig: "31.08.2026", status: "Bezahlt" },
];
export const bezahltAnzahl = 12;

export type TerminArt = "video" | "ort" | "person";

export const termine: { tag: string; wochentag: string; zeit: string; titel: string; detail: string; art: TerminArt }[] = [
  { tag: "10", wochentag: "Di", zeit: "09:00", titel: "Call mit Investoren", detail: "Montesana AG", art: "video" },
  { tag: "10", wochentag: "Di", zeit: "11:30", titel: "Objektbesichtigung", detail: "Brautstraße 29, Berlin", art: "ort" },
  { tag: "10", wochentag: "Di", zeit: "14:00", titel: "Strategie & Vermarktung", detail: "Kay Brandes", art: "video" },
  { tag: "11", wochentag: "Mi", zeit: "10:00", titel: "Angebotsprüfung", detail: "Sander Bau GmbH", art: "person" },
  { tag: "12", wochentag: "Do", zeit: "15:00", titel: "Käufergespräch", detail: "Berlin-Schöneberg (MFH)", art: "video" },
];

export const aufgaben: { id: string; titel: string; faellig: string; heute?: boolean }[] = [
  { id: "a1", titel: "Käufergespräch vorbereiten", faellig: "Heute", heute: true },
  { id: "a2", titel: "Teaser Montesana senden", faellig: "Heute", heute: true },
  { id: "a3", titel: "NDA Potsdamer Straße", faellig: "11.10.2026" },
  { id: "a4", titel: "Angebotsprüfung Sander Bau", faellig: "12.10.2026" },
  { id: "a5", titel: "Materialliste Weichselstraße 20", faellig: "14.10.2026" },
];

export type AktivitaetArt = "email" | "termin" | "dokument" | "telefon";

export const letzteAktivitaeten: { art: AktivitaetArt; titel: string; text: string; zeit: string; von: string }[] = [
  { art: "email", titel: "E-Mail", text: "Update Kaufpreisindikation besprochen.", zeit: "Heute, 09:15", von: "MK" },
  { art: "termin", titel: "Termin", text: "Objektbesichtigung Brautstraße 29.", zeit: "Heute, 08:30", von: "MK" },
  { art: "dokument", titel: "Dokument", text: "Investment Memo v1.0 erstellt.", zeit: "Gestern, 16:20", von: "MK" },
  { art: "telefon", titel: "Telefon", text: "Strategie & Vermarktung abgestimmt.", zeit: "08.10.2026, 14:30", von: "MK" },
];

export const hervorgehobeneProjekte = [
  { id: "inv-1", name: "Montesana", ort: "Bad Reichenhall (DE/CH)", naechsterSchritt: "Käuferansprache (C2)", fortschritt: 60, bild: "/testbilder/featured-montesana.jpg" },
  { id: "inv-2", name: "Berlin-Schöneberg (MFH)", ort: "Berlin", naechsterSchritt: "Rückmeldung Käufer (C3)", fortschritt: 70, bild: "/testbilder/featured-montesana.jpg" },
  { id: "proj-1", name: "Potsdam (Neubau)", ort: "Potsdam", naechsterSchritt: "Vergabe GU (C1)", fortschritt: 50, bild: "/testbilder/featured-montesana.jpg" },
];
