"use client";

import { useState } from "react";
import { Ellipsis } from "lucide-react";
import type { Beleg } from "@/lib/crm/dashboard";
import { useDashboard } from "./useDashboard";
import { euro } from "@/lib/format";
import { MoreLink } from "./MoreLink";
import { StatusBadge } from "./StatusBadge";

/** Forderungen, Verbindlichkeiten und Zahlungen bleiben getrennte Datensätze – hier nur gemeinsam angezeigt. */
type TabId = "forderungen" | "verbindlichkeiten" | "bezahlt";

const VISIBLE_ROWS = 4;

export function FinanceTabs() {
  const { forderungen, verbindlichkeiten, bezahlt } = useDashboard().belege;
  const tabs: { id: TabId; label: string; count: number; rows: Beleg[]; nrLabel: string; partyLabel: string; href: string }[] = [
    { id: "forderungen", label: "Offene Forderungen", count: forderungen.length, rows: forderungen, nrLabel: "Rechnungs-Nr.", partyLabel: "Kunde / Projekt", href: "/finanzen/forderungen" },
    { id: "verbindlichkeiten", label: "Verbindlichkeiten", count: verbindlichkeiten.length, rows: verbindlichkeiten, nrLabel: "Gutschrift-Nr.", partyLabel: "Partner / Projekt", href: "/finanzen/verbindlichkeiten" },
    { id: "bezahlt", label: "Bezahlt", count: bezahlt.length, rows: bezahlt, nrLabel: "Rechnungs-Nr.", partyLabel: "Kunde / Projekt", href: "/finanzen/eingang-bezahlt" },
  ];
  const [active, setActive] = useState<TabId>("forderungen");
  const tab = tabs.find((t) => t.id === active)!;
  const rows: readonly Beleg[] = tab.rows.slice(0, VISIBLE_ROWS);

  return (
    <section className="card px-[6px] pb-[6px] pt-[8px]">
      <div className="flex items-center justify-between gap-2 px-[4px]">
        <div role="tablist" aria-label="Finanzen" className="flex min-w-0 gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const selected = t.id === active;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setActive(t.id)}
                className={`focus-ring whitespace-nowrap border-b-2 px-[10px] pb-[6px] pt-[4px] font-serif text-[13.5px] transition-colors ${
                  selected
                    ? "border-navy-900 font-semibold text-navy-950"
                    : t.id === "bezahlt"
                      ? "border-transparent text-navy-900 hover:text-navy-950"
                      : "border-transparent font-semibold text-navy-900 hover:text-navy-950"
                }`}
              >
                {t.label} ({t.count})
              </button>
            );
          })}
        </div>
        <span className="pr-2"><MoreLink href={tab.href} /></span>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[11px]" role="tabpanel">
          <thead>
            <tr className="bg-line-soft/70 text-muted">
              <th className="py-[7px] pl-[12px] font-normal">{tab.nrLabel}</th>
              <th className="py-[7px] font-normal">{tab.partyLabel}</th>
              <th className="py-[7px] font-normal">Betrag (netto)</th>
              <th className="py-[7px] font-normal">Fällig am</th>
              <th className="py-[7px] font-normal">Status</th>
              <th className="w-[40px]"><span className="sr-only">Aktionen</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft text-ink">
            {rows.map((r) => (
              <tr key={r.nr} className="hover:bg-line-soft/40">
                <td className="py-[6px] pl-[12px]">{r.nr}</td>
                <td className="py-[6px]">{r.partei}</td>
                <td className="py-[6px]">{euro(r.betrag)}</td>
                <td className="py-[6px]">{r.faellig}</td>
                <td className="py-[6px]"><StatusBadge status={r.status} /></td>
                <td className="py-[6px]">
                  <button type="button" className="focus-ring rounded p-1 text-navy-900 hover:bg-line-soft" aria-label={`Aktionen für ${r.nr}`}>
                    <Ellipsis className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
