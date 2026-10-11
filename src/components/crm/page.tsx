"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Ellipsis, LayoutGrid, List, MapPin, Phone, Plus, SlidersHorizontal, UsersRound, Video, type LucideIcon } from "lucide-react";
import { datumDe, wochentagKurz } from "@/lib/crm/logic";
import type { Aktivitaet } from "@/lib/crm/types";
import { useCrm } from "@/lib/crm/store";
import { Avatar, Button, Menu, type MenuItem } from "@/components/ui/controls";
import { MoreLink } from "@/components/dashboard/MoreLink";

// ---------- Kopf ----------

export function PageHeader({
  crumbs,
  titel,
  untertitel,
  primary,
  primaryMenu,
  moreMenu,
}: {
  crumbs: { label: string; href?: string }[];
  titel: string;
  untertitel: string;
  primary?: { label: string; onClick: () => void };
  primaryMenu?: MenuItem[];
  moreMenu?: MenuItem[];
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <nav aria-label="Brotkrumen" className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#596b83]">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {c.href ? <Link href={c.href} className="focus-ring rounded hover:text-navy-900">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
          <span className="rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold tracking-[0.12em] text-warn" title="Testversion – fiktive Daten, Änderungen nur in diesem Browser zwischengespeichert (keine Datenbank)">Testdaten</span>
        </nav>
        <h1 className="mt-[6px] truncate font-serif text-[31px] font-bold leading-[1.1] tracking-[-0.015em] text-navy-950">{titel}</h1>
        <p className="mt-[4px] font-serif text-[15.5px] text-muted-soft">{untertitel}</p>
      </div>
      <div className="flex shrink-0 items-center gap-[10px] lg:pt-[8px]">
        {primary && (
          <div className="flex overflow-hidden rounded-[6px] shadow-card">
            <Button variant="primary" onClick={primary.onClick} className="rounded-none">
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              {primary.label}
            </Button>
            {primaryMenu && (
              <Menu label="Weitere Anlage-Optionen" items={primaryMenu} trigger={<span className="flex h-[36px] items-center border-l border-white/20 bg-navy-900 px-2 text-white hover:bg-navy-800"><ChevronDown className="h-4 w-4" /></span>} />
            )}
          </div>
        )}
        {moreMenu && (
          <Menu label="Weitere Aktionen" items={moreMenu} trigger={<span className="flex h-[36px] w-[40px] items-center justify-center rounded-[6px] border border-line bg-white text-navy-900 shadow-card hover:bg-line-soft"><Ellipsis className="h-4 w-4" strokeWidth={2.4} /></span>} />
        )}
      </div>
    </div>
  );
}

// ---------- Kennzahlen ----------

export type Kpi = { label: string; wert: number | string; sub: string; icon: LucideIcon; onClick?: () => void; aktiv?: boolean };

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <section aria-label="Kennzahlen" className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((k) => {
        const Icon = k.icon;
        const Inner = (
          <>
            <Icon className="mt-[2px] h-[30px] w-[30px] shrink-0 text-navy-900" strokeWidth={1.5} />
            <div className="min-w-0 flex-1 pr-2 text-left">
              <div className="truncate text-[11.5px] text-ink" title={k.label}>{k.label}</div>
              <div className={`mt-[4px] font-serif font-bold leading-none text-navy-950 ${typeof k.wert === "string" && k.wert.length > 7 ? "whitespace-nowrap text-[clamp(17px,1.45vw,23px)]" : "text-[27px]"}`}>{k.wert}</div>
              <div className="mt-[8px] truncate text-[11.5px] text-muted">{k.sub}</div>
            </div>
            {k.onClick && <ChevronRight className="absolute bottom-[14px] right-[10px] h-4 w-4 text-navy-900" />}
          </>
        );
        const cls = `card relative flex items-start gap-[10px] px-[12px] pb-[12px] pt-[16px] ${k.aktiv ? "ring-2 ring-navy-900/70" : ""}`;
        return k.onClick ? (
          <button key={k.label} type="button" onClick={k.onClick} aria-pressed={k.aktiv} className={`${cls} focus-ring transition-shadow hover:shadow-md`}>
            {Inner}
          </button>
        ) : (
          <div key={k.label} className={cls}>{Inner}</div>
        );
      })}
    </section>
  );
}

// ---------- Filterleiste ----------

