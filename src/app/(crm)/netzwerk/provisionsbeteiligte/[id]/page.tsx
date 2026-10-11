import type { Metadata } from "next";
import { BeteiligungDetail } from "@/components/netzwerk/Netzwerk";

export const metadata: Metadata = { title: "Provisionsbeteiligung" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BeteiligungDetail id={id} />;
}
