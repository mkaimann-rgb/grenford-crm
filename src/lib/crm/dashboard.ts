/**
 * Dashboard-Kennzahlen – ausschließlich aus der zentralen Datenbasis (Store / später Datenbank)
 * berechnet, mit denselben Regeln wie die Fach- und Finanzmodule. Reine Funktionen, getestet in dashboard.test.mts.
 *
 * Definitionen (dokumentiert in docs/UMSETZUNGSPLAN.md, Abschnitt „Dashboard“):
 *  - Umsatz YTD (bezahlt): gebuchte Zahlungseingänge im laufenden Jahr bis zum Stichtag.
 *  - Offene Forderungen: Summe der offenen Restbeträge aller Rechnungen (wie Finanzen → Forderungen).
 *  - Pipeline (gewichtet): erwartete GRENFORD-Provision aktiver Vorgänge × Wahrscheinlichkeit.
 *  - Aktive Vorgänge: aktive Investment-Projekte, Property-Mandate und Projects-Projekte.
 *  - „vs. Vorjahr“ nur, wenn Vorjahreswerte in den Daten vorhanden sind – sonst null (Anzeige „k. A.“).
 *  - Geplante Zahlungen erscheinen nie als Ein-/Ausgang; künftige Monate zeigen nur den Forecast offener Forderungen.
 */
import type { Aktivitaet, Benutzer, ID, Objekt } from "./types.ts";
import {
  PHASEN_INVESTMENT, PHASEN_PROJECTS, PHASEN_PROPERTY, erwarteteCourtage, gewichtet, phaseTitel, projectsVerguetung,
  vorgangsWahrscheinlichkeit, type FinanzDaten, type Provision,
} from "./module.ts";
import { fortschritt, type ModulDaten } from "./projektion.ts";
import { forderungZeilen, verbindlichkeitZeilen } from "../finanzen/buchung.ts";

export type DashboardQuelle = ModulDaten & FinanzDaten & {
  heute: string;
  objekte: Objekt[];
  provisionen: Provision[];
  aktivitaeten: Aktivitaet[];
  benutzer: Benutzer[];
};

export type TrendKpi = { label: string; value: number; deltaPct: number | null; trend: number[] };
export type TopEntry = { id: string; name: string; ort: string; phase?: string; volumenMio: number; fortschritt: number; bild: string; href: string };
export type BelegStatus = "Überfällig" | "Offen" | "Entwurf" | "Fällig" | "Bezahlt";
export type Beleg = { nr: string; partei: string; betrag: number; faellig: string; status: BelegStatus };
export type TerminArt = "video" | "ort" | "person" | "telefon";
export type AktivitaetArt = "email" | "termin" | "dokument" | "telefon";

const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const summe = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const datumDe = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
const monatsende = (jahr: string, m: number) => new Date(Date.UTC(Number(jahr), m + 1, 0)).toISOString().slice(0, 10);
const vorjahr = (iso: string) => `${Number(iso.slice(0, 4)) - 1}${iso.slice(4)}`;
/** Veränderung in %, nur wenn ein Vorjahreswert existiert */
const delta = (jetzt: number, vorher: number) => (vorher > 0 ? Math.round(((jetzt - vorher) / vorher) * 100) : null);

/** Gut lesbare Achsen-Obergrenze (z. B. 380 → 400, 1,3 → 1,5) mit 4 gleichen Schritten */
export function achse(max: number) {
  if (!(max > 0)) return { max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] };
  const roh = max / 4;
  const p = 10 ** Math.floor(Math.log10(roh));
  const schritt = [1, 1.25, 2, 2.5, 5, 10].map((f) => f * p).find((s) => s >= roh)!;
  return { max: schritt * 4, ticks: [0, 1, 2, 3, 4].map((i) => Math.round(i * schritt * 1e6) / 1e6) };
}

// ---------- aktive Vorgänge und Pipeline (Regeln wie in den Modullisten) ----------

export const investAktiv = (s: string) => s === "Aktiv" || s === "In Prüfung";
export const propAktiv = (s: string) => !["Abgeschlossen", "Inaktiv"].includes(s);
export const projAktiv = (s: string) => s === "Aktiv";

