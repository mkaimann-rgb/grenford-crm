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
  // Fachmodule (Phasen B–F)
  "In Prüfung": "blue",
  "In Verhandlung": "amber",
  "In Vorbereitung": "amber",
  Planung: "blue",
  "In Umsetzung": "blue",
  Angebot: "amber",
  Übernommen: "gray",
  Verloren: "gray",
  Abgesagt: "gray",
  Gekauft: "green",
  Platziert: "green",
  Käufer: "green",
  Eingegangen: "blue",
  Angefragt: "amber",
  Beauftragt: "green",
  Abgelehnt: "gray",
  Erwartet: "blue",
  Entstanden: "amber",
  Abgerechnet: "green",
  Ausgezahlt: "green",
  Storniert: "gray",
  Offen: "blue",
  Teilzahlung: "amber",
  "Rest überfällig": "red",
  "Beurkundung / Closing": "amber",
  Vermarktung: "green",
  Exposé: "blue",
  Vorbereitung: "amber",
  Verhandlung: "amber",
  Verkauft: "gray",
  Ruhend: "gray",
  Unterzeichnet: "green",
  "1. Mahnung": "amber",
  "2. Mahnung": "orange",
  "Vollstreckung / rechtliche Eskalation": "red",
  "Nicht überfällig": "green",
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

export function Menu({ trigger, items, align = "right", label, flach = false }: { trigger: ReactNode; items: MenuItem[]; align?: "left" | "right"; label: string; /** Button ohne Zeilenhöhe (exakte Ausrichtung in der Kopfzeile) */ flach?: boolean }) {
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
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} className={`focus-ring rounded ${flach ? "flex" : ""}`}>
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

// ---------- Geschäftsbereiche ----------

export const BEREICH_STIL: Record<string, string> = {
  Investment: "bg-[#e3eaf8] text-navy-800 ring-navy-800/20",
  Property: "bg-pos-bg text-pos ring-pos/25",
  Projects: "bg-[#fdeee2] text-[#b4570f] ring-[#b4570f]/25",
};
const BEREICH_KURZ: Record<string, string> = { Investment: "INV", Property: "PROP", Projects: "PROJ" };

/**
 * Kennzeichnung der Geschäftsbereiche.
 * kompakt: Kürzel (INV / PROP / PROJ) für Tabellen; sonst voller Name inkl. Funktion.
 */
export function BereichBadges({
  bereiche,
  pruefen,
  kompakt = false,
}: {
  bereiche: { bereich: string; funktion?: string; herkunft?: string; grund?: string }[];
  pruefen?: string;
  kompakt?: boolean;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-[4px]">
      {bereiche.map((z) => {
        const titel = `GRENFORD ${z.bereich}${z.funktion ? ` – ${z.funktion}` : ""}${z.herkunft === "abgeleitet" && z.grund ? ` (abgeleitet: ${z.grund})` : ""}`;
        return (
          <span key={z.bereich} title={titel} className={`relative inline-flex items-center whitespace-nowrap rounded-[4px] font-semibold ring-1 ring-inset ${BEREICH_STIL[z.bereich]} ${kompakt ? "px-[6px] py-[1px] text-[9.5px] tracking-[0.04em]" : "px-[9px] py-[3px] text-[11px]"}`}>
            {kompakt ? <><span aria-hidden="true">{BEREICH_KURZ[z.bereich]}</span><span className="sr-only">{z.bereich}</span></> : z.bereich}
            {!kompakt && z.funktion && <span className="ml-1 font-normal opacity-80">· {z.funktion}</span>}
          </span>
        );
      })}
      {(pruefen || !bereiche.length) && (
        <span title={pruefen ?? "Kein Geschäftsbereich zugeordnet"} className={`inline-flex items-center whitespace-nowrap rounded-[4px] border border-dashed border-warn/60 bg-warn-bg font-semibold text-warn ${kompakt ? "px-[5px] py-[0px] text-[9.5px]" : "px-[9px] py-[2px] text-[11px]"}`}>
          {kompakt ? "?" : "Bereich prüfen"}
          <span className="sr-only">: {pruefen ?? "Kein Geschäftsbereich zugeordnet"}</span>
        </span>
      )}
    </span>
  );
}

/** Filter mit Mehrfachauswahl (Popover mit Kontrollkästchen) */
export function MultiFilter({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  label: string;
  options: { value: string; label: string; anzahl?: number }[];
  value: string[];
  onChange: (v: string[]) => void;
  className?: string;
}) {
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
  const text = !value.length ? label : value.length === 1 ? options.find((o) => o.value === value[0])?.label ?? value[0] : `${label} (${value.length})`;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label}: ${value.length ? value.join(", ") : "alle"}`}
        onClick={() => setOpen((o) => !o)}
        className={`focus-ring relative flex h-[34px] w-[124px] items-center rounded-[6px] border bg-white pl-3 pr-8 text-left text-[11.5px] text-navy-900 shadow-card ${value.length ? "border-navy-700/40 font-semibold" : "border-line"} ${className}`}
      >
        <span className="truncate">{text}</span>
        <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4" strokeWidth={2} />
      </button>
      {open && (
        <div role="group" aria-label={label} className="absolute left-0 top-[calc(100%+4px)] z-30 min-w-[220px] rounded-lg border border-line bg-white p-2 shadow-lg">
          {options.map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12px] text-ink hover:bg-line-soft">
              <input type="checkbox" checked={value.includes(o.value)} onChange={(e) => onChange(e.target.checked ? [...value, o.value] : value.filter((x) => x !== o.value))} className="h-[13px] w-[13px] accent-navy-900" />
              <span className="flex-1">{o.label}</span>
              {o.anzahl !== undefined && <span className="text-muted">{o.anzahl}</span>}
            </label>
          ))}
          <p className="mt-1 border-t border-line-soft px-2 pt-1.5 text-[10.5px] text-muted">Mehrfachauswahl: Treffer in mindestens einem Bereich.</p>
          {value.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="focus-ring mt-1 w-full rounded px-2 py-1 text-left text-[11.5px] text-royal-600 hover:bg-line-soft">Auswahl aufheben</button>
          )}
        </div>
      )}
    </div>
  );
}

/** Geschäftsbereich eines einzelnen Vorgangs (nicht des Kontakts) – gleiche Farben wie BereichBadges */
export function BereichMarke({ bereich, className = "" }: { bereich: string | null; className?: string }) {
  if (!bereich) {
    return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-[4px] border border-dashed border-warn/60 bg-warn-bg px-[6px] py-[1px] text-[10px] font-semibold text-warn ${className}`}>Bereich prüfen</span>;
  }
  return <span title={`Geschäftsbereich des Vorgangs: GRENFORD ${bereich}`} className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-[4px] px-[6px] py-[1px] text-[10px] font-semibold ring-1 ring-inset ${BEREICH_STIL[bereich]} ${className}`}>{bereich}</span>;
}
