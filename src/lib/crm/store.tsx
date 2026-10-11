"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { HEUTE } from "./testdata";
import { testdatenRepository, type CrmDaten } from "./repository";
import { aktivitaetenFuerUnternehmen, betrifft, letzteAktivitaet } from "./logic";
import { findeObjekt } from "./vorgaenge";
import type { Aktivitaet, ID, Objekt, Person, Unternehmen, Vorhaben } from "./types";

type Store = CrmDaten & {
  heute: string;
  dauerhaft: boolean;
  speichereUnternehmen: (u: Unternehmen) => void;
  speicherePerson: (p: Person) => void;
  speichereVorhaben: (v: Vorhaben) => void;
  /** Liefert die ID des bestehenden Objekts (gleicher Titel + Ort) oder legt genau ein neues an – keine Dubletten */
  objektZuordnen: (titel: string, ort: string, bild?: string) => ID;
  objektById: (id: ID) => Objekt | undefined;
  speichereAktivitaet: (a: Aktivitaet) => void;
  setzeErledigt: (id: ID, erledigt: boolean) => void;
  neueId: (prefix: string) => string;
  unternehmenById: (id: ID) => Unternehmen | undefined;
  personById: (id: ID) => Person | undefined;
  benutzerName: (id: ID) => string;
  aktivitaetenVonUnternehmen: (u: Unternehmen) => Aktivitaet[];
  aktivitaetenVonPerson: (p: Person) => Aktivitaet[];
  letzteAktivitaetUnternehmen: (u: Unternehmen) => string;
  letzteAktivitaetPerson: (p: Person) => string;
  ansprechpartnerVon: (unternehmenId: ID) => Person[];
};

const Ctx = createContext<Store | null>(null);

function upsert<T extends { id: ID }>(list: T[], item: T) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i < 0) return [item, ...list];
  const next = [...list];
  next[i] = item;
  return next;
}

let zaehler = 0;

export function CrmStoreProvider({ children }: { children: ReactNode }) {
  const [daten, setDaten] = useState<CrmDaten>(() => testdatenRepository.laden());

  const speichereUnternehmen = useCallback((u: Unternehmen) => setDaten((d) => ({ ...d, unternehmen: upsert(d.unternehmen, u) })), []);
  const speicherePerson = useCallback((p: Person) => setDaten((d) => ({ ...d, personen: upsert(d.personen, p) })), []);
  const speichereVorhaben = useCallback((v: Vorhaben) => setDaten((d) => ({ ...d, vorhaben: upsert(d.vorhaben, v) })), []);
  const speichereAktivitaet = useCallback((a: Aktivitaet) => setDaten((d) => ({ ...d, aktivitaeten: upsert(d.aktivitaeten, a) })), []);
  const setzeErledigt = useCallback(
    (id: ID, erledigt: boolean) =>
      setDaten((d) => ({ ...d, aktivitaeten: d.aktivitaeten.map((a) => (a.id === id ? { ...a, erledigt } : a)) })),
    [],
  );

  const value = useMemo<Store>(() => {
    const oMap = new Map(daten.objekte.map((o) => [o.id, o]));
    const objektZuordnen = (titel: string, ort: string, bild?: string) => {
      const vorhanden = findeObjekt(daten.objekte, titel, ort);
      if (vorhanden) return vorhanden.id;
      const neu: Objekt = { id: `o-neu-${Date.now().toString(36)}-${++zaehler}`, titel: titel.trim(), ort: ort.trim(), bild };
      setDaten((d) => (findeObjekt(d.objekte, titel, ort) ? d : { ...d, objekte: [neu, ...d.objekte] }));
      return neu.id;
    };
    const uMap = new Map(daten.unternehmen.map((u) => [u.id, u]));
    const pMap = new Map(daten.personen.map((p) => [p.id, p]));
    const vonUnternehmen = (u: Unternehmen) => aktivitaetenFuerUnternehmen(daten.aktivitaeten, u, daten.personen);
    const vonPerson = (p: Person) => daten.aktivitaeten.filter((a) => betrifft(a, "person", p.id));
    return {
      ...daten,
      heute: HEUTE,
      dauerhaft: testdatenRepository.dauerhaft,
      speichereUnternehmen,
      speicherePerson,
      speichereVorhaben,
      objektZuordnen,
      objektById: (id) => oMap.get(id),
      speichereAktivitaet,
      setzeErledigt,
      neueId: (prefix) => `${prefix}-neu-${Date.now().toString(36)}-${++zaehler}`,
      unternehmenById: (id) => uMap.get(id),
      personById: (id) => pMap.get(id),
      benutzerName: (id) => daten.benutzer.find((b) => b.id === id)?.name ?? "—",
      aktivitaetenVonUnternehmen: vonUnternehmen,
      aktivitaetenVonPerson: vonPerson,
      letzteAktivitaetUnternehmen: (u) => letzteAktivitaet(vonUnternehmen(u), HEUTE, u.letzterKontakt),
      letzteAktivitaetPerson: (p) => letzteAktivitaet(vonPerson(p), HEUTE, p.letzterKontakt),
      ansprechpartnerVon: (id) => daten.personen.filter((p) => p.kontakte.some((k) => k.unternehmenId === id)),
    };
  }, [daten, speichereUnternehmen, speicherePerson, speichereVorhaben, speichereAktivitaet, setzeErledigt]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCrm() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useCrm außerhalb von CrmStoreProvider");
  return s;
}
