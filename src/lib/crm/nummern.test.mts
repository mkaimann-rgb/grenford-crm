import assert from "node:assert/strict";
import { test } from "node:test";
import { NUMMERNKREISE, naechsteFreieNummer, vergebeneIds } from "./nummern.ts";
import * as tm from "./testdata-module.ts";
import * as fin from "../testdata/finanzen.ts";

const HEUTE = "2026-10-10";
const listen = [
  tm.akquise, tm.investmentProjekte, tm.kaeuferprozesse, tm.ankaufsprofile, tm.suchauftraege, tm.propertyMandate, tm.interessenten,
  tm.projectsMandate, tm.projectsProjekte, tm.angebote, tm.guPartner, tm.objekte, tm.empfehlungspartner, tm.empfehlungen,
  tm.provisionsbeteiligungen, tm.provisionen, fin.forderungen, fin.verbindlichkeiten, fin.zahlungseingaenge, fin.auszahlungen,
];
const vergeben = vergebeneIds(listen);

test("Präfixe je Vorgangstyp und Geschäftsbereich eindeutig", () => {
  const p = NUMMERNKREISE.map((k) => k.praefix("2026"));
  assert.equal(new Set(p).size, p.length);
  // kein Präfix ist Anfang eines anderen (z. B. PRO- vs. PROP-, PRV- vs. PROV-)
  for (const a of p) for (const b of p) if (a !== b) assert.ok(!b.startsWith(a), `${a} / ${b}`);
});

test("Neue Nummern kollidieren mit keiner vorhandenen ID oder Referenz", () => {
  for (const k of NUMMERNKREISE) {
    const n = naechsteFreieNummer(k.schluessel, vergeben, HEUTE);
    assert.ok(!vergeben.includes(n), `${k.schluessel}: ${n}`);
    assert.ok(n.startsWith(k.praefix("2026")), n);
  }
});

test("Nur referenzierte IDs werden ebenfalls berücksichtigt", () => {
  // PRO-2026-001 existiert nur als Referenz einer Verbindlichkeit – darf nie neu vergeben werden
  assert.ok(vergeben.includes("PRO-2026-001"));
  assert.equal(naechsteFreieNummer("projectsProjekt", ["PRO-2026-001", "PRO-2026-020"], HEUTE), "PRO-2026-021");
});

test("Bestehende IDs bleiben unverändert (Stichproben aus der Freigabe)", () => {
  for (const id of ["INV-2026-001", "INV-2026-007", "PROP-2026-006", "PRO-2026-014", "RE-2026-001", "VB-2026-015", "INV-OPT-0008", "SRCH-I-008", "SRCH-P-008", "PROV-2026-005", "PRV-2026-001"]) {
    assert.ok(vergeben.includes(id), id);
  }
  assert.equal(naechsteFreieNummer("rechnung", vergeben, HEUTE), "RE-2026-021");
  assert.equal(naechsteFreieNummer("investmentProjekt", vergeben, HEUTE), "INV-2026-011");
});
