import type { Metadata } from "next";
import { MandateListeProjects } from "@/components/projects/Projekte";

export const metadata: Metadata = { title: "Projects – Mandate" };

export default function Page() {
  return <MandateListeProjects />;
}
