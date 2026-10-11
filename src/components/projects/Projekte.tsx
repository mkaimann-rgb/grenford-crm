"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Building2, CircleDot, ClipboardCheck, Database, FileSearch, FolderOpen, Hammer, Home, Layers, MapPin, Search, ShieldCheck, Wallet } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe } from "@/lib/crm/logic";
import {
  ANGEBOT_STATUS, PHASEN_PROJECTS, PMANDAT_STATUS, PROJEKT_STATUS, anonymisiere, angebotsvergleich, phaseTitel, phasenIndex, projectsVerguetung,
  type Angebot, type ProjectsMandat, type ProjectsProjekt,
  vergabeErzeugtVerbindlichkeit,
} from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { euro, euroCompact, euroMio } from "@/lib/format";
import { Avatar, Badge, Button, Menu, StatusBadge } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { InfoList, Panel } from "@/components/crm/page";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, refAus, refZu, text, zahl, type Feld } from "@/components/modul/FormModal";
import {
  AufgabenPanel, BeteiligtePanel, DetailKopf, DetailTabs, DokumentDialog, DokumentePanel, KommunikationPanel, LetzteAktivitaeten, NichtGefunden, PhasenLeiste, RefLink, TESTMODUS, VerlaufPanel, bezugVorgang,
} from "@/components/modul/detail";
import { FinanzPanel } from "@/components/modul/FinanzPanel";
import { InfoPanel } from "@/components/modul/kaeufer";
import { ObjektVorgaenge } from "@/components/property/Mandate";

const SANIERUNGSARTEN = ["Komplettsanierung", "Kernsanierung", "Badsanierung", "Innenausbau", "Fassadensanierung", "Neubau-Innenausbau", "Küchenumbau", "Wohnungssanierung", "Modernisierung", "Renovierung", "Dachgeschossausbau"];

// ======================= Mandate =======================

