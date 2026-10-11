import assert from "node:assert/strict";
import { test } from "node:test";
import * as td from "./testdata.ts";
import * as tm from "./testdata-module.ts";
import { modulVorgaenge } from "./projektion.ts";
import { bereicheDesObjekts, einstufen, findeObjekt, objektSchluessel, vorgaengeVonPerson, vorgaengeVonUnternehmen } from "./vorgaenge.ts";

const firmen = new Map(td.unternehmen.map((u) => [u.id, u]));
const alle = [...td.vorhaben, ...modulVorgaenge(tm)];
const person = (id: string) => td.personen.find((p) => p.id === id)!;
const vonPerson = (id: string) => vorgaengeVonPerson(person(id), alle, tm.objekte, firmen);

test("Einstufung aus Vorgangsart – nur eindeutige Fälle", () => {
  assert.deepEqual(einstufen({ bereich: "privat", art: "Kauf (Eigennutzung)" }), { geschaeftsbereich: "Property", rolle: "Kaufinteressent" });
  assert.deepEqual(einstufen({ bereich: "privat", art: "Verkauf" }), { geschaeftsbereich: "Property", rolle: "Verkäufer" });
  assert.deepEqual(einstufen({ bereich: "privat", art: "Sanierung / Modernisierung" }), { geschaeftsbereich: "Projects", rolle: "Bauherr" });
  assert.deepEqual(einstufen({ bereich: "sanierung", art: "Komplettsanierung" }), { geschaeftsbereich: "Projects", rolle: "Sanierungskunde" });
  const kap = einstufen({ bereich: "privat", art: "Kauf (Kapitalanlage)" });
  assert.equal(kap.geschaeftsbereich, null);
  assert.ok(kap.pruefen);
  assert.ok(einstufen({ bereich: "privat", art: "Ferienimmobilie" }).pruefen, "Rolle bei Ferienimmobilie unklar");
});

test("Jeder Vorgang hat einen Bereich oder einen Prüfhinweis; Verweise sind gültig", () => {
  const oIds = new Set(td.objekte.map((o) => o.id));
  assert.equal(new Set(td.vorhaben.map((v) => v.id)).size, td.vorhaben.length);
  for (const v of td.vorhaben) {
    assert.ok(v.geschaeftsbereich || v.pruefen, v.id);
    assert.ok(v.rolle || v.beteiligte?.length || v.unternehmenId, `${v.id}: Rolle fehlt`);
    if (v.objektId) assert.ok(oIds.has(v.objektId), `${v.id} → ${v.objektId}`);
  }
});

test("Keine doppelten Objekt-Stammsätze; Dublettenprüfung normalisiert", () => {
  const keys = td.objekte.map((o) => objektSchluessel(o.titel, o.ort));
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(findeObjekt(td.objekte, "Malplaquetstr. 39", "Berlin")?.id, "o-malplaquet-39");
  assert.equal(findeObjekt(td.objekte, "Malplaquetstraße 39", "Potsdam"), undefined);
  // Malplaquetstraße 39: ein Objekt, zwei Vorgänge (Legrand, Ozden)
  assert.deepEqual(td.vorhaben.filter((v) => v.objektId === "o-malplaquet-39").map((v) => v.personId).sort(), ["p-legrand", "p-ozden"]);
});

test("Objekt in mehreren Bereichen: je Bereich eigener Vorgang (Hotel das ERZ)", () => {
  assert.deepEqual(bereicheDesObjekts("o-hotel-erz", alle), ["Investment", "Projects"]);
  const erz = vorgaengeVonUnternehmen({ id: "f-erz" }, alle, tm.objekte);
  const kurz = erz.map((z) => [z.v.id, z.v.geschaeftsbereich, z.rolle]);
  assert.ok(kurz.some(([, b, r]) => b === "Projects" && r === "Bauherr"), JSON.stringify(kurz));
  assert.ok(kurz.some(([id, b, r]) => id === "INV-2026-008" && b === "Investment" && r === "Verkäufer / Eigentümer"), JSON.stringify(kurz));
  // Kundenvorhaben v-litus-1 verweist auf PRO-2026-004 → keine Doppelanzeige
  assert.equal(erz.filter((z) => z.v.id === "PRO-2026-004").length, 0);
});

test("QA: Privatkunde mit Property-Kauf und Projects-Sanierung (Oscar Legrand)", () => {
  const z = vonPerson("p-legrand");
  const kurz = z.map((x) => [x.objekt?.titel, x.v.geschaeftsbereich, x.v.art, x.rolle]);
  assert.deepEqual(kurz, [
    ["Penthouse Charlottenburg", "Property", "Kauf (Eigennutzung)", "Kaufinteressent"],
    ["Malplaquetstraße 39", "Projects", "Sanierung / Modernisierung", "Bauherr"],
  ]);
  // Bereiche des Kontakts bleiben davon getrennt und unverändert
  assert.deepEqual(person("p-legrand").bereiche.map((b) => b.bereich), ["Property", "Projects"]);
});

test("QA: Ansprechpartner mit Investment- und Property-Vorgängen (Kay Brandes)", () => {
  const z = vonPerson("p-brandes");
  const bereiche = new Set(z.map((x) => x.v.geschaeftsbereich));
  assert.ok(bereiche.has("Investment") && bereiche.has("Property"));
  assert.ok(z.every((x) => x.rolle), "jede Zeile hat eine Rolle");
  assert.ok(z.some((x) => x.v.id === "PROP-2026-008" && x.rolle.includes("prüfen")), "Brautstraße 29: Rolle als unklar gekennzeichnet");
  // Ansprechpartner sieht Vorgänge seines Unternehmens (über …), ohne Dubletten
  assert.equal(new Set(z.map((x) => x.v.id)).size, z.length);
  const berger = vonPerson("p-berger");
  assert.ok(berger.some((x) => x.v.id === "INV-2026-007" && x.rolle === "Ansprechpartner Verkäufer"));
  // Über verknüpftes Unternehmen: Anna Fidanzeskina (das ERZ) sieht den Projects-Vorgang ihres Unternehmens
  assert.ok(vonPerson("p-fidanzeskina").some((x) => x.v.id === "v-litus-1" && x.ueber === "das ERZ Hotel"));
});
