/**
 * Google Workspace (Gmail, Calendar, Drive) – VORBEREITET, NICHT VERBUNDEN.
 *
 * Es wird KEINE Integration simuliert. Solange kein OAuth-Client freigegeben ist,
 * liefern alle Funktionen den Status „nicht verbunden“; Senden/Einladen ist gesperrt.
 *
 * Regeln für die spätere Umsetzung (verbindlich):
 *  - E-Mails werden ausschließlich nach ausdrücklicher Bestätigung im Dialog versendet
 *    (Entwurf → Vorschau → „Jetzt senden“). Kein automatischer Versand.
 *  - Kalendereinladungen an Dritte nur nach ausdrücklicher Bestätigung; Standard ist
 *    ein Termin im eigenen Kalender ohne Teilnehmer-Benachrichtigung (sendUpdates = "none").
 *  - Drive: Ablage je Vorgang in einem Ordner (Vorgangs-ID), nur Lesen/Hochladen, kein Löschen.
 *
 * Benötigt (nur als Umgebungsvariablen, nie im Quellcode):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
 *   Scopes: openid email profile, gmail.send + gmail.readonly, calendar.events, drive.file
 *   Domain-Einschränkung: hd=grenford.de
 */

export type IntegrationStatus = "aktiv" | "vorbereitet" | "nicht verbunden";

export type Integration = {
  id: "google-auth" | "gmail" | "calendar" | "drive" | "supabase" | "vercel";
  name: string;
  status: IntegrationStatus;
  beschreibung: string;
  benoetigt: string[];
};

export const GOOGLE_ENV = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"] as const;

export const GOOGLE_INTEGRATIONEN: Integration[] = [
  { id: "google-auth", name: "Google-Anmeldung (grenford.de)", status: "nicht verbunden", beschreibung: "Anmeldung nur mit GRENFORD-Google-Konto.", benoetigt: ["OAuth-Client in Google Cloud", ...GOOGLE_ENV] },
  { id: "gmail", name: "Gmail", status: "nicht verbunden", beschreibung: "E-Mails je Vorgang protokollieren; Versand nur nach ausdrücklicher Bestätigung.", benoetigt: ["Scope gmail.send / gmail.readonly", "Freigabe durch GRENFORD"] },
  { id: "calendar", name: "Google Calendar", status: "nicht verbunden", beschreibung: "Termine aus dem CRM im eigenen Kalender; keine ungefragten Einladungen.", benoetigt: ["Scope calendar.events", "Freigabe durch GRENFORD"] },
  { id: "drive", name: "Google Drive", status: "nicht verbunden", beschreibung: "Dokumentenablage je Vorgang.", benoetigt: ["Scope drive.file", "Ordnerstruktur festlegen"] },
];

/** Darf eine E-Mail gesendet werden? Nur bei aktiver Verbindung UND ausdrücklicher Bestätigung. */
export function darfSenden(status: IntegrationStatus, bestaetigt: boolean): boolean {
  return status === "aktiv" && bestaetigt === true;
}
