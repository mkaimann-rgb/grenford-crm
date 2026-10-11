"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Building2, CircleDot, Clock3, FolderOpen, Handshake, Layers, MapPin, Search, ShieldCheck, Target, TrendingUp, Wallet } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, personName } from "@/lib/crm/logic";
import {
  INVEST_STATUS, PHASEN_INVESTMENT, erwarteteCourtage, vorgangsWahrscheinlichkeit, gewichtet, phaseTitel, phasenIndex, type InvestmentProjekt,
} from "@/lib/crm/module";
import { euroCompact, euroMio } from "@/lib/format";
import { Avatar, Badge, Button, Menu, StatusBadge } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, refAus, refZu, text, zahl, type Feld } from "@/components/modul/FormModal";
import {
  AufgabenPanel, BeteiligtePanel, DetailKopf, DetailTabs, DokumentDialog, DokumentePanel, LetzteAktivitaeten, NichtGefunden, PhasenLeiste, RefLink, TESTMODUS, VerlaufPanel, bezugVorgang,
} from "@/components/modul/detail";
import { InfoPanel, KaeuferprozessDetail, KaeuferprozessListe, KaeuferprozessModal } from "@/components/modul/kaeufer";
import { FinanzPanel } from "@/components/modul/FinanzPanel";

export const ASSETKLASSEN = ["Mehrfamilienhaus", "Wohnportfolio", "Mixed-Use", "Hotel", "Grundstück", "Zinshaus", "Mikro-Living", "Logistik", "Senior Living", "Co-Living", "Healthcare", "Büro"];
const VERMARKTUNGSARTEN = ["Off-Market", "Bieterverfahren", "Exklusiv", "Offene Vermarktung"];

/** Wahrscheinlichkeit eines Projekts = beste Wahrscheinlichkeit seiner aktiven Käuferprozesse */
export function projektWahrscheinlichkeit(p: InvestmentProjekt, kps: { projektId: string; wahrscheinlichkeit: number; status: string }[]) {
  return vorgangsWahrscheinlichkeit(p, kps);
}

function Wiedervorlage({ datum, heute }: { datum?: string; heute: string }) {
  if (!datum) return <span className="text-muted">—</span>;
  const farbe = datum < heute ? "bg-neg" : "bg-[#f2b84b]";
  return <span className="flex items-center gap-1.5 whitespace-nowrap"><span className={`h-[8px] w-[8px] rounded-full ${farbe}`} />{datumDe(datum)}</span>;
}

function phaseKurz(code: string) {
  const { i, j } = phasenIndex(PHASEN_INVESTMENT, code);
  return i < 0 ? code : PHASEN_INVESTMENT[i].unter[j]?.titel ?? PHASEN_INVESTMENT[i].titel;
}

