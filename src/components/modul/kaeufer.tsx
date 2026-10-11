"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ellipsis, Plus } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe } from "@/lib/crm/logic";
import { KAEUFER_STATUS, PHASEN_INVESTMENT, PHASEN_PROPERTY, naechsteNummer, phaseTitel, type Kaeuferprozess, type Phase } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { euroCompact } from "@/lib/format";
import { Avatar, Menu, StatusBadge } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { InfoList, Panel } from "@/components/crm/page";
import { FormModal, refAus, text, zahl, type Feld } from "./FormModal";
import { KommunikationPanel, TESTMODUS, bezugVorgang } from "./detail";

export const KAEUFER_TYPEN = ["Institutionell", "Family Office", "Family Office (NDA)", "Privater Investor", "Eigennutzer", "Institutionell (NDA)", "Projektentwickler"];

/** Käuferprozesse eines Investment-Projekts bzw. Property-Mandats – jeder ein eigener Vorgang */
export function KaeuferprozessListe({ prozesse, phasen, auswahl, onWahl, onNeu }: { prozesse: Kaeuferprozess[]; phasen: Phase[]; auswahl?: string; onWahl: (id: string) => void; onNeu: () => void }) {
  const crm = useCrm();
  return (
    <Panel titel={`Käuferprozesse (${prozesse.length})`} aktion={<button type="button" onClick={onNeu} className="link-more"><Plus className="h-3.5 w-3.5" />Neuer Käuferprozess</button>}>
      <ul className="divide-y divide-line-soft">
        {prozesse.map((k) => {
          const name = crm.refName(k.kaeufer);
          return (
            <li key={k.id}>
              <button type="button" onClick={() => onWahl(k.id)} aria-pressed={auswahl === k.id} className={`focus-ring flex w-full items-center gap-3 rounded px-1 py-2 text-left ${auswahl === k.id ? "bg-royal-100/60" : "hover:bg-line-soft"}`}>
                <Avatar name={name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-navy-900">{k.id}</div>
                  <div className="truncate text-[12px] font-semibold text-navy-950">{name}</div>
                  <div className="truncate text-[10.5px] text-muted">{k.typ}</div>
                </div>
                <span className="rounded-[4px] bg-neg-bg px-1.5 py-[2px] text-[11px] font-bold text-neg" title={phaseTitel(phasen, k.phase)}>{k.phase}</span>
                <span className="w-[62px] text-right text-[11.5px]">{euroCompact(k.indikation)}</span>
                <span className="w-[36px] text-right text-[11.5px]">{k.wahrscheinlichkeit} %</span>
              </button>
            </li>
          );
        })}
        {!prozesse.length && <li className="py-3 text-[12px] text-muted">Noch kein Käuferprozess – ein Projekt kann mehrere unabhängige Käuferprozesse haben.</li>}
      </ul>
    </Panel>
  );
}

/** Detail eines Käuferprozesses: eigene Kennzahlen, Phase, Kommunikation */
export function KaeuferprozessDetail({ k, phasen, objektTitel }: { k: Kaeuferprozess; phasen: Phase[]; objektTitel: string }) {
  const crm = useCrm();
  const router = useRouter();
  const toast = useToast();
  const [bearbeiten, setBearbeiten] = useState(false);
  const name = crm.refName(k.kaeufer);
  const speichern = (neu: Kaeuferprozess, text: string) => {
    crm.speichere("kaeuferprozesse", neu, { ref: k.id, text });
    toast(`${text} ${TESTMODUS}`);
  };
  const an = [k.kaeufer.art === "person" ? k.kaeufer : undefined, k.ansprechpartnerId ? { art: "person" as const, id: k.ansprechpartnerId } : undefined].filter(Boolean) as { art: "person"; id: string }[];
  return (
    <div className="space-y-[12px]">
      <Panel
        titel={`Käuferprozess: ${name} (${k.id})`}
        aktion={
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] bg-neg-bg px-1.5 py-[2px] text-[11px] font-bold text-neg">{k.phase}</span>
            <Menu
              label="Käuferprozess-Aktionen"
              items={[
                { label: "Bearbeiten", onClick: () => setBearbeiten(true) },
                ...KAEUFER_STATUS.filter((s) => s !== k.status).map((s) => ({ label: `Status „${s}“`, onClick: () => speichern({ ...k, status: s }, `Status ${k.id} → ${s}`) })),
                { label: "Detailseite öffnen", onClick: () => router.push(k.bereich === "Investment" ? HREF.investKp(k.id) : HREF.propKp(k.id)) },
              ]}
              trigger={<Ellipsis className="h-4 w-4 text-navy-900" />}
            />
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 border-b border-line-soft pb-2 text-[11.5px] sm:grid-cols-5">
          {[["Käufer", name], ["Typ", k.typ], ["Zielkaufpreis", euroCompact(k.indikation)], ["Wahrscheinl.", `${k.wahrscheinlichkeit} %`], ["Letzter Kontakt", datumDe(k.letzterKontakt)]].map(([l, w]) => (
            <div key={l} className="min-w-0"><div className="truncate text-muted" title={l}>{l}</div><div className="truncate text-ink" title={w}>{w}</div></div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px]">
          <span className="text-muted">Phase:</span>
          <select aria-label="Phase des Käuferprozesses" value={k.phase} onChange={(e) => speichern({ ...k, phase: e.target.value, letzterKontakt: crm.heute }, `Phase ${k.id} → ${phaseTitel(phasen, e.target.value)}`)} className="focus-ring h-[28px] rounded-[6px] border border-line px-2">
            {phasen.flatMap((p) => p.unter.map((u) => <option key={u.code} value={u.code}>{u.code} – {u.titel}</option>))}
          </select>
          <span className="text-muted">Status:</span><StatusBadge status={k.status} />
          {k.suchauftragId && <span className="text-muted">aus Suchauftrag <Link className="text-royal-600 hover:underline" href={k.bereich === "Investment" ? HREF.suchI(k.suchauftragId) : HREF.suchP(k.suchauftragId)}>{k.suchauftragId}</Link></span>}
        </div>
      </Panel>
      <KommunikationPanel titel="Kommunikation" an={an} betreff={`Update ${objektTitel}`} bezug={bezugVorgang(k.id, k.projektId)} dateiRef={k.id} />
      {bearbeiten && <KaeuferprozessModal bereich={k.bereich} projektId={k.projektId} initial={k} onClose={() => setBearbeiten(false)} />}
    </div>
  );
}

export function KaeuferprozessModal({ bereich, projektId, initial, onClose }: { bereich: "Investment" | "Property"; projektId: string; initial?: Kaeuferprozess; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const phasen = bereich === "Investment" ? PHASEN_INVESTMENT : PHASEN_PROPERTY;
  const felder: Feld[] = [
    { key: "kaeufer", label: bereich === "Investment" ? "Käufer / Investor (aus Stammdaten)" : "Kaufinteressent (aus Stammdaten)", typ: "ref", pflicht: true, breit: true },
    { key: "ansprechpartnerId", label: "Ansprechpartner", typ: "person" },
    { key: "typ", label: "Typ", typ: "select", pflicht: true, options: KAEUFER_TYPEN },
    { key: "indikation", label: "Kaufpreisindikation (€)", typ: "zahl", pflicht: true },
    { key: "wahrscheinlichkeit", label: "Wahrscheinlichkeit (%)", typ: "zahl", pflicht: true },
    { key: "phase", label: "Bearbeitungsphase / Unterphase", typ: "select", pflicht: true, options: phasen.flatMap((p) => p.unter.map((u) => ({ value: u.code, label: `${u.code} – ${u.titel} (${p.titel})` }))) },
  ];
  return (
    <FormModal
      titel={initial ? `Käuferprozess ${initial.id} bearbeiten` : "Neuer Käuferprozess"}
      hinweis={`Ein Käuferprozess ist ein eigener Vorgang zum ${bereich === "Investment" ? "Investment-Projekt" : "Property-Mandat"} ${projektId} – nicht zu verwechseln mit dem Projekt selbst. Käufer werden aus den Stammdaten gewählt.`}
      felder={felder}
      start={{ kaeufer: initial ? `${initial.kaeufer.art}:${initial.kaeufer.id}` : "", ansprechpartnerId: initial?.ansprechpartnerId ?? "", typ: initial?.typ ?? "", indikation: initial ? String(initial.indikation) : "", wahrscheinlichkeit: initial ? String(initial.wahrscheinlichkeit) : "20", phase: initial?.phase ?? `${phasen[0].code}1` }}
      pruefen={(w) => {
        const e: Record<string, string> = {};
        const r = refAus(w.kaeufer);
        if (r && crm.kaeuferprozesse.some((k) => k.projektId === projektId && k.id !== initial?.id && k.kaeufer.id === r.id && k.status !== "Abgesagt")) e.kaeufer = "Für diesen Käufer besteht bereits ein aktiver Käuferprozess zu diesem Vorgang.";
        const p = zahl(w.wahrscheinlichkeit);
        if (p < 0 || p > 100) e.wahrscheinlichkeit = "0 bis 100";
        return e;
      }}
      onClose={onClose}
      speichern={(w) => {
        const prefix = bereich === "Investment" ? "INV-OPT-" : "PROP-OPT-";
        const id = initial?.id ?? naechsteNummer(prefix, crm.kaeuferprozesse.map((k) => k.id), 4);
        crm.speichere("kaeuferprozesse", {
          ...(initial ?? { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, status: "Aktiv" as const, letzterKontakt: crm.heute }),
          id, bereich, projektId, kaeufer: refAus(w.kaeufer)!, ansprechpartnerId: text(w.ansprechpartnerId) || undefined, typ: text(w.typ), indikation: zahl(w.indikation), wahrscheinlichkeit: zahl(w.wahrscheinlichkeit), phase: text(w.phase),
        }, { ref: projektId, text: initial ? `Käuferprozess ${id} geändert` : `Käuferprozess ${id} angelegt (${crm.refName(refAus(w.kaeufer))})` });
        toast(`Käuferprozess ${id} ${initial ? "gespeichert" : "angelegt"} ${TESTMODUS}`);
      }}
    />
  );
}

/** Projektinformationen als Liste */
export function InfoPanel({ titel, rows, onBearbeiten }: { titel: string; rows: [string, ReactNode][]; onBearbeiten?: () => void }) {
  return (
    <Panel titel={titel} aktion={onBearbeiten && <button type="button" onClick={onBearbeiten} className="link-more">Bearbeiten</button>}>
      <InfoList rows={rows} />
    </Panel>
  );
}
