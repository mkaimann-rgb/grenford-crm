"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, FileText, Images, Mail, Plus, Send } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { aktivitaetStatus, datumDe } from "@/lib/crm/logic";
import { naechstePhase, phasenIndex, type Beteiligter, type Phase, type Ref } from "@/lib/crm/module";
import type { Aktivitaet, AktivitaetTyp, Bezug, ID } from "@/lib/crm/types";
import { Avatar, Button, Menu } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { AktivitaetModal } from "@/components/crm/modals";
import { TypIcon } from "@/components/crm/aktivitaeten";
import { Panel } from "@/components/crm/page";
import { FormModal, refAus, text } from "./FormModal";

export const TESTMODUS = "(Testmodus – nur in diesem Browser zwischengespeichert)";

// ---------- Kopfbereich ----------

export type Kennzahl = { label: string; wert: ReactNode; sub?: string };

export function DetailKopf({
  crumbs, bild, bilder, idBadge, titel, meta, tags, kennzahlen, aktionen, onTag,
}: {
  crumbs: { label: string; href?: string }[];
  bild?: string;
  bilder?: number;
  idBadge: string;
  titel: string;
  meta: { icon: ReactNode; text: ReactNode }[];
  tags: { label: string; cls?: string }[];
  kennzahlen: Kennzahl[];
  aktionen?: ReactNode;
  onTag?: () => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <nav aria-label="Brotkrumen" className="flex flex-wrap items-center gap-2 text-[11.5px] text-[#596b83]">
          {crumbs.map((c, i) => (
            <span key={c.label + i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {c.href ? <Link href={c.href} className="focus-ring rounded hover:text-navy-900">{c.label}</Link> : <span aria-current="page" className="font-semibold text-navy-900">{c.label}</span>}
            </span>
          ))}
          <span className="rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold tracking-[0.12em] text-warn">TESTDATEN</span>
        </nav>
        {aktionen && <div className="flex flex-wrap items-center gap-2">{aktionen}</div>}
      </div>
      <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row">
          <div className="relative h-[150px] w-full shrink-0 overflow-hidden rounded-[10px] bg-line-soft sm:w-[245px]">
            {bild ? <Image src={bild} alt="" fill sizes="245px" className="object-cover" /> : <div className="flex h-full items-center justify-center font-serif text-[28px] font-bold text-navy-800">{titel.slice(0, 2).toUpperCase()}</div>}
            {bild && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-[6px] bg-navy-950/80 px-2 py-1 text-[11px] text-white"><Images className="h-3.5 w-3.5" />Bilder ({bilder ?? 1})</span>}
          </div>
          <div className="min-w-0">
            <span className="inline-block rounded-[4px] bg-royal-100 px-2 py-[2px] text-[11px] font-semibold text-navy-900">{idBadge}</span>
            <h1 className="mt-1 font-serif text-[26px] font-bold leading-tight text-navy-950 lg:text-[28px]">{titel}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-navy-900">
              {meta.map((m, i) => <span key={i} className="flex items-center gap-1.5">{m.icon}{m.text}</span>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-[6px]">
              {tags.map((t) => <span key={t.label} className={`rounded-[5px] px-3 py-[5px] text-[11.5px] font-medium ${t.cls ?? "bg-royal-100 text-navy-900"}`}>{t.label}</span>)}
              {onTag && <button type="button" onClick={onTag} aria-label="Kennzeichnung hinzufügen" className="focus-ring rounded-[5px] border border-line px-2 text-navy-900 hover:bg-line-soft"><Plus className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
        </div>
        {kennzahlen.length > 0 && (
          <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-line bg-white sm:grid-cols-4 xl:w-[560px] 2xl:w-[600px]">
            {kennzahlen.map((k) => (
              <div key={k.label} className="border-b border-r border-line-soft px-3 py-2.5">
                <div className="truncate text-[10.5px] text-muted" title={k.label}>{k.label}</div>
                <div className="mt-1 truncate font-serif text-[17px] font-bold text-navy-950">{k.wert}</div>
                {k.sub && <div className="truncate text-[10px] text-muted" title={k.sub}>{k.sub}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Phasen ----------

/** Phasenleiste A–F mit Unterphasen (Investment, Property, Projects, Beteiligungen) */
export function PhasenLeiste({ phasen, aktuell, onWechsel, aktionLabel = "Nächste Phase vorbereiten" }: { phasen: Phase[]; aktuell: string; onWechsel?: (code: string) => void; aktionLabel?: string }) {
  const { i: ai } = phasenIndex(phasen, aktuell);
  const naechste = naechstePhase(phasen, aktuell);
  return (
    <section className="card relative mt-4 px-3 pb-3 pt-3" aria-label="Prozessphasen">
      <div className="flex items-start gap-2">
        <ChevronLeft className="mt-8 hidden h-5 w-5 shrink-0 text-navy-900 lg:block" aria-hidden />
        <ol className="grid flex-1 grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          {phasen.map((p, i) => {
            const done = i < ai;
            const cur = i === ai;
            return (
              <li key={p.code} className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-navy-900 text-white" : cur ? "bg-navy-950 text-white ring-2 ring-royal-200" : "border border-line text-navy-800"}`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : cur ? p.code : <Plus className="h-3.5 w-3.5" />}
                  </span>
                  <span className={`truncate text-[12px] ${cur || done ? "font-semibold text-navy-950" : "text-ink-soft"}`}>{p.code} – {p.titel}</span>
                </div>
                <ul className="mt-1.5 space-y-[2px] pl-1">
                  {p.unter.map((u) => {
                    const on = u.code === aktuell;
                    return (
                      <li key={u.code}>
                        <button
                          type="button"
                          disabled={!onWechsel}
                          onClick={() => onWechsel?.(u.code)}
                          aria-current={on ? "step" : undefined}
                          className={`focus-ring flex w-full gap-2 rounded px-1.5 py-[2px] text-left text-[11px] ${on ? "bg-royal-100 font-semibold text-navy-950" : "text-ink-soft enabled:hover:bg-line-soft"}`}
                        >
                          <span className="w-[22px] shrink-0 text-muted">{u.code}</span>
                          <span className="truncate">{u.titel}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
        <ChevronRight className="mt-8 hidden h-5 w-5 shrink-0 text-navy-900 lg:block" aria-hidden />
      </div>
      {onWechsel && naechste && (
        <div className="mt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => onWechsel(naechste)}>
            <ChevronRight className="h-3.5 w-3.5" />{aktionLabel} ({naechste})
          </Button>
        </div>
      )}
    </section>
  );
}

/** Nummerierte Stufen (Akquise-Pipeline) */
export function StufenLeiste({ stufen, aktuell, onWechsel }: { stufen: readonly { titel: string; text: string }[]; aktuell: number; onWechsel?: (i: number) => void }) {
  return (
    <section className="card mt-4 overflow-x-auto px-4 py-3" aria-label="Pipeline-Stufen">
      <ol className="flex min-w-[860px] items-start gap-2">
        {stufen.map((s, i) => {
          const done = i < aktuell;
          const cur = i === aktuell;
          return (
            <li key={s.titel} className="flex-1">
              <button type="button" disabled={!onWechsel} onClick={() => onWechsel?.(i)} aria-current={cur ? "step" : undefined} className="focus-ring w-full rounded text-left enabled:hover:bg-line-soft">
                <div className="flex items-center gap-2">
                  <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-royal-500 text-white" : cur ? "bg-navy-950 text-white" : "border border-line text-muted"}`}>{done ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                  <span className={`h-[2px] flex-1 ${i < stufen.length - 1 ? (done ? "bg-royal-500" : "border-t border-dashed border-line") : ""}`} />
                </div>
                <div className={`mt-1.5 text-[12.5px] ${cur || done ? "font-semibold text-navy-950" : "text-ink-soft"}`}>{s.titel}</div>
                <div className="text-[11px] text-muted">{s.text}</div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ---------- Beteiligte ----------

export function BeteiligtePanel({ beteiligte, onAendern, titel = "Beteiligte" }: { beteiligte: Beteiligter[]; onAendern?: (neu: Beteiligter[]) => void; titel?: string }) {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  return (
    <Panel titel={titel} aktion={onAendern && <button type="button" onClick={() => setNeu(true)} className="link-more"><Plus className="h-3.5 w-3.5" />Beteiligten hinzufügen</button>}>
      <ul className="divide-y divide-line-soft">
        {beteiligte.map((b, i) => {
          const name = crm.refName(b);
          const href = crm.refHref(b);
          return (
            <li key={`${b.art}-${b.id}-${i}`} className="flex items-center gap-3 py-2">
              <Avatar name={name} size={30} />
              <div className="min-w-0 flex-1">
                {href ? <Link href={href} className="block truncate text-[12px] font-semibold text-navy-950 hover:underline">{name}</Link> : <span className="text-[12px] font-semibold">{name}</span>}
                <div className="truncate text-[10.5px] text-muted">{b.art === "person" ? crm.personById(b.id)?.kontakte.map((k) => crm.unternehmenById(k.unternehmenId)?.name).filter(Boolean).join(", ") || "Person" : "Unternehmen"}</div>
              </div>
              <span className="max-w-[45%] truncate text-right text-[11px] text-ink-soft" title={b.rolle}>{b.rolle}</span>
              {onAendern && (
                <Menu label={`Aktionen ${name}`} items={[{ label: "Entfernen", danger: true, onClick: () => onAendern(beteiligte.filter((_, j) => j !== i)) }]} trigger={<span className="px-1 text-navy-900">⋯</span>} />
              )}
            </li>
          );
        })}
        {!beteiligte.length && <li className="py-2 text-[12px] text-muted">Noch keine Beteiligten.</li>}
      </ul>
      {neu && onAendern && (
        <FormModal
          titel="Beteiligten hinzufügen"
          hinweis="Beteiligte werden aus den bestehenden Stammdaten gewählt – es entsteht kein neuer Datensatz. Die Rolle gilt nur für diesen Vorgang."
          felder={[{ key: "ref", label: "Person oder Unternehmen", typ: "ref", pflicht: true, breit: true }, { key: "rolle", label: "Rolle im Vorgang", typ: "text", pflicht: true, placeholder: "z. B. Käufer, Co-Partner, Ansprechpartner" }]}
          start={{ ref: "", rolle: "" }}
          onClose={() => setNeu(false)}
          speichern={(w) => onAendern([...beteiligte, { ...refAus(w.ref)!, rolle: text(w.rolle) }])}
        />
      )}
    </Panel>
  );
}

// ---------- Aufgaben & Aktivitäten ----------

export function AufgabenPanel({ aufgaben, bezug, titel = "Nächste Schritte" }: { aufgaben: Aktivitaet[]; bezug: Bezug[]; titel?: string }) {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const liste = [...aufgaben].sort((a, b) => Number(a.erledigt) - Number(b.erledigt) || a.datum.localeCompare(b.datum));
  return (
    <Panel titel={titel} aktion={<button type="button" onClick={() => setNeu(true)} className="link-more"><Plus className="h-3.5 w-3.5" />Aufgabe hinzufügen</button>}>
      <ul className="divide-y divide-line-soft">
        {liste.map((a) => {
          const st = aktivitaetStatus(a, crm.heute);
          return (
            <li key={a.id} className="flex items-center gap-2.5 py-[7px]">
              <input type="checkbox" checked={a.erledigt} onChange={(e) => crm.setzeErledigt(a.id, e.target.checked)} aria-label={`${a.titel} als erledigt markieren`} className="h-[15px] w-[15px] accent-navy-900" />
              <span className={`min-w-0 flex-1 truncate text-[12px] ${a.erledigt ? "text-muted line-through" : "text-ink"}`}>{a.titel}</span>
              <span className={`shrink-0 text-[11px] ${st === "Überfällig" ? "font-semibold text-neg" : a.erledigt ? "text-muted" : "text-neg"}`}>{datumDe(a.datum)}</span>
              <Avatar name={crm.benutzerName(a.verantwortlichId)} size={22} />
            </li>
          );
        })}
        {!liste.length && <li className="py-2 text-[12px] text-muted">Keine offenen Aufgaben.</li>}
      </ul>
      {neu && <AktivitaetModal typ="Aufgabe" bezug={bezug} onClose={() => setNeu(false)} />}
    </Panel>
  );
}

export function LetzteAktivitaeten({ aktivitaeten, onAlle }: { aktivitaeten: Aktivitaet[]; onAlle?: () => void }) {
  const crm = useCrm();
  const liste = aktivitaeten.filter((a) => a.typ !== "Aufgabe" && (a.erledigt || a.datum <= crm.heute)).sort((x, y) => (y.datum + (y.von ?? "")).localeCompare(x.datum + (x.von ?? ""))).slice(0, 5);
  return (
    <Panel titel="Letzte Aktivitäten" aktion={onAlle && <button type="button" onClick={onAlle} className="link-more">Alle anzeigen <ChevronRight className="h-3 w-3" /></button>}>
      <ul className="divide-y divide-line-soft">
        {liste.map((a) => (
          <li key={a.id} className="flex items-start gap-3 py-2">
            <div className="w-[66px] shrink-0 text-[10.5px] text-muted">{datumDe(a.datum)}<br />{a.von}</div>
            <TypIcon a={a} className="mt-[2px] h-4 w-4 shrink-0 text-royal-500" />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-navy-950">{a.typ === "Termin" ? a.titel : a.typ}</div>
              <div className="truncate text-[11px] text-muted">{a.beschreibung || a.titel}</div>
            </div>
            <Avatar name={crm.benutzerName(a.verantwortlichId)} size={22} />
          </li>
        ))}
        {!liste.length && <li className="py-2 text-[12px] text-muted">Noch keine Aktivitäten.</li>}
      </ul>
    </Panel>
  );
}

// ---------- Kommunikation ----------

/**
 * Kommunikationsbereich: E-Mail-Entwurf wird als Aktivität protokolliert.
 * Ein Versand ist erst nach Gmail-Anbindung UND ausdrücklicher Bestätigung möglich (nicht verbunden).
 */
export function KommunikationPanel({ titel, an, betreff, bezug, dateiRef }: { titel: string; an: Ref[]; betreff: string; bezug: Bezug[]; dateiRef: ID }) {
  const crm = useCrm();
  const toast = useToast();
  const [empf, setEmpf] = useState(an);
  const [b, setB] = useState(betreff);
  const [t, setT] = useState("");
  const [typ, setTyp] = useState<AktivitaetTyp | null>(null);
  const [datei, setDatei] = useState(false);
  const protokollieren = () => {
    if (!b.trim()) return toast("Bitte einen Betreff angeben.");
    crm.speichereAktivitaet({ id: crm.neueId("a"), typ: "E-Mail", titel: b.trim(), beschreibung: t.trim() || `E-Mail-Entwurf an ${empf.map((r) => crm.refName(r)).join(", ")}`, datum: crm.heute, bezug: [...bezug, ...empf.map((r) => ({ art: r.art, id: r.id }))], verantwortlichId: crm.benutzer[0].id, erledigt: true });
    toast(`E-Mail-Entwurf protokolliert – nicht versendet ${TESTMODUS}`);
    setT("");
  };
  return (
    <Panel titel={titel}>
      <div className="flex flex-wrap gap-1 border-b border-line-soft pb-2 text-[11.5px]">
        <span className="flex items-center gap-1 rounded-[5px] bg-royal-100 px-2 py-1 font-semibold text-navy-950"><Mail className="h-3.5 w-3.5" />E-Mail</span>
        {(["Termin", "Aufgabe", "Telefon", "Notiz"] as const).map((x) => (
          <button key={x} type="button" onClick={() => setTyp(x)} className="focus-ring rounded-[5px] px-2 py-1 text-navy-900 hover:bg-line-soft">{x === "Telefon" ? "Aktivität" : x}</button>
        ))}
        <button type="button" onClick={() => setDatei(true)} className="focus-ring rounded-[5px] px-2 py-1 text-navy-900 hover:bg-line-soft">Datei</button>
      </div>
      <div className="mt-2 space-y-2 text-[12px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-[52px] text-muted">An</span>
          {empf.map((r) => (
            <span key={r.id} className="flex items-center gap-1 rounded-[4px] border border-line px-2 py-[2px] text-[11.5px]">{crm.refName(r)}<button type="button" aria-label={`${crm.refName(r)} entfernen`} onClick={() => setEmpf(empf.filter((x) => x.id !== r.id))} className="text-muted hover:text-neg">×</button></span>
          ))}
          {!empf.length && <span className="text-muted">keine Empfänger</span>}
        </div>
        <label className="flex items-center gap-1.5"><span className="w-[52px] text-muted">Betreff</span><input value={b} onChange={(e) => setB(e.target.value)} className="focus-ring h-[30px] flex-1 rounded-[6px] border border-line px-2" /></label>
        <textarea value={t} onChange={(e) => setT(e.target.value)} rows={4} placeholder="Nachricht (Entwurf) …" aria-label="Nachricht" className="focus-ring w-full rounded-[6px] border border-line px-2 py-1.5" />
        <p className="flex items-start gap-1.5 rounded-[6px] bg-warn-bg px-2 py-1.5 text-[11px] text-warn"><CircleAlert className="mt-[1px] h-3.5 w-3.5 shrink-0" />Gmail ist nicht verbunden. E-Mails werden nur als Entwurf protokolliert; ein Versand erfolgt erst nach Einrichtung und ausdrücklicher Bestätigung.</p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" onClick={protokollieren}><FileText className="h-3.5 w-3.5" />Entwurf protokollieren</Button>
          <Button size="sm" variant="primary" disabled title="Gmail nicht verbunden – Versand erst nach Einrichtung"><Send className="h-3.5 w-3.5" />E-Mail senden (nicht verbunden)</Button>
        </div>
      </div>
      {typ && <AktivitaetModal typ={typ} bezug={bezug} onClose={() => setTyp(null)} />}
      {datei && <DokumentDialog refId={dateiRef} onClose={() => setDatei(false)} />}
    </Panel>
  );
}

// ---------- Dokumente ----------

export function DokumentDialog({ refId, onClose }: { refId: ID; onClose: () => void }) {
  const crm = useCrm();
  const toast = useToast();
  return (
    <FormModal
      titel="Dokument erfassen"
      hinweis="Google Drive ist nicht verbunden. Erfasst wird ein Dokumentverweis (Name, Datum); der Datei-Upload in den Projektordner folgt nach der Drive-Anbindung."
      felder={[{ key: "name", label: "Dateiname", typ: "text", pflicht: true, breit: true, placeholder: "z. B. Exposé_v2.pdf" }]}
      start={{ name: "" }}
      onClose={onClose}
      speichern={(w) => {
        crm.speichere("dokumente", { id: crm.neueId("DOK"), ref: refId, name: text(w.name), groesse: "—", datum: crm.heute, ablage: "Testdaten" }, { ref: refId, text: `Dokument „${text(w.name)}“ erfasst` });
        toast(`Dokumentverweis erfasst ${TESTMODUS}`);
      }}
    />
  );
}

export function DokumentePanel({ refIds, titel = "Zugehörige Dokumente" }: { refIds: ID[]; titel?: string }) {
  const crm = useCrm();
  const [neu, setNeu] = useState(false);
  const docs = crm.dokumente.filter((d) => refIds.includes(d.ref));
  return (
    <Panel titel={`${titel} (${docs.length})`} aktion={<button type="button" onClick={() => setNeu(true)} className="link-more"><Plus className="h-3.5 w-3.5" />Dokument erfassen</button>}>
      <ul className="divide-y divide-line-soft">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-2">
            <FileText className="h-5 w-5 shrink-0 text-neg" strokeWidth={1.6} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-navy-950">{d.name}</div>
              <div className="text-[10.5px] text-muted">{d.groesse} · {datumDe(d.datum)} · {d.ref} · Ablage: {d.ablage}</div>
            </div>
          </li>
        ))}
        {!docs.length && <li className="py-2 text-[12px] text-muted">Noch keine Dokumente.</li>}
      </ul>
      <p className="mt-2 text-[10.5px] text-muted">Google Drive nicht verbunden – Dateien werden nach Einrichtung im Projektordner abgelegt.</p>
      {neu && <DokumentDialog refId={refIds[0]} onClose={() => setNeu(false)} />}
    </Panel>
  );
}

// ---------- Verlauf ----------

export function VerlaufPanel({ refIds }: { refIds: ID[] }) {
  const crm = useCrm();
  const eintraege = crm.verlauf.filter((v) => refIds.includes(v.ref)).sort((a, b) => b.zeit.localeCompare(a.zeit));
  return (
    <Panel titel={`Verlauf (${eintraege.length})`}>
      <ol className="relative space-y-3 border-l border-line pl-4">
        {eintraege.map((v) => (
          <li key={v.id} className="text-[12px]">
            <span className="absolute -left-[5px] mt-1 h-[9px] w-[9px] rounded-full bg-royal-500" />
            <div className="text-[10.5px] text-muted">{datumDe(v.zeit.slice(0, 10))} {v.zeit.slice(11, 16)} · {crm.benutzerName(v.benutzerId)} · {v.ref}</div>
            <div className="text-ink">{v.text}</div>
          </li>
        ))}
        {!eintraege.length && <li className="text-[12px] text-muted">Noch keine Änderungen protokolliert.</li>}
      </ol>
      <p className="mt-3 text-[10.5px] text-muted">Nachvollziehbarkeit: Jede Änderung über die Oberfläche wird hier protokolliert. In der Datenbankversion zusätzlich als unveränderliches Änderungsprotokoll (Audit-Log).</p>
    </Panel>
  );
}

// ---------- Kleinteile ----------

export function StatusAuswahl({ wert, werte, onChange, label = "Status ändern" }: { wert: string; werte: readonly string[]; onChange: (s: string) => void; label?: string }) {
  return (
    <Menu label={label} align="left" items={werte.filter((s) => s !== wert).map((s) => ({ label: s, onClick: () => onChange(s) }))} trigger={<span className="inline-flex items-center gap-1 rounded-[5px] border border-line bg-white px-2 py-[3px] text-[12px] text-navy-900 hover:bg-line-soft">{wert}<ChevronDown className="h-3.5 w-3.5" /></span>} />
  );
}

export function RefLink({ r, fallback = "—" }: { r?: Ref; fallback?: string }) {
  const crm = useCrm();
  if (!r) return <span className="text-muted">{fallback}</span>;
  const href = crm.refHref(r);
  return href ? <Link href={href} className="text-royal-600 hover:underline">{crm.refName(r)}</Link> : <span>{crm.refName(r)}</span>;
}

export function VorgangLink({ id }: { id?: ID }) {
  const crm = useCrm();
  if (!id) return <span className="text-muted">—</span>;
  const v = crm.index.get(id);
  return v ? <Link href={v.href} className="text-royal-600 hover:underline">{id}</Link> : <span title="Altvorgang – nicht als Datensatz im CRM erfasst">{id}</span>;
}

/** Bezüge für Aktivitäten eines Vorgangs */
export const bezugVorgang = (...ids: ID[]): Bezug[] => ids.map((id) => ({ art: "vorgang" as const, id }));

export function DetailTabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; anzahl?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="mt-4 overflow-x-auto border-b border-line" role="tablist" aria-label="Bereiche">
      <div className="flex min-w-max gap-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={`focus-ring flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] ${value === t.id ? "border-navy-900 font-semibold text-navy-950" : "border-transparent text-ink-soft hover:text-navy-900"}`}>
            {t.label}
            {t.anzahl !== undefined && <span className="rounded-[4px] bg-line-soft px-1.5 text-[10.5px] text-ink-soft">{t.anzahl}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NichtGefunden({ was, href }: { was: string; href: string }) {
  return (
    <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
      <p className="font-serif text-[16px] font-semibold text-navy-900">{was} nicht gefunden.</p>
      <p className="mt-1 text-[12px] text-muted">Testdaten werden nur in diesem Browser zwischengespeichert – ggf. wurden sie unter Einstellungen zurückgesetzt.</p>
      <Link href={href} className="link-more mt-4">Zur Übersicht</Link>
    </div>
  );
}
