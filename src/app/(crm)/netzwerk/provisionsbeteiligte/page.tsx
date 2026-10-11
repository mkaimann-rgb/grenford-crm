import type { Metadata } from "next";
import { ProvisionsbeteiligteListe } from "@/components/netzwerk/Netzwerk";

export const metadata: Metadata = { title: "Netzwerk – Provisionsbeteiligte" };

export default function Page() {
  return <ProvisionsbeteiligteListe />;
}
