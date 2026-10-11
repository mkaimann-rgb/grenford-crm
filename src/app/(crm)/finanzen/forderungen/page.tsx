import { Suspense } from "react";
import type { Metadata } from "next";
import { ForderungenSeite } from "@/components/finanzen/Finanzen";

export const metadata: Metadata = { title: "Finanzen – Forderungen" };

export default function Page() {
  return <Suspense><ForderungenSeite /></Suspense>;
}
