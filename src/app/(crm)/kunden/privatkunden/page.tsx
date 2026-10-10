import type { Metadata } from "next";
import { PersonenListe } from "@/components/crm/PersonenListe";

export const metadata: Metadata = { title: "Privatkunden" };

export default function Page() {
  return <PersonenListe rolle="privat" />;
}
