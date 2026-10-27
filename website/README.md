# GRENFORD Website

Statische Website (Startseite, Investment, Property, Projects), erzeugt mit Python. Kein Framework, keine Abhängigkeiten außer Python 3.9+ und optional Pillow für responsive Bildgrößen.

```bash
cd website
python3 build.py              # erzeugt dist/  (Produktion)
python3 build.py --preview    # erzeugt preview/ (Links mit index.html, zum Öffnen ohne Webserver)
python3 tests/markup.py       # Struktur, Sprungziele, Dateien, Formulare
python3 tests/market.py       # Marktseite mit Musterdaten (nur Test), Pflichtfelder, Leerzustand
node tests/transport.mjs      # Formular-Übertragung (ohne echten Request)
```

`dist/` ist reine Ausgabe und wird bei jedem Build gelöscht und neu erzeugt. **Nie direkt in `dist/` ändern.**

## Struktur

| Pfad | Inhalt |
|---|---|
| `build.py` | Seitenaufbau, Kopf/Fuß, SEO, Ausgabe |
| `paths.py` | relative URLs, Bild-Helfer (`srcset`, `width`/`height`, Ersatzbild) |
| `collection.py` | Investment-Mandate und Property-Karten |
| `projects_comparison.py` | Vorher-Nachher-Vergleiche |
| `ux_refinement.py` | Projektanfrage (6 Schritte), Kontaktbereich, Kontaktleiste |
| `market.py`, `market.json` | Marktseite `/markt/`: Überblick mit Filtern, Einordnung, Methodik; Daten nur aus geprüften Quellen (`markt/DATENQUELLEN.md`) |
| `valuation.py` | Bewertung und Suchprofile: fünf mehrstufige Formulare (Kacheln, Regler), Symbole |
| `site.json` | Kontaktdaten, Formular-Endpunkt, Seitentitel/-beschreibungen, Hero-Galerien, Social-Profile |
| `content.json` | Texte der drei Bereiche (Fokus, Memo-Kapitel, Ablauf, FAQ) |
| `investment-collection.json`, `property-collection.json` | Objekte |
| `static/css/` | `style.css` → `art.css` → `immersive.css` → `refinements.css` → `structure.css`, beim Build zu `site.css` zusammengefasst |
| `static/js/` | `app.js` (Menü, Galerie, Karussell, Regler), `ux.js` (Formulare, Übertragung), `wizard.js` (Bewertung/Suchprofile, Reiter, Bewertungsleiste, Ablauf-Slides) |
| `static/assets/` | Bilder, Schriften (`fonts/`), `placeholder.svg` |
| `tests/` | `markup.py`, `transport.mjs` |
| `tools/brand_images.py` | erzeugt Browser-Symbole, Teilen-Bild und kleines Logo |
| `crm/` | Google-Apps-Script für den Eingang der Anfragen im CRM-Sheet, mit Anleitung |

## Vor dem Livegang erledigen

1. **Originalbilder aus dem ZIP** (`dist/assets/` des veröffentlichten Stands) nach `static/assets/` kopieren. Der Build listet fehlende Dateien auf; bis dahin erscheinen „Bild folgt“ bzw. die Vorschau-Bilder:
   - Projects-Hero: `hero-projects-1..3.webp` aus `site.json` → `gallery`. Sind sie vorhanden, nutzt der Build automatisch sie statt `previewGallery`. Startseite, Investment und Property haben bereits ihre Hero-Bilder; der Penthouse-Vergleich (`penthouse-before/after.webp`) ist ebenfalls vorhanden.
   - Nicht mehr benötigt: `hero-home-*.webp`, `house.webp`, `investment.webp`, `projects.webp`, `property.webp`, `dm-sans-600.ttf`.
