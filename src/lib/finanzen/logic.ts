/**
 * Zahlungslogik für „Finanzen → Eingang / Bezahlt“.
 *
 * Grundsätze:
 * - Forderungen (an Kunden), Verbindlichkeiten (an Partner, Dienstleister usw.)
 *   und tatsächliche Zahlungsvorgänge sind getrennte Datensätze.
 * - Als eingegangen bzw. bezahlt zählen ausschließlich Zahlungsvorgänge mit
 *   Buchungsdatum am oder vor dem Stichtag. Offene oder erwartete Beträge
 *   erscheinen nie als Zahlung.
 * - Der Status einer Zahlungszeile ist der Status des zugehörigen Belegs
 *   (Forderung bzw. Verbindlichkeit) zum Stichtag.
 *
 * Datumswerte sind ISO-Zeichenketten (JJJJ-MM-TT) und direkt vergleichbar.
 */

export type Bereich = "Investment" | "Property" | "Projects";
export const BEREICHE: Bereich[] = ["Investment", "Property", "Projects"];

export type AuszahlungTyp =
  | "Provision"
  | "Empfehlungsprovision"
  | "Bau- / GU-Leistung"
  | "Dienstleistung / Sonstiges";
export type ZahlungTyp = "Kundenzahlung" | AuszahlungTyp;
export const ZAHLUNG_TYPEN: ZahlungTyp[] = [
  "Kundenzahlung",
  "Provision",
  "Empfehlungsprovision",
  "Bau- / GU-Leistung",
  "Dienstleistung / Sonstiges",
];

/** Status des Belegs, auf den gezahlt wurde */
export type ZahlStatus = "Bezahlt" | "Teilzahlung" | "Rest überfällig";
export const ZAHL_STATUS: ZahlStatus[] = ["Bezahlt", "Teilzahlung", "Rest überfällig"];

export type Forderung = { nr: string; kunde: string; bereich: Bereich; betrag: number; faellig: string };
export type Zahlungseingang = { id: string; datum: string; rechnungNr: string; betrag: number };
export type Verbindlichkeit = {
  nr: string;
  empfaenger: string;
  referenz: string;
  bereich: Bereich;
  typ: AuszahlungTyp;
  betrag: number;
  faellig: string;
};
export type Auszahlung = { id: string; datum: string; verbindlichkeitNr: string; betrag: number };

export type EingangZeile = {
  id: string;
  datum: string;
  rechnungNr: string;
  kunde: string;
  bereich: Bereich;
  typ: "Kundenzahlung";
  betrag: number;
  status: ZahlStatus;
};

export type AuszahlungZeile = {
  id: string;
  datum: string;
  verbindlichkeitNr: string;
  empfaenger: string;
  referenz: string;
  bereich: Bereich;
  typ: AuszahlungTyp;
  betrag: number;
  status: ZahlStatus;
};

/** Summe der bis zum Stichtag tatsächlich gebuchten Zahlungen je Beleg */
function bezahltJeBeleg<T extends { datum: string; betrag: number }>(
  zahlungen: T[],
  key: (z: T) => string,
  stichtag: string,
) {
  const map = new Map<string, number>();
  for (const z of zahlungen) {
    if (z.datum > stichtag) continue;
    map.set(key(z), (map.get(key(z)) ?? 0) + z.betrag);
  }
  return map;
}

/** Status eines Belegs mit mindestens einer Zahlung */
export function zahlStatus(betrag: number, bezahlt: number, faellig: string, stichtag: string): ZahlStatus {
  if (bezahlt >= betrag) return "Bezahlt";
  return faellig < stichtag ? "Rest überfällig" : "Teilzahlung";
}

