"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import { initialen } from "@/lib/crm/logic";

// ---------- Buttons ----------

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" };
export function Button({ variant = "secondary", size = "md", className = "", ...p }: BtnProps) {
  const v = {
    primary: "bg-navy-900 text-white hover:bg-navy-800 border border-navy-900",
    secondary: "bg-white text-navy-900 border border-line hover:bg-line-soft shadow-card",
    ghost: "text-navy-900 hover:bg-line-soft",
  }[variant];
  const s = size === "sm" ? "h-[30px] px-3 text-[11.5px]" : "h-[36px] px-[14px] text-[12px]";
  return <button type="button" className={`focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] font-medium disabled:opacity-50 ${v} ${s} ${className}`} {...p} />;
}

// ---------- Suche & Filter ----------

export function SearchInput({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={`relative flex h-[34px] items-center rounded-[6px] border border-line bg-white shadow-card ${className}`}>
      <Search className="ml-3 h-[15px] w-[15px] shrink-0 text-navy-800" strokeWidth={2} />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[11.5px] text-ink placeholder:text-muted outline-none"
      />
    </label>
  );
}

/** Kompaktes Auswahlfeld für Filterleisten. Leerer Wert = „alle“ (zeigt den Feldnamen). */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  className?: string;
}) {
  return (
    <div className={`relative flex h-[34px] w-[110px] items-center rounded-[6px] border border-line bg-white shadow-card ${value ? "border-navy-700/40" : ""} ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`focus-ring h-full w-full cursor-pointer appearance-none truncate rounded-[6px] bg-transparent pl-3 pr-8 text-[11.5px] ${value ? "font-semibold text-navy-900" : "text-navy-900"}`}
      >
        <option value="">{label}</option>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-navy-900" strokeWidth={2} />
    </div>
  );
}

// ---------- Badges & Avatare ----------

const TONES = {
  green: "bg-pos-bg text-pos",
  blue: "bg-royal-100 text-royal-600",
  amber: "bg-warn-bg text-warn",
  red: "bg-neg-bg text-neg",
  gray: "bg-line-soft text-muted",
  lavender: "bg-[#ecebfa] text-[#3b3f98]",
  orange: "bg-[#fdeee2] text-[#c4621a]",
} as const;
export type Tone = keyof typeof TONES;

const STATUS_TONE: Record<string, Tone> = {
  Aktiv: "green",
  Bezahlt: "green",
  Erledigt: "green",
  Abgeschlossen: "gray",
  "In Kontakt": "blue",
  "In Planung": "blue",
  Geplant: "blue",
  Suchauftrag: "blue",
  Potenzial: "amber",
  Qualifiziert: "amber",
  Angebotsphase: "amber",
  Pausiert: "gray",
  Inaktiv: "gray",
  Heute: "red",
  Überfällig: "red",
  Notiz: "lavender",
};

export function Badge({ children, tone = "blue", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-[4px] px-2 py-[2px] text-[11px] font-medium ${TONES[tone]} ${className}`}>{children}</span>;
}

export function StatusBadge({ status, className = "min-w-[64px]" }: { status: string; className?: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "gray"} className={className}>{status}</Badge>;
}

export function Avatar({ name, bild, size = 32, rund = true }: { name: string; bild?: string; size?: number; rund?: boolean }) {
  const r = rund ? "rounded-full" : "rounded-[5px]";
  if (bild)
    return <Image src={bild} alt="" width={size} height={size} className={`shrink-0 object-cover ${r}`} style={{ width: size, height: size }} />;
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-[#e6ecf7] font-bold text-navy-800 ${r}`}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.34) }}
      aria-hidden="true"
    >
      {initialen(name)}
    </span>
  );
}

// ---------- Tabs ----------

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
          className={`focus-ring -mb-px whitespace-nowrap border-b-2 px-[14px] pb-[8px] pt-[6px] text-[12.5px] ${
            t.id === value ? "border-navy-900 font-semibold text-navy-950" : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Menü ----------

export type MenuItem = { label: string; onClick: () => void; danger?: boolean; hinweis?: string };

export function Menu({ trigger, items, align = "right", label }: { trigger: ReactNode; items: MenuItem[]; align?: "left" | "right"; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} className="focus-ring rounded">
        {trigger}
      </button>
      {open && (
        <div role="menu" className={`absolute top-[calc(100%+4px)] z-30 min-w-[200px] rounded-lg border border-line bg-white p-1 text-[12px] text-ink shadow-lg ${align === "right" ? "right-0" : "left-0"}`}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick(); }}
              className={`block w-full rounded px-3 py-2 text-left hover:bg-line-soft ${it.danger ? "text-neg" : ""}`}
            >
              {it.label}
              {it.hinweis && <span className="block text-[10.5px] text-muted">{it.hinweis}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Checkbox ----------

export function Checkbox({ checked, indeterminate = false, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; label: string }) {
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
      onClick={(e) => e.stopPropagation()}
      aria-label={label}
      className="block h-[14px] w-[14px] cursor-pointer rounded-[3px] accent-navy-900"
    />
  );
}
