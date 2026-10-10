/**
 * ============================================================
 *  TESTDATEN – KEINE ECHTEN KUNDEN-, PARTNER- ODER ZAHLUNGSDATEN
 * ============================================================
 * Fiktive Beispielwerte für die Seite „Finanzen → Eingang / Bezahlt“.
 * Die sichtbaren Zeilen entsprechen der Visualisierung „05_Finanzen_Eingang CI“;
 * ältere Zahlungen sind ergänzt, damit Kennzahlen und Diagramme
 * aus denselben Datensätzen berechnet werden können.
 */
import type { Auszahlung, Forderung, Verbindlichkeit, Zahlungseingang } from "../finanzen/logic";

export const IS_TEST_DATA = true as const;

/** Fester Stichtag der Testdaten („heute“) */
export const STICHTAG = "2026-10-10";

/** Vorjahreswerte für den gleichen Zeitraum (01.01.–10.10.2025) – nur für „Dieses Jahr“ */
export const VORJAHR_YTD = { eingang: 1_897_300, auszahlung: 628_600 };

// ---------- Forderungen (Rechnungen an Kunden) ----------
export const forderungen: Forderung[] = [
  { nr: "RE-2026-001", kunde: "Maspohl (Käufer)", bereich: "Investment", betrag: 450_000, faellig: "2026-09-30" },
  { nr: "RE-2026-002", kunde: "Nauf Ghazzawi", bereich: "Projects", betrag: 62_000, faellig: "2026-09-25" },
  { nr: "RE-2026-003", kunde: "Montesana Asset", bereich: "Property", betrag: 96_000, faellig: "2026-10-31" },
  { nr: "RE-2026-004", kunde: "Family Office", bereich: "Investment", betrag: 320_000, faellig: "2026-09-15" },
  { nr: "RE-2026-005", kunde: "Gewerbepark München", bereich: "Projects", betrag: 150_000, faellig: "2026-10-20" },
  { nr: "RE-2026-006", kunde: "Richter (Privat)", bereich: "Property", betrag: 62_000, faellig: "2026-08-31" },
  { nr: "RE-2026-007", kunde: "Bestandsportfolio", bereich: "Investment", betrag: 210_000, faellig: "2026-08-31" },
  { nr: "RE-2026-008", kunde: "Kay Brandes", bereich: "Property", betrag: 57_000, faellig: "2026-10-15" },
  { nr: "RE-2026-009", kunde: "FinanConcept GmbH", bereich: "Projects", betrag: 27_500, faellig: "2026-08-15" },
  { nr: "RE-2026-010", kunde: "Küche Aktiv", bereich: "Projects", betrag: 135_000, faellig: "2026-08-31" },
  { nr: "RE-2025-041", kunde: "Testkunde Alpha GmbH", bereich: "Investment", betrag: 145_000, faellig: "2026-01-15" },
  { nr: "RE-2025-044", kunde: "Muster Immobilien KG", bereich: "Property", betrag: 38_000, faellig: "2026-01-31" },
  { nr: "RE-2025-046", kunde: "Beispiel Wohnbau KG", bereich: "Projects", betrag: 92_000, faellig: "2026-02-15" },
  { nr: "RE-2025-048", kunde: "Test Familienstiftung", bereich: "Property", betrag: 64_500, faellig: "2026-02-28" },
  { nr: "RE-2026-011", kunde: "Nordlicht Capital (Test)", bereich: "Investment", betrag: 210_000, faellig: "2026-03-15" },
  { nr: "RE-2026-012", kunde: "Baugruppe Test Süd", bereich: "Projects", betrag: 56_000, faellig: "2026-04-15" },
  { nr: "RE-2026-013", kunde: "Hanse Invest (Test)", bereich: "Investment", betrag: 118_000, faellig: "2026-04-30" },
  { nr: "RE-2026-014", kunde: "Villa Seeblick (Test)", bereich: "Property", betrag: 74_500, faellig: "2026-05-15" },
  { nr: "RE-2026-015", kunde: "Dachgeschoss Test GbR", bereich: "Projects", betrag: 39_000, faellig: "2026-05-31" },
  { nr: "RE-2026-016", kunde: "Portfolio West (Test)", bereich: "Investment", betrag: 186_000, faellig: "2026-06-30" },
  { nr: "RE-2026-017", kunde: "Stadthaus Test", bereich: "Property", betrag: 47_500, faellig: "2026-07-15" },
  // Noch ohne Zahlung – erscheinen NICHT als Eingang, nur in „Offen“ bzw. „Überfällig“
  { nr: "RE-2026-018", kunde: "Testkunde Süd GmbH", bereich: "Property", betrag: 62_000, faellig: "2026-09-15" },
  { nr: "RE-2026-019", kunde: "Bauherrengemeinschaft Test", bereich: "Projects", betrag: 38_000, faellig: "2026-09-30" },
  { nr: "RE-2026-020", kunde: "Projektgesellschaft Nord (Test)", bereich: "Investment", betrag: 328_500, faellig: "2026-11-05" },
];

