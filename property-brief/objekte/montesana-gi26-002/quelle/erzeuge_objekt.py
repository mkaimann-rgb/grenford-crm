# Erzeugt objekt.json für das Investment Memo MonteSana (GI26-002).
# Inhalte: Verkäuferunterlagen und GRENFORD-Berechnungen laut Investment Memo Stand 11.11.2026.
import json, os, copy
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')
L0, R0, LW, RW = 51, 482, 380, 374     # zwei Spalten
FULL = 805

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
  "kennzahlen": [["5,30 Mio. €", "Kaufpreis Early-Commit"], ["13,9-fach", "Faktor Eigentümerertrag"], ["23,1 %", "IRR 10 Jahre, Basisfall"]],
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
  "links": "Das Projekt: Revitalisierung des ehemaligen Kurkomplexes zu Wohnen auf Zeit, Coworking, Fitness und Wellness sowie Medizin. Baugenehmigung seit 09/2023, Teilungserklärung seit 08/2025.",
  "rechts": "Das Angebot: Asset Deal off-market inklusive Flst. 213. Listenpreis 7,0 Mio. €, Early-Commit 5,3 Mio. € bei LOI bis Ende November 2026; eine gestaffelte Zahlung ist verhandelbar.",
  "schluss": "Das Memo führt von den Hard Facts über Standort, Research und Konzept zur 10-Jahres-Rechnung und zum Asset Check. Im Basisfall ergibt sich über zehn Jahre eine IRR von 23,1 %. Für Rückfragen und den Zugang zum Datenraum stehen wir Ihnen persönlich zur Verfügung."})

S.append({"modul": "fakten", "id": "fakten", "bereich": "vor", "kopf": "Hard Facts", "zeilenhoehe": 14.6,
  "dachzeile": "Zahlen, Daten, Fakten · Objekt-Nr. GI26-002", "titel": "Das Projekt in Kennzahlen",
  "intro": "Kaufpreis und Renditen in zwei Varianten: Early-Commit (5,3 Mio. €, LOI bis Ende November 2026) und Listenpreis (7,0 Mio. €). Alle Werte netto, vor Steuern und Finanzierung.",
  "links": [
    {"titel": "Fläche und Objekt", "zeilen": [["Grundstück Hauptareal (Flst. 220/7)", "16.174 m²"], ["Zusatzgrundstück (Flst. 213, im Paket)", "6.511 m²"],
      ["Grundstücke gesamt", "22.685 m²"], ["BGF (ca.)", "9.900 m²"], ["NGF / Wohn- und Nutzfläche", "6.957 m²"],
      ["davon Apartments (92 Einheiten)", "4.299 m²"], ["davon Gewerbe (4 Profit-Center)", "2.658 m²"]]},
    {"titel": "Baukosten", "zeilen": [["Restbudget CapEx netto", "8,66 Mio. €"], ["Planungs- und Nebenkosten (10 %)", "0,87 Mio. €"],
      ["Möblierung / FF&amp;E", "1,30 Mio. €"], ["Baukosten je m² BGF", "897 €"], ["Bauzeit", "04/2026 bis 10/2027"]]},
    {"titel": "Erträge und Exit", "zeilen": [["Verkaufspreis Apartments (Annahme)", "5.000 €/m² brutto"], ["Erlös Apartments netto", "18,1 Mio. €"],
      ["Eigentümerertrag Gewerbe, stabilisiert", "≈ 381 T€ p. a. ab 2029"], ["Exit-Rendite Gewerbe (Annahme)", "7,0 %"],
      ["Objektrendite Apartment-Käufer", "4,5 % (2027) bis 7,3 % (2036)"]]}],
  "spalten": ["Early-Commit", "Listenpreis"],
  "rechts": [
    {"titel": "Kaufpreis", "zeilen": [["Kaufpreis netto (Asset Deal)", "5,30 Mio. €", "7,00 Mio. €"], ["Kaufpreis je m² NGF", "762 €", "1.006 €"],
      ["Kaufpreis je m² BGF", "535 €", "707 €"], ["Faktor auf Eigentümerertrag 381 T€", "13,9-fach", "18,4-fach"],
      ["Kaufpreisstaffelung (indikativ)", "2,5 / 2,8 Mio. €", "–"], ["Erwerbsnebenkosten (Annahme 6,5 %)", "0,34 Mio. €", "0,46 Mio. €"],
      ["Maklercourtage (5,0 % zzgl. MwSt.)", "0,27 Mio. €", "0,35 Mio. €"]]},
    {"titel": "Rendite und Wert (Basisfall)", "zeilen": [["Gesamtinvestition netto", "17,4 Mio. €", "19,2 Mio. €"], ["Gesamtwert nach Fertigstellung", "23,2 Mio. €", "23,2 Mio. €"],
      ["IRR 10 Jahre (vor Steuern)", "23,1 %", "14,1 %"], ["Multiple auf Eigenkapital", "1,62-fach", "1,46-fach"],
      ["Überschuss nach Wiederverkauf", "10,3 Mio. €", "8,5 Mio. €"], ["Barwert DCF (10 % Diskontsatz)", "3,7 Mio. €", "1,6 Mio. €"],
      ["Spitzenbedarf Kapital", "8,4 Mio. €", "10,2 Mio. €"]]}],
  "quelle": ["Quelle: Verkäuferunterlagen (Grundbuch, Baugenehmigung, Kostenberechnung, Bauzeitplan, Ertragsprognose, Sales Plan) und GRENFORD-Berechnung. Renditen vor Steuern und ohne Fremdfinanzierung; indikativ.",
             "Der Faktor bezieht sich auf den stabilisierten Eigentümerertrag der Gewerbeflächen."]})

# 1 Standort (Bildseite)
S.append({"modul": "bildseite", "id": "standort", "kopf": "Standort", "bild": "bestand-luft.png", "bild_pos": "center",
  "dachzeile": "Höchenschwand · Südschwarzwald", "titel": ["Kurort im", "Südschwarzwald"],
  "text": "Höchenschwand ist heilklimatischer Kurort auf dem Hochplateau des Südschwarzwalds. Die Schweizer Grenze bei Waldshut liegt 20 km entfernt; dahinter beginnen mit Aargau, Zürich und Basel einige der kaufkräftigsten Arbeitsmärkte Europas.",
  "kennzahlen": [["1.015 m", "Höhe über NN"], ["20 km", "zur Schweizer Grenze"], ["14.668", "Grenzgänger Kreis Waldshut"]],
  "hinweis": "Luftbild Bestand · Bildrechte Projektgesellschaft"})

# 2 Lage und Erreichbarkeit
S.append({"modul": "raster", "id": "lage", "kopf": "Lage", "dachzeile": "Lage und Erreichbarkeit", "titel": "Im Dreiländerraum, abseits der Ballungszentren",
  "intro": "Basel, Zürich und Freiburg liegen in rund einer bis eineinhalb Stunden Fahrzeit. Der Schweizer Arbeitsmarkt beginnt am Rhein, 20 Kilometer entfernt; Stuttgart und München sind in einer Tagesreise erreichbar.",
  "bloecke": [
    {"typ": "balken", "x": L0, "y": 384, "w": LW, "titel": "Strecke Pkw ab MonteSana in km (ca.)", "lw": 120, "vw": 70, "abstand": 32, "max": 330,
     "items": [["Schweizer Grenze (Waldshut)", 20, "20 km · 25 min", "h"], ["Basel", 70, "70 km · 1 h"], ["Freiburg i. Br.", 80, "80 km · 1 h 30"],
               ["Zürich", 85, "85 km · 1 h 15"], ["Stuttgart", 190, "190 km · 2 h 15"], ["München", 330, "330 km · 3 h 45"]]},
    {"typ": "tabelle", "x": R0, "y": 384, "w": RW, "titel": "Entfernungen ab MonteSana", "breiten": [134, 70, 80, 90],
     "kopf": ["Ziel", "Luftlinie", "Pkw (ca.)", "Fahrzeit (ca.)"],
     "zeilen": [["Schweizer Grenze (Waldshut)", "14 km", "20 km", "25 min"], ["Basel", "48 km", "70 km", "1 h"], ["Zürich", "47 km", "85 km", "1 h 15"],
                ["Freiburg i. Br.", "39 km", "80 km", "1 h 30"], ["Stuttgart", "138 km", "190 km", "2 h 15"], ["München", "257 km", "330 km", "3 h 45"]]},
    {"typ": "text", "x": R0, "y": "folgt", "abstand": 24, "w": RW, "box": True, "titel": "Einordnung",
     "absaetze": ["Ruhe auf dem Hochplateau, der Grenzraum vor der Tür und Anschluss an drei Metropolregionen: Die Lage verbindet Erholungsqualität mit beruflicher Nachfrage aus der Schweiz."]}],
  "quelle": "Quelle: Luftlinie GRENFORD-Berechnung aus Koordinaten (Höchenschwand 47,73 N / 8,18 E). Pkw-Strecken und -Zeiten sind gerundete Richtwerte ohne Verkehr."})

