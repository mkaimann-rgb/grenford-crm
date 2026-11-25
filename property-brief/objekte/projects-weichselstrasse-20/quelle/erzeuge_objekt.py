# GRENFORD Renovation Brief · Vergleich – Muster für Vorhaben bis 100.000 € netto (Wohnungen, kleine Reihenhäuser).
# Aufgebaut am abgeschlossenen Renovation Memo Weichselstraße 20 (Oktober 2026). 12 Seiten.
# Quelle aller Zahlen: Leistungsverzeichnis und Rot-Gelb-Plan vom 20.10.2026, Angebote der Baupartner.
import json, os
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')
OBER = 30000                                         # absolute Obergrenze netto
AN, BN, CN = 36613.56, 32430.05, 39994.24            # netto
AB, BB, CB = 43570.14, 38591.76, 47593.15            # brutto
def e(v, d=0): return f'{v:,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'
def pz(v): return f'{v:+.1f}'.replace('.', ',').replace('-', '−') + ' %'
KG = ["Baustelle & Rückbau", "Elektro", "Sanitär & Heizung", "Trockenbau / Rohbau", "Fliesen", "Boden", "Maler & Lack", "Türen & Fenster", "Planung & PM 15 %"]
NA = [5335.00, 5200.00, 7682.59, 2970.50, 4611.54, 293.78, 5032.50, 5487.65, 0]
NB = [6663.12, 1680.00, 6843.20, 0, 2570.42, 4407.60, 10265.71, 0, 0]
NC = [7522.25, 3340.00, 6925.00, 1485.00, 4084.75, 1741.35, 4479.25, 5200.00, 5216.64]
for n, s_, t in (('A', NA, AN), ('B', NB, BN), ('C', NC, CN)): assert abs(sum(s_) - t) < .02, n
def z(v): return '—' if v == 0 else e(v, 2)

meta = {"titel": "GRENFORD Renovation Brief – Weichselstraße 20", "fusszeile": "GRENFORD PROJECTS / WEICHSELSTRASSE 20 · RENOVATION BRIEF · VERTRAULICH",
        "ausgabe": "GRENFORD_Renovation_Brief_Weichselstrasse_20_Muster.pdf", "redaktionsstand": "22.10.2026", "agb_stand": "24.10.2026",
        "bereich": "projects", "typo": "sans", "dokument": "Renovation Brief"}
Q = "Quelle: Leistungsverzeichnis und Rot-Gelb-Plan vom 20.10.2026, Angebote der Baupartner; GRENFORD-Auswertung."
S = []
S.append({"modul": "titel", "id": "titel", "bild": "flur.jpg", "bild_pos": "center 55%", "dachzeile": "Renovation Brief · Angebotsvergleich",
  "vertraulich": ["Persönlich", "Vertraulich"], "titel": ["WEICHSEL-", "STRASSE"], "untertitel": ["Altbauwohnung", "Friedrichshain"],
  "kurz": ["Drei Angebote, anonymisiert A / B / C", "Kosten, Leistungen und Budget", "Deine Vorauswahl für das Kennenlernen"],
  "adresse": ["Weichselstraße 20, 2. OG Mitte", "10247 Berlin"],
  "kennzahlen": [["ca. 64,5 m²", "Raumfläche laut Plan*"], ["3", "Angebote"], ["28–30 Tsd. €", "Budget netto"], ["20.10.2026", "Besichtigung"]],
  "hinweis": "* Summe der Raumflächen laut Originalgrundriss (ohne Balkon); kein Aufmaß. Budget und Obergrenze laut Leistungsverzeichnis."})
S.append({"modul": "vorwort", "id": "vorwort", "bereich": "vor", "dachzeile": "Persönlich für dich", "titel": "Deine Wünsche, dein Weg",
  "gruss": "Dein Marco",
  "lead": "Liebe Vicky, mit deiner Wohnung in der Weichselstraße möchtest du Räume neu ordnen, das Bad modernisieren und die besonderen Altbaudetails erhalten.",
  "links": "Auf einer gemeinsamen Aufgabenbasis, dem Leistungsverzeichnis, haben wir Angebote geeigneter Baupartner eingeholt. Hier vergleichen wir sie anonymisiert als A, B und C.",
  "rechts": "Der Preis allein entscheidet nicht darüber, welcher Ansatz zu dir passt. Deshalb zeigen wir Kosten, Umfang und offene Punkte nebeneinander.",
  "schluss": "Danach wählen wir gemeinsam zwei Baupartner zum Kennenlernen aus. Du entscheidest, wen du direkt beauftragst; ich begleite dich beratend bis zur Fertigstellung – für dich kostenfrei."})
