# Erzeugt objekt.json für das Investment Memo MonteSana (GI26-002).
# Inhalte: Verkäuferunterlagen und GRENFORD-Berechnungen laut Investment Memo Stand 11.11.2026.
import json, os, copy
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')
L0, R0, LW, RW = 51, 482, 380, 374     # zwei Spalten
FULL = 805
GEO = "quelle/geo/region.geojson"

meta = {"titel": "GRENFORD Investment Memo – MonteSana", "fusszeile": "GRENFORD INVESTMENTS / MONTESANA · INVESTMENT MEMO · STRENG VERTRAULICH (C3)",
        "ausgabe": "GRENFORD_Investment_Memo_MonteSana_GI26-002.pdf", "redaktionsstand": "19.11.2026", "agb_stand": "19.11.2026",
        "bereich": "investment", "typo": "sans", "dokument": "Investment Memo"}

S = []
S.append({"modul": "titel", "id": "titel", "bild": "vis-luft.png", "bild_pos": "center 45%",
  "dachzeile": "Investment Memo · Asset Deal",
  "vertraulich": ["Off-Market · nur für professionelle Investoren", "Streng vertraulich (C3)"],
  "titel": ["MONTESANA"], "untertitel": ["Serviced Living", "und Coworking"],
  "kurz": ["Genehmigtes Mixed-Use-Ensemble", "92 Apartments, vier Profit-Center", "20 km zur Schweizer Grenze"],
  "adresse": ["Dr.-Bettinger-Weg 1, 3, 5", "79862 Höchenschwand"],
  "kennzahlen": [["92", "Serviced Apartments"], ["5,30 Mio. €", "Kaufpreis Early-Commit"], ["13,9-fach", "Faktor Eigentümerertrag"], ["23,1 %", "IRR 10 Jahre"]],
  "hinweis": "Visualisierung: Projektgesellschaft · Stand 11.11.2026"})

S.append({"modul": "inhalt", "id": "inhalt", "bereich": "vor", "bild": "bestand-luft.png", "bild_pos": "30% center",
  "claim": ["Ein Standort,", "ein Angebot"], "marke": "MonteSana · GI26-002",
  "text": ["Lage, Zahlen und Konzept", "der Investmentchance im Überblick"], "adresse": ["Dr.-Bettinger-Weg 1, 3, 5", "79862 Höchenschwand"],
  "kapitel": [
    {"titel": "Vorwort und Hard Facts", "sub": "Einordnung, Kaufpreis, Rendite und Wert", "seiten": ["vorwort", "fakten"]},
    {"titel": "Standort und Grenzraum", "sub": "Höchenschwand, Erreichbarkeit, Schweizer Arbeitsmarkt", "seiten": ["standort", "grenzraum"]},
    {"titel": "Angebot und Asset", "sub": "Early-Commit, Zahlungsstruktur, Objekt", "seiten": ["angebot", "asset"]},
    {"titel": "GRENFORD Research", "sub": "Wettbewerb, Mieten und Zielgruppen im 50-km-Radius", "seiten": ["wettbewerb", "zielgruppen"]},
    {"titel": "Konzept, Nutzung und Pläne", "sub": "Vier Profit-Center, Ansichten, Grundrisse", "seiten": ["vision", "grundrisse"]},
    {"titel": "Wertschöpfung, Zeitplan und Kosten", "sub": "Investition, Meilensteine, Bauzeitplan, Kostenbasis", "seiten": ["wert", "kosten"]},
    {"titel": "10-Jahres-Investorenrechnung", "sub": "Cashflow, Szenarien, Sensitivität, DCF", "seiten": ["cashflow", "sensitivitaet"]},
    {"titel": "Rendite für Apartment-Käufer", "sub": "Zehn Jahre aus Sicht der Einzelerwerber", "seiten": ["apartment"]},
    {"titel": "Asset Check, Machbarkeit, Value Matrix", "sub": "Recht, Planung, Technik, Betrieb, Stärken und Risiken", "seiten": ["check1", "matrix"]},
    {"titel": "Nächster Schritt, GRENFORD, Anhang", "sub": "LOI, Kontakt, Disclaimer, AGB", "seiten": ["kontakt", "agb"]}]})

S.append({"modul": "vorwort", "id": "vorwort", "bereich": "vor", "dachzeile": "MonteSana · Investment Memo",
  "titel": "Ein genehmigtes Ensemble im Grenzraum",
  "lead": "MonteSana ist ein genehmigtes Mixed-Use-Ensemble in Höchenschwand: 92 Serviced Apartments und vier Profit-Center auf 6.957 m², 20 km von der Schweizer Grenze.",
  "links": "Das Projekt: Revitalisierung des ehemaligen Kurkomplexes zu Wohnen auf Zeit, Coworking, Wellness und Medizin. Baugenehmigung 09/2023, Baufreigabe 12/2024.",
  "rechts": "Das Angebot: Asset Deal off-market inklusive Flst. 213. Listenpreis 7,0 Mio. €, Early-Commit 5,3 Mio. € bei LOI bis Ende November 2026; eine gestaffelte Zahlung ist verhandelbar.",
  "schluss": "Das Memo führt von den Hard Facts über Standort, Research und Konzept zur 10-Jahres-Rechnung und zum Asset Check. Im Basisfall ergibt sich über zehn Jahre eine IRR von 23,1 %. Für Rückfragen und den Zugang zum Datenraum stehen wir Ihnen persönlich zur Verfügung."})

S.append({"modul": "fakten", "id": "fakten", "bereich": "vor", "kopf": "Hard Facts", "zeilenhoehe": 12.9, "blockabstand": 14, "start": 356, "quelle_y": 36,
  "kennzahlen": [["5,3 Mio. €", "Kaufpreis Early-Commit"], ["13,9-fach", "Faktor Eigentümerertrag"], ["23,1 %", "IRR 10 Jahre, Basisfall"], ["1,62-fach", "Multiple auf Eigenkapital"], ["23,2 Mio. €", "Gesamtwert nach Fertigstellung"]],
  "dachzeile": "Zahlen, Daten, Fakten · Objekt-Nr. GI26-002", "titel": "Das Projekt in Kennzahlen",
  "intro": "Kaufpreis und Renditen in zwei Varianten: Early-Commit (5,3 Mio. €, LOI bis Ende November 2026) und Listenpreis (7,0 Mio. €). Alle Werte netto, vor Steuern und Finanzierung.",
  "links": [
    {"titel": "Fläche und Objekt", "zeilen": [["Grundstück Hauptareal (Flst. 220/7)", "16.219 m²"], ["Zusatzgrundstück (Flst. 213, im Paket)", "6.511 m²"],
      ["Grundstücke gesamt", "22.730 m²"], ["BGF (ca.)", "9.960 m²"], ["NGF / Wohn- und Nutzfläche", "6.957 m²"],
      ["davon Apartments (92 Einheiten)", "4.299 m²"], ["davon Gewerbe (4 Profit-Center)", "2.658 m²"]]},
    {"titel": "Baukosten", "zeilen": [["Restbudget CapEx netto", "8,66 Mio. €"], ["Planungs- und Nebenkosten (10 %)", "0,87 Mio. €"],
      ["Möblierung / FF&amp;E (Angebot Haus C)", "1,30 Mio. €"], ["Baukosten je m² BGF", "897 €"], ["Bauzeit", "04/2026 bis 10/2027"]]},
    {"titel": "Erträge und Exit", "zeilen": [["Verkaufspreis Apartments (Annahme)", "5.000 €/m² brutto"], ["Erlös Apartments netto", "18,1 Mio. €"],
      ["Eigentümerertrag Gewerbe, stabilisiert", "≈ 381 T€ p. a. ab 2029"], ["Exit-Rendite Gewerbe (Annahme)", "7,0 %"],
      ["Objektrendite Apartment-Käufer", "4,5 % (2027) bis 7,3 % (2036)"], ["Marktwert lt. Gutachten Gatti 01/2026*", "26,5 Mio. €"]]}],
  "spalten": ["Early-Commit", "Listenpreis"],
  "rechts": [
    {"titel": "Kaufpreis", "zeilen": [["Kaufpreis netto (Asset Deal)", "5,30 Mio. €", "7,00 Mio. €"], ["Kaufpreis je m² NGF", "762 €", "1.006 €"],
      ["Kaufpreis je m² BGF", "532 €", "703 €"], ["Faktor auf Eigentümerertrag 381 T€", "13,9-fach", "18,4-fach"],
      ["Kaufpreisstaffelung (indikativ)", "2,5 / 2,8 Mio. €", "–"], ["Erwerbsnebenkosten (Annahme 6,5 %)", "0,34 Mio. €", "0,46 Mio. €"],
      ["Maklercourtage (5,0 % zzgl. MwSt.)", "0,27 Mio. €", "0,35 Mio. €"]]},
    {"titel": "Rendite und Wert (Basisfall)", "zeilen": [["Gesamtinvestition netto", "17,4 Mio. €", "19,2 Mio. €"], ["Gesamtwert nach Fertigstellung", "23,2 Mio. €", "23,2 Mio. €"],
      ["IRR 10 Jahre (vor Steuern)", "23,1 %", "14,1 %"], ["Multiple auf Eigenkapital", "1,62-fach", "1,46-fach"],
      ["Überschuss nach Wiederverkauf", "10,3 Mio. €", "8,5 Mio. €"], ["Barwert DCF (10 % Diskontsatz)", "3,7 Mio. €", "1,6 Mio. €"],
      ["Spitzenbedarf Kapital", "8,4 Mio. €", "10,2 Mio. €"]]}],
  "quelle": ["Quelle: Verkäuferunterlagen und GRENFORD-Berechnung. Renditen vor Steuern und ohne Fremdfinanzierung, indikativ. * Laut Entwicklungsprognose des Verkäufers (07/2026); Bezugszeitpunkt im Gutachten zu bestätigen."]})

# 1 Standort (Bildseite)
S.append({"modul": "bildseite", "id": "standort", "stil": "voll", "kopf": "Standort", "bild": "bestand-luft.png", "bild_pos": "center 40%",
  "dachzeile": "Höchenschwand · Südschwarzwald", "titel": ["Kurort im", "Südschwarzwald"],
  "text": "Höchenschwand ist heilklimatischer Kurort auf dem Hochplateau des Südschwarzwalds. Die Schweizer Grenze bei Waldshut liegt 20 km entfernt; dahinter beginnen mit Aargau, Zürich und Basel einige der kaufkräftigsten Arbeitsmärkte Europas.",
  "kennzahlen": [["1.015 m", "Höhe über NN"], ["20 km", "zur Schweizer Grenze"], ["14.668", "Grenzgänger Kreis Waldshut"]],
  "hinweis": "Luftbild Bestand · Bildrechte Projektgesellschaft"})

# 2 Lage und Erreichbarkeit
ORTE = [{"name": "Waldshut-Tiengen", "sub": "Grenze · 20 km · 25 min", "lon": 8.215, "lat": 47.623, "dx": 8, "dy": -8},
        {"name": "Basel", "sub": "70 km · 1 h", "lon": 7.588, "lat": 47.558},
        {"name": "Zürich", "sub": "85 km · 1 h 15", "lon": 8.541, "lat": 47.377},
        {"name": "Freiburg i. Br.", "sub": "80 km · 1 h 30", "lon": 7.842, "lat": 47.999},
        {"name": "Schaffhausen", "sub": "ca. 45 km", "lon": 8.635, "lat": 47.697}]
