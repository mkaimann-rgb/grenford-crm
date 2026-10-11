import assert from "node:assert/strict";
import { test } from "node:test";
import { achse, dashboardDaten, type DashboardQuelle } from "./dashboard.ts";
import { finanzKennzahlen, forderungZeilen } from "../finanzen/buchung.ts";
import * as td from "./testdata.ts";
import * as tm from "./testdata-module.ts";
import * as fin from "../testdata/finanzen.ts";

const quelle: DashboardQuelle = {
  ...tm,
  heute: fin.STICHTAG,
  forderungen: fin.forderungen.map((f) => ({ ...f, ...(tm.FORDERUNG_ZUORDNUNG[f.nr] ?? {}) })),
  zahlungseingaenge: fin.zahlungseingaenge,
  verbindlichkeiten: fin.verbindlichkeiten.map((v) => ({ ...v, ...(tm.VERBINDLICHKEIT_ZUORDNUNG[v.nr] ?? {}) })),
  auszahlungen: fin.auszahlungen,
  objekte: tm.objekte,
  aktivitaeten: [...td.aktivitaeten, ...tm.aktivitaetenModule],
  benutzer: td.benutzer,
};
const d = dashboardDaten(quelle);
const summe = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

test("Offene Forderungen im Dashboard = Finanzmodul (keine festen Werte)", () => {
  const k = finanzKennzahlen(quelle, tm.provisionen, fin.STICHTAG);
  assert.equal(d.kpis.offeneForderungen.value, k.offeneForderungen.summe);
  assert.equal(d.kpis.offeneForderungen.value, 640_000);
  assert.equal(summe(d.belege.forderungen.map((b) => b.betrag)), k.offeneForderungen.summe);
  assert.equal(d.belege.forderungen.length, k.offeneForderungen.anzahl);
});

test("Umsatz YTD = gebuchte Zahlungseingänge des Jahres bis zum Stichtag", () => {
  const erwartet = summe(fin.zahlungseingaenge.filter((z) => z.datum.startsWith("2026") && z.datum <= fin.STICHTAG).map((z) => z.betrag));
  assert.equal(d.kpis.umsatzYtd.value, erwartet);
  assert.equal(summe(d.kpis.umsatzYtd.trend), erwartet);
});

test("Ohne Vorjahresdaten kein erfundener Vorjahresvergleich", () => {
  assert.equal(d.kpis.umsatzYtd.deltaPct, null);
  assert.equal(d.kpis.offeneForderungen.deltaPct, null);
  assert.equal(d.kpis.pipeline.deltaPct, null);
});

test("Aktive Vorgänge = Summe der aktiven Fachvorgänge je Bereich", () => {
  const a = d.kpis.aktiveVorgaenge;
  assert.equal(a.value, a.split.investment + a.split.property + a.split.projects);
  assert.equal(a.split.investment, tm.investmentProjekte.filter((p) => p.status === "Aktiv" || p.status === "In Prüfung").length);
});

test("Pipeline (gewichtet) > 0 und Trend endet beim aktuellen Wert", () => {
  assert.ok(d.kpis.pipeline.value > 0);
  assert.equal(d.kpis.pipeline.trend.at(-1), d.kpis.pipeline.value);
});

test("Umsatzchart: keine geplanten Zahlungen als Ein-/Ausgang, Forecast nur aus offenen Forderungen", () => {
  const okt = d.umsatzentwicklung[9];
  assert.equal(d.aktuellerMonat, "Okt");
  assert.equal(okt.forecast, okt.eingang);
  for (const m of d.umsatzentwicklung.slice(10)) {
    assert.equal(m.eingang, undefined);
    assert.equal(m.ausgang, undefined);
  }
  const offenNovDez = forderungZeilen(quelle, fin.STICHTAG).filter((x) => x.rest > 0 && x.status !== "Überfällig" && (x.faellig.startsWith("2026-11") || x.faellig.startsWith("2026-12")));
  assert.equal(summe(d.umsatzentwicklung.slice(10).map((m) => m.forecast ?? 0)) * 1000, Math.round(summe(offenNovDez.map((x) => x.rest)) / 1000) * 1000);
  assert.ok(d.umsatzAchse.max >= Math.max(...d.umsatzentwicklung.map((m) => Math.max(m.eingang ?? 0, m.ausgang ?? 0, m.forecast ?? 0))));
});

test("Provisionen nach Bereich: offen je Bereich ergibt Gesamt offen", () => {
  assert.equal(Math.round(summe(d.provisionen.map((p) => p.offen)) * 100), Math.round(640_000 / 10_000));
});

test("Termine und Aufgaben aus den zentralen Aktivitäten", () => {
  assert.ok(d.termine.every((t, i, a) => i === 0 || `${a[i - 1].tag}${a[i - 1].zeit}` <= `${t.tag}${t.zeit}` || a[i - 1].tag > t.tag));
  assert.ok(d.aufgaben.length > 0 && d.aufgaben.length <= 5);
  assert.ok(d.letzteAktivitaeten.length > 0);
});

test("Achsen-Skalierung", () => {
  assert.deepEqual(achse(380), { max: 400, ticks: [0, 100, 200, 300, 400] });
  assert.equal(achse(1.3).max, 2);
  assert.equal(achse(0).max, 1);
});