# 3 Grenzraum
S.append({"modul": "raster", "id": "grenzraum", "kopf": "Standort", "dachzeile": "Deutsch-schweizer Grenze", "titel": "Schwarzwald und Schweizer Arbeitsmarkt",
  "intro": "14.668 Grenzgänger leben im Landkreis Waldshut und arbeiten in der Schweiz. Schweizer Einkommen treffen auf deutsche Lebenshaltungskosten; daraus entsteht Nachfrage nach Wohnen auf Zeit und Arbeitsplätzen im Grenzraum.",
  "bloecke": [
    {"typ": "balken", "x": L0, "y": 384, "w": LW, "titel": "Grenzgänger aus dem Kreis Waldshut nach Kanton (2024)", "lw": 90, "vw": 50, "abstand": 26,
     "items": [["Aargau", 7249, "7.249", "h"], ["Zürich", 3419, "3.419"], ["Schaffhausen", 1338, "1.338"], ["Übrige", 2662, "2.662"]]},
    {"typ": "kpi", "x": L0, "y": "folgt", "abstand": 20, "w": LW, "hell": True, "groesse": 19,
     "items": [["14.668", "Grenzgänger gesamt"], ["20–55 min", "Pkw nach Aargau, Zürich, Basel"], ["ca. 30 km", "zum Feldberg"]]},
    {"typ": "kv", "x": R0, "y": 384, "w": RW, "kw": 120, "titel": "Nachfragetreiber",
     "zeilen": [["Kaufkraft", "Schweizer Einkommen bei deutschen Lebenshaltungskosten; hohe Zahlungsbereitschaft für möbliertes Wohnen."],
                ["Drei Nachfragegruppen", "Grenzgänger mit Zweitwohnsitz oder Wochenaufenthalt, Fachkräfte und Expats im Corporate Housing, Schweizer Gäste im Kurzurlaub."],
                ["Kurort", "Ganzjahresnachfrage durch Wandern, Wellness, Reha und Wintersport (Feldberg ca. 30 km)."],
                ["Coworking", "Remote-Arbeitsplätze zwischen Zürich, Basel und Aargau in 20 bis 55 Minuten Entfernung."]]}],
  "quelle": "Quelle: Grenzgängerzentrum (grenzgaengerzentrum.de) nach Bundesamt für Statistik, Zahlen 2024; Exposé Teil A; Investment-Teaser. Zahlen nicht von GRENFORD verifiziert."})

# 4 Angebot
S.append({"modul": "raster", "id": "angebot", "kopf": "Das Angebot", "dachzeile": "Preis und Zahlungsstruktur", "titel": "Early-Commit deutlich unter Listenpreis",
  "bloecke": [
    {"typ": "kpi", "x": L0, "y": 404, "w": LW, "items": [["7,0 Mio. €", "Listenpreis netto"], ["5,3 Mio. €", "Early-Commit-Preis netto"]], "groesse": 22},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 18, "w": LW, "schrift": 8.4,
     "absaetze": [["Vorteil gegenüber Listenpreis:", "1,7 Mio. € (−24,3 %). Ein LOI bis Ende November 2026 ist grundsätzlich möglich; Fristen und Bedingungen sind abzustimmen."],
                  ["Optionale Kaufpreisstaffelung:", "mögliche Anzahlung von 2,5 Mio. € bei notariellem Kaufvertrag, verbleibende 2,8 Mio. € gemäß individuell vereinbartem Zahlungsplan. Anzahl und Fälligkeit der Teilzahlungen, spätester Zahlungstermin und Sicherheiten sind Gegenstand der Vertragsverhandlungen."]]},
    {"typ": "schritte", "x": L0, "y": "folgt", "abstand": 16, "w": LW + 12,
     "items": [["01 · November 2026", "LOI", "Abstimmung der Transaktionsbedingungen"], ["02 · Kaufvertrag", "Beurkundung", "Notarieller Vertrag und vereinbarte Anzahlung"], ["03 · Projektfortschritt", "Restzahlung", "Nach vertraglich festgelegten Fälligkeiten"]]},
    {"typ": "kv", "x": R0, "y": 404, "w": RW, "kw": 110, "titel": "Konditionen im Überblick", "schrift": 7.9,
     "zeilen": [["Struktur", "Asset Deal: Grundstücke Flst. 220/7 und 213 (6.511 m²) mit Gebäudebestand, Genehmigungen und Planungsunterlagen"],
                ["Kaufpreis", "7,0 Mio. € netto; Early-Commit 5,3 Mio. € netto"],
                ["Zahlungsoption", "Indikative Staffelung 2,5 / 2,8 Mio. €, vorbehaltlich individueller Vereinbarung"],
                ["Fälligkeiten", "Einmalige Restzahlung oder projektfortschrittsabhängige Teilzahlungen; noch nicht festgelegt"],
                ["Sicherheiten", "Grundpfandrechtliche Absicherung, gegebenenfalls Teilfreigaben bei Einzelverkäufen; nach Vereinbarung"],
                ["Erwerbsnebenkosten", "Annahme GRENFORD: Grunderwerbsteuer Baden-Württemberg 5,0 % plus Notar und Grundbuch ca. 1,5 %; bei 5,3 Mio. € rund 0,34 Mio. €"],
                ["Maklercourtage", "5,0 % netto zzgl. gesetzlicher MwSt., fällig mit wirksamem notariellen Kaufvertrag"],
                ["Vollzug", "Einzelheiten im notariellen Kaufvertrag"]]}],
  "quelle": ["Quelle: Angaben der Verkäuferseite (ERIKONA GmbH), Stand 11.11.2026; Erwerbsnebenkosten Annahme GRENFORD. Die Kaufpreisstaffelung ist eine indikative Strukturierungsoption und kein verbindliches Finanzierungsangebot des Verkäufers."]})

# 5 Asset
S.append({"modul": "raster", "id": "asset", "kopf": "Asset", "dachzeile": "Das Objekt", "titel": "Vom Kurkomplex zum Mixed-Use-Ensemble",
  "bloecke": [
    {"typ": "bild", "x": L0, "y": 410, "w": 186, "h": 124, "bild": "bestand-luft.png", "titel": "Bestand, Luftbild"},
    {"typ": "bild", "x": 245, "y": 410, "w": 186, "h": 124, "bild": "vis-luft.png", "titel": "Planung, Visualisierung"},
    {"typ": "bild", "x": L0, "y": 256, "w": LW, "h": 124, "bild": "vis-wohnhaeuser.png", "pos": "60% center", "titel": "Ansicht Wohnhäuser, Visualisierung"},
    {"typ": "kv", "x": R0, "y": 410, "w": RW, "kw": 100, "schrift": 7.9,
     "zeilen": [["Objekt", "Dr.-Bettinger-Weg 1, 3, 5 · 79862 Höchenschwand · Flst. 220/7"],
                ["Grundstück", "ca. 1,62 ha (Grundbuch 16.174 bis 16.219 m²)"],
                ["Zusatzgrundstück", "Flst. 213 „Kirchacker“, 6.511 m², Landwirtschaftsfläche, unerschlossen; im Paket enthalten, Nutzungsoptionen planungsrechtlich zu prüfen"],
                ["Gebäude", "Fünf Gebäude: Bauteile A, B, C, Wohnhäuser WH 1 und WH 3; BGF ca. 9.900 m²"],
                ["Frühere Nutzung", "Kurkomplex (SilvaSana); Revitalisierung statt Neubau"],
                ["Neue Nutzung", "92 Serviced Apartments, Coworking, Fitness und Wellness mit Pool, Arzt, Physiotherapie und Kosmetik"],
                ["Stellplätze", "98 Kfz und 33 Fahrrad (Auflage der Genehmigung)"],
                ["Energie", "KfW-Effizienzhaus 40 geplant, PV auf den Dachflächen vorgesehen"],
                ["Eigentümerin", "ERIKONA GmbH, Berlin, seit 2020 im Grundbuch"]]}],
  "quelle": "Quelle: Grundbuch Blatt 1077 (27.03.2025); Baugenehmigung 12.09.2023; Exposé 12/2025. Visualisierungen und Luftbild: Projektgesellschaft."})

