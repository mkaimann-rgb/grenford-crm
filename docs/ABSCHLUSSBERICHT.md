# GRENFORD CRM Lightning v7.3 – Abschlussbericht Gesamtauftrag (Phasen A–G)

Stand: 11.10.2026 · Branch `claude/grenford-crm-lightning-ed3ahz` · geschützte Vorschau (Vercel Authentication):
https://grenford-crm-git-claude-grenford-f35e77-mkaimann-3010s-projects.vercel.app

> **Kein Produktivsystem.** Das CRM läuft im **Testmodus** mit fiktiven Testdaten. Es gibt noch **keine zentrale
> Datenbank, keine eigene Anmeldung, keine serverseitigen Berechtigungen und keine Google-Anbindung**. Änderungen
> werden nur im jeweiligen Browser zwischengespeichert. Für echte Kundendaten ist das System erst nach den unten
> genannten Schritten geeignet.

## 1. Ergebnis in vier Kategorien

### a) Vollständig umgesetzt (Oberfläche + Fachlogik, getestet)

| Bereich | Module |
|---|---|
| Dashboard, Finanzen → Eingang/Bezahlt | freigegeben, pixelgleich erhalten (1536 px) |
| Stammdaten (Phase A) | Unternehmen, Ansprechpartner, Privatkunden, Sanierungskunden, Aktivitäten; Geschäftsbereich auf Kontakt- **und** Vorgangsebene; Objekt-Stammsätze ohne Dubletten |
| Akquise (B) | Pipeline 1–7, Übernahme in Investment/Property/Projects ohne Stammdaten-Kopie |
| Investment (B) | Projekte (A–F), Käuferprozesse (mehrere je Projekt, eigene ID), Ankaufsprofile mit Matching, Suchaufträge mit Verknüpfung |
| Property (C) | Objekte & Mandate (Objekt ≠ Mandat, mehrere Mandate je Objekt), Käuferprozesse (A–E), Interessenten (ohne Dubletten), Suchaufträge (eigener Kreis `SRCH-P`) |
| Projects (D) | Mandate → mehrere Projekte, Projektprozesse A–F, GU-Partner, Angebote, Renovation Memo (anonymisiert Partner A/B/C), Vergabe durch den Kunden |
| Netzwerk (E) | Empfehlungspartner (Standard 10 % / 10 % / 3 %, individuelle Vereinbarung hat Vorrang), Provisionsbeteiligte (nur individuell) |
| Finanzen (F) | Übersicht, Provisionen & Zahlungen, Forderungen (Offen/Überfällig/Mahnstufen – nur Nachverfolgung), Verbindlichkeiten; Teilzahlungen; Schutz vor Über- und Zukunftsbuchungen; eine Datengrundlage |
| Einstellungen & Kopfzeile (G) | 10 Bereiche der Einstellungen, Provisionsstandards änderbar und protokolliert; globale Suche, Schnellanlage, Hinweise, Benutzermenü; Smartphone-Kopfzeile korrigiert |
| Alle Module | Liste, Detail, Anlegen, Bearbeiten, Suche, Filter, Sortierung, Mehrfachauswahl mit Statuswechsel, Aktivitäten/Aufgaben, Verknüpfungen, Dokument-Verweise, Verlauf, CSV-Export, responsive |

### b) Nur mit Testdaten / im Testmodus

- **Alle Daten** sind fiktiv und stammen aus `src/lib/crm/testdata*.ts` und `src/lib/testdata/`. Änderungen bleiben nur im Browser (localStorage) und sind für andere Nutzer nicht sichtbar. Hinweis „Testmodus“ an allen Speichermeldungen; Zurücksetzen unter Einstellungen → Datenschutz.
- **Stichtag** der Berechnungen (überfällig, Teilzahlung, Kennzahlen) ist fest der 10.10.2026, der Stichtag der freigegebenen Testdaten.
- **Dokumente** werden nur als Verweis (Name, Größe, Datum) erfasst, ohne Datei-Upload.
- **Kommunikation**: E-Mails werden nur als Protokoll/Entwurf erfasst; „Senden“ ist deaktiviert.

### c) Vorbereitet, aber nicht verbunden

