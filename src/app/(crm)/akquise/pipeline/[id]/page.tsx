import type { Metadata } from "next";
import { AkquiseDetail } from "@/components/akquise/Pipeline";

export const metadata: Metadata = { title: "Akquise-Vorgang" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AkquiseDetail id={id} />;
}