# 6 Wettbewerb
S.append({"modul": "raster", "id": "wettbewerb", "kopf": "GRENFORD Research", "dachzeile": "Markt und Wettbewerb", "titel": "Viele Einzelangebote, kein Gesamtkonzept",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 520, "titel": "Angebote im 50-km-Radius nach Leistungsbaustein", "breiten": [122, 102, 120, 44, 44, 44, 44], "links": [0, 1, 2], "schrift": 7.8, "zh": 22,
     "kopf": ["Anbieter", "Standort", "Angebot", "Serviced", "Cowork.", "Wellness", "Medizin"], "hervorheben": ["MonteSana"],
     "zeilen": [["MonteSana", "Höchenschwand", "92 Apts., 4 Profit-Center", "●", "●", "●", "●"],
                ["Wellnesshotel Alpenblick", "Höchenschwand", "4*-Hotel, 37 Zi., 1.000 m² Spa", "–", "–", "●", "–"],
                ["Stuub Aparthotel", "Schluchsee, ca. 20 km", "11 Apartments, 30–85 m²", "●", "–", "–", "–"],
                ["Ferienwohnungen", "Höchenschwand und Umgebung", "ca. 82 Unterkünfte", "●", "–", "–", "–"],
                ["FridoSpace, KD.Haus", "Waldshut, ca. 25 km", "Coworking (auf Anfrage)", "–", "●", "–", "–"],
                ["Heinz Schwitter Coworking", "Böbikon CH, ca. 30 km", "Coworking ab 280 CHF/Monat", "–", "●", "–", "–"],
                ["Office LAB, 1905 B. Center", "Baden (AG), ca. 45 km", "Coworking, Business Center", "–", "●", "–", "–"]]},
    {"typ": "tabelle", "x": 610, "y": 410, "w": 246, "titel": "Preise je Nacht im Vergleich", "breiten": [120, 126], "links": [0], "schrift": 7.5, "zh": 19, "hervorheben": ["MonteSana Planannahme, Ø Erlös"],
     "kopf": ["Referenz", "Preis"],
     "zeilen": [["Ferienwohnungen Höchenschwand (Holidu)", "52 bis 110 €"], ["Ferienhäuser Höchenschwand, Durchschnitt", "145 €"], ["Stuub Schluchsee, Studio bis Maisonette", "75 bis 149 €"], ["MonteSana Planannahme, Ø Erlös", "102 € (2027) bis 110 € (2031)"]]},
    {"typ": "text", "x": 610, "y": "folgt", "abstand": 20, "w": 246, "box": True, "titel": "Einordnung", "schrift": 8,
     "absaetze": ["Im Radius fanden wir kein weiteres Objekt, das Serviced Living, Coworking, Wellness und Medizin in einem Haus bündelt. Die Planannahme liegt am oberen Ende der Ferienwohnungsspanne und verlangt ein klares Qualitätsprofil."]}],
  "quelle": "Quelle: GRENFORD Research auf Basis öffentlicher Quellen (Holidu 29.10.2026, TUI/Hotelspecials, workin.space, Hotelinformationen), Stand 30.10.2026. Entfernungen ab Höchenschwand geschätzt; die Übersicht ist nicht abschließend."})

# 7 Mieten Wohnen
S.append({"modul": "raster", "id": "mieten-wohnen", "kopf": "GRENFORD Research", "dachzeile": "Mieten Wohnen", "titel": "Günstiger Standort, starker Grenzraum",
  "bloecke": [
    {"typ": "balken", "x": L0, "y": 410, "w": LW, "titel": "Angebotsmieten kalt in €/m² und Monat", "lw": 120, "vw": 50, "abstand": 22, "max": 20,
     "items": [["Referenz Basel (Stadt)", 20, "ca. 20 €", "r"], ["Waldshut-Tiengen", 14.81, "14,81 €"], ["Todtmoos", 13.08, "13,08 €"], ["Rheinfelden (Baden)", 13.04, "13,04 €"],
               ["Laufenburg (Baden)", 12.97, "12,97 €"], ["Bad Säckingen", 12.38, "12,38 €"], ["Landkreis Waldshut Ø", 12.34, "12,34 €"], ["St. Blasien", 11.39, "11,39 €"],
               ["Höchenschwand", 10.82, "10,82 €", "h"], ["Bonndorf", 10.33, "10,33 €"]]},
    {"typ": "tabelle", "x": R0, "y": 410, "w": RW, "titel": "Wohnen auf Zeit, Waldshut-Tiengen", "breiten": [214, 90, 70], "kopf": ["Angebot", "Miete/Monat", "€/m²"],
     "zeilen": [["1,5 Zimmer, 35 m², möbliert", "1.750 €", "50"], ["1,5 Zimmer, 35 m², möbliert", "1.500 €", "43"], ["1 Zimmer, 40 m², möbliert", "1.250 €", "31"],
                ["2 Zimmer, 50 m², möbliert", "1.500 €", "30"], ["1 Zimmer, 55 m², Kaiserstraße", "2.050 €", "37"], ["2 Zimmer, 55 m²", "2.150 €", "39"]]},
    {"typ": "text", "x": R0, "y": "folgt", "abstand": 8, "w": RW, "schrift": 7.6, "absaetze": ["Median der sechs Kleinapartments: 38 €/m² und Monat."]},
    {"typ": "text", "x": R0, "y": "folgt", "abstand": 10, "w": RW, "box": True, "titel": "Einordnung", "schrift": 8,
     "absaetze": ["Höchenschwand liegt mit 10,8 €/m² rund 27 % unter Waldshut-Tiengen (14,8 €/m²). Das Planerlös-Niveau von MonteSana beträgt brutto 35 € (2027) bis 52 € (2031) je m² und Monat und liegt im Band möblierter Kleinapartments (30 bis 50 €/m²). Brutto-Erlös und Miete sind nur eingeschränkt vergleichbar. Zum Vergleich Kanton Aargau: Ø 291 CHF/m² und Jahr, rund 24 CHF/m² und Monat."]}],
  "quelle": "Quelle: GRENFORD Research: mietpreise.info (Angebotsmieten, Stände 08/2025 bis 10/2026, kleine Stichproben, Höchenschwand 13 Angebote), immoportal.com, immosuchmaschine.de (8 Angebote), realadvisor.ch (10/2026), BPD Immobilienentwicklung, Kurzpaper 04/2026 (Basel nach empirica). Angebots-, keine Bestandsmieten."})

# 8 Mieten Gewerbe
S.append({"modul": "raster", "id": "mieten-gewerbe", "kopf": "GRENFORD Research", "dachzeile": "Mieten Gewerbe", "titel": "Die Gewerbemieten tragen den Planansatz",
  "bloecke": [
    {"typ": "balken", "x": L0, "y": 410, "w": LW, "titel": "Büro: Angebotsmieten Waldshut-Tiengen in €/m² und Monat", "lw": 140, "vw": 50, "abstand": 22, "max": 19,
     "items": [["Waldshut, 178 m², 3. OG", 9.00, "9,00 €"], ["Gewerbepark Hochrhein, 123 m²", 11.00, "11,00 €"], ["Innenstadt, 89 m², 1. OG", 13.03, "13,03 €"],
               ["Waldshut Bahnhof, 140 m²", 14.29, "14,29 €"], ["Kaiserstraße, 95 m²", 18.95, "18,95 €"], ["Referenz HWK: Büro kleine Orte", 8.00, "8,00 €", "r"]]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 16, "w": LW, "titel": "Schweiz (Aargau), Inserate", "breiten": [280, 100], "kopf": ["Objekt", "CHF/m² und Jahr"],
     "zeilen": [["Spreitenbach, Gewerbe", "115"], ["Würenlingen, Gewerbe", "150"], ["Dättwil (Baden), Büro 50 m²", "179"]]},
    {"typ": "tabelle", "x": R0, "y": 410, "w": RW, "titel": "Coworking und Büro-Services", "breiten": [234, 140], "kopf": ["Anbieter", "Preis"],
     "zeilen": [["Heinz Schwitter, Böbikon (Zurzach)", "ab 280 CHF/Monat"], ["Tageskarte (günstigste Spaces, Region)", "ab 15 CHF"], ["Kuia Office, Spreitenbach: Einzelbüro", "ab 1.130 CHF/Monat"],
                ["FridoSpace, KD.Haus (Waldshut)", "auf Anfrage"], ["Referenz Lörrach / Weil am Rhein (&gt; 50 km)", "220 bis 289 €/Monat"]]},
    {"typ": "text", "x": R0, "y": "folgt", "abstand": 20, "w": RW, "box": True, "titel": "Einordnung", "schrift": 8,
     "absaetze": ["Der stabilisierte Eigentümerertrag von 381 T€ entspricht über 2.658 m² rund 11,9 €/m² und Monat und liegt im Rahmen der Büro- und Gewerbemieten vor Ort (9 bis 19 €/m²). Der geplante Coworking-Umsatz (750 T€ im Jahr 4) entspricht rund 50 €/m² und Monat; er liegt über dem Mietniveau, trägt aber Personal- und Betriebskosten."]}],
  "quelle": "Quelle: GRENFORD Research: immobilo.de (Waldshut-Tiengen, 30.10.2026, Einzelinserate), HWK Freiburg Gewerbemietspiegel 2021/22 (Büro kleinere Orte, Median 8,00 €, Spanne 5,75 bis 11,63 €), immobilier.ch (Aargau), workin.space, Verkäuferunterlagen (Ertragsprognose). Angebotsmieten, kleine Stichproben."})

