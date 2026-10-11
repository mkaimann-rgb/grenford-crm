/**
 * Buchungslogik der Finanzmodule (reine Funktionen, getestet in buchung.test.mts).
 *
 * Strikte Trennung:
 *  erwartete Provision → entstandener Provisionsanspruch → Rechnung (= Forderung)
 *  → tatsächlicher Zahlungseingang (auch Teilzahlungen) → offener Restbetrag / überfällig.
 *  Verbindlichkeit → tatsächliche Auszahlung (auch Teilzahlungen).
 * Geplante Zahlungen werden nie als bezahlt ausgewiesen: maßgeblich sind nur gebuchte Zahlungen bis zum Stichtag.
 */
import type { Auszahlung, Zahlungseingang } from "./logic.ts";
import type { FinanzDaten, ForderungCrm, Provision, VerbindlichkeitCrm } from "../crm/module.ts";

export type BelegStatus = "Offen" | "Teilzahlung" | "Bezahlt" | "Überfällig";

export function bezahlt(nr: string, zahlungen: (Zahlungseingang | Auszahlung)[], stichtag: string) {
  return zahlungen.reduce((s, z) => {
    const ref = "rechnungNr" in z ? z.rechnungNr : z.verbindlichkeitNr;
    return ref === nr && z.datum <= stichtag ? s + z.betrag : s;
  }, 0);
}

export function belegStatus(betrag: number, gezahlt: number, faellig: string, stichtag: string): BelegStatus {
  if (gezahlt >= betrag) return "Bezahlt";
  if (faellig < stichtag) return "Überfällig";
  return gezahlt > 0 ? "Teilzahlung" : "Offen";
}

export type ForderungZeile = ForderungCrm & { gezahlt: number; rest: number; status: BelegStatus; tageOffen: number };
export type VerbindlichkeitZeile = VerbindlichkeitCrm & { gezahlt: number; rest: number; status: BelegStatus; tageBisFaellig: number };

const tage = (von: string, bis: string) => Math.round((Date.parse(bis) - Date.parse(von)) / 86_400_000);

export function forderungZeilen(f: FinanzDaten, stichtag: string): ForderungZeile[] {
  return f.forderungen.map((x) => {
    const gezahlt = bezahlt(x.nr, f.zahlungseingaenge, stichtag);
    return { ...x, gezahlt, rest: Math.max(0, x.betrag - gezahlt), status: belegStatus(x.betrag, gezahlt, x.faellig, stichtag), tageOffen: Math.max(0, tage(x.faellig, stichtag)) };
  });
}

export function verbindlichkeitZeilen(f: FinanzDaten, stichtag: string): VerbindlichkeitZeile[] {
  return f.verbindlichkeiten.map((x) => {
    const gezahlt = bezahlt(x.nr, f.auszahlungen, stichtag);
    return { ...x, gezahlt, rest: Math.max(0, x.betrag - gezahlt), status: belegStatus(x.betrag, gezahlt, x.faellig, stichtag), tageBisFaellig: tage(stichtag, x.faellig) };
  });
}

/** Rechnung (Forderung) aus einem entstandenen Provisionsanspruch */
export function rechnungAusProvision(p: Provision, nr: string, datum: string, zahlungszielTage = 14): ForderungCrm {
  const faellig = new Date(Date.parse(datum) + zahlungszielTage * 86_400_000).toISOString().slice(0, 10);
  return { nr, kunde: p.zahler, bereich: p.bereich, betrag: p.betrag, faellig, referenz: p.referenz, kundeRef: p.zahlerRef, datum, provisionId: p.id, mahnstufe: 0 };
}

/** Prüfung einer Zahlung: positiv, nicht in der Zukunft, höchstens Restbetrag */
export function pruefeZahlung(betrag: number, rest: number, datum: string, stichtag: string): string | null {
  if (!(betrag > 0)) return "Bitte einen positiven Betrag angeben.";
  if (datum > stichtag) return "Geplante Zahlungen werden nicht gebucht – Datum liegt in der Zukunft.";
  if (betrag > rest) return `Betrag übersteigt den offenen Rest (${rest.toLocaleString("de-DE")} €).`;
  return null;
}

export function naechsteBelegNr(prefix: string, vorhanden: string[]) {
  const max = vorhanden.reduce((m, nr) => (nr.startsWith(prefix) ? Math.max(m, Number(nr.slice(prefix.length)) || 0) : m), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

/** Kennzahlen der Finanzübersicht – ausschließlich aus Einzelbuchungen berechnet */
export function finanzKennzahlen(f: FinanzDaten, provisionen: Provision[], stichtag: string, jahr = stichtag.slice(0, 4)) {
  const fz = forderungZeilen(f, stichtag);
  const vz = verbindlichkeitZeilen(f, stichtag);
  const imJahr = (d?: string) => !!d && d.startsWith(jahr);
  const summe = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const offen = fz.filter((x) => x.rest > 0);
  const ueber = offen.filter((x) => x.status === "Überfällig");
  const vOffen = vz.filter((x) => x.rest > 0);
  return {
    provisionenErwartet: summe(provisionen.filter((p) => p.status === "Erwartet").map((p) => p.betrag)),
    provisionenEntstanden: summe(provisionen.filter((p) => p.status !== "Erwartet").map((p) => p.betrag)),
    rechnungenJahr: summe(f.forderungen.filter((x) => imJahr(x.datum ?? x.faellig)).map((x) => x.betrag)),
    eingangJahr: summe(f.zahlungseingaenge.filter((z) => imJahr(z.datum) && z.datum <= stichtag).map((z) => z.betrag)),
    auszahlungJahr: summe(f.auszahlungen.filter((z) => imJahr(z.datum) && z.datum <= stichtag).map((z) => z.betrag)),
    offeneForderungen: { summe: summe(offen.map((x) => x.rest)), anzahl: offen.length },
    ueberfaellig: { summe: summe(ueber.map((x) => x.rest)), anzahl: ueber.length },
    nichtUeberfaellig: { summe: summe(offen.filter((x) => x.status !== "Überfällig").map((x) => x.rest)), anzahl: offen.filter((x) => x.status !== "Überfällig").length },
    offeneVerbindlichkeiten: { summe: summe(vOffen.map((x) => x.rest)), anzahl: vOffen.length },
    faelligeVerbindlichkeiten: { summe: summe(vOffen.filter((x) => x.tageBisFaellig <= 0).map((x) => x.rest)), anzahl: vOffen.filter((x) => x.tageBisFaellig <= 0).length },
    mahnstufen: [1, 2, 3].map((m) => ({ stufe: m, summe: summe(ueber.filter((x) => (x.mahnstufe ?? 0) === m).map((x) => x.rest)), anzahl: ueber.filter((x) => (x.mahnstufe ?? 0) === m).length })),
  };
}
