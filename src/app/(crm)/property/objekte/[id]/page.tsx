import type { Metadata } from "next";
import { MandatDetail } from "@/components/property/Mandate";

export const metadata: Metadata = { title: "Property-Mandat" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MandatDetail id={id} />;
}