# 9 Zielgruppen
S.append({"modul": "raster", "id": "zielgruppen", "kopf": "GRENFORD Research", "dachzeile": "Zielgruppen", "titel": "Drei Nachfragecluster tragen das Konzept",
  "bloecke": [
    {"typ": "matrix", "x": L0, "y": 410, "w": FULL, "h": 150, "gap": 10, "schrift": 7.9, "zellen": [
      {"titel": "Beruflich · Wohnen auf Zeit", "tag": "Top-Potenzial", "akzent": True, "punkte": [["Grenzgänger und Corporate Housing.", "Wochenaufenthalt, Fachkräfte, Projekteinsätze; Kaufkraft und planbare Aufenthaltsdauer."]]},
      {"titel": "Beruflich · Arbeiten", "tag": "Gut", "punkte": [["Remote Worker und Workation.", "Coworking und Business-Lounge, Mietbeginn 04/2027."]]},
      {"titel": "Freizeit · Erholung", "tag": "Gut", "punkte": [["Schweizer Kurzurlauber und Wellnessgäste.", "Ganzjahresnachfrage durch Wandern, Wellness und Wintersport."]]},
      {"titel": "Freizeit · Gesundheit", "tag": "Ergänzung", "punkte": [["Prävention, Physiotherapie und Praxis.", "Frequenzbringer für das Haus; Arztpraxis per Direktmiete."]]}]},
    {"typ": "text", "x": L0, "y": 240, "w": LW, "titel": "Zielgruppenstrategie", "schrift": 8.2,
     "absaetze": ["MonteSana adressiert Nachfrage, die Grenzraum und Kurortstatus tragen: Grenzgänger (14.668 im Kreis Waldshut), Fachkräfte im Corporate Housing, Remote Worker und Gäste aus der Schweiz.",
                  ["Marktlogik:", "Möbliertes Wohnen auf Zeit erzielt in Waldshut-Tiengen 30 bis 50 €/m², unmöbliert liegt das Niveau bei 10,8 bis 14,8 €/m². Die Planerlöse von MonteSana bewegen sich im Band des möblierten Segments."]]},
    {"typ": "tabelle", "x": R0, "y": 240, "w": RW, "titel": "Ergebnis auf einen Blick", "breiten": [70, 120, 184], "links": [0, 1, 2], "schrift": 7.5,
     "kopf": ["Priorität", "Segment", "Bewertung"],
     "zeilen": [["Top-Invest", "Grenzgänger und Corporate Housing", "Kaufkraft, planbare Aufenthalte, höchste Zahlungsbereitschaft"],
                ["Stabilität", "Remote Worker und Workation", "Wiederkehrende Nutzer, Auslastung der Coworking-Flächen"],
                ["Ergänzung", "Erholungs- und Gesundheitsgäste", "Frequenz und Saisonspitzen, Synergie mit Wellness und Medizin"]]}],
  "quelle": "Quelle: Einschätzung GRENFORD auf Basis von GRENFORD Research (Seiten {seite:wettbewerb} bis {seite:mieten-gewerbe}), Grenzgängerzentrum/BFS und Verkäuferunterlagen. Die Clusterbewertung ist eine Annahme und keine gemessene Nachfrage."})

# 10 Vision (Bildseite)
S.append({"modul": "bildseite", "id": "vision", "kopf": "Konzept", "bild": "vis-luft.png", "bild_pos": "75% center",
  "dachzeile": "Die Vision", "titel": ["Wohnen, Arbeiten", "und Gesundheit", "unter einem Dach"],
  "text": "92 möblierte Apartments, eine Business-Lounge mit Coworking, Fitness und Wellness mit Pool und Sauna, eine Arztpraxis sowie Physiotherapie und Kosmetik. Umsetzung in drei Bauabschnitten; die ersten Flächen gehen 2027 in Betrieb.",
  "kennzahlen": [["92", "Möblierte Apartments"], ["2.658 m²", "Profit-Center"], ["2027", "Beginn Betrieb"]],
  "hinweis": "Visualisierung: Projektgesellschaft"})

# 11 Nutzung
S.append({"modul": "raster", "id": "nutzung", "kopf": "Nutzungskonzept", "dachzeile": "Wohnen, Arbeiten, Gesundheit", "titel": "Ein Haus, vier Ertragssäulen",
  "bloecke": [
    {"typ": "balken", "x": L0, "y": 410, "w": LW, "titel": "6.957 m² Nutzfläche nach Nutzung", "lw": 110, "vw": 60, "abstand": 26, "max": 4299,
     "items": [["Apartments", 4299, "4.299 m²", "h"], ["Coworking", 1241, "1.241 m²"], ["Fitness / Wellness", 704, "704 m²"], ["Arztpraxis", 386, "386 m²"], ["Physio / Kosmetik", 327, "327 m²"]]},
    {"typ": "kpi", "x": L0, "y": "folgt", "abstand": 18, "w": LW, "hell": True, "groesse": 19, "items": [["6.957 m²", "Nutzfläche gesamt"], ["62 %", "Anteil Apartments"], ["38 %", "Anteil Gewerbe"]]},
    {"typ": "tabelle", "x": R0, "y": 410, "w": RW, "titel": "Vier Profit-Center ergänzen 92 Apartments", "breiten": [104, 60, 210], "links": [0, 2], "kopf": ["Profit-Center", "Fläche", "Konzept"],
     "zeilen": [["Coworking", "1.241 m²", "Flexible Arbeitsplätze, Business-Lounge, Workation"], ["Fitness / Wellness", "704 m²", "Studio, Pool, Sauna"],
                ["Arztpraxis", "386 m²", "Direktvermietung an externen Mieter"], ["Physio / Kosmetik", "327 m²", "Therapie, Beauty, Prävention"]]},
    {"typ": "tabelle", "x": R0, "y": "folgt", "abstand": 22, "w": RW, "titel": "Apartment-Mix", "breiten": [134, 80, 80, 80], "kopf": ["Typ", "Anzahl", "Ø m²", "m² gesamt"], "hervorheben": ["Summe"],
     "zeilen": [["1-Zimmer", "26", "25", "659"], ["2-Zimmer", "43", "46", "1.978"], ["3-/4-Zimmer", "23", "72", "1.652"], ["Summe", "92", "47", "4.289"]]}],
  "quelle": "Quelle: Apartments.xlsx; Ertragsprognosen MonteSana (Flächen Gewerbe); Investment-Teaser. Wohnfläche laut Ertragsprognose 4.299 m² (Apartments.xlsx: 4.289 m²)."})

# 12 Ansichten
S.append({"modul": "raster", "id": "ansichten", "kopf": "Pläne", "dachzeile": "Architektur · Ansichten", "titel": "Fassade und Dach im genehmigten Entwurf",
  "bloecke": [
    {"typ": "bild", "x": L0, "y": 410, "w": 560, "h": 160, "bild": "plan-ansicht-sued.png", "weiss": True, "contain": True, "pad": 8, "titel": "Ansicht von Süden · Bauteil Altbau und Bauteil B"},
    {"typ": "bild", "x": L0, "y": 220, "w": 560, "h": 140, "bild": "plan-ansicht-nord.png", "weiss": True, "contain": True, "pad": 8, "titel": "Ansicht von Norden · Bauteil B und Altbau"},
    {"typ": "text", "x": 640, "y": 410, "w": 216, "titel": "Architektur", "schrift": 8.2,
     "absaetze": ["Die Ansichten zeigen die genehmigte Planung für Altbau und Bauteil B. Rot markiert sind die Änderungen des Nachtrags zur Baugenehmigung, unter anderem Terrassen im Dachbereich."]},
    {"typ": "kv", "x": 640, "y": "folgt", "abstand": 16, "w": 216, "kw": 74, "schrift": 7.6, "titel": "Planunterlagen",
     "zeilen": [["Planverfasser", "Klaudia Keilholz Architekten GmbH, Berlin"], ["Planstand", "Bauantragsänderung vom 10.09.2024, Maßstab 1:100"],
                ["Genehmigung", "Baugenehmigung vom 12.09.2023"], ["Hinweis", "Planunterlagen tragen die Projektbezeichnung „Silvasana Höchenschwand“"]]}],
  "quelle": "Quelle: Genehmigungsplanung Klaudia Keilholz Architekten GmbH, Nachtrag zur Baugenehmigung (Planstand 10.09.2024); Ausschnitte, Original im Datenraum."})

# 13 Grundrisse
S.append({"modul": "raster", "id": "grundrisse", "kopf": "Pläne", "dachzeile": "Architektur · Grundrisse", "titel": "Regelgeschoss und Dachapartments",
  "bloecke": [
    {"typ": "bild", "x": L0, "y": 410, "w": 560, "h": 162, "bild": "plan-og1.png", "weiss": True, "contain": True, "pad": 6, "titel": "1. Obergeschoss · 1- bis 2-Raum- und 2- bis 3-Raum-Apartments"},
    {"typ": "bild", "x": L0, "y": 220, "w": 560, "h": 140, "bild": "plan-dg.png", "weiss": True, "contain": True, "pad": 6, "titel": "Dachgeschoss · große Apartments mit Terrassen"},
    {"typ": "text", "x": 640, "y": 410, "w": 216, "titel": "Grundrisse", "schrift": 8.2,
     "absaetze": ["Das Regelgeschoss gliedert sich in 1- bis 2-Raum- und 2- bis 3-Raum-Apartments mit Balkonen, bei Bedarf kombinierbar. Im Dachgeschoss sind große Apartments mit Terrassen vorgesehen."]},
    {"typ": "kv", "x": 640, "y": "folgt", "abstand": 16, "w": 216, "kw": 74, "schrift": 7.6, "titel": "Flächen",
     "zeilen": [["Wohnfläche", "4.299 m² in 92 Apartments"], ["Gewerbefläche", "2.658 m² in vier Profit-Centern"], ["Detailplanung", "Nutzflächenberechnungen je Apartment und Geschoss im Datenraum"]]}],
  "quelle": "Quelle: Genehmigungsplanung Klaudia Keilholz Architekten GmbH, Nachtrag zur Baugenehmigung (Planstand 10.09.2024); Nutzflächenberechnungen Apartments (14.07.2025). Ausschnitte, Original im Datenraum."})

