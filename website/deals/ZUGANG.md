# Deal-Seiten (Investment): Zugang und Vertraulichkeit

## Grundsatz
- Deal-Seiten liegen unter `/investment/deals/<slug>/`. Sie zeigen Inhalte, die nur nach Vertraulichkeitsvereinbarung
  (NDA) an einzelne Investoren gehen.
- Der Build erzeugt sie **nur im Vorschau-Build**. Für die Live-Website erst `site.json` → `"dealsPublish": true` setzen,
  **nachdem** der Zugangsschutz unten eingerichtet und getestet ist.
- Immer `noindex`, nie in der Sitemap, keine englische Fassung (bei Bedarf eigene Übersetzung je Deal).

## Echte Deal-Daten nicht ins Repository
Das Repository wird zu GitHub gepusht. Echte Deal-Daten (Investment Memo, Adressen, Eigentümer, Preise, Bilder mit
ungeklärten Rechten) gehören nicht hinein. Im Repository liegt nur die Vorlage mit Musterdaten
(`muster-serviced-living.json`). Echte Deals:
- Daten-Datei `deals/<slug>.json` und Bilder lokal bzw. auf dem Server ablegen, nicht committen
  (Muster in `.gitignore`: `website/deals/*.json` außer der Musterdatei, `website/static/assets/deals/`),
- oder ein privates, separates Repository nur für Deal-Daten verwenden.

## Zugangsschutz (empfohlen: Cloudflare Access, E-Mail-Einmalcode)
Ein Passwortfeld in der Seite selbst schützt nicht, weil die Inhalte trotzdem in der HTML-Datei stehen.
Der Schutz muss vor der Seite sitzen:
1. Domain grenford.de über Cloudflare verwalten (DNS bei Cloudflare).
2. Cloudflare Zero Trust → Access → Applications → „Self-hosted“ hinzufügen.
3. Application domain: `www.grenford.de`, Pfad: `investment/deals/*`.
4. Policy „Allow“ → Include → Emails: die E-Mail-Adressen der freigeschalteten Investoren (je Deal eine eigene Application
   oder Policy, z. B. Pfad `investment/deals/<slug>/*`).
5. Login-Methode: „One-time PIN“ (Einmalcode per E-Mail, kein Passwort).
6. Testen: Seite in privatem Fenster öffnen → Cloudflare fragt nach E-Mail → Code → Seite.
7. Zugang entziehen: E-Mail aus der Policy löschen.

Alternativen: Basic Auth beim Hosting (ein Passwort je Deal, weniger Kontrolle) oder Unterlagen nur im Datenraum
(Google Drive mit Freigabe je Person, nur Ansicht).

## Ablauf je Investor
Anfrage → Qualifizierung → NDA unterzeichnet → E-Mail in die Access-Policy → Link zur Deal-Seite schicken →
Datenraum-Freigabe → Gespräch und LOI.
