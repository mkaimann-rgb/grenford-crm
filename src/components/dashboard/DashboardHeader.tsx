import { CalendarDays, ChevronDown, Ellipsis, Plus } from "lucide-react";
import { testUser } from "@/lib/testdata/dashboard";
import { Greeting } from "./Greeting";

const actions = ["Neuer Kunde", "Neues Projekt", "Neue Aktivität", "Neue Notiz"];

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#596b83]">Grenford CRM Lightning v7.3</p>
          <span className="rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold uppercase tracking-[0.12em] text-warn" title="Alle angezeigten Daten sind fiktive Testdaten">
            Testdaten
          </span>
        </div>
        <h1 className="mt-[4px] font-serif text-[30px] font-bold leading-[1.1] tracking-[-0.015em] text-navy-950 md:text-[31px]">
          <Greeting name={testUser.firstName} />
        </h1>
        <p className="mt-[4px] font-serif text-[15.5px] text-muted-soft">Hier ist Ihr aktueller Überblick zu allen GRENFORD-Aktivitäten.</p>
      </div>

      <div className="flex flex-wrap items-center gap-[10px] 2xl:pt-[0px]">
        {actions.map((a) => (
          <button
            key={a}
            type="button"
            className="focus-ring flex h-[36px] items-center gap-[9px] rounded-[6px] border border-line bg-white px-[13px] text-[11px] text-navy-900 shadow-card hover:bg-line-soft"
          >
            <Plus className="h-[14px] w-[14px]" strokeWidth={2} />
            {a}
          </button>
        ))}
        <button type="button" className="focus-ring flex h-[36px] w-[46px] items-center justify-center rounded-[6px] border border-line bg-white text-navy-900 shadow-card hover:bg-line-soft" aria-label="Weitere Aktionen">
          <Ellipsis className="h-4 w-4" strokeWidth={2.4} />
        </button>
        <button type="button" className="focus-ring ml-0 flex h-[36px] items-center gap-[10px] whitespace-nowrap rounded-[6px] border border-line bg-white px-[12px] text-[11.5px] font-medium text-navy-950 shadow-card hover:bg-line-soft 2xl:ml-[8px] 2xl:w-[150px]">
          <CalendarDays className="h-[17px] w-[17px] text-navy-900" strokeWidth={1.7} />
          Oktober 2026
          <ChevronDown className="ml-auto h-4 w-4 text-navy-900" />
        </button>
      </div>
    </div>
  );
}
