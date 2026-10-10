import { ArrowDownRight, ArrowUpRight, ChartColumn, ChartNoAxesColumnIncreasing, Coins, Layers, ReceiptText, type LucideIcon } from "lucide-react";
import { kpis } from "@/lib/testdata/dashboard";
import { euroCompact } from "@/lib/format";
import { Sparkline } from "./Sparkline";

type Tone = "navy" | "sand" | "royal";

const toneStyles: Record<Tone, { tile: string; icon: string }> = {
  navy: { tile: "bg-pos-bg/70", icon: "text-navy-900" },
  sand: { tile: "bg-warn-bg", icon: "text-warn" },
  royal: { tile: "bg-royal-100", icon: "text-royal-500" },
};

function IconTile({ icon: Icon, tone }: { icon: LucideIcon; tone: Tone }) {
  return (
    <div className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] ${toneStyles[tone].tile}`}>
      <Icon className={`h-[24px] w-[24px] ${toneStyles[tone].icon}`} strokeWidth={1.6} />
    </div>
  );
}

function TrendKpi({
  label,
  value,
  deltaPct,
  trend,
  icon,
  tone,
  sparkColor,
  id,
}: {
  label: string;
  value: number;
  deltaPct: number;
  trend: number[];
  icon: LucideIcon;
  tone: Tone;
  sparkColor: string;
  id: string;
}) {
  const up = deltaPct >= 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="card flex flex-col px-[12px] pb-[8px] pt-[12px]">
      <div className="flex gap-[14px]">
        <IconTile icon={icon} tone={tone} />
        <div className="min-w-0">
          <div className="font-serif text-[13.5px] text-ink">{label}</div>
          <div className="mt-[6px] whitespace-nowrap font-serif text-[24px] font-bold leading-none tracking-[-0.01em] text-navy-950">
            {euroCompact(value)}
          </div>
        </div>
      </div>
      <div className="mt-[6px] flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <Sparkline data={trend} color={sparkColor} id={id} />
        </div>
        <ChartNoAxesColumnIncreasing className="mb-[2px] h-[14px] w-[14px] shrink-0 text-navy-800" strokeWidth={2.4} />
        <div className="shrink-0 text-right">
          <div className={`flex items-center justify-end gap-0.5 text-[14px] font-medium ${up ? "text-pos" : "text-neg"}`}>
            <Arrow className="h-[16px] w-[16px]" strokeWidth={2} />
            {up ? "+" : "-"} {Math.abs(deltaPct)} %
          </div>
          <div className="text-[12px] text-muted">vs. Vorjahr</div>
        </div>
      </div>
    </div>
  );
}

export function KpiCards() {
  const { umsatzYtd, offeneForderungen, pipeline, aktiveVorgaenge } = kpis;
  const { investment, property, projects } = aktiveVorgaenge.split;
  const total = aktiveVorgaenge.value;
  return (
    <section aria-label="Kennzahlen" className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
      <TrendKpi {...umsatzYtd} icon={Coins} tone="navy" sparkColor="#2d9a5f" id="spark-umsatz" />
      <TrendKpi {...offeneForderungen} icon={ReceiptText} tone="sand" sparkColor="#dc2f2f" id="spark-forderungen" />
      <TrendKpi {...pipeline} icon={ChartColumn} tone="royal" sparkColor="#2f7be0" id="spark-pipeline" />

      <div className="card flex flex-col px-[12px] pb-[8px] pt-[12px]">
        <div className="flex gap-[14px]">
          <IconTile icon={Layers} tone="royal" />
          <div>
            <div className="font-serif text-[13.5px] text-ink">{aktiveVorgaenge.label}</div>
            <div className="mt-[6px] font-serif text-[24px] font-bold leading-none text-navy-950">{total}</div>
          </div>
        </div>
        <div className="mt-auto pt-3">
          <div className="flex h-[10px] overflow-hidden rounded-full bg-line-soft" role="img" aria-label={`Investment ${investment}, Property ${property}, Projects ${projects}`}>
            <div className="bg-navy-800" style={{ width: `${(investment / total) * 100}%` }} />
            <div className="bg-royal-500" style={{ width: `${(property / total) * 100}%` }} />
            <div className="bg-royal-300" style={{ width: `${(projects / total) * 100}%` }} />
          </div>
          <div className="mt-[10px] flex flex-wrap gap-x-[10px] gap-y-1 whitespace-nowrap text-[10px] text-ink-soft">
            <span className="flex items-center gap-1"><i className="h-[6px] w-[6px] rounded-full bg-navy-800" />Investment <b className="font-semibold text-navy-900">{investment}</b></span>
            <span className="flex items-center gap-1"><i className="h-[6px] w-[6px] rounded-full bg-royal-500" />Property <b className="font-semibold text-navy-900">{property}</b></span>
            <span className="flex items-center gap-1"><i className="h-[6px] w-[6px] rounded-full bg-royal-300" />Projects <b className="font-semibold text-navy-900">{projects}</b></span>
          </div>
        </div>
      </div>
    </section>
  );
}
