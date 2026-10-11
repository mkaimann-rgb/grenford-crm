"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BalkenPunkt } from "@/lib/finanzen/logic";
import { euro } from "@/lib/format";
import { YTick } from "@/components/dashboard/AxisTick";
import type { ReactNode } from "react";

const GREEN = "#16a374";
const BLUE = "#0b2aa0";

function tausend(v: number) {
  return `${(v / 1000).toLocaleString("de-DE", { maximumFractionDigits: 0 })} T€`;
}

function niceMax(values: (number | null)[]) {
  const max = Math.max(0, ...values.map((v) => v ?? 0));
  if (max === 0) return 100_000;
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * step).find((n) => n >= max) ?? 10 * step;
  return nice;
}

function ticks(max: number) {
  return [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.round(max * f));
}

const tooltipStyle = { borderRadius: 8, border: "1px solid #eef0f6", fontSize: 12 };
const formatTooltip = (v: unknown, name: unknown) => [v === null || v === undefined ? "–" : euro(Number(v)), String(name)] as [string, string];

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11.5px] text-fin-text">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <i className="h-[9px] w-[9px] rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function ChartCard({ title, control, children }: { title: string; control: ReactNode; children: ReactNode }) {
  return (
    <section className="card flex min-w-0 flex-col px-[14px] pb-[8px] pt-[10px]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-[15px] font-bold tracking-[-0.01em] text-fin-ink">{title}</h2>
        {control}
      </div>
      {children}
    </section>
  );
}

export function EingangAuszahlungChart({ data, control }: { data: BalkenPunkt[]; control: ReactNode }) {
  const max = niceMax(data.flatMap((d) => [d.eingang, d.auszahlung]));
  return (
    <ChartCard title="Zahlungseingang (Kunden) vs. Auszahlungen (Verbindlichkeiten)" control={control}>
      <div className="mt-[4px] h-[168px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 620, height: 180 }}>
          <BarChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 0 }} barGap={3} barCategoryGap="24%">
            <CartesianGrid stroke="#eef1f7" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10.5, fill: "#6b7ea6" }} />
            <YAxis interval={0} axisLine={false} tickLine={false} width={58} domain={[0, max]} ticks={ticks(max)} tick={(p) => <YTick {...p} format={tausend} />} />
            <Tooltip cursor={{ fill: "#f4f6fb" }} formatter={formatTooltip} contentStyle={tooltipStyle} />
            <Bar dataKey="eingang" name="Zahlungseingang (Kunden)" fill={GREEN} radius={[1, 1, 0, 0]} maxBarSize={13} isAnimationActive={false} />
            <Bar dataKey="auszahlung" name="Auszahlungen (Verbindlichkeiten)" fill={BLUE} radius={[1, 1, 0, 0]} maxBarSize={13} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend items={[{ label: "Zahlungseingang (Kunden)", color: GREEN }, { label: "Auszahlungen (Verbindlichkeiten)", color: BLUE }]} />
    </ChartCard>
  );
}

export function SaldoChart({ data, control }: { data: BalkenPunkt[]; control: ReactNode }) {
  const max = niceMax(data.flatMap((d) => [d.eingang, d.auszahlung]));
  return (
    <ChartCard title="Zahlungssaldo (kumuliert)" control={control}>
      <div className="mt-[4px] h-[168px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 580, height: 180 }}>
          <ComposedChart data={data} margin={{ top: 12, right: 14, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="saldo-green" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity={0.22} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="saldo-blue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7f9be0" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7f9be0" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef1f7" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10.5, fill: "#6b7ea6" }} />
            <YAxis interval={0} axisLine={false} tickLine={false} width={64} domain={[0, max]} ticks={ticks(max)} tick={(p) => <YTick {...p} format={tausend} />} />
            <Tooltip formatter={formatTooltip} contentStyle={tooltipStyle} />
            <Area type="linear" dataKey="eingang" name="Eingang Geld (kumuliert)" stroke="none" fill="url(#saldo-green)" isAnimationActive={false} />
            <Area type="linear" dataKey="auszahlung" name="Auszahlungen (kumuliert)" stroke="none" fill="url(#saldo-blue)" isAnimationActive={false} />
            <Line type="linear" dataKey="eingang" name="Eingang Geld (kumuliert)" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GREEN, strokeWidth: 0 }} isAnimationActive={false} />
            <Line type="linear" dataKey="auszahlung" name="Auszahlungen (kumuliert)" stroke={BLUE} strokeWidth={2} dot={{ r: 3, fill: BLUE, strokeWidth: 0 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <Legend items={[{ label: "Eingang Geld (kumuliert)", color: GREEN }, { label: "Auszahlungen (kumuliert)", color: BLUE }]} />
    </ChartCard>
  );
}
