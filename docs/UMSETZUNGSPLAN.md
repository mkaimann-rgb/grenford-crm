# GRENFORD CRM Lightning v7.3 – Technischer Umsetzungsplan

Stand: 11.10.2026 · Gesamtauftrag Phasen A–G umgesetzt (Testmodus) · Abschlussbericht: `docs/ABSCHLUSSBERICHT.md`

## 1. Technologieentscheidung

| Vorschlag | Bewertung | Entscheidung |
|---|---|---|
| **Next.js + React + TypeScript** | Sehr gut geeignet: Server-Rendering, serverseitige Zugriffskontrolle (Middleware, Server Actions), Typsicherheit. | ✅ Übernommen (Next.js 16, App Router) |
| **Tailwind CSS** | Sehr gut geeignet, um die GRENFORD-CI exakt als Design-Tokens abzubilden. | ✅ Übernommen (Tailwind 4, Tokens in `src/app/globals.css`) |
| **Supabase + PostgreSQL** | Gut geeignet: PostgreSQL, Row Level Security, Auth mit Google-Login, Hosting in der EU-Region Frankfurt möglich. | ✅ Vorgesehen ab Stufe 2 – **erst nach Ihrer Zustimmung** (Konto/Kosten) |
| **Google Workspace** | Für Login (nur `@grenford.de`), später Kalender/Gmail. | ✅ Vorgesehen – Login ab Stufe 2, Gmail erst deutlich später |

Ergänzungen (kurz begründet):

- **Recharts** für Diagramme – bewährt, passt zu React, frei gestaltbar.
- **lucide-react** für Symbole – einheitliche Strichstärke wie in der Visualisierung.
- **Schriften selbst ausgeliefert** (`next/font`): keine Verbindung der Nutzer zu Google Fonts → DSGVO-freundlich.
- Die bisherige Vite-Vorlage (`main.jsx`) wurde **nicht gelöscht**, sondern nach `legacy/prototype-v1/` verschoben.

## 2. Gesamtauftrag – Phasen

| Phase | Inhalt | Status |
|---|---|---|
| – | Dashboard, Finanzen → Eingang / Bezahlt | ✅ freigegeben (Referenz) |
| **A** | Stammdaten & Aktivitäten: Unternehmen, Ansprechpartner, Privatkunden, Sanierungskunden, Aktivitäten, gemeinsame Stammdatenlogik | ✅ freigegeben (inkl. Korrekturen Geschäftsbereich) |
| **B** | Akquise & Investment: Pipeline, Projekte, Käuferprozesse, Ankaufsprofile, Suchaufträge | ✅ umgesetzt (Testmodus) |
| **C** | Property: Objekte & Mandate, Käuferprozesse, Interessenten, Suchaufträge | ✅ umgesetzt (Testmodus) |
| **D** | Projects: Mandate, Projekte, Projektprozesse, GU-Partner, Renovation Memo | ✅ umgesetzt (Testmodus) |
| **E** | Netzwerk: Empfehlungspartner, Provisionsbeteiligte | ✅ umgesetzt (Testmodus) |
| **F** | Finanzen: Übersicht, Provisionen & Zahlungen, Forderungen, Verbindlichkeiten (+ Eingang / Bezahlt unverändert) | ✅ umgesetzt (Testmodus) |
| **G** | Einstellungen, funktionale Kopfzeile, Persistenz-/Integrationsvorbereitung, Qualitätssicherung | ✅ umgesetzt; Datenbank und Google **vorbereitet, nicht verbunden** |
| danach | Supabase (EU) + Google-Workspace-Anmeldung – nur nach ausdrücklicher Freigabe | ⏳ wartet auf Freigabe/Zugangsdaten |

Arbeitsweise je Seite: Referenzbild analysieren → umsetzen → Screenshot → Vergleich → Korrektur → Freigabe.

### Prüfung der Visualisierungen (Drive-Ordner)

