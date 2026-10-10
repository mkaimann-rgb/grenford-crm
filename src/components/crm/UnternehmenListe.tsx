"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChartColumn, CircleDot, CirclePause, CircleSlash, FileDown, FileUp, House, Plus, Target, UserCheck, Users, Wrench } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, dublettenPaare, naechste, notizen, personName, regionVon, suchtreffer, zaehle, addDays } from "@/lib/crm/logic";
import type { Unternehmen } from "@/lib/crm/types";
import { downloadCsv } from "@/lib/csv";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Avatar, FilterSelect, SearchInput, StatusBadge } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { CheckGroup, FilterBar, KpiRow, ListLayout, NotizenCard, PageHeader, QuickActions, QuickFilterCard, TermineCard } from "./page";
import { PersonModal, UnternehmenModal } from "./modals";

type Filter = { suche: string; typ: string[]; status: string[]; region: string[]; betreuer: string[]; aktivitaet: string[] };
const LEER: Filter = { suche: "", typ: [], status: [], region: [], betreuer: [], aktivitaet: [] };

function aktivitaetBucket(datum: string, heute: string) {
  if (datum >= addDays(heute, -30)) return "Letzte 30 Tage";
  if (datum >= addDays(heute, -90)) return "31–90 Tage";
  return "Älter als 90 Tage";
}

