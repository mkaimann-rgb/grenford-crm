import type { Metadata } from "next";
import { FinanzUebersicht } from "@/components/finanzen/Finanzen";

export const metadata: Metadata = { title: "Finanzen – Übersicht" };

export default function Page() {
  return <FinanzUebersicht />;
}
