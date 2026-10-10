import type { Metadata } from "next";
import { EingangBezahltView } from "@/components/finanzen/EingangBezahltView";

export const metadata: Metadata = { title: "Eingang / Bezahlt" };

export default function EingangBezahltPage() {
  return <EingangBezahltView />;
}
