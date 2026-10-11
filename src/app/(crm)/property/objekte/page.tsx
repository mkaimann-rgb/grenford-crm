import type { Metadata } from "next";
import { MandateListe } from "@/components/property/Mandate";

export const metadata: Metadata = { title: "Property – Objekte & Mandate" };

export default function Page() {
  return <MandateListe />;
}
