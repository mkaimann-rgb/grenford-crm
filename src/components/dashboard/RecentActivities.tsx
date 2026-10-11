"use client";

import { CalendarCheck, FileText, Mail, Phone, type LucideIcon } from "lucide-react";
import type { AktivitaetArt } from "@/lib/crm/dashboard";
import { useDashboard } from "./useDashboard";
import { MoreLink } from "./MoreLink";

const icons: Record<AktivitaetArt, { icon: LucideIcon; color: string }> = {
  email: { icon: Mail, color: "text-royal-500" },
  termin: { icon: CalendarCheck, color: "text-royal-500" },
  dokument: { icon: FileText, color: "text-royal-500" },
  telefon: { icon: Phone, color: "text-neg" },
};

export function RecentActivities() {
  const { letzteAktivitaeten } = useDashboard();
  return (
    <section className="card px-[14px] pb-[6px] pt-[12px]">
      <div className="flex items-center justify-between">
        <h2 className="card-title">Letzte Aktivitäten</h2>
        <MoreLink href="/aktivitaeten" />
      </div>
      <ul className="mt-[6px] divide-y divide-line-soft">
        {letzteAktivitaeten.map((a) => {
          const { icon: Icon, color } = icons[a.art];
          return (
            <li key={a.id} className="flex items-center gap-[14px] py-[6px]">
              <Icon className={`h-[20px] w-[20px] shrink-0 ${color}`} strokeWidth={1.6} />
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold text-navy-950">{a.titel}</div>
                <div className="truncate text-[11px] text-muted">{a.text}</div>
              </div>
              <div className="shrink-0 whitespace-nowrap text-[11px] text-muted">{a.zeit}</div>
              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-royal-100 text-[9px] font-bold text-navy-800">
                {a.von}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