export function UnternehmenListe() {
  const crm = useCrm();
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<Filter>(LEER);
  const [ansicht, setAnsicht] = useState<"liste" | "kacheln">("liste");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ art: "neu" | "edit" | "kontakt" | "dubletten"; u?: Unternehmen } | null>(null);
  const set = (p: Partial<Filter>) => setF((x) => ({ ...x, ...p }));

  const zeilen = useMemo(
    () =>
      crm.unternehmen.map((u) => {
        const kontakte = crm.ansprechpartnerVon(u.id);
        const haupt = kontakte.find((p) => p.kontakte.some((k) => k.unternehmenId === u.id && k.haupt)) ?? kontakte.find((p) => p.kontakte.some((k) => k.unternehmenId === u.id && k.leitung)) ?? kontakte[0];
        const letzte = crm.letzteAktivitaetUnternehmen(u);
        return { ...u, haupt, hauptPosition: haupt?.kontakte.find((k) => k.unternehmenId === u.id)?.position ?? "", letzte, region: regionVon(u.ort, u.land), anzahlKontakte: kontakte.length };
      }),
    [crm],
  );
  type Zeile = (typeof zeilen)[number];

  const gefiltert = zeilen.filter(
    (z) =>
      suchtreffer(f.suche, z.name, z.ort, z.haupt && personName(z.haupt), z.arten.join(" "), z.ustId) &&
      (!f.typ.length || z.arten.some((a) => f.typ.includes(a))) &&
      (!f.status.length || f.status.includes(z.status)) &&
      (!f.region.length || f.region.includes(z.region)) &&
      (!f.betreuer.length || f.betreuer.includes(crm.benutzerName(z.betreuerId))) &&
      (!f.aktivitaet.length || f.aktivitaet.includes(aktivitaetBucket(z.letzte, crm.heute))),
  );

  const typen = zaehle(zeilen, (z) => z.arten);
  const status = zaehle(zeilen, (z) => z.status);
  const one = (a: string[]) => (a.length === 1 ? a[0] : "");
  const aktiveKontakte = crm.personen.filter((p) => p.kontakte.length && (p.status === "Aktiv" || p.status === "In Kontakt")).length;
  const firmenIds = new Set(crm.unternehmen.map((u) => u.id));
  const termine = naechste(crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "unternehmen" && firmenIds.has(b.id))), crm.heute, 4);
  const notes = notizen(crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "unternehmen")), 3);

  const exportieren = () => {
    const rows = selected.size ? gefiltert.filter((z) => selected.has(z.id)) : gefiltert;
    downloadCsv("unternehmen.csv", ["Unternehmen", "Unternehmensart", "Weitere Rollen", "Rechtsform", "Ort", "Land", "Ansprechpartner", "Position", "Status", "Letzte Aktivität", "USt-IdNr.", "Website"],
      rows.map((z) => [z.name, z.arten[0], z.arten.slice(1).join(", "), z.rechtsform, z.ort, z.land, z.haupt ? personName(z.haupt) : "", z.hauptPosition, z.status, datumDe(z.letzte), z.ustId, z.website]));
    toast(`${rows.length} Unternehmen als CSV exportiert (Testdaten).`);
  };

  const columns: Column<Zeile>[] = [
    {
      key: "name", header: "Unternehmen", sort: (z) => z.name,
      cell: (z) => (
        <div className="flex items-center gap-3">
          <Avatar name={z.name} bild={z.bild} size={36} rund={false} />
          <span className="font-serif text-[12.5px] font-semibold text-navy-950">{z.name}</span>
        </div>
      ),
    },
    { key: "typ", header: "Unternehmenstyp", sort: (z) => z.arten[0], cell: (z) => <span className="text-ink-soft">{z.arten[0]}</span> },
    { key: "ort", header: "Standort", sort: (z) => z.ort, cell: (z) => <span className="text-ink-soft">{z.ort}{z.land !== "Deutschland" ? ` (${z.land === "Schweiz" ? "CH" : z.land})` : ""}</span> },
    {
      key: "kontakt", header: "Ansprechpartner", sort: (z) => (z.haupt ? z.haupt.nachname : "~"),
      cell: (z) => z.haupt ? (<div><div className="text-ink">{personName(z.haupt)}</div><div className="text-[11px] text-muted">{z.hauptPosition}</div></div>) : <span className="text-muted">—</span>,
    },
    { key: "letzte", header: "Letzte Aktivität", sort: (z) => z.letzte, cell: (z) => <span className="text-ink-soft">{datumDe(z.letzte)}</span> },
    { key: "status", header: "Status", sort: (z) => z.status, cell: (z) => <StatusBadge status={z.status} /> },
  ];

  const quick = [
    { id: "", label: "Alle Unternehmen", anzahl: zeilen.length, icon: Building2 },
    { id: "Aktiv", label: "Aktive Unternehmen", anzahl: status.get("Aktiv") ?? 0, icon: CircleDot },
    { id: "In Kontakt", label: "In Kontakt", anzahl: status.get("In Kontakt") ?? 0, icon: UserCheck },
    { id: "Potenzial", label: "Potenzial", anzahl: status.get("Potenzial") ?? 0, icon: CirclePause },
    { id: "Inaktiv", label: "Inaktiv", anzahl: status.get("Inaktiv") ?? 0, icon: CircleSlash },
  ];

  return (
    <>
      <ListLayout
        header={
          <PageHeader
            crumbs={[{ label: "Kunden" }, { label: "Unternehmen" }]}
            titel="Unternehmen"
            untertitel="Alle Unternehmen, Investoren, Bestandshalter, Projektentwickler, Family Offices und weitere Geschäftskunden."
            primary={{ label: "Neues Unternehmen", onClick: () => setModal({ art: "neu" }) }}
            primaryMenu={[
              { label: "Neues Unternehmen", onClick: () => setModal({ art: "neu" }) },
              { label: "Neuer Ansprechpartner", onClick: () => setModal({ art: "kontakt" }) },
              { label: "Import (Excel)", hinweis: "noch nicht implementiert", onClick: () => toast("Der Import ist in dieser Testversion noch nicht implementiert.") },
            ]}
            moreMenu={[
              { label: "Export (CSV)", hinweis: selected.size ? `${selected.size} ausgewählte` : `${gefiltert.length} gefilterte`, onClick: exportieren },
              { label: "Dublettenprüfung", onClick: () => setModal({ art: "dubletten" }) },
            ]}
          />
        }
        main={
          <>
            <KpiRow
              kpis={[
                { label: "Gesamt", wert: zeilen.length, sub: "Unternehmen", icon: Building2, onClick: () => setF(LEER), aktiv: f === LEER },
                { label: "Aktive Kontakte", wert: aktiveKontakte, sub: "Ansprechpartner", icon: Users, onClick: () => router.push("/kunden/ansprechpartner") },
                { label: "Potenzielle Investoren", wert: typen.get("Investor") ?? 0, sub: "Unternehmen", icon: Target, onClick: () => set({ typ: ["Investor"] }), aktiv: one(f.typ) === "Investor" },
                { label: "Projektentwickler", wert: typen.get("Projektentwickler") ?? 0, sub: "Unternehmen", icon: ChartColumn, onClick: () => set({ typ: ["Projektentwickler"] }), aktiv: one(f.typ) === "Projektentwickler" },
                { label: "Bestandshalter", wert: typen.get("Bestandshalter") ?? 0, sub: "Unternehmen", icon: House, onClick: () => set({ typ: ["Bestandshalter"] }), aktiv: one(f.typ) === "Bestandshalter" },
              ]}
            />
            <FilterBar ansicht={ansicht} onAnsicht={setAnsicht} onReset={() => setF(LEER)} resetAktiv={JSON.stringify(f) !== JSON.stringify(LEER)}>
              <SearchInput value={f.suche} onChange={(v) => set({ suche: v })} placeholder="Unternehmen suchen …" className="w-full sm:w-[150px]" />
              <FilterSelect label="Unternehmenstyp" value={one(f.typ)} onChange={(v) => set({ typ: v ? [v] : [] })} options={[...typen.keys()].sort()} />
              <FilterSelect label="Status" value={one(f.status)} onChange={(v) => set({ status: v ? [v] : [] })} options={["Aktiv", "In Kontakt", "Potenzial", "Inaktiv"]} />
              <FilterSelect label="Region" value={one(f.region)} onChange={(v) => set({ region: v ? [v] : [] })} options={[...zaehle(zeilen, (z) => z.region).keys()].sort()} />
              <FilterSelect label="Betreuer" value={one(f.betreuer)} onChange={(v) => set({ betreuer: v ? [v] : [] })} options={crm.benutzer.map((b) => b.name)} />
              <FilterSelect label="Letzte Aktivität" value={one(f.aktivitaet)} onChange={(v) => set({ aktivitaet: v ? [v] : [] })} options={["Letzte 30 Tage", "31–90 Tage", "Älter als 90 Tage"]} />
            </FilterBar>
            <DataTable
              rows={gefiltert}
              columns={columns}
              defaultSort={{ key: "letzte", richtung: "desc" }}
              selected={selected}
              onSelected={setSelected}
              onRowClick={(z) => router.push(`/kunden/unternehmen/${z.id}`)}
              ansicht={ansicht}
              resetKey={JSON.stringify(f)}
              rowMenu={(z) => [
                { label: "Öffnen", onClick: () => router.push(`/kunden/unternehmen/${z.id}`) },
                { label: "Bearbeiten", onClick: () => setModal({ art: "edit", u: z }) },
                ...(["Aktiv", "In Kontakt", "Potenzial", "Inaktiv"] as const).filter((s) => s !== z.status).map((s) => ({ label: `Status: ${s}`, onClick: () => { crm.speichereUnternehmen({ ...crm.unternehmenById(z.id)!, status: s }); toast(`${z.name}: Status „${s}“ (Testmodus)`); } })),
              ]}
              card={(z) => (
                <div className="card flex h-full gap-3 p-3 hover:shadow-md">
                  <Avatar name={z.name} bild={z.bild} size={48} rund={false} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-[13px] font-semibold text-navy-950">{z.name}</div>
                    <div className="text-[11.5px] text-muted">{z.arten[0]} · {z.ort}</div>
                    <div className="mt-1 truncate text-[11.5px] text-ink">{z.haupt ? personName(z.haupt) : "—"}</div>
                    <div className="mt-2 flex items-center justify-between"><StatusBadge status={z.status} /><span className="text-[11px] text-muted">{datumDe(z.letzte)}</span></div>
                  </div>
                </div>
              )}
            />
          </>
        }
        aside={
          <>
            <QuickFilterCard filter={quick} aktiv={one(f.status)} onWahl={(id) => set({ status: id ? [id] : [] })}>
              <CheckGroup titel="Unternehmenstyp" offen werte={[...typen.entries()].sort((a, b) => b[1] - a[1])} gewaehlt={f.typ} onChange={(v) => set({ typ: v })} />
              <CheckGroup titel="Region" werte={[...zaehle(zeilen, (z) => z.region).entries()]} gewaehlt={f.region} onChange={(v) => set({ region: v })} />
              <CheckGroup titel="Betreuer" werte={[...zaehle(zeilen, (z) => crm.benutzerName(z.betreuerId)).entries()]} gewaehlt={f.betreuer} onChange={(v) => set({ betreuer: v })} />
              <CheckGroup titel="Status" werte={[...status.entries()]} gewaehlt={f.status} onChange={(v) => set({ status: v })} />
              <CheckGroup titel="Letzte Aktivität" werte={[...zaehle(zeilen, (z) => aktivitaetBucket(z.letzte, crm.heute)).entries()]} gewaehlt={f.aktivitaet} onChange={(v) => set({ aktivitaet: v })} />
            </QuickFilterCard>
            <QuickActions
              aktionen={[
                { label: "Neues Unternehmen", icon: Plus, onClick: () => setModal({ art: "neu" }) },
                { label: "Import (Excel)", icon: FileUp, onClick: () => toast("Der Import ist in dieser Testversion noch nicht implementiert.") },
                { label: "Export (CSV)", icon: FileDown, onClick: exportieren },
                { label: "Datenpflege", icon: Wrench, onClick: () => setModal({ art: "dubletten" }) },
              ]}
            />
            <TermineCard termine={termine} />
            <NotizenCard notizen={notes} />
          </>
        }
      />
      {(modal?.art === "neu" || modal?.art === "edit") && <UnternehmenModal initial={modal.u ? crm.unternehmenById(modal.u.id) : undefined} onClose={() => setModal(null)} />}
      {modal?.art === "kontakt" && <PersonModal rolle="kontakt" onClose={() => setModal(null)} />}
      {modal?.art === "dubletten" && <DublettenModal onClose={() => setModal(null)} />}
    </>
  );
}

function DublettenModal({ onClose }: { onClose: () => void }) {
  const crm = useCrm();
  const paare = dublettenPaare(crm.unternehmen, crm.personen);
  return (
    <Modal titel="Datenpflege – Dublettenprüfung" onClose={onClose} breit="max-w-[640px]">
      <p className="text-[12.5px] text-ink-soft">
        Prüft den Bestand auf mögliche Doppelanlagen (gleicher Firmenname ohne Rechtsform, gleiche USt-IdNr., gleiche E-Mail). Neue Datensätze werden bereits beim Anlegen geprüft.
      </p>
      <ul className="mt-4 divide-y divide-line-soft rounded-lg border border-line">
        {paare.map((p, i) => (
          <li key={i} className="flex items-center justify-between gap-3 px-4 py-2 text-[12px]">
            <span><b>{p.a}</b> ↔ <b>{p.b}</b></span>
            <span className="text-muted">{p.art} · {p.grund}</span>
          </li>
        ))}
        {!paare.length && <li className="px-4 py-6 text-center text-[12.5px] text-pos">Keine möglichen Dubletten gefunden. ({crm.unternehmen.length} Unternehmen, {crm.personen.length} Personen geprüft)</li>}
      </ul>
    </Modal>
  );
}