| Bereich | Vorlage(n) |
|---|---|
| Dashboard / Aktivitäten | `01_Dashboard_Grenford Ci.jpg` · `GRENFORD Aktivitäten-Dashboard.jpg` |
| Kunden | `GRENFORD CRM Unternehmensübersicht.jpg`, `…-Dashboard mit Unternehmensmodal.jpg` · `GRENFORD CRM – Ansprechpartnerübersicht.jpg` · `GRENFORD CRM Privatkunden-Dashboard.jpg`, `GRENFORD CRM_ Privatkunden-Dashboard.jpg` · `GRENFORD CRM Sanierungskunden-Übersicht.jpg`, `CRM-Dashboard für Sanierungskunden.jpg` |
| Akquise | `Grenford Akquise-Pipeline_ MFH Berlin-Schöneberg.jpg` |
| Investment | `01_Investment_Projekte` · `02_Investment_Käuferprozesse` · `03_Investment_Ankaufprofil_Tabelle`, `04_…_Einzelprofil` · `05_Investment_Suchaufträge` |
| Property | `01_Property_Objekte und Mandanten` · `02_Property_Käuferprozesse` · `03_Property_Interessten`, `04_…_einzelprofil` · `05_Property_Suchaufträge` |
| Projects | `02_Projects_Mandate` · `03_Projects_Projectprozeesse` · `04_Projects_GU-Partner` |
| Netzwerk | `01_Netzwerk_Empfehlungspartner` · `02_Netzwerk_Provionsbeteiligung` |
| Finanzen | `01_Finanzen_Übersicht` · `02_…_Provisionen Zahlungen` · `03_…_Forderungen (Kunden)` · `04_…_Verbindlichkeiten (Partner)` · `05_…_Eingang/Bezahlt` |

**Fehlend / zu klären:**
1. **Projects → Projekte**: `01_Projects_.jpg` ist dateigleich mit `02_Projects_Mandate` (gleiche Größe) – eigene Vorlage fehlt. Umgesetzt im Stil der Mandats- und Investment-Seiten (Liste + Detail mit Angeboten, GU-Zuordnung, Vergabe).
2. **Einstellungen**: keine Vorlage vorhanden. Umgesetzt im Stil der übrigen Detailseiten (Reiterleiste, Panels); siehe Abschnitt „Phase G“.
3. Mehrere Dateien sind Duplikate (z. B. `Investment-Projekte CRM-Dashboard.jpg` = `01_Investment_Projekte`); verwendet werden jeweils die nummerierten Dateien.

### Phase A – Umsetzungsstand

- **Gemeinsame Stammdaten** (`src/lib/crm/`): Typen, zentrale Testdaten, Fachlogik (`logic.ts`, getestet), clientseitiger Store (`store.tsx`) hinter einer Repository-Schnittstelle (`repository.ts`) – später austauschbar gegen Supabase.
- **Ein Datensatz je Unternehmen/Person**, Rollen am selben Datensatz (Ansprechpartner-Verknüpfung, Privatkunde, Sanierungskunde). Dublettenprüfung beim Anlegen (Firmenname ohne Rechtsform, USt-IdNr., HRB; Person: E-Mail oder Name + Geburtsdatum) mit Option „Bestehende Person verwenden“.
- **Seiten**: Listen mit Kennzahlen (klickbar als Filter), Suche, Filtern, Schnellfiltern, Sortierung, Seitenumschaltung, Auswahl, Listen-/Kachelansicht, CSV-Export; Detailseiten mit Tabs; Anlegen/Bearbeiten-Dialoge mit Pflichtfeldprüfung; Statuswechsel; Labels; Vorhaben; Aktivitäten (Termin, Aufgabe, E-Mail-Protokoll, Telefon, Notiz) mit Erledigt-Status, Überfällig-Logik und Wochenkalender.
- **Wiederverwendbare Bausteine**: `src/components/ui/` (Tabelle, Dialog, Formularfelder, Menüs, Meldungen) und `src/components/crm/` (Seitenkopf, Kennzahlen, Seitenleiste, Personen-/Unternehmensansichten).
- **Nicht dauerhaft**: Änderungen werden im Testmodus nur im Browser zwischengespeichert (deutlich gekennzeichnet), nicht zentral. Dateiablage, Import, Foto-Upload, E-Mail-Versand sind als „noch nicht implementiert“ markiert.

