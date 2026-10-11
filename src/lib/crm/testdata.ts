/**
 * ============================================================
 *  TESTDATEN – KEINE ECHTEN KUNDEN- ODER KONTAKTDATEN
 * ============================================================
 * Zentrale, fiktive Stammdaten für alle Module (Unternehmen, Personen,
 * Vorhaben, Aktivitäten). Namen orientieren sich an den Visualisierungen.
 * Alle Seiten lesen ausschließlich aus diesem Bestand (über den CRM-Store).
 */
import { STICHTAG } from "../testdata/finanzen.ts";
import { addDays } from "./logic.ts";
import { ableitenPerson, ableitenUnternehmen, alsZuordnungen, type Ableitung } from "./bereiche.ts";
import { einstufen } from "./vorgaenge.ts";
import type { Aktivitaet, Benutzer, Kontaktverknuepfung, Objekt, Person, Unternehmen, Vorhaben } from "./types.ts";

export const HEUTE = STICHTAG;
const d = (offset: number) => addDays(HEUTE, offset);

export const benutzer: Benutzer[] = [{ id: "u-mk", name: "Marco Kaimann", kuerzel: "MK" }];
const MK = "u-mk";

type U = Partial<Unternehmen> & Pick<Unternehmen, "id" | "name" | "arten" | "ort" | "status">;
const firma = (u: U): Unternehmen => ({
  bereiche: [],
  rechtsform: "GmbH",
  ustId: "",
  handelsregister: "",
  website: "",
  linkedin: "",
  telefon: "",
  email: "",
  beschreibung: "",
  labels: [],
  betreuerId: MK,
  quelle: "Netzwerk",
  strasse: "",
  plz: "",
  land: "Deutschland",
  erstelltAm: "2026-03-01",
  letzterKontakt: d(-40),
  ...u,
});

const unternehmenRoh: Unternehmen[] = [
  firma({
    id: "f-montesana", name: "Montesana AG", arten: ["Bestandshalter", "Investor", "Projektentwickler"], rechtsform: "AG", ort: "Bad Reichenhall", plz: "83435",
    strasse: "Reichenhaller Straße 10", ustId: "DE123456789", handelsregister: "HRB 123456", website: "https://www.montesana-ag.de",
    linkedin: "https://www.linkedin.com/company/montesana-ag", telefon: "+49 8651 123456", email: "info@montesana-ag.de",
    beschreibung: "Projektentwickler mit Fokus auf Hospitality, Mixed-Use und Living-Konzepte im Alpenraum und D-CH-Grenzraum. Langfristige Investorenstruktur.",
    labels: ["Hospitality", "Alpenraum", "D-CH-Grenze", "Family Office"], status: "Aktiv", bild: "/testbilder/inv-1.jpg", erstelltAm: "2026-06-15", letzterKontakt: d(-30),
  }),
  firma({ id: "f-schoeneberg", name: "Berlin-Schöneberg GmbH", arten: ["Projektentwickler"], ort: "Berlin", plz: "10827", status: "Aktiv", bild: "/testbilder/inv-2.jpg", letzterKontakt: d(-32) }),
  firma({ id: "f-sander", name: "Sander Bau GmbH", arten: ["Generalunternehmer"], ort: "Hamburg", plz: "20457", status: "Aktiv", bild: "/testbilder/proj-1.jpg", letzterKontakt: d(-35), labels: ["GU-Partner"] }),
  firma({ id: "f-brandes", name: "Kay Brandes Immobilien", arten: ["Investor", "Makler"], rechtsform: "e.K.", ort: "Berlin", plz: "10719", status: "Aktiv", letzterKontakt: d(-30) }),
  firma({ id: "f-huber", name: "Family Office Huber", arten: ["Family Office"], ort: "München", plz: "80331", status: "In Kontakt", bild: "/testbilder/prop-1.jpg", letzterKontakt: d(-36) }),
  firma({ id: "f-mueller", name: "Privatinvestor Müller", arten: ["Investor"], rechtsform: "Sonstige", ort: "Stuttgart", plz: "70173", status: "In Kontakt", letzterKontakt: d(-38) }),
  firma({ id: "f-lehmann", name: "Lehmann & Partner", arten: ["Vermögensverwalter"], rechtsform: "AG", ort: "Zürich", plz: "8001", land: "Schweiz", status: "In Kontakt", bild: "/testbilder/prop-3.jpg", letzterKontakt: d(-39) }),
  firma({ id: "f-bauwert", name: "Bauwert Capital", arten: ["Investor"], ort: "Frankfurt", plz: "60311", status: "Aktiv", letzterKontakt: d(-42) }),
  firma({ id: "f-rheinmain", name: "RheinMain Developments", arten: ["Projektentwickler"], ort: "Frankfurt", plz: "60325", status: "Potenzial", bild: "/testbilder/proj-2.jpg", letzterKontakt: d(-43) }),
  firma({ id: "f-alpen", name: "Alpen Immobilien GmbH", arten: ["Bestandshalter"], ort: "München", plz: "80539", status: "Aktiv", bild: "/testbilder/proj-3.jpg", letzterKontakt: d(-44) }),
  firma({ id: "f-nordstadt", name: "Nordstadt Quartier GmbH", arten: ["Projektentwickler"], ort: "Hamburg", plz: "22303", status: "In Kontakt", letzterKontakt: d(-45) }),
  firma({ id: "f-weber", name: "Weber Family Office", arten: ["Family Office", "Investor"], ort: "Düsseldorf", plz: "40213", status: "Aktiv", bild: "/testbilder/inv-3.jpg", letzterKontakt: d(-47) }),
  firma({ id: "f-gravitation", name: "Gravitation Capital", arten: ["Investor"], rechtsform: "AG", ort: "Zürich", plz: "8002", land: "Schweiz", status: "In Kontakt", letzterKontakt: d(-38) }),
  firma({ id: "f-erz", name: "das ERZ Hotel", arten: ["Bestandshalter"], ort: "Erzgebirge", plz: "09456", status: "In Kontakt", letzterKontakt: d(-49) }),
  firma({ id: "f-noodles", name: "NOODLES", arten: ["Sonstige"], rechtsform: "GbR", ort: "Berlin", plz: "10115", status: "Aktiv", letzterKontakt: d(-59) }),
  firma({ id: "f-kuechenaktiv", name: "Küchen Aktiv (BSK Konzepte GmbH)", arten: ["Küchenstudio"], ort: "Berlin", plz: "12099", status: "Aktiv", letzterKontakt: d(-61), labels: ["Empfehlungspartner"] }),
  firma({ id: "f-mfbau", name: "MF Berliner Bauausführung", arten: ["Generalunternehmer"], ort: "Berlin", plz: "13353", status: "Aktiv", letzterKontakt: d(-63), labels: ["GU-Partner"] }),
  firma({ id: "f-baufrosch", name: "Bau Frosch GmbH", arten: ["Generalunternehmer"], ort: "Berlin", plz: "12043", status: "Aktiv", letzterKontakt: d(-46), labels: ["GU-Partner"] }),
  firma({ id: "f-malerwerk", name: "MalerWerk GmbH", arten: ["Generalunternehmer"], ort: "Berlin", plz: "10997", status: "Aktiv", letzterKontakt: d(-25) }),
  firma({ id: "f-bankhaus", name: "Bankhaus Richter", arten: ["Finanzierer"], rechtsform: "KG", ort: "Frankfurt", plz: "60313", status: "Aktiv", letzterKontakt: d(-53) }),
  firma({ id: "f-financoncept", name: "FinanConcept GmbH", arten: ["Finanzierer", "Makler"], ort: "Berlin", plz: "10178", status: "Aktiv", letzterKontakt: d(-50) }),
  firma({ id: "f-simple", name: "Simple Invest GmbH", arten: ["Makler", "Investor"], ort: "Berlin", plz: "10623", status: "Aktiv", letzterKontakt: d(-15) }),
  firma({ id: "f-sparkasse", name: "Sparkasse Berlin (Test)", arten: ["Finanzierer"], rechtsform: "Sonstige", ort: "Berlin", plz: "10117", status: "Potenzial", letzterKontakt: d(-70) }),
  firma({ id: "f-privateigentum", name: "Privateigentum Legrand", arten: ["Sonstige"], rechtsform: "Sonstige", ort: "Berlin", plz: "10777", status: "Inaktiv", letzterKontakt: d(-120) }),
];

