# GRENFORD Renovation Memo – Vorlage im neuen CI (Bereich „projects“, Farben laut Projects-Brand-Kit),
# aufgebaut am abgeschlossenen Memo Gutshaus Fresdorf, 2. Angebotsrunde (Oktober 2026). 22 Seiten.
# Quelle aller Zahlen: Renovation Memo Gutshaus Fresdorf (Angebote der Baupartner, Stand 14.–24.10.2026).
import json, os, itertools
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')
MWST = 1.19
OBER = 250000
A, B, C = 360051.06, 526658.43, 392399.12                 # Angebotssummen brutto, 2. Runde
A1, B1, C1 = 351571.43, 630573.56, 299361.68              # 1. Runde
AN, BN, CN = 302563.92, 442570.11, 329747.16              # netto
HEIZ_A = 23132.50 * MWST; LIFT = 25500 * MWST; KLIMA = 8250 * MWST
A_ber = A + HEIZ_A + LIFT; C_ber = C + LIFT + KLIMA
def e(v, d=0): return f'{v:,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'
def t(v): return f'{v/1000:.1f}'.replace('.', ',')
def pz(v): return f'{v:+.1f}'.replace('.', ',').replace('-', '−').replace('+', '+') + ' %'

G = ["Baustelle", "Trockenbau", "Elektro", "Sanitär", "Fliesen", "Boden", "Maler", "Türen", "Außen", "UG-Block", "PM 15 %", "Nachlass"]
NA = [36234.10, 17739.51, 35383.15, 89181.45, 17936.69, 18412.54, 43601.37, 12134.96, 0, 48345.09, 0, -16404.94]
NB = [39883.03, 27210.00, 32850.00, 124198.00, 38327.44, 20913.60, 50771.50, 20330.00, 30360.00, 0, 57726.54, 0]
NC = [61314.74, 25996.31, 39961.25, 87103.51, 33123.56, 25204.39, 54911.80, 15129.90, 4356.81, 0, 0, -17355.11]
for n, s_ in (('A', NA), ('B', NB), ('C', NC)): print(n, round(sum(s_), 2))
cum = lambda xs: [round(v / 1000, 1) for v in itertools.accumulate(xs)]
KG = ["Baustelle & Rückbau", "Trockenbau / Rohbau", "Elektro", "Sanitär & Heizung", "Fliesen", "Boden", "Maler & Lack", "Türen & Fenster",
      "Außen, Küche & Sonstiges", "UG-Sammelposition", "Planung & PM 15 %", "Nachlass 5 %"]
def zelle(v): return '—' if v == 0 else ('−' if v < 0 else '') + e(abs(v), 2)

meta = {"titel": "GRENFORD Renovation Memo – Gutshaus Fresdorf", "fusszeile": "GRENFORD PROJECTS / GUTSHAUS FRESDORF · RENOVATION MEMO · VERTRAULICH",
        "ausgabe": "GRENFORD_Renovation_Memo_Gutshaus_Fresdorf_Vorlage.pdf", "redaktionsstand": "24.10.2026", "agb_stand": "24.10.2026",
        "bereich": "projects", "typo": "sans", "dokument": "Renovation Memo"}
FB = "Quelle: Angebote der Baupartner (Stand 14.–24.10.2026), Umbauübersicht 10.10.2026; GRENFORD-Auswertung."
S = []

# ---------------- Vorspann
S.append({"modul": "titel", "id": "titel", "bild": "gutshaus.jpg", "bild_pos": "center 40%", "dachzeile": "Renovation Memo · Zweite Angebotsrunde",
  "vertraulich": ["Persönlich", "Vertraulich"], "titel": ["GUTSHAUS", "FRESDORF"], "untertitel": ["Partnervergleich", "und Entscheidung"],
  "kurz": ["Drei Angebote, anonymisiert A / B / C", "Kosten, Konditionen und Leistungen", "Klar bis zur Unterschrift"],
  "adresse": ["Luckenwalder Straße 211", "14552 Michendorf OT Fresdorf"],
  "kennzahlen": [["ca. 343 m²", "Wohnfläche"], ["3", "Angebote"], ["230–250 Tsd. €", "Budget brutto*"], ["Okt. 2026", "Zweite Runde"]],
  "hinweis": "* Budgetrahmen und Bruttobezug noch zu bestätigen · Wohnfläche laut Objektunterlagen"})
