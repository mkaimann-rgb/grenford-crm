"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck, Building2, CircleCheck, CircleDot, CirclePause, CircleSlash, FileText, Handshake, HardHat, House, KeyRound, Palmtree, Search, Share2, Star, Target, UserCheck, UserPlus, UserRound, Users, Wrench, type LucideIcon,
} from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { addDays, datumDe, naechste, notizen, personName, regionVon, suchtreffer, summeBudget, zaehle } from "@/lib/crm/logic";
import { GESCHAEFTSBEREICHE, type Person, type Vorhaben } from "@/lib/crm/types";
import { euroCompact } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Avatar, Badge, BereichBadges, FilterSelect, MultiFilter, SearchInput, StatusBadge } from "@/components/ui/controls";
import { PRUEFEN, passtBereich } from "@/lib/crm/bereiche";
import { useToast } from "@/components/ui/toast";
import { CheckGroup, FilterBar, KpiRow, ListLayout, NotizenCard, PageHeader, QuickFilterCard, TermineCard } from "./page";
import { PersonModal, personHref, type PersonRolle } from "./modals";

export type PersonZeile = Person & {
  name: string;
  rolleStatus: string;
  unternehmen: string;
  position: string;
  abteilung: string;
  rolle: string;
  region: string;
  letzte: string;
  vorhaben: Vorhaben[];
  budget: number;
  interessen: string[];
  neu: boolean;
};

type FilterDef = { key: string; label: string; wert: (z: PersonZeile) => string | string[]; inBar?: boolean; offen?: boolean };
type QuickDef = { id: string; label: string; icon: LucideIcon; test: (z: PersonZeile) => boolean };
type KpiDef = { label: string; icon: LucideIcon; wert: (rows: PersonZeile[]) => number; sub: string; quick?: string; href?: string };

function budgetBucket(b: number) {
  if (!b) return "ohne Angabe";
  if (b < 500_000) return "bis 0,5 Mio. €";
  if (b < 1_000_000) return "0,5–1 Mio. €";
  if (b < 2_000_000) return "1–2 Mio. €";
  return "über 2 Mio. €";
}

const BEREICH_SPALTE: Column<PersonZeile> = {
  key: "bereich", header: "Geschäftsbereich", sort: (z) => z.bereiche.map((b) => b.bereich).join() || "~",
  cell: (z) => <BereichBadges kompakt bereiche={z.bereiche} pruefen={z.bereichPruefen} />, className: "w-[104px]",
};

