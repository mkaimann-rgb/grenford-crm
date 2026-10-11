"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HEUTE } from "./testdata";
import { DATEN_VERSION, LOCAL_KEY, testdatenLaden, testdatenRepository, type CrmDaten } from "./repository";
import { aktivitaetenFuerUnternehmen, betrifft, letzteAktivitaet } from "./logic";
import { findeObjekt } from "./vorgaenge";
import { naechsteFreieNummer, vergebeneIds, type NummernSchluessel } from "./nummern";
import { modulVorgaenge, vorgangsIndex, type VorgangInfo } from "./projektion";
import type { Aktivitaet, ID, Objekt, Person, Unternehmen, Vorhaben } from "./types";
import type { Einstellungen } from "./module";

/** Listen im Datenbestand, die über `speichere` gepflegt werden (Schlüssel: id bzw. nr) */
export type Liste = {
  [K in keyof CrmDaten]: CrmDaten[K] extends readonly (infer T)[] ? (T extends { id: string } | { nr: string } ? K : never) : never;
}[keyof CrmDaten];
export type Eintrag<K extends Liste> = CrmDaten[K] extends readonly (infer T)[] ? T : never;

type Store = CrmDaten & {
  heute: string;
  dauerhaft: boolean;
  speicherort: string;
  /** Alle Vorgänge: Kundenvorhaben + abgeleitete Modul-Vorgänge (für Kontakt-/Unternehmensseiten) */
  vorgaenge: Vorhaben[];
  /** Verzeichnis aller Modul-Datensätze (Titel, Bereich, Link) */
  index: Map<ID, VorgangInfo>;
  speichereUnternehmen: (u: Unternehmen) => void;
  speicherePerson: (p: Person) => void;
  speichereVorhaben: (v: Vorhaben) => void;
  /** Generisch speichern (anlegen oder ersetzen) – optional mit Verlaufseintrag zum Datensatz */
  speichere: <K extends Liste>(liste: K, eintrag: Eintrag<K>, protokoll?: { ref: ID; text: string }) => void;
  protokolliere: (ref: ID, text: string) => void;
  speichereEinstellungen: (e: Einstellungen) => void;
  /** Liefert die ID des bestehenden Objekts (gleicher Titel + Ort) oder legt genau ein neues an – keine Dubletten */
  objektZuordnen: (titel: string, ort: string, bild?: string) => ID;
  objektById: (id: ID) => Objekt | undefined;
  speichereAktivitaet: (a: Aktivitaet) => void;
  setzeErledigt: (id: ID, erledigt: boolean) => void;
  neueId: (prefix: string) => string;
  /** Alle vergebenen IDs und Referenzen (Grundlage der Nummernvergabe) */
  vergebeneIds: string[];
  /** Nächste freie fachliche Nummer eines Nummernkreises (siehe nummern.ts) */
  nummer: (kreis: NummernSchluessel) => string;
  unternehmenById: (id: ID) => Unternehmen | undefined;
  personById: (id: ID) => Person | undefined;
  /** Anzeigename eines Stammsatz-Verweises */
  refName: (r?: { art: "person" | "unternehmen"; id: ID }) => string;
  refHref: (r?: { art: "person" | "unternehmen"; id: ID }) => string | undefined;
  benutzerName: (id: ID) => string;
  aktivitaetenVonUnternehmen: (u: Unternehmen) => Aktivitaet[];
  aktivitaetenVonPerson: (p: Person) => Aktivitaet[];
  /** Aktivitäten zu einem Vorgang (Bezug „vorgang“) */
  aktivitaetenVon: (...ids: ID[]) => Aktivitaet[];
  letzteAktivitaetUnternehmen: (u: Unternehmen) => string;
  letzteAktivitaetPerson: (p: Person) => string;
  ansprechpartnerVon: (unternehmenId: ID) => Person[];
  /** Testdaten zurücksetzen (Browser-Zwischenspeicher verwerfen) */
  zuruecksetzen: () => void;
};

