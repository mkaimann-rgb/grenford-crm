"use client";

import { CircleAlert } from "lucide-react";
import { bereichsHinweise, ergaenzeBereiche, type Ableitung } from "@/lib/crm/bereiche";
import type { BereichsZuordnung } from "@/lib/crm/types";
import { BereichBadges } from "@/components/ui/controls";

/**
 * Geschäftsbereiche direkt unter dem Namen auf Detailseiten –
 * bewusst getrennt von Kundenrollen und fachlichen Rollen.
 * Zeigt außerdem Prüfhinweise und Bereiche, die sich aus aktuellen Beziehungen ergeben.
 */
export function BereichZeile({
  bereiche,
  pruefen,
  abgeleitet,
  onSpeichern,
  onBearbeiten,
}: {
  bereiche: BereichsZuordnung[];
  pruefen?: string;
  abgeleitet: Ableitung[];
  onSpeichern: (neu: BereichsZuordnung[], msg: string) => void;
  onBearbeiten: () => void;
}) {
  const fehlend = bereichsHinweise(bereiche, abgeleitet);
  return (
    <div className="mt-2" data-testid="bereichzeile">
      <div className="flex flex-wrap items-center gap-[6px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Geschäftsbereich</span>
        <BereichBadges bereiche={bereiche} pruefen={pruefen} />
        <button type="button" onClick={onBearbeiten} className="focus-ring rounded px-1 text-[11px] text-navy-800 underline-offset-2 hover:underline">bearbeiten</button>
      </div>
      {pruefen && (
        <p className="mt-1 flex items-start gap-1 text-[11px] text-warn"><CircleAlert className="mt-[1px] h-3.5 w-3.5 shrink-0" />Zuordnung prüfen: {pruefen}</p>
      )}
      {fehlend.length > 0 && (
        <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-ink-soft">
          <CircleAlert className="h-3.5 w-3.5 text-navy-800" />
          Laut aktuellen Beziehungen ebenfalls relevant: {fehlend.map((f) => `${f.bereich} (${f.grund})`).join("; ")}
          <button
            type="button"
            className="focus-ring rounded font-semibold text-navy-800 hover:underline"
            onClick={() => onSpeichern(ergaenzeBereiche(bereiche, fehlend), `Bereich ${fehlend.map((f) => f.bereich).join(", ")} übernommen`)}
          >
            übernehmen
          </button>
        </p>
      )}
    </div>
  );
}
