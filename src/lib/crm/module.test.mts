import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PHASEN_INVESTMENT, PHASEN_PROJECTS, PHASEN_PROPERTY, anonymisiere, angebotsvergleich, beteiligungsbetrag, empfehlungsprovision,
  naechstePhase, naechsteNummer, passend, phaseTitel, projectsVerguetung, vergabeErzeugtVerbindlichkeit, type Angebot,
} from "./module.ts";
import { modulVorgaenge, vorgangsIndex } from "./projektion.ts";
import * as tm from "./testdata-module.ts";
import * as td from "./testdata.ts";

test("Nummernkreise: nächste freie Nummer, keine Doppelvergabe", () => {
  assert.equal(naechsteNummer("INV-2026-", ["INV-2026-001", "INV-2026-010", "PROP-2026-011"]), "INV-2026-011");
  assert.equal(naechsteNummer("INV-OPT-", [], 4), "INV-OPT-0001");
  const ids = [...tm.investmentProjekte, ...tm.propertyMandate, ...tm.projectsProjekte, ...tm.projectsMandate, ...tm.kaeuferprozesse, ...tm.akquise, ...tm.suchauftraege].map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length, "IDs eindeutig");
});

test("Phasen: Investment A–F, Property A–E, Projects A–F mit Unterphasen", () => {
  assert.deepEqual(PHASEN_INVESTMENT.map((p) => p.code), ["A", "B", "C", "D", "E", "F"]);
  assert.deepEqual(PHASEN_PROPERTY.map((p) => p.code), ["A", "B", "C", "D", "E"]);
  assert.deepEqual(PHASEN_PROJECTS.map((p) => p.code), ["A", "B", "C", "D", "E", "F"]);
  assert.ok(PHASEN_PROJECTS.every((p) => p.unter.length > 0));
  assert.equal(naechstePhase(PHASEN_INVESTMENT, "A3"), "B1");
  assert.equal(naechstePhase(PHASEN_INVESTMENT, "F3"), null);
  assert.match(phaseTitel(PHASEN_INVESTMENT, "D1"), /LOI/);
});

test("Empfehlungsprovision: Standard, projektbezogener Satz und Festbetrag haben Vorrang", () => {
  assert.deepEqual(empfehlungsprovision(300_000, 10), { satz: 10, betrag: 30_000, quelle: "Standard laut Vertrag" });
  assert.equal(empfehlungsprovision(300_000, 10, { satz: 15 }).betrag, 45_000);
  assert.equal(empfehlungsprovision(300_000, 10, { festbetrag: 20_000 }).betrag, 20_000);
  // Projects: 3 % der Netto-Bausumme inkl. Nachträge
  assert.equal(empfehlungsprovision(74_800 + 5_200, 3).betrag, 2_400);
  assert.equal(projectsVerguetung(80_000, 3), 2_400);
});

test("Provisionsbeteiligung: nur individueller Anteil oder Festbetrag", () => {
  assert.equal(beteiligungsbetrag({ basis: 100_000, anteil: 0 }), 0, "kein automatischer Standardsatz");
  assert.equal(beteiligungsbetrag({ basis: 100_000, anteil: 25 }), 25_000);
  assert.equal(beteiligungsbetrag({ basis: 100_000, anteil: 25, festbetrag: 12_000 }), 12_000);
});

test("Renovation Memo: Anonymisierung Partner A/B/C nur für eingegangene Angebote", () => {
  const a: Angebot[] = [
    { id: "x1", projektId: "P", guId: "G1", datum: "2026-09-02", summe: 80_000, umfang: "", status: "Eingegangen" },
    { id: "x2", projektId: "P", guId: "G2", datum: "2026-09-01", summe: 75_000, umfang: "", status: "Eingegangen" },
    { id: "x3", projektId: "P", guId: "G3", umfang: "", status: "Angefragt" },
  ];
  const m = anonymisiere(a);
  assert.equal(m.get("x2"), "Partner A");
  assert.equal(m.get("x1"), "Partner B");
  assert.equal(m.has("x3"), false);
  assert.deepEqual(angebotsvergleich(a), { anzahl: 2, min: 75_000, max: 80_000, spanne: 5_000, guenstigstes: "x2" });
});