FERN = [{"name": "Stuttgart", "sub": "190 km · 2 h 15", "lon": 9.18, "lat": 48.78}, {"name": "München", "sub": "330 km · 3 h 45", "lon": 11.58, "lat": 48.14}]
S.append({"modul": "raster", "id": "lage", "kopf": "Lage", "dachzeile": "Lage und Erreichbarkeit", "titel": "Im Dreiländerraum, abseits der Ballungszentren",
  "intro": "Basel, Zürich und Freiburg liegen in rund einer bis eineinhalb Stunden Fahrzeit, Stuttgart in gut zwei und München in knapp vier Stunden. Der Schweizer Arbeitsmarkt beginnt am Rhein, 20 Kilometer entfernt.",
  "bloecke": [
    {"typ": "karte", "x": L0, "y": 384, "w": 450, "h": 296, "geo": GEO, "bbox": [7.3, 47.28, 9.05, 48.15], "strahlen": True,
     "ziel": {"name": "MonteSana", "sub": "Höchenschwand · 1.015 m", "lon": 8.168, "lat": 47.733, "dx": -40, "dy": 18},
     "orte": ORTE, "fern": FERN,
     "laender": [{"name": "Deutschland", "lon": 8.62, "lat": 47.98}, {"name": "Schweiz", "lon": 7.95, "lat": 47.36, "farbe": "acc"}, {"name": "Frankreich", "lon": 7.33, "lat": 47.9}],
     "nachweis": "Kartendaten: Natural Earth (gemeinfrei) · Strecken und Fahrzeiten Pkw, gerundet"},
    {"typ": "tabelle", "x": 530, "y": 384, "w": 326, "titel": "Entfernungen ab MonteSana", "breiten": [118, 66, 66, 76], "zh": 25,
     "kopf": ["Ziel", "Luftlinie", "Pkw", "Fahrzeit"], "hervorheben": ["Schweizer Grenze"],
     "zeilen": [["Schweizer Grenze", "14 km", "20 km", "25 min"], ["Basel", "48 km", "70 km", "1 h"], ["Zürich", "47 km", "85 km", "1 h 15"],
                ["Freiburg i. Br.", "39 km", "80 km", "1 h 30"], ["Stuttgart", "138 km", "190 km", "2 h 15"], ["München", "257 km", "330 km", "3 h 45"]]},
    {"typ": "text", "x": 530, "y": "folgt", "abstand": 20, "w": 326, "box": True, "titel": "Einordnung", "h": 0,
     "absaetze": ["Ruhe auf dem Hochplateau, der Grenzraum vor der Tür und Anschluss an drei Metropolregionen. Die Lage verbindet Erholungsqualität mit beruflicher Nachfrage aus der Schweiz; Stuttgart und München erreichen Gäste und Eigentümer in einer Tagesreise."]}],
  "quelle": "Quelle: Luftlinie GRENFORD-Berechnung aus Koordinaten (Höchenschwand 47,73 N / 8,18 E). Pkw-Strecken und -Zeiten sind gerundete Richtwerte ohne Verkehr."})

# 3 Grenzraum
S.append({"modul": "raster", "id": "grenzraum", "kopf": "Standort", "dachzeile": "Deutsch-schweizer Grenze", "titel": "Schwarzwald und Schweizer Arbeitsmarkt",
  "intro": "14.668 Grenzgänger leben im Landkreis Waldshut und arbeiten in der Schweiz. Schweizer Einkommen treffen auf deutsche Lebenshaltungskosten; daraus entsteht Nachfrage nach Wohnen auf Zeit und Arbeitsplätzen im Grenzraum.",
  "bloecke": [
    {"typ": "karte", "x": L0, "y": 384, "w": 450, "h": 296, "geo": GEO, "bbox": [7.3, 47.2, 9.05, 48.3], "ringe": [20, 30, 60],
     "ziel": {"name": "MonteSana", "sub": "Heilklimatischer Kurort · 1.015 m", "lon": 8.168, "lat": 47.733, "dx": 12, "dy": 12},
     "orte": [{"name": "Basel", "lon": 7.588, "lat": 47.558}, {"name": "Zürich", "lon": 8.541, "lat": 47.377}, {"name": "Feldberg", "sub": "ca. 30 km", "lon": 8.004, "lat": 47.874, "align": "right"},
              {"name": "Schaffhausen", "lon": 8.635, "lat": 47.697}, {"name": "Kanton Aargau", "lon": 8.1, "lat": 47.42}],
     "laender": [{"name": "Deutschland", "lon": 8.55, "lat": 48.12}, {"name": "Schweiz", "lon": 7.75, "lat": 47.3, "farbe": "acc"}],
     "nachweis": "Kartendaten: Natural Earth (gemeinfrei) · Radien 20, 30 und 60 km um MonteSana"},
    {"typ": "balken", "x": 530, "y": 384, "w": 326, "titel": "Grenzgänger Kreis Waldshut nach Kanton (2024)", "lw": 84, "vw": 50, "abstand": 25,
     "items": [["Aargau", 7249, "7.249", "h"], ["Zürich", 3419, "3.419"], ["Schaffhausen", 1338, "1.338"], ["Übrige", 2662, "2.662"]]},
    {"typ": "kv", "x": 530, "y": "folgt", "abstand": 10, "w": 326, "kw": 92, "titel": "Nachfragetreiber", "bis": 88, "schrift": 8.6,
     "zeilen": [["Kaufkraft", "Schweizer Einkommen bei deutschen Lebenshaltungskosten."],
                ["Zielgruppen", "Grenzgänger im Wochenaufenthalt, Fachkräfte und Expats im Corporate Housing, Schweizer Kurzurlauber."],
                ["Kurort", "Ganzjahresnachfrage durch Wandern, Wellness, Reha und Wintersport."],
                ["Coworking", "Arbeitsplätze zwischen Zürich, Basel und Aargau in 20 bis 55 Minuten."]]}],
  "quelle": "Quelle: Grenzgängerzentrum (grenzgaengerzentrum.de) nach Bundesamt für Statistik, Zahlen 2024; Exposé Teil A; Investment-Teaser. Zahlen nicht von GRENFORD verifiziert."})

