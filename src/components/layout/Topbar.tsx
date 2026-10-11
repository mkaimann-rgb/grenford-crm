"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu as MenuIcon, Plus, Search } from "lucide-react";
import { testUser } from "@/lib/testdata/dashboard";
import { useCrm } from "@/lib/crm/store";
import { personName } from "@/lib/crm/logic";
import { forderungZeilen } from "@/lib/finanzen/buchung";
import { Menu } from "@/components/ui/controls";
import { AktivitaetModal } from "@/components/crm/modals";

type Treffer = { label: string; sub: string; href: string };

/** Globale Suche über Stammdaten, Objekte und alle Vorgänge der Fachmodule */
function suche(crm: ReturnType<typeof useCrm>, q: string): Treffer[] {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return [];
  const passt = (...s: (string | undefined)[]) => s.some((x) => x?.toLowerCase().includes(t));
  return [
    ...crm.unternehmen.filter((u) => passt(u.name, u.ort)).map((u) => ({ label: u.name, sub: `Unternehmen · ${u.ort}`, href: `/kunden/unternehmen/${u.id}` })),
    ...crm.personen.filter((p) => passt(personName(p), p.email)).map((p) => ({ label: personName(p), sub: `Person · ${p.ort}`, href: crm.refHref({ art: "person", id: p.id }) ?? "#" })),
    ...[...crm.index.values()].filter((v) => passt(v.id, v.titel)).map((v) => ({ label: `${v.id} · ${v.titel}`, sub: v.typ, href: v.href })),
    ...crm.objekte.filter((o) => passt(o.titel, o.nummer, o.adresse)).flatMap((o) => {
      const v = crm.vorgaenge.find((x) => x.objektId === o.id && x.href);
      return v?.href ? [{ label: `${o.titel}${o.nummer ? ` (${o.nummer})` : ""}`, sub: `Objekt · ${o.ort}`, href: v.href }] : [];
    }),
  ].slice(0, 12);
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const crm = useCrm();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [offen, setOffen] = useState(false);
  const [neu, setNeu] = useState<"Aufgabe" | "Termin" | null>(null);
  const treffer = suche(crm, q);
  const ueberfaelligeAufgaben = crm.aktivitaeten.filter((a) => !a.erledigt && a.typ === "Aufgabe" && a.datum < crm.heute).length;
  const heute = crm.aktivitaeten.filter((a) => !a.erledigt && a.typ !== "Notiz" && a.datum === crm.heute).length;
  const wv = [...crm.investmentProjekte, ...crm.propertyMandate, ...crm.projectsProjekte, ...crm.akquise.filter((a) => a.status === "Aktiv")].filter((x) => x.wiedervorlage && x.wiedervorlage <= crm.heute).length;
  const ueberfaellig = forderungZeilen(crm, crm.heute).filter((f) => f.rest > 0 && f.status === "Überfällig").length;
  const hinweise = ueberfaelligeAufgaben + wv + ueberfaellig;

  return (
    <header className="sticky top-0 z-20 flex h-[56px] items-center gap-2 bg-topbar px-3 sm:gap-3 sm:px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="focus-ring rounded p-1.5 text-navy-900 lg:hidden"
        aria-label="Menü öffnen"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 justify-center lg:justify-start lg:pl-[160px]">
        <div className="relative w-full max-w-[596px]">
          <label className="relative flex h-[32px] w-full items-center rounded-md border border-line bg-white shadow-card">
            <Search className="ml-3 h-[15px] w-[15px] shrink-0 text-navy-800" strokeWidth={2} />
            <span className="sr-only">Suche</span>
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setOffen(true); }}
              onFocus={() => setOffen(true)}
              onBlur={() => setTimeout(() => setOffen(false), 150)}
              onKeyDown={(e) => { if (e.key === "Enter" && treffer[0]) { router.push(treffer[0].href); setOffen(false); setQ(""); } if (e.key === "Escape") setOffen(false); }}
              placeholder="Suche nach Kunden, Projekten, Ansprechpartnern …"
              aria-label="Globale Suche"
              className="h-full w-0 min-w-0 flex-1 bg-transparent px-2.5 text-[12px] text-ink placeholder:text-muted outline-none"
            />
            <kbd className="mr-2 hidden rounded bg-line-soft px-1.5 py-0.5 text-[10px] font-medium text-navy-800 sm:inline">⌘ K</kbd>
          </label>
          {offen && q.trim().length >= 2 && (
            <ul role="listbox" aria-label="Suchergebnisse" className="absolute left-0 right-0 top-[36px] z-30 max-h-[360px] overflow-auto rounded-[8px] border border-line bg-white py-1 shadow-lg">
              {treffer.map((t) => (
                <li key={t.href + t.label}>
                  <Link href={t.href} onClick={() => { setOffen(false); setQ(""); }} className="block px-3 py-1.5 hover:bg-line-soft">
                    <div className="truncate text-[12px] font-semibold text-navy-950">{t.label}</div>
                    <div className="truncate text-[10.5px] text-muted">{t.sub}</div>
                  </Link>
                </li>
              ))}
              {!treffer.length && <li className="px-3 py-2 text-[12px] text-muted">Keine Treffer.</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-5">
        <Menu
          label="Neu anlegen"
          items={[
            { label: "Neue Aufgabe", onClick: () => setNeu("Aufgabe") },
            { label: "Neuer Termin", onClick: () => setNeu("Termin") },
            { label: "Neues Unternehmen", hinweis: "Kunden", onClick: () => router.push("/kunden/unternehmen") },
            { label: "Neuer Akquise-Vorgang", hinweis: "Pipeline", onClick: () => router.push("/akquise/pipeline") },
            { label: "Neues Investment-Projekt", onClick: () => router.push("/investment/projekte") },
            { label: "Neues Objekt / Mandat", onClick: () => router.push("/property/objekte") },
            { label: "Neues Projects-Mandat", onClick: () => router.push("/projects/mandate") },
          ]}
          trigger={<span className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-navy-900 text-white shadow-card hover:bg-navy-800"><Plus className="h-4 w-4" strokeWidth={2.2} /></span>}
        />
        <Menu
          label="Benachrichtigungen"
          items={[
            { label: `${heute} Termine/Aufgaben heute`, onClick: () => router.push("/aktivitaeten") },
            { label: `${ueberfaelligeAufgaben} überfällige Aufgaben`, onClick: () => router.push("/aktivitaeten") },
            { label: `${wv} fällige Wiedervorlagen`, onClick: () => router.push("/akquise/pipeline") },
            { label: `${ueberfaellig} überfällige Forderungen`, onClick: () => router.push("/finanzen/forderungen?status=ueberfaellig") },
          ]}
          trigger={
            <span className="relative block rounded p-1 text-navy-900">
              <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
              {hinweise > 0 && <span className="absolute right-[3px] top-[2px] h-[6px] w-[6px] rounded-full bg-neg ring-2 ring-topbar" />}
            </span>
          }
        />
        <Menu
          label="Benutzermenü"
          items={[
            { label: "Benutzerprofil & Einstellungen", onClick: () => router.push("/einstellungen") },
            { label: "Integrationsstatus", onClick: () => router.push("/einstellungen?tab=integrationen") },
          ]}
          trigger={
            <span className="flex items-center gap-2.5 rounded-full pr-1">
              <span className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#dbe5f6] text-[11px] font-bold text-navy-800">
                {testUser.initials}
              </span>
              <span className="hidden text-[13px] font-semibold text-navy-950 md:inline">{testUser.name}</span>
              <ChevronDown className="h-4 w-4 text-navy-900" />
            </span>
          }
        />
      </div>
      {neu && <AktivitaetModal typ={neu} onClose={() => setNeu(null)} />}
    </header>
  );
}