S.append({"modul": "inhalt", "id": "inhalt", "bereich": "vor", "bild": "luftbild.jpg", "bild_pos": "center", "ueberblick": "Euer Überblick",
  "claim": ["Euer Vorhaben,", "klar im Überblick"], "marke": "Gutshaus Fresdorf · Renovation Memo", "text": ["So führt euch das Memo", "zur Entscheidung"],
  "adresse": ["Luckenwalder Straße 211", "14552 Michendorf OT Fresdorf"],
  "kapitel": [{"titel": "Vorwort und Entscheidung auf einen Blick", "sub": "Persönliche Einordnung und Ergebnis auf einer Seite", "seiten": ["vorwort", "blick"]},
              {"titel": "Eure Richtung", "sub": "Wünsche, Budget und Prozess", "seiten": ["wuensche"]},
              {"titel": "Das Haus", "sub": "Bestand und Wunschplanung", "seiten": ["bestand", "plaene"]},
              {"titel": "Die Angebote", "sub": "Entwicklung seit Runde 1, drei Angebote im Porträt", "seiten": ["runden", "angebot-c"]},
              {"titel": "Die Analyse", "sub": "Kosten, Verlauf, bereinigter Vergleich, Matrix, Zahlung", "seiten": ["kosten", "zahlung"]},
              {"titel": "Die Entscheidung", "sub": "Klärung vor der Unterschrift und Einschätzung", "seiten": ["klaerung", "einschaetzung"]},
              {"titel": "Kontakt und Anhang", "sub": "Nächster Schritt, GRENFORD, Transparenz und AGB", "seiten": ["kontakt", "agb"]}]})
S.append({"modul": "vorwort", "id": "vorwort", "bereich": "vor", "dachzeile": "Persönlich für euch", "titel": "Eure Wünsche, euer Weg",
  "gruss": "Euer Marco",
  "lead": "Nach unseren Vor-Ort-Terminen haben alle drei Bauunternehmen neue, angepasste Angebote erstellt. Dieses zweite Renovation Memo ist eure Grundlage für die finale Entscheidung.",
  "links": "Wir vergleichen weiterhin anonymisiert als A, B und C, in der Reihenfolge des ersten Memos. Das Memo ordnet Leistungen, Konditionen und Kosten und zeigt, was vor einer Unterschrift noch zu klären ist.",
  "rechts": "Ein ehrliches Wort zu den Kosten: Durch den größeren Umfang ist es bei allen teurer geworden als gedacht. Alle drei sind euch im Preis entgegengekommen, jeder in seinem Rahmen.",
  "schluss": "Ihr entscheidet, wen ihr beauftragt. Ich berate euch dabei und bleibe bis zur Fertigstellung an eurer Seite – für euch ist meine Begleitung kostenfrei."})
S.append({"modul": "raster", "id": "blick", "bereich": "vor", "kopf": "Auf einen Blick", "dachzeile": "Die Entscheidung auf einer Seite", "titel": "Drei Angebote, eine Empfehlung",
  "intro": "Alle drei Angebote liegen über der Obergrenze von 250.000 € brutto. A hat den kleinsten Abstand, Festpreis und Gewährleistung; B bildet den breitesten Umfang ab; C ist günstig, braucht aber Absicherung.",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 384, "w": 560, "h": 64, "groesse": 22, "gap": 12,
     "items": [{"wert": e(A), "label": f"Baupartner A · {pz((A/OBER-1)*100)}", "text": "Festpreis, 5 Jahre Gewährleistung, Zahlung 10 / 90"},
               {"wert": e(B), "label": f"Baupartner B · {pz((B/OBER-1)*100)}", "stil": "hell", "text": "Breitester Umfang, freibleibend, 15 % Projektmanagement"},
               {"wert": e(C), "label": f"Baupartner C · {pz((C/OBER-1)*100)}", "text": "Festpreis, 30 % Anzahlung, Unternehmen in Gründung"}]},
    {"typ": "balken", "x": 51, "y": "folgt", "abstand": 26, "w": 560, "lw": 110, "vw": 120, "max": 560000, "titel": "Angebotssumme brutto im Vergleich zur Obergrenze", "abstand": 30, "bh": 16,
     "items": [["Obergrenze", OBER, "250.000 €", "h"], ["Baupartner A", A, e(A)], ["Baupartner C", C, e(C)], ["Baupartner B", B, e(B)]]},
    {"typ": "dunkel", "x": 640, "y": 384, "w": 216, "h": 300, "titel": "Unsere Einschätzung", "abstand": 74,
     "werte": [["A", "Zuerst prüfen", 42, "o"], ["B · C", "Im Blick behalten", 30]],
     "text": "A klären: Heizboden-Option, Küchenabgrenzung, Dachnacharbeiten deckeln. Danach entscheidet ihr."}],
  "quelle": FB + " Prozentwerte: Abstand zur Obergrenze von 250.000 € brutto."})