const KONFIG: Record<PersonRolle, {
  titel: string; untertitel: string; neu: string; suche: string; filter: FilterDef[]; quick: QuickDef[]; kpis: KpiDef[]; spalten: (crm: ReturnType<typeof useCrm>) => Column<PersonZeile>[]; csv: string;
}> = {
  kontakt: {
    titel: "Ansprechpartner", untertitel: "Alle Kontakte aus unseren Unternehmensbeziehungen, Projekten und Netzwerken.", neu: "Neuer Ansprechpartner", suche: "Ansprechpartner suchen …", csv: "ansprechpartner.csv",
    filter: [
      { key: "unternehmen", label: "Alle Unternehmen", wert: (z) => z.kontakte.length ? z.unternehmen : "ohne Unternehmen", inBar: true },
      { key: "rolle", label: "Alle Rollen", wert: (z) => z.rolle, inBar: true, offen: true },
      { key: "abteilung", label: "Abteilung", wert: (z) => z.abteilung || "ohne Angabe" },
      { key: "status", label: "Alle Status", wert: (z) => z.status, inBar: true },
      { key: "position", label: "Position", wert: (z) => z.position || "ohne Angabe" },
      { key: "region", label: "Region", wert: (z) => z.region },
    ],
    quick: [
      { id: "", label: "Alle Ansprechpartner", icon: Users, test: () => true },
      { id: "entscheider", label: "Entscheider (C-Level / GF)", icon: Star, test: (z) => z.kontakte.some((k) => k.rolle === "Entscheider" || k.leitung) },
      { id: "projekt", label: "Projektkontakte", icon: Building2, test: (z) => z.kontakte.some((k) => k.rolle === "Projektkontakt") },
      { id: "investor", label: "Investoren", icon: Target, test: (z) => z.kontakte.some((k) => k.rolle === "Investor") },
      { id: "privat", label: "Privatkunden", icon: UserRound, test: (z) => !!z.privat },
      { id: "gu", label: "GU-Partner", icon: HardHat, test: (z) => z.kontakte.some((k) => k.rolle === "GU-Partner") },
      { id: "empfehlung", label: "Empfehlungspartner", icon: Share2, test: (z) => z.kontakte.some((k) => k.rolle === "Empfehlungspartner") },
      { id: "kontakt", label: "In Kontakt", icon: UserCheck, test: (z) => z.status === "In Kontakt" },
      { id: "potenzial", label: "Potenzial", icon: CirclePause, test: (z) => z.status === "Potenzial" },
      { id: "inaktiv", label: "Inaktiv", icon: CircleSlash, test: (z) => z.status === "Inaktiv" },
    ],
    kpis: [
      { label: "Gesamt", icon: Users, wert: (r) => r.length, sub: "Ansprechpartner", quick: "" },
      { label: "Aktive Kontakte", icon: UserCheck, wert: (r) => r.filter((z) => z.status === "Aktiv" || z.status === "In Kontakt").length, sub: "in Kontakt" },
      { label: "Neue Kontakte", icon: UserPlus, wert: (r) => r.filter((z) => z.neu).length, sub: "letzte 30 Tage" },
      { label: "Entscheider", icon: Star, wert: (r) => r.filter((z) => z.kontakte.some((k) => k.rolle === "Entscheider" || k.leitung)).length, sub: "C-Level / GF", quick: "entscheider" },
      { label: "Projektkontakte", icon: Building2, wert: (r) => r.filter((z) => z.kontakte.some((k) => k.rolle === "Projektkontakt")).length, sub: "mit Projekten verknüpft", quick: "projekt" },
    ],
    spalten: () => [
      { key: "name", header: "Name", sort: (z) => z.nachname, cell: (z) => <div className="flex items-center gap-2.5"><Avatar name={z.name} size={30} /><span className="font-semibold text-navy-950">{z.name}</span></div> },
      BEREICH_SPALTE,
      { key: "position", header: "Position", sort: (z) => z.position, cell: (z) => <span title={z.position} className="line-clamp-2 max-w-[116px] hyphens-auto text-ink-soft">{z.position || "—"}</span> },
      { key: "unternehmen", header: "Unternehmen", sort: (z) => z.unternehmen, cell: (z) => <span className="text-ink-soft">{z.unternehmen || "Privatkunde"}</span> },
      { key: "email", header: "E-Mail", cell: (z) => <span title={z.email} className="block max-w-[140px] truncate text-ink-soft">{z.email}</span> },
      // Telefon erst ab 1700 px, damit Status und Letzte Aktivität trotz Spalte „Geschäftsbereich“ sichtbar bleiben
      { key: "tel", header: "Telefon", cell: (z) => <span className="whitespace-nowrap text-ink-soft">{z.telefonGeschaeftlich || z.telefonMobil || "—"}</span>, className: "hidden min-[1700px]:table-cell" },
      { key: "rolle", header: "Rolle", sort: (z) => z.rolle, cell: (z) => <Badge tone={z.rolle === "Entscheider" ? "orange" : "blue"}>{z.rolle}</Badge> },
      { key: "status", header: "Status", sort: (z) => z.status, cell: (z) => <StatusBadge status={z.status} /> },
      { key: "letzte", header: "Letzte Aktivität", sort: (z) => z.letzte, cell: (z) => <span className="text-ink-soft">{datumDe(z.letzte)}</span> },
    ],
  },
  privat: {
    titel: "Privatkunden", untertitel: "Alle privaten Kunden mit Kauf-, Verkaufs- und Sanierungsvorhaben.", neu: "Neuer Privatkunde", suche: "Privatkunden suchen …", csv: "privatkunden.csv",
    filter: [
      { key: "interessen", label: "Interessen / Vorhaben", wert: (z) => z.interessen, inBar: true, offen: true },
      { key: "status", label: "Status", wert: (z) => z.rolleStatus, inBar: true },
      { key: "region", label: "Region", wert: (z) => z.region, inBar: true },
      { key: "budget", label: "Budget", wert: (z) => budgetBucket(z.budget) },
      { key: "betreuer", label: "Betreuer", wert: () => "Marco Kaimann" },
    ],
    quick: [
      { id: "", label: "Alle Privatkunden", icon: Users, test: () => true },
      { id: "aktiv", label: "Aktive Kunden", icon: CircleDot, test: (z) => z.rolleStatus === "Aktiv" },
      { id: "kauf", label: "Kaufinteressenten", icon: KeyRound, test: (z) => z.interessen.some((i) => i.startsWith("Kauf")) },
      { id: "verkauf", label: "Verkaufsinteressenten", icon: KeyRound, test: (z) => z.interessen.includes("Verkauf") },
      { id: "sanierung", label: "Sanierungskunden (privat)", icon: Wrench, test: (z) => !!z.sanierung },
      { id: "ferien", label: "Ferienimmobilien", icon: Palmtree, test: (z) => z.interessen.includes("Ferienimmobilie") },
      { id: "kontakt", label: "In Kontakt", icon: UserCheck, test: (z) => z.rolleStatus === "In Kontakt" },
      { id: "qualifiziert", label: "Qualifiziert", icon: BadgeCheck, test: (z) => z.rolleStatus === "Qualifiziert" },
      { id: "suchauftrag", label: "Suchauftrag", icon: Search, test: (z) => z.rolleStatus === "Suchauftrag" },
      { id: "inaktiv", label: "Inaktiv", icon: CircleSlash, test: (z) => z.rolleStatus === "Inaktiv" },
    ],
    kpis: [
      { label: "Gesamt", icon: Users, wert: (r) => r.length, sub: "Privatkunden", quick: "" },
      { label: "Aktive Kunden", icon: Handshake, wert: (r) => r.filter((z) => z.rolleStatus === "Aktiv").length, sub: "in Bearbeitung", quick: "aktiv" },
      { label: "Neue Kunden", icon: UserPlus, wert: (r) => r.filter((z) => z.neu).length, sub: "letzte 30 Tage" },
      { label: "Kaufinteressenten", icon: House, wert: (r) => r.filter((z) => z.interessen.some((i) => i.startsWith("Kauf"))).length, sub: "aktiv", quick: "kauf" },
      { label: "Verkaufsinteressenten", icon: KeyRound, wert: (r) => r.filter((z) => z.interessen.includes("Verkauf")).length, sub: "aktiv", quick: "verkauf" },
    ],
    spalten: () => [
      { key: "name", header: "Name", sort: (z) => z.nachname, cell: (z) => <div className="flex items-center gap-2.5"><Avatar name={z.name} size={30} /><span className="font-semibold text-navy-950">{z.name}</span></div> },
      BEREICH_SPALTE,
      { key: "ort", header: "Ort", sort: (z) => z.ort, cell: (z) => <span className="text-ink-soft">{z.ort}</span> },
      { key: "int", header: "Interessen / Vorhaben", cell: (z) => z.interessen[0] ? <Badge tone="blue">{z.interessen[0]}</Badge> : <span className="text-muted">—</span> },
      { key: "objekt", header: "Objekt / Projekt", sort: (z) => z.vorhaben[0]?.titel ?? "~", cell: (z) => z.vorhaben[0] ? <div className="flex items-center gap-2"><Avatar name={z.vorhaben[0].titel} bild={z.vorhaben[0].bild} size={30} rund={false} /><span title={z.vorhaben[0].titel} className="line-clamp-2 max-w-[150px] text-ink-soft">{z.vorhaben[0].titel}</span></div> : <span className="text-muted">—</span> },
      { key: "budget", header: "Budget", sort: (z) => z.budget, cell: (z) => <span className="text-ink">{z.budget ? euroCompact(z.budget) : "—"}</span> },
      { key: "status", header: "Status", sort: (z) => z.rolleStatus, cell: (z) => <StatusBadge status={z.rolleStatus} /> },
      { key: "letzte", header: "Letzte Aktivität", sort: (z) => z.letzte, cell: (z) => <span className="text-ink-soft">{datumDe(z.letzte)}</span> },
    ],
  },
  sanierung: {
    titel: "Sanierungskunden", untertitel: "Alle Kunden mit Sanierungs- und Renovierungsvorhaben.", neu: "Neuer Sanierungskunde", suche: "Sanierungskunden suchen …", csv: "sanierungskunden.csv",
    filter: [
      { key: "art", label: "Vorhaben / Projektart", wert: (z) => z.interessen, inBar: true, offen: true },
      { key: "status", label: "Status", wert: (z) => z.rolleStatus, inBar: true },
      { key: "region", label: "Region", wert: (z) => z.region, inBar: true },
      { key: "betreuer", label: "Betreuer", wert: () => "Marco Kaimann" },
      { key: "budget", label: "Budgetrahmen", wert: (z) => budgetBucket(z.budget), inBar: true },
    ],
    quick: [
      { id: "", label: "Alle Sanierungskunden", icon: Users, test: () => true },
      { id: "aktiv", label: "Aktive Projekte", icon: Wrench, test: (z) => z.vorhaben.some((v) => v.status === "Aktiv") },
      { id: "angebot", label: "Angebotsphase", icon: FileText, test: (z) => z.rolleStatus === "Angebotsphase" || z.vorhaben.some((v) => v.status === "Angebotsphase") },
      { id: "planung", label: "In Planung", icon: Wrench, test: (z) => z.rolleStatus === "In Planung" },
      { id: "abgeschlossen", label: "Abgeschlossene Projekte", icon: CircleCheck, test: (z) => z.vorhaben.some((v) => v.status === "Abgeschlossen") },
      { id: "privat", label: "Privatkunden (Sanierung)", icon: UserRound, test: (z) => !!z.privat },
      { id: "investor", label: "Investoren (Sanierung)", icon: Target, test: (z) => z.kontakte.some((k) => k.rolle === "Investor") },
      { id: "kontakt", label: "In Kontakt", icon: UserCheck, test: (z) => z.rolleStatus === "In Kontakt" },
      { id: "qualifiziert", label: "Qualifiziert", icon: BadgeCheck, test: (z) => z.rolleStatus === "Qualifiziert" },
      { id: "suchauftrag", label: "Suchauftrag", icon: Search, test: (z) => z.rolleStatus === "Suchauftrag" },
      { id: "inaktiv", label: "Inaktiv", icon: CircleSlash, test: (z) => z.rolleStatus === "Inaktiv" },
    ],
    kpis: [
      { label: "Gesamt", icon: Users, wert: (r) => r.length, sub: "Sanierungskunden", quick: "" },
      { label: "Aktive Projekte", icon: Wrench, wert: (r) => r.reduce((s, z) => s + z.vorhaben.filter((v) => v.status === "Aktiv").length, 0), sub: "in Umsetzung", quick: "aktiv" },
      { label: "Neue Anfragen", icon: UserPlus, wert: (r) => r.filter((z) => z.neu).length, sub: "letzte 30 Tage" },
      { label: "Angebotsphase", icon: FileText, wert: (r) => r.filter((z) => z.rolleStatus === "Angebotsphase" || z.vorhaben.some((v) => v.status === "Angebotsphase")).length, sub: "aktuell", quick: "angebot" },
      { label: "Abgeschlossene Projekte", icon: CircleCheck, wert: (r) => r.reduce((s, z) => s + z.vorhaben.filter((v) => v.status === "Abgeschlossen").length, 0), sub: "dieses Jahr", quick: "abgeschlossen" },
    ],
    spalten: () => [
      { key: "name", header: "Name", sort: (z) => z.nachname, cell: (z) => <div className="flex items-center gap-2.5"><Avatar name={z.name} size={30} /><span className="font-semibold text-navy-950">{z.name}</span></div> },
      BEREICH_SPALTE,
      { key: "ort", header: "Ort", sort: (z) => z.ort, cell: (z) => <span className="text-ink-soft">{z.ort}</span> },
      { key: "art", header: "Vorhaben / Projektart", cell: (z) => (z.vorhaben[0]?.art || z.interessen[0]) ? <span title={z.vorhaben[0]?.art || z.interessen[0]}><Badge tone="blue" className="max-w-[138px]"><span className="min-w-0 truncate">{z.vorhaben[0]?.art || z.interessen[0]}</span></Badge></span> : <span className="text-muted">—</span> },
      { key: "objekt", header: "Objekt / Adresse", sort: (z) => z.vorhaben[0]?.titel ?? "~", cell: (z) => z.vorhaben[0] ? <div className="flex items-center gap-2"><Avatar name={z.vorhaben[0].titel} bild={z.vorhaben[0].bild} size={30} rund={false} /><span title={z.vorhaben[0].titel} className="line-clamp-2 max-w-[150px] text-ink-soft">{z.vorhaben[0].titel}</span></div> : <span className="text-muted">—</span> },
      { key: "budget", header: "Budget (ca.)", sort: (z) => z.budget, cell: (z) => <span className="text-ink">{z.budget ? euroCompact(z.budget) : "—"}</span> },
      { key: "status", header: "Status", sort: (z) => z.rolleStatus, cell: (z) => <StatusBadge status={z.rolleStatus} /> },
      { key: "letzte", header: "Letzte Aktivität", sort: (z) => z.letzte, cell: (z) => <span className="text-ink-soft">{datumDe(z.letzte)}</span> },
    ],
  },
};

