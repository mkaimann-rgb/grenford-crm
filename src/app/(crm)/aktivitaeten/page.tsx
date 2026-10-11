import type { Metadata } from "next";
import { Suspense } from "react";
import { AktivitaetenSeite } from "@/components/crm/AktivitaetenSeite";

export const metadata: Metadata = { title: "Aktivitäten" };

export default function Page() {
  return (
    <Suspense>
      <AktivitaetenSeite />
    </Suspense>
  );
}
