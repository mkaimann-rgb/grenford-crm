/**
 * ============================================================
 *  TESTDATEN – KEINE ECHTEN KUNDEN-, OBJEKT- ODER ZAHLUNGSDATEN
 * ============================================================
 * Fachmodule (Phasen B–F). Alle Datensätze verweisen auf die zentralen
 * Stammdaten aus testdata.ts (Unternehmen, Personen, Objekte) – keine Kopien.
 * Nummernkreise sind an den freigegebenen Finanz-Testdaten ausgerichtet
 * (INV-2026-…, PROP-2026-…, PRO-2026-… in Verbindlichkeiten/Forderungen).
 */
import { HEUTE, objekte as objekteBasis } from "./testdata.ts";
import { addDays } from "./logic.ts";
import type { Aktivitaet, Objekt } from "./types.ts";
import type {
  Akquise, Angebot, Ankaufsprofil, Dokument, Empfehlungspartner, GUPartner, Interessent, InvestmentProjekt, Kaeuferprozess,
  PropertyMandat, ProjectsMandat, ProjectsProjekt, Provision, Provisionsbeteiligung, Suchauftrag, Verlauf,
} from "./module.ts";

const d = (offset: number) => addDays(HEUTE, offset);
const MK = "u-mk";
const U = (id: string) => ({ art: "unternehmen" as const, id });
const P = (id: string) => ({ art: "person" as const, id });

// ---------- Objekte (Ergänzung der Stammdaten + neue Objekte) ----------

const OBJEKT_DETAILS: Record<string, Partial<Objekt>> = {
  "o-schoeneberg-mfh": { nummer: "OPP-2026-001", objektart: "Mehrfamilienhaus", adresse: "Off-Market (Adresse nach NDA)", einheiten: 20, wohnflaeche: 1535, grundstueck: 600, baujahr: 1928, zustand: "Vollvermietet" },
  "o-penthouse-charlottenburg": { nummer: "OPP-2026-003", objektart: "Eigentumswohnung", adresse: "Charlottenburg (Off-Market)", einheiten: 3, wohnflaeche: 196, zustand: "Neubau / Erstbezug" },
  "o-weichsel-20": { nummer: "OPP-2026-004", objektart: "Mehrfamilienhaus", adresse: "Weichselstraße 20, 12045 Berlin", einheiten: 8, wohnflaeche: 620, baujahr: 1905, zustand: "Sanierungsbedürftig" },
  "o-brautstrasse-29": { nummer: "OPP-2026-005", objektart: "Mehrfamilienhaus", adresse: "Brautstraße 29, Berlin", einheiten: 12, wohnflaeche: 890 },
  "o-hotel-erz": { nummer: "OPP-2026-007", objektart: "Hotel", adresse: "Erzgebirge", einheiten: 46, wohnflaeche: 3200 },
  "o-montesana": { nummer: "OPP-2026-008", objektart: "Mixed-Use", adresse: "Bad Reichenhall (D-CH-Grenze)", wohnflaeche: 5400 },
  "o-malplaquet-39": { nummer: "OPP-2026-009", objektart: "Mehrfamilienhaus", adresse: "Malplaquetstraße 39, 13347 Berlin", einheiten: 10 },
  "o-mf-neubau-potsdam": { nummer: "OPP-2026-010", objektart: "Mehrfamilienhaus (Neubau)", adresse: "Friedrich-Ebert-Str. 12, 14469 Potsdam", einheiten: 14 },
  "o-efh-zehlendorf-richter": { nummer: "OPP-2026-011", objektart: "Einfamilienhaus", adresse: "Zehlendorf, Berlin", wohnflaeche: 210, grundstueck: 780 },
  "o-etw-hamburg": { nummer: "OPP-2026-012", objektart: "Eigentumswohnung", adresse: "Hamburg-Eppendorf", wohnflaeche: 96 },
  "o-etw-charlottenburg": { nummer: "OPP-2026-013", objektart: "Eigentumswohnung", wohnflaeche: 84 },
  "o-dhh-potsdam": { nummer: "OPP-2026-014", objektart: "Doppelhaushälfte", wohnflaeche: 145 },
  "o-efh-zehlendorf-rossi": { nummer: "OPP-2026-015", objektart: "Einfamilienhaus", wohnflaeche: 190 },
};

const objekteNeu: Objekt[] = [
  { id: "o-soemmering-35", nummer: "OPP-2026-002", titel: "Sömmeringstraße 35", ort: "Berlin-Altbau", objektart: "Mehrfamilienhaus", adresse: "Sömmeringstraße 35, Berlin", einheiten: 9, wohnflaeche: 780, bild: "/testbilder/prop-1.jpg" },
  { id: "o-swantehof", nummer: "OPP-2026-016", titel: "Hotel Swantehof", ort: "Ostsee", objektart: "Hotel", einheiten: 38, bild: "/testbilder/proj-2.jpg" },
  { id: "o-wgh-berlin", nummer: "OPP-2026-017", titel: "Wohn- und Geschäftshaus", ort: "Berlin", objektart: "Zinshaus", einheiten: 24, wohnflaeche: 2100, bild: "/testbilder/prop-3.jpg" },
  { id: "o-wohnportfolio-nrw", nummer: "OPP-2025-021", titel: "Wohnportfolio NRW", ort: "NRW", objektart: "Wohnportfolio", einheiten: 86, bild: "/testbilder/inv-2.jpg" },
  { id: "o-wohnportfolio-sued", nummer: "OPP-2025-024", titel: "Wohnportfolio Süd", ort: "Süddeutschland", objektart: "Wohnportfolio", einheiten: 64 },
  { id: "o-gewerbe-hamburg", nummer: "OPP-2025-026", titel: "Gewerbeimmobilie Hamburg", ort: "Hamburg", objektart: "Büro / Gewerbe" },
  { id: "o-mfh-leipzig", nummer: "OPP-2025-027", titel: "Mehrfamilienhaus Leipzig", ort: "Leipzig", objektart: "Mehrfamilienhaus", einheiten: 18 },
  { id: "o-bestandsportfolio", nummer: "OPP-2025-029", titel: "Bestandsportfolio", ort: "Deutschland", objektart: "Wohnportfolio", einheiten: 140 },
  { id: "o-prenzlauer-berg", nummer: "OPP-2025-030", titel: "Altbauwohnung Prenzlauer Berg", ort: "Berlin", objektart: "Eigentumswohnung", wohnflaeche: 112 },
  { id: "o-wohnung-charlottenburg", nummer: "OPP-2025-031", titel: "Wohnung Charlottenburg", ort: "Berlin", objektart: "Eigentumswohnung", wohnflaeche: 128 },
  { id: "o-potsdamer-strasse", nummer: "OPP-2026-018", titel: "Potsdamer Straße", ort: "Berlin", objektart: "Büro / Gewerbe", wohnflaeche: 450 },
  { id: "o-wgh-prenzlauer", nummer: "OPP-2026-019", titel: "Wohn- und Geschäftshaus Prenzlauer Berg", ort: "Berlin", objektart: "Wohn- und Geschäftshaus", einheiten: 16 },
  { id: "o-dachgeschoss-kreuzberg", nummer: "OPP-2026-020", titel: "Dachgeschoss Kreuzberg", ort: "Berlin", objektart: "Dachgeschoss" },
  { id: "o-pflege-sued", nummer: "OPP-2026-021", titel: "Pflegeimmobilie", ort: "Süddeutschland", objektart: "Healthcare" },
];

export const objekte: Objekt[] = [...objekteBasis.map((o) => ({ ...o, ...OBJEKT_DETAILS[o.id] })), ...objekteNeu];

// ---------- Akquise-Pipeline ----------

const ak = (x: Partial<Akquise> & Pick<Akquise, "id" | "titel" | "bereich" | "stufe" | "status">): Akquise => ({
  erstelltAm: d(-40), verantwortlichId: MK, quelle: "Netzwerk", objektart: "", tags: [], prioritaet: "Normal", wahrscheinlichkeit: 30, volumen: 0, ort: "Berlin",
  naechsterSchritt: "", erwarteterAbschluss: "", courtageNetto: 0, eigenerAnteil: 100, kooperationsart: "Alleinmandat", vereinbarung: "", checkliste: [], bewertung: "", ...x,
});