### Korrektur Phase A – Geschäftsbereiche (Investment / Property / Projects)

- **Drei getrennte Ebenen** am selben Stammsatz: *Geschäftsbereich* (`bereiche`, Mehrfachzuordnung mit optionaler Funktion je Bereich), *Kundenrolle* (Privat-/Sanierungskunde) und *fachliche Rolle* (Entscheider, GU-Partner …). Keine Kopien von Unternehmen oder Personen.
- **Herkunft nachvollziehbar**: jede Zuordnung ist „manuell“ oder „abgeleitet“ (mit Begründung, sichtbar als Tooltip). Logik und Tests: `src/lib/crm/bereiche.ts`, `bereiche.test.mts`.
- **Ableitung nur aus eindeutigen Beziehungen**: Unternehmensart (Investor, Projektentwickler, Bestandshalter, Family Office, Vermögensverwalter → Investment; Generalunternehmer, Küchenstudio → Projects), Finanz-/Dashboard-Vorgänge (INV-/PROP-/PRO-Nummern), Firmenverknüpfung (Person erbt Bereiche des Unternehmens, Funktion = Rolle), Sanierungsrolle/-vorhaben → Projects, Kauf (Eigennutzung)/Verkauf/Ferienimmobilie/Suchauftrag → Property.
- **Bewusst offen („Bereich prüfen“)**: Makler, Finanzierer, Sonstige ohne weitere Beziehung (NOODLES, Sparkasse Berlin (Test), Privateigentum Legrand), Andre Reitemeyer, Interesse „Kauf (Kapitalanlage)“ (Investment oder Property – z. B. Claudia Weber, Marcello Rossi). Diese Fälle sind in Listen mit „?“ markiert und über den Filter „Bereich prüfen (unklar)“ auffindbar.
- **Listen**: Spalte „Geschäftsbereich“ (INV / PROP / PROJ), Mehrfachfilter in der Filterleiste und Seitenleiste (Treffer in *mindestens einem* gewählten Bereich), Suche und CSV-Export inkl. Bereichen. Damit die Filterleiste einzeilig bleibt, sind „Betreuer“ (Unternehmen, Privat-, Sanierungskunden) und „Abteilung“ (Ansprechpartner) nur noch in der Seitenleiste. Ansprechpartner: Spalte „Telefon“ erst ab 1700 px Breite (Telefon bleibt in Detail und Export).
- **Detailseiten**: Bereiche direkt unter dem Namen, darunter getrennt die Rollen. Hinweis, wenn aktuelle Beziehungen einen weiteren Bereich nahelegen („übernehmen“) – Grundlage für spätere Investment-Projekte, Property-Mandate und Projects-Vorhaben.
- **Formulare**: Pflichtauswahl mindestens eines Bereichs, Funktion je Bereich optional. Beim Verknüpfen einer Person mit einem Unternehmen werden fehlende Bereiche ergänzt (nie entfernt).
- Behoben in Phase G: Auf Smartphone-Breite (390 px) war die Kopfzeile breiter als der Bildschirm. Die Korrektur greift nur unterhalb der Desktop-Breakpoints; Dashboard und Eingang/Bezahlt sind bei 1536 px pixelgleich zur Freigabe.

### Korrektur Phase A – Geschäftsbereich je Objekt / Vorgang

