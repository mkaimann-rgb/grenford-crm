"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, ChevronRight, Ellipsis, Link2, Mail, MapPin, Phone, Plus, Star } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe, naechste, notizen, personName, summeBudget } from "@/lib/crm/logic";
import { KONTAKT_STATUS, PRIVAT_STATUS, SANIERUNG_STATUS, type Person, type Vorhaben } from "@/lib/crm/types";
import { euroCompact } from "@/lib/format";
import { Avatar, Badge, Button, Menu, StatusBadge, Tabs } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { AktivitaetenPanel, TypIcon } from "./aktivitaeten";
import { AktivitaetModal, PersonModal, VorhabenModal, personHref, type PersonRolle } from "./modals";
import { BereichZeile } from "./bereichszeile";
import { VorgangEintrag, VorgangLegende } from "./vorgaenge";
import { vorgaengeVonPerson, type VorgangZeile } from "@/lib/crm/vorgaenge";
import { ableitenPerson } from "@/lib/crm/bereiche";
import { InfoList, NichtImplementiert, NotizenCard, Panel, StatCard, TermineCard } from "./page";

type Tab = "uebersicht" | "vorhaben" | "aktivitaeten" | "kommunikation" | "dateien" | "notizen" | "finanzen" | "einstellungen";
const LISTE: Record<PersonRolle, { label: string; href: string }> = {
  kontakt: { label: "Ansprechpartner", href: "/kunden/ansprechpartner" },
  privat: { label: "Privatkunden", href: "/kunden/privatkunden" },
  sanierung: { label: "Sanierungskunden", href: "/kunden/sanierungskunden" },
};

