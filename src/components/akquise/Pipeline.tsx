"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CalendarPlus, CircleDot, ClipboardList, FileText, FileUp, Flag, Mail, MapPin, NotebookPen, PauseCircle, Plus, Star, Target, Trophy, UserRound, Wallet, XCircle } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, naechste, notizen } from "@/lib/crm/logic";
import { AKQUISE_STATUS, PIPELINE_STUFEN, PRIORITAETEN_MODUL, type Akquise } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { GESCHAEFTSBEREICHE, type Geschaeftsbereich } from "@/lib/crm/types";
import { euro, euroCompact, euroMio } from "@/lib/format";
import { Avatar, BereichMarke, Button, StatusBadge } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { AktivitaetModal } from "@/components/crm/modals";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { InfoList, NotizenCard, Panel, QuickActions, TermineCard } from "@/components/crm/page";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, refAus, refZu, text, zahl, type Feld } from "@/components/modul/FormModal";
import { BeteiligtePanel, DetailTabs, DokumentDialog, DokumentePanel, KommunikationPanel, LetzteAktivitaeten, NichtGefunden, RefLink, StatusAuswahl, StufenLeiste, TESTMODUS, VerlaufPanel, bezugVorgang } from "@/components/modul/detail";
import { ASSETKLASSEN } from "@/components/investment/Projekte";

const QUELLEN = ["Maklerkooperation", "Empfehlung", "Netzwerk", "Bestandskunde", "Website", "Kaltakquise", "Messe / Event"];
const ziel: Record<Geschaeftsbereich, string> = { Investment: "Investment-Projekt", Property: "Property-Mandat", Projects: "Projects-Mandat" };