export function FilterBar({ children, ansicht, onAnsicht, onReset, resetAktiv }: { children: ReactNode; ansicht?: "liste" | "kacheln"; onAnsicht?: (a: "liste" | "kacheln") => void; onReset?: () => void; resetAktiv?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      {children}
      <div className="ml-auto flex shrink-0 items-center gap-[10px]">
        {onReset && (
          <Button size="sm" onClick={onReset} disabled={!resetAktiv} className="h-[34px] px-2.5">
            Filter zurücksetzen
          </Button>
        )}
        {onAnsicht && (
          <div className="flex overflow-hidden rounded-[6px] border border-line bg-white shadow-card" role="group" aria-label="Ansicht">
            {(["liste", "kacheln"] as const).map((a) => {
              const Icon = a === "liste" ? List : LayoutGrid;
              return (
                <button key={a} type="button" aria-pressed={ansicht === a} onClick={() => onAnsicht(a)} aria-label={a === "liste" ? "Listenansicht" : "Kachelansicht"} className={`focus-ring flex h-[32px] w-[40px] items-center justify-center ${ansicht === a ? "bg-royal-100 text-navy-900" : "text-navy-800 hover:bg-line-soft"}`}>
                  <Icon className="h-[16px] w-[16px]" strokeWidth={1.9} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Layout mit rechter Seitenleiste ----------

export function ListLayout({ header, main, aside }: { header: ReactNode; main: ReactNode; aside: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="grid gap-[14px] 2xl:grid-cols-[minmax(0,1fr)_252px]">
        <div className="min-w-0 2xl:col-start-1 2xl:row-start-1">{header}</div>
        <div className="flex min-w-0 flex-col gap-[14px] 2xl:col-start-1 2xl:row-start-2">{main}</div>
        <aside className="grid content-start gap-[12px] md:grid-cols-2 2xl:col-start-2 2xl:row-start-2 2xl:grid-cols-1" aria-label="Schnellfilter und Übersicht">
          {aside}
        </aside>
      </div>
    </div>
  );
}

export function SideCard({ titel, children, aktion }: { titel: string; children: ReactNode; aktion?: ReactNode }) {
  return (
    <section className="card px-[12px] pb-[10px] pt-[12px]">
      <div className="mb-[8px] flex items-center justify-between gap-2">
        <h2 className="font-serif text-[15px] font-bold text-navy-950">{titel}</h2>
        {aktion}
      </div>
      {children}
    </section>
  );
}

export type QuickFilter = { id: string; label: string; anzahl: number; icon: LucideIcon };

export function QuickFilterCard({ filter, aktiv, onWahl, children }: { filter: QuickFilter[]; aktiv: string; onWahl: (id: string) => void; children?: ReactNode }) {
  return (
    <SideCard titel="Schnellfilter" aktion={<SlidersHorizontal className="h-4 w-4 text-navy-900" />}>
      <ul className="space-y-[2px]">
        {filter.map((f) => {
          const Icon = f.icon;
          const on = f.id === aktiv;
          return (
            <li key={f.id}>
              <button type="button" onClick={() => onWahl(f.id)} aria-pressed={on} className={`focus-ring flex w-full items-center gap-[10px] rounded-[5px] px-[8px] py-[5px] text-left text-[11.5px] ${on ? "bg-royal-100 font-semibold text-navy-950" : "text-ink-soft hover:bg-line-soft"}`}>
                <Icon className="h-[14px] w-[14px] shrink-0 text-navy-900" strokeWidth={1.8} />
                <span className="flex-1 truncate">{f.label}</span>
                <span className="text-muted">{f.anzahl}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {children && <div className="mt-[8px] border-t border-line-soft pt-[4px]">{children}</div>}
    </SideCard>
  );
}

/** Aufklappbare Filtergruppe mit Kontrollkästchen und Anzahl */
export function CheckGroup({ titel, werte, gewaehlt, onChange, offen: start = false }: { titel: string; werte: [string, number][]; gewaehlt: string[]; onChange: (v: string[]) => void; offen?: boolean }) {
  const [offen, setOffen] = useState(start);
  return (
    <div className="border-b border-line-soft last:border-0">
      <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen} className="focus-ring flex w-full items-center justify-between rounded py-[8px] text-[12.5px] font-semibold text-navy-950">
        {titel}
        {gewaehlt.length > 0 && <span className="ml-auto mr-2 rounded-full bg-navy-900 px-1.5 text-[10px] text-white">{gewaehlt.length}</span>}
        {offen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {offen && (
        <ul className="space-y-[3px] pb-[8px]">
          {werte.map(([w, n]) => (
            <li key={w}>
              <label className="flex cursor-pointer items-center gap-[10px] rounded px-[4px] py-[3px] text-[11.5px] text-ink-soft hover:bg-line-soft">
                <input type="checkbox" checked={gewaehlt.includes(w)} onChange={(e) => onChange(e.target.checked ? [...gewaehlt, w] : gewaehlt.filter((x) => x !== w))} className="h-[13px] w-[13px] accent-navy-900" />
                <span className="flex-1 truncate">{w}</span>
                <span className="text-muted">{n}</span>
              </label>
            </li>
          ))}
          {!werte.length && <li className="text-[11px] text-muted">Keine Werte</li>}
        </ul>
      )}
    </div>
  );
}

// ---------- Termine & Notizen ----------

function TerminIcon({ a }: { a: Aktivitaet }) {
  const p = { className: "h-[15px] w-[15px] shrink-0 text-royal-500", strokeWidth: 1.8 };
  if (a.terminArt === "vor-ort") return <MapPin {...p} />;
  if (a.terminArt === "telefon" || a.typ === "Telefon") return <Phone {...p} />;
  if (a.terminArt === "persoenlich") return <UsersRound {...p} />;
  return <Video {...p} />;
}

export function bezugLabel(a: Aktivitaet, crm: ReturnType<typeof useCrm>) {
  const b = a.bezug[0];
  if (!b) return a.kontext ?? "—";
  if (b.art === "unternehmen") return crm.unternehmenById(b.id)?.name ?? "—";
  if (b.art === "vorgang") return crm.index.get(b.id)?.titel ?? b.id;
  const p = crm.personById(b.id);
  return p ? `${p.vorname} ${p.nachname}` : "—";
}

export function TermineCard({ termine, titel = "Nächste Termine", href = "/aktivitaeten" }: { termine: Aktivitaet[]; titel?: string; href?: string }) {
  const crm = useCrm();
  return (
    <SideCard titel={titel} aktion={<MoreLink href={href} />}>
      <ul className="divide-y divide-line-soft">
        {termine.map((t) => {
          return (
            <li key={t.id} className="flex items-center gap-[10px] py-[6px]">
              <div className="flex h-[38px] w-[32px] shrink-0 flex-col items-center justify-center rounded-[5px] bg-line-soft">
                <span className="font-serif text-[14px] font-bold leading-none text-navy-950">{t.datum.slice(8, 10)}</span>
                <span className="mt-[2px] text-[9.5px] leading-none text-ink-soft">{wochentagKurz(t.datum)}</span>
              </div>
              <span className="w-[34px] shrink-0 text-[10.5px] text-muted">{t.von ?? ""}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-serif text-[11.5px] font-semibold text-navy-950">{t.titel}</div>
                <div className="truncate text-[10.5px] text-muted">{t.beschreibung || bezugLabel(t, crm)}</div>
              </div>
              <TerminIcon a={t} />
            </li>
          );
        })}
        {!termine.length && <li className="py-3 text-[11.5px] text-muted">Keine anstehenden Termine.</li>}
      </ul>
    </SideCard>
  );
}

export function NotizenCard({ notizen, titel = "Letzte Notizen", href = "/aktivitaeten?typ=Notiz" }: { notizen: Aktivitaet[]; titel?: string; href?: string }) {
  const crm = useCrm();
  return (
    <SideCard titel={titel} aktion={<MoreLink href={href} />}>
      <ul className="space-y-[8px]">
        {notizen.map((n) => (
          <li key={n.id} className="flex items-start gap-[10px]">
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] text-muted">{datumDe(n.datum)}{n.von ? `, ${n.von}` : ""} · {bezugLabel(n, crm)}</div>
              <div className="line-clamp-2 text-[11.5px] text-ink">{n.beschreibung || n.titel}</div>
            </div>
            <Avatar name={crm.benutzerName(n.verantwortlichId)} size={24} />
          </li>
        ))}
        {!notizen.length && <li className="text-[11.5px] text-muted">Noch keine Notizen.</li>}
      </ul>
    </SideCard>
  );
}

export function QuickActions({ aktionen }: { aktionen: { label: string; icon: LucideIcon; onClick: () => void }[] }) {
  return (
    <SideCard titel="Schnellaktionen">
      <div className="grid grid-cols-2 gap-[8px]">
        {aktionen.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} type="button" onClick={a.onClick} className="focus-ring flex flex-col items-center gap-[6px] rounded-[8px] border border-line px-2 py-[12px] text-center text-[11px] text-navy-900 hover:bg-line-soft">
              <Icon className="h-[18px] w-[18px] text-royal-500" strokeWidth={1.7} />
              {a.label}
            </button>
          );
        })}
      </div>
    </SideCard>
  );
}

// ---------- Detailseiten ----------

export function Panel({ titel, aktion, children, className = "" }: { titel: string; aktion?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card px-[14px] pb-[12px] pt-[12px] ${className}`}>
      <div className="mb-[8px] flex items-center justify-between gap-2">
        <h2 className="font-serif text-[15px] font-bold text-navy-950">{titel}</h2>
        {aktion}
      </div>
      {children}
    </section>
  );
}

export function InfoList({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[112px_minmax(0,1fr)] gap-x-3 gap-y-[7px] text-[11.5px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="min-w-0 break-words text-ink">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="card min-w-[140px] flex-1 whitespace-nowrap px-[14px] py-[10px]">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-[6px] text-[12.5px] text-navy-950">{children}</div>
    </div>
  );
}

export function NichtImplementiert({ was }: { was: string }) {
  return (
    <div className="card px-6 py-10 text-center">
      <p className="font-serif text-[15px] font-semibold text-navy-900">{was} folgt in einer späteren Phase.</p>
      <p className="mt-1 text-[12px] text-muted">Dieser Bereich ist in der Testversion noch nicht umgesetzt.</p>
    </div>
  );
}
