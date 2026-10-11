import type { Metadata } from "next";
import { InvestmentProjekteListe } from "@/components/investment/Projekte";

export const metadata: Metadata = { title: "Investment – Projekte" };

export default function Page() {
  return <InvestmentProjekteListe />;
}