S.append({"modul": "raster", "id": "blick", "bereich": "vor", "kopf": "Auf einen Blick", "dachzeile": "Das Ergebnis auf einer Seite", "titel": "B und A vertiefen, C als Alternative",
  "intro": "Alle drei Angebote liegen über deiner Obergrenze von 30.000 € netto. B hat den kleinsten Abstand, beschreibt aber einen engeren Umfang; A bietet Festpreis und Gewährleistung.",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 384, "w": 560, "h": 64, "groesse": 22, "gap": 12,
     "items": [{"wert": e(BN, 2), "label": f"Baupartner B · {pz((BN/OBER-1)*100)}", "text": "Niedrigste Summe, engerer Umfang"},
               {"wert": e(AN, 2), "label": f"Baupartner A · {pz((AN/OBER-1)*100)}", "stil": "hell", "text": "Festpreis, 5 Jahre Gewährleistung"},
               {"wert": e(CN, 2), "label": f"Baupartner C · {pz((CN/OBER-1)*100)}", "text": "Detailliert, inkl. 15 % Planung und PM"}]},
    {"typ": "balken", "x": 51, "y": "folgt", "abstand": 26, "w": 560, "lw": 110, "vw": 110, "max": 42000, "titel": "Angebotssumme netto im Vergleich zur Obergrenze", "abstand": 30, "bh": 16,
     "items": [["Obergrenze", OBER, "30.000 €", "h"], ["Baupartner B", BN, e(BN, 2)], ["Baupartner A", AN, e(AN, 2)], ["Baupartner C", CN, e(CN, 2)]]},
    {"typ": "dunkel", "x": 640, "y": 384, "w": 216, "h": 300, "titel": "Unsere Empfehlung", "abstand": 74,
     "werte": [["B · A", "Vertiefen und kennenlernen", 40, "o"], ["C", "Als Alternative", 30]],
     "text": "Bei B fehlende Leistungen ergänzen lassen; bei A Fliesenformat, Wannenmaß, Dielen und Küchenwasser klären."}],
  "quelle": Q + " Prozentwerte: Abstand zur Obergrenze von 30.000 € netto."})
S.append({"modul": "raster", "id": "vorgaben", "kopf": "Deine Vorgaben", "dachzeile": "Das hast du GRENFORD anvertraut", "titel": "Deine Wohnung, deine Vorgaben",
  "bloecke": [
    {"typ": "kv", "x": 51, "y": 412, "w": 560, "kw": 110, "schrift": 9.0,
     "zeilen": [["Raumkonzept", "Küche zum vorgelagerten Raum öffnen, Trockenbau anpassen und Anschlüsse verlegen."],
                ["Badezimmer", "Vollständige Erneuerung mit Duschbadewanne, Hänge-WC und Standardfliesen 30 × 60 cm."],
                ["Oberflächen", "Ausgewählte Dielen aufarbeiten, Wände bearbeiten, Flur und Türen erneuern bzw. anpassen."],
                ["Altbaudetails", "Holzkastenfenster und Balkontür aufarbeiten; Bestandsbauteile erhalten."],
                ["Erhalten", "Gasetagenheizung und Heizkörper, Wohnzimmerdielen; Elektroverteiler, soweit geeignet."]]},
    {"typ": "dunkel", "x": 640, "y": 412, "w": 216, "h": 214, "titel": "Deine Budgetvorgabe", "abstand": 58,
     "werte": [["28–30", "Tsd. € netto Zielrahmen", 36, "o"], ["30.000 €", "absolute Obergrenze", 18]],
     "text": "Möglichst darunter. Küchenmöbel, Geräte und Küchenmontage sind nicht Teil des Leistungsverzeichnisses."},
    {"typ": "schritte", "x": 51, "y": 150, "w": 805,
     "items": [["01 · Erledigt", "Aufnehmen", "Wünsche, Bestand und Budget erfasst"], ["02 · Wir sind hier", "Vergleichen", "Angebote als A / B / C analysiert"],
               ["03 · Als Nächstes", "Besprechen", "Unterschiede erläutern, zwei Partner auswählen"], ["04", "Kennenlernen", "Namen freigeben, vor Ort konkretisieren"],
               ["05", "Beauftragen", "Endangebote abstimmen, direkt beauftragen"]]}],
  "quelle": "Grundlage: Leistungsverzeichnis und Rot-Gelb-Plan vom 20.10.2026. Vor Beauftragung klären: Badboden auf Flurniveau, Wannengröße 120 oder 150 cm, Küchenanschlüsse."})
