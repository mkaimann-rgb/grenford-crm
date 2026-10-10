import type { Metadata } from "next";
import { UnternehmenDetail } from "@/components/crm/UnternehmenDetail";

export const metadata: Metadata = { title: "Unternehmen" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UnternehmenDetail id={id} />;
}
