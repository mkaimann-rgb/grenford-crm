"use client";

import Link from "next/link";
import { CircleAlert, Link2 } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { personName } from "@/lib/crm/logic";
import type { VorgangZeile } from "@/lib/crm/vorgaenge";
import { euroCompact } from "@/lib/format";
import { Avatar, BereichMarke, StatusBadge } from "@/components/ui/controls";
import { personHref } from "./modals";

/**
 * Eintrag „Objekt / Projekt“ mit Geschäftsbereich DES VORGANGS, Vorgangsart und Rolle des Kontakts.
 * Bewusst getrennt von den Geschäftsbereichen des Kontakts (Kopfbereich der Detailseite).
 */
export function VorgangEintrag({ z, onEdit, kompakt = false, details = false }: { z: VorgangZeile; onEdit?: () => void; kompakt?: boolean; details?: boolean }) {
  const crm = useCrm();
  const { v, objekt } = z;
  const titel = objekt?.titel ?? v.titel;
  const ort = objekt?.ort || v.ort;
  const andereBereiche = [...new Set(z.weitere.map((w) => w.geschaeftsbereich).filter((b) => b && b !== v.geschaeftsbereich))];
  const inhalt = (
    <>
      <div className="truncate text-[12px] font-semibold text-navy-950" title={titel}>{titel}</div>
      <div className="mt-[2px] flex min-w-0 items-center gap-1.5 text-[11px]" data-testid="vorgang-kennung">
        <BereichMarke bereich={v.geschaeftsbereich} />
        <span className="truncate text-navy-900" title={`Rolle dieses Kontakts im Vorgang: ${z.rolle || "—"}`}>Rolle: <span className="font-semibold">{z.rolle || "—"}</span></span>
      </div>
      <div className="truncate text-[11px] text-muted" title={`Vorgangsart: ${v.art}`}>
        {[v.art, ort || (objekt ? "" : v.referenz ? `Referenz ${v.referenz}` : "kein konkretes Objekt"), v.budget ? euroCompact(v.budget) : "", z.ueber ? `über ${z.ueber}` : ""].filter(Boolean).join(" · ")}
      </div>
    </>
  );
  return (
    <li className="py-2">
      <div className="flex items-center gap-3">
        {!kompakt && <Avatar name={titel} bild={objekt?.bild ?? v.bild} size={48} rund={false} />}
        {onEdit ? <button type="button" onClick={onEdit} className="focus-ring min-w-0 flex-1 rounded text-left">{inhalt}</button> : <div className="min-w-0 flex-1">{inhalt}</div>}
        <div className="flex w-[92px] shrink-0 flex-col items-end gap-1">
          <StatusBadge status={v.status} />
          {v.fortschritt > 0 && (
            <div className="flex w-full items-center gap-2">
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-line-soft"><div className="h-full rounded-full bg-[#1f5a96]" style={{ width: `${v.fortschritt}%` }} /></div>
              <span className="text-[10.5px] text-muted">{v.fortschritt} %</span>
            </div>
          )}
        </div>
      </div>
      {(andereBereiche.length > 0 || v.pruefen || objekt?.hinweis) && (
        <div className={`mt-1 space-y-[2px] text-[10.5px] ${kompakt ? "" : "pl-[60px]"}`}>
          {andereBereiche.length > 0 && (
            <p className="flex items-center gap-1 text-ink-soft"><Link2 className="h-3 w-3 shrink-0" />Objekt auch in: {andereBereiche.map((b) => <BereichMarke key={b} bereich={b} />)} <span className="text-muted">(eigener Vorgang)</span></p>
          )}
          {(v.pruefen || objekt?.hinweis) && <p className="flex items-start gap-1 text-warn"><CircleAlert className="mt-[1px] h-3 w-3 shrink-0" />{[v.pruefen, objekt?.hinweis].filter(Boolean).join(" ")}</p>}
        </div>
      )}
      {details && (
        <dl className={`mt-1.5 grid gap-x-4 gap-y-[2px] text-[10.5px] text-muted sm:grid-cols-[auto_1fr] ${kompakt ? "" : "pl-[60px]"}`}>
          {v.referenz && <><dt>Referenz</dt><dd className="text-ink-soft">{v.referenz}</dd></>}
          {(v.beteiligte?.length || v.personId || v.unternehmenId) ? (
            <>
              <dt>Beteiligte</dt>
              <dd className="text-ink-soft">
                {[
                  ...(v.personId ? [{ key: v.personId, label: personName(crm.personById(v.personId) ?? { vorname: "?", nachname: "", titel: "" }), href: personHref(v.bereich ?? "kontakt", v.personId), rolle: v.rolle }] : []),
                  ...(v.unternehmenId ? [{ key: v.unternehmenId, label: crm.unternehmenById(v.unternehmenId)?.name ?? "?", href: `/kunden/unternehmen/${v.unternehmenId}`, rolle: v.unternehmenRolle ?? "Beteiligtes Unternehmen" }] : []),
                  ...(v.beteiligte ?? []).map((b) => ({ key: b.id, label: b.art === "person" ? personName(crm.personById(b.id) ?? { vorname: "?", nachname: "", titel: "" }) : crm.unternehmenById(b.id)?.name ?? "?", href: b.art === "person" ? personHref("kontakt", b.id) : `/kunden/unternehmen/${b.id}`, rolle: b.rolle })),
                ].map((b, i) => <span key={b.key + i}>{i > 0 && " · "}<Link href={b.href} className="text-royal-600 hover:underline">{b.label}</Link> ({b.rolle})</span>)}
              </dd>
            </>
          ) : null}
          {v.grund && <><dt>Herkunft</dt><dd>{v.herkunft === "manuell" ? "manuell erfasst" : `abgeleitet aus ${v.grund}`}</dd></>}
        </dl>
      )}
    </li>
  );
}

/** Kurze Erläuterung der drei Ebenen – für die Reiter mit allen Vorgängen */
export function VorgangLegende() {
  return (
    <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-muted">
      Je Eintrag: <BereichMarke bereich="Investment" /><BereichMarke bereich="Property" /><BereichMarke bereich="Projects" /> = Geschäftsbereich des Vorgangs · danach Vorgangsart · „Rolle“ = Funktion dieses Kontakts im Vorgang.
    </p>
  );
}
