"use client";

import { useState } from "react";
import { CircleDot, Handshake, Layers, ShieldCheck, Target, TrendingUp, Users } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe } from "@/lib/crm/logic";
import { KAEUFER_STATUS, PHASEN_INVESTMENT, PHASEN_PROPERTY, phaseTitel, type Kaeuferprozess } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { euroCompact, euroMio } from "@/lib/format";
import { Avatar, Badge, StatusBadge } from "@/components/ui/controls";
import { ModulListe } from "./ModulListe";
import { KaeuferprozessModal } from "./kaeufer";
import { FormModal, text } from "./FormModal";
import { NichtGefunden } from "./detail";
import { InvestmentProjektDetail } from "@/components/investment/Projekte";
import { MandatDetail } from "@/components/property/Mandate";

/** Übersicht aller Käuferprozesse eines Geschäftsbereichs (Investment bzw. Property) */
export function KaeuferprozesseListe({ bereich }: { bereich: "Investment" | "Property" }) {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const phasen = bereich === "Investment" ? PHASEN_INVESTMENT : PHASEN_PROPERTY;
  const rows = crm.kaeuferprozesse.filter((k) => k.bereich === bereich);
  const parentTitel = (k: Kaeuferprozess) => {
    if (bereich === "Investment") return crm.investmentProjekte.find((p) => p.id === k.projektId)?.titel ?? k.projektId;
    const m = crm.propertyMandate.find((p) => p.id === k.projektId);
    return m ? crm.objektById(m.objektId)?.titel ?? m.id : k.projektId;
  };
  const href = (k: Kaeuferprozess) => (bereich === "Investment" ? HREF.investKp(k.id) : HREF.propKp(k.id));
  const aktiv = (k: Kaeuferprozess) => k.status === "Aktiv";
  const ids = new Set(rows.map((k) => k.id));
  return (
    <>
      <ModulListe
        crumbs={[{ label: bereich }, { label: "Käuferprozesse" }]}
        titel="Käuferprozesse"
        untertitel={`Alle Käuferprozesse ${bereich === "Investment" ? "zu Investment-Projekten" : "zu Property-Objekten und Mandaten"} – je Käufer ein eigener Vorgang.`}
        neu={{ label: "Neuer Käuferprozess", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(k) => [k.id, k.projektId, crm.refName(k.kaeufer), parentTitel(k), k.typ]}
        suchePlatzhalter="Käuferprozesse suchen …"
        href={href}
        defaultSort={{ key: "kontakt", richtung: "desc" }}
        columns={[
          { key: "id", header: "Käuferprozess", sort: (k) => k.id, cell: (k) => <div className="flex items-center gap-2.5"><Avatar name={crm.refName(k.kaeufer)} size={30} /><div><div className="font-semibold text-navy-950">{crm.refName(k.kaeufer)}</div><div className="text-[10.5px] text-muted">{k.id} · {k.typ}</div>{k.pruefen && <div className="text-[10.5px] text-warn" title={k.pruefen}>Kaufinteressent – prüfen</div>}</div></div> },
          { key: "projekt", header: bereich === "Investment" ? "Projekt" : "Objekt / Mandat", sort: (k) => parentTitel(k), cell: (k) => <div><div className="text-ink">{parentTitel(k)}</div><div className="text-[10.5px] text-muted">{k.projektId}</div></div> },
          { key: "ind", header: "Kaufpreisindikation", sort: (k) => k.indikation, cell: (k) => euroCompact(k.indikation) },
          { key: "w", header: "Wahrscheinlichkeit", sort: (k) => k.wahrscheinlichkeit, cell: (k) => `${k.wahrscheinlichkeit} %` },
          { key: "phase", header: "Phase", sort: (k) => k.phase, cell: (k) => <Badge tone="blue">{phaseTitel(phasen, k.phase)}</Badge> },
          { key: "status", header: "Status", sort: (k) => k.status, cell: (k) => <StatusBadge status={k.status} /> },
          { key: "kontakt", header: "Letzter Kontakt", sort: (k) => k.letzterKontakt, cell: (k) => datumDe(k.letzterKontakt) },
        ]}
        filter={[
          { key: "phase", label: "Phase", wert: (k) => phaseTitel(phasen, k.phase[0]), inBar: true, offen: true },
          { key: "status", label: "Status", wert: (k) => k.status, inBar: true },
          { key: "typ", label: "Käufertyp", wert: (k) => k.typ, inBar: true },
          { key: "projekt", label: bereich === "Investment" ? "Projekt" : "Objekt", wert: (k) => parentTitel(k) },
        ]}
        quick={[
          { id: "", label: "Alle Käuferprozesse", icon: Layers, test: () => true },
          { id: "aktiv", label: "Aktive", icon: CircleDot, test: aktiv },
          { id: "hoch", label: "Wahrscheinlichkeit ≥ 60 %", icon: TrendingUp, test: (k) => aktiv(k) && k.wahrscheinlichkeit >= 60 },
          ...phasen.map((p) => ({ id: `ph-${p.code}`, label: `${p.code} – ${p.titel}`, icon: Target, test: (k: Kaeuferprozess) => k.phase.startsWith(p.code) && aktiv(k) })),
          { id: "gekauft", label: "Gekauft", icon: ShieldCheck, test: (k) => k.status === "Gekauft" },
        ]}
        kpis={[
          { label: "Gesamt", icon: Users, wert: (r) => r.length, sub: "Käuferprozesse", quick: "" },
          { label: "Aktiv", icon: CircleDot, wert: (r) => r.filter(aktiv).length, sub: "in Bearbeitung", quick: "aktiv" },
          { label: "Indikationen (aktiv)", icon: TrendingUp, wert: (r) => euroMio(r.filter(aktiv).reduce((s, k) => s + k.indikation, 0) / 1e6, 1), sub: "Summe Kaufpreisindikationen" },
          { label: "Hohe Wahrscheinlichkeit", icon: Handshake, wert: (r) => r.filter((k) => aktiv(k) && k.wahrscheinlichkeit >= 60).length, sub: "≥ 60 %", quick: "hoch" },
          { label: "Gekauft", icon: ShieldCheck, wert: (r) => r.filter((k) => k.status === "Gekauft").length, sub: "abgeschlossen", quick: "gekauft" },
        ]}
        csv={{ datei: `${bereich.toLowerCase()}-kaeuferprozesse.csv`, kopf: ["Käuferprozess-ID", "Käufer", "Typ", bereich === "Investment" ? "Projekt-ID" : "Mandats-ID", "Objekt/Projekt", "Indikation", "Wahrscheinlichkeit %", "Phase", "Status", "Letzter Kontakt"], zeile: (k) => [k.id, crm.refName(k.kaeufer), k.typ, k.projektId, parentTitel(k), k.indikation, k.wahrscheinlichkeit, phaseTitel(phasen, k.phase), k.status, datumDe(k.letzterKontakt)] }}
        statusAenderung={{ werte: KAEUFER_STATUS, setze: (sel, s) => sel.forEach((id) => { const k = rows.find((x) => x.id === id)!; crm.speichere("kaeuferprozesse", { ...k, status: s as Kaeuferprozess["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "vorgang" && ids.has(b.id)))}
      />
      {neu && <ParentWahl bereich={bereich} onClose={() => setNeu(false)} />}
    </>
  );
}

/** Für einen neuen Käuferprozess zuerst Projekt bzw. Mandat wählen */
function ParentWahl({ bereich, onClose }: { bereich: "Investment" | "Property"; onClose: () => void }) {
  const crm = useCrm();
  const [projektId, setProjektId] = useState<string | null>(null);
  if (projektId) return <KaeuferprozessModal bereich={bereich} projektId={projektId} onClose={onClose} />;
  const optionen = bereich === "Investment"
    ? crm.investmentProjekte.filter((p) => p.status !== "Abgeschlossen").map((p) => ({ value: p.id, label: `${p.id} – ${p.titel}` }))
    : crm.propertyMandate.filter((m) => m.status !== "Abgeschlossen").map((m) => ({ value: m.id, label: `${m.id} – ${crm.objektById(m.objektId)?.titel ?? ""}` }));
  return (
    <FormModal
      titel="Neuer Käuferprozess – Vorgang wählen"
      knopf="Weiter"
      felder={[{ key: "p", label: bereich === "Investment" ? "Investment-Projekt" : "Property-Mandat", typ: "select", pflicht: true, options: optionen, breit: true }]}
      start={{ p: "" }}
      onClose={onClose}
      speichern={(w) => { setProjektId(text(w.p)); return false; }}
    />
  );
}

/** Detailroute eines Käuferprozesses: Projekt- bzw. Mandatsansicht mit ausgewähltem Käuferprozess */
export function KaeuferprozessSeite({ id }: { id: string }) {
  const crm = useCrm();
  const k = crm.kaeuferprozesse.find((x) => x.id === id);
  if (!k) return <NichtGefunden was="Käuferprozess" href="/investment/kaeuferprozesse" />;
  return k.bereich === "Investment" ? <InvestmentProjektDetail id={k.projektId} kaeuferId={k.id} /> : <MandatDetail id={k.projektId} kaeuferId={k.id} />;
}
