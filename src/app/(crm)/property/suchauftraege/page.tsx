import { Suspense } from "react";
import type { Metadata } from "next";
import { SuchauftraegeListe } from "@/components/modul/Suchauftraege";

export const metadata: Metadata = { title: "Property – Suchaufträge" };

export default function Page() {
  return <Suspense><SuchauftraegeListe bereich="Property" /></Suspense>;
}
