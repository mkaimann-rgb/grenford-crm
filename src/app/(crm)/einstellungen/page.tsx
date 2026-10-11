import { Suspense } from "react";
import type { Metadata } from "next";
import { EinstellungenSeite } from "@/components/einstellungen/Einstellungen";

export const metadata: Metadata = { title: "Einstellungen" };

export default function Page() {
  return (
    <Suspense>
      <EinstellungenSeite />
    </Suspense>
  );
}
