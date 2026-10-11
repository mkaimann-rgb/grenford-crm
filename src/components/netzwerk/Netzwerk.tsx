"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, CircleDot, Coins, FolderOpen, HardHat, Home, Layers, MapPin, Percent, Share2, ShieldCheck, TrendingUp, UserRound, Users, Wallet } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe } from "@/lib/crm/logic";
import {
  BETEILIGUNG_STATUS, PARTNER_STATUS, PHASEN_BETEILIGUNG, beteiligungsbetrag, empfehlungsprovision, naechsteNummer, phaseTitel,
  type Empfehlungspartner, type Provisionsbeteiligung,
} from "@/lib/crm/module";
import type { Empfehlung } from "@/lib/crm/testdata-module";
import { HREF } from "@/lib/crm/projektion";
import { GESCHAEFTSBEREICHE, type Geschaeftsbereich } from "@/lib/crm/types";
import { bezahlt, naechsteBelegNr } from "@/lib/finanzen/buchung";
import { euro, euroCompact, euroMio } from "@/lib/format";
import { Avatar, BereichMarke, Button, Menu, StatusBadge, Tabs } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { InfoList, Panel } from "@/components/crm/page";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, liste, refAus, refZu, text, zahl, type Feld } from "@/components/modul/FormModal";
import {
  AufgabenPanel, BeteiligtePanel, DetailKopf, DetailTabs, DokumentDialog, DokumentePanel, KommunikationPanel, LetzteAktivitaeten, NichtGefunden, PhasenLeiste, RefLink, TESTMODUS, VerlaufPanel, VorgangLink, bezugVorgang,
} from "@/components/modul/detail";
import { FinanzPanel } from "@/components/modul/FinanzPanel";

// ---------- Berechnungsgrundlage ----------

/**
 * Maßgebliche Basis einer Empfehlungsprovision:
 * Investment/Property: GRENFORD-Netto-Courtage des Vorgangs (entstandene Ansprüche; sonst erwartete, gekennzeichnet).
 * Projects: provisionspflichtige Netto-Bausumme inkl. vereinbarter Nachträge (Vergabesumme) – erst nach Vergabe.
 */
export function empfehlungsBasis(crm: ReturnType<typeof useCrm>, referenz: string): { bereich: Geschaeftsbereich | null; basis: number; art: string; erwartet: boolean } {
  const info = crm.index.get(referenz);
  const bereich = info?.bereich ?? (referenz.startsWith("PRO-") ? "Projects" : referenz.startsWith("PROP") ? "Property" : referenz.startsWith("INV") ? "Investment" : null);
  if (bereich === "Projects") {
    const p = crm.projectsProjekte.find((x) => x.id === referenz);
    return { bereich, basis: p?.vergabe?.vergabesumme ?? 0, art: "Netto-Bausumme inkl. Nachträge", erwartet: !p?.vergabe };
  }
  const prov = crm.provisionen.filter((p) => p.referenz === referenz || crm.kaeuferprozesse.some((k) => k.id === p.referenz && k.projektId === referenz));
  const entstanden = prov.filter((p) => p.status !== "Erwartet").reduce((s, p) => s + p.betrag, 0);
  const erwartet = prov.filter((p) => p.status === "Erwartet").reduce((s, p) => s + p.betrag, 0);
  return { bereich, basis: entstanden || erwartet, art: "GRENFORD-Netto-Courtage", erwartet: !entstanden };
}

// ======================= Empfehlungspartner =======================