export function PipelineListe() {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const rows = crm.akquise;
  const aktiv = (a: Akquise) => a.status === "Aktiv";
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Akquise" }, { label: "Pipeline" }]}
        titel="Pipeline"
        untertitel="Alle Akquise-Vorgänge – von der ersten Anfrage bis zur Übernahme in den Geschäftsbereich."
        neu={{ label: "Neuer Akquise-Vorgang", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(a) => [a.id, a.titel, a.ort, a.quelle, crm.refName(a.kunde), a.objektart]}
        suchePlatzhalter="Pipeline durchsuchen …"
        href={(a) => HREF.akquise(a.id)}
        bereichFilter={(a) => [a.bereich]}
        defaultSort={{ key: "wv", richtung: "asc" }}
        columns={[
          { key: "titel", header: "Vorgang", sort: (a) => a.titel, cell: (a) => <div className="flex items-center gap-2.5"><Avatar name={a.titel} bild={a.objektId ? crm.objektById(a.objektId)?.bild : undefined} size={32} rund={false} /><div><div className="font-semibold text-navy-950">{a.titel}</div><div className="text-[10.5px] text-muted">{a.id}</div></div></div> },
          { key: "bereich", header: "Geschäftsbereich", sort: (a) => a.bereich, cell: (a) => <BereichMarke bereich={a.bereich} /> },
          { key: "kunde", header: "Kunde", sort: (a) => crm.refName(a.kunde), cell: (a) => <span className="line-clamp-2 max-w-[140px]">{crm.refName(a.kunde)}</span> },
          { key: "stufe", header: "Stufe", sort: (a) => a.stufe, cell: (a) => <span className="whitespace-nowrap">{a.stufe + 1} · {PIPELINE_STUFEN[a.stufe].titel}</span> },
          { key: "vol", header: "Volumen", sort: (a) => a.volumen, cell: (a) => euroCompact(a.volumen) },
          { key: "w", header: "Wahrsch.", sort: (a) => a.wahrscheinlichkeit, cell: (a) => `${a.wahrscheinlichkeit} %` },
          { key: "prio", header: "Priorität", sort: (a) => PRIORITAETEN_MODUL.indexOf(a.prioritaet as never), cell: (a) => <span className={a.prioritaet === "Hoch" ? "font-semibold text-neg" : ""}>{a.prioritaet}</span> },
          { key: "status", header: "Status", sort: (a) => a.status, cell: (a) => <StatusBadge status={a.status} /> },
          { key: "wv", header: "Wiedervorlage", sort: (a) => (aktiv(a) ? a.wiedervorlage ?? "9999" : "9999"), cell: (a) => (a.wiedervorlage && aktiv(a) ? <span className={a.wiedervorlage < crm.heute ? "font-semibold text-neg" : ""}>{datumDe(a.wiedervorlage)}</span> : <span className="text-muted">—</span>) },
        ]}
        filter={[
          { key: "stufe", label: "Stufe", wert: (a) => `${a.stufe + 1} · ${PIPELINE_STUFEN[a.stufe].titel}`, inBar: true, offen: true },
          { key: "status", label: "Status", wert: (a) => a.status, inBar: true },
          { key: "prio", label: "Priorität", wert: (a) => a.prioritaet, inBar: true },
          { key: "quelle", label: "Quelle", wert: (a) => a.quelle },
          { key: "verantwortlich", label: "Verantwortlich", wert: (a) => crm.benutzerName(a.verantwortlichId) },
        ]}
        quick={[
          { id: "", label: "Alle Vorgänge", icon: ClipboardList, test: () => true },
          { id: "aktiv", label: "Aktive Vorgänge", icon: CircleDot, test: aktiv },
          { id: "wv", label: "Wiedervorlage fällig", icon: Flag, test: (a) => aktiv(a) && !!a.wiedervorlage && a.wiedervorlage <= crm.heute },
          { id: "hoch", label: "Priorität hoch", icon: Star, test: (a) => aktiv(a) && a.prioritaet === "Hoch" },
          { id: "uebernommen", label: "Übernommen", icon: Trophy, test: (a) => a.status === "Übernommen" },
          { id: "pausiert", label: "Pausiert", icon: PauseCircle, test: (a) => a.status === "Pausiert" },
          { id: "verloren", label: "Verloren", icon: XCircle, test: (a) => a.status === "Verloren" },
        ]}
        kpis={[
          { label: "Gesamt", icon: ClipboardList, wert: (r) => r.length, sub: "Akquise-Vorgänge", quick: "" },
          { label: "Aktiv", icon: CircleDot, wert: (r) => r.filter(aktiv).length, sub: "in der Pipeline", quick: "aktiv" },
          { label: "Pipeline-Volumen", icon: Wallet, wert: (r) => euroMio(r.filter(aktiv).reduce((s, a) => s + a.volumen, 0) / 1e6, 1), sub: "aktive Vorgänge" },
          { label: "Wiedervorlagen fällig", icon: Flag, wert: (r) => r.filter((a) => aktiv(a) && !!a.wiedervorlage && a.wiedervorlage <= crm.heute).length, sub: "heute oder überfällig", quick: "wv" },
          { label: "Übernommen", icon: Trophy, wert: (r) => r.filter((a) => a.status === "Übernommen").length, sub: "in Geschäftsbereiche", quick: "uebernommen" },
        ]}
        csv={{ datei: "akquise-pipeline.csv", kopf: ["Akquise-ID", "Titel", "Geschäftsbereich", "Quelle", "Kunde", "Stufe", "Status", "Priorität", "Volumen", "Wahrscheinlichkeit %", "Wiedervorlage", "Übernommen in"], zeile: (a) => [a.id, a.titel, a.bereich, a.quelle, crm.refName(a.kunde), `${a.stufe + 1} ${PIPELINE_STUFEN[a.stufe].titel}`, a.status, a.prioritaet, a.volumen, a.wahrscheinlichkeit, a.wiedervorlage ? datumDe(a.wiedervorlage) : "", a.uebernahme?.id ?? ""] }}
        statusAenderung={{ werte: AKQUISE_STATUS.filter((s) => s !== "Übernommen"), setze: (sel, s) => sel.forEach((id) => { const a = rows.find((x) => x.id === id)!; if (a.status !== "Übernommen") crm.speichere("akquise", { ...a, status: s as Akquise["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaetenVon(...rows.map((a) => a.id))}
      />
      {neu && <AkquiseModal onClose={() => setNeu(false)} />}
    </>
  );
}

export function AkquiseModal({ initial, onClose }: { initial?: Akquise; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const router = useRouter();
  const felder: Feld[] = [
    { key: "titel", label: "Titel / Vorgang", typ: "text", pflicht: true },
    { key: "bereich", label: "Geschäftsbereich", typ: "select", pflicht: true, options: GESCHAEFTSBEREICHE },
    { key: "quelle", label: "Akquisequelle", typ: "select", pflicht: true, options: QUELLEN },
    { key: "objektart", label: "Objektart", typ: "select", options: [...ASSETKLASSEN, "Eigentumswohnung", "Einfamilienhaus", "Dachgeschoss", "Büro / Gewerbe"] },
    { key: "kunde", label: "Kunde / Unternehmen (aus Stammdaten)", typ: "ref", pflicht: true, breit: true },
    { key: "ansprechpartnerId", label: "Ansprechpartner", typ: "person" },
    { key: "eigentuemer", label: "Eigentümer / Verkäufer", typ: "ref" },
    { key: "objektId", label: "Objekt (zentraler Objektbestand)", typ: "objekt", breit: true },
    { key: "ort", label: "Standort", typ: "text", pflicht: true },
    { key: "volumen", label: "Volumen / Kaufpreis erwartet (€)", typ: "zahl", pflicht: true },
    { key: "stufe", label: "Stufe", typ: "select", pflicht: true, options: PIPELINE_STUFEN.map((s, i) => ({ value: String(i), label: `${i + 1} – ${s.titel}` })) },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: AKQUISE_STATUS.filter((s) => s !== "Übernommen") },
    { key: "prioritaet", label: "Priorität", typ: "select", pflicht: true, options: PRIORITAETEN_MODUL },
    { key: "wahrscheinlichkeit", label: "Wahrscheinlichkeit (%)", typ: "zahl", pflicht: true },
    { key: "courtageNetto", label: "Gesamt Netto-Courtage / Vergütung (€, erwartet)", typ: "zahl" },
    { key: "eigenerAnteil", label: "Eigener GRENFORD-Anteil (%)", typ: "zahl" },
    { key: "wiedervorlage", label: "Wiedervorlage", typ: "datum" },
    { key: "naechsterSchritt", label: "Nächster Schritt", typ: "text" },
  ];
  return (
    <FormModal
      titel={initial ? `Akquise ${initial.id} bearbeiten` : "Neuer Akquise-Vorgang"}
      hinweis="Kunden, Ansprechpartner und Objekte werden aus den zentralen Stammdaten gewählt. Bei Übernahme in den Geschäftsbereich werden sie verknüpft, nicht kopiert."
      felder={felder}
      start={{
        titel: initial?.titel ?? "", bereich: initial?.bereich ?? "", quelle: initial?.quelle ?? "", objektart: initial?.objektart ?? "", kunde: refZu(initial?.kunde), ansprechpartnerId: initial?.ansprechpartnerId ?? "", eigentuemer: refZu(initial?.eigentuemer),
        objektId: initial?.objektId ?? "", ort: initial?.ort ?? "", volumen: initial?.volumen ? String(initial.volumen) : "", stufe: String(initial?.stufe ?? 0), status: initial?.status === "Übernommen" ? "Aktiv" : initial?.status ?? "Aktiv",
        prioritaet: initial?.prioritaet ?? "Normal", wahrscheinlichkeit: String(initial?.wahrscheinlichkeit ?? 20), courtageNetto: initial?.courtageNetto ? String(initial.courtageNetto) : "", eigenerAnteil: String(initial?.eigenerAnteil ?? 100), wiedervorlage: initial?.wiedervorlage ?? "", naechsterSchritt: initial?.naechsterSchritt ?? "",
      }}
      pruefen={(w) => (zahl(w.wahrscheinlichkeit) > 100 ? { wahrscheinlichkeit: "0 bis 100" } : ({} as Record<string, string>))}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? crm.nummer("akquise");
        crm.speichere("akquise", {
          erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, tags: [], checkliste: [], bewertung: "", kooperationsart: "Alleinmandat", vereinbarung: "", erwarteterAbschluss: "", ...initial,
          id, titel: text(w.titel), bereich: text(w.bereich) as Geschaeftsbereich, quelle: text(w.quelle), objektart: text(w.objektart), kunde: refAus(w.kunde), ansprechpartnerId: text(w.ansprechpartnerId) || undefined, eigentuemer: refAus(w.eigentuemer),
          objektId: text(w.objektId) || undefined, ort: text(w.ort), volumen: zahl(w.volumen), stufe: Number(w.stufe), status: (initial?.status === "Übernommen" ? "Übernommen" : text(w.status)) as Akquise["status"], prioritaet: text(w.prioritaet), wahrscheinlichkeit: zahl(w.wahrscheinlichkeit),
          courtageNetto: zahl(w.courtageNetto), eigenerAnteil: zahl(w.eigenerAnteil), wiedervorlage: text(w.wiedervorlage) || undefined, naechsterSchritt: text(w.naechsterSchritt),
        }, { ref: id, text: initial ? "Akquise-Vorgang geändert" : "Akquise-Vorgang angelegt" });
        toast(`Akquise ${id} gespeichert ${TESTMODUS}`);
        if (!initial) router.push(HREF.akquise(id));
      }}
    />
  );
}

/** Qualifizieren & übernehmen: legt den Vorgang im Geschäftsbereich an – mit denselben Stammdaten-Verweisen */
function useUebernahme() {
  const crm = useCrm();
  const toast = useToast();
  const router = useRouter();
  return (a: Akquise) => {
    let ziel: { id: string; href: string };
    if (a.bereich === "Investment") {
      const id = crm.nummer("investmentProjekt");
      crm.speichere("investmentProjekte", {
        id, erstelltAm: crm.heute, verantwortlichId: a.verantwortlichId, titel: a.titel, objektId: a.objektId ?? crm.objektZuordnen(a.titel, a.ort), assetklasse: a.objektart || "Mehrfamilienhaus", standort: a.ort, volumen: a.volumen, zielpreis: "",
        phase: "A1", status: "Aktiv", naechsterSchritt: a.naechsterSchritt, wiedervorlage: a.wiedervorlage, eigentuemer: a.eigentuemer, vermarktungsart: a.tags.includes("Off-Market") ? "Off-Market" : "Exklusiv",
        courtageSatz: a.volumen ? Math.round((a.courtageNetto / a.volumen) * 10000) / 100 || 6 : 6, tags: a.tags, abschlussErwartet: a.erwarteterAbschluss, akquiseId: a.id,
        beteiligte: [...(a.kunde ? [{ ...a.kunde, rolle: "Kunde (aus Akquise)" }] : []), ...(a.ansprechpartnerId ? [{ art: "person" as const, id: a.ansprechpartnerId, rolle: "Ansprechpartner" }] : []), ...(a.vermittler ? [a.vermittler] : [])],
      }, { ref: id, text: `Projekt aus Akquise ${a.id} übernommen – Stammdaten verknüpft, keine Kopie` });
      ziel = { id, href: HREF.invest(id) };
    } else if (a.bereich === "Property") {
      const id = crm.nummer("propertyMandat");
      crm.speichere("propertyMandate", {
        id, erstelltAm: crm.heute, verantwortlichId: a.verantwortlichId, objektId: a.objektId ?? crm.objektZuordnen(a.titel, a.ort), mandatstyp: a.titel.toLowerCase().includes("vermietung") ? "Vermietung" : "Verkauf", eigentuemer: a.eigentuemer ?? a.kunde,
        preis: a.volumen, courtageSatz: 3.57, courtageModell: "Käufercourtage", status: "In Vorbereitung", vermarktung: "Vorbereitung", phase: "A1", naechsterSchritt: a.naechsterSchritt, wiedervorlage: a.wiedervorlage,
        vertragVon: crm.heute, vertragBis: "", vermarktungsart: "Off-Market", tags: a.tags, beteiligte: a.ansprechpartnerId ? [{ art: "person", id: a.ansprechpartnerId, rolle: "Ansprechpartner" }] : [],
      }, { ref: id, text: `Mandat aus Akquise ${a.id} übernommen` });
      ziel = { id, href: HREF.mandat(id) };
    } else {
      const id = crm.nummer("projectsMandat");
      crm.speichere("projectsMandate", {
        id, erstelltAm: crm.heute, verantwortlichId: a.verantwortlichId, kunde: a.kunde!, objektId: a.objektId, kundentyp: a.kunde?.art === "unternehmen" ? "Unternehmen" : "Privatkunde", sanierungsart: a.titel, status: "Planung", verguetungSatz: crm.einstellungen.provisionsstandards.Projects,
      }, { ref: id, text: `Mandat aus Akquise ${a.id} übernommen` });
      ziel = { id, href: HREF.pmandat(id) };
    }
    crm.speichere("akquise", { ...a, status: "Übernommen", stufe: 6, uebernahme: { id: ziel.id, datum: crm.heute } }, { ref: a.id, text: `Qualifiziert und übernommen in ${ziel.id}` });
    toast(`Übernommen: ${ziel.id} angelegt – Akquisehistorie bleibt erhalten ${TESTMODUS}`);
    router.push(ziel.href);
  };
}

type Tab = "uebersicht" | "details" | "beteiligte" | "provision" | "objekt" | "aktivitaeten" | "kommunikation" | "dateien" | "notizen" | "verlauf";

export function AkquiseDetail({ id }: { id: string }) {
  const crm = useCrm();
  const toast = useToast();
  const uebernehmen = useUebernahme();
  const [tab, setTab] = useState<Tab>("uebersicht");
  const [modal, setModal] = useState<"edit" | "dok" | "check" | "uebernahme" | { typ: "Termin" | "Notiz" | "E-Mail" | "Aufgabe" } | null>(null);
  const a = crm.akquise.find((x) => x.id === id);
  if (!a) return <NichtGefunden was="Akquise-Vorgang" href="/akquise/pipeline" />;
  const o = a.objektId ? crm.objektById(a.objektId) : undefined;
  const akt = crm.aktivitaetenVon(a.id);
  const speichern = (neu: Akquise, t: string) => { crm.speichere("akquise", neu, { ref: a.id, text: t }); toast(`${t} ${TESTMODUS}`); };
  const gesperrt = a.status === "Übernommen";
  const eigen = Math.round((a.courtageNetto * a.eigenerAnteil) / 100);
  const kundeU = a.kunde?.art === "unternehmen" ? crm.unternehmenById(a.kunde.id) : undefined;
  const letzteAenderung = crm.verlauf.filter((v) => v.ref === a.id).sort((x, y) => y.zeit.localeCompare(x.zeit))[0];
  const ring = `conic-gradient(#1f5a96 ${a.wahrscheinlichkeit * 3.6}deg, #e8edf4 0deg)`;

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <nav aria-label="Brotkrumen" className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#596b83]">
            <Link href="/akquise/pipeline" className="hover:text-navy-900">Akquise</Link><span>›</span><Link href="/akquise/pipeline" className="hover:text-navy-900">Pipeline</Link><span>›</span><span aria-current="page">{a.titel}</span>
            <span className="rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold tracking-[0.12em] text-warn">Testdaten</span>
          </nav>
          <h1 className="mt-2 flex items-center gap-2 font-serif text-[30px] font-bold leading-tight text-navy-950">{a.titel}<Star className="h-5 w-5 text-navy-900" /></h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="mr-2 text-[17px] text-ink-soft">{a.id}</span>
            <BereichMarke bereich={a.bereich} className="!px-3 !py-[4px] !text-[12px]" />
            <span className="rounded-[5px] bg-royal-100 px-3 py-[4px] font-medium text-navy-900">{a.quelle}</span>
            {a.objektart && <span className="rounded-[5px] bg-royal-100 px-3 py-[4px] font-medium text-navy-900">{a.objektart}</span>}
            {a.tags.map((t) => <span key={t} className="rounded-[5px] bg-line-soft px-3 py-[4px] text-ink-soft">{t}</span>)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] text-navy-900">
            {a.kunde && <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /><RefLink r={a.kunde} /></span>}
            {a.ansprechpartnerId && <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4" /><RefLink r={{ art: "person", id: a.ansprechpartnerId }} /></span>}
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{a.ort}</span>
            <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4" />~ {euroCompact(a.volumen)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            {gesperrt && a.uebernahme ? (
              <Link href={crm.index.get(a.uebernahme.id)?.href ?? "#"} className="flex h-[38px] items-center gap-2 rounded-[6px] bg-pos px-4 text-[13px] font-semibold text-white">Übernommen in {a.uebernahme.id}<ArrowRight className="h-4 w-4" /></Link>
            ) : (
              <Button variant="primary" onClick={() => setModal("uebernahme")} disabled={a.status !== "Aktiv"}><Target className="h-4 w-4" />Qualifizieren &amp; übernehmen<ArrowRight className="h-4 w-4" /></Button>
            )}
            <Button onClick={() => setModal("edit")}>Bearbeiten</Button>
          </div>
          <div className="flex flex-wrap gap-[10px]">
            <div className="card flex min-w-[150px] items-center gap-3 px-4 py-2.5"><FileText className="h-7 w-7 text-navy-900" strokeWidth={1.4} /><div><div className="text-[11px] text-muted">Phase</div><div className="font-serif text-[16px] font-bold text-navy-950">{PIPELINE_STUFEN[a.stufe].titel}</div></div></div>
            <div className="card min-w-[130px] px-4 py-2.5"><div className="text-[11px] text-muted">Status</div><div className="mt-1">{gesperrt ? <StatusBadge status={a.status} /> : <StatusAuswahl wert={a.status} werte={AKQUISE_STATUS.filter((s) => s !== "Übernommen")} onChange={(s) => speichern({ ...a, status: s as Akquise["status"] }, `Status → ${s}`)} />}</div></div>
            <div className="card flex min-w-[170px] items-center justify-between gap-3 px-4 py-2.5"><div><div className="text-[11px] text-muted">Wahrscheinlichkeit</div><div className="font-serif text-[18px] font-bold text-navy-950">{a.wahrscheinlichkeit} %</div></div><div className="h-[36px] w-[36px] rounded-full p-[4px]" style={{ background: ring }}><div className="h-full w-full rounded-full bg-white" /></div></div>
          </div>
        </div>
      </div>

      <StufenLeiste stufen={PIPELINE_STUFEN} aktuell={a.stufe} onWechsel={gesperrt ? undefined : (i) => speichern({ ...a, stufe: i }, `Stufe → ${i + 1} ${PIPELINE_STUFEN[i].titel}`)} />

      <div className="mt-2 grid gap-[14px] 2xl:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0">
          <DetailTabs<Tab> value={tab} onChange={setTab} tabs={[
            { id: "uebersicht", label: "Übersicht" }, { id: "details", label: "Details" }, { id: "beteiligte", label: "Beteiligte" }, { id: "provision", label: "Provisionsvereinbarung" }, { id: "objekt", label: "Objekt" },
            { id: "aktivitaeten", label: "Aktivitäten" }, { id: "kommunikation", label: "Kommunikation" }, { id: "dateien", label: "Dateien" }, { id: "notizen", label: "Notizen" }, { id: "verlauf", label: "Verlauf" },
          ]} />
          <div className="mt-4">
            {tab === "uebersicht" && (
              <div className="grid gap-[12px] lg:grid-cols-2 xl:grid-cols-3">
                <Panel titel="Vorgangsinformationen">
                  <InfoList rows={[
                    ["Akquise-ID", a.id], ["Titel / Vorgang", a.titel], ["Geschäftsbereich", <BereichMarke key="b" bereich={a.bereich} />], ["Akquisequelle", a.quelle],
                    ["Status", <StatusBadge key="s" status={a.status} />], ["Priorität", gesperrt ? a.prioritaet : <StatusAuswahl key="p" label="Priorität ändern" wert={a.prioritaet} werte={PRIORITAETEN_MODUL} onChange={(p) => speichern({ ...a, prioritaet: p }, `Priorität → ${p}`)} />],
                    ["Verantwortlich", crm.benutzerName(a.verantwortlichId)], ["Erstellt am", datumDe(a.erstelltAm)], ["Zuletzt bearbeitet", letzteAenderung ? datumDe(letzteAenderung.zeit.slice(0, 10)) : datumDe(a.erstelltAm)],
                  ]} />
                </Panel>
                <Panel titel="Kunde / Unternehmen">
                  {a.kunde && (
                    <Link href={crm.refHref(a.kunde) ?? "#"} className="flex items-center gap-3 rounded-[8px] border border-line p-3 hover:bg-line-soft">
                      <Building2 className="h-8 w-8 text-navy-900" strokeWidth={1.4} />
                      <div><div className="font-serif text-[14px] font-bold text-navy-950">{crm.refName(a.kunde)}</div><div className="text-[11px] text-muted">{kundeU?.arten.join(", ") ?? "Privatperson"} · {kundeU?.ort ?? ""}</div></div>
                    </Link>
                  )}
                  <InfoList rows={[
                    ["Ansprechpartner", <RefLink key="a" r={a.ansprechpartnerId ? { art: "person", id: a.ansprechpartnerId } : undefined} />],
                    ["Eigentümer / Verkäufer", a.eigentuemer ? <RefLink key="e" r={a.eigentuemer} /> : a.eigentuemerHinweis ?? "noch offen"],
                    ["Makler / Vermittelt durch", a.vermittler ? <span key="v"><RefLink r={a.vermittler} /> ({a.vermittler.rolle})</span> : "—"],
                  ]} />
                </Panel>
                <Panel titel="Objekt / Vorhaben">
                  {o ? (
                    <InfoList rows={[["Objekt", `${o.titel} (${o.nummer ?? o.id})`], ["Objektart", o.objektart ?? a.objektart], ["Adresse", o.adresse ?? o.ort], ["Einheiten", o.einheiten ? String(o.einheiten) : "—"], ["Wohnfläche (ca.)", o.wohnflaeche ? `${o.wohnflaeche.toLocaleString("de-DE")} m²` : "—"], ["Grundstück (ca.)", o.grundstueck ? `${o.grundstueck} m²` : "—"], ["Kaufpreis (erwartet)", euroCompact(a.volumen)]]} />
                  ) : <p className="text-[12px] text-muted">Noch kein Objekt zugeordnet.</p>}
                </Panel>
                <Panel titel="Provisions- und Beteiligungsmodell">
                  <InfoList rows={[["Gesamt Netto-Courtage", euro(a.courtageNetto)], ["Eigener GRENFORD-Anteil (erwartet)", `${euro(eigen)} (${a.eigenerAnteil} %)`], ["Beteiligung Dritter", `${euro(a.courtageNetto - eigen)} (${100 - a.eigenerAnteil} %)`], ["Kooperationsart", a.kooperationsart], ["Vereinbarung", a.vereinbarung || "—"]]} />
                </Panel>
                <Panel titel="Zeitplan & nächste Schritte">
                  <InfoList rows={[["Erwarteter Abschluss", a.erwarteterAbschluss || "—"], ["Nächster Schritt", a.naechsterSchritt || "—"], ["Wiedervorlage", a.wiedervorlage ? <span key="w" className={a.wiedervorlage < crm.heute ? "font-semibold text-neg" : ""}>{datumDe(a.wiedervorlage)}</span> : "—"]]} />
                  <h3 className="mt-3 text-[12px] font-semibold text-navy-950">Checkliste aktuelle Phase ({PIPELINE_STUFEN[a.stufe].titel})</h3>
                  <ul className="mt-1 space-y-1">
                    {a.checkliste.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11.5px]">
                        <input type="checkbox" checked={c.erledigt} disabled={gesperrt} onChange={(e) => speichern({ ...a, checkliste: a.checkliste.map((x, j) => (j === i ? { ...x, erledigt: e.target.checked } : x)) }, `Checkliste: „${c.text}“ ${e.target.checked ? "erledigt" : "offen"}`)} aria-label={c.text} className="h-[14px] w-[14px] accent-navy-900" />
                        <span className={`flex-1 ${c.erledigt ? "text-muted line-through" : ""}`}>{c.text}</span>
                        {c.datum && <span className={`text-[10.5px] ${!c.erledigt && c.datum < crm.heute ? "text-neg" : "text-muted"}`}>{datumDe(c.datum)}</span>}
                      </li>
                    ))}
                  </ul>
                  {!gesperrt && <button type="button" onClick={() => setModal("check")} className="link-more mt-1"><Plus className="h-3.5 w-3.5" />Weitere Aufgabe hinzufügen</button>}
                </Panel>
                <Panel titel="Potenzial & Bewertung">
                  <InfoList rows={[["Transaktionsvolumen", euroCompact(a.volumen)], ["Erwartete GRENFORD-Provision", euro(eigen)], ["Wahrscheinlichkeit", `${a.wahrscheinlichkeit} %`], ["Bewertung", a.bewertung || "—"]]} />
                  <div className="mt-3 rounded-[8px] border border-line p-3">
                    <h3 className="font-serif text-[14px] font-bold text-navy-950">Übernahme in Geschäftsbereich</h3>
                    <p className="mt-1 text-[11.5px] text-ink-soft">Nach Qualifizierung wird der Vorgang als {ziel[a.bereich]} übernommen. Die Akquisehistorie bleibt erhalten; Kunde, Ansprechpartner und Objekt werden verknüpft, nicht kopiert.</p>
                    {gesperrt && a.uebernahme ? <p className="mt-2 text-[12px] text-pos">Übernommen am {datumDe(a.uebernahme.datum)} in <Link className="font-semibold underline" href={crm.index.get(a.uebernahme.id)?.href ?? "#"}>{a.uebernahme.id}</Link></p> : <Button size="sm" variant="primary" className="mt-2" disabled={a.status !== "Aktiv"} onClick={() => setModal("uebernahme")}>Qualifizieren &amp; übernehmen <ArrowRight className="h-3.5 w-3.5" /></Button>}
                  </div>
                </Panel>
              </div>
            )}
            {tab === "details" && <Panel titel="Details"><InfoList rows={[["Objektart", a.objektart || "—"], ["Standort", a.ort], ["Kennzeichnungen", a.tags.join(", ") || "—"], ["Erstellt", datumDe(a.erstelltAm)], ["Interne Notiz", a.notiz ?? "—"]]} /></Panel>}
            {tab === "beteiligte" && <BeteiligtePanel beteiligte={[...(a.kunde ? [{ ...a.kunde, rolle: "Kunde" }] : []), ...(a.ansprechpartnerId ? [{ art: "person" as const, id: a.ansprechpartnerId, rolle: "Ansprechpartner" }] : []), ...(a.eigentuemer ? [{ ...a.eigentuemer, rolle: "Eigentümer / Verkäufer" }] : []), ...(a.vermittler ? [a.vermittler] : [])]} />}
            {tab === "provision" && <Panel titel="Provisionsvereinbarung"><InfoList rows={[["Netto-Courtage gesamt (erwartet)", euro(a.courtageNetto)], ["GRENFORD-Anteil", `${a.eigenerAnteil} % = ${euro(eigen)}`], ["Dritte", euro(a.courtageNetto - eigen)], ["Kooperationsart", a.kooperationsart], ["Vereinbarung", a.vereinbarung || "—"]]} /><p className="mt-2 text-[11px] text-muted">Erwartete Werte – ein Provisionsanspruch entsteht erst im übernommenen Vorgang (Finanzen).</p></Panel>}
            {tab === "objekt" && (o ? <Panel titel={`Objekt ${o.nummer ?? ""}`}><InfoList rows={[["Bezeichnung", o.titel], ["Ort", o.ort], ["Adresse", o.adresse ?? "—"], ["Objektart", o.objektart ?? "—"], ["Einheiten", o.einheiten ? String(o.einheiten) : "—"], ["Fläche", o.wohnflaeche ? `${o.wohnflaeche} m²` : "—"]]} /></Panel> : <Panel titel="Objekt"><p className="text-[12px] text-muted">Kein Objekt zugeordnet – über „Bearbeiten“ wählen oder neu erfassen.</p></Panel>)}
            {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={akt.filter((x) => x.typ !== "Notiz")} bezug={bezugVorgang(a.id)} />}
            {tab === "kommunikation" && <KommunikationPanel titel="Kommunikation" an={[...(a.ansprechpartnerId ? [{ art: "person" as const, id: a.ansprechpartnerId }] : [])]} betreff={a.titel} bezug={bezugVorgang(a.id)} dateiRef={a.id} />}
            {tab === "dateien" && <DokumentePanel refIds={[a.id]} titel="Dateien" />}
            {tab === "notizen" && <AktivitaetenPanel nurNotizen aktivitaeten={akt.filter((x) => x.typ === "Notiz")} bezug={bezugVorgang(a.id)} />}
            {tab === "verlauf" && <VerlaufPanel refIds={[a.id, ...(a.uebernahme ? [a.uebernahme.id] : [])]} />}
          </div>
        </div>
        <aside className="grid content-start gap-[12px] md:grid-cols-2 2xl:mt-[50px] 2xl:grid-cols-1">
          <QuickActions aktionen={[
            { label: "Aktivität erfassen", icon: CalendarPlus, onClick: () => setModal({ typ: "Termin" }) },
            { label: "E-Mail protokollieren", icon: Mail, onClick: () => setModal({ typ: "E-Mail" }) },
            { label: "Notiz hinzufügen", icon: NotebookPen, onClick: () => setModal({ typ: "Notiz" }) },
            { label: "Datei erfassen", icon: FileUp, onClick: () => setModal("dok") },
          ]} />
          <TermineCard termine={naechste(akt, crm.heute, 3)} />
          <LetzteAktivitaeten aktivitaeten={akt} onAlle={() => setTab("aktivitaeten")} />
          <NotizenCard notizen={notizen(akt, 3)} />
        </aside>
      </div>
      {modal === "edit" && <AkquiseModal initial={a} onClose={() => setModal(null)} />}
      {modal === "dok" && <DokumentDialog refId={a.id} onClose={() => setModal(null)} />}
      {modal === "check" && <FormModal titel="Aufgabe zur Checkliste" felder={[{ key: "t", label: "Aufgabe", typ: "text", pflicht: true, breit: true }, { key: "d", label: "Fällig am", typ: "datum" }]} start={{ t: "", d: "" }} onClose={() => setModal(null)} speichern={(w) => speichern({ ...a, checkliste: [...a.checkliste, { text: text(w.t), erledigt: false, datum: text(w.d) || undefined }] }, `Checkliste ergänzt: ${text(w.t)}`)} />}
      {modal && typeof modal === "object" && <AktivitaetModal typ={modal.typ} bezug={bezugVorgang(a.id)} onClose={() => setModal(null)} />}
      {modal === "uebernahme" && (
        <Modal titel="Qualifizieren & übernehmen" onClose={() => setModal(null)} breit="max-w-[560px]" footer={<><Button onClick={() => setModal(null)}>Abbrechen</Button><Button variant="primary" onClick={() => { setModal(null); uebernehmen(a); }}>Übernehmen</Button></>}>
          <div className="space-y-2 text-[12.5px] text-ink">
            <p>Es wird ein neues <b>{ziel[a.bereich]}</b> angelegt und mit diesem Akquise-Vorgang verknüpft.</p>
            <ul className="list-disc pl-5 text-[12px] text-ink-soft">
              <li>Kunde: {crm.refName(a.kunde)} (Verknüpfung, keine Kopie)</li>
              <li>Objekt: {o ? `${o.titel} (${o.nummer ?? o.id})` : "wird anhand von Titel/Ort zugeordnet oder neu angelegt"}</li>
              <li>Volumen: {euroCompact(a.volumen)} · erwartete Provision {euro(eigen)}</li>
            </ul>
            <p className="text-[11.5px] text-muted">Der Akquise-Vorgang erhält den Status „Übernommen“; seine Historie bleibt vollständig erhalten.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
