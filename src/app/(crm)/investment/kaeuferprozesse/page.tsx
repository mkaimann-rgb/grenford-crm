import type { Metadata } from "next";
import { KaeuferprozesseListe } from "@/components/modul/kaeuferListe";

export const metadata: Metadata = { title: "Investment – Käuferprozesse" };

export default function Page() {
  return <KaeuferprozesseListe bereich="Investment" />;
}
