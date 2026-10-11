"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Building, CircleAlert, CircleCheck, CircleDashed, Database, Hash, KeyRound, ListChecks, Lock, Percent, Plug, RotateCcw, Shield, UserRound, Users } from "lucide-react";
import { NUMMERNKREISE } from "@/lib/crm/nummern";
import { useCrm } from "@/lib/crm/store";
import {
  AKQUISE_STATUS, ANGEBOT_STATUS, BETEILIGUNG_STATUS, GU_STATUS, INTERESSENT_STATUS, INVEST_STATUS, KAEUFER_STATUS, MAHNSTUFEN, MANDAT_STATUS, PARTNER_STATUS,
  PHASEN_BETEILIGUNG, PHASEN_INVESTMENT, PHASEN_PROJECTS, PHASEN_PROPERTY, PIPELINE_STUFEN, PMANDAT_STATUS, PROFIL_STATUS, PROJEKT_STATUS, PROVISION_STATUS, SUCH_STATUS, VERMARKTUNG_STATUS, type Phase,
} from "@/lib/crm/module";
import { GESCHAEFTSBEREICHE, type Geschaeftsbereich } from "@/lib/crm/types";
import { Button } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { InfoList, PageHeader, Panel } from "@/components/crm/page";
import { TESTMODUS } from "@/components/modul/detail";

type Tab = "unternehmen" | "bereiche" | "benutzer" | "rollen" | "nummern" | "status" | "provision" | "benachrichtigungen" | "integrationen" | "datenschutz";

const TABS: { id: Tab; label: string; icon: typeof Building }[] = [
  { id: "unternehmen", label: "Unternehmensprofil", icon: Building },
  { id: "bereiche", label: "Geschäftsbereiche", icon: ListChecks },
  { id: "benutzer", label: "Benutzerprofil", icon: UserRound },
  { id: "rollen", label: "Rollen & Berechtigungen", icon: Users },
  { id: "nummern", label: "Nummernkreise", icon: Hash },
  { id: "status", label: "Statusdefinitionen", icon: ListChecks },
  { id: "provision", label: "Provisionsstandards", icon: Percent },
  { id: "benachrichtigungen", label: "Benachrichtigungen", icon: Bell },
  { id: "integrationen", label: "Integrationen", icon: Plug },
  { id: "datenschutz", label: "Datenschutz & Sicherheit", icon: Shield },
];

function Integration({ name, status, text, schritte }: { name: string; status: "aktiv" | "vorbereitet" | "nicht verbunden"; text: string; schritte: string[] }) {
  const Icon = status === "aktiv" ? CircleCheck : status === "vorbereitet" ? CircleDashed : CircleAlert;
  const farbe = status === "aktiv" ? "text-pos" : status === "vorbereitet" ? "text-royal-600" : "text-warn";
  return (
    <div className="rounded-[10px] border border-line p-4">
      <div className="flex items-center justify-between gap-2"><h3 className="font-serif text-[15px] font-bold text-navy-950">{name}</h3><span className={`flex items-center gap-1 text-[12px] font-semibold ${farbe}`}><Icon className="h-4 w-4" />{status === "aktiv" ? "Aktiv" : status === "vorbereitet" ? "Vorbereitet – nicht verbunden" : "Nicht verbunden"}</span></div>
      <p className="mt-1 text-[12px] text-ink-soft">{text}</p>
      <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-[11.5px] text-muted">{schritte.map((s) => <li key={s}>{s}</li>)}</ol>
    </div>
  );
}

function PhasenTabelle({ titel, phasen }: { titel: string; phasen: Phase[] }) {
  return (
    <div>
      <h3 className="text-[12.5px] font-semibold text-navy-950">{titel}</h3>
      <ul className="mt-1 grid gap-1 text-[11.5px] sm:grid-cols-2 xl:grid-cols-3">{phasen.map((p) => <li key={p.code}><b>{p.code} – {p.titel}:</b> {p.unter.map((u) => `${u.code} ${u.titel}`).join(" · ")}</li>)}</ul>
    </div>
  );
}

