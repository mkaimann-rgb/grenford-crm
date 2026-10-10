import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addDays, aktivitaetStatus, aktivitaetenFuerUnternehmen, datumLang, dublettenPaare, findeFirmenDublette, findePersonDublette, initialen, letzteAktivitaet,
  naechste, normalisiereFirma, notizen, regionVon, sortiere, wochenStart,
} from "./logic.ts";
import * as td from "./testdata.ts";
import type { Aktivitaet } from "./types.ts";

const H = td.HEUTE;
const akt = (x: Partial<Aktivitaet>): Aktivitaet => ({ id: "x", typ: "Termin", titel: "t", beschreibung: "", datum: H, bezug: [], verantwortlichId: "u-mk", erledigt: false, ...x });

test("Datumshilfen", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(wochenStart("2026-10-10"), "2026-10-05");
  assert.equal(datumLang("2026-10-10"), "Samstag, 10. Oktober 2026");
  assert.equal(initialen("Dr. Stefan Hoffmann"), "SH");
});

test("Firmen-Dubletten: Name ohne Rechtsform, USt-IdNr., HRB", () => {
  assert.equal(normalisiereFirma("Montesana AG"), normalisiereFirma("montesana"));
  assert.equal(findeFirmenDublette(td.unternehmen, { name: "Montesana", ustId: "", handelsregister: "" })?.id, "f-montesana");
  assert.equal(findeFirmenDublette(td.unternehmen, { name: "Neue Firma", ustId: "de123456789", handelsregister: "" })?.id, "f-montesana");
  assert.equal(findeFirmenDublette(td.unternehmen, { name: "Neue Firma", ustId: "", handelsregister: "HRB 123456" })?.id, "f-montesana");
  assert.equal(findeFirmenDublette(td.unternehmen, { name: "Montesana AG", ustId: "", handelsregister: "" }, "f-montesana"), undefined);
  assert.equal(findeFirmenDublette(td.unternehmen, { name: "Ganz Neu GmbH", ustId: "", handelsregister: "" }), undefined);
});

test("Personen-Dubletten: E-Mail oder Name (+ Geburtsdatum)", () => {
  assert.equal(findePersonDublette(td.personen, { vorname: "X", nachname: "Y", email: "OSCAR.LEGRAND@email.com", geburtsdatum: "" })?.id, "p-legrand");
  assert.equal(findePersonDublette(td.personen, { vorname: "Alexander", nachname: "Keil", email: "", geburtsdatum: "" })?.id, "p-keil");
  assert.equal(findePersonDublette(td.personen, { vorname: "Alexander", nachname: "Keil", email: "", geburtsdatum: "1990-01-01" }), undefined);
});

test("Testdaten sind dublettenfrei und referenziell konsistent", () => {
  assert.deepEqual(dublettenPaare(td.unternehmen, td.personen), []);
  const uIds = new Set(td.unternehmen.map((u) => u.id));
  const pIds = new Set(td.personen.map((p) => p.id));
  assert.equal(uIds.size, td.unternehmen.length);
  assert.equal(pIds.size, td.personen.length);
  for (const p of td.personen) for (const k of p.kontakte) assert.ok(uIds.has(k.unternehmenId), `${p.id} → ${k.unternehmenId}`);
  for (const v of td.vorhaben) {
    assert.ok(pIds.has(v.personId));
    if (v.unternehmenId) assert.ok(uIds.has(v.unternehmenId));
    const p = td.personen.find((x) => x.id === v.personId)!;
    assert.ok(v.bereich === "sanierung" ? p.sanierung : p.privat, `${v.id}: Person hat Rolle ${v.bereich}`);
  }
  for (const a of td.aktivitaeten) for (const b of a.bezug) assert.ok(b.art === "unternehmen" ? uIds.has(b.id) : pIds.has(b.id), `${a.id}`);
});

test("Mehrfachrollen ohne Doppelanlage", () => {
  const keil = td.personen.filter((p) => p.nachname === "Keil");
  assert.equal(keil.length, 1);
  assert.ok(keil[0].privat && keil[0].sanierung);
  const weber = td.personen.find((p) => p.id === "p-weber")!;
  assert.ok(weber.kontakte.length > 0 && weber.privat && weber.sanierung);
});

test("Aktivitätsstatus", () => {
  assert.equal(aktivitaetStatus(akt({ datum: H }), H), "Heute");
  assert.equal(aktivitaetStatus(akt({ datum: addDays(H, -1) }), H), "Überfällig");
  assert.equal(aktivitaetStatus(akt({ datum: addDays(H, -1), erledigt: true }), H), "Erledigt");
  assert.equal(aktivitaetStatus(akt({ datum: addDays(H, 2) }), H), "Geplant");
  assert.equal(aktivitaetStatus(akt({ typ: "Notiz", datum: addDays(H, -9) }), H), "Notiz");
});

test("Letzte Aktivität: offene überfällige Aufgaben zählen nicht, Zukunft zählt nicht", () => {
  const liste = [akt({ typ: "Aufgabe", datum: addDays(H, -1) }), akt({ datum: addDays(H, 3) }), akt({ typ: "Telefon", datum: addDays(H, -5), erledigt: true })];
  assert.equal(letzteAktivitaet(liste, H, "2026-01-01"), addDays(H, -5));
  assert.equal(letzteAktivitaet([], H, "2026-01-01"), "2026-01-01");
});

test("Aktivitäten eines Unternehmens enthalten die seiner Ansprechpartner", () => {
  const u = td.unternehmen.find((x) => x.id === "f-privateigentum")!;
  const liste = aktivitaetenFuerUnternehmen(td.aktivitaeten, u, td.personen);
  assert.ok(liste.some((a) => a.bezug.some((b) => b.id === "p-legrand")));
});

test("Nächste Termine und Notizen", () => {
  const n = naechste(td.aktivitaeten, H, 3);
  assert.equal(n.length, 3);
  assert.ok(n.every((a) => a.datum >= H && !a.erledigt && a.typ !== "Notiz"));
  assert.ok(n[0].datum <= n[1].datum);
  const no = notizen(td.aktivitaeten, 2);
  assert.ok(no.every((a) => a.typ === "Notiz"));
  assert.ok(no[0].datum >= no[1].datum);
});

test("Sortierung und Regionen", () => {
  assert.deepEqual(sortiere([{ n: "Öl" }, { n: "Apfel" }, { n: "Zebra" }], (x) => x.n, "asc").map((x) => x.n), ["Apfel", "Öl", "Zebra"]);
  assert.equal(regionVon("Zürich", "Schweiz"), "Schweiz");
  assert.equal(regionVon("Potsdam", "Deutschland"), "Berlin / Brandenburg");
});