const Ctx = createContext<Store | null>(null);

const schluessel = (x: object) => ("id" in x ? (x as { id: string }).id : (x as { nr: string }).nr);

function upsert<T extends object>(list: readonly T[], item: T) {
  const k = schluessel(item);
  const i = list.findIndex((x) => schluessel(x) === k);
  if (i < 0) return [item, ...list];
  const next = [...list];
  next[i] = item;
  return next;
}

let zaehler = 0;
const jetzt = () => {
  const d = new Date();
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${HEUTE}T${hm}`;
};

export function CrmStoreProvider({ children }: { children: ReactNode }) {
  const [daten, setDaten] = useState<CrmDaten>(() => testdatenRepository.laden());
  const geladen = useRef(false);

  // Browser-Zwischenspeicher (nur Testmodus): nach dem ersten Rendern laden, danach bei jeder Änderung schreiben
  useEffect(() => {
    if (geladen.current) {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ version: DATEN_VERSION, daten }));
      } catch {
        /* Speicher voll oder gesperrt – Testmodus funktioniert weiter ohne Zwischenspeicher */
      }
      return;
    }
    geladen.current = true;
    try {
      const roh = localStorage.getItem(LOCAL_KEY);
      const gespeichert = roh ? (JSON.parse(roh) as { version: string; daten: CrmDaten }) : null;
      if (gespeichert?.version === DATEN_VERSION) queueMicrotask(() => setDaten(gespeichert.daten));
    } catch {
      /* ungültiger Zwischenstand wird ignoriert */
    }
  }, [daten]);

  const speichere = useCallback(<K extends Liste>(liste: K, eintrag: Eintrag<K>, protokoll?: { ref: ID; text: string }) =>
    setDaten((d) => ({
      ...d,
      [liste]: upsert(d[liste] as readonly object[], eintrag as object),
      ...(protokoll ? { verlauf: [{ id: `VL-${Date.now().toString(36)}-${++zaehler}`, ref: protokoll.ref, zeit: jetzt(), text: protokoll.text, benutzerId: d.benutzer[0].id }, ...d.verlauf] } : {}),
    })), []);
  const protokolliere = useCallback((ref: ID, text: string) =>
    setDaten((d) => ({ ...d, verlauf: [{ id: `VL-${Date.now().toString(36)}-${++zaehler}`, ref, zeit: jetzt(), text, benutzerId: d.benutzer[0].id }, ...d.verlauf] })), []);
  const speichereUnternehmen = useCallback((u: Unternehmen) => setDaten((d) => ({ ...d, unternehmen: upsert(d.unternehmen, u) })), []);
  const speicherePerson = useCallback((p: Person) => setDaten((d) => ({ ...d, personen: upsert(d.personen, p) })), []);
  const speichereVorhaben = useCallback((v: Vorhaben) => setDaten((d) => ({ ...d, vorhaben: upsert(d.vorhaben, v) })), []);
  const speichereAktivitaet = useCallback((a: Aktivitaet) => setDaten((d) => ({ ...d, aktivitaeten: upsert(d.aktivitaeten, a) })), []);
  const speichereEinstellungen = useCallback((e: Einstellungen) => setDaten((d) => ({ ...d, einstellungen: e })), []);
  const setzeErledigt = useCallback(
    (id: ID, erledigt: boolean) =>
      setDaten((d) => ({ ...d, aktivitaeten: d.aktivitaeten.map((a) => (a.id === id ? { ...a, erledigt } : a)) })),
    [],
  );
  const zuruecksetzen = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {
      /* ignorieren */
    }
    setDaten(testdatenLaden());
  }, []);

  const value = useMemo<Store>(() => {
    const uMap = new Map(daten.unternehmen.map((u) => [u.id, u]));
    const pMap = new Map(daten.personen.map((p) => [p.id, p]));
    const oMap = new Map(daten.objekte.map((o) => [o.id, o]));
    const vonUnternehmen = (u: Unternehmen) => aktivitaetenFuerUnternehmen(daten.aktivitaeten, u, daten.personen);
    const vonPerson = (p: Person) => daten.aktivitaeten.filter((a) => betrifft(a, "person", p.id));
    const vergeben = vergebeneIds((Object.values(daten) as unknown[]).filter((x): x is unknown[] => Array.isArray(x)));
    const nummer = (kreis: NummernSchluessel) => naechsteFreieNummer(kreis, vergeben, HEUTE);
    const objektZuordnen = (titel: string, ort: string, bild?: string) => {
      const vorhanden = findeObjekt(daten.objekte, titel, ort);
      if (vorhanden) return vorhanden.id;
      const neu: Objekt = { id: `o-neu-${Date.now().toString(36)}-${++zaehler}`, nummer: nummer("objekt"), titel: titel.trim(), ort: ort.trim(), bild };
      setDaten((d) => (findeObjekt(d.objekte, titel, ort) ? d : { ...d, objekte: [neu, ...d.objekte] }));
      return neu.id;
    };
    const refName = (r?: { art: "person" | "unternehmen"; id: ID }) => {
      if (!r) return "—";
      if (r.art === "unternehmen") return uMap.get(r.id)?.name ?? "—";
      const p = pMap.get(r.id);
      return p ? [p.titel, p.vorname, p.nachname].filter(Boolean).join(" ") : "—";
    };
    const refHref = (r?: { art: "person" | "unternehmen"; id: ID }) => {
      if (!r) return undefined;
      if (r.art === "unternehmen") return uMap.has(r.id) ? `/kunden/unternehmen/${r.id}` : undefined;
      const p = pMap.get(r.id);
      if (!p) return undefined;
      return p.kontakte.length ? `/kunden/ansprechpartner/${p.id}` : p.privat ? `/kunden/privatkunden/${p.id}` : p.sanierung ? `/kunden/sanierungskunden/${p.id}` : `/kunden/ansprechpartner/${p.id}`;
    };
    return {
      ...daten,
      heute: HEUTE,
      dauerhaft: testdatenRepository.dauerhaft,
      speicherort: testdatenRepository.speicherort,
      vorgaenge: [...daten.vorhaben, ...modulVorgaenge(daten)],
      index: vorgangsIndex(daten),
      speichereUnternehmen,
      speicherePerson,
      speichereVorhaben,
      speichere,
      protokolliere,
      speichereEinstellungen,
      objektZuordnen,
      objektById: (id) => oMap.get(id),
      speichereAktivitaet,
      setzeErledigt,
      neueId: (prefix) => `${prefix}-neu-${Date.now().toString(36)}-${++zaehler}`,
      vergebeneIds: vergeben,
      nummer,
      unternehmenById: (id) => uMap.get(id),
      personById: (id) => pMap.get(id),
      refName,
      refHref,
      benutzerName: (id) => daten.benutzer.find((b) => b.id === id)?.name ?? "—",
      aktivitaetenVonUnternehmen: vonUnternehmen,
      aktivitaetenVonPerson: vonPerson,
      aktivitaetenVon: (...ids) => daten.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "vorgang" && ids.includes(b.id))),
      letzteAktivitaetUnternehmen: (u) => letzteAktivitaet(vonUnternehmen(u), HEUTE, u.letzterKontakt),
      letzteAktivitaetPerson: (p) => letzteAktivitaet(vonPerson(p), HEUTE, p.letzterKontakt),
      ansprechpartnerVon: (id) => daten.personen.filter((p) => p.kontakte.some((k) => k.unternehmenId === id)),
      zuruecksetzen,
    };
  }, [daten, speichereUnternehmen, speicherePerson, speichereVorhaben, speichere, protokolliere, speichereEinstellungen, speichereAktivitaet, setzeErledigt, zuruecksetzen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCrm() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useCrm außerhalb von CrmStoreProvider");
  return s;
}
