/**
 * Gemeinsames Datenmodell der Stammdaten (Phase A).
 *
 * Grundsätze:
 * - Ein Unternehmen und eine Person existieren jeweils nur einmal.
 * - Rollen (Ansprechpartner eines Unternehmens, Privatkunde, Sanierungskunde, …)
 *   hängen am selben Personendatensatz – keine Kopien.
 * - Vorhaben und Aktivitäten verweisen per ID auf Personen bzw. Unternehmen.
 * Die Struktur entspricht 1:1 den späteren Datenbanktabellen (Supabase).
 */

export type ID = string;

/** Die drei Geschäftsbereiche von GRENFORD */
export const GESCHAEFTSBEREICHE = ["Investment", "Property", "Projects"] as const;
export type Geschaeftsbereich = (typeof GESCHAEFTSBEREICHE)[number];

/**
 * Zuordnung eines Stammsatzes (Unternehmen oder Person) zu einem Geschäftsbereich.
 * Getrennt von Kundenrolle (Privat-/Sanierungskunde) und fachlicher Rolle (Entscheider, GU-Partner …).
 * „funktion“ beschreibt optional die Funktion in genau diesem Bereich (z. B. Investment: Investor, Property: Verkäufer).
 */
export type BereichsZuordnung = {
  bereich: Geschaeftsbereich;
  funktion: string;
  herkunft: "manuell" | "abgeleitet";
  /** Begründung bei abgeleiteten Zuordnungen (Nachvollziehbarkeit) */
  grund?: string;
};

export type Benutzer = { id: ID; name: string; kuerzel: string };

export const UNTERNEHMENSARTEN = [
  "Investor",
  "Projektentwickler",
  "Bestandshalter",
  "Family Office",
  "Generalunternehmer",
  "Vermögensverwalter",
  "Makler",
  "Finanzierer",
  "Küchenstudio",
  "Sonstige",
] as const;
export type Unternehmensart = (typeof UNTERNEHMENSARTEN)[number];

export const RECHTSFORMEN = ["AG", "GmbH", "GmbH & Co. KG", "KG", "UG", "GbR", "e.K.", "SE", "Sonstige"] as const;

export const KONTAKT_STATUS = ["Aktiv", "In Kontakt", "Potenzial", "Inaktiv"] as const;
export type KontaktStatus = (typeof KONTAKT_STATUS)[number];

export const QUELLEN = ["Empfehlung", "Netzwerk", "Website", "Messe / Event", "LinkedIn", "Kaltakquise", "Bestandskunde", "Sonstige"] as const;

export type Adresse = { strasse: string; plz: string; ort: string; land: string };

export type Unternehmen = Adresse & {
  id: ID;
  name: string;
  /** Mehrfachzuordnung zu Investment / Property / Projects */
  bereiche: BereichsZuordnung[];
  /** Gesetzt, wenn die Zuordnung nicht eindeutig ist und fachlich geprüft werden muss */
  bereichPruefen?: string;
  /** Erste Art = Haupttyp in Tabellen; weitere = zusätzliche Rollen */
  arten: Unternehmensart[];
  rechtsform: string;
  ustId: string;
  handelsregister: string;
  website: string;
  linkedin: string;
  telefon: string;
  email: string;
  beschreibung: string;
  labels: string[];
  status: KontaktStatus;
  betreuerId: ID;
  quelle: string;
  bild?: string;
  erstelltAm: string;
  /** Letzter Kontakt laut Altdaten; zusammen mit Aktivitäten ergibt sich „Letzte Aktivität“ */
  letzterKontakt: string;
};

export const KONTAKT_ROLLEN = [
  "Entscheider",
  "Projektkontakt",
  "Partner",
  "GU-Partner",
  "Investor",
  "Projektentwickler",
  "Empfehlungspartner",
  "Privatkunde",
] as const;
export type KontaktRolle = (typeof KONTAKT_ROLLEN)[number];

