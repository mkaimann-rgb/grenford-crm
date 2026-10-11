/**
 * Nummernkreise – eine Definition für Vergabe, Einstellungen und Tests.
 *
 * Regeln:
 *  - Bestehende IDs und Referenzen werden nie verändert oder neu vergeben.
 *  - Jeder Vorgangstyp hat je Geschäftsbereich einen eigenen, eindeutigen Präfix.
 *  - Vergeben wird immer „höchste vorhandene Nummer + 1“ über ALLE bekannten IDs und Referenzen
 *    (auch Verweise in Rechnungen, Verbindlichkeiten, Provisionen), damit keine Kollision mit
 *    einer nur referenzierten Nummer entsteht.
 *  - Finanzbelege (Rechnungen, Verbindlichkeiten, Provisionsansprüche) laufen bereichsübergreifend
 *    fortlaufend je Belegart (lückenlose Rechnungsnummern); der Geschäftsbereich ist Merkmal des Belegs.
 *  - Akquise ist bereichsübergreifend: Der Bereich kann sich während der Qualifizierung ändern,
 *    die Nummer bleibt dabei stabil; bei Übernahme entsteht die Nummer des Fachbereichs.
 *  - In der Datenbank übernimmt dies die Funktion naechste_nummer() (supabase/migrations/0001_init.sql).
 */
import type { ID } from "./types.ts";
import { naechsteNummer } from "./module.ts";

export type Nummernkreis = {
  schluessel: string;
  typ: string;
  bereich: "Investment" | "Property" | "Projects" | "bereichsübergreifend";
  /** Präfix inkl. Jahr (falls jahresbezogen) und abschließendem Bindestrich */
  praefix: (jahr: string) => string;
  stellen: number;
};

const J = (p: string) => (jahr: string) => `${p}-${jahr}-`;
const F = (p: string) => () => `${p}-`;

export const NUMMERNKREISE: Nummernkreis[] = [
  { schluessel: "akquise", typ: "Akquise-Vorgang", bereich: "bereichsübergreifend", praefix: J("AK"), stellen: 3 },
  { schluessel: "investmentProjekt", typ: "Investment-Projekt", bereich: "Investment", praefix: J("INV"), stellen: 3 },
  { schluessel: "kaeuferInvestment", typ: "Käuferprozess", bereich: "Investment", praefix: F("INV-OPT"), stellen: 4 },
  { schluessel: "ankaufsprofil", typ: "Ankaufsprofil", bereich: "Investment", praefix: J("ANK"), stellen: 3 },
  { schluessel: "suchauftragInvestment", typ: "Suchauftrag", bereich: "Investment", praefix: F("SRCH-I"), stellen: 3 },
  { schluessel: "propertyMandat", typ: "Property-Mandat", bereich: "Property", praefix: J("PROP"), stellen: 3 },
  { schluessel: "kaeuferProperty", typ: "Käuferprozess", bereich: "Property", praefix: F("PROP-OPT"), stellen: 4 },
  { schluessel: "interessent", typ: "Interessent", bereich: "Property", praefix: J("INT"), stellen: 3 },
  { schluessel: "suchauftragProperty", typ: "Suchauftrag", bereich: "Property", praefix: F("SRCH-P"), stellen: 3 },
  { schluessel: "projectsMandat", typ: "Projects-Mandat", bereich: "Projects", praefix: J("MAN"), stellen: 3 },
  { schluessel: "projectsProjekt", typ: "Projects-Projekt", bereich: "Projects", praefix: J("PRO"), stellen: 3 },
  { schluessel: "angebot", typ: "GU-Angebot", bereich: "Projects", praefix: F("ANG"), stellen: 3 },
  { schluessel: "guPartner", typ: "GU-Partner", bereich: "Projects", praefix: F("GU"), stellen: 3 },
  { schluessel: "objekt", typ: "Objekt (Stammsatz)", bereich: "bereichsübergreifend", praefix: J("OPP"), stellen: 3 },
  { schluessel: "empfehlungspartner", typ: "Empfehlungspartner", bereich: "bereichsübergreifend", praefix: F("EP"), stellen: 3 },
  { schluessel: "empfehlung", typ: "Empfehlung", bereich: "bereichsübergreifend", praefix: F("EMP"), stellen: 3 },
  { schluessel: "provisionsbeteiligung", typ: "Provisionsbeteiligung", bereich: "bereichsübergreifend", praefix: J("PROV"), stellen: 3 },
  { schluessel: "provisionsanspruch", typ: "Provisionsanspruch", bereich: "bereichsübergreifend", praefix: J("PRV"), stellen: 3 },
  { schluessel: "rechnung", typ: "Rechnung (Forderung)", bereich: "bereichsübergreifend", praefix: J("RE"), stellen: 3 },
  { schluessel: "verbindlichkeit", typ: "Verbindlichkeit", bereich: "bereichsübergreifend", praefix: J("VB"), stellen: 3 },
  { schluessel: "zahlungseingang", typ: "Zahlungseingang", bereich: "bereichsübergreifend", praefix: F("ZE"), stellen: 3 },
  { schluessel: "auszahlung", typ: "Auszahlung", bereich: "bereichsübergreifend", praefix: F("AZ"), stellen: 3 },
];

export type NummernSchluessel = (typeof NUMMERNKREISE)[number]["schluessel"];

type MitId = { id?: ID; nr?: string; nummer?: string; referenz?: string; quelle?: string; rechnungNr?: string; verbindlichkeitNr?: string; projektId?: ID; akquiseId?: ID };

/** Alle vergebenen IDs, Belegnummern und Referenzen (Listen beliebiger Datensätze) */
export function vergebeneIds(listen: readonly (readonly unknown[])[]): string[] {
  const ids = new Set<string>();
  for (const liste of listen) {
    for (const x of liste as MitId[]) {
      for (const v of [x.id, x.nr, x.nummer, x.referenz, x.quelle, x.rechnungNr, x.verbindlichkeitNr, x.projektId, x.akquiseId]) if (v) ids.add(v);
    }
  }
  return [...ids];
}

/** Nächste freie Nummer eines Nummernkreises über alle vergebenen IDs */
export function naechsteFreieNummer(schluessel: NummernSchluessel, vergeben: readonly string[], heute: string) {
  const k = NUMMERNKREISE.find((n) => n.schluessel === schluessel);
  if (!k) throw new Error(`Unbekannter Nummernkreis: ${schluessel}`);
  return naechsteNummer(k.praefix(heute.slice(0, 4)), [...vergeben], k.stellen);
}