export function PersonenListe({ rolle }: { rolle: PersonRolle }) {
  const crm = useCrm();
  const router = useRouter();
  const toast = useToast();
  const k = KONFIG[rolle];
  const [suche, setSuche] = useState("");
  const [werte, setWerte] = useState<Record<string, string[]>>({});
  const [bereich, setBereich] = useState<string[]>([]);
  const [quick, setQuick] = useState("");
  const [ansicht, setAnsicht] = useState<"liste" | "kacheln">("liste");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState(false);
  const neuGrenze = addDays(crm.heute, -30);

  const zeilen = useMemo<PersonZeile[]>(() => {
    const basis = crm.personen.filter((p) => (rolle === "privat" ? !!p.privat : rolle === "sanierung" ? !!p.sanierung : true));
    return basis.map((p) => {
      const kontakt = p.kontakte.find((x) => x.haupt) ?? p.kontakte[0];
      const r = rolle === "privat" ? p.privat : rolle === "sanierung" ? p.sanierung : undefined;
      const vorhaben = crm.vorhaben.filter((v) => v.personId === p.id && (rolle === "kontakt" || v.bereich === rolle));
      const seit = rolle === "kontakt" ? p.erstelltAm : r?.seit ?? p.erstelltAm;
      return {
        ...p,
        name: personName(p),
        rolleStatus: r?.status ?? p.status,
        unternehmen: kontakt ? crm.unternehmenById(kontakt.unternehmenId)?.name ?? "" : "",
        position: kontakt?.position ?? "",
        abteilung: kontakt?.abteilung ?? "",
        rolle: kontakt?.rolle ?? (p.privat ? "Privatkunde" : p.sanierung ? "Sanierungskunde" : "Kontakt"),
        region: regionVon(p.ort, p.land),
        letzte: crm.letzteAktivitaetPerson(p),
        vorhaben,
        budget: rolle === "sanierung" ? summeBudget(vorhaben) || r?.budget || 0 : r?.budget || summeBudget(vorhaben),
        interessen: r?.interessen ?? [],
        neu: seit >= neuGrenze,
      };
    });
  }, [crm, rolle, neuGrenze]);

  const quickTest = k.quick.find((q) => q.id === quick)?.test ?? (() => true);
  const gefiltert = zeilen.filter((z) => {
    if (!quickTest(z)) return false;
    if (!suchtreffer(suche, z.name, z.email, z.unternehmen, z.ort, z.position, ...z.vorhaben.map((v) => v.titel), ...z.bereiche.map((b) => b.bereich))) return false;
    if (!passtBereich(z, bereich)) return false;
    return k.filter.every((f) => {
      const sel = werte[f.key];
      if (!sel?.length) return true;
      const w = f.wert(z);
      return (Array.isArray(w) ? w : [w]).some((x) => sel.includes(x));
    });
  });
  const aktivFilter = !!suche || quick !== "" || bereich.length > 0 || Object.values(werte).some((v) => v.length);
  const bereichOptionen = [
    ...GESCHAEFTSBEREICHE.map((b) => ({ value: b as string, label: `GRENFORD ${b}`, anzahl: zeilen.filter((z) => z.bereiche.some((x) => x.bereich === b)).length })),
    { value: PRUEFEN, label: "Bereich prüfen (unklar)", anzahl: zeilen.filter((z) => passtBereich(z, [PRUEFEN])).length },
  ];

  const exportieren = () => {
    const rows = selected.size ? gefiltert.filter((z) => selected.has(z.id)) : gefiltert;
    downloadCsv(k.csv, ["Name", "Geschäftsbereiche", "Bereich prüfen", "E-Mail", "Telefon", "Ort", "Unternehmen", "Position", "Rolle", "Status", "Interessen", "Budget", "Letzte Aktivität"],
      rows.map((z) => [z.name, z.bereiche.map((b) => `${b.bereich}${b.funktion ? ` (${b.funktion})` : ""}`).join(", "), z.bereichPruefen ?? "", z.email, z.telefonGeschaeftlich || z.telefonMobil, z.ort, z.unternehmen, z.position, z.rolle, z.rolleStatus, z.interessen.join(", "), z.budget, datumDe(z.letzte)]));
    toast(`${rows.length} Datensätze als CSV exportiert (Testdaten).`);
  };

  const pids = new Set(zeilen.map((z) => z.id));
  const relevant = crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.art === "person" && pids.has(b.id)));
  const one = (key: string) => (werte[key]?.length === 1 ? werte[key][0] : "");
  const setWert = (key: string, v: string[]) => setWerte((w) => ({ ...w, [key]: v }));

  return (
    <>
      <ListLayout
        header={
          <PageHeader
            crumbs={[{ label: "Kunden" }, { label: k.titel }]}
            titel={k.titel}
            untertitel={k.untertitel}
            primary={{ label: k.neu, onClick: () => setModal(true) }}
            primaryMenu={[
              { label: k.neu, onClick: () => setModal(true) },
              { label: "Import (Excel)", hinweis: "noch nicht implementiert", onClick: () => toast("Der Import ist in dieser Testversion noch nicht implementiert.") },
            ]}
            moreMenu={[{ label: "Export (CSV)", hinweis: selected.size ? `${selected.size} ausgewählte` : `${gefiltert.length} gefilterte`, onClick: exportieren }]}
          />
        }
        main={
          <>
            <KpiRow
              kpis={k.kpis.map((kp) => ({
                label: kp.label, wert: kp.wert(zeilen), sub: kp.sub, icon: kp.icon,
                onClick: kp.quick !== undefined ? () => { setQuick(kp.quick!); setWerte({}); } : undefined,
                aktiv: kp.quick !== undefined && quick === kp.quick && kp.quick !== "",
              }))}
            />
            <FilterBar ansicht={ansicht} onAnsicht={setAnsicht} onReset={() => { setSuche(""); setWerte({}); setBereich([]); setQuick(""); }} resetAktiv={aktivFilter}>
              <SearchInput value={suche} onChange={setSuche} placeholder={k.suche} className="w-full sm:w-[150px]" />
              <MultiFilter label="Geschäftsbereich" value={bereich} onChange={setBereich} options={bereichOptionen} />
              {k.filter.filter((f) => f.inBar).map((f) => (
                <FilterSelect key={f.key} label={f.label} value={one(f.key)} onChange={(v) => setWert(f.key, v ? [v] : [])} options={[...zaehle(zeilen, f.wert).keys()].sort()} />
              ))}
            </FilterBar>
            <DataTable
              rows={gefiltert}
              columns={k.spalten(crm)}
              defaultSort={{ key: "letzte", richtung: "desc" }}
              selected={selected}
              onSelected={setSelected}
              onRowClick={(z) => router.push(personHref(rolle, z.id))}
              ansicht={ansicht}
              resetKey={`${suche}|${quick}|${bereich.join()}|${JSON.stringify(werte)}`}
              rowMenu={(z) => [
                { label: "Öffnen", onClick: () => router.push(personHref(rolle, z.id)) },
                { label: z.favorit ? "Favorit entfernen" : "Als Favorit markieren", onClick: () => crm.speicherePerson({ ...crm.personById(z.id)!, favorit: !z.favorit }) },
              ]}
              card={(z) => (
                <div className="card flex h-full gap-3 p-3 hover:shadow-md">
                  <Avatar name={z.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-navy-950">{z.name}</div>
                    <div className="truncate text-[11.5px] text-muted">{rolle === "kontakt" ? `${z.position || "—"} · ${z.unternehmen || "Privat"}` : `${z.ort} · ${z.vorhaben[0]?.titel ?? z.interessen[0] ?? "—"}`}</div>
                    <div className="mt-1"><BereichBadges kompakt bereiche={z.bereiche} pruefen={z.bereichPruefen} /></div>
                    <div className="mt-2 flex items-center justify-between"><StatusBadge status={z.rolleStatus} /><span className="text-[11px] text-muted">{datumDe(z.letzte)}</span></div>
                  </div>
                </div>
              )}
            />
          </>
        }
        aside={
          <>
            <QuickFilterCard filter={k.quick.map((q) => ({ id: q.id, label: q.label, icon: q.icon, anzahl: zeilen.filter(q.test).length }))} aktiv={quick} onWahl={setQuick}>
              <CheckGroup titel="Geschäftsbereich" offen werte={bereichOptionen.map((o) => [o.label, o.anzahl] as [string, number])} gewaehlt={bereich.map((b) => bereichOptionen.find((o) => o.value === b)?.label ?? b)} onChange={(v) => setBereich(v.map((l) => bereichOptionen.find((o) => o.label === l)?.value ?? l))} />
              {k.filter.map((f) => (
                <CheckGroup key={f.key} titel={f.label.replace(/^Alle /, "")} offen={f.offen} werte={[...zaehle(zeilen, f.wert).entries()].sort((a, b) => b[1] - a[1])} gewaehlt={werte[f.key] ?? []} onChange={(v) => setWert(f.key, v)} />
              ))}
            </QuickFilterCard>
            <TermineCard termine={naechste(relevant, crm.heute, 4)} />
            <NotizenCard notizen={notizen(relevant, 3)} />
          </>
        }
      />
      {modal && <PersonModal rolle={rolle} onClose={() => setModal(false)} />}
    </>
  );
}