S.append({"modul": "raster", "id": "bestand", "kopf": "Bestand und Planung", "dachzeile": "Weichselstraße 20 · 2. OG Mitte", "titel": "Bestand und Umbauplanung",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 420, "w": 145, "h": 175, "bild": "bad.jpg", "titel": "Bad"},
    {"typ": "bild", "x": 206, "y": 420, "w": 145, "h": 175, "bild": "dielen.jpg", "titel": "Dielen, offene Stelle"},
    {"typ": "bild", "x": 51, "y": 222, "w": 300, "h": 120, "bild": "fenster.jpg", "pos": "center 30%", "titel": "Bad mit Fenster"},
    {"typ": "bild", "x": 371, "y": 420, "w": 485, "h": 300, "bild": "plan-rotgelb.png", "contain": True, "weiss": True, "pad": 8, "titel": "Rot-Gelb-Plan · Rückbau rot, neue Trockenbauwand gelb"},
    {"typ": "text", "x": 371, "y": 100, "w": 485, "schrift": 8.2,
     "absaetze": [["Raumflächen laut Plan:", "Zimmer 26,12 · 17,00 · 7,22 m², Bad 6,85 m², Flur 4,70 m², Küche 2,57 m² – zusammen 64,46 m² ohne Balkon."]]}],
  "quelle": "Fotos aus den Projektunterlagen, kein Zustandsprotokoll; die Ursache der offenen Stelle wird nicht aus dem Foto abgeleitet. Plan unverändert verkleinert, keine Maßentnahme; Lage der inneren Badtrennwand schematisch, keine Abbruchstatik."})
def karte(x, b, summe, brutto, profil):
    return {"typ": "dunkel", "x": x, "y": 430, "w": 255, "h": 340, "oben": 96, "abstand": 96,
            "werte": [[b, "", 72, "o"], [e(summe, 2), f"Netto · brutto {e(brutto, 2)}", 22]], "text": profil}
S.append({"modul": "raster", "id": "angebote", "kopf": "Die Angebote", "dachzeile": "Drei anonymisierte Ansätze", "titel": "Drei Angebote im Profil",
  "bloecke": [
    karte(51, "A", AN, AB, "Festpreis mit Gewährleistung. Zehn Positionsgruppen mit Bauleitung und Bemusterung; Wohnzimmer und Dielen nicht enthalten. Zahlung 10 % / 90 %, 5 Jahre Gewährleistung, 30 Tage gültig."),
    karte(326, "B", BN, BB, "Niedrigste Summe, engerer Umfang. Sieben Leistungsbereiche, Aufmaß 64,46 m². Fenster, Türen, Trockenbau und Küchenanschlüsse sind nicht genannt; Zahlungsplan nach Beauftragung."),
    karte(601, "C", CN, CB, "Detailliert kalkuliert, höchste Summe. Sieben Gewerke mit Positionspreisen und 15 % Planung und PM (5.216,64 €). Vier Bedarfspositionen (1.513,07 € netto) nicht enthalten."),
    ],
  "quelle": "Alle drei Baupartner haben dasselbe Leistungsverzeichnis erhalten; die Unterschiede liegen im beschriebenen Umfang. Die Beträge geben den dokumentierten Angebotsstand wieder. Technische Eignung und tatsächliche Ausführung sind damit nicht bestätigt. Umsatzsteuer 19 %."})