/** Verknüpfung Person ↔ Unternehmen (eine Person kann mehrere Firmen haben) */
export type Kontaktverknuepfung = {
  unternehmenId: ID;
  position: string;
  abteilung: string;
  rolle: KontaktRolle;
  /** Hauptansprechpartner des Unternehmens */
  haupt?: boolean;
  /** Vorstand / Geschäftsführung */
  leitung?: boolean;
};

export const PRIVAT_INTERESSEN = [
  "Kauf (Eigennutzung)",
  "Kauf (Kapitalanlage)",
  "Verkauf",
  "Sanierung / Modernisierung",
  "Neubau / Innenausbau",
  "Ferienimmobilie",
  "Beratung",
  "Suchauftrag",
  "Sonstige",
] as const;

export const SANIERUNG_INTERESSEN = [
  "Komplettsanierung",
  "Teilsanierung",
  "Bad / Sanitär",
  "Küche",
  "Innenausbau",
  "Dach",
  "Fassade / Dämmung",
  "Fenster / Türen",
  "Heizung",
  "Elektro",
  "Maler",
  "Neubau / Ausbau",
  "Umbau / Grundriss",
  "Sonstige",
] as const;

export const PRIVAT_STATUS = ["Aktiv", "In Kontakt", "Qualifiziert", "Suchauftrag", "Inaktiv"] as const;
export type PrivatStatus = (typeof PRIVAT_STATUS)[number];

export const SANIERUNG_STATUS = ["Aktiv", "In Planung", "Angebotsphase", "Qualifiziert", "In Kontakt", "Suchauftrag", "Abgeschlossen", "Inaktiv"] as const;
export type SanierungStatus = (typeof SANIERUNG_STATUS)[number];

export const PRIORITAETEN = ["Niedrig", "Normal", "Hoch"] as const;
export const ZEITRAHMEN = ["Sofort", "0–3 Monate", "3–6 Monate", "6–12 Monate", "> 12 Monate"] as const;

export type Kundenrolle<S extends string> = {
  status: S;
  seit: string;
  interessen: string[];
  regionen: string;
  zeitrahmen: string;
  prioritaet: string;
  budget?: number;
};

export type Person = Adresse & {
  id: ID;
  /** Mehrfachzuordnung zu Investment / Property / Projects */
  bereiche: BereichsZuordnung[];
  /** Gesetzt, wenn die Zuordnung nicht eindeutig ist und fachlich geprüft werden muss */
  bereichPruefen?: string;
  anrede: "Herr" | "Frau" | "Divers" | "";
  titel: string;
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  email: string;
  telefonMobil: string;
  telefonGeschaeftlich: string;
  linkedin: string;
  status: KontaktStatus;
  betreuerId: ID;
  quelle: string;
  favorit: boolean;
  erstelltAm: string;
  letzterKontakt: string;
  kontakte: Kontaktverknuepfung[];
  privat?: Kundenrolle<PrivatStatus>;
  sanierung?: Kundenrolle<SanierungStatus>;
};

export const VORHABEN_STATUS = ["Aktiv", "In Planung", "Angebotsphase", "Abgeschlossen", "Pausiert"] as const;
export type VorhabenStatus = (typeof VORHABEN_STATUS)[number];

/**
 * Objekt-Stammsatz (Immobilie / Liegenschaft). Existiert genau einmal –
 * mehrere Vorgänge (auch aus verschiedenen Geschäftsbereichen) verweisen per objektId darauf.
 * Später: gemeinsame Basis für Investment-Projekte, Property-Objekte und Projects-Projekte.
 */
export type Objekt = {
  id: ID;
  titel: string;
  ort: string;
  bild?: string;
  /** Hinweis bei möglicher Dublette o. Ä. – wird sichtbar gekennzeichnet, nie automatisch zusammengeführt */
  hinweis?: string;
  /** Sichtbare Objekt-ID, z. B. OPP-2026-003 */
  nummer?: string;
  adresse?: string;
  objektart?: string;
  einheiten?: number;
  /** Wohn- bzw. Nutzfläche in m² */
  wohnflaeche?: number;
  grundstueck?: number;
  baujahr?: number;
  zustand?: string;
};

