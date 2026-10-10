"use client";

import { useState } from "react";
import { aufgaben } from "@/lib/testdata/dashboard";
import { MoreLink } from "./MoreLink";

export function Tasks() {
  // Erledigt-Status nur lokal im Browser (Testmodus) – wird später in der Datenbank gespeichert.
  const [done, setDone] = useState<Record<string, boolean>>({});
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
                onChange={(e) => setDone((d) => ({ ...d, [a.id]: e.target.checked }))}
                className="h-[14px] w-[14px] shrink-0 rounded-[3px] accent-navy-900"
              />
              <span className={`min-w-0 flex-1 truncate text-[11.5px] ${done[a.id] ? "text-muted line-through" : "text-ink"}`}>{a.titel}</span>
              <span className={`shrink-0 text-[11px] ${a.heute ? "text-neg" : "text-muted"}`}>{a.faellig}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
