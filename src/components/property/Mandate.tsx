"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Building2, CircleDot, Clock3, FolderOpen, Handshake, Home, Layers, MapPin, Search, ShieldCheck, Target, TrendingUp, Wallet } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe } from "@/lib/crm/logic";
import { MANDAT_STATUS, PHASEN_PROPERTY, VERMARKTUNG_STATUS, naechsteNummer, passend, phaseTitel, type PropertyMandat } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import type { Objekt } from "@/lib/crm/types";
import { euroCompact, euroMio } from "@/lib/format";
import { Avatar, Badge, BereichMarke, Button, Menu, StatusBadge } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { Panel } from "@/components/crm/page";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, refAus, refZu, text, zahl, type Feld } from "@/components/modul/FormModal";
import {
  AufgabenPanel, BeteiligtePanel, DetailKopf, DetailTabs, DokumentDialog, DokumentePanel, LetzteAktivitaeten, NichtGefunden, PhasenLeiste, RefLink, TESTMODUS, VerlaufPanel, bezugVorgang,
} from "@/components/modul/detail";
import { InfoPanel, KaeuferprozessDetail, KaeuferprozessListe, KaeuferprozessModal } from "@/components/modul/kaeufer";
import { FinanzPanel } from "@/components/modul/FinanzPanel";

export const OBJEKTARTEN = ["Mehrfamilienhaus", "Eigentumswohnung", "Einfamilienhaus", "Doppelhaushälfte", "Penthouse", "Wohn- und Geschäftshaus", "Zinshaus", "Büro / Gewerbe", "Hotel", "Grundstück", "Wohnportfolio", "Mixed-Use"];
const courtage = (m: PropertyMandat) => Math.round((m.preis * m.courtageSatz) / 100);

function WV({ d, heute }: { d?: string; heute: string }) {
  if (!d) return <span className="text-muted">—</span>;
  return <span className="flex items-center gap-1.5 whitespace-nowrap"><span className={`h-[8px] w-[8px] rounded-full ${d < heute ? "bg-neg" : "bg-[#f2b84b]"}`} />{datumDe(d)}</span>;
}