# 4 Angebot
S.append({"modul": "raster", "id": "angebot", "kopf": "Das Angebot", "dachzeile": "Preis und Zahlungsstruktur", "titel": "Early-Commit deutlich unter Listenpreis",
  "bloecke": [
    {"typ": "kpi", "x": L0, "y": 410, "w": 410, "h": 52, "groesse": 22, "items": [["7,0 Mio. €", "Listenpreis netto", "durch"], ["5,3 Mio. €", "Early-Commit-Preis netto"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 12, "w": 410, "schrift": 8.6,
     "absaetze": [["Vorteil gegenüber Listenpreis: 1,7 Mio. € (−24,3 %).", "Ein LOI bis Ende November 2026 ist grundsätzlich möglich; Fristen und Bedingungen sind noch abzustimmen."]]},
    {"typ": "kpi", "x": L0, "y": "folgt", "abstand": 10, "w": 410, "h": 42, "groesse": 18, "items": [
      {"wert": "2,5 Mio. €", "label": "Anzahlung", "text": "Mögliche Anzahlung bei notariellem Kaufvertragsabschluss"},
      {"wert": "2,8 Mio. €", "label": "Restkaufpreis", "stil": "hell", "text": "Verbleibender Kaufpreis, zahlbar gemäß individuell vereinbartem Zahlungsplan"}]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 10, "w": 410, "schrift": 8.4,
     "absaetze": ["Der Verkäufer ist grundsätzlich bereit, eine gestaffelte Kaufpreiszahlung zu prüfen. Die Zahlungsstruktur kann abhängig vom Projektfortschritt, dem Nutzungskonzept und der Exit-Strategie des Investors individuell vereinbart werden. Anzahl und Fälligkeit der Teilzahlungen, der späteste Zahlungstermin sowie die erforderlichen Sicherheiten sind Gegenstand der Vertragsverhandlungen."]},
    {"typ": "schritte", "x": L0, "y": "folgt", "abstand": 4, "w": 424,
     "items": [["01 · November 2026", "LOI", "Abstimmung der Transaktions­bedingungen"], ["02 · Kaufvertrag", "Beurkundung", "Notarielle Beurkundung und vereinbarte Anzahlung"], ["03 · Fortschritt / Exit", "Weitere Zahlungen", "Nach vertraglich festgelegten Fälligkeiten und Sicherheiten"]]},
    {"typ": "kv", "x": 500, "y": 410, "w": 356, "kw": 96, "titel": "Konditionen im Überblick", "schrift": 8,
     "zeilen": [["Struktur", "Asset Deal: Grundstücke Flst. 220/7 und 213 (6.511 m²) mit Gebäudebestand, Genehmigungen und Planungsunterlagen"],
                ["Kaufpreis", "7,0 Mio. € netto; Early-Commit-Angebot 5,3 Mio. € netto"],
                ["Zahlungsoption", "Indikative Staffelung von 2,5 Mio. € und 2,8 Mio. €, vorbehaltlich individueller Vereinbarung"],
                ["Fälligkeiten", "Einmalige Restzahlung oder mehrere projektfortschrittsabhängige Teilzahlungen möglich; noch nicht festgelegt"],
                ["Sicherheiten", "Grundpfandrechtliche Absicherung und gegebenenfalls Teilfreigaben bei Einzelverkäufen; Ausgestaltung nach Vereinbarung"],
                ["Erwerbsneben­kosten", "Annahme GRENFORD: Grunderwerbsteuer Baden-Württemberg 5,0 % plus Notar und Grundbuch ca. 1,5 %; bei 5,3 Mio. € rund 0,34 Mio. €"],
                ["Maklercourtage", "5,0 % netto zzgl. gesetzlicher MwSt., fällig mit wirksamem notariellen Kaufvertrag"]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 10, "w": 356, "box": True, "schrift": 7.9,
     "absaetze": [["Hinweis:", "Die Kaufpreisstaffelung ist eine indikative Strukturierungsoption und kein verbindliches Finanzierungsangebot des Verkäufers. Zahlungsmodalitäten, Fälligkeiten, Laufzeit und Sicherheiten bedürfen einer individuellen Vereinbarung im notariellen Kaufvertrag."]]}],
  "quelle": ["Quelle: Angaben der Verkäuferseite (ERIKONA GmbH), Stand 11.11.2026. Erwerbsnebenkosten: Annahme GRENFORD. Zahlungsstaffelung indikativ und nicht verbindlich vereinbart."]})

# 5 Asset
S.append({"modul": "raster", "id": "asset", "kopf": "Asset", "dachzeile": "Das Objekt", "titel": "Vom Kurkomplex zum Mixed-Use-Ensemble",
  "bloecke": [
    {"typ": "bild", "x": L0, "y": 410, "w": 214, "h": 150, "bild": "bestand-luft.png", "titel": "Bestand, Luftbild"},
    {"typ": "bild", "x": 273, "y": 410, "w": 214, "h": 150, "bild": "vis-luft.png", "titel": "Planung, Visualisierung"},
    {"typ": "bild", "x": L0, "y": 232, "w": 436, "h": 150, "bild": "vis-wohnhaeuser.png", "pos": "60% center", "titel": "Ansicht Wohnhäuser, Visualisierung"},
    {"typ": "kv", "x": 520, "y": 410, "w": 336, "kw": 98, "bis": 66, "schrift": 8.8,
     "zeilen": [["Objekt", "Dr.-Bettinger-Weg 1, 3, 5 · 79862 Höchenschwand · Flst. 220/7"],
                ["Grundstück", "16.219 m² (Grundbuch Blatt 1077, Flst. 220/7); Genehmigungen nennen zusätzlich Flst. 220/9"],
                ["Zusatz­grundstück", "Flst. 213 „Kirchacker“, 6.511 m², Landwirtschaftsfläche, unerschlossen; im Paket, Nutzungsoptionen planungsrechtlich zu prüfen"],
                ["Gebäude", "Altbau 1964 (Klinik ab 1975), Anbau 2003, zwei Wohnhäuser der 1960er; Bauteile A, B, C, WH 1, WH 3; BGF ca. 9.960 m²"],
                ["Frühere Nutzung", "Kurkomplex (SilvaSana); Revitalisierung statt Neubau"],
                ["Neue Nutzung", "92 Serviced Apartments, Coworking, Fitness und Wellness mit Pool, Arzt, Physiotherapie und Kosmetik"],
                ["Stellplätze", "98 Kfz und 33 Fahrrad (Auflage der Genehmigung)"],
                ["Energie", "KfW-Effizienzhaus 40 geplant, PV auf den Dachflächen vorgesehen"],
                ["Eigentümerin", "ERIKONA GmbH, Berlin, seit 2020 im Grundbuch"]]}],
  "quelle": "Quelle: Grundbuch Blatt 1077 (27.03.2025); Baugenehmigung 12.09.2023; Exposé 12/2025. Visualisierungen und Luftbild: Projektgesellschaft."})

# 6 Wettbewerb
S.append({"modul": "raster", "id": "wettbewerb", "kopf": "GRENFORD Research", "dachzeile": "Markt und Wettbewerb", "titel": "Viele Einzelangebote, kein Gesamtkonzept",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 530, "titel": "Angebote im 50-km-Radius nach Leistungsbaustein", "breiten": [130, 118, 134, 37, 37, 37, 37], "links": [0, 1, 2], "zh": 21,
     "kopf": ["Anbieter", "Standort", "Angebot", "Serv.", "Cow.", "Well.", "Med."], "hervorheben": ["MonteSana"],
     "zeilen": [["MonteSana", "Höchenschwand", "92 Apts., 4 Profit-Center", "●", "●", "●", "●"],
                ["Wellnesshotel Alpenblick", "Höchenschwand", "4*-Hotel, 37 Zi., 1.000 m² Spa", "–", "–", "●", "–"],
                ["Stuub Aparthotel", "Schluchsee, ca. 20 km", "11 Apartments, 30–85 m²", "●", "–", "–", "–"],
                ["Ferienwohnungen", "Höchenschwand und Umgebung", "ca. 82 Unterkünfte", "●", "–", "–", "–"],
                ["FridoSpace, KD.Haus", "Waldshut, ca. 25 km", "Coworking (auf Anfrage)", "–", "●", "–", "–"],
                ["Heinz Schwitter", "Böbikon CH, ca. 30 km", "Coworking ab 280 CHF/Monat", "–", "●", "–", "–"],
                ["Office LAB, 1905 B. Center", "Baden (AG), ca. 45 km", "Coworking, Business Center", "–", "●", "–", "–"]]},
    {"typ": "spanne", "x": L0, "y": "folgt", "abstand": 22, "w": 530, "lw": 200, "titel": "Preis je Nacht im Vergleich", "achse": [50, 175, 25], "abstand": 23,
     "items": [["Ferienwohnungen Höchenschwand (Holidu)", 52, 110, "52–110 €"], ["Ferienhäuser Höchenschwand, Ø", 145, 145, "145 €"],
               ["Stuub Schluchsee, Studio bis Maisonette", 75, 149, "75–149 €"], ["MonteSana Planannahme, Ø Erlös", 102, 110, "102–110 €", "h"]]},
    {"typ": "dunkel", "x": 612, "y": 410, "w": 244, "h": 214, "titel": "Wettbewerb im Radius", "abstand": 56,
     "werte": [["7", "Anbieter mit Teilangebot", 26], ["1", "Haus mit allen vier Bausteinen", 26]]},
    {"typ": "text", "x": 612, "y": "folgt", "abstand": 14, "w": 244, "box": True, "titel": "Einordnung", "schrift": 8.6,
     "absaetze": ["Kein weiteres Objekt im Radius bündelt Serviced Living, Coworking, Wellness und Medizin. Die Planannahme liegt am oberen Ende der Ferienwohnungsspanne und verlangt ein klares Qualitätsprofil."]}],
  "quelle": "Quelle: GRENFORD Research auf Basis öffentlicher Quellen (Holidu 29.10.2026, TUI/Hotelspecials, workin.space, Hotelinformationen), Stand 30.10.2026. Entfernungen geschätzt; die Übersicht ist nicht abschließend."})

# 7 Mieten Wohnen
S.append({"modul": "raster", "id": "mieten-wohnen", "kopf": "GRENFORD Research", "dachzeile": "Mieten Wohnen", "titel": "Günstiger Standort, starker Grenzraum",
  "bloecke": [
    {"typ": "balken", "x": L0, "y": 410, "w": 410, "titel": "Angebotsmieten kalt in €/m² und Monat", "lw": 140, "vw": 60, "bis": 66, "max": 20,
     "items": [["Referenz Basel (Stadt)", 20, "ca. 20 €", "r"], ["Waldshut-Tiengen", 14.81, "14,81 €"], ["Todtmoos", 13.08, "13,08 €"], ["Rheinfelden (Baden)", 13.04, "13,04 €"],
               ["Laufenburg (Baden)", 12.97, "12,97 €"], ["Bad Säckingen", 12.38, "12,38 €"], ["Landkreis Waldshut Ø", 12.34, "12,34 €"], ["St. Blasien", 11.39, "11,39 €"],
               ["Höchenschwand", 10.82, "10,82 €", "h"], ["Bonndorf", 10.33, "10,33 €"]]},
    {"typ": "tabelle", "x": 500, "y": 410, "w": 356, "titel": "Wohnen auf Zeit, Waldshut-Tiengen", "breiten": [206, 86, 64], "kopf": ["Angebot", "Miete/Monat", "€/m²"], "zh": 20,
     "zeilen": [["1,5 Zimmer, 35 m², möbliert", "1.750 €", "50"], ["1,5 Zimmer, 35 m², möbliert", "1.500 €", "43"], ["1 Zimmer, 40 m², möbliert", "1.250 €", "31"],
                ["2 Zimmer, 50 m², möbliert", "1.500 €", "30"], ["1 Zimmer, 55 m², Kaiserstraße", "2.050 €", "37"], ["2 Zimmer, 55 m²", "2.150 €", "39"]]},
    {"typ": "kpi", "x": 500, "y": "folgt", "abstand": 18, "w": 356, "hell": True, "groesse": 18, "gap": 16,
     "items": [["38 €/m²", "Median möbliert"], ["10,82 €/m²", "Höchenschwand kalt"], ["35–52 €/m²", "Planerlös brutto"]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 6, "w": 356, "box": True, "titel": "Einordnung", "schrift": 8.4,
     "absaetze": ["Höchenschwand liegt rund 27 % unter Waldshut-Tiengen. Der Planerlös von MonteSana (brutto 35 € in 2027 bis 52 € in 2031 je m² und Monat) liegt im Band möblierter Kleinapartments; Erlös und Miete sind nur eingeschränkt vergleichbar. Kanton Aargau: Ø rund 24 CHF/m² und Monat."]}],
  "quelle": "Quelle: GRENFORD Research: mietpreise.info (Angebotsmieten, Stände 08/2025 bis 10/2026, kleine Stichproben, Höchenschwand 13 Angebote), immoportal.com, immosuchmaschine.de (8 Angebote), realadvisor.ch (10/2026), BPD Immobilienentwicklung, Kurzpaper 04/2026 (Basel nach empirica). Angebots-, keine Bestandsmieten."})

# 8 Mieten Gewerbe
S.append({"modul": "raster", "id": "mieten-gewerbe", "kopf": "GRENFORD Research", "dachzeile": "Mieten Gewerbe", "titel": "Die Gewerbemieten tragen den Planansatz",
  "bloecke": [
    {"typ": "balken", "x": L0, "y": 410, "w": 410, "titel": "Büro: Angebotsmieten Waldshut-Tiengen, €/m² und Monat", "lw": 160, "vw": 56, "abstand": 26, "max": 19,
     "items": [["Waldshut, 178 m², 3. OG", 9.00, "9,00 €"], ["Gewerbepark Hochrhein, 123 m²", 11.00, "11,00 €"], ["Innenstadt, 89 m², 1. OG", 13.03, "13,03 €"],
               ["Waldshut Bahnhof, 140 m²", 14.29, "14,29 €"], ["Kaiserstraße, 95 m²", 18.95, "18,95 €"], ["Referenz HWK: Büro kleine Orte", 8.00, "8,00 €", "r"],
               ["MonteSana: Eigentümerertrag je m²", 11.9, "≈ 11,9 €", "h"]]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 14, "w": 410, "titel": "Schweiz (Aargau), Inserate", "breiten": [290, 120], "kopf": ["Objekt", "CHF/m² und Jahr"], "bis": 66,
     "zeilen": [["Spreitenbach, Gewerbe", "115"], ["Würenlingen, Gewerbe", "150"], ["Dättwil (Baden), Büro 50 m²", "179"]]},
    {"typ": "tabelle", "x": 500, "y": 410, "w": 356, "titel": "Coworking und Büro-Services", "breiten": [220, 136], "kopf": ["Anbieter", "Preis"], "zh": 20,
     "zeilen": [["Heinz Schwitter, Böbikon (Zurzach)", "ab 280 CHF/Monat"], ["Tageskarte, günstigste Spaces der Region", "ab 15 CHF"], ["Kuia Office, Spreitenbach: Einzelbüro", "ab 1.130 CHF/Monat"],
                ["FridoSpace, KD.Haus (Waldshut)", "auf Anfrage"], ["Lörrach / Weil am Rhein (&gt; 50 km)", "220 bis 289 €/Monat"]]},
    {"typ": "kpi", "x": 500, "y": "folgt", "abstand": 18, "w": 356, "hell": True, "groesse": 18, "gap": 16,
     "items": [["≈ 11,9 €/m²", "Eigentümerertrag"], ["9–19 €/m²", "Büro vor Ort"], ["≈ 50 €/m²", "Coworking-Umsatz"]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 6, "w": 356, "box": True, "titel": "Einordnung", "schrift": 8.4,
     "absaetze": ["Der stabilisierte Eigentümerertrag von 381 T€ entspricht über 2.658 m² rund 11,9 €/m² und Monat und liegt im Rahmen der Büro- und Gewerbemieten vor Ort. Der geplante Coworking-Umsatz (750 T€ im Jahr 4) liegt mit rund 50 €/m² darüber, trägt aber Personal- und Betriebskosten."]}],
  "quelle": "Quelle: GRENFORD Research: immobilo.de (Waldshut-Tiengen, 30.10.2026, Einzelinserate), HWK Freiburg Gewerbemietspiegel 2021/22 (Büro kleinere Orte, Median 8,00 €, Spanne 5,75 bis 11,63 €), immobilier.ch (Aargau), workin.space, Verkäuferunterlagen (Ertragsprognose). Angebotsmieten, kleine Stichproben."})

# 9 Zielgruppen
S.append({"modul": "raster", "id": "zielgruppen", "kopf": "GRENFORD Research", "dachzeile": "Zielgruppen · Potenzialmatrix", "titel": "Drei Nachfragecluster tragen das Konzept",
  "bloecke": [
    {"typ": "matrix", "x": L0, "y": 410, "w": 480, "h": 334, "schrift": 10,
     "spalten_titel": ["Wohnen auf Zeit", "Arbeiten und Gesundheit"], "zeilen_titel": ["Beruflich, Grenzraum", "Freizeit, Erholung"],
     "zellen": [
      {"titel": "Grenzgänger und Corporate Housing", "tag": "Top-Potenzial", "akzent": True, "punkte": ["Wochenaufenthalt, Fachkräfte, Projekteinsätze. Kaufkraft und planbare Aufenthaltsdauer."]},
      {"titel": "Remote Worker und Workation", "tag": "Gut", "punkte": ["Coworking und Business-Lounge, Mietbeginn 04/2027. Wiederkehrende Nutzer."]},
      {"titel": "Kurzurlauber und Wellnessgäste", "tag": "Gut", "punkte": ["Schweizer Gäste; Ganzjahresnachfrage durch Wandern, Wellness und Wintersport."]},
      {"titel": "Prävention, Physio und Praxis", "tag": "Ergänzung", "punkte": ["Frequenzbringer für das Haus; Arztpraxis per Direktmiete."]}]},
    {"typ": "text", "x": 566, "y": 410, "w": 290, "titel": "Zielgruppenstrategie", "schrift": 8.8,
     "absaetze": ["MonteSana adressiert Nachfrage, die Grenzraum und Kurortstatus tragen: 14.668 Grenzgänger im Kreis Waldshut, Fachkräfte im Corporate Housing, Remote Worker und Gäste aus der Schweiz.",
                  ["Marktlogik:", "Möbliertes Wohnen auf Zeit erzielt in Waldshut-Tiengen 30 bis 50 €/m², unmöbliert 10,8 bis 14,8 €/m². Die Planerlöse liegen im Band des möblierten Segments."]]},
    {"typ": "tabelle", "x": 566, "y": "folgt", "abstand": 16, "w": 290, "titel": "Ergebnis auf einen Blick", "breiten": [86, 204], "links": [0, 1], "tags": [0], "bis": 66, "schrift": 8.4,
     "kopf": ["Priorität", "Segment und Bewertung"],
     "zeilen": [["Top-Potenzial", "Grenzgänger und Corporate Housing: höchste Zahlungsbereitschaft"],
                ["Gut", "Remote Worker und Workation: Auslastung der Coworking-Flächen"],
                ["Ergänzung", "Erholungs- und Gesundheitsgäste: Frequenz und Saisonspitzen"]]}],
  "quelle": "Quelle: Einschätzung GRENFORD auf Basis von GRENFORD Research (Seiten {seite:wettbewerb} bis {seite:mieten-gewerbe}), Grenzgängerzentrum/BFS und Verkäuferunterlagen. Die Clusterbewertung ist eine Annahme und keine gemessene Nachfrage."})

# 10 Vision (Bildseite)
S.append({"modul": "bildseite", "id": "vision", "stil": "voll", "kopf": "Konzept", "bild": "vis-luft.png", "bild_pos": "center 60%",
  "dachzeile": "Die Vision", "titel": ["Wohnen, Arbeiten", "und Gesundheit", "unter einem Dach"],
  "text": "92 möblierte Apartments, eine Business-Lounge mit Coworking, Fitness und Wellness mit Pool und Sauna, eine Arztpraxis sowie Physiotherapie und Kosmetik. Umsetzung in drei Bauabschnitten; die ersten Flächen gehen 2027 in Betrieb.",
  "kennzahlen": [["92", "Möblierte Apartments"], ["2.658 m²", "Profit-Center"], ["2027", "Beginn Betrieb"]],
  "hinweis": "Visualisierung: Projektgesellschaft"})

# 11 Nutzung
S.append({"modul": "raster", "id": "nutzung", "kopf": "Nutzungskonzept", "dachzeile": "Wohnen, Arbeiten, Gesundheit", "titel": "Ein Haus, vier Ertragssäulen",
  "bloecke": [
    {"typ": "donut", "x": L0, "y": 410, "r": 76, "ring": 22, "lw": 170, "titel": "Nutzfläche nach Nutzung", "mitte": ["6.957 m²", "Nutzfläche"], "mitte_groesse": 17,
     "items": [["Apartments", 4299, "navy"], ["Coworking", 1241, "light"], ["Fitness / Wellness", 704, "mid"], ["Arztpraxis", 386, "grey"], ["Physio / Kosmetik", 327, "mist"]]},
    {"typ": "bild", "x": L0, "y": 214, "w": 420, "h": 132, "bild": "vis-wohnhaeuser.png", "pos": "35% center", "titel": "Ansicht Wohnhäuser, Visualisierung"},
    {"typ": "tabelle", "x": 500, "y": 410, "w": 356, "titel": "Vier Profit-Center ergänzen 92 Apartments", "breiten": [104, 62, 190], "links": [0, 2], "kopf": ["Profit-Center", "Fläche", "Konzept"], "zh": 21,
     "zeilen": [["Coworking", "1.241 m²", "Arbeitsplätze, Business-Lounge, Workation"], ["Fitness / Wellness", "704 m²", "Studio, Pool, Sauna"],
                ["Arztpraxis", "386 m²", "Direktvermietung an externen Mieter"], ["Physio / Kosmetik", "327 m²", "Therapie, Beauty, Prävention"]]},
    {"typ": "tabelle", "x": 500, "y": "folgt", "abstand": 20, "w": 356, "titel": "Apartment-Mix", "breiten": [128, 76, 76, 76], "kopf": ["Typ", "Anzahl", "Ø m²", "m² gesamt"], "hervorheben": ["Summe"], "zh": 21,
     "zeilen": [["1-Zimmer", "26", "25", "659"], ["2-Zimmer", "43", "46", "1.978"], ["3-/4-Zimmer", "23", "72", "1.652"], ["Summe", "92", "47", "4.289"]]},
    {"typ": "kpi", "x": 500, "y": "folgt", "abstand": 22, "w": 356, "hell": True, "groesse": 19, "gap": 16,
     "items": [["62 %", "Anteil Apartments"], ["38 %", "Anteil Gewerbe"], ["Ø 47 m²", "je Apartment"]]}],
  "quelle": "Quelle: Apartments.xlsx; Ertragsprognosen MonteSana (Flächen Gewerbe); Investment-Teaser. Wohnfläche laut Ertragsprognose 4.299 m² (Apartments.xlsx: 4.289 m²)."})

# 12 Ansichten
S.append({"modul": "raster", "id": "ansichten", "kopf": "Pläne", "dachzeile": "Architektur · Ansichten", "titel": "Fassade und Dach im genehmigten Entwurf",
  "bloecke": [
    {"typ": "bild", "x": L0, "y": 410, "w": 590, "h": 168, "bild": "plan-ansicht-sued.png", "weiss": True, "contain": True, "pad": 8, "titel": "Ansicht von Süden · Bauteil Altbau und Bauteil B"},
    {"typ": "bild", "x": L0, "y": 216, "w": 590, "h": 142, "bild": "plan-ansicht-nord.png", "weiss": True, "contain": True, "pad": 8, "titel": "Ansicht von Norden · Bauteil B und Altbau"},
    {"typ": "text", "x": 666, "y": 410, "w": 190, "titel": "Architektur", "schrift": 8.8,
     "absaetze": ["Genehmigte Planung für Altbau und Bauteil B. Rot markiert sind die Änderungen des Nachtrags, unter anderem Terrassen im Dachbereich."]},
    {"typ": "kv", "x": 666, "y": "folgt", "abstand": 14, "w": 190, "kw": 70, "schrift": 8.2, "titel": "Planunterlagen", "bis": 66,
     "zeilen": [["Verfasser", "Klaudia Keilholz Architekten GmbH, Berlin"], ["Planstand", "Bauantragsänderung 10.09.2024, M 1:100"],
                ["Genehmigung", "Baugenehmigung 12.09.2023"], ["Gebäude", "Bauteile A, B, C; WH 1 und WH 3"], ["Hinweis", "Pläne tragen den Projektnamen „Silvasana Höchenschwand“"]]}],
  "quelle": "Quelle: Genehmigungsplanung Klaudia Keilholz Architekten GmbH, Nachtrag zur Baugenehmigung (Planstand 10.09.2024); Ausschnitte, Original im Datenraum."})

# 13 Grundrisse
S.append({"modul": "raster", "id": "grundrisse", "kopf": "Pläne", "dachzeile": "Architektur · Grundrisse", "titel": "Regelgeschoss und Dachapartments",
  "bloecke": [
    {"typ": "bild", "x": L0, "y": 410, "w": 590, "h": 172, "bild": "plan-og1.png", "weiss": True, "contain": True, "pad": 6, "titel": "1. Obergeschoss · 1- bis 2-Raum- und 2- bis 3-Raum-Apartments"},
    {"typ": "bild", "x": L0, "y": 212, "w": 590, "h": 138, "bild": "plan-dg.png", "weiss": True, "contain": True, "pad": 6, "titel": "Dachgeschoss · große Apartments mit Terrassen"},
    {"typ": "text", "x": 666, "y": 410, "w": 190, "titel": "Grundrisse", "schrift": 8.8,
     "absaetze": ["Das Regelgeschoss gliedert sich in 1- bis 2-Raum- und 2- bis 3-Raum-Apartments mit Balkonen, bei Bedarf kombinierbar. Im Dachgeschoss liegen große Apartments mit Terrassen."]},
    {"typ": "kv", "x": 666, "y": "folgt", "abstand": 14, "w": 190, "kw": 70, "schrift": 8.2, "titel": "Flächen", "bis": 66,
     "zeilen": [["Wohnfläche", "4.299 m² in 92 Apartments"], ["Gewerbe", "2.658 m² in vier Profit-Centern"], ["Typen", "26 × 1-Zi., 43 × 2-Zi., 23 × 3-/4-Zi."], ["Detail", "Nutzflächen je Apartment und Geschoss im Datenraum"]]}],
  "quelle": "Quelle: Genehmigungsplanung Klaudia Keilholz Architekten GmbH, Nachtrag zur Baugenehmigung (Planstand 10.09.2024); Nutzflächenberechnungen Apartments (14.07.2025). Ausschnitte, Original im Datenraum."})

# 14 Wertschöpfung
S.append({"modul": "raster", "id": "wert", "kopf": "Wertschöpfung", "dachzeile": "Investition und Wert", "titel": "Der Kaufpreis ist der größte Hebel",
  "bloecke": [
    {"typ": "hstack", "x": L0, "y": 410, "w": 560, "lw": 156, "sw": 70, "max": 23.2, "bh": 26, "abstand": 44, "titel": "Von der Investition zum Gesamtwert, Mio. € netto",
     "zeilen": [["Investition bei Listenpreis", [[7.0, "grey", "Kauf 7,0"], [8.66, "navy", "CapEx 8,66"], [3.53, "light", "NK, FF&amp;E 3,53"]], "19,2 Mio. €"],
                ["Investition bei Early-Commit", [[5.3, "grey", "Kauf 5,3"], [8.66, "navy", "CapEx 8,66"], [3.41, "light", "NK, FF&amp;E 3,41"]], "17,4 Mio. €"],
                ["Gesamtwert nach Fertigstellung", [[18.06, "mid", "Apartments netto 18,06"], [5.17, "light", "Gewerbe 5,17"]], "23,2 Mio. €"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 8, "w": 560, "schrift": 8.6,
     "absaetze": [["Wert Gewerbe:", "Eigentümerertrag 381 T€ abzüglich 5 % Eigentümerkosten, kapitalisiert mit 7,0 % (Annahme GRENFORD)."],
                  ["Apartments:", "4.299 m² × 5.000 €/m² brutto, geteilt durch 1,19."],
                  ["NK, FF&amp;E:", "Planungs- und Nebenkosten (0,87), Vertriebsprovision (0,90), Möblierung (1,30) und Erwerbsnebenkosten (0,46 bzw. 0,34)."],
                  ["Externe Werte:", "Makler-Einschätzung Gesamtobjekt 8,0 bis 8,2 Mio. € (02/2025); Marktwertgutachten Gatti 26,5 Mio. € (01/2026, laut Verkäufer). Der Ansatz von 23,2 Mio. € ist konservativ."]]},
    {"typ": "kpi", "x": L0, "y": 150, "w": 560, "hell": True, "groesse": 24, "gap": 22,
     "items": [["17,4 Mio. €", "Gesamtinvestition Early-Commit"], ["23,2 Mio. €", "Gesamtwert nach Fertigstellung"], ["5,9 Mio. €", "Wertüberschuss, Basisfall"]]},
    {"typ": "dunkel", "x": 640, "y": 410, "w": 216, "h": 344, "titel": "Wertüberschuss bei Early-Commit", "abstand": 86,
     "werte": [["+5,9 Mio. €", "Gesamtwert abzüglich Investition", 32], ["+34 %", "auf 17,4 Mio. € Gesamtinvestition", 32]],
     "text": "Bei 7,0 Mio. € Kaufpreis: +4,1 Mio. € (+21 %). Rechnung GRENFORD, indikativ, vor Finanzierung und Steuern."}],
  "quelle": "Quelle: Kostenberechnung und Bauzeitplan (Restbudget 8,66 Mio. € netto); Ertragsprognosen; Sales Plan; Annahmen GRENFORD (Nebenkosten 10 % auf CapEx, FF&amp;E 1,3 Mio. €, Provision 5 %, Erwerbsnebenkosten 6,5 %)."})

# 15 Meilensteine
S.append({"modul": "raster", "id": "meilensteine", "kopf": "Zeitstrahl", "dachzeile": "Meilensteine", "titel": "Die Genehmigungsphase ist abgeschlossen",
  "intro": "Bebauungsplan, Baugenehmigung, Gesamtbaufreigabe und Abgeschlossenheitsbescheinigung liegen vor. Das Genehmigungsrisiko liegt hinter dem Projekt; offen sind Umsetzung, Vermietung und Vertrieb.",
  "bloecke": [
    {"typ": "zeitstrahl", "x": 64, "y": 262, "w": 780, "von": "2023-01", "bis": "2029-12", "heute": "2026-11",
     "phasen": [["2023-01", "2026-01", "Planung und Genehmigung · abgeschlossen", "navy"], ["2026-01", "2028-01", "Bau in drei Abschnitten", "mid"], ["2028-01", "2029-12", "Hochlauf und Betrieb", "light"]],
     "punkte": [{"monat": "2023-04", "datum": "19.04.2023", "text": "Bebauungsplan in Kraft", "oben": False, "h": 40},
                {"monat": "2023-09", "datum": "12.09.2023", "text": "Baugenehmigung", "h": 66},
                {"monat": "2024-09", "datum": "20.09.2024", "text": "Bauantragsänderung", "oben": False, "h": 40},
                {"monat": "2024-12", "datum": "12/2024", "text": "Baufreigabe, Abgeschlossenheit", "h": 66},
                {"monat": "2025-12", "datum": "12/2025", "text": "Exposé, Marktauftritt", "oben": False, "h": 66},
                {"monat": "2026-04", "datum": "04/2026", "text": "Baubeginn Gebäude C", "plan": True, "h": 94},
                {"monat": "2027-04", "datum": "04/2027", "text": "Mietbeginn Coworking", "plan": True, "h": 66},
                {"monat": "2027-10", "datum": "10/2027", "text": "Außenanlagen fertig", "plan": True, "oben": False, "h": 40},
                {"monat": "2029-06", "datum": "2029", "text": "Stabilisierter Betrieb", "plan": True, "h": 66}]},
    {"typ": "kpi", "x": L0, "y": 140, "w": 805, "h": 72, "groesse": 30, "gap": 14,
     "items": [{"wert": "Erteilt", "label": "Baurecht und Baufreigabe"}, {"wert": "2 Jahre", "label": "Genehmigung bis Baubeginn"},
               {"wert": "12 Monate", "label": "Bauzeit Gebäude C", "stil": "hell"}, {"wert": "2029", "label": "Stabilisierter Betrieb", "stil": "hell"}]}],
  "quelle": "Quelle: Baugenehmigung 12.09.2023; Änderungsgenehmigung und Gesamtbaufreigabe 12.12.2024; Abgeschlossenheitsbescheinigung 23.12.2024; Bauzeitplan; Ertragsprognosen; Angebot Verkäufer. Ausgefüllte Punkte: erreicht; offene Punkte: Plan."})

# 16 Bauzeitplan
S.append({"modul": "raster", "id": "bauzeit", "kopf": "Bauablauf", "dachzeile": "Bauzeitplan", "titel": "Fertigstellung in drei Bauabschnitten",
  "bloecke": [
    {"typ": "gantt", "x": L0, "y": 410, "w": FULL, "lw": 240, "zh": 31, "von": "2026-04", "bis": "2027-12", "heute": "2026-11",
     "zeilen": [["Gebäude C: Abbruch bis TGA-Endmontage", "2026-04", "2027-03", "bau"], ["Gebäude A/B", "2026-07", "2027-08", "bau"], ["Wohnhäuser WH 1 / 3", "2026-10", "2027-10", "bau"],
                ["Außenanlagen Bauabschnitt 1", "2027-01", "2027-04", "aussen"], ["Außenanlagen Bauabschnitt 2", "2027-07", "2027-10", "aussen"],
                ["Verkauf der Apartments (Sales Plan)", "2026-06", "2027-12", "vertrieb"], ["Coworking, Mietbeginn 01.04.2027", "2027-04", "2027-12", "betrieb"],
                ["Fitness, Start 11/2027", "2027-11", "2027-12", "betrieb"], ["Physio / Kosmetik ab 10/2027", "2027-10", "2027-12", "betrieb"]],
     "legende": [["Bau", "navy"], ["Außenanlagen", "grey"], ["Vertrieb", "light"], ["Betrieb", "mid"]]}],
  "quelle": "Quelle: Bauzeitplan.xlsx (Bauplan und Mittelabfluss, Baubeginn und Bauende je Gewerk); Sales Plan; Ertragsprognosen und Entwicklungsprognosen 07/2026 (Mietbeginne). Plandaten des Verkäufers mit Baubeginn 04/2026; die Investorenrechnung unterstellt einen späteren Mittelabfluss."})

# 17 Kosten
S.append({"modul": "raster", "id": "kosten", "kopf": "Bau und Kosten", "dachzeile": "Technik und Kosten", "titel": "Kostenbasis und Mittelabfluss",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 410, "titel": "Kostenbasis", "breiten": [280, 130], "kopf": ["Kennzahl", "Wert"], "hervorheben": ["Restbudget (netto)"], "zh": 20,
     "zeilen": [["Kostenberechnung gesamt (netto)", "8,06 Mio. €"], ["Bauzeitplan aktualisiert (netto)", "8,94 Mio. €"], ["Bereits ausgeführt (Plan 04/2026)", "0,28 Mio. €"],
                ["Restbudget (netto)", "8,66 Mio. €"], ["€/m² BGF (netto, Bauzeitplan)", "897 €"]]},
    {"typ": "balken", "x": L0, "y": "folgt", "abstand": 20, "w": 410, "titel": "Anteil je Gewerk", "lw": 100, "vw": 50, "bis": 66, "bh": 11, "max": 22.3,
     "items": [["Elektro", 22.3, "22,3 %"], ["Außenanlagen", 15.1, "15,1 %"], ["Fenster/Türen", 11.2, "11,2 %"], ["Fassade/Putz", 10.6, "10,6 %"], ["Heizung", 8.0, "8,0 %"],
               ["Bodenbelag", 7.9, "7,9 %"], ["Sanitär", 7.2, "7,2 %"], ["Dach", 6.4, "6,4 %"], ["Übrige", 11.3, "11,3 %", "r"]]},
    {"typ": "saeulen", "x": 500, "y": 410, "w": 356, "h": 96, "titel": "Mittelabfluss in der Investorenrechnung, Mio. € netto", "gestapelt": True, "max": 7.9, "breite": .46,
     "kategorien": ["2026", "2027", "2028"], "summen": ["1,0", "7,9", "1,9"],
     "serien": [{"name": "CapEx", "farbe": "navy", "werte": [0.87, 6.50, 1.30]}, {"name": "Nebenkosten", "farbe": "mid", "werte": [0.09, 0.65, 0.13]}, {"name": "FF&amp;E", "farbe": "light", "werte": [0, 0.78, 0.52]}]},
    {"typ": "tabelle", "x": 500, "y": "folgt", "abstand": 14, "w": 356, "titel": "Technische Unterlagen", "breiten": [246, 110], "links": [0, 1], "tags": [1], "kopf": ["Unterlage", "Status"], "schrift": 8.2, "zh": 18,
     "zeilen": [["Kostenberechnung, Bauzeitplan, Angebote", "Gesichtet"], ["Boden- und Bausubstanzgutachten", "Angefordert"],
                ["Wertgutachten und Marktwertschätzung (Gatti)", "Im Datenraum"], ["Energieausweis (Energieberatung beauftragt)", "Angefordert"]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 10, "w": 356, "box": True, "schrift": 8,
     "absaetze": [["Bis zum Signing:", "Bausubstanzgutachten HPC mit Kostenansatz, Bodengutachten, aktueller Bautenstand und Auswertung der Wertgutachten."]]}],
  "quelle": "Quelle: Kostenberechnung Gesamt.xlsx; Bauzeitplan.xlsx; Wertgutachten Az. 202510340; Datenraum MonteSana. Anteile bezogen auf 8,06 Mio. € netto. Bauzeitplan Verkäufer: 5,2 Mio. € 2026 und 3,5 Mio. € 2027 bei Baubeginn 04/2026."})

# 18 Cashflow
S.append({"modul": "tabelle", "id": "cashflow", "kopf": "10-Jahres-Rechnung", "dachzeile": "Investorenrechnung · Basisfall · Mio. € netto", "titel": "Zehn Jahre, ein Cashflow-Bild",
  "zh": 19.0, "schrift": 8.4,
  "spalten": ["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036", "Σ"], "hervorheben": ["Netto-Cashflow", "Kumuliert"],
  "zeilen": [
    ["Kaufpreis (Modellannahme 2,5 / 2,8)", "−2,50", "−2,80", "–", "–", "–", "–", "–", "–", "–", "–", "–", "−5,30"],
    ["Erwerbsnebenkosten", "−0,34", "–", "–", "–", "–", "–", "–", "–", "–", "–", "–", "−0,34"],
    ["CapEx (Restbudget, netto)", "−0,87", "−6,50", "−1,30", "–", "–", "–", "–", "–", "–", "–", "–", "−8,66"],
    ["Planungs- und Nebenkosten 10 %", "−0,09", "−0,65", "−0,13", "–", "–", "–", "–", "–", "–", "–", "–", "−0,87"],
    ["Möblierung / FF&amp;E", "–", "−0,78", "−0,52", "–", "–", "–", "–", "–", "–", "–", "–", "−1,30"],
    ["Verkaufserlöse Apartments (netto)", "–", "6,32", "8,13", "3,61", "–", "–", "–", "–", "–", "–", "–", "18,06"],
    ["Vertriebsprovision 5 %", "–", "−0,32", "−0,41", "−0,18", "–", "–", "–", "–", "–", "–", "–", "−0,90"],
    ["Eigentümerertrag Gewerbe (nach 5 % Kosten)", "–", "0,16", "0,34", "0,36", "0,37", "0,38", "0,38", "0,39", "0,40", "0,41", "0,42", "3,60"],
    ["Exit-Wert Gewerbe (7,0 %, 2036)", "–", "–", "–", "–", "–", "–", "–", "–", "–", "–", "5,97", "5,97"],
    ["Netto-Cashflow", "−3,80", "−4,56", "6,11", "3,79", "0,37", "0,38", "0,38", "0,39", "0,40", "0,41", "6,39", "10,27"],
    ["Kumuliert", "−3,80", "−8,36", "−2,25", "1,54", "1,91", "2,29", "2,68", "3,07", "3,47", "3,88", "10,27", ""]],
  "label_breite": 214,
  "kennzahlen": [["23,1 %", "IRR 10 Jahre, Basis Early-Commit"], ["1,62-fach", "Multiple auf eingesetztes Kapital"], ["10,3 Mio. €", "Gesamtüberschuss vor Steuern"], ["8,4 Mio. €", "Spitzenbedarf Kapital, kumuliert"]],
  "hinweis": "<b style='font-weight:500;color:#24534c'>Abhängigkeit vom Zahlungsplan:</b> Das Modell unterstellt 2,5 Mio. € in 2026 und 2,8 Mio. € in 2027 (Annahme GRENFORD, keine zugesagte Verkäuferkondition). Bei Zahlung des vollen Kaufpreises von 5,3 Mio. € bei Vertragsschluss sinkt die IRR im Basisfall auf 20,6 %; Multiple, Gesamtüberschuss und Spitzenbedarf bleiben unverändert. Möblierung hochgerechnet auf 92 Einheiten (ca. 2,0 statt 1,3 Mio. €): IRR rund 20 %.",
  "quelle": ["Quelle: Berechnung GRENFORD auf Basis von Bauzeitplan (Restbudget 8,66 Mio. € netto), Sales Plan (5.000 €/m²) und Ertragsprognose (381 T€ ab 2029, +2 % p. a.). Alle Werte in Mio. €, netto, vor Steuern und Finanzierung; indikativ."]})

# 19 Szenarien
S.append({"modul": "raster", "id": "szenarien", "kopf": "10-Jahres-Rechnung", "dachzeile": "Szenarien", "titel": "Der Early-Commit hebt die Rendite deutlich",
  "bloecke": [
    {"typ": "linie", "x": L0, "y": 410, "w": 420, "h": 196, "titel": "Kumulierter Cashflow in Mio. €", "achse": [-12, 12, 4],
     "kategorien": ["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036"],
     "serien": [{"name": "Early-Commit 5,3 Mio. €", "farbe": "navy", "ende": "10,3", "dy": 5, "werte": [-3.80, -8.36, -2.25, 1.54, 1.91, 2.29, 2.68, 3.07, 3.47, 3.88, 10.27]},
                {"name": "Listenpreis 7,0 Mio. €", "farbe": "mid", "ende": "8,5", "dy": -5, "werte": "LP"}]},
    {"typ": "saeulen", "x": 520, "y": 410, "w": 336, "h": 196, "titel": "IRR über 10 Jahre nach Szenario", "max": 30,
     "kategorien": ["Vorsichtig", "Basis", "Chance"],
     "serien": [{"name": "Early-Commit", "farbe": "navy", "werte": [10.6, 23.1, 26.8], "labels": ["10,6 %", "23,1 %", "26,8 %"]},
                {"name": "Listenpreis", "farbe": "light", "werte": [6.6, 14.1, 16.5], "labels": ["6,6 %", "14,1 %", "16,5 %"]}]},
    {"typ": "kpi", "x": L0, "y": 118, "w": FULL, "h": 50, "groesse": 18, "gap": 12,
     "items": [{"wert": "2029", "label": "Break-even kumuliert, Early-Commit"}, {"wert": "2030", "label": "Break-even kumuliert, Listenpreis", "stil": "hell"},
               {"wert": "+9,0 Pp.", "label": "IRR-Vorteil im Basisfall"}, {"wert": "+1,8 Mio. €", "label": "Mehr Überschuss im Basisfall", "stil": "hell"}]}],
  "quelle": ["Quelle: Berechnung GRENFORD; Kaufpreisverteilung 2,5 / 2,8 Mio. € als Modellannahme. Vorsichtig: 4.500 €/m², Verkauf ein Jahr später, Nebenkosten 15 %, Eigentümerkosten 8 %, Exit 8,0 %.",
             "Basis: 5.000 €/m², Nebenkosten 10 %, Eigentümerkosten 5 %, Exit 7,0 %. Chance: 5.250 €/m², Exit 6,5 %. Vor Steuern, ohne Finanzierung."]})

# 20 Sensitivität
S.append({"modul": "raster", "id": "sensitivitaet", "kopf": "10-Jahres-Rechnung", "dachzeile": "Sensitivität und DCF", "titel": "Rendite und Barwert im Stresstest",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 400, "titel": "Szenarien im Vergleich, 10 Jahre", "breiten": [76, 54, 56, 48, 54, 62, 50], "hervorheben": ["Basis"], "zh": 26,
     "kopf": ["Szenario", "IRR EC", "Mult. EC", "Mio. €", "IRR LP", "Mult. LP", "Mio. €"],
     "zeilen": [["Vorsichtig", "10,6 %", "1,42-fach", "7,1", "6,6 %", "1,28-fach", "5,3"], ["Basis", "23,1 %", "1,62-fach", "10,3", "14,1 %", "1,46-fach", "8,5"], ["Chance", "26,8 %", "1,70-fach", "11,6", "16,5 %", "1,53-fach", "9,8"]]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 24, "w": 400, "titel": "DCF: Barwert (NPV) nach Diskontsatz, Mio. €", "breiten": [100, 100, 100, 100], "hervorheben": ["10 %"], "zh": 26,
     "kopf": ["Diskontsatz", "Early-Commit", "Listenpreis", "Vorteil"],
     "zeilen": [["8 %", "4,61", "2,59", "2,02"], ["10 %", "3,68", "1,62", "2,07"], ["12 %", "2,89", "0,78", "2,11"]]},
    {"typ": "tabelle", "x": 482, "y": 410, "w": 374, "titel": "IRR Early-Commit: Verkaufspreis × Exit-Rendite", "breiten": [110, 88, 88, 88], "zh": 26,
     "kopf": ["€/m² brutto", "Exit 6,5 %", "Exit 7,0 %", "Exit 8,0 %"], "heat": {"zeilen": [0, 1, 2], "spalten": [1, 2, 3]},
     "zeilen": [["4.875", "21,8 %", "21,5 %", "20,9 %"], ["5.000", "23,4 %", "23,1 %", "22,6 %"], ["5.250", "26,8 %", "26,5 %", "26,0 %"]]},
    {"typ": "tabelle", "x": 482, "y": "folgt", "abstand": 24, "w": 374, "titel": "NPV Early-Commit: Diskontsatz × Exit-Rendite, Mio. €", "breiten": [110, 88, 88, 88], "zh": 26,
     "kopf": ["Diskontsatz", "Exit 6,5 %", "Exit 7,0 %", "Exit 8,0 %"], "heat": {"zeilen": [0, 1, 2], "spalten": [1, 2, 3]},
     "zeilen": [["8 %", "4,8", "4,6", "4,3"], ["10 %", "3,9", "3,7", "3,4"], ["12 %", "3,0", "2,9", "2,6"]]},
    {"typ": "kpi", "x": L0, "y": "folgt", "abstand": 26, "w": FULL, "h": 50, "groesse": 18, "gap": 12,
     "items": [{"wert": "14,1 → 23,1 %", "label": "IRR Basisfall: Listenpreis → Early-Commit"}, {"wert": "−1,8 Mio. €", "label": "Geringerer Kapitalbedarf", "stil": "hell"},
               {"wert": "1,62 → 3,68", "label": "Barwert bei 10 %, Mio. €"}, {"wert": "≥ 20,9 %", "label": "IRR in allen Exit-Varianten", "stil": "hell"}]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 12, "w": FULL, "schrift": 8.8,
     "absaetze": [["Aussage:", "Selbst bei 4.875 €/m² Verkaufspreis und 8,0 % Exit-Rendite bleibt die IRR bei Early-Commit über 20 %. Der Kaufpreis wirkt stärker auf die Rendite als Verkaufspreis und Exit-Annahme."]]}],
  "quelle": ["Quelle: Berechnung GRENFORD; Annahmen siehe Seite {seite:szenarien}; EC = Early-Commit 5,3 Mio. €, LP = Listenpreis 7,0 Mio. €. Barwert: Jahres-Cashflows 2026 bis 2036 auf Ende 2026 diskontiert, vor Steuern, ohne Fremdfinanzierung.",
             "Fremdkapital (inkl. KfW) ist nicht enthalten. Keine Zusicherung künftiger Erträge."]})

# 21 Apartment-Käufer
S.append({"modul": "raster", "id": "apartment", "kopf": "Apartment-Käufer", "dachzeile": "Rendite für Einzelerwerber", "titel": "Zehn Jahre aus Sicht der Apartment-Käufer",
  "bloecke": [
    {"typ": "saeulen", "x": L0, "y": 410, "w": 420, "h": 210, "titel": "Apartment 55 (46,1 m²): Objektrendite auf 204.048 €", "max": 8, "legende": False,
     "kategorien": ["2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036"],
     "serien": [{"name": "Objektrendite", "werte": [4.5, 5.1, 5.5, 6.4, 6.6, 6.8, 6.9, 7.0, 7.2, 7.3],
                 "farben": ["navy"] * 5 + ["light"] * 5, "labels": ["4,5 %", "5,1 %", "5,5 %", "6,4 %", "6,6 %", "6,8 %", "6,9 %", "7,0 %", "7,2 %", "7,3 %"]}]},
    {"typ": "kpi", "x": L0, "y": 134, "w": 420, "h": 60, "groesse": 21, "gap": 12,
     "items": [{"wert": "129.234 €", "label": "Überschuss in 10 Jahren"}, {"wert": "63 %", "label": "der Anschaffungskosten", "stil": "hell"}, {"wert": "115.409 €", "label": "bei 60 % Auslastung", "stil": "hell"}]},
    {"typ": "tabelle", "x": 500, "y": 410, "w": 356, "titel": "Zahlenreihe", "breiten": [48, 72, 80, 78, 78], "bis": 104, "schrift": 8.4,
     "kopf": ["Jahr", "Auslastung", "Ø Erlös/Nacht", "Überschuss", "Kumuliert"], "hervorheben": ["2036"],
     "zeilen": [["2027", "52,2 %", "102 €", "9.194 €", "9.194 €"], ["2028", "58,2 %", "104 €", "10.452 €", "19.646 €"], ["2029", "61,8 %", "106 €", "11.312 €", "30.958 €"],
                ["2030", "69,5 %", "108 €", "12.961 €", "43.920 €"], ["2031", "71,2 %", "110 €", "13.524 €", "57.444 €"], ["2032", "71,2 %", "112 €", "13.795 €", "71.239 €"],
                ["2033", "71,2 %", "114 €", "14.071 €", "85.310 €"], ["2034", "71,2 %", "117 €", "14.352 €", "99.662 €"], ["2035", "71,2 %", "119 €", "14.639 €", "114.301 €"],
                ["2036", "71,2 %", "121 €", "14.932 €", "129.234 €"]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 12, "w": 356, "schrift": 8.2,
     "absaetze": [["Dunkel:", "Verkäufermodell 2027 bis 2031. Hell: Fortschreibung GRENFORD mit Auslastung 71,2 % und Preis +2 % p. a."]]}],
  "quelle": "Quelle: Renditeberechnung Apt. 55 (Verkäufermodell 2027–2031); Fortschreibung GRENFORD (Auslastung konstant 71,2 %, Preis +2 % p. a., Kostenquote 53 %). Objektrendite vor Finanzierung und Steuern, inkl. Umsatzsteuereffekt des Modells; indikativ."})

# 22 Asset Check 1  (geprüft gegen Datenraum, Stand 19.11.2026)
S.append({"modul": "raster", "id": "check1", "kopf": "GRENFORD Asset Check", "dachzeile": "Teil 1 von 2 · Recht und Planung", "titel": "Baurecht und Baufreigabe liegen vor",
  "bloecke": [
    {"typ": "kpi", "x": L0, "y": 410, "w": FULL, "h": 48, "groesse": 18, "gap": 12,
     "items": [{"wert": "Erteilt", "label": "Gesamtbaufreigabe 12.12.2024"}, {"wert": "17 + 1", "label": "Abweichungen und Befreiung", "stil": "hell"},
               {"wert": "Lastenfrei", "label": "Abt. II; Abt. III Löschung zum Vollzug"}, {"wert": "3 Gutachten", "label": "zur Nachreichung angefordert", "stil": "hell"}]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 18, "w": FULL, "breiten": [236, 92, 477], "links": [0, 1, 2], "tags": [1], "bis": 150, "schrift": 8.4,
     "kopf": ["Unterlage", "Status", "Ergebnis"],
     "zeilen": [["Grundbuch Blatt 1077 (27.03.2025)", "Gesichtet", "ERIKONA GmbH seit 2020; Abt. II lastenfrei; Abt. III eine Grundschuld (500 T€), Löschung zum Vollzug vorgesehen"],
                ["Baugenehmigung 12.09.2023", "Gesichtet", "Umnutzung zu Coworking, Wellness, Therapie und Apartments; 17 Abweichungen (Brandschutz) und eine Befreiung (Abstand B 500)"],
                ["Änderungsgenehmigung und Gesamtbaufreigabe 12.12.2024", "Gesichtet", "Zwei-Achs-Apartments und Dachterrassen genehmigt; Gesamtbaufreigabe erteilt; Flst. 220/9 mitgenannt, Zuordnung wird bestätigt"],
                ["Bebauungsplan „Im oberen Brühl – Nord“", "Gesichtet", "Sondergebiet „Co-Working“ (§ 11 BauNVO) seit 19.04.2023; Umwelt- und Schallgutachten ohne Einwände"],
                ["Abgeschlossenheit 23.12.2024, Teilungserklärung", "Gesichtet", "Abgeschlossenheit erteilt; Teilungserklärung im Entwurf (14.08.2025) mit Ferienvermietung der Wohnungen 1–85"],
                ["Bausubstanzuntersuchung HPC AG (2024/25)", "Angefordert", "Anlassbezogen beauftragt und abgeschlossen (Asbest, PAK, PCB); Gutachten folgt im Datenraum"],
                ["Flst. 213: Kaufvertrag vom 03.08.2026", "Angefordert", "6.511 m² Landwirtschaftsfläche, lastenfrei geschuldet; Kaufpreis 70 T€ (Verkäuferangabe); Urkunde folgt im Datenraum"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 14, "w": FULL, "box": True, "schrift": 8.4,
     "absaetze": [["Bis zum Signing:", "Bausubstanzgutachten HPC mit Kostenansatz, Bodengutachten und Brandschutzgutachten Schubert (04.09.2023) zum Datenraum; Löschungsbewilligung der Grundschuld, Bestätigung Flst. 220/9 sowie Vollzugsschritte zu Flst. 213 (Vormerkung, Vorkaufsrechtsverzicht, Genehmigung nach Grundstückverkehrsrecht)."]]}],
  "quelle": "Quelle: Grundbuch Blatt 1077 (27.03.2025); Baugenehmigungen Landratsamt Waldshut 12.09.2023 und 12.12.2024; HPC AG Angebot 23.09.2024 und Schlussrechnung 19.03.2025; Datenraum MonteSana, geprüft 19.11.2026. Der Asset Check ist keine Due Diligence im rechtlichen Sinne."})

# 23 Asset Check 2
S.append({"modul": "raster", "id": "check2", "kopf": "GRENFORD Asset Check", "dachzeile": "Teil 2 von 2 · Wirtschaft und Betrieb", "titel": "Die Ertragsbasis ist dokumentiert",
  "bloecke": [
    {"typ": "kpi", "x": L0, "y": 410, "w": 410, "h": 56, "groesse": 21, "gap": 12, "items": [{"wert": "≈ 381 T€", "label": "Eigentümerertrag p. a. ab 2029"}, {"wert": "218 T€", "label": "davon als Mindestpacht geplant", "stil": "hell"}]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 18, "w": 410, "titel": "Ertragsbasis", "breiten": [270, 140], "kopf": ["Kennzahl", "Wert"], "zh": 21,
     "zeilen": [["Verkaufspreis Apartments, Verkäuferplan", "5.000–5.100 €/m²"], ["Einschätzung Vertriebspartner (11/2025)", "4.875–5.250 €/m²"],
                ["Vertriebsprovision", "5 %"], ["Apartments (Wohnfläche)", "4.299 m²"]]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 18, "w": 410, "breiten": [296, 114], "links": [0, 1], "tags": [1], "kopf": ["Unterlage", "Status"], "bis": 66, "schrift": 8.4,
     "zeilen": [["Ertragsprognosen, Rentabilität, Profit-Center (13.02.2026)", "Gesichtet"], ["Sales Plan, Apartments.xlsx, Renditeberechnung", "Gesichtet"],
                ["Betreiberangebote IWG und stuub, Personalstruktur", "Gesichtet"], ["Marktanalysen (B2B, Büro/Lager, Entwicklung)", "Im Datenraum"]]},
    {"typ": "kv", "x": 500, "y": 410, "w": 356, "kw": 88, "titel": "Einordnung", "schrift": 8.8, "bis": 150,
     "zeilen": [["Zielgruppen", "Apartments für Grenzgänger, Remote Worker, Corporate Housing und Gesundheitsgäste."],
                ["Betreiber", "Coworking, Fitness und Physio/Kosmetik über die konzernverbundene Montesana Hospitality &amp; Coworking GmbH, Arztpraxis per Direktmiete. IWG/Regus: Eckpunkte und Vertragsentwurf liegen vor; Managementangebot stuub vom 22.09.2025."],
                ["Auslastung", "Verkäufermodell 52 % (2027) bis 71 % (2031). Break-even für 4 % Objektrendite bei ca. 45 % Auslastung."],
                ["Marktreferenz", "Höchenschwand 33 % Bettenauslastung (2018). Coworking und Medizin zielen auf eine höhere Auslastung als klassische Ferienwohnungen."]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 14, "w": 356, "box": True, "schrift": 8.6,
     "absaetze": [["Bis zum Signing:", "unterzeichnete Betreiber- und Pachtverträge mit Mindestpacht, Verkaufsstand der Apartments; Vertriebsstart laut LBS nach gesicherter Gesamtfinanzierung."]]}],
  "quelle": "Quelle: Ertragsprognosen MonteSana; Sales Plan; LBS-Schreiben 20.11.2025; Apartments.xlsx; Renditeberechnung Apt. 55."})

# 24 Machbarkeit 1  (geprüft gegen Datenraum, Stand 19.11.2026)
S.append({"modul": "raster", "id": "machbar1", "kopf": "Machbarkeitsstudie", "dachzeile": "Teil 1 von 2 · Planung, Technik und Bau", "titel": "Genehmigt und baufreigegeben",
  "bloecke": [
    {"typ": "kpi", "x": L0, "y": 410, "w": FULL, "h": 48, "groesse": 18, "gap": 12,
     "items": [{"wert": "Erteilt", "label": "Baugenehmigung und Baufreigabe"}, {"wert": "Genehmigt", "label": "Nutzung im Sondergebiet Co-Working", "stil": "hell"},
               {"wert": "4 × Umsetzung", "label": "Brandschutz, Energie, Bau, Schallschutz"}, {"wert": "2 Gutachten", "label": "Bausubstanz und Baugrund folgen", "stil": "hell"}]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 18, "w": FULL, "breiten": [140, 550, 115], "links": [0, 1, 2], "tags": [2], "bis": 150, "schrift": 8.4,
     "kopf": ["Dimension", "Befund", "Machbarkeit"],
     "zeilen": [["Planungsrecht", "Bebauungsplan 04/2023, Sondergebiet; Nutzung Coworking, Wellness, Therapie und Apartments genehmigt", "Gegeben"],
                ["Genehmigungsstand", "Baugenehmigung 09/2023, Änderung und Gesamtbaufreigabe 12/2024", "Gegeben"],
                ["Brandschutz", "17 Abweichungen genehmigt, kompensiert durch Brandmeldeanlage und Rauchwarnmelder; Gutachten Schubert folgt im Datenraum", "Umsetzung"],
                ["Auflagen und Schallschutz", "Barrierefreiheit nach DIN 18040, Kinderspielplatz ≥ 30 m², passiver Schallschutz zur B 500", "Umsetzung"],
                ["Energetik und Bauablauf", "KfW 40 geplant, Energieberatung und KfW-Antrag beauftragt, PV im Bauzeitplan; drei Abschnitte auf 1.015 m", "Umsetzung"],
                ["Bausubstanz", "Untersuchung auf Asbest, PAK und PCB 2024/25 abgeschlossen; Gutachten und Kostenansatz folgen im Datenraum", "Nachweis folgt"],
                ["Baugrund / Statik", "Gesamtbaufreigabe erteilt; Ingenieurangebote Statik (Dagdelen, 2020); Bodengutachten wird ergänzt", "Nachweis folgt"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 14, "w": FULL, "box": True, "schrift": 8.6,
     "absaetze": [["Ergebnis:", "Baugenehmigung und Gesamtbaufreigabe decken die geplante Nutzung vollständig ab. Die Auflagen sind übliche Umsetzungsschritte; mit dem Bausubstanz- und dem Bodengutachten wird die Prüfung abgeschlossen."]]}],
  "quelle": "Quelle: Baugenehmigungen 12.09.2023 und 12.12.2024 (Nebenbestimmungen); Schalltechnische Untersuchung und Umweltbelange zum Bebauungsplan; HPC AG (2024/25); Datenraum MonteSana, geprüft 19.11.2026. Einschätzung GRENFORD, kein Fachgutachten."})

# 25 Machbarkeit 2
S.append({"modul": "raster", "id": "machbar2", "kopf": "Machbarkeitsstudie", "dachzeile": "Teil 2 von 2 · Betrieb und Ergebnis", "titel": "Machbar und wirtschaftlich tragfähig",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 430, "titel": "Ergebnis der Machbarkeitsprüfung", "breiten": [112, 208, 110], "links": [0, 1, 2], "tags": [2], "bis": 170,
     "kopf": ["Kriterium", "Ergebnis", "Bewertung"],
     "zeilen": [["Planung und Genehmigung", "Alle wesentlichen Genehmigungen liegen vor", "Gegeben"], ["Technik und Bauablauf", "Drei Bauabschnitte, Brandschutz und Energetik genehmigt", "Umsetzung"],
                ["Kosten", "Restbudget 8,66 Mio. € netto; Ansatz Bausubstanz folgt mit Gutachten", "Umsetzung"], ["Markt und Lage", "Grenzgängerpotenzial, Kurortstatus", "Gegeben"],
                ["Betrieb", "Vier Profit-Center, Betreiberangebote liegen vor", "Umsetzung"], ["Wirtschaftlichkeit", "IRR 10,6 bis 26,8 % (Szenarien), Break-even 2029", "Gegeben"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 16, "w": 430, "box": True, "titel": "Gesamtergebnis", "schrift": 9,
     "absaetze": ["Das Vorhaben ist genehmigt, baufreigegeben und in allen Szenarien wirtschaftlich tragfähig. Die Umsetzungsschritte sind bis zum Signing und in der Bauphase planbar; Bausubstanz- und Bodengutachten runden die Prüfung ab."]},
    {"typ": "saeulen", "x": 520, "y": 410, "w": 336, "h": 220, "titel": "Operatives Ergebnis aller Profit-Center in T€", "gestapelt": True, "max": 731, "breite": .46,
     "kategorien": ["Jahr 2 (≈ 2027)", "Jahr 3 (≈ 2028)", "Jahr 4 (≈ 2029)"], "summen": ["182 T€", "635 T€", "731 T€"],
     "serien": [{"name": "Coworking", "farbe": "navy", "werte": [107, 313, 332]}, {"name": "Fitness", "farbe": "mid", "werte": [10, 183, 237]},
                {"name": "Medizin", "farbe": "grey", "werte": [23, 23, 23]}, {"name": "Physio", "farbe": "light", "werte": [24, 37, 50]}, {"name": "SPV", "farbe": "mist", "werte": [18, 79, 88]}]},
    {"typ": "text", "x": 520, "y": "folgt", "abstand": 6, "w": 336, "schrift": 8.6,
     "absaetze": ["Ab Jahr 4 rund 730 T€ operatives Ergebnis; davon fließen stabilisiert rund 381 T€ an die Eigentümerin."]}],
  "quelle": "Quelle: Einschätzung GRENFORD auf Basis der Datenraum-Dokumente; Montesana Rentabilität / Profitcenter 260213 (Jahr 2 ≈ 2027), Werte gerundet. Keine Zusicherung. Die Machbarkeitsstudie ersetzt weder Gutachten noch Fachplanung."})

# 26 Value Matrix
S.append({"modul": "raster", "id": "matrix", "kopf": "Value Matrix", "dachzeile": "Stärken, Hebel, Chancen, Risiken", "titel": "Stärken nutzen, Hebel definieren",
  "bloecke": [
    {"typ": "matrix", "x": L0, "y": 412, "w": FULL, "h": 286, "schrift": 8.8, "zellen": [
      {"titel": "Stärken", "akzent": True, "punkte": [["Genehmigtes Projekt.", "Baugenehmigung 09/2023, Gesamtbaufreigabe und Abgeschlossenheit 12/2024."], ["Grenzraum-Standort.", "20 km zur Schweizer Grenze, 14.668 Grenzgänger im Kreis Waldshut."],
         ["Vier Ertragssäulen.", "92 Apartments plus vier Profit-Center auf 2.658 m²."], ["Einstiegspreis.", "5,3 statt 7,0 Mio. €; optionale Staffelung; Zusatzgrundstück im Paket."]]},
      {"titel": "Hebel", "punkte": [["Auslastung absichern.", "Planung 52 bis 71 %; Break-even für 4 % Objektrendite bei ca. 45 %."], ["Betreiberverträge.", "Mindestpacht 218 T€ p. a. vertraglich fixieren; IWG/Regus und stuub in Verhandlung."],
         ["Finanzierungsstruktur.", "Fremdkapital, KfW-Programme und Sicherheiten bis zum Signing."], ["Kostenbasis.", "Bausubstanzbefund und Reserve (10 %) vor Vergabe einpreisen."]]},
      {"titel": "Chancen", "akzent": True, "punkte": [["Grenzgänger und Workation.", "Wohnen auf Zeit und Coworking im Grenzraum."], ["Kombinationsangebot.", "Kein vergleichbares Gesamtkonzept im 50-km-Radius."],
         ["Exit-Optionen.", "Einzelverkauf, Gesamtverkauf oder Halten der Gewerbeflächen; IRR Basisfall 23,1 %."], ["Förderung und Fläche.", "KfW-40-Tilgungszuschuss bis ca. 1,6 Mio. € geplant (nicht in der Rechnung); Flst. 213 als Reserve."]]},
      {"titel": "Marktrisiken", "punkte": [["Zins- und Kapitalmarkt.", "Wirkt auf Finanzierung und Exit-Rendite (6,5 bis 8,0 %)."], ["Bauablauf auf 1.015 m.", "Winterfenster und Lieferketten: Puffer im Bauzeitplan."],
         ["Wettbewerb.", "Rund 82 Ferienunterkünfte, 52 bis 110 € je Nacht; Planpreis am oberen Ende."], ["Nachweise.", "Bausubstanz- und Bodengutachten werden nachgereicht; Kostenansatz folgt."]]}]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 10, "w": FULL, "box": True, "schrift": 8.6,
     "absaetze": [["Investor Insight:", "MonteSana verbindet genehmigten Planungsstand und Grenzraum-Standort mit einem Einstiegspreis samt Zahlungsoption. Bausubstanz- und Bodengutachten werden zum Signing nachgereicht; die übrigen Maßgaben liegen in Betrieb, Finanzierung und Bauablauf. Vertiefte Modelle und Exit-Strategien stellen wir in vertraulichen Gesprächen zur Verfügung."]]}],
  "quelle": "Quelle: Einschätzung GRENFORD auf Basis von Verkäuferunterlagen, GRENFORD Research und Investorenrechnung (Seiten {seite:cashflow} bis {seite:sensitivitaet}). Indikativ, keine Zusicherung."})

# IV Kontakt
S.append({"modul": "kontakt", "id": "kontakt", "bereich": "nach", "bild": "bestand-luft.png", "bild_pos": "15% center", "abstand": 56, "schrift": 8.2,
  "claim": ["Ihr Interesse,", "Ihr nächster", "Schritt"], "dachzeile": "MonteSana · Transaktionsablauf", "titel": ["Vom LOI zum", "notariellen Vertrag"],
  "box_label": "Ansprechpartner", "box_titel": "Marco Kaimann, Founder &amp; Transaction Advisor",
  "schritte": [["Gespräch und Letter of Intent", "Wir besprechen Ihre Investitionskriterien. Mit dem LOI bekunden Sie Ihre Kaufabsicht; er ist keine automatische Zusage des Early-Commit-Preises."],
               ["Identifizierung und Datenraum", "Nach Identifizierung gemäß Geldwäschegesetz und Vertraulichkeitsbestätigung erhalten Sie Zugang zu Genehmigungen, Grundbuch, Kostenmodell und Ertragsunterlagen."],
               ["Prüfung und Besichtigung", "Ihre Berater prüfen technisch, rechtlich und steuerlich. Wir koordinieren den Termin vor Ort in Höchenschwand."],
               ["Notarvertrag", "Erwerb als notariell beurkundeter Asset Deal; eine gestaffelte Kaufpreiszahlung ist nach Abstimmung von Fälligkeiten und Sicherheiten möglich."]]})

# V Über
S.append({"modul": "ueber", "id": "ueber", "bereich": "nach", "bild": "vis-luft.png", "bild_pos": "15% center"})

# VI Disclaimer
S.append({"modul": "raster", "id": "disclaimer", "bereich": "nach", "kopf": "Rechtliche Hinweise", "dachzeile": "Disclaimer", "titel": "Rechtliche Hinweise",
  "bloecke": [
    {"typ": "text", "x": L0, "y": 412, "w": 380, "schrift": 8.3,
     "absaetze": ["Dieses Investment Memo wurde von GRENFORD erstellt und dient ausschließlich der unverbindlichen Information über das Immobilienprojekt MonteSana. Es richtet sich ausschließlich an professionelle Investoren (Unternehmer im Sinne des § 14 BGB) und stellt kein Angebot im rechtlichen Sinne dar. Es ersetzt weder eine Anlage-, Rechts- noch Steuerberatung.",
                  "Alle Angaben beruhen auf Informationen Dritter, insbesondere der Verkäuferseite, von Behörden und Planungsbeteiligten, sowie auf Annahmen und Berechnungen von GRENFORD. Trotz sorgfältiger Zusammenstellung wird für Vollständigkeit, Richtigkeit und Aktualität keine Gewähr übernommen. Verbindlich sind ausschließlich notariell beurkundete Verträge. Änderungen, Irrtümer und Zwischenverkauf bleiben vorbehalten.",
                  "Prognosen, Szenarien und Renditeberechnungen sind unverbindliche Einschätzungen und keine Garantie künftiger Entwicklungen. Der GRENFORD Asset Check und die Machbarkeitsstudie sind weder Due Diligence im rechtlichen Sinne noch Gutachten. Investitionsentscheidungen sollten ausschließlich auf Grundlage einer eigenen, vollständigen Prüfung der Unterlagen unter Hinzuziehung von Rechts-, Steuer- und Finanzberatern erfolgen.",
                  ["Rechtlicher Rahmen.", "Maßgeblich sind ausschließlich die notariell beurkundeten Verträge (§ 311b Abs. 1 BGB). Das Angebot erfolgt als Asset Deal netto; Umsatzsteuer (§§ 9, 13b UStG), Grunderwerbsteuer (Baden-Württemberg 5,0 %) und Sicherungsstrukturen sind vertraglich zu regeln. Das Zusatzgrundstück Flst. 213 ist Landwirtschaftsfläche; Genehmigung und Vollzug stehen aus. GRENFORD ist Verpflichteter nach dem Geldwäschegesetz (Identifizierung, unbare Zahlung, § 16a GwG)."]]},
    {"typ": "text", "x": 476, "y": 412, "w": 380, "schrift": 8.3,
     "absaetze": [["Provisionshinweis.", "Der Erwerb ist courtagepflichtig. Die Maklercourtage beträgt 5,0 % netto zuzüglich gesetzlicher Mehrwertsteuer und wird mit Wirksamkeit des notariellen Kaufvertrags fällig. Einzelheiten regeln die Allgemeinen Geschäftsbedingungen auf Seite {seite:agb}."],
                  ["Haftungsbegrenzung.", "Eine Haftung von GRENFORD ist ausgeschlossen, außer bei Vorsatz oder grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit und bei Verletzung wesentlicher Vertragspflichten (dann begrenzt auf den vorhersehbaren, vertragstypischen Schaden). Es gilt das Recht der Bundesrepublik Deutschland; Gerichtsstand ist, soweit zulässig, Berlin."],
                  ["Vertraulichkeit.", "Dieses Dokument ist vertraulich (Off-Market) und ausschließlich für den namentlich adressierten Empfänger bestimmt. Weitergabe, Veröffentlichung oder Vervielfältigung, auch auszugsweise, sind ohne schriftliche Zustimmung von GRENFORD unzulässig."],
                  ["Bildrechte.", "Visualisierungen, Luftbilder und Pläne: Projektgesellschaft bzw. Planverfasser; Verwendung nur zur Prüfung des Erwerbs."],
                  ["Anbieter.", "GRENFORD ist die Geschäftsbezeichnung des Einzelunternehmens Marco Kaimann, Kurfürstendamm 96, 10709 Berlin · mkaimann@grenford.de · www.grenford.de · USt-IdNr.: DE362752159. Erlaubnis nach § 34c GewO: Bezirksamt Charlottenburg-Wilmersdorf von Berlin, erteilt am 01.11.2022. Verantwortlich gemäß § 18 Abs. 2 MStV: Marco Kaimann, Anschrift wie oben."],
                  ["Datenschutz.", "Informationen zur Datenverarbeitung nach DSGVO: www.grenford.de/datenschutz"]]}],
  "quelle": "Stand 19.11.2026 · Streng vertraulich (C3)"})

# VII AGB
S.append({"modul": "agb", "id": "agb", "bereich": "nach", "datei": "agb_investment.html", "dachzeile": "GRENFORD Investments · Nachweis und Vermittlung", "stil": "font-size:7.9pt;line-height:10.6pt"})

# Listenpreis-Kurve: Werte der GRENFORD-Investorenrechnung (aus der Grafik des Memos vom 11.11.2026, Mio. €)
lp = [-8.42, -10.19, -4.05, -0.26, 0.11, 0.50, 0.88, 1.27, 1.67, 2.08, 8.48]
for p in S:
    for b in p.get('bloecke', []):
        for sr in b.get('serien', []):
            if sr.get('werte') == 'LP': sr['werte'] = lp

json.dump({"meta": meta, "kosten": {"einheiten": []}, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
