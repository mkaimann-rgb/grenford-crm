"use client";

import { useState } from "react";
import { CalendarDays, CheckSquare, FileText, Mail, MapPin, Phone, Video } from "lucide-react";
import { aktivitaetStatus, datumDe } from "@/lib/crm/logic";
import { useCrm } from "@/lib/crm/store";
import type { Aktivitaet, Bezug } from "@/lib/crm/types";
import { Avatar, Button, Checkbox, Menu, StatusBadge } from "@/components/ui/controls";
import { Ellipsis, Plus } from "lucide-react";
import { AktivitaetModal } from "./modals";
import { useToast } from "@/components/ui/toast";
import { bezugLabel } from "./page";

export function TypIcon({ a, className }: { a: Aktivitaet; className: string }) {
  const p = { className, strokeWidth: 1.8, "aria-label": a.typ };
  if (a.typ === "E-Mail") return <Mail {...p} />;
  if (a.typ === "Telefon") return <Phone {...p} />;
  if (a.typ === "Notiz") return <FileText {...p} />;
  if (a.typ === "Aufgabe") return <CheckSquare {...p} />;
  if (a.terminArt === "vor-ort") return <MapPin {...p} />;
  if (a.terminArt === "video") return <Video {...p} />;
  return <CalendarDays {...p} />;
}

/** Zeile einer Aktivität mit „Erledigt“-Häkchen, Status und Menü */
export function AktivitaetZeile({ a, onEdit, zeigeDatum = true }: { a: Aktivitaet; onEdit: (a: Aktivitaet) => void; zeigeDatum?: boolean }) {
  const crm = useCrm();
  const toast = useToast();
  const status = aktivitaetStatus(a, crm.heute);
  const ueberfaellig = status === "Überfällig";
  return (
    <div className={`grid grid-cols-[24px_92px_22px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-3 py-[8px] md:grid-cols-[24px_92px_22px_minmax(0,1.6fr)_minmax(0,1fr)_150px_96px_32px] ${ueberfaellig ? "bg-neg-bg/50" : ""}`}>
      {a.typ !== "Notiz" ? <Checkbox checked={a.erledigt} onChange={(v) => { crm.setzeErledigt(a.id, v); toast(v ? `„${a.titel}“ erledigt – ausgeblendet (über „Erledigte anzeigen“ sichtbar)` : `„${a.titel}“ wieder offen`); }} label={`${a.titel} als erledigt markieren`} /> : <span />}
      <span className={`text-[11.5px] ${ueberfaellig ? "font-semibold text-neg" : "text-ink-soft"}`}>
        {zeigeDatum || ueberfaellig ? datumDe(a.datum) : ""}{a.von ? `${zeigeDatum || ueberfaellig ? " " : ""}${a.von}${a.bis ? `–${a.bis}` : ""}` : ""}
      </span>
      <TypIcon a={a} className={`h-[16px] w-[16px] ${ueberfaellig ? "text-neg" : "text-royal-500"}`} />
      <button type="button" onClick={() => onEdit(a)} className="focus-ring min-w-0 rounded text-left">
        <div className={`truncate text-[12px] font-semibold ${a.erledigt ? "text-muted line-through" : "text-navy-950"}`}>{a.titel}</div>
        <div className="truncate text-[11px] text-muted">{a.beschreibung}</div>
      </button>
      <div className="col-span-3 col-start-2 min-w-0 md:col-span-1 md:col-start-auto">
        <div className="truncate text-[11.5px] text-ink">{bezugLabel(a, crm)}</div>
        {a.kontext && a.bezug.length > 0 && <div className="truncate text-[10.5px] text-muted">{a.kontext}</div>}
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <Avatar name={crm.benutzerName(a.verantwortlichId)} size={24} />
        <span className="truncate text-[11.5px] text-ink">{crm.benutzerName(a.verantwortlichId)}</span>
      </div>
      <div className="hidden md:block"><StatusBadge status={status} /></div>
      <div className="hidden md:block">
        <Menu
          label="Aktionen"
          items={[
            { label: "Bearbeiten", onClick: () => onEdit(a) },
            ...(a.typ !== "Notiz" ? [{ label: a.erledigt ? "Als offen markieren" : "Als erledigt markieren", onClick: () => crm.setzeErledigt(a.id, !a.erledigt) }] : []),
          ]}
          trigger={<span className="flex h-7 w-7 items-center justify-center rounded text-navy-900 hover:bg-line-soft"><Ellipsis className="h-4 w-4" strokeWidth={2.4} /></span>}
        />
      </div>
    </div>
  );
}

/** Kompakte Aktivitätenliste für Detailseiten */
export function AktivitaetenPanel({ aktivitaeten, bezug, nurNotizen = false }: { aktivitaeten: Aktivitaet[]; bezug: Bezug[]; nurNotizen?: boolean }) {
  const [modal, setModal] = useState<{ a?: Aktivitaet } | null>(null);
  const sortiert = [...aktivitaeten].sort((x, y) => (y.datum + (y.von ?? "")).localeCompare(x.datum + (x.von ?? "")));
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-serif text-[15px] font-bold text-navy-950">{nurNotizen ? "Notizen" : "Aktivitäten"} ({sortiert.length})</h2>
        <Button size="sm" variant="primary" onClick={() => setModal({})}>
          <Plus className="h-3.5 w-3.5" /> {nurNotizen ? "Notiz hinzufügen" : "Neue Aktivität"}
        </Button>
      </div>
      <div className="divide-y divide-line-soft">
        {sortiert.map((a) => <AktivitaetZeile key={a.id} a={a} onEdit={(x) => setModal({ a: x })} />)}
        {!sortiert.length && <p className="px-4 py-8 text-center text-[12px] text-muted">Noch keine Einträge.</p>}
      </div>
      {modal && <AktivitaetModal initial={modal.a} typ={nurNotizen ? "Notiz" : "Termin"} bezug={bezug} onClose={() => setModal(null)} />}
    </div>
  );
}