| Komponente | Stand | Dateien |
|---|---|---|
| Datenbank (Supabase/PostgreSQL, EU) | Schema mit allen Tabellen, Fremdschlüsseln, Eindeutigkeiten, Prüf-Triggern, Überzahlungsschutz, Offene-Posten-Sichten, atomarer Nummernvergabe, **Row Level Security** und **Audit-Log**. Auf lokaler Wegwerf-PostgreSQL 16 erfolgreich ausgeführt und geprüft. **Nicht** mit einem Supabase-Projekt verbunden. | `supabase/migrations/0001_init.sql`, `supabase/tests/regeln.sql` |
| Zugriffsschicht | Schnittstelle `CrmRepository`; Supabase-Implementierung als Gerüst, das bewusst einen Fehler wirft, solange nichts verbunden ist | `src/lib/crm/repository.ts`, `src/lib/db/supabase-repository.ts` |
| Anmeldung (Google Workspace über Supabase Auth) | Konzept, Domain-Regel `@grenford.de`, Rollen (Administrator, Mitarbeiter, Lesezugriff) im Schema | Schema + Einstellungen → Rollen |
| Gmail / Google Calendar / Google Drive | Statusanzeige und Regeln (Senden nur nach ausdrücklicher Bestätigung, keine ungefragten Einladungen); keine simulierte Anbindung | `src/lib/integrations/google.ts`, Einstellungen → Integrationen |

### d) Noch offen

- Produktive Persistenz, Anmeldung und serverseitige Berechtigungen (siehe Abschnitt 5).
- Excel-Import, Foto-Upload, Datei-Upload, EÜR-/DATEV-Export, Kachelansicht in Eingang/Bezahlt – in der Oberfläche als „noch nicht implementiert“ gekennzeichnet.
- E-Mail-Versand, Kalender-Synchronisation, Drive-Ablage.
- Fachliche Bestätigungen (Abschnitt 6).

## 2. Datenmodell und Regeln (Kurzfassung)

- **Stammdaten genau einmal**: Unternehmen, Personen, Objekte. Alle Vorgänge verweisen per ID darauf; Rollen (Kunde, Käufer, Bauherr, Empfehlungspartner, Provisionsbeteiligter …) hängen am Vorgang, nicht an einer Kopie der Person.
- **Vorgänge**: Akquise `AK-`, Investment `INV-`, Käuferprozesse `INV-OPT-`/`PROP-OPT-`, Property-Mandate `PROP-`, Projects-Mandate `MAN-` und Projekte `PRO-`, Suchaufträge `SRCH-I-`/`SRCH-P-`, Ankaufsprofile `ANK-`, Interessenten `INT-`. Vollständige Tabelle in `docs/UMSETZUNGSPLAN.md`.
- **Finanzkette**: erwartete Provision → entstandener Anspruch (`PRV-`) → Rechnung = Forderung (`RE-`) → Zahlungseingänge → Rest/überfällig. Verbindlichkeit (`VB-`) → Auszahlungen. Rest und Status werden immer berechnet, nie gespeichert. Geplante Zahlungen zählen nie als bezahlt.
- **Projects**: Eine Vergabe mit Auftraggeber „Kunde“ (Standard) erzeugt **keine** GRENFORD-Verbindlichkeit. Nur Auftraggeber „GRENFORD“ erzeugt eine.
- **Provisionen Netzwerk**: Empfehlungspartner haben einen Standard aus den Einstellungen, eine individuelle Vereinbarung hat Vorrang. Provisionsbeteiligte haben nur individuelle Vereinbarungen. Verbindlichkeiten entstehen erst auf ausdrückliche Aktion.
- **Mahnstufen** 1., 2. und Vollstreckung/Eskalation dienen nur der Nachverfolgung. Es werden keine automatischen Schritte ausgelöst.

## 3. Tests und Ergebnisse (11.10.2026)

| Prüfung | Ergebnis |
|---|---|
| TypeScript (`npm run typecheck`) | ✅ fehlerfrei |
| ESLint (`npm run lint`) | ✅ fehlerfrei |
| Produktions-Build (`npm run build`) | ✅ 43 Routen-Einträge, keine Warnungen |
| Logiktests (`npm test`) | ✅ 51/51: Finanzlogik, Teilzahlungen, Kennzahlen = Summe der Einzelbuchungen, Eingang/Bezahlt unverändert, Nummernkreise, Phasen, Provisionsregeln, Anonymisierung, Vergaberegel, Matching, Projektion |
| Datenbankregeln (`supabase/tests/regeln.sql`, Wegwerf-DB) | ✅ 9/9: Nummernkreis, Personen-Dublette, ungültiger Verweis, Teilzahlung/überfällig, Überzahlung, bezahlt, Audit, RLS fremdes Konto, RLS GRENFORD-Konto |
| Integrationstest 1 Investment | ✅ Unternehmen → Kontakt → Projekt → 2 Käuferprozesse (+ Dublettenschutz) → Provision erwartet/entstanden → Rechnung → Teilzahlung 100.000 € (Rest 200.000 €), Überzahlung und Zukunftsbuchung abgewiesen → Verlauf, Forderungen, Eingang/Bezahlt |
| Integrationstest 2 Property | ✅ Privatkunde → Suchauftrag → Objekt + Mandat → Käuferprozess → Status „Gekauft“ → Provision 23.400 € → Rechnung |
| Integrationstest 3 Projects | ✅ Mandat → Projekt → 3 GU-Angebote → Vergleich (Spanne 8.400 €) → Memo anonymisiert → Vergabe durch Kunden (keine Verbindlichkeit) → Empfehlungsprovision 3 % von 80.000 € = 2.400 € → Verbindlichkeit → Teil-Auszahlung |
| Integrationstest 4 Person bereichsübergreifend | ✅ dieselbe Person als Property-Käuferin und Projects-Bauherrin, genau ein Datensatz, beide Vorgänge sichtbar |
| Integrationstest 5 Finanzkonsistenz | ✅ überfällige Posten mit Mahnstufen, Kennzahlen aus derselben Datenbasis (zusätzlich per Logiktest) |
| Navigation | ✅ 38 Seiten × 5 Breiten (1536, 1440, 1280, Tablet 820, Smartphone 390): kein Fehlerstatus, keine Konsolenfehler, kein horizontales Scrollen |
| Regression Phase A / Bereiche / Vorgänge | ✅ 29/29 · 26/26 · 16/16 (Erwartungen an neue Testdaten angepasst: 25 statt 24 Unternehmen, 8 statt 7 Investoren durch Maspohl Invest GmbH) |
| Pixelvergleich Dashboard, Eingang/Bezahlt (1536 px) | ✅ identisch zur Freigabe |

