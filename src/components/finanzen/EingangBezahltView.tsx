"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight, Ellipsis, FileText, Filter as FilterIcon, LayoutPanelLeft, List, Search } from "lucide-react";
import {
  auszahlungZeilen,
  balkenReihe,
  BEREICHE,
  eingangZeilen,
  filterKennzahlen,
  filterTabelle,
  formatDatum,
  forderungsbestand,
  kumulierteReihe,
  LEERER_FILTER,
  summe,
  toCsv,
  ZAHL_STATUS,
  ZAHLUNG_TYPEN,
  zeitraeume,
  type AuszahlungZeile,
  type EingangZeile,
  type Filter,
  type ZeitraumKey,
} from "@/lib/finanzen/logic";
import * as td from "@/lib/testdata/finanzen";
import { euro } from "@/lib/format";
import { FinanzKpis } from "./FinanzKpis";
import { EingangAuszahlungChart, SaldoChart } from "./ZahlungsCharts";
import { BereichBadge, SelectBox, StatusBadge, Toast } from "./ui";
import { ZahlungsTabelle, type Spalte } from "./ZahlungsTabelle";

const NICHT_IMPLEMENTIERT = "ist noch nicht implementiert (Testversion).";

const alleEingaenge = eingangZeilen(td.forderungen, td.zahlungseingaenge, td.STICHTAG);
const alleAuszahlungen = auszahlungZeilen(td.verbindlichkeiten, td.auszahlungen, td.STICHTAG);
const ZEITRAEUME = zeitraeume(td.STICHTAG);

const eingangSpalten: Spalte<EingangZeile>[] = [
  { key: "datum", header: "Datum", cell: (r) => <span className="text-fin-muted">{formatDatum(r.datum)}</span>, className: "w-[78px]" },
  { key: "nr", header: "Rechnungsnr.", cell: (r) => <span className="text-fin-text">{r.rechnungNr}</span>, className: "w-[90px]" },
  { key: "kunde", header: "Kunde / Unternehmen", cell: (r) => <span className="block truncate text-fin-text" title={r.kunde}>{r.kunde}</span> },
  { key: "bereich", header: "Geschäftsbereich", cell: (r) => <BereichBadge bereich={r.bereich} />, className: "w-[96px]" },
  { key: "betrag", header: "Betrag (netto)", cell: (r) => <span className="font-semibold text-fin-ink">{euro(r.betrag)}</span>, align: "right", className: "w-[94px]" },
  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, className: "w-[108px] pl-[10px]" },
];

const auszahlungSpalten: Spalte<AuszahlungZeile>[] = [
  { key: "datum", header: "Datum", cell: (r) => <span className="text-fin-muted">{formatDatum(r.datum)}</span>, className: "w-[78px]" },
  { key: "empf", header: "Empfänger / Unternehmen", cell: (r) => <span className="block truncate text-fin-text" title={`${r.empfaenger} · ${r.typ}`}>{r.empfaenger}</span> },
  { key: "ref", header: "Projekt / Referenz", cell: (r) => <span className="text-fin-text">{r.referenz}</span>, className: "w-[118px] pl-[10px]" },
  { key: "bereich", header: "Geschäftsbereich", cell: (r) => <BereichBadge bereich={r.bereich} />, className: "w-[100px]" },
  { key: "betrag", header: "Betrag (netto)", cell: (r) => <span className="font-semibold text-fin-ink">{euro(r.betrag)}</span>, align: "right", className: "w-[94px]" },
];

