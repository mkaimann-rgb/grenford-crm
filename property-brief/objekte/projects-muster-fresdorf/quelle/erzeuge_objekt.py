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
S.append({"modul": "vorwort", "id": "vorwort", "bereich": "vor", "dachzeile": "Persönlich für euch", "titel": "Eure Wünsche, euer Weg zur Entscheidung",
  "gruss": "Euer Marco",
  "lead": "Lieber Till, lieber Raphael, nach unseren Vor-Ort-Terminen konnten wir alle Wünsche mit den Bauunternehmern besprechen. Auf dieser Grundlage haben alle drei neue, angepasste Angebote erstellt.",
  "links": "Diese Angebote stelle ich euch im zweiten GRENFORD Renovation Memo vor, damit ihr eine finale Entscheidung für eine Baufirma treffen könnt. Wir vergleichen weiterhin anonymisiert als A, B und C, in der Reihenfolge des ersten Memos.",
  "rechts": "Ein ehrliches Wort zu den Kosten: Durch den größeren Umfang ist es bei allen teurer geworden als zunächst gedacht. Alle drei sind euch beim Preis entgegengekommen, jeder in seinem Rahmen (Seite {seite:runden}).",
  "schluss": "Das Memo ordnet Leistungen, Konditionen und Kosten ein und zeigt, was vor einer Unterschrift noch zu klären ist. Ihr entscheidet, wen ihr beauftragt. Ich berate euch dabei und bleibe bis zur Fertigstellung an eurer Seite – für euch ist meine Begleitung kostenfrei."})
S.append({"modul": "inhalt", "id": "inhalt", "bereich": "vor", "bild": "gutshaus.jpg", "bild_pos": "30% center", "ueberblick": "Orientierung",
  "claim": ["Euer Vorhaben,", "klar im Überblick"], "marke": "Gutshaus Fresdorf · Renovation Memo", "text": ["So führt euch das Memo", "zur Entscheidung"],
  "adresse": ["Luckenwalder Straße 211", "14552 Michendorf OT Fresdorf"],
  "kapitel": [{"titel": "Eure Richtung", "sub": "Auf einen Blick, Prozess, Wünsche und Budget", "seiten": ["blick", "wuensche"]},
              {"titel": "Das Haus", "sub": "Bestand und Wunschplanung", "seiten": ["bestand", "plaene-2"]},
              {"titel": "Die Angebote", "sub": "Entwicklung seit der ersten Runde, drei Angebote", "seiten": ["runden", "angebot-c"]},
              {"titel": "Die Analyse", "sub": "Kosten, Budget, Leistungen, Zahlung und Klärung", "seiten": ["kosten", "klaerung"]},
              {"titel": "Die Entscheidung", "sub": "Einschätzung und nächster Schritt", "seiten": ["einschaetzung"]},
              {"titel": "Kontakt, Grundlagen und Anhang", "sub": "Kontakt, Transparenz, Rechte und AGB", "seiten": ["kontakt", "agb"]}]})
