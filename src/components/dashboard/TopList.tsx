"use client";

import Image from "next/image";
import { useDashboard } from "./useDashboard";
import { euroMio } from "@/lib/format";
import { MoreLink } from "./MoreLink";

function Progress({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="h-[6px] w-[54px] overflow-hidden rounded-full bg-line-soft" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[#1f5a96]" style={{ width: `${value}%` }} />
      </div>
      <span className="w-[28px] text-right text-[11px] text-muted">{value}%</span>
    </div>
  );
}

/**
 * Top-Liste (Investment-Deals, Property-Mandate, Projects).
 * phaseRight: Phase steht rechts unter dem Volumen (Investment) statt links unter dem Ort.
 */
export function TopList({ title, href, bereich, phaseRight = false }: { title: string; href: string; bereich: "investment" | "property" | "projects"; phaseRight?: boolean }) {
  const entries = useDashboard().top[bereich];
  return (
    <section className="card px-[12px] pb-[4px] pt-[10px]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="card-title">{title}</h2>
        <MoreLink href={href} />
      </div>
      <ul className="mt-[4px] divide-y divide-line-soft">
        {entries.map((e) => (
          <li key={e.id} className="flex items-center gap-[11px] py-[5px]">
            <Image src={e.bild} alt="" width={56} height={46} className="h-[46px] w-[56px] shrink-0 rounded-[4px] object-cover" />
            <div className="min-w-0 flex-1 self-start pt-[1px]">
              <div className="truncate font-serif text-[12px] font-semibold text-navy-950">{e.name}</div>
              <div className="truncate text-[11px] text-muted">{e.ort}</div>
              {!phaseRight && e.phase && <div className="truncate text-[11px] text-muted">{e.phase}</div>}
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <div className="whitespace-nowrap font-serif text-[12.5px] font-bold text-navy-950">{euroMio(e.volumenMio)}</div>
              {phaseRight && e.phase && <div className="whitespace-nowrap text-[11px] text-muted">{e.phase}</div>}
              <div className={phaseRight ? "mt-[2px]" : "mt-[8px]"}>
                <Progress value={e.fortschritt} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
