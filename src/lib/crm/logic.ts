/**
 * Reine Fachlogik für Stammdaten und Aktivitäten (ohne React, testbar).
 */
import type { Aktivitaet, AktivitaetStatus, ID, Person, Unternehmen, Vorhaben } from "./types.ts";

// ---------- Datum ----------

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function datumDe(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}
const WOCHENTAGE_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
export function wochentagKurz(iso: string) {
  return WOCHENTAGE_KURZ[new Date(iso + "T00:00:00Z").getUTCDay()];
}
/** „Samstag, 10. Oktober 2026“ */
export function datumLang(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return `${WOCHENTAGE[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONATE[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
export function monatJahr(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return `${MONATE[d.getUTCMonth()].slice(0, 3)}. ${d.getUTCFullYear()}`;
}
/** Montag der Woche */
export function wochenStart(iso: string) {
  const wd = new Date(iso + "T00:00:00Z").getUTCDay();
  return addDays(iso, wd === 0 ? -6 : 1 - wd);
}

// ---------- Namen & Dubletten ----------

export function personName(p: Pick<Person, "titel" | "vorname" | "nachname">) {
  return [p.titel, p.vorname, p.nachname].filter(Boolean).join(" ");
}
export function initialen(name: string) {
  const parts = name.replace(/^(Dr\.|Prof\.)\s*/g, "").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "")).toUpperCase();
}

const RECHTSFORM_RE = /\b(gmbh\s*&\s*co\.?\s*kg|gmbh|ag|kg|ug|gbr|se|e\.?\s?k\.?|mbh|holding)\b/g;
/** Normalisierter Firmenname für den Dublettenvergleich */
export function normalisiereFirma(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(RECHTSFORM_RE, "")
    .replace(/[^a-z0-9]/g, "");
}
const norm = (s: string) => s.trim().toLowerCase();

/** Mögliche Dublette eines Unternehmens (gleicher Name ohne Rechtsform oder gleiche USt-IdNr./HRB) */
export function findeFirmenDublette(liste: Unternehmen[], kandidat: Pick<Unternehmen, "name" | "ustId" | "handelsregister">, ignoreId?: ID) {
  const n = normalisiereFirma(kandidat.name);
  return liste.find(
    (u) =>
      u.id !== ignoreId &&
      ((n && normalisiereFirma(u.name) === n) ||
        (kandidat.ustId && norm(u.ustId) === norm(kandidat.ustId)) ||
        (kandidat.handelsregister && norm(u.handelsregister) === norm(kandidat.handelsregister))),
  );
}

/** Mögliche Dublette einer Person (gleiche E-Mail oder gleicher Name + Geburtsdatum) */
export function findePersonDublette(
  liste: Person[],
  k: Pick<Person, "vorname" | "nachname" | "email" | "geburtsdatum">,
  ignoreId?: ID,
) {
  return liste.find(
    (p) =>
      p.id !== ignoreId &&
      ((k.email && norm(p.email) === norm(k.email)) ||
        (norm(p.vorname) === norm(k.vorname) &&
          norm(p.nachname) === norm(k.nachname) &&
          (!k.geburtsdatum || !p.geburtsdatum || p.geburtsdatum === k.geburtsdatum))),
  );
}

/** Paare möglicher Dubletten im Bestand (für „Datenpflege“) */
export function dublettenPaare(unternehmen: Unternehmen[], personen: Person[]) {
  const paare: { art: "Unternehmen" | "Person"; a: string; b: string; grund: string }[] = [];
  unternehmen.forEach((u, i) => {
    for (const v of unternehmen.slice(i + 1)) {
      if (normalisiereFirma(u.name) === normalisiereFirma(v.name)) paare.push({ art: "Unternehmen", a: u.name, b: v.name, grund: "Gleicher Name" });
      else if (u.ustId && norm(u.ustId) === norm(v.ustId)) paare.push({ art: "Unternehmen", a: u.name, b: v.name, grund: "Gleiche USt-IdNr." });
    }
  });
  personen.forEach((p, i) => {
    for (const q of personen.slice(i + 1)) {
      if (p.email && norm(p.email) === norm(q.email)) paare.push({ art: "Person", a: personName(p), b: personName(q), grund: "Gleiche E-Mail" });
    }
  });
  return paare;
}

// ---------- Aktivitäten ----------

export function aktivitaetStatus(a: Aktivitaet, heute: string): AktivitaetStatus {
  if (a.typ === "Notiz") return "Notiz";
  if (a.erledigt) return "Erledigt";
  if (a.datum < heute) return "Überfällig";
  if (a.datum === heute) return "Heute";
  return "Geplant";
}

export function betrifft(a: Aktivitaet, art: "unternehmen" | "person", id: ID) {
  return a.bezug.some((b) => b.art === art && b.id === id);
}

/** Aktivitäten eines Unternehmens inkl. der Aktivitäten seiner Ansprechpartner */
export function aktivitaetenFuerUnternehmen(alle: Aktivitaet[], u: Unternehmen, personen: Person[]) {
  const pids = new Set(personen.filter((p) => p.kontakte.some((k) => k.unternehmenId === u.id)).map((p) => p.id));
  return alle.filter((a) => betrifft(a, "unternehmen", u.id) || a.bezug.some((b) => b.art === "person" && pids.has(b.id)));
}

/** Letzte stattgefundene Aktivität (bis heute) bzw. Altdaten-Datum */
export function letzteAktivitaet(akt: Aktivitaet[], heute: string, fallback: string) {
  let best = fallback;
  for (const a of akt) if (a.datum <= heute && (a.erledigt || a.typ !== "Aufgabe") && a.datum > best) best = a.datum;
  return best;
}

/** Nächste offene Aktivitäten ab heute, chronologisch */
export function naechste(akt: Aktivitaet[], heute: string, n = 5) {
  return akt
    .filter((a) => !a.erledigt && a.typ !== "Notiz" && a.datum >= heute)
    .sort((x, y) => (x.datum + (x.von ?? "")).localeCompare(y.datum + (y.von ?? "")))
    .slice(0, n);
}

/** Notizen, neueste zuerst */
export function notizen(akt: Aktivitaet[], n = 3) {
  return akt
    .filter((a) => a.typ === "Notiz")
    .sort((x, y) => (y.datum + (y.von ?? "")).localeCompare(x.datum + (x.von ?? "")))
    .slice(0, n);
}

// ---------- Listen ----------

export type Sortierung<K extends string = string> = { key: K; richtung: "asc" | "desc" };

export function sortiere<T>(rows: T[], wert: (r: T) => string | number, richtung: "asc" | "desc") {
  const f = richtung === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = wert(a);
    const y = wert(b);
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "de")) * f;
  });
}

export function zaehle<T>(rows: T[], key: (r: T) => string | string[]) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    for (const v of Array.isArray(k) ? k : [k]) m.set(v, (m.get(v) ?? 0) + 1);
  }
  return m;
}

export function suchtreffer(q: string, ...felder: (string | undefined)[]) {
  const s = q.trim().toLowerCase();
  return !s || felder.some((f) => f?.toLowerCase().includes(s));
}

/** Region aus Ort ableiten (vereinfachte Zuordnung für Filter) */
export function regionVon(ort: string, land: string) {
  if (land && land !== "Deutschland") return land;
  const o = ort.toLowerCase();
  if (/berlin|potsdam|usedom|zehlendorf/.test(o)) return "Berlin / Brandenburg";
  if (/hamburg|bremen|sylt|kiel/.test(o)) return "Norddeutschland";
  if (/münchen|reichenhall|stuttgart|augsburg/.test(o)) return "Süddeutschland";
  if (/frankfurt|düsseldorf|köln|nrw|essen/.test(o)) return "West / Rhein-Main";
  if (/erzgebirge|leipzig|dresden/.test(o)) return "Ostdeutschland";
  return "Sonstige";
}

export function summeBudget(v: Vorhaben[]) {
  return v.reduce((s, x) => s + (x.budget || 0), 0);
}
