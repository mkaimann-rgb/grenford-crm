# Muster Renovation Memo im neuen GRENFORD-CI (Bereich „projects“, Terrakotta/Lehm) auf Basis des abgeschlossenen
# Memos Gutshaus Fresdorf, 2. Angebotsrunde (Okt. 2026). Nur Musterseiten zur Abstimmung von Farbe und neuen Modulen.
import json, os, itertools
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')
MWST = 1.19
OBER = 250000
# Angebote 2. Runde (brutto / netto) laut Memo
A, B, C = 360051.06, 526658.43, 392399.12
# Fehlende Leistungen, indikativ brutto (Ansätze aus den Vergleichsangeboten)
HEIZ_A = 23132.50 * MWST            # Heizboden-Option A
LIFT = 25500 * MWST                 # Podest und Hublift, Budget aus Angebot B ohne PM
KLIMA = 8250 * MWST                 # Klima DG, Ansatz aus Angebot A
A_ber = A + HEIZ_A + LIFT; C_ber = C + LIFT + KLIMA
def e(v, d=0): return f'{v:,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'
def t(v): return f'{v/1000:.1f}'.replace('.', ',')
def p(v): return f'{v:+.1f}'.replace('.', ',').replace('-', '−') + ' %'
print('A_ber', round(A_ber), 'C_ber', round(C_ber))

# Kumulierte Nettokosten in Gewerkefolge (Werte laut Kostenvergleich des Memos)
G = ["Baustelle", "Trockenbau", "Elektro", "Sanitär", "Fliesen", "Boden", "Maler", "Türen", "Außen", "UG-Block", "PM 15 %", "Nachlass"]
NA = [36234.10, 17739.51, 35383.15, 89181.45, 17936.69, 18412.54, 43601.37, 12134.96, 0, 48345.09, 0, -16404.94]
NB = [39883.03, 27210.00, 32850.00, 124198.00, 38327.44, 20913.60, 50771.50, 20330.00, 30360.00, 0, 57726.54, 0]
NC = [61314.74, 25996.31, 39961.25, 87103.51, 33123.56, 25204.39, 54911.80, 15129.90, 4356.81, 0, 0, -17355.11]
cum = lambda xs: [round(v / 1000, 1) for v in itertools.accumulate(xs)]

meta = {"titel": "GRENFORD Renovation Memo – Muster Gutshaus Fresdorf", "fusszeile": "GRENFORD PROJECTS / GUTSHAUS FRESDORF · RENOVATION MEMO",
        "ausgabe": "GRENFORD_Renovation_Memo_Muster_Projects_CI.pdf", "redaktionsstand": "25.11.2026", "agb_stand": "18.11.2026",
        "bereich": "projects", "typo": "sans", "dokument": "Renovation Memo"}
S = []
S.append({"modul": "titel", "id": "titel", "bild": "gutshaus.jpg", "bild_pos": "center 40%", "dachzeile": "Renovation Memo · Zweite Angebotsrunde",
  "vertraulich": ["Persönlich", "Vertraulich"], "titel": ["GUTSHAUS", "FRESDORF"], "untertitel": ["Partnervergleich", "und Entscheidung"],
  "kurz": ["Drei Angebote, anonymisiert A / B / C", "Kosten, Konditionen und Leistungen", "Klar bis zur Unterschrift"],
  "adresse": ["Luckenwalder Straße 211", "14552 Michendorf OT Fresdorf"],
  "kennzahlen": [["ca. 343 m²", "Wohnfläche"], ["3", "Angebote"], ["230–250 Tsd. €", "Budget brutto"], ["Okt. 2026", "Zweite Runde"]],
  "hinweis": "Muster im neuen GRENFORD-Projects-CI · Daten aus dem Renovation Memo Gutshaus Fresdorf, Oktober 2026"})

