# GRENFORD Dokumentformate

Stand 25.11.2026 · verbindlich für alle neuen Objekte

## Grundsatz: eine Marke, ein Erscheinungsbild

Ob Property Brief, Investment Brief, Investment Memo oder Renovation Memo: Jedes Dokument muss auf den ersten Blick als GRENFORD erkennbar sein. Alle Formate werden mit demselben Generator (`lib/brief.py`) erzeugt. Sie teilen deshalb Typografie, Raster, Bildsprache und Tonalität. Nur Akzentfarbe, Logo und Inhaltstiefe ändern sich je Geschäftsbereich.

### Typografie (`"typo": "sans"`, für alle Formate)

- Überschriften: Cormorant Garamond in Versalien, ohne Satzpunkt
- Fließtext: DM Sans
- Dachzeilen, Labels und Seitenköpfe: DM Mono in Versalien

### Seitenformat

- Querformat 907 × 567 pt, einheitliche Ränder (links 51 pt, rechts 856 pt)
- Kopfzeile mit Logo und Kapitelname, Fußzeile mit Dokumentname und Seitenzahl
- Seitenzählung:
  - Titel ohne Zahl
  - Inhalt und Vorwort römisch (I, II)
  - Fakten römisch III, Objektteil arabisch
  - ab Partner bzw. Kontakt wieder römisch fortlaufend

### Bildsprache

- Titel mit vollflächigem Foto und Farbspalte links
- Teilseiten mit Bild links oder rechts
- eine vollflächige Bildseite mit Verlauf (`bildseite`, `"stil": "voll"`)
- Grundrisse auf weißen Karten
- Kennzahlen in Farbkacheln, Diagramme in der Akzentfarbe
- Echte Fotos bleiben Fotos; Visualisierungen werden immer gekennzeichnet.
- Fotos mit dominanten Fremdfarben (z. B. gelbe Fassade) werden an die Bereichsfarbe angeglichen: `"toenung": {"farbe": "navy", "alpha": 0.5–0.7, "modus": "color"}`. Bei unruhigen Bildern auf Bildseiten den Verlauf über `"verlauf"` verlängern, damit keine harte Kante entsteht.

### Farbe und Logo je Bereich (`meta.bereich`)

| Bereich | Akzent | Logo | Formate |
|---|---|---|---|
| `property` | Navy `#212e40` / `#4f6a92` | GRENFORD Property | Property Brief |
| `investment` | Patina `#24534c` / `#2e6b62` | GRENFORD Investments | Investment Brief, Investment Memo |
| `projects` | Projects-Orange `#FF7900` (Fläche), `#A84700` (Schrift auf Hell), `#FFAD59` (auf Dunkel), Zartes Orange `#FFEBD8`, Schwarz-Grau `#3A3D41`; Schrift auf Orange `#1C1D20`, nie Weiß | GRENFORD Projects | Renovation Memo |

### Sprache

- Sachlich, positiv, investorenfreundlich.
- Offene Punkte werden nie verschwiegen. Sie stehen als neutrale „Vermerk:“-Zeile im normalen Text, ohne Farbe und ohne Hervorhebung.
- Quellen stehen am Seitenfuß, jede Angabe nur einmal.
- Gesetzliche Hinweise immer mit Fundstelle und Stand, z. B. „Mietpreisbremse (§§ 556d ff. BGB, verlängert bis 31.12.2029)“; vor jeder Ausgabe auf Aktualität prüfen.
- Der Verkäufer wird nicht namentlich genannt („wird im Rahmen der Vertragsvorbereitung benannt“).

## Welches Format wann