Die Browser-Skripte liegen in `tests/e2e/` und sind dort beschrieben. Screenshots liegen in `docs/screenshots/gesamt-*.png`.

## 4. Bekannte Einschränkungen und Fehler

1. Testmodus: Daten liegen nur im Browser. Bei mehreren Geräten oder Nutzern gibt es keinen gemeinsamen Stand, und das Leeren der Browserdaten setzt alles zurück.
2. Der feste Stichtag 10.10.2026 ist für echte Nutzung auf das Tagesdatum umzustellen. Das geht zusammen mit der Datenbank.
3. Die Unterphasen von Projects sind ein Vorschlag (die Vorlage nennt nur die Hauptphasen).
4. Smartphone 390 px: Im Dashboard ragt der Umschalter „Monat/Quartal/Jahr“ in der Diagrammkarte wenige Pixel über den Kartenrand. Die Seite scrollt nicht. Bewusst nicht geändert, um das freigegebene Dashboard nicht anzutasten.
5. Es sind keine offenen Programmfehler bekannt. Alle während der QA gefundenen Abweichungen wurden behoben:
   - Smartphone-Überbreiten auf Detailseiten und im Dashboard
   - Topbar 3 px versetzt
   - Diagramm-Warnungen

## 5. Schritte zur Produktivsetzung (jeweils nur mit Ihrer Freigabe)

1. **Supabase-Projekt** in der EU-Region (Frankfurt) anlegen. Kosten prüfen; für Backups/PITR ist der Pro-Tarif nötig. Auftragsverarbeitungsvertrag abschließen.
2. **Migration** `supabase/migrations/0001_init.sql` ausführen und `supabase/tests/regeln.sql` auf einer Testkopie prüfen.
3. **Google-OAuth-Client** im GRENFORD-Workspace anlegen, Supabase Auth mit Google aktivieren, Domain `grenford.de` beschränken und den Hauptbenutzer in `benutzer` eintragen.
4. **Umgebungsvariablen** nur in Vercel hinterlegen, nie im Code:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (nur serverseitig)
   - später `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
5. **Zugriffsschicht** `supabase-repository.ts` implementieren. Dazu gehören serverseitige Middleware und Server Actions, der Stichtag auf das Tagesdatum und das Entfernen des localStorage-Zwischenspeichers.
6. **Datenübernahme**: Testdaten durch echte Stammdaten ersetzen (Import-Skript); keine echten Daten in ungeschützten Umgebungen.
7. **Google-Integrationen** einzeln freischalten:
   - Gmail: Protokoll, Versand nur mit Bestätigung
   - Calendar: keine ungefragten Einladungen
   - Drive: Ordner je Vorgang
8. **Produktion**: eigene Domain, EU-Region der Funktionen, Backups und Wiederherstellungstest. Erst danach den Merge in `main` und das Aufheben der Sperre in `vercel.json`.

## 6. Bitte fachlich bestätigen

Bitte bestätigen oder korrigieren Sie diese Punkte (Details in `docs/UMSETZUNGSPLAN.md`, Abschnitt „Abweichungen“):

- Nummernkreis Investment
- Unterphasen Projects
- Brautstraße 29: Eigentümer und Rolle
- Käufer Berlin-Schöneberg
- Bemessungsgrundlage der Empfehlungsprovision: vor oder nach Provisionsbeteiligungen Dritter
