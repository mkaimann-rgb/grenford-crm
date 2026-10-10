"use client";

import { useEffect, useId, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";

export function Modal({ titel, onClose, children, footer, breit = "max-w-[900px]" }: { titel: string; onClose: () => void; children: ReactNode; footer?: ReactNode; breit?: string }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/40 p-4 md:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={titel} className={`w-full ${breit} rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-[20px] font-bold text-navy-950">{titel}</h2>
          <button type="button" onClick={onClose} className="focus-ring rounded p-1 text-navy-900 hover:bg-line-soft" aria-label="Schließen">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

const inputCls =
  "focus-ring h-[34px] w-full rounded-[6px] border border-line bg-white px-3 text-[12px] text-ink placeholder:text-muted-soft disabled:bg-line-soft";

export function Field({ label, pflicht, fehler, children, hinweis }: { label: string; pflicht?: boolean; fehler?: string; hinweis?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-[5px] block text-[11.5px] text-ink-soft">
        {label}
        {pflicht && <span className="ml-0.5 text-neg">*</span>}
      </label>
      {children(id)}
      {fehler ? <p className="mt-1 text-[11px] text-neg">{fehler}</p> : hinweis ? <p className="mt-1 text-[11px] text-muted">{hinweis}</p> : null}
    </div>
  );
}

export function TextField({ label, value, onChange, pflicht, fehler, placeholder, type = "text", hinweis }: { label: string; value: string; onChange: (v: string) => void; pflicht?: boolean; fehler?: string; placeholder?: string; type?: string; hinweis?: string }) {
  return (
    <Field label={label} pflicht={pflicht} fehler={fehler} hinweis={hinweis}>
      {(id) => <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={!!fehler} className={`${inputCls} ${fehler ? "border-neg" : ""}`} />}
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, pflicht, fehler, leer = "Bitte auswählen" }: { label: string; value: string; onChange: (v: string) => void; options: readonly (string | { value: string; label: string })[]; pflicht?: boolean; fehler?: string; leer?: string | null }) {
  return (
    <Field label={label} pflicht={pflicht} fehler={fehler}>
      {(id) => (
        <div className="relative">
          <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!fehler} className={`${inputCls} cursor-pointer appearance-none pr-8 ${fehler ? "border-neg" : ""}`}>
            {leer !== null && <option value="">{leer}</option>}
            {options.map((o) => {
              const opt = typeof o === "string" ? { value: o, label: o } : o;
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-[9px] h-4 w-4 text-navy-900" />
        </div>
      )}
    </Field>
  );
}

export function TextArea({ label, value, onChange, max = 1000, placeholder }: { label: string; value: string; onChange: (v: string) => void; max?: number; placeholder?: string }) {
  return (
    <Field label={label}>
      {(id) => (
        <>
          <textarea id={id} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="focus-ring w-full rounded-[6px] border border-line bg-white px-3 py-2 text-[12px] text-ink placeholder:text-muted-soft" />
          <div className="text-right text-[10.5px] text-muted">{value.length} / {max.toLocaleString("de-DE")}</div>
        </>
      )}
    </Field>
  );
}

/** Mehrfachauswahl als Chips */
export function ChipSelect({ label, options, value, onChange, fehler }: { label: string; options: readonly string[]; value: string[]; onChange: (v: string[]) => void; fehler?: string }) {
  return (
    <fieldset>
      <legend className="mb-[6px] text-[11.5px] text-ink-soft">{label}</legend>
      <div className="flex flex-wrap gap-[6px]">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
              className={`focus-ring rounded-[5px] border px-[10px] py-[5px] text-[11px] ${on ? "border-navy-900 bg-navy-900 text-white" : "border-transparent bg-royal-100 text-navy-800 hover:border-navy-700/30"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {fehler && <p className="mt-1 text-[11px] text-neg">{fehler}</p>}
    </fieldset>
  );
}

export function FormSection({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="font-serif text-[14px] font-bold text-navy-950">{titel}</h3>
      {children}
    </section>
  );
}
