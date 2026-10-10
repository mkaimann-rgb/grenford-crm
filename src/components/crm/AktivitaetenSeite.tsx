"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Clock, FileText, Mail, Pencil } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { addDays, aktivitaetStatus, datumDe, datumLang, monatJahr, notizen, suchtreffer, wochenStart, wochentagKurz } from "@/lib/crm/logic";
import { AKTIVITAET_TYPEN, type Aktivitaet, type AktivitaetTyp } from "@/lib/crm/types";
import { downloadCsv } from "@/lib/csv";
import { Button, FilterSelect, SearchInput, Tabs } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { AktivitaetZeile } from "./aktivitaeten";
import { AktivitaetModal } from "./modals";
import { FilterBar, KpiRow, ListLayout, NotizenCard, PageHeader, QuickActions, SideCard, bezugLabel } from "./page";

type Tab = "alle" | AktivitaetTyp;
const ZEITRAEUME = [
  { value: "14", label: "Nächste 14 Tage" },
  { value: "woche", label: "Diese Woche" },
  { value: "monat", label: "Dieser Monat" },
  { value: "vergangen", label: "Vergangene 30 Tage" },
  { value: "alle", label: "Alle" },
];

function bereich(key: string, heute: string): [string, string] {
  if (key === "14") return [heute, addDays(heute, 13)];
  if (key === "woche") return [wochenStart(heute), addDays(wochenStart(heute), 6)];
  if (key === "monat") {
    const y = Number(heute.slice(0, 4));
    const m = Number(heute.slice(5, 7));
    const naechster = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    return [heute.slice(0, 8) + "01", addDays(naechster, -1)];
  }
  if (key === "vergangen") return [addDays(heute, -30), heute];
  return ["0000-01-01", "9999-12-31"];
}