type P = Partial<Person> & Pick<Person, "id" | "anrede" | "vorname" | "nachname" | "ort" | "status">;
const person = (p: P): Person => ({
  bereiche: [],
  titel: "",
  geburtsdatum: "",
  email: `${p.vorname[0].toLowerCase()}.${p.nachname.toLowerCase().replace(/[^a-z]/g, "")}@beispiel.test`,
  telefonMobil: "",
  telefonGeschaeftlich: "",
  linkedin: "",
  betreuerId: MK,
  quelle: "Netzwerk",
  favorit: false,
  strasse: "",
  plz: "",
  land: "Deutschland",
  erstelltAm: "2026-04-01",
  letzterKontakt: d(-40),
  kontakte: [],
  ...p,
});
const k = (unternehmenId: string, position: string, rolle: Kontaktverknuepfung["rolle"], extra: Partial<Kontaktverknuepfung> = {}): Kontaktverknuepfung => ({
  unternehmenId, position, rolle, abteilung: extra.abteilung ?? "Geschäftsführung", ...extra,
});

const personenRoh: Person[] = [
  person({ id: "p-hoffmann", anrede: "Herr", titel: "Dr.", vorname: "Stefan", nachname: "Hoffmann", ort: "Bad Reichenhall", status: "Aktiv", email: "s.hoffmann@montesana-ag.de", telefonGeschaeftlich: "+49 8651 123400", kontakte: [k("f-montesana", "Vorstandsvorsitzender (CEO)", "Entscheider", { leitung: true })], letzterKontakt: d(-30) }),
  person({ id: "p-berger", anrede: "Frau", vorname: "Katharina", nachname: "Berger", ort: "Bad Reichenhall", status: "Aktiv", email: "k.berger@montesana-ag.de", telefonGeschaeftlich: "+49 8651 123401", kontakte: [k("f-montesana", "Head of Real Estate", "Projektkontakt", { haupt: true, abteilung: "Real Estate" }), k("f-schoeneberg", "Geschäftsführerin", "Entscheider", { haupt: true })], letzterKontakt: d(-25) }),
  person({ id: "p-brandes", anrede: "Herr", vorname: "Kay", nachname: "Brandes", ort: "Berlin", status: "Aktiv", email: "kay.brandes@kb-immo.de", telefonMobil: "+49 30 555 1234", kontakte: [k("f-brandes", "Inhaber", "Partner", { haupt: true, leitung: true })], letzterKontakt: d(-30) }),
  person({ id: "p-sander", anrede: "Herr", vorname: "Markus", nachname: "Sander", ort: "Hamburg", status: "Aktiv", email: "m.sander@sander-bau.de", telefonGeschaeftlich: "+49 30 450 9987", kontakte: [k("f-sander", "Geschäftsführer", "GU-Partner", { haupt: true, leitung: true })], letzterKontakt: d(-35) }),
  person({ id: "p-brinkmann", anrede: "Herr", vorname: "Thomas", nachname: "Brinkmann", ort: "Zürich", land: "Schweiz", status: "In Kontakt", email: "t.brinkmann@gravitation.capital", telefonGeschaeftlich: "+41 44 555 6677", kontakte: [k("f-gravitation", "Managing Partner", "Investor", { haupt: true, leitung: true })], letzterKontakt: d(-38) }),
  person({ id: "p-fidanzeskina", anrede: "Frau", vorname: "Anna", nachname: "Fidanzeskina", ort: "Erzgebirge", status: "In Kontakt", email: "a.fidanzeskina@das-erz.de", telefonGeschaeftlich: "+49 371 998877", kontakte: [k("f-erz", "Director Investments", "Projektkontakt", { haupt: true, abteilung: "Investments" })], letzterKontakt: d(-49) }),
  person({ id: "p-litus", anrede: "Herr", vorname: "Andrey", nachname: "Litus", ort: "Bad Reichenhall", status: "Aktiv", email: "a.litus@montesana-ag.de", telefonMobil: "+41 79 123 4567", kontakte: [k("f-montesana", "Projektentwickler", "Projektentwickler", { abteilung: "Projektentwicklung" })], sanierung: { status: "In Planung", seit: "2026-08-01", interessen: ["Teilsanierung"], regionen: "Bad Reichenhall", zeitrahmen: "3–6 Monate", prioritaet: "Normal" }, letzterKontakt: d(-53) }),
  person({ id: "p-legrand", anrede: "Herr", vorname: "Oscar", nachname: "Legrand", ort: "Berlin", plz: "10777", strasse: "Malplaquetstraße 39", status: "Aktiv", geburtsdatum: "1982-03-14", email: "oscar.legrand@email.com", telefonMobil: "+49 176 12345678", linkedin: "https://www.linkedin.com/in/oscar-legrand", kontakte: [k("f-privateigentum", "Eigentümer", "Privatkunde", { haupt: true, abteilung: "" })], privat: { status: "Aktiv", seit: "2026-08-12", interessen: ["Kauf (Eigennutzung)", "Sanierung / Modernisierung"], regionen: "Berlin", zeitrahmen: "6–12 Monate", prioritaet: "Hoch", budget: 1_800_000 }, favorit: true, letzterKontakt: d(-42) }),
  person({ id: "p-ghazzawi", anrede: "Frau", vorname: "Nauf", nachname: "Ghazzawi", ort: "Potsdam", status: "In Kontakt", email: "n.ghazzawi@email.de", telefonMobil: "+49 176 9876543", privat: { status: "Aktiv", seit: "2026-07-20", interessen: ["Neubau / Innenausbau"], regionen: "Potsdam", zeitrahmen: "3–6 Monate", prioritaet: "Normal", budget: 600_000 }, sanierung: { status: "Angebotsphase", seit: "2026-07-20", interessen: ["Neubau / Ausbau", "Innenausbau"], regionen: "Potsdam", zeitrahmen: "3–6 Monate", prioritaet: "Hoch" }, letzterKontakt: d(-40) }),
  person({ id: "p-keil", anrede: "Herr", vorname: "Alexander", nachname: "Keil", ort: "Berlin", plz: "12045", strasse: "Weichselstraße 20", status: "Aktiv", geburtsdatum: "1982-03-14", email: "a.keil@email.de", telefonMobil: "+49 176 123456789", linkedin: "https://www.linkedin.com/in/alexander-keil", privat: { status: "Aktiv", seit: "2026-08-12", interessen: ["Sanierung / Modernisierung"], regionen: "Berlin", zeitrahmen: "0–3 Monate", prioritaet: "Hoch", budget: 250_000 }, sanierung: { status: "Aktiv", seit: "2026-08-12", interessen: ["Komplettsanierung", "Bad / Sanitär"], regionen: "Berlin", zeitrahmen: "0–3 Monate", prioritaet: "Hoch" }, favorit: true, letzterKontakt: d(-46) }),
  person({ id: "p-ozden", anrede: "Herr", vorname: "Kubilay", nachname: "Ozden", ort: "Berlin", status: "In Kontakt", privat: { status: "In Kontakt", seit: "2026-09-28", interessen: ["Sanierung / Modernisierung"], regionen: "Berlin", zeitrahmen: "3–6 Monate", prioritaet: "Normal", budget: 400_000 }, sanierung: { status: "In Planung", seit: "2026-09-28", interessen: ["Küche", "Innenausbau"], regionen: "Berlin", zeitrahmen: "3–6 Monate", prioritaet: "Normal" }, letzterKontakt: d(-59) }),
  person({ id: "p-doerwald", anrede: "Herr", vorname: "Frank", nachname: "Doerwald", ort: "Zirchow (Usedom)", status: "Aktiv", privat: { status: "Aktiv", seit: "2026-06-10", interessen: ["Ferienimmobilie"], regionen: "Usedom", zeitrahmen: "6–12 Monate", prioritaet: "Normal", budget: 900_000 }, sanierung: { status: "Aktiv", seit: "2026-06-10", interessen: ["Umbau / Grundriss"], regionen: "Usedom", zeitrahmen: "6–12 Monate", prioritaet: "Normal" }, letzterKontakt: d(-30) }),
  person({ id: "p-weber", anrede: "Frau", vorname: "Claudia", nachname: "Weber", ort: "Düsseldorf", status: "In Kontakt", email: "c.weber@familyoffice.de", telefonGeschaeftlich: "+49 211 998877", kontakte: [k("f-weber", "Inhaberin", "Investor", { haupt: true, leitung: true })], privat: { status: "Qualifiziert", seit: "2026-05-02", interessen: ["Kauf (Kapitalanlage)"], regionen: "NRW", zeitrahmen: "6–12 Monate", prioritaet: "Normal", budget: 2_000_000 }, sanierung: { status: "Suchauftrag", seit: "2026-05-02", interessen: ["Komplettsanierung"], regionen: "NRW", zeitrahmen: "> 12 Monate", prioritaet: "Niedrig" }, letzterKontakt: d(-32) }),
  person({ id: "p-fischer", anrede: "Herr", vorname: "Tobias", nachname: "Fischer", ort: "Hamburg", status: "Aktiv", email: "t.fischer@alpen-immobilien.de", telefonGeschaeftlich: "+49 89 123456", kontakte: [k("f-alpen", "Acquisitions", "Projektkontakt", { abteilung: "Acquisitions" })], privat: { status: "Aktiv", seit: "2026-06-01", interessen: ["Verkauf"], regionen: "Hamburg", zeitrahmen: "3–6 Monate", prioritaet: "Normal", budget: 800_000 }, sanierung: { status: "In Kontakt", seit: "2026-06-01", interessen: ["Teilsanierung"], regionen: "Hamburg", zeitrahmen: "3–6 Monate", prioritaet: "Normal" }, letzterKontakt: d(-44) }),
  person({ id: "p-sommer", anrede: "Frau", vorname: "Julia", nachname: "Sommer", ort: "Berlin", status: "Aktiv", privat: { status: "Suchauftrag", seit: "2026-07-01", interessen: ["Kauf (Eigennutzung)", "Suchauftrag"], regionen: "Berlin", zeitrahmen: "6–12 Monate", prioritaet: "Normal", budget: 1_200_000 }, sanierung: { status: "Aktiv", seit: "2026-07-01", interessen: ["Bad / Sanitär", "Innenausbau"], regionen: "Berlin", zeitrahmen: "0–3 Monate", prioritaet: "Normal" }, letzterKontakt: d(-47) }),
  person({ id: "p-mlehmann", anrede: "Herr", vorname: "Markus", nachname: "Lehmann", ort: "München", status: "In Kontakt", privat: { status: "In Kontakt", seit: "2026-07-15", interessen: ["Sanierung / Modernisierung"], regionen: "München", zeitrahmen: "3–6 Monate", prioritaet: "Normal", budget: 500_000 }, sanierung: { status: "Aktiv", seit: "2026-07-15", interessen: ["Fassade / Dämmung"], regionen: "München", zeitrahmen: "3–6 Monate", prioritaet: "Normal" }, letzterKontakt: d(-50) }),
  person({ id: "p-srichter", anrede: "Frau", vorname: "Sabine", nachname: "Richter", ort: "Berlin", status: "Aktiv", privat: { status: "Aktiv", seit: "2026-05-20", interessen: ["Verkauf"], regionen: "Berlin-Zehlendorf", zeitrahmen: "0–3 Monate", prioritaet: "Hoch", budget: 1_500_000 }, letzterKontakt: d(-53) }),
  person({ id: "p-rossi", anrede: "Herr", vorname: "Marcello", nachname: "Rossi", ort: "Berlin", status: "Aktiv", privat: { status: "Qualifiziert", seit: "2026-06-18", interessen: ["Kauf (Kapitalanlage)"], regionen: "Berlin", zeitrahmen: "6–12 Monate", prioritaet: "Normal", budget: 3_000_000 }, sanierung: { status: "Qualifiziert", seit: "2026-06-18", interessen: ["Komplettsanierung"], regionen: "Berlin", zeitrahmen: "6–12 Monate", prioritaet: "Normal" }, letzterKontakt: d(-56) }),
  person({ id: "p-lange", anrede: "Frau", vorname: "Eva", nachname: "Lange", ort: "Potsdam", status: "In Kontakt", privat: { status: "In Kontakt", seit: "2026-09-24", interessen: ["Neubau / Innenausbau"], regionen: "Potsdam", zeitrahmen: "3–6 Monate", prioritaet: "Normal", budget: 1_100_000 }, sanierung: { status: "Qualifiziert", seit: "2026-09-24", interessen: ["Innenausbau"], regionen: "Potsdam", zeitrahmen: "3–6 Monate", prioritaet: "Normal" }, letzterKontakt: d(-59) }),
  person({ id: "p-reitemeyer", anrede: "Herr", vorname: "Andre", nachname: "Reitemeyer", ort: "Berlin", status: "Aktiv", email: "andre@noodles-berlin.de", telefonMobil: "+49 30 7894561", kontakte: [k("f-noodles", "Inhaber", "Empfehlungspartner", { haupt: true, leitung: true })], letzterKontakt: d(-59) }),
  person({ id: "p-proetel", anrede: "Herr", vorname: "Jannis", nachname: "Proetel", ort: "Berlin", status: "Aktiv", email: "proetel@kuechen-aktiv.de", telefonGeschaeftlich: "+49 5201 998877", kontakte: [k("f-kuechenaktiv", "Geschäftsführer", "Empfehlungspartner", { haupt: true, leitung: true })], letzterKontakt: d(-61) }),
  person({ id: "p-kuehn", anrede: "Herr", vorname: "Frank", nachname: "Kühn", ort: "Berlin", status: "Aktiv", email: "frank.kuehn@mf-bau.de", telefonGeschaeftlich: "+49 30 556677", kontakte: [k("f-mfbau", "Geschäftsführer", "GU-Partner", { haupt: true, leitung: true })], letzterKontakt: d(-63) }),
  person({ id: "p-huber", anrede: "Herr", vorname: "Stefan", nachname: "Huber", ort: "München", status: "In Kontakt", email: "s.huber@fo-huber.de", kontakte: [k("f-huber", "Inhaber", "Entscheider", { haupt: true, leitung: true })], letzterKontakt: d(-36) }),
  person({ id: "p-tmueller", anrede: "Herr", vorname: "Thomas", nachname: "Müller", ort: "Stuttgart", status: "In Kontakt", email: "t.mueller@privat-mueller.de", kontakte: [k("f-mueller", "Inhaber", "Investor", { haupt: true, leitung: true })], letzterKontakt: d(-38) }),
  person({ id: "p-alehmann", anrede: "Frau", titel: "Dr.", vorname: "Anna", nachname: "Lehmann", ort: "Zürich", land: "Schweiz", status: "In Kontakt", email: "a.lehmann@lehmann-partner.ch", kontakte: [k("f-lehmann", "Partnerin", "Entscheider", { haupt: true, leitung: true })], letzterKontakt: d(-39) }),
  person({ id: "p-jrichter", anrede: "Herr", vorname: "Jens", nachname: "Richter", ort: "Frankfurt", status: "Aktiv", email: "j.richter@bauwert.de", kontakte: [k("f-bauwert", "Geschäftsführer", "Investor", { haupt: true, leitung: true })], letzterKontakt: d(-42) }),
  person({ id: "p-krause", anrede: "Herr", vorname: "Michael", nachname: "Krause", ort: "Frankfurt", status: "Potenzial", email: "m.krause@rheinmain-dev.de", kontakte: [k("f-rheinmain", "Managing Partner", "Entscheider", { haupt: true, leitung: true })], letzterKontakt: d(-43) }),
  person({ id: "p-albrecht", anrede: "Frau", titel: "Dr.", vorname: "Verena", nachname: "Albrecht", ort: "München", status: "Aktiv", email: "v.albrecht@alpen-immobilien.de", kontakte: [k("f-alpen", "Geschäftsführerin", "Entscheider", { haupt: true, leitung: true })], letzterKontakt: d(-44) }),
  person({ id: "p-neumann", anrede: "Herr", vorname: "Felix", nachname: "Neumann", ort: "Hamburg", status: "In Kontakt", email: "f.neumann@nordstadt-quartier.de", kontakte: [k("f-nordstadt", "Geschäftsführer", "Entscheider", { haupt: true, leitung: true })], letzterKontakt: d(-45) }),
  person({ id: "p-frosch", anrede: "Herr", vorname: "Peter", nachname: "Frosch", ort: "Berlin", status: "Aktiv", erstelltAm: "2026-09-21", email: "p.frosch@baufrosch.de", kontakte: [k("f-baufrosch", "Geschäftsführer", "GU-Partner", { haupt: true, leitung: true })], letzterKontakt: d(-20) }),
  person({ id: "p-spannaus", anrede: "Herr", vorname: "Gino", nachname: "Spannaus", ort: "Berlin", status: "Aktiv", erstelltAm: "2026-09-30", email: "g.spannaus@simple-invest.de", kontakte: [k("f-simple", "Geschäftsführer", "Partner", { haupt: true, leitung: true })], letzterKontakt: d(-15) }),
  person({ id: "p-richter-bank", anrede: "Frau", vorname: "Helena", nachname: "Richter", ort: "Frankfurt", status: "Aktiv", erstelltAm: "2026-10-02", email: "h.richter@bankhaus-richter.de", kontakte: [k("f-bankhaus", "Firmenkundenbetreuerin", "Projektkontakt", { haupt: true, abteilung: "Firmenkunden" })], letzterKontakt: d(-53) }),
];

