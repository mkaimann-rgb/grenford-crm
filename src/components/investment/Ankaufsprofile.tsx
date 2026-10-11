"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, CircleCheck, CircleDot, HeartHandshake, Search, Sparkles, Users, XCircle } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, letzteAktivitaet } from "@/lib/crm/logic";
import { PROFIL_STATUS, passend, type Ankaufsprofil } from "@/lib/crm/module";
import { HREF } from "@/lib/crm/projektion";
import { euroCompact } from "@/lib/format";
import { Avatar, Button, StatusBadge, Tabs } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { InfoList, Panel } from "@/components/crm/page";
import { ModulListe } from "@/components/modul/ModulListe";
import { FormModal, liste, text, zahl, type Feld } from "@/components/modul/FormModal";
import { RefLink, TESTMODUS, VerlaufPanel } from "@/components/modul/detail";

export const INVESTORENTYPEN = ["Institutionell", "Family Office", "Projektentwickler", "Privatkunde", "Privater Investor"];
export const ASSET_OPTIONEN = ["Wohnen", "MFH", "Gewerbe", "Hotel", "Logistik", "Light Industrial", "Co-Living", "Micro-Living", "Senior Living", "Healthcare", "Grundstücke", "Mixed-Use"];

const firmaOderPerson = (crm: ReturnType<typeof useCrm>, a: Pick<Ankaufsprofil, "unternehmenId" | "personId">) =>
  a.unternehmenId ? crm.unternehmenById(a.unternehmenId)?.name ?? "—" : a.personId ? crm.refName({ art: "person", id: a.personId }) : "—";

export function passendeInvestmentProjekte(crm: ReturnType<typeof useCrm>, k: { objektarten: string[]; regionen: string[]; von: number; bis: number }) {
  return passend(k, crm.investmentProjekte.filter((p) => p.status !== "Abgeschlossen" && p.status !== "Abgesagt"), (p) => ({ objektart: `${p.assetklasse} ${crm.objektById(p.objektId)?.objektart ?? ""}`, standort: p.standort, volumen: p.volumen }));
}