function Kalender({ aktivitaeten, onOpen }: { aktivitaeten: Aktivitaet[]; onOpen: (a: Aktivitaet) => void }) {
  const crm = useCrm();
  const [tag, setTag] = useState(crm.heute);
  const start = wochenStart(tag);
  const tage = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const amTag = aktivitaeten.filter((a) => a.datum === tag && a.typ !== "Notiz").sort((x, y) => (x.von ?? "99").localeCompare(y.von ?? "99"));
  const farbe = (a: Aktivitaet) => (aktivitaetStatus(a, crm.heute) === "Überfällig" ? "border-neg bg-neg-bg" : a.typ === "Aufgabe" ? "border-warn bg-warn-bg" : a.erledigt ? "border-pos bg-pos-bg" : "border-royal-500 bg-royal-100");
  return (
    <SideCard titel="Kalender" aktion={<span className="text-[11px] text-muted">{monatJahr(tag)}</span>}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setTag(addDays(tag, -7))} className="focus-ring rounded p-1 text-navy-900 hover:bg-line-soft" aria-label="Vorherige Woche"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setTag(addDays(tag, 7))} className="focus-ring rounded p-1 text-navy-900 hover:bg-line-soft" aria-label="Nächste Woche"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <Button size="sm" onClick={() => setTag(crm.heute)}>Heute</Button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {tage.map((t) => {
          const hat = aktivitaeten.some((a) => a.datum === t && a.typ !== "Notiz" && !a.erledigt);
          return (
            <button key={t} type="button" onClick={() => setTag(t)} aria-pressed={t === tag} aria-label={datumLang(t)} className="focus-ring flex flex-col items-center rounded py-1">
              <span className="text-[10px] text-muted">{wochentagKurz(t)}</span>
              <span className={`mt-0.5 flex h-[24px] w-[24px] items-center justify-center rounded-full text-[11.5px] ${t === tag ? "bg-navy-900 font-bold text-white" : t === crm.heute ? "font-bold text-navy-900 ring-1 ring-navy-900" : "text-ink"}`}>{t.slice(8, 10)}</span>
              <span className={`mt-0.5 h-[4px] w-[4px] rounded-full ${hat ? "bg-navy-900" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-2 border-t border-line-soft pt-2">
        <div className="mb-1 text-[11px] font-semibold text-navy-950">{datumLang(tag)}</div>
        <ul className="space-y-1">
          {amTag.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => onOpen(a)} className={`focus-ring w-full rounded border-l-[3px] px-2 py-1 text-left ${farbe(a)}`}>
                <div className="text-[10.5px] text-muted">{a.von ? `${a.von}${a.bis ? `–${a.bis}` : ""}` : "ganztägig"} · {a.typ}</div>
                <div className="truncate text-[11.5px] font-semibold text-navy-950">{a.titel}</div>
                <div className="truncate text-[10.5px] text-muted">{bezugLabel(a, crm)}</div>
              </button>
            </li>
          ))}
          {!amTag.length && <li className="py-2 text-[11.5px] text-muted">Keine Einträge an diesem Tag.</li>}
        </ul>
      </div>
    </SideCard>
  );
}

export function AktivitaetenSeite() {
  const crm = useCrm();
  const toast = useToast();
  const params = useSearchParams();
  const startTyp = params.get("typ");
  const [tab, setTab] = useState<Tab>(AKTIVITAET_TYPEN.includes(startTyp as AktivitaetTyp) ? (startTyp as AktivitaetTyp) : "alle");
  const [suche, setSuche] = useState("");
  const [bezug, setBezug] = useState("");
  const [verantwortlich, setVerantwortlich] = useState("");
  const [zeitraum, setZeitraum] = useState(startTyp === "Notiz" ? "alle" : "14");
  const [sortierung, setSortierung] = useState("auf");
  const [erledigteZeigen, setErledigteZeigen] = useState(false);
  const [modal, setModal] = useState<{ a?: Aktivitaet; typ?: AktivitaetTyp } | null>(null);
  const h = crm.heute;

  const bezugOptionen = useMemo(() => {
    const ids = new Map<string, string>();
    for (const a of crm.aktivitaeten) for (const b of a.bezug) ids.set(`${b.art}:${b.id}`, b.art === "unternehmen" ? crm.unternehmenById(b.id)?.name ?? "" : `${crm.personById(b.id)?.vorname ?? ""} ${crm.personById(b.id)?.nachname ?? ""}`);
    return [...ids.entries()].filter(([, l]) => l.trim()).sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label }));
  }, [crm]);

  const [von, bis] = bereich(zeitraum, h);
  const basis = crm.aktivitaeten.filter(
    (a) =>
      (tab === "alle" || a.typ === tab || (tab === "Termin" && a.typ === "Telefon")) &&
      (!bezug || a.bezug.some((b) => `${b.art}:${b.id}` === bezug)) &&
      (!verantwortlich || a.verantwortlichId === verantwortlich) &&
      suchtreffer(suche, a.titel, a.beschreibung, a.kontext, bezugLabel(a, crm)),
  );
  const offenOderSichtbar = (a: Aktivitaet) => erledigteZeigen || !a.erledigt || a.typ === "Notiz";
  const imZeitraum = basis.filter((a) => a.datum >= von && a.datum <= bis && offenOderSichtbar(a) && aktivitaetStatus(a, h) !== "Überfällig");
  const ueberfaellig = basis.filter((a) => aktivitaetStatus(a, h) === "Überfällig");

  const gruppen = (() => {
    const m = new Map<string, Aktivitaet[]>();
    const sortiert = [...imZeitraum].sort((x, y) => (sortierung === "auf" ? 1 : -1) * (x.datum + (x.von ?? "")).localeCompare(y.datum + (y.von ?? "")));
    for (const a of sortiert) m.set(a.datum, [...(m.get(a.datum) ?? []), a]);
    return [...m.entries()];
  })();

  const zaehl = (t: Tab) => crm.aktivitaeten.filter((a) => (t === "alle" || a.typ === t || (t === "Termin" && a.typ === "Telefon")) && (!a.erledigt || a.typ === "Notiz")).length;
  const kpis = {
    heute: crm.aktivitaeten.filter((a) => a.datum === h && a.typ !== "Notiz" && !a.erledigt).length,
    ueberfaellig: crm.aktivitaeten.filter((a) => aktivitaetStatus(a, h) === "Überfällig").length,
    aufgaben: crm.aktivitaeten.filter((a) => a.typ === "Aufgabe" && !a.erledigt).length,
    termine: crm.aktivitaeten.filter((a) => (a.typ === "Termin" || a.typ === "Telefon") && !a.erledigt && a.datum >= h && a.datum <= addDays(h, 7)).length,
    mails: crm.aktivitaeten.filter((a) => a.typ === "E-Mail" && !a.erledigt).length,
  };
  const label = (d: string) => (d === h ? `Heute, ${datumLang(d)}` : d === addDays(h, 1) ? `Morgen, ${datumLang(d)}` : d === addDays(h, -1) ? `Gestern, ${datumLang(d)}` : datumLang(d));

  const exportieren = () => {
    const rows = [...imZeitraum, ...ueberfaellig];
    downloadCsv("aktivitaeten.csv", ["Datum", "Von", "Bis", "Typ", "Titel", "Beschreibung", "Bezug", "Verantwortlich", "Status"],
      rows.map((a) => [datumDe(a.datum), a.von ?? "", a.bis ?? "", a.typ, a.titel, a.beschreibung, bezugLabel(a, crm), crm.benutzerName(a.verantwortlichId), aktivitaetStatus(a, h)]));
    toast(`${rows.length} Aktivitäten als CSV exportiert (Testdaten).`);
  };

  return (
    <>
      <ListLayout
        header={
          <PageHeader
            crumbs={[{ label: "Aktivitäten" }]}
            titel="Aktivitäten"
            untertitel="Alle Termine, Aufgaben, E-Mails und Notizen an einem Ort."
            primary={{ label: "Neue Aktivität", onClick: () => setModal({}) }}
            primaryMenu={[
              { label: "Termin", onClick: () => setModal({ typ: "Termin" }) },
              { label: "Aufgabe", onClick: () => setModal({ typ: "Aufgabe" }) },
              { label: "E-Mail protokollieren", onClick: () => setModal({ typ: "E-Mail" }) },
              { label: "Telefonat", onClick: () => setModal({ typ: "Telefon" }) },
              { label: "Notiz", onClick: () => setModal({ typ: "Notiz" }) },
            ]}
            moreMenu={[{ label: "Export (CSV)", hinweis: "aktuelle Ansicht", onClick: exportieren }]}
          />
        }
        main={
          <>
            <KpiRow
              kpis={[
                { label: "Heute", wert: kpis.heute, sub: "Termine und Aufgaben", icon: CalendarDays, onClick: () => { setTab("alle"); setZeitraum("14"); } },
                { label: "Überfällig", wert: kpis.ueberfaellig, sub: "Aufgaben", icon: Clock, onClick: () => { setTab("alle"); document.getElementById("ueberfaellig")?.scrollIntoView({ behavior: "smooth" }); } },
                { label: "Offene Aufgaben", wert: kpis.aufgaben, sub: "inkl. überfälliger", icon: CheckSquare, onClick: () => { setTab("Aufgabe"); setZeitraum("alle"); }, aktiv: tab === "Aufgabe" },
                { label: "Geplante Termine", wert: kpis.termine, sub: "nächste 7 Tage", icon: CalendarDays, onClick: () => { setTab("Termin"); setZeitraum("14"); }, aktiv: tab === "Termin" },
                { label: "Unerledigte E-Mails", wert: kpis.mails, sub: "offen", icon: Mail, onClick: () => { setTab("E-Mail"); setZeitraum("alle"); }, aktiv: tab === "E-Mail" },
              ]}
            />
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { id: "alle", label: `Alle (${zaehl("alle")})` },
                { id: "Termin", label: `Termine (${zaehl("Termin")})` },
                { id: "Aufgabe", label: `Aufgaben (${zaehl("Aufgabe")})` },
                { id: "E-Mail", label: `E-Mails (${zaehl("E-Mail")})` },
                { id: "Notiz", label: `Notizen (${zaehl("Notiz")})` },
              ]}
            />
            <FilterBar>
              <SearchInput value={suche} onChange={setSuche} placeholder="Aktivitäten durchsuchen …" className="w-full sm:w-[190px]" />
              <FilterSelect label="Alle Kunden / Projekte" value={bezug} onChange={setBezug} options={bezugOptionen} className="w-[170px]" />
              <FilterSelect label="Alle Verantwortlichen" value={verantwortlich} onChange={setVerantwortlich} options={crm.benutzer.map((b) => ({ value: b.id, label: b.name }))} className="w-[160px]" />
              <div className="relative">
                <select aria-label="Zeitraum" value={zeitraum} onChange={(e) => setZeitraum(e.target.value)} className="focus-ring h-[34px] rounded-[6px] border border-line bg-white px-3 text-[11.5px] text-navy-900 shadow-card">
                  {ZEITRAEUME.map((z) => <option key={z.value} value={z.value}>{z.label}{z.value !== "alle" ? ` (${datumDe(bereich(z.value, h)[0])} – ${datumDe(bereich(z.value, h)[1])})` : ""}</option>)}
                </select>
              </div>
              <select aria-label="Sortierung" value={sortierung} onChange={(e) => setSortierung(e.target.value)} className="focus-ring h-[34px] rounded-[6px] border border-line bg-white px-3 text-[11.5px] text-navy-900 shadow-card">
                <option value="auf">Datum (chronologisch)</option>
                <option value="ab">Datum (neueste zuerst)</option>
              </select>
              <label className="flex items-center gap-2 text-[11.5px] text-ink-soft">
                <input type="checkbox" checked={erledigteZeigen} onChange={(e) => setErledigteZeigen(e.target.checked)} className="accent-navy-900" />
                Erledigte anzeigen
              </label>
            </FilterBar>
            <div className="card overflow-hidden">
              <div className="hidden grid-cols-[24px_92px_22px_minmax(0,1.6fr)_minmax(0,1fr)_150px_96px_32px] gap-x-3 border-b border-line bg-[#fafbfd] px-3 py-[9px] text-[11px] text-muted md:grid">
                <span /><span>Datum / Zeit</span><span>Typ</span><span>Titel</span><span>Bezug</span><span>Verantwortlich</span><span>Status</span><span />
              </div>
              {gruppen.map(([datum, liste]) => (
                <section key={datum} aria-label={label(datum)}>
                  <h3 className="bg-white px-4 pb-1 pt-3 font-serif text-[13.5px] font-bold text-navy-950">{label(datum)}</h3>
                  <div className="divide-y divide-line-soft">{liste.map((a) => <AktivitaetZeile key={a.id} a={a} zeigeDatum={false} onEdit={(x) => setModal({ a: x })} />)}</div>
                </section>
              ))}
              {!gruppen.length && <p className="px-4 py-8 text-center text-[12px] text-muted">Keine Aktivitäten im gewählten Zeitraum.</p>}
              {ueberfaellig.length > 0 && (
                <section id="ueberfaellig" aria-label="Überfällig">
                  <h3 className="px-4 pb-1 pt-4 font-serif text-[13.5px] font-bold text-neg underline">Überfällig ({ueberfaellig.length})</h3>
                  <div className="divide-y divide-line-soft">{ueberfaellig.map((a) => <AktivitaetZeile key={a.id} a={a} onEdit={(x) => setModal({ a: x })} />)}</div>
                </section>
              )}
            </div>
          </>
        }
        aside={
          <>
            <Kalender aktivitaeten={crm.aktivitaeten} onOpen={(a) => setModal({ a })} />
            <QuickActions
              aktionen={[
                { label: "Termin erstellen", icon: CalendarDays, onClick: () => setModal({ typ: "Termin" }) },
                { label: "Aufgabe erstellen", icon: CheckSquare, onClick: () => setModal({ typ: "Aufgabe" }) },
                { label: "E-Mail protokollieren", icon: Mail, onClick: () => setModal({ typ: "E-Mail" }) },
                { label: "Notiz erstellen", icon: Pencil, onClick: () => setModal({ typ: "Notiz" }) },
              ]}
            />
            <NotizenCard notizen={notizen(crm.aktivitaeten, 3)} />
            <p className="flex items-start gap-2 px-1 text-[10.5px] text-muted"><FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />E-Mails werden nur protokolliert, nicht versendet. Kalender- und Gmail-Anbindung folgen nach Freigabe der Google-Workspace-Integration.</p>
          </>
        }
      />
      {modal && <AktivitaetModal initial={modal.a} typ={modal.typ} onClose={() => setModal(null)} />}
    </>
  );
}