# ---------------- Eure Richtung
S.append({"modul": "raster", "id": "wuensche", "kopf": "Eure Richtung", "dachzeile": "Das habt ihr GRENFORD anvertraut", "titel": "Euer Alltag, eure Vorgaben",
  "intro": "Diese Wünsche und Budgetangaben bilden die Aufgabenbasis, auf der die Angebote eingeholt wurden. Bei den Terminen vor Ort haben wir sie mit den Baupartnern besprochen.",
  "bloecke": [
    {"typ": "kv", "x": 51, "y": 382, "w": 560, "kw": 120, "schrift": 8.6,
     "zeilen": [["Dachgeschoss · neu ordnen", "Küche, Wohnen und Essen neu strukturieren; Bad und WC, Heizboden in Zementoptik, Dielen und Klimageräte. Gehobener Standard."],
                ["Erdgeschoss · zwei Appartements", "Altersgerechte Bäder, Küchenanschlüsse und teils neue Böden. Mittlerer bis gehobener Standard."],
                ["Untergeschoss · funktional", "Großformatfliesen, Bad, Waschküche und Trocknungssystem. Einfacher bis mittlerer Standard."],
                ["Erhalten und ergänzen", "Dielen weiß/grau ölen; Türen, Wandleisten und Rundbögen bewahren. Bodengleiche Duschen, Schiebetüren, Podest und Lift prüfen."]]},
    {"typ": "dunkel", "x": 640, "y": 382, "w": 216, "h": 214, "titel": "Eure Budgetvorgabe", "abstand": 60,
     "werte": [["230–250", "Tsd. € brutto für den Bau", 34, "o"]],
     "text": "300.000 € Gesamtbudget abzüglich rund 70.000 € für zwei Küchen. Obergrenze und Bruttobezug gemeinsam bestätigen."},
    {"typ": "schritte", "x": 51, "y": 140, "w": 805,
     "items": [["01 · Erledigt", "Aufnehmen", "Wünsche, Bestand und Budget erfasst"], ["02 · Erledigt", "Vergleichen", "Erste Angebote als A / B / C analysiert"],
               ["03 · Erledigt", "Besprechen", "Unterschiede erläutert, Termine vereinbart"], ["04 · Erledigt", "Kennenlernen", "Vor Ort mit den Bauunternehmen"],
               ["05 · Wir sind hier", "Entscheiden", "Zweites Memo, finale Wahl"]]}],
  "quelle": "Grundlage: Umbauübersicht vom 10.10.2026 und persönliche Gespräche. Altersgerechte Ausstattung ist ein Planungsziel; eine DIN-konforme Barrierefreiheit ist mit dem Planstand nicht zugesichert."})

# ---------------- Das Haus
S.append({"modul": "bildseite", "id": "bestand", "kopf": "Der Bestand", "stil": "voll", "bild": "luftbild.jpg", "bild_pos": "center",
  "verlauf": [[.94, 0], [.92, 36], [.72, 50], [.32, 66], [.1, 84], [.04, 100]],
  "dachzeile": "Bestandsaufnahme", "titel": ["Der Bestand,", "euer Ausgangspunkt"],
  "text": "Für den Innenumbau betrachten wir das Gutshaus über drei Ebenen. Vorhandene Räume, Bodenaufbauten und Installationen werden mit euren neuen Nutzungswünschen zusammengeführt; dazu kommen die benannten Zugangsmaßnahmen.",
  "kennzahlen": [["343 m²", "Wohnfläche ca."], ["3", "Ebenen"], ["2", "Appartements EG"]],
  "hinweis": "Luftbild und Wohnfläche aus den Objektunterlagen; kein aktuelles Zustandsprotokoll."})
S.append({"modul": "raster", "id": "plaene", "kopf": "Planungsgrundlage", "dachzeile": "Wunschplanung · Version 10.10.2026", "titel": "Rot-Gelb-Pläne aller Ebenen",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 420, "w": 255, "h": 210, "bild": "plan-eg.png", "contain": True, "weiss": True, "pad": 6, "titel": "Erdgeschoss"},
    {"typ": "bild", "x": 318, "y": 420, "w": 280, "h": 210, "bild": "plan-dg.png", "contain": True, "weiss": True, "pad": 6, "titel": "Dachgeschoss"},
    {"typ": "bild", "x": 610, "y": 420, "w": 246, "h": 210, "bild": "plan-ansicht.png", "contain": True, "weiss": True, "pad": 6, "titel": "Ansicht mit Außenzugang"},
    {"typ": "bild", "x": 51, "y": 182, "w": 120, "h": 140, "bild": "plan-ug.png", "contain": True, "weiss": True, "pad": 4, "titel": "Untergeschoss"},
    {"typ": "bild", "x": 183, "y": 182, "w": 200, "h": 140, "bild": "bad.jpg", "titel": "Bestand · Bad"},
    {"typ": "bild", "x": 395, "y": 182, "w": 200, "h": 140, "bild": "flur.jpg", "titel": "Bestand · Flur"},
    {"typ": "text", "x": 610, "y": 182, "w": 246, "box": True, "schrift": 8.2, "h": 140,
     "absaetze": [["Planstand:", "Vorabzug. Außenpodest und Lift sind vorläufig; Maße, Statik und technische Umsetzbarkeit vor Ausführung prüfen."]]}],
  "quelle": "Originalpläne begradigt und proportional verkleinert; Bemaßung und Markierungen erhalten. Fotos: historische Aufnahmen aus den Objektunterlagen."})

