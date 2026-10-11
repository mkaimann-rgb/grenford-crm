/**
 * Datenzugriffsschicht.
 *
 * Heute: Testdaten, Änderungen werden zusätzlich im Browser (localStorage) zwischengespeichert –
 * nur für die geschützte Testvorschau, NICHT für echte Kundendaten.
 * Später: Supabase-Implementierung derselben Schnittstelle (siehe supabase/migrations und
 * src/lib/db/supabase-repository.ts) – serverseitig, mit Row Level Security und Zugriff nur
 * für angemeldete GRENFORD-Konten. Die Oberfläche spricht nur diese Schnittstelle an.
 */
import * as testdaten from "./testdata";
import * as modul from "./testdata-module";
import * as finanz from "../testdata/finanzen";
import type { Aktivitaet, Benutzer, Objekt, Person, Unternehmen, Vorhaben } from "./types";
import type { ModulDaten } from "./projektion";
import type { Angebot, Dokument, Einstellungen, FinanzDaten, Provision, Verlauf } from "./module";
import type { Empfehlung } from "./testdata-module";

export type CrmDaten = ModulDaten & FinanzDaten & {
  benutzer: Benutzer[];
  unternehmen: Unternehmen[];
  personen: Person[];
  /** Objekt-Stammsätze (je Objekt genau einer) */
  objekte: Objekt[];
  /** Vorgänge der Kunden (Kauf-, Verkaufs-, Sanierungsvorhaben) */
  vorhaben: Vorhaben[];
  aktivitaeten: Aktivitaet[];
  angebote: Angebot[];
  empfehlungen: Empfehlung[];
  provisionen: Provision[];
  dokumente: Dokument[];
  verlauf: Verlauf[];
  einstellungen: Einstellungen;
};

export interface CrmRepository {
  /** Anfangsbestand laden */
  laden(): CrmDaten;
  /** true, sobald Änderungen dauerhaft und zentral (Datenbank) gespeichert werden */
  readonly dauerhaft: boolean;
  /** Beschreibung des Speicherorts für die Oberfläche */
  readonly speicherort: string;
}

/** Bei Änderungen der Testdatenstruktur erhöhen – verwirft alte Browser-Zwischenstände */
export const DATEN_VERSION = "2026-10-11-v1";
export const LOCAL_KEY = "grenford-crm-testdaten";

export function testdatenLaden(): CrmDaten {
  const fz = (nr: string) => modul.FORDERUNG_ZUORDNUNG[nr] ?? {};
  const vz = (nr: string) => modul.VERBINDLICHKEIT_ZUORDNUNG[nr] ?? {};
  return {
    benutzer: testdaten.benutzer,
    unternehmen: testdaten.unternehmen,
    personen: testdaten.personen,
    objekte: modul.objekte,
    vorhaben: testdaten.vorhaben,
    aktivitaeten: [...testdaten.aktivitaeten, ...modul.aktivitaetenModule],
    akquise: modul.akquise,
    investmentProjekte: modul.investmentProjekte,
    kaeuferprozesse: modul.kaeuferprozesse,
    propertyMandate: modul.propertyMandate,
    projectsMandate: modul.projectsMandate,
    projectsProjekte: modul.projectsProjekte,
    provisionsbeteiligungen: modul.provisionsbeteiligungen,
    ankaufsprofile: modul.ankaufsprofile,
    suchauftraege: modul.suchauftraege,
    interessenten: modul.interessenten,
    guPartner: modul.guPartner,
    empfehlungspartner: modul.empfehlungspartner,
    angebote: modul.angebote,
    empfehlungen: modul.empfehlungen,
    provisionen: modul.provisionen,
    dokumente: modul.dokumente,
    verlauf: modul.verlaufStart,
    forderungen: finanz.forderungen.map((f) => ({ ...f, ...fz(f.nr) })),
    zahlungseingaenge: finanz.zahlungseingaenge,
    verbindlichkeiten: finanz.verbindlichkeiten.map((v) => ({ ...v, ...vz(v.nr) })),
    auszahlungen: finanz.auszahlungen,
    einstellungen: {
      provisionsstandards: { Investment: 10, Property: 10, Projects: 3 },
      benachrichtigungen: { wiedervorlagen: true, ueberfaellig: true, zahlungseingang: true, phasenwechsel: false, wochenbericht: false },
      benutzer: { name: "Marco Kaimann", email: "mkaimann@grenford.de", rolle: "Hauptbenutzer (Administrator)" },
    },
  };
}

export const testdatenRepository: CrmRepository = {
  dauerhaft: false,
  speicherort: "Testmodus – Zwischenspeicher nur in diesem Browser",
  laden: testdatenLaden,
};