export const akquise: Akquise[] = [
  ak({
    id: "AK-2026-001", titel: "MFH Berlin-Schöneberg", bereich: "Investment", stufe: 6, status: "Übernommen", quelle: "Maklerkooperation", objektart: "Mehrfamilienhaus", tags: ["Off-Market"],
    prioritaet: "Hoch", wahrscheinlichkeit: 70, volumen: 3_100_000, kunde: U("f-schoeneberg"), ansprechpartnerId: "p-berger", objektId: "o-schoeneberg-mfh", ort: "Berlin, Schöneberg",
    vermittler: { ...P("p-brandes"), rolle: "Makler / Vermittler" }, erstelltAm: "2026-06-23", naechsterSchritt: "Übernommen in INV-2026-007", erwarteterAbschluss: "Q4/2026",
    courtageNetto: 186_000, eigenerAnteil: 40, kooperationsart: "Gemeinschaftsgeschäft", vereinbarung: "Mündlich (NDA 23.06.2026)", bewertung: "Sehr attraktiv",
    checkliste: [{ text: "Grundrisse erhalten", erledigt: true, datum: "2026-08-24" }, { text: "Mieterliste prüfen", erledigt: true, datum: "2026-08-28" }, { text: "Wirtschaftlichkeitsberechnung", erledigt: true, datum: "2026-08-29" }],
    uebernahme: { id: "INV-2026-007", datum: "2026-09-01" },
  }),
  ak({
    id: "AK-2026-002", titel: "Hotel Swantehof", bereich: "Investment", stufe: 6, status: "Übernommen", quelle: "Empfehlung", objektart: "Hotel", volumen: 4_800_000, kunde: U("f-erz"),
    objektId: "o-swantehof", ort: "Ostsee", wahrscheinlichkeit: 50, erstelltAm: "2026-07-14", courtageNetto: 240_000, uebernahme: { id: "INV-2026-009", datum: "2026-08-20" }, naechsterSchritt: "Übernommen in INV-2026-009",
  }),
  ak({
    id: "AK-2026-003", titel: "Wohn- und Geschäftshaus Prenzlauer Berg", bereich: "Investment", stufe: 3, status: "Aktiv", quelle: "Maklerkooperation", objektart: "Wohn- und Geschäftshaus",
    tags: ["Off-Market"], prioritaet: "Hoch", wahrscheinlichkeit: 70, volumen: 3_400_000, kunde: U("f-maspohl"), ansprechpartnerId: "p-maspohl", eigentuemerHinweis: "N.N. (über Makler)",
    vermittler: { ...P("p-brandes"), rolle: "Makler / Vermittler" }, objektId: "o-wgh-prenzlauer", ort: "Berlin, Prenzlauer Berg", wiedervorlage: d(18), erstelltAm: "2026-09-02",
    naechsterSchritt: "Objektunterlagen vollständig prüfen", erwarteterAbschluss: "Q1/2027", courtageNetto: 204_000, eigenerAnteil: 40, kooperationsart: "Gemeinschaftsgeschäft",
    vereinbarung: "Mündlich (NDA 02.09.2026)", bewertung: "Sehr attraktiv",
    checkliste: [{ text: "Grundrisse erhalten", erledigt: true, datum: d(-16) }, { text: "Mieterliste prüfen", erledigt: false, datum: d(-12) }, { text: "Wirtschaftlichkeitsberechnung", erledigt: false, datum: d(5) }, { text: "Rechtliche Unterlagen (Grundbuch, Teilungserklärung)", erledigt: false }, { text: "Investment Memo erstellen", erledigt: false }],
  }),
  ak({
    id: "AK-2026-004", titel: "Sömmeringstraße 35", bereich: "Property", stufe: 6, status: "Übernommen", quelle: "Bestandskunde", objektart: "Mehrfamilienhaus", volumen: 2_400_000,
    kunde: U("f-bauwert"), ansprechpartnerId: "p-jrichter", objektId: "o-soemmering-35", erstelltAm: "2026-06-02", courtageNetto: 85_680, wahrscheinlichkeit: 80, uebernahme: { id: "PROP-2026-005", datum: "2026-07-01" }, naechsterSchritt: "Übernommen in PROP-2026-005",
  }),
  ak({
    id: "AK-2026-005", titel: "Potsdamer Straße – Vermietung", bereich: "Property", stufe: 1, status: "Aktiv", quelle: "Website", objektart: "Büro / Gewerbe", volumen: 450_000,
    kunde: U("f-alpen"), ansprechpartnerId: "p-albrecht", objektId: "o-potsdamer-strasse", wiedervorlage: d(4), naechsterSchritt: "Objektdaten anfordern", erwarteterAbschluss: "Q1/2027", wahrscheinlichkeit: 30, erstelltAm: d(-9),
  }),
  ak({
    id: "AK-2026-006", titel: "Badsanierung WE 01 Weichselstraße 20", bereich: "Projects", stufe: 6, status: "Übernommen", quelle: "Empfehlung", objektart: "Eigentumswohnung", volumen: 80_000,
    kunde: P("p-mkaimann"), objektId: "o-weichsel-20", erstelltAm: "2026-08-12", wahrscheinlichkeit: 80, uebernahme: { id: "MAN-2026-001", datum: "2026-08-18" }, naechsterSchritt: "Übernommen in MAN-2026-001",
  }),
  ak({
    id: "AK-2026-007", titel: "Dachgeschossausbau Kreuzberg", bereich: "Projects", stufe: 2, status: "Aktiv", quelle: "Bestandskunde", objektart: "Dachgeschoss", volumen: 240_000,
    kunde: P("p-sommer"), objektId: "o-dachgeschoss-kreuzberg", prioritaet: "Normal", wahrscheinlichkeit: 50, wiedervorlage: d(2), naechsterSchritt: "Vor-Ort-Termin vereinbaren", erwarteterAbschluss: "Q2/2027", erstelltAm: d(-20),
    checkliste: [{ text: "Bedarf aufnehmen", erledigt: true }, { text: "Statik klären", erledigt: false }],
  }),
  ak({
    id: "AK-2026-008", titel: "Pflegeimmobilie Süddeutschland", bereich: "Investment", stufe: 0, status: "Aktiv", quelle: "Kaltakquise", objektart: "Healthcare", volumen: 9_500_000,
    kunde: U("f-lehmann"), ansprechpartnerId: "p-alehmann", objektId: "o-pflege-sued", ort: "Süddeutschland", prioritaet: "Niedrig", wahrscheinlichkeit: 10, wiedervorlage: d(14), naechsterSchritt: "Erstkontakt Eigentümer", erstelltAm: d(-3),
  }),
  ak({ id: "AK-2026-009", titel: "Gewerbeobjekt Mitte", bereich: "Property", stufe: 2, status: "Verloren", quelle: "Netzwerk", objektart: "Büro / Gewerbe", volumen: 2_200_000, kunde: U("f-nordstadt"), naechsterSchritt: "Mandat an Wettbewerber vergeben", erstelltAm: "2026-05-11", wahrscheinlichkeit: 0 }),
];

// ---------- Investment ----------

const ip = (x: Partial<InvestmentProjekt> & Pick<InvestmentProjekt, "id" | "titel" | "objektId" | "assetklasse" | "standort" | "volumen" | "phase" | "status">): InvestmentProjekt => ({
  erstelltAm: d(-60), verantwortlichId: MK, zielpreis: "", naechsterSchritt: "", vermarktungsart: "Off-Market", courtageSatz: 6, tags: [], beteiligte: [], abschlussErwartet: "", ...x,
});

export const investmentProjekte: InvestmentProjekt[] = [
  ip({ id: "INV-2026-001", titel: "Wohnportfolio NRW", objektId: "o-wohnportfolio-nrw", assetklasse: "Wohnportfolio", standort: "NRW", volumen: 7_500_000, phase: "F3", status: "Abgeschlossen", erstelltAm: "2026-01-12", abschlussErwartet: "Q3/2026", naechsterSchritt: "Reporting an Käufer", beteiligte: [{ ...U("f-maspohl"), rolle: "Käufer (Investor)" }, { ...U("f-simple"), rolle: "Provisionsbeteiligter" }, { ...P("p-brandes"), rolle: "Empfehlungspartner" }, { ...P("p-brinkmann"), rolle: "Empfehlungspartner" }] }),
  ip({ id: "INV-2026-002", titel: "Wohnportfolio Süd", objektId: "o-wohnportfolio-sued", assetklasse: "Wohnportfolio", standort: "Süddeutschland", volumen: 5_300_000, phase: "F3", status: "Abgeschlossen", erstelltAm: "2026-01-20", beteiligte: [{ ...U("f-huber"), rolle: "Käufer (Investor)" }, { ...P("p-brinkmann"), rolle: "Empfehlungspartner" }] }),
  ip({ id: "INV-2026-003", titel: "Gewerbeimmobilie Hamburg", objektId: "o-gewerbe-hamburg", assetklasse: "Büro", standort: "Hamburg", volumen: 4_200_000, phase: "F3", status: "Abgeschlossen", erstelltAm: "2026-02-03", beteiligte: [{ ...U("f-financoncept"), rolle: "Provisionsbeteiligter" }] }),
  ip({ id: "INV-2026-004", titel: "Mehrfamilienhaus Leipzig", objektId: "o-mfh-leipzig", assetklasse: "Mehrfamilienhaus", standort: "Leipzig", volumen: 2_600_000, phase: "F3", status: "Abgeschlossen", erstelltAm: "2026-02-15", beteiligte: [{ ...U("f-simple"), rolle: "Provisionsbeteiligter" }] }),
  ip({ id: "INV-2026-005", titel: "Bestandsportfolio", objektId: "o-bestandsportfolio", assetklasse: "Wohnportfolio", standort: "Deutschland", volumen: 25_000_000, courtageSatz: 0.84, phase: "F2", status: "Abgeschlossen", erstelltAm: "2026-03-01", beteiligte: [{ ...U("f-financoncept"), rolle: "Provisionsbeteiligter" }] }),
  ip({
    id: "INV-2026-006", titel: "Montesana Asset", objektId: "o-montesana", assetklasse: "Mixed-Use", standort: "D-CH Grenze", volumen: 7_000_000, phase: "D1", status: "Aktiv", eigentuemer: U("f-montesana"),
    naechsterSchritt: "Rückmeldung Investor", wiedervorlage: d(-5), erstelltAm: "2026-04-10", abschlussErwartet: "Q1/2027", faktor: 21.5, rendite: 4.6, tags: ["Hospitality", "Living"],
    beteiligte: [{ ...U("f-montesana"), rolle: "Verkäufer / Bestandshalter" }, { ...P("p-berger"), rolle: "Ansprechpartner Verkäufer" }],
  }),
  ip({
    id: "INV-2026-007", titel: "MFH Berlin-Schöneberg", objektId: "o-schoeneberg-mfh", assetklasse: "Mehrfamilienhaus", standort: "Berlin-Schöneberg", volumen: 3_000_000, zielpreis: "3,1 Mio. € (evtl. 2,9 Mio. €)",
    phase: "C2", status: "Aktiv", eigentuemer: U("f-schoeneberg"), naechsterSchritt: "Objektunterlagen prüfen", wiedervorlage: d(-43), erstelltAm: "2026-09-01", akquiseId: "AK-2026-001",
    faktor: 23, rendite: 8.5, upside: "> 100 %", tags: ["Core Plus", "Vollvermietet", "> 100 % Upside"], abschlussErwartet: "Q4/2026",
    beteiligte: [{ ...U("f-schoeneberg"), rolle: "Verkäufer / Projektentwickler" }, { ...P("p-berger"), rolle: "Ansprechpartner Verkäufer" }, { ...P("p-brandes"), rolle: "Co-Partner" }, { ...P("p-spannaus"), rolle: "Ansprechpartner (Käuferseite)" }],
  }),
  ip({ id: "INV-2026-008", titel: "Hotel das ERZ", objektId: "o-hotel-erz", assetklasse: "Hotel", standort: "Erzgebirge", volumen: 5_500_000, phase: "A1", status: "Aktiv", eigentuemer: U("f-erz"), naechsterSchritt: "Teaser versenden", wiedervorlage: d(2), erstelltAm: "2026-08-02", beteiligte: [{ ...U("f-erz"), rolle: "Verkäufer / Bestandshalter" }, { ...P("p-fidanzeskina"), rolle: "Ansprechpartner Verkäufer" }] }),
  ip({ id: "INV-2026-009", titel: "Hotel Swantehof", objektId: "o-swantehof", assetklasse: "Hotel", standort: "Ostsee", volumen: 4_800_000, phase: "A3", status: "Aktiv", naechsterSchritt: "NDA finalisieren", wiedervorlage: d(5), erstelltAm: "2026-08-20", akquiseId: "AK-2026-002", beteiligte: [] }),
  ip({ id: "INV-2026-010", titel: "Wohn- und Geschäftshaus", objektId: "o-wgh-berlin", assetklasse: "Zinshaus", standort: "Berlin", volumen: 8_900_000, phase: "C4", status: "In Prüfung", eigentuemer: U("f-alpen"), naechsterSchritt: "Kaufpreisindikation", wiedervorlage: d(12), erstelltAm: "2026-06-30", beteiligte: [{ ...U("f-alpen"), rolle: "Verkäufer / Bestandshalter" }] }),
];

