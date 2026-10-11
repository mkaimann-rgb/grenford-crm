import { Suspense } from "react";
import type { Metadata } from "next";
import { InteressentenListe } from "@/components/property/Interessenten";

export const metadata: Metadata = { title: "Property – Interessenten" };

export default function Page() {
  return <Suspense><InteressentenListe /></Suspense>;
}