# ---------------- Eure Richtung
S.append({"modul": "raster", "id": "blick", "kopf": "Auf einen Blick", "dachzeile": "Die Entscheidung auf einer Seite", "titel": "Drei Angebote, eine Empfehlung",
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

S.append({"modul": "raster", "id": "prozess", "kopf": "Euer Weg zur Entscheidung", "dachzeile": "Ein gemeinsamer Prozess", "titel": "Von euren Wünschen zur finalen Entscheidung",
  "bloecke": [
    {"typ": "schritte", "x": 51, "y": 384, "w": 805,
     "items": [["01 · Erledigt", "Aufnehmen", "Wünsche, Bestand und Budget erfasst."], ["02 · Erledigt", "Vergleichen", "Erste Angebote als A / B / C analysiert."],
               ["03 · Erledigt", "Besprechen", "Unterschiede erläutert, Vor-Ort-Termine vereinbart."], ["04 · Erledigt", "Kennenlernen", "Vor Ort mit Till, Marco und den Bauunternehmern; Wünsche besprochen, Angebote angepasst."],
               ["05 · Wir sind hier", "Entscheiden", "Zweites Memo: finale Entscheidung für eine Baufirma."]]},
    {"typ": "dunkel", "x": 51, "y": 262, "w": 805, "h": 196, "titel": "Erst der Vergleich, dann die Entscheidung", "abstand": 40,
     "werte": [["A · B · C", "Die Reihenfolge aus dem ersten Memo bleibt", 40, "o"]],
     "text": "Die Baupartner kennt ihr aus den Terminen vor Ort. Das Memo bleibt bei A, B und C aus dem ersten Memo, damit beide Runden vergleichbar sind. GRENFORD begleitet die Abstimmungen beratend bis zur Fertigstellung; ihr beauftragt das Bauunternehmen direkt."}],
  "quelle": "Stand Oktober 2026."})
S.append({"modul": "raster", "id": "wuensche", "kopf": "Eure Vorgaben", "dachzeile": "Das habt ihr GRENFORD anvertraut", "titel": "Euer Alltag, eure Vorgaben",
  "intro": "Diese Wünsche und Budgetangaben bilden die Aufgabenbasis, auf der die Angebote eingeholt wurden. Bei den Terminen vor Ort haben wir sie mit den Baupartnern besprochen.",
  "bloecke": [
    {"typ": "kv", "x": 51, "y": 382, "w": 560, "kw": 130, "schrift": 9.0, "bis": 110,
     "zeilen": [["DG · Neu ordnen", "Küche, Wohnen und Essen neu strukturieren; Bad und WC, Heizboden in Zementoptik, Dielen und Klimageräte. Gehobener Standard."],
                ["EG · Zwei Appartements", "Altersgerechte Bäder, Küchenanschlüsse und teils neue Böden. Mittlerer bis gehobener Standard."],
                ["UG · Funktional ergänzen", "Großformatfliesen, Bad, Waschküche und Trocknungssystem. Einfacher bis mittlerer Standard."],
                ["+ · Erhalten und ergänzen", "Dielen weiß/grau ölen; Türen, Wandleisten und Rundbögen bewahren. Bodengleiche Duschen, Schiebetüren, Podest und Lift prüfen; Fenster zum Torhaus."]]},
    {"typ": "dunkel", "x": 640, "y": 382, "w": 216, "h": 272, "titel": "Eure Budgetvorgabe", "abstand": 52,
     "werte": [["230–250", "Tsd. € brutto für den Bau*", 34, "o"], ["300.000 €", "Gesamtbudget", 18], ["− 70.000 €", "für zwei Küchen", 18]],
     "text": "* Obergrenze und Bruttobezug gemeinsam bestätigen. Alle drei Angebotssummen liegen über der Obergrenze."}],
  "quelle": "Grundlage: Umbauübersicht vom 10.10.2026 und persönliche Gespräche, zuletzt bei den Vor-Ort-Terminen. Die obere Vergleichsgrenze von 250.000 € ist vorläufig. Altersgerechte Ausstattung ist ein Planungsziel; eine vollständige DIN-konforme Barrierefreiheit ist mit dem Planstand nicht zugesichert."})

# ---------------- Das Haus
S.append({"modul": "raster", "id": "bestand", "kopf": "Der Bestand", "dachzeile": "Bestandsaufnahme · Gutshaus Fresdorf", "titel": "Der Bestand, euer Ausgangspunkt",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 420, "w": 380, "h": 330, "bild": "luftbild.jpg", "titel": "Luftbild, Objektunterlagen"},
    {"typ": "text", "x": 460, "y": 420, "w": 396, "schrift": 9.6,
     "absaetze": ["Für den geplanten Innenumbau betrachten wir das Gutshaus über drei Ebenen: Unter-, Erd- und Dachgeschoss. Die vorhandenen Räume, Bodenaufbauten und Installationen müssen mit euren neuen Nutzungswünschen zusammengeführt werden. Das Memo erfasst außerdem die benannten Zugangsmaßnahmen."]},
    {"typ": "bild", "x": 460, "y": 262, "w": 190, "h": 130, "bild": "bad.jpg", "titel": "Bad"},
    {"typ": "bild", "x": 666, "y": 262, "w": 190, "h": 130, "bild": "flur.jpg", "titel": "Flur"},
    {"typ": "kpi", "x": 460, "y": 106, "w": 396, "h": 40, "groesse": 17, "gap": 10, "items": [{"wert": "ca. 343 m²", "label": "Wohnfläche"}, {"wert": "3 Ebenen", "label": "UG · EG · DG", "stil": "hell"}]}],
  "quelle": "Bilder und Wohnfläche aus den Objektunterlagen; historische Aufnahmen, kein aktuelles Zustandsprotokoll. Angebot B beziffert die bearbeitete Bodenfläche mit 346,43 m² (ohne Technikraum, Außenpodest und Treppenstufen). Ausführungsmaße, Bauteile und Statik sind vor Ausführung zu prüfen."})
