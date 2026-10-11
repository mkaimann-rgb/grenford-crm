/**
 * ============================================================
 *  TESTDATEN – KEINE ECHTEN KUNDEN- ODER GESCHÄFTSDATEN
 * ============================================================
 * Alle Namen, Beträge, Termine und Vorgänge in dieser Datei sind
 * fiktive Beispielwerte aus der freigegebenen Dashboard-Visualisierung.
 * Alle Kennzahlen, Listen, Termine und Aufgaben des Dashboards werden seit der
 * Abschlusskorrektur aus der zentralen Datenbasis berechnet (src/lib/crm/dashboard.ts).
 * Hier verbleibt nur der Testbenutzer für die Begrüßung und die Kopfzeile.
 */

export const IS_TEST_DATA = true as const;

export type Bereich = "investment" | "property" | "projects";

export const testUser = { name: "Marco Kaimann", firstName: "Marco", initials: "MK" };