# ---------------- Die Angebote
S.append({"modul": "raster", "id": "runden", "kopf": "Die Angebote", "dachzeile": "Vergleich der Angebotsrunden · brutto", "titel": "Was sich seit Runde 1 geändert hat",
  "intro": "Nach den Terminen vor Ort haben alle drei Bauunternehmen neu kalkuliert. Die Summen haben sich sehr unterschiedlich bewegt.",
  "bloecke": [
    {"typ": "saeulen", "x": 51, "y": 384, "w": 470, "h": 240, "titel": "Angebotssumme brutto in Tsd. €", "max": 650,
     "kategorien": ["Baupartner A", "Baupartner B", "Baupartner C"],
     "serien": [{"name": "Runde 1", "farbe": "light", "werte": [A1/1000, B1/1000, C1/1000], "labels": [t(A1), t(B1), t(C1)]},
                {"name": "Runde 2", "farbe": "acc", "werte": [A/1000, B/1000, C/1000], "labels": [t(A), t(B), t(C)]}]},
    {"typ": "kv", "x": 560, "y": 384, "w": 296, "kw": 36, "schrift": 8.4,
     "zeilen": [["A", f"{pz((A/A1-1)*100)} · {e(A-A1)}. 5 % Rabatt auf die Gesamtleistung enthalten."],
                ["B", f"{pz((B/B1-1)*100)} · −{e(B1-B)}. Weiterhin 123 Positionen, freibleibend; Einbaumöbel und Küchen nicht enthalten."],
                ["C", f"{pz((C/C1-1)*100)} · +{e(C-C1)}. 5 % Nachlass enthalten; Küchenmobiliar nicht mehr ausgewiesen."]]},
    {"typ": "text", "x": 560, "y": "folgt", "abstand": 16, "w": 296, "box": True, "schrift": 8.2,
     "absaetze": ["Die Umfänge beider Runden sind nicht deckungsgleich; der Vergleich zeigt Summen, keine Wertung."]}],
  "quelle": "Runde 1 laut erstem Memo (Oktober 2026), Runde 2 laut den Angeboten dieses Memos. Preisentwicklung berechnet aus den Bruttosummen."})

def angebot(pid, buchst, unter, titel, intro, zeilen, struktur, klaeren, summe, netto):
    return {"modul": "raster", "id": pid, "kopf": f"Angebot {buchst}", "dachzeile": f"Anonymisierter Baupartner · {unter}", "titel": titel,
      "bloecke": [
        {"typ": "dunkel", "x": 51, "y": 420, "w": 220, "h": 362, "oben": 112, "abstand": 150,
         "werte": [[buchst, unter, 96, "o"], [e(summe, 2), "Angebotssumme brutto", 20]], "text": f"Netto {e(netto, 2)}"},
        {"typ": "text", "x": 300, "y": 420, "w": 556, "schrift": 9.2, "absaetze": [intro]},
        {"typ": "kv", "x": 300, "y": "folgt", "abstand": 8, "w": 556, "kw": 86, "schrift": 8.4, "zeilen": zeilen},
        {"typ": "balken", "x": 300, "y": "folgt", "abstand": 16, "w": 556, "lw": 150, "vw": 90, "bh": 9, "abstand": 15.5, "schrift": 8, "titel": "Kostenstruktur netto",
         "items": [[k, v, e(v)] for k, v in struktur]},
        {"typ": "text", "x": 300, "y": "folgt", "abstand": 10, "w": 556, "box": True, "schrift": 8.2, "titel": "Vor einer Beauftragung", "absaetze": [klaeren]}],
      "quelle": "Die Beträge geben den dokumentierten Angebotsstand wieder; die Zuordnung zu Kostengruppen ist eine GRENFORD-Auswertung. Technische Eignung und tatsächliche Ausführung sind damit nicht bestätigt. Umsatzsteuer 19 %."}
top = lambda xs: sorted([(k, v) for k, v in zip(KG, xs) if v > 0], key=lambda r: -r[1])[:7]
S.append(angebot("angebot-a", "A", "Festpreis mit Gewährleistung", "Festpreis mit Gewährleistung",
  "Dreizehn Leistungsblöcke mit Bauleitung, Bemusterung und 5 % Rabatt. Der Heizboden in Zementoptik ist nur als Option angeboten, Podest und Lift sind nicht genannt.",
  [["Zahlung", "10 % bei Unterschrift (Planung, Organisation), 90 % nach Baufortschritt"], ["Preisart", "Festpreisgarantie, ein Ansprechpartner, 5 Jahre Gewährleistung; 30 Tage gültig"],
   ["Zeitplan", "Ziel: Fertigstellung Ende April 2027, Einzug im Mai 2027"]], top(NA),
  "Heizboden (optional, ca. 23.132,50 € netto), Küchenmöbel, Dachnacharbeiten nach Aufwand (75 € netto je Stunde) und Kutscherhaus-Positionen abstimmen; die UG-Arbeiten sind nicht nach Gewerken aufgeteilt.", A, AN))
