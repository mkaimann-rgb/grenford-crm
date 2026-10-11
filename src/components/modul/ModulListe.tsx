"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { naechste, notizen, suchtreffer, zaehle } from "@/lib/crm/logic";
import { downloadCsv } from "@/lib/csv";
import type { Aktivitaet } from "@/lib/crm/types";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterSelect, MultiFilter, SearchInput, type MenuItem } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { CheckGroup, FilterBar, KpiRow, ListLayout, NotizenCard, PageHeader, QuickFilterCard, TermineCard } from "@/components/crm/page";

export type ListFilter<T> = { key: string; label: string; wert: (r: T) => string | string[]; inBar?: boolean; offen?: boolean };
export type ListQuick<T> = { id: string; label: string; icon: LucideIcon; test: (r: T) => boolean };
export type ListKpi<T> = { label: string; icon: LucideIcon; wert: (rows: T[]) => number | string; sub: string; quick?: string };

/**
 * Generische Listenseite aller Fachmodule – gleiches Muster wie die freigegebenen Kundenlisten:
 * Kopf, Kennzahlen (klickbar), Filterleiste, Tabelle/Kacheln, Schnellfilter, Termine, Notizen, CSV-Export,
 * Mehrfachauswahl mit Statusänderung.
 */
export function ModulListe<T extends { id: string }>({
  crumbs, titel, untertitel, neu, rows, columns, suche, suchePlatzhalter, filter, bereichFilter, quick, kpis, csv, href, onRow, card, defaultSort,
  rowMenu, statusAenderung, aktivitaeten, extraAside, kopfZusatz, moreMenu,
}: {
  crumbs: { label: string; href?: string }[];
  titel: string;
  untertitel: string;
  neu?: { label: string; onClick: () => void };
  rows: T[];
  columns: Column<T>[];
  suche: (r: T) => (string | undefined)[];
  suchePlatzhalter: string;
  filter: ListFilter<T>[];
  /** Mehrfachfilter Geschäftsbereich (Treffer in mindestens einem gewählten Bereich) */
  bereichFilter?: (r: T) => string[];
  quick: ListQuick<T>[];
  kpis: ListKpi<T>[];
  csv: { datei: string; kopf: string[]; zeile: (r: T) => (string | number)[] };
  href?: (r: T) => string;
  onRow?: (r: T) => void;
  card?: (r: T) => ReactNode;
  defaultSort?: { key: string; richtung: "asc" | "desc" };
  rowMenu?: (r: T) => MenuItem[];
  /** Statusänderung für ausgewählte Zeilen (Mehrfachauswahl) */
  statusAenderung?: { werte: readonly string[]; setze: (ids: string[], status: string) => void };
  /** Aktivitäten zu den Datensätzen für „Nächste Termine“ und „Letzte Notizen“ */
  aktivitaeten?: Aktivitaet[];
  extraAside?: ReactNode;
  kopfZusatz?: ReactNode;
  moreMenu?: MenuItem[];
}) {
  const crm = useCrm();
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [werte, setWerte] = useState<Record<string, string[]>>({});
  const [bereich, setBereich] = useState<string[]>([]);
  const [quickId, setQuick] = useState("");
  const [ansicht, setAnsicht] = useState<"liste" | "kacheln">("liste");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const qt = quick.find((x) => x.id === quickId)?.test ?? (() => true);
  const gefiltert = rows.filter((r) => {
    if (!qt(r)) return false;
    if (!suchtreffer(q, ...suche(r))) return false;
    if (bereich.length && bereichFilter && !bereichFilter(r).some((b) => bereich.includes(b))) return false;
    return filter.every((f) => {
      const sel = werte[f.key];
      if (!sel?.length) return true;
      const w = f.wert(r);
      return (Array.isArray(w) ? w : [w]).some((x) => sel.includes(x));
    });
  });
  const aktiv = !!q || quickId !== "" || bereich.length > 0 || Object.values(werte).some((v) => v.length);
  const setWert = (k: string, v: string[]) => setWerte((w) => ({ ...w, [k]: v }));
  const one = (k: string) => (werte[k]?.length === 1 ? werte[k][0] : "");
  const bereichOptionen = bereichFilter
    ? (["Investment", "Property", "Projects"] as const).map((b) => ({ value: b as string, label: `GRENFORD ${b}`, anzahl: rows.filter((r) => bereichFilter(r).includes(b)).length }))
    : [];

  const exportieren = () => {
    const sel = selected.size ? gefiltert.filter((r) => selected.has(r.id)) : gefiltert;
    downloadCsv(csv.datei, csv.kopf, sel.map(csv.zeile));
    toast(`${sel.length} Datensätze als CSV exportiert (Testdaten).`);
  };
  const statusSetzen = (s: string) => {
    statusAenderung!.setze([...selected], s);
    toast(`Status „${s}“ für ${selected.size} Datensätze gesetzt (Testmodus).`);
    setSelected(new Set());
  };
  const oeffnen = (r: T) => (onRow ? onRow(r) : href ? router.push(href(r)) : undefined);

  return (
    <ListLayout
      header={
        <>
          <PageHeader
            crumbs={crumbs}
            titel={titel}
            untertitel={untertitel}
            primary={neu}
            moreMenu={[
              { label: "Export (CSV)", hinweis: selected.size ? `${selected.size} ausgewählte` : `${gefiltert.length} gefilterte`, onClick: exportieren },
              ...(statusAenderung && selected.size ? statusAenderung.werte.map((s) => ({ label: `Status „${s}“ setzen`, hinweis: `${selected.size} ausgewählte`, onClick: () => statusSetzen(s) })) : []),
              ...(moreMenu ?? []),
            ]}
          />
          {kopfZusatz}
        </>
      }
      main={
        <>
          <KpiRow
            kpis={kpis.map((k) => ({
              label: k.label, wert: k.wert(rows), sub: k.sub, icon: k.icon,
              onClick: k.quick !== undefined ? () => { setQuick(k.quick!); setWerte({}); } : undefined,
              aktiv: k.quick !== undefined && k.quick !== "" && quickId === k.quick,
            }))}
          />
          <FilterBar ansicht={card ? ansicht : undefined} onAnsicht={card ? setAnsicht : undefined} onReset={() => { setQ(""); setWerte({}); setBereich([]); setQuick(""); }} resetAktiv={aktiv}>
            <SearchInput value={q} onChange={setQ} placeholder={suchePlatzhalter} className="w-full sm:w-[170px]" />
            {bereichFilter && <MultiFilter label="Geschäftsbereich" value={bereich} onChange={setBereich} options={bereichOptionen} />}
            {filter.filter((f) => f.inBar).map((f) => (
              <FilterSelect key={f.key} label={f.label} value={one(f.key)} onChange={(v) => setWert(f.key, v ? [v] : [])} options={[...zaehle(rows, f.wert).keys()].sort()} />
            ))}
          </FilterBar>
          {selected.size > 0 && statusAenderung && (
            <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-line bg-royal-100/40 px-3 py-2 text-[12px] text-navy-900" role="region" aria-label="Mehrfachauswahl">
              <span className="font-semibold">{selected.size} ausgewählt</span>
              <span className="text-muted">Status setzen:</span>
              {statusAenderung.werte.map((s) => (
                <button key={s} type="button" onClick={() => statusSetzen(s)} className="focus-ring rounded-[5px] border border-line bg-white px-2 py-[3px] text-[11.5px] hover:bg-line-soft">{s}</button>
              ))}
              <button type="button" onClick={exportieren} className="focus-ring ml-auto rounded-[5px] px-2 py-[3px] text-[11.5px] text-royal-600 hover:underline">Auswahl exportieren</button>
            </div>
          )}
          <DataTable
            rows={gefiltert}
            columns={columns}
            defaultSort={defaultSort}
            selected={selected}
            onSelected={setSelected}
            onRowClick={href || onRow ? oeffnen : undefined}
            ansicht={ansicht}
            card={card}
            resetKey={`${q}|${quickId}|${bereich.join()}|${JSON.stringify(werte)}`}
            rowMenu={rowMenu ?? ((r) => [{ label: "Öffnen", onClick: () => oeffnen(r) }])}
          />
        </>
      }
      aside={
        <>
          <QuickFilterCard filter={quick.map((x) => ({ id: x.id, label: x.label, icon: x.icon, anzahl: rows.filter(x.test).length }))} aktiv={quickId} onWahl={setQuick}>
            {bereichFilter && (
              <CheckGroup titel="Geschäftsbereich" werte={bereichOptionen.map((o) => [o.label, o.anzahl] as [string, number])} gewaehlt={bereich.map((b) => `GRENFORD ${b}`)} onChange={(v) => setBereich(v.map((l) => l.replace("GRENFORD ", "")))} />
            )}
            {filter.map((f) => (
              <CheckGroup key={f.key} titel={f.label} offen={f.offen} werte={[...zaehle(rows, f.wert).entries()].sort((a, b) => b[1] - a[1])} gewaehlt={werte[f.key] ?? []} onChange={(v) => setWert(f.key, v)} />
            ))}
          </QuickFilterCard>
          {extraAside}
          <TermineCard termine={naechste(aktivitaeten ?? [], crm.heute, 4)} />
          <NotizenCard notizen={notizen(aktivitaeten ?? [], 3)} />
        </>
      }
    />
  );
}
