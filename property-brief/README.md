# GRENFORD Property Brief – Vorlage

Ein Design, beliebig viele Objekte. Gestaltung, Partnerseite, „Über GRENFORD“ und AGB sind fest;
pro Immobilie wird nur eine Datei `objekt.json` ausgefüllt.

## Ordner

```
property-brief/
  build.py                 erzeugt brief.html aus objekt.json
  render.mjs               erzeugt daraus das PDF
  lib/brief.py             komplettes Seitendesign (Raster, Farben, Schriften, Module)
  shared/                  gemeinsame Inhalte: Logos, Porträt, Schriften, AGB, Partnertexte, Berlin-Karte
  vorlagen/haus.json       Vorlage Haus (Beispiel Schlierbacher Weg 13a)
  vorlagen/wohnung.json    Vorlage Eigentumswohnung (mit Seite „Gemeinschaft & Verwaltung“)
  objekte/<objekt>/        objekt.json, assets/ (Bilder), fertiges PDF
  MERKBLATT_Pflichtangaben.md
```

## Neues Objekt in 4 Schritten

1. Ordner `objekte/<strasse-nr>/` anlegen, `vorlagen/haus.json` bzw. `vorlagen/wohnung.json` als `objekt.json` hineinkopieren.
2. Bilder in `objekte/<strasse-nr>/assets/` ablegen und in `objekt.json` die Dateinamen eintragen.
3. Alle Texte und Zahlen ersetzen; Seiten, die nicht passen, aus `seiten` löschen. Kosten, Seitenzahlen,
   Inhaltsverzeichnis und Verweise `{seite:<id>}` werden automatisch berechnet.
4. Erzeugen:

```bash
python3 build.py objekte/<strasse-nr>
```

```bash
node render.mjs objekte/<strasse-nr>
```

Voraussetzungen: Python 3 mit Pillow, Node.js mit Playwright (Chromium).

## Seitenzählung

Titel ohne Zahl · Vorwort und Inhalt römisch (I, II) · Objektteil arabisch (1, 2, …) ·
ab Partner & Service wieder römisch fortlaufend (III, IV, …). Gesteuert über `"bereich": "vor" | "nach"`.

## Verfügbare Seitenmodule

`titel`, `vorwort`, `inhalt`, `ueberblick`, `split` (50/50 Bild + Liste), `lage` (Berlin-Karte mit Standort aus
Koordinaten), `raumprogramm`, `grundrisse`, `sanierung`, `projektstand` (auch für „Gemeinschaft & Verwaltung“),
`energie`, `kosten` (eine oder mehrere Einheiten), `vergleich`, `einheit`, `plaene`, `markt`, `rendite`,
`partner`, `kontakt`, `ueber`, `recht`, `agb`.

Beispiele: `objekte/schlierbacher-weg-13a` (Haus) und `objekte/soemmeringstrasse-35` (Projekt mit drei Wohnungen).

Vor der Weitergabe an Interessenten: `MERKBLATT_Pflichtangaben.md` abhaken.