S.append(angebot("angebot-b", "B", "Breitester Umfang, freibleibend", "Breiter Umfang, höchste Summe",
  "Nach Geschossen gegliedertes Budget mit 123 Positionen, Außenbereich, Heizung und 15 % Projektmanagement. Es bildet den breitesten Umfang ab.",
  [["Zahlung", "Abschläge nach dokumentiertem Leistungsstand"], ["Preisart", "Freibleibend, kein verbindlicher Festpreis; Regiearbeiten 65 € netto je Stunde"],
   ["Baustelle", "16 Wochen Vorhaltung als Kalkulationsannahme"]], top(NB),
  "Festpreis oder Kostendeckel und Zahlungsfrist vereinbaren; Mengen (DG nicht vollständig erfasst), Heizboden DG sowie Podest und Lift als vorläufige Budgets konkretisieren. Architekt, Fachplanung und Dachreparatur sind nicht enthalten.", B, BN))
S.append(angebot("angebot-c", "C", "Festpreis, Unternehmen in Gründung", "Festpreis nach Gewerken",
  "Fünfzehn Leistungsbereiche mit Gesamtpreis je Gewerk, 5 % Nachlass und 5 Jahren Gewährleistung. Das Unternehmen befindet sich in Gründung (i. G.).",
  [["Zahlung", "30 % Anzahlung bei Beauftragung, 70 % nach dokumentiertem Baufortschritt"], ["Preisart", "Festpreis; 5 Jahre Gewährleistung laut Angebot"],
   ["Start", "Baubeginn nach Handelsregistereintragung; Bauzeit auf Wunsch vertraglich"]], top(NC),
  "Registereintragung, Referenzen und Absicherung der Anzahlung prüfen. Podest, Lift und Klima sind nicht beziffert; der Heizboden ist nur für das DG als Kostenschätzung angesetzt.", C, CN))

# ---------------- Die Analyse
S.append({"modul": "raster", "id": "kosten", "kopf": "Der Kostenvergleich", "dachzeile": "Gemeinsame Kostengruppen · netto", "titel": "Wofür wird kalkuliert?",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 560, "breiten": [200, 120, 120, 120], "zh": 25.5, "schrift": 8.8, "hervorheben": ["Summe netto"],
     "heat": {"zeilen": list(range(9)), "spalten": [1, 2, 3]} if False else None,
     "kopf": ["Leistungsgruppe", "A", "B", "C"],
     "zeilen": [[k, zelle(a), zelle(b), zelle(c)] for k, a, b, c in zip(KG, NA, NB, NC)] + [["Summe netto", e(AN, 2), e(BN, 2), e(CN, 2)]],
     "markiere": [[i, 1 + [a, b, c].index(max(a, b, c))] for i, (a, b, c) in enumerate(zip(NA, NB, NC)) if max(a, b, c) > 0 and i < 9]},
    {"typ": "text", "x": 640, "y": 420, "w": 216, "schrift": 8.4,
     "absaetze": [["Lesehilfe:", "Gemeinsame Gruppen machen die Kosten lesbar. Sie schaffen noch keinen identischen Leistungsumfang."],
                  "A und C gliedern nach Gewerken, B nach Geschossen; die Zuordnung ist eine GRENFORD-Auswertung. A fasst das Untergeschoss in einem eigenen Block zusammen.",
                  "Hinterlegt: höchster Betrag je Zeile. „—“ heißt nicht ausgewiesen, nicht 0 €."]}],
  "quelle": FB})
S.append({"modul": "raster", "id": "verlauf", "kopf": "Der Kostenverlauf", "dachzeile": "Kumulierte Nettokosten · Gewerkefolge", "titel": "Wo die Kosten auseinandergehen",
  "bloecke": [
    {"typ": "linie", "x": 51, "y": 410, "w": 805, "h": 250, "titel": "Kumulierte Nettokosten in Tsd. €", "achse": [0, 450, 50], "kategorien": G,
     "serien": [{"name": "Baupartner A", "farbe": "navy", "werte": cum(NA), "ende": "A " + t(AN)},
                {"name": "Baupartner B", "farbe": "acc", "werte": cum(NB), "ende": "B " + t(BN)},
                {"name": "Baupartner C", "farbe": "#9a9690", "werte": cum(NC), "ende": "C " + t(CN), "dy": 8}]}],
  "quelle": f"GRENFORD-Auswertung der Werte von Seite {{seite:kosten}}; Reihenfolge entspricht einer typischen Bauabfolge, keine Terminplanung. Obergrenze 250.000 € brutto = {e(OBER/MWST)} netto."})
