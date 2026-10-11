"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleX, FileSearch, Hourglass, HeartHandshake, Search, Sparkles } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, letzteAktivitaet } from "@/lib/crm/logic";
import { PRIORITAETEN_MODUL, SUCH_STATUS, naechsteNummer, passend, type Suchauftrag } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { euroCompact } from "@/lib/format";
import { Avatar, Button, StatusBadge, Tabs } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { InfoList, Panel } from "@/components/crm/page";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { ModulListe } from "./ModulListe";
import { FormModal, liste, refAus, refZu, text, zahl, type Feld } from "./FormModal";
import { RefLink, TESTMODUS, VerlaufPanel, bezugVorgang } from "./detail";
import { INVESTORENTYPEN } from "@/components/investment/Ankaufsprofile";
import { ASSETKLASSEN } from "@/components/investment/Projekte";

const OBJEKTARTEN_PROPERTY = ["Eigentumswohnung", "Wohnung", "Mehrfamilienhaus", "Einfamilienhaus", "Penthouse", "Grundstück", "Büro / Gewerbe", "Hotel", "Co-Living"];

/** Passende Vorgänge zu einem Suchauftrag: Investment-Projekte bzw. Property-Mandate */
function treffer(crm: ReturnType<typeof useCrm>, s: Suchauftrag) {
  const k = { objektarten: s.objektart.split(",").map((x) => x.trim()), regionen: s.regionen, von: s.volumenVon, bis: s.volumenBis };
  if (s.bereich === "Investment") {
    return passend(k, crm.investmentProjekte.filter((p) => p.status !== "Abgeschlossen"), (p) => ({ objektart: `${p.assetklasse} ${crm.objektById(p.objektId)?.objektart ?? ""}`, standort: p.standort, volumen: p.volumen }))
      .map(({ k: p, score }) => ({ id: p.id, titel: p.titel, ort: p.standort, volumen: p.volumen, href: HREF.invest(p.id), score }));
  }
  return passend(k, crm.propertyMandate.filter((m) => m.status !== "Abgeschlossen" && m.status !== "Inaktiv"), (m) => { const o = crm.objektById(m.objektId); return { objektart: o?.objektart ?? "", standort: o?.ort ?? "", volumen: m.preis }; })
    .map(({ k: m, score }) => ({ id: m.id, titel: crm.objektById(m.objektId)?.titel ?? m.id, ort: crm.objektById(m.objektId)?.ort ?? "", volumen: m.preis, href: HREF.mandat(m.id), score }));
}