- **Drei Ebenen, strikt getrennt**: Geschäftsbereich des *Kontakts* (Kopf der Detailseite, unverändert) · Geschäftsbereich des *Vorgangs* (`Vorhaben.geschaeftsbereich`, genau einer je Vorgang) · *Rolle* des Kontakts im Vorgang (`rolle`, `unternehmenRolle`, `beteiligte[].rolle`). Logik: `src/lib/crm/vorgaenge.ts`, Tests: `vorgaenge.test.mts`.
- **Objekt-Stammsätze** (`objekte`): jedes Objekt genau einmal; Vorgänge verweisen per `objektId`. Ein Objekt in mehreren Bereichen hat je Bereich einen eigenen Vorgang (Beispiel: Hotel das ERZ – Investment-Transaktion und Projects-Renovierung). Beim Erfassen wird ein vorhandenes Objekt (gleicher Titel + Ort, normalisiert) automatisch verknüpft statt neu angelegt.
- **Anzeige**: In „Zugeordnete Objekte / Projekte“ und im Reiter „Vorhaben & Objekte“ (Personen) bzw. „Objekte & Projekte“ (Unternehmen) je Eintrag: farbige Bereichsmarke, Rolle, Vorgangsart, Ort/Budget; Hinweis „Objekt auch in …“ bei weiteren Bereichen; im Reiter zusätzlich Referenz, Beteiligte und Herkunft.
- **Automatische Einstufung nur bei Eindeutigkeit**: Kauf (Eigennutzung)/Suchauftrag → Property, Kaufinteressent · Verkauf → Property, Verkäufer · Sanierung/Ausbau (Privatkunde) → Projects, Bauherr · Sanierungskunde → Projects, Sanierungskunde. Investment-Vorgänge aus den Dashboard-Deals (Montesana, Berlin-Schöneberg, das ERZ) und Finanzreferenzen (INV-/PROP-/PRO-2026-…) mit den dort genannten Rollen.
- **Gekennzeichnete unklare Fälle**: Kauf (Kapitalanlage) (Claudia Weber, Marcello Rossi) → Bereich offen · Ferienimmobilie (Frank Doerwald) → Rolle offen · Berlin-Schöneberg (MFH) → Investor/Käufer in den Testdaten nicht benannt · Brautstraße 29 (Kay Brandes) → Rolle und Vorgangsart offen · Finanzreferenzen ohne Objekt → „Objekt noch nicht zugeordnet“ · „Einfamilienhaus Zehlendorf“ / „EFH Zehlendorf“ → mögliche Dublette, nicht zusammengeführt.
- **Spätere Module**: `referenz` (z. B. INV-2026-001, Dashboard-ID) und `objektId` sind die Verknüpfungspunkte für Investment (Phase B), Property (C) und Projects (D). Bestehende IDs (`v-…`, `p-…`, `f-…`) unverändert.

### Phase B – Akquise & Investment

- **Akquise-Pipeline** (`/akquise/pipeline`): Stufen 1–7 laut Vorlage (Neu → Wartet auf Unterschrift), Status (Aktiv/Pausiert/Übernommen/Verloren), Priorität, Verantwortliche, Wiedervorlage, Geschäftsbereich, Checkliste, Aufgaben, Verlauf. **Übernahme in den Fachbereich** legt INV-/PROP-Vorgang bzw. Projects-Mandat mit denselben Stammdaten-Verweisen an (keine Kopie von Personen/Unternehmen/Objekten); der Akquise-Vorgang wird „Übernommen“ und verweist auf die neue ID.
- **Investment-Projekte** (`/investment/projekte`): Liste/Detail, Phasen A–F mit Unterphasen (A1 Erstkontakt … F3 Follow-up), erwartete und gewichtete Courtage, Beteiligte mit Rolle, Dokumente, Aktivitäten, Finanzen.
- **Käuferprozesse** (Investment `INV-OPT-…`, Property `PROP-OPT-…`): beliebig viele je Projekt/Mandat, jeweils eigene ID, eigene Phase/Status/Wahrscheinlichkeit; derselbe Käufer kann je Projekt nur einen aktiven Prozess haben. Klar getrennt vom Projekt (eigene Seite, Hinweistext).
- **Ankaufsprofile** (`ANK-…`) mit Matching auf Projekte (Objektart, Region, Volumen; ≥ 2 von 3 Kriterien) und **Suchaufträge** (`SRCH-I-…`) mit Verknüpfung zu Projekten.