S.append({"modul": "raster", "id": "bereinigt", "kopf": "Bereinigter Vergleich", "dachzeile": "Gleicher Umfang, vergleichbare Summe", "titel": "Was jedes Angebot vollständig kostet",
  "intro": "Die Angebote decken nicht denselben Umfang ab. Ergänzt man die Leistungen, die nur einzelne Partner anbieten, mit den Ansätzen aus den anderen Angeboten, rücken A und C eng zusammen – B bleibt deutlich darüber.",
  "bloecke": [
    {"typ": "hstack", "x": 51, "y": 372, "w": 805, "lw": 150, "sw": 110, "max": 560000, "bh": 30, "abstand": 58, "titel": "Angebot brutto und indikative Ergänzungen, €",
     "zeilen": [["Baupartner A", [[A, "navy", "Angebot 360,1 Tsd."], [HEIZ_A, "acc", "Heizboden"], [LIFT, "mid", "Podest/Lift"]], e(A_ber)],
                ["Baupartner C", [[C, "navy", "Angebot 392,4 Tsd."], [LIFT, "mid", "Podest/Lift"], [KLIMA, "light", "Klima"]], e(C_ber)],
                ["Baupartner B", [[B, "navy", "Angebot 526,7 Tsd. · Umfang vollständig"]], e(B)]]},
    {"typ": "kpi", "x": 51, "y": 150, "w": 805, "h": 54, "groesse": 20, "gap": 12,
     "items": [{"wert": e(C_ber - A_ber), "label": "Abstand C zu A, bereinigt"}, {"wert": e(B - A_ber), "label": "Abstand B zu A, bereinigt", "stil": "hell"},
               {"wert": e(A_ber - OBER), "label": "A bereinigt über Obergrenze"}]}],
  "quelle": ["GRENFORD-Auswertung, indikativ: Heizboden laut Option A (23.132,50 € netto), Podest und Lift laut Budget B ohne PM (25.500 € netto), Klima laut A (8.250 € netto), jeweils zzgl. 19 % MwSt.",
             "Mengen, Ausführung und Rabatt auf Ergänzungen sind nicht geprüft. Keine Wertung der Qualität."]})
S.append({"modul": "raster", "id": "matrix", "kopf": "Entscheidungsmatrix", "dachzeile": "Konditionen und Leistungen im direkten Vergleich", "titel": "Wo jeder Partner stark ist",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 805, "breiten": [150, 64, 133, 64, 133, 64, 133], "links": [0, 2, 4, 6], "tags": [1, 3, 5], "zh": 30, "schrift": 8.2,
     "kopf": ["Kriterium", "A", "", "B", "", "C", ""],
     "zeilen": [["Summe und Budget", "gut", "Kleinster Abstand, +44 %", "Prüfen", "+111 % über Obergrenze", "Mittel", "+57 % über Obergrenze"],
                ["Preisart", "gut", "Festpreisgarantie, 5 % Rabatt", "Prüfen", "Freibleibend, Regie 65 €/h", "gut", "Festpreis je Gewerk"],
                ["Zahlung", "gut", "10 % / 90 % nach Fortschritt", "gut", "Abschläge nach Leistung", "Prüfen", "30 % Anzahlung"],
                ["Planung, Management", "gut", "Im Preis: Planung, Bauleitung", "Mittel", "15 % PM = 57.726,54 € netto", "gut", "In der Anzahlung enthalten"],
                ["Gewährleistung", "gut", "5 Jahre", "Prüfen", "Nicht ausgewiesen", "gut", "5 Jahre"],
                ["Heizboden", "Mittel", "Nur Option, ca. 92,5 m²", "gut", "EG und DG enthalten", "Mittel", "Nur DG, Schätzung"],
                ["Klima DG", "gut", "Multisplit, 8.250 € netto", "gut", "Enthalten", "Prüfen", "Nicht ausgewiesen"],
                ["Podest und Lift", "Prüfen", "Nicht ausgewiesen", "gut", "Budget 25.500 € netto", "Prüfen", "Nicht ausgewiesen"],
                ["Unternehmen, Zeitplan", "gut", "Fertig Ende April 2027", "Mittel", "16 Wochen Annahme", "Prüfen", "In Gründung, Start nach Eintragung"]]}],
  "quelle": "GRENFORD-Einordnung auf Basis der Angebote; keine Referenz- oder Bonitätsprüfung. „Prüfen“ heißt: vor der Unterschrift schriftlich klären, nicht ausgeschlossen. Unterschiedliche Ansätze sind kein Qualitätsurteil."})