S.append({"modul": "raster", "id": "kosten", "kopf": "Kosten und Budget", "dachzeile": "Gemeinsame Kostengruppen · netto", "titel": "Wofür wird kalkuliert?",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 470, "breiten": [170, 100, 100, 100], "zh": 26, "schrift": 8.8, "hervorheben": ["Summe netto"],
     "kopf": ["Leistungsgruppe", "A", "B", "C"],
     "zeilen": [[k, z(a), z(b), z(c)] for k, a, b, c in zip(KG, NA, NB, NC)] + [["Summe netto", e(AN, 2), e(BN, 2), e(CN, 2)]],
     "markiere": [[i, 1 + [a, b, c].index(max(a, b, c))] for i, (a, b, c) in enumerate(zip(NA, NB, NC)) if max(a, b, c) > 0]},
    {"typ": "hstack", "x": 550, "y": 420, "w": 306, "lw": 34, "sw": 70, "max": 42000, "bh": 26, "abstand": 46, "titel": "Netto, Obergrenze 30.000 €",
     "zeilen": [["A", [[OBER, "light", "bis 30.000"], [AN - OBER, "acc", ""]], "+" + e(AN - OBER)],
                ["B", [[OBER, "light", "bis 30.000"], [BN - OBER, "acc", ""]], "+" + e(BN - OBER)],
                ["C", [[OBER, "light", "bis 30.000"], [CN - OBER, "acc", ""]], "+" + e(CN - OBER)]]},
    {"typ": "text", "x": 550, "y": "folgt", "abstand": 10, "w": 306, "box": True, "schrift": 8.4,
     "absaetze": [["Die Konsequenz:", f"Auch das günstigste Angebot B liegt {e(BN - OBER, 2)} netto über der Obergrenze. C bleibt auch ohne Planungsanteil darüber (34.777,60 € netto). Prioritäten und Umfang gehören vor die Vergabe."]]}],
  "quelle": "Zuordnung zu gemeinsamen Gruppen: GRENFORD-Auswertung. Hinterlegt: höchster Betrag je Zeile. „—“ heißt nicht ausgewiesen, nicht 0 €."})
S.append({"modul": "raster", "id": "matrix", "kopf": "Leistungen und Konditionen", "dachzeile": "Im direkten Vergleich", "titel": "Wo jeder Partner stark ist",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 805, "breiten": [150, 64, 133, 64, 133, 64, 133], "links": [0, 2, 4, 6], "tags": [1, 3, 5], "zh": 34, "schrift": 8.4,
     "kopf": ["Kriterium", "A", "", "B", "", "C", ""],
     "zeilen": [["Summe und Budget", "Mittel", "+22,0 % über Obergrenze", "gut", "+8,1 %, kleinster Abstand", "Prüfen", "+33,3 % über Obergrenze"],
                ["Preisansatz", "gut", "Festpreis, zehn Gruppen", "Mittel", "Gesamtpreis je Bereich", "Prüfen", "Positionspreise, Aufmaßvorbehalt"],
                ["Zahlung, Gewährleistung", "gut", "10 / 90, 5 Jahre", "Prüfen", "Nach Beauftragung zu klären", "Prüfen", "Vor Auftrag zu vereinbaren"],
                ["Planung und Management", "gut", "In Baustelle enthalten", "Mittel", "Ein Ansprechpartner", "Prüfen", "15 % = 5.216,64 € netto"],
                ["Dielen und Fenster", "Mittel", "Fenster lackieren, Dielen nicht", "Mittel", "Dielen schleifen, Fenster nicht", "gut", "Dielen und Fenster"],
                ["Küche", "Mittel", "Elektro, Schiebetür; Wasser fehlt", "Prüfen", "Nur Leitungen ins Wohnzimmer", "gut", "Wasser, Kochfeld, Steckdosen"],
                ["Bedarf und Vorbehalt", "Mittel", "Tischlerarbeiten gesondert", "Mittel", "Dielenreparatur separat", "Mittel", "4 Positionen 1.513,07 € offen"]]}],
  "quelle": "GRENFORD-Einordnung auf Basis der Originalangebote; „nicht genannt“ heißt: nicht als enthalten behandelt. „Prüfen“ heißt: vor dem nächsten Schritt schriftlich klären. Kein Qualitätsurteil."})
