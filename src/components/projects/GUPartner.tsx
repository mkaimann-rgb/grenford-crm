"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CircleDot, HardHat, Handshake, MapPin, Search, Star, Users } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { GU_STATUS, type GUPartner } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { euroCompact } from "@/lib/format";
import { Avatar, Button, StatusBadge, Tabs } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { InfoList, Panel } from "@/components/crm/page";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, liste, text, type Feld } from "@/components/modul/FormModal";
import { DokumentePanel, RefLink, TESTMODUS, VerlaufPanel, bezugVorgang } from "@/components/modul/detail";

const GEWERKE = ["Sanierung (komplett)", "Innenausbau", "Badsanierung", "Küchenumbau", "Fassade & Dach", "Koordination aller Gewerke", "Rohbau", "Neubau", "Maler", "Bodenbeläge", "Küche", "Elektro", "Sanitär", "Heizung", "Tischler", "Fenster / Türen", "Außenanlagen", "Klima / Lüftung"];

export function GUPartnerListe() {
  const crm = useCrm();
  const params = useSearchParams();
  const [neu, setNeu] = useState(false);
  const [offen, setOffen] = useState<string | null>(params.get("id"));
  const rows = crm.guPartner;
  const name = (g: GUPartner) => crm.unternehmenById(g.unternehmenId)?.name ?? g.id;
  const projekte = (g: GUPartner) => crm.angebote.filter((a) => a.guId === g.id && a.status === "Beauftragt");
  const auswahl = rows.find((g) => g.id === offen);
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Projects" }, { label: "GU-Partner" }]}
        titel="GU-Partner"
        untertitel="Alle Generalunternehmer und Baupartner mit ihren Leistungen, Regionen und Projektreferenzen."
        neu={{ label: "Neuer GU-Partner", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(g) => [g.id, name(g), ...g.gewerke, ...g.regionen, g.ansprechpartnerId ? crm.refName({ art: "person", id: g.ansprechpartnerId }) : ""]}
        suchePlatzhalter="GU-Partner suchen …"
        onRow={(g) => setOffen(g.id)}
        defaultSort={{ key: "ref", richtung: "desc" }}
        columns={[
          { key: "u", header: "Unternehmen", sort: name, cell: (g) => <div className="flex items-center gap-2"><Avatar name={name(g)} size={30} rund={false} /><span className="font-semibold text-navy-950">{name(g)}</span></div> },
          { key: "ap", header: "Ansprechpartner", cell: (g) => (g.ansprechpartnerId ? crm.refName({ art: "person", id: g.ansprechpartnerId }) : "—") },
          { key: "kat", header: "Kategorie", sort: (g) => g.kategorie, cell: (g) => <span className="rounded-[4px] bg-line-soft px-2 py-[2px] text-[11px]">{g.kategorie}</span> },
          { key: "lb", header: "Leistungsbereich", cell: (g) => <span className="line-clamp-2 max-w-[150px]">{g.gewerke.slice(0, 3).join(", ")}</span> },
          { key: "reg", header: "Regionen", cell: (g) => g.regionen.join(", ") },
          { key: "ref", header: "Referenzprojekte", sort: (g) => projekte(g).length, cell: (g) => projekte(g).length },
          { key: "status", header: "Status", sort: (g) => g.status, cell: (g) => <StatusBadge status={g.status} /> },
          { key: "bev", header: "Bevorzugt", sort: (g) => Number(g.bevorzugt), cell: (g) => <Star className={`h-4 w-4 ${g.bevorzugt ? "fill-navy-900 text-navy-900" : "text-muted"}`} aria-label={g.bevorzugt ? "bevorzugt" : "nicht bevorzugt"} /> },
        ]}
        filter={[
          { key: "kat", label: "Kategorie", wert: (g) => g.kategorie, inBar: true },
          { key: "region", label: "Region", wert: (g) => g.regionen, inBar: true },
          { key: "lb", label: "Leistungsbereich", wert: (g) => g.gewerke, inBar: true, offen: true },
          { key: "status", label: "Status", wert: (g) => g.status, inBar: true },
          { key: "bev", label: "Bevorzugt", wert: (g) => (g.bevorzugt ? "Bevorzugt" : "Standard") },
        ]}
        quick={[
          { id: "", label: "Alle GU-Partner", icon: HardHat, test: () => true },
          { id: "aktiv", label: "Aktiv", icon: CircleDot, test: (g) => g.status === "Aktiv" },
          { id: "bev", label: "Bevorzugt", icon: Star, test: (g) => g.bevorzugt },
          { id: "gu", label: "Generalunternehmer", icon: HardHat, test: (g) => g.kategorie === "Generalunternehmer" },
          { id: "fach", label: "Fachpartner", icon: Users, test: (g) => g.kategorie === "Fachpartner" },
        ]}
        kpis={[
          { label: "Gesamt", icon: HardHat, wert: (r) => r.length, sub: "GU-Partner", quick: "" },
          { label: "Aktiv", icon: Search, wert: (r) => r.filter((g) => g.status === "Aktiv").length, sub: "in Zusammenarbeit", quick: "aktiv" },
          { label: "Bevorzugt", icon: Handshake, wert: (r) => r.filter((g) => g.bevorzugt).length, sub: "Strategische Partner", quick: "bev" },
          { label: "Regionen", icon: MapPin, wert: (r) => new Set(r.flatMap((g) => g.regionen)).size, sub: "Abgedeckte Regionen" },
        ]}
        csv={{ datei: "gu-partner.csv", kopf: ["ID", "Unternehmen", "Ansprechpartner", "Kategorie", "Gewerke", "Regionen", "Status", "Bevorzugt", "Vereinbarung", "Provisionsregelung"], zeile: (g) => [g.id, name(g), g.ansprechpartnerId ? crm.refName({ art: "person", id: g.ansprechpartnerId }) : "", g.kategorie, g.gewerke.join(", "), g.regionen.join(", "), g.status, g.bevorzugt ? "ja" : "nein", g.vereinbarung.status, g.vereinbarung.provisionsregelung] }}
        statusAenderung={{ werte: GU_STATUS, setze: (sel, s) => sel.forEach((id) => { const g = rows.find((x) => x.id === id)!; crm.speichere("guPartner", { ...g, status: s as GUPartner["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => rows.some((g) => g.unternehmenId === b.id || g.id === b.id)))}
      />
      {neu && <GUModal onClose={() => setNeu(false)} />}
      {auswahl && <GUEinzel g={auswahl} onClose={() => setOffen(null)} />}
    </>
  );
}

function GUEinzel({ g, onClose }: { g: GUPartner; onClose: () => void }) {
  const crm = useCrm();
  const [tab, setTab] = useState<"allgemein" | "leistungen" | "referenzen" | "dokumente" | "aktivitaeten" | "verlauf">("allgemein");
  const [edit, setEdit] = useState(false);
  const u = crm.unternehmenById(g.unternehmenId);
  const p = g.ansprechpartnerId ? crm.personById(g.ansprechpartnerId) : undefined;
  const ang = crm.angebote.filter((a) => a.guId === g.id);
  const beauftragt = ang.filter((a) => a.status === "Beauftragt");
  const projekte = beauftragt.map((a) => crm.projectsProjekte.find((x) => x.id === a.projektId)).filter(Boolean) as NonNullable<ReturnType<typeof crm.projectsProjekte.find>>[];
  const volumen = beauftragt.reduce((s, a) => s + (a.summe ?? 0), 0);
  return (
    <Modal titel={`${u?.name ?? g.id} – GU-Partner`} onClose={onClose} breit="max-w-[980px]" footer={<><Button onClick={onClose}>Schließen</Button><Button variant="primary" onClick={() => setEdit(true)}>Bearbeiten</Button></>}>
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-soft"><StatusBadge status={g.status} />{g.kategorie} · {g.gewerke.slice(0, 2).join(" & ")}{g.bevorzugt && <span className="flex items-center gap-1 text-navy-900"><Star className="h-3.5 w-3.5 fill-navy-900" />bevorzugt</span>}</div>
      <div className="mt-3"><Tabs tabs={[{ id: "allgemein", label: "Allgemein" }, { id: "leistungen", label: "Leistungen" }, { id: "referenzen", label: `Referenzprojekte (${projekte.length})` }, { id: "dokumente", label: "Dokumente" }, { id: "aktivitaeten", label: "Aktivitäten" }, { id: "verlauf", label: "Verlauf" }]} value={tab} onChange={setTab} /></div>
      <div className="mt-4">
        {tab === "allgemein" && (
          <div className="grid gap-[12px] lg:grid-cols-2">
            <Panel titel="Unternehmen"><InfoList rows={[["Name", <RefLink key="u" r={{ art: "unternehmen", id: g.unternehmenId }} />], ["Rechtsform", u?.rechtsform ?? "—"], ["Branche", u?.arten.join(", ") ?? "—"], ["Website", u?.website || "—"], ["Telefon", u?.telefon || "—"], ["E-Mail", u?.email || "—"], ["Adresse", u ? `${u.strasse}, ${u.plz} ${u.ort}` : "—"], ["Regionen", g.regionen.join(", ")], ["Tätig seit", g.seit]]} /></Panel>
            <Panel titel="Ansprechpartner"><InfoList rows={[["Name", <RefLink key="p" r={g.ansprechpartnerId ? { art: "person", id: g.ansprechpartnerId } : undefined} />], ["Position", p?.kontakte.find((k) => k.unternehmenId === g.unternehmenId)?.position ?? "—"], ["Telefon (mobil)", p?.telefonMobil || "—"], ["Telefon (gesch.)", p?.telefonGeschaeftlich || "—"], ["E-Mail", p?.email ?? "—"]]} /></Panel>
            <Panel titel="Aktuelle Zusammenarbeit" className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[["Projekte (gesamt)", String(projekte.length)], ["Projekte (laufend)", String(projekte.filter((x) => x.status === "Aktiv").length)], ["Projekte (abgeschlossen)", String(projekte.filter((x) => x.status === "Abgeschlossen").length)], ["Auftragsvolumen (netto)", euroCompact(volumen)]].map(([l, w]) => <div key={l} className="rounded-[8px] border border-line p-3"><div className="font-serif text-[20px] font-bold text-navy-950">{w}</div><div className="text-[11px] text-muted">{l}</div></div>)}
              </div>
            </Panel>
            <Panel titel="Vereinbarungen & Provisionsregelung" className="lg:col-span-2"><InfoList rows={[["Rahmenvereinbarung", g.vereinbarung.status], ["Datum", g.vereinbarung.datum ?? "—"], ["Provisionsregelung", g.vereinbarung.provisionsregelung]]} /><p className="mt-2 text-[11px] text-muted">GRENFORD ist unabhängiger Berater; die Beauftragung erfolgt grundsätzlich direkt durch den Kunden.</p></Panel>
          </div>
        )}
        {tab === "leistungen" && (
          <Panel titel="Kategorien & Spezialisierung">
            <ul className="grid gap-2 sm:grid-cols-2">{g.gewerke.map((x) => <li key={x} className="flex items-center gap-2 text-[12px]"><Check className="h-3.5 w-3.5 text-navy-900" />{x}</li>)}</ul>
          </Panel>
        )}
        {tab === "referenzen" && (
          <Panel titel="Referenzprojekte (beauftragte Angebote)">
            <ul className="divide-y divide-line-soft text-[12px]">
              {projekte.map((x) => <li key={x.id} className="flex items-center gap-2 py-2"><Avatar name={x.titel} bild={crm.objektById(x.objektId ?? "")?.bild} size={34} rund={false} /><Link href={HREF.projekt(x.id)} className="flex-1 font-semibold text-navy-950 hover:underline">{x.titel}<span className="block text-[10.5px] font-normal text-muted">{x.id} · {crm.objektById(x.objektId ?? "")?.titel}</span></Link><StatusBadge status={x.status} /><span>{euroCompact(x.vergabe?.vergabesumme ?? x.budget)}</span></li>)}
              {!projekte.length && <li className="py-2 text-muted">Noch keine Referenzprojekte.</li>}
            </ul>
            <h3 className="mt-3 text-[12px] font-semibold text-navy-950">Angebote ({ang.length})</h3>
            <ul className="text-[11.5px] text-ink-soft">{ang.map((a) => <li key={a.id}>{a.id} · {a.projektId} · {a.summe !== undefined ? euroCompact(a.summe) : "—"} · {a.status}</li>)}</ul>
          </Panel>
        )}
        {tab === "dokumente" && <DokumentePanel refIds={[g.id]} />}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.id === g.id || b.id === g.unternehmenId))} bezug={[...bezugVorgang(g.id), { art: "unternehmen", id: g.unternehmenId }]} />}
        {tab === "verlauf" && <VerlaufPanel refIds={[g.id]} />}
      </div>
      {edit && <GUModal initial={g} onClose={() => setEdit(false)} />}
    </Modal>
  );
}

function GUModal({ initial, onClose }: { initial?: GUPartner; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const felder: Feld[] = [
    { key: "unternehmenId", label: "Unternehmen (aus Stammdaten)", typ: "unternehmen", pflicht: true },
    { key: "ansprechpartnerId", label: "Ansprechpartner", typ: "person" },
    { key: "kategorie", label: "Kategorie", typ: "select", pflicht: true, options: ["Generalunternehmer", "Fachpartner"] },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: GU_STATUS },
    { key: "gewerke", label: "Gewerke / Leistungen", typ: "multi", pflicht: true, options: GEWERKE },
    { key: "regionen", label: "Regionen (kommagetrennt)", typ: "text", pflicht: true },
    { key: "seit", label: "Tätig seit (Jahr)", typ: "text" },
    { key: "bevorzugt", label: "Bevorzugter Partner", typ: "select", options: ["nein", "ja"] },
    { key: "vstatus", label: "Rahmenvereinbarung", typ: "select", options: ["Keine", "In Verhandlung", "Unterzeichnet"] },
    { key: "provisionsregelung", label: "Provisionsregelung", typ: "text", breit: true },
  ];
  return (
    <FormModal
      titel={initial ? `GU-Partner ${initial.id} bearbeiten` : "Neuer GU-Partner"}
      hinweis="GU-Partner sind eine Rolle eines bestehenden Unternehmens – es wird kein zweiter Unternehmensdatensatz angelegt."
      felder={felder}
      start={{ unternehmenId: initial?.unternehmenId ?? "", ansprechpartnerId: initial?.ansprechpartnerId ?? "", kategorie: initial?.kategorie ?? "Generalunternehmer", status: initial?.status ?? "Aktiv", gewerke: initial?.gewerke ?? [], regionen: initial?.regionen.join(", ") ?? "", seit: initial?.seit ?? "", bevorzugt: initial?.bevorzugt ? "ja" : "nein", vstatus: initial?.vereinbarung.status ?? "Keine", provisionsregelung: initial?.vereinbarung.provisionsregelung ?? "" }}
      pruefen={(w) => (crm.guPartner.some((g) => g.unternehmenId === w.unternehmenId && g.id !== initial?.id) ? { unternehmenId: "Dieses Unternehmen ist bereits als GU-Partner erfasst." } : ({} as Record<string, string>))}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? crm.nummer("guPartner");
        crm.speichere("guPartner", { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, ...initial, id, unternehmenId: text(w.unternehmenId), ansprechpartnerId: text(w.ansprechpartnerId) || undefined, kategorie: text(w.kategorie) as GUPartner["kategorie"], status: text(w.status) as GUPartner["status"], gewerke: liste(w.gewerke), regionen: liste(w.regionen), seit: text(w.seit), bevorzugt: w.bevorzugt === "ja", vereinbarung: { ...initial?.vereinbarung, status: text(w.vstatus), provisionsregelung: text(w.provisionsregelung) } }, { ref: id, text: initial ? "GU-Partner geändert" : "GU-Partner angelegt" });
        toast(`GU-Partner ${id} gespeichert ${TESTMODUS}`);
      }}
    />
  );
}
