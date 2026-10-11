# GRENFORD CRM Lightning v7.3 – Technischer Umsetzungsplan

Stand: Entwicklungsauftrag 01 · Entwicklungsstufe 1 (Dashboard)

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
| **A** | Stammdaten & Aktivitäten: Unternehmen, Ansprechpartner, Privatkunden, Sanierungskunden, Aktivitäten, gemeinsame Stammdatenlogik | ✅ zur fachlichen Freigabe |
| B | Akquise & Investment: Pipeline, Projekte, Käuferprozesse, Ankaufsprofile, Suchaufträge | ⏳ nach Freigabe A |
| C | Property: Objekte & Mandate, Käuferprozesse, Interessenten, Suchaufträge | ⏳ |
| D | Projects: Mandate, Projekte, Projektprozesse, GU-Partner | ⏳ |
| E | Netzwerk: Empfehlungspartner, Provisionsbeteiligte | ⏳ |
| F | Finanzen: Übersicht, Provisionen & Zahlungen, Forderungen, Verbindlichkeiten (+ Integration Eingang / Bezahlt) | ⏳ |
| G | Qualitätssicherung: Navigation, Verknüpfungen, Formulare, Berechnungen, Responsive, Tests | ⏳ |
| danach | Supabase (EU) + Google-Workspace-Anmeldung – nur nach ausdrücklicher Freigabe | ⏳ |

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
1. **Projects → Projekte**: `01_Projects_.jpg` ist dateigleich mit `02_Projects_Mandate` (gleiche Größe) – eigene Vorlage fehlt.
2. **Einstellungen**: keine Vorlage vorhanden.
3. Mehrere Dateien sind Duplikate (z. B. `Investment-Projekte CRM-Dashboard.jpg` = `01_Investment_Projekte`); verwendet werden jeweils die nummerierten Dateien.

### Phase A – Umsetzungsstand

- **Gemeinsame Stammdaten** (`src/lib/crm/`): Typen, zentrale Testdaten, Fachlogik (`logic.ts`, getestet), clientseitiger Store (`store.tsx`) hinter einer Repository-Schnittstelle (`repository.ts`) – später austauschbar gegen Supabase.
- **Ein Datensatz je Unternehmen/Person**, Rollen am selben Datensatz (Ansprechpartner-Verknüpfung, Privatkunde, Sanierungskunde). Dublettenprüfung beim Anlegen (Firmenname ohne Rechtsform, USt-IdNr., HRB; Person: E-Mail oder Name + Geburtsdatum) mit Option „Bestehende Person verwenden“.
- **Seiten**: Listen mit Kennzahlen (klickbar als Filter), Suche, Filtern, Schnellfiltern, Sortierung, Seitenumschaltung, Auswahl, Listen-/Kachelansicht, CSV-Export; Detailseiten mit Tabs; Anlegen/Bearbeiten-Dialoge mit Pflichtfeldprüfung; Statuswechsel; Labels; Vorhaben; Aktivitäten (Termin, Aufgabe, E-Mail-Protokoll, Telefon, Notiz) mit Erledigt-Status, Überfällig-Logik und Wochenkalender.
- **Wiederverwendbare Bausteine**: `src/components/ui/` (Tabelle, Dialog, Formularfelder, Menüs, Meldungen) und `src/components/crm/` (Seitenkopf, Kennzahlen, Seitenleiste, Personen-/Unternehmensansichten).
- **Nicht dauerhaft**: Änderungen gelten nur bis zum Neuladen der Seite (Testmodus, deutlich gekennzeichnet). Dateiablage, Import, Foto-Upload, E-Mail-Versand sind als „noch nicht implementiert“ markiert.

### Korrektur Phase A – Geschäftsbereiche (Investment / Property / Projects)

- **Drei getrennte Ebenen** am selben Stammsatz: *Geschäftsbereich* (`bereiche`, Mehrfachzuordnung mit optionaler Funktion je Bereich), *Kundenrolle* (Privat-/Sanierungskunde) und *fachliche Rolle* (Entscheider, GU-Partner …). Keine Kopien von Unternehmen oder Personen.
- **Herkunft nachvollziehbar**: jede Zuordnung ist „manuell“ oder „abgeleitet“ (mit Begründung, sichtbar als Tooltip). Logik und Tests: `src/lib/crm/bereiche.ts`, `bereiche.test.mts`.
- **Ableitung nur aus eindeutigen Beziehungen**: Unternehmensart (Investor, Projektentwickler, Bestandshalter, Family Office, Vermögensverwalter → Investment; Generalunternehmer, Küchenstudio → Projects), Finanz-/Dashboard-Vorgänge (INV-/PROP-/PRO-Nummern), Firmenverknüpfung (Person erbt Bereiche des Unternehmens, Funktion = Rolle), Sanierungsrolle/-vorhaben → Projects, Kauf (Eigennutzung)/Verkauf/Ferienimmobilie/Suchauftrag → Property.
- **Bewusst offen („Bereich prüfen“)**: Makler, Finanzierer, Sonstige ohne weitere Beziehung (NOODLES, Sparkasse Berlin (Test), Privateigentum Legrand), Andre Reitemeyer, Interesse „Kauf (Kapitalanlage)“ (Investment oder Property – z. B. Claudia Weber, Marcello Rossi). Diese Fälle sind in Listen mit „?“ markiert und über den Filter „Bereich prüfen (unklar)“ auffindbar.
- **Listen**: Spalte „Geschäftsbereich“ (INV / PROP / PROJ), Mehrfachfilter in der Filterleiste und Seitenleiste (Treffer in *mindestens einem* gewählten Bereich), Suche und CSV-Export inkl. Bereichen. Damit die Filterleiste einzeilig bleibt, sind „Betreuer“ (Unternehmen, Privat-, Sanierungskunden) und „Abteilung“ (Ansprechpartner) nur noch in der Seitenleiste. Ansprechpartner: Spalte „Telefon“ erst ab 1700 px Breite (Telefon bleibt in Detail und Export).
- **Detailseiten**: Bereiche direkt unter dem Namen, darunter getrennt die Rollen. Hinweis, wenn aktuelle Beziehungen einen weiteren Bereich nahelegen („übernehmen“) – Grundlage für spätere Investment-Projekte, Property-Mandate und Projects-Vorhaben.
- **Formulare**: Pflichtauswahl mindestens eines Bereichs, Funktion je Bereich optional. Beim Verknüpfen einer Person mit einem Unternehmen werden fehlende Bereiche ergänzt (nie entfernt).
- Bekannt, nicht Teil dieser Korrektur: Auf Smartphone-Breite (390 px) ist die bestehende Kopfzeile (Suche/Benutzermenü) breiter als der Bildschirm – betrifft alle Seiten inkl. Dashboard; Anpassung nur mit Zustimmung.

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
4. Zustimmung zu Supabase-Konto (EU-Region) vor Stufe 2.
