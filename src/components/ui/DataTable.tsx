"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowDown, ArrowUp, Ellipsis } from "lucide-react";
import { sortiere } from "@/lib/crm/logic";
import { Checkbox, Menu, type MenuItem } from "./controls";

export type Column<T> = {
  key: string;
  header: string;
  cell: (r: T) => ReactNode;
  /** Wert für Sortierung; ohne Angabe nicht sortierbar */
  sort?: (r: T) => string | number;
  className?: string;
  align?: "right";
};

function pageList(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, 2, 3, page - 1, page, page + 1, count]);
  const nums = [...set].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function Pagination({ page, pageCount, onPage, pageSize, onPageSize, total }: { page: number; pageCount: number; onPage: (p: number) => void; pageSize: number; onPageSize: (n: number) => void; total: number }) {
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
      <nav className="flex items-center gap-1" aria-label="Seiten">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className="focus-ring rounded p-1.5 text-navy-900 disabled:opacity-30" aria-label="Vorherige Seite">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, pageCount).map((p, i) =>
          p === "…" ? (
            <span key={`d${i}`} className="px-2 text-[12px] text-muted">…</span>
          ) : (
            <button key={p} type="button" onClick={() => onPage(p)} aria-current={p === page ? "page" : undefined} className={`focus-ring h-[32px] min-w-[32px] rounded-[5px] px-1 text-[12px] ${p === page ? "bg-navy-900 font-semibold text-white" : "text-navy-900 hover:bg-line-soft"}`}>
              {p}
            </button>
          ),
        )}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} className="focus-ring rounded p-1.5 text-navy-900 disabled:opacity-30" aria-label="Nächste Seite">
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
      <div className="flex items-center gap-3 text-[12px] text-ink-soft">
        <span>Einträge pro Seite</span>
        <select aria-label="Einträge pro Seite" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="focus-ring h-[32px] rounded-[6px] border border-line bg-white px-2 text-[12px] text-navy-900">
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="ml-3 text-muted">{from} – {to} von {total}</span>
      </div>
    </div>
  );
}

/**
 * Wiederverwendbare Tabelle: Sortierung, Auswahl, Seitenumschaltung,
 * Zeilenmenü, Klick auf Zeile und alternative Kachelansicht.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  rowMenu,
  onRowClick,
  selected,
  onSelected,
  defaultSort,
  leerText = "Keine Einträge für die gewählten Filter.",
  ansicht = "liste",
  card,
  defaultPageSize = 25,
  resetKey,
}: {
  rows: T[];
  columns: Column<T>[];
  rowMenu?: (r: T) => MenuItem[];
  onRowClick?: (r: T) => void;
  selected?: Set<string>;
  onSelected?: (s: Set<string>) => void;
  defaultSort?: { key: string; richtung: "asc" | "desc" };
  leerText?: string;
  ansicht?: "liste" | "kacheln";
  card?: (r: T) => ReactNode;
  defaultPageSize?: number;
  /** Ändert sich z. B. bei neuen Filtern → zurück auf Seite 1 */
  resetKey?: string;
}) {
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [lastReset, setLastReset] = useState(resetKey);
  if (resetKey !== lastReset) {
    setLastReset(resetKey);
    setPage(1);
  }

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key);
    return col?.sort && sort ? sortiere(rows, col.sort, sort.richtung) : rows;
  }, [rows, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);
  const selOnPage = selected ? visible.filter((r) => selected.has(r.id)).length : 0;

  const toggleAll = (on: boolean) => {
    if (!selected || !onSelected) return;
    const next = new Set(selected);
    visible.forEach((r) => (on ? next.add(r.id) : next.delete(r.id)));
    onSelected(next);
  };

  const headerSort = (c: Column<T>) => {
    if (!c.sort) return;
    setSort((s) => (s?.key === c.key ? { key: c.key, richtung: s.richtung === "asc" ? "desc" : "asc" } : { key: c.key, richtung: "asc" }));
  };

  return (
    <div className="card flex min-w-0 flex-col">
      {ansicht === "kacheln" && card ? (
        <div className="grid gap-3 p-3 sm:grid-cols-2 2xl:grid-cols-3">
          {visible.map((r) => (
            <div key={r.id} onClick={() => onRowClick?.(r)} className={onRowClick ? "cursor-pointer" : ""}>
              {card(r)}
            </div>
          ))}
          {!visible.length && <p className="col-span-full py-10 text-center text-[12px] text-muted">{leerText}</p>}
        </div>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-line bg-[#fafbfd] text-[11px] text-muted">
                {selected && (
                  <th className="w-[40px] py-[10px] pl-4">
                    <Checkbox checked={!!visible.length && selOnPage === visible.length} indeterminate={selOnPage > 0 && selOnPage < visible.length} onChange={toggleAll} label="Alle Zeilen dieser Seite auswählen" />
                  </th>
                )}
                {columns.map((c) => (
                  <th key={c.key} className={`whitespace-nowrap py-[10px] pr-3 font-normal ${c.align === "right" ? "text-right" : ""} ${c.className ?? ""}`} aria-sort={sort?.key === c.key ? (sort.richtung === "asc" ? "ascending" : "descending") : undefined}>
                    {c.sort ? (
                      <button type="button" onClick={() => headerSort(c)} className={`focus-ring inline-flex items-center gap-1 rounded ${sort?.key === c.key ? "font-semibold text-navy-900" : "hover:text-navy-900"}`}>
                        {c.header}
                        {sort?.key === c.key ? (sort.richtung === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 opacity-50" />}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                ))}
                {rowMenu && <th className="w-[44px]"><span className="sr-only">Aktionen</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {visible.map((r) => (
                <tr key={r.id} onClick={() => onRowClick?.(r)} className={`${onRowClick ? "cursor-pointer" : ""} ${selected?.has(r.id) ? "bg-royal-100/40" : "hover:bg-[#f7f9fc]"}`}>
                  {selected && onSelected && (
                    <td className="py-[7px] pl-4">
                      <Checkbox checked={selected.has(r.id)} onChange={(on) => { const n = new Set(selected); if (on) n.add(r.id); else n.delete(r.id); onSelected(n); }} label="Zeile auswählen" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={`py-[7px] pr-3 align-middle ${c.align === "right" ? "text-right" : ""} ${c.className ?? ""}`}>
                      {c.cell(r)}
                    </td>
                  ))}
                  {rowMenu && (
                    <td className="py-[7px] pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Menu label="Aktionen" items={rowMenu(r)} trigger={<span className="flex h-7 w-7 items-center justify-center rounded text-navy-900 hover:bg-line-soft"><Ellipsis className="h-4 w-4" strokeWidth={2.4} /></span>} />
                    </td>
                  )}
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={columns.length + 2} className="py-10 text-center text-[12px] text-muted">{leerText}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-auto border-t border-line-soft">
        <Pagination page={current} pageCount={pageCount} onPage={(p) => setPage(Math.min(Math.max(1, p), pageCount))} pageSize={pageSize} onPageSize={(n) => { setPageSize(n); setPage(1); }} total={sorted.length} />
      </div>
    </div>
  );
}
