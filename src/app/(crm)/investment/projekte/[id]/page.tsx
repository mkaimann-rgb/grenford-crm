import type { Metadata } from "next";
import { InvestmentProjektDetail } from "@/components/investment/Projekte";

export const metadata: Metadata = { title: "Investment-Projekt" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvestmentProjektDetail id={id} />;
}