// ---------- Tatsächliche Zahlungseingänge ----------
export const zahlungseingaenge: Zahlungseingang[] = [
  { id: "ZE-022", datum: "2026-09-22", rechnungNr: "RE-2026-001", betrag: 450_000 },
  { id: "ZE-021", datum: "2026-09-18", rechnungNr: "RE-2026-002", betrag: 62_000 },
  { id: "ZE-020", datum: "2026-09-12", rechnungNr: "RE-2026-003", betrag: 48_000 },
  { id: "ZE-019", datum: "2026-09-05", rechnungNr: "RE-2026-004", betrag: 320_000 },
  { id: "ZE-018", datum: "2026-08-28", rechnungNr: "RE-2026-005", betrag: 75_000 },
  { id: "ZE-017", datum: "2026-08-20", rechnungNr: "RE-2026-006", betrag: 62_000 },
  { id: "ZE-016", datum: "2026-08-15", rechnungNr: "RE-2026-007", betrag: 210_000 },
  { id: "ZE-015", datum: "2026-08-08", rechnungNr: "RE-2026-008", betrag: 28_500 },
  { id: "ZE-014", datum: "2026-08-02", rechnungNr: "RE-2026-009", betrag: 27_500 },
  { id: "ZE-013", datum: "2026-07-25", rechnungNr: "RE-2026-010", betrag: 75_000 },
  { id: "ZE-012", datum: "2026-07-08", rechnungNr: "RE-2026-017", betrag: 47_500 },
  { id: "ZE-011", datum: "2026-06-17", rechnungNr: "RE-2026-016", betrag: 186_000 },
  { id: "ZE-010", datum: "2026-05-29", rechnungNr: "RE-2026-015", betrag: 39_000 },
  { id: "ZE-009", datum: "2026-05-13", rechnungNr: "RE-2026-014", betrag: 74_500 },
  { id: "ZE-008", datum: "2026-04-27", rechnungNr: "RE-2026-013", betrag: 118_000 },
  { id: "ZE-007", datum: "2026-04-09", rechnungNr: "RE-2026-012", betrag: 56_000 },
  { id: "ZE-006", datum: "2026-03-06", rechnungNr: "RE-2026-011", betrag: 210_000 },
  { id: "ZE-005", datum: "2026-02-26", rechnungNr: "RE-2025-048", betrag: 64_500 },
  { id: "ZE-004", datum: "2026-02-14", rechnungNr: "RE-2025-046", betrag: 92_000 },
  { id: "ZE-003", datum: "2026-01-28", rechnungNr: "RE-2025-044", betrag: 38_000 },
  { id: "ZE-002", datum: "2026-01-12", rechnungNr: "RE-2025-041", betrag: 145_000 },
];