test("Vergabe: Direktbeauftragung durch Kunden erzeugt keine GRENFORD-Verbindlichkeit", () => {
  assert.equal(vergabeErzeugtVerbindlichkeit("Kunde"), false);
  assert.equal(vergabeErzeugtVerbindlichkeit("GRENFORD"), true);
});

test("Matching Suchauftrag/Ankaufsprofil ↔ Projekte (mind. 2 von 3 Kriterien)", () => {
  const k = [{ id: "a", objektart: "Mehrfamilienhaus", standort: "Berlin", volumen: 10e6 }, { id: "b", objektart: "Hotel", standort: "München", volumen: 50e6 }];
  const r = passend({ objektarten: ["Wohnen"], regionen: ["Berlin"], von: 5, bis: 15 }, k, (x) => x);
  assert.deepEqual(r.map((x) => [x.k.id, x.score]), [["a", 3]]);
});

test("Käuferprozesse: mehrere je Projekt, eigene IDs, gültige Verweise", () => {
  const proj = new Set([...tm.investmentProjekte, ...tm.propertyMandate].map((p) => p.id));
  for (const k of tm.kaeuferprozesse) assert.ok(proj.has(k.projektId), k.id);
  const jeProjekt = new Map<string, number>();
  for (const k of tm.kaeuferprozesse) jeProjekt.set(k.projektId, (jeProjekt.get(k.projektId) ?? 0) + 1);
  assert.ok([...jeProjekt.values()].some((n) => n > 1));
  const paare = tm.kaeuferprozesse.map((k) => `${k.projektId}|${k.kaeufer.art}:${k.kaeufer.id}`);
  assert.equal(new Set(paare).size, paare.length, "kein Käufer doppelt je Projekt");
});

test("Projects: Mandat enthält mehrere Projekte; Verweise gültig", () => {
  const m = new Set(tm.projectsMandate.map((x) => x.id));
  for (const p of tm.projectsProjekte) assert.ok(m.has(p.mandatId), p.id);
  assert.ok(tm.projectsMandate.some((x) => tm.projectsProjekte.filter((p) => p.mandatId === x.id).length > 1));
  const gu = new Set(tm.guPartner.map((g) => g.id));
  for (const a of tm.angebote) assert.ok(gu.has(a.guId), a.id);
});

test("Property: Objekt und Mandat getrennt, ein Objekt kann mehrere Mandate haben", () => {
  const o = new Set(tm.objekte.map((x) => x.id));
  for (const p of tm.propertyMandate) assert.ok(o.has(p.objektId), p.id);
  const ids = tm.interessenten.map((i) => `${i.ref.art}:${i.ref.id}`);
  assert.equal(new Set(ids).size, ids.length, "keine doppelten Interessenten");
});

test("Suchaufträge Investment und Property unterscheidbar", () => {
  for (const s of tm.suchauftraege) assert.ok(s.id.startsWith(s.bereich === "Investment" ? "SRCH-I-" : "SRCH-P-"), s.id);
});

test("Empfehlungspartner verweisen auf vorhandene Personen (keine Dubletten)", () => {
  const p = new Set(td.personen.map((x) => x.id));
  for (const e of tm.empfehlungspartner) assert.ok(p.has(e.personId), e.id);
  assert.equal(new Set(tm.empfehlungspartner.map((e) => e.personId)).size, tm.empfehlungspartner.length);
});

test("Projektion: übernommene Akquise erscheint nicht doppelt; Index vollständig", () => {
  const v = modulVorgaenge(tm);
  for (const a of tm.akquise.filter((x) => x.status === "Übernommen")) assert.ok(!v.some((x) => x.id === a.id), a.id);
  assert.equal(new Set(v.map((x) => x.id)).size, v.length);
  const idx = vorgangsIndex(tm);
  for (const p of tm.projectsProjekte) assert.ok(idx.get(p.id)?.href, p.id);
});

// ---------- Abschlusskorrekturen ----------
import { empfehlungsBemessung, kaeuferRolle } from "./module.ts";