### Phase C – Property

- **Objekt ≠ Mandat**: Objekt-Stammsatz (`OPP-…`) einmalig; Mandate (`PROP-2026-…`) verweisen darauf, ein Objekt kann mehrere Mandate haben (z. B. früheres Verkaufs- und späteres Vermietungsmandat).
- Käuferprozesse A–E mit Unterphasen laut Vorlage; **Interessenten** (`INT-…`) je Person/Unternehmen genau einmal (Dublettenprüfung), Matching auf Mandate; **Suchaufträge** `SRCH-P-…` – eigener Nummernkreis, dadurch eindeutig unterscheidbar von Investment-Suchaufträgen.

### Phase D – Projects

- GRENFORD berät/vermittelt; **nicht** automatisch Bauherr oder GU. Bauherr ist ein Stammdatensatz (Kunde), Auftraggeber des GU wird bei der Vergabe ausdrücklich gewählt (Standard: Kunde).
- **Mandat** (`MAN-…`) enthält mehrere **Projekte** (`PRO-…`, eigene ID, Objekt, Einheit, Bauherr, Leistungsumfang, Budget, Status, Beteiligte, Dokumente, Aktivitäten, Angebote, GU-Zuordnung).
- **Projektprozesse A–F** – Hauptphasen laut Vorlage; die **Unterphasen sind ein Vorschlag** (Vorlage zeigt keine): A Akquise (Erstgespräch, Bedarfsermittlung) · B Projektaufnahme (Vor-Ort-Termin/Aufmaß, Leistungsbeschreibung) · C Angebotsphase (Anfrage an GU-Partner, Angebote eingegangen, Angebotsvergleich) · D GU-Auswahl (Kundengespräch, Vergabeentscheidung durch Kunden) · E Vertragsabschluss (Bauvertrag Kunde–GU, Vergütungsvereinbarung) · F Begleitung (Ausführung, Abnahme, Abrechnung).
- **GU-Partner** (`GU-…`): Gewerke, Regionen, Projekte, Angebote, Kooperationsvereinbarung, Provisionsregelung, Status.
- **Renovation Memo**: mehrere Originalangebote je Projekt, Vergleich (min/max/Spanne), Anonymisierung als „Partner A/B/C“ (Reihenfolge nach Eingang). Die Vergabeentscheidung trifft der Kunde; nur wenn **GRENFORD** als Auftraggeber gewählt wird, entsteht eine Verbindlichkeit.

### Phase E – Netzwerk

- **Empfehlungspartner** (`EP-…`) verweisen auf vorhandene Personen (optional Unternehmen) – keine neuen Stammsätze. Standardsätze aus den Einstellungen: Investment/Property **10 % der GRENFORD-Netto-Courtage**, Projects **3 % der provisionspflichtigen Netto-Bausumme inkl. vereinbarter Nachträge**. Je Partner/Bereich und je Empfehlung kann ein individueller Satz oder Festbetrag vereinbart werden – dieser hat Vorrang. Verbindlichkeiten entstehen erst auf ausdrücklichen Klick („Verbindlichkeit anlegen“).
- **Provisionsbeteiligte** (`PROV-2026-…`): ausschließlich individuell vereinbarte Anteile oder Festbeträge, **kein Standardsatz**, nicht automatisch Empfehlungspartner. Schritte 1–4 laut Vorlage; „Abrechnen“ legt die Verbindlichkeit an.

### Phase F – Finanzen