// ---------- Verbindlichkeiten (Partner, Provisionsbeteiligte, Dienstleister, Bau) ----------
export const verbindlichkeiten: Verbindlichkeit[] = [
  { nr: "VB-2026-014", empfaenger: "Simple Invest (Gino Spannaus)", referenz: "INV-2026-001", bereich: "Investment", typ: "Provision", betrag: 240_000, faellig: "2026-10-31" },
  { nr: "VB-2026-015", empfaenger: "Kay Brandes", referenz: "INV-2026-001", bereich: "Investment", typ: "Empfehlungsprovision", betrag: 87_000, faellig: "2026-09-30" },
  { nr: "VB-2026-013", empfaenger: "MalerWerk GmbH", referenz: "PRO-2026-004", bereich: "Projects", typ: "Bau- / GU-Leistung", betrag: 32_000, faellig: "2026-09-20" },
  { nr: "VB-2026-012", empfaenger: "Küchen Aktiv", referenz: "PRO-2026-012", bereich: "Projects", typ: "Bau- / GU-Leistung", betrag: 22_500, faellig: "2026-09-15" },
  { nr: "VB-2026-011", empfaenger: "Thomas Brinkmann", referenz: "INV-2026-002", bereich: "Investment", typ: "Empfehlungsprovision", betrag: 45_000, faellig: "2026-08-31" },
  { nr: "VB-2026-010", empfaenger: "Bankhaus Richter", referenz: "PRO-2026-010", bereich: "Projects", typ: "Dienstleistung / Sonstiges", betrag: 31_000, faellig: "2026-08-20" },
  { nr: "VB-2026-009", empfaenger: "Sander Bau GmbH", referenz: "PRO-2026-006", bereich: "Projects", typ: "Bau- / GU-Leistung", betrag: 44_500, faellig: "2026-08-10" },
  { nr: "VB-2026-008", empfaenger: "FinanConcept GmbH", referenz: "INV-2026-005", bereich: "Investment", typ: "Provision", betrag: 37_500, faellig: "2026-07-31" },
  { nr: "VB-2026-007", empfaenger: "Kay Brandes", referenz: "PROP-2026-003", bereich: "Property", typ: "Empfehlungsprovision", betrag: 9_600, faellig: "2026-07-20" },
  { nr: "VB-2026-006", empfaenger: "Simple Invest (Gino Spannaus)", referenz: "INV-2026-004", bereich: "Investment", typ: "Provision", betrag: 62_000, faellig: "2026-06-30" },
  { nr: "VB-2026-005", empfaenger: "Sander Bau GmbH", referenz: "PRO-2026-003", bereich: "Projects", typ: "Bau- / GU-Leistung", betrag: 39_500, faellig: "2026-06-15" },
  { nr: "VB-2026-004", empfaenger: "Steuerbüro Test & Partner", referenz: "INV-2026-003", bereich: "Investment", typ: "Dienstleistung / Sonstiges", betrag: 8_900, faellig: "2026-05-31" },
  { nr: "VB-2026-003", empfaenger: "Thomas Brinkmann", referenz: "PROP-2026-002", bereich: "Property", typ: "Empfehlungsprovision", betrag: 11_800, faellig: "2026-04-30" },
  { nr: "VB-2026-002", empfaenger: "MalerWerk GmbH", referenz: "PRO-2026-002", bereich: "Projects", typ: "Bau- / GU-Leistung", betrag: 27_000, faellig: "2026-04-15" },
  { nr: "VB-2026-001", empfaenger: "FinanConcept GmbH", referenz: "INV-2026-003", bereich: "Investment", typ: "Provision", betrag: 52_500, faellig: "2026-03-20" },
  { nr: "VB-2025-019", empfaenger: "Bau-Test GmbH", referenz: "PRO-2026-001", bereich: "Projects", typ: "Bau- / GU-Leistung", betrag: 48_000, faellig: "2026-02-28" },
  { nr: "VB-2025-018", empfaenger: "Anna Beispiel (Test)", referenz: "PROP-2025-004", bereich: "Property", typ: "Empfehlungsprovision", betrag: 6_400, faellig: "2026-02-15" },
  { nr: "VB-2025-017", empfaenger: "Testpartner Nord GmbH", referenz: "INV-2025-011", bereich: "Investment", typ: "Provision", betrag: 21_750, faellig: "2026-01-31" },
  // Noch nicht bezahlt – erscheint NICHT als Auszahlung
  { nr: "VB-2026-016", empfaenger: "Thomas Brinkmann", referenz: "INV-2026-001", bereich: "Investment", typ: "Empfehlungsprovision", betrag: 18_000, faellig: "2026-10-31" },
];

// ---------- Tatsächliche Auszahlungen ----------
export const auszahlungen: Auszahlung[] = [
  { id: "AZ-018", datum: "2026-09-25", verbindlichkeitNr: "VB-2026-014", betrag: 180_000 },
  { id: "AZ-017", datum: "2026-09-20", verbindlichkeitNr: "VB-2026-015", betrag: 87_000 },
  { id: "AZ-016", datum: "2026-09-15", verbindlichkeitNr: "VB-2026-013", betrag: 32_000 },
  { id: "AZ-015", datum: "2026-09-10", verbindlichkeitNr: "VB-2026-012", betrag: 22_500 },
  { id: "AZ-014", datum: "2026-08-28", verbindlichkeitNr: "VB-2026-011", betrag: 45_000 },
  { id: "AZ-013", datum: "2026-08-18", verbindlichkeitNr: "VB-2026-010", betrag: 31_000 },
  { id: "AZ-012", datum: "2026-08-05", verbindlichkeitNr: "VB-2026-009", betrag: 44_500 },
  { id: "AZ-011", datum: "2026-07-28", verbindlichkeitNr: "VB-2026-008", betrag: 37_500 },
  { id: "AZ-010", datum: "2026-07-15", verbindlichkeitNr: "VB-2026-007", betrag: 9_600 },
  { id: "AZ-009", datum: "2026-06-30", verbindlichkeitNr: "VB-2026-006", betrag: 62_000 },
  { id: "AZ-008", datum: "2026-06-12", verbindlichkeitNr: "VB-2026-005", betrag: 39_500 },
  { id: "AZ-007", datum: "2026-05-21", verbindlichkeitNr: "VB-2026-004", betrag: 8_900 },
  { id: "AZ-006", datum: "2026-04-30", verbindlichkeitNr: "VB-2026-003", betrag: 11_800 },
  { id: "AZ-005", datum: "2026-04-09", verbindlichkeitNr: "VB-2026-002", betrag: 27_000 },
  { id: "AZ-004", datum: "2026-03-18", verbindlichkeitNr: "VB-2026-001", betrag: 52_500 },
  { id: "AZ-003", datum: "2026-02-25", verbindlichkeitNr: "VB-2025-019", betrag: 48_000 },
  { id: "AZ-002", datum: "2026-02-10", verbindlichkeitNr: "VB-2025-018", betrag: 6_400 },
  { id: "AZ-001", datum: "2026-01-20", verbindlichkeitNr: "VB-2025-017", betrag: 21_750 },
];