export function EmpfehlungspartnerListe() {
  const crm = useCrm();
  const params = useSearchParams();
  const [neu, setNeu] = useState(false);
  const [offen, setOffen] = useState<string | null>(params.get("id"));
  const rows = crm.empfehlungspartner;
  const name = (e: Empfehlungspartner) => (e.unternehmenId ? crm.unternehmenById(e.unternehmenId)?.name : crm.refName({ art: "person", id: e.personId })) ?? e.id;
  const emp = (e: Empfehlungspartner) => crm.empfehlungen.filter((x) => x.partnerId === e.id);
  const auswahl = rows.find((e) => e.id === offen);
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Netzwerk" }, { label: "Empfehlungspartner" }]}
        titel="Empfehlungspartner"
        untertitel="Alle Empfehlungspartner – mit Fokus, Leistungen und Kooperationsstatus."
        neu={{ label: "Neuer Empfehlungspartner", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(e) => [e.id, name(e), crm.refName({ art: "person", id: e.personId }), e.kategorie]}
        suchePlatzhalter="Empfehlungspartner suchen …"
        onRow={(e) => setOffen(e.id)}
        bereichFilter={(e) => e.bereiche}
        defaultSort={{ key: "emp", richtung: "desc" }}
        columns={[
          { key: "u", header: "Unternehmen / Partner", sort: name, cell: (e) => <div className="flex items-center gap-2"><Avatar name={name(e)} size={30} /><span className="font-semibold text-navy-950">{name(e)}</span></div> },
          { key: "ap", header: "Ansprechpartner", cell: (e) => crm.refName({ art: "person", id: e.personId }) },
          { key: "kat", header: "Kategorie", sort: (e) => e.kategorie, cell: (e) => <span className="rounded-[4px] bg-royal-100 px-2 py-[2px] text-[11px] text-navy-900">{e.kategorie}</span> },
          { key: "fokus", header: "Fokus (Bereich)", cell: (e) => <span className="flex gap-1">{e.bereiche.map((b) => <BereichMarke key={b} bereich={b} />)}</span> },
          { key: "region", header: "Region", cell: (e) => (e.unternehmenId ? crm.unternehmenById(e.unternehmenId)?.ort : crm.personById(e.personId)?.ort) ?? "—" },
          { key: "emp", header: "Empfehlungen", sort: (e) => emp(e).length, cell: (e) => emp(e).length },
          { key: "status", header: "Status", sort: (e) => e.status, cell: (e) => <StatusBadge status={e.status} /> },
          { key: "seit", header: "Kooperation seit", sort: (e) => e.seit, cell: (e) => datumDe(e.seit) },
        ]}
        filter={[
          { key: "kat", label: "Kategorie", wert: (e) => e.kategorie, inBar: true },
          { key: "status", label: "Status", wert: (e) => e.status, inBar: true },
          { key: "koop", label: "Kooperationsvertrag", wert: (e) => e.kooperation.status },
        ]}
        quick={[
          { id: "", label: "Alle Empfehlungspartner", icon: Users, test: () => true },
          { id: "aktiv", label: "Aktiv", icon: CircleDot, test: (e) => e.status === "Aktiv" },
          { id: "inv", label: "Für Investment", icon: TrendingUp, test: (e) => e.bereiche.includes("Investment") },
          { id: "prop", label: "Für Property", icon: Home, test: (e) => e.bereiche.includes("Property") },
          { id: "proj", label: "Für Projects", icon: HardHat, test: (e) => e.bereiche.includes("Projects") },
        ]}
        kpis={[
          { label: "Gesamt", icon: Users, wert: (r) => r.length, sub: "Empfehlungspartner", quick: "" },
          { label: "Aktiv", icon: CircleDot, wert: (r) => r.filter((e) => e.status === "Aktiv").length, sub: "in Zusammenarbeit", quick: "aktiv" },
          { label: "Für Investment", icon: TrendingUp, wert: (r) => r.filter((e) => e.bereiche.includes("Investment")).length, sub: "Partner", quick: "inv" },
          { label: "Für Property", icon: Building2, wert: (r) => r.filter((e) => e.bereiche.includes("Property")).length, sub: "Partner", quick: "prop" },
          { label: "Für Projects", icon: Home, wert: (r) => r.filter((e) => e.bereiche.includes("Projects")).length, sub: "Partner", quick: "proj" },
        ]}
        csv={{ datei: "empfehlungspartner.csv", kopf: ["ID", "Partner", "Ansprechpartner", "Kategorie", "Bereiche", "Satz Investment %", "Satz Property %", "Satz Projects %", "Empfehlungen", "Status", "Kooperation seit"], zeile: (e) => [e.id, name(e), crm.refName({ art: "person", id: e.personId }), e.kategorie, e.bereiche.join(", "), e.saetze.Investment ?? crm.einstellungen.provisionsstandards.Investment, e.saetze.Property ?? crm.einstellungen.provisionsstandards.Property, e.saetze.Projects ?? crm.einstellungen.provisionsstandards.Projects, emp(e).length, e.status, datumDe(e.seit)] }}
        statusAenderung={{ werte: PARTNER_STATUS, setze: (sel, s) => sel.forEach((id) => { const e = rows.find((x) => x.id === id)!; crm.speichere("empfehlungspartner", { ...e, status: s as Empfehlungspartner["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => rows.some((e) => e.personId === b.id || e.unternehmenId === b.id || e.id === b.id)))}
        kopfZusatz={<p className="mt-1 text-[11px] text-muted">Standardmodelle laut Vertrag (in Einstellungen konfigurierbar): Investment/Property {crm.einstellungen.provisionsstandards.Investment} % bzw. {crm.einstellungen.provisionsstandards.Property} % der GRENFORD-Netto-Courtage, Projects {crm.einstellungen.provisionsstandards.Projects} % der provisionspflichtigen Netto-Bausumme inkl. Nachträgen. Projektbezogene Vereinbarungen haben Vorrang.</p>}
      />
      {neu && <EmpfehlungspartnerModal onClose={() => setNeu(false)} />}
      {auswahl && <EmpfehlungspartnerEinzel e={auswahl} name={name(auswahl)} onClose={() => setOffen(null)} />}
    </>
  );
}

function EmpfehlungspartnerEinzel({ e, name, onClose }: { e: Empfehlungspartner; name: string; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const [tab, setTab] = useState<"uebersicht" | "empfehlungen" | "dokumente" | "aktivitaeten" | "verlauf">("uebersicht");
  const [edit, setEdit] = useState(false);
  const [neueEmp, setNeueEmp] = useState(false);
  const u = e.unternehmenId ? crm.unternehmenById(e.unternehmenId) : undefined;
  const p = crm.personById(e.personId);
  const emps = crm.empfehlungen.filter((x) => x.partnerId === e.id);
  const satz = (b: Geschaeftsbereich) => e.saetze[b] ?? crm.einstellungen.provisionsstandards[b];
  const zeilen = emps.map((x) => {
    const basis = empfehlungsBasis(crm, x.referenz);
    const r = basis.bereich ? empfehlungsprovision(basis.basis, satz(basis.bereich), x.individuell) : { satz: 0, betrag: 0, quelle: "—" };
    const vb = x.verbindlichkeitNr ? crm.verbindlichkeiten.find((v) => v.nr === x.verbindlichkeitNr) : undefined;
    const gezahlt = vb ? bezahlt(vb.nr, crm.auszahlungen, crm.heute) : 0;
    return { x, basis, r, vb, gezahlt };
  });
  const volumen = zeilen.reduce((s, z) => s + z.basis.basis, 0);
  const verbindlichkeitAnlegen = (z: (typeof zeilen)[number]) => {
    const nr = naechsteBelegNr(`VB-${crm.heute.slice(0, 4)}-`, crm.verbindlichkeiten.map((v) => v.nr));
    const faellig = new Date(Date.parse(crm.heute) + 30 * 86_400_000).toISOString().slice(0, 10);
    crm.speichere("verbindlichkeiten", { nr, empfaenger: name, referenz: z.x.referenz, bereich: z.basis.bereich as Geschaeftsbereich, typ: "Empfehlungsprovision", betrag: z.r.betrag, faellig, empfaengerRef: e.unternehmenId ? { art: "unternehmen", id: e.unternehmenId } : { art: "person", id: e.personId }, quelle: z.x.id }, { ref: z.x.referenz, text: `Empfehlungsprovision ${euro(z.r.betrag)} für ${name} als Verbindlichkeit ${nr} angelegt` });
    crm.speichere("empfehlungen", { ...z.x, verbindlichkeitNr: nr }, { ref: e.id, text: `Empfehlung ${z.x.id}: Verbindlichkeit ${nr} angelegt (${z.r.quelle})` });
    toast(`Verbindlichkeit ${nr} über ${euro(z.r.betrag)} angelegt ${TESTMODUS}`);
  };
  return (
    <Modal titel={`${name} – Empfehlungspartner`} onClose={onClose} breit="max-w-[1080px]" footer={<><Button onClick={onClose}>Schließen</Button><Button variant="primary" onClick={() => setEdit(true)}>Bearbeiten</Button></>}>
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-soft"><StatusBadge status={e.status} />{e.kategorie} · Empfehlungspartner · <MapPin className="h-3.5 w-3.5" />{u?.ort ?? p?.ort}</div>
      <div className="mt-3"><Tabs tabs={[{ id: "uebersicht", label: "Übersicht" }, { id: "empfehlungen", label: `Vermittelte Vorgänge (${emps.length})` }, { id: "dokumente", label: "Dokumente" }, { id: "aktivitaeten", label: "Aktivitäten" }, { id: "verlauf", label: "Verlauf" }]} value={tab} onChange={setTab} /></div>
      <div className="mt-4">
        {tab === "uebersicht" && (
          <div className="grid gap-[12px] lg:grid-cols-2">
            <Panel titel="Unternehmen"><InfoList rows={[["Unternehmen", e.unternehmenId ? <RefLink key="u" r={{ art: "unternehmen", id: e.unternehmenId }} /> : "— (Einzelperson)"], ["Rechtsform", u?.rechtsform ?? "—"], ["Branche", e.kategorie], ["Website", u?.website || "—"], ["Telefon", u?.telefon || "—"], ["Adresse", u ? `${u.strasse}, ${u.plz} ${u.ort}` : "—"], ["Tätig seit", datumDe(e.seit)]]} /></Panel>
            <div className="space-y-[12px]">
              <Panel titel="Ansprechpartner"><InfoList rows={[["Name", <RefLink key="p" r={{ art: "person", id: e.personId }} />], ["E-Mail", p?.email ?? "—"], ["Telefon", p?.telefonMobil || p?.telefonGeschaeftlich || "—"]]} /></Panel>
              <Panel titel="Fokus / Geschäftsbereiche"><div className="flex flex-wrap gap-3 text-[12px]">{GESCHAEFTSBEREICHE.map((b) => <label key={b} className="flex items-center gap-1.5"><input type="checkbox" checked={e.bereiche.includes(b)} onChange={(ev) => crm.speichere("empfehlungspartner", { ...e, bereiche: ev.target.checked ? [...e.bereiche, b] : e.bereiche.filter((x) => x !== b) }, { ref: e.id, text: `Fokus ${b} ${ev.target.checked ? "ergänzt" : "entfernt"}` })} className="accent-navy-900" />{b}</label>)}</div></Panel>
            </div>
            <Panel titel="Provisionsvereinbarung" className="lg:col-span-2">
              <div className="grid gap-3 sm:grid-cols-3">
                {GESCHAEFTSBEREICHE.map((b) => (
                  <div key={b} className={`rounded-[8px] border p-3 ${e.bereiche.includes(b) ? "border-line" : "border-dashed border-line opacity-60"}`}>
                    <BereichMarke bereich={b} />
                    <div className="mt-1 font-serif text-[22px] font-bold text-navy-950">{satz(b)} %</div>
                    <div className="text-[11px] text-muted">{b === "Projects" ? "auf provisionspflichtige Netto-Bausumme inkl. Nachträge" : "auf maßgebliche GRENFORD-Netto-Courtage"}</div>
                    <div className="mt-1 text-[11px] font-semibold">{e.saetze[b] !== undefined ? "individuell vereinbart" : "Standard laut Vertrag"}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {[["Empfehlungen", String(emps.length)], ["Vorgänge", String(new Set(emps.map((x) => x.referenz)).size)], ["Vermitteltes Volumen (Basis)", euroCompact(volumen)], ["Kooperationsvertrag", `${e.kooperation.status}${e.kooperation.vom ? ` · ${datumDe(e.kooperation.vom)}` : ""}`]].map(([l, w]) => <div key={l} className="rounded-[8px] border border-line p-3"><div className="text-[11px] text-muted">{l}</div><div className="font-serif text-[16px] font-bold text-navy-950">{w}</div></div>)}
              </div>
            </Panel>
          </div>
        )}
        {tab === "empfehlungen" && (
          <Panel titel="Vermittelte Kunden und Vorgänge" aktion={<button type="button" className="link-more" onClick={() => setNeueEmp(true)}>+ Empfehlung erfassen</button>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-[11.5px]">
                <thead className="text-[10.5px] text-muted"><tr><th className="py-1.5 font-normal">Vorgang</th><th className="font-normal">Kunde</th><th className="font-normal">Datum</th><th className="font-normal">Basis</th><th className="font-normal">Satz / Regel</th><th className="font-normal">Provision</th><th className="font-normal">Verbindlichkeit</th><th className="font-normal">Zahlung</th></tr></thead>
                <tbody className="divide-y divide-line-soft">
                  {zeilen.map((z) => (
                    <tr key={z.x.id}>
                      <td className="py-2"><BereichMarke bereich={z.basis.bereich} /> <VorgangLink id={z.x.referenz} /></td>
                      <td><RefLink r={z.x.kunde} /></td>
                      <td>{datumDe(z.x.datum)}</td>
                      <td>{z.basis.basis ? euro(z.basis.basis) : "—"}<div className="text-[10px] text-muted">{z.basis.art}{z.basis.erwartet ? " (noch nicht entstanden)" : ""}</div></td>
                      <td>{z.r.satz.toLocaleString("de-DE")} %<div className="text-[10px] text-muted">{z.r.quelle}</div></td>
                      <td className="font-semibold">{z.r.betrag ? euro(z.r.betrag) : "—"}</td>
                      <td>{z.vb ? z.vb.nr : z.basis.erwartet || !z.r.betrag ? <span className="text-muted">noch nicht fällig</span> : <button type="button" className="link-more" onClick={() => verbindlichkeitAnlegen(z)}>Verbindlichkeit anlegen</button>}</td>
                      <td>{z.vb ? (z.gezahlt >= z.vb.betrag ? <StatusBadge status="Bezahlt" /> : z.gezahlt > 0 ? <StatusBadge status="Teilzahlung" /> : <StatusBadge status="Offen" />) : "—"}</td>
                    </tr>
                  ))}
                  {!zeilen.length && <tr><td colSpan={8} className="py-3 text-muted">Noch keine Empfehlungen.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-muted">Auszahlungen werden unter Finanzen → Verbindlichkeiten bzw. im Finanzbereich des Vorgangs verbucht. Es werden nur tatsächlich erfolgte Zahlungen als bezahlt ausgewiesen.</p>
          </Panel>
        )}
        {tab === "dokumente" && <DokumentePanel refIds={[e.id]} />}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.id === e.id || b.id === e.personId || b.id === e.unternehmenId))} bezug={[...bezugVorgang(e.id), { art: "person", id: e.personId }]} />}
        {tab === "verlauf" && <VerlaufPanel refIds={[e.id]} />}
      </div>
      {edit && <EmpfehlungspartnerModal initial={e} onClose={() => setEdit(false)} />}
      {neueEmp && <EmpfehlungModal partner={e} onClose={() => setNeueEmp(false)} />}
    </Modal>
  );
}

function EmpfehlungspartnerModal({ initial, onClose }: { initial?: Empfehlungspartner; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const felder: Feld[] = [
    { key: "unternehmenId", label: "Unternehmen (optional)", typ: "unternehmen" },
    { key: "personId", label: "Ansprechpartner (Person)", typ: "person", pflicht: true },
    { key: "kategorie", label: "Kategorie", typ: "text", pflicht: true, placeholder: "z. B. Makler, Architekt, Finanzberater" },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: PARTNER_STATUS },
    { key: "bereiche", label: "Fokus (Geschäftsbereiche)", typ: "multi", pflicht: true, options: GESCHAEFTSBEREICHE },
    { key: "sInvestment", label: "Satz Investment (%) – leer = Standard", typ: "zahl" },
    { key: "sProperty", label: "Satz Property (%) – leer = Standard", typ: "zahl" },
    { key: "sProjects", label: "Satz Projects (%) – leer = Standard", typ: "zahl" },
    { key: "koop", label: "Kooperationsvertrag", typ: "select", options: ["Unterzeichnet", "In Verhandlung", "Keiner", "Beendet"] },
    { key: "vom", label: "Vertrag vom", typ: "datum" },
  ];
  const s = (b: Geschaeftsbereich) => (initial?.saetze[b] !== undefined ? String(initial.saetze[b]).replace(".", ",") : "");
  return (
    <FormModal
      titel={initial ? `Empfehlungspartner ${initial.id} bearbeiten` : "Neuer Empfehlungspartner"}
      hinweis="Empfehlungspartner werden mit bestehenden Personen/Unternehmen verknüpft. Leere Sätze = vertragliches Standardmodell (Einstellungen). Projektbezogene Vereinbarungen haben Vorrang."
      felder={felder}
      start={{ unternehmenId: initial?.unternehmenId ?? "", personId: initial?.personId ?? "", kategorie: initial?.kategorie ?? "", status: initial?.status ?? "Aktiv", bereiche: initial?.bereiche ?? [], sInvestment: s("Investment"), sProperty: s("Property"), sProjects: s("Projects"), koop: initial?.kooperation.status ?? "In Verhandlung", vom: initial?.kooperation.vom ?? "" }}
      pruefen={(w) => (crm.empfehlungspartner.some((e) => e.personId === w.personId && e.id !== initial?.id) ? { personId: "Diese Person ist bereits als Empfehlungspartner erfasst." } : ({} as Record<string, string>))}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? naechsteNummer("EP-", crm.empfehlungspartner.map((e) => e.id));
        const saetze: Empfehlungspartner["saetze"] = {};
        for (const b of GESCHAEFTSBEREICHE) { const v = w[`s${b}`]; if (typeof v === "string" && v.trim()) saetze[b] = zahl(v); }
        crm.speichere("empfehlungspartner", { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, seit: crm.heute, ...initial, id, unternehmenId: text(w.unternehmenId) || undefined, personId: text(w.personId), kategorie: text(w.kategorie), status: text(w.status) as Empfehlungspartner["status"], bereiche: liste(w.bereiche) as Geschaeftsbereich[], saetze, kooperation: { status: text(w.koop), vom: text(w.vom) || undefined, laufzeit: initial?.kooperation.laufzeit ?? "Unbefristet" } }, { ref: id, text: initial ? "Empfehlungspartner geändert" : "Empfehlungspartner angelegt" });
        toast(`Empfehlungspartner ${id} gespeichert ${TESTMODUS}`);
      }}
    />
  );
}

function EmpfehlungModal({ partner, onClose }: { partner: Empfehlungspartner; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const vorgaenge = [...crm.index.values()].filter((v) => ["Investment-Projekt", "Projects-Projekt", "Akquise"].includes(v.typ) || v.typ.startsWith("Property-Mandat"));
  return (
    <FormModal
      titel="Empfehlung erfassen"
      hinweis="Leer gelassene Felder „Satz“ und „Festbetrag“ = Standard laut Vertrag. Eine projektbezogene Vereinbarung hat Vorrang."
      felder={[
        { key: "referenz", label: "Vermittelter Vorgang", typ: "select", pflicht: true, breit: true, options: vorgaenge.map((v) => ({ value: v.id, label: `${v.id} – ${v.titel} (${v.typ})` })) },
        { key: "kunde", label: "Vermittelter Kunde", typ: "ref", breit: true },
        { key: "datum", label: "Datum", typ: "datum", pflicht: true },
        { key: "satz", label: "Individueller Satz (%)", typ: "zahl" },
        { key: "festbetrag", label: "Individueller Festbetrag (€)", typ: "zahl" },
        { key: "grund", label: "Grund der individuellen Regelung", typ: "text", breit: true },
      ]}
      start={{ referenz: "", kunde: "", datum: crm.heute, satz: "", festbetrag: "", grund: "" }}
      onClose={onClose}
      speichern={(w) => {
        const id = naechsteBelegNr("EMP-", crm.empfehlungen.map((x) => x.id));
        const indiv = text(w.satz) || text(w.festbetrag) ? { satz: text(w.satz) ? zahl(w.satz) : undefined, festbetrag: text(w.festbetrag) ? zahl(w.festbetrag) : undefined, grund: text(w.grund) || "Projektbezogene Vereinbarung" } : undefined;
        const neu: Empfehlung = { id, partnerId: partner.id, referenz: text(w.referenz), kunde: refAus(w.kunde), datum: text(w.datum), individuell: indiv };
        crm.speichere("empfehlungen", neu, { ref: partner.id, text: `Empfehlung ${id} zu ${text(w.referenz)} erfasst` });
        toast(`Empfehlung ${id} erfasst ${TESTMODUS}`);
      }}
    />
  );
}

// ======================= Provisionsbeteiligte =======================

export function ProvisionsbeteiligteListe() {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const rows = crm.provisionsbeteiligungen;
  const vb = (b: Provisionsbeteiligung) => (b.verbindlichkeitNr ? crm.verbindlichkeiten.find((v) => v.nr === b.verbindlichkeitNr) : undefined);
  const gezahlt = (b: Provisionsbeteiligung) => (b.verbindlichkeitNr ? bezahlt(b.verbindlichkeitNr, crm.auszahlungen, crm.heute) : 0);
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Netzwerk" }, { label: "Provisionsbeteiligte" }]}
        titel="Provisionsbeteiligte"
        untertitel="Individuell vereinbarte Beteiligungen an GRENFORD-Provisionen – keine Standardsätze."
        neu={{ label: "Neue Beteiligung", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(b) => [b.id, crm.refName(b.beteiligter), b.referenz, crm.index.get(b.referenz)?.titel, b.art, b.grund]}
        suchePlatzhalter="Beteiligungen suchen …"
        href={(b) => HREF.beteiligung(b.id)}
        bereichFilter={(b) => [b.bereich]}
        defaultSort={{ key: "faellig", richtung: "asc" }}
        columns={[
          { key: "b", header: "Beteiligter", sort: (b) => crm.refName(b.beteiligter), cell: (b) => <div className="flex items-center gap-2"><Avatar name={crm.refName(b.beteiligter)} size={28} /><div><div className="font-semibold text-navy-950">{crm.refName(b.beteiligter)}</div><div className="text-[10.5px] text-muted">{b.id}</div></div></div> },
          { key: "v", header: "Vorgang", cell: (b) => <div><VorgangLink id={b.referenz} /><div className="text-[10.5px] text-muted">{crm.index.get(b.referenz)?.titel ?? "Altvorgang"}</div></div> },
          { key: "bereich", header: "Bereich", cell: (b) => <BereichMarke bereich={b.bereich} /> },
          { key: "art", header: "Beteiligungsart", sort: (b) => b.art, cell: (b) => b.art },
          { key: "anteil", header: "Anteil", sort: (b) => b.anteil, cell: (b) => (b.festbetrag !== undefined ? "Festbetrag" : `${b.anteil.toLocaleString("de-DE")} %`) },
          { key: "betrag", header: "Betrag (netto)", sort: (b) => beteiligungsbetrag(b), cell: (b) => euro(beteiligungsbetrag(b)) },
          { key: "status", header: "Status", sort: (b) => b.status, cell: (b) => <StatusBadge status={b.status} /> },
          { key: "zahlung", header: "Zahlung", cell: (b) => { const v = vb(b); return v ? `${euroCompact(gezahlt(b))} von ${euroCompact(v.betrag)}` : <span className="text-muted">keine Verbindlichkeit</span>; } },
          { key: "faellig", header: "Fälligkeit", sort: (b) => b.faelligkeit, cell: (b) => (b.faelligkeit ? datumDe(b.faelligkeit) : "—") },
        ]}
        filter={[
          { key: "status", label: "Status", wert: (b) => b.status, inBar: true },
          { key: "art", label: "Beteiligungsart", wert: (b) => b.art, inBar: true },
          { key: "phase", label: "Schritt", wert: (b) => phaseTitel(PHASEN_BETEILIGUNG, b.phase[0]), offen: true },
        ]}
        quick={[
          { id: "", label: "Alle Beteiligungen", icon: Layers, test: () => true },
          { id: "verhandlung", label: "In Verhandlung", icon: Share2, test: (b) => b.status === "In Verhandlung" },
          { id: "aktiv", label: "Aktiv", icon: CircleDot, test: (b) => b.status === "Aktiv" },
          { id: "abgerechnet", label: "Abgerechnet (offen)", icon: Coins, test: (b) => b.status === "Abgerechnet" },
          { id: "ausgezahlt", label: "Ausgezahlt", icon: ShieldCheck, test: (b) => b.status === "Ausgezahlt" },
        ]}
        kpis={[
          { label: "Gesamt", icon: Users, wert: (r) => r.length, sub: "Beteiligungen", quick: "" },
          { label: "Aktiv / in Verhandlung", icon: UserRound, wert: (r) => r.filter((b) => b.status === "Aktiv" || b.status === "In Verhandlung").length, sub: "laufend" },
          { label: "Beteiligungsvolumen", icon: Wallet, wert: (r) => euroMio(r.reduce((s, b) => s + beteiligungsbetrag(b), 0) / 1e6, 2), sub: "netto, alle" },
          { label: "Offen auszuzahlen", icon: Coins, wert: (r) => euroCompact(r.reduce((s, b) => { const v = vb(b); return s + (v ? Math.max(0, v.betrag - gezahlt(b)) : 0); }, 0)), sub: "aus Verbindlichkeiten", quick: "abgerechnet" },
          { label: "Ausgezahlt", icon: Percent, wert: (r) => r.filter((b) => b.status === "Ausgezahlt").length, sub: "abgeschlossen", quick: "ausgezahlt" },
        ]}
        csv={{ datei: "provisionsbeteiligte.csv", kopf: ["ID", "Beteiligter", "Vorgang", "Bereich", "Art", "Grund", "Anteil %", "Festbetrag", "Basis (GRENFORD-Provision netto)", "Betrag", "Status", "Fälligkeit", "Verbindlichkeit", "Ausgezahlt"], zeile: (b) => [b.id, crm.refName(b.beteiligter), b.referenz, b.bereich, b.art, b.grund, b.anteil, b.festbetrag ?? "", b.basis, beteiligungsbetrag(b), b.status, b.faelligkeit ? datumDe(b.faelligkeit) : "", b.verbindlichkeitNr ?? "", gezahlt(b)] }}
        statusAenderung={{ werte: BETEILIGUNG_STATUS, setze: (sel, s) => sel.forEach((id) => { const b = rows.find((x) => x.id === id)!; crm.speichere("provisionsbeteiligungen", { ...b, status: s as Provisionsbeteiligung["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaetenVon(...rows.map((b) => b.id))}
      />
      {neu && <BeteiligungModal onClose={() => setNeu(false)} />}
    </>
  );
}

function BeteiligungModal({ initial, onClose }: { initial?: Provisionsbeteiligung; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const vorgaenge = [...crm.index.values()].filter((v) => ["Investment-Projekt", "Projects-Projekt"].includes(v.typ) || v.typ.startsWith("Property-Mandat"));
  return (
    <FormModal
      titel={initial ? `Beteiligung ${initial.id} bearbeiten` : "Neue Provisionsbeteiligung"}
      hinweis="Provisionsbeteiligte erhalten einen individuell vereinbarten Anteil an der GRENFORD-Provision. Es wird kein Standardsatz der Empfehlungspartner angewendet."
      felder={[
        { key: "beteiligter", label: "Beteiligter (aus Stammdaten)", typ: "ref", pflicht: true, breit: true },
        { key: "referenz", label: "Vorgang", typ: "select", pflicht: true, breit: true, options: vorgaenge.map((v) => ({ value: v.id, label: `${v.id} – ${v.titel}` })) },
        { key: "art", label: "Beteiligungsart", typ: "select", pflicht: true, options: ["Kooperationsverkauf", "Gemeinschaftsgeschäft", "Planungspartner", "Tippgeber (individuell)"] },
        { key: "grund", label: "Beteiligungsgrund", typ: "text", pflicht: true },
        { key: "anteil", label: "Individueller Anteil (%)", typ: "zahl", pflicht: true },
        { key: "basis", label: "Berechnungsgrundlage: GRENFORD-Provision netto (€)", typ: "zahl", pflicht: true },
        { key: "status", label: "Status", typ: "select", pflicht: true, options: BETEILIGUNG_STATUS },
        { key: "faelligkeit", label: "Fälligkeit", typ: "datum" },
      ]}
      start={{ beteiligter: refZu(initial?.beteiligter), referenz: initial?.referenz ?? "", art: initial?.art ?? "", grund: initial?.grund ?? "", anteil: initial ? String(initial.anteil).replace(".", ",") : "", basis: initial ? String(initial.basis) : "", status: initial?.status ?? "In Verhandlung", faelligkeit: initial?.faelligkeit ?? "" }}
      pruefen={(w) => (zahl(w.anteil) <= 0 || zahl(w.anteil) > 100 ? { anteil: "Anteil zwischen 0 und 100 %" } : ({} as Record<string, string>))}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? naechsteNummer(`PROV-${crm.heute.slice(0, 4)}-`, crm.provisionsbeteiligungen.map((b) => b.id));
        const ref = text(w.referenz);
        const bereich = (crm.index.get(ref)?.bereich ?? "Investment") as Geschaeftsbereich;
        crm.speichere("provisionsbeteiligungen", { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, phase: "1.1", vereinbartAm: "", ...initial, id, beteiligter: refAus(w.beteiligter)!, referenz: ref, bereich, art: text(w.art), grund: text(w.grund), anteil: zahl(w.anteil), festbetrag: initial?.festbetrag, basis: zahl(w.basis), status: text(w.status) as Provisionsbeteiligung["status"], faelligkeit: text(w.faelligkeit) }, { ref: id, text: initial ? "Beteiligung geändert" : `Beteiligung an ${ref} angelegt` });
        toast(`Beteiligung ${id} gespeichert ${TESTMODUS}`);
      }}
    />
  );
}

type Tab = "uebersicht" | "vereinbarung" | "projekt" | "aktivitaeten" | "aufgaben" | "dokumente" | "finanzen" | "notizen" | "verlauf";

export function BeteiligungDetail({ id }: { id: string }) {
  const crm = useCrm();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("uebersicht");
  const [modal, setModal] = useState<"edit" | "dok" | null>(null);
  const b = crm.provisionsbeteiligungen.find((x) => x.id === id);
  if (!b) return <NichtGefunden was="Provisionsbeteiligung" href="/netzwerk/provisionsbeteiligte" />;
  const v = crm.index.get(b.referenz);
  const o = v?.objektId ? crm.objektById(v.objektId) : undefined;
  const betrag = beteiligungsbetrag(b);
  const akt = crm.aktivitaetenVon(b.id);
  const aufgaben = akt.filter((a) => a.typ === "Aufgabe");
  const speichern = (neu: Provisionsbeteiligung, t: string) => { crm.speichere("provisionsbeteiligungen", neu, { ref: b.id, text: t }); toast(`${t} ${TESTMODUS}`); };
  const verbindlichkeitAnlegen = () => {
    const nr = naechsteBelegNr(`VB-${crm.heute.slice(0, 4)}-`, crm.verbindlichkeiten.map((x) => x.nr));
    crm.speichere("verbindlichkeiten", { nr, empfaenger: crm.refName(b.beteiligter), referenz: b.referenz, bereich: b.bereich, typ: "Provision", betrag, faellig: b.faelligkeit || crm.heute, empfaengerRef: b.beteiligter, quelle: b.id }, { ref: b.id, text: `Verbindlichkeit ${nr} über ${euro(betrag)} angelegt` });
    speichern({ ...b, status: "Abgerechnet", verbindlichkeitNr: nr, phase: "4.1" }, `Abgerechnet – Verbindlichkeit ${nr}`);
  };
  return (
    <div className="mx-auto max-w-[1600px]">
      <DetailKopf
        crumbs={[{ label: "Netzwerk", href: "/netzwerk/provisionsbeteiligte" }, { label: "Provisionsbeteiligte", href: "/netzwerk/provisionsbeteiligte" }, { label: b.id }]}
        bild={o?.bild}
        bilder={o?.bild ? 12 : 0}
        idBadge={b.id}
        titel={`${crm.refName(b.beteiligter)} – ${v?.titel ?? b.referenz}`}
        meta={[{ icon: <Building2 className="h-4 w-4" />, text: crm.refName(b.beteiligter) }, { icon: <Home className="h-4 w-4" />, text: v?.titel ?? b.referenz }, { icon: <span className="h-2 w-2 rounded-full bg-pos" />, text: b.status }]}
        tags={[{ label: b.bereich, cls: "bg-royal-100 text-navy-900" }, { label: b.art, cls: "bg-pos-bg text-pos" }, { label: b.grund }, { label: b.festbetrag !== undefined ? "Festbetrag" : `${b.anteil} % Anteil`, cls: "bg-[#fdeee2] text-[#b4570f]" }]}
        kennzahlen={[
          { label: "GRENFORD-Provision (netto)", wert: euroCompact(b.basis), sub: "(aus Vorgang)" },
          { label: "Beteiligungsanteil", wert: b.festbetrag !== undefined ? "Festbetrag" : `${b.anteil.toLocaleString("de-DE")} %`, sub: `= ${euro(betrag)}` },
          { label: "Auszahlungsbetrag", wert: euroCompact(betrag), sub: "(netto)" },
          { label: "Status", wert: b.status },
          { label: "Vorgang", wert: v?.titel ?? "—" },
          { label: "Vorgangs-ID", wert: b.referenz },
          { label: "Standort", wert: o?.ort ?? "—" },
          { label: "Beteiligungsart", wert: b.art },
        ]}
        aktionen={
          <>
            <Button size="sm" onClick={() => setModal("edit")}>Bearbeiten</Button>
            <Button size="sm" onClick={() => setModal("dok")}>Dokument erfassen</Button>
            <Button size="sm" onClick={() => toast("Google Drive ist nicht verbunden – der Projektordner wird nach der Einrichtung verknüpft.")}><FolderOpen className="h-3.5 w-3.5" />Projektordner · Google Drive</Button>
            <Menu label="Weitere Aktionen" items={[
              ...(!b.verbindlichkeitNr ? [{ label: "Abrechnen: Verbindlichkeit anlegen", onClick: verbindlichkeitAnlegen }] : []),
              ...BETEILIGUNG_STATUS.filter((s) => s !== b.status).map((s) => ({ label: `Status „${s}“`, onClick: () => speichern({ ...b, status: s }, `Status → ${s}`) })),
            ]} trigger={<span className="flex h-[32px] items-center rounded-[6px] bg-navy-900 px-3 text-[12px] font-semibold text-white">Weitere Aktionen</span>} />
          </>
        }
      />
      <PhasenLeiste phasen={PHASEN_BETEILIGUNG} aktuell={b.phase} aktionLabel="Nächsten Schritt vorbereiten" onWechsel={(c) => speichern({ ...b, phase: c }, `Schritt → ${phaseTitel(PHASEN_BETEILIGUNG, c)}`)} />
      <DetailTabs<Tab> value={tab} onChange={setTab} tabs={[
        { id: "uebersicht", label: "Übersicht" }, { id: "vereinbarung", label: "Beteiligungsvereinbarung" }, { id: "projekt", label: "Projektbezug" }, { id: "aktivitaeten", label: "Aktivitäten" },
        { id: "aufgaben", label: "Aufgaben", anzahl: aufgaben.filter((a) => !a.erledigt).length }, { id: "dokumente", label: "Dokumente", anzahl: crm.dokumente.filter((d) => d.ref === b.id).length }, { id: "finanzen", label: "Finanzen" }, { id: "notizen", label: "Notizen" }, { id: "verlauf", label: "Verlauf" },
      ]} />
      <div className="mt-4">
        {(tab === "uebersicht" || tab === "vereinbarung" || tab === "projekt") && (
          <div className="grid gap-[12px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.95fr)]">
            <div className="space-y-[12px]">
              <BeteiligtePanel titel="Beteiligte (1)" beteiligte={[{ ...b.beteiligter, rolle: "Hauptbeteiligter" }]} />
              <Panel titel="Projektinformationen"><InfoList rows={[["Vorgang", v ? <Link key="v" href={v.href} className="text-royal-600 hover:underline">{v.titel}</Link> : b.referenz], ["Vorgangs-ID", b.referenz], ["Typ", v?.typ ?? "Altvorgang (nicht im CRM erfasst)"], ["Objekt", o ? `${o.titel} (${o.nummer ?? o.id})` : "—"], ["Standort", o?.ort ?? "—"], ["Status Vorgang", v?.status ?? "—"], ["Verantwortlicher", crm.benutzerName(b.verantwortlichId)]]} /></Panel>
              <Panel titel="Beteiligungsdetails"><InfoList rows={[["Beteiligungsart", b.art], ["Geschäftsbereich", <BereichMarke key="b" bereich={b.bereich} />], ["Beteiligungsgrund", b.grund], ["Vereinbarter Anteil", b.festbetrag !== undefined ? `Festbetrag ${euro(b.festbetrag)} (individuell)` : `${b.anteil.toLocaleString("de-DE")} % an GRENFORD-Provision`], ["GRENFORD-Provision (netto)", euro(b.basis)], ["Auszahlungsbetrag (netto)", euro(betrag)], ["Status", <StatusBadge key="s" status={b.status} />], ["Vereinbart am", b.vereinbartAm ? datumDe(b.vereinbartAm) : "—"], ["Fälligkeit", b.faelligkeit ? datumDe(b.faelligkeit) : "—"], ["Verbindlichkeit", b.verbindlichkeitNr ?? "noch nicht abgerechnet"]]} /></Panel>
            </div>
            <div className="space-y-[12px]">
              <Panel titel="Beteiligungsvereinbarung" aktion={<StatusBadge status={b.status} />}>
                <div className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
                  {[["Anteil an GRENFORD-Provision", b.festbetrag !== undefined ? "Festbetrag" : `${b.anteil.toLocaleString("de-DE")} %`], ["Auszahlungsbetrag (netto)", euro(betrag)], ["Fälligkeit", b.faelligkeit ? datumDe(b.faelligkeit) : "—"], ["Status", b.status]].map(([l, w]) => <div key={l} className="rounded-[8px] border border-line p-2"><div className="text-[10.5px] text-muted">{l}</div><div className="font-semibold text-navy-950">{w}</div></div>)}
                </div>
                <p className="mt-2 text-[11px] text-muted">Kein Standardsatz – ausschließlich individuelle Vereinbarung. Provisionsbeteiligte sind nicht automatisch Empfehlungspartner.</p>
              </Panel>
              <KommunikationPanel titel="Kommunikation" an={[b.beteiligter.art === "person" ? b.beteiligter : (crm.ansprechpartnerVon(b.beteiligter.id)[0] ? { art: "person" as const, id: crm.ansprechpartnerVon(b.beteiligter.id)[0].id } : b.beteiligter)]} betreff={`Beteiligungsvereinbarung – ${b.referenz} ${v?.titel ?? ""}`} bezug={bezugVorgang(b.id)} dateiRef={b.id} />
            </div>
            <div className="space-y-[12px]">
              <AufgabenPanel aufgaben={aufgaben} bezug={bezugVorgang(b.id)} />
              <LetzteAktivitaeten aktivitaeten={akt} onAlle={() => setTab("aktivitaeten")} />
              <DokumentePanel refIds={[b.id]} />
            </div>
          </div>
        )}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={akt.filter((a) => a.typ !== "Notiz")} bezug={bezugVorgang(b.id)} />}
        {tab === "notizen" && <AktivitaetenPanel nurNotizen aktivitaeten={akt.filter((a) => a.typ === "Notiz")} bezug={bezugVorgang(b.id)} />}
        {tab === "aufgaben" && <AufgabenPanel titel="Aufgaben" aufgaben={aufgaben} bezug={bezugVorgang(b.id)} />}
        {tab === "dokumente" && <DokumentePanel refIds={[b.id]} />}
        {tab === "finanzen" && <FinanzPanel refIds={[b.id]} bereich={b.bereich} />}
        {tab === "verlauf" && <VerlaufPanel refIds={[b.id]} />}
      </div>
      {modal === "edit" && <BeteiligungModal initial={b} onClose={() => setModal(null)} />}
      {modal === "dok" && <DokumentDialog refId={b.id} onClose={() => setModal(null)} />}
    </div>
  );
}
