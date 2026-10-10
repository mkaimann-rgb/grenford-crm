# GRENFORD CRM Lightning v7.3

Internes CRM der GRENFORD Boutique Real Estate Advisory (Investment · Property · Projects).

> **Entwicklungsstufe 1** – Layout, vollständige Navigation und Dashboard.
> Alle angezeigten Daten sind **fiktive Testdaten** (`src/lib/testdata/`).
> Keine Datenbank, keine Anmeldung, keine E-Mail-Anbindung.

Technischer Plan, Sicherheits- und Datenmodellkonzept: [`docs/UMSETZUNGSPLAN.md`](docs/UMSETZUNGSPLAN.md)

## Anwendung lokal starten

Voraussetzung: [Node.js](https://nodejs.org) ab Version 20 (LTS-Version herunterladen und installieren).

```bash
# 1. Projekt herunterladen (einmalig)
git clone https://github.com/mkaimann-rgb/grenford-crm.git
cd grenford-crm
git checkout claude/grenford-crm-lightning-ed3ahz

# 2. Abhängigkeiten installieren (einmalig bzw. nach Updates)
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Dann im Browser öffnen: **http://127.0.0.1:3000** (leitet automatisch zum Dashboard).
Beenden mit `Strg + C` im Terminal.

## Prüfwerkzeuge

| Befehl | Zweck |
|---|---|
| `npm test` | Automatische Tests der Zahlungslogik |
| `npm run typecheck` | TypeScript-Prüfung |
| `npm run lint` | Code-Qualität (ESLint) |
| `npm run build` | Produktions-Build |

## Projektstruktur

```
src/app/(crm)/dashboard     Dashboard
src/app/(crm)/finanzen/eingang-bezahlt   Finanzen → Eingang / Bezahlt
src/app/(crm)/[...slug]     Platzhalter für noch nicht umgesetzte Menüpunkte
src/components/layout       Seitenleiste, Kopfzeile, Logo
src/components/dashboard    Dashboard-Bausteine (KPIs, Diagramme, Listen …)
src/components/finanzen     Bausteine der Finanzseiten
src/lib/finanzen            Zahlungslogik (Forderungen, Verbindlichkeiten, Zahlungen) + Tests
src/lib/navigation.ts       Vollständige Menüstruktur
src/lib/testdata            Gekennzeichnete Testdaten
public/testbilder           Platzhalter-Bilder (Ausschnitte aus der Visualisierung)
legacy/prototype-v1         Frühere Vite-Vorlage (archiviert, nicht in Benutzung)
```
