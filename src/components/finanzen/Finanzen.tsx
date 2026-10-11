"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, Coins, Database, FileText, Gavel, PieChart as PieIcon, Receipt, Users, Wallet } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe } from "@/lib/crm/logic";
import { MAHNSTUFEN, beteiligungsbetrag } from "@/lib/crm/module";
import { GESCHAEFTSBEREICHE } from "@/lib/crm/types";
import { finanzKennzahlen, forderungZeilen, naechsteBelegNr, pruefeZahlung, verbindlichkeitZeilen, type ForderungZeile, type VerbindlichkeitZeile } from "@/lib/finanzen/buchung";
import { downloadCsv } from "@/lib/csv";
import { euro, euroCompact } from "@/lib/format";
import { BereichMarke, Button, FilterSelect, SearchInput, StatusBadge, Tabs } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/toast";
import { KpiRow, NichtImplementiert, PageHeader, Panel } from "@/components/crm/page";
import { FormModal, text, zahl } from "@/components/modul/FormModal";
import { TESTMODUS, VorgangLink } from "@/components/modul/detail";

const FARBE = { Investment: "#2f6fe4", Property: "#16a374", Projects: "#7c6be6" } as const;
const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const tt = (v: unknown) => euro(Number(v));

function Karte({ titel, children, aktion, className = "" }: { titel: string; children: ReactNode; aktion?: ReactNode; className?: string }) {
  return <Panel titel={titel} aktion={aktion} className={`min-w-0 ${className}`}>{children}</Panel>;
}