| Format | Zielgruppe | Typische Objekte | Kern |
|---|---|---|---|
| **Property Brief** | Eigennutzer, private Käufer | Eigentumswohnung, Haus, Dachgeschoss | Wohnen, Ausstattung, Lage, Kosten; optional Mietorientierung |
| **Investment Brief** | private und neue Kapitalanleger, kleinere Family Offices | vermietetes Mehrfamilienhaus, ca. 1–5 Mio. € | Bestand, Mieteinheiten, Rendite, Finanzierungsbeispiel, Potenzial, Asset Check |
| **Investment Memo** | professionelle Investoren (B2B) | Projektentwicklung, größere Ankäufe, Datenraum | Business Plan, 10-Jahres-Rechnung, IRR, Sensitivität, Machbarkeit |
| **Renovation Memo** (geplant) | Eigentümer und Investoren mit Umbauvorhaben | Sanierung, Modernisierung, Repositionierung | Maßnahmen, Kosten, Zeitplan, Wertsteigerung |

Regeln:

- Ein Mehrfamilienhaus gehört zu GRENFORD Investments und geht immer als Investment Brief raus, nicht zusätzlich als Property Brief.
- Ein Investment Memo kommt in Frage, wenn ein Business Plan mit IRR und Zeitplan entsteht oder ein Investor eine vollständige Datenraumprüfung erwartet. Das gilt zum Beispiel, wenn eine Aufstockung als eigenes Vorhaben vermarktet wird.

## Objektnummern

- Property: `GPR26-001`, `GPR26-002`, … (fortlaufend je Jahr)
- Investment: `GI26-001`, `GI26-002`, … (fortlaufend je Jahr, Brief und Memo in einer Reihe)

## Seitenaufbau

### Property Brief (20 Seiten, Muster `objekte/schlierbacher-weg-13a`, `objekte/soemmeringstrasse-35`)

1. Titel
2. Inhalt (I)
3. Vorwort (II)
4. Fakten und Zahlen mit Kosten (III)
5. Wohnkonzept
6. Ausstattung
7. Lage
8. Raumprogramm
9. Grundrisse 1
10. Grundrisse 2
11. Sanierung
12. Projektstand
13. Energie
14. Mietorientierung
15. Rendite
16. Partner
17. Kontakt
18. Über GRENFORD
19. Transparenz im Detail (`recht`, 4 Blöcke in 2 × 2)
20. AGB (`shared/agb.html`)

### Investment Brief (21 Seiten, Muster `objekte/paetzer-strasse-11-investment`)

1. Titel mit vier Kennzahlen
2. Inhalt (I)
3. Vorwort (II)
4. Hard Facts (III)
5. Das Objekt (Bildseite)
6. Standort / Makrolage (Karte Berlin und Brandenburg mit Entfernungstabelle)
7. Lage / Mikrolage (Quartier, Nahversorgung, ÖPNV)
8. Mieteinheiten
9. Grundrisse 1
10. Grundrisse 2
11. Asset
12. GRENFORD Research (Mietniveau)
13. Rendite mit Sensitivität
14. Finanzierungsbeispiel
15. Wertpotenzial
16. GRENFORD Asset Check
17. Value Matrix
18. Kontakt / Transaktionsablauf
19. Über GRENFORD
20. Transparenz im Detail (`recht`, 6 Blöcke in 3 × 2: zusätzlich Rendite und Finanzierung sowie Provision)
21. AGB (`shared/agb_investment_brief.html`)

#### Standortseite Berlin (Standard für alle Berliner Objekte)

- **Karte:** `shared/geo/berlin_karte.geojson` (Bezirksgrenzen, CC BY). Brandenburg bildet den Hintergrund, der Bezirk des Objekts wird über `"markiert"` hervorgehoben. Dazu Radien 5 / 10 / 20 km und nummerierte Ziele mit Strahlen.
- **Ziele:** Die Standardziele liegen in `shared/geo/berlin_ziele.json`. Es sind zehn Punkte: Hermannplatz, Südkreuz, Potsdamer Platz, Alexanderplatz, Kurfürstendamm, Hauptbahnhof, Adlershof, BER, Potsdam und Grünheide. Je nach Objektlage können Ziele getauscht werden, zum Beispiel Spandau, Tegel/Urban Tech Republic oder Ostkreuz.
- **Tabelle:** Die Luftlinie berechnet das Skript aus den Koordinaten. ÖPNV- und Pkw-Zeiten sind gerundete Richtwerte von Tür zu Tür, gekennzeichnet als „Richtwerte GRENFORD, ohne Gewähr“. Wo vorhanden, haben Verkäuferangaben Vorrang.
- **Einordnung:** ein kurzer Kasten zur Bedeutung der Lage für die Mietnachfrage.

