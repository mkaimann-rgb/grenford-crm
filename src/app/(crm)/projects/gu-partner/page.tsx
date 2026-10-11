import { Suspense } from "react";
import type { Metadata } from "next";
import { GUPartnerListe } from "@/components/projects/GUPartner";

export const metadata: Metadata = { title: "Projects – GU-Partner" };

export default function Page() {
  return <Suspense><GUPartnerListe /></Suspense>;
}