# 14 Wertschöpfung
S.append({"modul": "raster", "id": "wert", "kopf": "Wertschöpfung", "dachzeile": "Investition und Wert", "titel": "Der Kaufpreis ist der größte Hebel",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 520, "titel": "Von der Investition zum Gesamtwert in Mio. €, netto", "breiten": [190, 66, 66, 66, 66, 66], "kopf": ["", "Kauf", "CapEx", "NK, FF&amp;E", "Erwerbs-NK", "Summe"], "hervorheben": ["Investition bei Early-Commit 5,3 Mio. €"],
     "zeilen": [["Investition bei Listenpreis 7,0 Mio. €", "7,00", "8,66", "3,07", "0,46", "19,2"], ["Investition bei Early-Commit 5,3 Mio. €", "5,30", "8,66", "3,07", "0,34", "17,4"]]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 18, "w": 520, "titel": "Gesamtwert nach Fertigstellung, Basisfall", "breiten": [190, 110, 110, 110], "kopf": ["", "Apartments netto", "Gewerbe", "Gesamtwert"], "hervorheben": ["Gesamtwert"],
     "zeilen": [["Gesamtwert", "18,06", "5,17", "23,2"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 18, "w": 520, "schrift": 7.8,
     "absaetze": [["Wert Gewerbe:", "Eigentümerertrag 381 T€ abzüglich 5 % Eigentümerkosten, kapitalisiert mit 7,0 % (Annahme GRENFORD)."],
                  ["Apartments:", "4.299 m² × 5.000 €/m² brutto, geteilt durch 1,19."], ["NK, FF&amp;E:", "Planungs- und Nebenkosten (0,87), Vertriebsprovision (0,90), Möblierung (1,30)."]]},
    {"typ": "balken", "x": L0, "y": "folgt", "abstand": 14, "w": 520, "titel": "Investition und Gesamtwert, Mio. € netto", "lw": 190, "vw": 60, "abstand": 22, "max": 23.2,
     "items": [["Investition bei Listenpreis", 19.2, "19,2"], ["Investition bei Early-Commit", 17.4, "17,4"], ["Gesamtwert nach Fertigstellung", 23.2, "23,2", "h"]]},
    {"typ": "dunkel", "x": 632, "y": 410, "w": 224, "h": 260, "titel": "Wertüberschuss bei Early-Commit",
     "werte": [["+5,9 Mio. €", "Gesamtwert abzüglich Investition"], ["+34 %", "auf die Gesamtinvestition von 17,4 Mio. €"]],
     "text": "Bei 7,0 Mio. € Kaufpreis: +4,1 Mio. € (+21 %). Rechnung GRENFORD, indikativ, vor Finanzierung und Steuern."}],
  "quelle": "Quelle: Kostenberechnung und Bauzeitplan (Restbudget 8,66 Mio. € netto); Ertragsprognosen; Sales Plan; Annahmen GRENFORD (Nebenkosten 10 % auf CapEx, FF&amp;E 1,3 Mio. €, Provision 5 %, Erwerbsnebenkosten 6,5 %)."})

# 15 Meilensteine
S.append({"modul": "raster", "id": "meilensteine", "kopf": "Zeitstrahl", "dachzeile": "Meilensteine", "titel": "Die Genehmigungsphase ist abgeschlossen",
  "bloecke": [
    {"typ": "zeitstrahl", "x": 70, "y": 280, "w": 766, "von": "2023-01", "bis": "2029-12", "heute": "2026-11",
     "punkte": [{"monat": "2023-04", "datum": "19.04.2023", "text": "Bebauungsplan in Kraft", "oben": False},
                {"monat": "2023-09", "datum": "12.09.2023", "text": "Baugenehmigung", "h": 56},
                {"monat": "2024-09", "datum": "20.09.2024", "text": "Bauantragsänderung", "oben": False},
                {"monat": "2025-08", "datum": "14.08.2025", "text": "Teilungserklärung", "h": 56},
                {"monat": "2025-12", "datum": "12/2025", "text": "Exposé und Marktauftritt", "oben": False, "h": 58},
                {"monat": "2026-04", "datum": "04/2026", "text": "Baubeginn Gebäude C", "plan": True, "h": 30},
                {"monat": "2026-11", "datum": "11/2026", "text": "LOI-Abstimmung", "plan": True, "oben": False, "h": 30},
                {"monat": "2027-04", "datum": "04/2027", "text": "Mietbeginn Coworking", "plan": True, "h": 56},
                {"monat": "2027-10", "datum": "10/2027", "text": "Abschluss Außenanlagen", "plan": True, "oben": False},
                {"monat": "2029-06", "datum": "2029", "text": "Stabilisierter Betrieb", "plan": True}]},
    {"typ": "kpi", "x": L0, "y": 150, "w": FULL, "hell": True, "groesse": 19, "gap": 30,
     "items": [["2 Jahre", "Genehmigung bis Baubeginn", "09/2023 bis 04/2026; Planungsrecht abgeschlossen"], ["12 Monate", "Bauzeit Gebäude C", "04/2026 bis Inbetriebnahme 04/2027"], ["2029", "Stabilisierter Betrieb", "der vier Profit-Center laut Ertragsprognose"]]}],
  "quelle": "Quelle: Baugenehmigung 12.09.2023; Bauantragsänderung 20.09.2024; Teilungserklärung 14.08.2025; Bauzeitplan; Ertragsprognosen; Angebot Verkäufer. Ausgefüllte Punkte: erreicht; offene Punkte: Plan."})

# 16 Bauzeitplan
S.append({"modul": "raster", "id": "bauzeit", "kopf": "Bauablauf", "dachzeile": "Bauzeitplan", "titel": "Fertigstellung in drei Bauabschnitten",
  "bloecke": [
    {"typ": "gantt", "x": L0, "y": 404, "w": FULL, "lw": 210, "von": "2026-04", "bis": "2027-12", "heute": "2026-11",
     "zeilen": [["Gebäude C: Abbruch bis TGA-Endmontage", "2026-04", "2027-03", "bau"], ["Gebäude A/B", "2026-07", "2027-07", "bau"], ["Wohnhäuser WH 1 / 3", "2026-09", "2027-10", "bau"],
                ["Außenanlagen Bauabschnitt 1", "2026-11", "2027-01", "aussen"], ["Außenanlagen Bauabschnitt 2", "2027-04", "2027-06", "aussen"],
                ["Verkauf der Apartments (Sales Plan)", "2026-04", "2027-12", "vertrieb"], ["Coworking, Mietbeginn 01.04.2027", "2027-04", "2027-12", "betrieb"],
                ["Fitness (H2 2027)", "2027-07", "2027-12", "betrieb"], ["Physio / Kosmetik ab 10/2027", "2027-10", "2027-12", "betrieb"]],
     "legende": [["Bau", "navy"], ["Außenanlagen", "grey"], ["Vertrieb", "light"], ["Betrieb", "acc"]]}],
  "quelle": "Quelle: Bauzeitplan.xlsx (Bauplan und Mittelabfluss, Baubeginn und Bauende je Gewerk); Sales Plan; Ertragsprognosen (Mietbeginne). Plandaten des Verkäufers."})

