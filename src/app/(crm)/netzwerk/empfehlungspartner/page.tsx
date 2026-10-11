import { Suspense } from "react";
import type { Metadata } from "next";
import { EmpfehlungspartnerListe } from "@/components/netzwerk/Netzwerk";

export const metadata: Metadata = { title: "Netzwerk – Empfehlungspartner" };

export default function Page() {
  return <Suspense><EmpfehlungspartnerListe /></Suspense>;
}
