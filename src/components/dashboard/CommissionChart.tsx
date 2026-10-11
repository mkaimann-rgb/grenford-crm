"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { YTick } from "./AxisTick";
import { useDashboard } from "./useDashboard";

const series = [
  { key: "bezahlt", label: "Bezahlt", color: "#0b2d6b" },
  { key: "offen", label: "Offen", color: "#e3cbb4" },
  { key: "erwartet", label: "Erwartet", color: "#a6cdfb" },
] as const;

function formatMio(v: number) {
  return v === 0 ? "€ 0" : `€ ${v.toLocaleString("de-DE", { minimumFractionDigits: 1 })} Mio.`;
}

export function CommissionChart() {
  const { provisionen, provAchse } = useDashboard();
  return (
    <section className="card flex flex-col px-[14px] pb-[4px] pt-[11px]" aria-labelledby="provisionen-title">
      <h2 id="provisionen-title" className="card-title">Provisionen nach Geschäftsbereich</h2>
      <div className="mt-[12px] flex gap-6 text-[11.5px] text-ink-soft">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-2">
            <i className="h-[9px] w-[9px] rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="mt-1 h-[160px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 172 }}>
          <BarChart data={provisionen} margin={{ top: 10, right: 6, bottom: 0, left: 0 }} barGap={7} barCategoryGap="22%">
            <CartesianGrid stroke="#eef1f6" vertical={false} />
            <XAxis dataKey="bereich" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#2c3b50" }} />
            <YAxis interval={0} axisLine={false} tickLine={false} width={66} domain={[0, provAchse.max]} ticks={provAchse.ticks} tick={(p) => <YTick {...p} format={formatMio} />} />
            <Tooltip
              cursor={{ fill: "#f4f6fa" }}
              formatter={(v, name) => [formatMio(Number(v)), name]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e8ebf1", fontSize: 12 }}
            />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
