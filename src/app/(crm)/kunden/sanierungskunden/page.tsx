import type { Metadata } from "next";
import { PersonenListe } from "@/components/crm/PersonenListe";

export const metadata: Metadata = { title: "Sanierungskunden" };

export default function Page() {
  return <PersonenListe rolle="sanierung" />;
}