export function AnkaufsprofileListe() {
  const crm = useCrm();
  const params = useSearchParams();
  const [neu, setNeu] = useState(false);
  const [offen, setOffen] = useState<string | null>(params.get("id"));
  const rows = crm.ankaufsprofile;
  const letzte = (a: Ankaufsprofil) => letzteAktivitaet(crm.aktivitaeten.filter((x) => x.bezug.some((b) => (b.art === "vorgang" && b.id === a.id) || (b.art === "unternehmen" && b.id === a.unternehmenId) || (b.art === "person" && b.id === a.personId))), crm.heute, a.erstelltAm);
  const auswahl = rows.find((a) => a.id === offen);
  return (
    <>
      <ModulListe
        crumbs={[{ label: "Investment" }, { label: "Ankaufsprofile" }]}
        titel="Ankaufsprofile"
        untertitel="Alle Investoren und institutionellen Käufer mit ihren Ankaufsprofilen und Suchkriterien."
        neu={{ label: "Neues Ankaufsprofil", onClick: () => setNeu(true) }}
        rows={rows}
        suche={(a) => [a.id, firmaOderPerson(crm, a), a.kriterien, a.investorentyp, ...a.assetklassen, ...a.regionen]}
        suchePlatzhalter="Ankaufsprofile suchen …"
        onRow={(a) => setOffen(a.id)}
        defaultSort={{ key: "letzte", richtung: "desc" }}
        columns={[
          { key: "u", header: "Unternehmen", sort: (a) => firmaOderPerson(crm, a), cell: (a) => <div className="flex items-center gap-2"><Avatar name={firmaOderPerson(crm, a)} size={28} /><span className="font-semibold text-navy-950">{firmaOderPerson(crm, a)}</span></div> },
          { key: "ap", header: "Ansprechpartner", cell: (a) => a.personId ? crm.refName({ art: "person", id: a.personId }) : "—" },
          { key: "typ", header: "Investorentyp", sort: (a) => a.investorentyp, cell: (a) => a.investorentyp },
          { key: "asset", header: "Assetklasse", cell: (a) => <span className="line-clamp-2 max-w-[120px]">{a.assetklassen.join(", ")}</span> },
          { key: "reg", header: "Regionen (Fokus)", cell: (a) => <span className="line-clamp-2 max-w-[120px]">{a.regionen.join(", ")}</span> },
          { key: "vol", header: "Volumen (Mio. €)", sort: (a) => a.volumenVon, cell: (a) => `${a.volumenVon} – ${a.volumenBis}` },
          { key: "krit", header: "Suchkriterien (Kurzfassung)", cell: (a) => <span className="line-clamp-2 max-w-[180px] text-ink-soft">{a.kriterien}</span> },
          { key: "status", header: "Status", sort: (a) => a.status, cell: (a) => <StatusBadge status={a.status} /> },
          { key: "letzte", header: "Letzte Aktivität", sort: (a) => letzte(a), cell: (a) => datumDe(letzte(a)) },
        ]}
        filter={[
          { key: "typ", label: "Investorentyp", wert: (a) => a.investorentyp, inBar: true },
          { key: "asset", label: "Assetklasse", wert: (a) => a.assetklassen, inBar: true, offen: true },
          { key: "region", label: "Region", wert: (a) => a.regionen, inBar: true },
          { key: "status", label: "Status", wert: (a) => a.status, inBar: true },
        ]}
        quick={[
          { id: "", label: "Alle Ankaufsprofile", icon: Building2, test: () => true },
          { id: "aktiv", label: "Aktive Suchprofile", icon: Search, test: (a) => a.status === "Aktiv" },
          { id: "verhandlung", label: "In Verhandlung", icon: HeartHandshake, test: (a) => a.status === "In Verhandlung" },
          { id: "pruefung", label: "In Prüfung", icon: CircleDot, test: (a) => a.status === "In Prüfung" },
          { id: "platziert", label: "Platziert", icon: CircleCheck, test: (a) => a.status === "Platziert" },
          { id: "inaktiv", label: "Inaktiv", icon: XCircle, test: (a) => a.status === "Inaktiv" },
        ]}
        kpis={[
          { label: "Gesamt", icon: Building2, wert: (r) => r.length, sub: "Ankaufsprofile", quick: "" },
          { label: "Aktiv", icon: Users, wert: (r) => r.filter((a) => a.status === "Aktiv").length, sub: "in Suche", quick: "aktiv" },
          { label: "Neue Ankaufsprofile", icon: Search, wert: (r) => r.filter((a) => a.erstelltAm >= crm.heute.slice(0, 8) + "01").length, sub: "dieser Monat" },
          { label: "In Verhandlung", icon: HeartHandshake, wert: (r) => r.filter((a) => a.status === "In Verhandlung").length, sub: "mit Angeboten", quick: "verhandlung" },
          { label: "Erfolgreich platziert", icon: CircleCheck, wert: (r) => r.filter((a) => a.status === "Platziert").length, sub: "dieses Jahr", quick: "platziert" },
        ]}
        csv={{ datei: "ankaufsprofile.csv", kopf: ["ID", "Unternehmen", "Ansprechpartner", "Investorentyp", "Assetklassen", "Regionen", "Volumen von (Mio.)", "Volumen bis (Mio.)", "Rendite min. %", "Kriterien", "Status"], zeile: (a) => [a.id, firmaOderPerson(crm, a), a.personId ? crm.refName({ art: "person", id: a.personId }) : "", a.investorentyp, a.assetklassen.join(", "), a.regionen.join(", "), a.volumenVon, a.volumenBis, a.renditeMin ?? "", a.kriterien, a.status] }}
        statusAenderung={{ werte: PROFIL_STATUS, setze: (sel, s) => sel.forEach((id) => { const a = rows.find((x) => x.id === id)!; crm.speichere("ankaufsprofile", { ...a, status: s as Ankaufsprofil["status"] }, { ref: id, text: `Status → ${s}` }); }) }}
        aktivitaeten={crm.aktivitaeten.filter((x) => x.bezug.some((b) => b.art === "unternehmen" && rows.some((a) => a.unternehmenId === b.id)))}
      />
      {neu && <AnkaufsprofilModal onClose={() => setNeu(false)} />}
      {auswahl && <AnkaufsprofilEinzel a={auswahl} onClose={() => setOffen(null)} />}
    </>
  );
}

