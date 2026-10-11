import type { Metadata } from "next";
import { UnternehmenListe } from "@/components/crm/UnternehmenListe";

export const metadata: Metadata = { title: "Unternehmen" };

export default function Page() {
  return <UnternehmenListe />;
}
