import type { Metadata } from "next";
import { ProjektDetail } from "@/components/projects/Projekte";

export const metadata: Metadata = { title: "Projects-Projekt" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjektDetail id={id} />;
}
