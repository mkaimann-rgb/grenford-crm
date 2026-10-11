import type { Metadata } from "next";
import { Appointments } from "@/components/dashboard/Appointments";
import { CommissionChart } from "@/components/dashboard/CommissionChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FeaturedProject } from "@/components/dashboard/FeaturedProject";
import { FinanceTabs } from "@/components/dashboard/FinanceTabs";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Tasks } from "@/components/dashboard/Tasks";
import { TopList } from "@/components/dashboard/TopList";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <DashboardHeader />

      <div className="mt-[12px] grid gap-[12px] 2xl:grid-cols-[minmax(0,1fr)_268px]">
        {/* Hauptbereich */}
        <div className="flex min-w-0 flex-col gap-[10px]">
          <KpiCards />
          <div className="grid gap-[10px] xl:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)]">
            <RevenueChart />
            <CommissionChart />
          </div>
          <div className="grid gap-[10px] lg:grid-cols-2 xl:grid-cols-3">
            <TopList title="Top Investment-Deals" href="/investment/projekte" bereich="investment" phaseRight />
            <TopList title="Top Property-Mandate" href="/property/objekte" bereich="property" />
            <TopList title="Top Projects" href="/projects/projekte" bereich="projects" />
          </div>
          <div className="grid gap-[10px] xl:grid-cols-[minmax(0,1.44fr)_minmax(0,1fr)]">
            <FinanceTabs />
            <RecentActivities />
          </div>
        </div>

        {/* Rechte Seitenleiste */}
        <aside className="grid content-start gap-[10px] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-1" aria-label="Termine und Aufgaben">
          <Appointments />
          <Tasks />
          <FeaturedProject />
        </aside>
      </div>
    </div>
  );
}