export function PersonDetail({ id, rolle }: { id: string; rolle: PersonRolle }) {
  const crm = useCrm();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("uebersicht");
  const [modal, setModal] = useState<{ art: "edit"; rolle: PersonRolle; unternehmenId?: string } | { art: "vorhaben"; v?: Vorhaben; bereich: "privat" | "sanierung" } | { art: "aktivitaet" } | null>(null);
  const p = crm.personById(id);

  if (!p) {
    return (
      <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
        <p className="font-serif text-[16px] font-semibold text-navy-900">Person nicht gefunden.</p>
        <p className="mt-1 text-[12px] text-muted">Testdaten werden nur in diesem Browser zwischengespeichert – ggf. wurden sie unter Einstellungen zurückgesetzt.</p>
        <Link href={LISTE[rolle].href} className="link-more mt-4">Zur Übersicht</Link>
      </div>
    );
  }

  const name = personName(p);
  const akt = crm.aktivitaetenVonPerson(p);
  const letzte = crm.letzteAktivitaetPerson(p);
  const letzteAkt = akt.filter((a) => a.datum === letzte).sort((a, b) => (b.von ?? "").localeCompare(a.von ?? ""))[0];
  const vorhaben = crm.vorhaben.filter((v) => v.personId === p.id);
  // Alle Vorgänge: eigene (als Kunde), als Beteiligte und über verknüpfte Unternehmen
  const zeilen = vorgaengeVonPerson(p, crm.vorgaenge, crm.objekte, new Map(crm.unternehmen.map((x) => [x.id, x])));
  const eigene = zeilen.filter((z) => z.v.personId === p.id);
  const bearbeiten = (z: VorgangZeile) => (z.v.personId === p.id ? () => setModal({ art: "vorhaben", v: z.v, bereich: z.v.bereich ?? bereich }) : undefined);
  const bereich: "privat" | "sanierung" = rolle === "sanierung" ? "sanierung" : "privat";
  const kundenrolle = rolle === "privat" ? p.privat : rolle === "sanierung" ? p.sanierung : undefined;
  const statusWert = kundenrolle?.status ?? p.status;
  const statusListe = rolle === "privat" ? PRIVAT_STATUS : rolle === "sanierung" ? SANIERUNG_STATUS : KONTAKT_STATUS;
  const kommunikation = akt.filter((a) => a.typ === "E-Mail" || a.typ === "Telefon").sort((a, b) => (b.datum + (b.von ?? "")).localeCompare(a.datum + (a.von ?? "")));
  const sanVorhaben = vorhaben.filter((v) => v.bereich === "sanierung");
  const hauptSan = sanVorhaben.find((v) => v.status === "Aktiv") ?? sanVorhaben[0];

  const setzeStatus = (s: string) => {
    if (rolle === "privat" && p.privat) crm.speicherePerson({ ...p, privat: { ...p.privat, status: s as never } });
    else if (rolle === "sanierung" && p.sanierung) crm.speicherePerson({ ...p, sanierung: { ...p.sanierung, status: s as never } });
    else crm.speicherePerson({ ...p, status: s as Person["status"] });
    toast(`Status „${s}“ gesetzt (Testmodus – nicht dauerhaft gespeichert)`);
  };

  const rollenChips: { label: string; href?: string }[] = [
    ...(p.privat ? [{ label: "Privatkunde", href: personHref("privat", p.id) }] : []),
    ...(p.sanierung ? [{ label: "Sanierungskunde", href: personHref("sanierung", p.id) }] : []),
    ...p.kontakte.map((k) => ({ label: k.rolle === "Privatkunde" ? "Eigentümer" : k.rolle, href: personHref("kontakt", p.id) })),
    ...(kundenrolle?.interessen.slice(0, 2).map((i) => ({ label: i })) ?? []),
  ];
  const fehlendeRollen = [
    ...(!p.privat ? [{ label: "Als Privatkunde erfassen", onClick: () => setModal({ art: "edit", rolle: "privat" }) }] : []),
    ...(!p.sanierung ? [{ label: "Als Sanierungskunde erfassen", onClick: () => setModal({ art: "edit", rolle: "sanierung" }) }] : []),
    { label: "Mit Unternehmen verknüpfen", onClick: () => setModal({ art: "edit", rolle: "kontakt", unternehmenId: "" }) },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "uebersicht", label: "Übersicht" },
    { id: "vorhaben", label: `Vorhaben & ${rolle === "sanierung" ? "Projekte" : "Objekte"} (${zeilen.length})` },
    { id: "aktivitaeten", label: "Aktivitäten" },
    { id: "kommunikation", label: "Kommunikation" },
    { id: "dateien", label: "Dateien" },
    { id: "notizen", label: "Notizen" },
    { id: "finanzen", label: "Finanzen" },
    { id: "einstellungen", label: "Einstellungen" },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <nav aria-label="Brotkrumen" className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#596b83]">
        <span>Kunden</span><ChevronRight className="h-3 w-3" />
        <Link href={LISTE[rolle].href} className="focus-ring rounded hover:text-navy-900">{LISTE[rolle].label}</Link><ChevronRight className="h-3 w-3" />
        <span aria-current="page">{name}</span>
        <span className="rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold tracking-[0.12em] text-warn">Testdaten</span>
      </nav>

      <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 gap-4">
          <Avatar name={name} size={84} rund={false} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-[28px] font-bold leading-tight text-navy-950">{name}</h1>
              <button type="button" onClick={() => crm.speicherePerson({ ...p, favorit: !p.favorit })} aria-pressed={p.favorit} aria-label="Favorit" className="focus-ring rounded p-1">
                <Star className={`h-5 w-5 ${p.favorit ? "fill-[#f2b84b] text-[#f2b84b]" : "text-navy-900"}`} />
              </button>
            </div>
            <BereichZeile
              bereiche={p.bereiche}
              pruefen={p.bereichPruefen}
              abgeleitet={ableitenPerson(p, vorhaben, new Map(crm.unternehmen.map((x) => [x.id, x])), []).zuordnungen}
              onSpeichern={(b, msg) => { crm.speicherePerson({ ...p, bereiche: b }); toast(`${msg} (Testmodus – nicht dauerhaft gespeichert)`); }}
              onBearbeiten={() => setModal({ art: "edit", rolle })}
            />
            <div className="mt-2 flex flex-wrap items-center gap-[6px]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Rollen</span>
              {rollenChips.map((c) => c.href ? <Link key={c.label} href={c.href}><Badge tone="blue" className="px-3 py-[4px] hover:underline">{c.label}</Badge></Link> : <Badge key={c.label} tone="blue" className="px-3 py-[4px]">{c.label}</Badge>)}
              <Menu label="Rolle hinzufügen" align="left" items={fehlendeRollen} trigger={<span className="flex h-[24px] items-center rounded-[4px] border border-line px-2 text-navy-900 hover:bg-line-soft"><Plus className="h-3.5 w-3.5" /></span>} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-navy-900">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{p.ort}</span>
              {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 hover:underline"><Mail className="h-4 w-4" />{p.email}</a>}
              {(p.telefonMobil || p.telefonGeschaeftlich) && <a href={`tel:${(p.telefonMobil || p.telefonGeschaeftlich).replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:underline"><Phone className="h-4 w-4" />{p.telefonMobil || p.telefonGeschaeftlich}</a>}
              {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline"><Link2 className="h-4 w-4" />LinkedIn öffnen</a>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-[10px] xl:w-[640px]">
          <StatCard label="Status">
            <Menu label="Status ändern" align="left" items={statusListe.filter((s) => s !== statusWert).map((s) => ({ label: s, onClick: () => setzeStatus(s) }))} trigger={<span className="inline-flex items-center gap-1"><StatusBadge status={statusWert} /><ChevronDown className="h-3.5 w-3.5 text-navy-900" /></span>} />
          </StatCard>
          <StatCard label="Betreuer"><div className="flex items-center gap-2"><Avatar name={crm.benutzerName(p.betreuerId)} size={26} />{crm.benutzerName(p.betreuerId)}</div></StatCard>
          <StatCard label="Letzte Aktivität"><div className="font-serif text-[16px] font-bold">{datumDe(letzte)}</div><div className="truncate text-[11px] text-muted">{letzteAkt?.titel ?? "aus Altdaten"}</div></StatCard>
          <StatCard label={rolle === "kontakt" ? "Erfasst seit" : "Kunde seit"}><div className="font-serif text-[16px] font-bold">{datumDe(kundenrolle?.seit ?? p.erstelltAm)}</div></StatCard>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setModal({ art: "edit", rolle })}>Bearbeiten</Button>
          <Menu
            label="Weitere Aktionen"
            items={[
              { label: "Neue Aktivität", onClick: () => setModal({ art: "aktivitaet" }) },
              ...(rolle !== "kontakt" ? [{ label: "Neues Vorhaben", onClick: () => setModal({ art: "vorhaben", bereich }) }] : []),
              ...fehlendeRollen,
              { label: "Zur Übersicht", onClick: () => router.push(LISTE[rolle].href) },
            ]}
            trigger={<span className="flex h-[36px] w-[40px] items-center justify-center rounded-[6px] border border-line bg-white text-navy-900 shadow-card"><Ellipsis className="h-4 w-4" /></span>}
          />
        </div>
      </div>

      <div className="mt-5"><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>

      <div className="mt-4">
        {tab === "uebersicht" && (
          <div className="grid gap-[12px] xl:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_270px]">
            <Panel titel="Personendetails">
              <InfoList rows={[
                ["Anrede / Titel", [p.anrede, p.titel].filter(Boolean).join(" ")], ["Vorname / Nachname", `${p.vorname} ${p.nachname}`], ["Geburtsdatum", p.geburtsdatum ? datumDe(p.geburtsdatum) : ""],
                ["E-Mail", p.email && <a href={`mailto:${p.email}`} className="text-royal-600 hover:underline">{p.email}</a>], ["Telefon (mobil)", p.telefonMobil], ["Telefon (geschäftlich)", p.telefonGeschaeftlich],
                ["Adresse", p.strasse ? `${p.strasse}, ${p.plz} ${p.ort}` : `${p.plz} ${p.ort}`.trim()], ["Land", p.land],
                ["LinkedIn", p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="break-all text-royal-600 hover:underline">{p.linkedin}</a>], ["Herkunft", p.quelle],
              ]} />
            </Panel>
            <div className="flex flex-col gap-[12px]">
              {rolle === "kontakt" ? (
                <Panel titel="Rollen & Kundenstatus">
                  <InfoList rows={[
                    ["Kontaktstatus", <StatusBadge key="s" status={p.status} />],
                    ["Privatkunde", p.privat ? <Link key="p" href={personHref("privat", p.id)} className="text-royal-600 hover:underline">{p.privat.status}</Link> : "nein"],
                    ["Sanierungskunde", p.sanierung ? <Link key="s2" href={personHref("sanierung", p.id)} className="text-royal-600 hover:underline">{p.sanierung.status}</Link> : "nein"],
                  ]} />
                </Panel>
              ) : (
                <Panel titel={rolle === "sanierung" ? `Aktuelle Vorhaben / Projekte (${sanVorhaben.length})` : "Interessen & Vorhaben"} aktion={<Button size="sm" onClick={() => setModal({ art: "vorhaben", bereich })}><Plus className="h-3.5 w-3.5" />Neues Vorhaben</Button>}>
                  <ul className="divide-y divide-line-soft">
                    {eigene.filter((z) => rolle === "privat" || z.v.bereich === "sanierung").map((z) => <VorgangEintrag key={z.v.id} z={z} kompakt={rolle === "privat"} onEdit={bearbeiten(z)} />)}
                    {!vorhaben.length && <li className="py-3 text-[12px] text-muted">Noch keine Vorhaben erfasst.</li>}
                  </ul>
                  {kundenrolle && (
                    <div className="mt-3 border-t border-line-soft pt-3">
                      <h3 className="text-[12px] font-semibold text-navy-950">Interessen</h3>
                      <div className="mt-2 flex flex-wrap gap-[6px]">{kundenrolle.interessen.map((i) => <Badge key={i} tone="blue">{i}</Badge>)}</div>
                      <div className="mt-2 text-[11.5px] text-muted">Regionen: {kundenrolle.regionen || "—"} · Zeitrahmen: {kundenrolle.zeitrahmen || "—"} · Priorität: {kundenrolle.prioritaet}</div>
                    </div>
                  )}
                </Panel>
              )}
              <Panel titel={`Verknüpfte Unternehmen (${p.kontakte.length})`} aktion={<Button size="sm" onClick={() => setModal({ art: "edit", rolle: "kontakt", unternehmenId: "" })} aria-label="Unternehmen verknüpfen"><Plus className="h-3.5 w-3.5" /></Button>}>
                <ul className="divide-y divide-line-soft">
                  {p.kontakte.map((k) => {
                    const u = crm.unternehmenById(k.unternehmenId);
                    return (
                      <li key={k.unternehmenId} className="flex items-center gap-3 py-2">
                        <Building2 className="h-5 w-5 text-navy-900" />
                        <div className="min-w-0 flex-1">
                          {u ? <Link href={`/kunden/unternehmen/${u.id}`} className="text-[12px] font-semibold text-navy-950 hover:underline">{u.name}</Link> : "—"}
                          <div className="text-[11px] text-muted">{k.position || k.rolle}</div>
                        </div>
                      </li>
                    );
                  })}
                  {!p.kontakte.length && <li className="py-2 text-[12px] text-muted">Keine Unternehmen verknüpft.</li>}
                </ul>
              </Panel>
            </div>
            <div className="flex flex-col gap-[12px]">
              {rolle === "sanierung" ? (
                <Panel titel="Budget & Zeitplan">
                  <div className="grid grid-cols-3 gap-2">
                    {[["Gesamtbudget (ca.)", euroCompact(summeBudget(sanVorhaben))], ["Geplanter Start", hauptSan?.geplanterStart ?? "—"], ["Geplante Fertigstellung", hauptSan?.geplanteFertigstellung ?? "—"]].map(([l, w]) => (
                      <div key={l} className="min-w-0 rounded-lg border border-line px-2.5 py-2"><div className="truncate text-[10.5px] text-muted" title={l}>{l}</div><div className="mt-1 whitespace-nowrap font-serif text-[14px] font-bold text-navy-950">{w}</div></div>
                    ))}
                  </div>
                </Panel>
              ) : (
                <Panel titel="Zugeordnete Objekte / Projekte" aktion={<button type="button" onClick={() => setTab("vorhaben")} className="link-more">Alle anzeigen</button>}>
                  <ul className="divide-y divide-line-soft" data-testid="objekte-uebersicht">{zeilen.slice(0, 3).map((z) => <VorgangEintrag key={z.v.id} z={z} onEdit={bearbeiten(z)} />)}</ul>
                  {!zeilen.length && <p className="text-[12px] text-muted">Noch keine Objekte zugeordnet.</p>}
                  {zeilen.length > 3 && <p className="mt-1 text-[11px] text-muted">+ {zeilen.length - 3} weitere im Reiter „Vorhaben & Objekte“</p>}
                </Panel>
              )}
              <Panel titel="Letzte Kommunikation" aktion={<button type="button" onClick={() => setTab("kommunikation")} className="link-more">Alle anzeigen</button>}>
                <ul className="divide-y divide-line-soft">
                  {kommunikation.slice(0, 3).map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2">
                      <TypIcon a={a} className="h-4 w-4 shrink-0 text-royal-500" />
                      <div className="min-w-0 flex-1"><div className="text-[12px] font-semibold text-navy-950">{a.typ}</div><div className="truncate text-[11px] text-muted">{a.beschreibung || a.titel}</div></div>
                      <span className="shrink-0 text-[11px] text-muted">{datumDe(a.datum)}{a.von ? `, ${a.von}` : ""}</span>
                    </li>
                  ))}
                  {!kommunikation.length && <li className="py-2 text-[12px] text-muted">Noch keine Kommunikation protokolliert.</li>}
                </ul>
              </Panel>
            </div>
            <div className="flex flex-col gap-[12px] xl:col-span-2 2xl:col-span-1">
              <TermineCard titel="Nächste Aktivitäten" termine={naechste(akt, crm.heute, 4)} />
              <NotizenCard notizen={notizen(akt, 3)} />
            </div>
          </div>
        )}
        {tab === "vorhaben" && (
          <Panel titel="Vorhaben & Objekte" aktion={<Button size="sm" variant="primary" onClick={() => setModal({ art: "vorhaben", bereich })}><Plus className="h-3.5 w-3.5" />Neues Vorhaben</Button>}>
            <VorgangLegende />
            <ul className="divide-y divide-line-soft" data-testid="vorgaenge-liste">{zeilen.map((z) => <VorgangEintrag key={z.v.id} z={z} details onEdit={bearbeiten(z)} />)}</ul>
            {!zeilen.length && <p className="py-6 text-center text-[12px] text-muted">Noch keine Vorhaben erfasst.</p>}
            <p className="mt-3 text-[11px] text-muted">Hinweis: Jeder Vorgang trägt eine Referenz für die spätere Verknüpfung mit den Modulen Investment (Phase B), Property (Phase C) und Projects (Phase D). Vorgänge, die über Unternehmen oder Finanzreferenzen bestehen, werden dort bearbeitet.</p>
          </Panel>
        )}
        {tab === "aktivitaeten" && <AktivitaetenPanel aktivitaeten={akt.filter((a) => a.typ !== "Notiz")} bezug={[{ art: "person", id: p.id }]} />}
        {tab === "kommunikation" && <AktivitaetenPanel aktivitaeten={kommunikation} bezug={[{ art: "person", id: p.id }]} />}
        {tab === "notizen" && <AktivitaetenPanel nurNotizen aktivitaeten={akt.filter((a) => a.typ === "Notiz")} bezug={[{ art: "person", id: p.id }]} />}
        {tab === "dateien" && <NichtImplementiert was="Die Dateiablage (nach Datenbank- und Speicheranbindung)" />}
        {tab === "finanzen" && <NichtImplementiert was="Die Finanzübersicht je Kunde (Phase F)" />}
        {tab === "einstellungen" && <NichtImplementiert was="Die Datensatz-Einstellungen (Archivieren, Zusammenführen, Rechte)" />}
      </div>

      {modal?.art === "edit" && <PersonModal rolle={modal.rolle} initial={p} unternehmenId={modal.unternehmenId} onClose={() => setModal(null)} />}
      {modal?.art === "vorhaben" && <VorhabenModal personId={p.id} bereich={modal.bereich} initial={modal.v} onClose={() => setModal(null)} />}
      {modal?.art === "aktivitaet" && <AktivitaetModal bezug={[{ art: "person", id: p.id }]} onClose={() => setModal(null)} />}
    </div>
  );
}