function AnkaufsprofilEinzel({ a, onClose }: { a: Ankaufsprofil; onClose: () => void }) {
  const crm = useCrm();
  const [tab, setTab] = useState<"allgemein" | "kriterien" | "projekte" | "verlauf">("allgemein");
  const [edit, setEdit] = useState(false);
  const u = a.unternehmenId ? crm.unternehmenById(a.unternehmenId) : undefined;
  const p = a.personId ? crm.personById(a.personId) : undefined;
  const treffer = passendeInvestmentProjekte(crm, { objektarten: a.assetklassen, regionen: a.regionen, von: a.volumenVon, bis: a.volumenBis });
  return (
    <Modal titel={`Ankaufsprofil – ${firmaOderPerson(crm, a)}`} onClose={onClose} breit="max-w-[1120px]" footer={<><Button onClick={onClose}>Schließen</Button><Button onClick={() => setEdit(true)} variant="primary">Bearbeiten</Button></>}>
      <Tabs tabs={[{ id: "allgemein", label: "Allgemein" }, { id: "kriterien", label: "Suchkriterien" }, { id: "projekte", label: `Passende Projekte (${treffer.length})` }, { id: "verlauf", label: "Verlauf" }]} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === "allgemein" && (
          <div className="grid gap-[12px] lg:grid-cols-3">
            <Panel titel="Unternehmen"><InfoList rows={[["Unternehmen", <RefLink key="u" r={a.unternehmenId ? { art: "unternehmen", id: a.unternehmenId } : undefined} />], ["Art", u?.arten.join(", ") ?? "Privatperson"], ["Webseite", u?.website ?? "—"], ["Telefon", u?.telefon ?? "—"], ["Adresse", u ? `${u.strasse}, ${u.plz} ${u.ort}` : "—"]]} /></Panel>
            <Panel titel="Ansprechpartner"><InfoList rows={[["Name", <RefLink key="p" r={a.personId ? { art: "person", id: a.personId } : undefined} />], ["E-Mail", p?.email ?? "—"], ["Telefon (mobil)", p?.telefonMobil || "—"], ["Telefon (gesch.)", p?.telefonGeschaeftlich || "—"]]} /></Panel>
            <Panel titel="Ankaufsprofil" aktion={<StatusBadge status={a.status} />}>
              <InfoList rows={[["Profil-ID", a.id], ["Investorentyp", a.investorentyp], ["Zielvolumen", `${a.volumenVon} – ${a.volumenBis} Mio. €`], ["Assetklassen", a.assetklassen.join(", ")], ["Regionen", a.regionen.join(", ")], ["Rendite (min.)", a.renditeMin ? `${a.renditeMin} %` : "—"]]} />
            </Panel>
          </div>
        )}
        {tab === "kriterien" && <Panel titel="Suchkriterien"><p className="text-[12.5px] leading-relaxed text-ink">{a.kriterien}</p></Panel>}
        {tab === "projekte" && (
          <Panel titel="Passende Investment-Projekte (Objektart, Region, Volumen)">
            <ul className="divide-y divide-line-soft">
              {treffer.map(({ k, score }) => (
                <li key={k.id} className="flex items-center gap-3 py-2 text-[12px]">
                  <Avatar name={k.titel} bild={crm.objektById(k.objektId)?.bild} size={36} rund={false} />
                  <Link href={HREF.invest(k.id)} className="flex-1 font-semibold text-navy-950 hover:underline">{k.titel} <span className="font-normal text-muted">· {k.id} · {k.standort}</span></Link>
                  <span>{euroCompact(k.volumen)}</span>
                  <span className="flex items-center gap-1 text-[11px] text-pos"><Sparkles className="h-3.5 w-3.5" />{score}/3 Kriterien</span>
                </li>
              ))}
              {!treffer.length && <li className="py-3 text-[12px] text-muted">Derzeit kein passendes aktives Projekt.</li>}
            </ul>
          </Panel>
        )}
        {tab === "verlauf" && <VerlaufPanel refIds={[a.id]} />}
      </div>
      {edit && <AnkaufsprofilModal initial={a} onClose={() => setEdit(false)} />}
    </Modal>
  );
}