S.append({"modul": "raster", "id": "plaene-1", "kopf": "Planungsgrundlage / 01", "dachzeile": "Wunschplanung · Version RM/TK 10.10.2026", "titel": "Rot-Gelb-Pläne Erd- und Dachgeschoss",
  "intro": "Originalpläne begradigt und proportional verkleinert; Bemaßung und Markierungen erhalten. Planstand Vorabzug; Maße und technische Umsetzbarkeit vor Ausführung prüfen.",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 384, "w": 395, "h": 320, "bild": "plan-eg.png", "contain": True, "weiss": True, "pad": 8, "titel": "Erdgeschoss"},
    {"typ": "bild", "x": 461, "y": 384, "w": 395, "h": 320, "bild": "plan-dg.png", "contain": True, "weiss": True, "pad": 8, "titel": "Dachgeschoss"}]})
S.append({"modul": "raster", "id": "plaene-2", "kopf": "Planungsgrundlage / 02", "dachzeile": "Wunschplanung · Version RM/TK 10.10.2026", "titel": "Untergeschoss und Zugang",
  "intro": "Originalpläne begradigt und proportional verkleinert. Planstand Vorabzug; Außenpodest und Lift sind vorläufig, Maße und Umsetzbarkeit vor Ausführung prüfen.",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 384, "w": 300, "h": 320, "bild": "plan-ug.png", "contain": True, "weiss": True, "pad": 8, "titel": "Untergeschoss"},
    {"typ": "bild", "x": 366, "y": 384, "w": 490, "h": 320, "bild": "plan-ansicht.png", "contain": True, "weiss": True, "pad": 8, "titel": "Ansicht mit Außenzugang"}]})

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
S.append({"modul": "raster", "id": "budget", "kopf": "Budgetanalyse", "dachzeile": "Brutto · im Vergleich zur Obergrenze", "titel": "Wie weit liegen die Angebote über dem Ziel?",
  "bloecke": [
    {"typ": "hstack", "x": 51, "y": 410, "w": 560, "lw": 110, "sw": 150, "max": 560000, "bh": 30, "abstand": 66, "titel": "Tsd. € brutto · Obergrenze 250.000 €",
     "zeilen": [["Baupartner A", [[OBER, "light", "bis Obergrenze"], [A - OBER, "acc", f"+{e(A-OBER, 2)}"]], f"{e(A, 2)} · {pz((A/OBER-1)*100)}"],
                ["Baupartner B", [[OBER, "light", "bis Obergrenze"], [B - OBER, "acc", f"+{e(B-OBER, 2)}"]], f"{e(B, 2)} · {pz((B/OBER-1)*100)}"],
                ["Baupartner C", [[OBER, "light", "bis Obergrenze"], [C - OBER, "acc", f"+{e(C-OBER, 2)}"]], f"{e(C, 2)} · {pz((C/OBER-1)*100)}"]]},
    {"typ": "dunkel", "x": 640, "y": 410, "w": 216, "h": 250, "titel": "Die Konsequenz", "abstand": 60,
     "werte": [[f"+{e(A-OBER)}", "A über der Obergrenze", 22, "o"]],
     "text": f"Auch das günstigste Angebot A liegt {e(A-OBER, 2)} brutto über 250.000 €. C überschreitet sie um {e(C-OBER, 2)}, B um {e(B-OBER, 2)}. Budget, Umfang und Prioritäten gehören deshalb auf den Tisch, bevor unterschrieben wird."}],
  "quelle": "GRENFORD-Auswertung aus den Bruttosummen der Angebote; Obergrenze und Bruttobezug des Budgets sind noch zu bestätigen. Keine Zuordnung nach Bauphasen und keine Liquiditätsplanung. Die Leistungsumfänge sind nicht identisch (siehe Seiten {seite:konditionen} bis {seite:leistungen})."})
