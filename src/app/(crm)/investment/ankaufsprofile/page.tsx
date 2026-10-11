import { Suspense } from "react";
import type { Metadata } from "next";
import { AnkaufsprofileListe } from "@/components/investment/Ankaufsprofile";

export const metadata: Metadata = { title: "Investment – Ankaufsprofile" };

export default function Page() {
  return <Suspense><AnkaufsprofileListe /></Suspense>;
}
