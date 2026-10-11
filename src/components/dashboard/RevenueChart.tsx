"use client";

import { useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { YTick } from "./AxisTick";
import { useDashboard } from "./useDashboard";

const NAVY = "#0b2d6b";
const SAND = "#d2a77a";

const ranges = ["Monat", "Quartal", "Jahr"] as const;
type Range = (typeof ranges)[number];

function formatTsd(v: number) {
  return v === 0 ? "€ 0" : `€ ${v} Tsd.`;
}

export function RevenueChart() {
  // Monat/Quartal werden mit echten Buchungsdaten befüllt; in Stufe 1 zeigt jede Auswahl die Jahressicht.
  const [range, setRange] = useState<Range>("Jahr");
  const { umsatzentwicklung, aktuellerMonat, umsatzAchse, jahr } = useDashboard();

  return (
    <section className="card flex flex-col px-[14px] pb-[4px] pt-[11px]" aria-labelledby="umsatz-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="umsatz-title" className="card-title">Umsatzentwicklung {jahr}</h2>
        <div className="flex gap-[6px]" role="group" aria-label="Zeitraum">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`focus-ring h-[26px] rounded-[5px] border px-[11px] text-[11.5px] transition-colors ${
                range === r ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-navy-900 hover:bg-line-soft"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-[6px] flex flex-wrap gap-x-7 gap-y-1 text-[11.5px] text-ink-soft">
        <span className="flex items-center gap-2"><i className="h-[9px] w-[9px] rounded-full" style={{ background: NAVY }} />Zahlungseingänge</span>
        <span className="flex items-center gap-2"><i className="h-[9px] w-[9px] rounded-full" style={{ background: SAND }} />Zahlungsausgänge</span>
        <span className="flex items-center gap-2"><i className="w-[18px] border-t-2 border-dashed" style={{ borderColor: NAVY }} />Forecast</span>
      </div>

      <div className="mt-1 h-[160px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 172 }}>
          <ComposedChart data={umsatzentwicklung} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="fill-ein" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#9fc6f8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#9fc6f8" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="fill-aus" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f1d6b8" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#f1d6b8" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef1f6" />
            <XAxis
              dataKey="monat"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={(props) => {
                const { x, y, payload } = props as { x: number; y: number; payload: { value: string } };
                const current = payload.value === aktuellerMonat;
                return (
                  <text x={x} y={y + 12} textAnchor="middle" fontSize={11} fill={current ? "#04205a" : "#2c3b50"} fontWeight={current ? 700 : 400}>
                    {payload.value}
                  </text>
                );
              }}
            />
            <YAxis interval={0} axisLine={false} tickLine={false} width={70} domain={[0, umsatzAchse.max]} ticks={umsatzAchse.ticks} tick={(p) => <YTick {...p} format={formatTsd} />} />
            <Tooltip
              formatter={(v, name) => [formatTsd(Number(v)), name]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e8ebf1", fontSize: 12 }}
            />
            <ReferenceLine x={aktuellerMonat} stroke="#9aa7c2" strokeDasharray="3 3" />
            <Area type="linear" dataKey="forecast" name="Forecast" stroke="none" fill="url(#fill-ein)" isAnimationActive={false} />
            <Area type="linear" dataKey="eingang" name="Zahlungseingänge" stroke="none" fill="url(#fill-ein)" isAnimationActive={false} />
            <Area type="linear" dataKey="ausgang" name="Zahlungsausgänge" stroke="none" fill="url(#fill-aus)" isAnimationActive={false} />
            <Line type="linear" dataKey="ausgang" name="Zahlungsausgänge" stroke={SAND} strokeWidth={2} dot={{ r: 3.5, fill: SAND, strokeWidth: 0 }} isAnimationActive={false} />
            <Line type="linear" dataKey="forecast" name="Forecast" stroke={NAVY} strokeWidth={2} strokeDasharray="6 5" dot={(p) => {
              const { cx, cy, index } = p as { cx: number; cy: number; index: number };
              return index === umsatzentwicklung.length - 1 ? <circle key="fc-end" cx={cx} cy={cy} r={4} fill={NAVY} /> : <g key={`fc-${index}`} />;
            }} isAnimationActive={false} />
            <Line type="linear" dataKey="eingang" name="Zahlungseingänge" stroke={NAVY} strokeWidth={2.4} dot={{ r: 4, fill: NAVY, strokeWidth: 0 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