S.append({"modul": "raster", "id": "konditionen", "kopf": "Konditionen im Detail", "dachzeile": "Leistungsabgleich nach Themen", "titel": "Konditionen im direkten Vergleich",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 580, "breiten": [100, 160, 160, 160], "links": [0, 1, 2, 3], "zh": 22, "schrift": 8.4, "bis": 80,
     "kopf": ["Thema", "A", "B", "C"],
     "zeilen": [["Preisart", "Festpreisgarantie; 5 % Rabatt auf die Gesamtleistung", "Freibleibend, kein verbindlicher Festpreis; Regie 65 € netto/h", "Festpreis; 5 % Nachlass auf die Leistungssumme"],
                ["Zahlung", "10 % bei Unterschrift, 90 % nach Baufortschritt", "Abschläge nach dokumentiertem Leistungsstand", "30 % Anzahlung bei Beauftragung, 70 % nach Baufortschritt"],
                ["Planung und Management", "Im Preis: Projektplanung, Bauleitung, Qualitätskontrolle, Bemusterung", "15 % Projektmanagement = 57.726,54 € netto", "Planungsleistungen in der Anzahlung enthalten"],
                ["Gewährleistung", "5 Jahre auf die Arbeiten", "Im Angebot nicht ausgewiesen", "5 Jahre auf die Arbeiten"],
                ["Zeitplan", "Ziel: Fertigstellung Ende April 2027, Einzug Mai 2027", "16 Wochen Baustellenvorhaltung (Annahme); Termine nach Freigabe", "Beginn nach Handelsregistereintragung; Bauzeit auf Wunsch vertraglich"],
                ["Stand und Gültigkeit", "Angebot vom 14.10.2026; 30 Tage gültig", "Stand 23.10.2026; freibleibend", "Stand 24.10.2026; Unternehmen i. G."]]},
    {"typ": "text", "x": 656, "y": 420, "w": 200, "box": True, "schrift": 8.6, "titel": "Einordnung",
     "absaetze": ["Die Konditionen unterscheiden sich stärker als die Preise vermuten lassen: Festpreis und Zahlungsplan von A und C, Anzahlung und Registereintragung bei C, freibleibende Kalkulation bei B."]}],
  "quelle": "Die Angaben fassen die drei Angebote zusammen; „nicht ausgewiesen“ heißt: nicht als enthalten behandelt. Unterschiedliche Ansätze sind kein Qualitätsurteil."})
