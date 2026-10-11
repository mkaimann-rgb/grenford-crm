import type { Metadata } from "next";
import { PipelineListe } from "@/components/akquise/Pipeline";

export const metadata: Metadata = { title: "Akquise – Pipeline" };

export default function Page() {
  return <PipelineListe />;
}
