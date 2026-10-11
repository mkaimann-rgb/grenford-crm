import { Suspense } from "react";
import type { Metadata } from "next";
import { VerbindlichkeitenSeite } from "@/components/finanzen/Finanzen";

export const metadata: Metadata = { title: "Finanzen – Verbindlichkeiten" };

export default function Page() {
  return <Suspense><VerbindlichkeitenSeite /></Suspense>;
}
