"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Search, UserRound } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { findeFirmenDublette, findePersonDublette, personName } from "@/lib/crm/logic";
import {
  AKTIVITAET_TYPEN,
  GESCHAEFTSBEREICHE,
  KONTAKT_ROLLEN,
  KONTAKT_STATUS,
  PRIORITAETEN,
  PRIVAT_INTERESSEN,
  PRIVAT_STATUS,
  QUELLEN,
  RECHTSFORMEN,
  SANIERUNG_INTERESSEN,
  SANIERUNG_STATUS,
  UNTERNEHMENSARTEN,
  ZEITRAHMEN,
  type Aktivitaet,
  type AktivitaetTyp,
  type Bezug,
  type Geschaeftsbereich,
  type Vorhaben,
  type VorhabenStatus,
  type KontaktRolle,
  type Person,
  type TerminArt,
  type Unternehmen,
  type Unternehmensart,
} from "@/lib/crm/types";
import { Button, Tabs } from "@/components/ui/controls";
import { BereichAuswahl, ChipSelect, Field, FormSection, Modal, SelectField, TextArea, TextField } from "@/components/ui/modal";
import { ausFormular, ergaenzeBereiche } from "@/lib/crm/bereiche";
import { einstufen, findeObjekt, ROLLEN_JE_BEREICH } from "@/lib/crm/vorgaenge";
import { useToast } from "@/components/ui/toast";

const GESPEICHERT = "(Testmodus – nur bis zum Neuladen der Seite gespeichert)";
const LAENDER = ["Deutschland", "Österreich", "Schweiz", "Sonstige"];

// ---------- Personensuche ----------

export type PersonWahl = { id?: string; name: string };