### Investment Memo (ca. 34 Seiten, Muster `objekte/montesana-gi26-002`)

1. Titel
2. Inhalt
3. Vorwort
4. Hard Facts
5. Standort
6. Lage und Grenzraum
7. Angebot
8. Asset
9. GRENFORD Research
10. Konzept, Nutzung und Pläne
11. Wertschöpfung
12. Zeitstrahl und Bauablauf
13. Kosten
14. 10-Jahres-Rechnung, Szenarien und Sensitivität
15. Käuferrendite
16. Asset Check
17. Machbarkeit
18. Value Matrix
19. Kontakt
20. Über GRENFORD
21. Disclaimer
22. AGB (`shared/agb_investment.html`, nur B2B)

## Standardannahmen Investment Brief

Die Annahmen stehen oben in `quelle/erzeuge_objekt.py`. Alle Kennzahlen werden daraus berechnet.

| Annahme | Wert |
|---|---|
| Darlehen | 70 % des Kaufpreises |
| Sollzins | 3,8 % |
| Anfängliche Tilgung | 2,0 % |
| Nicht umlagefähige Kosten | 15 % der Jahresnettokaltmiete |
| Notar und Grundbuch | 2,0 % des Kaufpreises |
| Grunderwerbsteuer | je Bundesland (Berlin 6,0 %) |
| Käufercourtage | 6,00 % zzgl. MwSt. (7,14 %) |

**Pflicht bei jeder Finanzierungsrechnung:** Es muss klar gesagt werden, dass die Werte Annahmen GRENFORD sind, nur der Orientierung dienen und kein Finanzierungsangebot sind. Die verbindliche Berechnung nimmt ausschließlich ein Kreditinstitut vor, mit den persönlichen Konditionen, dem Eigenkapital und der Bonität des Käufers. Dieser Hinweis steht auf der Finanzierungsseite (Textblock, Kennzahlenkasten, Quelle), in der Value Matrix und in den Rechtlichen Hinweisen.

## AGB

| Datei | Für | Courtage |
|---|---|---|
| `shared/agb.html` | Property Brief | je Objekt über `kosten.agb_courtage` |
| `shared/agb_investment_brief.html` | Investment Brief | fest 6,00 % zzgl. MwSt., §§ 656a–656d BGB nicht anwendbar, auch für Verbraucher |
| `shared/agb_investment.html` | Investment Memo | 5,0 % netto zzgl. MwSt., nur Unternehmer (§ 14 BGB) |

## Erzeugen

```bash
python3 objekte/<objekt>/quelle/erzeuge_objekt.py
```

```bash
python3 build.py objekte/<objekt>
```

```bash
NODE_PATH=$(npm root -g) node render.mjs objekte/<objekt>
```

### Renovation Memo (22 Seiten, Muster `objekte/projects-muster-fresdorf`)

Farben und Formen laut Projects-Brand-Kit (brochure-projects/design/tokens): Titelspalte in Orange mit fast schwarzer Schrift, Karten mit 3 px oranger Oberkante und 14 px Rundung unten, Balken und Flächen in Orange.

1. Titel
2. Inhalt (I)
3. Vorwort (II, persönliche Anrede)
4. Auf einen Blick (III)
5. Eure Richtung: Wünsche, Budget, Prozess
6. Der Bestand (Bildseite)
7. Rot-Gelb-Pläne
8. Rundenvergleich
9. Angebot A
10. Angebot B
11. Angebot C
12. Kostenvergleich
13. Kostenverlauf
14. Bereinigter Vergleich
15. Entscheidungsmatrix
16. Zahlungspläne
17. Klärung vor der Unterschrift
18. Einschätzung
19. Kontakt
20. Über GRENFORD
21. Transparenz im Detail
22. AGB (`shared/agb_projects.html`)