S.append({"modul": "raster", "id": "zahlung", "kopf": "Zahlung und Absicherung", "dachzeile": "Was ihr wann zahlt", "titel": "Zahlungspläne im Vergleich",
  "bloecke": [
    {"typ": "saeulen", "x": 51, "y": 410, "w": 470, "h": 250, "titel": "Brutto in Tsd. €, nach Zahlungszeitpunkt", "gestapelt": True, "max": 560,
     "kategorien": ["Baupartner A", "Baupartner B", "Baupartner C"],
     "serien": [{"name": "Bei Unterschrift", "farbe": "acc", "werte": [A * .10 / 1000, 0, C * .30 / 1000]},
                {"name": "Nach Baufortschritt", "farbe": "navy", "werte": [A * .90 / 1000, B / 1000, C * .70 / 1000]}],
     "summen": [t(A), t(B), t(C)]},
    {"typ": "kv", "x": 560, "y": 410, "w": 296, "kw": 36, "titel": "Absicherung", "schrift": 8.4,
     "zeilen": [["A", f"10 % = {e(A*.10)} bei Unterschrift für Planung und Organisation; Rest nach Baufortschritt."],
                ["B", "Abschläge nach dokumentiertem Leistungsstand; vor Unterschrift Festpreis oder Kostendeckel vereinbaren."],
                ["C", f"30 % = {e(C*.30)} bei Beauftragung; Unternehmen in Gründung: Anzahlung über Bürgschaft oder Treuhand absichern."]]},
    {"typ": "text", "x": 560, "y": "folgt", "abstand": 16, "w": 296, "box": True, "schrift": 8.4,
     "absaetze": [["Faustregel:", "Je höher die Vorauszahlung, desto wichtiger ist eine Sicherheit, bevor Geld fließt."]]}],
  "quelle": "Zahlungsbedingungen laut Angeboten der 2. Runde; Beträge brutto, gerundet. Keine Liquiditätsplanung."})

# ---------------- Die Entscheidung
S.append({"modul": "raster", "id": "klaerung", "kopf": "Klärung vor der Unterschrift", "dachzeile": "Vom Vergleich zum belastbaren Vertrag", "titel": "Was wir jetzt klären, was danach feststeht",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 805, "breiten": [150, 420, 235], "links": [0, 1, 2], "zh": 56, "schrift": 9.2,
     "kopf": ["Baupartner", "Was wir klären", "Ergebnis"],
     "zeilen": [["A · Umfang festschreiben", "Heizboden als Option entscheiden, Küchenmöbel und Kutscherhaus-Positionen abgrenzen, Dachnacharbeiten nach Aufwand deckeln; Rabattbasis bestätigen lassen (16.404,94 € = 5,1 % der Gewerkesumme).", "Ein schriftlich bestätigter Leistungsumfang zum Festpreis."],
                ["B · Festpreis klären", "Festpreis oder Kostendeckel vereinbaren, DG-Mengen, Heizboden DG sowie Podest und Lift konkretisieren. Architekt und Fachplanung sind nicht enthalten.", "Ein verbindlicher Preis auf bestätigten Mengen."],
                ["C · Absicherung prüfen", "Handelsregistereintragung und Referenzen prüfen, 30 % Anzahlung absichern; Podest, Lift und Klima sind nicht beziffert, der Heizboden gilt nur für das DG.", "Bestätigter Umfang, belastbare Nachweise, abgesicherter Zahlungsplan."]]},
    {"typ": "text", "x": 51, "y": "folgt", "abstand": 20, "w": 805, "box": True, "schrift": 8.6,
     "absaetze": [["Gemeinsame Basis:", "Bruttobezug und Obergrenze des Budgets bestätigen, Prioritäten festlegen (Heizboden, Podest und Lift, Klima), Statik bei Wanddurchbrüchen und Heizboden sowie Schadstoff- und Feuchteprüfung. Ergebnisse gelten erst nach schriftlicher Rückmeldung der Baupartner."]]}],
  "quelle": FB})
S.append({"modul": "raster", "id": "einschaetzung", "kopf": "Einschätzung", "dachzeile": "Nach der Analyse · für eure Entscheidung", "titel": "A zuerst prüfen, B und C im Blick",
  "bloecke": [
    {"typ": "matrix", "x": 51, "y": 412, "w": 805, "h": 336, "schrift": 9.0,
     "zellen": [{"titel": "Baupartner A · kleinster Budgetabstand", "akzent": True, "punkte": [["Für A spricht", "die niedrigste Summe mit dem kleinsten Abstand zur Obergrenze, Festpreisgarantie, 5 Jahre Gewährleistung und Zahlung 10 / 90."], ["Zu klären:", "Heizboden-Option und Küchenabgrenzung; Podest und Lift fehlen."], [e(A, 2), "brutto."]]},
                {"titel": "Baupartner B · breitester Umfang", "punkte": [["Für B spricht", "der größte Umfang mit Heizboden, Klima, Podest und Lift."], ["Aber:", "freibleibend und 276.658,43 € über der Obergrenze; ohne Podest und Lift 491.761,68 € brutto."], ["Sinnvoll,", "wenn Umfang vor Budget geht."]]},
                {"titel": "Baupartner C · nachrangig", "punkte": [["Bereinigt", "liegt C nur knapp über A; ohne Klima, Heizboden nur im DG."], ["Dazu:", "30 % Anzahlung bei einem Unternehmen in Gründung ohne Registereintragung."], ["Alternative,", "wenn Nachweise und Absicherung überzeugen."]]},
                {"titel": "Eure nächsten Schritte", "akzent": True, "punkte": [["01 · Budget und Prioritäten", "festlegen: was unverzichtbar ist, was später folgen kann."], ["02 · Offene Punkte", "schriftlich klären: Umfang, Festpreis, Zahlungsplan, Termine."], ["03 · Entscheiden", "und direkt beauftragen – auf Basis des geklärten Endangebots."]]}]}],
  "quelle": "Keine Referenz- oder Bonitätsprüfung der Baupartner; kein Angebot ist als vollständig passender Endpreis bestätigt. Ihr beauftragt direkt; GRENFORD übernimmt keine Bauleitung und keine Abnahme."})

