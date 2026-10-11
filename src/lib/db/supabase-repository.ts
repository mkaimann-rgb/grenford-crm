/**
 * Supabase-Anbindung – VORBEREITET, NICHT VERBUNDEN.
 *
 * Es sind keine Zugangsdaten hinterlegt und es wird keine Verbindung aufgebaut.
 * Benötigt nach Freigabe durch GRENFORD (nur als Umgebungsvariablen in Vercel, nie im Quellcode):
 *   NEXT_PUBLIC_SUPABASE_URL       – Projekt-URL (Region EU)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  – öffentlicher Schlüssel; Schutz erfolgt über Row Level Security
 *   SUPABASE_SERVICE_ROLE_KEY      – nur serverseitig, nur für Migrationen/Import
 * Schema: supabase/migrations/0001_init.sql · Regeltests: supabase/tests/regeln.sql
 *
 * Verbleibende Schritte bis zur Inbetriebnahme: siehe docs/ABSCHLUSSBERICHT.md, Abschnitt „Produktivsetzung“.
 */
import type { CrmRepository } from "../crm/repository";

export const SUPABASE_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

/** Tabellenzuordnung Oberfläche → Datenbank (Grundlage für die spätere Implementierung) */
export const TABELLEN = {
  unternehmen: "unternehmen",
  personen: "personen",
  objekte: "objekte",
  vorhaben: "vorhaben",
  aktivitaeten: "aktivitaeten",
  akquise: "akquise",
  investmentProjekte: "investment_projekte",
  kaeuferprozesse: "kaeuferprozesse",
  ankaufsprofile: "ankaufsprofile",
  suchauftraege: "suchauftraege",
  propertyMandate: "property_mandate",
  interessenten: "interessenten",
  projectsMandate: "projects_mandate",
  projectsProjekte: "projects_projekte",
  angebote: "angebote",
  guPartner: "gu_partner",
  empfehlungspartner: "empfehlungspartner",
  empfehlungen: "empfehlungen",
  provisionsbeteiligungen: "provisionsbeteiligungen",
  provisionen: "provisionen",
  forderungen: "forderungen",
  zahlungseingaenge: "zahlungseingaenge",
  verbindlichkeiten: "verbindlichkeiten",
  auszahlungen: "auszahlungen",
  dokumente: "dokumente",
  verlauf: "verlauf",
} as const;

export type SupabaseStatus = { konfiguriert: boolean; verbunden: false; hinweis: string };

/** Nur Prüfung, ob Umgebungsvariablen gesetzt sind – baut keine Verbindung auf. */
export function supabaseStatus(env: Record<string, string | undefined> = process.env): SupabaseStatus {
  const konfiguriert = SUPABASE_ENV.every((k) => !!env[k]);
  return {
    konfiguriert,
    verbunden: false,
    hinweis: konfiguriert
      ? "Zugangsdaten gesetzt, Datenzugriff aber noch nicht implementiert/freigegeben."
      : "Nicht verbunden – keine Zugangsdaten hinterlegt (Freigabe durch GRENFORD erforderlich).",
  };
}

/**
 * Platzhalter: Wird bewusst nicht verwendet. Ein Aufruf schlägt sichtbar fehl,
 * damit nie unbemerkt eine Datenbankanbindung vorgetäuscht wird.
 */
export const supabaseRepository: CrmRepository = {
  dauerhaft: true,
  speicherort: "Supabase (nicht verbunden)",
  laden() {
    throw new Error("Supabase ist nicht verbunden. Bitte zuerst Projekt anlegen, Migration ausführen und Zugangsdaten hinterlegen.");
  },
};