- **Eine Datengrundlage** für alle Finanzansichten (Store → `src/lib/finanzen/buchung.ts`): erwartete Provision → entstandener Anspruch (`PRV-2026-…`) → Rechnung = Forderung (`RE-…`) → Zahlungseingänge (Teilzahlungen möglich) → Rest / überfällig. Verbindlichkeit (`VB-…`) → Auszahlungen (Teilzahlungen möglich).
- Geplante Zahlungen werden nie als bezahlt gezeigt: Buchungen mit Datum nach dem Stichtag werden abgewiesen; Überzahlungen ebenfalls.
- **Forderungen**: Offen, Überfällig, 1. Mahnung, 2. Mahnung, Vollstreckung/rechtliche Eskalation – **nur Nachverfolgung**, keine automatischen rechtlichen Schritte (Hinweis im Dialog).
- **Eingang/Bezahlt** (freigegeben): Darstellung unverändert; liest jetzt dieselben Daten aus dem Store, Ergebnis bei Testdaten identisch (automatisch geprüft).

### Phase G – Einstellungen, Kopfzeile, Vorbereitung Persistenz/Integrationen

- **Einstellungen** (`/einstellungen`, keine Vorlage – Gestaltung: Reiterleiste wie Detailseiten, Panels im Kartenstil): Unternehmensprofil, Geschäftsbereiche, Benutzerprofil, Rollen & Berechtigungen (ein Hauptbenutzer, Mitarbeiter/Lesezugriff vorbereitet), Nummernkreise, Statusdefinitionen, **Provisionsstandards (änderbar, protokolliert)**, Benachrichtigungen, Integrationsstatus, Datenschutz & Sicherheit (Testdaten zurücksetzen mit Rückfrage).
- **Kopfzeile**: globale Suche (Stammdaten, Objekte, alle Vorgangs-IDs), „+“-Menü (Aufgabe/Termin direkt, übrige Anlagen über die Module), Hinweise (überfällige Aufgaben, fällige Wiedervorlagen, überfällige Forderungen), Benutzermenü.
- **Datenbank vorbereitet, nicht verbunden**: `supabase/migrations/0001_init.sql` (alle Tabellen, Fremdschlüssel, Eindeutigkeitsregeln, Prüf-Trigger für Verweise, Überzahlungsschutz, berechnete Offene-Posten-Sichten, atomare Nummernvergabe, Row Level Security, Audit-Log). Auf einer lokalen Wegwerf-PostgreSQL-16-Instanz ausgeführt und mit `supabase/tests/regeln.sql` geprüft. Zugriffsschicht: `src/lib/db/supabase-repository.ts` (wirft bewusst einen Fehler, solange nicht verbunden).
- **Google Workspace vorbereitet, nicht verbunden**: `src/lib/integrations/google.ts` (Status, benötigte Bereiche, Regel „Senden nur nach ausdrücklicher Bestätigung“). E-Mail-Entwürfe werden nur protokolliert, Senden ist deaktiviert; keine Kalendereinladungen.

### Nummernkreise

| Datensatz | Format | Hinweis |
|---|---|---|
| Investment-Projekt | `INV-2026-001` | 001–005 abgeschlossene Deals aus den Finanz-Testdaten |
| Property-Mandat | `PROP-2026-001` | |
| Projects-Mandat / -Projekt | `MAN-2026-001` / `PRO-2026-001` | |
| Käuferprozess | `INV-OPT-0001` / `PROP-OPT-0001` | je Bereich eigener Kreis |
| Akquise | `AK-2026-001` | |
| Ankaufsprofil / Interessent | `ANK-2026-001` / `INT-2026-001` | |
| Suchauftrag | `SRCH-I-001` / `SRCH-P-001` | Investment / Property getrennt |
| Objekt | `OPP-2026-001` | |
| GU-Partner / Empfehlungspartner | `GU-001` / `EP-001` | |
| Provisionsbeteiligung | `PROV-2026-001` | |
| Provisionsanspruch | `PRV-2026-001` | |
| Rechnung (Forderung) / Verbindlichkeit | `RE-2026-001` / `VB-2026-001` | aus der Freigabe übernommen |