/** Suchaufträge – Investment und Property fachlich getrennt (eigene Nummernkreise SRCH-I / SRCH-P) */
export function SuchauftraegeListe({ bereich }: { bereich: "Investment" | "Property" }) {
  const crm = useCrm();
  const params = useSearchParams();
  const [neu, setNeu] = useState(false);
  const [offen, setOffen] = useState<string | null>(params.get("id"));
  const rows = crm.suchauftraege.filter((s) => s.bereich === bereich);
  const letzte = (s: Suchauftrag) => letzteAktivitaet(crm.aktivitaetenVon(s.id), crm.heute, s.erstelltAm);
  const auswahl = rows.find((s) => s.id === offen);
  const aktiv = (s: Suchauftrag) => s.status === "Aktiv" || s.status === "In Prüfung" || s.status === "In Verhandlung";
  return (
    <>
      <ModulListe
        crumbs={[{ label: bereich }, { label: "Suchaufträge" }]}
        titel="Suchaufträge"
        untertitel={bereich === "Investment" ? "Alle aktiven und historischen Suchaufträge von institutionellen und privaten Investoren." : "Alle aktiven und historischen Suchaufträge von Kaufinteressenten für Wohn- und Gewerbeimmobilien."}
        neu={{ label: "Neuer Suchauftrag", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(s) => [s.id, crm.refName(s.kunde), s.kriterien, s.objektart, ...s.regionen]}
        suchePlatzhalter="Suchaufträge suchen …"
        onRow={(s) => setOffen(s.id)}
        defaultSort={{ key: "letzte", richtung: "desc" }}
        columns={[
          { key: "id", header: "ID", sort: (s) => s.id, cell: (s) => <span className="whitespace-nowrap">{s.id}</span> },
          { key: "kunde", header: bereich === "Investment" ? "Unternehmen" : "Kunde", sort: (s) => crm.refName(s.kunde), cell: (s) => <div className="flex items-center gap-2"><Avatar name={crm.refName(s.kunde)} size={28} /><div><div className="font-semibold text-navy-950">{crm.refName(s.kunde)}</div><div className="text-[10.5px] text-muted">{s.typ}</div></div></div> },
          { key: "ap", header: "Ansprechpartner", cell: (s) => (s.ansprechpartnerId ? crm.refName({ art: "person", id: s.ansprechpartnerId }) : s.kunde.art === "person" ? crm.refName(s.kunde) : "—") },
          { key: "art", header: bereich === "Investment" ? "Assetklasse" : "Objektart (Fokus)", cell: (s) => <span className="line-clamp-2 max-w-[110px]">{s.objektart}</span> },
          { key: "reg", header: "Region (Fokus)", cell: (s) => <span className="line-clamp-2 max-w-[110px]">{s.regionen.join(", ")}</span> },
          { key: "vol", header: bereich === "Investment" ? "Volumen (Mio. €)" : "Budget (Mio. €)", sort: (s) => s.volumenVon, cell: (s) => `${String(s.volumenVon).replace(".", ",")} – ${String(s.volumenBis).replace(".", ",")}` },
          { key: "krit", header: "Suchkriterien (Kurzfassung)", cell: (s) => <span className="line-clamp-2 max-w-[170px] text-ink-soft">{s.kriterien}</span> },
          { key: "status", header: "Status", sort: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
          { key: "ziel", header: "Zielzeitraum", sort: (s) => s.zielzeitraum, cell: (s) => s.zielzeitraum },
          { key: "letzte", header: "Letzte Aktivität", sort: (s) => letzte(s), cell: (s) => datumDe(letzte(s)) },
        ]}
        filter={[
          ...(bereich === "Property" ? [{ key: "mandatstyp", label: "Mandatstyp", wert: (s: Suchauftrag) => s.mandatstyp ?? "—", inBar: true }] : [{ key: "typ", label: "Investorentyp", wert: (s: Suchauftrag) => s.typ, inBar: true }]),
          { key: "art", label: bereich === "Investment" ? "Assetklasse" : "Objektart", wert: (s) => s.objektart.split(",").map((x) => x.trim()), inBar: true, offen: true },
          { key: "region", label: "Region", wert: (s) => s.regionen, inBar: true },
          { key: "status", label: "Status", wert: (s) => s.status, inBar: true },
          { key: "prio", label: "Priorität", wert: (s) => s.prioritaet },
          { key: "ziel", label: "Zielzeitraum", wert: (s) => s.zielzeitraum },
        ]}
        quick={[
          { id: "", label: "Alle Suchaufträge", icon: FileSearch, test: () => true },
          { id: "aktiv", label: "Aktive Suchaufträge", icon: Search, test: (s) => s.status === "Aktiv" },
          { id: "pruefung", label: "In Prüfung", icon: Hourglass, test: (s) => s.status === "In Prüfung" },
          { id: "verhandlung", label: "In Verhandlung", icon: HeartHandshake, test: (s) => s.status === "In Verhandlung" },
          { id: "platziert", label: "Platziert", icon: Sparkles, test: (s) => s.status === "Platziert" },
          { id: "abgeschlossen", label: "Abgeschlossen", icon: CircleX, test: (s) => s.status === "Abgeschlossen" },
          { id: "inaktiv", label: "Inaktiv", icon: CircleX, test: (s) => s.status === "Inaktiv" },
        ]}
        kpis={[
          { label: "Gesamt", icon: FileSearch, wert: (r) => r.length, sub: "Suchaufträge", quick: "" },
          { label: "Aktiv", icon: Search, wert: (r) => r.filter(aktiv).length, sub: "in Bearbeitung", quick: "aktiv" },
          { label: "In Prüfung", icon: Hourglass, wert: (r) => r.filter((s) => s.status === "In Prüfung").length, sub: "Angebote in Analyse", quick: "pruefung" },
          { label: "Erfolgreich platziert", icon: HeartHandshake, wert: (r) => r.filter((s) => s.status === "Platziert").length, sub: "dieses Jahr", quick: "platziert" },
          { label: "Abgeschlossen", icon: CircleX, wert: (r) => r.filter((s) => s.status === "Abgeschlossen").length, sub: "historisch", quick: "abgeschlossen" },
        ]}
        csv={{ datei: `${bereich.toLowerCase()}-suchauftraege.csv`, kopf: ["ID", "Bereich", "Kunde", "Ansprechpartner", "Typ", bereich === "Investment" ? "Assetklasse" : "Objektart", "Regionen", "von (Mio.)", "bis (Mio.)", "Kriterien", "Status", "Priorität", "Zielzeitraum", "Verknüpfte Vorgänge"], zeile: (s) => [s.id, s.bereich, crm.refName(s.kunde), s.ansprechpartnerId ? crm.refName({ art: "person", id: s.ansprechpartnerId }) : "", s.typ, s.objektart, s.regionen.join(", "), s.volumenVon, s.volumenBis, s.kriterien, s.status, s.prioritaet, s.zielzeitraum, s.verknuepft.join(", ")] }}
        statusAenderung={{ werte: SUCH_STATUS, setze: (sel, st) => sel.forEach((id) => { const s = rows.find((x) => x.id === id)!; crm.speichere("suchauftraege", { ...s, status: st as Suchauftrag["status"] }, { ref: id, text: `Status → ${st}` }); }) }}
        aktivitaeten={crm.aktivitaetenVon(...rows.map((s) => s.id))}
      />
      {neu && <SuchauftragModal bereich={bereich} onClose={() => setNeu(false)} />}
      {auswahl && <SuchauftragEinzel s={auswahl} onClose={() => setOffen(null)} />}
    </>
  );
}

function SuchauftragEinzel({ s, onClose }: { s: Suchauftrag; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const [tab, setTab] = useState<"allgemein" | "treffer" | "aktivitaeten" | "verlauf">("allgemein");
  const [edit, setEdit] = useState(false);
  const t = treffer(crm, s);
  const verknuepfen = (id: string) => {
    if (s.verknuepft.includes(id)) return;
    crm.speichere("suchauftraege", { ...s, verknuepft: [...s.verknuepft, id] }, { ref: s.id, text: `Mit ${id} verknüpft` });
    toast(`Suchauftrag mit ${id} verknüpft ${TESTMODUS}`);
  };
  return (
    <Modal titel={`Suchauftrag ${s.id} – ${crm.refName(s.kunde)}`} onClose={onClose} breit="max-w-[1040px]" footer={<><Button onClick={onClose}>Schließen</Button><Button variant="primary" onClick={() => setEdit(true)}>Bearbeiten</Button></>}>
      <Tabs tabs={[{ id: "allgemein", label: "Allgemein" }, { id: "treffer", label: `Passende ${s.bereich === "Investment" ? "Projekte" : "Objekte"} (${t.length})` }, { id: "aktivitaeten", label: "Aktivitäten" }, { id: "verlauf", label: "Verlauf" }]} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === "allgemein" && (
          <div className="grid gap-[12px] lg:grid-cols-2">
            <Panel titel="Suchauftrag" aktion={<StatusBadge status={s.status} />}>
              <InfoList rows={[["ID", s.id], ["Geschäftsbereich", s.bereich], ["Kunde", <RefLink key="k" r={s.kunde} />], ["Ansprechpartner", <RefLink key="a" r={s.ansprechpartnerId ? { art: "person", id: s.ansprechpartnerId } : undefined} />], ["Typ", s.typ], ...(s.mandatstyp ? [["Mandatstyp", s.mandatstyp] as [string, string]] : []), [s.bereich === "Investment" ? "Assetklasse" : "Objektart", s.objektart], ["Regionen", s.regionen.join(", ")], [s.bereich === "Investment" ? "Volumen" : "Budget", `${s.volumenVon} – ${s.volumenBis} Mio. €`], ["Priorität", s.prioritaet], ["Zielzeitraum", s.zielzeitraum]]} />
            </Panel>
            <Panel titel="Suchkriterien & Verknüpfungen">
              <p className="text-[12.5px] text-ink">{s.kriterien}</p>
              <h3 className="mt-3 text-[12px] font-semibold text-navy-950">Verknüpfte {s.bereich === "Investment" ? "Investment-Projekte" : "Property-Mandate"}</h3>
              <ul className="mt-1 space-y-1 text-[12px]">
                {s.verknuepft.map((id) => { const v = crm.index.get(id); return <li key={id}>{v ? <Link href={v.href} className="text-royal-600 hover:underline">{id} – {v.titel}</Link> : id}</li>; })}
                {!s.verknuepft.length && <li className="text-muted">Noch keine Verknüpfung.</li>}
              </ul>
            </Panel>
          </div>
        )}
        {tab === "treffer" && (
          <Panel titel="Passende Vorgänge (Objektart, Region, Volumen)">
            <ul className="divide-y divide-line-soft">
              {t.map((x) => (
                <li key={x.id} className="flex items-center gap-3 py-2 text-[12px]">
                  <Link href={x.href} className="flex-1 font-semibold text-navy-950 hover:underline">{x.titel} <span className="font-normal text-muted">· {x.id} · {x.ort}</span></Link>
                  <span>{euroCompact(x.volumen)}</span>
                  <span className="text-[11px] text-pos">{x.score}/3</span>
                  {s.verknuepft.includes(x.id) ? <span className="text-[11px] text-muted">verknüpft</span> : <button type="button" onClick={() => verknuepfen(x.id)} className="link-more">Verknüpfen</button>}
                </li>
              ))}
              {!t.length && <li className="py-3 text-[12px] text-muted">Kein passender aktiver Vorgang.</li>}
            </ul>
          </Panel>
        )}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={crm.aktivitaetenVon(s.id)} bezug={[...bezugVorgang(s.id), ...(s.kunde ? [{ art: s.kunde.art, id: s.kunde.id }] : [])]} />}
        {tab === "verlauf" && <VerlaufPanel refIds={[s.id]} />}
      </div>
      {edit && <SuchauftragModal bereich={s.bereich} initial={s} onClose={() => setEdit(false)} />}
    </Modal>
  );
}

export function SuchauftragModal({ bereich, initial, onClose }: { bereich: "Investment" | "Property"; initial?: Suchauftrag; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const felder: Feld[] = [
    { key: "kunde", label: "Kunde (aus Stammdaten)", typ: "ref", pflicht: true, breit: true },
    { key: "ansprechpartnerId", label: "Ansprechpartner", typ: "person" },
    { key: "typ", label: bereich === "Investment" ? "Investorentyp" : "Kundentyp", typ: "select", pflicht: true, options: bereich === "Investment" ? INVESTORENTYPEN : ["Privatkunde", "Family Office", "Institutionell"] },
    ...(bereich === "Property" ? [{ key: "mandatstyp", label: "Mandatstyp", typ: "select" as const, pflicht: true, options: ["Kauf", "Miete"] }] : []),
    { key: "objektart", label: bereich === "Investment" ? "Assetklasse(n)" : "Objektart(en)", typ: "text", pflicht: true, placeholder: (bereich === "Investment" ? ASSETKLASSEN : OBJEKTARTEN_PROPERTY).slice(0, 3).join(", ") },
    { key: "regionen", label: "Regionen (kommagetrennt)", typ: "text", pflicht: true },
    { key: "volumenVon", label: `${bereich === "Investment" ? "Volumen" : "Budget"} von (Mio. €)`, typ: "zahl", pflicht: true },
    { key: "volumenBis", label: `${bereich === "Investment" ? "Volumen" : "Budget"} bis (Mio. €)`, typ: "zahl", pflicht: true },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: SUCH_STATUS },
    { key: "prioritaet", label: "Priorität", typ: "select", pflicht: true, options: PRIORITAETEN_MODUL },
    { key: "zielzeitraum", label: "Zielzeitraum", typ: "text", pflicht: true, placeholder: "z. B. Q2/2027" },
    { key: "kriterien", label: "Suchkriterien", typ: "textarea", pflicht: true },
  ];
  return (
    <FormModal
      titel={initial ? `Suchauftrag ${initial.id} bearbeiten` : `Neuer Suchauftrag (${bereich})`}
      hinweis={`${bereich}-Suchaufträge werden getrennt von ${bereich === "Investment" ? "Property" : "Investment"}-Suchaufträgen geführt (Nummernkreis SRCH-${bereich[0]}). Kunden werden aus den Stammdaten gewählt.`}
      felder={felder}
      start={{ kunde: refZu(initial?.kunde), ansprechpartnerId: initial?.ansprechpartnerId ?? "", typ: initial?.typ ?? "", mandatstyp: initial?.mandatstyp ?? "Kauf", objektart: initial?.objektart ?? "", regionen: initial?.regionen.join(", ") ?? "", volumenVon: initial ? String(initial.volumenVon).replace(".", ",") : "", volumenBis: initial ? String(initial.volumenBis).replace(".", ",") : "", status: initial?.status ?? "Aktiv", prioritaet: initial?.prioritaet ?? "Normal", zielzeitraum: initial?.zielzeitraum ?? "", kriterien: initial?.kriterien ?? "" }}
      pruefen={(w) => (zahl(w.volumenBis) < zahl(w.volumenVon) ? { volumenBis: "„bis“ muss mindestens „von“ sein." } : ({} as Record<string, string>))}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? naechsteNummer(`SRCH-${bereich[0]}-`, crm.suchauftraege.map((s) => s.id));
        crm.speichere("suchauftraege", { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, verknuepft: [], ...initial, id, bereich, kunde: refAus(w.kunde)!, ansprechpartnerId: text(w.ansprechpartnerId) || undefined, typ: text(w.typ), mandatstyp: bereich === "Property" ? text(w.mandatstyp) : undefined, objektart: text(w.objektart), regionen: liste(w.regionen), volumenVon: zahl(w.volumenVon), volumenBis: zahl(w.volumenBis), status: text(w.status) as Suchauftrag["status"], prioritaet: text(w.prioritaet), zielzeitraum: text(w.zielzeitraum), kriterien: text(w.kriterien) }, { ref: id, text: initial ? "Suchauftrag geändert" : "Suchauftrag angelegt" });
        toast(`Suchauftrag ${id} gespeichert ${TESTMODUS}`);
      }}
    />
  );
}