export function AnkaufsprofilModal({ initial, onClose }: { initial?: Ankaufsprofil; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  const felder: Feld[] = [
    { key: "unternehmenId", label: "Unternehmen (Käufer)", typ: "unternehmen" },
    { key: "personId", label: "Ansprechpartner", typ: "person" },
    { key: "investorentyp", label: "Investorentyp", typ: "select", pflicht: true, options: INVESTORENTYPEN },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: PROFIL_STATUS },
    { key: "assetklassen", label: "Assetklassen", typ: "multi", pflicht: true, options: ASSET_OPTIONEN },
    { key: "regionen", label: "Regionen (kommagetrennt)", typ: "text", pflicht: true, placeholder: "z. B. Berlin, Hamburg, DACH" },
    { key: "renditeMin", label: "Rendite min. (%)", typ: "zahl" },
    { key: "volumenVon", label: "Volumen von (Mio. €)", typ: "zahl", pflicht: true },
    { key: "volumenBis", label: "Volumen bis (Mio. €)", typ: "zahl", pflicht: true },
    { key: "kriterien", label: "Suchkriterien", typ: "textarea", pflicht: true },
  ];
  return (
    <FormModal
      titel={initial ? `Ankaufsprofil ${initial.id} bearbeiten` : "Neues Ankaufsprofil"}
      hinweis="Käufer und Ansprechpartner werden aus den bestehenden Stammdaten gewählt – keine Dubletten."
      felder={felder}
      start={{ unternehmenId: initial?.unternehmenId ?? "", personId: initial?.personId ?? "", investorentyp: initial?.investorentyp ?? "", status: initial?.status ?? "Aktiv", assetklassen: initial?.assetklassen ?? [], regionen: initial?.regionen.join(", ") ?? "", renditeMin: initial?.renditeMin ? String(initial.renditeMin) : "", volumenVon: initial ? String(initial.volumenVon) : "", volumenBis: initial ? String(initial.volumenBis) : "", kriterien: initial?.kriterien ?? "" }}
      pruefen={(w) => {
        const e: Record<string, string> = {};
        if (!text(w.unternehmenId) && !text(w.personId)) e.unternehmenId = "Bitte Unternehmen oder Ansprechpartner wählen.";
        if (zahl(w.volumenBis) < zahl(w.volumenVon)) e.volumenBis = "„bis“ muss mindestens „von“ sein.";
        return e;
      }}
      onClose={onClose}
      speichern={(w) => {
        const id = initial?.id ?? crm.nummer("ankaufsprofil");
        crm.speichere("ankaufsprofile", { erstelltAm: crm.heute, verantwortlichId: crm.benutzer[0].id, ...initial, id, unternehmenId: text(w.unternehmenId) || undefined, personId: text(w.personId) || undefined, investorentyp: text(w.investorentyp), status: text(w.status) as Ankaufsprofil["status"], assetklassen: liste(w.assetklassen), regionen: liste(w.regionen), renditeMin: zahl(w.renditeMin) || undefined, volumenVon: zahl(w.volumenVon), volumenBis: zahl(w.volumenBis), kriterien: text(w.kriterien) }, { ref: id, text: initial ? "Ankaufsprofil geändert" : "Ankaufsprofil angelegt" });
        toast(`Ankaufsprofil ${id} gespeichert ${TESTMODUS}`);
      }}
    />
  );
}
