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

## 2. Schrittfolge

| Stufe | Inhalt | Status |
|---|---|---|
| 1a | Projektgerüst, CI-Tokens, Layout mit vollständiger linker Navigation | ✅ fertig |
| 1b | **Dashboard** gemäß `01_Dashboard_Grenford CI.jpg` | ✅ zur Freigabe |
| 1c | Unternehmensübersicht mit Suche, Filtern, Detailansicht (`GRENFORD CRM Unternehmensübersicht.jpg`, `…mit Unternehmensmodal.jpg`) | ⏳ nach Freigabe 1b |
| 2 | Supabase (EU), Anmeldung nur mit Google-Workspace-Konten, RLS, Datenmodell Stammdaten | ⏳ Zustimmung nötig |
| 3+ | Investment, Property, Projects, Netzwerk, Finanzen – je Ansicht nach Referenzbild | ⏳ |

Arbeitsweise je Ansicht: Referenzbild analysieren → umsetzen → Screenshot der laufenden App → Vergleich → Korrektur → Freigabe durch Sie.

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

## 4. Datenmodell – Leitplanken für spätere Module

Die Geschäftsregeln werden in der Architektur so berücksichtigt:

- **Zentrale Stammdaten ohne Dubletten**: `unternehmen` und `personen` sind je eine Tabelle; alle Module verweisen per Fremdschlüssel darauf. Eindeutigkeitsregeln (z. B. Handelsregisternummer, normalisierte E-Mail) plus Dublettenprüfung beim Anlegen.
- **Getrennte Geschäftsprozesse**: eigene Tabellen bzw. Prozess-Typen für Investment, Property und Projects (keine gemeinsame „Deal“-Tabelle mit Sonderfällen).
- **Projects-Mandate ≠ Projects-Projekte**: zwei Tabellen (`projects_mandate`, `projects_projekte`) mit optionaler Verknüpfung.
- **Rollen statt Personentypen**: `empfehlungspartner` und `provisionsbeteiligte` sind getrennte Rollen-Zuordnungen auf dieselbe zentrale Person/Firma.
- **Provisionen**: Standardsätze als Konfiguration – Investment/Property 10 % der GRENFORD-Netto-Courtage, Projects 3 % der provisionspflichtigen Netto-Bausumme; individuelle Splits je Geschäft in eigener Tabelle, die den Standard übersteuert.
- **Finanzen getrennt**: `forderungen` (an Kunden), `verbindlichkeiten` (an Partner) und `zahlungen` (tatsächliche Geldbewegungen, verknüpft mit einer Forderung oder Verbindlichkeit).
- Beträge als Ganzzahl in Cent bzw. `numeric`, nie als Gleitkommazahl.

## 5. Offene Punkte / benötigte Zuarbeit

1. **Original-Logodatei** (SVG oder hochauflösendes PNG) – das Logo ist derzeit ein SVG-Nachbau.
2. **Hausschriften**, falls GRENFORD feste Schriften nutzt – derzeit Source Serif 4 (Überschriften) und Inter (Text) als nahe Entsprechung.
3. **Objektfotos**: derzeit Ausschnitte aus der Visualisierung als markierte Testbilder (`public/testbilder/`).
4. Zustimmung zu Supabase-Konto (EU-Region) vor Stufe 2.
