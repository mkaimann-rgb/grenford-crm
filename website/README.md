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

1. **Formular-Endpunkt eintragen:** `site.json` → `formEndpoint`. Der Wert stand in der bisherigen `dist/ux.js`, die mir nicht vorlag. Das Schema der Übertragung ist unverändert (`fields` + `context`, geprüft durch `tests/transport.mjs`). Solange das Feld leer ist, zeigen beide Formulare nach dem Absenden den vorbereiteten Text mit „Text kopieren“ und „E-Mail-Programm öffnen“.
2. **Fehlende Originalbilder** nach `static/assets/` kopieren (der Build listet sie auf; bis dahin erscheint „Bild folgt“):
   `marco-kaimann.jpg`, `penthouse-before.webp`, `penthouse-after.webp`, `soemmering-wohnzimmer.webp`, `soemmering-schlafzimmer.webp`, `soemmering-bad.webp`
3. **Hero-Galerien prüfen:** Die bisherigen Dateien (`hero-home-*.webp`, `hero-investment-*.webp`, `hero-property-*.webp`, `hero-projects-*.webp`) lagen nicht vor. `site.json` → `gallery` nutzt vorerst die Bilder, die vorlagen. Originale nach `static/assets/` kopieren und die Listen in `site.json` zurückstellen:
   - Start: `hero-investment-4, hero-home-1, hero-home-4, hero-home-2, hero-home-5`
   - Investment: `hero-investment-1` bis `-4` · Property: `hero-property-1` bis `-5` · Projects: `hero-projects-1` bis `-3`
4. **Bildrechte/Kennzeichnung:** Mehrere KI-Bilder zeigen das Gemini-Wasserzeichen (✦), erfundene Firmennamen oder echte Markenlogos (Fachmarktzentrum: toom, JYSK, Fressnapf, KODi). Vor Verwendung als Kennzeichnung „Visualisierung“ ergänzen oder austauschen.
5. **Impressum/Datenschutz:** Links zeigen auf `www.grenford.de/imprint` und `/privacy` (`site.json`). Sicherstellen, dass diese Seiten zum neuen Auftritt gehören und erreichbar sind.
6. **`siteUrl`** in `site.json` prüfen (Canonical, Open Graph, Sitemap).

## Was gegenüber dem bisherigen Stand geändert wurde

**Build**
- Pfade relativ zum Skript, UTF-8 überall (läuft auch unter Windows und aus jedem Ordner).
- `dist/` wird komplett aus `static/` und den Quellen erzeugt; CSS/JS/Bilder haben jetzt eine Quelle außerhalb von `dist/`.
- Keine stillen `.replace()`-Ketten mehr auf fertigem HTML; Überschriften und Vorauswahl werden direkt erzeugt.
- Nummerierung mit `{n:02d}` (auch ab 10 korrekt). Ungenutzter Code entfernt (`perspectives()`, Memo-Auswahl der Startseite, Tab-Logik).
- Fehlende Bilder brechen den Build nicht, sondern werden gemeldet und durch `placeholder.svg` ersetzt.
- `ux_refinement.py` und `property-collection.json` lagen nicht vor und wurden aus dem dist-Stand nachgebaut.

**Formulare (Datenschutz, Spam, Bedienung)**
- `method="post"`: Ohne JavaScript landen keine Personendaten mehr in der URL.
- Honeypot-Feld und Mindest-Ausfüllzeit (3 s) gegen Bots.
- Neues `ux.js`: Validierung je Schritt mit verständlichen Fehlermeldungen, `aria-invalid`, Fokus auf das fehlerhafte Feld, Prüfseite, Doppelklick-Schutz, Erfolgsmeldung in einer Live-Region.
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
- Hero-Galerie lädt Nachbarbilder vor und reagiert auf Wischgesten.

**Bewusst nicht geändert:** Gestaltung, Texte und Bildsprache der Seiten, die Graustufen-Darstellung der Hero-Bilder und die drei Basis-Stylesheets (alle Korrekturen stehen in `refinements.css`).