export function MandateListe() {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const rows = crm.propertyMandate;
  const obj = (m: PropertyMandat) => crm.objektById(m.objektId);
  const aktiv = (m: PropertyMandat) => !["Abgeschlossen", "Inaktiv"].includes(m.status);
  const ids = new Set(rows.map((m) => m.id));
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Property" }, { label: "Objekte & Mandate" }]}
        titel="Objekte & Mandate"
        untertitel="Alle Verkaufsobjekte, Vermietungsobjekte und Mandate – von der Akquise bis zum Abschluss."
        neu={{ label: "Neues Objekt / Mandat", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(m) => [m.id, obj(m)?.titel, obj(m)?.nummer, obj(m)?.ort, obj(m)?.adresse, crm.refName(m.eigentuemer)]}
        suchePlatzhalter="Objekte & Mandate suchen …"
        href={(m) => HREF.mandat(m.id)}
        defaultSort={{ key: "wv", richtung: "asc" }}
        columns={[
          { key: "name", header: "Objektname", sort: (m) => obj(m)?.titel ?? "", cell: (m) => <div className="flex items-center gap-2.5"><Avatar name={obj(m)?.titel ?? m.id} bild={obj(m)?.bild} size={34} rund={false} /><div><div className="font-semibold text-navy-950">{obj(m)?.titel}</div><div className="text-[10.5px] text-muted">{obj(m)?.nummer} · Mandat {m.id}</div></div></div> },
          { key: "art", header: "Assetklasse", sort: (m) => obj(m)?.objektart ?? "", cell: (m) => <Badge tone="gray">{obj(m)?.objektart ?? "—"}</Badge> },
          { key: "ort", header: "Standort", sort: (m) => obj(m)?.ort ?? "", cell: (m) => <span className="text-ink-soft">{obj(m)?.ort}</span> },
          { key: "preis", header: "Preis (Mio. €)", sort: (m) => m.preis, cell: (m) => (m.preis / 1e6).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
          { key: "typ", header: "Mandatstyp", sort: (m) => m.mandatstyp, cell: (m) => <Badge tone="blue">{m.mandatstyp}</Badge> },
          { key: "status", header: "Status", sort: (m) => m.status, cell: (m) => <StatusBadge status={m.status} /> },
          { key: "next", header: "Nächster Schritt", cell: (m) => <span className="line-clamp-2 max-w-[120px] text-ink-soft">{m.naechsterSchritt || "—"}</span> },
          { key: "wv", header: "Wiedervorlage", sort: (m) => m.wiedervorlage ?? "9999", cell: (m) => <WV d={m.wiedervorlage} heute={crm.heute} /> },
        ]}
        filter={[
          { key: "status", label: "Status", wert: (m) => m.status, inBar: true },
          { key: "typ", label: "Mandatstyp", wert: (m) => m.mandatstyp, inBar: true },
          { key: "art", label: "Assetklasse", wert: (m) => obj(m)?.objektart ?? "—", inBar: true },
          { key: "region", label: "Region", wert: (m) => obj(m)?.ort ?? "—", inBar: true },
          { key: "vermarktung", label: "Vermarktungsstatus", wert: (m) => m.vermarktung, offen: true },
        ]}
        quick={[
          { id: "", label: "Alle Objekte & Mandate", icon: Layers, test: () => true },
          { id: "aktiv", label: "Aktive Mandate", icon: CircleDot, test: (m) => m.status === "Aktiv" },
          { id: "vorbereitung", label: "In Vorbereitung", icon: Clock3, test: (m) => m.status === "In Vorbereitung" },
          { id: "pruefung", label: "In Prüfung", icon: Search, test: (m) => m.status === "In Prüfung" },
          { id: "verhandlung", label: "In Verhandlung", icon: Handshake, test: (m) => m.status === "In Verhandlung" },
          { id: "closing", label: "Beurkundung / Closing", icon: Target, test: (m) => m.status === "Beurkundung / Closing" },
          { id: "abgeschlossen", label: "Abgeschlossen", icon: ShieldCheck, test: (m) => m.status === "Abgeschlossen" },
          { id: "inaktiv", label: "Inaktiv", icon: ShieldCheck, test: (m) => m.status === "Inaktiv" },
        ]}
        kpis={[
          { label: "Gesamt", icon: Home, wert: (r) => r.length, sub: "Objekte & Mandate", quick: "" },
          { label: "Gesamtvolumen (KP)", icon: Wallet, wert: (r) => euroMio(r.reduce((s, m) => s + m.preis, 0) / 1e6, 1), sub: "aller Objekte" },
          { label: "Erwartete GRENFORD-Courtage", icon: BarChart3, wert: (r) => euroMio(r.filter(aktiv).reduce((s, m) => s + courtage(m), 0) / 1e6, 2), sub: "(bei Zielcourtage, aktive Mandate)" },
          { label: "Aktive Mandate", icon: TrendingUp, wert: (r) => r.filter(aktiv).length, sub: "in Bearbeitung", quick: "aktiv" },
          { label: "Abgeschlossene Mandate", icon: Handshake, wert: (r) => r.filter((m) => m.status === "Abgeschlossen").length, sub: "dieses Jahr", quick: "abgeschlossen" },
        ]}
        csv={{ datei: "property-objekte-mandate.csv", kopf: ["Objekt-ID", "Objekt", "Mandats-ID", "Mandatstyp", "Objektart", "Standort", "Eigentümer", "Preis", "Courtage %", "Mandatsstatus", "Vermarktungsstatus", "Phase", "Nächster Schritt", "Wiedervorlage"], zeile: (m) => [obj(m)?.nummer ?? m.objektId, obj(m)?.titel ?? "", m.id, m.mandatstyp, obj(m)?.objektart ?? "", obj(m)?.ort ?? "", crm.refName(m.eigentuemer), m.preis, m.courtageSatz, m.status, m.vermarktung, phaseTitel(PHASEN_PROPERTY, m.phase), m.naechsterSchritt, m.wiedervorlage ? datumDe(m.wiedervorlage) : ""] }}
        statusAenderung={{ werte: MANDAT_STATUS, setze: (sel, s) => sel.forEach((id) => { const m = rows.find((x) => x.id === id)!; crm.speichere("propertyMandate", { ...m, status: s as PropertyMandat["status"] }, { ref: id, text: `Mandatsstatus → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "vorgang" && ids.has(b.id)))}
        card={(m) => (
          <div className="card h-full p-3 hover:shadow-md">
            <div className="flex gap-3"><Avatar name={obj(m)?.titel ?? ""} bild={obj(m)?.bild} size={48} rund={false} /><div className="min-w-0"><div className="truncate text-[13px] font-semibold text-navy-950">{obj(m)?.titel}</div><div className="text-[11px] text-muted">{m.id} · {obj(m)?.ort}</div></div></div>
            <div className="mt-2 flex items-center justify-between text-[11.5px]"><span>{euroCompact(m.preis)}</span><Badge tone="blue">{m.mandatstyp}</Badge><StatusBadge status={m.status} /></div>
          </div>
        )}
      />
      {neu && <MandatModal onClose={() => setNeu(false)} />}
    </>
  );
}

export function MandatModal({ initial, onClose, vorbelegung }: { initial?: PropertyMandat; onClose: () => void; vorbelegung?: Partial<PropertyMandat> }) {
  const crm = useCrm();
  const toast = useToast();
  const router = useRouter();
  const m = initial ?? vorbelegung;
  const felder: Feld[] = [
    { key: "objektId", label: "Objekt (zentraler Objektbestand)", typ: "objekt", pflicht: true, breit: true },
    { key: "mandatstyp", label: "Mandatstyp", typ: "select", pflicht: true, options: ["Verkauf", "Vermietung"] },
    { key: "eigentuemer", label: "Eigentümer (aus Stammdaten)", typ: "ref" },
    { key: "preis", label: "Kaufpreis / Angebotspreis (€)", typ: "zahl", pflicht: true },
    { key: "courtageSatz", label: "Courtage (%, netto)", typ: "zahl", pflicht: true },
    { key: "courtageModell", label: "Courtagemodell", typ: "select", options: ["Käufercourtage", "Verkäufercourtage", "Geteilte Courtage", "Vermietercourtage"] },
    { key: "status", label: "Mandatsstatus", typ: "select", pflicht: true, options: MANDAT_STATUS },
    { key: "vermarktung", label: "Vermarktungsstatus", typ: "select", pflicht: true, options: VERMARKTUNG_STATUS },
    { key: "phase", label: "Phase", typ: "select", pflicht: true, options: PHASEN_PROPERTY.flatMap((p) => p.unter.map((u) => ({ value: u.code, label: `${u.code} – ${u.titel} (${p.titel})` }))) },
    { key: "vermarktungsart", label: "Vermarktungsart", typ: "select", options: ["Off-Market", "Exklusiv", "Bieterverfahren", "Offene Vermarktung"] },
    { key: "vertragVon", label: "Mandat von", typ: "datum" },
    { key: "vertragBis", label: "Mandat bis", typ: "datum" },
    { key: "naechsterSchritt", label: "Nächster Schritt", typ: "text" },
    { key: "wiedervorlage", label: "Wiedervorlage", typ: "datum" },
  ];
  return (
    <FormModal
      titel={initial ? `Mandat ${initial.id} bearbeiten` : "Neues Objekt / Mandat"}
      hinweis="Objekt und Mandat sind getrennt: Das Objekt existiert einmal im zentralen Bestand (ggf. vorhandenes wird verknüpft), das Mandat ist der Vermarktungsauftrag. Ein Objekt kann über die Zeit mehrere Mandate haben."
      felder={felder}
      start={{
        objektId: m?.objektId ?? "", mandatstyp: m?.mandatstyp ?? "Verkauf", eigentuemer: refZu(m?.eigentuemer), preis: m?.preis ? String(m.preis) : "", courtageSatz: String(m?.courtageSatz ?? 3.57).replace(".", ","), courtageModell: m?.courtageModell ?? "Käufercourtage",
        status: m?.status ?? "In Vorbereitung", vermarktung: m?.vermarktung ?? "Vorbereitung", phase: m?.phase ?? "A1", vermarktungsart: m?.vermarktungsart ?? "Off-Market", vertragVon: m?.vertragVon ?? crm.heute, vertragBis: m?.vertragBis ?? "", naechsterSchritt: m?.naechsterSchritt ?? "", wiedervorlage: m?.wiedervorlage ?? "",
      }}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? naechsteNummer(`PROP-${crm.heute.slice(0, 4)}-`, crm.propertyMandate.map((x) => x.id));
        crm.speichere("propertyMandate", {
          erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, tags: [], beteiligte: [], ...m,
          id, objektId: text(w.objektId), mandatstyp: text(w.mandatstyp), eigentuemer: refAus(w.eigentuemer), preis: zahl(w.preis), courtageSatz: zahl(w.courtageSatz), courtageModell: text(w.courtageModell),
          status: text(w.status) as PropertyMandat["status"], vermarktung: text(w.vermarktung) as PropertyMandat["vermarktung"], phase: text(w.phase), vermarktungsart: text(w.vermarktungsart), vertragVon: text(w.vertragVon), vertragBis: text(w.vertragBis),
          naechsterSchritt: text(w.naechsterSchritt), wiedervorlage: text(w.wiedervorlage) || undefined,
        } as PropertyMandat, { ref: id, text: initial ? "Mandatsdaten geändert" : `Mandat ${id} angelegt` });
        toast(`Mandat ${id} ${initial ? "gespeichert" : "angelegt"} ${TESTMODUS}`);
        if (!initial) router.push(HREF.mandat(id));
      }}
    />
  );
}

/** Objekt-Stammsatz bearbeiten (zentral – wirkt in allen Bereichen) */
export function ObjektModal({ o, onClose }: { o: Objekt; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  return (
    <FormModal
      titel={`Objekt ${o.nummer ?? o.id} bearbeiten`}
      hinweis="Änderungen am Objekt-Stammsatz wirken in allen Geschäftsbereichen und Vorgängen, die auf dieses Objekt verweisen."
      felder={[
        { key: "titel", label: "Objektbezeichnung", typ: "text", pflicht: true }, { key: "ort", label: "Ort", typ: "text", pflicht: true }, { key: "adresse", label: "Adresse", typ: "text", breit: true },
        { key: "objektart", label: "Objektart", typ: "select", options: OBJEKTARTEN }, { key: "einheiten", label: "Einheiten", typ: "zahl" }, { key: "wohnflaeche", label: "Wohn-/Nutzfläche (m²)", typ: "zahl" },
        { key: "grundstueck", label: "Grundstück (m²)", typ: "zahl" }, { key: "baujahr", label: "Baujahr", typ: "zahl" }, { key: "zustand", label: "Zustand", typ: "text" },
      ]}
      start={{ titel: o.titel, ort: o.ort, adresse: o.adresse ?? "", objektart: o.objektart ?? "", einheiten: o.einheiten ? String(o.einheiten) : "", wohnflaeche: o.wohnflaeche ? String(o.wohnflaeche) : "", grundstueck: o.grundstueck ? String(o.grundstueck) : "", baujahr: o.baujahr ? String(o.baujahr) : "", zustand: o.zustand ?? "" }}
      onClose={onClose}
      speichern={(w) => {
        crm.speichere("objekte", { ...o, titel: text(w.titel), ort: text(w.ort), adresse: text(w.adresse) || undefined, objektart: text(w.objektart) || undefined, einheiten: zahl(w.einheiten) || undefined, wohnflaeche: zahl(w.wohnflaeche) || undefined, grundstueck: zahl(w.grundstueck) || undefined, baujahr: zahl(w.baujahr) || undefined, zustand: text(w.zustand) || undefined }, { ref: o.id, text: "Objekt-Stammsatz geändert" });
        toast(`Objekt gespeichert ${TESTMODUS}`);
      }}
    />
  );
}

/** Alle Vorgänge zu einem Objekt – über alle Geschäftsbereiche (ein Objekt, mehrere Vorgänge) */
export function ObjektVorgaenge({ objektId, ausser }: { objektId: string; ausser?: string }) {
  const crm = useCrm();
  const liste = crm.vorgaenge.filter((v) => v.objektId === objektId && v.id !== ausser && !(v.referenz && v.referenz !== v.id && crm.vorgaenge.some((x) => x.id === v.referenz)));
  return (
    <Panel titel={`Weitere Vorgänge zu diesem Objekt (${liste.length})`}>
      <ul className="divide-y divide-line-soft">
        {liste.map((v) => (
          <li key={v.id} className="flex items-center gap-2 py-2 text-[12px]">
            <BereichMarke bereich={v.geschaeftsbereich} />
            {v.href ? <Link href={v.href} className="min-w-0 flex-1 truncate font-semibold text-navy-950 hover:underline">{v.id} · {v.titel}</Link> : <span className="min-w-0 flex-1 truncate">{v.titel}</span>}
            <span className="truncate text-[11px] text-muted">{v.art}</span>
          </li>
        ))}
        {!liste.length && <li className="py-2 text-[12px] text-muted">Keine weiteren Vorgänge.</li>}
      </ul>
    </Panel>
  );
}

type Tab = "uebersicht" | "kaeufer" | "interessenten" | "aktivitaeten" | "aufgaben" | "beteiligte" | "dokumente" | "finanzen" | "notizen" | "verlauf";

export function MandatDetail({ id, kaeuferId }: { id: string; kaeuferId?: string }) {
  const crm = useCrm();
  const toast = useToast();
  const m = crm.propertyMandate.find((x) => x.id === id);
  const kps = crm.kaeuferprozesse.filter((k) => k.projektId === id);
  const [tab, setTab] = useState<Tab>(kaeuferId ? "kaeufer" : "uebersicht");
  const [auswahl, setAuswahl] = useState(kaeuferId ?? kps.find((k) => k.status === "Aktiv")?.id ?? kps[0]?.id);
  const [modal, setModal] = useState<"edit" | "kp" | "dok" | "objekt" | null>(null);
  if (!m) return <NichtGefunden was="Mandat" href="/property/objekte" />;
  const o = crm.objektById(m.objektId);
  const refIds = [m.id, ...kps.map((k) => k.id)];
  const akt = crm.aktivitaetenVon(...refIds);
  const aufgaben = akt.filter((a) => a.typ === "Aufgabe");
  const kp = kps.find((k) => k.id === auswahl);
  const speichern = (neu: PropertyMandat, t: string) => { crm.speichere("propertyMandate", neu, { ref: m.id, text: t }); toast(`${t} ${TESTMODUS}`); };
  const andereMandate = crm.propertyMandate.filter((x) => x.objektId === m.objektId && x.id !== m.id);
  const interessenten = passend(
    { objektarten: [o?.objektart ?? ""], regionen: [o?.ort ?? ""], von: m.preis / 1e6, bis: m.preis / 1e6 },
    crm.interessenten.filter((i) => i.status !== "Inaktiv" && i.status !== "Abgeschlossen"),
    (i) => ({ objektart: i.objektarten.join(" "), standort: i.regionen.join(" "), volumen: ((i.budgetVon + i.budgetBis) / 2) * 1e6 }),
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <DetailKopf
        crumbs={[{ label: "Property", href: "/property/objekte" }, { label: kaeuferId ? "Käuferprozesse" : "Objekte & Mandate", href: kaeuferId ? "/property/kaeuferprozesse" : "/property/objekte" }, { label: kaeuferId ?? m.id }]}
        bild={o?.bild}
        bilder={o?.bild ? 12 : 0}
        idBadge={kaeuferId ?? m.id}
        titel={`${o?.titel ?? m.id}${o?.einheiten && o.einheiten > 1 && o.objektart === "Eigentumswohnung" ? ` – ${o.einheiten} DG-Einheiten` : ""}`}
        meta={[
          { icon: <MapPin className="h-4 w-4" />, text: o?.ort ?? "—" },
          { icon: <Building2 className="h-4 w-4" />, text: o?.objektart ?? "—" },
          { icon: <TrendingUp className="h-4 w-4" />, text: m.vermarktungsart },
          { icon: <span className={`h-2 w-2 rounded-full ${m.status === "Abgeschlossen" || m.status === "Inaktiv" ? "bg-muted" : "bg-pos"}`} />, text: m.status },
        ]}
        tags={[{ label: m.mandatstyp, cls: "bg-pos-bg text-pos" }, ...m.tags.map((t, i) => ({ label: t, cls: ["bg-[#fdeee2] text-[#b4570f]", "bg-pos-bg text-pos", "bg-royal-100 text-navy-900"][i % 3] }))]}
        kennzahlen={[
          { label: "Kaufpreis (Indikation)", wert: euroCompact(m.preis), sub: `Ziel: ${euroCompact(m.preis)} (${m.mandatstyp})` },
          { label: "Preis/m² (aktuell)", wert: o?.wohnflaeche ? `${Math.round(m.preis / o.wohnflaeche).toLocaleString("de-DE")} €` : "—" },
          { label: "Courtage", wert: `${String(m.courtageSatz).replace(".", ",")} %`, sub: euroCompact(courtage(m)) },
          { label: "Käufer-Interesse", wert: kps.filter((k) => k.status === "Aktiv").length >= 3 ? "Hoch" : kps.length ? "Mittel" : "—" },
          { label: "Einheiten", wert: o?.einheiten ?? "—" },
          { label: "Wohnfläche", wert: o?.wohnflaeche ? `${o.wohnflaeche} m²` : "—" },
          { label: "Standort", wert: o?.ort ?? "—" },
          { label: "Vermarktungsart", wert: m.vermarktungsart },
        ]}
        aktionen={
          <>
            <Button size="sm" onClick={() => setModal("edit")}>Bearbeiten</Button>
            <Button size="sm" onClick={() => setModal("dok")}>Dokument erfassen</Button>
            <Button size="sm" onClick={() => toast("Google Drive ist nicht verbunden – der Objektordner wird nach der Einrichtung verknüpft.")}><FolderOpen className="h-3.5 w-3.5" />Objektordner · Google Drive</Button>
            <Menu label="Weitere Aktionen" items={[
              { label: "Neuer Käuferprozess", onClick: () => setModal("kp") },
              { label: "Objekt-Stammsatz bearbeiten", onClick: () => setModal("objekt") },
              ...MANDAT_STATUS.filter((s) => s !== m.status).map((s) => ({ label: `Mandatsstatus „${s}“`, onClick: () => speichern({ ...m, status: s }, `Mandatsstatus → ${s}`) })),
              ...VERMARKTUNG_STATUS.filter((s) => s !== m.vermarktung).map((s) => ({ label: `Vermarktung „${s}“`, onClick: () => speichern({ ...m, vermarktung: s }, `Vermarktungsstatus → ${s}`) })),
            ]} trigger={<span className="flex h-[32px] items-center rounded-[6px] bg-navy-900 px-3 text-[12px] font-semibold text-white">Weitere Aktionen</span>} />
          </>
        }
      />
      <PhasenLeiste phasen={PHASEN_PROPERTY} aktuell={m.phase} onWechsel={(c) => speichern({ ...m, phase: c }, `Phase → ${phaseTitel(PHASEN_PROPERTY, c)}`)} />
      <DetailTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "uebersicht", label: "Übersicht" }, { id: "kaeufer", label: "Käuferprozesse", anzahl: kps.length }, { id: "interessenten", label: "Interessenten", anzahl: interessenten.length }, { id: "aktivitaeten", label: "Aktivitäten" },
          { id: "aufgaben", label: "Aufgaben", anzahl: aufgaben.filter((a) => !a.erledigt).length }, { id: "beteiligte", label: "Ansprechpartner", anzahl: m.beteiligte.length }, { id: "dokumente", label: "Dokumente", anzahl: crm.dokumente.filter((d) => refIds.includes(d.ref)).length },
          { id: "finanzen", label: "Finanzen" }, { id: "notizen", label: "Notizen" }, { id: "verlauf", label: "Verlauf" },
        ]}
      />
      <div className="mt-4">
        {(tab === "uebersicht" || tab === "kaeufer") && (
          <div className="grid gap-[12px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.95fr)]">
            <div className="space-y-[12px]">
              <KaeuferprozessListe prozesse={kps} phasen={PHASEN_PROPERTY} auswahl={auswahl} onWahl={setAuswahl} onNeu={() => setModal("kp")} />
              <InfoPanel titel="Objektinformationen" onBearbeiten={() => setModal("objekt")} rows={[
                ["Objektname", o?.titel ?? "—"], ["Objekt-ID", o?.nummer ?? m.objektId], ["Mandats-ID", m.id], ["Objektart", o?.objektart ?? "—"], ["Adresse", o?.adresse ?? o?.ort ?? "—"],
                ["Einheiten", o?.einheiten ? String(o.einheiten) : "—"], ["Wohnfläche", o?.wohnflaeche ? `${o.wohnflaeche} m²` : "—"], ["Grundstück", o?.grundstueck ? `${o.grundstueck} m²` : "—"],
                ["Kaufpreis (Indikation)", euroCompact(m.preis)], ["Zustand", o?.zustand ?? "—"], ["Eigentümer", <RefLink key="e" r={m.eigentuemer} fallback="noch nicht eindeutig – bitte prüfen" />],
                ["Courtage", `${String(m.courtageSatz).replace(".", ",")} % (${m.courtageModell})`], ["Mandatslaufzeit", `${datumDe(m.vertragVon)} – ${m.vertragBis ? datumDe(m.vertragBis) : "offen"}`],
                ["Mandatsstatus", <StatusBadge key="s" status={m.status} />], ["Vermarktungsstatus", <StatusBadge key="v" status={m.vermarktung} />], ["Verantwortlicher", crm.benutzerName(m.verantwortlichId)],
              ]} />
            </div>
            <div>{kp ? <KaeuferprozessDetail k={kp} phasen={PHASEN_PROPERTY} objektTitel={o?.titel ?? m.id} /> : <div className="card p-6 text-center text-[12px] text-muted">Käuferprozess auswählen oder neu anlegen.</div>}</div>
            <div className="space-y-[12px]">
              <AufgabenPanel aufgaben={aufgaben} bezug={bezugVorgang(m.id)} />
              <LetzteAktivitaeten aktivitaeten={akt} onAlle={() => setTab("aktivitaeten")} />
              <BeteiligtePanel beteiligte={m.beteiligte} onAendern={(b) => speichern({ ...m, beteiligte: b }, "Beteiligte geändert")} />
              {andereMandate.length > 0 && (
                <Panel titel="Frühere / weitere Mandate zum Objekt">
                  <ul className="text-[12px]">{andereMandate.map((x) => <li key={x.id}><Link className="text-royal-600 hover:underline" href={HREF.mandat(x.id)}>{x.id}</Link> · {x.mandatstyp} · {x.status}</li>)}</ul>
                </Panel>
              )}
              <ObjektVorgaenge objektId={m.objektId} ausser={m.id} />
            </div>
          </div>
        )}
        {tab === "interessenten" && (
          <Panel titel="Passende Interessenten (Objektart, Region, Budget)">
            <ul className="divide-y divide-line-soft">
              {interessenten.map(({ k: i, score }) => (
                <li key={i.id} className="flex items-center gap-3 py-2 text-[12px]">
                  <Avatar name={crm.refName(i.ref)} size={30} />
                  <Link href={HREF.interessent(i.id)} className="flex-1 font-semibold text-navy-950 hover:underline">{crm.refName(i.ref)} <span className="font-normal text-muted">· {i.id} · {i.typ}</span></Link>
                  <span>{i.budgetVon}–{i.budgetBis} Mio. €</span><span className="text-[11px] text-pos">{score}/3</span>
                  {kps.some((k) => k.kaeufer.id === i.ref.id) ? <span className="text-[11px] text-muted">Käuferprozess besteht</span> : <button type="button" className="link-more" onClick={() => setModal("kp")}>Käuferprozess anlegen</button>}
                </li>
              ))}
              {!interessenten.length && <li className="py-3 text-[12px] text-muted">Keine passenden Interessenten.</li>}
            </ul>
          </Panel>
        )}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={akt.filter((a) => a.typ !== "Notiz")} bezug={bezugVorgang(m.id)} />}
        {tab === "notizen" && <AktivitaetenPanel nurNotizen aktivitaeten={akt.filter((a) => a.typ === "Notiz")} bezug={bezugVorgang(m.id)} />}
        {tab === "aufgaben" && <AufgabenPanel titel="Aufgaben" aufgaben={aufgaben} bezug={bezugVorgang(m.id)} />}
        {tab === "beteiligte" && <BeteiligtePanel titel="Ansprechpartner & Beteiligte" beteiligte={m.beteiligte} onAendern={(b) => speichern({ ...m, beteiligte: b }, "Beteiligte geändert")} />}
        {tab === "dokumente" && <DokumentePanel refIds={refIds} />}
        {tab === "finanzen" && <FinanzPanel refIds={refIds} bereich="Property" zahler={kps.find((k) => k.status === "Gekauft")?.kaeufer ?? kp?.kaeufer} basis={m.preis} satz={m.courtageSatz} />}
        {tab === "verlauf" && <VerlaufPanel refIds={refIds} />}
      </div>
      {modal === "edit" && <MandatModal initial={m} onClose={() => setModal(null)} />}
      {modal === "kp" && <KaeuferprozessModal bereich="Property" projektId={m.id} onClose={() => setModal(null)} />}
      {modal === "dok" && <DokumentDialog refId={m.id} onClose={() => setModal(null)} />}
      {modal === "objekt" && o && <ObjektModal o={o} onClose={() => setModal(null)} />}
    </div>
  );
}