### Abweichungen und offene fachliche Punkte (dokumentiert, nicht eigenmächtig entschieden)

1. **Nummerierung Investment**: Die Visualisierung zeigt andere Beispielnummern; verwendet wird der Kreis, der zu den freigegebenen Finanz-Testdaten passt (INV-2026-001 = Wohnportfolio NRW mit RE-2026-001).
2. **Projects-Unterphasen**: Vorschlag (s. o.), Vorlage nennt nur Hauptphasen.
3. **Brautstraße 29 (PROP-2026-008)**: Eigentümer unbekannt, Rolle von Kay Brandes offen – als „prüfen“ markiert.
4. **Berlin-Schöneberg (INV-2026-007)**: Käufer/Investor in den Vorlagen nicht benannt – Käuferprozesse sind Testannahmen.
5. **Empfehlungsprovision Investment/Property**: Bemessungsgrundlage ist die Summe der GRENFORD-Provisionsansprüche zum Vorgang (entstanden; solange keiner entstanden ist, die erwarteten – dann als „erwartet“ gekennzeichnet). Provisionsbeteiligungen Dritter werden **nicht** vorab abgezogen – bitte bestätigen, ob die Basis vor oder nach solchen Beteiligungen gilt.
6. **Testdaten-Stichtag**: Die Anwendung rechnet mit dem festen Stichtag 10.10.2026 der freigegebenen Testdaten.

## 3. Sicherheitskonzept

Bereits umgesetzt (Stufe 1):

- Keine Geheimnisse im Repository (`.gitignore` schließt alle `.env*` aus, nur `.env.example` ohne Werte).
- Sicherheits-Header: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- `noindex, nofollow` – Suchmaschinen sollen nichts indexieren.
- Entwicklungsserver lauscht nur auf `127.0.0.1` (nicht im Netzwerk erreichbar).
- Ausschließlich fiktive, gekennzeichnete Testdaten (`src/lib/testdata/`, Badge „TESTDATEN“).

Geplant ab Stufe 2:

- **Anmeldung** über Supabase Auth mit Google OAuth; zusätzlich serverseitige Prüfung, dass die E-Mail zur Domain `grenford.de` gehört **und** in einer Freigabeliste steht.
- **Serverseitige Zugriffskontrolle**: Next.js-Middleware leitet nicht angemeldete Nutzer zur Anmeldung um; Datenzugriffe nur in Server-Komponenten/Server Actions.
- **Row Level Security** auf jeder Tabelle (Standard: kein Zugriff; Zugriff nur für authentifizierte, freigeschaltete Nutzer; später Rollen pro Mitarbeiter).
- **Schlüssel**: Der Service-Role-Key bleibt ausschließlich serverseitig; im Browser nur der öffentliche Anon-Key, der dank RLS allein nichts lesen kann.
- **Sitzungen**: HttpOnly-, Secure-, SameSite-Cookies; kurze Token-Laufzeit mit automatischer Erneuerung.
- **Hosting**: Supabase-Region Frankfurt (eu-central-1); App-Hosting in der EU (z. B. Vercel mit EU-Funktionen-Region oder ein deutscher Anbieter) – **Auswahl nur mit Ihrer Zustimmung**. HTTPS ist dort Standard.
- **Datensicherung**: tägliche Backups (Supabase Pro inkl. Point-in-Time-Recovery – kostenpflichtig) plus regelmäßiger verschlüsselter Export; Wiederherstellung wird einmal testweise geprobt.

### Geschützte Testvorschau (Vercel)