2. **CRM-Anbindung einrichten:** HubSpot wird nicht mehr genutzt. Die Formulare senden an eine Google-Apps-Script-Web-App, die Anfragen ins CRM-Sheet (Blatt „Website-Anfragen“) schreibt. Einrichtung in `crm/README.md`, danach die Web-App-URL in `site.json` → `formEndpoint` eintragen. Bis dahin ist `formEndpoint` leer und die Formulare bieten den Versand per E-Mail an.
3. **Bildrechte/Kennzeichnung:** Mehrere KI-Bilder zeigen das Gemini-Wasserzeichen (✦), erfundene Firmennamen oder echte Markenlogos (Fachmarktzentrum: toom, JYSK, Fressnapf, KODi). Vor Verwendung als Kennzeichnung „Visualisierung“ ergänzen oder austauschen.
4. **Impressum/Datenschutz:** Links zeigen auf `www.grenford.de/imprint` und `/privacy` (`site.json`). Sicherstellen, dass diese Seiten zum neuen Auftritt gehören und erreichbar sind.
5. **`siteUrl`** in `site.json` prüfen (Canonical, Open Graph, Sitemap).

## Prüfung: Erhält die Python-Generierung den veröffentlichten Stand?

Geprüft mit dem Originalquelltext (`build.py`, `ux_refinement.py`, `collection.py`, `projects_comparison.py`, JSON-Dateien) gegen das veröffentlichte `dist/`:

- `investment/`, `property/`, `projects/`: **byte-identisch** neu erzeugt.
- `index.html`: identisch bis auf **ein Leerzeichen** (`data-cover-image fetchpriority` statt mit zwei Leerzeichen). Die veröffentlichte Startseite wurde also nach dem letzten Build minimal von Hand geändert; funktional ohne Folgen.
- `style.css`, `art.css`, `immersive.css`, `app.js`, `ux.js` und `assets/` erzeugt der Original-Build **nicht**. Sie existierten nur in `dist/` und blieben beim Neugenerieren nur deshalb erhalten, weil `build.py` sie nicht anfasst. In diesem Projekt liegen sie jetzt als Quelle in `static/`.
- `checks/transport.mjs` besteht gegen das veröffentlichte `ux.js`.

## Seitenstruktur (Konzept „Struktur der Großen, Marke GRENFORD“)

Typografie, Hero-Karussell, Collection-Karussell und Gestaltung der bestehenden Seite bleiben; ergänzt wurde die Struktur, mit der große Maklerhäuser Anfragen erzeugen, in der GRENFORD-Sprache und mit Marco Kaimann als Gesicht der Marke.

| Seite | Inhalt |
|---|---|
| Startseite | Hero (Skylines, Reichweite), drei Bereiche, **Bewertungs-Teaser** (Kacheln → `/bewerten/`), Collection, Gründer, Ablauf, Projektanfrage |
| Investment (B2B) | Hero-Aktionen „Asset einordnen“ / „Ankaufsprofil hinterlegen“, Abschnitt `#bewertung` mit zwei Reitern |
| Property (B2C) | Hero: „Immobilie bewerten“ (Hauptbutton) / „Immobilien ansehen“, Suchprofil als kleiner Link darunter; Abschnitt `#bewertung` mit zwei Reitern |
| Projects | „Wert nach Sanierung ermitteln“, Abschnitt **Vergütung** (`#verguetung`: für Eigentümer kostenfrei, vergütet durch das beauftragte Bauunternehmen) |
| `/bewerten/` | Bewertung mit Reitern Property / Projects / Investment, drei Wege (digital, Video, vor Ort), Ablauf 01/04, Fragen, Kontakt |
| `/markt/` | **Ausgeblendet**, bis `market.json` geprüfte Datensätze enthält (dann automatisch mit Footer-Link, GRENFORD-Menü und Sitemap). Marktperspektiven: Marktüberblick (Filter Standort, Immobilienart, Zeitraum, Datentyp; Leerzustand ohne Daten), Einordnung, Methodik, Fragen, nächster Schritt. Nur im Footer verlinkt. |
| `/ueber-grenford/` | Gründer, Haltung (vier Grundsätze), drei Geschäftsfelder, „So entsteht ein Memo“ (5 Schritte), Reichweite, Kontakt |

