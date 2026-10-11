import assert from "node:assert/strict";
import { test } from "node:test";
import { PRUEFEN, ableitenPerson, ableitenUnternehmen, ausFormular, bereichsHinweise, ergaenzeBereiche, interesseBereich, passtBereich } from "./bereiche.ts";
import * as td from "./testdata.ts";
import { GESCHAEFTSBEREICHE } from "./types.ts";

const firma = (id: string) => td.unternehmen.find((u) => u.id === id)!;
const person = (id: string) => td.personen.find((p) => p.id === id)!;
const namen = (b: { bereich: string }[]) => b.map((x) => x.bereich);

test("Jeder Stammsatz hat Bereiche oder einen ausdrücklichen Prüfhinweis", () => {
  for (const e of [...td.unternehmen, ...td.personen]) {
    assert.ok(e.bereiche.length > 0 || !!e.bereichPruefen, `ohne Bereich und ohne Prüfhinweis: ${e.id}`);
    assert.equal(new Set(namen(e.bereiche)).size, e.bereiche.length, `doppelter Bereich: ${e.id}`);
    for (const z of e.bereiche) assert.ok(GESCHAEFTSBEREICHE.includes(z.bereich));
  }
});

test("QA-Fälle: Mehrfachbereiche und Mehrfachrollen", () => {
  assert.deepEqual(namen(firma("f-brandes").bereiche), ["Investment", "Property"]);
  assert.deepEqual(namen(person("p-brandes").bereiche), ["Investment", "Property"]);
  assert.deepEqual(namen(person("p-fischer").bereiche), ["Investment", "Property", "Projects"]);
  const keil = person("p-keil");
  assert.ok(keil.privat && keil.sanierung, "Keil ist Privat- und Sanierungskunde (ein Datensatz)");
  assert.deepEqual(namen(keil.bereiche), ["Projects"]);
  assert.equal(td.personen.filter((p) => p.vorname === "Alexander" && p.nachname === "Keil").length, 1);
});

test("Unklare Fälle werden markiert, nicht willkürlich zugeordnet", () => {
  assert.ok(firma("f-noodles").bereichPruefen);
  assert.equal(firma("f-noodles").bereiche.length, 0);
  assert.ok(person("p-reitemeyer").bereichPruefen);
  assert.equal(interesseBereich("Kauf (Kapitalanlage)"), null);
  assert.equal(interesseBereich("Verkauf"), "Property");
  assert.equal(interesseBereich("Komplettsanierung"), "Projects");
  assert.deepEqual(ableitenUnternehmen({ arten: ["Makler"] }).zuordnungen, []);
  assert.equal(ableitenUnternehmen({ arten: ["Makler"] }).unklar.length, 1);
});

test("Ableitung Person: erbt Firmenbereiche mit Funktion; Sanierungsrolle → Projects", () => {
  const firmen = new Map([["f1", { name: "Test GmbH", bereiche: [{ bereich: "Investment" as const, funktion: "Investor", herkunft: "manuell" as const }] }]]);
  const r = ableitenPerson({ kontakte: [{ unternehmenId: "f1", position: "", abteilung: "", rolle: "Entscheider" }], sanierung: { status: "Aktiv", seit: "", interessen: [], regionen: "", zeitrahmen: "", prioritaet: "" } }, [], firmen);
  assert.deepEqual(r.zuordnungen.map((z) => [z.bereich, z.funktion]), [["Investment", "Entscheider"], ["Projects", "Sanierungskunde"]]);
});

test("Filter: mindestens einer der gewählten Bereiche", () => {
  const inv = { bereiche: [{ bereich: "Investment" as const, funktion: "", herkunft: "manuell" as const }] };
  assert.equal(passtBereich(inv, []), true);
  assert.equal(passtBereich(inv, ["Property"]), false);
  assert.equal(passtBereich(inv, ["Property", "Investment"]), true);
  assert.equal(passtBereich({ bereiche: [] }, [PRUEFEN]), true);
  assert.equal(passtBereich({ ...inv, bereichPruefen: "x" }, [PRUEFEN]), true);
  const treffer = td.unternehmen.filter((u) => passtBereich(u, ["Investment", "Property"]));
  assert.ok(treffer.some((u) => u.id === "f-brandes"));
  assert.ok(treffer.every((u) => u.bereiche.some((b) => b.bereich === "Investment" || b.bereich === "Property")));
});

test("Formular: Herkunft bleibt bei unveränderten Einträgen, Ergänzung ohne Duplikate", () => {
  const alt = firma("f-brandes").bereiche;
  const neu = ausFormular([{ bereich: "Investment", funktion: alt[0].funktion }, { bereich: "Projects", funktion: " GU " }], alt);
  assert.equal(neu[0], alt[0]);
  assert.deepEqual(neu[1], { bereich: "Projects", funktion: "GU", herkunft: "manuell" });
  assert.deepEqual(ergaenzeBereiche(neu, [{ bereich: "Projects", funktion: "x", grund: "y" }]), neu);
  assert.equal(ergaenzeBereiche(neu, [{ bereich: "Property", funktion: "Verkäufer", grund: "Vorhaben" }]).length, 3);
  assert.deepEqual(namen(bereichsHinweise(neu, [{ bereich: "Property", funktion: "", grund: "" }, { bereich: "Projects", funktion: "", grund: "" }])), ["Property"]);
});
