import { CircleArrowDown, CircleArrowUp, Clock, FileText, type LucideIcon } from "lucide-react";
import { euro } from "@/lib/format";

type Kpi = {
  label: string;
  value: number;
  sub: string;
  icon: LucideIcon;
  iconClass: string;
  labelClass: string;
  valueClass: string;
  delta?: { pct: number; tone: "green" | "blue" } | null;
  hint: string;
};

function KpiCard({ k }: { k: Kpi }) {
  const Icon = k.icon;
  return (
    <div className="card relative flex items-start gap-[18px] px-[14px] xl:gap-[12px] 2xl:gap-[18px] pb-[12px] pt-[14px]" title={k.hint}>
      <Icon className={`mt-[2px] h-[46px] w-[46px] shrink-0 xl:h-[38px] xl:w-[38px] 2xl:h-[46px] 2xl:w-[46px] ${k.iconClass}`} strokeWidth={1.5} />
      <div className="min-w-0 pt-[1px]">
        <div className={`text-[12px] font-medium ${k.labelClass}`}>{k.label}</div>
        <div className={`mt-[7px] whitespace-nowrap font-serif text-[26px] font-bold xl:text-[22px] 2xl:text-[26px] leading-none tracking-[-0.01em] ${k.valueClass}`}>
          {euro(k.value)}
        </div>
        <div className="mt-[9px] text-[12px] text-fin-muted">{k.sub}</div>
        {k.delta && (
          // Mittlere Desktop-Breiten: kompakt unter der Anzahl, damit nichts den Betrag überdeckt
          <div
            className={`mt-[6px] hidden rounded-[4px] px-[7px] py-[1px] text-[11px] font-medium xl:inline-block 2xl:hidden ${
              k.delta.tone === "green" ? "bg-fin-green-bg text-[#2a7f60]" : "bg-fin-blue-bg text-fin-blue"
            }`}
          >
            {k.delta.pct >= 0 ? "+" : "−"}
            {Math.abs(k.delta.pct)} % <span className="font-normal text-fin-muted">vs. Vorjahr</span>
          </div>
        )}
      </div>
      {k.delta && (
        <div
          className={`absolute bottom-[12px] right-[14px] rounded-[6px] xl:hidden 2xl:block px-[11px] py-[6px] text-center ${
            k.delta.tone === "green" ? "bg-fin-green-bg text-[#2a7f60]" : "bg-fin-blue-bg text-fin-blue"
          }`}
        >
          <div className="text-[13px] font-medium">
            {k.delta.pct >= 0 ? "+" : "−"}
            {Math.abs(k.delta.pct)} %
          </div>
          <div className="text-[8.5px] text-fin-muted">vs. Vorjahr</div>
        </div>
      )}
    </div>
  );
}

export function FinanzKpis({
  eingang,
  auszahlung,
  offen,
  ueberfaellig,
  stichtag,
}: {
  eingang: { summe: number; anzahl: number; deltaPct: number | null };
  auszahlung: { summe: number; anzahl: number; deltaPct: number | null; provisionen: number };
  offen: { summe: number; anzahl: number };
  ueberfaellig: { summe: number; anzahl: number };
  stichtag: string;
}) {
  const zahlungen = (n: number) => `${n} ${n === 1 ? "Zahlung" : "Zahlungen"}`;
  const rechnungen = (n: number) => `${n} ${n === 1 ? "Rechnung" : "Rechnungen"}`;
  const kpis: Kpi[] = [
    {
      label: "Eingang Geld (Kunden)",
      value: eingang.summe,
      sub: zahlungen(eingang.anzahl),
      icon: CircleArrowDown,
      iconClass: "text-fin-green",
      labelClass: "text-[#2f7d62]",
      valueClass: "text-fin-green",
      delta: eingang.deltaPct === null ? null : { pct: eingang.deltaPct, tone: "green" },
      hint: "Summe der tatsächlich eingegangenen Kundenzahlungen im gewählten Zeitraum",
    },
    {
      label: "Bezahlt Verbindlichkeiten",
      value: auszahlung.summe,
      sub: zahlungen(auszahlung.anzahl),
      icon: CircleArrowUp,
      iconClass: "text-fin-blue",
      labelClass: "text-fin-blue",
      valueClass: "text-fin-blue",
      delta: auszahlung.deltaPct === null ? null : { pct: auszahlung.deltaPct, tone: "blue" },
      hint: `Summe der tatsächlich geleisteten Auszahlungen auf alle Verbindlichkeiten im gewählten Zeitraum – davon Provisionen und Empfehlungsprovisionen ${euro(auszahlung.provisionen)}`,
    },
    {
      label: "Offen aus Forderungen",
      value: offen.summe,
      sub: rechnungen(offen.anzahl),
      icon: FileText,
      iconClass: "text-[#2e3d64]",
      labelClass: "text-fin-blue",
      valueClass: "text-[#27366f]",
      hint: `Noch nicht bezahlte, noch nicht fällige Restbeträge – Stand ${stichtag}. Nicht in den Zahlungseingängen enthalten.`,
    },
    {
      label: "Überfällig aus Forderungen",
      value: ueberfaellig.summe,
      sub: rechnungen(ueberfaellig.anzahl),
      icon: Clock,
      iconClass: "text-fin-orange",
      labelClass: "text-[#a3283a]",
      valueClass: "text-fin-red",
      hint: `Noch nicht bezahlte Restbeträge mit überschrittenem Fälligkeitsdatum – Stand ${stichtag}. Nicht in den Zahlungseingängen enthalten.`,
    },
  ];
  return (
    <section aria-label="Kennzahlen" className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => (
        <KpiCard key={k.label} k={k} />
      ))}
    </section>
  );
}
