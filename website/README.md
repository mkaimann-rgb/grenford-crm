# GRENFORD Website

Statische Website (Startseite, Investment, Property, Projects), erzeugt mit Python. Kein Framework, keine Abhängigkeiten außer Python 3.9+ und optional Pillow für responsive Bildgrößen.

```bash
cd website
python3 build.py              # erzeugt dist/  (Produktion)
python3 build.py --preview    # erzeugt preview/ (Links mit index.html, zum Öffnen ohne Webserver)
python3 tests/markup.py       # Struktur, Sprungziele, Dateien, Formulare
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
| `site.json` | Kontaktdaten, Formular-Endpunkt, Seitentitel/-beschreibungen, Hero-Galerien, Social-Profile |
| `content.json` | Texte der drei Bereiche (Fokus, Memo-Kapitel, Ablauf, FAQ) |
| `investment-collection.json`, `property-collection.json` | Objekte |
| `static/css/` | `style.css` → `art.css` → `immersive.css` → `refinements.css`, beim Build zu `site.css` zusammengefasst |
| `static/js/` | `app.js` (Menü, Galerie, Karussell, Regler), `ux.js` (Formulare) |
| `static/assets/` | Bilder, Schriften (`fonts/`), `placeholder.svg` |
| `tests/` | `markup.py`, `transport.mjs` |

## Vor dem Livegang erledigen

1. **Originalbilder aus dem ZIP** (`dist/assets/` des veröffentlichten Stands) nach `static/assets/` kopieren. Der Build listet fehlende Dateien auf; bis dahin erscheinen „Bild folgt“ bzw. die Vorschau-Bilder:
   - `penthouse-before.webp`, `penthouse-after.webp`
   - für die Unterseiten die `hero-*.webp` aus `site.json` → `gallery`. Sind sie vorhanden, nutzt der Build automatisch sie statt `previewGallery`. Die Startseite zeigt bereits die fünf Skylines (München, Frankfurt, Berlin, Köln, Hamburg).
   - Nicht mehr benötigt: `hero-home-*.webp`, `house.webp`, `investment.webp`, `projects.webp`, `property.webp`, `dm-sans-600.ttf`.
2. **CRM-Eingang einmal echt prüfen:** `formEndpoint` ist das HubSpot-Formular aus dem veröffentlichten Stand; Schema und Nachrichtentext sind unverändert (geprüft mit `tests/transport.mjs` und einem Browsertest mit simuliertem HubSpot). Ein echter Test-Lead wurde bewusst nicht gesendet. Nach dem Deployment eine Testanfrage absenden und in HubSpot kontrollieren.
3. **Bildrechte/Kennzeichnung:** Mehrere KI-Bilder zeigen das Gemini-Wasserzeichen (✦), erfundene Firmennamen oder echte Markenlogos (Fachmarktzentrum: toom, JYSK, Fressnapf, KODi). Vor Verwendung als Kennzeichnung „Visualisierung“ ergänzen oder austauschen.
4. **Impressum/Datenschutz:** Links zeigen auf `www.grenford.de/imprint` und `/privacy` (`site.json`). Sicherstellen, dass diese Seiten zum neuen Auftritt gehören und erreichbar sind.
5. **`siteUrl`** in `site.json` prüfen (Canonical, Open Graph, Sitemap).

## Prüfung: Erhält die Python-Generierung den veröffentlichten Stand?

Geprüft mit dem Originalquelltext (`build.py`, `ux_refinement.py`, `collection.py`, `projects_comparison.py`, JSON-Dateien) gegen das veröffentlichte `dist/`:

- `investment/`, `property/`, `projects/`: **byte-identisch** neu erzeugt.
- `index.html`: identisch bis auf **ein Leerzeichen** (`data-cover-image fetchpriority` statt mit zwei Leerzeichen). Die veröffentlichte Startseite wurde also nach dem letzten Build minimal von Hand geändert; funktional ohne Folgen.
- `style.css`, `art.css`, `immersive.css`, `app.js`, `ux.js` und `assets/` erzeugt der Original-Build **nicht**. Sie existierten nur in `dist/` und blieben beim Neugenerieren nur deshalb erhalten, weil `build.py` sie nicht anfasst. In diesem Projekt liegen sie jetzt als Quelle in `static/`.
- `checks/transport.mjs` besteht gegen das veröffentlichte `ux.js`.

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
- `ux.js` übernimmt Texte, Ablauf und Nachrichtenformat des veröffentlichten Stands (HubSpot-Schema, „Strategische Projektanfrage · …“, Vorbelegungen „Noch offen“ usw.). Dazu: Validierung je Schritt mit verständlichen Fehlermeldungen, `aria-invalid`, Fokus auf das fehlerhafte Feld, Prüfseite, Doppelklick-Schutz, Erfolgsmeldung in einer Live-Region.
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
- Collection-Karussell (Startseite, Investment, Property, überall identisch) läuft automatisch alle 5 Sekunden eine Karte weiter und springt am Ende sanft zum Anfang. Ein Klick auf eine Karte hält es dauerhaft an; die Pfeile bleiben nutzbar und starten den Takt neu. Pausiert bei Tastaturfokus, außerhalb des Sichtbereichs, im Hintergrund-Tab und bei „reduzierte Bewegung“. Intervall: `COLLECTION_INTERVAL` in `static/js/app.js`.

**Bewusst nicht geändert:** Gestaltung, Texte und Bildsprache der Seiten, die Graustufen-Darstellung der Hero-Bilder und die drei Basis-Stylesheets (alle Korrekturen stehen in `refinements.css`).
