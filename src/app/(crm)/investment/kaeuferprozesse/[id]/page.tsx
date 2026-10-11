import type { Metadata } from "next";
import { KaeuferprozessSeite } from "@/components/modul/kaeuferListe";

export const metadata: Metadata = { title: "Käuferprozess" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KaeuferprozessSeite id={id} />;
}