/** Gewichtete erwartete GRENFORD-Provision je aktivem Vorgang (Grundlage KPI „Pipeline“) */
export function pipelinePosten(d: DashboardQuelle) {
  const posten: { id: string; bereich: "Investment" | "Property" | "Projects"; erstellt: string; wert: number }[] = [];
  for (const a of d.akquise) {
    if (a.status !== "Aktiv") continue; // Übernommene leben im Fachvorgang weiter
    posten.push({ id: a.id, bereich: a.bereich, erstellt: a.erstelltAm, wert: gewichtet(Math.round((a.courtageNetto * a.eigenerAnteil) / 100), a.wahrscheinlichkeit) });
  }
  for (const p of d.investmentProjekte.filter((x) => investAktiv(x.status))) {
    posten.push({ id: p.id, bereich: "Investment", erstellt: p.erstelltAm, wert: gewichtet(erwarteteCourtage(p), vorgangsWahrscheinlichkeit(p, d.kaeuferprozesse)) });
  }
  for (const m of d.propertyMandate.filter((x) => propAktiv(x.status))) {
    posten.push({ id: m.id, bereich: "Property", erstellt: m.erstelltAm, wert: gewichtet(Math.round((m.preis * m.courtageSatz) / 100), vorgangsWahrscheinlichkeit(m, d.kaeuferprozesse)) });
  }
  for (const p of d.projectsProjekte.filter((x) => projAktiv(x.status))) {
    // Projects: ohne Käuferprozesse – vergeben = 100 %, sonst Fortschritt der Projektphase
    const w = p.vergabe ? 100 : fortschritt(PHASEN_PROJECTS, p.phase);
    posten.push({ id: p.id, bereich: "Projects", erstellt: p.erstelltAm, wert: gewichtet(projectsVerguetung(p.vergabe?.vergabesumme ?? p.budget, p.verguetungSatz), w) });
  }
  return posten;
}

// ---------- Hauptfunktion ----------

/**
 * @param name     Anzeigename eines Stammsatzes (Person/Unternehmen)
 * @param behalten Aufgaben, die gerade auf dem Dashboard abgehakt wurden – bleiben durchgestrichen sichtbar
 */
