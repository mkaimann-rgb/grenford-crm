import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";
import { findNavItem } from "@/lib/navigation";

/** Platzhalter für Menüpunkte, die in späteren Entwicklungsstufen umgesetzt werden. */
export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const match = findNavItem(path);
  const title = match?.item.label ?? (path === "/einstellungen" ? "Einstellungen" : null);
  if (!title) notFound();

  return (
    <div className="mx-auto max-w-[1600px]">
      {match?.section && (
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#596b83]">{match.section.title}</p>
      )}
      <h1 className="mt-[6px] font-serif text-[30px] font-bold text-navy-950">{title}</h1>
      <div className="card mt-6 flex max-w-xl items-start gap-4 p-6">
        <Construction className="h-6 w-6 shrink-0 text-royal-500" strokeWidth={1.7} />
        <div>
          <p className="font-serif text-[16px] font-semibold text-navy-900">Diese Ansicht folgt in einer späteren Entwicklungsstufe.</p>
          <p className="mt-1 text-[13px] text-muted">
            Sie wird nach Ihrer Freigabe des Dashboards auf Basis der zugehörigen GRENFORD-Visualisierung umgesetzt.
          </p>
          <Link href="/dashboard" className="link-more focus-ring mt-4 rounded">
            <ArrowLeft className="h-[13px] w-[13px]" /> Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