/** Weitere Beteiligte an einem Vorgang, jeweils mit eigener Rolle */
export type Beteiligung = { art: "person" | "unternehmen"; id: ID; rolle: string };

/**
 * Fachlicher Vorgang („Vorhaben“) an einem Objekt – z. B. Kauf, Verkauf, Sanierung, Investment-Transaktion.
 * Drei getrennte Ebenen:
 *  - Geschäftsbereich des Kontakts  → Person.bereiche / Unternehmen.bereiche
 *  - Geschäftsbereich des Vorgangs  → geschaeftsbereich (genau einer je Vorgang)
 *  - Rolle des Kontakts im Vorgang  → rolle / unternehmenRolle / beteiligte[].rolle
 * Ein Objekt mit mehreren Bereichen hat je Bereich einen eigenen Vorgang.
 */
export type Vorhaben = {
  id: ID;
  /** Kunde (Person), sofern der Vorgang an einer Person hängt */
  personId?: ID;
  /** Kundenrolle, unter der der Vorgang beim Kunden geführt wird (nicht der Geschäftsbereich) */
  bereich?: "privat" | "sanierung";
  /** Vorgangsart, z. B. Kauf (Eigennutzung), Verkauf, Komplettsanierung, Investment-Transaktion */
  art: string;
  titel: string;
  ort: string;
  beschreibung: string;
  budget: number;
  status: VorhabenStatus;
  fortschritt: number;
  zeithorizont: string;
  bild?: string;
  /** Ausführendes oder beteiligtes Unternehmen (z. B. GU) */
  unternehmenId?: ID;
  /** Rolle dieses Unternehmens im Vorgang (z. B. GU-Partner, Bauherr) */
  unternehmenRolle?: string;
  geplanterStart?: string;
  geplanteFertigstellung?: string;
  /** Objekt-Stammsatz; leer = noch kein konkretes Objekt (z. B. Suchauftrag) */
  objektId?: ID;
  /** Geschäftsbereich dieses Vorgangs; null = nicht eindeutig → pruefen */
  geschaeftsbereich: Geschaeftsbereich | null;
  /** Rolle der Person (personId) in diesem Vorgang, z. B. Kaufinteressent, Verkäufer, Bauherr */
  rolle: string;
  beteiligte?: Beteiligung[];
  /** Verknüpfung zum Vorgang im Fachmodul, z. B. INV-2026-007, PROP-OPT-0011, PRO-2026-015 */
  referenz?: string;
  /** Nur Anzeige: Link zur Detailseite im Fachmodul (bei abgeleiteten Modul-Vorgängen) */
  href?: string;
  /** Begründung, falls Bereich oder Rolle nicht eindeutig sind */
  pruefen?: string;
  herkunft?: "manuell" | "abgeleitet";
  grund?: string;
};

export const AKTIVITAET_TYPEN = ["Termin", "Aufgabe", "E-Mail", "Telefon", "Notiz"] as const;
export type AktivitaetTyp = (typeof AKTIVITAET_TYPEN)[number];
export type TerminArt = "video" | "vor-ort" | "persoenlich" | "telefon";

/** Bezug einer Aktivität: Stammsatz oder fachlicher Vorgang (z. B. INV-2026-007, PRO-2026-001) */
export type Bezug = { art: "unternehmen" | "person" | "vorgang"; id: ID };

export type Aktivitaet = {
  id: ID;
  typ: AktivitaetTyp;
  titel: string;
  beschreibung: string;
  /** ISO-Datum JJJJ-MM-TT */
  datum: string;
  /** HH:MM (optional, für Termine/Aufgaben) */
  von?: string;
  bis?: string;
  terminArt?: TerminArt;
  bezug: Bezug[];
  /** Freitext-Bezug, z. B. Objekt oder Projekt, solange diese Module noch fehlen */
  kontext?: string;
  verantwortlichId: ID;
  erledigt: boolean;
};

export type AktivitaetStatus = "Heute" | "Geplant" | "Überfällig" | "Erledigt" | "Notiz";
