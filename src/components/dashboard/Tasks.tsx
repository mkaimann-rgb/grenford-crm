"use client";

import { useState } from "react";
import { useCrm } from "@/lib/crm/store";
import { useDashboard } from "./useDashboard";
import { MoreLink } from "./MoreLink";

export function Tasks() {
  // Erledigt-Status wird in der zentralen Datenbasis gesetzt (wie unter Aktivitäten); abgehakte Aufgaben bleiben bis zum Verlassen der Seite sichtbar.
  const crm = useCrm();
  const [behalten, setBehalten] = useState<string[]>([]);
  const { aufgaben } = useDashboard(behalten);
  const done = Object.fromEntries(aufgaben.map((a) => [a.id, a.erledigt]));
  const setDone = (id: string, wert: boolean) => {
    setBehalten((b) => (b.includes(id) ? b : [...b, id]));
    crm.setzeErledigt(id, wert);
  };
  return (
    <section className="card px-[12px] pb-[8px] pt-[12px]">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[15px] font-semibold text-navy-900">Meine Aufgaben</h2>
        <MoreLink href="/aktivitaeten" />
      </div>
      <ul className="mt-[8px] space-y-[2px]">
        {aufgaben.map((a) => (
          <li key={a.id}>
            <label className="flex cursor-pointer items-center gap-[12px] rounded px-[4px] py-[5px] hover:bg-line-soft/50">
              <input
                type="checkbox"
                checked={!!done[a.id]}
                onChange={(e) => setDone(a.id, e.target.checked)}
                className="h-[14px] w-[14px] shrink-0 rounded-[3px] accent-navy-900"
              />
              <span className={`min-w-0 flex-1 truncate text-[11.5px] ${done[a.id] ? "text-muted line-through" : "text-ink"}`}>{a.titel}</span>
              <span className={`shrink-0 text-[11px] ${a.heute ? "text-neg" : "text-muted"}`}>{a.faellig}</span>
            </label>
          </li>
        ))}
        {!aufgaben.length && <li className="px-[4px] py-[5px] text-[11px] text-muted">Keine offenen Aufgaben.</li>}
      </ul>
    </section>
  );
}