export function EinstellungenSeite() {
  const crm = useCrm();
  const toast = useToast();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "unternehmen");
  const [saetze, setSaetze] = useState(crm.einstellungen.provisionsstandards);
  const [reset, setReset] = useState(false);
  const e = crm.einstellungen;
  const jahr = crm.heute.slice(0, 4);
  const bestand: Record<string, number> = {
    akquise: crm.akquise.length, investmentProjekt: crm.investmentProjekte.length, kaeuferInvestment: crm.kaeuferprozesse.filter((k) => k.bereich === "Investment").length,
    ankaufsprofil: crm.ankaufsprofile.length, suchauftragInvestment: crm.suchauftraege.filter((x) => x.bereich === "Investment").length, propertyMandat: crm.propertyMandate.length,
    kaeuferProperty: crm.kaeuferprozesse.filter((k) => k.bereich === "Property").length, interessent: crm.interessenten.length, suchauftragProperty: crm.suchauftraege.filter((x) => x.bereich === "Property").length,
    projectsMandat: crm.projectsMandate.length, projectsProjekt: crm.projectsProjekte.length, angebot: crm.angebote.length, guPartner: crm.guPartner.length, objekt: crm.objekte.length,
    empfehlungspartner: crm.empfehlungspartner.length, empfehlung: crm.empfehlungen.length, provisionsbeteiligung: crm.provisionsbeteiligungen.length, provisionsanspruch: crm.provisionen.length,
    rechnung: crm.forderungen.length, verbindlichkeit: crm.verbindlichkeiten.length, zahlungseingang: crm.zahlungseingaenge.length, auszahlung: crm.auszahlungen.length,
  };
  const nummern: [string, string, string, number][] = NUMMERNKREISE.map((k) => [
    `${k.typ} · ${k.bereich}`, `${k.praefix(jahr)}${"#".repeat(k.stellen)} (nächste: ${crm.nummer(k.schluessel)})`, k.schluessel, bestand[k.schluessel] ?? 0,
  ]);
  const rechte: [string, boolean, boolean, boolean][] = [
    ["Kunden & Stammdaten", true, true, false], ["Akquise & Investment", true, true, false], ["Property", true, true, false], ["Projects", true, true, false],
    ["Netzwerk & Provisionen", true, false, false], ["Finanzen", true, false, false], ["Einstellungen & Benutzer", true, false, false], ["Export (CSV)", true, true, false],
  ];
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader crumbs={[{ label: "System" }, { label: "Einstellungen" }]} titel="Einstellungen" untertitel="Unternehmensprofil, Geschäftsbereiche, Benutzer, Nummernkreise, Provisionsstandards und Integrationen." />
      <div className="mt-4 grid gap-[14px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Einstellungsbereiche" className="card h-fit p-2">
          {TABS.map((t) => (
            <button key={t.id} type="button" aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)} className={`focus-ring flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-left text-[12.5px] ${tab === t.id ? "bg-royal-100 font-semibold text-navy-950" : "text-ink-soft hover:bg-line-soft"}`}>
              <t.icon className="h-4 w-4 text-navy-900" strokeWidth={1.8} />{t.label}
            </button>
          ))}
        </nav>
        <div className="space-y-[14px]">
          {tab === "unternehmen" && (
            <Panel titel="Unternehmensprofil">
              <InfoList rows={[["Firma", "GRENFORD – Boutique Real Estate Advisory"], ["Geschäftsbereiche", "GRENFORD Investment · GRENFORD Property · GRENFORD Projects"], ["Sitz", "Berlin"], ["Domain", "grenford.de"], ["Rolle Projects", "Unabhängige Beratungs- und Vermittlungseinheit – kein ausführendes Bauunternehmen"], ["Testversion", "GRENFORD CRM Lightning v7.3 – geschützte Vorschau mit fiktiven Testdaten"]]} />
              <p className="mt-3 text-[11px] text-muted">Rechtliche Angaben (Handelsregister, USt-IdNr., Bankverbindung) werden erst nach Freigabe und mit der Datenbankanbindung hinterlegt – keine echten Daten in der Testversion.</p>
            </Panel>
          )}
          {tab === "bereiche" && (
            <Panel titel="Geschäftsbereiche">
              <div className="grid gap-3 sm:grid-cols-3">
                {GESCHAEFTSBEREICHE.map((b) => (
                  <div key={b} className="rounded-[10px] border border-line p-4">
                    <h3 className="font-serif text-[15px] font-bold text-navy-950">GRENFORD {b}</h3>
                    <p className="mt-1 text-[11.5px] text-ink-soft">{b === "Investment" ? "Transaktionsberatung für Investoren: Projekte, Käuferprozesse (A–F), Ankaufsprofile, Suchaufträge." : b === "Property" ? "Vermittlung von Wohn- und Gewerbeimmobilien: Objekte & Mandate, Käuferprozesse (A–E), Interessenten, Suchaufträge." : "Unabhängige Beratung und Vermittlung bei Sanierung, Renovierung und Ausbau: Mandate, Projekte (A–F), GU-Partner."}</p>
                    <p className="mt-2 text-[11px] text-muted">Kontakte: {crm.unternehmen.filter((u) => u.bereiche.some((x) => x.bereich === b)).length} Unternehmen · {crm.personen.filter((p) => p.bereiche.some((x) => x.bereich === b)).length} Personen</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted">Getrennte Ebenen: Geschäftsbereich des Kontakts · Geschäftsbereich des Vorgangs · Rolle im Vorgang · Kundenrolle.</p>
            </Panel>
          )}
          {tab === "benutzer" && (
            <Panel titel="Benutzerprofil">
              <InfoList rows={[["Name", e.benutzer.name], ["E-Mail", e.benutzer.email], ["Rolle", e.benutzer.rolle], ["Anmeldung", "Noch keine Anmeldung aktiv – die Vorschau ist über Vercel Authentication geschützt"], ["Kürzel", "MK"]]} />
            </Panel>
          )}
          {tab === "rollen" && (
            <Panel titel="Rollen & Berechtigungen">
              <p className="mb-2 text-[12px] text-ink-soft">Zunächst ein Hauptbenutzer. Weitere Rollen sind vorbereitet und werden mit der Datenbank (Row Level Security) serverseitig durchgesetzt.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[12px]">
                  <thead className="text-[11px] text-muted"><tr><th className="py-1.5 font-normal">Bereich</th><th className="font-normal">Administrator (Hauptbenutzer)</th><th className="font-normal">Mitarbeiter (vorbereitet)</th><th className="font-normal">Lesezugriff (vorbereitet)</th></tr></thead>
                  <tbody className="divide-y divide-line-soft">{rechte.map(([b, a, m, l]) => <tr key={b}><td className="py-2">{b}</td><td>{a ? "Lesen & Schreiben" : "—"}</td><td>{m ? "Lesen & Schreiben" : "Lesen"}</td><td>{l ? "Lesen & Schreiben" : "Lesen"}</td></tr>)}</tbody>
                </table>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-warn"><Lock className="h-3.5 w-3.5" />Wirksam erst nach Einrichtung von Anmeldung (Google Workspace) und Datenbank – heute nur dokumentiert.</p>
            </Panel>
          )}
          {tab === "nummern" && (
            <Panel titel="Nummernkreise">
              <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-[12px]"><thead className="text-[11px] text-muted"><tr><th className="py-1.5 font-normal">Datensatz</th><th className="font-normal">Format</th><th className="font-normal">Bestand</th></tr></thead><tbody className="divide-y divide-line-soft">{nummern.map(([n, f, k, c]) => <tr key={k}><td className="py-2">{n}</td><td className="font-mono text-[11.5px]">{f}</td><td>{c}</td></tr>)}</tbody></table></div>
              <p className="mt-2 text-[11px] text-muted">Bestehende IDs und Referenzen bleiben unverändert. Neue Nummern werden je Vorgangstyp und Geschäftsbereich fortlaufend vergeben (höchste vorhandene + 1, geprüft gegen alle IDs und Referenzen). Finanzbelege laufen je Belegart fortlaufend über alle Bereiche (lückenlose Rechnungsnummern). In der Datenbank als eindeutige Schlüssel (UNIQUE) abgesichert.</p>
            </Panel>
          )}
          {tab === "status" && (
            <Panel titel="Statusdefinitionen & Prozessphasen">
              <div className="space-y-3">
                <PhasenTabelle titel="Investment – Käuferprozess / Projekt (A–F)" phasen={PHASEN_INVESTMENT} />
                <PhasenTabelle titel="Property – Käuferprozess / Mandat (A–E)" phasen={PHASEN_PROPERTY} />
                <PhasenTabelle titel="Projects – Projektphasen (A–F, Unterphasen als Vorschlag)" phasen={PHASEN_PROJECTS} />
                <PhasenTabelle titel="Provisionsbeteiligung (1–4)" phasen={PHASEN_BETEILIGUNG} />
                <div className="grid gap-2 text-[11.5px] sm:grid-cols-2">
                  {[["Pipeline-Stufen", PIPELINE_STUFEN.map((s) => s.titel)], ["Akquise", AKQUISE_STATUS], ["Investment-Projekt", INVEST_STATUS], ["Käuferprozess", KAEUFER_STATUS], ["Ankaufsprofil", PROFIL_STATUS], ["Suchauftrag", SUCH_STATUS], ["Property-Mandat", MANDAT_STATUS], ["Vermarktung", VERMARKTUNG_STATUS], ["Interessent", INTERESSENT_STATUS], ["Projects-Mandat", PMANDAT_STATUS], ["Projects-Projekt", PROJEKT_STATUS], ["Angebot", ANGEBOT_STATUS], ["GU-Partner", GU_STATUS], ["Empfehlungspartner", PARTNER_STATUS], ["Provisionsbeteiligung", BETEILIGUNG_STATUS], ["Provisionsanspruch", PROVISION_STATUS], ["Mahnstufen", MAHNSTUFEN]].map(([t, w]) => <div key={t as string}><b>{t as string}:</b> {(w as readonly string[]).join(" · ")}</div>)}
                </div>
              </div>
            </Panel>
          )}
          {tab === "provision" && (
            <Panel titel="Provisionsstandards (Empfehlungspartner)">
              <p className="text-[12px] text-ink-soft">Vertraglich vereinbarte Standardmodelle – konfigurierbar, keine ausnahmslosen Automatismen. Die projektbezogene Vereinbarung hat Vorrang. Für Provisionsbeteiligte gelten ausschließlich individuelle Sätze.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {GESCHAEFTSBEREICHE.map((b: Geschaeftsbereich) => (
                  <label key={b} className="rounded-[10px] border border-line p-3 text-[12px]">
                    <span className="font-semibold text-navy-950">{b}</span>
                    <span className="mt-1 block text-[11px] text-muted">{b === "Projects" ? "% der provisionspflichtigen Netto-Bausumme inkl. vereinbarter Nachträge" : "% der maßgeblichen GRENFORD-Netto-Courtage"}</span>
                    <input type="number" min={0} max={100} step={0.1} value={saetze[b]} onChange={(ev) => setSaetze({ ...saetze, [b]: Number(ev.target.value) })} aria-label={`Standardsatz ${b} in Prozent`} className="focus-ring mt-2 h-[32px] w-[100px] rounded-[6px] border border-line px-2" /> %
                  </label>
                ))}
              </div>
              <Button className="mt-3" variant="primary" onClick={() => { crm.speichereEinstellungen({ ...e, provisionsstandards: saetze }); crm.protokolliere("EINSTELLUNGEN", `Provisionsstandards geändert: ${GESCHAEFTSBEREICHE.map((b) => `${b} ${saetze[b]} %`).join(", ")}`); toast(`Provisionsstandards gespeichert ${TESTMODUS}`); }}>Speichern</Button>
            </Panel>
          )}
          {tab === "benachrichtigungen" && (
            <Panel titel="Benachrichtigungen">
              <ul className="space-y-2 text-[12.5px]">
                {Object.entries({ wiedervorlagen: "Fällige Wiedervorlagen", ueberfaellig: "Überfällige Aufgaben und Forderungen", zahlungseingang: "Zahlungseingänge", phasenwechsel: "Phasenwechsel in Vorgängen", wochenbericht: "Wöchentlicher Bericht" }).map(([k, l]) => (
                  <li key={k}><label className="flex items-center gap-2"><input type="checkbox" checked={!!e.benachrichtigungen[k]} onChange={(ev) => { crm.speichereEinstellungen({ ...e, benachrichtigungen: { ...e.benachrichtigungen, [k]: ev.target.checked } }); toast(`Benachrichtigung „${l}“ ${ev.target.checked ? "aktiviert" : "deaktiviert"} ${TESTMODUS}`); }} className="accent-navy-900" />{l}</label></li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-muted">Hinweise erscheinen in der Glocke oben rechts. E-Mail-Benachrichtigungen erst nach Gmail-Anbindung – E-Mails werden nie ohne ausdrückliche Bestätigung versendet.</p>
            </Panel>
          )}
          {tab === "integrationen" && (
            <div className="grid gap-3 lg:grid-cols-2">
              <Integration name="Datenbank (Supabase / PostgreSQL, EU)" status="vorbereitet" text={`Schema, Migrationen, Row Level Security und Zugriffsschicht liegen im Repository (supabase/migrations, src/lib/db). Aktueller Speicher: ${crm.speicherort}.`} schritte={["Supabase-Projekt in EU-Region (Frankfurt) anlegen – nach Ihrer Freigabe (Kosten prüfen)", "Migrationen ausführen (supabase db push)", "Umgebungsvariablen in Vercel setzen (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY; Service-Key nur serverseitig)", "Testdaten importieren (Skript) und Repository umschalten"]} />
              <Integration name="Anmeldung (Google Workspace)" status="nicht verbunden" text="Anmeldung nur für berechtigte @grenford.de-Konten über Supabase Auth mit Google OAuth. Heute schützt Vercel Authentication die Vorschau." schritte={["OAuth-Client in Google Cloud (Workspace) anlegen", "Redirect-URL der Supabase-Instanz eintragen", "Domain-Beschränkung grenford.de aktivieren"]} />
              <Integration name="Gmail" status="nicht verbunden" text="E-Mails werden heute nur als Entwurf protokolliert. Versand ausschließlich nach ausdrücklicher Bestätigung im Einzelfall." schritte={["Gmail-API-Bereich (gmail.send, gmail.readonly) freigeben", "Zuordnung zu Kunden über E-Mail-Adresse aktivieren", "Versand-Bestätigungsdialog (bereits vorgesehen) aktivieren"]} />
              <Integration name="Google Calendar" status="nicht verbunden" text="Termine werden im CRM geführt. Einladungen werden nie ungefragt versendet." schritte={["Calendar-API-Bereich freigeben", "Synchronisationsrichtung festlegen (CRM → Kalender)", "Einladungen nur nach Bestätigung"]} />
              <Integration name="Google Drive" status="nicht verbunden" text="Dokumente werden heute als Verweis erfasst. Projektordner je Vorgang sind vorgesehen." schritte={["Drive-API-Bereich (drive.file) freigeben", "Ordnerstruktur je Geschäftsbereich/Vorgang festlegen", "Upload und Verknüpfung aktivieren"]} />
              <Integration name="Vercel (geschützte Vorschau)" status="aktiv" text="Vorschau-Deployments je Push auf den Entwicklungszweig, geschützt durch Vercel Authentication. Keine Produktionsbereitstellung." schritte={["Produktion erst nach Ihrer Freigabe", "Custom Domain und EU-Region festlegen"]} />
            </div>
          )}
          {tab === "datenschutz" && (
            <Panel titel="Datenschutz & Sicherheit">
              <ul className="space-y-1.5 text-[12px] text-ink">
                {[
                  "Testversion ausschließlich mit fiktiven Testdaten – keine echten Kundendaten.",
                  "Vorschau geschützt (Vercel Authentication), nicht öffentlich indexierbar (noindex, Sicherheitsheader).",
                  "Keine Zugangsdaten oder API-Schlüssel im Quellcode; spätere Schlüssel nur als Umgebungsvariablen, Service-Key nur serverseitig.",
                  "Datenbank vorbereitet mit Row Level Security: Zugriff nur für angemeldete, berechtigte GRENFORD-Konten.",
                  "Nachvollziehbarkeit: Verlauf je Datensatz; in der Datenbank zusätzlich Audit-Log (Trigger).",
                  "Hosting in der EU vorgesehen (Supabase Frankfurt, Vercel EU-Region).",
                  "Keine automatischen E-Mails, Einladungen oder rechtlichen Schritte.",
                ].map((t) => <li key={t} className="flex gap-2"><Shield className="mt-[2px] h-3.5 w-3.5 shrink-0 text-navy-900" />{t}</li>)}
              </ul>
              <div className="mt-4 rounded-[10px] border border-dashed border-warn/60 bg-warn-bg p-3">
                <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-warn"><Database className="h-4 w-4" />Testdaten-Zwischenspeicher</h3>
                <p className="mt-1 text-[11.5px] text-ink-soft">Änderungen werden derzeit nur in diesem Browser zwischengespeichert ({crm.speicherort}). Dies ist keine dauerhafte, zentrale Speicherung.</p>
                <Button className="mt-2" size="sm" onClick={() => setReset(true)}><RotateCcw className="h-3.5 w-3.5" />Testdaten zurücksetzen</Button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted"><KeyRound className="h-3.5 w-3.5" />Weitere Maßnahmen (Backups, Löschkonzept, Auftragsverarbeitung) werden mit der Datenbankanbindung umgesetzt.</p>
            </Panel>
          )}
        </div>
      </div>
      {reset && (
        <Modal titel="Testdaten zurücksetzen?" onClose={() => setReset(false)} breit="max-w-[480px]" footer={<><Button onClick={() => setReset(false)}>Abbrechen</Button><Button variant="primary" onClick={() => { crm.zuruecksetzen(); setReset(false); toast("Testdaten auf den Ausgangsstand zurückgesetzt."); }}>Zurücksetzen</Button></>}>
          <p className="text-[12.5px]">Alle in diesem Browser vorgenommenen Änderungen an den Testdaten werden verworfen. Echte Daten sind nicht betroffen.</p>
        </Modal>
      )}
    </div>
  );
}