const kp = (x: Partial<Kaeuferprozess> & Pick<Kaeuferprozess, "id" | "bereich" | "projektId" | "kaeufer" | "typ" | "indikation" | "wahrscheinlichkeit" | "phase">): Kaeuferprozess => ({
  erstelltAm: d(-30), verantwortlichId: MK, status: "Aktiv", letzterKontakt: d(-10), ...x,
});

export const kaeuferprozesse: Kaeuferprozess[] = [
  kp({ id: "INV-OPT-0001", bereich: "Investment", projektId: "INV-2026-001", kaeufer: U("f-maspohl"), ansprechpartnerId: "p-maspohl", typ: "Institutionell", indikation: 7_500_000, wahrscheinlichkeit: 100, phase: "F1", status: "Gekauft", letzterKontakt: "2026-09-22", erstelltAm: "2026-03-02" }),
  kp({ id: "INV-OPT-0002", bereich: "Investment", projektId: "INV-2026-002", kaeufer: U("f-huber"), ansprechpartnerId: "p-huber", typ: "Family Office", indikation: 5_300_000, wahrscheinlichkeit: 100, phase: "F1", status: "Gekauft", letzterKontakt: "2026-09-05" }),
  kp({ id: "INV-OPT-0006", bereich: "Investment", projektId: "INV-2026-006", kaeufer: U("f-gravitation"), ansprechpartnerId: "p-brinkmann", typ: "Institutionell", indikation: 6_800_000, wahrscheinlichkeit: 50, phase: "D1", letzterKontakt: d(-3) }),
  kp({ id: "INV-OPT-0007", bereich: "Investment", projektId: "INV-2026-006", kaeufer: U("f-weber"), ansprechpartnerId: "p-weber", typ: "Family Office", indikation: 6_500_000, wahrscheinlichkeit: 20, phase: "C3", letzterKontakt: d(-12) }),
  kp({ id: "INV-OPT-0008", bereich: "Investment", projektId: "INV-2026-007", kaeufer: U("f-maspohl"), ansprechpartnerId: "p-maspohl", typ: "Institutionell", indikation: 2_900_000, wahrscheinlichkeit: 80, phase: "D1", letzterKontakt: "2026-09-08", suchauftragId: "SRCH-I-008" }),
  kp({ id: "INV-OPT-0009", bereich: "Investment", projektId: "INV-2026-007", kaeufer: U("f-huber"), ansprechpartnerId: "p-huber", typ: "Family Office (NDA)", indikation: 3_000_000, wahrscheinlichkeit: 40, phase: "A2", letzterKontakt: d(-20) }),
  kp({ id: "INV-OPT-0010", bereich: "Investment", projektId: "INV-2026-007", kaeufer: U("f-mueller"), ansprechpartnerId: "p-tmueller", typ: "Privater Investor", indikation: 3_100_000, wahrscheinlichkeit: 30, phase: "C3", letzterKontakt: d(-15) }),
  kp({ id: "INV-OPT-0011", bereich: "Investment", projektId: "INV-2026-010", kaeufer: U("f-bauwert"), ansprechpartnerId: "p-jrichter", typ: "Institutionell", indikation: 8_400_000, wahrscheinlichkeit: 35, phase: "C4", letzterKontakt: d(-6) }),
  // Property
  kp({ id: "PROP-OPT-0011", bereich: "Property", projektId: "PROP-2026-006", kaeufer: P("p-legrand"), typ: "Eigennutzer", indikation: 1_600_000, wahrscheinlichkeit: 40, phase: "B2", letzterKontakt: "2026-08-30" }),
  kp({ id: "PROP-OPT-0012", bereich: "Property", projektId: "PROP-2026-006", kaeufer: P("p-thweber"), typ: "Eigennutzer", indikation: 1_750_000, wahrscheinlichkeit: 90, phase: "C2", letzterKontakt: d(0) }),
  kp({ id: "PROP-OPT-0013", bereich: "Property", projektId: "PROP-2026-006", kaeufer: P("p-lhoffmann"), typ: "Eigennutzer", indikation: 1_620_000, wahrscheinlichkeit: 60, phase: "B3", letzterKontakt: d(-6) }),
  kp({ id: "PROP-OPT-0014", bereich: "Property", projektId: "PROP-2026-006", kaeufer: U("f-huber"), ansprechpartnerId: "p-huber", typ: "Institutionell (NDA)", indikation: 1_810_000, wahrscheinlichkeit: 30, phase: "A1", letzterKontakt: d(-18) }),
  kp({ id: "PROP-OPT-0015", bereich: "Property", projektId: "PROP-2026-005", kaeufer: U("f-maspohl"), ansprechpartnerId: "p-maspohl", typ: "Institutionell", indikation: 2_350_000, wahrscheinlichkeit: 50, phase: "B2", letzterKontakt: d(-4) }),
  kp({ id: "PROP-OPT-0016", bereich: "Property", projektId: "PROP-2026-009", kaeufer: P("p-weber"), typ: "Eigennutzer", indikation: 1_420_000, wahrscheinlichkeit: 45, phase: "B2", letzterKontakt: d(-8) }),
];

const prof = (x: Partial<Ankaufsprofil> & Pick<Ankaufsprofil, "id" | "investorentyp" | "assetklassen" | "regionen" | "volumenVon" | "volumenBis" | "kriterien" | "status">): Ankaufsprofil => ({ erstelltAm: d(-50), verantwortlichId: MK, ...x });

export const ankaufsprofile: Ankaufsprofil[] = [
  prof({ id: "ANK-2026-001", unternehmenId: "f-maspohl", personId: "p-maspohl", investorentyp: "Institutionell", assetklassen: ["MFH", "Wohnen"], regionen: ["Berlin", "Hamburg", "München"], volumenVon: 10, volumenBis: 50, renditeMin: 4, kriterien: "Bestand, mind. 20 Einheiten, Core+, ESG-konform, gute ÖPNV-Anbindung, langfristiger Bestand.", status: "Aktiv", erstelltAm: "2026-05-20" }),
  prof({ id: "ANK-2026-002", unternehmenId: "f-simple", personId: "p-spannaus", investorentyp: "Family Office", assetklassen: ["Wohnen", "Gewerbe"], regionen: ["DACH"], volumenVon: 5, volumenBis: 25, kriterien: "Bestand, Wertsteigerung, Urban Lagen", status: "Aktiv" }),
  prof({ id: "ANK-2026-003", unternehmenId: "f-montesana", personId: "p-berger", investorentyp: "Institutionell", assetklassen: ["Wohnen"], regionen: ["Berlin", "NRW"], volumenVon: 20, volumenBis: 100, kriterien: "Neubau & Bestand, Mietwachstum, ESG", status: "In Verhandlung" }),
  prof({ id: "ANK-2026-004", unternehmenId: "f-brandes", personId: "p-brandes", investorentyp: "Family Office", assetklassen: ["Wohnen"], regionen: ["Berlin"], volumenVon: 5, volumenBis: 15, kriterien: "Bestand, Top Lagen, vermietet", status: "Aktiv" }),
  prof({ id: "ANK-2026-005", unternehmenId: "f-sander", personId: "p-sander", investorentyp: "Projektentwickler", assetklassen: ["Wohnen", "Gewerbe"], regionen: ["NRW"], volumenVon: 15, volumenBis: 75, kriterien: "Grundstücke, Projektentwicklung, B-Plan", status: "Aktiv" }),
  prof({ id: "ANK-2026-006", unternehmenId: "f-gravitation", personId: "p-brinkmann", investorentyp: "Institutionell", assetklassen: ["Logistik", "Light Industrial"], regionen: ["D", "Benelux"], volumenVon: 30, volumenBis: 150, kriterien: "Core/Core+, langfristige Mietverträge", status: "Aktiv" }),
  prof({ id: "ANK-2026-007", unternehmenId: "f-erz", personId: "p-fidanzeskina", investorentyp: "Family Office", assetklassen: ["Hotel"], regionen: ["DACH", "Südeuropa"], volumenVon: 10, volumenBis: 40, kriterien: "Betreiberobjekte, Value-Add, Revitalisierung", status: "In Prüfung" }),
  prof({ id: "ANK-2026-008", unternehmenId: "f-noodles", personId: "p-reitemeyer", investorentyp: "Family Office", assetklassen: ["Co-Living", "Micro-Living"], regionen: ["D", "NL"], volumenVon: 10, volumenBis: 50, kriterien: "Betreiberkonzepte, ESG, Mietvertragsstruktur", status: "Aktiv" }),
  prof({ id: "ANK-2026-009", unternehmenId: "f-kuechenaktiv", personId: "p-proetel", investorentyp: "Projektentwickler", assetklassen: ["Wohnen", "Gewerbe"], regionen: ["Berlin", "Leipzig"], volumenVon: 10, volumenBis: 60, kriterien: "Grundstücke, Projektentwicklung", status: "Aktiv" }),
  prof({ id: "ANK-2026-010", unternehmenId: "f-mfbau", personId: "p-kuehn", investorentyp: "Projektentwickler", assetklassen: ["Wohnen"], regionen: ["Berlin", "Umland"], volumenVon: 5, volumenBis: 30, kriterien: "Grundstücke, B-Plan, Joint Venture", status: "Platziert" }),
  prof({ id: "ANK-2026-011", unternehmenId: "f-weber", personId: "p-weber", investorentyp: "Family Office", assetklassen: ["Wohnen", "Hotel"], regionen: ["DACH"], volumenVon: 15, volumenBis: 70, kriterien: "Bestand, Revitalisierung, Denkmalschutz", status: "Aktiv" }),
  prof({ id: "ANK-2026-012", personId: "p-legrand", investorentyp: "Privatkunde", assetklassen: ["Wohnen"], regionen: ["Berlin"], volumenVon: 1, volumenBis: 5, kriterien: "Eigennutzung, hochwertige Lagen", status: "Aktiv" }),
];

