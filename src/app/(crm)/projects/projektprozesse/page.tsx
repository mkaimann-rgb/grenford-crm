import type { Metadata } from "next";
import { ProjekteListeProjects } from "@/components/projects/Projekte";

export const metadata: Metadata = { title: "Projects – Projektprozesse" };

export default function Page() {
  return <ProjekteListeProjects prozessAnsicht />;
}