type VorhabenRoh = Omit<Vorhaben, "geschaeftsbereich" | "rolle"> & Partial<Pick<Vorhaben, "geschaeftsbereich" | "rolle">>;

const vorhabenRoh: VorhabenRoh[] = [
  { id: "v-legrand-1", personId: "p-legrand", bereich: "privat", art: "Kauf (Eigennutzung)", titel: "Penthouse Charlottenburg", ort: "Berlin", beschreibung: "Eigentumswohnung, 3–4 Zimmer, Berlin-Charlottenburg", budget: 1_500_000, status: "Aktiv", fortschritt: 60, zeithorizont: "6–12 Monate", bild: "/testbilder/prop-2.jpg" },
  { id: "v-legrand-2", personId: "p-legrand", bereich: "privat", art: "Sanierung / Modernisierung", titel: "Malplaquetstraße 39", ort: "Berlin", beschreibung: "Wohnung Malplaquetstraße 39, Berlin", budget: 400_000, status: "In Planung", fortschritt: 30, zeithorizont: "3–6 Monate", bild: "/testbilder/prop-3.jpg" },
  { id: "v-ghazzawi-1", personId: "p-ghazzawi", bereich: "sanierung", art: "Neubau / Innenausbau", titel: "MF Neubau Potsdam", ort: "Potsdam", beschreibung: "Innenausbau Neubau", budget: 600_000, status: "Angebotsphase", fortschritt: 40, zeithorizont: "3–6 Monate", bild: "/testbilder/proj-1.jpg", unternehmenId: "f-sander", unternehmenRolle: "GU-Partner" },
  { id: "v-keil-1", personId: "p-keil", bereich: "sanierung", art: "Komplettsanierung", titel: "MFH Weichselstraße 20", ort: "Berlin", beschreibung: "Komplettsanierung – 8 WE", budget: 250_000, status: "Aktiv", fortschritt: 60, zeithorizont: "0–3 Monate", bild: "/testbilder/inv-2.jpg", unternehmenId: "f-baufrosch", unternehmenRolle: "GU-Partner", geplanterStart: "Q4/2026", geplanteFertigstellung: "Q3/2027" },
  { id: "v-keil-2", personId: "p-keil", bereich: "sanierung", art: "Bad / Innenausbau", titel: "Eigentumswohnung", ort: "Berlin-Charlottenburg", beschreibung: "Bad + Innenausbau", budget: 45_000, status: "In Planung", fortschritt: 30, zeithorizont: "3–6 Monate", bild: "/testbilder/prop-2.jpg" },
  { id: "v-ozden-1", personId: "p-ozden", bereich: "sanierung", art: "Küche / Innenausbau", titel: "Malplaquetstraße 39", ort: "Berlin", beschreibung: "Küche und Innenausbau", budget: 400_000, status: "In Planung", fortschritt: 20, zeithorizont: "3–6 Monate", unternehmenId: "f-kuechenaktiv", unternehmenRolle: "Ausführender Betrieb" },
  { id: "v-doerwald-1", personId: "p-doerwald", bereich: "privat", art: "Ferienimmobilie", titel: "Beach House Usedom", ort: "Zirchow (Usedom)", beschreibung: "Ferienhaus mit Umbau", budget: 900_000, status: "Aktiv", fortschritt: 50, zeithorizont: "6–12 Monate", bild: "/testbilder/proj-2.jpg" },
  { id: "v-weber-1", personId: "p-weber", bereich: "privat", art: "Kauf (Kapitalanlage)", titel: "Mehrfamilienhaus NRW", ort: "Düsseldorf", beschreibung: "MFH als Kapitalanlage", budget: 2_000_000, status: "In Planung", fortschritt: 20, zeithorizont: "6–12 Monate" },
  { id: "v-fischer-1", personId: "p-fischer", bereich: "privat", art: "Verkauf", titel: "ETW Hamburg", ort: "Hamburg", beschreibung: "Verkauf Eigentumswohnung", budget: 800_000, status: "Aktiv", fortschritt: 40, zeithorizont: "3–6 Monate" },
  { id: "v-sommer-1", personId: "p-sommer", bereich: "privat", art: "Kauf (Eigennutzung)", titel: "Off-Market Suche", ort: "Berlin", beschreibung: "Suchauftrag Altbauwohnung", budget: 1_200_000, status: "Aktiv", fortschritt: 20, zeithorizont: "6–12 Monate" },
  { id: "v-sommer-2", personId: "p-sommer", bereich: "sanierung", art: "Bad / Innenausbau", titel: "Eigentumswohnung", ort: "Berlin", beschreibung: "Badsanierung", budget: 180_000, status: "Aktiv", fortschritt: 50, zeithorizont: "0–3 Monate" },
  { id: "v-sommer-0", personId: "p-sommer", bereich: "sanierung", art: "Bad / Sanitär", titel: "Gäste-WC Altbauwohnung", ort: "Berlin", beschreibung: "Abgeschlossene Badsanierung", budget: 28_000, status: "Abgeschlossen", fortschritt: 100, zeithorizont: "Sofort", geplanterStart: "Q2/2026", geplanteFertigstellung: "Q3/2026" },
  { id: "v-mlehmann-1", personId: "p-mlehmann", bereich: "sanierung", art: "Fassade / Dämmung", titel: "Wohnung Sendling", ort: "München", beschreibung: "Fassade und Dämmung", budget: 500_000, status: "Aktiv", fortschritt: 35, zeithorizont: "3–6 Monate" },
  { id: "v-srichter-1", personId: "p-srichter", bereich: "privat", art: "Verkauf", titel: "Einfamilienhaus Zehlendorf", ort: "Berlin", beschreibung: "Verkauf EFH", budget: 1_500_000, status: "Aktiv", fortschritt: 55, zeithorizont: "0–3 Monate" },
  { id: "v-rossi-1", personId: "p-rossi", bereich: "privat", art: "Kauf (Kapitalanlage)", titel: "MFH Berlin", ort: "Berlin", beschreibung: "Kapitalanlage MFH", budget: 3_000_000, status: "In Planung", fortschritt: 25, zeithorizont: "6–12 Monate" },
  { id: "v-rossi-2", personId: "p-rossi", bereich: "sanierung", art: "Sanierung / Modernisierung", titel: "EFH Zehlendorf", ort: "Berlin", beschreibung: "Modernisierung EFH", budget: 1_500_000, status: "In Planung", fortschritt: 15, zeithorizont: "6–12 Monate" },
  { id: "v-lange-1", personId: "p-lange", bereich: "sanierung", art: "Innenausbau", titel: "DHH Potsdam", ort: "Potsdam", beschreibung: "Innenausbau Doppelhaushälfte", budget: 1_100_000, status: "In Planung", fortschritt: 15, zeithorizont: "3–6 Monate" },
  { id: "v-litus-1", personId: "p-litus", bereich: "sanierung", art: "Renovierung", titel: "Hotel das ERZ", ort: "Erzgebirge", beschreibung: "Renovierung Hotelzimmer", budget: 800_000, status: "In Planung", fortschritt: 20, zeithorizont: "3–6 Monate", unternehmenId: "f-erz", unternehmenRolle: "Bauherr" },
];


