"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Bereich, ZahlStatus } from "@/lib/finanzen/logic";

/** Auswahlfeld im Stil der Vorlage (natives <select> für Tastatur und Barrierefreiheit) */
export function SelectBox<T extends string>({
  value,
  onChange,
  options,
  label,
  className = "",
  icon,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={`relative flex h-[34px] items-center rounded-[6px] border border-fin-line bg-white shadow-card ${className}`}>
      {icon && <span className="pointer-events-none absolute left-3 text-fin-ink">{icon}</span>}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`focus-ring h-full w-full cursor-pointer appearance-none rounded-[6px] bg-transparent pr-8 text-[11.5px] text-fin-ink ${icon ? "pl-9" : "pl-3"}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-fin-ink" strokeWidth={2} />
    </div>
  );
}

export function BereichBadge({ bereich }: { bereich: Bereich }) {
  const style = bereich === "Property" ? "bg-fin-green-bg text-[#2d7a5c]" : "bg-fin-lavender text-[#3b3f98]";
  return <span className={`inline-flex w-[76px] justify-center rounded-[4px] py-[2px] text-[11px] ${style}`}>{bereich}</span>;
}

const statusStyle: Record<ZahlStatus, string> = {
  Bezahlt: "bg-fin-green-bg text-[#2f8463]",
  Teilzahlung: "bg-fin-amber-bg text-fin-amber",
  "Rest überfällig": "bg-fin-red-bg text-[#a3283a]",
};

export function StatusBadge({ status }: { status: ZahlStatus }) {
  return (
    <span className={`inline-flex min-w-[72px] justify-center whitespace-nowrap rounded-[4px] px-2 py-[2px] text-[11px] ${statusStyle[status]}`}>
      {status}
    </span>
  );
}

/** Checkbox mit Zwischenzustand („einige ausgewählt“) */
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="block h-[13px] w-[13px] cursor-pointer rounded-[3px] accent-fin-blue"
    />
  );
}

export function Pagination({
  page,
  pageCount,
  onPage,
  pageSize,
  onPageSize,
  total,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
  pageSize: number;
  onPageSize: (n: number) => void;
  total: number;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-[10px] pb-[8px] pt-[12px]">
      <nav className="flex items-center gap-[10px]" aria-label="Seiten">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="focus-ring rounded p-1 text-fin-ink disabled:opacity-30"
          aria-label="Vorherige Seite"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
        </button>
        {Array.from({ length: Math.max(pageCount, 1) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`focus-ring h-[34px] min-w-[36px] rounded-[5px] text-[12.5px] ${
              p === page ? "bg-[#0b3bd6] font-medium text-white" : "text-fin-ink hover:bg-fin-blue-bg"
            }`}
          >
            {p}
          </button>
        ))}
        {pageCount > 1 && (
          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= pageCount}
            className="focus-ring rounded p-1 text-fin-ink disabled:opacity-30"
            aria-label="Nächste Seite"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        )}
      </nav>
      <div className="flex items-center gap-[12px] text-[12px] text-fin-text">
        <span>Einträge pro Seite</span>
        <SelectBox
          label="Einträge pro Seite"
          value={String(pageSize)}
          onChange={(v) => onPageSize(Number(v))}
          options={["10", "25", "50"].map((n) => ({ value: n, label: n }))}
          className="w-[66px]"
        />
        <span className="ml-4 min-w-[84px] text-right text-[13px] text-fin-muted">
          {from} – {to} von {total}
        </span>
      </div>
    </div>
  );
}

/** Kurzer Hinweis unten rechts, z. B. für noch nicht umgesetzte Funktionen */
export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-lg bg-navy-950 px-4 py-3 text-[12.5px] text-white shadow-lg">
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onClose} className="focus-ring rounded text-white/70 hover:text-white" aria-label="Hinweis schließen">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
