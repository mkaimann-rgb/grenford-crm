"use client";

import { useState } from "react";
import { useCrm } from "@/lib/crm/store";
import { personName } from "@/lib/crm/logic";
import { findeObjekt } from "@/lib/crm/vorgaenge";
import type { Ref } from "@/lib/crm/module";
import { Button } from "@/components/ui/controls";
import { ChipSelect, Modal, SelectField, TextArea, TextField } from "@/components/ui/modal";

/**
 * Konfigurierbarer Anlage-/Bearbeitungsdialog für alle Fachmodule.
 * Werte als Zeichenketten bzw. Listen; Umwandlung übernimmt der Aufrufer in `speichern`.
 * Verweise auf Stammdaten werden ausgewählt (nie neu angelegt) – keine Dubletten.
 */
export type FeldTyp = "text" | "zahl" | "datum" | "select" | "multi" | "textarea" | "ref" | "person" | "unternehmen" | "objekt";
export type Feld = {
  key: string;
  label: string;
  typ: FeldTyp;
  options?: readonly (string | { value: string; label: string })[];
  pflicht?: boolean;
  hinweis?: string;
  placeholder?: string;
  /** volle Breite */
  breit?: boolean;
  /** nur anzeigen, wenn Bedingung erfüllt */
  wenn?: (w: Werte) => boolean;
};
export type Werte = Record<string, string | string[]>;