# NEU 1: Entscheidung auf einen Blick
S.append({"modul": "raster", "id": "blick", "kopf": "Auf einen Blick", "dachzeile": "Neu · Die Entscheidung auf einer Seite", "titel": "Drei Angebote, eine Empfehlung",
  "intro": "Alle drei Angebote liegen über der Obergrenze von 250.000 € brutto. A hat den kleinsten Abstand, Festpreis und Gewährleistung; B bildet den breitesten Umfang ab; C ist günstig, braucht aber Absicherung.",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 384, "w": 560, "h": 64, "groesse": 22, "gap": 12,
     "items": [{"wert": e(A), "label": f"Baupartner A · {p((A/OBER-1)*100)}", "text": "Festpreis, 5 Jahre Gewährleistung, 10 / 90 Zahlung"},
               {"wert": e(B), "label": f"Baupartner B · {p((B/OBER-1)*100)}", "stil": "hell", "text": "Breitester Umfang, freibleibend, 15 % Projektmanagement"},
               {"wert": e(C), "label": f"Baupartner C · {p((C/OBER-1)*100)}", "text": "Festpreis, 30 % Anzahlung, Unternehmen in Gründung"}]},
    {"typ": "balken", "x": 51, "y": "folgt", "abstand": 26, "w": 560, "lw": 110, "vw": 120, "max": 560000, "titel": "Angebotssumme brutto im Vergleich zur Obergrenze", "abstand": 30, "bh": 16,
     "items": [["Obergrenze", OBER, "250.000 €", "h"], ["Baupartner A", A, e(A)], ["Baupartner C", C, e(C)], ["Baupartner B", B, e(B)]]},
    {"typ": "dunkel", "x": 640, "y": 384, "w": 216, "h": 300, "titel": "Unsere Einschätzung", "abstand": 74,
     "werte": [["A", "Zuerst prüfen", 40], ["B · C", "Im Blick behalten", 30]],
     "text": "A klären: Heizboden-Option, Küchenabgrenzung, Dachnacharbeiten deckeln. Danach entscheidet ihr."}],
  "quelle": "Quelle: Angebote der Baupartner, 2. Runde (Stand 14. bis 24.10.2026); GRENFORD-Auswertung. Prozentwerte: Abstand zur Obergrenze von 250.000 € brutto."})

# NEU 2: Bereinigter Vergleich
S.append({"modul": "raster", "id": "bereinigt", "kopf": "Bereinigter Vergleich", "dachzeile": "Neu · Gleicher Umfang, vergleichbare Summe", "titel": "Was jedes Angebot vollständig kostet",
  "intro": "Die Angebote decken nicht denselben Umfang ab. Ergänzt man die Leistungen, die nur einzelne Partner anbieten, mit den Ansätzen aus den anderen Angeboten, rücken A und C eng zusammen – B bleibt deutlich darüber.",
  "bloecke": [
    {"typ": "hstack", "x": 51, "y": 372, "w": 805, "lw": 150, "sw": 110, "max": 560000, "bh": 30, "abstand": 58, "titel": "Angebot brutto und indikative Ergänzungen, €",
     "zeilen": [["Baupartner A", [[A, "navy", "Angebot 360,1 Tsd."], [HEIZ_A, "acc", "Heizboden"], [LIFT, "light", "Podest/Lift"]], e(A_ber)],
                ["Baupartner C", [[C, "navy", "Angebot 392,4 Tsd."], [LIFT, "light", "Podest/Lift"], [KLIMA, "mid", "Klima"]], e(C_ber)],
                ["Baupartner B", [[B, "navy", "Angebot 526,7 Tsd. · Umfang vollständig"]], e(B)]]},
    {"typ": "kpi", "x": 51, "y": 150, "w": 805, "h": 54, "groesse": 20, "gap": 12,
     "items": [{"wert": e(C_ber - A_ber), "label": "Abstand C zu A, bereinigt"}, {"wert": e(B - A_ber), "label": "Abstand B zu A, bereinigt", "stil": "hell"},
               {"wert": e(A_ber - OBER), "label": "A bereinigt über Obergrenze"}]}],
  "quelle": ["GRENFORD-Auswertung, indikativ: Heizboden laut Option A (23.132,50 € netto), Podest und Lift laut Budget B ohne PM (25.500 € netto), Klima laut A (8.250 € netto), jeweils zzgl. 19 % MwSt.",
             "Mengen, Ausführung und Rabatt auf Ergänzungen sind nicht geprüft. Keine Wertung der Qualität."]})