/** Zahlungs-/Auszahlungsdialog mit Teilzahlung und Prüfung (nur tatsächliche Zahlungen) */
function ZahlungDialog({ art, nr, rest, refId, onClose }: { art: "eingang" | "auszahlung"; nr: string; rest: number; refId?: string; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  return (
    <FormModal
      titel={art === "eingang" ? `Zahlungseingang zu ${nr}` : `Auszahlung zu ${nr}`}
      hinweis={`Offener Rest: ${euro(rest)}. Teilzahlungen sind möglich. Geplante Zahlungen werden nicht gebucht.`}
      felder={[{ key: "betrag", label: "Betrag (€)", typ: "zahl", pflicht: true }, { key: "datum", label: "Zahlungsdatum", typ: "datum", pflicht: true }]}
      start={{ betrag: String(rest), datum: crm.heute }}
      pruefen={(w) => { const f = pruefeZahlung(zahl(w.betrag), rest, text(w.datum), crm.heute); return f ? { betrag: f } : ({} as Record<string, string>); }}
      onClose={onClose}
      speichern={(w) => {
        if (art === "eingang") {
          const id = naechsteBelegNr("ZE-", crm.zahlungseingaenge.map((z) => z.id));
          crm.speichere("zahlungseingaenge", { id, datum: text(w.datum), rechnungNr: nr, betrag: zahl(w.betrag) }, { ref: refId ?? nr, text: `Zahlungseingang ${id} über ${euro(zahl(w.betrag))} auf ${nr}` });
        } else {
          const id = naechsteBelegNr("AZ-", crm.auszahlungen.map((z) => z.id));
          crm.speichere("auszahlungen", { id, datum: text(w.datum), verbindlichkeitNr: nr, betrag: zahl(w.betrag) }, { ref: refId ?? nr, text: `Auszahlung ${id} über ${euro(zahl(w.betrag))} auf ${nr}` });
        }
        toast(`${art === "eingang" ? "Zahlungseingang" : "Auszahlung"} verbucht ${TESTMODUS}`);
      }}
    />
  );
}

// ======================= Übersicht =======================

export function FinanzUebersicht() {
  const crm = useCrm();
  const jahr = crm.heute.slice(0, 4);
  const k = finanzKennzahlen(crm, crm.provisionen, crm.heute);
  const fz = forderungZeilen(crm, crm.heute);
  const vz = verbindlichkeitZeilen(crm, crm.heute);
  const imJahr = (d: string) => d.startsWith(jahr);
  const rechnungJahr = crm.forderungen.filter((f) => imJahr(f.datum ?? f.faellig));
  const gesamt = rechnungJahr.reduce((s, f) => s + f.betrag, 0) + crm.provisionen.filter((p) => p.status === "Entstanden").reduce((s, p) => s + p.betrag, 0);
  const partner = crm.verbindlichkeiten.filter((v) => (v.typ === "Provision" || v.typ === "Empfehlungsprovision") && imJahr(v.faellig));
  const partnerSumme = partner.reduce((s, v) => s + v.betrag, 0);
  const proBereich = GESCHAEFTSBEREICHE.map((b) => ({ name: b, value: rechnungJahr.filter((f) => f.bereich === b).reduce((s, f) => s + f.betrag, 0) }));
  const status = [
    { name: "Gezahlt", value: crm.zahlungseingaenge.filter((z) => imJahr(z.datum) && z.datum <= crm.heute).reduce((s, z) => s + z.betrag, 0), color: "#16a374" },
    { name: "Offen", value: k.nichtUeberfaellig.summe, color: "#f2b84b" },
    { name: "Überfällig", value: k.ueberfaellig.summe, color: "#d94a4a" },
  ];
  const monate = MONATE.map((m, i) => {
    const pre = `${jahr}-${String(i + 1).padStart(2, "0")}`;
    return {
      m,
      Gesamtprovisionen: crm.forderungen.filter((f) => (f.datum ?? f.faellig).startsWith(pre)).reduce((s, f) => s + f.betrag, 0),
      "GRENFORD-Anteil": crm.forderungen.filter((f) => (f.datum ?? f.faellig).startsWith(pre)).reduce((s, f) => s + f.betrag, 0) - partner.filter((v) => v.faellig.startsWith(pre)).reduce((s, v) => s + v.betrag, 0),
      Auszahlungen: crm.auszahlungen.filter((z) => z.datum.startsWith(pre) && z.datum <= crm.heute).reduce((s, z) => s + z.betrag, 0),
    };
  });
  const topProjekte = [...new Set(crm.forderungen.filter((f) => f.referenz).map((f) => f.referenz!))]
    .map((ref) => ({ ref, summe: crm.forderungen.filter((f) => f.referenz === ref).reduce((s, f) => s + f.betrag, 0) }))
    .sort((a, b) => b.summe - a.summe).slice(0, 5);
  const topPartner = [...new Set(crm.verbindlichkeiten.map((v) => v.empfaenger))]
    .map((e) => ({ e, summe: crm.auszahlungen.filter((a) => crm.verbindlichkeiten.find((v) => v.nr === a.verbindlichkeitNr)?.empfaenger === e && a.datum <= crm.heute).reduce((s, a) => s + a.betrag, 0) }))
    .sort((a, b) => b.summe - a.summe).slice(0, 5);
  const faellig = [...fz.filter((f) => f.rest > 0).map((f) => ({ id: f.nr, wer: f.kunde, was: `Forderung ${f.referenz ?? ""}`.trim(), datum: f.faellig, betrag: f.rest, status: f.status })), ...vz.filter((v) => v.rest > 0).map((v) => ({ id: v.nr, wer: v.empfaenger, was: `${v.typ} – ${v.referenz}`, datum: v.faellig, betrag: v.rest, status: v.status }))].sort((a, b) => a.datum.localeCompare(b.datum)).slice(0, 6);
  return (
    <div className="mx-auto max-w-[1600px] space-y-[14px]">
      <PageHeader crumbs={[{ label: "Finanzen" }, { label: "Übersicht" }]} titel="Finanzen" untertitel={`Alle Provisionen, Zahlungen, Forderungen und Verbindlichkeiten auf einen Blick – dieses Jahr (01.01. – 31.12.${jahr}).`} />
      <KpiRow kpis={[
        { label: "Gesamtprovisionen", wert: euroCompact(gesamt), sub: "netto, Rechnungen + entstandene Ansprüche", icon: Database },
        { label: "GRENFORD-Anteil", wert: euroCompact(gesamt - partnerSumme), sub: `${gesamt ? Math.round(((gesamt - partnerSumme) / gesamt) * 100) : 0} % (netto)`, icon: PieIcon },
        { label: "Auszahlende Provisionen", wert: euroCompact(partnerSumme), sub: "Empfehlungen & Beteiligungen", icon: Users },
        { label: "Offene Forderungen", wert: euroCompact(k.offeneForderungen.summe), sub: `${k.offeneForderungen.anzahl} Rechnungen`, icon: FileText },
        { label: "Überfällige Forderungen", wert: euroCompact(k.ueberfaellig.summe), sub: `${k.ueberfaellig.anzahl} Rechnungen`, icon: Clock3 },
      ]} />
      <p className="text-[11px] text-muted">Offene Zahlungen an Partner: <b>{euro(k.offeneVerbindlichkeiten.summe)}</b> ({k.offeneVerbindlichkeiten.anzahl} Positionen) · erwartete, noch nicht entstandene Provisionen: <b>{euro(k.provisionenErwartet)}</b> (nicht in den Summen enthalten). Alle Werte werden aus den Einzelbelegen berechnet.</p>
      <div className="grid gap-[14px] xl:grid-cols-3">
        <Karte titel="Provisionsentwicklung">
          <div className="h-[230px]"><ResponsiveContainer initialDimension={{ width: 600, height: 230 }}><BarChart data={monate}><CartesianGrid vertical={false} stroke="#eef0f6" /><XAxis dataKey="m" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)} T€`} width={48} /><Tooltip formatter={tt} /><Bar dataKey="Gesamtprovisionen" fill="#0b2aa0" radius={[3, 3, 0, 0]} /><Bar dataKey="GRENFORD-Anteil" fill="#2f6fe4" radius={[3, 3, 0, 0]} /><Bar dataKey="Auszahlungen" fill="#9cc0f5" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Karte>
        <Karte titel="Provisionsverteilung nach Geschäftsbereich">
          <div className="flex items-center gap-4">
            <div className="h-[200px] w-[200px]"><ResponsiveContainer initialDimension={{ width: 200, height: 200 }}><PieChart><Pie data={proBereich} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={2}>{proBereich.map((x) => <Cell key={x.name} fill={FARBE[x.name]} />)}</Pie><Tooltip formatter={tt} /></PieChart></ResponsiveContainer></div>
            <ul className="space-y-2 text-[12px]">{proBereich.map((x) => <li key={x.name}><span className="font-semibold" style={{ color: FARBE[x.name] }}>● {x.name}</span><div className="text-muted">{euro(x.value)} · {gesamt ? Math.round((x.value / Math.max(1, proBereich.reduce((s, y) => s + y.value, 0))) * 100) : 0} %</div></li>)}</ul>
          </div>
        </Karte>
        <Karte titel="Zahlungsstatus (dieses Jahr)">
          <div className="flex items-center gap-4">
            <div className="h-[200px] w-[200px]"><ResponsiveContainer initialDimension={{ width: 200, height: 200 }}><PieChart><Pie data={status} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={2}>{status.map((x) => <Cell key={x.name} fill={x.color} />)}</Pie><Tooltip formatter={tt} /></PieChart></ResponsiveContainer></div>
            <ul className="space-y-2 text-[12px]">{status.map((x) => <li key={x.name}><span className="font-semibold" style={{ color: x.color }}>● {x.name}</span><div className="text-muted">{euro(x.value)}</div></li>)}</ul>
          </div>
        </Karte>
      </div>
      <div className="grid gap-[14px] xl:grid-cols-3">
        <Karte titel="Top Projekte nach Provisionsvolumen">
          <ol className="divide-y divide-line-soft text-[12px]">{topProjekte.map((t, i) => { const v = crm.index.get(t.ref); return <li key={t.ref} className="flex items-center gap-2 py-2"><span className="w-4 text-muted">{i + 1}</span><div className="min-w-0 flex-1"><VorgangLink id={t.ref} /><div className="truncate text-[10.5px] text-muted">{v?.titel ?? ""}</div></div><BereichMarke bereich={v?.bereich ?? null} /><span className="w-[80px] text-right font-semibold">{euro(t.summe)}</span></li>; })}</ol>
        </Karte>
        <Karte titel="Top Partner nach Auszahlungsvolumen">
          <ol className="divide-y divide-line-soft text-[12px]">{topPartner.map((t, i) => <li key={t.e} className="flex items-center gap-2 py-2"><span className="w-4 text-muted">{i + 1}</span><span className="min-w-0 flex-1 truncate font-semibold text-navy-950">{t.e}</span><span className="font-semibold">{euro(t.summe)}</span></li>)}</ol>
        </Karte>
        <Karte titel="Fällige und überfällige Zahlungen" aktion={<Link href="/finanzen/forderungen" className="link-more">Alle anzeigen</Link>}>
          <ul className="divide-y divide-line-soft text-[12px]">{faellig.map((f) => <li key={f.id} className="flex items-center gap-2 py-2"><div className="min-w-0 flex-1"><div className="truncate font-semibold text-navy-950">{f.wer}</div><div className="truncate text-[10.5px] text-muted">{f.id} · {f.was}</div></div><StatusBadge status={f.status} /><span className="w-[70px] text-right text-[11px]">{datumDe(f.datum)}</span><span className="w-[72px] text-right font-semibold">{euro(f.betrag)}</span></li>)}</ul>
        </Karte>
      </div>
      <LetzteBuchungen />
    </div>
  );
}

type Buchung = { id: string; datum: string; referenz: string; bereich: string; typ: string; wer: string; text: string; betrag: number; status: string };

function buchungen(crm: ReturnType<typeof useCrm>): Buchung[] {
  const fz = forderungZeilen(crm, crm.heute);
  const vz = verbindlichkeitZeilen(crm, crm.heute);
  const f = new Map(fz.map((x) => [x.nr, x]));
  const v = new Map(vz.map((x) => [x.nr, x]));
  return [
    ...crm.zahlungseingaenge.filter((z) => z.datum <= crm.heute).map((z) => { const x = f.get(z.rechnungNr); return { id: z.id, datum: z.datum, referenz: x?.referenz ?? z.rechnungNr, bereich: x?.bereich ?? "—", typ: "Zahlungseingang", wer: x?.kunde ?? "—", text: `auf ${z.rechnungNr}`, betrag: z.betrag, status: x && x.rest <= 0 ? "Bezahlt" : "Teilzahlung" }; }),
    ...crm.auszahlungen.filter((z) => z.datum <= crm.heute).map((z) => { const x = v.get(z.verbindlichkeitNr); return { id: z.id, datum: z.datum, referenz: x?.referenz ?? z.verbindlichkeitNr, bereich: x?.bereich ?? "—", typ: "Auszahlung Partner", wer: x?.empfaenger ?? "—", text: `${x?.typ ?? ""} (${z.verbindlichkeitNr})`, betrag: z.betrag, status: x && x.rest <= 0 ? "Bezahlt" : "Teilzahlung" }; }),
    ...fz.map((x) => ({ id: x.nr, datum: x.datum ?? x.faellig, referenz: x.referenz ?? "—", bereich: x.bereich, typ: "Rechnung", wer: x.kunde, text: `Forderung, fällig ${datumDe(x.faellig)}`, betrag: x.betrag, status: x.status })),
    ...crm.provisionen.filter((p) => p.status !== "Abgerechnet").map((p) => ({ id: p.id, datum: p.datum, referenz: p.referenz, bereich: p.bereich, typ: p.status === "Erwartet" ? "Provision (erwartet)" : "Provisionsanspruch", wer: p.zahler, text: `${p.art} ${p.satz} %`, betrag: p.betrag, status: p.status })),
  ].sort((a, b) => b.datum.localeCompare(a.datum));
}

function LetzteBuchungen({ voll = false }: { voll?: boolean }) {
  const crm = useCrm();
  const [q, setQ] = useState("");
  const [bereich, setBereich] = useState("");
  const [typ, setTyp] = useState("");
  const [auswahl, setAuswahl] = useState<Buchung | null>(null);
  const alle = buchungen(crm);
  const rows = alle.filter((b) => (!bereich || b.bereich === bereich) && (!typ || b.typ === typ) && (!q || `${b.id} ${b.referenz} ${b.wer} ${b.text}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <section className="card p-[14px]" aria-label="Provisionen und Zahlungen">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-serif text-[15px] font-bold text-navy-950">{voll ? `Provisionen und Zahlungen (${rows.length})` : "Letzte Provisionen und Zahlungen"}</h2>
        <SearchInput value={q} onChange={setQ} placeholder="Provisionen und Zahlungen suchen …" className="w-full sm:w-[220px]" />
        <FilterSelect label="Geschäftsbereich" value={bereich} onChange={setBereich} options={[...GESCHAEFTSBEREICHE]} />
        <FilterSelect label="Typ" value={typ} onChange={setTyp} options={[...new Set(alle.map((b) => b.typ))]} />
        <Button size="sm" onClick={() => downloadCsv("provisionen-zahlungen.csv", ["Beleg", "Datum", "Referenz", "Bereich", "Typ", "Beteiligter/Empfänger", "Beschreibung", "Betrag", "Status"], rows.map((b) => [b.id, datumDe(b.datum), b.referenz, b.bereich, b.typ, b.wer, b.text, b.betrag, b.status]))}>Export (CSV)</Button>
      </div>
      <div className="mt-3">
        <DataTable rows={rows} defaultPageSize={voll ? 25 : 6} onRowClick={setAuswahl} defaultSort={{ key: "datum", richtung: "desc" }} columns={[
          { key: "datum", header: "Datum", sort: (b) => b.datum, cell: (b) => datumDe(b.datum) },
          { key: "ref", header: "Projekt / Referenz", sort: (b) => b.referenz, cell: (b) => <div><VorgangLink id={b.referenz === "—" ? undefined : b.referenz} /><div className="text-[10.5px] text-muted">{crm.index.get(b.referenz)?.titel ?? b.id}</div></div> },
          { key: "bereich", header: "Geschäftsbereich", cell: (b) => (b.bereich === "—" ? "—" : <BereichMarke bereich={b.bereich} />) },
          { key: "typ", header: "Typ", sort: (b) => b.typ, cell: (b) => b.typ },
          { key: "wer", header: "Beteiligter / Empfänger", sort: (b) => b.wer, cell: (b) => <span className="line-clamp-1 max-w-[180px]">{b.wer}</span> },
          { key: "text", header: "Beschreibung", cell: (b) => <span className="line-clamp-1 max-w-[200px] text-ink-soft">{b.text}</span> },
          { key: "betrag", header: "Betrag (netto)", sort: (b) => b.betrag, align: "right", cell: (b) => <span className="font-semibold">{euro(b.betrag)}</span> },
          { key: "status", header: "Status", sort: (b) => b.status, cell: (b) => <StatusBadge status={b.status} /> },
        ]} />
      </div>
      {auswahl && (
        <Modal titel={`${auswahl.typ} ${auswahl.id}`} onClose={() => setAuswahl(null)} breit="max-w-[620px]" footer={<Button onClick={() => setAuswahl(null)}>Schließen</Button>}>
          <dl className="grid grid-cols-[150px_1fr] gap-y-2 text-[12.5px]">
            {[["Beleg", auswahl.id], ["Datum", datumDe(auswahl.datum)], ["Referenz", <VorgangLink key="r" id={auswahl.referenz === "—" ? undefined : auswahl.referenz} />], ["Geschäftsbereich", auswahl.bereich], ["Beteiligter", auswahl.wer], ["Beschreibung", auswahl.text], ["Betrag (netto)", euro(auswahl.betrag)], ["Status", <StatusBadge key="s" status={auswahl.status} />]].map(([k, v]) => <div key={String(k)} className="contents"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {(() => {
            const plan = auswahl.typ === "Rechnung" ? crm.zahlungseingaenge.filter((z) => z.rechnungNr === auswahl.id) : [];
            return plan.length ? <><h3 className="mt-3 text-[12px] font-semibold">Zahlungsplan / Zahlungen</h3><ul className="text-[12px]">{plan.map((z, i) => <li key={z.id}>{i + 1}. Rate · {datumDe(z.datum)} · {euro(z.betrag)} · {z.datum <= crm.heute ? "gezahlt" : "geplant (nicht gebucht)"}</li>)}</ul></> : null;
          })()}
        </Modal>
      )}
    </section>
  );
}

// ======================= Provisionen & Zahlungen =======================

export function ProvisionenZahlungen() {
  const crm = useCrm();
  const [tab, setTab] = useState<"uebersicht" | "provisionen" | "forderungen" | "verbindlichkeiten" | "eur" | "datev">("uebersicht");
  const k = finanzKennzahlen(crm, crm.provisionen, crm.heute);
  const vereinbart = crm.provisionen.reduce((s, p) => s + p.betrag, 0) + crm.forderungen.filter((f) => !f.provisionId).reduce((s, f) => s + f.betrag, 0);
  return (
    <div className="mx-auto max-w-[1600px] space-y-[14px]">
      <PageHeader crumbs={[{ label: "Finanzen" }, { label: "Provisionen & Zahlungen" }]} titel="Provisionen & Zahlungen" untertitel="Alle Provisionen, Forderungen, Auszahlungen und Zahlungen im Überblick." />
      <Tabs tabs={[{ id: "uebersicht", label: "Übersicht" }, { id: "provisionen", label: "Provisionen" }, { id: "forderungen", label: "Forderungen (Kunden)" }, { id: "verbindlichkeiten", label: "Verbindlichkeiten (Partner)" }, { id: "eur", label: "EÜR & Steuer" }, { id: "datev", label: "DATEV Export" }]} value={tab} onChange={setTab} />
      {tab === "uebersicht" && (
        <>
          <KpiRow kpis={[
            { label: "Vereinbarte Provisionen (netto)", wert: euroCompact(vereinbart), sub: `${crm.provisionen.length + crm.forderungen.filter((f) => !f.provisionId).length} Positionen`, icon: Database },
            { label: "Eingegangene Zahlungen", wert: euroCompact(k.eingangJahr), sub: "dieses Jahr", icon: CheckCircle2 },
            { label: "Offene Forderungen (Kunden)", wert: euroCompact(k.offeneForderungen.summe), sub: `${k.offeneForderungen.anzahl} Rechnungen`, icon: Clock3 },
            { label: "Auszahlungen an Partner", wert: euroCompact(k.auszahlungJahr), sub: "dieses Jahr", icon: Wallet },
            { label: "Offene Verbindlichkeiten", wert: euroCompact(k.offeneVerbindlichkeiten.summe), sub: `${k.offeneVerbindlichkeiten.anzahl} Positionen`, icon: Coins },
          ]} />
          <LetzteBuchungen voll />
        </>
      )}
      {tab === "provisionen" && <ProvisionsTabelle />}
      {tab === "forderungen" && <ForderungenTabelle />}
      {tab === "verbindlichkeiten" && <VerbindlichkeitenTabelle />}
      {tab === "eur" && <NichtImplementiert was="Die EÜR- und Steuerauswertung (nach Abstimmung mit der Steuerberatung)" />}
      {tab === "datev" && <NichtImplementiert was="Der DATEV-Export (benötigt Kontenrahmen und Zugangsdaten der Steuerberatung)" />}
    </div>
  );
}

function ProvisionsTabelle() {
  const crm = useCrm();
  const beteiligt = crm.provisionsbeteiligungen.reduce((s, b) => s + beteiligungsbetrag(b), 0);
  return (
    <section className="card p-[14px]">
      <h2 className="font-serif text-[15px] font-bold text-navy-950">Provisionsansprüche ({crm.provisionen.length})</h2>
      <p className="text-[11px] text-muted">Erwartet → Entstanden → Abgerechnet (Rechnung = Forderung). Beteiligungen Dritter gesamt: {euro(beteiligt)}.</p>
      <div className="mt-2"><DataTable rows={crm.provisionen} defaultSort={{ key: "datum", richtung: "desc" }} columns={[
        { key: "id", header: "Anspruch", sort: (p) => p.id, cell: (p) => p.id },
        { key: "datum", header: "Datum", sort: (p) => p.datum, cell: (p) => datumDe(p.datum) },
        { key: "ref", header: "Vorgang", cell: (p) => <VorgangLink id={p.referenz} /> },
        { key: "bereich", header: "Bereich", cell: (p) => <BereichMarke bereich={p.bereich} /> },
        { key: "art", header: "Art", cell: (p) => p.art },
        { key: "zahler", header: "Zahler", cell: (p) => p.zahler },
        { key: "basis", header: "Basis", align: "right", cell: (p) => euro(p.basis) },
        { key: "satz", header: "Satz", align: "right", cell: (p) => (p.satz ? `${p.satz.toLocaleString("de-DE")} %` : "pauschal") },
        { key: "betrag", header: "Betrag", sort: (p) => p.betrag, align: "right", cell: (p) => <b>{euro(p.betrag)}</b> },
        { key: "status", header: "Status", sort: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
        { key: "re", header: "Rechnung", cell: (p) => p.rechnungNr ?? "—" },
      ]} /></div>
    </section>
  );
}

// ======================= Forderungen =======================

const MAHN_KEY: Record<string, (f: ForderungZeile) => boolean> = {
  offen: (f) => f.rest > 0 && f.status !== "Überfällig",
  ueberfaellig: (f) => f.rest > 0 && f.status === "Überfällig",
  "mahnung-1": (f) => f.rest > 0 && (f.mahnstufe ?? 0) === 1,
  "mahnung-2": (f) => f.rest > 0 && (f.mahnstufe ?? 0) === 2,
  vollstreckung: (f) => f.rest > 0 && (f.mahnstufe ?? 0) === 3,
};

function naechsterSchritt(f: ForderungZeile) {
  if (f.rest <= 0) return "—";
  if (f.status !== "Überfällig") return `Zahlung erwartet am ${datumDe(f.faellig)}`;
  const m = f.mahnstufe ?? 0;
  return m === 0 ? "1. Mahnung vorbereiten" : m === 1 ? "2. Mahnung vorbereiten" : m === 2 ? "Rechtliche Eskalation prüfen (manuell)" : "Vollstreckung in Vorbereitung – keine automatischen Schritte";
}

function ForderungenTabelle({ statusFilter = "" }: { statusFilter?: string }) {
  const crm = useCrm();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [bereich, setBereich] = useState("");
  const [status, setStatus] = useState(statusFilter);
  const [zahlung, setZahlung] = useState<ForderungZeile | null>(null);
  const [mahnen, setMahnen] = useState<ForderungZeile | null>(null);
  const alle = forderungZeilen(crm, crm.heute);
  const rows = alle.filter((f) => (status ? MAHN_KEY[status]?.(f) ?? true : f.rest > 0) && (!bereich || f.bereich === bereich) && (!q || `${f.nr} ${f.kunde} ${f.referenz ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <section className="card p-[14px]" aria-label="Forderungen">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-serif text-[15px] font-bold text-navy-950">Forderungen ({rows.length})</h2>
        <SearchInput value={q} onChange={setQ} placeholder="Forderungen suchen …" className="w-full sm:w-[200px]" />
        <FilterSelect label="Geschäftsbereich" value={bereich} onChange={setBereich} options={[...GESCHAEFTSBEREICHE]} />
        <FilterSelect label="Mahnstatus" value={status} onChange={setStatus} options={[{ value: "offen", label: "Offen (nicht überfällig)" }, { value: "ueberfaellig", label: "Überfällig" }, { value: "mahnung-1", label: "1. Mahnung" }, { value: "mahnung-2", label: "2. Mahnung" }, { value: "vollstreckung", label: "Vollstreckung" }, { value: "alle", label: "Alle inkl. bezahlt" }]} />
        <Button size="sm" onClick={() => downloadCsv("forderungen.csv", ["Rechnungsnr.", "Rechnungsdatum", "Fälligkeit", "Tage offen", "Kunde", "Referenz", "Bereich", "Betrag", "Bezahlt", "Offen", "Status", "Mahnstufe"], rows.map((f) => [f.nr, f.datum ? datumDe(f.datum) : "", datumDe(f.faellig), f.tageOffen, f.kunde, f.referenz ?? "", f.bereich, f.betrag, f.gezahlt, f.rest, f.status, MAHNSTUFEN[f.mahnstufe ?? 0]]))}>Export (CSV)</Button>
      </div>
      <div className="mt-3">
        <DataTable rows={rows.map((f) => ({ ...f, id: f.nr }))} defaultSort={{ key: "faellig", richtung: "asc" }} leerText="Keine Forderungen für diesen Filter." columns={[
          { key: "nr", header: "Rechnungsnr.", sort: (f) => f.nr, cell: (f) => <span className="font-semibold text-royal-600">{f.nr}</span> },
          { key: "datum", header: "Rechnungsdatum", sort: (f) => f.datum ?? "", cell: (f) => (f.datum ? datumDe(f.datum) : "—") },
          { key: "faellig", header: "Fälligkeit", sort: (f) => f.faellig, cell: (f) => <span className={f.status === "Überfällig" ? "text-neg" : ""}>{datumDe(f.faellig)}</span> },
          { key: "tage", header: "Tage offen", sort: (f) => f.tageOffen, cell: (f) => (f.rest > 0 && f.tageOffen ? <span className="rounded bg-neg-bg px-1.5 text-neg">{f.tageOffen}</span> : "—") },
          { key: "kunde", header: "Kunde / Unternehmen", sort: (f) => f.kunde, cell: (f) => <span className="line-clamp-1 max-w-[170px]">{f.kunde}</span> },
          { key: "ref", header: "Projekt / Referenz", cell: (f) => <VorgangLink id={f.referenz} /> },
          { key: "bereich", header: "Geschäftsbereich", cell: (f) => <BereichMarke bereich={f.bereich} /> },
          { key: "betrag", header: "Offen (netto)", sort: (f) => f.rest, align: "right", cell: (f) => <div className="text-right"><b>{euro(f.rest)}</b>{f.gezahlt > 0 && <div className="text-[10px] text-muted">von {euro(f.betrag)}</div>}</div> },
          { key: "mahn", header: "Mahnstatus", cell: (f) => <StatusBadge status={f.rest <= 0 ? "Bezahlt" : f.status !== "Überfällig" ? "Nicht überfällig" : (f.mahnstufe ?? 0) === 0 ? "Überfällig" : MAHNSTUFEN[f.mahnstufe!]} /> },
          { key: "next", header: "Nächster Schritt", cell: (f) => <span className={`line-clamp-2 max-w-[160px] text-[11px] ${f.status === "Überfällig" ? "text-neg" : "text-ink-soft"}`}>{naechsterSchritt(f)}</span> },
        ]} rowMenu={(f) => [
          ...(f.rest > 0 ? [{ label: "Zahlungseingang verbuchen", onClick: () => setZahlung(f) }] : []),
          ...(f.rest > 0 && f.status === "Überfällig" && (f.mahnstufe ?? 0) < 3 ? [{ label: `Mahnstufe erhöhen → ${MAHNSTUFEN[(f.mahnstufe ?? 0) + 1]}`, onClick: () => setMahnen(f) }] : []),
          ...((f.mahnstufe ?? 0) > 0 ? [{ label: "Mahnstufe zurücksetzen", onClick: () => { crm.speichere("forderungen", { ...f, mahnstufe: 0 }, { ref: f.referenz ?? f.nr, text: `${f.nr}: Mahnstufe zurückgesetzt` }); toast(`Mahnstufe zurückgesetzt ${TESTMODUS}`); } }] : []),
        ]} />
      </div>
      {zahlung && <ZahlungDialog art="eingang" nr={zahlung.nr} rest={zahlung.rest} refId={zahlung.referenz} onClose={() => setZahlung(null)} />}
      {mahnen && (
        <Modal titel={`${mahnen.nr}: ${MAHNSTUFEN[(mahnen.mahnstufe ?? 0) + 1]} vormerken`} onClose={() => setMahnen(null)} breit="max-w-[520px]" footer={<><Button onClick={() => setMahnen(null)}>Abbrechen</Button><Button variant="primary" onClick={() => { const neu = (mahnen.mahnstufe ?? 0) + 1; crm.speichere("forderungen", { ...mahnen, mahnstufe: neu }, { ref: mahnen.referenz ?? mahnen.nr, text: `${mahnen.nr}: ${MAHNSTUFEN[neu]} vorgemerkt (Nachverfolgung)` }); toast(`${MAHNSTUFEN[neu]} vorgemerkt ${TESTMODUS}`); setMahnen(null); }}>Vormerken</Button></>}>
          <p className="flex gap-2 text-[12.5px]"><AlertTriangle className="h-5 w-5 shrink-0 text-warn" />Die Mahnstufe dient der Nachverfolgung und Vorbereitung. Es wird <b>kein</b> Schreiben versendet und es werden <b>keine</b> rechtlichen Schritte automatisch ausgelöst.</p>
        </Modal>
      )}
    </section>
  );
}

export function ForderungenSeite() {
  const crm = useCrm();
  const params = useSearchParams();
  const k = finanzKennzahlen(crm, crm.provisionen, crm.heute);
  const fz = forderungZeilen(crm, crm.heute).filter((f) => f.rest > 0);
  const [m1, m2, m3] = k.mahnstufen;
  const mahnDonut = [
    { name: "Nicht überfällig", value: k.nichtUeberfaellig.summe, color: "#16a374" },
    { name: "Überfällig (ohne Mahnung)", value: fz.filter((f) => f.status === "Überfällig" && !(f.mahnstufe ?? 0)).reduce((s, f) => s + f.rest, 0), color: "#f2b84b" },
    { name: "1. Mahnung", value: m1.summe, color: "#f59e3b" },
    { name: "2. Mahnung", value: m2.summe, color: "#ef7d32" },
    { name: "Vollstreckung", value: m3.summe, color: "#d94a4a" },
  ];
  const nachBereich = GESCHAEFTSBEREICHE.map((b) => ({ name: b, value: fz.filter((f) => f.bereich === b).reduce((s, f) => s + f.rest, 0) }));
  const bezahlte = forderungZeilen(crm, crm.heute).filter((f) => f.rest <= 0);
  const verzug = (f: ForderungZeile) => { const letzte = crm.zahlungseingaenge.filter((z) => z.rechnungNr === f.nr).map((z) => z.datum).sort().pop() ?? f.faellig; return Math.round((Date.parse(letzte) - Date.parse(f.faellig)) / 86_400_000); };
  const moral = [["Pünktlich (bis 14 Tage)", (d: number) => d <= 14], ["15–28 Tage", (d: number) => d > 14 && d <= 28], ["29–42 Tage", (d: number) => d > 28 && d <= 42], ["> 42 Tage", (d: number) => d > 42]] as const;
  const top = [...new Set(fz.map((f) => f.kunde))].map((kd) => ({ kd, summe: fz.filter((f) => f.kunde === kd).reduce((s, f) => s + f.rest, 0), bereich: fz.find((f) => f.kunde === kd)!.bereich })).sort((a, b) => b.summe - a.summe).slice(0, 5);
  return (
    <div className="mx-auto max-w-[1600px] space-y-[14px]">
      <PageHeader crumbs={[{ label: "Finanzen" }, { label: "Forderungen (Kunden)" }]} titel="Forderungen (Kunden)" untertitel="Offene Kundenforderungen mit Mahnstatus, Fälligkeiten und Zahlungsmoral." />
      <section aria-label="Kennzahlen" className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:grid-cols-6">
        {[
          { l: "Gesamte Forderungen (offen)", w: k.offeneForderungen.summe, s: `${k.offeneForderungen.anzahl} Rechnungen`, i: FileText, c: "text-navy-950" },
          { l: "Nicht überfällig", w: k.nichtUeberfaellig.summe, s: `${k.nichtUeberfaellig.anzahl} Rechnungen`, i: CheckCircle2, c: "text-pos" },
          { l: "Überfällig", w: k.ueberfaellig.summe, s: `${k.ueberfaellig.anzahl} Rechnungen`, i: Clock3, c: "text-warn" },
          { l: "1. Mahnung", w: m1.summe, s: `${m1.anzahl} Rechnung(en)`, i: Receipt, c: "text-neg" },
          { l: "2. Mahnung", w: m2.summe, s: `${m2.anzahl} Rechnung(en)`, i: Receipt, c: "text-neg" },
          { l: "Vollstreckung", w: m3.summe, s: `${m3.anzahl} Rechnung(en)`, i: Gavel, c: "text-neg" },
        ].map((x) => <div key={x.l} className="card flex items-start gap-2 px-3 py-3"><x.i className={`h-7 w-7 shrink-0 ${x.c}`} strokeWidth={1.5} /><div className="min-w-0"><div className="truncate text-[11px] text-ink">{x.l}</div><div className={`whitespace-nowrap font-serif text-[clamp(17px,1.4vw,22px)] font-bold ${x.c}`}>{euro(x.w)}</div><div className="text-[11px] text-muted">{x.s}</div></div></div>)}
      </section>
      <div className="grid gap-[14px] xl:grid-cols-3">
        <Karte titel="Forderungen nach Mahnstatus">
          <div className="flex items-center gap-3"><div className="h-[190px] w-[190px]"><ResponsiveContainer initialDimension={{ width: 190, height: 190 }}><PieChart><Pie data={mahnDonut} dataKey="value" innerRadius={55} outerRadius={85}>{mahnDonut.map((x) => <Cell key={x.name} fill={x.color} />)}</Pie><Tooltip formatter={tt} /></PieChart></ResponsiveContainer></div><ul className="space-y-1 text-[11.5px]">{mahnDonut.map((x) => <li key={x.name}><span style={{ color: x.color }}>●</span> {x.name}<div className="text-muted">{euro(x.value)}</div></li>)}</ul></div>
        </Karte>
        <Karte titel="Fälligkeitsverlauf (offene Restbeträge)">
          <div className="h-[200px]"><ResponsiveContainer initialDimension={{ width: 600, height: 200 }}><BarChart data={MONATE.map((m, i) => { const pre = `${crm.heute.slice(0, 4)}-${String(i + 1).padStart(2, "0")}`; return { m, offen: fz.filter((f) => f.faellig.startsWith(pre)).reduce((s, f) => s + f.rest, 0) }; })}><CartesianGrid vertical={false} stroke="#eef0f6" /><XAxis dataKey="m" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} width={48} tickFormatter={(v) => `${Math.round(v / 1000)} T€`} /><Tooltip formatter={tt} /><Bar dataKey="offen" fill="#2f6fe4" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Karte>
        <Karte titel="Forderungen nach Geschäftsbereich">
          <ul className="space-y-3 pt-2">{nachBereich.map((b) => <li key={b.name} className="text-[12px]"><div className="flex justify-between"><span>{b.name}</span><span>{euro(b.value)}</span></div><div className="mt-1 h-[10px] rounded bg-line-soft"><div className="h-full rounded" style={{ width: `${k.offeneForderungen.summe ? (b.value / k.offeneForderungen.summe) * 100 : 0}%`, background: FARBE[b.name] }} /></div></li>)}</ul>
        </Karte>
      </div>
      <ForderungenTabelle statusFilter={params.get("status") ?? ""} />
      <div className="grid gap-[14px] xl:grid-cols-3">
        <Karte titel="Zahlungsmoral Kunden (bezahlte Rechnungen)">
          <ul className="space-y-2 text-[12px]">{moral.map(([l, t]) => { const n = bezahlte.filter((f) => t(verzug(f))).length; return <li key={l}><div className="flex justify-between"><span>{l}</span><span>{n} · {bezahlte.length ? Math.round((n / bezahlte.length) * 100) : 0} %</span></div><div className="mt-1 h-[8px] rounded bg-line-soft"><div className="h-full rounded bg-pos" style={{ width: `${bezahlte.length ? (n / bezahlte.length) * 100 : 0}%` }} /></div></li>; })}</ul>
        </Karte>
        <Karte titel="Ausfälle (nicht realisierte Forderungen)"><p className="font-serif text-[22px] font-bold text-neg">{euro(0)}</p><p className="text-[11.5px] text-muted">In den Testdaten sind keine Forderungsausfälle erfasst. Ausbuchungen erfolgen nur manuell nach Prüfung.</p></Karte>
        <Karte titel="Top 5 Kunden nach offenem Betrag">
          <ol className="divide-y divide-line-soft text-[12px]">{top.map((t, i) => <li key={t.kd} className="flex items-center gap-2 py-1.5"><span className="w-4 text-muted">{i + 1}</span><span className="min-w-0 flex-1 truncate">{t.kd}</span><span className="font-semibold">{euro(t.summe)}</span><BereichMarke bereich={t.bereich} /></li>)}</ol>
        </Karte>
      </div>
    </div>
  );
}

// ======================= Verbindlichkeiten =======================

const VB_KEY: Record<string, (v: VerbindlichkeitZeile) => boolean> = {
  "nicht-faellig": (v) => v.rest > 0 && v.tageBisFaellig > 0,
  faellig: (v) => v.rest > 0 && v.tageBisFaellig >= 0 && v.tageBisFaellig <= 14,
  ueberfaellig: (v) => v.rest > 0 && v.tageBisFaellig < 0,
  bezahlt: (v) => v.rest <= 0,
};

function VerbindlichkeitenTabelle({ statusFilter = "" }: { statusFilter?: string }) {
  const crm = useCrm();
  const [q, setQ] = useState("");
  const [bereich, setBereich] = useState("");
  const [typ, setTyp] = useState("");
  const [status, setStatus] = useState(statusFilter);
  const [zahlung, setZahlung] = useState<VerbindlichkeitZeile | null>(null);
  const alle = verbindlichkeitZeilen(crm, crm.heute);
  const rows = alle.filter((v) => (status ? VB_KEY[status]?.(v) ?? true : v.rest > 0) && (!bereich || v.bereich === bereich) && (!typ || v.typ === typ) && (!q || `${v.nr} ${v.empfaenger} ${v.referenz}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <section className="card p-[14px]" aria-label="Verbindlichkeiten">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-serif text-[15px] font-bold text-navy-950">Verbindlichkeiten ({rows.length})</h2>
        <SearchInput value={q} onChange={setQ} placeholder="Partner, Projekt oder Referenz suchen …" className="w-full sm:w-[230px]" />
        <FilterSelect label="Typ" value={typ} onChange={setTyp} options={[...new Set(alle.map((v) => v.typ))]} />
        <FilterSelect label="Geschäftsbereich" value={bereich} onChange={setBereich} options={[...GESCHAEFTSBEREICHE]} />
        <FilterSelect label="Fälligkeit" value={status} onChange={setStatus} options={[{ value: "nicht-faellig", label: "Noch nicht fällig" }, { value: "faellig", label: "Fällig (0–14 Tage)" }, { value: "ueberfaellig", label: "Überfällig" }, { value: "bezahlt", label: "Bezahlt" }]} />
        <Button size="sm" onClick={() => downloadCsv("verbindlichkeiten.csv", ["Nr.", "Fällig am", "Partner", "Typ", "Referenz", "Bereich", "Betrag", "Ausgezahlt", "Offen", "Status", "Tage bis Fälligkeit"], rows.map((v) => [v.nr, datumDe(v.faellig), v.empfaenger, v.typ, v.referenz, v.bereich, v.betrag, v.gezahlt, v.rest, v.status, v.tageBisFaellig]))}>Export (CSV)</Button>
      </div>
      <div className="mt-3">
        <DataTable rows={rows.map((v) => ({ ...v, id: v.nr }))} defaultSort={{ key: "faellig", richtung: "asc" }} leerText="Keine Verbindlichkeiten für diesen Filter." columns={[
          { key: "nr", header: "Nr.", sort: (v) => v.nr, cell: (v) => <span className="font-semibold text-royal-600">{v.nr}</span> },
          { key: "faellig", header: "Fällig am", sort: (v) => v.faellig, cell: (v) => <span className={v.rest > 0 && v.tageBisFaellig < 0 ? "text-neg" : ""}>{datumDe(v.faellig)}</span> },
          { key: "empf", header: "Partner / Unternehmen", sort: (v) => v.empfaenger, cell: (v) => <span className="line-clamp-1 max-w-[180px] text-royal-600">{v.empfaenger}</span> },
          { key: "typ", header: "Typ", sort: (v) => v.typ, cell: (v) => <span className="rounded bg-line-soft px-2 py-[2px] text-[11px]">{v.typ}</span> },
          { key: "ref", header: "Projekt / Referenz", cell: (v) => <div><VorgangLink id={v.referenz} /><div className="text-[10.5px] text-muted">{crm.index.get(v.referenz)?.titel ?? ""}</div></div> },
          { key: "bereich", header: "Geschäftsbereich", cell: (v) => <BereichMarke bereich={v.bereich} /> },
          { key: "betrag", header: "Offen (netto)", sort: (v) => v.rest, align: "right", cell: (v) => <div className="text-right"><b>{euro(v.rest)}</b>{v.gezahlt > 0 && <div className="text-[10px] text-muted">von {euro(v.betrag)}</div>}</div> },
          { key: "status", header: "Status", cell: (v) => <StatusBadge status={v.rest <= 0 ? "Bezahlt" : v.tageBisFaellig < 0 ? "Überfällig" : v.gezahlt > 0 ? "Teilzahlung" : "Offen"} /> },
          { key: "tage", header: "Tage bis Fälligkeit", sort: (v) => v.tageBisFaellig, align: "right", cell: (v) => (v.rest > 0 ? <span className={v.tageBisFaellig < 0 ? "text-neg" : v.tageBisFaellig <= 14 ? "text-warn" : ""}>{v.tageBisFaellig}</span> : "—") },
        ]} rowMenu={(v) => (v.rest > 0 ? [{ label: "Auszahlung verbuchen", onClick: () => setZahlung(v) }] : [{ label: "vollständig bezahlt", onClick: () => undefined }])} />
      </div>
      <p className="mt-2 text-[11px] text-muted">Nur Verbindlichkeiten, bei denen GRENFORD Zahlungsschuldner ist. Beauftragt ein Kunde einen GU direkt, entsteht keine GRENFORD-Verbindlichkeit.</p>
      {zahlung && <ZahlungDialog art="auszahlung" nr={zahlung.nr} rest={zahlung.rest} refId={zahlung.referenz} onClose={() => setZahlung(null)} />}
    </section>
  );
}

export function VerbindlichkeitenSeite() {
  const crm = useCrm();
  const params = useSearchParams();
  const vz = verbindlichkeitZeilen(crm, crm.heute).filter((v) => v.rest > 0);
  const s = (f: (v: VerbindlichkeitZeile) => boolean) => ({ summe: vz.filter(f).reduce((a, v) => a + v.rest, 0), n: vz.filter(f).length });
  const gesamt = s(() => true);
  const faellig = s((v) => v.tageBisFaellig <= 0);
  const bald = s((v) => v.tageBisFaellig > 0 && v.tageBisFaellig <= 14);
  const spaeter = s((v) => v.tageBisFaellig > 14);
  return (
    <div className="mx-auto max-w-[1600px] space-y-[14px]">
      <PageHeader crumbs={[{ label: "Finanzen" }, { label: "Verbindlichkeiten (Partner)" }]} titel="Verbindlichkeiten (Partner)" untertitel="Offene und fällige Provisionsauszahlungen an Empfehlungspartner, Maklerkollegen und Kooperationspartner sowie sonstige GRENFORD-Verbindlichkeiten." />
      <section aria-label="Kennzahlen" className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
        {[
          { l: "Gesamte Verbindlichkeiten (offen)", x: gesamt, i: Database, c: "text-navy-950" },
          { l: "Fällige / überfällige Verbindlichkeiten", x: faellig, i: AlertTriangle, c: "text-neg" },
          { l: "Fällig in 1–14 Tagen", x: bald, i: CalendarClock, c: "text-warn" },
          { l: "Fällig in > 14 Tagen", x: spaeter, i: CalendarClock, c: "text-navy-950" },
        ].map((k) => <div key={k.l} className="card flex items-start gap-3 px-4 py-4"><k.i className={`h-8 w-8 ${k.c}`} strokeWidth={1.5} /><div><div className="text-[11.5px] text-ink">{k.l}</div><div className={`font-serif text-[24px] font-bold ${k.c}`}>{euro(k.x.summe)}</div><div className="text-[11px] text-muted">{k.x.n} Positionen</div></div></div>)}
      </section>
      <VerbindlichkeitenTabelle statusFilter={params.get("status") ?? ""} />
    </div>
  );
}