/** "person:p-x" / "unternehmen:f-y" ↔ Ref */
export const refAus = (s: string | string[] | undefined): Ref | undefined => {
  if (typeof s !== "string" || !s.includes(":")) return undefined;
  const [art, id] = s.split(":");
  return { art: art as Ref["art"], id };
};
export const refZu = (r?: Ref) => (r ? `${r.art}:${r.id}` : "");
export const zahl = (s: string | string[] | undefined) => (typeof s === "string" && s.trim() ? Number(s.replace(/\./g, "").replace(",", ".")) : 0);
export const text = (s: string | string[] | undefined) => (typeof s === "string" ? s.trim() : "");
export const liste = (s: string | string[] | undefined) => (Array.isArray(s) ? s : typeof s === "string" && s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

export function FormModal({
  titel, felder, start, onClose, speichern, pruefen, breit = "max-w-[760px]", knopf = "Speichern", hinweis,
}: {
  titel: string;
  felder: Feld[];
  start: Werte;
  onClose: () => void;
  /** Gibt false zurück, wenn der Dialog offen bleiben soll */
  speichern: (w: Werte) => void | false;
  pruefen?: (w: Werte) => Record<string, string>;
  breit?: string;
  knopf?: string;
  hinweis?: string;
}) {
  const crm = useCrm();
  const [w, setW] = useState<Werte>(start);
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const set = (k: string, v: string | string[]) => setW((x) => ({ ...x, [k]: v }));
  const personen = [...crm.personen].sort((a, b) => a.nachname.localeCompare(b.nachname)).map((p) => ({ value: p.id, label: personName(p) }));
  const firmen = [...crm.unternehmen].sort((a, b) => a.name.localeCompare(b.name)).map((u) => ({ value: u.id, label: u.name }));
  const refs = [...firmen.map((f) => ({ value: `unternehmen:${f.value}`, label: `${f.label} (Unternehmen)` })), ...personen.map((p) => ({ value: `person:${p.value}`, label: `${p.label} (Person)` }))];
  const objekte = [...crm.objekte].sort((a, b) => a.titel.localeCompare(b.titel)).map((o) => ({ value: o.id, label: `${o.titel} · ${o.ort}${o.nummer ? ` (${o.nummer})` : ""}` }));

  const ok = () => {
    const e: Record<string, string> = {};
    for (const f of felder) {
      if (f.wenn && !f.wenn(w)) continue;
      const v = w[f.key];
      if (f.pflicht && (Array.isArray(v) ? !v.length : !String(v ?? "").trim())) e[f.key] = `Bitte „${f.label}“ angeben.`;
      if (f.typ === "zahl" && typeof v === "string" && v.trim() && isNaN(zahl(v))) e[f.key] = "Bitte eine Zahl eingeben.";
      if (f.typ === "objekt" && v === "__neu" && !text(w[`${f.key}__titel`])) e[`${f.key}__titel`] = "Bitte die Objektbezeichnung angeben.";
    }
    Object.assign(e, pruefen?.(w) ?? {});
    setFehler(e);
    if (Object.keys(e).length) return;
    // Neues Objekt: vorhandenes mit gleichem Titel/Ort wird verknüpft statt dupliziert
    const fertig = { ...w };
    for (const f of felder) {
      if (f.typ === "objekt" && w[f.key] === "__neu") fertig[f.key] = crm.objektZuordnen(text(w[`${f.key}__titel`]), text(w[`${f.key}__ort`]));
    }
    if (speichern(fertig) !== false) onClose();
  };

  return (
    <Modal titel={titel} onClose={onClose} breit={breit} footer={<><Button onClick={onClose}>Abbrechen</Button><Button variant="primary" onClick={ok}>{knopf}</Button></>}>
      {hinweis && <p className="mb-3 rounded-[6px] bg-line-soft px-3 py-2 text-[11.5px] text-ink-soft">{hinweis}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {felder.filter((f) => !f.wenn || f.wenn(w)).map((f) => {
          const v = w[f.key];
          const s = typeof v === "string" ? v : "";
          const cls = f.breit || f.typ === "textarea" || f.typ === "multi" ? "sm:col-span-2" : "";
          let el;
          switch (f.typ) {
            case "select":
              el = <SelectField label={f.label} pflicht={f.pflicht} value={s} onChange={(x) => set(f.key, x)} options={f.options ?? []} fehler={fehler[f.key]} />;
              break;
            case "multi":
              el = <ChipSelect label={`${f.label}${f.pflicht ? " *" : ""}`} options={(f.options ?? []).map((o) => (typeof o === "string" ? o : o.value))} value={Array.isArray(v) ? v : []} onChange={(x) => set(f.key, x)} fehler={fehler[f.key]} />;
              break;
            case "textarea":
              el = <TextArea label={f.label} value={s} onChange={(x) => set(f.key, x)} placeholder={f.placeholder} />;
              break;
            case "ref":
              el = <SelectField label={f.label} pflicht={f.pflicht} value={s} onChange={(x) => set(f.key, x)} options={refs} fehler={fehler[f.key]} leer="– bitte aus Stammdaten wählen –" />;
              break;
            case "person":
              el = <SelectField label={f.label} pflicht={f.pflicht} value={s} onChange={(x) => set(f.key, x)} options={personen} fehler={fehler[f.key]} leer="– keine Person –" />;
              break;
            case "unternehmen":
              el = <SelectField label={f.label} pflicht={f.pflicht} value={s} onChange={(x) => set(f.key, x)} options={firmen} fehler={fehler[f.key]} leer="– kein Unternehmen –" />;
              break;
            case "objekt": {
              const neuT = text(w[`${f.key}__titel`]);
              const treffer = s === "__neu" && neuT ? findeObjekt(crm.objekte, neuT, text(w[`${f.key}__ort`])) : undefined;
              el = (
                <div className="space-y-2">
                  <SelectField label={f.label} pflicht={f.pflicht} value={s} onChange={(x) => set(f.key, x)} options={[...objekte, { value: "__neu", label: "+ Neues Objekt erfassen …" }]} fehler={fehler[f.key]} leer="– Objekt wählen –" />
                  {s === "__neu" && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <TextField label="Objektbezeichnung" pflicht value={neuT} onChange={(x) => set(`${f.key}__titel`, x)} fehler={fehler[`${f.key}__titel`]} />
                      <TextField label="Ort" value={text(w[`${f.key}__ort`])} onChange={(x) => set(`${f.key}__ort`, x)} />
                      {treffer && <p role="status" className="rounded-[6px] bg-pos-bg px-2 py-1 text-[11px] text-pos sm:col-span-2">Objekt „{treffer.titel}, {treffer.ort}“ existiert bereits – es wird verknüpft, kein zweiter Stammsatz.</p>}
                    </div>
                  )}
                </div>
              );
              break;
            }
            default:
              el = <TextField label={f.label} pflicht={f.pflicht} type={f.typ === "datum" ? "date" : "text"} value={s} onChange={(x) => set(f.key, x)} fehler={fehler[f.key]} placeholder={f.placeholder} hinweis={f.hinweis} />;
          }
          return <div key={f.key} className={cls}>{el}</div>;
        })}
      </div>
    </Modal>
  );
}

/** Kleiner Hilfsdialog für eine einzelne Feldänderung bleibt über FormModal abbildbar */
export function useFormModal() {
  const [offen, setOffen] = useState<null | { titel: string; felder: Feld[]; start: Werte; speichern: (w: Werte) => void | false; pruefen?: (w: Werte) => Record<string, string>; hinweis?: string; knopf?: string }>(null);
  const element = offen ? <FormModal {...offen} onClose={() => setOffen(null)} /> : null;
  return { oeffne: setOffen, element };
}