# NEU 3: Entscheidungsmatrix
S.append({"modul": "raster", "id": "matrix", "kopf": "Entscheidungsmatrix", "dachzeile": "Neu · Kriterien statt Bauchgefühl", "titel": "Wo jeder Partner stark ist",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 805, "breiten": [165, 80, 133, 80, 133, 80, 134], "links": [0, 2, 4, 6], "tags": [1, 3, 5], "zh": 42, "schrift": 8.8,
     "kopf": ["Kriterium", "A", "", "B", "", "C", ""],
     "zeilen": [["Summe und Budget", "gut", "Kleinster Abstand, +44 %", "Prüfen", "+111 % über Obergrenze", "Mittel", "+57 % über Obergrenze"],
                ["Preisart", "gut", "Festpreisgarantie", "Prüfen", "Freibleibend, Regie 65 €/h", "gut", "Festpreis je Gewerk"],
                ["Zahlung", "gut", "10 % / 90 % nach Fortschritt", "gut", "Abschläge nach Leistung", "Prüfen", "30 % Anzahlung"],
                ["Gewährleistung", "gut", "5 Jahre", "Prüfen", "Nicht ausgewiesen", "gut", "5 Jahre"],
                ["Umfang", "Mittel", "Heizboden optional, ohne Lift", "gut", "Vollständig inkl. Lift, Klima", "Mittel", "Ohne Lift und Klima"],
                ["Unternehmen", "gut", "Etabliert", "gut", "Etabliert, PM inklusive", "Prüfen", "In Gründung, ohne Register"],
                ["Zeitplan", "gut", "Fertig Ende April 2027", "Mittel", "16 Wochen Annahme", "Prüfen", "Start nach Eintragung"]]}],
  "quelle": "GRENFORD-Einordnung auf Basis der Angebote; keine Referenz- oder Bonitätsprüfung. „Prüfen“ heißt: vor der Unterschrift schriftlich klären, nicht ausgeschlossen."})

# NEU 4: Zahlungsplan
S.append({"modul": "raster", "id": "zahlung", "kopf": "Zahlung und Absicherung", "dachzeile": "Neu · Was ihr wann zahlt", "titel": "Zahlungspläne im Vergleich",
  "bloecke": [
    {"typ": "saeulen", "x": 51, "y": 410, "w": 470, "h": 250, "titel": "Brutto in Tsd. €, nach Zahlungszeitpunkt", "gestapelt": True, "max": 560,
     "kategorien": ["Baupartner A", "Baupartner B", "Baupartner C"],
     "serien": [{"name": "Bei Unterschrift", "farbe": "acc", "werte": [A * .10 / 1000, 0, C * .30 / 1000]},
                {"name": "Nach Baufortschritt", "farbe": "navy", "werte": [A * .90 / 1000, B / 1000, C * .70 / 1000]}],
     "summen": [t(A), t(B), t(C)]},
    {"typ": "kv", "x": 560, "y": 410, "w": 296, "kw": 76, "titel": "Absicherung", "schrift": 8.4,
     "zeilen": [["A", f"10 % = {e(A*.10)} bei Unterschrift für Planung und Organisation; Rest nach Baufortschritt."],
                ["B", "Abschläge nach dokumentiertem Leistungsstand; vor Unterschrift Festpreis oder Kostendeckel vereinbaren."],
                ["C", f"30 % = {e(C*.30)} bei Beauftragung, Unternehmen in Gründung: Anzahlung über Bürgschaft oder Treuhand absichern."]]},
    {"typ": "text", "x": 560, "y": "folgt", "abstand": 16, "w": 296, "box": True, "schrift": 8.4,
     "absaetze": [["Faustregel:", "Je höher die Vorauszahlung, desto wichtiger ist eine Sicherheit, bevor Geld fließt."]]}],
  "quelle": "Zahlungsbedingungen laut Angeboten der 2. Runde; Beträge brutto, gerundet. Keine Liquiditätsplanung."})

# BESTEHEND: Kostenverlauf im neuen CI
S.append({"modul": "raster", "id": "verlauf", "kopf": "Kostenverlauf", "dachzeile": "Bestehendes Modul im neuen CI", "titel": "Wo die Kosten auseinandergehen",
  "bloecke": [
    {"typ": "linie", "x": 51, "y": 410, "w": 805, "h": 250, "titel": "Kumulierte Nettokosten in Tsd. €, Gewerkefolge", "achse": [0, 450, 50], "kategorien": G,
     "serien": [{"name": "Baupartner A", "farbe": "navy", "werte": cum(NA), "ende": "A " + t(sum(NA))},
                {"name": "Baupartner B", "farbe": "acc", "werte": cum(NB), "ende": "B " + t(sum(NB))},
                {"name": "Baupartner C", "farbe": "mid", "werte": cum(NC), "ende": "C " + t(sum(NC)), "dy": 8}]}],
  "quelle": f"GRENFORD-Auswertung der Netto-Kostengruppen; Reihenfolge entspricht einer typischen Bauabfolge, keine Terminplanung. Obergrenze 250.000 € brutto = {e(OBER/MWST)} netto."})

json.dump({"meta": meta, "kosten": {"einheiten": []}, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