// ---------- Objekte & Vorgänge je Geschäftsbereich ----------
// Ein Objekt existiert genau einmal. Je Geschäftsbereich gibt es einen eigenen Vorgang (Vorhaben) mit objektId.
// Übernommen werden nur eindeutige Bezüge (gleiche Adresse/Bezeichnung, Dashboard- und Finanz-Referenzen).

export const objekte: Objekt[] = [
  { id: "o-penthouse-charlottenburg", titel: "Penthouse Charlottenburg", ort: "Berlin", bild: "/testbilder/prop-2.jpg" },
  { id: "o-malplaquet-39", titel: "Malplaquetstraße 39", ort: "Berlin", bild: "/testbilder/prop-3.jpg" },
  { id: "o-mf-neubau-potsdam", titel: "MF Neubau Potsdam", ort: "Potsdam", bild: "/testbilder/proj-1.jpg" },
  { id: "o-weichsel-20", titel: "MFH Weichselstraße 20", ort: "Berlin", bild: "/testbilder/inv-2.jpg" },
  { id: "o-etw-charlottenburg", titel: "Eigentumswohnung", ort: "Berlin-Charlottenburg", bild: "/testbilder/prop-2.jpg" },
  { id: "o-beach-house-usedom", titel: "Beach House Usedom", ort: "Zirchow (Usedom)", bild: "/testbilder/proj-2.jpg" },
  { id: "o-mfh-nrw", titel: "Mehrfamilienhaus NRW", ort: "Düsseldorf" },
  { id: "o-etw-hamburg", titel: "ETW Hamburg", ort: "Hamburg" },
  { id: "o-etw-sommer", titel: "Eigentumswohnung", ort: "Berlin" },
  { id: "o-altbau-sommer", titel: "Gäste-WC Altbauwohnung", ort: "Berlin" },
  { id: "o-wohnung-sendling", titel: "Wohnung Sendling", ort: "München" },
  { id: "o-efh-zehlendorf-richter", titel: "Einfamilienhaus Zehlendorf", ort: "Berlin", hinweis: "Möglicherweise identisch mit „EFH Zehlendorf“ (Marcello Rossi) – nicht automatisch zusammengeführt, bitte prüfen." },
  { id: "o-efh-zehlendorf-rossi", titel: "EFH Zehlendorf", ort: "Berlin", hinweis: "Möglicherweise identisch mit „Einfamilienhaus Zehlendorf“ (Stefan Richter) – nicht automatisch zusammengeführt, bitte prüfen." },
  { id: "o-mfh-berlin-rossi", titel: "MFH Berlin", ort: "Berlin" },
  { id: "o-dhh-potsdam", titel: "DHH Potsdam", ort: "Potsdam" },
  { id: "o-hotel-erz", titel: "Hotel das ERZ", ort: "Erzgebirge", bild: "/testbilder/inv-3.jpg" },
  { id: "o-montesana", titel: "Montesana", ort: "Bad Reichenhall (DE/CH)", bild: "/testbilder/inv-1.jpg" },
  { id: "o-schoeneberg-mfh", titel: "Berlin-Schöneberg (MFH)", ort: "Berlin", bild: "/testbilder/inv-2.jpg" },
  { id: "o-brautstrasse-29", titel: "Brautstraße 29", ort: "Berlin" },
];

