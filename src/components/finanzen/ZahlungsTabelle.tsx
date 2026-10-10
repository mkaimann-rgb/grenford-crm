"use client";

import type { ReactNode } from "react";
import { Checkbox, Pagination } from "./ui";

export type Spalte<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "right";
};

/** Zahlungstabelle mit Auswahl und Seitenumschaltung; Zustand liegt beim Aufrufer */
export function ZahlungsTabelle<T extends { id: string }>({
  title,
  rows,
  spalten,
  page,
  pageSize,
  onPage,
  onPageSize,
  selected,
  onSelected,
  leerText,
}: {
  title: string;
  rows: T[];
  spalten: Spalte<T>[];
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
  selected: Set<string>;
  onSelected: (s: Set<string>) => void;
  leerText: string;
}) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * pageSize, current * pageSize);
  const selectedOnPage = visible.filter((r) => selected.has(r.id)).length;

  const toggleAll = (on: boolean) => {
    const next = new Set(selected);
    for (const r of visible) {
      if (on) next.add(r.id);
      else next.delete(r.id);
    }
    onSelected(next);
  };
  const toggle = (id: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    onSelected(next);
  };

  return (
    <section className="card flex min-w-0 flex-col px-[10px] pt-[12px]">
      <div className="flex items-baseline justify-between gap-3 px-[4px]">
        <h2 className="font-serif text-[15px] font-bold tracking-[-0.01em] text-fin-ink">
          {title} ({rows.length})
        </h2>
        {selected.size > 0 && (
          <button type="button" onClick={() => onSelected(new Set())} className="focus-ring rounded text-[11.5px] text-fin-muted hover:text-fin-ink">
            {selected.size} ausgewählt · Auswahl aufheben
          </button>
        )}
      </div>

      <div className="mt-[8px] flex-1 overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed text-left text-[11.5px] min-[1400px]:min-w-0">
          <thead>
            <tr className="border-b border-fin-line text-fin-muted">
              <th className="w-[28px] py-[6px] pl-[4px] font-normal">
                <Checkbox
                  checked={visible.length > 0 && selectedOnPage === visible.length}
                  indeterminate={selectedOnPage > 0 && selectedOnPage < visible.length}
                  onChange={toggleAll}
                  label="Alle Zeilen dieser Seite auswählen"
                />
              </th>
              {spalten.map((s) => (
                <th key={s.key} title={s.header} className={`truncate whitespace-nowrap py-[6px] font-normal ${s.align === "right" ? "pr-[10px] text-right" : ""} ${s.className ?? ""}`}>
                  {s.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-fin-line">
            {visible.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? "bg-fin-blue-bg/50" : "hover:bg-[#f7f8fc]"}>
                <td className="py-[4px] pl-[4px]">
                  <Checkbox checked={selected.has(r.id)} onChange={(on) => toggle(r.id, on)} label={`Zeile ${r.id} auswählen`} />
                </td>
                {spalten.map((s) => (
                  <td key={s.key} className={`whitespace-nowrap py-[4px] ${s.align === "right" ? "pr-[10px] text-right" : ""} ${s.className ?? ""}`}>
                    {s.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={spalten.length + 1} className="py-8 text-center text-[12px] text-fin-muted">
                  {leerText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-fin-line">
        <Pagination
          page={current}
          pageCount={pageCount}
          onPage={(p) => onPage(Math.min(Math.max(1, p), pageCount))}
          pageSize={pageSize}
          onPageSize={onPageSize}
          total={rows.length}
        />
      </div>
    </section>
  );
}
