import type { Metadata } from "next";
import { PersonenListe } from "@/components/crm/PersonenListe";

export const metadata: Metadata = { title: "Ansprechpartner" };

export default function Page() {
  return <PersonenListe rolle="kontakt" />;
}
