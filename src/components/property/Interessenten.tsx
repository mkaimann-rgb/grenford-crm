"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck, CircleDot, Hourglass, HeartHandshake, Search, UserCheck, Users, XCircle } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, letzteAktivitaet } from "@/lib/crm/logic";
import { INTERESSENT_STATUS, passend, type Interessent } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { euroCompact } from "@/lib/format";
import { Avatar, Button, StatusBadge, Tabs } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { InfoList, Panel } from "@/components/crm/page";
import { AktivitaetenPanel } from "@/components/crm/aktivitaeten";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, liste, refAus, refZu, text, zahl, type Feld } from "@/components/modul/FormModal";
import { RefLink, TESTMODUS, VerlaufPanel, bezugVorgang } from "@/components/modul/detail";
import { OBJEKTARTEN } from "./Mandate";

const TYPEN = ["Privatkunde", "Family Office", "Institutionell"];

export function InteressentenListe() {
  const crm = useCrm();
  const params = useSearchParams();
  const [neu, setNeu] = useState(false);
  const [offen, setOffen] = useState<string | null>(params.get("id"));
  const rows = crm.interessenten;
  const firma = (i: Interessent) => (i.ref.art === "unternehmen" ? crm.refName(i.ref) : "Privatkunde");
  const ap = (i: Interessent) => (i.ansprechpartnerId ? crm.refName({ art: "person", id: i.ansprechpartnerId }) : i.ref.art === "person" ? crm.refName(i.ref) : "—");
  const letzte = (i: Interessent) => letzteAktivitaet(crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.id === i.id || b.id === i.ref.id)), crm.heute, i.erstelltAm);
  const auswahl = rows.find((i) => i.id === offen);
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Property" }, { label: "Interessenten" }]}
        titel="Interessenten"
        untertitel="Alle Kaufinteressenten mit ihren Suchkriterien und Profilen."
        neu={{ label: "Neuer Interessent", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(i) => [i.id, crm.refName(i.ref), ap(i), i.kriterien, ...i.objektarten, ...i.regionen]}
        suchePlatzhalter="Interessenten suchen …"
        onRow={(i) => setOffen(i.id)}
        defaultSort={{ key: "letzte", richtung: "desc" }}
        columns={[
          { key: "u", header: "Unternehmen", sort: (i) => firma(i), cell: (i) => <div className="flex items-center gap-2"><Avatar name={crm.refName(i.ref)} size={28} /><span className="font-semibold text-navy-950">{i.ref.art === "unternehmen" ? crm.refName(i.ref) : crm.refName(i.ref)}</span></div> },
          { key: "ap", header: "Ansprechpartner", cell: ap },
          { key: "typ", header: "Interessententyp", sort: (i) => i.typ, cell: (i) => i.typ },
          { key: "art", header: "Objektart (Fokus)", cell: (i) => <span className="line-clamp-2 max-w-[120px]">{i.objektarten.join(", ")}</span> },
          { key: "reg", header: "Region (Fokus)", cell: (i) => <span className="line-clamp-2 max-w-[110px]">{i.regionen.join(", ")}</span> },
          { key: "budget", header: "Budget (Mio. €)", sort: (i) => i.budgetVon, cell: (i) => `${String(i.budgetVon).replace(".", ",")} – ${String(i.budgetBis).replace(".", ",")}` },
          { key: "krit", header: "Suchkriterien (Kurzfassung)", cell: (i) => <span className="line-clamp-2 max-w-[170px] text-ink-soft">{i.kriterien}</span> },
          { key: "status", header: "Status", sort: (i) => i.status, cell: (i) => <StatusBadge status={i.status} /> },
          { key: "letzte", header: "Letzte Aktivität", sort: (i) => letzte(i), cell: (i) => datumDe(letzte(i)) },
        ]}
        filter={[
          { key: "typ", label: "Interessententyp", wert: (i) => i.typ, inBar: true },
          { key: "art", label: "Objektart", wert: (i) => i.objektarten, inBar: true, offen: true },
          { key: "region", label: "Region (Fokus)", wert: (i) => i.regionen, inBar: true },
          { key: "status", label: "Status", wert: (i) => i.status, inBar: true },
        ]}
        quick={[
          { id: "", label: "Alle Interessenten", icon: Users, test: () => true },
          { id: "aktiv", label: "Aktive Interessenten", icon: Search, test: (i) => i.status === "Aktiv" },
          { id: "verhandlung", label: "In Verhandlung", icon: HeartHandshake, test: (i) => i.status === "In Verhandlung" },
          { id: "pruefung", label: "In Prüfung", icon: Hourglass, test: (i) => i.status === "In Prüfung" },
          { id: "kaeufer", label: "Abgeschlossen / Käufer", icon: UserCheck, test: (i) => i.status === "Käufer" },
          { id: "inaktiv", label: "Inaktiv", icon: XCircle, test: (i) => i.status === "Inaktiv" },
        ]}
        kpis={[
          { label: "Gesamt", icon: Users, wert: (r) => r.length, sub: "Interessenten", quick: "" },
          { label: "Aktiv", icon: Search, wert: (r) => r.filter((i) => i.status === "Aktiv").length, sub: "in Suche", quick: "aktiv" },
          { label: "Neu", icon: CircleDot, wert: (r) => r.filter((i) => i.erstelltAm >= crm.heute.slice(0, 8) + "01").length, sub: "dieser Monat" },
          { label: "In Verhandlung", icon: HeartHandshake, wert: (r) => r.filter((i) => i.status === "In Verhandlung").length, sub: "mit Objekten", quick: "verhandlung" },
          { label: "Erfolgreich platziert", icon: CircleCheck, wert: (r) => r.filter((i) => i.status === "Käufer").length, sub: "dieses Jahr", quick: "kaeufer" },
        ]}
        csv={{ datei: "property-interessenten.csv", kopf: ["ID", "Interessent", "Art", "Ansprechpartner", "Typ", "Objektarten", "Regionen", "Budget von (Mio.)", "Budget bis (Mio.)", "Kriterien", "Status"], zeile: (i) => [i.id, crm.refName(i.ref), i.ref.art, ap(i), i.typ, i.objektarten.join(", "), i.regionen.join(", "), i.budgetVon, i.budgetBis, i.kriterien, i.status] }}
        statusAenderung={{ werte: INTERESSENT_STATUS, setze: (sel, s) => sel.forEach((id) => { const i = rows.find((x) => x.id === id)!; crm.speichere("interessenten", { ...i, status: s as Interessent["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((a) => a.bezug.some((b) => rows.some((i) => i.ref.id === b.id || i.id === b.id)))}
      />
      {neu && <InteressentModal onClose={() => setNeu(false)} />}
      {auswahl && <InteressentEinzel i={auswahl} onClose={() => setOffen(null)} />}
    </>
  );
}

function InteressentEinzel({ i, onClose }: { i: Interessent; onClose: () => void }) {
  const crm = useCrm();
  const [tab, setTab] = useState<"allgemein" | "kriterien" | "objekte" | "aktivitaeten" | "verlauf">("allgemein");
  const [edit, setEdit] = useState(false);
  const u = i.ref.art === "unternehmen" ? crm.unternehmenById(i.ref.id) : undefined;
  const apId = i.ansprechpartnerId ?? (i.ref.art === "person" ? i.ref.id : undefined);
  const p = apId ? crm.personById(apId) : undefined;
  const kps = crm.kaeuferprozesse.filter((k) => k.bereich === "Property" && k.kaeufer.id === i.ref.id);
  const treffer = passend({ objektarten: i.objektarten, regionen: i.regionen, von: i.budgetVon, bis: i.budgetBis }, crm.propertyMandate.filter((m) => !["Abgeschlossen", "Inaktiv"].includes(m.status)), (m) => { const o = crm.objektById(m.objektId); return { objektart: o?.objektart ?? "", standort: o?.ort ?? "", volumen: m.preis }; });
  const akt = crm.aktivitaeten.filter((a) => a.bezug.some((b) => b.id === i.id || b.id === i.ref.id || b.id === apId));
  return (
    <Modal titel={`Interessent – ${crm.refName(i.ref)}`} onClose={onClose} breit="max-w-[1120px]" footer={<><Button onClick={onClose}>Schließen</Button><Button variant="primary" onClick={() => setEdit(true)}>Bearbeiten</Button></>}>
      <Tabs tabs={[{ id: "allgemein", label: "Allgemein" }, { id: "kriterien", label: "Suchkriterien" }, { id: "objekte", label: `Aktuelle Objekte & Mandate (${kps.length + treffer.length})` }, { id: "aktivitaeten", label: "Timeline & Aktivitäten" }, { id: "verlauf", label: "Verlauf" }]} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === "allgemein" && (
          <div className="grid gap-[12px] lg:grid-cols-3">
            <Panel titel={u ? "Unternehmen" : "Person"}><InfoList rows={[["Name", <RefLink key="r" r={i.ref} />], ["Branche / Art", u?.arten.join(", ") ?? (p?.privat ? "Privatkunde" : "Person")], ["Website", u?.website ?? "—"], ["Telefon", u?.telefon || p?.telefonMobil || "—"], ["Adresse", u ? `${u.strasse}, ${u.plz} ${u.ort}` : p ? `${p.strasse} ${p.plz} ${p.ort}` : "—"]]} /></Panel>
            <Panel titel="Ansprechpartner"><InfoList rows={[["Name", <RefLink key="p" r={apId ? { art: "person", id: apId } : undefined} />], ["E-Mail", p?.email ?? "—"], ["Telefon (mobil)", p?.telefonMobil || "—"], ["Telefon (gesch.)", p?.telefonGeschaeftlich || "—"]]} /></Panel>
            <Panel titel="Interessentenprofil" aktion={<StatusBadge status={i.status} />}>
              <InfoList rows={[["ID", i.id], ["Interessententyp", i.typ], ["Investitionsvolumen", `${i.budgetVon} – ${i.budgetBis} Mio. €`], ["Objektart (Fokus)", i.objektarten.join(", ")], ["Regionen (Fokus)", i.regionen.join(", ")]]} />
            </Panel>
            {i.weitere.length > 0 && <Panel titel="Weitere Informationen" className="lg:col-span-3"><InfoList rows={i.weitere} /></Panel>}
          </div>
        )}
        {tab === "kriterien" && <Panel titel="Suchkriterien"><p className="text-[12.5px] text-ink">{i.kriterien}</p></Panel>}
        {tab === "objekte" && (
          <div className="grid gap-[12px] lg:grid-cols-2">
            <Panel titel="Laufende Käuferprozesse">
              <ul className="divide-y divide-line-soft text-[12px]">
                {kps.map((k) => { const m = crm.propertyMandate.find((x) => x.id === k.projektId); const o = m && crm.objektById(m.objektId); return <li key={k.id} className="flex items-center gap-2 py-2"><Avatar name={o?.titel ?? ""} bild={o?.bild} size={34} rund={false} /><Link href={HREF.propKp(k.id)} className="flex-1 font-semibold text-navy-950 hover:underline">{o?.titel ?? k.projektId}<span className="block text-[10.5px] font-normal text-muted">{k.id} · Phase {k.phase}</span></Link><span>{euroCompact(k.indikation)}</span><StatusBadge status={k.status} /></li>; })}
                {!kps.length && <li className="py-2 text-muted">Kein laufender Käuferprozess.</li>}
              </ul>
            </Panel>
            <Panel titel="Passende Objekte & Mandate">
              <ul className="divide-y divide-line-soft text-[12px]">
                {treffer.map(({ k: m, score }) => { const o = crm.objektById(m.objektId); return <li key={m.id} className="flex items-center gap-2 py-2"><Link href={HREF.mandat(m.id)} className="flex-1 font-semibold text-navy-950 hover:underline">{o?.titel}<span className="block text-[10.5px] font-normal text-muted">{m.id} · {o?.ort}</span></Link><span>{euroCompact(m.preis)}</span><span className="text-[11px] text-pos">{score}/3</span></li>; })}
                {!treffer.length && <li className="py-2 text-muted">Kein passendes aktives Objekt.</li>}
              </ul>
            </Panel>
          </div>
        )}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={akt} bezug={[...bezugVorgang(i.id), { art: i.ref.art, id: i.ref.id }]} />}
        {tab === "verlauf" && <VerlaufPanel refIds={[i.id]} />}
      </div>
      {edit && <InteressentModal initial={i} onClose={() => setEdit(false)} />}
    </Modal>
  );
}

export function InteressentModal({ initial, onClose }: { initial?: Interessent; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const felder: Feld[] = [
    { key: "ref", label: "Interessent (Person oder Unternehmen aus Stammdaten)", typ: "ref", pflicht: true, breit: true },
    { key: "ansprechpartnerId", label: "Ansprechpartner", typ: "person" },
    { key: "typ", label: "Interessententyp", typ: "select", pflicht: true, options: TYPEN },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: INTERESSENT_STATUS },
    { key: "objektarten", label: "Objektarten", typ: "multi", pflicht: true, options: OBJEKTARTEN },
    { key: "regionen", label: "Regionen (kommagetrennt)", typ: "text", pflicht: true },
    { key: "budgetVon", label: "Budget von (Mio. €)", typ: "zahl", pflicht: true },
    { key: "budgetBis", label: "Budget bis (Mio. €)", typ: "zahl", pflicht: true },
    { key: "kriterien", label: "Suchkriterien", typ: "textarea", pflicht: true },
  ];
  return (
    <FormModal
      titel={initial ? `Interessent ${initial.id} bearbeiten` : "Neuer Interessent"}
      hinweis="Interessenten sind eine Rolle bestehender Personen oder Unternehmen – es wird kein zweiter Stammsatz angelegt."
      felder={felder}
      start={{ ref: refZu(initial?.ref), ansprechpartnerId: initial?.ansprechpartnerId ?? "", typ: initial?.typ ?? "", status: initial?.status ?? "Aktiv", objektarten: initial?.objektarten ?? [], regionen: initial?.regionen.join(", ") ?? "", budgetVon: initial ? String(initial.budgetVon).replace(".", ",") : "", budgetBis: initial ? String(initial.budgetBis).replace(".", ",") : "", kriterien: initial?.kriterien ?? "" }}
      pruefen={(w) => {
        const e: Record<string, string> = {};
        const r = refAus(w.ref);
        if (r && crm.interessenten.some((i) => i.ref.id === r.id && i.id !== initial?.id)) e.ref = "Für diesen Stammsatz existiert bereits ein Interessentenprofil – bitte dieses bearbeiten (keine Dublette).";
        if (zahl(w.budgetBis) < zahl(w.budgetVon)) e.budgetBis = "„bis“ muss mindestens „von“ sein.";
        return e;
      }}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? crm.nummer("interessent");
        crm.speichere("interessenten", { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, weitere: [], ...initial, id, ref: refAus(w.ref)!, ansprechpartnerId: text(w.ansprechpartnerId) || undefined, typ: text(w.typ), status: text(w.status) as Interessent["status"], objektarten: liste(w.objektarten), regionen: liste(w.regionen), budgetVon: zahl(w.budgetVon), budgetBis: zahl(w.budgetBis), kriterien: text(w.kriterien) }, { ref: id, text: initial ? "Interessentenprofil geändert" : "Interessent angelegt" });
        toast(`Interessent ${id} gespeichert ${TESTMODUS}`);
      }}
    />
  );
}