# ---------------- Anhang
S.append({"modul": "kontakt", "id": "kontakt", "bereich": "nach", "bild": "gutshaus.jpg", "bild_pos": "30% center", "kopf": "Nächster Schritt &amp; Kontakt",
  "claim": ["Euer Gutshaus,", "euer nächster", "Schritt"], "dachzeile": "Euer Vorhaben gemeinsam umsetzen", "titel": ["Trefft eure", "Entscheidung"],
  "box_label": "Euer Ansprechpartner", "box_titel": "Marco Kaimann, Founder &amp; Strategic Advisor",
  "schritte": [["Budget und Prioritäten bestätigen", "Wir legen gemeinsam fest, ob 250.000 € brutto die Obergrenze bleiben und was unverzichtbar ist; danach fällt die Wahl der Baufirma."],
               ["Offene Punkte schriftlich klären", "Vor der Unterschrift lassen wir Leistungsumfang, Festpreis oder Kostendeckel, Zahlungsplan und Termine schriftlich bestätigen."],
               ["Beauftragen und starten", "Ihr beauftragt die Baufirma direkt, erst auf Basis des geklärten Endangebots. GRENFORD begleitet euch beratend bis zur Fertigstellung."]]})
S.append({"modul": "ueber", "id": "ueber", "bereich": "nach", "bild": "luftbild.jpg", "bild_pos": "center"})
S.append({"modul": "recht", "id": "recht", "bereich": "nach", "dachzeile": "GRENFORD Projects · Gutshaus Fresdorf", "schrift": 8.8, "zeile": 12.8,
  "intro": ["Dieses Memo dient der Entscheidungsvorbereitung. Woher die Zahlen stammen, welche Rollen gelten und wie ihr das Memo nutzen dürft, ist hier offengelegt.",
            "Es ersetzt keine Rechts-, Steuer- oder Bauberatung und enthält keine Referenz- oder Bonitätsprüfung der Baupartner."],
  "bloecke": [["Kosten und Beratung", "Ihr zahlt GRENFORD kein Honorar. Auch nach eurer Entscheidung für eine Baufirma bleibt die Beratung kostenlos: Ich beantworte eure Fragen und stehe euch bis zur Fertigstellung zur Seite. GRENFORD wird für die Vermittlung vom beauftragten Baupartner vergütet. Ob und wen ihr beauftragt, entscheidet allein ihr."],
              ["Angebote und Auswertung", "Preise, Mengen und Leistungen stammen aus den Angeboten der Baupartner (Stand 14.–24.10.2026) und der Umbauübersicht vom 10.10.2026. Kostengruppen, Bereinigungen und Einschätzung sind GRENFORD-Auswertungen. Statik, Bauzustand, Schadstoffe und Genehmigungen sind nicht geprüft. Verbindlich ist nur das jeweilige Angebot bzw. der Bauvertrag."],
              ["Rolle und Verantwortung", "Ihr beauftragt die Baufirma direkt. Angebot, Bauausführung, Gewährleistung und die Haftung dafür liegen bei der Baufirma; ebenso laufen die Zahlungen nur zwischen euch und ihr. GRENFORD übernimmt keine Bauleitung und keine Abnahme und gibt keine Erklärungen für euch oder die Baufirma ab."],
              ["Vertraulichkeit und Urheberrecht", "Dieses Memo ist für die Bauherrschaft des Gutshauses Fresdorf erstellt. Inhalt, Gestaltung, Texte, Diagramme und Auswertungen sind urheberrechtlich geschützt (© GRENFORD). Eine Weitergabe an Dritte, insbesondere an Baufirmen, ist nur mit Zustimmung zulässig; zur Verschwiegenheit verpflichtete Berater sind ausgenommen."]]})
S.append({"modul": "agb", "id": "agb", "bereich": "nach", "datei": "agb_projects.html", "teilung": [2, 4], "dachzeile": "GRENFORD Projects · Renovation Memo",
  "stil": "font-size:8.4pt;line-height:11.6pt"})

json.dump({"meta": meta, "kosten": {"einheiten": []}, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
