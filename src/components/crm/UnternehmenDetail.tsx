"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Globe, Link2, Mail, MapPin, Phone, Plus } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, naechste, notizen, personName } from "@/lib/crm/logic";
import { KONTAKT_STATUS, type Unternehmen } from "@/lib/crm/types";
import { Avatar, Badge, Button, Menu, StatusBadge, Tabs } from "@/components/ui/controls";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/toast";
import { AktivitaetenPanel } from "./aktivitaeten";
import { AktivitaetModal, PersonModal, UnternehmenModal, personHref } from "./modals";
import { InfoList, NichtImplementiert, NotizenCard, Panel, StatCard, TermineCard } from "./page";
import { ChevronDown, ChevronRight } from "lucide-react";

type Tab = "uebersicht" | "ansprechpartner" | "projekte" | "aktivitaeten" | "dateien" | "notizen" | "finanzen" | "einstellungen";

export function UnternehmenDetail({ id }: { id: string }) {
  const crm = useCrm();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("uebersicht");
  const [modal, setModal] = useState<"edit" | "kontakt" | "aktivitaet" | null>(null);
  const [label, setLabel] = useState("");
  const u = crm.unternehmenById(id);

  if (!u) {
    return (
      <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
        <p className="font-serif text-[16px] font-semibold text-navy-900">Unternehmen nicht gefunden.</p>
        <p className="mt-1 text-[12px] text-muted">Neu angelegte Testdatensätze gehen beim Neuladen der Seite verloren.</p>
        <Link href="/kunden/unternehmen" className="link-more mt-4">Zur Unternehmensübersicht</Link>
      </div>
    );
  }

  const kontakte = crm.ansprechpartnerVon(u.id).map((p) => ({ p, k: p.kontakte.find((k) => k.unternehmenId === u.id)! }));
  const verantwortlich = [...kontakte].sort((a, b) => Number(!!b.k.leitung) - Number(!!a.k.leitung) || Number(!!b.k.haupt) - Number(!!a.k.haupt));
  const akt = crm.aktivitaetenVonUnternehmen(u);
  const letzte = crm.letzteAktivitaetUnternehmen(u);
  const letzteAkt = akt.filter((a) => a.datum === letzte).sort((a, b) => (b.von ?? "").localeCompare(a.von ?? ""))[0];
  const speichere = (patch: Partial<Unternehmen>, msg: string) => {
    crm.speichereUnternehmen({ ...u, ...patch });
    toast(`${msg} (Testmodus – nicht dauerhaft gespeichert)`);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "uebersicht", label: "Übersicht" },
    { id: "ansprechpartner", label: `Ansprechpartner (${kontakte.length})` },
    { id: "projekte", label: "Projekte" },
    { id: "aktivitaeten", label: "Aktivitäten" },
    { id: "dateien", label: "Dateien" },
    { id: "notizen", label: "Notizen" },
    { id: "finanzen", label: "Finanzen" },
    { id: "einstellungen", label: "Einstellungen" },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <nav aria-label="Brotkrumen" className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#596b83]">
        <span>Kunden</span><ChevronRight className="h-3 w-3" />
        <Link href="/kunden/unternehmen" className="focus-ring rounded hover:text-navy-900">Unternehmen</Link><ChevronRight className="h-3 w-3" />
        <span aria-current="page">{u.name}</span>
        <span className="rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold tracking-[0.12em] text-warn">Testdaten</span>
      </nav>

      {/* Kopf */}
      <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 gap-4">
          <Avatar name={u.name} bild={u.bild} size={96} rund={false} />
          <div className="min-w-0">
            <h1 className="font-serif text-[28px] font-bold leading-tight text-navy-950">{u.name}</h1>
            <div className="mt-2 flex flex-wrap gap-[6px]">
              {u.arten.map((a) => <Badge key={a} tone="blue" className="px-3 py-[4px]">{a}</Badge>)}
              <button type="button" onClick={() => setModal("edit")} aria-label="Rolle hinzufügen" className="focus-ring rounded-[4px] border border-line px-2 text-navy-900 hover:bg-line-soft"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-navy-900">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{u.ort}{u.land !== "Deutschland" ? ` (${u.land})` : ""}</span>
              {u.website && <a href={u.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline"><Globe className="h-4 w-4" />{u.website.replace(/^https?:\/\//, "")}</a>}
              {u.linkedin && <a href={u.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline"><Link2 className="h-4 w-4" />LinkedIn öffnen</a>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-[10px] xl:w-[640px]">
          <StatCard label="Status">
            <Menu
              label="Status ändern"
              align="left"
              items={KONTAKT_STATUS.filter((s) => s !== u.status).map((s) => ({ label: s, onClick: () => speichere({ status: s }, `Status „${s}“ gesetzt`) }))}
              trigger={<span className="inline-flex items-center gap-1"><StatusBadge status={u.status} /><ChevronDown className="h-3.5 w-3.5 text-navy-900" /></span>}
            />
          </StatCard>
          <StatCard label="Betreuer"><div className="flex items-center gap-2"><Avatar name={crm.benutzerName(u.betreuerId)} size={26} />{crm.benutzerName(u.betreuerId)}</div></StatCard>
          <StatCard label="Letzte Aktivität"><div className="font-serif text-[16px] font-bold">{datumDe(letzte)}</div><div className="truncate text-[11px] text-muted">{letzteAkt?.titel ?? "aus Altdaten"}</div></StatCard>
          <StatCard label="Erstellt am"><div className="font-serif text-[16px] font-bold">{datumDe(u.erstelltAm)}</div></StatCard>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setModal("edit")}>Bearbeiten</Button>
          <Menu
            label="Weitere Aktionen"
            items={[
              { label: "Neue Aktivität", onClick: () => setModal("aktivitaet") },
              { label: "Ansprechpartner hinzufügen", onClick: () => setModal("kontakt") },
              { label: "Zur Übersicht", onClick: () => router.push("/kunden/unternehmen") },
            ]}
            trigger={<span className="flex h-[36px] w-[40px] items-center justify-center rounded-[6px] border border-line bg-white text-navy-900 shadow-card"><Ellipsis className="h-4 w-4" /></span>}
          />
        </div>
      </div>

      <div className="mt-5"><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>

      <div className="mt-4">
        {tab === "uebersicht" && (
          <div className="grid gap-[12px] xl:grid-cols-2 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_280px]">
            <Panel titel="Unternehmensdetails">
              <div className="grid gap-5 md:grid-cols-2">
                <InfoList rows={[
                  ["Unternehmensname", u.name], ["Unternehmensart", u.arten.join(", ")], ["Rechtsform", u.rechtsform], ["USt-IdNr.", u.ustId], ["Handelsregisternr.", u.handelsregister],
                  ["Website", u.website && <a href={u.website} target="_blank" rel="noopener noreferrer" className="text-royal-600 hover:underline">{u.website}</a>],
                  ["LinkedIn", u.linkedin && <a href={u.linkedin} target="_blank" rel="noopener noreferrer" className="break-all text-royal-600 hover:underline">{u.linkedin}</a>],
                  ["Telefon", u.telefon], ["E-Mail", u.email && <a href={`mailto:${u.email}`} className="text-royal-600 hover:underline">{u.email}</a>], ["Quelle", u.quelle],
                ]} />
                <div>
                  <InfoList rows={[["Adresse", u.strasse], ["PLZ / Ort", `${u.plz} ${u.ort}`.trim()], ["Land", u.land]]} />
                  <h3 className="mt-4 text-[12px] font-semibold text-navy-950">Kurzbeschreibung</h3>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{u.beschreibung || "Noch keine Beschreibung."}</p>
                </div>
              </div>
            </Panel>
            <div className="flex flex-col gap-[12px]">
              <Panel titel="Verantwortliche Personen" aktion={<Button size="sm" onClick={() => setModal("kontakt")}><Plus className="h-3.5 w-3.5" />Hinzufügen</Button>}>
                <ul className="divide-y divide-line-soft">
                  {verantwortlich.slice(0, 4).map(({ p, k }) => (
                    <li key={p.id} className="flex items-start gap-3 py-2">
                      <Avatar name={personName(p)} size={36} />
                      <div className="min-w-0 flex-1">
                        <Link href={personHref("kontakt", p.id)} className="font-semibold text-[12px] text-navy-950 hover:underline">{personName(p)}</Link>
                        <div className="text-[11px] text-muted">{k.position}{k.haupt ? " (Erster Ansprechpartner)" : ""}</div>
                        <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-navy-900">
                          {(p.telefonGeschaeftlich || p.telefonMobil) && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.telefonGeschaeftlich || p.telefonMobil}</span>}
                          {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" />{p.email}</a>}
                        </div>
                      </div>
                    </li>
                  ))}
                  {!verantwortlich.length && <li className="py-3 text-[12px] text-muted">Noch keine Ansprechpartner verknüpft.</li>}
                </ul>
              </Panel>
              <Panel titel="Unternehmensrollen & Kategorien">
                <div className="flex flex-wrap gap-[6px]">{u.arten.map((a) => <Badge key={a} tone="blue" className="px-3 py-1">{a}</Badge>)}</div>
                <h3 className="mt-4 font-serif text-[14px] font-bold text-navy-950">Zugeordnete Labels</h3>
                <div className="mt-2 flex flex-wrap items-center gap-[6px]">
                  {u.labels.map((l) => (
                    <button key={l} type="button" onClick={() => speichere({ labels: u.labels.filter((x) => x !== l) }, `Label „${l}“ entfernt`)} title="Label entfernen" className="focus-ring rounded-[4px] bg-[#fdeee2] px-3 py-1 text-[11px] font-medium text-[#c4621a] hover:line-through">{l}</button>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); const l = label.trim(); if (l && !u.labels.includes(l)) speichere({ labels: [...u.labels, l] }, `Label „${l}“ hinzugefügt`); setLabel(""); }} className="flex items-center gap-1">
                    <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label …" aria-label="Neues Label" className="focus-ring h-[26px] w-[100px] rounded-[4px] border border-line px-2 text-[11px]" />
                    <button type="submit" aria-label="Label hinzufügen" className="focus-ring rounded-[4px] border border-line p-1 text-navy-900 hover:bg-line-soft"><Plus className="h-3.5 w-3.5" /></button>
                  </form>
                </div>
              </Panel>
            </div>
            <div className="flex flex-col gap-[12px] xl:col-span-2 2xl:col-span-1">
              <TermineCard titel="Nächste Aktivitäten" termine={naechste(akt, crm.heute, 4)} />
              <NotizenCard notizen={notizen(akt, 3)} />
            </div>
          </div>
        )}
        {tab === "ansprechpartner" && (
          <div className="space-y-3">
            <div className="flex justify-end"><Button variant="primary" onClick={() => setModal("kontakt")}><Plus className="h-4 w-4" />Ansprechpartner hinzufügen</Button></div>
            <DataTable
              rows={kontakte.map(({ p, k }) => ({ ...p, k }))}
              onRowClick={(r) => router.push(personHref("kontakt", r.id))}
              columns={[
                { key: "name", header: "Name", sort: (r) => r.nachname, cell: (r) => <div className="flex items-center gap-2"><Avatar name={personName(r)} size={28} /><span className="font-semibold text-navy-950">{personName(r)}</span></div> },
                { key: "pos", header: "Position", cell: (r) => r.k.position },
                { key: "rolle", header: "Rolle", cell: (r) => <Badge tone={r.k.rolle === "Entscheider" ? "orange" : "blue"}>{r.k.rolle}</Badge> },
                { key: "mail", header: "E-Mail", cell: (r) => r.email },
                { key: "tel", header: "Telefon", cell: (r) => r.telefonGeschaeftlich || r.telefonMobil },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]}
            />
          </div>
        )}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={akt.filter((a) => a.typ !== "Notiz")} bezug={[{ art: "unternehmen", id: u.id }]} />}
        {tab === "notizen" && <AktivitaetenPanel nurNotizen aktivitaeten={akt.filter((a) => a.typ === "Notiz")} bezug={[{ art: "unternehmen", id: u.id }]} />}
        {tab === "projekte" && <NichtImplementiert was="Die Verknüpfung mit Investment-, Property- und Projects-Datensätzen (Phasen B–D)" />}
        {tab === "dateien" && <NichtImplementiert was="Die Dateiablage (nach Datenbank- und Speicheranbindung)" />}
        {tab === "finanzen" && <NichtImplementiert was="Die Finanzübersicht je Unternehmen (Phase F)" />}
        {tab === "einstellungen" && <NichtImplementiert was="Die Datensatz-Einstellungen (Archivieren, Zusammenführen, Rechte)" />}
      </div>

      {modal === "edit" && <UnternehmenModal initial={u} onClose={() => setModal(null)} />}
      {modal === "kontakt" && <PersonModal rolle="kontakt" unternehmenId={u.id} onClose={() => setModal(null)} />}
      {modal === "aktivitaet" && <AktivitaetModal bezug={[{ art: "unternehmen", id: u.id }]} onClose={() => setModal(null)} />}
    </div>
  );
}