export function PersonPicker({ label, value, onChange, pflicht, fehler }: { label: string; value: PersonWahl; onChange: (v: PersonWahl) => void; pflicht?: boolean; fehler?: string }) {
  const { personen } = useCrm();
  const [offen, setOffen] = useState(false);
  const treffer = useMemo(() => {
    const q = value.name.trim().toLowerCase();
    if (!q || value.id) return [];
    return personen.filter((p) => personName(p).toLowerCase().includes(q) || p.email.toLowerCase().includes(q)).slice(0, 6);
  }, [personen, value]);
  return (
    <Field label={label} pflicht={pflicht} fehler={fehler} hinweis={value.id ? "Bestehende Person wird verknüpft" : value.name ? "Wird als neue Person angelegt" : undefined}>
      {(id) => (
        <div className="relative">
          <input
            id={id}
            value={value.name}
            onChange={(e) => { onChange({ name: e.target.value }); setOffen(true); }}
            onFocus={() => setOffen(true)}
            onBlur={() => setTimeout(() => setOffen(false), 150)}
            placeholder="Person suchen oder neu anlegen …"
            autoComplete="off"
            className={`focus-ring h-[34px] w-full rounded-[6px] border bg-white pl-3 pr-8 text-[12px] text-ink placeholder:text-muted-soft ${fehler ? "border-neg" : "border-line"} ${value.id ? "font-semibold text-navy-900" : ""}`}
          />
          <Search className="pointer-events-none absolute right-2.5 top-[9px] h-4 w-4 text-navy-900" />
          {offen && treffer.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full rounded-lg border border-line bg-white p-1 shadow-lg">
              {treffer.map((p) => (
                <li key={p.id}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange({ id: p.id, name: personName(p) }); setOffen(false); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] hover:bg-line-soft">
                    <UserRound className="h-4 w-4 text-navy-800" />
                    <span className="flex-1 truncate">{personName(p)}</span>
                    <span className="truncate text-[10.5px] text-muted">{p.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Field>
  );
}

function DublettenHinweis({ text, href, onVerwenden }: { text: string; href: string; onVerwenden?: () => void }) {
  return (
    <div role="alert" className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-warn/40 bg-warn-bg px-4 py-3 text-[12px] text-ink">
      <AlertTriangle className="h-4 w-4 shrink-0 text-warn" />
      <span className="flex-1">{text}</span>
      <Link href={href} className="font-semibold text-navy-900 underline">Bestehenden Datensatz öffnen</Link>
      {onVerwenden && <Button size="sm" onClick={onVerwenden}>Bestehende Person verwenden</Button>}
    </div>
  );
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  const titel = /^(Dr\.|Prof\.)$/.test(parts[0] ?? "") ? parts.shift()! : "";
  const nachname = parts.length > 1 ? parts.pop()! : "";
  return { titel, vorname: parts.join(" "), nachname };
}

// ---------- Unternehmen ----------

export function UnternehmenModal({ initial, onClose, onSaved }: { initial?: Unternehmen; onClose: () => void; onSaved?: (u: Unternehmen) => void }) {
  const crm = useCrm();
  const toast = useToast();
  const leitungAlt = initial && crm.ansprechpartnerVon(initial.id).find((p) => p.kontakte.some((k) => k.unternehmenId === initial.id && k.leitung));
  const hauptAlt = initial && crm.ansprechpartnerVon(initial.id).find((p) => p.kontakte.some((k) => k.unternehmenId === initial.id && k.haupt));
  const pos = (p: Person | undefined) => p?.kontakte.find((k) => k.unternehmenId === initial?.id)?.position ?? "";

  const [f, setF] = useState(() => ({
    name: initial?.name ?? "",
    art: initial?.arten[0] ?? "",
    rechtsform: initial?.rechtsform ?? "",
    ustId: initial?.ustId ?? "",
    handelsregister: initial?.handelsregister ?? "",
    website: initial?.website ?? "",
    linkedin: initial?.linkedin ?? "",
    strasse: initial?.strasse ?? "",
    plz: initial?.plz ?? "",
    ort: initial?.ort ?? "",
    land: initial?.land ?? "Deutschland",
    rollen: initial?.arten.slice(1) ?? ([] as string[]),
    beschreibung: initial?.beschreibung ?? "",
    betreuerId: initial?.betreuerId ?? crm.benutzer[0].id,
    status: initial?.status ?? "In Kontakt",
    quelle: initial?.quelle ?? "",
    notiz: "",
    bereiche: initial?.bereiche.map((z) => ({ bereich: z.bereich as string, funktion: z.funktion })) ?? ([] as { bereich: string; funktion: string }[]),
  }));
  const [leitung, setLeitung] = useState<PersonWahl>(leitungAlt ? { id: leitungAlt.id, name: personName(leitungAlt) } : { name: "" });
  const [leitungPos, setLeitungPos] = useState(pos(leitungAlt));
  const [haupt, setHaupt] = useState<PersonWahl>(hauptAlt ? { id: hauptAlt.id, name: personName(hauptAlt) } : { name: "" });
  const [hauptPos, setHauptPos] = useState(pos(hauptAlt));
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const set = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }));

  const dublette = f.name.trim().length > 2 ? findeFirmenDublette(crm.unternehmen, f, initial?.id) : undefined;

  const speichern = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Bitte einen Unternehmensnamen angeben.";
    if (!f.art) e.art = "Bitte die Unternehmensart wählen.";
    if (!f.bereiche.length) e.bereiche = "Bitte mindestens einen Geschäftsbereich wählen.";
    if (f.website && !/^https?:\/\//.test(f.website)) e.website = "Bitte mit https:// beginnen.";
    setFehler(e);
    if (Object.keys(e).length || dublette) return;

    const arten = [f.art, ...f.rollen.filter((r) => r !== f.art)] as Unternehmensart[];
    const u: Unternehmen = {
      ...(initial ?? { id: crm.neueId("f"), labels: [], telefon: "", email: "", erstelltAm: crm.heute, letzterKontakt: crm.heute }),
      name: f.name.trim(), arten, rechtsform: f.rechtsform, ustId: f.ustId.trim(), handelsregister: f.handelsregister.trim(), website: f.website.trim(), linkedin: f.linkedin.trim(),
      strasse: f.strasse, plz: f.plz, ort: f.ort, land: f.land, beschreibung: f.beschreibung, betreuerId: f.betreuerId, status: f.status as Unternehmen["status"], quelle: f.quelle,
      bereiche: ausFormular(f.bereiche, initial?.bereiche),
      // Bewusst im Formular geprüft → Prüfhinweis entfällt
      bereichPruefen: undefined,
    };
    crm.speichereUnternehmen(u);

    // Zuständige Personen verknüpfen (bestehende Person ergänzen statt kopieren)
    const verknuepfe = (wahl: PersonWahl, position: string, extra: { leitung?: boolean; haupt?: boolean }, rolle: KontaktRolle) => {
      if (!wahl.name.trim()) return;
      const bestehend = wahl.id ? crm.personById(wahl.id) : undefined;
      const basis: Person = bestehend ?? {
        id: crm.neueId("p"), anrede: "", ...splitName(wahl.name), geburtsdatum: "", email: "", telefonMobil: "", telefonGeschaeftlich: "", linkedin: "",
        status: "In Kontakt", betreuerId: f.betreuerId, quelle: f.quelle, favorit: false, erstelltAm: crm.heute, letzterKontakt: crm.heute,
        strasse: "", plz: "", ort: f.ort, land: f.land, kontakte: [], bereiche: [],
      };
      const andere = basis.kontakte.filter((k) => k.unternehmenId !== u.id);
      const alt = basis.kontakte.find((k) => k.unternehmenId === u.id);
      // Ansprechpartner erbt fehlende Geschäftsbereiche des Unternehmens (eindeutige Beziehung, als „abgeleitet“ markiert)
      const bereiche = ergaenzeBereiche(basis.bereiche, u.bereiche.map((z) => ({ bereich: z.bereich, funktion: alt?.rolle ?? rolle, grund: `Ansprechpartner von ${u.name}` })));
      crm.speicherePerson({ ...basis, bereiche, kontakte: [...andere, { unternehmenId: u.id, position: position || alt?.position || "", abteilung: alt?.abteilung ?? "", rolle: alt?.rolle ?? rolle, ...alt, ...extra, ...(position ? { position } : {}) }] });
    };
    verknuepfe(leitung, leitungPos, { leitung: true }, "Entscheider");
    verknuepfe(haupt, hauptPos, { haupt: true }, "Projektkontakt");

    if (f.notiz.trim()) {
      crm.speichereAktivitaet({ id: crm.neueId("a"), typ: "Notiz", titel: u.name, beschreibung: f.notiz.trim(), datum: crm.heute, bezug: [{ art: "unternehmen", id: u.id }], verantwortlichId: f.betreuerId, erledigt: false });
    }
    toast(`${u.name} ${initial ? "aktualisiert" : "angelegt"} ${GESPEICHERT}`);
    onSaved?.(u);
    onClose();
  };

  return (
    <Modal
      titel={initial ? "Unternehmen bearbeiten" : "Neues Unternehmen anlegen"}
      onClose={onClose}
      breit="max-w-[1000px]"
      footer={
        <>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button variant="primary" onClick={speichern} disabled={!!dublette}>{initial ? "Änderungen speichern" : "Unternehmen anlegen"}</Button>
        </>
      }
    >
      {dublette && <DublettenHinweis text={`„${dublette.name}“ existiert bereits (gleicher Name, USt-IdNr. oder Handelsregisternummer). Unternehmen werden nur einmal angelegt.`} href={`/kunden/unternehmen/${dublette.id}`} />}
      <div className="grid gap-6 lg:grid-cols-3 lg:divide-x lg:divide-line">
        <FormSection titel="Allgemeine Informationen">
          <TextField label="Unternehmensname" pflicht value={f.name} onChange={(v) => set({ name: v })} placeholder="z. B. Montesana AG" fehler={fehler.name} />
          <SelectField label="Unternehmensart" pflicht value={f.art} onChange={(v) => set({ art: v as Unternehmensart })} options={UNTERNEHMENSARTEN} fehler={fehler.art} />
          <SelectField label="Rechtsform" value={f.rechtsform} onChange={(v) => set({ rechtsform: v })} options={RECHTSFORMEN} />
          <TextField label="USt-IdNr." value={f.ustId} onChange={(v) => set({ ustId: v })} placeholder="DE123456789" />
          <TextField label="Handelsregisternr." value={f.handelsregister} onChange={(v) => set({ handelsregister: v })} placeholder="HRB 123456" />
          <TextField label="Website" value={f.website} onChange={(v) => set({ website: v })} placeholder="https://www.beispiel.de" fehler={fehler.website} />
          <TextField label="LinkedIn Unternehmensprofil" value={f.linkedin} onChange={(v) => set({ linkedin: v })} placeholder="https://www.linkedin.com/company/beispiel" />
        </FormSection>
        <div className="space-y-5 lg:pl-6">
          <FormSection titel="Adresse">
            <TextField label="Straße, Nr." value={f.strasse} onChange={(v) => set({ strasse: v })} placeholder="z. B. Kurfürstendamm 96" />
            <div className="grid grid-cols-[100px_1fr] gap-3">
              <TextField label="PLZ" value={f.plz} onChange={(v) => set({ plz: v })} placeholder="10709" />
              <TextField label="Ort" value={f.ort} onChange={(v) => set({ ort: v })} placeholder="Berlin" />
            </div>
            <SelectField label="Land" value={f.land} onChange={(v) => set({ land: v })} options={LAENDER} leer={null} />
          </FormSection>
          <ChipSelect label="Unternehmensrollen (mehrfach auswählbar)" options={UNTERNEHMENSARTEN} value={f.rollen} onChange={(v) => set({ rollen: v })} />
          <BereichAuswahl value={f.bereiche} onChange={(v) => set({ bereiche: v })} fehler={fehler.bereiche} />
          <TextArea label="Beschreibung" value={f.beschreibung} onChange={(v) => set({ beschreibung: v })} placeholder="Kurzbeschreibung des Unternehmens …" />
        </div>
        <div className="space-y-5 lg:pl-6">
          <FormSection titel="Zuständige Personen">
            <PersonPicker label="Vorsitzender / Geschäftsführer" value={leitung} onChange={setLeitung} />
            <TextField label="Position" value={leitungPos} onChange={setLeitungPos} placeholder="z. B. CEO, Vorstandsvorsitzender" />
            <PersonPicker label="Erster Ansprechpartner" value={haupt} onChange={setHaupt} />
            <TextField label="Position" value={hauptPos} onChange={setHauptPos} placeholder="z. B. Head of Real Estate" />
          </FormSection>
          <FormSection titel="Interne Verantwortlichkeiten">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Betreuer (GRENFORD)" pflicht value={f.betreuerId} onChange={(v) => set({ betreuerId: v })} options={crm.benutzer.map((b) => ({ value: b.id, label: b.name }))} leer={null} />
              <SelectField label="Status" pflicht value={f.status} onChange={(v) => set({ status: v as Unternehmen["status"] })} options={KONTAKT_STATUS} leer={null} />
            </div>
            <SelectField label="Quelle" value={f.quelle} onChange={(v) => set({ quelle: v })} options={QUELLEN} />
            {!initial && <TextArea label="Notizen" value={f.notiz} onChange={(v) => set({ notiz: v })} placeholder="Erste Notizen …" />}
          </FormSection>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Personen (Ansprechpartner, Privatkunde, Sanierungskunde) ----------

export type PersonRolle = "kontakt" | "privat" | "sanierung";
const ROLLEN_TITEL: Record<PersonRolle, string> = { kontakt: "Ansprechpartner", privat: "Privatkunde", sanierung: "Sanierungskunde" };
const ROLLEN_PFAD: Record<PersonRolle, string> = { kontakt: "ansprechpartner", privat: "privatkunden", sanierung: "sanierungskunden" };
export const personHref = (rolle: PersonRolle, id: string) => `/kunden/${ROLLEN_PFAD[rolle]}/${id}`;

type PersonForm = {
  anrede: string; titel: string; vorname: string; nachname: string; geburtsdatum: string; email: string; telefonMobil: string; telefonGeschaeftlich: string; linkedin: string;
  strasse: string; plz: string; ort: string; land: string; quelle: string; betreuerId: string; status: string; notiz: string;
  interessen: string[]; regionen: string; zeitrahmen: string; prioritaet: string; budget: string;
  unternehmenId: string; position: string; abteilung: string; kontaktRolle: string; haupt: boolean;
  vTitel: string; vArt: string; vOrt: string; vBudget: string; vStart: string; vEnde: string;
  bereiche: { bereich: string; funktion: string }[];
};

function formAus(p: Person | undefined, rolle: PersonRolle, betreuer: string, unternehmenId?: string): PersonForm {
  const r = rolle === "privat" ? p?.privat : rolle === "sanierung" ? p?.sanierung : undefined;
  const kontakt = unternehmenId !== undefined ? p?.kontakte.find((k) => k.unternehmenId === unternehmenId) : p?.kontakte[0];
  return {
    anrede: p?.anrede ?? "", titel: p?.titel ?? "", vorname: p?.vorname ?? "", nachname: p?.nachname ?? "", geburtsdatum: p?.geburtsdatum ?? "", email: p?.email ?? "",
    telefonMobil: p?.telefonMobil ?? "", telefonGeschaeftlich: p?.telefonGeschaeftlich ?? "", linkedin: p?.linkedin ?? "",
    strasse: p?.strasse ?? "", plz: p?.plz ?? "", ort: p?.ort ?? "", land: p?.land ?? "Deutschland", quelle: p?.quelle ?? "", betreuerId: p?.betreuerId ?? betreuer,
    status: rolle === "kontakt" ? p?.status ?? "In Kontakt" : r?.status ?? "In Kontakt", notiz: "",
    interessen: r?.interessen ?? [], regionen: r?.regionen ?? "", zeitrahmen: r?.zeitrahmen ?? "", prioritaet: r?.prioritaet ?? "Normal", budget: r?.budget ? String(r.budget) : "",
    unternehmenId: kontakt?.unternehmenId ?? unternehmenId ?? "", position: kontakt?.position ?? "", abteilung: kontakt?.abteilung ?? "", kontaktRolle: kontakt?.rolle ?? "Projektkontakt", haupt: !!kontakt?.haupt,
    vTitel: "", vArt: "", vOrt: "", vBudget: "", vStart: "", vEnde: "",
    // Bestehende Zuordnungen übernehmen; neuer Sanierungskunde → Projects ist eindeutig und wird vorgeschlagen
    bereiche: p ? p.bereiche.map((z) => ({ bereich: z.bereich as string, funktion: z.funktion })) : rolle === "sanierung" ? [{ bereich: "Projects", funktion: "Sanierungskunde" }] : [],
  };
}

export function PersonModal({ rolle, initial, onClose, onSaved, unternehmenId }: { rolle: PersonRolle; initial?: Person; onClose: () => void; onSaved?: (p: Person) => void; unternehmenId?: string }) {
  const crm = useCrm();
  const toast = useToast();
  const [basis, setBasis] = useState<Person | undefined>(initial);
  const [f, setF] = useState<PersonForm>(() => formAus(initial, rolle, crm.benutzer[0].id, unternehmenId));
  const [tab, setTab] = useState<"allgemein" | "vorhaben" | "budget" | "zusatz">("allgemein");
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [weitere, setWeitere] = useState(false);
  const [suche, setSuche] = useState<PersonWahl>({ name: "" });
  const set = (patch: Partial<PersonForm>) => setF((x) => ({ ...x, ...patch }));
  const titel = ROLLEN_TITEL[rolle];
  const interessenOptionen = rolle === "sanierung" ? SANIERUNG_INTERESSEN : PRIVAT_INTERESSEN;
  const statusOptionen = rolle === "kontakt" ? KONTAKT_STATUS : rolle === "privat" ? PRIVAT_STATUS : SANIERUNG_STATUS;

  const dublette = !basis && f.vorname.trim() && f.nachname.trim() ? findePersonDublette(crm.personen, f) : undefined;

  const uebernehmen = (p: Person) => {
    setBasis(p);
    setF(formAus(p, rolle, crm.benutzer[0].id, unternehmenId));
    setSuche({ id: p.id, name: personName(p) });
  };

  const speichern = () => {
    const e: Record<string, string> = {};
    if (!f.anrede) e.anrede = "Bitte wählen.";
    if (!f.vorname.trim()) e.vorname = "Pflichtfeld";
    if (!f.nachname.trim()) e.nachname = "Pflichtfeld";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Ungültige E-Mail-Adresse";
    if (rolle === "kontakt" && !f.unternehmenId) e.unternehmenId = "Bitte ein Unternehmen wählen.";
    if (!f.bereiche.length) e.bereiche = "Bitte mindestens einen Geschäftsbereich wählen.";
    if (f.budget && isNaN(Number(f.budget))) e.budget = "Bitte eine Zahl angeben.";
    setFehler(e);
    if (Object.keys(e).length) { setTab("allgemein"); return; }
    if (dublette) return;

    const neu = !basis;
    const hatteRolle = rolle === "privat" ? !!basis?.privat : rolle === "sanierung" ? !!basis?.sanierung : !!basis?.kontakte.some((k) => k.unternehmenId === f.unternehmenId);
    const p: Person = {
      ...(basis ?? { id: crm.neueId("p"), favorit: false, erstelltAm: crm.heute, letzterKontakt: crm.heute, kontakte: [] }),
      anrede: f.anrede as Person["anrede"], titel: f.titel.trim(), vorname: f.vorname.trim(), nachname: f.nachname.trim(), geburtsdatum: f.geburtsdatum, email: f.email.trim(),
      telefonMobil: f.telefonMobil, telefonGeschaeftlich: f.telefonGeschaeftlich, linkedin: f.linkedin, strasse: f.strasse, plz: f.plz, ort: f.ort, land: f.land, quelle: f.quelle, betreuerId: f.betreuerId,
      status: rolle === "kontakt" ? (f.status as Person["status"]) : basis?.status ?? "Aktiv",
      bereiche: ausFormular(f.bereiche, basis?.bereiche),
      // Bewusst im Formular geprüft → Prüfhinweis entfällt
      bereichPruefen: undefined,
    } as Person;
    const kundenrolle = { seit: crm.heute, ...(rolle === "privat" ? basis?.privat : basis?.sanierung), interessen: f.interessen, regionen: f.regionen, zeitrahmen: f.zeitrahmen, prioritaet: f.prioritaet, budget: f.budget ? Number(f.budget) : undefined };
    if (rolle === "privat") p.privat = { ...kundenrolle, status: f.status as never };
    if (rolle === "sanierung") p.sanierung = { ...kundenrolle, status: f.status as never };
    if (rolle === "kontakt") {
      const andere = p.kontakte.filter((k) => k.unternehmenId !== f.unternehmenId);
      const alt = p.kontakte.find((k) => k.unternehmenId === f.unternehmenId);
      p.kontakte = [...andere, { ...alt, unternehmenId: f.unternehmenId, position: f.position, abteilung: f.abteilung, rolle: f.kontaktRolle as KontaktRolle, haupt: f.haupt }];
    }
    crm.speicherePerson(p);
    if (f.vTitel.trim()) {
      const vBereich = rolle === "sanierung" ? "sanierung" : "privat";
      const vArt = f.vArt || f.interessen[0] || "Sonstige";
      const vOrt = f.vOrt || f.ort;
      crm.speichereVorhaben({
        id: crm.neueId("v"), personId: p.id, bereich: vBereich, art: vArt, titel: f.vTitel.trim(), ort: vOrt,
        beschreibung: "", budget: Number(f.vBudget) || Number(f.budget) || 0, status: "In Planung", fortschritt: 0, zeithorizont: f.zeitrahmen, geplanterStart: f.vStart, geplanteFertigstellung: f.vEnde,
        objektId: crm.objektZuordnen(f.vTitel, vOrt), ...einstufen({ bereich: vBereich, art: vArt }), herkunft: "abgeleitet", grund: `Vorgangsart „${vArt}“`,
      });
    }
    if (f.notiz.trim()) {
      crm.speichereAktivitaet({ id: crm.neueId("a"), typ: "Notiz", titel: personName(p), beschreibung: f.notiz.trim(), datum: crm.heute, bezug: [{ art: "person", id: p.id }], verantwortlichId: f.betreuerId, erledigt: false });
    }
    toast(`${personName(p)} ${neu ? `als ${titel} angelegt` : !hatteRolle ? `um Rolle ${titel} ergänzt (kein Duplikat)` : "aktualisiert"} ${GESPEICHERT}`);
    onSaved?.(p);
    if (weitere && !initial) {
      setBasis(undefined);
      setSuche({ name: "" });
      setF(formAus(undefined, rolle, crm.benutzer[0].id, unternehmenId));
      setTab("allgemein");
    } else onClose();
  };

  const tabs = rolle === "kontakt"
    ? [{ id: "allgemein" as const, label: "Allgemein" }, { id: "zusatz" as const, label: "Zusätzliche Informationen" }]
    : [
        { id: "allgemein" as const, label: "Allgemein" },
        { id: "vorhaben" as const, label: rolle === "sanierung" ? "Vorhaben & Projekt" : "Vorhaben & Interessen" },
        { id: "budget" as const, label: rolle === "sanierung" ? "Budget & Zeitplan" : "Budget" },
        { id: "zusatz" as const, label: "Zusätzliche Informationen" },
      ];

  return (
    <Modal
      titel={initial ? `${titel} bearbeiten` : `Neuen ${titel === "Sanierungskunde" ? "Sanierungskunden" : titel === "Privatkunde" ? "Privatkunden" : "Ansprechpartner"} anlegen`}
      onClose={onClose}
      breit="max-w-[1000px]"
      footer={
        <>
          <Button onClick={onClose}>Abbrechen</Button>
          <div className="flex items-center gap-4">
            {!initial && (
              <label className="flex items-center gap-2 text-[12px] text-ink-soft">
                <input type="checkbox" checked={weitere} onChange={(e) => setWeitere(e.target.checked)} className="accent-navy-900" />
                Weitere {titel === "Ansprechpartner" ? "Ansprechpartner" : `${titel}n`} anlegen
              </label>
            )}
            <Button variant="primary" onClick={speichern} disabled={!!dublette}>{initial ? "Änderungen speichern" : `${titel} anlegen`}</Button>
          </div>
        </>
      }
    >
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <div className="pt-4">
        {dublette && <DublettenHinweis text={`${personName(dublette)} existiert bereits (gleiche E-Mail bzw. gleicher Name). Bitte die bestehende Person verwenden – Personen werden nur einmal angelegt.`} href={personHref(rolle, dublette.id)} onVerwenden={() => uebernehmen(dublette)} />}
        {tab === "allgemein" && (
          <div className="grid gap-6 lg:grid-cols-3 lg:divide-x lg:divide-line">
            <FormSection titel="Personendaten">
              {!initial && (
                <PersonPicker
                  label={rolle === "kontakt" ? "Bestehende Person übernehmen" : "Ansprechpartner (bestehende Person übernehmen)"}
                  value={suche}
                  onChange={(w) => { setSuche(w); const p = w.id ? crm.personById(w.id) : undefined; if (p) uebernehmen(p); else if (basis) { setBasis(undefined); } }}
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Anrede" pflicht value={f.anrede} onChange={(v) => set({ anrede: v })} options={["Herr", "Frau", "Divers"]} leer="Bitte wählen" fehler={fehler.anrede} />
                <TextField label="Titel" value={f.titel} onChange={(v) => set({ titel: v })} placeholder="z. B. Dr." />
                <TextField label="Vorname" pflicht value={f.vorname} onChange={(v) => set({ vorname: v })} fehler={fehler.vorname} />
                <TextField label="Nachname" pflicht value={f.nachname} onChange={(v) => set({ nachname: v })} fehler={fehler.nachname} />
                <TextField label="Geburtsdatum" type="date" value={f.geburtsdatum} onChange={(v) => set({ geburtsdatum: v })} />
                <TextField label="E-Mail" type="email" value={f.email} onChange={(v) => set({ email: v })} fehler={fehler.email} />
                <TextField label="Telefon (mobil)" value={f.telefonMobil} onChange={(v) => set({ telefonMobil: v })} placeholder="+49 176 …" />
                <TextField label="Telefon (geschäftlich)" value={f.telefonGeschaeftlich} onChange={(v) => set({ telefonGeschaeftlich: v })} placeholder="+49 30 …" />
              </div>
              <Button size="sm" onClick={() => toast("Foto-Upload ist in dieser Testversion noch nicht implementiert.")}>Foto hochladen (noch nicht implementiert)</Button>
            </FormSection>
            <div className="space-y-5 lg:pl-6">
              <FormSection titel="Adresse">
                <TextField label="Straße, Nr." value={f.strasse} onChange={(v) => set({ strasse: v })} />
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <TextField label="PLZ" value={f.plz} onChange={(v) => set({ plz: v })} />
                  <TextField label="Ort" value={f.ort} onChange={(v) => set({ ort: v })} />
                </div>
                <SelectField label="Land" value={f.land} onChange={(v) => set({ land: v })} options={LAENDER} leer={null} />
              </FormSection>
              <FormSection titel="Bezug">
                <SelectField label="Herkunft" value={f.quelle} onChange={(v) => set({ quelle: v })} options={QUELLEN} />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Betreuer (GRENFORD)" pflicht value={f.betreuerId} onChange={(v) => set({ betreuerId: v })} options={crm.benutzer.map((b) => ({ value: b.id, label: b.name }))} leer={null} />
                  <SelectField label="Status" pflicht value={f.status} onChange={(v) => set({ status: v })} options={statusOptionen} leer={null} />
                </div>
                <TextArea label="Notizen" value={f.notiz} onChange={(v) => set({ notiz: v })} placeholder="Erste Notizen …" />
              </FormSection>
            </div>
            <div className="space-y-5 lg:pl-6">
              <FormSection titel="Geschäftsbereiche">
                <BereichAuswahl value={f.bereiche} onChange={(v) => set({ bereiche: v })} fehler={fehler.bereiche} />
                <p className="text-[10.5px] text-muted">Getrennt von Kundenrolle ({rolle === "kontakt" ? "Ansprechpartner" : titel}) und fachlicher Rolle. Die Zuordnung gilt für den zentralen Personenstammsatz.</p>
              </FormSection>
              {rolle === "kontakt" ? (
                <FormSection titel="Unternehmen & Rolle">
                  <SelectField label="Unternehmen" pflicht value={f.unternehmenId} onChange={(v) => {
                    // Bereiche des Unternehmens vorschlagen, solange noch nichts gewählt ist
                    const u = crm.unternehmenById(v);
                    set({ unternehmenId: v, ...(f.bereiche.length || !u ? {} : { bereiche: u.bereiche.map((z) => ({ bereich: z.bereich as string, funktion: "" })) }) });
                  }} options={[...crm.unternehmen].sort((a, b) => a.name.localeCompare(b.name)).map((u) => ({ value: u.id, label: u.name }))} fehler={fehler.unternehmenId} />
                  <TextField label="Position" value={f.position} onChange={(v) => set({ position: v })} placeholder="z. B. Geschäftsführer" />
                  <TextField label="Abteilung" value={f.abteilung} onChange={(v) => set({ abteilung: v })} />
                  <SelectField label="Rolle" pflicht value={f.kontaktRolle} onChange={(v) => set({ kontaktRolle: v })} options={KONTAKT_ROLLEN} leer={null} />
                  <label className="flex items-center gap-2 text-[12px] text-ink-soft">
                    <input type="checkbox" checked={f.haupt} onChange={(e) => set({ haupt: e.target.checked })} className="accent-navy-900" />
                    Hauptansprechpartner des Unternehmens
                  </label>
                </FormSection>
              ) : (
                <FormSection titel={rolle === "sanierung" ? "Vorhaben / Projektart" : "Rollen & Interessen"}>
                  <ChipSelect label="Interessen / Vorhaben (mehrfach auswählbar)" options={interessenOptionen} value={f.interessen} onChange={(v) => set({ interessen: v })} />
                  <TextField label="Bevorzugte Regionen" value={f.regionen} onChange={(v) => set({ regionen: v })} placeholder="z. B. Berlin, Potsdam" />
                  <SelectField label="Zeitlicher Rahmen" value={f.zeitrahmen} onChange={(v) => set({ zeitrahmen: v })} options={ZEITRAHMEN} />
                  <SelectField label="Priorität" value={f.prioritaet} onChange={(v) => set({ prioritaet: v })} options={PRIORITAETEN} leer={null} />
                </FormSection>
              )}
            </div>
          </div>
        )}
        {tab === "vorhaben" && (
          <div className="grid max-w-[640px] gap-3 sm:grid-cols-2">
            <p className="sm:col-span-2 text-[12px] text-muted">Optional: erstes {rolle === "sanierung" ? "Sanierungsvorhaben" : "Vorhaben"} direkt mit anlegen. Weitere Vorhaben können in der Detailansicht ergänzt werden.</p>
            <TextField label={rolle === "sanierung" ? "Objekt / Adresse" : "Objekt / Projekt"} value={f.vTitel} onChange={(v) => set({ vTitel: v })} placeholder="z. B. Weichselstraße 20" />
            <SelectField label="Art des Vorhabens" value={f.vArt} onChange={(v) => set({ vArt: v })} options={interessenOptionen} />
            <TextField label="Ort" value={f.vOrt} onChange={(v) => set({ vOrt: v })} />
            <TextField label="Budget Vorhaben (€)" value={f.vBudget} onChange={(v) => set({ vBudget: v.replace(/[^\d]/g, "") })} placeholder="250000" />
          </div>
        )}
        {tab === "budget" && (
          <div className="grid max-w-[640px] gap-3 sm:grid-cols-2">
            <TextField label="Budgetrahmen gesamt (€)" value={f.budget} onChange={(v) => set({ budget: v.replace(/[^\d]/g, "") })} placeholder="z. B. 500000" fehler={fehler.budget} />
            <SelectField label="Zeitlicher Rahmen" value={f.zeitrahmen} onChange={(v) => set({ zeitrahmen: v })} options={ZEITRAHMEN} />
            {rolle === "sanierung" && (
              <>
                <TextField label="Geplanter Start" value={f.vStart} onChange={(v) => set({ vStart: v })} placeholder="z. B. Q4/2026" />
                <TextField label="Geplante Fertigstellung" value={f.vEnde} onChange={(v) => set({ vEnde: v })} placeholder="z. B. Q3/2027" />
              </>
            )}
          </div>
        )}
        {tab === "zusatz" && (
          <div className="grid max-w-[640px] gap-3 sm:grid-cols-2">
            <TextField label="LinkedIn-Profil" value={f.linkedin} onChange={(v) => set({ linkedin: v })} placeholder="https://www.linkedin.com/in/…" />
            <SelectField label="Herkunft" value={f.quelle} onChange={(v) => set({ quelle: v })} options={QUELLEN} />
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------- Aktivität ----------

export function AktivitaetModal({ initial, typ = "Termin", bezug = [], onClose }: { initial?: Aktivitaet; typ?: AktivitaetTyp; bezug?: Bezug[]; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const startU = (initial?.bezug ?? bezug).find((b) => b.art === "unternehmen")?.id ?? "";
  const startP = (initial?.bezug ?? bezug).find((b) => b.art === "person")?.id ?? "";
  const [f, setF] = useState({
    typ: initial?.typ ?? typ, titel: initial?.titel ?? "", beschreibung: initial?.beschreibung ?? "", datum: initial?.datum ?? crm.heute,
    von: initial?.von ?? "", bis: initial?.bis ?? "", terminArt: initial?.terminArt ?? ("video" as TerminArt), unternehmenId: startU, personId: startP,
    kontext: initial?.kontext ?? "", verantwortlichId: initial?.verantwortlichId ?? crm.benutzer[0].id, erledigt: initial?.erledigt ?? false,
  });
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const set = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }));

  const speichern = () => {
    const e: Record<string, string> = {};
    if (!f.titel.trim()) e.titel = "Bitte einen Titel angeben.";
    if (!f.datum) e.datum = "Bitte ein Datum angeben.";
    if (f.von && f.bis && f.bis < f.von) e.bis = "Ende liegt vor Beginn.";
    setFehler(e);
    if (Object.keys(e).length) return;
    const bz: Bezug[] = [];
    if (f.unternehmenId) bz.push({ art: "unternehmen", id: f.unternehmenId });
    if (f.personId) bz.push({ art: "person", id: f.personId });
    crm.speichereAktivitaet({
      id: initial?.id ?? crm.neueId("a"), typ: f.typ, titel: f.titel.trim(), beschreibung: f.beschreibung.trim(), datum: f.datum, von: f.von || undefined, bis: f.bis || undefined,
      terminArt: f.typ === "Termin" ? f.terminArt : f.typ === "Telefon" ? "telefon" : undefined, bezug: bz, kontext: f.kontext || undefined, verantwortlichId: f.verantwortlichId, erledigt: f.erledigt,
    });
    toast(`${f.typ} „${f.titel.trim()}“ ${initial ? "aktualisiert" : "angelegt"}${f.typ === "E-Mail" ? " (nur protokolliert – kein Versand)" : ""} ${GESPEICHERT}`);
    onClose();
  };

  return (
    <Modal
      titel={initial ? "Aktivität bearbeiten" : "Neue Aktivität"}
      onClose={onClose}
      breit="max-w-[640px]"
      footer={
        <>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button variant="primary" onClick={speichern}>{initial ? "Speichern" : "Aktivität anlegen"}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <fieldset>
          <legend className="mb-[6px] text-[11.5px] text-ink-soft">Typ</legend>
          <div className="flex flex-wrap gap-[6px]">
            {AKTIVITAET_TYPEN.map((t) => (
              <button key={t} type="button" aria-pressed={f.typ === t} onClick={() => set({ typ: t })} className={`focus-ring rounded-[5px] border px-3 py-[5px] text-[11.5px] ${f.typ === t ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-navy-900 hover:bg-line-soft"}`}>
                {t}
              </button>
            ))}
          </div>
          {f.typ === "E-Mail" && <p className="mt-1 text-[11px] text-muted">E-Mails werden hier nur protokolliert. Ein Versand erfolgt erst nach der späteren Google-Workspace-Anbindung.</p>}
        </fieldset>
        <TextField label="Titel" pflicht value={f.titel} onChange={(v) => set({ titel: v })} fehler={fehler.titel} />
        <TextArea label={f.typ === "Notiz" ? "Notiz" : "Beschreibung"} value={f.beschreibung} onChange={(v) => set({ beschreibung: v })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label={f.typ === "Aufgabe" ? "Fällig am" : "Datum"} pflicht type="date" value={f.datum} onChange={(v) => set({ datum: v })} fehler={fehler.datum} />
          {f.typ !== "Notiz" && <TextField label="Von" type="time" value={f.von} onChange={(v) => set({ von: v })} />}
          {(f.typ === "Termin" || f.typ === "Telefon") && <TextField label="Bis" type="time" value={f.bis} onChange={(v) => set({ bis: v })} fehler={fehler.bis} />}
        </div>
        {f.typ === "Termin" && (
          <SelectField label="Terminart" value={f.terminArt} onChange={(v) => set({ terminArt: v as TerminArt })} leer={null} options={[{ value: "video", label: "Videocall" }, { value: "vor-ort", label: "Vor-Ort-Termin" }, { value: "persoenlich", label: "Persönliches Treffen" }, { value: "telefon", label: "Telefon" }]} />
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Unternehmen" value={f.unternehmenId} onChange={(v) => set({ unternehmenId: v })} leer="– kein Unternehmen –" options={[...crm.unternehmen].sort((a, b) => a.name.localeCompare(b.name)).map((u) => ({ value: u.id, label: u.name }))} />
          <SelectField label="Person" value={f.personId} onChange={(v) => set({ personId: v })} leer="– keine Person –" options={[...crm.personen].sort((a, b) => a.nachname.localeCompare(b.nachname)).map((p) => ({ value: p.id, label: `${personName(p)}` }))} />
          <TextField label="Weiterer Bezug (Objekt / Projekt)" value={f.kontext} onChange={(v) => set({ kontext: v })} placeholder="z. B. Brautstraße 29" />
          <SelectField label="Verantwortlich" value={f.verantwortlichId} onChange={(v) => set({ verantwortlichId: v })} leer={null} options={crm.benutzer.map((b) => ({ value: b.id, label: b.name }))} />
        </div>
        {f.typ !== "Notiz" && (
          <label className="flex items-center gap-2 text-[12px] text-ink-soft">
            <input type="checkbox" checked={f.erledigt} onChange={(e) => set({ erledigt: e.target.checked })} className="accent-navy-900" />
            Bereits erledigt
          </label>
        )}
      </div>
    </Modal>
  );
}

// ---------- Vorhaben ----------

export function VorhabenModal({ personId, bereich, initial, onClose }: { personId: string; bereich: "privat" | "sanierung"; initial?: Vorhaben; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const startObjekt = initial?.objektId ? crm.objektById(initial.objektId) : undefined;
  const [f, setF] = useState({
    art: initial?.art ?? "", titel: startObjekt?.titel ?? initial?.titel ?? "", ort: startObjekt?.ort ?? initial?.ort ?? "", beschreibung: initial?.beschreibung ?? "", budget: initial ? String(initial.budget) : "",
    status: initial?.status ?? "In Planung", fortschritt: initial ? String(initial.fortschritt) : "0", zeithorizont: initial?.zeithorizont ?? "", unternehmenId: initial?.unternehmenId ?? "",
    geplanterStart: initial?.geplanterStart ?? "", geplanteFertigstellung: initial?.geplanteFertigstellung ?? "",
    geschaeftsbereich: initial ? (initial.geschaeftsbereich ?? "unklar") : "", rolle: initial?.rolle ?? "", unternehmenRolle: initial?.unternehmenRolle ?? "",
  });
  // Bereich und Rolle werden aus der Vorgangsart vorgeschlagen, solange sie nicht von Hand geändert wurden
  const [automatisch, setAutomatisch] = useState(!initial);
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));
  const setArt = (art: string) => {
    if (!automatisch || !art) return set({ art });
    const e = einstufen({ bereich, art });
    set({ art, geschaeftsbereich: e.geschaeftsbereich ?? "unklar", rolle: e.rolle });
  };
  const vorhandenesObjekt = f.titel.trim() ? findeObjekt(crm.objekte, f.titel, f.ort) : undefined;
  const gb = f.geschaeftsbereich && f.geschaeftsbereich !== "unklar" ? (f.geschaeftsbereich as Geschaeftsbereich) : null;
  const speichern = () => {
    const e: Record<string, string> = {};
    if (!f.titel.trim()) e.titel = "Bitte Objekt / Projekt angeben.";
    if (!f.art) e.art = "Bitte die Art wählen.";
    if (!f.geschaeftsbereich) e.geschaeftsbereich = "Bitte den Geschäftsbereich des Vorgangs wählen (oder „noch unklar“).";
    if (!f.rolle.trim()) e.rolle = "Bitte die Rolle des Kunden in diesem Vorgang angeben.";
    const fp = Number(f.fortschritt);
    if (isNaN(fp) || fp < 0 || fp > 100) e.fortschritt = "0 bis 100";
    setFehler(e);
    if (Object.keys(e).length) return;
    const unveraendert = initial && initial.geschaeftsbereich === gb && initial.rolle === f.rolle.trim();
    crm.speichereVorhaben({
      ...initial,
      id: initial?.id ?? crm.neueId("v"), personId, bereich, art: f.art, titel: vorhandenesObjekt?.titel ?? f.titel.trim(), ort: vorhandenesObjekt?.ort ?? f.ort, beschreibung: f.beschreibung, budget: Number(f.budget) || 0,
      status: f.status as VorhabenStatus, fortschritt: fp, zeithorizont: f.zeithorizont, unternehmenId: f.unternehmenId || undefined,
      unternehmenRolle: f.unternehmenId ? f.unternehmenRolle.trim() || undefined : undefined, bild: initial?.bild ?? vorhandenesObjekt?.bild,
      geplanterStart: f.geplanterStart || undefined, geplanteFertigstellung: f.geplanteFertigstellung || undefined,
      objektId: crm.objektZuordnen(f.titel, f.ort, initial?.bild),
      geschaeftsbereich: gb, rolle: f.rolle.trim(),
      pruefen: gb ? (unveraendert ? initial?.pruefen : undefined) : "Geschäftsbereich des Vorgangs noch offen",
      herkunft: unveraendert ? initial?.herkunft : "manuell",
    });
    toast(`Vorhaben „${vorhandenesObjekt?.titel ?? f.titel.trim()}“ ${initial ? "aktualisiert" : "angelegt"}${vorhandenesObjekt && !initial ? " – mit bestehendem Objekt verknüpft" : ""} ${GESPEICHERT}`);
    onClose();
  };
  return (
    <Modal titel={initial ? "Vorhaben bearbeiten" : "Neues Vorhaben"} onClose={onClose} breit="max-w-[640px]" footer={<><Button onClick={onClose}>Abbrechen</Button><Button variant="primary" onClick={speichern}>Speichern</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Objekt / Projekt" pflicht value={f.titel} onChange={(v) => set({ titel: v })} fehler={fehler.titel} />
        <SelectField label="Art" pflicht value={f.art} onChange={setArt} options={bereich === "sanierung" ? SANIERUNG_INTERESSEN : PRIVAT_INTERESSEN} fehler={fehler.art} />
        <TextField label="Ort" value={f.ort} onChange={(v) => set({ ort: v })} />
        <TextField label="Budget (€)" value={f.budget} onChange={(v) => set({ budget: v.replace(/[^\d]/g, "") })} />
        {vorhandenesObjekt && vorhandenesObjekt.id !== initial?.objektId && (
          <p role="status" className="rounded-[6px] bg-pos-bg px-3 py-2 text-[11.5px] text-pos sm:col-span-2">
            Objekt „{vorhandenesObjekt.titel}, {vorhandenesObjekt.ort}“ existiert bereits – der Vorgang wird damit verknüpft, es entsteht kein zweiter Objektdatensatz.
          </p>
        )}
        <div className="rounded-[8px] border border-line p-3 sm:col-span-2">
          <p className="mb-2 text-[11px] text-muted">Geschäftsbereich und Rolle gelten nur für diesen Vorgang – getrennt von den Geschäftsbereichen und Rollen des Kontakts.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Geschäftsbereich des Vorgangs" pflicht value={f.geschaeftsbereich} fehler={fehler.geschaeftsbereich}
              onChange={(v) => { setAutomatisch(false); set({ geschaeftsbereich: v }); }}
              options={[...GESCHAEFTSBEREICHE.map((b) => ({ value: b, label: `GRENFORD ${b}` })), { value: "unklar", label: "Noch unklar (prüfen)" }]}
            />
            <Field label="Rolle des Kunden im Vorgang" pflicht fehler={fehler.rolle}>
              {(id) => (<>
              <input
                id={id} aria-invalid={!!fehler.rolle}
                list="vorgang-rollen" value={f.rolle} onChange={(e) => { setAutomatisch(false); set({ rolle: e.target.value }); }} placeholder="z. B. Kaufinteressent, Verkäufer, Bauherr"
                className="focus-ring h-[34px] w-full rounded-[6px] border border-line bg-white px-3 text-[12px] text-ink"
              />
              <datalist id="vorgang-rollen">{[...new Set(gb ? ROLLEN_JE_BEREICH[gb] : Object.values(ROLLEN_JE_BEREICH).flat())].map((r) => <option key={r} value={r} />)}</datalist>
              </>)}
            </Field>
          </div>
        </div>
        <SelectField label="Status" value={f.status} onChange={(v) => set({ status: v as never })} options={["Aktiv", "In Planung", "Angebotsphase", "Abgeschlossen", "Pausiert"]} leer={null} />
        <TextField label="Fortschritt (%)" value={f.fortschritt} onChange={(v) => set({ fortschritt: v.replace(/[^\d]/g, "") })} fehler={fehler.fortschritt} />
        <SelectField label="Zeithorizont" value={f.zeithorizont} onChange={(v) => set({ zeithorizont: v })} options={ZEITRAHMEN} />
        <SelectField label={bereich === "sanierung" ? "Ausführendes Unternehmen (GU)" : "Beteiligtes Unternehmen"} value={f.unternehmenId} onChange={(v) => set({ unternehmenId: v })} leer="– keines –" options={[...crm.unternehmen].sort((a, b) => a.name.localeCompare(b.name)).map((u) => ({ value: u.id, label: u.name }))} />
        {f.unternehmenId && <TextField label="Rolle des Unternehmens im Vorgang" value={f.unternehmenRolle} onChange={(v) => set({ unternehmenRolle: v })} placeholder="z. B. GU-Partner, Bauherr" />}
        {bereich === "sanierung" && (
          <>
            <TextField label="Geplanter Start" value={f.geplanterStart} onChange={(v) => set({ geplanterStart: v })} placeholder="Q4/2026" />
            <TextField label="Geplante Fertigstellung" value={f.geplanteFertigstellung} onChange={(v) => set({ geplanteFertigstellung: v })} placeholder="Q3/2027" />
          </>
        )}
        <div className="sm:col-span-2"><TextArea label="Beschreibung" value={f.beschreibung} onChange={(v) => set({ beschreibung: v })} /></div>
      </div>
    </Modal>
  );
}
