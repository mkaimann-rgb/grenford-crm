/**
 * Datenzugriffsschicht.
 *
 * Heute: In-Memory-Testdaten (gehen beim Neuladen der Seite verloren).
 * Später: Supabase-Implementierung derselben Schnittstelle – serverseitig,
 * mit Row Level Security und Zugriff nur für angemeldete GRENFORD-Konten.
 * Die Oberfläche spricht nur diese Schnittstelle an und muss dafür nicht
 * umgebaut werden.
 */
import * as testdaten from "./testdata";
import type { Aktivitaet, Benutzer, Person, Unternehmen, Vorhaben } from "./types";

export type CrmDaten = {
  benutzer: Benutzer[];
  unternehmen: Unternehmen[];
  personen: Person[];
  vorhaben: Vorhaben[];
  aktivitaeten: Aktivitaet[];
};

export interface CrmRepository {
  /** Anfangsbestand laden */
  laden(): CrmDaten;
  /** true, sobald Änderungen dauerhaft gespeichert werden */
  readonly dauerhaft: boolean;
}

export const testdatenRepository: CrmRepository = {
  dauerhaft: false,
  laden: () => ({
    benutzer: testdaten.benutzer,
    unternehmen: testdaten.unternehmen,
    personen: testdaten.personen,
    vorhaben: testdaten.vorhaben,
    aktivitaeten: testdaten.aktivitaeten,
  }),
};