const sa = (x: Partial<Suchauftrag> & Pick<Suchauftrag, "id" | "bereich" | "kunde" | "typ" | "objektart" | "regionen" | "volumenVon" | "volumenBis" | "kriterien" | "status" | "zielzeitraum">): Suchauftrag => ({
  erstelltAm: d(-45), verantwortlichId: MK, prioritaet: "Normal", verknuepft: [], ...x,
});

export const suchauftraege: Suchauftrag[] = [
  sa({ id: "SRCH-I-008", bereich: "Investment", kunde: U("f-maspohl"), ansprechpartnerId: "p-maspohl", typ: "Institutionell", objektart: "MFH, Wohnen", regionen: ["Berlin", "Hamburg", "München"], volumenVon: 10, volumenBis: 50, kriterien: "Bestand, mind. 20 Einheiten, Core+, ESG-konform", status: "Aktiv", zielzeitraum: "Q4/2026", prioritaet: "Hoch", verknuepft: ["INV-2026-007"] }),
  sa({ id: "SRCH-I-007", bereich: "Investment", kunde: U("f-simple"), ansprechpartnerId: "p-spannaus", typ: "Family Office", objektart: "Wohnen, Gewerbe", regionen: ["DACH"], volumenVon: 5, volumenBis: 25, kriterien: "Bestand, Wertsteigerung, Urban Lagen", status: "In Prüfung", zielzeitraum: "Q1/2027" }),
  sa({ id: "SRCH-I-006", bereich: "Investment", kunde: U("f-montesana"), ansprechpartnerId: "p-berger", typ: "Institutionell", objektart: "Wohnen", regionen: ["Berlin", "NRW"], volumenVon: 20, volumenBis: 100, kriterien: "Neubau & Bestand, Mietwachstum, ESG", status: "Aktiv", zielzeitraum: "Q2/2027" }),
  sa({ id: "SRCH-I-004", bereich: "Investment", kunde: U("f-sander"), ansprechpartnerId: "p-sander", typ: "Projektentwickler", objektart: "Wohnen, Gewerbe", regionen: ["NRW"], volumenVon: 15, volumenBis: 75, kriterien: "Grundstücke, Projektentwicklung, B-Plan", status: "In Verhandlung", zielzeitraum: "Q1/2027" }),
  sa({ id: "SRCH-I-003", bereich: "Investment", kunde: U("f-gravitation"), ansprechpartnerId: "p-brinkmann", typ: "Institutionell", objektart: "Logistik, Light Industrial", regionen: ["D", "Benelux"], volumenVon: 30, volumenBis: 150, kriterien: "Core/Core+, langfristige Mietverträge", status: "Aktiv", zielzeitraum: "Q2/2027", verknuepft: ["INV-2026-006"] }),
  sa({ id: "SRCH-I-002", bereich: "Investment", kunde: U("f-erz"), ansprechpartnerId: "p-fidanzeskina", typ: "Family Office", objektart: "Hotel", regionen: ["DACH", "Südeuropa"], volumenVon: 10, volumenBis: 40, kriterien: "Betreiberobjekte, Value-Add, Revitalisierung", status: "Aktiv", zielzeitraum: "Q3/2027" }),
  sa({ id: "SRCH-I-001", bereich: "Investment", kunde: U("f-noodles"), ansprechpartnerId: "p-reitemeyer", typ: "Family Office", objektart: "Co-Living, Micro-Living", regionen: ["D", "NL"], volumenVon: 10, volumenBis: 50, kriterien: "Betreiberkonzepte, ESG, Mietvertragsstruktur", status: "Abgeschlossen", zielzeitraum: "Q1/2026" }),
  sa({ id: "SRCH-I-012", bereich: "Investment", kunde: U("f-weber"), ansprechpartnerId: "p-weber", typ: "Family Office", objektart: "Wohnen, Hotel", regionen: ["DACH"], volumenVon: 15, volumenBis: 70, kriterien: "Bestand, Revitalisierung, Denkmalschutz", status: "Aktiv", zielzeitraum: "Q2/2027", verknuepft: ["INV-2026-006"] }),
  // Property
  sa({ id: "SRCH-P-006", bereich: "Property", kunde: P("p-lhoffmann"), typ: "Privatkunde", objektart: "Eigentumswohnung", regionen: ["Berlin", "Potsdam"], volumenVon: 0.5, volumenBis: 2, kriterien: "3–5 Zimmer, Balkon/Terrasse, ab 80 m²", status: "Aktiv", zielzeitraum: "Q2/2027", mandatstyp: "Kauf", verknuepft: ["PROP-2026-006"] }),
  sa({ id: "SRCH-P-008", bereich: "Property", kunde: U("f-maspohl"), ansprechpartnerId: "p-maspohl", typ: "Institutionell", objektart: "Mehrfamilienhaus", regionen: ["Berlin"], volumenVon: 10, volumenBis: 50, kriterien: "Bestand, mind. 20 Einheiten, gute Lage, Value-Add", status: "Aktiv", zielzeitraum: "Q4/2026", mandatstyp: "Kauf", verknuepft: ["PROP-2026-005"] }),
  sa({ id: "SRCH-P-005", bereich: "Property", kunde: U("f-brandes"), ansprechpartnerId: "p-brandes", typ: "Family Office", objektart: "Wohnung", regionen: ["Berlin"], volumenVon: 5, volumenBis: 15, kriterien: "Bestand, Top Lagen, vermietet", status: "In Verhandlung", zielzeitraum: "Q4/2026", mandatstyp: "Kauf" }),
  sa({ id: "SRCH-P-013", bereich: "Property", kunde: P("p-ghazzawi"), typ: "Privatkunde", objektart: "Mehrfamilienhaus", regionen: ["Berlin", "Potsdam"], volumenVon: 1, volumenBis: 8, kriterien: "Neubau, hochwertige Ausstattung", status: "Aktiv", zielzeitraum: "Q4/2026", mandatstyp: "Kauf" }),
  sa({ id: "SRCH-P-014", bereich: "Property", kunde: P("p-keil"), typ: "Privatkunde", objektart: "Wohnung", regionen: ["Berlin"], volumenVon: 0.5, volumenBis: 3, kriterien: "Eigennutzung, moderne Ausstattung", status: "In Prüfung", zielzeitraum: "Q4/2026", mandatstyp: "Kauf" }),
  sa({ id: "SRCH-P-015", bereich: "Property", kunde: P("p-legrand"), typ: "Privatkunde", objektart: "Wohnung", regionen: ["Berlin"], volumenVon: 0.5, volumenBis: 3, kriterien: "Penthouse, Terrasse", status: "Aktiv", zielzeitraum: "Q2/2026", mandatstyp: "Kauf", verknuepft: ["PROP-2026-006"] }),
  sa({ id: "SRCH-P-016", bereich: "Property", kunde: P("p-sommer"), typ: "Privatkunde", objektart: "Eigentumswohnung", regionen: ["Berlin"], volumenVon: 0.8, volumenBis: 1.2, kriterien: "Off-Market, Altbau", status: "Aktiv", zielzeitraum: "Q1/2027", mandatstyp: "Kauf", prioritaet: "Hoch" }),
];

// ---------- Property ----------

const pm = (x: Partial<PropertyMandat> & Pick<PropertyMandat, "id" | "objektId" | "mandatstyp" | "preis" | "status" | "vermarktung" | "phase">): PropertyMandat => ({
  erstelltAm: d(-70), verantwortlichId: MK, courtageSatz: 3.57, courtageModell: "Käufercourtage", naechsterSchritt: "", vertragVon: "2026-03-01", vertragBis: "2027-02-28",
  vermarktungsart: "Off-Market", tags: [], beteiligte: [], ...x,
});

export const propertyMandate: PropertyMandat[] = [
  pm({ id: "PROP-2026-002", objektId: "o-prenzlauer-berg", mandatstyp: "Verkauf", eigentuemer: P("p-srichter"), preis: 980_000, status: "Abgeschlossen", vermarktung: "Verkauft", phase: "E3", erstelltAm: "2026-01-08", vertragVon: "2026-01-08", vertragBis: "2026-06-30", beteiligte: [{ ...P("p-brinkmann"), rolle: "Empfehlungspartner" }] }),
  pm({ id: "PROP-2026-003", objektId: "o-wohnung-charlottenburg", mandatstyp: "Verkauf", eigentuemer: P("p-sommer"), preis: 760_000, status: "Abgeschlossen", vermarktung: "Verkauft", phase: "E3", erstelltAm: "2026-02-02", vertragVon: "2026-02-02", vertragBis: "2026-07-31", beteiligte: [{ ...P("p-brandes"), rolle: "Empfehlungspartner" }] }),
  pm({ id: "PROP-2026-005", objektId: "o-soemmering-35", mandatstyp: "Verkauf", eigentuemer: U("f-bauwert"), preis: 2_400_000, status: "Aktiv", vermarktung: "Exposé", phase: "B2", naechsterSchritt: "Exposé finalisieren", wiedervorlage: d(0), erstelltAm: "2026-07-01", vermarktungsart: "Bieterverfahren", beteiligte: [{ ...U("f-bauwert"), rolle: "Eigentümer" }, { ...P("p-jrichter"), rolle: "Ansprechpartner Eigentümer" }] }),
  pm({
    id: "PROP-2026-006", objektId: "o-penthouse-charlottenburg", mandatstyp: "Verkauf", eigentuemer: U("f-rheinmain"), preis: 1_750_000, status: "In Verhandlung", vermarktung: "Verhandlung", phase: "C2",
    naechsterSchritt: "Notartermin koordinieren", wiedervorlage: d(-2), erstelltAm: "2026-06-10", tags: ["Exclusive", "Neubau", "Penthouse"], courtageModell: "Käufercourtage",
    beteiligte: [{ ...U("f-rheinmain"), rolle: "Eigentümer / Bauträger" }, { ...P("p-krause"), rolle: "Ansprechpartner Eigentümer" }, { ...P("p-brandes"), rolle: "Co-Partner" }],
  }),
  pm({ id: "PROP-2026-007", objektId: "o-weichsel-20", mandatstyp: "Verkauf", eigentuemer: P("p-keil"), preis: 420_000, status: "Aktiv", vermarktung: "Vermarktung", phase: "A3", naechsterSchritt: "Makleralleinauftrag unterzeichnen", wiedervorlage: d(-5), erstelltAm: "2026-08-25", beteiligte: [{ ...P("p-keil"), rolle: "Eigentümer (WE 03)" }] }),
  pm({ id: "PROP-2026-008", objektId: "o-brautstrasse-29", mandatstyp: "Verkauf", preis: 1_200_000, status: "In Vorbereitung", vermarktung: "Vorbereitung", phase: "A1", naechsterSchritt: "Bewertung finalisieren", wiedervorlage: d(-8), erstelltAm: "2026-09-12", beteiligte: [{ ...P("p-brandes"), rolle: "Makler (Kooperation) – Rolle prüfen" }] }),
  pm({ id: "PROP-2026-009", objektId: "o-efh-zehlendorf-richter", mandatstyp: "Verkauf", eigentuemer: P("p-srichter"), preis: 1_500_000, status: "Aktiv", vermarktung: "Vermarktung", phase: "B2", naechsterSchritt: "Besichtigungen koordinieren", wiedervorlage: d(3), erstelltAm: "2026-08-01", beteiligte: [{ ...P("p-srichter"), rolle: "Eigentümerin" }] }),
  pm({ id: "PROP-2026-010", objektId: "o-etw-hamburg", mandatstyp: "Verkauf", eigentuemer: P("p-fischer"), preis: 800_000, status: "Aktiv", vermarktung: "Exposé", phase: "A3", naechsterSchritt: "Exposé erstellen", wiedervorlage: d(6), erstelltAm: "2026-06-01", beteiligte: [{ ...P("p-fischer"), rolle: "Eigentümer" }] }),
  pm({ id: "PROP-2026-011", objektId: "o-potsdamer-strasse", mandatstyp: "Vermietung", eigentuemer: U("f-alpen"), preis: 400_000, courtageSatz: 2, courtageModell: "Vermietercourtage (2 Monatsmieten ≙ %)", status: "In Prüfung", vermarktung: "Vorbereitung", phase: "A1", naechsterSchritt: "Mietflächenaufstellung prüfen", wiedervorlage: d(9), erstelltAm: d(-15) }),
];