const OBJEKT_VON_VORHABEN: Record<string, { objektId?: string; referenz?: string }> = {
  "v-legrand-1": { objektId: "o-penthouse-charlottenburg", referenz: "Property-Mandat prop-2 (Dashboard)" },
  "v-legrand-2": { objektId: "o-malplaquet-39" },
  "v-ghazzawi-1": { objektId: "o-mf-neubau-potsdam", referenz: "Projects-Projekt proj-1 „Potsdam (Neubau)“ (Dashboard), RE-2026-002" },
  "v-keil-1": { objektId: "o-weichsel-20" },
  "v-keil-2": { objektId: "o-etw-charlottenburg" },
  "v-ozden-1": { objektId: "o-malplaquet-39" },
  "v-doerwald-1": { objektId: "o-beach-house-usedom" },
  "v-weber-1": { objektId: "o-mfh-nrw" },
  "v-fischer-1": { objektId: "o-etw-hamburg" },
  "v-sommer-1": {}, // Suchauftrag – noch kein konkretes Objekt
  "v-sommer-2": { objektId: "o-etw-sommer" },
  "v-sommer-0": { objektId: "o-altbau-sommer" },
  "v-mlehmann-1": { objektId: "o-wohnung-sendling" },
  "v-srichter-1": { objektId: "o-efh-zehlendorf-richter" },
  "v-rossi-1": { objektId: "o-mfh-berlin-rossi" },
  "v-rossi-2": { objektId: "o-efh-zehlendorf-rossi" },
  "v-lange-1": { objektId: "o-dhh-potsdam" },
  "v-litus-1": { objektId: "o-hotel-erz" },
};