function downloadCsv(name: string, csv: string) {
  // BOM, damit Excel Umlaute korrekt erkennt
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function deltaPct(aktuell: number, vorjahr: number) {
  return Math.round(((aktuell - vorjahr) / vorjahr) * 100);
}

export function EingangBezahltView() {
  const [zeitraumKey, setZeitraumKey] = useState<ZeitraumKey>("jahr");
  const [filter, setFilter] = useState<Filter>(LEERER_FILTER);
  const [gruppe, setGruppe] = useState<"monat" | "quartal">("monat");
  const [filterOffen, setFilterOffen] = useState(true);
  const [exportOffen, setExportOffen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pageEin, setPageEin] = useState(1);
  const [pageAus, setPageAus] = useState(1);
  const [sizeEin, setSizeEin] = useState(10);
  const [sizeAus, setSizeAus] = useState(10);
  const [selEin, setSelEin] = useState<Set<string>>(new Set());
  const [selAus, setSelAus] = useState<Set<string>>(new Set());
  const exportRef = useRef<HTMLDivElement>(null);

  const zeitraum = ZEITRAEUME.find((z) => z.key === zeitraumKey)!;
  const closeNotice = useCallback(() => setNotice(null), []);
  const hinweis = (was: string) => setNotice(`${was} ${NICHT_IMPLEMENTIERT}`);

  const updateFilter = (patch: Partial<Filter>) => {
    setFilter((f) => ({ ...f, ...patch }));
    setPageEin(1);
    setPageAus(1);
  };
  const updateZeitraum = (k: ZeitraumKey) => {
    setZeitraumKey(k);
    setPageEin(1);
    setPageAus(1);
  };

  useEffect(() => {
    if (!exportOffen) return;
    const close = (e: MouseEvent) => {
      if (!exportRef.current?.contains(e.target as Node)) setExportOffen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [exportOffen]);

  const daten = useMemo(() => {
    const einK = filterKennzahlen(alleEingaenge, filter, zeitraum);
    const ausK = filterKennzahlen(alleAuszahlungen, filter, zeitraum);
    const einT = filterTabelle(alleEingaenge, filter, zeitraum, (r) => [r.rechnungNr, r.kunde]);
    const ausT = filterTabelle(alleAuszahlungen, filter, zeitraum, (r) => [r.verbindlichkeitNr, r.empfaenger, r.referenz]);
    const bestand = forderungsbestand(td.forderungen, td.zahlungseingaenge, td.STICHTAG, filter.bereich || undefined);
    // Vorjahresvergleich nur ohne Zusatzfilter und für „Dieses Jahr“ (nur dafür liegen Vergleichswerte vor)
    const vergleich = zeitraum.key === "jahr" && !filter.bereich && !filter.typ;
    return {
      einT,
      ausT,
      bestand,
      eingang: { summe: summe(einK), anzahl: einK.length, deltaPct: vergleich ? deltaPct(summe(einK), td.VORJAHR_YTD.eingang) : null },
      auszahlung: {
        summe: summe(ausK),
        anzahl: ausK.length,
        deltaPct: vergleich ? deltaPct(summe(ausK), td.VORJAHR_YTD.auszahlung) : null,
        provisionen: summe(ausK.filter((r) => r.typ === "Provision" || r.typ === "Empfehlungsprovision")),
      },
      balken: balkenReihe(einK, ausK, zeitraum, td.STICHTAG, gruppe),
      kumuliert: kumulierteReihe(einK, ausK, zeitraum, td.STICHTAG),
    };
  }, [filter, zeitraum, gruppe]);

  const aktiveFilter = [filter.suche, filter.bereich, filter.typ, filter.status].filter(Boolean).length;

  const exportEingaenge = () => {
    const rows = selEin.size ? daten.einT.filter((r) => selEin.has(r.id)) : daten.einT;
    downloadCsv(
      `TESTDATEN_zahlungseingaenge_${zeitraum.key}.csv`,
      toCsv(
        ["Datum", "Rechnungsnr.", "Kunde / Unternehmen", "Geschäftsbereich", "Betrag (netto)", "Status"],
        rows.map((r) => [formatDatum(r.datum), r.rechnungNr, r.kunde, r.bereich, r.betrag, r.status]),
      ),
    );
    setExportOffen(false);
  };
  const exportAuszahlungen = () => {
    const rows = selAus.size ? daten.ausT.filter((r) => selAus.has(r.id)) : daten.ausT;
    downloadCsv(
      `TESTDATEN_auszahlungen_${zeitraum.key}.csv`,
      toCsv(
        ["Datum", "Verbindlichkeit", "Empfänger / Unternehmen", "Projekt / Referenz", "Geschäftsbereich", "Art", "Betrag (netto)", "Status"],
        rows.map((r) => [formatDatum(r.datum), r.verbindlichkeitNr, r.empfaenger, r.referenz, r.bereich, r.typ, r.betrag, r.status]),
      ),
    );
    setExportOffen(false);
  };

  const zeitraumOptionen = ZEITRAEUME.map((z) => ({ value: z.key, label: z.label }));
  const zeitraumKurz = ZEITRAEUME.map((z) => ({ value: z.key, label: z.kurz }));

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Kopfbereich */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav aria-label="Brotkrumen" className="flex items-center gap-2 text-[12.5px] text-[#262e91]">
            <Link href="/finanzen/uebersicht" className="focus-ring rounded hover:underline">Finanzen</Link>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            <span aria-current="page">Eingang / Bezahlt</span>
          </nav>
          <div className="mt-[4px] flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-[31px] font-bold leading-[1.1] tracking-[-0.015em] text-fin-ink">Eingang / Bezahlt</h1>
            <span className="rounded-full bg-warn-bg px-2 py-[1px] text-[9px] font-bold uppercase tracking-[0.12em] text-warn" title="Alle angezeigten Daten sind fiktive Testdaten">
              Testdaten
            </span>
          </div>
          <p className="mt-[3px] text-[15px] text-[#365ba9]">
            Alle Zahlungseingänge aus Kundenforderungen und alle Auszahlungen auf Verbindlichkeiten im Überblick.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[10px] xl:pt-[4px]">
          <SelectBox
            label="Zeitraum"
            value={zeitraumKey}
            onChange={updateZeitraum}
            options={zeitraumOptionen}
            icon={<CalendarDays className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            className="h-[36px] w-[266px]"
          />
          <button
            type="button"
            onClick={() => setFilterOffen((o) => !o)}
            aria-expanded={filterOffen}
            aria-controls="filterleiste"
            className={`focus-ring flex h-[36px] items-center gap-2 rounded-[6px] border px-[14px] text-[12px] text-fin-ink shadow-card ${filterOffen ? "border-[#cdd6f3] bg-fin-blue-bg/60" : "border-fin-line bg-white"}`}
          >
            <FilterIcon className="h-[15px] w-[15px]" strokeWidth={1.8} />
            Filter
            {aktiveFilter > 0 && <span className="rounded-full bg-fin-blue px-1.5 text-[10px] text-white">{aktiveFilter}</span>}
          </button>
          <button
            type="button"
            onClick={() => hinweis("Das Menü „Weitere Aktionen“")}
            className="focus-ring flex h-[36px] w-[38px] items-center justify-center rounded-[6px] border border-fin-line bg-white text-fin-ink shadow-card xl:ml-[52px]"
            aria-label="Weitere Aktionen (noch nicht implementiert)"
            title="Noch nicht implementiert"
          >
            <Ellipsis className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="mt-[14px] flex flex-col gap-[10px]">
        <FinanzKpis
          eingang={daten.eingang}
          auszahlung={daten.auszahlung}
          offen={daten.bestand.offen}
          ueberfaellig={daten.bestand.ueberfaellig}
          stichtag={formatDatum(td.STICHTAG)}
        />

        <div className="grid gap-[11px] xl:grid-cols-[minmax(0,1.065fr)_minmax(0,1fr)]">
          <EingangAuszahlungChart
            data={daten.balken}
            control={
              <SelectBox
                label="Gruppierung"
                value={gruppe}
                onChange={setGruppe}
                options={[{ value: "monat", label: "Monatlich" }, { value: "quartal", label: "Quartalsweise" }]}
                className="h-[28px] w-[114px]"
              />
            }
          />
          <SaldoChart
            data={daten.kumuliert}
            control={<SelectBox label="Zeitraum (Saldo-Diagramm)" value={zeitraumKey} onChange={updateZeitraum} options={zeitraumKurz} className="h-[28px] w-[124px]" />}
          />
        </div>

        {/* Filterleiste */}
        {filterOffen && (
          <div id="filterleiste" className="flex flex-wrap items-center gap-[11px]">
            <label className="relative flex h-[34px] min-w-[240px] flex-1 items-center rounded-[6px] border border-fin-line bg-white shadow-card xl:max-w-[332px]">
              <Search className="ml-3 h-[15px] w-[15px] text-fin-ink" strokeWidth={2} />
              <span className="sr-only">Suche</span>
              <input
                type="search"
                value={filter.suche}
                onChange={(e) => updateFilter({ suche: e.target.value })}
                placeholder="Rechnung, Partner oder Projekt suchen …"
                className="h-full flex-1 bg-transparent px-2.5 text-[11.5px] text-fin-ink placeholder:text-fin-muted outline-none"
              />
            </label>
            <SelectBox
              label="Geschäftsbereich"
              value={filter.bereich}
              onChange={(v) => updateFilter({ bereich: v })}
              options={[{ value: "" as const, label: "Geschäftsbereich" }, ...BEREICHE.map((b) => ({ value: b, label: b }))]}
              className="w-[144px]"
            />
            <SelectBox
              label="Typ"
              value={filter.typ}
              onChange={(v) => updateFilter({ typ: v })}
              options={[{ value: "" as const, label: "Typ" }, ...ZAHLUNG_TYPEN.map((t) => ({ value: t, label: t }))]}
              className="w-[133px]"
            />
            <SelectBox
              label="Status"
              value={filter.status}
              onChange={(v) => updateFilter({ status: v })}
              options={[{ value: "" as const, label: "Status" }, ...ZAHL_STATUS.map((s) => ({ value: s, label: s }))]}
              className="w-[124px]"
            />
            <SelectBox label="Zeitraum (Filter)" value={zeitraumKey} onChange={updateZeitraum} options={zeitraumKurz} className="w-[134px]" />
            {aktiveFilter > 0 && (
              <button type="button" onClick={() => updateFilter(LEERER_FILTER)} className="focus-ring rounded text-[11.5px] text-fin-muted underline-offset-2 hover:text-fin-ink hover:underline">
                Filter zurücksetzen
              </button>
            )}

            <div className="ml-auto flex items-center gap-[36px]">
              <div className="flex overflow-hidden rounded-[6px] border border-fin-line bg-white shadow-card" role="group" aria-label="Ansicht">
                <button type="button" aria-pressed="true" className="focus-ring flex h-[34px] w-[41px] items-center justify-center bg-fin-blue-bg/60 text-fin-blue" aria-label="Listenansicht" title="Listenansicht">
                  <List className="h-[17px] w-[17px]" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-pressed="false"
                  onClick={() => hinweis("Die Kachelansicht")}
                  className="focus-ring flex h-[34px] w-[41px] items-center justify-center border-l border-fin-line text-fin-blue"
                  aria-label="Kachelansicht (noch nicht implementiert)"
                  title="Kachelansicht – noch nicht implementiert"
                >
                  <LayoutPanelLeft className="h-[17px] w-[17px]" strokeWidth={1.8} />
                </button>
              </div>
              <div className="relative" ref={exportRef}>
                <button
                  type="button"
                  onClick={() => setExportOffen((o) => !o)}
                  aria-expanded={exportOffen}
                  aria-haspopup="menu"
                  className="focus-ring flex h-[34px] items-center gap-[10px] rounded-[6px] border border-fin-line bg-white px-[14px] text-[12px] text-fin-ink shadow-card"
                >
                  <FileText className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  Export
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                </button>
                {exportOffen && (
                  <div role="menu" className="absolute right-0 top-[40px] z-20 w-[260px] rounded-lg border border-fin-line bg-white p-1 text-[12px] text-fin-ink shadow-lg">
                    <button type="button" role="menuitem" onClick={exportEingaenge} className="block w-full rounded px-3 py-2 text-left hover:bg-fin-blue-bg">
                      Zahlungseingänge als CSV
                      <span className="block text-[10.5px] text-fin-muted">{selEin.size ? `${selEin.size} ausgewählte Zeilen` : `${daten.einT.length} gefilterte Zeilen`}</span>
                    </button>
                    <button type="button" role="menuitem" onClick={exportAuszahlungen} className="block w-full rounded px-3 py-2 text-left hover:bg-fin-blue-bg">
                      Auszahlungen als CSV
                      <span className="block text-[10.5px] text-fin-muted">{selAus.size ? `${selAus.size} ausgewählte Zeilen` : `${daten.ausT.length} gefilterte Zeilen`}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-[10px] xl:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]">
          <ZahlungsTabelle
            title="Zahlungseingänge (Kunden)"
            rows={daten.einT}
            spalten={eingangSpalten}
            page={pageEin}
            pageSize={sizeEin}
            onPage={setPageEin}
            onPageSize={(n) => { setSizeEin(n); setPageEin(1); }}
            selected={selEin}
            onSelected={setSelEin}
            leerText="Keine Zahlungseingänge für die gewählten Filter."
          />
          <ZahlungsTabelle
            title="Auszahlungen auf Verbindlichkeiten"
            rows={daten.ausT}
            spalten={auszahlungSpalten}
            page={pageAus}
            pageSize={sizeAus}
            onPage={setPageAus}
            onPageSize={(n) => { setSizeAus(n); setPageAus(1); }}
            selected={selAus}
            onSelected={setSelAus}
            leerText="Keine Auszahlungen für die gewählten Filter."
          />
        </div>
        <p className="text-[11px] text-fin-muted">
          Stand {formatDatum(td.STICHTAG)} · Es werden ausschließlich tatsächlich gebuchte Zahlungen angezeigt. Offene und überfällige Restbeträge sind nur in den
          Kennzahlen „Offen“ und „Überfällig“ enthalten. Alle Werte sind Testdaten.
        </p>
      </div>

      <Toast message={notice} onClose={closeNotice} />
    </div>
  );
}