S.append({"modul": "raster", "id": "empfehlung", "kopf": "Klärung und Empfehlung", "dachzeile": "Von der Analyse zum belastbaren Endangebot", "titel": "Was wir jetzt klären",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 420, "w": 805, "breiten": [150, 420, 235], "links": [0, 1, 2], "zh": 46, "schrift": 9.0,
     "kopf": ["Baupartner", "Was wir klären", "Ergebnis"],
     "zeilen": [["B · Vollständigkeit", "Fenster, Türen, Trockenbau, Badboden-Höhe und Küchenanschlüsse ergänzen oder ausschließen lassen; der Preisvorteil kann dadurch schrumpfen.", "Bestätigter Umfang, belastbarer Endpreis."],
                ["A · Einzelheiten", "Fliesenformat (30 × 60 oder 60 × 60), Wannenmaß, Dielen und Küchenwasser auf LV-Basis klären; Tischlerarbeiten an Fenstern gesondert anbieten lassen.", "Bestätigter Umfang, belastbarer Endpreis."],
                ["C · Umfang, Management", "Leistungssumme 34.777,60 € netto plus 15 % Planung und PM; Mengen und Bedarfspositionen bestätigen lassen.", "Nachvollziehbarer Managementanteil und Bedarf."]]},
    {"typ": "dunkel", "x": 51, "y": "folgt", "abstand": 22, "w": 805, "h": 96, "titel": "Gemeinsame Basis", "abstand": 40, "werte": [],
     "text": "Rot-Gelb-Plan mit Rückbaugrenzen, Aufmaß, Machbarkeit der Badabsenkung, bemaßter Badplan mit Wannenprüfung, Anschlussplan Küche und Eignung des Elektroverteilers. Ergebnisse gelten erst nach schriftlicher Rückmeldung der Baupartner."}],
  "quelle": "Kein Angebot ist bereits als vollständig passender Endpreis bestätigt; keine Referenz- oder Bonitätsprüfung. Du beauftragst direkt; GRENFORD übernimmt keine Bauleitung und keine Abnahme."})
S.append({"modul": "kontakt", "id": "kontakt", "bereich": "nach", "bild": "flur.jpg", "bild_pos": "center 60%", "kopf": "Nächster Schritt &amp; Kontakt",
  "claim": ["Deine Wünsche,", "dein nächster", "Schritt"], "dachzeile": "Dein Vorhaben gemeinsam umsetzen", "titel": ["Lerne deine", "Möglichkeiten kennen"],
  "box_label": "Dein Ansprechpartner", "box_titel": "Marco Kaimann, Founder &amp; Strategic Advisor",
  "schritte": [["Prioritäten und Vorauswahl bestätigen", "Wir legen fest, was unverzichtbar ist und welche zwei Baupartner du kennenlernen möchtest."],
               ["Namen freigeben, offene Punkte klären", "Nach deiner Vorauswahl geben wir Namen und Kontakte frei; offene Fragen lassen wir schriftlich beantworten."],
               ["Vor Ort besprechen und beauftragen", "Du beauftragst direkt, erst auf Basis geklärter Endangebote. GRENFORD begleitet dich bis zur Fertigstellung."]]})
S.append({"modul": "recht", "id": "recht", "bereich": "nach", "dachzeile": "GRENFORD Projects · Weichselstraße 20", "schrift": 8.8, "zeile": 12.8,
  "intro": ["Dieser Brief dient der Entscheidungsvorbereitung. Woher die Zahlen stammen, welche Rollen gelten und wie du ihn nutzen darfst, ist hier offengelegt.",
            "Er ersetzt keine Rechts-, Steuer- oder Bauberatung und enthält keine Referenz- oder Bonitätsprüfung der Baupartner."],
  "bloecke": [["Kosten und Beratung", "Du zahlst GRENFORD kein Honorar, auch nicht für die Begleitung bis zur Fertigstellung. GRENFORD wird für die Vermittlung vom beauftragten Baupartner vergütet. Ob und wen du beauftragst, entscheidest allein du."],
              ["Angebote und Auswertung", "Preise, Mengen und Leistungen stammen aus den Angeboten der Baupartner und dem Leistungsverzeichnis vom 20.10.2026. Kostengruppen und Einschätzung sind GRENFORD-Auswertungen. Verbindlich ist nur das jeweilige Angebot bzw. der Bauvertrag."],
              ["Rolle und Verantwortung", "Du beauftragst die Baufirma direkt; Ausführung, Gewährleistung und Zahlungen laufen nur zwischen dir und ihr. GRENFORD übernimmt keine Bauleitung und keine Abnahme."],
              ["Vertraulichkeit und Urheberrecht", "Dieser Brief ist nur für dich erstellt (© GRENFORD). Eine Weitergabe an Dritte, insbesondere an Baufirmen, ist nur mit Zustimmung zulässig; die Angebote der Baupartner sind vertraulich."]]})
S.append({"modul": "agb", "id": "agb", "bereich": "nach", "datei": "agb_projects.html", "teilung": [2, 4], "dachzeile": "GRENFORD Projects · Renovation Brief",
  "stil": "font-size:8.4pt;line-height:11.6pt"})

json.dump({"meta": meta, "kosten": {"einheiten": []}, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