const intr = (x: Partial<Interessent> & Pick<Interessent, "id" | "ref" | "typ" | "objektarten" | "regionen" | "budgetVon" | "budgetBis" | "kriterien" | "status">): Interessent => ({ erstelltAm: d(-40), verantwortlichId: MK, weitere: [], ...x });

export const interessenten: Interessent[] = [
  intr({ id: "INT-2026-001", ref: U("f-maspohl"), ansprechpartnerId: "p-maspohl", typ: "Institutionell", objektarten: ["Mehrfamilienhaus"], regionen: ["Berlin", "Hamburg", "München"], budgetVon: 10, budgetBis: 50, kriterien: "Bestand, mind. 10 Einheiten, gute Lage, Value-Add, sanierungsbedürftig möglich, ESG-konform.", status: "Aktiv",
    weitere: [["Bevorzugte Lagen", "A-Lagen, aufstrebende Lagen"], ["Assetklassen (weitere)", "Wohnen, Gewerbe (Wohnen-Mixed)"], ["Strategie", "Buy & Hold, Value-Add"], ["ESG", "Ja"], ["Eigenkapitalquote", "mind. 30 %"], ["Kaufzeitraum", "fortlaufend"]] }),
  intr({ id: "INT-2026-002", ref: U("f-simple"), ansprechpartnerId: "p-spannaus", typ: "Family Office", objektarten: ["Wohnung", "MFH"], regionen: ["Berlin"], budgetVon: 5, budgetBis: 25, kriterien: "Bestand, sanierungsbedürftig, gute Lagen", status: "Aktiv" }),
  intr({ id: "INT-2026-003", ref: P("p-lhoffmann"), typ: "Privatkunde", objektarten: ["Eigentumswohnung"], regionen: ["Berlin", "Potsdam"], budgetVon: 0.5, budgetBis: 2, kriterien: "3–5 Zimmer, Balkon/Terrasse, ab 80 m²", status: "In Verhandlung" }),
  intr({ id: "INT-2026-004", ref: U("f-montesana"), ansprechpartnerId: "p-berger", typ: "Institutionell", objektarten: ["Mehrfamilienhaus"], regionen: ["Berlin", "NRW"], budgetVon: 20, budgetBis: 100, kriterien: "Neubau & Bestand, Mietwachstum, ESG", status: "Aktiv" }),
  intr({ id: "INT-2026-005", ref: U("f-brandes"), ansprechpartnerId: "p-brandes", typ: "Family Office", objektarten: ["Mehrfamilienhaus"], regionen: ["Berlin"], budgetVon: 5, budgetBis: 15, kriterien: "Bestand, Top Lagen, vermietet", status: "Aktiv" }),
  intr({ id: "INT-2026-006", ref: P("p-thweber"), typ: "Privatkunde", objektarten: ["Eigentumswohnung", "Penthouse"], regionen: ["Berlin"], budgetVon: 1, budgetBis: 2, kriterien: "Penthouse, Dachterrasse, Neubau", status: "In Verhandlung" }),
  intr({ id: "INT-2026-007", ref: U("f-gravitation"), ansprechpartnerId: "p-brinkmann", typ: "Institutionell", objektarten: ["Hotel / Betreiber"], regionen: ["DACH", "Südeuropa"], budgetVon: 10, budgetBis: 40, kriterien: "Core/Core+, langfristige Mietverträge", status: "Aktiv" }),
  intr({ id: "INT-2026-008", ref: P("p-weber"), typ: "Privatkunde", objektarten: ["Einfamilienhaus"], regionen: ["Berlin"], budgetVon: 1, budgetBis: 1.6, kriterien: "Einfamilienhaus, Garten, ruhige Lage", status: "In Prüfung" }),
  intr({ id: "INT-2026-009", ref: P("p-ghazzawi"), typ: "Privatkunde", objektarten: ["Eigentumswohnung"], regionen: ["Berlin", "Potsdam"], budgetVon: 1, budgetBis: 5, kriterien: "Neubau, moderne Ausstattung", status: "In Prüfung" }),
  intr({ id: "INT-2026-010", ref: P("p-legrand"), typ: "Privatkunde", objektarten: ["Eigentumswohnung"], regionen: ["Berlin"], budgetVon: 0.5, budgetBis: 3, kriterien: "Dachgeschoss, Terrasse", status: "Aktiv" }),
  intr({ id: "INT-2026-011", ref: P("p-keil"), typ: "Privatkunde", objektarten: ["Mehrfamilienhaus"], regionen: ["Berlin"], budgetVon: 2, budgetBis: 10, kriterien: "Bestand, Sanierung, Mietsteigerung", status: "Aktiv" }),
];

// ---------- Projects ----------

const pmd = (x: Partial<ProjectsMandat> & Pick<ProjectsMandat, "id" | "kunde" | "kundentyp" | "sanierungsart" | "status">): ProjectsMandat => ({ erstelltAm: d(-60), verantwortlichId: MK, verguetungSatz: 3, ...x });

export const projectsMandate: ProjectsMandat[] = [
  pmd({ id: "MAN-2026-001", kunde: P("p-mkaimann"), objektId: "o-weichsel-20", kundentyp: "Privatkunde", sanierungsart: "Badsanierung", status: "Planung", erstelltAm: "2026-08-18" }),
  pmd({ id: "MAN-2026-002", kunde: P("p-keil"), objektId: "o-weichsel-20", kundentyp: "Privatkunde", sanierungsart: "Kernsanierung, DG-Ausbau", status: "Aktiv", erstelltAm: "2026-08-12" }),
  pmd({ id: "MAN-2026-003", kunde: P("p-ghazzawi"), objektId: "o-mf-neubau-potsdam", kundentyp: "Privatkunde", sanierungsart: "Neubau, Innenausbau", status: "Aktiv", erstelltAm: "2026-02-01" }),
  pmd({ id: "MAN-2026-004", kunde: P("p-legrand"), objektId: "o-malplaquet-39", kundentyp: "Privatkunde", sanierungsart: "Wohnungssanierung", status: "In Verhandlung", erstelltAm: "2026-08-20" }),
  pmd({ id: "MAN-2026-005", kunde: P("p-ozden"), objektId: "o-malplaquet-39", kundentyp: "Privatkunde", sanierungsart: "Küchenumbau, Elektro", status: "In Umsetzung", erstelltAm: "2026-06-01" }),
  pmd({ id: "MAN-2026-006", kunde: U("f-erz"), objektId: "o-hotel-erz", kundentyp: "Unternehmen", sanierungsart: "Renovierung Hotelzimmer", status: "Aktiv", erstelltAm: "2026-03-05" }),
  pmd({ id: "MAN-2026-007", kunde: P("p-lange"), objektId: "o-dhh-potsdam", kundentyp: "Privatkunde", sanierungsart: "Innenausbau", status: "Aktiv", erstelltAm: "2026-02-20" }),
  pmd({ id: "MAN-2026-008", kunde: P("p-rossi"), objektId: "o-efh-zehlendorf-rossi", kundentyp: "Privatkunde", sanierungsart: "Modernisierung", status: "In Umsetzung", erstelltAm: "2026-05-02" }),
];

const prj = (x: Partial<ProjectsProjekt> & Pick<ProjectsProjekt, "id" | "mandatId" | "titel" | "bauherr" | "leistungsumfang" | "budget" | "phase" | "status">): ProjectsProjekt => ({
  erstelltAm: d(-50), verantwortlichId: MK, einheit: "", geplanterStart: "", geplantesEnde: "", verguetungSatz: 3, ziele: [], naechsterSchritt: "", beteiligte: [], ...x,
});