export function dashboardDaten(d: DashboardQuelle, name: (r: { art: "person" | "unternehmen"; id: ID }) => string = (r) => r.id, behalten: ID[] = []) {
  const heute = d.heute;
  const jahr = heute.slice(0, 4);
  const aktM = Number(heute.slice(5, 7)) - 1;
  const fz = forderungZeilen(d, heute);
  const vz = verbindlichkeitZeilen(d, heute);
  const fNach = new Map(d.forderungen.map((f) => [f.nr, f]));
  const imMonat = (iso: string, m: number) => iso.startsWith(`${jahr}-${String(m + 1).padStart(2, "0")}`);
  const ein = d.zahlungseingaenge.filter((z) => z.datum <= heute);
  const aus = d.auszahlungen.filter((z) => z.datum <= heute);

  // KPI Umsatz YTD
  const umsatzYtd = summe(ein.filter((z) => z.datum.startsWith(jahr)).map((z) => z.betrag));
  const umsatzVj = summe(d.zahlungseingaenge.filter((z) => z.datum.startsWith(String(Number(jahr) - 1)) && z.datum <= vorjahr(heute)).map((z) => z.betrag));
  const umsatzTrend = MONATE.slice(0, aktM + 1).map((_, m) => summe(ein.filter((z) => imMonat(z.datum, m)).map((z) => z.betrag)));

  // KPI Offene Forderungen (Rest, wie Finanzen → Forderungen)
  const offen = summe(fz.filter((x) => x.rest > 0).map((x) => x.rest));
  const offenAm = (stichtag: string) =>
    summe(forderungZeilen({ ...d, forderungen: d.forderungen.filter((f) => (f.datum ?? f.faellig) <= stichtag) }, stichtag).map((x) => x.rest));
  const offenTrend = MONATE.slice(0, aktM + 1).map((_, m) => offenAm(m === aktM ? heute : monatsende(jahr, m)));

  // KPI Pipeline (gewichtet)
  const posten = pipelinePosten(d);
  const pipeline = summe(posten.map((p) => p.wert));
  const pipelineTrend = MONATE.slice(0, aktM + 1).map((_, m) => summe(posten.filter((p) => p.erstellt <= monatsende(jahr, m)).map((p) => p.wert)));

  // KPI Aktive Vorgänge
  const split = {
    investment: d.investmentProjekte.filter((p) => investAktiv(p.status)).length,
    property: d.propertyMandate.filter((m) => propAktiv(m.status)).length,
    projects: d.projectsProjekte.filter((p) => projAktiv(p.status)).length,
  };

  // Umsatzentwicklung (Tsd. €): Ist bis zum aktuellen Monat, danach nur Forecast offener, noch nicht überfälliger Forderungen
  const tsd = (x: number) => Math.round(x / 1000);
  const umsatzentwicklung = MONATE.map((monat, m) => {
    if (m < aktM) return { monat, eingang: tsd(summe(ein.filter((z) => imMonat(z.datum, m)).map((z) => z.betrag))), ausgang: tsd(summe(aus.filter((z) => imMonat(z.datum, m)).map((z) => z.betrag))) };
    if (m === aktM) {
      const e = tsd(summe(ein.filter((z) => imMonat(z.datum, m)).map((z) => z.betrag)));
      return { monat, eingang: e, ausgang: tsd(summe(aus.filter((z) => imMonat(z.datum, m)).map((z) => z.betrag))), forecast: e };
    }
    return { monat, forecast: tsd(summe(fz.filter((x) => x.rest > 0 && x.status !== "Überfällig" && imMonat(x.faellig, m)).map((x) => x.rest))) };
  }) as { monat: string; eingang?: number; ausgang?: number; forecast?: number }[];
  const umsatzAchse = achse(Math.max(...umsatzentwicklung.flatMap((r) => [r.eingang ?? 0, r.ausgang ?? 0, r.forecast ?? 0])));

  // Provisionen nach Geschäftsbereich (Mio. €): bezahlt (Jahr), offen (Rest), erwartet (Ansprüche „Erwartet“)
  const mio = (x: number) => Math.round(x / 10_000) / 100;
  const provisionen = (["Investment", "Property", "Projects"] as const).map((bereich) => ({
    bereich,
    bezahlt: mio(summe(ein.filter((z) => z.datum.startsWith(jahr) && fNach.get(z.rechnungNr)?.bereich === bereich).map((z) => z.betrag))),
    offen: mio(summe(fz.filter((x) => x.bereich === bereich && x.rest > 0).map((x) => x.rest))),
    erwartet: mio(summe(d.provisionen.filter((p) => p.bereich === bereich && p.status === "Erwartet").map((p) => p.betrag))),
  }));
  const provAchse = achse(Math.max(...provisionen.flatMap((p) => [p.bezahlt, p.offen, p.erwartet])));

  // Top-Listen
  const bildVon = (objektId: string | undefined, fallback: string) => d.objekte.find((o) => o.id === objektId)?.bild ?? fallback;
  const objekt = (id?: string) => d.objekte.find((o) => o.id === id);
  const top = {
    investment: d.investmentProjekte.filter((p) => investAktiv(p.status)).sort((a, b) => b.volumen - a.volumen).slice(0, 3).map((p, i): TopEntry => ({
      id: p.id, name: p.titel, ort: p.standort, phase: phaseTitel(PHASEN_INVESTMENT, p.phase), volumenMio: Math.round(p.volumen / 1e4) / 100,
      fortschritt: fortschritt(PHASEN_INVESTMENT, p.phase), bild: bildVon(p.objektId, `/testbilder/inv-${i + 1}.jpg`), href: `/investment/projekte/${p.id}`,
    })),
    property: d.propertyMandate.filter((m) => propAktiv(m.status)).sort((a, b) => b.preis - a.preis).slice(0, 3).map((m, i): TopEntry => ({
      id: m.id, name: objekt(m.objektId)?.titel ?? m.id, ort: objekt(m.objektId)?.ort ?? "", phase: phaseTitel(PHASEN_PROPERTY, m.phase), volumenMio: Math.round(m.preis / 1e4) / 100,
      fortschritt: fortschritt(PHASEN_PROPERTY, m.phase), bild: bildVon(m.objektId, `/testbilder/prop-${i + 1}.jpg`), href: `/property/objekte/${m.id}`,
    })),
    projects: d.projectsProjekte.filter((p) => projAktiv(p.status)).sort((a, b) => b.budget - a.budget).slice(0, 3).map((p, i): TopEntry => ({
      id: p.id, name: p.titel, ort: objekt(p.objektId)?.ort ?? "", phase: phaseTitel(PHASEN_PROJECTS, p.phase), volumenMio: Math.round(p.budget / 1e4) / 100,
      fortschritt: fortschritt(PHASEN_PROJECTS, p.phase), bild: bildVon(p.objektId, `/testbilder/proj-${i + 1}.jpg`), href: `/projects/projekte/${p.id}`,
    })),
  };

  // Hervorgehobene Vorgänge: jeweils der größte aktive Vorgang je Bereich
  const naechster = (id: string) =>
    d.investmentProjekte.find((x) => x.id === id)?.naechsterSchritt ?? d.propertyMandate.find((x) => x.id === id)?.naechsterSchritt ?? d.projectsProjekte.find((x) => x.id === id)?.naechsterSchritt ?? "";
  const hervorgehoben = [top.investment[0], top.property[0], top.projects[0]].filter(Boolean).map((e) => ({
    id: e.id, name: e.name, ort: e.ort, naechsterSchritt: naechster(e.id) || (e.phase ?? ""), fortschritt: e.fortschritt, bild: e.bild, href: e.href,
  }));

  // Belege
  const forderungen: Beleg[] = fz.filter((x) => x.rest > 0).sort((a, b) => a.faellig.localeCompare(b.faellig)).map((x) => ({
    nr: x.nr, partei: x.kunde, betrag: x.rest, faellig: datumDe(x.faellig), status: x.status === "Überfällig" ? "Überfällig" : "Offen",
  }));
  const verbindlichkeiten: Beleg[] = vz.filter((x) => x.rest > 0).sort((a, b) => a.faellig.localeCompare(b.faellig)).map((x) => ({
    nr: x.nr, partei: x.empfaenger, betrag: x.rest, faellig: datumDe(x.faellig), status: x.tageBisFaellig < 0 ? "Überfällig" : x.tageBisFaellig <= 7 ? "Fällig" : "Offen",
  }));
  const letzteZahlung = (nr: string) => ein.filter((z) => z.rechnungNr === nr).map((z) => z.datum).sort().pop() ?? "";
  const bezahlt: Beleg[] = fz.filter((x) => x.rest <= 0).sort((a, b) => letzteZahlung(b.nr).localeCompare(letzteZahlung(a.nr))).map((x) => ({
    nr: x.nr, partei: x.kunde, betrag: x.betrag, faellig: datumDe(x.faellig), status: "Bezahlt",
  }));

  // Termine, Aufgaben, letzte Aktivitäten (gleiche Aktivitäten wie im Modul Aktivitäten)
  const bezugName = (a: Aktivitaet) => {
    const b = a.bezug.find((x) => x.art !== "vorgang");
    return a.kontext ?? (b ? name(b as { art: "person" | "unternehmen"; id: ID }) : "");
  };
  const artTermin: Record<string, TerminArt> = { video: "video", "vor-ort": "ort", persoenlich: "person", telefon: "telefon" };
  const termine = d.aktivitaeten
    .filter((a) => a.typ === "Termin" && !a.erledigt && a.datum >= heute)
    .sort((a, b) => `${a.datum}${a.von ?? ""}`.localeCompare(`${b.datum}${b.von ?? ""}`))
    .slice(0, 5)
    .map((a) => ({ id: a.id, tag: a.datum.slice(8, 10), wochentag: WOCHENTAGE[new Date(`${a.datum}T12:00:00Z`).getUTCDay()], zeit: a.von ?? "", titel: a.titel, detail: bezugName(a), art: artTermin[a.terminArt ?? "persoenlich"] ?? "person" }));
  const aufgaben = d.aktivitaeten
    .filter((a) => a.typ === "Aufgabe" && (!a.erledigt || behalten.includes(a.id)))
    .sort((a, b) => `${a.datum}${a.von ?? ""}`.localeCompare(`${b.datum}${b.von ?? ""}`))
    .slice(0, 5)
    .map((a) => ({ id: a.id, titel: a.titel, faellig: a.datum === heute ? "Heute" : datumDe(a.datum), heute: a.datum <= heute, erledigt: a.erledigt }));
  const gestern = new Date(Date.parse(`${heute}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const zeitText = (a: Aktivitaet) => `${a.datum === heute ? "Heute" : a.datum === gestern ? "Gestern" : datumDe(a.datum)}${a.von ? `, ${a.von}` : ""}`;
  const artAkt: Record<string, AktivitaetArt> = { "E-Mail": "email", Termin: "termin", Aufgabe: "termin", Notiz: "dokument", Telefon: "telefon" };
  const kuerzel = (id: ID) => d.benutzer.find((b) => b.id === id)?.kuerzel ?? "";
  const letzteAktivitaeten = d.aktivitaeten
    .filter((a) => a.datum <= heute && (a.erledigt || a.typ === "E-Mail" || a.typ === "Telefon" || a.typ === "Notiz"))
    .sort((a, b) => `${b.datum}${b.von ?? ""}`.localeCompare(`${a.datum}${a.von ?? ""}`))
    .slice(0, 4)
    .map((a) => ({ id: a.id, art: artAkt[a.typ] ?? "termin", titel: a.typ, text: a.titel, zeit: zeitText(a), von: kuerzel(a.verantwortlichId) }));

  return {
    kpis: {
      umsatzYtd: { label: "Umsatz YTD (bezahlt)", value: umsatzYtd, deltaPct: delta(umsatzYtd, umsatzVj), trend: umsatzTrend } as TrendKpi,
      offeneForderungen: { label: "Offene Forderungen", value: offen, deltaPct: delta(offen, offenAm(vorjahr(heute))), trend: offenTrend } as TrendKpi,
      pipeline: { label: "Pipeline (gewichtet)", value: pipeline, deltaPct: null, trend: pipelineTrend } as TrendKpi,
      aktiveVorgaenge: { label: "Aktive Vorgänge", value: split.investment + split.property + split.projects, split },
    },
    umsatzentwicklung,
    umsatzAchse,
    aktuellerMonat: MONATE[aktM],
    jahr,
    provisionen,
    provAchse,
    top,
    hervorgehoben,
    belege: { forderungen, verbindlichkeiten, bezahlt },
    termine,
    aufgaben,
    letzteAktivitaeten,
  };
}

export type DashboardDaten = ReturnType<typeof dashboardDaten>;