export function InvestmentProjekteListe() {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const rows = crm.investmentProjekte;
  const aktiv = (p: InvestmentProjekt) => p.status === "Aktiv" || p.status === "In Prüfung";
  const ids = new Set(rows.map((p) => p.id));
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Investment" }, { label: "Projekte" }]}
        titel="Projekte"
        untertitel="Alle Investment-Projekte – von der Akquise bis zum Closing."
        neu={{ label: "Neues Projekt", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(p) => [p.titel, p.id, p.standort, p.assetklasse, crm.refName(p.eigentuemer)]}
        suchePlatzhalter="Projekte durchsuchen …"
        href={(p) => `/investment/projekte/${p.id}`}
        defaultSort={{ key: "wv", richtung: "asc" }}
        columns={[
          { key: "name", header: "Projektname", sort: (p) => p.titel, cell: (p) => <div className="flex items-center gap-2.5"><Avatar name={p.titel} bild={crm.objektById(p.objektId)?.bild} size={34} rund={false} /><div><div className="font-semibold text-navy-950">{p.titel}</div><div className="text-[10.5px] text-muted">{p.id}</div></div></div> },
          { key: "asset", header: "Assetklasse", sort: (p) => p.assetklasse, cell: (p) => <Badge tone="gray">{p.assetklasse}</Badge> },
          { key: "standort", header: "Standort", sort: (p) => p.standort, cell: (p) => <span className="text-ink-soft">{p.standort}</span> },
          { key: "vol", header: "Volumen (ca.)", sort: (p) => p.volumen, cell: (p) => euroCompact(p.volumen) },
          { key: "phase", header: "Phase", sort: (p) => p.phase, cell: (p) => <Badge tone={p.phase.startsWith("D") ? "amber" : "blue"} className="min-w-[86px]" >{p.phase} · {phaseKurz(p.phase)}</Badge> },
          { key: "status", header: "Status", sort: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
          { key: "next", header: "Nächster Schritt", cell: (p) => <span className="line-clamp-2 max-w-[120px] text-ink-soft">{p.naechsterSchritt || "—"}</span> },
          { key: "wv", header: "Wiedervorlage", sort: (p) => p.wiedervorlage ?? "9999", cell: (p) => <Wiedervorlage datum={p.wiedervorlage} heute={crm.heute} /> },
        ]}
        filter={[
          { key: "status", label: "Status", wert: (p) => p.status, inBar: true },
          { key: "phase", label: "Phase", wert: (p) => phaseTitel(PHASEN_INVESTMENT, p.phase[0]), inBar: true, offen: true },
          { key: "asset", label: "Assetklasse", wert: (p) => p.assetklasse, inBar: true },
          { key: "region", label: "Region", wert: (p) => p.standort, inBar: true },
          { key: "betreuer", label: "Betreuer", wert: (p) => crm.benutzerName(p.verantwortlichId) },
        ]}
        quick={[
          { id: "", label: "Alle Projekte", icon: Layers, test: () => true },
          { id: "aktiv", label: "Aktive Projekte", icon: CircleDot, test: aktiv },
          { id: "pruefung", label: "In Prüfung", icon: Search, test: (p) => p.status === "In Prüfung" },
          ...PHASEN_INVESTMENT.map((ph) => ({ id: `ph-${ph.code}`, label: `${ph.code} – ${ph.titel}`, icon: Target, test: (p: InvestmentProjekt) => p.phase.startsWith(ph.code) && p.status !== "Abgeschlossen" })),
          { id: "abgeschlossen", label: "Abgeschlossen", icon: ShieldCheck, test: (p) => p.status === "Abgeschlossen" },
        ]}
        kpis={[
          { label: "Gesamt", icon: Building2, wert: (r) => r.length, sub: "Projekte", quick: "" },
          { label: "Transaktionsvolumen (gesamt)", icon: Wallet, wert: (r) => euroMio(r.reduce((s, p) => s + p.volumen, 0) / 1e6, 1), sub: "aller Projekte" },
          { label: "Erwartete GRENFORD-Provision", icon: BarChart3, wert: (r) => euroMio(r.filter(aktiv).reduce((s, p) => s + gewichtet(erwarteteCourtage(p), projektWahrscheinlichkeit(p, crm.kaeuferprozesse)), 0) / 1e6, 2), sub: "(gewichtet, aktive Projekte)" },
          { label: "Aktive Projekte", icon: Clock3, wert: (r) => r.filter(aktiv).length, sub: "in Bearbeitung", quick: "aktiv" },
          { label: "Abgeschlossene Projekte", icon: Handshake, wert: (r) => r.filter((p) => p.status === "Abgeschlossen").length, sub: "dieses Jahr", quick: "abgeschlossen" },
        ]}
        csv={{ datei: "investment-projekte.csv", kopf: ["Projekt-ID", "Projekt", "Objekt-ID", "Assetklasse", "Standort", "Volumen", "Phase", "Status", "Verkäufer/Eigentümer", "Nächster Schritt", "Wiedervorlage"], zeile: (p) => [p.id, p.titel, crm.objektById(p.objektId)?.nummer ?? p.objektId, p.assetklasse, p.standort, p.volumen, phaseTitel(PHASEN_INVESTMENT, p.phase), p.status, crm.refName(p.eigentuemer), p.naechsterSchritt, p.wiedervorlage ? datumDe(p.wiedervorlage) : ""] }}
        statusAenderung={{ werte: INVEST_STATUS, setze: (sel, s) => sel.forEach((id) => { const p = rows.find((x) => x.id === id)!; crm.speichere("investmentProjekte", { ...p, status: s as InvestmentProjekt["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "vorgang" && ids.has(b.id)))}
        card={(p) => (
          <div className="card h-full p-3 hover:shadow-md">
            <div className="flex gap-3"><Avatar name={p.titel} bild={crm.objektById(p.objektId)?.bild} size={48} rund={false} /><div className="min-w-0"><div className="truncate text-[13px] font-semibold text-navy-950">{p.titel}</div><div className="text-[11px] text-muted">{p.id} · {p.standort}</div></div></div>
            <div className="mt-2 flex items-center justify-between text-[11.5px]"><span>{euroCompact(p.volumen)}</span><Badge tone="blue">{p.phase}</Badge><StatusBadge status={p.status} /></div>
          </div>
        )}
      />
      {neu && <InvestmentProjektModal onClose={() => setNeu(false)} />}
    </>
  );
}

export function InvestmentProjektModal({ initial, onClose, vorbelegung }: { initial?: InvestmentProjekt; onClose: () => void; vorbelegung?: Partial<InvestmentProjekt> }) {
  const crm = useCrm();
  const toast = useToast();
  const router = useRouter();
  const p = initial ?? vorbelegung;
  const felder: Feld[] = [
    { key: "titel", label: "Projektname", typ: "text", pflicht: true },
    { key: "assetklasse", label: "Assetklasse", typ: "select", pflicht: true, options: ASSETKLASSEN },
    { key: "objektId", label: "Objekt (zentraler Objektbestand)", typ: "objekt", pflicht: true, breit: true },
    { key: "standort", label: "Standort", typ: "text", pflicht: true },
    { key: "eigentuemer", label: "Verkäufer / Eigentümer (aus Stammdaten)", typ: "ref" },
    { key: "volumen", label: "Kaufpreis (Indikation, €)", typ: "zahl", pflicht: true },
    { key: "courtageSatz", label: "Netto-Courtage (%)", typ: "zahl", pflicht: true, hinweis: "Grundlage der erwarteten GRENFORD-Provision" },
    { key: "phase", label: "Phase", typ: "select", pflicht: true, options: PHASEN_INVESTMENT.flatMap((ph) => ph.unter.map((u) => ({ value: u.code, label: `${u.code} – ${u.titel} (${ph.titel})` }))) },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: INVEST_STATUS },
    { key: "vermarktungsart", label: "Vermarktungsart", typ: "select", options: VERMARKTUNGSARTEN },
    { key: "faktor", label: "Faktor (aktuell)", typ: "zahl" },
    { key: "rendite", label: "Rendite (%)", typ: "zahl" },
    { key: "naechsterSchritt", label: "Nächster Schritt", typ: "text" },
    { key: "wiedervorlage", label: "Wiedervorlage", typ: "datum" },
  ];
  return (
    <FormModal
      titel={initial ? `Projekt ${initial.id} bearbeiten` : "Neues Investment-Projekt"}
      felder={felder}
      start={{
        titel: p?.titel ?? "", assetklasse: p?.assetklasse ?? "", objektId: p?.objektId ?? "", standort: p?.standort ?? "", eigentuemer: refZu(p?.eigentuemer), volumen: p?.volumen ? String(p.volumen) : "",
        courtageSatz: String(p?.courtageSatz ?? 6).replace(".", ","), phase: p?.phase ?? "A1", status: p?.status ?? "Aktiv", vermarktungsart: p?.vermarktungsart ?? "Off-Market", faktor: p?.faktor ? String(p.faktor).replace(".", ",") : "",
        rendite: p?.rendite ? String(p.rendite).replace(".", ",") : "", naechsterSchritt: p?.naechsterSchritt ?? "", wiedervorlage: p?.wiedervorlage ?? "",
      }}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? crm.nummer("investmentProjekt");
        const neu: InvestmentProjekt = {
          erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, zielpreis: "", tags: [], beteiligte: [], abschlussErwartet: "", ...p,
          id, titel: text(w.titel), assetklasse: text(w.assetklasse), objektId: text(w.objektId), standort: text(w.standort), eigentuemer: refAus(w.eigentuemer), volumen: zahl(w.volumen), courtageSatz: zahl(w.courtageSatz),
          phase: text(w.phase), status: text(w.status) as InvestmentProjekt["status"], vermarktungsart: text(w.vermarktungsart), faktor: zahl(w.faktor) || undefined, rendite: zahl(w.rendite) || undefined,
          naechsterSchritt: text(w.naechsterSchritt), wiedervorlage: text(w.wiedervorlage) || undefined,
        };
        crm.speichere("investmentProjekte", neu, { ref: id, text: initial ? "Projektdaten geändert" : `Projekt ${id} angelegt${neu.akquiseId ? ` (aus ${neu.akquiseId})` : ""}` });
        toast(`Projekt ${id} ${initial ? "gespeichert" : "angelegt"} ${TESTMODUS}`);
        if (!initial) router.push(`/investment/projekte/${id}`);
      }}
    />
  );
}

type Tab = "uebersicht" | "kaeufer" | "aktivitaeten" | "aufgaben" | "beteiligte" | "dokumente" | "finanzen" | "notizen" | "verlauf";

export function InvestmentProjektDetail({ id, kaeuferId }: { id: string; kaeuferId?: string }) {
  const crm = useCrm();
  const toast = useToast();
  const p = crm.investmentProjekte.find((x) => x.id === id);
  const kps = crm.kaeuferprozesse.filter((k) => k.projektId === id);
  const [tab, setTab] = useState<Tab>(kaeuferId ? "kaeufer" : "uebersicht");
  const [auswahl, setAuswahl] = useState(kaeuferId ?? kps.find((k) => k.status === "Aktiv")?.id ?? kps[0]?.id);
  const [modal, setModal] = useState<"edit" | "kp" | "dok" | null>(null);
  if (!p) return <NichtGefunden was="Investment-Projekt" href="/investment/projekte" />;
  const o = crm.objektById(p.objektId);
  const refIds = [p.id, ...kps.map((k) => k.id)];
  const akt = crm.aktivitaetenVon(...refIds);
  const aufgaben = akt.filter((a) => a.typ === "Aufgabe");
  const kp = kps.find((k) => k.id === auswahl);
  const speichern = (neu: InvestmentProjekt, t: string) => { crm.speichere("investmentProjekte", neu, { ref: p.id, text: t }); toast(`${t} ${TESTMODUS}`); };
  const docs = crm.dokumente.filter((d) => refIds.includes(d.ref)).length;
  const fin = crm.provisionen.filter((x) => refIds.includes(x.referenz)).length + crm.verbindlichkeiten.filter((v) => refIds.includes(v.referenz)).length;

  return (
    <div className="mx-auto max-w-[1600px]">
      <DetailKopf
        crumbs={[{ label: "Investment", href: "/investment/projekte" }, { label: kaeuferId ? "Käuferprozesse" : "Projekte", href: kaeuferId ? "/investment/kaeuferprozesse" : "/investment/projekte" }, { label: kaeuferId ?? p.id }]}
        bild={o?.bild}
        bilder={o?.bild ? 8 : 0}
        idBadge={p.id}
        titel={`${p.titel}${o?.objektart && !p.titel.includes(o.objektart) ? ` – ${o.objektart}` : ""}`}
        meta={[
          { icon: <MapPin className="h-4 w-4" />, text: p.standort },
          { icon: <Building2 className="h-4 w-4" />, text: o?.objektart ?? p.assetklasse },
          { icon: <TrendingUp className="h-4 w-4" />, text: p.vermarktungsart },
          { icon: <span className={`h-2 w-2 rounded-full ${p.status === "Aktiv" ? "bg-pos" : "bg-muted"}`} />, text: p.status },
        ]}
        tags={[{ label: "Investment", cls: "bg-[#e3eaf8] text-navy-800" }, ...p.tags.map((t, i) => ({ label: t, cls: ["bg-[#fdeee2] text-[#b4570f]", "bg-pos-bg text-pos", "bg-royal-100 text-navy-900"][i % 3] }))]}
        kennzahlen={[
          { label: "Kaufpreis (Indikation)", wert: euroCompact(p.volumen), sub: p.zielpreis ? `Ziel: ${p.zielpreis}` : undefined },
          { label: "Faktor (aktuell)", wert: p.faktor ? `${String(p.faktor).replace(".", ",")}x` : "—" },
          { label: "Stabilized Yield", wert: p.rendite ? `${String(p.rendite).replace(".", ",")} %` : "—" },
          { label: "Marktmiet-Upside", wert: p.upside ?? "—" },
          { label: "Einheiten", wert: o?.einheiten ?? "—" },
          { label: "Wohnfläche", wert: o?.wohnflaeche ? `${o.wohnflaeche.toLocaleString("de-DE")} m²` : "—" },
          { label: "Standort", wert: p.standort },
          { label: "Vermarktungsart", wert: p.vermarktungsart },
        ]}
        aktionen={
          <>
            <Button size="sm" onClick={() => setModal("edit")}>Bearbeiten</Button>
            <Button size="sm" onClick={() => setModal("dok")}>Dokument erfassen</Button>
            <Button size="sm" onClick={() => toast("Google Drive ist nicht verbunden – der Projektordner wird nach der Einrichtung verknüpft (siehe Einstellungen → Integrationen).")}><FolderOpen className="h-3.5 w-3.5" />Projektordner · Google Drive</Button>
            <Menu label="Weitere Aktionen" items={[
              { label: "Neuer Käuferprozess", onClick: () => setModal("kp") },
              ...INVEST_STATUS.filter((s) => s !== p.status).map((s) => ({ label: `Status „${s}“`, onClick: () => speichern({ ...p, status: s }, `Status → ${s}`) })),
              { label: "Finanzen öffnen", onClick: () => setTab("finanzen") },
            ]} trigger={<span className="flex h-[32px] items-center rounded-[6px] bg-navy-900 px-3 text-[12px] font-semibold text-white">Weitere Aktionen</span>} />
          </>
        }
      />
      <PhasenLeiste phasen={PHASEN_INVESTMENT} aktuell={p.phase} onWechsel={(c) => speichern({ ...p, phase: c }, `Phase → ${phaseTitel(PHASEN_INVESTMENT, c)}`)} />
      <DetailTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "uebersicht", label: "Übersicht" }, { id: "kaeufer", label: "Käuferprozesse", anzahl: kps.length }, { id: "aktivitaeten", label: "Aktivitäten" },
          { id: "aufgaben", label: "Aufgaben", anzahl: aufgaben.filter((a) => !a.erledigt).length }, { id: "beteiligte", label: "Ansprechpartner", anzahl: p.beteiligte.length }, { id: "dokumente", label: "Dokumente", anzahl: docs },
          { id: "finanzen", label: "Finanzen", anzahl: fin }, { id: "notizen", label: "Notizen" }, { id: "verlauf", label: "Verlauf" },
        ]}
      />
      <div className="mt-4">
        {(tab === "uebersicht" || tab === "kaeufer") && (
          <div className="grid gap-[12px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.95fr)]">
            <div className="space-y-[12px]">
              <KaeuferprozessListe prozesse={kps} phasen={PHASEN_INVESTMENT} auswahl={auswahl} onWahl={setAuswahl} onNeu={() => setModal("kp")} />
              <InfoPanel titel="Projektinformationen" onBearbeiten={() => setModal("edit")} rows={[
                ["Projektname", p.titel], ["Projekt-ID", p.id], ["Objekt", o ? `${o.titel} (${o.nummer ?? o.id})` : "—"], ["Objektart", o?.objektart ?? p.assetklasse], ["Standort", p.standort],
                ["Einheiten", o?.einheiten ? String(o.einheiten) : "—"], ["Wohnfläche", o?.wohnflaeche ? `${o.wohnflaeche.toLocaleString("de-DE")} m²` : "—"], ["Kaufpreis (Indikation)", euroCompact(p.volumen)],
                ["Zielkaufpreis", p.zielpreis || "—"], ["Verkäufer / Eigentümer", <RefLink key="e" r={p.eigentuemer} fallback="noch offen" />], ["Courtage (netto)", `${String(p.courtageSatz).replace(".", ",")} % = ${euroCompact(erwarteteCourtage(p))}`],
                ["Vermarktungsart", p.vermarktungsart], ["Status", <StatusBadge key="s" status={p.status} />], ["Verantwortlicher", crm.benutzerName(p.verantwortlichId)],
                ["Herkunft", p.akquiseId ? <Link key="a" className="text-royal-600 hover:underline" href={`/akquise/pipeline/${p.akquiseId}`}>{p.akquiseId} (Akquise)</Link> : "direkt angelegt"],
              ]} />
            </div>
            <div>{kp ? <KaeuferprozessDetail k={kp} phasen={PHASEN_INVESTMENT} objektTitel={p.titel} /> : <div className="card p-6 text-center text-[12px] text-muted">Käuferprozess auswählen oder neu anlegen.</div>}</div>
            <div className="space-y-[12px]">
              <AufgabenPanel aufgaben={aufgaben} bezug={bezugVorgang(p.id)} />
              <LetzteAktivitaeten aktivitaeten={akt} onAlle={() => setTab("aktivitaeten")} />
              <BeteiligtePanel beteiligte={p.beteiligte} onAendern={(b) => speichern({ ...p, beteiligte: b }, "Beteiligte geändert")} />
            </div>
          </div>
        )}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={akt.filter((a) => a.typ !== "Notiz")} bezug={bezugVorgang(p.id)} />}
        {tab === "notizen" && <AktivitaetenPanel nurNotizen aktivitaeten={akt.filter((a) => a.typ === "Notiz")} bezug={bezugVorgang(p.id)} />}
        {tab === "aufgaben" && <AufgabenPanel titel="Aufgaben" aufgaben={aufgaben} bezug={bezugVorgang(p.id)} />}
        {tab === "beteiligte" && (
          <div className="grid gap-[12px] lg:grid-cols-2">
            <BeteiligtePanel titel="Ansprechpartner & Beteiligte" beteiligte={p.beteiligte} onAendern={(b) => speichern({ ...p, beteiligte: b }, "Beteiligte geändert")} />
            <InfoPanel titel="Käufer (aus Käuferprozessen)" rows={kps.map((k) => [k.id, <span key={k.id}>{crm.refName(k.kaeufer)}{k.ansprechpartnerId ? ` · ${personName(crm.personById(k.ansprechpartnerId)!)}` : ""} · {k.phase}</span>])} />
          </div>
        )}
        {tab === "dokumente" && <DokumentePanel refIds={refIds} />}
        {tab === "finanzen" && <FinanzPanel refIds={refIds} bereich="Investment" zahler={kps.find((k) => k.status === "Gekauft")?.kaeufer ?? kp?.kaeufer} basis={p.volumen} satz={p.courtageSatz} />}
        {tab === "verlauf" && <VerlaufPanel refIds={refIds} />}
      </div>
      {modal === "edit" && <InvestmentProjektModal initial={p} onClose={() => setModal(null)} />}
      {modal === "kp" && <KaeuferprozessModal bereich="Investment" projektId={p.id} onClose={() => setModal(null)} />}
      {modal === "dok" && <DokumentDialog refId={p.id} onClose={() => setModal(null)} />}
    </div>
  );
}
