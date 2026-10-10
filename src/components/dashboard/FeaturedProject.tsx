"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { hervorgehobeneProjekte } from "@/lib/testdata/dashboard";

export function FeaturedProject() {
  const [index, setIndex] = useState(0);
  const p = hervorgehobeneProjekte[index];
  const count = hervorgehobeneProjekte.length;
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <section className="relative overflow-hidden rounded-[10px] bg-[#0a1f45] text-white shadow-card" aria-roledescription="Karussell" aria-label="Hervorgehobene Vorgänge">
      <div className="relative h-[150px]">
        <Image src={p.bild} alt="" fill sizes="270px" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1f45]/20 to-[#0a1f45]" />
      </div>
      <div className="relative -mt-[34px] px-[16px] pb-[14px]">
        <div className="font-serif text-[20px] font-semibold leading-tight">{p.name}</div>
        <div className="mt-[2px] text-[12px] text-white/85">{p.ort}</div>
        <button
          type="button"
          onClick={next}
          className="focus-ring absolute right-[16px] top-[26px] flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white text-navy-900 hover:bg-royal-100"
          aria-label="Nächster Vorgang"
        >
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <div className="mt-[16px] text-[12px] text-white/90">Nächster Schritt</div>
        <div className="font-serif text-[13.5px] font-semibold">{p.naechsterSchritt}</div>
        <div className="mt-[12px] flex items-center gap-3">
          <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-royal-500" style={{ width: `${p.fortschritt}%` }} />
          </div>
          <span className="text-[12px]">{p.fortschritt} %</span>
        </div>
        <div className="mt-[12px] flex items-center gap-[6px] text-[12px]">
          {hervorgehobeneProjekte.map((h, i) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-[8px] w-[8px] rounded-full ${i === index ? "bg-white" : "bg-royal-500"}`}
              aria-label={`${h.name} anzeigen`}
              aria-current={i === index}
            />
          ))}
          <span className="ml-2">{index + 1} / {count}</span>
        </div>
      </div>
    </section>
  );
}
