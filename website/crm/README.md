# Website-Anfragen ins GRENFORD CRM (Google Sheet)

Die Formulare der Website (Projektanfrage, Kurznachricht, Bewertung, Suchprofile) senden an eine kleine
Google-Apps-Script-Web-App. Sie schreibt jede Anfrage als Zeile in das Blatt **„Website-Anfragen“** Ihres CRM-Sheets
und schickt eine Benachrichtigung an `kontakt@grenford.de`. Ohne eingetragene Web-App-URL bieten die Formulare
den Versand per E-Mail an, es geht also keine Anfrage verloren.

## Einrichtung (einmalig, ca. 10 Minuten)

1. CRM-Sheet öffnen (aktuell „GRENFORD CRM v8“) → **Erweiterungen → Apps Script**.
2. Den Inhalt von `website-anfragen.gs` vollständig einfügen und speichern. Bei Bedarf `NOTIFY` anpassen.
3. Oben die Funktion **`testEintrag`** auswählen → **Ausführen** → Berechtigungen bestätigen.
   Danach gibt es das Blatt „Website-Anfragen“ mit einer Testzeile (Zeile wieder löschen) und eine Test-E-Mail.
4. **Bereitstellen → Neue Bereitstellung** → Typ **Web-App**
   - Ausführen als: **Ich** (mkaimann@grenford.de)
   - Zugriff: **Jeder** (nötig, damit Website-Besucher ohne Google-Konto senden können; lesen kann niemand etwas)
5. Die angezeigte **Web-App-URL** (endet auf `/exec`) kopieren und in `website/site.json` bei `"formEndpoint"` eintragen.
6. `python3 build.py` ausführen, `dist/` hochladen. Einmal eine echte Testanfrage auf der Website senden und im Blatt prüfen.

## Was im Blatt steht

| Spalte | Inhalt |
|---|---|
| Eingang am / Antwort bis | Zeitpunkt der Anfrage und die zugesagte Antwortfrist (48 Stunden) |
| Status | Auswahl: Neu, In Bearbeitung, Beantwortet, Übernommen, Kein Bedarf |
| Bereich | Investment, Property, Projects oder Allgemein |
| Art der Anfrage | z. B. „Bewertungsanfrage · Property“, „Ankaufsprofil · Investment“, „Strategische Projektanfrage · …“ |
| Name, E-Mail, Telefon, Bevorzugter Kontakt | Kontaktdaten |
| Angaben | alle Antworten zeilenweise („Objektart: Wohnung“, „Wohnfläche: 90 m²“ …) |
| Seite, Notiz | Seite, auf der die Anfrage abgeschickt wurde; Notiz für Sie |

Übernehmen Sie qualifizierte Anfragen von dort in die Blätter Investment, Property oder Projects.

## Hinweise

- **Änderungen am Script** werden erst nach **Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Neue Version** aktiv. Die URL bleibt gleich.
- **Spam:** Die Website filtert Bots über ein unsichtbares Köderfeld; das Script prüft Name und E-Mail und trägt doppelt gesendete Anfragen nur einmal ein.
- **Datenschutz:** Die Verarbeitung in Google Workspace in der Datenschutzerklärung nennen (Auftragsverarbeitung mit Google besteht über Workspace).
