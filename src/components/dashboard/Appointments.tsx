"use client";

import { MapPin, Phone, UsersRound, Video, type LucideIcon } from "lucide-react";
import type { TerminArt } from "@/lib/crm/dashboard";
import { useDashboard } from "./useDashboard";
import { MoreLink } from "./MoreLink";

const artIcon: Record<TerminArt, { icon: LucideIcon; label: string }> = {
  video: { icon: Video, label: "Videocall" },
  ort: { icon: MapPin, label: "Vor-Ort-Termin" },
  person: { icon: UsersRound, label: "Persönliches Treffen" },
  telefon: { icon: Phone, label: "Telefontermin" },
};

export function Appointments() {
  const { termine } = useDashboard();
  return (
    <section className="card px-[11px] pb-[6px] pt-[12px]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="whitespace-nowrap font-serif text-[13px] font-semibold tracking-[-0.01em] text-navy-900">Meine nächsten Termine</h2>
        <MoreLink href="/aktivitaeten" />
      </div>
      <ul className="mt-[6px]">
        {termine.map((t, i) => {
          const { icon: Icon, label } = artIcon[t.art];
          return (
            <li key={t.id} className="flex items-center gap-[12px] py-[4px]">
              <div className="flex h-[42px] w-[33px] shrink-0 flex-col items-center justify-center rounded-[5px] bg-line-soft">
                <span className="font-serif text-[15px] font-bold leading-none text-navy-950">{t.tag}</span>
                <span className="mt-[3px] text-[10px] leading-none text-ink-soft">{t.wochentag}</span>
              </div>
              <span className="w-[36px] shrink-0 text-[11px] text-muted">{t.zeit}</span>
              <div className={`min-w-0 flex-1 py-[4px] ${i < termine.length - 1 ? "border-b border-line-soft" : ""}`}>
                <div className="truncate font-serif text-[11.5px] font-semibold text-navy-950">{t.titel}</div>
                <div className="truncate text-[10.5px] text-muted">{t.detail}</div>
              </div>
              <Icon className="h-[17px] w-[17px] shrink-0 text-royal-500" strokeWidth={1.7} aria-label={label} />
            </li>
          );
        })}
        {!termine.length && <li className="py-[6px] text-[11px] text-muted">Keine anstehenden Termine.</li>}
      </ul>
    </section>
  );
}