test("Empfehlungsprovision Investment: Netto-Courtage nach Abzug vorrangiger externer Makleranteile", () => {
  // INV-2026-001: Käufercourtage 450.000 € − Gemeinschaftsgeschäft Simple Invest (externer Makler) 240.000 € = 210.000 €
  const b = empfehlungsBemessung("INV-2026-001", tm);
  assert.equal(b.courtage, 450_000);
  assert.equal(b.abzug, 240_000);
  assert.equal(b.basis, 210_000);
  assert.equal(empfehlungsprovision(b.basis, 10).betrag, 21_000);
});

test("Interne Provisionsbeteiligungen mindern die Bemessungsgrundlage nicht", () => {
  // INV-2026-007: interne Beteiligung Kay Brandes (PROV-2026-005) wird nicht abgezogen
  const b = empfehlungsBemessung("INV-2026-007", tm);
  assert.equal(b.abzug, 0);
  assert.equal(b.basis, 180_000);
  assert.equal(b.erwartet, true);
  const extern = empfehlungsBemessung("INV-2026-007", { ...tm, provisionsbeteiligungen: tm.provisionsbeteiligungen.map((x) => (x.id === "PROV-2026-005" ? { ...x, vorrangig: true } : x)) });
  assert.equal(extern.basis, 135_000, "nur als externer Makleranteil gekennzeichnet → Abzug 25 %");
});

test("Individuelle Vereinbarung hat Vorrang vor dem Standardsatz", () => {
  const b = empfehlungsBemessung("INV-2026-001", tm);
  assert.equal(empfehlungsprovision(b.basis, 10, { festbetrag: 87_000 }).betrag, 87_000);
  assert.equal(empfehlungsprovision(b.basis, 10, { satz: 12 }).betrag, 25_200);
});

test("Empfehlungsprovision Projects: 3 % der vertraglichen Netto-Bausumme inkl. Nachträge", () => {
  const b = empfehlungsBemessung("PRO-2026-015", tm);
  assert.equal(b.basis, 248_000);
  assert.equal(empfehlungsprovision(b.basis, 3).betrag, 7_440);
  const ohne = empfehlungsBemessung("PRO-2026-014", tm);
  assert.equal(ohne.basis, 0, "ohne Vergabe keine vertragliche Basis");
  assert.equal(ohne.erwartet, true);
});

test("Kaufinteressent ≠ bestätigter Käufer; Maspohl bei Berlin-Schöneberg nur Kaufinteressent mit Prüfhinweis", () => {
  assert.equal(kaeuferRolle({ bereich: "Investment", status: "Aktiv" }), "Kaufinteressent (Investor)");
  assert.equal(kaeuferRolle({ bereich: "Investment", status: "Gekauft" }), "Käufer (Investor)");
  assert.equal(kaeuferRolle({ bereich: "Property", status: "Aktiv" }), "Kaufinteressent");
  const kp = tm.kaeuferprozesse.find((k) => k.id === "INV-OPT-0008")!;
  assert.equal(kp.status, "Aktiv");
  assert.ok(kp.pruefen);
  const v = modulVorgaenge(tm).find((x) => x.id === "INV-OPT-0008")!;
  const maspohl = v.beteiligte!.find((b) => b.id === "p-maspohl")!;
  assert.equal(maspohl.rolle, "Ansprechpartner Kaufinteressent");
  assert.ok(!v.beteiligte!.some((b) => /^Käufer/.test(b.rolle)), "kein bestätigter Käufer");
  assert.ok(v.pruefen);
});

test("Brautstraße 29 und unklare Rollen sind prüfbedürftig gekennzeichnet", () => {
  const m = tm.propertyMandate.find((x) => x.id === "PROP-2026-008")!;
  assert.equal(m.eigentuemer, undefined);
  assert.ok(m.beteiligte.every((b) => b.pruefen));
  const inv = tm.investmentProjekte.find((x) => x.id === "INV-2026-007")!;
  assert.ok(inv.beteiligte.find((b) => b.id === "p-spannaus")?.pruefen);
});