# 17 Kosten
S.append({"modul": "raster", "id": "kosten", "kopf": "Bau und Kosten", "dachzeile": "Technik und Kosten", "titel": "Kostenbasis und Mittelabfluss",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": LW, "titel": "Kostenbasis", "breiten": [270, 110], "kopf": ["Kennzahl", "Wert"], "hervorheben": ["Restbudget (netto)"],
     "zeilen": [["Kostenberechnung gesamt (netto)", "8,06 Mio. €"], ["Bauzeitplan aktualisiert (netto)", "8,94 Mio. €"], ["Bereits ausgeführt (Plan 04/2026)", "0,28 Mio. €"],
                ["Restbudget (netto)", "8,66 Mio. €"], ["€/m² BGF (netto, Bauzeitplan)", "897 €"]]},
    {"typ": "balken", "x": L0, "y": "folgt", "abstand": 20, "w": LW, "titel": "Anteil je Gewerk", "lw": 90, "vw": 40, "abstand": 15, "max": 22.3,
     "items": [["Elektro", 22.3, "22,3 %"], ["Außenanlagen", 15.1, "15,1 %"], ["Fenster/Türen", 11.2, "11,2 %"], ["Fassade/Putz", 10.6, "10,6 %"], ["Heizung", 8.0, "8,0 %"],
               ["Bodenbelag", 7.9, "7,9 %"], ["Sanitär", 7.2, "7,2 %"], ["Dach", 6.4, "6,4 %"], ["Übrige", 11.3, "11,3 %", "r"]]},
    {"typ": "saeulen", "x": R0, "y": 410, "w": RW, "h": 120, "titel": "Mittelabfluss je Jahr, Mio. € netto", "gestapelt": True, "max": 7.9, "breite": .5,
     "kategorien": ["2026", "2027", "2028"], "summen": ["1,0", "7,9", "1,9"],
     "serien": [{"name": "CapEx", "farbe": "navy", "werte": [0.87, 6.50, 1.30]}, {"name": "Nebenkosten", "farbe": "acc", "werte": [0.09, 0.65, 0.13]}, {"name": "FF&amp;E", "farbe": "light", "werte": [0, 0.78, 0.52]}]},
    {"typ": "tabelle", "x": R0, "y": "folgt", "abstand": 18, "w": RW, "titel": "Technische Unterlagen", "breiten": [264, 110], "links": [0, 1], "tags": [1], "kopf": ["Unterlage", "Status"],
     "zeilen": [["Kostenberechnung, Bauzeitplan, Handwerkerangebote", "Gesichtet"], ["Baubeschreibung, Bodengutachten, Statik", "Im Datenraum"],
                ["Wertgutachten Az. 202510340, Marktwertschätzung", "Im Datenraum"], ["Energieausweis-Unterlagen, Nutzflächenpläne", "Im Datenraum"]]},
    {"typ": "text", "x": R0, "y": "folgt", "abstand": 14, "w": RW, "box": True, "schrift": 7.8,
     "absaetze": [["Bis zum Signing:", "aktueller Bautenstand, Mengengerüst der Technik, Baunebenkosten und Reserve (in der Investorenrechnung mit 10 % angesetzt) sowie Auswertung der Wertgutachten."]]}],
  "quelle": "Quelle: Kostenberechnung Gesamt.xlsx; Bauzeitplan.xlsx; Datenraum MonteSana. Anteile bezogen auf 8,06 Mio. € netto."})

# 18 Cashflow
S.append({"modul": "tabelle", "id": "cashflow", "kopf": "10-Jahres-Rechnung", "dachzeile": "Investorenrechnung · Basisfall · Mio. € netto", "titel": "Zehn Jahre, ein Cashflow-Bild",
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
  "label_breite": 200,
  "kennzahlen": [["23,1 %", "IRR 10 Jahre, Basis Early-Commit"], ["1,62-fach", "Multiple auf eingesetztes Kapital"], ["10,3 Mio. €", "Gesamtüberschuss vor Steuern"], ["8,4 Mio. €", "Spitzenbedarf Kapital, kumuliert"]],
  "hinweis": "Sensitivität Zahlungsplan: Das Modell unterstellt 2,5 Mio. € in 2026 und 2,8 Mio. € in 2027 (Annahme GRENFORD, keine zugesagte Verkäuferkondition). Bei Zahlung des vollen Kaufpreises von 5,3 Mio. € bei Vertragsschluss sinkt die IRR im Basisfall auf 20,6 %; Multiple, Gesamtüberschuss und Spitzenbedarf bleiben unverändert.",
  "quelle": ["Quelle: Berechnung GRENFORD auf Basis von Bauzeitplan (Restbudget 8,66 Mio. € netto), Sales Plan (5.000 €/m²) und Ertragsprognose (Eigentümerertrag 381 T€ ab 2029, +2 % p. a.).", "Alle Werte in Mio. €, netto, vor Steuern und Finanzierung; indikativ."]})

# 19 Szenarien
cum_ec = [-3.80, -8.36, -2.25, 1.54, 1.91, 2.29, 2.68, 3.07, 3.47, 3.88, 10.27]
cum_lp = [round(v - 1.7 - (0.12 if i else 0.12), 2) for i, v in enumerate(cum_ec)]
S.append({"modul": "raster", "id": "szenarien", "kopf": "10-Jahres-Rechnung", "dachzeile": "Szenarien", "titel": "Der Early-Commit hebt die Rendite deutlich",
  "bloecke": [
    {"typ": "linie", "x": L0, "y": 410, "w": 400, "h": 220, "titel": "Kumulierter Cashflow in Mio. €", "achse": [-10, 10, 5],
     "kategorien": ["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036"],
     "serien": [{"name": "Early-Commit 5,3 Mio. €", "farbe": "navy", "ende": "10,3", "dy": 4, "werte": cum_ec},
                {"name": "Listenpreis 7,0 Mio. €", "farbe": "light", "ende": "8,5", "dy": -4, "werte": "LP"}]},
    {"typ": "saeulen", "x": 500, "y": 410, "w": 356, "h": 200, "titel": "IRR über 10 Jahre nach Szenario", "max": 30,
     "kategorien": ["Vorsichtig", "Basis", "Chance"],
     "serien": [{"name": "Early-Commit", "farbe": "navy", "werte": [10.6, 23.1, 26.8], "labels": ["10,6 %", "23,1 %", "26,8 %"]},
                {"name": "Listenpreis", "farbe": "light", "werte": [6.6, 14.1, 16.5], "labels": ["6,6 %", "14,1 %", "16,5 %"]}]},
    {"typ": "text", "x": L0, "y": 112, "w": FULL, "schrift": 8.2, "absaetze": [["Break-even des kumulierten Cashflows:", "2029 bei Early-Commit, 2030 bei Listenpreis."]]}],
  "quelle": ["Quelle: Berechnung GRENFORD; Kaufpreisverteilung 2,5 / 2,8 Mio. € als Modellannahme, keine zugesagte Verkäuferkondition. Vorsichtig: 4.500 €/m², Verkauf ein Jahr später, Nebenkosten 15 %, Eigentümerkosten 8 %, Exit 8,0 %.",
             "Basis: 5.000 €/m², Nebenkosten 10 %, Eigentümerkosten 5 %, Exit 7,0 %. Chance: 5.250 €/m², Exit 6,5 %. Kurve Listenpreis: Mehrpreis 1,7 Mio. € und höhere Erwerbsnebenkosten in 2026 unterstellt. Vor Steuern, ohne Finanzierung."]})

# 20 Sensitivität und DCF
S.append({"modul": "raster", "id": "sensitivitaet", "kopf": "10-Jahres-Rechnung", "dachzeile": "Sensitivität und DCF", "titel": "Rendite und Barwert im Stresstest",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 400, "titel": "Szenarien im Vergleich, 10 Jahre", "breiten": [76, 54, 54, 50, 54, 58, 54], "hervorheben": ["Basis"],
     "kopf": ["Szenario", "IRR EC", "Mult. EC", "Mio. €", "IRR LP", "Mult. LP", "Mio. €"],
     "zeilen": [["Vorsichtig", "10,6 %", "1,42-fach", "7,1", "6,6 %", "1,28-fach", "5,3"], ["Basis", "23,1 %", "1,62-fach", "10,3", "14,1 %", "1,46-fach", "8,5"], ["Chance", "26,8 %", "1,70-fach", "11,6", "16,5 %", "1,53-fach", "9,8"]]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 22, "w": 400, "titel": "DCF: Barwert (NPV) nach Diskontsatz, Mio. €", "breiten": [100, 100, 100, 100], "hervorheben": ["10 %"],
     "kopf": ["Diskontsatz", "Early-Commit", "Listenpreis", "Vorteil"],
     "zeilen": [["8 %", "4,61", "2,59", "2,02"], ["10 %", "3,68", "1,62", "2,07"], ["12 %", "2,89", "0,78", "2,11"]]},
    {"typ": "tabelle", "x": 482, "y": 410, "w": 374, "titel": "IRR Early-Commit: Verkaufspreis × Exit-Rendite", "breiten": [110, 88, 88, 88],
     "kopf": ["€/m² brutto", "Exit 6,5 %", "Exit 7,0 %", "Exit 8,0 %"], "markiere": [[1, 2]],
     "zeilen": [["4.875", "21,8 %", "21,5 %", "20,9 %"], ["5.000", "23,4 %", "23,1 %", "22,6 %"], ["5.250", "26,8 %", "26,5 %", "26,0 %"]]},
    {"typ": "tabelle", "x": 482, "y": "folgt", "abstand": 22, "w": 374, "titel": "NPV Early-Commit: Diskontsatz × Exit-Rendite, Mio. €", "breiten": [110, 88, 88, 88],
     "kopf": ["Diskontsatz", "Exit 6,5 %", "Exit 7,0 %", "Exit 8,0 %"], "markiere": [[1, 2]],
     "zeilen": [["8 %", "4,8", "4,6", "4,3"], ["10 %", "3,9", "3,7", "3,4"], ["12 %", "3,0", "2,9", "2,6"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 26, "w": FULL, "box": True, "titel": "Aussage", "schrift": 8.2,
     "absaetze": ["Der Early-Commit hebt die IRR im Basisfall von 14,1 % auf 23,1 % und senkt den Kapitalbedarf um 1,8 Mio. €. Der Barwert bei 10 % Diskontsatz steigt von 1,62 auf 3,68 Mio. €. Auch im vorsichtigen Szenario bleibt die IRR bei Early-Commit zweistellig."]}],
  "quelle": ["Quelle: Berechnung GRENFORD; Annahmen siehe Seite {seite:szenarien}; EC = Early-Commit 5,3 Mio. €, LP = Listenpreis 7,0 Mio. €. Barwert: Jahres-Cashflows 2026 bis 2036 auf Ende 2026 diskontiert, vor Steuern, ohne Fremdfinanzierung.",
             "Fremdkapital (inkl. KfW) ist nicht enthalten. Keine Zusicherung künftiger Erträge."]})

