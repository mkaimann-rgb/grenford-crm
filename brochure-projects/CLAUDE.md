# GRENFORD Projects · Brand-Kit für Broschüren (Claude Code)

Dieses Paket enthält alles, was die neue GRENFORD-Website für **GRENFORD Projects** verwendet: Farben, Schriften,
Formen, Bilder, Logos und die freigegebenen Texte. Es gilt nur für Projects (Sanierung, Bauangebote, Renovation Memo).
Investment und Property haben eigene Akzentfarben und gehören nicht in Projects-Material.

## Ordner
| Pfad | Inhalt |
|---|---|
| `design/tokens.css` | Farben, Schriften, Formen als CSS-Variablen (inkl. `@font-face`) – in jedes HTML einbinden |
| `design/tokens.json` | dieselben Werte maschinenlesbar (HEX, RGB, CMYK-Näherung, Verwendung) |
| `fonts/` | DM Sans 400/500 (woff2, ttf) · TeX Gyre Pagella (Palatino-Ersatz für Print) + Lizenzen |
| `images/` | Logos (weiß / dunkel / mokka), Projects-Bilder, Vorher/Nachher-Visualisierungen, Portrait |
| `content/projects-de.md` | **alle zulässigen Texte**, wortgleich mit der Website |
| `brochure/brochure.html` + `brochure.css` | fertige Vorlage: Broschüre A4 hoch, 8 Seiten |
| `brochure/render.mjs` | erzeugt `GRENFORD-Projects-Broschuere.pdf` (Playwright/Chromium) |

PDF erzeugen: `node brochure/render.mjs` (im Ordner `brochure-projects`). Voraussetzung: Playwright mit Chromium.

## Farben (verbindlich)
- **Projects-Orange `#FF7900`** (RGB 255/121/0, CMYK ca. 0/53/100/0): Akzent, Balken, Buttons, Memo-Titelblatt.
- Grundtöne der Dachmarke: Schwarz-Grau `#3A3D41` (dunkle Flächen, Überschriften), Papier `#FAF6F2` (Seitengrund),
  Elfenbein `#EFE9E1` (Kästen), Linie `#CFC8BC`, Text-Grau `#5F6470`.
- Orange als **Schrift** auf hellem Grund: `#A84700` (Kontrast 5,5 : 1). Auf dunklem Grund: `#FFAD59` (5,9 : 1).
- **Schrift auf Orange immer dunkel `#1C1D20`** (6,4 : 1). Weiß auf Orange ist zu schwach (2,6 : 1) – nie verwenden.
- `#FF7900` auf `#3A3D41` nur für große Schrift/Flächen (4,2 : 1), kleine Schrift dort in `#FFAD59`.
- Kein Blau (Property), kein Patina-Grün (Investment). Mokka `#7A6A52` nur, wo GRENFORD als Dachmarke gemeint ist.
- Verhältnis: viel Papier und Schwarz-Grau, Orange sparsam als Akzent (Balken, Ziffern, ein Highlight je Seite).

## Typografie
- **DM Sans** für alles. Überschriften Gewicht 500, eng gesetzt (große Headlines `letter-spacing: -0.065em`,
  kleine Titel `-0.02em`), Zeilenabstand 1,0–1,1. Fließtext 400, Zeilenabstand 1,6–1,65, Farbe `#5F6470`.
- **Serifen-Akzent** (Palatino, im PDF TeX Gyre Pagella, Gewicht 400) nur für einzelne ruhige Zeilen,
  z. B. „Nicht Sie, und auch nicht über einen Aufschlag.“ Nie für Fließtext.
- Dachzeilen (Eyebrow): DM Sans 500, VERSALIEN, `letter-spacing: 0.08em`, klein, in Orange-Schrift.
- Größen Print (pt): Titel 40–46 · H2 26 · H3 13,5 · Text 10,5 · Klein 8–8,5 · Dachzeile 7,5.

## Formen und Gestaltung
- Buttons und Chips **halbrund** (`border-radius: 999px`), nie eckig.
- Karten: oben gerade mit 3 px Orange-Linie, unten 14 px gerundet (`0 0 14px 14px`).
- Ziffern im Kreis (Prozess 01–05), letzter Schritt in Orange.
- Bilder mit 14 px Rundung; Titelbild randabfallend mit Verlauf ins Schwarz-Grau.
- Logo: auf dunklem Grund `logo-projects-white.png`, auf hellem/orangem Grund `logo-projects-dark.png`.
  Rückseite/Dachmarke: `logo-boutique-white.png` („Boutique Real Estate Advisory“).

## Sprache (verbindlich)
- GRENFORD spricht als **Unternehmen**: „GRENFORD holt …“, nie „ich“. Marco Kaimann nur in der dritten Person.
- Einfach und direkt, konkret statt Berater-Floskeln („strategisch“, „ganzheitlich“, „Transformation“ vermeiden).
- Leserinnen und Leser mit „Sie“ ansprechen.
- **Nur Aussagen aus `content/projects-de.md` verwenden.** Keine Preise, Prozentsätze, Kundennamen, Adressen,
  Angebotssummen oder Baufirmennamen erfinden oder aus Kundenunterlagen übernehmen.
- Vorher/Nachher-Bilder sind **Visualisierungen** realer Projekte. Der Pflichthinweis aus `content/projects-de.md`
  steht immer auf derselben Seite wie die Bilder.
- Keine Versprechen zu Bauleitung oder Abnahme: GRENFORD übernimmt beides nicht (siehe FAQ).

## Seitenplan der Vorlage
1 Titel · 2 Warum Angebote nicht vergleichbar sind · 3 Vergütung („Nicht Sie“) · 4 Vorher/Nachher Dachgeschoss ·
5 Vorher/Nachher Penthouse · 6 Renovation Memo · 7 5-Point Process · 8 Fragen und Kontakt

## Bilder
| Datei | Motiv | Hinweis |
|---|---|---|
| `dachgeschoss-before/after.webp` | Dachgeschoss Bestand / Ergebnis | Visualisierung eines realen Projekts |
| `penthouse-before/after.webp` | Oberstes Geschoss Bestand / Ergebnis | Visualisierung eines realen Projekts |
| `projects-bauplan.webp` | Grundriss mit Bauhelm | Projects-Motiv |
| `projects-badsanierung.webp` | Badsanierung, Handwerker | Projects-Motiv |
| `marco-kaimann.jpg` | Portrait Marco Kaimann | nur mit Name und „Gründer von GRENFORD“ |

## Lizenzen
- DM Sans: SIL Open Font License 1.1 (© The DM Sans Project Authors) – Einbetten in PDF erlaubt.
- TeX Gyre Pagella: GUST Font License (siehe `fonts/LICENSE-TeX-Gyre-Pagella-GUST.txt`) – Einbetten erlaubt.
- Bilder und Logos: GRENFORD (eigenes Bildmaterial bzw. Visualisierungen).