export function MandateListeProjects() {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const rows = crm.projectsMandate;
  const projekte = (m: ProjectsMandat) => crm.projectsProjekte.filter((p) => p.mandatId === m.id);
  const volumen = (m: ProjectsMandat) => projekte(m).reduce((s, p) => s + (p.vergabe?.vergabesumme ?? p.budget), 0);
  const aktiv = (m: ProjectsMandat) => !["Abgeschlossen", "Inaktiv"].includes(m.status);
  const ids = new Set([...rows.map((m) => m.id), ...crm.projectsProjekte.map((p) => p.id)]);
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Projects" }, { label: "Mandate" }]}
        titel="Mandate"
        untertitel="Alle Kunden mit Sanierungs- und Renovierungsmandaten."
        neu={{ label: "Neues Mandat", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(m) => [m.id, crm.refName(m.kunde), m.sanierungsart, crm.objektById(m.objektId ?? "")?.adresse, crm.objektById(m.objektId ?? "")?.titel]}
        suchePlatzhalter="Mandate suchen …"
        href={(m) => HREF.pmandat(m.id)}
        defaultSort={{ key: "vol", richtung: "desc" }}
        columns={[
          { key: "kunde", header: "Kunde / Mandat", sort: (m) => crm.refName(m.kunde), cell: (m) => <div className="flex items-center gap-2.5"><Avatar name={crm.refName(m.kunde)} bild={crm.objektById(m.objektId ?? "")?.bild} size={34} rund={false} /><div><div className="font-semibold text-navy-950">{crm.refName(m.kunde)}</div><div className="text-[10.5px] text-muted">{m.kundentyp} · {m.id}</div></div></div> },
          { key: "adr", header: "Objektadresse", cell: (m) => { const o = crm.objektById(m.objektId ?? ""); return <span className="line-clamp-2 max-w-[150px] text-ink-soft">{o?.adresse ?? o?.titel ?? "—"}</span>; } },
          { key: "art", header: "Objektart", cell: (m) => <Badge tone="green">{crm.objektById(m.objektId ?? "")?.objektart ?? "—"}</Badge> },
          { key: "anz", header: "Projekte", sort: (m) => projekte(m).length, cell: (m) => projekte(m).length },
          { key: "vol", header: "Projektvolumen (ca. €)", sort: volumen, cell: (m) => euroCompact(volumen(m)) },
          { key: "san", header: "Sanierungsart", cell: (m) => <span className="line-clamp-2 max-w-[130px]">{m.sanierungsart}</span> },
          { key: "status", header: "Status", sort: (m) => m.status, cell: (m) => <StatusBadge status={m.status} /> },
        ]}
        filter={[
          { key: "status", label: "Status", wert: (m) => m.status, inBar: true },
          { key: "typ", label: "Kundentyp", wert: (m) => m.kundentyp, inBar: true },
          { key: "region", label: "Region", wert: (m) => crm.objektById(m.objektId ?? "")?.ort ?? "—", inBar: true },
          { key: "san", label: "Sanierungsart", wert: (m) => m.sanierungsart.split(",").map((x) => x.trim()), inBar: true, offen: true },
          { key: "art", label: "Objektart", wert: (m) => crm.objektById(m.objektId ?? "")?.objektart ?? "—" },
        ]}
        quick={[
          { id: "", label: "Alle Mandate", icon: Layers, test: () => true },
          { id: "aktiv", label: "Aktive Mandate", icon: CircleDot, test: (m) => m.status === "Aktiv" },
          { id: "verhandlung", label: "In Verhandlung", icon: FileSearch, test: (m) => m.status === "In Verhandlung" },
          { id: "planung", label: "In Planung", icon: ClipboardCheck, test: (m) => m.status === "Planung" },
          { id: "umsetzung", label: "In Umsetzung", icon: Hammer, test: (m) => m.status === "In Umsetzung" },
          { id: "abgeschlossen", label: "Abgeschlossen", icon: ShieldCheck, test: (m) => m.status === "Abgeschlossen" },
        ]}
        kpis={[
          { label: "Gesamt", icon: FileSearch, wert: (r) => r.length, sub: "Mandate", quick: "" },
          { label: "Aktiv", icon: Search, wert: (r) => r.filter(aktiv).length, sub: "in Bearbeitung", quick: "aktiv" },
          { label: "Geplante Projekte", icon: Building2, wert: (r) => r.reduce((s, m) => s + projekte(m).length, 0), sub: "in allen Mandaten" },
          { label: "Projektvolumen (ca.)", icon: Database, wert: (r) => euroMio(r.filter(aktiv).reduce((s, m) => s + volumen(m), 0) / 1e6, 1), sub: "aller aktiven Mandate" },
          { label: "Erwartete GRENFORD-Vergütung", icon: BarChart3, wert: (r) => euroMio(r.filter(aktiv).reduce((s, m) => s + projectsVerguetung(volumen(m), m.verguetungSatz), 0) / 1e6, 2), sub: "(beratungs- & partnerbasiert)" },
        ]}
        csv={{ datei: "projects-mandate.csv", kopf: ["Mandat", "Kunde", "Kundentyp", "Objekt", "Objektadresse", "Projekte", "Projektvolumen", "Sanierungsart", "Vergütung %", "Status"], zeile: (m) => [m.id, crm.refName(m.kunde), m.kundentyp, crm.objektById(m.objektId ?? "")?.titel ?? "", crm.objektById(m.objektId ?? "")?.adresse ?? "", projekte(m).length, volumen(m), m.sanierungsart, m.verguetungSatz, m.status] }}
        statusAenderung={{ werte: PMANDAT_STATUS, setze: (sel, s) => sel.forEach((id) => { const m = rows.find((x) => x.id === id)!; crm.speichere("projectsMandate", { ...m, status: s as ProjectsMandat["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "vorgang" && ids.has(b.id)))}
      />
      {neu && <ProjectsMandatModal onClose={() => setNeu(false)} />}
    </>
  );
}

export function ProjectsMandatModal({ initial, onClose }: { initial?: ProjectsMandat; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const router = useRouter();
  return (
    <FormModal
      titel={initial ? `Mandat ${initial.id} bearbeiten` : "Neues Projects-Mandat"}
      hinweis="Ein Mandat bildet die Kundenbeziehung und den Beratungsauftrag ab; es kann mehrere Projekte (Baumaßnahmen) enthalten. GRENFORD berät und vermittelt – die Beauftragung der Baupartner erfolgt grundsätzlich durch den Kunden."
      felder={[
        { key: "kunde", label: "Kunde / Bauherr (aus Stammdaten)", typ: "ref", pflicht: true, breit: true },
        { key: "objektId", label: "Objekt (zentraler Objektbestand)", typ: "objekt", breit: true },
        { key: "kundentyp", label: "Kundentyp", typ: "select", pflicht: true, options: ["Privatkunde", "Unternehmen"] },
        { key: "status", label: "Status", typ: "select", pflicht: true, options: PMANDAT_STATUS },
        { key: "sanierungsart", label: "Sanierungsart", typ: "text", pflicht: true, placeholder: SANIERUNGSARTEN.slice(0, 3).join(", ") },
        { key: "verguetungSatz", label: "Vergütung GRENFORD (% der Netto-Bausumme)", typ: "zahl", pflicht: true },
      ]}
      start={{ kunde: refZu(initial?.kunde), objektId: initial?.objektId ?? "", kundentyp: initial?.kundentyp ?? "Privatkunde", status: initial?.status ?? "Planung", sanierungsart: initial?.sanierungsart ?? "", verguetungSatz: String(initial?.verguetungSatz ?? crm.einstellungen.provisionsstandards.Projects) }}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? crm.nummer("projectsMandat");
        crm.speichere("projectsMandate", { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, ...initial, id, kunde: refAus(w.kunde)!, objektId: text(w.objektId) || undefined, kundentyp: text(w.kundentyp), status: text(w.status) as ProjectsMandat["status"], sanierungsart: text(w.sanierungsart), verguetungSatz: zahl(w.verguetungSatz) }, { ref: id, text: initial ? "Mandat geändert" : "Mandat angelegt" });
        toast(`Mandat ${id} gespeichert ${TESTMODUS}`);
        if (!initial) router.push(HREF.pmandat(id));
      }}
    />
  );
}

export function ProjectsMandatDetail({ id }: { id: string }) {
  const crm = useCrm();
  const [modal, setModal] = useState<"edit" | "projekt" | null>(null);
  const m = crm.projectsMandate.find((x) => x.id === id);
  if (!m) return <NichtGefunden was="Mandat" href="/projects/mandate" />;
  const o = m.objektId ? crm.objektById(m.objektId) : undefined;
  const projekte = crm.projectsProjekte.filter((p) => p.mandatId === m.id);
  const refIds = [m.id, ...projekte.map((p) => p.id)];
  const akt = crm.aktivitaetenVon(...refIds);
  const volumen = projekte.reduce((s, p) => s + (p.vergabe?.vergabesumme ?? p.budget), 0);
  return (
    <div className="mx-auto max-w-[1600px]">
      <DetailKopf
        crumbs={[{ label: "Projects", href: "/projects/mandate" }, { label: "Mandate", href: "/projects/mandate" }, { label: m.id }]}
        bild={o?.bild}
        idBadge={m.id}
        titel={`Mandat ${crm.refName(m.kunde)}`}
        meta={[{ icon: <Home className="h-4 w-4" />, text: o ? `${o.titel}${o.adresse ? ` · ${o.adresse}` : ""}` : "kein Objekt" }, { icon: <MapPin className="h-4 w-4" />, text: o?.ort ?? "—" }, { icon: <span className="h-2 w-2 rounded-full bg-pos" />, text: m.status }]}
        tags={[{ label: "Projects", cls: "bg-[#fdeee2] text-[#b4570f]" }, { label: m.kundentyp }, ...m.sanierungsart.split(",").map((s) => ({ label: s.trim() }))]}
        kennzahlen={[{ label: "Projekte", wert: projekte.length }, { label: "Projektvolumen (ca.)", wert: euroCompact(volumen) }, { label: "Vergütung GRENFORD", wert: `${m.verguetungSatz} %`, sub: euro(projectsVerguetung(volumen, m.verguetungSatz)) }, { label: "Kunde seit", wert: datumDe(m.erstelltAm) }]}
        aktionen={<><Button size="sm" onClick={() => setModal("edit")}>Bearbeiten</Button><Button size="sm" variant="primary" onClick={() => setModal("projekt")}>Neues Projekt</Button></>}
      />
      <div className="mt-4 grid gap-[12px] xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-[12px]">
          <Panel titel={`Projekte im Mandat (${projekte.length})`} aktion={<button type="button" className="link-more" onClick={() => setModal("projekt")}>+ Neues Projekt</button>}>
            <ul className="divide-y divide-line-soft">
              {projekte.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2 text-[12px]">
                  <Link href={HREF.projekt(p.id)} className="min-w-0 flex-1"><div className="font-semibold text-navy-950 hover:underline">{p.id} · {p.titel}</div><div className="text-[11px] text-muted">{phaseTitel(PHASEN_PROJECTS, p.phase)} · {p.leistungsumfang}</div></Link>
                  <span>{euroCompact(p.vergabe?.vergabesumme ?? p.budget)}</span><StatusBadge status={p.status} />
                </li>
              ))}
              {!projekte.length && <li className="py-2 text-[12px] text-muted">Noch kein Projekt.</li>}
            </ul>
          </Panel>
          <AktivitaetenPanel aktivitaeten={akt} bezug={bezugVorgang(m.id)} />
        </div>
        <div className="space-y-[12px]">
          <InfoPanel titel="Mandatsinformationen" onBearbeiten={() => setModal("edit")} rows={[["Mandat", m.id], ["Kunde", <RefLink key="k" r={m.kunde} />], ["Kundentyp", m.kundentyp], ["Objekt", o ? `${o.titel} (${o.nummer ?? o.id})` : "—"], ["Sanierungsart", m.sanierungsart], ["Vergütung", `${m.verguetungSatz} % der provisionspflichtigen Netto-Bausumme inkl. vereinbarter Nachträge`], ["Status", <StatusBadge key="s" status={m.status} />], ["Rolle GRENFORD", "Unabhängige Beratung und Vermittlung – kein ausführendes Bauunternehmen"]]} />
          {m.objektId && <ObjektVorgaenge objektId={m.objektId} />}
          <VerlaufPanel refIds={refIds} />
        </div>
      </div>
      {modal === "edit" && <ProjectsMandatModal initial={m} onClose={() => setModal(null)} />}
      {modal === "projekt" && <ProjektModal mandat={m} onClose={() => setModal(null)} />}
    </div>
  );
}

// ======================= Projekte =======================

export function ProjekteListeProjects({ prozessAnsicht = false }: { prozessAnsicht?: boolean }) {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const rows = crm.projectsProjekte;
  const aktiv = (p: ProjectsProjekt) => p.status === "Aktiv";
  const ids = new Set(rows.map((p) => p.id));
  if (prozessAnsicht) return <ProzessBoard />;
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Projects" }, { label: "Projekte" }]}
        titel="Projekte"
        untertitel="Alle konkreten Baumaßnahmen – je Projekt eigene ID, Mandatszuordnung, Angebote und GU-Zuordnung."
        neu={{ label: "Neues Projekt", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(p) => [p.id, p.titel, p.mandatId, crm.refName(p.bauherr), p.leistungsumfang, crm.objektById(p.objektId ?? "")?.titel]}
        suchePlatzhalter="Projekte suchen …"
        href={(p) => HREF.projekt(p.id)}
        defaultSort={{ key: "phase", richtung: "asc" }}
        columns={[
          { key: "titel", header: "Projekt", sort: (p) => p.titel, cell: (p) => <div className="flex items-center gap-2.5"><Avatar name={p.titel} bild={crm.objektById(p.objektId ?? "")?.bild} size={32} rund={false} /><div><div className="font-semibold text-navy-950">{p.titel}</div><div className="text-[10.5px] text-muted">{p.id} · Mandat {p.mandatId}</div></div></div> },
          { key: "bauherr", header: "Bauherr", sort: (p) => crm.refName(p.bauherr), cell: (p) => crm.refName(p.bauherr) },
          { key: "objekt", header: "Objekt", cell: (p) => <span className="line-clamp-2 max-w-[140px] text-ink-soft">{crm.objektById(p.objektId ?? "")?.titel ?? "—"}{p.einheit ? ` · ${p.einheit}` : ""}</span> },
          { key: "budget", header: "Budget", sort: (p) => p.budget, cell: (p) => euroCompact(p.budget) },
          { key: "phase", header: "Phase", sort: (p) => p.phase, cell: (p) => <Badge tone="blue">{phaseTitel(PHASEN_PROJECTS, p.phase)}</Badge> },
          { key: "gu", header: "GU / Vergabe", cell: (p) => { const a = p.vergabe ? crm.angebote.find((x) => x.id === p.vergabe!.angebotId) : undefined; const g = a ? crm.guPartner.find((x) => x.id === a.guId) : undefined; return g ? <span>{crm.unternehmenById(g.unternehmenId)?.name}</span> : <span className="text-muted">offen</span>; } },
          { key: "status", header: "Status", sort: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
        ]}
        filter={[
          { key: "phase", label: "Phase", wert: (p) => phaseTitel(PHASEN_PROJECTS, p.phase[0]), inBar: true, offen: true },
          { key: "status", label: "Status", wert: (p) => p.status, inBar: true },
          { key: "mandat", label: "Mandat", wert: (p) => p.mandatId, inBar: true },
          { key: "bauherr", label: "Bauherr", wert: (p) => crm.refName(p.bauherr) },
        ]}
        quick={[
          { id: "", label: "Alle Projekte", icon: Layers, test: () => true },
          { id: "aktiv", label: "Aktive Projekte", icon: CircleDot, test: aktiv },
          ...PHASEN_PROJECTS.map((ph) => ({ id: `ph-${ph.code}`, label: `${ph.code} – ${ph.titel}`, icon: ClipboardCheck, test: (p: ProjectsProjekt) => p.phase.startsWith(ph.code) && aktiv(p) })),
          { id: "abgeschlossen", label: "Abgeschlossen", icon: ShieldCheck, test: (p) => p.status === "Abgeschlossen" },
        ]}
        kpis={[
          { label: "Gesamt", icon: Building2, wert: (r) => r.length, sub: "Projekte", quick: "" },
          { label: "Aktiv", icon: CircleDot, wert: (r) => r.filter(aktiv).length, sub: "in Bearbeitung", quick: "aktiv" },
          { label: "Projektvolumen (aktiv)", icon: Wallet, wert: (r) => euroMio(r.filter(aktiv).reduce((s, p) => s + (p.vergabe?.vergabesumme ?? p.budget), 0) / 1e6, 2), sub: "Budget bzw. Vergabesumme" },
          { label: "In Angebotsphase", icon: FileSearch, wert: (r) => r.filter((p) => p.phase.startsWith("C") && aktiv(p)).length, sub: "Angebote / Vergleich", quick: "ph-C" },
          { label: "Abgeschlossen", icon: ShieldCheck, wert: (r) => r.filter((p) => p.status === "Abgeschlossen").length, sub: "dieses Jahr", quick: "abgeschlossen" },
        ]}
        csv={{ datei: "projects-projekte.csv", kopf: ["Projekt-ID", "Projekt", "Mandat", "Bauherr", "Objekt", "Leistungsumfang", "Budget", "Vergabesumme", "Auftraggeber GU", "Phase", "Status"], zeile: (p) => [p.id, p.titel, p.mandatId, crm.refName(p.bauherr), crm.objektById(p.objektId ?? "")?.titel ?? "", p.leistungsumfang, p.budget, p.vergabe?.vergabesumme ?? "", p.vergabe?.auftraggeber ?? "", phaseTitel(PHASEN_PROJECTS, p.phase), p.status] }}
        statusAenderung={{ werte: PROJEKT_STATUS, setze: (sel, s) => sel.forEach((id) => { const p = rows.find((x) => x.id === id)!; crm.speichere("projectsProjekte", { ...p, status: s as ProjectsProjekt["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "vorgang" && ids.has(b.id)))}
      />
      {neu && <ProjektModal onClose={() => setNeu(false)} />}
    </>
  );
}

/** Projektprozesse: Board nach Phasen A–F */
function ProzessBoard() {
  const crm = useCrm();
  const aktiv = crm.projectsProjekte.filter((p) => p.status === "Aktiv" || p.status === "Pausiert");
  return (
    <div className="mx-auto max-w-[1600px]">
      <nav aria-label="Brotkrumen" className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#596b83]">Projects › Projektprozesse <span className="ml-2 rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold tracking-[0.12em] text-warn">Testdaten</span></nav>
      <h1 className="mt-[6px] font-serif text-[31px] font-bold text-navy-950">Projektprozesse</h1>
      <p className="font-serif text-[15.5px] text-muted-soft">Alle laufenden Projekte nach Prozessphase A–F – von der Bedarfsermittlung bis zur Begleitung der Ausführung.</p>
      <p className="mt-1 text-[11px] text-warn">Hinweis: Die Unterphasen (z. B. A1, B2, C3) sind ein vorläufiger Vorschlag und fachlich noch nicht endgültig freigegeben.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {PHASEN_PROJECTS.map((ph) => {
          const liste = aktiv.filter((p) => p.phase.startsWith(ph.code));
          return (
            <section key={ph.code} className="card flex min-h-[220px] flex-col p-3" aria-label={`Phase ${ph.code}`}>
              <h2 className="font-serif text-[14px] font-bold text-navy-950">{ph.code} – {ph.titel} <span className="text-[11px] font-normal text-muted">({liste.length})</span></h2>
              <p className="text-[10.5px] text-muted">{ph.unter.map((u) => u.titel).join(" · ")}</p>
              <ul className="mt-2 space-y-2">
                {liste.map((p) => {
                  const { j } = phasenIndex(PHASEN_PROJECTS, p.phase);
                  return (
                    <li key={p.id}>
                      <Link href={HREF.projekt(p.id)} className="block rounded-[8px] border border-line p-2 hover:shadow-md">
                        <div className="text-[11px] font-semibold text-navy-900">{p.id}</div>
                        <div className="text-[12px] font-semibold text-navy-950">{p.titel}</div>
                        <div className="text-[10.5px] text-muted">{crm.refName(p.bauherr)} · {euroCompact(p.budget)}</div>
                        <div className="mt-1 text-[10.5px] text-royal-600">{p.phase} · {ph.unter[j]?.titel}</div>
                      </Link>
                    </li>
                  );
                })}
                {!liste.length && <li className="text-[11px] text-muted">Keine Projekte.</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ProjektModal({ initial, mandat, onClose }: { initial?: ProjectsProjekt; mandat?: ProjectsMandat; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const router = useRouter();
  const felder: Feld[] = [
    { key: "mandatId", label: "Mandat", typ: "select", pflicht: true, options: crm.projectsMandate.map((m) => ({ value: m.id, label: `${m.id} – ${crm.refName(m.kunde)}` })) },
    { key: "titel", label: "Projekt / Maßnahme", typ: "select", pflicht: true, options: SANIERUNGSARTEN },
    { key: "bauherr", label: "Bauherr (aus Stammdaten)", typ: "ref", pflicht: true, breit: true },
    { key: "objektId", label: "Objekt", typ: "objekt", breit: true },
    { key: "einheit", label: "Einheit / Geschoss", typ: "text" },
    { key: "budget", label: "Budget (€ netto)", typ: "zahl", pflicht: true },
    { key: "leistungsumfang", label: "Leistungsumfang", typ: "textarea", pflicht: true },
    { key: "phase", label: "Phase", typ: "select", pflicht: true, options: PHASEN_PROJECTS.flatMap((p) => p.unter.map((u) => ({ value: u.code, label: `${u.code} – ${u.titel} (${p.titel})` }))) },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: PROJEKT_STATUS },
    { key: "geplanterStart", label: "Geplanter Start", typ: "text", placeholder: "z. B. 10.10.2026 oder Q4/2026" },
    { key: "geplantesEnde", label: "Geplantes Ende", typ: "text" },
    { key: "verguetungSatz", label: "Vergütung GRENFORD (%)", typ: "zahl", pflicht: true },
    { key: "naechsterSchritt", label: "Nächster Schritt", typ: "text" },
    { key: "wiedervorlage", label: "Wiedervorlage", typ: "datum" },
  ];
  const m = mandat ?? crm.projectsMandate.find((x) => x.id === initial?.mandatId);
  return (
    <FormModal
      titel={initial ? `Projekt ${initial.id} bearbeiten` : "Neues Projekt"}
      felder={felder}
      start={{
        mandatId: initial?.mandatId ?? mandat?.id ?? "", titel: initial?.titel ?? "", bauherr: refZu(initial?.bauherr ?? m?.kunde), objektId: initial?.objektId ?? m?.objektId ?? "", einheit: initial?.einheit ?? "", budget: initial ? String(initial.budget) : "",
        leistungsumfang: initial?.leistungsumfang ?? "", phase: initial?.phase ?? "A1", status: initial?.status ?? "Aktiv", geplanterStart: initial?.geplanterStart ?? "", geplantesEnde: initial?.geplantesEnde ?? "", verguetungSatz: String(initial?.verguetungSatz ?? m?.verguetungSatz ?? 3), naechsterSchritt: initial?.naechsterSchritt ?? "", wiedervorlage: initial?.wiedervorlage ?? "",
      }}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? crm.nummer("projectsProjekt");
        crm.speichere("projectsProjekte", {
          erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, ziele: [], beteiligte: [], ...initial,
          id, mandatId: text(w.mandatId), titel: text(w.titel), bauherr: refAus(w.bauherr)!, objektId: text(w.objektId) || undefined, einheit: text(w.einheit), budget: zahl(w.budget), leistungsumfang: text(w.leistungsumfang), phase: text(w.phase),
          status: text(w.status) as ProjectsProjekt["status"], geplanterStart: text(w.geplanterStart), geplantesEnde: text(w.geplantesEnde), verguetungSatz: zahl(w.verguetungSatz), naechsterSchritt: text(w.naechsterSchritt), wiedervorlage: text(w.wiedervorlage) || undefined,
        }, { ref: id, text: initial ? "Projektdaten geändert" : `Projekt ${id} im Mandat ${text(w.mandatId)} angelegt` });
        toast(`Projekt ${id} gespeichert ${TESTMODUS}`);
        if (!initial) router.push(HREF.projekt(id));
      }}
    />
  );
}

type Tab = "uebersicht" | "angebote" | "gu" | "aufgaben" | "termine" | "dokumente" | "finanzen" | "verlauf";

export function ProjektDetail({ id }: { id: string }) {
  const crm = useCrm();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("uebersicht");
  const [modal, setModal] = useState<"edit" | "dok" | "angebot" | "memo" | "vergabe" | null>(null);
  const p = crm.projectsProjekte.find((x) => x.id === id);
  if (!p) return <NichtGefunden was="Projekt" href="/projects/projekte" />;
  const mandat = crm.projectsMandate.find((m) => m.id === p.mandatId);
  const o = p.objektId ? crm.objektById(p.objektId) : undefined;
  const angebote = crm.angebote.filter((a) => a.projektId === p.id);
  const akt = crm.aktivitaetenVon(p.id);
  const aufgaben = akt.filter((a) => a.typ === "Aufgabe");
  const termine = akt.filter((a) => a.typ === "Termin");
  const guName = (a: Angebot) => { const g = crm.guPartner.find((x) => x.id === a.guId); return g ? crm.unternehmenById(g.unternehmenId)?.name ?? g.id : a.guId; };
  const speichern = (neu: ProjectsProjekt, t: string) => { crm.speichere("projectsProjekte", neu, { ref: p.id, text: t }); toast(`${t} ${TESTMODUS}`); };
  const verguetung = projectsVerguetung(p.vergabe?.vergabesumme ?? p.budget, p.verguetungSatz);
  const { i: pi } = phasenIndex(PHASEN_PROJECTS, p.phase);

  return (
    <div className="mx-auto max-w-[1600px]">
      <DetailKopf
        crumbs={[{ label: "Projects", href: "/projects/projekte" }, { label: "Projektprozesse", href: "/projects/projektprozesse" }, { label: p.id }]}
        bild={o?.bild}
        bilder={o?.bild ? 12 : 0}
        idBadge={p.id}
        titel={`${p.id} · ${p.titel}`}
        meta={[{ icon: <Home className="h-4 w-4" />, text: `${p.einheit ? `${p.einheit} · ` : ""}${o?.adresse ?? o?.titel ?? "—"}` }]}
        tags={[{ label: `Mandat: ${mandat ? crm.refName(mandat.kunde) : p.mandatId}` }, { label: o?.objektart ?? "—" }, { label: o?.ort ?? "—" }, { label: p.status, cls: "bg-pos-bg text-pos" }, { label: `In ${PHASEN_PROJECTS[pi]?.titel ?? ""}`, cls: "bg-royal-100 text-navy-900" }]}
        kennzahlen={[
          { label: "Geplantes Budget (ca.)", wert: euro(p.budget), sub: "netto (ohne MwSt.)" },
          { label: "Erwartete GRENFORD-Vergütung", wert: euro(verguetung), sub: `netto (${p.verguetungSatz} %)` },
          { label: "Geplanter Zeitraum", wert: `${p.geplanterStart || "—"} – ${p.geplantesEnde || "—"}` },
          { label: "Vergabe", wert: p.vergabe ? euro(p.vergabe.vergabesumme) : "offen", sub: p.vergabe ? `Auftraggeber: ${p.vergabe.auftraggeber}` : "Entscheidung durch Kunden" },
        ]}
        aktionen={
          <>
            <Button size="sm" onClick={() => setModal("edit")}>Bearbeiten</Button>
            <Button size="sm" onClick={() => setModal("dok")}>Dokument erfassen</Button>
            <Button size="sm" onClick={() => toast("Google Drive ist nicht verbunden – der Projektordner wird nach der Einrichtung verknüpft.")}><FolderOpen className="h-3.5 w-3.5" />Projektordner · Google Drive</Button>
            <Menu label="Weitere Aktionen" items={[
              { label: "Neues Angebot erfassen", onClick: () => setModal("angebot") },
              { label: "Renovation Memo / Vergleich", onClick: () => setModal("memo") },
              { label: "Vergabe dokumentieren", onClick: () => setModal("vergabe") },
              ...PROJEKT_STATUS.filter((s) => s !== p.status).map((s) => ({ label: `Status „${s}“`, onClick: () => speichern({ ...p, status: s }, `Status → ${s}`) })),
            ]} trigger={<span className="flex h-[32px] items-center rounded-[6px] bg-navy-900 px-3 text-[12px] font-semibold text-white">Weitere Aktionen</span>} />
          </>
        }
      />
      <PhasenLeiste phasen={PHASEN_PROJECTS} aktuell={p.phase} onWechsel={(c) => speichern({ ...p, phase: c }, `Phase → ${phaseTitel(PHASEN_PROJECTS, c)}`)} />
      <DetailTabs<Tab> value={tab} onChange={setTab} tabs={[
        { id: "uebersicht", label: "Übersicht" }, { id: "angebote", label: "Angebote", anzahl: angebote.length }, { id: "gu", label: "GU-Partner" }, { id: "aufgaben", label: "Aufgaben", anzahl: aufgaben.filter((a) => !a.erledigt).length },
        { id: "termine", label: "Termine", anzahl: termine.length }, { id: "dokumente", label: "Dokumente", anzahl: crm.dokumente.filter((d) => d.ref === p.id).length }, { id: "finanzen", label: "Finanzen" }, { id: "verlauf", label: "Verlauf" },
      ]} />
      <div className="mt-4">
        {tab === "uebersicht" && (
          <div className="grid gap-[12px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,0.95fr)]">
            <div className="space-y-[12px]">
              <InfoPanel titel="Projektinformationen" onBearbeiten={() => setModal("edit")} rows={[
                ["Projekt-ID", p.id], ["Projektname", p.titel], ["Mandat", mandat ? <Link key="m" href={HREF.pmandat(mandat.id)} className="text-royal-600 hover:underline">{crm.refName(mandat.kunde)} ({mandat.id})</Link> : p.mandatId],
                ["Bauherr", <RefLink key="b" r={p.bauherr} />], ["Objektadresse", o?.adresse ?? o?.titel ?? "—"], ["Objektart", o?.objektart ?? "—"], ["Einheit / Geschoss", p.einheit || "—"], ["Sanierungsumfang", p.leistungsumfang],
              ]} />
              <Panel titel="Ziele & Anforderungen (Kunde)">
                {p.ziele.length ? <ul className="list-disc space-y-1 pl-5 text-[12px] text-ink">{p.ziele.map((z) => <li key={z}>{z}</li>)}</ul> : <p className="text-[12px] text-muted">Noch nicht erfasst.</p>}
              </Panel>
            </div>
            <div className="space-y-[12px]">
              <KommunikationPanel titel="E-Mail-Kommunikation" an={[...(p.bauherr.art === "person" ? [p.bauherr] : [])]} betreff={`Update ${PHASEN_PROJECTS[pi]?.titel ?? ""} – ${p.titel} ${o?.titel ?? ""}`} bezug={bezugVorgang(p.id)} dateiRef={p.id} />
              <AngebotsVergleich p={p} angebote={angebote} guName={guName} onNeu={() => setModal("angebot")} onMemo={() => setModal("memo")} onVergabe={() => setModal("vergabe")} />
            </div>
            <div className="space-y-[12px]">
              <Panel titel="Status & nächste Schritte" aktion={<button type="button" onClick={() => setModal("edit")} className="link-more">Bearbeiten</button>}>
                <InfoList rows={[["Aktuelle Phase", phaseTitel(PHASEN_PROJECTS, p.phase)], ["Status", <StatusBadge key="s" status={p.status} />], ["Nächster Schritt", p.naechsterSchritt || "—"], ["Wiedervorlage", p.wiedervorlage ? <span key="w" className={p.wiedervorlage < crm.heute ? "text-neg" : ""}>{datumDe(p.wiedervorlage)}</span> : "—"], ["Geplanter Start", p.geplanterStart || "—"], ["Geplantes Ende", p.geplantesEnde || "—"]]} />
              </Panel>
              <AufgabenPanel titel="Aufgaben" aufgaben={aufgaben} bezug={bezugVorgang(p.id)} />
              <LetzteAktivitaeten aktivitaeten={akt} />
              <BeteiligtePanel beteiligte={[{ ...p.bauherr, rolle: "Bauherr / Kunde" }, ...p.beteiligte]} onAendern={(b) => speichern({ ...p, beteiligte: b.slice(1) }, "Beteiligte geändert")} />
            </div>
          </div>
        )}
        {tab === "angebote" && <AngebotsVergleich p={p} angebote={angebote} guName={guName} onNeu={() => setModal("angebot")} onMemo={() => setModal("memo")} onVergabe={() => setModal("vergabe")} />}
        {tab === "gu" && (
          <Panel titel="GU-Zuordnungen">
            <ul className="divide-y divide-line-soft text-[12px]">
              {angebote.map((a) => { const g = crm.guPartner.find((x) => x.id === a.guId); return <li key={a.id} className="flex items-center gap-3 py-2"><Avatar name={guName(a)} size={28} /><Link href={HREF.gu(a.guId)} className="flex-1 font-semibold text-navy-950 hover:underline">{guName(a)}</Link><span className="text-muted">{g?.kategorie} · {g?.gewerke.slice(0, 3).join(", ")}</span><StatusBadge status={a.status} /></li>; })}
              {!angebote.length && <li className="py-2 text-muted">Noch keine GU-Partner angefragt.</li>}
            </ul>
          </Panel>
        )}
        {tab === "aufgaben" && <AufgabenPanel titel="Aufgaben" aufgaben={aufgaben} bezug={bezugVorgang(p.id)} />}
        {tab === "termine" && <AktivitaetenPanel aktivitaeten={akt.filter((a) => a.typ !== "Aufgabe")} bezug={bezugVorgang(p.id)} />}
        {tab === "dokumente" && <DokumentePanel refIds={[p.id]} />}
        {tab === "finanzen" && (
          <>
            <p className="mb-3 rounded-[8px] bg-line-soft px-3 py-2 text-[11.5px] text-ink-soft">Vergütung GRENFORD: {p.verguetungSatz} % der provisionspflichtigen Netto-Bausumme inkl. vereinbarter Nachträge. GU-Leistungen erzeugen nur dann eine GRENFORD-Verbindlichkeit, wenn GRENFORD selbst Auftraggeber ist{p.vergabe ? ` (hier: ${p.vergabe.auftraggeber})` : ""}.</p>
            <FinanzPanel refIds={[p.id]} bereich="Projects" zahler={p.bauherr} basis={p.vergabe?.vergabesumme ?? p.budget} satz={p.verguetungSatz} />
          </>
        )}
        {tab === "verlauf" && <VerlaufPanel refIds={[p.id]} />}
      </div>
      {modal === "edit" && <ProjektModal initial={p} onClose={() => setModal(null)} />}
      {modal === "dok" && <DokumentDialog refId={p.id} onClose={() => setModal(null)} />}
      {modal === "angebot" && <AngebotModal projektId={p.id} onClose={() => setModal(null)} />}
      {modal === "memo" && <RenovationMemo p={p} angebote={angebote} guName={guName} onClose={() => setModal(null)} />}
      {modal === "vergabe" && <VergabeModal p={p} angebote={angebote} guName={guName} onClose={() => setModal(null)} />}
    </div>
  );
}

function AngebotsVergleich({ p, angebote, guName, onNeu, onMemo, onVergabe }: { p: ProjectsProjekt; angebote: Angebot[]; guName: (a: Angebot) => string; onNeu: () => void; onMemo: () => void; onVergabe: () => void }) {
  return (
    <Panel titel="Angebotsvergleich" aktion={<button type="button" onClick={onNeu} className="link-more">+ Neues Angebot</button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[11.5px]">
          <thead className="text-[10.5px] text-muted"><tr><th className="py-1.5 pr-2 font-normal">GU-Partner</th><th className="pr-2 font-normal">Angebotsdatum</th><th className="pr-2 font-normal">Summe (netto)</th><th className="pr-2 font-normal">Umfang</th><th className="pr-2 font-normal">Status</th><th className="font-normal">Dokument</th></tr></thead>
          <tbody className="divide-y divide-line-soft">
            {angebote.map((a) => (
              <tr key={a.id}>
                <td className="py-2 pr-2 font-semibold text-navy-950">{guName(a)}</td>
                <td className="pr-2">{a.datum ? datumDe(a.datum) : "—"}</td>
                <td className="pr-2">{a.summe !== undefined ? euro(a.summe) : "—"}</td>
                <td className="pr-2">{a.umfang}</td>
                <td className="pr-2"><StatusBadge status={a.status} /></td>
                <td className="text-royal-600">{a.dokument ?? "—"}</td>
              </tr>
            ))}
            {!angebote.length && <tr><td colSpan={6} className="py-3 text-muted">Noch keine Angebote.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" onClick={onMemo}><BarChart3 className="h-3.5 w-3.5" />Vergleich erstellen (Renovation Memo)</Button>
        <Button size="sm" variant="primary" onClick={onVergabe} disabled={!angebote.some((a) => a.status === "Eingegangen" || a.status === "Beauftragt")}>{p.vergabe ? "Vergabe ändern" : "Vergabe dokumentieren"}</Button>
      </div>
      {p.vergabe && <p className="mt-2 text-[11.5px] text-pos">Vergeben am {datumDe(p.vergabe.datum)}: {euro(p.vergabe.vergabesumme)} – Entscheidung durch den Kunden, Auftraggeber: {p.vergabe.auftraggeber}.</p>}
    </Panel>
  );
}

function AngebotModal({ projektId, onClose }: { projektId: string; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  return (
    <FormModal
      titel="Angebot erfassen"
      hinweis="Originalangebote werden dem Projekt zugeordnet. Für die Kundenpräsentation (Renovation Memo) können sie als Partner A, B, C anonymisiert werden."
      felder={[
        { key: "guId", label: "GU-Partner", typ: "select", pflicht: true, options: crm.guPartner.map((g) => ({ value: g.id, label: `${crm.unternehmenById(g.unternehmenId)?.name ?? g.id} (${g.kategorie})` })) },
        { key: "status", label: "Status", typ: "select", pflicht: true, options: ANGEBOT_STATUS.filter((s) => s !== "Beauftragt") },
        { key: "datum", label: "Angebotsdatum", typ: "datum", wenn: (w) => w.status !== "Angefragt" },
        { key: "summe", label: "Angebotssumme (€ netto)", typ: "zahl", wenn: (w) => w.status !== "Angefragt" },
        { key: "umfang", label: "Umfang", typ: "text", pflicht: true, placeholder: "z. B. Vollangebot" },
        { key: "dokument", label: "Dateiname Originalangebot", typ: "text", placeholder: "z. B. GU_Angebot.pdf" },
      ]}
      start={{ guId: "", status: "Eingegangen", datum: crm.heute, summe: "", umfang: "Vollangebot", dokument: "" }}
      pruefen={(w) => (w.status !== "Angefragt" && !zahl(w.summe) ? { summe: "Bitte die Angebotssumme angeben." } : crm.angebote.some((a) => a.projektId === projektId && a.guId === w.guId && a.status !== "Abgelehnt") ? { guId: "Für diesen GU-Partner besteht bereits ein Angebot zu diesem Projekt." } : ({} as Record<string, string>))}
      onClose={onClose}
      speichern={(w) => {
        const id = crm.nummer("angebot");
        crm.speichere("angebote", { id, projektId, guId: text(w.guId), status: text(w.status) as Angebot["status"], datum: w.status !== "Angefragt" ? text(w.datum) : undefined, summe: w.status !== "Angefragt" ? zahl(w.summe) : undefined, umfang: text(w.umfang), dokument: text(w.dokument) || undefined }, { ref: projektId, text: `Angebot ${id} erfasst (${text(w.status)})` });
        toast(`Angebot ${id} erfasst ${TESTMODUS}`);
      }}
    />
  );
}

/** Renovation Memo: vergleichende Darstellung, wahlweise anonymisiert (Partner A, B, C) */
function RenovationMemo({ p, angebote, guName, onClose }: { p: ProjectsProjekt; angebote: Angebot[]; guName: (a: Angebot) => string; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const [anonym, setAnonym] = useState(true);
  const labels = anonymisiere(angebote);
  const v = angebotsvergleich(angebote);
  const vergleich = angebote.filter((a) => labels.has(a.id));
  return (
    <Modal titel={`Renovation Memo – ${p.titel} (${p.id})`} onClose={onClose} breit="max-w-[820px]" footer={<><Button onClick={onClose}>Schließen</Button><Button variant="primary" onClick={() => { crm.speichere("dokumente", { id: crm.neueId("DOK"), ref: p.id, name: `Renovation_Memo_${p.id}${anonym ? "_anonymisiert" : ""}.pdf`, groesse: "—", datum: crm.heute, ablage: "Testdaten" }, { ref: p.id, text: `Renovation Memo erstellt (${anonym ? "anonymisiert" : "mit Partnernamen"})` }); toast(`Renovation Memo als Dokumentverweis gespeichert ${TESTMODUS}`); onClose(); }}>Memo speichern</Button></>}>
      <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" checked={anonym} onChange={(e) => setAnonym(e.target.checked)} className="accent-navy-900" />Anbieter anonymisieren (Partner A, B, C …)</label>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {[["Angebote im Vergleich", v ? String(v.anzahl) : "0"], ["Günstigstes Angebot", v ? euro(v.min) : "—"], ["Preisspanne", v ? euro(v.spanne) : "—"]].map(([l, w]) => <div key={l} className="rounded-[8px] border border-line p-3"><div className="text-[11px] text-muted">{l}</div><div className="font-serif text-[18px] font-bold text-navy-950">{w}</div></div>)}
      </div>
      <table className="mt-3 w-full text-left text-[12px]">
        <thead className="text-[11px] text-muted"><tr><th className="py-1 font-normal">Anbieter</th><th className="font-normal">Summe (netto)</th><th className="font-normal">Abweichung zum günstigsten</th><th className="font-normal">Umfang</th><th className="font-normal">Budget-Abgleich</th></tr></thead>
        <tbody className="divide-y divide-line-soft">
          {vergleich.map((a) => (
            <tr key={a.id} className={v?.guenstigstes === a.id ? "bg-pos-bg/50" : ""}>
              <td className="py-2 font-semibold text-navy-950">{anonym ? labels.get(a.id) : guName(a)}</td>
              <td>{euro(a.summe!)}</td>
              <td>{v && a.summe! > v.min ? `+ ${euro(a.summe! - v.min)}` : "günstigstes"}</td>
              <td>{a.umfang}</td>
              <td className={a.summe! > p.budget ? "text-neg" : "text-pos"}>{a.summe! > p.budget ? `${euro(a.summe! - p.budget)} über Budget` : "im Budget"}</td>
            </tr>
          ))}
          {!vergleich.length && <tr><td colSpan={5} className="py-3 text-muted">Noch keine eingegangenen Angebote.</td></tr>}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-muted">Hinweis: GRENFORD berät unabhängig. Die Vergabeentscheidung trifft der Kunde; Originalangebote bleiben dem Projekt zugeordnet.</p>
    </Modal>
  );
}

/** Vergabe dokumentieren – Entscheidung durch den Kunden; GRENFORD-Verbindlichkeit nur, wenn GRENFORD Auftraggeber ist */
function VergabeModal({ p, angebote, guName, onClose }: { p: ProjectsProjekt; angebote: Angebot[]; guName: (a: Angebot) => string; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const wahl = angebote.filter((a) => a.summe !== undefined && a.status !== "Abgelehnt");
  return (
    <FormModal
      titel={`Vergabe dokumentieren – ${p.id}`}
      hinweis="Die Vergabeentscheidung trifft der Kunde. Beauftragt der Kunde den GU direkt, entsteht keine GRENFORD-Verbindlichkeit. Nur wenn GRENFORD selbst Auftraggeber ist, wird eine Verbindlichkeit angelegt."
      felder={[
        { key: "angebotId", label: "Gewähltes Angebot (Entscheidung Kunde)", typ: "select", pflicht: true, breit: true, options: wahl.map((a) => ({ value: a.id, label: `${guName(a)} – ${euro(a.summe!)} (${a.umfang})` })) },
        { key: "datum", label: "Datum der Entscheidung", typ: "datum", pflicht: true },
        { key: "vergabesumme", label: "Provisionspflichtige Netto-Bausumme inkl. vereinbarter Nachträge (€)", typ: "zahl", pflicht: true, breit: true },
        { key: "auftraggeber", label: "Auftraggeber des GU", typ: "select", pflicht: true, options: [{ value: "Kunde", label: "Kunde (Direktbeauftragung – Standard)" }, { value: "GRENFORD", label: "GRENFORD (GRENFORD ist Zahlungsschuldner)" }] },
      ]}
      start={{ angebotId: p.vergabe?.angebotId ?? wahl[0]?.id ?? "", datum: p.vergabe?.datum ?? crm.heute, vergabesumme: String(p.vergabe?.vergabesumme ?? wahl[0]?.summe ?? ""), auftraggeber: p.vergabe?.auftraggeber ?? "Kunde" }}
      onClose={onClose}
      speichern={(w) => {
        const aId = text(w.angebotId);
        const summe = zahl(w.vergabesumme);
        const auftraggeber = text(w.auftraggeber);
        for (const a of angebote) {
          const status: Angebot["status"] = a.id === aId ? "Beauftragt" : a.status === "Angefragt" ? "Angefragt" : "Abgelehnt";
          if (status !== a.status) crm.speichere("angebote", { ...a, status });
        }
        const a = angebote.find((x) => x.id === aId)!;
        crm.speichere("projectsProjekte", { ...p, vergabe: { angebotId: aId, datum: text(w.datum), vergabesumme: summe, auftraggeber }, phase: p.phase < "E1" ? "E1" : p.phase }, { ref: p.id, text: `Vergabe dokumentiert: ${guName(a)} (${euro(summe)}), Auftraggeber ${auftraggeber}` });
        if (vergabeErzeugtVerbindlichkeit(auftraggeber)) {
          const g = crm.guPartner.find((x) => x.id === a.guId);
          const nr = crm.nummer("verbindlichkeit");
          const faellig = new Date(Date.parse(text(w.datum)) + 30 * 86_400_000).toISOString().slice(0, 10);
          crm.speichere("verbindlichkeiten", { nr, empfaenger: guName(a), referenz: p.id, bereich: "Projects", typ: "Bau- / GU-Leistung", betrag: summe, faellig, empfaengerRef: g ? { art: "unternehmen", id: g.unternehmenId } : undefined, quelle: p.id }, { ref: p.id, text: `Verbindlichkeit ${nr} (GRENFORD als Auftraggeber) angelegt` });
        }
        toast(`Vergabe dokumentiert${auftraggeber === "Kunde" ? " – keine GRENFORD-Verbindlichkeit (Direktbeauftragung)" : " – Verbindlichkeit angelegt"} ${TESTMODUS}`);
      }}
    />
  );
}