- **Navigation:** Investment, Property, Projects und GRENFORD, jeweils mit Großmenü. GRENFORD: Gründerporträt, Über GRENFORD, Immobilie bewerten, Marktperspektiven, Kontakt, STAYNAMIC und die Bewertung als nächster Schritt. Auf dem Handy das einfache Menü, unter GRENFORD mit Unterpunkten.
- **Bewertung und Suchprofile** (`valuation.py`, `wizard.js`): fünf Varianten, je Bereich angepasst. Kontaktdaten erst im letzten Schritt, Pflichtangaben je Schritt geprüft, Zweige (z. B. Hausart nur bei „Haus“, Miete nur bei „Vermietet“). Übertragung über `sendRequest()` an das CRM-Sheet (`subject` investment / property / renovation, Nachricht zeilenweise „Feld: Wert“). Sprungziele `#bewertung-property-search` usw. öffnen den passenden Reiter, auch von anderen Seiten.
- **Bewertungsleiste:** dezent am unteren Rand nach dem Hero, nicht über Formularen und dem Footer, schließbar (gilt für die Sitzung). Nicht auf `/bewerten/`.
- **Footer:** Linkspalten je Bereich und GRENFORD, Adresse und Kontakt.
- **Antwortzeit:** „Antwort innerhalb von 48 Stunden“ ist zugesagt (Bewertung, Teaser, Leiste, Bestätigungen); das CRM-Blatt zeigt dazu die Spalte „Antwort bis“.
- **Offen:** Newsletter (Name noch offen, nicht „Memo“) noch nicht eingebaut; braucht Double-Opt-in.

## Feinschliff (Block B)

- **Projektanfrage eingeklappt** auf allen Seiten (wie bisher auf der Startseite); Bewertung und Suchprofile sind der Haupteinstieg. `#anfrage` und die „… anfragen/besprechen“-Buttons öffnen sie mit vorgewähltem Bereich.
- **Bilder:** zusätzliche 1600-px-Stufe und stärkere Kompression der Varianten; Logo in Kopf und Footer als 256-px-Datei. Startseite am Desktop 1,23 MB statt 1,73 MB.
- **404-Seite** (`dist/404.html`, absolute Pfade, `noindex`). Beim Hoster als Fehlerseite eintragen.
- **Symbole und Teilen-Bild:** `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`, `og-grenford.jpg` (1200 × 630), erzeugt mit `python3 tools/brand_images.py`.
- **Google-Zusatzinfos (strukturierte Daten):** Fragen als FAQ auf den Bereichsseiten und „Bewerten“, Leistung „Immobilienbewertung“, Brotkrumen-Navigation.

## Akzentfarbe und Markenstimme

- **Akzentfarbe Patina `#2e6b62`** (oxidiertes Kupfer, wie auf Berliner Kuppeln). Ersetzt das bisherige Orange `#ff7900`, das im Farbton identisch mit einem Wettbewerber war. Werte am Ende von `static/css/refinements.css`; die Variablennamen `--orange*` sind aus Kompatibilitätsgründen geblieben. Schrift auf der Farbfläche ist weiß (`--on-orange`).
- Nur im Vorschau-Build (`--preview`): Farbumschalter (`static/preview/palette.css`, `palette.js`) mit Patina, Memo-CI (Navy/Bronze wie in den PDFs), Bauhaus-Rot, Kobalt, Ocker, Cognac, Terrakotta und dem bisherigen Orange. `dist/` bleibt davon unberührt.
- **Markenstimme:** Leistungen und Abläufe sprechen als „GRENFORD“, Gründerporträt und Bestätigungsmeldungen bleiben in der Ich-Form von Marco Kaimann.
- **Reichweite im Startseiten-Hero:** `site.json` → `home.reach` (Städte in Reihenfolge der Galerie) und `home.reachNote`. Die gerade gezeigte Stadt wird hervorgehoben (`static/js/app.js`).

## Was gegenüber dem bisherigen Stand geändert wurde

**Build**
- Pfade relativ zum Skript, UTF-8 überall (läuft auch unter Windows und aus jedem Ordner).
- `dist/` wird komplett aus `static/` und den Quellen erzeugt; CSS/JS/Bilder haben jetzt eine Quelle außerhalb von `dist/`.
- Keine stillen `.replace()`-Ketten mehr auf fertigem HTML; Überschriften und Vorauswahl werden direkt erzeugt.
- Nummerierung mit `{n:02d}` (auch ab 10 korrekt). Ungenutzter Code entfernt (`perspectives()`, Memo-Auswahl der Startseite, Tab-Logik).
- Fehlende Bilder brechen den Build nicht, sondern werden gemeldet und durch `placeholder.svg` ersetzt.
- `ux_refinement.py` und `property-collection.json` entsprechen dem veröffentlichten Stand (Original-Markup) plus den unten genannten Verbesserungen. Ungenutzte Altfunktionen (`refine()`, `compact_process()`) sind entfallen.