export const projectsProjekte: ProjectsProjekt[] = [
  prj({ id: "PRO-2026-002", mandatId: "MAN-2026-007", titel: "Innenausbau DHH Potsdam – Malerarbeiten", objektId: "o-dhh-potsdam", bauherr: P("p-lange"), leistungsumfang: "Maler, Bodenbeläge", budget: 27_000, phase: "F3", status: "Abgeschlossen", geplanterStart: "2026-03-01", geplantesEnde: "2026-04-10",
    vergabe: { angebotId: "ANG-008", datum: "2026-02-25", vergabesumme: 27_000, auftraggeber: "GRENFORD" }, beteiligte: [{ ...U("f-malerwerk"), rolle: "Ausführender Betrieb" }] }),
  prj({ id: "PRO-2026-003", mandatId: "MAN-2026-003", titel: "Innenausbau MF Neubau Potsdam – BA 1", objektId: "o-mf-neubau-potsdam", bauherr: P("p-ghazzawi"), leistungsumfang: "Innenausbau Bauabschnitt 1", budget: 39_500, phase: "F3", status: "Abgeschlossen", geplanterStart: "2026-04-01", geplantesEnde: "2026-06-10",
    vergabe: { angebotId: "ANG-009", datum: "2026-03-20", vergabesumme: 39_500, auftraggeber: "GRENFORD" }, beteiligte: [{ ...U("f-sander"), rolle: "GU-Partner" }] }),
  prj({ id: "PRO-2026-004", mandatId: "MAN-2026-006", titel: "Renovierung Hotelzimmer – Malerarbeiten", objektId: "o-hotel-erz", bauherr: U("f-erz"), leistungsumfang: "Malerarbeiten 46 Zimmer", budget: 32_000, phase: "F3", status: "Abgeschlossen", geplanterStart: "2026-08-01", geplantesEnde: "2026-09-10",
    vergabe: { angebotId: "ANG-010", datum: "2026-07-20", vergabesumme: 32_000, auftraggeber: "GRENFORD" }, beteiligte: [{ ...U("f-malerwerk"), rolle: "Ausführender Betrieb" }, { ...P("p-litus"), rolle: "Ansprechpartner Bauherr" }] }),
  prj({ id: "PRO-2026-006", mandatId: "MAN-2026-003", titel: "Innenausbau MF Neubau Potsdam – BA 2", objektId: "o-mf-neubau-potsdam", bauherr: P("p-ghazzawi"), leistungsumfang: "Innenausbau Bauabschnitt 2", budget: 600_000, phase: "F1", status: "Aktiv", geplanterStart: "2026-07-15", geplantesEnde: "2027-01-31", naechsterSchritt: "Baustellenbegehung", wiedervorlage: d(2),
    vergabe: { angebotId: "ANG-006", datum: "2026-07-01", vergabesumme: 590_000, auftraggeber: "GRENFORD" }, beteiligte: [{ ...U("f-sander"), rolle: "GU-Partner" }] }),
  prj({ id: "PRO-2026-010", mandatId: "MAN-2026-008", titel: "Modernisierung EFH Zehlendorf", objektId: "o-efh-zehlendorf-rossi", bauherr: P("p-rossi"), leistungsumfang: "Modernisierung inkl. Finanzierungsbegleitung", budget: 1_500_000, phase: "E2", status: "Aktiv", geplanterStart: "2026-11-01", geplantesEnde: "2027-06-30", naechsterSchritt: "Vergütungsvereinbarung finalisieren",
    beteiligte: [{ ...U("f-bankhaus"), rolle: "Finanzierer (Dienstleistung für GRENFORD)" }] }),
  prj({ id: "PRO-2026-012", mandatId: "MAN-2026-005", titel: "Küchenumbau Malplaquetstraße 39", objektId: "o-malplaquet-39", bauherr: P("p-ozden"), leistungsumfang: "Küche, Elektro, Innenausbau", budget: 45_000, phase: "F1", status: "Aktiv", geplanterStart: "2026-09-01", geplantesEnde: "2026-11-15",
    vergabe: { angebotId: "ANG-007", datum: "2026-08-15", vergabesumme: 45_000, auftraggeber: "GRENFORD" }, beteiligte: [{ ...U("f-kuechenaktiv"), rolle: "Ausführender Betrieb" }] }),
  prj({
    id: "PRO-2026-014", mandatId: "MAN-2026-001", titel: "Badsanierung", objektId: "o-weichsel-20", einheit: "WE 01 · 2. OG", bauherr: P("p-mkaimann"), leistungsumfang: "Komplettsanierung Bad inkl. Leitungen, Fliesen, Sanitär, Elektro, Malerarbeiten",
    budget: 80_000, phase: "C3", status: "Aktiv", geplanterStart: "2026-10-10", geplantesEnde: "2026-12-20", naechsterSchritt: "Angebote auswerten", wiedervorlage: d(18),
    ziele: ["Modernes Design, hochwertige Materialien", "Bodengleiche Dusche", "Waschtisch mit Unterschrank", "Neue Leitungen (Wasser/Abwasser)", "Neue Elektroinstallation (Spiegel, Beleuchtung)", "Be- und Entlüftung prüfen", "Budgetrahmen ca. 80.000 € netto", "Umsetzung Q4/2026"],
    beteiligte: [{ ...P("p-mkaimann"), rolle: "Eigentümerin (Mandat)" }, { ...U("f-baufrosch"), rolle: "GU – Angebot erhalten" }, { ...U("f-sander"), rolle: "GU – Angebot erhalten" }],
  }),
  prj({
    id: "PRO-2026-015", mandatId: "MAN-2026-002", titel: "Komplettsanierung MFH Weichselstraße 20", objektId: "o-weichsel-20", einheit: "8 WE", bauherr: P("p-keil"), leistungsumfang: "Komplettsanierung, Bad/Sanitär", budget: 250_000, phase: "E1", status: "Aktiv",
    geplanterStart: "Q4/2026", geplantesEnde: "Q3/2027", naechsterSchritt: "Bauvertrag Kunde – Bau Frosch prüfen", wiedervorlage: d(4),
    vergabe: { angebotId: "ANG-004", datum: d(-6), vergabesumme: 248_000, auftraggeber: "Kunde" }, beteiligte: [{ ...U("f-baufrosch"), rolle: "GU-Partner (vom Kunden beauftragt)" }],
  }),
  prj({ id: "PRO-2026-016", mandatId: "MAN-2026-004", titel: "Sanierung Wohnung Malplaquetstraße 39", objektId: "o-malplaquet-39", bauherr: P("p-legrand"), leistungsumfang: "Wohnungssanierung, Grundrissvarianten", budget: 400_000, phase: "B1", status: "Aktiv", naechsterSchritt: "Aufmaß Termin", wiedervorlage: d(5) }),
  prj({ id: "PRO-2026-017", mandatId: "MAN-2026-002", titel: "Bad / Innenausbau Eigentumswohnung", objektId: "o-etw-charlottenburg", bauherr: P("p-keil"), leistungsumfang: "Bad + Innenausbau", budget: 45_000, phase: "A2", status: "Aktiv", naechsterSchritt: "Bedarf aufnehmen", wiedervorlage: d(10) }),
];

export const angebote: Angebot[] = [
  { id: "ANG-001", projektId: "PRO-2026-014", guId: "GU-001", datum: "2026-09-25", summe: 74_800, umfang: "Vollangebot", status: "Eingegangen", dokument: "BauFrosch_Angebot.pdf" },
  { id: "ANG-002", projektId: "PRO-2026-014", guId: "GU-002", datum: "2026-09-24", summe: 76_500, umfang: "Vollangebot", status: "Eingegangen", dokument: "SanderBau_Angebot.pdf" },
  { id: "ANG-003", projektId: "PRO-2026-014", guId: "GU-003", umfang: "Angebot erwartet", status: "Angefragt" },
  { id: "ANG-004", projektId: "PRO-2026-015", guId: "GU-001", datum: d(-20), summe: 248_000, umfang: "Vollangebot", status: "Beauftragt", dokument: "BauFrosch_Weichsel20.pdf" },
  { id: "ANG-005", projektId: "PRO-2026-015", guId: "GU-002", datum: d(-22), summe: 262_000, umfang: "Vollangebot", status: "Abgelehnt", dokument: "SanderBau_Weichsel20.pdf" },
  { id: "ANG-006", projektId: "PRO-2026-006", guId: "GU-002", datum: "2026-06-20", summe: 590_000, umfang: "Vollangebot", status: "Beauftragt" },
  { id: "ANG-007", projektId: "PRO-2026-012", guId: "GU-005", datum: "2026-08-05", summe: 45_000, umfang: "Küche & Elektro", status: "Beauftragt" },
  { id: "ANG-008", projektId: "PRO-2026-002", guId: "GU-004", datum: "2026-02-18", summe: 27_000, umfang: "Malerarbeiten", status: "Beauftragt" },
  { id: "ANG-009", projektId: "PRO-2026-003", guId: "GU-002", datum: "2026-03-10", summe: 39_500, umfang: "Innenausbau BA 1", status: "Beauftragt" },
  { id: "ANG-010", projektId: "PRO-2026-004", guId: "GU-004", datum: "2026-07-12", summe: 32_000, umfang: "Malerarbeiten", status: "Beauftragt" },
];

const gu = (x: Partial<GUPartner> & Pick<GUPartner, "id" | "unternehmenId" | "kategorie" | "gewerke" | "regionen" | "status">): GUPartner => ({
  erstelltAm: d(-200), verantwortlichId: MK, bevorzugt: false, seit: "2020", vereinbarung: { status: "Keine", provisionsregelung: "Keine Provision – Kunde beauftragt direkt" }, ...x,
});

export const guPartner: GUPartner[] = [
  gu({ id: "GU-001", unternehmenId: "f-baufrosch", ansprechpartnerId: "p-frosch", kategorie: "Generalunternehmer", gewerke: ["Sanierung (komplett)", "Innenausbau", "Badsanierung", "Küchenumbau", "Fassade & Dach", "Koordination aller Gewerke"], regionen: ["Berlin", "Brandenburg"], status: "Aktiv", bevorzugt: true, seit: "2015", vereinbarung: { status: "Unterzeichnet", datum: "2024-03-01", provisionsregelung: "Rahmenvereinbarung – Konditionen je Projekt" } }),
  gu({ id: "GU-002", unternehmenId: "f-sander", ansprechpartnerId: "p-sander", kategorie: "Generalunternehmer", gewerke: ["Sanierung", "Rohbau", "Innenausbau"], regionen: ["Berlin", "NRW"], status: "Aktiv", bevorzugt: true, seit: "2012", vereinbarung: { status: "Unterzeichnet", datum: "2023-11-15", provisionsregelung: "Rahmenvereinbarung – Konditionen je Projekt" } }),
  gu({ id: "GU-003", unternehmenId: "f-mfbau", ansprechpartnerId: "p-kuehn", kategorie: "Generalunternehmer", gewerke: ["Sanierung", "Neubau"], regionen: ["Berlin", "Brandenburg"], status: "Aktiv", bevorzugt: true, seit: "2018" }),
  gu({ id: "GU-004", unternehmenId: "f-malerwerk", ansprechpartnerId: "p-krueger", kategorie: "Fachpartner", gewerke: ["Maler", "Bodenbeläge"], regionen: ["Berlin"], status: "Aktiv", seit: "2019" }),
  gu({ id: "GU-005", unternehmenId: "f-kuechenaktiv", ansprechpartnerId: "p-proetel", kategorie: "Fachpartner", gewerke: ["Küche", "Innenausbau", "Elektro"], regionen: ["Berlin", "Brandenburg"], status: "Aktiv", seit: "2010", vereinbarung: { status: "In Verhandlung", provisionsregelung: "Noch offen" } }),
];