- Nur Vorschau-Bereitstellungen (Preview) aus Pull Requests; geschützt durch **Vercel Authentication – Standard Protection** (vom Auftraggeber bestätigt: kein Passwort-Bypass, kein Automatisierungs-Bypass, keine teilbaren Links/Ausnahmen).
- `vercel.json` legt Next.js als Framework fest und **deaktiviert automatische Bereitstellungen aus `main`**, damit nach einem Merge keine ungeschützte Produktionsversion entsteht. Aufheben erst nach Einbau der eigenen Anmeldung.

## 4. Datenmodell – Leitplanken für spätere Module

Die Geschäftsregeln werden in der Architektur so berücksichtigt:

- **Zentrale Stammdaten ohne Dubletten**: `unternehmen` und `personen` sind je eine Tabelle; alle Module verweisen per Fremdschlüssel darauf. Eindeutigkeitsregeln (z. B. Handelsregisternummer, normalisierte E-Mail) plus Dublettenprüfung beim Anlegen.
- **Getrennte Geschäftsprozesse**: eigene Tabellen bzw. Prozess-Typen für Investment, Property und Projects (keine gemeinsame „Deal“-Tabelle mit Sonderfällen).
- **Projects-Mandate ≠ Projects-Projekte**: zwei Tabellen (`projects_mandate`, `projects_projekte`) mit optionaler Verknüpfung.
- **Rollen statt Personentypen**: `empfehlungspartner` und `provisionsbeteiligte` sind getrennte Rollen-Zuordnungen auf dieselbe zentrale Person/Firma.
- **Provisionen**: Standardsätze als Konfiguration – Investment/Property 10 % der GRENFORD-Netto-Courtage, Projects 3 % der provisionspflichtigen Netto-Bausumme; individuelle Splits je Geschäft in eigener Tabelle, die den Standard übersteuert.
- **Finanzen getrennt**: `forderungen` (an Kunden), `verbindlichkeiten` (an Partner) und `zahlungen` (tatsächliche Geldbewegungen, verknüpft mit einer Forderung oder Verbindlichkeit).
- Beträge als Ganzzahl in Cent bzw. `numeric`, nie als Gleitkommazahl.

### Zahlungslogik „Eingang / Bezahlt“ (umgesetzt mit Testdaten)

- Getrennte Datensätze: Forderungen → Zahlungseingänge; Verbindlichkeiten → Auszahlungen (`src/lib/finanzen/logic.ts`).
- Als Zahlung zählen nur gebuchte Zahlungen bis zum Stichtag. Offene/überfällige Restbeträge erscheinen ausschließlich in den Kennzahlen „Offen“ und „Überfällig“.
- Status je Zahlungszeile = Status des Belegs: *Bezahlt*, *Teilzahlung* (Rest noch nicht fällig) oder *Rest überfällig*.
- Kennzahlen und Diagramme werden aus denselben Zahlungszeilen berechnet; Monate nach dem Stichtag zeigen keine Werte.
- Automatische Tests: `npm test`.

## 5. Offene Punkte / benötigte Zuarbeit

1. **Logo**: Original eingebunden (`public/brand/grenford-logo.png`, aus „Grenford Logo“ / 22_15_50.png, nur zugeschnitten + Hintergrund transparent). Offen: Originaldatei mit Unterzeile „BOUTIQUE REAL ESTATE ADVISORY“ – liefert der Auftraggeber nach.
2. **Hausschriften**, falls GRENFORD feste Schriften nutzt – derzeit Source Serif 4 (Überschriften) und Inter (Text) als nahe Entsprechung.
3. **Objektfotos**: derzeit Ausschnitte aus der Visualisierung als markierte Testbilder (`public/testbilder/`).
4. Zustimmung zu Supabase-Konto (EU-Region) und Google-OAuth-Client – Schritte siehe `docs/ABSCHLUSSBERICHT.md`.
5. Fachliche Bestätigung der Punkte unter „Abweichungen und offene fachliche Punkte“.