**Formulare (Datenschutz, Spam, Bedienung)**
- `method="post"`: Ohne JavaScript landen keine Personendaten mehr in der URL.
- Unsichtbares Köderfeld (Honeypot) gegen Bots; keine Zeitsperre, damit schnelle echte Anfragen nie verloren gehen.
- `ux.js` übernimmt Texte, Ablauf und Nachrichtenformat des veröffentlichten Stands („Strategische Projektanfrage · …“, Vorbelegungen „Noch offen“ usw.). Dazu: Validierung je Schritt mit verständlichen Fehlermeldungen, `aria-invalid`, Fokus auf das fehlerhafte Feld, Prüfseite, Doppelklick-Schutz, Erfolgsmeldung in einer Live-Region.
- Bei Übertragungsfehlern bleibt nichts verloren: vorbereiteter Text zum Kopieren oder per E-Mail.
- „… anfragen“-Buttons füllen Bereich, Anliegen und Objekt vor; auf der Startseite öffnet `#anfrage` das eingeklappte Formular.
- `noscript`-Hinweis mit E-Mail-Adresse.

**Barrierefreiheit**
- Kontrast: Akzent für kleinen Text auf `#a84700` (5,4:1 auf Papier, 4,8:1 auf Elfenbein).
- Mindestschriftgrößen angehoben (vorher 5–8 px).
- Footer- und Kartenlinks mit Tippfläche ≥ 32 px.
- „＋/−“ und Pfeile für Screenreader ausgeblendet (Menü, FAQ, Karte).
- Dekorative Hero-Bilder mit `alt=""`; Logo-Bild ohne doppelte Ansage.
- Escape schließt das Menü und gibt den Fokus an den Menü-Button zurück.
- Karussell-Zähler wird erst nach dem Scrollen angesagt.
- Social-Gruppe mit `role="group"`; Instagram/Facebook erscheinen erst, wenn in `site.json` eine URL steht.

**SEO**
- Eigene `title` und `description` je Seite, `canonical`, Open Graph, Twitter Card.
- Strukturierte Daten `RealEstateAgent` (Adresse, Kontakt, USt-ID, Gründer) auf der Startseite.
- `sitemap.xml` und `robots.txt` werden erzeugt.

**Performance**
- Schriften als WOFF2 (19 statt 47 KB je Schnitt) mit TTF-Fallback und `preload`; ungenutzter SemiBold-Schnitt entfernt.
- Ein Stylesheet (`site.css`) statt drei.
- `srcset` mit 800/1280 px-Varianten (Pillow), `width`/`height` an allen Bildern.
- Hero-Galerie wechselt automatisch alle 6 Sekunden in einer Schleife (Überblendung mit leichtem Zoom, ohne Bedienelemente). Pausiert, wenn der Hero nicht sichtbar oder der Tab im Hintergrund ist; bei „reduzierte Bewegung“ bleibt das erste Bild stehen. Intervall: `HERO_INTERVAL` in `static/js/app.js`.
- Collection-Karussell (Startseite, Investment, Property, überall identisch) gleitet langsam und durchgehend als Endlosschleife (28 px/s; die Karten werden dafür per JavaScript einmal dupliziert, für Screenreader ausgeblendet). Ein Klick auf eine Karte hält es dauerhaft an; die Pfeile bleiben nutzbar (danach gleitet es nach 4 s weiter, solange es nicht angehalten wurde). Pausiert bei Wischen, Tastaturfokus, außerhalb des Sichtbereichs und im Hintergrund-Tab; bei „reduzierte Bewegung“ kein automatischer Lauf. Tempo: `COLLECTION_SPEED` in `static/js/app.js`.
- Collection-Karten (Investment und Property): beim Überfahren mit der Maus bzw. bei Tastaturfokus orange Fläche (`--orange`), vorher orange Schrift (Region, Ort, Status-Punkt) wird weiß. Auf Touch-Geräten kein Hover. CSS am Ende von `static/css/refinements.css`.

**Bewusst nicht geändert:** Gestaltung, Texte und Bildsprache der Seiten, die Graustufen-Darstellung der Hero-Bilder und die drei Basis-Stylesheets (alle Korrekturen stehen in `refinements.css`).