// ---------- Netzwerk ----------

const ep = (x: Partial<Empfehlungspartner> & Pick<Empfehlungspartner, "id" | "personId" | "kategorie" | "bereiche" | "status">): Empfehlungspartner => ({
  erstelltAm: d(-300), verantwortlichId: MK, saetze: {}, kooperation: { status: "Unterzeichnet", laufzeit: "Unbefristet" }, seit: "2022-01-01", ...x,
});

export const empfehlungspartner: Empfehlungspartner[] = [
  ep({ id: "EP-001", unternehmenId: "f-kuechenaktiv", personId: "p-proetel", kategorie: "Küchenstudio", bereiche: ["Property", "Projects"], status: "Aktiv", seit: "2022-09-15", kooperation: { status: "Unterzeichnet", vom: "2022-09-15", laufzeit: "Unbefristet" } }),
  ep({ id: "EP-002", unternehmenId: "f-brandes", personId: "p-brandes", kategorie: "Makler", bereiche: ["Investment", "Property"], status: "Aktiv", seit: "2021-04-20", kooperation: { status: "Unterzeichnet", vom: "2021-04-20", laufzeit: "Unbefristet" } }),
  ep({ id: "EP-003", unternehmenId: "f-gravitation", personId: "p-brinkmann", kategorie: "Investor-Netzwerk", bereiche: ["Investment", "Property"], status: "Aktiv", seit: "2023-01-12" }),
  ep({ id: "EP-004", unternehmenId: "f-noodles", personId: "p-reitemeyer", kategorie: "Gastronomie", bereiche: ["Projects"], status: "In Verhandlung", seit: "2026-06-10", kooperation: { status: "In Verhandlung", laufzeit: "—" } }),
  ep({ id: "EP-005", unternehmenId: "f-financoncept", personId: "p-mberger", kategorie: "Finanzberater", bereiche: ["Investment", "Projects"], status: "Aktiv", seit: "2021-11-08" }),
  ep({ id: "EP-006", unternehmenId: "f-bankhaus", personId: "p-richter-bank", kategorie: "Bank", bereiche: ["Investment"], status: "Inaktiv", seit: "2019-08-17", kooperation: { status: "Beendet", laufzeit: "bis 31.12.2025" } }),
];

/** Vermittelte Vorgänge (Empfehlungen) mit projektbezogener Provisionsregelung */
export type Empfehlung = {
  id: string;
  partnerId: string;
  referenz: string;
  kunde?: { art: "person" | "unternehmen"; id: string };
  datum: string;
  /** Projektbezogen vereinbart – hat Vorrang vor dem Standard */
  individuell?: { satz?: number; festbetrag?: number; grund: string };
  verbindlichkeitNr?: string;
};

export const empfehlungen: Empfehlung[] = [
  { id: "EMP-001", partnerId: "EP-002", referenz: "INV-2026-001", kunde: U("f-maspohl"), datum: "2026-02-10", individuell: { festbetrag: 87_000, grund: "Individuelle Vereinbarung (Käufervermittlung)" }, verbindlichkeitNr: "VB-2026-015" },
  { id: "EMP-002", partnerId: "EP-003", referenz: "INV-2026-001", kunde: U("f-maspohl"), datum: "2026-02-14", individuell: { festbetrag: 18_000, grund: "Anteilige Vereinbarung" }, verbindlichkeitNr: "VB-2026-016" },
  { id: "EMP-003", partnerId: "EP-003", referenz: "INV-2026-002", kunde: U("f-huber"), datum: "2026-01-25", individuell: { festbetrag: 45_000, grund: "Individuelle Vereinbarung" }, verbindlichkeitNr: "VB-2026-011" },
  { id: "EMP-004", partnerId: "EP-003", referenz: "PROP-2026-002", kunde: P("p-srichter"), datum: "2026-01-08", individuell: { festbetrag: 11_800, grund: "Individuelle Vereinbarung" }, verbindlichkeitNr: "VB-2026-003" },
  { id: "EMP-005", partnerId: "EP-002", referenz: "PROP-2026-003", kunde: P("p-sommer"), datum: "2026-02-02", individuell: { festbetrag: 9_600, grund: "Individuelle Vereinbarung" }, verbindlichkeitNr: "VB-2026-007" },
  { id: "EMP-006", partnerId: "EP-001", referenz: "PRO-2026-014", kunde: P("p-mkaimann"), datum: "2026-08-12" },
  { id: "EMP-007", partnerId: "EP-001", referenz: "PRO-2026-015", kunde: P("p-keil"), datum: "2026-08-12" },
  { id: "EMP-008", partnerId: "EP-005", referenz: "PRO-2026-010", kunde: P("p-rossi"), datum: "2026-05-02" },
];

const pb = (x: Partial<Provisionsbeteiligung> & Pick<Provisionsbeteiligung, "id" | "beteiligter" | "referenz" | "bereich" | "art" | "grund" | "anteil" | "basis" | "status" | "phase">): Provisionsbeteiligung => ({
  erstelltAm: d(-200), verantwortlichId: MK, faelligkeit: "", vereinbartAm: "", ...x,
});

export const provisionsbeteiligungen: Provisionsbeteiligung[] = [
  pb({ id: "PROV-2026-001", festbetrag: 240_000, beteiligter: U("f-simple"), referenz: "INV-2026-001", bereich: "Investment", art: "Gemeinschaftsgeschäft", grund: "Käuferzuführung (Kooperation)", anteil: 53.33, basis: 450_000, status: "Abgerechnet", phase: "4.2", faelligkeit: "2026-10-31", vereinbartAm: "2026-02-01", verbindlichkeitNr: "VB-2026-014" }),
  pb({ id: "PROV-2026-002", festbetrag: 62_000, beteiligter: U("f-simple"), referenz: "INV-2026-004", bereich: "Investment", art: "Gemeinschaftsgeschäft", grund: "Objektzuführung", anteil: 39.74, basis: 156_000, status: "Ausgezahlt", phase: "4.3", faelligkeit: "2026-06-30", vereinbartAm: "2026-02-15", verbindlichkeitNr: "VB-2026-006" }),
  pb({ id: "PROV-2026-003", festbetrag: 52_500, beteiligter: U("f-financoncept"), referenz: "INV-2026-003", bereich: "Investment", art: "Kooperationsverkauf", grund: "Finanzierungsvermittlung Käufer", anteil: 20.83, basis: 252_000, status: "Ausgezahlt", phase: "4.3", faelligkeit: "2026-03-20", vereinbartAm: "2026-02-03", verbindlichkeitNr: "VB-2026-001" }),
  pb({ id: "PROV-2026-004", festbetrag: 37_500, beteiligter: U("f-financoncept"), referenz: "INV-2026-005", bereich: "Investment", art: "Kooperationsverkauf", grund: "Finanzierungsvermittlung Käufer", anteil: 17.86, basis: 210_000, status: "Ausgezahlt", phase: "4.3", faelligkeit: "2026-07-31", vereinbartAm: "2026-03-01", verbindlichkeitNr: "VB-2026-008" }),
  pb({ id: "PROV-2026-005", beteiligter: P("p-brandes"), referenz: "INV-2026-007", bereich: "Investment", art: "Kooperationsverkauf", grund: "Co-Partner Vermarktung", anteil: 25, basis: 180_000, status: "Aktiv", phase: "2.1", faelligkeit: "2027-01-31", vereinbartAm: "2026-09-01" }),
  pb({ id: "PROV-2026-006", beteiligter: U("f-malerwerk"), referenz: "PRO-2026-014", bereich: "Projects", art: "Planungspartner", grund: "Vorplanung Bad (Leistungsbeschreibung)", anteil: 25, basis: 2_400, status: "In Verhandlung", phase: "1.2", faelligkeit: "2027-01-15", vereinbartAm: "" }),
];

// ---------- Provisionsansprüche (GRENFORD) ----------

export const provisionen: Provision[] = [
  { id: "PRV-2026-001", referenz: "INV-2026-001", bereich: "Investment", art: "Käufercourtage", zahler: "Maspohl Invest GmbH", zahlerRef: U("f-maspohl"), basis: 7_500_000, satz: 6, betrag: 450_000, status: "Abgerechnet", datum: "2026-09-01", rechnungNr: "RE-2026-001" },
  { id: "PRV-2026-002", referenz: "INV-2026-002", bereich: "Investment", art: "Käufercourtage", zahler: "Family Office Huber", zahlerRef: U("f-huber"), basis: 5_300_000, satz: 6.04, betrag: 320_000, status: "Abgerechnet", datum: "2026-08-15", rechnungNr: "RE-2026-004" },
  { id: "PRV-2026-003", referenz: "INV-2026-005", bereich: "Investment", art: "Verkäufercourtage", zahler: "Bestandsportfolio (Verkäufer)", basis: 25_000_000, satz: 0.84, betrag: 210_000, status: "Abgerechnet", datum: "2026-07-31", rechnungNr: "RE-2026-007" },
  { id: "PRV-2026-004", referenz: "PRO-2026-003", bereich: "Projects", art: "Projektvergütung", zahler: "Nauf Ghazzawi", zahlerRef: P("p-ghazzawi"), basis: 39_500, satz: 0, betrag: 62_000, status: "Abgerechnet", datum: "2026-09-01", rechnungNr: "RE-2026-002" },
  { id: "PRV-2026-005", referenz: "INV-2026-007", bereich: "Investment", art: "Käufercourtage", zahler: "Käufer (noch offen)", basis: 3_000_000, satz: 6, betrag: 180_000, status: "Erwartet", datum: d(-30) },
  { id: "PRV-2026-006", referenz: "PROP-2026-006", bereich: "Property", art: "Käufercourtage", zahler: "Käufer (noch offen)", basis: 1_750_000, satz: 3.57, betrag: 62_475, status: "Erwartet", datum: d(-20) },
  { id: "PRV-2026-007", referenz: "PRO-2026-015", bereich: "Projects", art: "Beratungsvergütung", zahler: "Alexander Keil", zahlerRef: P("p-keil"), basis: 248_000, satz: 3, betrag: 7_440, status: "Entstanden", datum: d(-6) },
  { id: "PRV-2026-008", referenz: "PRO-2026-014", bereich: "Projects", art: "Beratungsvergütung", zahler: "Martina Kaimann", zahlerRef: P("p-mkaimann"), basis: 80_000, satz: 3, betrag: 2_400, status: "Erwartet", datum: d(-20) },
];