# 21 Apartment-Käufer
S.append({"modul": "raster", "id": "apartment", "kopf": "Apartment-Käufer", "dachzeile": "Rendite für Einzelerwerber", "titel": "Zehn Jahre aus Sicht der Apartment-Käufer",
  "bloecke": [
    {"typ": "saeulen", "x": L0, "y": 410, "w": 400, "h": 200, "titel": "Apartment 55 (46,1 m²): Objektrendite auf 204.048 €", "max": 8,
     "kategorien": ["2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036"], "legende": False,
     "serien": [{"name": "Objektrendite", "werte": [4.5, 5.1, 5.5, 6.4, 6.6, 6.8, 6.9, 7.0, 7.2, 7.3],
                 "farben": ["navy"] * 5 + ["light"] * 5, "labels": ["4,5 %", "5,1 %", "5,5 %", "6,4 %", "6,6 %", "6,8 %", "6,9 %", "7,0 %", "7,2 %", "7,3 %"]}]},
    {"typ": "kpi", "x": L0, "y": 150, "w": 400, "hell": True, "groesse": 18, "items": [["129.234 €", "Überschuss in 10 Jahren", "63 % der Anschaffungskosten"], ["115.409 €", "bei konstant 60 % Auslastung", "Sensitivität"]]},
    {"typ": "tabelle", "x": 500, "y": 410, "w": 356, "titel": "Zahlenreihe", "breiten": [50, 70, 80, 78, 78], "schrift": 7.5, "zh": 14.6,
     "kopf": ["Jahr", "Auslastung", "Ø Erlös/Nacht", "Überschuss", "Kumuliert"],
     "zeilen": [["2027", "52,2 %", "102 €", "9.194 €", "9.194 €"], ["2028", "58,2 %", "104 €", "10.452 €", "19.646 €"], ["2029", "61,8 %", "106 €", "11.312 €", "30.958 €"],
                ["2030", "69,5 %", "108 €", "12.961 €", "43.920 €"], ["2031", "71,2 %", "110 €", "13.524 €", "57.444 €"], ["2032", "71,2 %", "112 €", "13.795 €", "71.239 €"],
                ["2033", "71,2 %", "114 €", "14.071 €", "85.310 €"], ["2034", "71,2 %", "117 €", "14.352 €", "99.662 €"], ["2035", "71,2 %", "119 €", "14.639 €", "114.301 €"],
                ["2036", "71,2 %", "121 €", "14.932 €", "129.234 €"]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 12, "w": 356, "schrift": 7.6,
     "absaetze": [["Dunkel:", "Verkäufermodell 2027 bis 2031. Hell: Fortschreibung GRENFORD mit Auslastung 71,2 % und Preis +2 % p. a."]]}],
  "quelle": "Quelle: Renditeberechnung Apt. 55 (Verkäufermodell 2027–2031); Fortschreibung GRENFORD (Auslastung konstant 71,2 %, Preis +2 % p. a., Kostenquote 53 %). Objektrendite vor Finanzierung und Steuern, inkl. Umsatzsteuereffekt des Modells; indikativ."})

# 22 Asset Check 1
S.append({"modul": "raster", "id": "check1", "kopf": "GRENFORD Asset Check", "dachzeile": "Teil 1 von 2 · Recht und Planung", "titel": "Genehmigungen und Eigentum liegen vor",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": FULL, "breiten": [250, 90, 465], "links": [0, 1, 2], "tags": [1], "schrift": 8, "zh": 24,
     "kopf": ["Unterlage", "Status", "Ergebnis"],
     "zeilen": [["Grundbuch Blatt 1077 (27.03.2025)", "Gesichtet", "ERIKONA GmbH eingetragen seit 2020; lastenfreie Übertragung Zug um Zug zu regeln"],
                ["Baugenehmigung 12.09.2023", "Gesichtet", "Umnutzung zu Coworking, Wellness, Therapie und Apartments; 17 Abweichungen und eine Befreiung erteilt"],
                ["Bebauungsplan „Im oberen Brühl – Nord“", "Im Datenraum", "In Kraft seit 19.04.2023, Sondergebiet"],
                ["Bauantragsänderung 20.09.2024, Baufreigabeschein", "Im Datenraum", "Änderungsantrag und Baufreigabe im Datenraum"],
                ["Teilungserklärung 14.08.2025, Abgeschlossenheitsbescheinigung", "Im Datenraum", "Aufteilung in Wohnungs- und Teileigentum vorbereitet"],
                ["Zusatzgrundstück Flst. 213: Kaufvertrag vom 03.08.2026", "Gesichtet", "6.511 m² Landwirtschaftsfläche, unerschlossen, lastenfrei geschuldet; Kaufpreis 70 T€ (ca. 10,75 €/m²)"],
                ["Auflagen der Genehmigung", "Gesichtet", "98 Kfz-Stellplätze, Barrierefreiheit, Brandschutz-Schlussabnahme, PV-Nachweis"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 22, "w": FULL, "box": True, "schrift": 8,
     "absaetze": [["Bis zum Signing:", "aktuelle Grundbuchauszüge der aufgeteilten Einheiten, Lastenfreistellung zum Vollzug und die Vollzugsschritte zu Flst. 213 (Vormerkung, Löschung der Sicherungshypothek, Vorkaufsrechtsverzicht der Gemeinde, Genehmigung nach Grundstückverkehrsrecht) samt Übertragungsstruktur in das Paket."],
                  ["Artenschutz:", "Die Fällung von 19 Fichten ist vom 01.11. bis 28.02. ohne zusätzliches Gutachten möglich."]]}],
  "quelle": "Quelle: Grundbuch Blatt 1077; Baugenehmigung Landratsamt Waldshut 12.09.2023. „Gesichtet“: von GRENFORD gelesen. „Im Datenraum“: vorhanden, Detailauswertung folgt. Der Asset Check ist keine Due Diligence im rechtlichen Sinne."})

# 23 Asset Check 2
S.append({"modul": "raster", "id": "check2", "kopf": "GRENFORD Asset Check", "dachzeile": "Teil 2 von 2 · Wirtschaft und Betrieb", "titel": "Die Ertragsbasis ist dokumentiert",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 400, "titel": "Ertragsbasis", "breiten": [270, 130], "kopf": ["Kennzahl", "Wert"],
     "zeilen": [["Eigentümerertrag Gewerbe stabilisiert (ab 2029)", "≈ 381 T€ p. a."], ["davon vertraglich garantiert (Mindestpacht)", "218 T€ p. a."],
                ["Verkaufspreis Apartments, Verkäuferplan", "5.000–5.100 €/m²"], ["Einschätzung Vertriebspartner (11/2025)", "4.875–5.250 €/m²"],
                ["Vertriebsprovision", "5 %"], ["Apartments (Wohnfläche)", "4.299 m²"]]},
    {"typ": "tabelle", "x": L0, "y": "folgt", "abstand": 22, "w": 400, "breiten": [290, 110], "links": [0, 1], "tags": [1], "kopf": ["Unterlage", "Status"],
     "zeilen": [["Ertragsprognosen, Rentabilität, Profit-Center (13.02.2026)", "Gesichtet"], ["Sales Plan, Apartments.xlsx, Renditeberechnung Apt. 55", "Gesichtet"],
                ["Betreiber- und Pachtverträge, Personalstruktur", "Im Datenraum"], ["Marktanalysen (B2B, Büro/Lager, Entwicklung)", "Im Datenraum"]]},
    {"typ": "kv", "x": 500, "y": 410, "w": 356, "kw": 82, "titel": "Einordnung", "schrift": 8,
     "zeilen": [["Zielgruppen", "Apartments für Grenzgänger, Remote Worker, Corporate Housing und Gesundheitsgäste."],
                ["Betreiber", "Coworking, Fitness und Physio/Kosmetik über die konzernverbundene Montesana Hospitality &amp; Coworking GmbH, Arztpraxis per Direktmiete. Verhandlungen mit IWG/Regus laufen."],
                ["Auslastung", "Das Verkäufermodell plant 52 % (2027) bis 71 % (2031). Break-even für 4 % Objektrendite bei ca. 45 % Auslastung."],
                ["Marktreferenz", "Höchenschwand 33 % Bettenauslastung (2018). Das Konzept mit Coworking und Medizin zielt auf eine höhere Auslastung als klassische Ferienwohnungen."]]},
    {"typ": "text", "x": 500, "y": "folgt", "abstand": 18, "w": 356, "box": True, "schrift": 8,
     "absaetze": [["Bis zum Signing:", "unterzeichnete Betreiberverträge mit Mindestpacht, eigene Marktstudie und Verkaufsstand der Apartments."]]}],
  "quelle": "Quelle: Ertragsprognosen MonteSana; Sales Plan; LBS-Schreiben 20.11.2025; Apartments.xlsx; Renditeberechnung Apt. 55."})