/** Tatsächliche Zahlungseingänge (neueste zuerst) */
export function eingangZeilen(forderungen: Forderung[], zahlungen: Zahlungseingang[], stichtag: string): EingangZeile[] {
  const byNr = new Map(forderungen.map((f) => [f.nr, f]));
  const bezahlt = bezahltJeBeleg(zahlungen, (z) => z.rechnungNr, stichtag);
  return zahlungen
    .filter((z) => z.datum <= stichtag && byNr.has(z.rechnungNr))
    .map((z) => {
      const f = byNr.get(z.rechnungNr)!;
      return {
        id: z.id,
        datum: z.datum,
        rechnungNr: f.nr,
        kunde: f.kunde,
        bereich: f.bereich,
        typ: "Kundenzahlung" as const,
        betrag: z.betrag,
        status: zahlStatus(f.betrag, bezahlt.get(f.nr) ?? 0, f.faellig, stichtag),
      };
    })
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

/** Tatsächliche Auszahlungen auf Verbindlichkeiten (neueste zuerst) */
export function auszahlungZeilen(
  verbindlichkeiten: Verbindlichkeit[],
  auszahlungen: Auszahlung[],
  stichtag: string,
): AuszahlungZeile[] {
  const byNr = new Map(verbindlichkeiten.map((v) => [v.nr, v]));
  const bezahlt = bezahltJeBeleg(auszahlungen, (z) => z.verbindlichkeitNr, stichtag);
  return auszahlungen
    .filter((z) => z.datum <= stichtag && byNr.has(z.verbindlichkeitNr))
    .map((z) => {
      const v = byNr.get(z.verbindlichkeitNr)!;
      return {
        id: z.id,
        datum: z.datum,
        verbindlichkeitNr: v.nr,
        empfaenger: v.empfaenger,
        referenz: v.referenz,
        bereich: v.bereich,
        typ: v.typ,
        betrag: z.betrag,
        status: zahlStatus(v.betrag, bezahlt.get(v.nr) ?? 0, v.faellig, stichtag),
      };
    })
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

/** Offene Restbeträge aus Forderungen zum Stichtag – getrennt nach noch nicht fällig und überfällig */
export function forderungsbestand(
  forderungen: Forderung[],
  zahlungen: Zahlungseingang[],
  stichtag: string,
  bereich?: Bereich,
) {
  const bezahlt = bezahltJeBeleg(zahlungen, (z) => z.rechnungNr, stichtag);
  const offen = { summe: 0, anzahl: 0 };
  const ueberfaellig = { summe: 0, anzahl: 0 };
  for (const f of forderungen) {
    if (bereich && f.bereich !== bereich) continue;
    const rest = f.betrag - (bezahlt.get(f.nr) ?? 0);
    if (rest <= 0) continue;
    const ziel = f.faellig < stichtag ? ueberfaellig : offen;
    ziel.summe += rest;
    ziel.anzahl += 1;
  }
  return { offen, ueberfaellig };
}

// ---------- Zeiträume ----------

export type ZeitraumKey = "jahr" | "quartal" | "vorquartal" | "90t" | "30t";
export type Zeitraum = { key: ZeitraumKey; label: string; kurz: string; von: string; bis: string };

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}
export function formatDatum(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}
function kurzDatum(isoDate: string) {
  const [, m, d] = isoDate.split("-");
  return `${d}.${m}.`;
}

export function zeitraeume(stichtag: string): Zeitraum[] {
  const y = Number(stichtag.slice(0, 4));
  const q = Math.floor((Number(stichtag.slice(5, 7)) - 1) / 3);
  const qStart = (qi: number, yy: number) => `${yy}-${String(qi * 3 + 1).padStart(2, "0")}-01`;
  const qEnd = (qi: number, yy: number) => addDays(qi === 3 ? `${yy + 1}-01-01` : qStart(qi + 1, yy), -1);
  const pq = q === 0 ? 3 : q - 1;
  const py = q === 0 ? y - 1 : y;
  const list: Omit<Zeitraum, "label">[] = [
    { key: "jahr", kurz: "Dieses Jahr", von: `${y}-01-01`, bis: `${y}-12-31` },
    { key: "quartal", kurz: "Dieses Quartal", von: qStart(q, y), bis: qEnd(q, y) },
    { key: "vorquartal", kurz: "Letztes Quartal", von: qStart(pq, py), bis: qEnd(pq, py) },
    { key: "90t", kurz: "Letzte 90 Tage", von: addDays(stichtag, -89), bis: stichtag },
    { key: "30t", kurz: "Letzte 30 Tage", von: addDays(stichtag, -29), bis: stichtag },
  ];
  return list.map((z) => ({ ...z, label: `${z.kurz} (${kurzDatum(z.von)} – ${formatDatum(z.bis)})` }));
}

export function imZeitraum(datum: string, z: Pick<Zeitraum, "von" | "bis">) {
  return datum >= z.von && datum <= z.bis;
}

// ---------- Filter ----------

export type Filter = {
  suche: string;
  bereich: Bereich | "";
  typ: ZahlungTyp | "";
  status: ZahlStatus | "";
};
export const LEERER_FILTER: Filter = { suche: "", bereich: "", typ: "", status: "" };

type Filterbar = { datum: string; bereich: Bereich; typ: ZahlungTyp; status: ZahlStatus };

/** Filter für Kennzahlen und Diagramme: Zeitraum, Geschäftsbereich, Typ */
export function filterKennzahlen<T extends Filterbar>(rows: T[], f: Filter, z: Zeitraum) {
  return rows.filter(
    (r) => imZeitraum(r.datum, z) && (!f.bereich || r.bereich === f.bereich) && (!f.typ || r.typ === f.typ),
  );
}

/** Filter für Tabellen: zusätzlich Status und Suche */
export function filterTabelle<T extends Filterbar>(rows: T[], f: Filter, z: Zeitraum, suchfelder: (r: T) => string[]) {
  const q = f.suche.trim().toLowerCase();
  return filterKennzahlen(rows, f, z).filter(
    (r) =>
      (!f.status || r.status === f.status) &&
      (!q || suchfelder(r).some((s) => s.toLowerCase().includes(q))),
  );
}

export function summe(rows: { betrag: number }[]) {
  return rows.reduce((s, r) => s + r.betrag, 0);
}

// ---------- Diagrammreihen ----------

const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export type Periode = { label: string; von: string; bis: string; zukunft: boolean };

/** Monate bzw. Quartale des Zeitraums. Perioden nach dem Stichtag sind „Zukunft“ (keine Ist-Werte). */
export function perioden(z: Zeitraum, stichtag: string, gruppe: "monat" | "quartal"): Periode[] {
  const out: Periode[] = [];
  let y = Number(z.von.slice(0, 4));
  let m = Number(z.von.slice(5, 7)) - 1;
  if (gruppe === "quartal") m -= m % 3;
  const step = gruppe === "monat" ? 1 : 3;
  while (`${y}-${String(m + 1).padStart(2, "0")}-01` <= z.bis) {
    const von = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const ny = m + step > 11 ? y + 1 : y;
    const nm = (m + step) % 12;
    const bis = addDays(`${ny}-${String(nm + 1).padStart(2, "0")}-01`, -1);
    const label = gruppe === "monat" ? MONATE[m] : `Q${m / 3 + 1}`;
    out.push({ label, von, bis, zukunft: von > stichtag });
    y = ny;
    m = nm;
  }
  return out;
}

export type BalkenPunkt = { label: string; eingang: number | null; auszahlung: number | null };

export function balkenReihe(
  ein: { datum: string; betrag: number }[],
  aus: { datum: string; betrag: number }[],
  z: Zeitraum,
  stichtag: string,
  gruppe: "monat" | "quartal",
): BalkenPunkt[] {
  return perioden(z, stichtag, gruppe).map((p) => {
    if (p.zukunft) return { label: p.label, eingang: null, auszahlung: null };
    const inP = (r: { datum: string }) => r.datum >= p.von && r.datum <= p.bis && imZeitraum(r.datum, z);
    return { label: p.label, eingang: summe(ein.filter(inP)), auszahlung: summe(aus.filter(inP)) };
  });
}

/** Kumulierte Summen je Monat ab Beginn des Zeitraums; nach dem Stichtag keine Werte */
export function kumulierteReihe(
  ein: { datum: string; betrag: number }[],
  aus: { datum: string; betrag: number }[],
  z: Zeitraum,
  stichtag: string,
): BalkenPunkt[] {
  let e = 0;
  let a = 0;
  return balkenReihe(ein, aus, z, stichtag, "monat").map((p) => {
    if (p.eingang === null) return p;
    e += p.eingang;
    a += p.auszahlung ?? 0;
    return { label: p.label, eingang: e, auszahlung: a };
  });
}

// ---------- Export ----------

export function toCsv(header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = typeof v === "number" ? v.toFixed(2).replace(".", ",") : v;
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}