/** Vorgänge ohne Privatkunden: Investment-Deals (Dashboard) und Finanzreferenzen (INV-/PROP-/PRO-…) */
const fv = (x: Partial<Vorhaben> & Pick<Vorhaben, "id" | "titel" | "art" | "geschaeftsbereich">): Vorhaben => ({
  ort: "", beschreibung: "", budget: 0, status: "Aktiv", fortschritt: 0, zeithorizont: "", rolle: "", herkunft: "abgeleitet", ...x,
});
const U_ = (id: string, rolle: string) => ({ art: "unternehmen" as const, id, rolle });
const P_ = (id: string, rolle: string) => ({ art: "person" as const, id, rolle });
const OHNE_OBJEKT = "Objekt in den Testdaten noch nicht zugeordnet";

const weitereVorgaenge: Vorhaben[] = [
  fv({ id: "v-inv-montesana", objektId: "o-montesana", titel: "Montesana", ort: "Bad Reichenhall (DE/CH)", art: "Investment-Transaktion", geschaeftsbereich: "Investment", budget: 1_200_000, fortschritt: 60, referenz: "Investment-Deal inv-1 (Dashboard)", beteiligte: [U_("f-montesana", "Verkäufer / Bestandshalter")], grund: "Top Investment-Deal „Montesana“", bild: "/testbilder/inv-1.jpg" }),
  fv({ id: "v-inv-schoeneberg", objektId: "o-schoeneberg-mfh", titel: "Berlin-Schöneberg (MFH)", ort: "Berlin", art: "Investment-Transaktion", geschaeftsbereich: "Investment", budget: 2_900_000, fortschritt: 70, referenz: "Investment-Deal inv-2 (Dashboard)", beteiligte: [U_("f-schoeneberg", "Projektentwickler")], pruefen: "Investor (Käufer) in den Testdaten nicht eindeutig benannt – bitte zuordnen", grund: "Top Investment-Deal „Berlin-Schöneberg (MFH)“", bild: "/testbilder/inv-2.jpg" }),
  fv({ id: "v-inv-erz", objektId: "o-hotel-erz", titel: "das ERZ", ort: "Erzgebirge", art: "Investment-Transaktion", geschaeftsbereich: "Investment", budget: 800_000, fortschritt: 40, referenz: "Investment-Deal inv-3 (Dashboard)", beteiligte: [U_("f-erz", "Bestandshalter")], grund: "Top Investment-Deal „das ERZ“", bild: "/testbilder/inv-3.jpg" }),
  fv({ id: "v-ref-inv-001", titel: "INV-2026-001", art: "Investment-Transaktion", geschaeftsbereich: "Investment", referenz: "INV-2026-001", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-simple", "Provisionsbeteiligter"), P_("p-spannaus", "Provisionsbeteiligter"), P_("p-brandes", "Empfehlungspartner"), U_("f-brandes", "Empfehlungspartner"), P_("p-brinkmann", "Empfehlungspartner")], grund: "Verbindlichkeiten VB-2026-014/-015/-016 (Finanzen)" }),
  fv({ id: "v-ref-inv-002", titel: "INV-2026-002", art: "Investment-Transaktion", geschaeftsbereich: "Investment", referenz: "INV-2026-002", pruefen: OHNE_OBJEKT, beteiligte: [P_("p-brinkmann", "Empfehlungspartner")], grund: "Verbindlichkeit VB-2026-011 (Finanzen)" }),
  fv({ id: "v-ref-inv-003", titel: "INV-2026-003", art: "Investment-Transaktion", geschaeftsbereich: "Investment", referenz: "INV-2026-003", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-financoncept", "Provisionsbeteiligter")], grund: "Verbindlichkeit VB-2026-001 (Finanzen)" }),
  fv({ id: "v-ref-inv-004", titel: "INV-2026-004", art: "Investment-Transaktion", geschaeftsbereich: "Investment", referenz: "INV-2026-004", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-simple", "Provisionsbeteiligter"), P_("p-spannaus", "Provisionsbeteiligter")], grund: "Verbindlichkeit VB-2026-006 (Finanzen)" }),
  fv({ id: "v-ref-inv-005", titel: "INV-2026-005", art: "Investment-Transaktion", geschaeftsbereich: "Investment", referenz: "INV-2026-005", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-financoncept", "Provisionsbeteiligter")], grund: "Verbindlichkeit VB-2026-008 (Finanzen)" }),
  fv({ id: "v-ref-prop-002", titel: "PROP-2026-002", art: "Property-Vermittlung", geschaeftsbereich: "Property", referenz: "PROP-2026-002", pruefen: OHNE_OBJEKT, beteiligte: [P_("p-brinkmann", "Empfehlungspartner")], grund: "Verbindlichkeit VB-2026-003 (Finanzen)" }),
  fv({ id: "v-ref-prop-003", titel: "PROP-2026-003", art: "Property-Vermittlung", geschaeftsbereich: "Property", referenz: "PROP-2026-003", pruefen: OHNE_OBJEKT, beteiligte: [P_("p-brandes", "Empfehlungspartner"), U_("f-brandes", "Empfehlungspartner")], grund: "Verbindlichkeit VB-2026-007 (Finanzen)" }),
  fv({ id: "v-prop-brautstrasse", objektId: "o-brautstrasse-29", titel: "Brautstraße 29", ort: "Berlin", art: "Objektbesichtigung", geschaeftsbereich: "Property", beteiligte: [P_("p-brandes", "Rolle offen")], pruefen: "Nur Termin „Objektbesichtigung“ vorhanden – Rolle von Kay Brandes (Interessent, Eigentümer oder Makler) und Vorgangsart bitte prüfen", grund: "Termin „Objektbesichtigung Brautstraße 29“ (Property)" }),
  fv({ id: "v-ref-pro-002", titel: "PRO-2026-002", art: "Projects-Projekt", geschaeftsbereich: "Projects", referenz: "PRO-2026-002", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-malerwerk", "Ausführender Betrieb")], grund: "Verbindlichkeit VB-2026-002 (Finanzen)" }),
  fv({ id: "v-ref-pro-004", titel: "PRO-2026-004", art: "Projects-Projekt", geschaeftsbereich: "Projects", referenz: "PRO-2026-004", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-malerwerk", "Ausführender Betrieb")], grund: "Verbindlichkeit VB-2026-013 (Finanzen)" }),
  fv({ id: "v-ref-pro-003", titel: "PRO-2026-003", art: "Projects-Projekt", geschaeftsbereich: "Projects", referenz: "PRO-2026-003", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-sander", "GU-Partner")], grund: "Verbindlichkeit VB-2026-005 (Finanzen)" }),
  fv({ id: "v-ref-pro-006", titel: "PRO-2026-006", art: "Projects-Projekt", geschaeftsbereich: "Projects", referenz: "PRO-2026-006", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-sander", "GU-Partner")], grund: "Verbindlichkeit VB-2026-009 (Finanzen)" }),
  fv({ id: "v-ref-pro-010", titel: "PRO-2026-010", art: "Projects-Projekt", geschaeftsbereich: "Projects", referenz: "PRO-2026-010", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-bankhaus", "Finanzierer")], grund: "Verbindlichkeit VB-2026-010 (Finanzen)" }),
  fv({ id: "v-ref-pro-012", titel: "PRO-2026-012", art: "Projects-Projekt", geschaeftsbereich: "Projects", referenz: "PRO-2026-012", pruefen: OHNE_OBJEKT, beteiligte: [U_("f-kuechenaktiv", "Ausführender Betrieb")], grund: "Verbindlichkeit VB-2026-012 (Finanzen)" }),
];

export const vorhaben: Vorhaben[] = [
  ...vorhabenRoh.map((v): Vorhaben => {
    const e = einstufen(v);
    return { ...OBJEKT_VON_VORHABEN[v.id], ...v, geschaeftsbereich: e.geschaeftsbereich, rolle: e.rolle, pruefen: e.pruefen, herkunft: "abgeleitet", grund: `Vorgangsart „${v.art}“${v.bereich === "sanierung" ? " (Sanierungskunde)" : ""}` };
  }),
  ...weitereVorgaenge,
];

let n = 0;
const a = (x: Omit<Aktivitaet, "id" | "verantwortlichId" | "erledigt" | "beschreibung"> & Partial<Aktivitaet>): Aktivitaet => ({
  id: `a-${++n}`, verantwortlichId: MK, erledigt: false, beschreibung: "", ...x,
});
const U = (id: string) => ({ art: "unternehmen" as const, id });
const Pn = (id: string) => ({ art: "person" as const, id });

export const aktivitaeten: Aktivitaet[] = [
  // heute
  a({ typ: "Termin", titel: "Call mit Investoren", beschreibung: "Update Kaufpreisindikation", datum: d(0), von: "09:00", bis: "10:00", terminArt: "video", bezug: [U("f-montesana"), Pn("p-hoffmann")] }),
  a({ typ: "Termin", titel: "Objektbesichtigung", beschreibung: "Brautstraße 29, Berlin – mit Kay Brandes", datum: d(0), von: "11:30", bis: "12:30", terminArt: "vor-ort", bezug: [Pn("p-brandes")], kontext: "Brautstraße 29 (Property)" }),
  a({ typ: "Aufgabe", titel: "Strategie & Vermarktung", beschreibung: "Abstimmung Vermarktungsunterlagen", datum: d(0), von: "14:00", bis: "15:00", bezug: [Pn("p-brandes"), U("f-brandes")] }),
  a({ typ: "Termin", titel: "Status Update", beschreibung: "Montesana – nächste Schritte", datum: d(0), von: "16:00", bis: "17:00", terminArt: "video", bezug: [U("f-montesana")], kontext: "Projekt Montesana" }),
  // nächste Tage
  a({ typ: "Termin", titel: "Angebotsprüfung", beschreibung: "Sander Bau GmbH – vor Due Diligence", datum: d(1), von: "10:00", bis: "11:00", terminArt: "persoenlich", bezug: [U("f-sander"), Pn("p-sander")] }),
  a({ typ: "Termin", titel: "Käufergespräch", beschreibung: "Berlin-Schöneberg (MFH) – konkrete Interessen", datum: d(1), von: "13:00", bis: "14:00", terminArt: "video", bezug: [U("f-schoeneberg")], kontext: "Projekt Berlin-Schöneberg" }),
  a({ typ: "Aufgabe", titel: "NDA senden", beschreibung: "Potsdamer Straße – an Family Office", datum: d(2), von: "09:00", bis: "10:00", bezug: [U("f-huber")] }),
  a({ typ: "Termin", titel: "Interne Abstimmung", beschreibung: "Sanierungsberatung – Projektunterlagen", datum: d(2), von: "11:00", bis: "12:00", terminArt: "persoenlich", bezug: [], kontext: "Projekt Sanierungsberatung" }),
  a({ typ: "Termin", titel: "Vor-Ort-Termin", beschreibung: "Weichselstraße 20", datum: d(3), von: "09:00", bis: "10:00", terminArt: "vor-ort", bezug: [Pn("p-keil"), U("f-baufrosch")] }),
  a({ typ: "Termin", titel: "Beratung Innenausbau", beschreibung: "Potsdam (Frau Ghazzawi)", datum: d(3), von: "11:00", bis: "12:00", terminArt: "persoenlich", bezug: [Pn("p-ghazzawi")] }),
  a({ typ: "Telefon", titel: "Verkaufsgespräch EFH", beschreibung: "Zehlendorf (Frau Richter)", datum: d(4), von: "14:00", bis: "14:30", terminArt: "telefon", bezug: [Pn("p-srichter")] }),
  a({ typ: "Termin", titel: "Strategiemeeting", beschreibung: "Kauf (Herr Legrand)", datum: d(5), von: "10:00", bis: "11:00", terminArt: "video", bezug: [Pn("p-legrand")] }),
  a({ typ: "Termin", titel: "Baubesprechung", beschreibung: "Malplaquetstraße 39", datum: d(4), von: "11:00", bis: "12:00", terminArt: "persoenlich", bezug: [Pn("p-ozden")] }),
  a({ typ: "Aufgabe", titel: "Materialauswahl", beschreibung: "Sanitär & Fliesen", datum: d(8), von: "10:00", bezug: [Pn("p-keil")] }),
  a({ typ: "E-Mail", titel: "Unterlagen Finanzierung", beschreibung: "Finanzierungsunterlagen an Sparkasse", datum: d(6), bezug: [Pn("p-legrand"), U("f-sparkasse")] }),
  a({ typ: "Aufgabe", titel: "Teaser Montesana senden", datum: d(0), bezug: [U("f-montesana")] }),
  // überfällig
  a({ typ: "Aufgabe", titel: "Käuferliste aktualisieren", beschreibung: "Investoren für Berlin-Schöneberg", datum: d(-2), bezug: [U("f-schoeneberg")] }),
  a({ typ: "E-Mail", titel: "Follow-up E-Mail", beschreibung: "nach Erstkontakt – Family Office", datum: d(-3), bezug: [U("f-huber"), Pn("p-huber")] }),
  a({ typ: "Aufgabe", titel: "Due Diligence Unterlagen", beschreibung: "von Käufer erhalten und prüfen", datum: d(-5), bezug: [U("f-mueller")] }),
  // vergangen / erledigt
  a({ typ: "E-Mail", titel: "E-Mail", beschreibung: "Grundrissvarianten Malplaquetstraße 39", datum: d(0), von: "09:15", bezug: [Pn("p-legrand")], erledigt: true }),
  a({ typ: "Telefon", titel: "Telefon", beschreibung: "Besprechung Sanierung", datum: d(-1), von: "16:20", bezug: [Pn("p-legrand")], erledigt: true }),
  a({ typ: "Termin", titel: "Objektbesichtigung", beschreibung: "Penthouse Charlottenburg", datum: d(-42), von: "10:00", terminArt: "vor-ort", bezug: [Pn("p-legrand")], erledigt: true }),
  a({ typ: "Termin", titel: "Baubesprechung", beschreibung: "Bau Frosch GmbH", datum: d(-46), von: "10:00", terminArt: "persoenlich", bezug: [Pn("p-keil"), U("f-baufrosch")], erledigt: true }),
  a({ typ: "Termin", titel: "Call mit Investoren", beschreibung: "Montesana AG", datum: d(-30), von: "09:00", terminArt: "video", bezug: [U("f-montesana"), Pn("p-hoffmann")], erledigt: true }),
  a({ typ: "Telefon", titel: "Strategie & Vermarktung abgestimmt", datum: d(-2), von: "14:30", bezug: [Pn("p-brandes")], erledigt: true }),
  // Notizen
  a({ typ: "Notiz", titel: "Montesana", beschreibung: "Sehr positives Gespräch. Interesse an MFH im Alpenraum.", datum: d(0), von: "09:15", bezug: [U("f-montesana")] }),
  a({ typ: "Notiz", titel: "Berlin-Schöneberg", beschreibung: "Käufer zeigt konkretes Interesse. Nächster Schritt: Unterlagen.", datum: d(-2), von: "14:30", bezug: [U("f-schoeneberg")] }),
  a({ typ: "Notiz", titel: "Potsdamer Straße", beschreibung: "NDA unterzeichnet, Due Diligence startet.", datum: d(-8), von: "11:10", bezug: [U("f-huber")] }),
  a({ typ: "Notiz", titel: "Finanzierung", beschreibung: "Unterlagen zur Finanzierung zugesendet.", datum: d(-2), von: "14:30", bezug: [U("f-montesana"), Pn("p-legrand")] }),
  a({ typ: "Notiz", titel: "Charlottenburg", beschreibung: "Sehr interessiert an Charlottenburg-Objekt.", datum: d(-41), von: "09:15", bezug: [Pn("p-legrand")] }),
  a({ typ: "Notiz", titel: "Sanierung", beschreibung: "Sehr konstruktives Gespräch. Kunde favorisiert Variante B.", datum: d(-45), von: "09:15", bezug: [Pn("p-keil")] }),
  a({ typ: "Notiz", titel: "Angebot", beschreibung: "Angebot Bau Frosch erhalten und geprüft.", datum: d(-52), von: "14:30", bezug: [Pn("p-keil"), U("f-baufrosch")] }),
  a({ typ: "Notiz", titel: "Angebot Sander Bau", beschreibung: "Angebot Sander Bau erhalten.", datum: d(-35), von: "11:10", bezug: [U("f-sander")] }),
];

// ---------- Geschäftsbereiche (Investment / Property / Projects) ----------
// Nur eindeutige Beziehungen werden übernommen. Quellen: Finanz-Testdaten
// (Referenzen INV-/PROP-/PRO-…), Dashboard-Testdaten (Top-Deals/-Mandate/-Projects),
// Unternehmensarten, Kundenrollen und Vorhaben. Unklare Fälle → „Bereich prüfen“.

const ex = (bereich: Ableitung["bereich"], funktion: string, grund: string): Ableitung => ({ bereich, funktion, grund });

const EXPLIZIT_UNTERNEHMEN: Record<string, Ableitung[]> = {
  "f-montesana": [ex("Investment", "Verkäufer / Bestandshalter", "Top Investment-Deal „Montesana“ (Dashboard)")],
  "f-schoeneberg": [ex("Investment", "Projektentwickler", "Top Investment-Deal „Berlin-Schöneberg (MFH)“ (Dashboard)")],
  "f-erz": [ex("Investment", "Bestandshalter", "Top Investment-Deal „das ERZ“ (Dashboard)"), ex("Projects", "Bauherr", "Vorhaben „Hotel das ERZ“")],
  "f-brandes": [ex("Investment", "Empfehlungspartner", "Empfehlungsprovision INV-2026-001 (Finanzen)"), ex("Property", "Empfehlungspartner", "Empfehlungsprovision PROP-2026-003 (Finanzen)")],
  "f-simple": [ex("Investment", "Provisionsbeteiligter", "Provisionen INV-2026-001 / INV-2026-004 (Finanzen)")],
  "f-financoncept": [ex("Investment", "Provisionsbeteiligter", "Provisionen INV-2026-003 / INV-2026-005 (Finanzen)"), ex("Projects", "Kunde", "Rechnung RE-2026-009, Bereich Projects (Finanzen)")],
  "f-bankhaus": [ex("Projects", "Finanzierer", "Verbindlichkeit PRO-2026-010 (Finanzen)")],
  "f-malerwerk": [ex("Projects", "Ausführender Betrieb", "Verbindlichkeiten PRO-2026-002 / PRO-2026-004 (Finanzen)")],
  "f-sander": [ex("Projects", "GU-Partner", "Verbindlichkeiten PRO-2026-003 / PRO-2026-006 (Finanzen)")],
  "f-kuechenaktiv": [ex("Projects", "Ausführender Betrieb", "Verbindlichkeit PRO-2026-012 (Finanzen)")],
  "f-baufrosch": [ex("Projects", "GU-Partner", "Vorhaben „MFH Weichselstraße 20“")],
};

const EXPLIZIT_PERSONEN: Record<string, Ableitung[]> = {
  "p-brandes": [ex("Investment", "Empfehlungspartner", "Empfehlungsprovision INV-2026-001 (Finanzen)"), ex("Property", "Empfehlungspartner, Kunde", "Empfehlungsprovision PROP-2026-003, Rechnung RE-2026-008 (Finanzen)")],
  "p-brinkmann": [ex("Investment", "Empfehlungspartner", "Empfehlungsprovision INV-2026-002 (Finanzen)"), ex("Property", "Empfehlungspartner", "Empfehlungsprovision PROP-2026-002 (Finanzen)")],
  "p-spannaus": [ex("Investment", "Provisionsbeteiligter", "Provisionen INV-2026-001 / INV-2026-004 (Finanzen)")],
};

function mitBereichUnternehmen(u: Unternehmen): Unternehmen {
  const e = ableitenUnternehmen(u, EXPLIZIT_UNTERNEHMEN[u.id]);
  return { ...u, bereiche: alsZuordnungen(e.zuordnungen), bereichPruefen: e.unklar.length ? e.unklar.join("; ") : undefined };
}

export const unternehmen: Unternehmen[] = unternehmenRoh.map(mitBereichUnternehmen);
const firmenMap = new Map(unternehmen.map((u) => [u.id, u]));

export const personen: Person[] = personenRoh.map((p) => {
  const e = ableitenPerson(p, vorhaben.filter((v) => v.personId === p.id), firmenMap, EXPLIZIT_PERSONEN[p.id]);
  const pruefen = [...e.unklar, ...(e.zuordnungen.length ? [] : ["Keine eindeutige Beziehung zu einem Geschäftsbereich"])];
  return { ...p, bereiche: alsZuordnungen(e.zuordnungen), bereichPruefen: pruefen.length ? pruefen.join("; ") : undefined };
});
