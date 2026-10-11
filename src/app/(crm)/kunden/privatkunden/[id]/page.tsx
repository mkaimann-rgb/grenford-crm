import type { Metadata } from "next";
import { PersonDetail } from "@/components/crm/PersonDetail";

export const metadata: Metadata = { title: "Privatkunden" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PersonDetail id={id} rolle="privat" />;
}
