import assert from "node:assert/strict";
import { test } from "node:test";
import {
  auszahlungZeilen,
  balkenReihe,
  eingangZeilen,
  filterKennzahlen,
  filterTabelle,
  forderungsbestand,
  kumulierteReihe,
  LEERER_FILTER,
  summe,
  toCsv,
  zahlStatus,
  zeitraeume,
} from "./logic.ts";
import * as td from "../testdata/finanzen.ts";

const jahr = zeitraeume(td.STICHTAG)[0];
const ein = eingangZeilen(td.forderungen, td.zahlungseingaenge, td.STICHTAG);
const aus = auszahlungZeilen(td.verbindlichkeiten, td.auszahlungen, td.STICHTAG);

test("Status: vollständig, teilweise und überfällig", () => {
  assert.equal(zahlStatus(100, 100, "2026-01-01", "2026-10-10"), "Bezahlt");
  assert.equal(zahlStatus(100, 40, "2026-10-31", "2026-10-10"), "Teilzahlung");
  assert.equal(zahlStatus(100, 40, "2026-09-30", "2026-10-10"), "Rest überfällig");
});

test("Zahlungen nach dem Stichtag zählen nicht als eingegangen", () => {
  const f = [{ nr: "R1", kunde: "A", bereich: "Investment" as const, betrag: 100, faellig: "2026-12-31" }];
  const z = [
    { id: "1", datum: "2026-10-01", rechnungNr: "R1", betrag: 40 },
    { id: "2", datum: "2026-10-20", rechnungNr: "R1", betrag: 60 },
  ];
  const rows = eingangZeilen(f, z, "2026-10-10");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, "Teilzahlung");
  assert.equal(forderungsbestand(f, z, "2026-10-10").offen.summe, 60);
});

test("Rechnungen ohne Zahlung erscheinen nicht als Eingang", () => {
  const nrs = new Set(ein.map((r) => r.rechnungNr));
  for (const nr of ["RE-2026-018", "RE-2026-019", "RE-2026-020"]) assert.ok(!nrs.has(nr));
  assert.ok(!aus.some((r) => r.verbindlichkeitNr === "VB-2026-016"));
});

test("Kennzahlen der Testdaten passen zu den Tabellen", () => {
  assert.equal(ein.length, 21);
  assert.equal(summe(ein), 2_428_500);
  assert.equal(aus.length, 18);
  assert.equal(summe(aus), 766_950);
  const b = forderungsbestand(td.forderungen, td.zahlungseingaenge, td.STICHTAG);
  assert.deepEqual(b.offen, { summe: 480_000, anzahl: 4 });
  assert.deepEqual(b.ueberfaellig, { summe: 160_000, anzahl: 3 });
});

test("Status der sichtbaren Testzeilen", () => {
  const s = Object.fromEntries(ein.map((r) => [r.rechnungNr, r.status]));
  assert.equal(s["RE-2026-001"], "Bezahlt");
  assert.equal(s["RE-2026-003"], "Teilzahlung");
  assert.equal(s["RE-2026-005"], "Teilzahlung");
  assert.equal(s["RE-2026-010"], "Rest überfällig");
  assert.equal(aus.find((r) => r.verbindlichkeitNr === "VB-2026-014")?.status, "Teilzahlung");
});

test("Diagramm: Summe der Monate = Kennzahl, keine Werte nach dem Stichtag", () => {
  const reihe = balkenReihe(ein, aus, jahr, td.STICHTAG, "monat");
  assert.equal(reihe.length, 12);
  assert.equal(reihe[10].eingang, null);
  assert.equal(reihe[11].auszahlung, null);
  assert.equal(reihe.reduce((s, p) => s + (p.eingang ?? 0), 0), summe(ein));
  const q = balkenReihe(ein, aus, jahr, td.STICHTAG, "quartal");
  assert.deepEqual(q.map((p) => p.label), ["Q1", "Q2", "Q3", "Q4"]);
  const kum = kumulierteReihe(ein, aus, jahr, td.STICHTAG);
  assert.equal(kum[9].eingang, summe(ein));
  assert.equal(kum[9].auszahlung, summe(aus));
  assert.equal(kum[10].eingang, null);
});

test("Filter: Bereich, Typ, Status, Suche, Zeitraum", () => {
  const f = { ...LEERER_FILTER, bereich: "Property" as const };
  assert.ok(filterKennzahlen(ein, f, jahr).every((r) => r.bereich === "Property"));
  assert.equal(filterKennzahlen(aus, { ...LEERER_FILTER, typ: "Kundenzahlung" }, jahr).length, 0);
  const t = filterTabelle(ein, { ...LEERER_FILTER, status: "Teilzahlung", suche: "kay" }, jahr, (r) => [r.kunde]);
  assert.deepEqual(t.map((r) => r.rechnungNr), ["RE-2026-008"]);
  const q3 = zeitraeume(td.STICHTAG).find((z) => z.key === "vorquartal")!;
  assert.equal(q3.von, "2026-07-01");
  assert.equal(q3.bis, "2026-09-30");
  assert.ok(filterKennzahlen(ein, LEERER_FILTER, q3).every((r) => r.datum >= "2026-07-01" && r.datum <= "2026-09-30"));
});

test("Zeitraum-Beschriftung wie in der Vorlage", () => {
  assert.equal(jahr.label, "Dieses Jahr (01.01. – 31.12.2026)");
});

test("CSV-Export mit Semikolon und deutschem Dezimalkomma", () => {
  assert.equal(toCsv(["A", "B"], [["x;y", 1234.5]]), 'A;B\r\n"x;y";1234,50');
});
