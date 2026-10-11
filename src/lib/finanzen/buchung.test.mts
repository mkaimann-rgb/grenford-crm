import assert from "node:assert/strict";
import { test } from "node:test";
import { belegStatus, bezahlt, finanzKennzahlen, forderungZeilen, naechsteBelegNr, pruefeZahlung, rechnungAusProvision, verbindlichkeitZeilen } from "./buchung.ts";
import { eingangZeilen, forderungsbestand, summe as summeZeilen } from "./logic.ts";

const summe = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
import * as fin from "../testdata/finanzen.ts";
import * as tm from "../crm/testdata-module.ts";
import type { FinanzDaten, Provision } from "../crm/module.ts";

const S = fin.STICHTAG;
// gleiche Zusammenführung wie testdatenLaden() in repository.ts
const daten: FinanzDaten = {
  forderungen: fin.forderungen.map((f) => ({ ...f, ...(tm.FORDERUNG_ZUORDNUNG[f.nr] ?? {}) })),
  zahlungseingaenge: fin.zahlungseingaenge,
  verbindlichkeiten: fin.verbindlichkeiten.map((v) => ({ ...v, ...(tm.VERBINDLICHKEIT_ZUORDNUNG[v.nr] ?? {}) })),
  auszahlungen: fin.auszahlungen,
};

test("Belegstatus: Teilzahlung, überfällig, bezahlt", () => {
  assert.equal(belegStatus(1000, 0, "2026-12-01", S), "Offen");
  assert.equal(belegStatus(1000, 400, "2026-12-01", S), "Teilzahlung");
  assert.equal(belegStatus(1000, 400, "2026-09-01", S), "Überfällig");
  assert.equal(belegStatus(1000, 1000, "2026-09-01", S), "Bezahlt");
});

test("Geplante (zukünftige) Zahlungen zählen nie als bezahlt", () => {
  const z = [{ id: "z1", datum: "2026-10-01", rechnungNr: "X", betrag: 300 }, { id: "z2", datum: "2026-12-01", rechnungNr: "X", betrag: 700 }];
  assert.equal(bezahlt("X", z, S), 300);
  assert.match(pruefeZahlung(100, 500, "2026-12-01", S) ?? "", /Zukunft/);
  assert.match(pruefeZahlung(600, 500, S, S) ?? "", /übersteigt/);
  assert.match(pruefeZahlung(0, 500, S, S) ?? "", /positiven/);
  assert.equal(pruefeZahlung(500, 500, S, S), null);
});

test("Teilzahlungen werden zum Rest verrechnet", () => {
  const f: FinanzDaten = {
    forderungen: [{ nr: "RE-T-001", kunde: "Test", bereich: "Investment", betrag: 1000, faellig: "2026-09-30" }],
    zahlungseingaenge: [{ id: "a", datum: "2026-10-01", rechnungNr: "RE-T-001", betrag: 250 }, { id: "b", datum: "2026-10-05", rechnungNr: "RE-T-001", betrag: 250 }],
    verbindlichkeiten: [], auszahlungen: [],
  };
  const [z] = forderungZeilen(f, S);
  assert.equal(z.gezahlt, 500);
  assert.equal(z.rest, 500);
  assert.equal(z.status, "Überfällig");
});

test("Provision → Rechnung: Betrag, Zahler, Fälligkeit, Verweis", () => {
  const p: Provision = { id: "PROV-T", referenz: "INV-2026-007", bereich: "Investment", art: "Courtage", zahler: "Käufer GmbH", basis: 10_000_000, satz: 3, betrag: 300_000, status: "Entstanden", datum: S };
  const r = rechnungAusProvision(p, "RE-2026-099", "2026-10-10");
  assert.equal(r.betrag, 300_000);
  assert.equal(r.faellig, "2026-10-24");
  assert.equal(r.provisionId, "PROV-T");
  assert.equal(r.mahnstufe, 0);
  assert.equal(naechsteBelegNr("RE-2026-", daten.forderungen.map((x) => x.nr)), "RE-2026-021");
  assert.equal(naechsteBelegNr("VB-2026-", daten.verbindlichkeiten.map((x) => x.nr)), "VB-2026-017");
});

test("Kennzahlen = Summe der Einzelbuchungen (eine Datenbasis)", () => {
  const k = finanzKennzahlen(daten, tm.provisionen, S);
  const fz = forderungZeilen(daten, S);
  const vz = verbindlichkeitZeilen(daten, S);
  assert.equal(k.offeneForderungen.summe, summe(fz.map((x) => x.rest)));
  assert.equal(k.ueberfaellig.summe + k.nichtUeberfaellig.summe, k.offeneForderungen.summe);
  assert.equal(k.offeneVerbindlichkeiten.summe, summe(vz.map((x) => x.rest)));
  assert.equal(k.mahnstufen.reduce((s, m) => s + m.summe, 0) <= k.ueberfaellig.summe, true);
  // identisch zur freigegebenen Ansicht Eingang/Bezahlt
  const alt = forderungsbestand(fin.forderungen, fin.zahlungseingaenge, S);
  assert.deepEqual(k.nichtUeberfaellig, alt.offen);
  assert.deepEqual(k.ueberfaellig, alt.ueberfaellig);
  assert.deepEqual(k.offeneForderungen, { summe: 640_000, anzahl: 7 });
  assert.equal(summeZeilen(eingangZeilen(fin.forderungen, fin.zahlungseingaenge, S)), 2_428_500);
});

test("Überfällige Forderungen mit Mahnstufen laut Testdaten", () => {
  const fz = Object.fromEntries(forderungZeilen(daten, S).map((x) => [x.nr, x]));
  assert.equal(fz["RE-2026-010"].status, "Überfällig");
  assert.equal(fz["RE-2026-010"].mahnstufe, 2);
  assert.equal(fz["RE-2026-018"].mahnstufe, 1);
  assert.equal(fz["RE-2026-019"].mahnstufe ?? 0, 0);
});

test("Verbindlichkeiten nur mit GRENFORD als Schuldner; Zuordnungen gültig", () => {
  const nrs = new Set(daten.verbindlichkeiten.map((v) => v.nr));
  for (const a of daten.auszahlungen) assert.ok(nrs.has(a.verbindlichkeitNr), a.id);
  for (const b of tm.provisionsbeteiligungen) if (b.verbindlichkeitNr) assert.ok(nrs.has(b.verbindlichkeitNr), b.id);
  // Projekte mit Direktbeauftragung durch den Kunden haben keine GU-Verbindlichkeit
  for (const p of tm.projectsProjekte.filter((x) => x.vergabe?.auftraggeber === "Kunde")) {
    assert.ok(!daten.verbindlichkeiten.some((v) => v.referenz === p.id && v.typ === "Bau- / GU-Leistung"), p.id);
  }
});