S.append({"modul": "raster", "id": "leistungen", "kopf": "Leistungen im Detail", "dachzeile": "Leistungsabgleich nach Themen", "titel": "Leistungen im direkten Vergleich",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 580, "breiten": [100, 160, 160, 160], "links": [0, 1, 2, 3], "zh": 22, "schrift": 8.4, "bis": 80,
     "kopf": ["Thema", "A", "B", "C"],
     "zeilen": [["Heizboden Zementoptik", "Nur optional: ca. 92,53 m² à 250 € netto, rund 23.132,50 €; nicht in der Summe", "Enthalten: leichter Heizboden EG 54,4 m² und DG 36,8 m²; Tragfähigkeit prüfen", "Fußbodenheizung (Nasssystem, Sichtestrich) nur im DG; Kostenschätzung"],
                ["Klima DG", "Multisplit für DG Schlafen und Büro: 8.250 € netto", "Enthalten für DG Schlafen und Büro", "Nicht ausgewiesen"],
                ["Außenpodest und Lift", "Nicht ausgewiesen", "Vorläufiges Budget 25.500 € netto (Podest, Hublift außen)", "Nicht ausgewiesen"],
                ["Küchen", "Rückbau und Anschlüsse; Küchenmöbel nicht genannt", "Rückbau von vier Küchen, Anschlüsse; Einbauküchen und Möbel nicht enthalten", "Rohinstallation für drei Küchenbereiche; keine Küchenmöbel"],
                ["Dielen und Böden", "Dielen schleifen 194,2 m²; neue Dielen DG Wohnen 19,88 m²; weiß/grau geölt", "Dielen und Parkett schleifen und farbig ölen: 136,7 m²", "Dielen schleifen 231,49 m², Oberfläche gesondert; Dielenboden EG neu"],
                ["Dach und Nebengebäude", "Dach nach Aufwand (75 € netto/h); Kutscherhaus: Rückbau Pool, Wärmepumpe, Badewanne", "Dachzustand aufnehmen (1.450 € netto); Reparatur gesondert", "Dach nicht ausgewiesen; Kutscherhaus: Rückbau Pool, Wärmepumpe, Badewanne"]]},
    {"typ": "text", "x": 656, "y": 420, "w": 200, "box": True, "schrift": 8.6, "titel": "Bereinigung (indikativ, brutto)",
     "absaetze": ["B ohne Außenpodest und Lift (25.500 € + 15 % PM): 491.761,68 €.", "A mit optionalem Heizboden (23.132,50 € netto): 387.578,73 €.", "Auch bereinigt liegt jedes Angebot über der Obergrenze von 250.000 €. Den vollständigen Vergleich zeigt Seite {seite:bereinigt}."]}],
  "quelle": "Mengen und Positionen laut Angeboten; keine Prüfung durch GRENFORD vor Ort. Bereinigung nur für separat ausgewiesene Positionen; Rabatt auf Optionen und Mengenabweichungen bleiben offen."})
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
S.append({"modul": "raster", "id": "einschaetzung", "kopf": "Einschätzung zur Entscheidung", "dachzeile": "Nach der Analyse · für eure Entscheidung", "titel": "A zuerst prüfen, B und C im Blick",
  "bloecke": [
    {"typ": "kv", "x": 51, "y": 420, "w": 330, "kw": 30, "schrift": 8.8,
     "zeilen": [["01", "Budget und Prioritäten festlegen. Alle drei Summen liegen über 250.000 € brutto. Ihr legt fest, was unverzichtbar ist (Heizboden, Podest und Lift, Klima) und was später folgen kann."],
                ["02", "Offene Punkte schriftlich klären. Das gewählte Unternehmen bestätigt Umfang, Festpreis oder Kostendeckel, Zahlungsplan und Termine schriftlich vor der Unterschrift."],
                ["03", "Entscheiden und beauftragen. Ihr beauftragt direkt, erst auf Basis des geklärten Endangebots. GRENFORD begleitet beratend bis zur Fertigstellung."]]},
    {"typ": "text", "x": 410, "y": 420, "w": 215, "box": True, "schrift": 8.6, "titel": "Baupartner A · kleinster Budgetabstand", "h": 214,
     "absaetze": ["Für A spricht die niedrigste Summe mit dem kleinsten Abstand zur Obergrenze, kombiniert mit Festpreisgarantie, 5 Jahren Gewährleistung und einem Zahlungsplan von 10 % / 90 %. Der Heizboden ist nur Option; Podest und Lift fehlen.", [e(A, 2) + " brutto:", "Heizboden und Küchenabgrenzung klären."]]},
    {"typ": "text", "x": 641, "y": 420, "w": 215, "box": True, "schrift": 8.6, "titel": "Baupartner B · breitester Umfang", "h": 214,
     "absaetze": ["Für B spricht der größte Umfang mit Heizboden, Klima, Podest und Lift. Die Summe liegt 276.658,43 € über der Obergrenze, das Angebot ist freibleibend. Ohne Podest und Lift bleibt B bei 491.761,68 € brutto.", [e(B, 2) + " brutto:", "nur sinnvoll, wenn Umfang vor Budget geht."]]},
    {"typ": "dunkel", "x": 51, "y": 176, "w": 805, "h": 96, "titel": "Warum C nachrangig bleibt", "abstand": 40,
     "werte": [],
     "text": "Mit der Heizboden-Option liegt A bei 387.578,73 € brutto, nur 4.820,39 € unter C. C weist kein Klima aus und setzt den Heizboden nur im DG an. Dazu kommen 30 % Anzahlung bei einem Unternehmen in Gründung ohne Handelsregistereintragung. C bleibt eine Alternative, wenn Nachweise und Absicherung überzeugen."}],
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