/** Zuordnung der freigegebenen Finanz-Testdaten zu Vorgängen und Mahnstufen (nur eindeutige Fälle) */
export const FORDERUNG_ZUORDNUNG: Record<string, { referenz?: string; kundeRef?: { art: "person" | "unternehmen"; id: string }; mahnstufe?: number; datum?: string }> = {
  "RE-2026-001": { referenz: "INV-2026-001", kundeRef: U("f-maspohl"), datum: "2026-09-01" },
  "RE-2026-002": { referenz: "PRO-2026-003", kundeRef: P("p-ghazzawi"), datum: "2026-08-26" },
  "RE-2026-004": { referenz: "INV-2026-002", kundeRef: U("f-huber"), datum: "2026-08-15" },
  "RE-2026-007": { referenz: "INV-2026-005", datum: "2026-07-31" },
  "RE-2026-008": { kundeRef: P("p-brandes"), datum: "2026-09-15" },
  "RE-2026-009": { kundeRef: U("f-financoncept"), datum: "2026-07-15" },
  "RE-2026-010": { kundeRef: U("f-kuechenaktiv"), mahnstufe: 2, datum: "2026-07-31" },
  "RE-2026-018": { mahnstufe: 1, datum: "2026-08-15" },
};

export const VERBINDLICHKEIT_ZUORDNUNG: Record<string, { empfaengerRef?: { art: "person" | "unternehmen"; id: string }; quelle?: string }> = {
  "VB-2026-014": { empfaengerRef: U("f-simple"), quelle: "PROV-2026-001" },
  "VB-2026-015": { empfaengerRef: P("p-brandes"), quelle: "EMP-001" },
  "VB-2026-016": { empfaengerRef: P("p-brinkmann"), quelle: "EMP-002" },
  "VB-2026-011": { empfaengerRef: P("p-brinkmann"), quelle: "EMP-003" },
  "VB-2026-003": { empfaengerRef: P("p-brinkmann"), quelle: "EMP-004" },
  "VB-2026-007": { empfaengerRef: P("p-brandes"), quelle: "EMP-005" },
  "VB-2026-006": { empfaengerRef: U("f-simple"), quelle: "PROV-2026-002" },
  "VB-2026-001": { empfaengerRef: U("f-financoncept"), quelle: "PROV-2026-003" },
  "VB-2026-008": { empfaengerRef: U("f-financoncept"), quelle: "PROV-2026-004" },
  "VB-2026-013": { empfaengerRef: U("f-malerwerk"), quelle: "PRO-2026-004" },
  "VB-2026-002": { empfaengerRef: U("f-malerwerk"), quelle: "PRO-2026-002" },
  "VB-2026-012": { empfaengerRef: U("f-kuechenaktiv"), quelle: "PRO-2026-012" },
  "VB-2026-009": { empfaengerRef: U("f-sander"), quelle: "PRO-2026-006" },
  "VB-2026-005": { empfaengerRef: U("f-sander"), quelle: "PRO-2026-003" },
  "VB-2026-010": { empfaengerRef: U("f-bankhaus"), quelle: "PRO-2026-010" },
};

// ---------- Dokumente, Verlauf, Aktivitäten zu Vorgängen ----------

let dn = 0;
const dok = (ref: string, name: string, groesse: string, datum: string): Dokument => ({ id: `DOK-${++dn}`, ref, name, groesse, datum, ablage: "Testdaten" });

export const dokumente: Dokument[] = [
  dok("AK-2026-003", "NDA_Maspohl_20260902.pdf", "0,4 MB", "2026-09-02"),
  dok("INV-2026-007", "Investment_Memo_v1.0.pdf", "2,4 MB", "2026-08-24"),
  dok("INV-2026-007", "Mieterliste_Schoeneberg.xlsx", "0,2 MB", "2026-08-28"),
  dok("INV-2026-007", "Grundrisse_Schoeneberg.pdf", "6,1 MB", "2026-08-24"),
  dok("INV-OPT-0008", "LOI_Maspohl_Invest.pdf", "0,3 MB", "2026-09-08"),
  dok("PROP-2026-006", "Expose_Penthouse_Charlottenburg.pdf", "4,8 MB", "2026-09-05"),
  dok("PROP-OPT-0012", "Finanzierungsnachweis_Weber.pdf", "0,6 MB", "2026-09-02"),
  dok("PRO-2026-014", "Angebotsvergleich_Bad_WE01_v1.0.pdf", "2,4 MB", "2026-09-26"),
  dok("PRO-2026-014", "BauFrosch_Angebot.pdf", "1,1 MB", "2026-09-25"),
  dok("PRO-2026-014", "SanderBau_Angebot.pdf", "1,3 MB", "2026-09-24"),
  dok("PROV-2026-005", "Beteiligungsvereinbarung_Brandes.pdf", "1,2 MB", "2026-09-01"),
  dok("EP-001", "Kooperationsvertrag_KuechenAktiv.pdf", "0,9 MB", "2022-09-15"),
];

export const verlaufStart: Verlauf[] = [
  { id: "VL-1", ref: "AK-2026-001", zeit: "2026-06-23T10:00", text: "Akquise angelegt (Quelle: Maklerkooperation)", benutzerId: MK },
  { id: "VL-2", ref: "AK-2026-001", zeit: "2026-09-01T09:30", text: "Qualifiziert und übernommen in Investment-Projekt INV-2026-007", benutzerId: MK },
  { id: "VL-3", ref: "INV-2026-007", zeit: "2026-09-01T09:30", text: "Projekt aus Akquise AK-2026-001 übernommen – Stammdaten verknüpft, keine Kopie", benutzerId: MK },
  { id: "VL-4", ref: "INV-2026-007", zeit: "2026-09-08T14:30", text: "Phase C2 – Käuferansprache", benutzerId: MK },
  { id: "VL-5", ref: "PRO-2026-015", zeit: `${d(-6)}T11:00`, text: "Vergabeentscheidung des Kunden dokumentiert: Bau Frosch (direkte Beauftragung durch den Kunden)", benutzerId: MK },
];

let an = 900;
const akt = (x: Omit<Aktivitaet, "id" | "verantwortlichId" | "erledigt" | "beschreibung"> & Partial<Aktivitaet>): Aktivitaet => ({ id: `a-${++an}`, verantwortlichId: MK, erledigt: false, beschreibung: "", ...x });
const V = (id: string) => ({ art: "vorgang" as const, id });

export const aktivitaetenModule: Aktivitaet[] = [
  akt({ typ: "Telefon", titel: "Telefonat", beschreibung: "Update Kaufpreisindikation besprochen.", datum: "2026-09-08", von: "14:30", bezug: [V("INV-2026-007"), V("INV-OPT-0008"), Pn("p-maspohl")], erledigt: true }),
  akt({ typ: "Termin", titel: "Besichtigung", beschreibung: "Strategie & Vermarktung abgestimmt.", datum: "2026-09-05", von: "11:00", bis: "12:00", terminArt: "vor-ort", bezug: [V("INV-2026-007")], erledigt: true }),
  akt({ typ: "Aufgabe", titel: "Käufergespräch terminieren", datum: "2026-10-12", bezug: [V("INV-2026-007"), V("INV-OPT-0008")] }),
  akt({ typ: "Aufgabe", titel: "Datenraum erweitern", datum: "2026-10-15", bezug: [V("INV-2026-007")] }),
  akt({ typ: "Aufgabe", titel: "Angebotserwartung abfragen", datum: "2026-10-18", bezug: [V("INV-2026-007"), V("INV-OPT-0010")] }),
  akt({ typ: "Notiz", titel: "Investor zeigt starkes Interesse", beschreibung: "Maspohl Invest möchte LOI kurzfristig konkretisieren.", datum: "2026-09-08", von: "16:20", bezug: [V("INV-2026-007"), V("INV-OPT-0008")] }),
  akt({ typ: "Aufgabe", titel: "Mieterliste prüfen", datum: "2026-09-28", bezug: [V("AK-2026-003")] }),
  akt({ typ: "Telefon", titel: "Telefonat mit Maklerkollegen", beschreibung: "Unterlagen angekündigt.", datum: "2026-09-24", von: "09:15", bezug: [V("AK-2026-003"), Pn("p-brandes")], erledigt: true }),
  akt({ typ: "Termin", titel: "Objektunterlagen", beschreibung: "Prüfung Grundrisse", datum: "2026-10-13", von: "14:00", bis: "15:00", terminArt: "persoenlich", bezug: [V("AK-2026-003")] }),
  akt({ typ: "Telefon", titel: "Kaufpreisverhandlung", beschreibung: "Kaufpreisverhandlung besprochen", datum: "2026-10-10", von: "14:30", bezug: [V("PROP-2026-006"), V("PROP-OPT-0012"), Pn("p-thweber")], erledigt: true }),
  akt({ typ: "Aufgabe", titel: "Entwurf Kaufvertrag prüfen", datum: "2026-10-15", bezug: [V("PROP-2026-006"), V("PROP-OPT-0012")] }),
  akt({ typ: "Aufgabe", titel: "Notartermin koordinieren", datum: "2026-10-22", bezug: [V("PROP-2026-006"), V("PROP-OPT-0012")] }),
  akt({ typ: "Aufgabe", titel: "Angebote auswerten", datum: "2026-10-12", bezug: [V("PRO-2026-014")] }),
  akt({ typ: "Aufgabe", titel: "Vergleich erstellen", datum: "2026-10-14", bezug: [V("PRO-2026-014")] }),
  akt({ typ: "Aufgabe", titel: "Unterlagen an GU versenden", datum: "2026-09-22", bezug: [V("PRO-2026-014")], erledigt: true }),
  akt({ typ: "Termin", titel: "Kundengespräch", beschreibung: "Martina Kaimann – Angebotsvergleich", datum: "2026-10-14", von: "14:00", bis: "15:00", terminArt: "persoenlich", bezug: [V("PRO-2026-014"), Pn("p-mkaimann")] }),
  akt({ typ: "Aufgabe", titel: "Beteiligungsvereinbarung finalisieren", datum: "2026-10-20", bezug: [V("PROV-2026-005"), Pn("p-brandes")] }),
];

function Pn(id: string) {
  return { art: "person" as const, id };
}
