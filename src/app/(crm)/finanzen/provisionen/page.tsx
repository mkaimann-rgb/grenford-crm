import type { Metadata } from "next";
import { ProvisionenZahlungen } from "@/components/finanzen/Finanzen";

export const metadata: Metadata = { title: "Finanzen – Provisionen & Zahlungen" };

export default function Page() {
  return <ProvisionenZahlungen />;
}
