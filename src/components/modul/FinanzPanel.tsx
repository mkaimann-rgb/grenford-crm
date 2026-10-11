"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { datumDe } from "@/lib/crm/logic";
import type { Geschaeftsbereich, ID } from "@/lib/crm/types";
import type { Provision, Ref } from "@/lib/crm/module";
import { forderungZeilen, pruefeZahlung, rechnungAusProvision, verbindlichkeitZeilen } from "@/lib/finanzen/buchung";
import { euro } from "@/lib/format";
import { StatusBadge } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { Panel } from "@/components/crm/page";
import { FormModal, refAus, refZu, text, zahl, type Feld, type Werte } from "./FormModal";
import { TESTMODUS } from "./detail";

type Dialog =
  | { art: "provision" }
  | { art: "zahlung"; nr: string; rest: number }
  | { art: "auszahlung"; nr: string; rest: number }
  | null;

/**
 * Finanzbereich eines Vorgangs: Provisionsansprüche → Rechnung/Forderung → Zahlungseingang,
 * Verbindlichkeiten → Auszahlung. Alle Buchungen landen in der gemeinsamen Finanzdatenbasis.
 */
export function FinanzPanel({ refIds, bereich, zahler, basis, satz }: { refIds: ID[]; bereich: Geschaeftsbereich; zahler?: Ref; basis?: number; satz?: number }) {
  const crm = useCrm();
  const toast = useToast();
  const [dialog, setDialog] = useState<Dialog>(null);
  const provisionen = crm.provisionen.filter((p) => refIds.includes(p.referenz));
  const forderungen = forderungZeilen(crm, crm.heute).filter((f) => f.referenz && refIds.includes(f.referenz));
  const verbindlichkeiten = verbindlichkeitZeilen(crm, crm.heute).filter((v) => refIds.includes(v.referenz) || (v.quelle && refIds.includes(v.quelle)));

  const rechnungStellen = (p: Provision) => {
    const nr = crm.nummer("rechnung");
    crm.speichere("forderungen", rechnungAusProvision(p, nr, crm.heute), { ref: p.referenz, text: `Rechnung ${nr} über ${euro(p.betrag)} aus ${p.id} erzeugt (Forderung)` });
    crm.speichere("provisionen", { ...p, status: "Abgerechnet", rechnungNr: nr });
    toast(`Rechnung ${nr} erzeugt – Forderung angelegt ${TESTMODUS}`);
  };

  const provFelder: Feld[] = [
    { key: "art", label: "Art", typ: "select", pflicht: true, options: ["Käufercourtage", "Verkäufercourtage", "Vermittlungsvergütung", "Beratungsvergütung", "Projektvergütung"] },
    { key: "status", label: "Status", typ: "select", pflicht: true, options: ["Erwartet", "Entstanden"] },
    { key: "zahler", label: "Zahler (aus Stammdaten)", typ: "ref", breit: true },
    { key: "basis", label: "Bemessungsgrundlage (€ netto)", typ: "zahl", pflicht: true },
    { key: "satz", label: "Satz (%)", typ: "zahl", pflicht: true },
  ];

  return (
    <div className="grid gap-[12px] xl:grid-cols-3">
      <Panel titel={`Provisionsansprüche (${provisionen.length})`} aktion={<button type="button" onClick={() => setDialog({ art: "provision" })} className="link-more"><Plus className="h-3.5 w-3.5" />Provision erfassen</button>}>
        <ul className="divide-y divide-line-soft text-[12px]">
          {provisionen.map((p) => (
            <li key={p.id} className="py-2">
              <div className="flex items-center justify-between gap-2"><span className="font-semibold text-navy-950">{p.id} · {p.art}</span><StatusBadge status={p.status} /></div>
              <div className="text-[11px] text-muted">{p.satz} % von {euro(p.basis)} = <b className="text-ink">{euro(p.betrag)}</b> · Zahler: {p.zahler}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {p.status === "Erwartet" && <button type="button" onClick={() => { crm.speichere("provisionen", { ...p, status: "Entstanden", datum: crm.heute }, { ref: p.referenz, text: `Provisionsanspruch ${p.id} entstanden` }); toast(`Anspruch ${p.id} als entstanden markiert ${TESTMODUS}`); }} className="link-more">Anspruch entstanden</button>}
                {p.status === "Entstanden" && <button type="button" onClick={() => rechnungStellen(p)} className="link-more">Rechnung erzeugen</button>}
                {p.rechnungNr && <span className="text-[11px] text-muted">Rechnung {p.rechnungNr}</span>}
              </div>
            </li>
          ))}
          {!provisionen.length && <li className="py-2 text-muted">Noch kein Provisionsanspruch erfasst.</li>}
        </ul>
      </Panel>
      <Panel titel={`Forderungen (${forderungen.length})`}>
        <ul className="divide-y divide-line-soft text-[12px]">
          {forderungen.map((f) => (
            <li key={f.nr} className="py-2">
              <div className="flex items-center justify-between gap-2"><span className="font-semibold text-navy-950">{f.nr}</span><StatusBadge status={f.status} /></div>
              <div className="text-[11px] text-muted">{f.kunde} · fällig {datumDe(f.faellig)} · {euro(f.betrag)} · bezahlt {euro(f.gezahlt)} · offen <b className="text-ink">{euro(f.rest)}</b></div>
              {f.rest > 0 && <button type="button" onClick={() => setDialog({ art: "zahlung", nr: f.nr, rest: f.rest })} className="link-more mt-1">Zahlungseingang verbuchen</button>}
            </li>
          ))}
          {!forderungen.length && <li className="py-2 text-muted">Keine Rechnung zu diesem Vorgang.</li>}
        </ul>
      </Panel>
      <Panel titel={`Verbindlichkeiten (${verbindlichkeiten.length})`}>
        <ul className="divide-y divide-line-soft text-[12px]">
          {verbindlichkeiten.map((v) => (
            <li key={v.nr} className="py-2">
              <div className="flex items-center justify-between gap-2"><span className="font-semibold text-navy-950">{v.nr} · {v.typ}</span><StatusBadge status={v.status} /></div>
              <div className="text-[11px] text-muted">{v.empfaenger} · fällig {datumDe(v.faellig)} · {euro(v.betrag)} · ausgezahlt {euro(v.gezahlt)} · offen <b className="text-ink">{euro(v.rest)}</b></div>
              {v.rest > 0 && <button type="button" onClick={() => setDialog({ art: "auszahlung", nr: v.nr, rest: v.rest })} className="link-more mt-1">Auszahlung verbuchen</button>}
            </li>
          ))}
          {!verbindlichkeiten.length && <li className="py-2 text-muted">Keine Verbindlichkeit von GRENFORD zu diesem Vorgang.</li>}
        </ul>
      </Panel>

      {dialog?.art === "provision" && (
        <FormModal
          titel="Provisionsanspruch erfassen"
          hinweis="Erwartet = noch nicht entstanden (z. B. vor Kaufvertrag). Entstanden = Anspruch besteht, Rechnung kann erzeugt werden. Es wird keine Zahlung gebucht."
          felder={provFelder}
          start={{ art: bereich === "Projects" ? "Beratungsvergütung" : "Käufercourtage", status: "Erwartet", zahler: refZu(zahler), basis: basis ? String(basis) : "", satz: satz !== undefined ? String(satz).replace(".", ",") : "" }}
          onClose={() => setDialog(null)}
          speichern={(w: Werte) => {
            const b = zahl(w.basis);
            const s = zahl(w.satz);
            const id = crm.nummer("provisionsanspruch");
            const r = refAus(w.zahler);
            crm.speichere("provisionen", { id, referenz: refIds[0], bereich, art: text(w.art), zahler: r ? crm.refName(r) : "noch offen", zahlerRef: r, basis: b, satz: s, betrag: Math.round((b * s) / 100), status: text(w.status) as Provision["status"], datum: crm.heute }, { ref: refIds[0], text: `Provisionsanspruch ${id} erfasst (${text(w.status)})` });
            toast(`Provisionsanspruch ${id} erfasst ${TESTMODUS}`);
          }}
        />
      )}
      {(dialog?.art === "zahlung" || dialog?.art === "auszahlung") && (
        <FormModal
          titel={dialog.art === "zahlung" ? `Zahlungseingang zu ${dialog.nr}` : `Auszahlung zu ${dialog.nr}`}
          hinweis={`Offener Rest: ${euro(dialog.rest)}. Teilzahlungen sind möglich. Nur tatsächlich erfolgte Zahlungen buchen – keine geplanten.`}
          felder={[{ key: "betrag", label: "Betrag (€)", typ: "zahl", pflicht: true }, { key: "datum", label: "Zahlungsdatum", typ: "datum", pflicht: true }]}
          start={{ betrag: String(dialog.rest), datum: crm.heute }}
          pruefen={(w) => {
            const fehler = pruefeZahlung(zahl(w.betrag), dialog.rest, text(w.datum), crm.heute);
            return fehler ? { betrag: fehler } : ({} as Record<string, string>);
          }}
          onClose={() => setDialog(null)}
          speichern={(w) => {
            const ref = refIds[0];
            if (dialog.art === "zahlung") {
              const id = crm.nummer("zahlungseingang");
              crm.speichere("zahlungseingaenge", { id, datum: text(w.datum), rechnungNr: dialog.nr, betrag: zahl(w.betrag) }, { ref, text: `Zahlungseingang ${id} über ${euro(zahl(w.betrag))} auf ${dialog.nr} verbucht` });
            } else {
              const id = crm.nummer("auszahlung");
              crm.speichere("auszahlungen", { id, datum: text(w.datum), verbindlichkeitNr: dialog.nr, betrag: zahl(w.betrag) }, { ref, text: `Auszahlung ${id} über ${euro(zahl(w.betrag))} auf ${dialog.nr} verbucht` });
            }
            toast(`${dialog.art === "zahlung" ? "Zahlungseingang" : "Auszahlung"} verbucht ${TESTMODUS}`);
          }}
        />
      )}
    </div>
  );
}