# 24 Machbarkeit 1
S.append({"modul": "raster", "id": "machbar1", "kopf": "Machbarkeitsstudie", "dachzeile": "Teil 1 von 2 · Planung, Technik und Bau", "titel": "Rechtlich und technisch machbar",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": FULL, "breiten": [140, 555, 110], "links": [0, 1, 2], "tags": [2], "schrift": 8, "zh": 26,
     "kopf": ["Dimension", "Befund", "Machbarkeit"],
     "zeilen": [["Planungsrecht", "Bebauungsplan 04/2023 in Kraft, Sondergebiet; Nutzung Coworking, Wellness, Therapie und Apartments genehmigt", "Gegeben"],
                ["Genehmigungsstand", "Baugenehmigung 09/2023, Änderung 09/2024, Baufreigabeschein im Datenraum", "Gegeben"],
                ["Brandschutz", "17 Abweichungen genehmigt, Kompensation durch Brandmeldeanlage und Rauchwarnmelder; Schlussabnahme vorgesehen", "Mit Maßgaben"],
                ["Energetik", "KfW-Effizienzhaus 40 geplant, Wärmepumpen-Vorbereitung und PV im Bauzeitplan", "Mit Maßgaben"],
                ["Bauablauf", "Drei Bauabschnitte 04/2026 bis 10/2027, Höhenlage 1.015 m (Winterfenster beachten)", "Mit Maßgaben"],
                ["Baugrund / Statik", "Bodengutachten und Tragwerksplanung im Datenraum", "Gegeben"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 22, "w": FULL, "box": True, "schrift": 8.2,
     "absaetze": ["Die Maßgaben sind Umsetzungsaufgaben, keine Hindernisse: Nachweise zum Brandschutz und zur Energieeffizienz (KfW) sowie ein Winterpuffer im Bauzeitplan."]}],
  "quelle": "Quelle: Baugenehmigung 12.09.2023 (Nebenbestimmungen); Bauzeitplan; Exposé; Datenraum MonteSana. Die Machbarkeitsaussagen sind Einschätzungen von GRENFORD auf Basis der Unterlagen, kein Fachgutachten."})

# 25 Machbarkeit 2
S.append({"modul": "raster", "id": "machbar2", "kopf": "Machbarkeitsstudie", "dachzeile": "Teil 2 von 2 · Betrieb und Ergebnis", "titel": "Machbar mit klaren Maßgaben",
  "bloecke": [
    {"typ": "tabelle", "x": L0, "y": 410, "w": 420, "titel": "Ergebnis der Machbarkeitsprüfung", "breiten": [110, 210, 100], "links": [0, 1, 2], "tags": [2], "schrift": 7.7, "zh": 17,
     "kopf": ["Kriterium", "Ergebnis", "Bewertung"],
     "zeilen": [["Planung und Genehmigung", "Alle wesentlichen Genehmigungen liegen vor", "Gegeben"], ["Technik und Bauablauf", "Drei Bauabschnitte, Maßgaben zu Brandschutz und Energetik", "Mit Maßgaben"],
                ["Kosten", "Restbudget 8,66 Mio. € netto, Nebenkosten ergänzt", "Mit Maßgaben"], ["Markt und Lage", "Grenzgängerpotenzial, Kurortstatus", "Gegeben"],
                ["Betrieb", "Vier Profit-Center, Verträge zu finalisieren", "Mit Maßgaben"], ["Wirtschaftlichkeit", "IRR 10,6 bis 26,8 % (Szenarien), Break-even Cashflow 2029", "Gegeben"]]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 20, "w": 420, "box": True, "titel": "Gesamtergebnis", "schrift": 8,
     "absaetze": ["Das Vorhaben ist auf Basis der Unterlagen machbar. Die Maßgaben lassen sich bis zum Signing und in der Bauphase abarbeiten."]},
    {"typ": "saeulen", "x": 520, "y": 410, "w": 336, "h": 190, "titel": "Operatives Ergebnis aller Profit-Center in T€", "max": 731, "breite": .4, "legende": False,
     "kategorien": ["Jahr 2 (≈ 2027)", "Jahr 3 (≈ 2028)", "Jahr 4 (≈ 2029)"],
     "serien": [{"name": "Operatives Ergebnis", "farben": ["light", "acc", "navy"], "werte": [182, 635, 731], "labels": ["182 T€", "635 T€", "731 T€"]}]},
    {"typ": "text", "x": 520, "y": "folgt", "abstand": 8, "w": 336, "schrift": 7.8,
     "absaetze": ["Ab Jahr 4 rund 730 T€ operatives Ergebnis; davon fließen stabilisiert rund 381 T€ an die Eigentümerin."]}],
  "quelle": "Quelle: Einschätzung GRENFORD auf Basis der Datenraum-Dokumente; Montesana Rentabilität / Profitcenter 260213 (Jahr 2 ≈ 2027). Keine Zusicherung. Die Machbarkeitsstudie ersetzt weder Gutachten noch Fachplanung."})

# 26 Value Matrix
S.append({"modul": "raster", "id": "matrix", "kopf": "Value Matrix", "dachzeile": "Stärken, Hebel, Chancen, Risiken", "titel": "Stärken nutzen, Hebel definieren",
  "bloecke": [
    {"typ": "matrix", "x": L0, "y": 412, "w": FULL, "h": 300, "schrift": 7.6, "zellen": [
      {"titel": "Stärken", "akzent": True, "punkte": [["Genehmigtes Projekt.", "Baugenehmigung 09/2023, Teilungserklärung 08/2025, Planungsrecht abgeschlossen."], ["Grenzraum-Standort.", "20 km zur Schweizer Grenze, 14.668 Grenzgänger im Kreis Waldshut."],
         ["Vier Ertragssäulen.", "92 Apartments plus vier Profit-Center auf 2.658 m²."], ["Einstiegspreis.", "5,3 statt 7,0 Mio. €; optionale Kaufpreisstaffelung; Zusatzgrundstück im Paket."]]},
      {"titel": "Hebel", "punkte": [["Auslastung absichern.", "Planung 52 bis 71 %: Betreiberverträge und Marktstudie; Break-even für 4 % Objektrendite bei ca. 45 %."], ["Betreiberverträge.", "Mindestpacht (218 T€ p. a.) vertraglich finalisieren; Verhandlungen mit IWG/Regus laufen."],
         ["Finanzierungsstruktur.", "Fremdkapital, KfW-Programme und Sicherheiten bis zum Signing aufsetzen."], ["Kostenbasis.", "Mengengerüst und Reserve (10 %) vor Vergabe der Gewerke verifizieren."]]},
      {"titel": "Chancen", "akzent": True, "punkte": [["Grenzgänger und Workation.", "Wohnen auf Zeit und Coworking im Grenzraum."], ["Kombinationsangebot.", "Kein vergleichbares Gesamtkonzept im 50-km-Radius (GRENFORD Research)."],
         ["Exit-Optionen.", "Einzelverkauf der Apartments, Gesamtverkauf oder Halten der Gewerbeflächen; IRR im Basisfall 23,1 %."], ["ESG und Fläche.", "KfW-40-Förderfähigkeit; Flst. 213 als Flächenreserve, planungsrechtlich zu prüfen."]]},
      {"titel": "Marktrisiken", "punkte": [["Zins- und Kapitalmarkt.", "Wirkt auf Finanzierung und Exit-Rendite (Sensitivität 6,5 bis 8,0 %)."], ["Bauablauf auf 1.015 m.", "Winterfenster und Lieferketten: Puffer im Bauzeitplan."],
         ["Ferienwohnungs-Wettbewerb.", "Rund 82 Unterkünfte, 52 bis 110 € je Nacht; Planpreis am oberen Ende."], ["Regulierung.", "Brandschutz- und Energierecht; 17 genehmigte Abweichungen mit Kompensation umzusetzen."]]}]},
    {"typ": "text", "x": L0, "y": "folgt", "abstand": 14, "w": FULL, "schrift": 8,
     "absaetze": [["Investor Insight:", "MonteSana verbindet genehmigten Planungsstand und Grenzraum-Standort mit einem Einstiegspreis samt Zahlungsoption. Die Maßgaben liegen in Betrieb, Finanzierung und Bauablauf. Vertiefte Wirtschaftlichkeitsmodelle und Exit-Strategien stellen wir im Rahmen vertraulicher Gespräche zur Verfügung."]]}],
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

# Listenpreis-Kurve = Early-Commit-Kurve minus Preisvorteil 1,7 Mio. € (Zahlung 2026) und höhere Nebenkosten (0,12 Mio. €); Endwert laut Rechnung 8,5 Mio. €
lp = [-5.62, -10.18, -4.07, -0.28, 0.09, 0.47, 0.86, 1.25, 1.65, 2.06, 8.5]
for p in S:
    for b in p.get('bloecke', []):
        for sr in b.get('serien', []):
            if sr.get('werte') == 'LP': sr['werte'] = lp

json.dump({"meta": meta, "kosten": {"einheiten": []}, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
