# Erzeugt objekt.json für den GRENFORD Investment Brief Pätzer Straße 11 (GI26-003, Nummerierung fortlaufend unter GRENFORD Investments).
# Format „Investment Brief“: kleines Mehrfamilienhaus, Mischung aus Property Brief (Objekt, Lage, Grundrisse)
# und Investment Memo (Hard Facts, Rendite, Finanzierung, Sensitivität, Asset Check, Value Matrix).
# Quellen: Angaben und Unterlagen des Verkäufers; Marktwerte Recherche 24.11.2026; Annahmen GRENFORD.
import json, os
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')

# ---------- Rechenbasis (alle Kennzahlen werden hier berechnet, nicht von Hand eingetragen)
PREIS = 1440000; FL = 453; MIETE = 15.0
GREST, COURT, NOTAR = 6.0, 7.14, 2.0                # Berlin; Käufercourtage brutto; Notar/Grundbuch Annahme
BEWI = 15.0                                         # nicht umlagefähige Kosten, % der Jahresmiete (Annahme)
LTV, ZINS, TILG = 70.0, 3.8, 2.0                    # Finanzierungsbeispiel, Darlehen in % des Kaufpreises
JM = FL * MIETE * 12
NK = PREIS * (GREST + COURT + NOTAR) / 100; INV = PREIS + NK
REIN = JM * (1 - BEWI / 100)
DAR = PREIS * LTV / 100; EK = INV - DAR; ZI = DAR * ZINS / 100; TI = DAR * TILG / 100; KD = ZI + TI; CF = REIN - KD

def e(v, d=0): return f'{v:,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'
def p(v, d=2): return f'{v:.{d}f}'.replace('.', ',') + ' %'
def f1(v): return f'{v:.1f}'.replace('.', ',')
def mio(v): return f'{v/1e6:.2f}'.replace('.', ',') + ' Mio. €'
BR = JM / PREIS * 100; FAK = PREIS / JM; NAR = REIN / INV * 100
print(f'Jahresmiete {JM:.0f}  NK {NK:.0f}  INV {INV:.0f}  Rein {REIN:.0f}  BR {BR:.2f}  NAR {NAR:.2f}  EK {EK:.0f}  KD {KD:.0f}  CF {CF:.0f}')

meta = {"titel": "GRENFORD Investment Brief – Pätzer Straße 11",
        "fusszeile": "GRENFORD INVESTMENTS / PÄTZER STRASSE 11 · INVESTMENT BRIEF · VERTRAULICH",
        "ausgabe": "GRENFORD_Investment_Brief_Paetzer_Strasse_11.pdf", "redaktionsstand": "25.11.2026", "agb_stand": "18.11.2026",
        "bereich": "investment", "typo": "sans", "dokument": "Investment Brief"}

kosten = {"land": "Berlin", "grunderwerbsteuer": GREST, "courtage_brutto": COURT, "courtage_netto": "6,00 %",
          "agb_courtage": "Die Käufercourtage für dieses Objekt beträgt 6,00 % des notariellen Kaufpreises zzgl. 19 % MwSt., insgesamt 7,14 %. Bei Mehrfamilienhäusern gelten die §§ 656a–656d BGB nicht.",
          "flaeche_qm": FL, "einheiten": [{"id": "haus", "name": "Mehrfamilienhaus Pätzer Straße 11", "preis": PREIS, "innenflaeche": FL}]}

Q = "Quelle: Angaben des Verkäufers und Objektunterlagen"
S = []
S.append({"modul": "titel", "id": "titel", "bild": "garten-fassade.jpg", "bild_pos": "center 38%",
  "dachzeile": "Investment Brief · Mehrfamilienhaus", "vertraulich": ["Off-Market · Kapitalanlage", "Vertraulich"],
  "titel": ["THE HERITAGE", "HOUSE"], "untertitel": ["Britz", "Investment Residence"],
  "kurz": ["Mehrfamilienhaus von 1898", "Sieben Einheiten, voll vermietet", "Reserve im Dachgeschoss"],
  "adresse": ["Pätzer Straße 11", "12359 Berlin-Britz"],
  "kennzahlen": [["7 von 7", "Einheiten vermietet"], ["1,44 Mio. €", "Kaufpreis"], [f1(FAK) + "-fach", "Kaufpreisfaktor"], [p(BR), "Bruttorendite"]],
  "hinweis": "Gartenansicht · Kennzahlen auf Basis der Verkäuferangaben, Rechnung GRENFORD · Stand 25.11.2026"})

S.append({"modul": "inhalt", "id": "inhalt", "bereich": "vor", "bild": "fassade-strasse.jpg", "bild_pos": "center 40%",
  "claim": ["Ein Haus,", "sieben Einheiten"], "marke": "The Heritage House · GI26-003",
  "text": ["Objekt, Zahlen und Potenzial", "der Kapitalanlage im Überblick"], "adresse": ["Pätzer Straße 11", "12359 Berlin-Britz"],
  "kapitel": [{"titel": "Vorwort und Hard Facts", "sub": "Einordnung, Kaufpreis, Rendite auf einen Blick", "seiten": ["vorwort", "fakten"]},
              {"titel": "Objekt und Lage", "sub": "Das Haus, Umfeld und Anbindung in Berlin-Britz", "seiten": ["objekt", "lage"]},
              {"titel": "Mieteinheiten und Grundrisse", "sub": "Sieben Einheiten, Flächen und Bestandspläne", "seiten": ["einheiten", "grundrisse-2"]},
              {"titel": "Asset und Haustechnik", "sub": "Substanz, Modernisierung, Heizung und Energie", "seiten": ["asset"]},
              {"titel": "Markt und Rendite", "sub": "Mietorientierung, Kaufpreis, Rendite und Sensitivität", "seiten": ["markt", "rendite"]},
              {"titel": "Finanzierung und Potenzial", "sub": "Finanzierungsbeispiel, Aufstockung und Ausbau Dachgeschoss", "seiten": ["finanzierung", "potenzial"]},
              {"titel": "Asset Check und Value Matrix", "sub": "Unterlagenstand, Stärken, Hebel und Chancen", "seiten": ["check", "matrix"]},
              {"titel": "Nächster Schritt, GRENFORD, Anhang", "sub": "Transaktionsablauf, Kontakt, Hinweise und AGB", "seiten": ["kontakt", "agb"]}]})

S.append({"modul": "vorwort", "id": "vorwort", "bereich": "vor", "dachzeile": "The Heritage House · Investment Brief",
  "titel": "Ein Gründerzeithaus als Kapitalanlage",
  "lead": "Mit diesem Investment Brief stellen wir Ihnen ein voll vermietetes Mehrfamilienhaus von 1898 in Berlin-Britz vor: sechs Wohnungen und eine Remise auf rund 781 m² Grundstück.",
  "links": "Das Objekt: Stuckfassade, Holzdielen und Fachwerk sind erhalten; Bäder, Küchen und Heizung wurden in den vergangenen Jahren modernisiert. Alle sieben Einheiten sind vermietet.",
  "rechts": f"Das Angebot: Kaufpreis 1,44 Mio. €, Kaufpreisfaktor {f1(FAK)}-fach und Bruttorendite {p(BR)} auf Basis der Verkäuferangaben. Dazu Reserve im Dachgeschoss.",
  "schluss": "Der Brief führt von den Hard Facts über Objekt, Lage und Mieteinheiten zu Rendite, Finanzierung und Potenzial und schließt mit dem GRENFORD Asset Check. Für Rückfragen und die Unterlagen stehen wir Ihnen persönlich zur Verfügung."})

S.append({"modul": "fakten", "id": "fakten", "bereich": "vor", "kopf": "Hard Facts", "start": 356, "zeilenhoehe": 15.2, "blockabstand": 16,
  "kennzahlen": [["1,44 Mio. €", "Kaufpreis"], ["ca. 3.179 €/m²", "Kaufpreis je m²"], [f1(FAK) + "-fach", "Kaufpreisfaktor"], [p(BR), "Bruttorendite"], ["7 von 7", "Einheiten vermietet"]],
  "dachzeile": "Zahlen, Daten, Fakten · Objekt-Nr. GI26-003", "titel": "Das Haus in Kennzahlen",
  "links": [{"titel": "Objekt und Fläche", "zeilen": [["Objektart", "Mehrfamilienhaus mit Remise"], ["Baujahr", "1898 · Modernisierung 2018"],
                                                      ["Einheiten", "6 Wohnungen und 1 Remise"], ["Wohn- und Nutzfläche (Verkäufer)", "ca. 453 m²"],
                                                      ["Wohnungen laut Bestandsplan", "ca. 242 m²"], ["Grundstück", "ca. 781 m²"], ["Reserve", "Dachgeschoss, Garten"]]},
            {"titel": "Vermietung und Technik", "zeilen": [["Vermietungsstand", "7 von 7 Einheiten"], ["Mietverträge", "befristet"],
                                                           ["Durchschnittsmiete (Verkäufer)", "Ø 15,00 €/m²"], ["Heizung", "Gaszentralheizung 2018"]]}],
  "rechts": [{"titel": "Kaufpreis und Erwerbsnebenkosten", "zeilen": [["Kaufpreis", e(PREIS)], [f"Grunderwerbsteuer Berlin {p(GREST,1)}", e(PREIS*GREST/100)],
                                                                    [f"Käufercourtage {p(COURT)} inkl. MwSt.", e(PREIS*COURT/100)], [f"Notar und Grundbuch (Annahme {p(NOTAR,1)})", e(PREIS*NOTAR/100)],
                                                                    ["Gesamtinvestition", e(INV)]]},
             {"titel": "Ertrag und Rendite (Modell)", "zeilen": [["Jahresnettokaltmiete", e(JM)], ["Bruttorendite auf Kaufpreis", p(BR)], ["Kaufpreisfaktor", f1(FAK) + "-fach"],
                                                                ["Reinertrag nach Bewirtschaftung", e(REIN)], ["Nettoanfangsrendite auf Gesamtinvestition", p(NAR)]]}],
  "quelle": [f"{Q}. Rechnung GRENFORD: 453 m² × 15,00 €/m² × 12; Bewirtschaftung {p(BEWI,0)} der Jahresmiete (Annahme). Circa-Werte, keine Berechnung nach WoFlV.",
             "Vermerk: Die Bestandspläne weisen für die sechs Wohnungen ca. 242 m² aus; maßgeblich für Fläche und Ertrag sind Mieterliste und Mietverträge."]})

S.append({"modul": "bildseite", "id": "objekt", "kopf": "Das Objekt", "stil": "voll", "bild": "fassade-seite.jpg", "bild_pos": "center 40%",
  "dachzeile": "Das Objekt", "titel": ["Gründerzeit,", "gut vermietet"],
  "text": "Je zwei Wohnungen auf drei Etagen um ein gemeinsames Treppenhaus, dazu die Remise im Garten. Stuckfassade, Dielen und Fachwerk prägen das Haus; Bäder, Küchen und Heizung sind modernisiert.",
  "kennzahlen": [["1898", "Baujahr"], ["7", "Einheiten"], ["781 m²", "Grundstück"]],
  "hinweis": "Straßenansicht · Fotoaufnahme Bestand"})

S.append({"modul": "lage", "id": "lage", "kopf": "Lage", "karte": {"lat": 52.4545, "lon": 13.441, "label": ["Pätzer Straße 11", "12359 Berlin-Britz"]},
  "dachzeile": "Pätzer Straße 11 · Berlin-Britz", "titel": ["Ruhig wohnen,", "schnell in der Stadt"],
  "intro": "Die Pätzer Straße liegt in einem ruhigen Wohnquartier in Britz, ohne Durchgangsverkehr. Bus, U-Bahn und Stadtautobahn sind in wenigen Minuten erreichbar – eine gefragte Lage für Mieter mit Berufsweg in die Innenstadt.",
  "gruppen": [{"titel": "Einkauf &amp; Versorgung", "text": "Supermärkte und Fachgeschäfte im Quartier · Einkaufszentrum Gropius Passagen in der Nähe."},
              {"titel": "Schule &amp; Familie", "text": "Schulen, Kindergärten und Arztpraxen in Britz; Gymnasien und Hochschulen im Bezirk Neukölln."},
              {"titel": "Grün &amp; Kultur", "text": "Britzer Garten · Schloss Britz mit Gutspark · Grünflächen entlang des Teltowkanals."}],
  "oepnv": [{"titel": "Bus Britzer Damm / Gradestraße", "text": "Haltestelle ca. 1 Minute zu Fuß"},
            {"titel": "U-Bahn U7", "text": "U Blaschkoallee, ca. 750 m"},
            {"titel": "S-Bahn und Autobahn", "text": "S Hermannstraße ca. 1,7 km · A100 und A113 in der Nähe"}],
  "quelle": ["Entfernungen laut Verkäuferunterlagen; Südkreuz ca. 13 Minuten mit dem Auto, ca. 36 Minuten mit Bus und S-Bahn.",
             "Kartenpunkt schematisch; Linien und Wege vor Ort prüfen."]})

E = [["EG · Wohnung 1", "Zimmer 1, Küche", "44,30", "Vermietet", "befristet"], ["EG · Wohnung 2", "Zimmer 2 und 3, Bad", "34,30", "Vermietet", "befristet"],
     ["1. OG · Wohnung 3", "2 Zimmer, Küche", "46,25", "Vermietet", "befristet"], ["1. OG · Wohnung 4", "2 Zimmer, Bad", "34,00", "Vermietet", "befristet"],
     ["2. OG · Wohnung 5", "2 Zimmer, Bad, Diele", "46,50", "Vermietet", "befristet"], ["2. OG · Wohnung 6", "Zimmer, Küche", "37,00", "Vermietet", "befristet"],
     ["Remise · Einheit 7", "Gartenseitig, seit rund einem Jahr vermietet", "lt. Mieterliste", "Vermietet", "befristet"]]
S.append({"modul": "raster", "id": "einheiten", "kopf": "Mieteinheiten", "dachzeile": "Sieben Einheiten · ein Haus", "titel": "Alle Einheiten vermietet",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 410, "w": 805, "h": 48, "groesse": 18, "gap": 12,
     "items": [{"wert": "7 von 7", "label": "Einheiten vermietet"}, {"wert": "6 + 1", "label": "Wohnungen und Remise", "stil": "hell"},
               {"wert": "34–47 m²", "label": "Wohnungsgrößen laut Plan"}, {"wert": "Ø 15 €/m²", "label": "Miete laut Verkäufer", "stil": "hell"}]},
    {"typ": "tabelle", "x": 51, "y": 336, "w": 520, "titel": "Einheitenübersicht", "breiten": [128, 196, 70, 70, 56], "links": [0, 1], "tags": [3], "zh": 24, "schrift": 8.4,
     "kopf": ["Einheit", "Räume", "m² Plan", "Status", "Vertrag"], "zeilen": E},
    {"typ": "balken", "x": 610, "y": 336, "w": 246, "lw": 92, "vw": 40, "titel": "Wohnfläche je Wohnung, m²", "abstand": 24, "max": 50,
     "items": [["Wohnung 1", 44.30, "44,3"], ["Wohnung 2", 34.30, "34,3"], ["Wohnung 3", 46.25, "46,3"], ["Wohnung 4", 34.00, "34,0"],
               ["Wohnung 5", 46.50, "46,5"], ["Wohnung 6", 37.00, "37,0"]]},
    {"typ": "text", "x": 51, "y": 110, "w": 805, "schrift": 8.2,
     "absaetze": [["Kompakte Einheiten:", "Zwei- und Dreizimmerwohnungen zwischen 34 und 47 m² sind in Berlin breit nachgefragt und gut vermietbar. Die Remise ergänzt das Haus als siebte Einheit."],
                  "Vermerk: Wohnungsflächen laut Bestandsplänen, zusammen ca. 242 m²; der Verkäufer gibt die Wohn- und Nutzfläche mit ca. 453 m² an. Einzelmieten, Laufzeiten und die Fläche der Remise ergeben sich aus der Mieterliste, die vor dem Kaufvertrag übergeben wird."]}],
  "quelle": Q + ". Wohnungsbezeichnungen zur Orientierung; Zuordnung laut Mieterliste."})

def plan(name, art, bild, raeume, hinweise):
    return {"name": name, "art": art, "bild": bild, "quer": True, "raeume": raeume, "massketten": [], "hinweise": hinweise}
H = "Raumflächen laut Bestandsplan; Gebäudebreite 18,85 m, Tiefe 6,30 m."
S.append({"modul": "grundrisse", "id": "grundrisse-1", "kopf": "Grundrisse", "dachzeile": "Wohnebenen", "titel": "Erdgeschoss und 1. Obergeschoss",
  "legende_rechts": "Flächen laut Bestandsplan", "hinweis_oben": "Bestandspläne · nicht zur Maßentnahme geeignet",
  "plaene": [plan("Erdgeschoss", "Wohnung 1 und 2", "plan-eg.png",
                  [["01", "Zimmer 1", "32,00", False, "wohn"], ["02", "Küche", "12,30", False, "kueche"], ["03", "Zimmer 3", "23,65", False, "wohn"],
                   ["04", "Zimmer 2", "6,80", False, "wohn"], ["05", "Bad", "3,85", False, "nass"], ["06", "Diele, Treppe", "–", True, "weg"]],
                  ["Wohnungen ca. 44,30 m² und ca. 34,30 m².", H]),
             plan("1. Obergeschoss", "Wohnung 3 und 4", "plan-1og.png",
                  [["01", "Zimmer 2", "21,90", False, "wohn"], ["02", "Zimmer 1", "11,65", False, "wohn"], ["03", "Küche", "12,70", False, "kueche"],
                   ["04", "Zimmer 4", "23,40", False, "wohn"], ["05", "Zimmer 3", "6,65", False, "wohn"], ["06", "Bad", "3,95", False, "nass"]],
                  ["Wohnungen ca. 46,25 m² und ca. 34,00 m²; WC im Treppenhausbereich.", H])]})
S.append({"modul": "grundrisse", "id": "grundrisse-2", "kopf": "Grundrisse", "dachzeile": "Wohnebene und Keller", "titel": "2. Obergeschoss und Keller",
  "legende_rechts": "Flächen laut Bestandsplan", "hinweis_oben": "Bestandspläne · nicht zur Maßentnahme geeignet",
  "plaene": [plan("2. Obergeschoss", "Wohnung 5 und 6", "plan-2og.png",
                  [["01", "Zimmer 2", "22,75", False, "wohn"], ["02", "Zimmer 1", "11,25", False, "wohn"], ["03", "Bad", "7,10", False, "nass"],
                   ["04", "Diele", "5,40", False, "weg"], ["05", "Zimmer 3", "25,50", False, "wohn"], ["06", "Küche", "11,50", False, "kueche"]],
                  ["Wohnungen ca. 46,50 m² und ca. 37,00 m².", "Darüber das Dachgeschoss mit vier Räumen (Seite {seite:potenzial})."]),
             plan("Kellergeschoss", "Nutzfläche · keine Wohnfläche", "plan-kg.png",
                  [["01", "Büroraum", "21,75", False, "neben"], ["02", "Büroraum", "11,65", False, "neben"], ["03", "Aufenthalt", "5,75", False, "neben"],
                   ["04", "Vorraum", "3,75", False, "weg"], ["05", "Heizraum", "–", True, "neben"], ["06", "Abstellraum, Tankraum", "–", True, "neben"]],
                  ["Rechter Keller ca. 42,90 m², eigener Zugang von außen.", "Kellerflächen sind keine Wohnfläche."])]})

S.append({"modul": "raster", "id": "asset", "kopf": "Asset", "dachzeile": "Substanz und Haustechnik", "titel": "Substanz von 1898, Technik von heute",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 410, "w": 260, "h": 200, "bild": "bad.jpg", "titel": "Modernisiertes Bad"},
    {"typ": "bild", "x": 323, "y": 410, "w": 260, "h": 200, "bild": "kueche-balken.jpg", "pos": "center 40%", "titel": "Küche mit Holzbalken"},
    {"typ": "bild", "x": 51, "y": 192, "w": 260, "h": 130, "bild": "heizung.jpg", "pos": "center 30%", "titel": "Heizraum im Keller"},
    {"typ": "bild", "x": 323, "y": 192, "w": 260, "h": 130, "bild": "treppe.jpg", "pos": "center", "titel": "Treppenhaus"},
    {"typ": "kv", "x": 612, "y": 410, "w": 244, "kw": 84, "titel": "Zustand im Überblick", "schrift": 8.2, "bis": 60,
     "zeilen": [["Fassade", "Gründerzeitliche Stuckfassade mit Gesimsen und Fensterverdachungen"],
                ["Modernisierung", "Umfassende Renovierung vor rund sechs Jahren, zuletzt 2018 (Verkäuferangabe)"],
                ["Bäder, Küchen", "Modernisiert; Küchen in allen sechs Wohnungen"],
                ["Böden", "Originale Holzdielen, teils sichtbares Fachwerk"],
                ["Fenster", "Doppelt verglast in allen Etagen"],
                ["Heizung", "Bosch-Gaszentralheizung mit zentralem Warmwasserspeicher, 2018"],
                ["Energieausweis", "Vorlage spätestens zur Besichtigung; Kennwerte folgen"]]}],
  "quelle": Q + ". Fotoaufnahmen Bestand."})

S.append({"modul": "raster", "id": "markt", "kopf": "GRENFORD Research", "dachzeile": "Markt und Mietorientierung · Recherche 24.11.2026",
  "titel": "Mietniveau im Marktvergleich",
  "intro": "Die Durchschnittsmiete des Hauses laut Verkäufer im Verhältnis zu veröffentlichten Marktwerten für Britz. Durchschnittswerte umfassen alle Baujahre und Zustände; modernisierte Altbauwohnungen liegen erfahrungsgemäß darüber.",
  "bloecke": [
    {"typ": "spanne", "x": 51, "y": 362, "w": 520, "lw": 200, "titel": "Nettokaltmiete in €/m² und Monat", "achse": [8, 18, 2], "abstand": 36,
     "items": [["Pätzer Straße 11 · Ø laut Verkäufer", 15, 15, "15,00 €", "h"], ["Annahme Modellrechnung", 14, 16, "14,00–16,00 €", "h"],
               ["PLZ 12359 · miet-check.de", 11.65, 11.65, "11,65 €"], ["Britz · immoportal.com", 10.66, 10.66, "10,66 €"]]},
    {"typ": "dunkel", "x": 612, "y": 362, "w": 244, "h": 178, "titel": "Objekt im Markt", "abstand": 62,
     "werte": [["Ø 15 €/m²", "Miete laut Verkäufer", 26], ["7 von 7", "Einheiten vermietet", 26]]},
    {"typ": "text", "x": 612, "y": 166, "w": 244, "schrift": 8.4,
     "absaetze": ["Kleine, modernisierte Wohnungen mit Altbaucharakter sind in Britz gut nachgefragt; die volle Vermietung bestätigt das."]},
    {"typ": "text", "x": 51, "y": 172, "w": 520, "titel": "Lesehilfe", "schrift": 8.4,
     "absaetze": ["Die Marktwerte sind Durchschnittswerte aus Angebots- und Bestandsdaten, keine Vergleichsobjekte und keine Prognose für dieses Haus. Die Objektmiete ist eine Angabe des Verkäufers. Vermerk: Für Wohnraum in Berlin gilt bei Neuvermietung die Mietpreisbremse; die zulässige Miete ist im Einzelfall zu prüfen."]}],
  "quelle": ["Quellen: miet-check.de, Mietpreis PLZ 12359 (2026, 181 Einträge); immoportal.com, Mietspiegel Berlin-Britz (2026). Recherche 24.11.2026, nicht repräsentativ.",
             "Objektmiete: Angabe des Verkäufers. Mietspanne der Modellrechnung: Annahme GRENFORD."]})

def br_(m, kp): return p(FL * m * 12 / kp * 100)
S.append({"modul": "raster", "id": "rendite", "kopf": "Rendite", "dachzeile": "Kaufpreis, Ertrag und Sensitivität",
  "titel": "Solide Rendite im Bestand",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 410, "w": 805, "h": 50, "groesse": 19, "gap": 12,
     "items": [{"wert": e(JM), "label": "Jahresnettokaltmiete"}, {"wert": p(BR), "label": "Bruttorendite", "stil": "hell"},
               {"wert": f1(FAK) + "-fach", "label": "Kaufpreisfaktor"}, {"wert": p(NAR), "label": "Nettoanfangsrendite", "stil": "hell"}]},
    {"typ": "tabelle", "x": 51, "y": 330, "w": 400, "titel": "Drei Mietszenarien auf 1,44 Mio. €", "breiten": [130, 90, 90, 90], "hervorheben": ["15,00 €/m²"], "zh": 30,
     "kopf": ["Miete", "Miete p. a.", "Brutto", "Faktor"],
     "zeilen": [[f"{m:.2f}".replace('.', ',') + " €/m²", e(FL*m*12), br_(m, PREIS), f1(PREIS/(FL*m*12)) + "-fach"] for m in (14.0, 15.0, 16.0)]},
    {"typ": "tabelle", "x": 482, "y": 330, "w": 374, "titel": "Bruttorendite: Kaufpreis × Miete", "breiten": [110, 88, 88, 88], "zh": 30,
     "kopf": ["Kaufpreis", "14 €/m²", "15 €/m²", "16 €/m²"], "heat": {"zeilen": [0, 1, 2], "spalten": [1, 2, 3]},
     "zeilen": [[mio(kp).replace(',00', ''), br_(14, kp), br_(15, kp), br_(16, kp)] for kp in (1350000, 1400000, 1440000)]},
    {"typ": "tabelle", "x": 51, "y": "folgt", "abstand": 22, "w": 805, "titel": "Vom Kaufpreis zum Reinertrag", "breiten": [400, 200, 205], "zh": 26, "hervorheben": ["Reinertrag p. a."],
     "kopf": ["Position", "Ansatz", "Betrag"],
     "zeilen": [["Jahresnettokaltmiete", "453 m² × 15,00 €/m² × 12", e(JM)],
                ["Nicht umlagefähige Kosten (Instandhaltung, Verwaltung)", f"{p(BEWI,0)} der Miete · Annahme", "− " + e(JM*BEWI/100)],
                ["Reinertrag p. a.", "", e(REIN)]]}],
  "quelle": [f"Rechnung GRENFORD auf Basis der Verkäuferangaben (Fläche ca. 453 m², Ø 15 €/m²); vor Finanzierung und Steuern. Nettoanfangsrendite = Reinertrag ÷ Gesamtinvestition {e(INV)}.",
             "Vermerk: Bei der Wohnfläche laut Bestandsplan (ca. 242 m², ohne Remise) ergäbe sich ein entsprechend niedrigerer Ertrag; maßgeblich ist die Mieterliste."]})

S.append({"modul": "raster", "id": "finanzierung", "kopf": "Finanzierung", "dachzeile": "Finanzierungsbeispiel · Annahmen GRENFORD",
  "titel": "Tragfähig finanziert",
  "bloecke": [
    {"typ": "hstack", "x": 51, "y": 410, "w": 560, "lw": 140, "sw": 80, "max": INV / 1e6, "bh": 26, "abstand": 44, "titel": "Mittelverwendung und Mittelherkunft, Mio. €",
     "zeilen": [["Mittelverwendung", [[PREIS/1e6, "navy", "Kaufpreis 1,44"], [NK/1e6, "light", f"NK {NK/1e6:.2f}".replace('.', ',')]], mio(INV)],
                ["Mittelherkunft", [[DAR/1e6, "mid", f"Darlehen {DAR/1e6:.2f}".replace('.', ',')], [EK/1e6, "grey", f"Eigenkapital {EK/1e6:.2f}".replace('.', ',')]], mio(INV)]]},
    {"typ": "tabelle", "x": 51, "y": "folgt", "abstand": 18, "w": 560, "titel": "Jährliche Rechnung (Jahr 1)", "breiten": [300, 130, 130], "zh": 22, "hervorheben": ["Cashflow vor Steuern"],
     "kopf": ["Position", "Ansatz", "Betrag p. a."],
     "zeilen": [["Reinertrag", "nach Bewirtschaftung", e(REIN)], ["Zinsen", p(ZINS, 1) + " auf " + e(DAR), "− " + e(ZI)],
                ["Tilgung", p(TILG, 1) + " anfänglich", "− " + e(TI)], ["Cashflow vor Steuern", "", e(CF)]]},
    {"typ": "text", "x": 51, "y": "folgt", "abstand": 16, "w": 560, "schrift": 8.6,
     "absaetze": [["Aussage:", f"Bei 70 % Fremdfinanzierung trägt der Reinertrag Zins und Tilgung vollständig und erwirtschaftet zusätzlich rund {e(CF)} Überschuss im Jahr. Mit der Tilgung baut der Eigentümer jährlich rund {e(TI)} Vermögen auf."], "Wichtiger Hinweis: Das Finanzierungsbeispiel beruht auf Annahmen GRENFORD und dient allein Ihrer Orientierung; es ist kein Finanzierungsangebot. Die verbindliche Berechnung erstellt ein Kreditinstitut – mit Ihren persönlichen Konditionen, Ihrem Eigenkapital und Ihrer Bonität."]},
    {"typ": "dunkel", "x": 640, "y": 410, "w": 216, "h": 330, "titel": "Kennzahlen Finanzierung", "abstand": 78,
     "werte": [[f"{REIN/KD:.2f}".replace('.', ','), "Schuldendienstdeckung (DSCR)", 30], [p((CF + TI) / EK * 100, 1), "EK-Rendite inkl. Tilgung", 30],
               [p(LTV, 0), "Beleihung auf Kaufpreis", 30]],
     "text": "Annahme GRENFORD zur Orientierung. Ihre verbindlichen Werte berechnet Ihr Kreditinstitut."}],
  "quelle": [f"Annahmen GRENFORD, Stand November 2026: Darlehen {p(LTV,0)} des Kaufpreises, Sollzins {p(ZINS,1)}, anfängliche Tilgung {p(TILG,1)}; Eigenkapital deckt Erwerbsnebenkosten und Restkaufpreis. Vor Steuern und Abschreibung.",
             "Zins, Beleihung und Tilgung legt das Kreditinstitut nach Prüfung von Bonität, Eigenkapital und Objektunterlagen fest. Finanzierungspartner vermittelt GRENFORD auf Wunsch."]})

S.append({"modul": "raster", "id": "potenzial", "kopf": "Wertpotenzial", "dachzeile": "Aufstockung und Ausbau Dachgeschoss", "titel": "Reserve unter dem Dach",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 410, "w": 360, "h": 230, "bild": "dachgeschoss.jpg", "titel": "Dachgeschoss mit Holzbalken · Fotoaufnahme Bestand"},
    {"typ": "kv", "x": 440, "y": 410, "w": 416, "kw": 110, "titel": "Ausgangslage", "schrift": 8.4,
     "zeilen": [["Bestand", "Dachgeschoss mit vier Räumen, ca. 100 m², Gebäude 18,85 × 6,30 m"],
                ["Option", "Aufstockung und Ausbau zu zusätzlichem Wohnraum"],
                ["Genehmigung", "Bauantrag erforderlich, noch zu stellen"],
                ["Garten", "3 bis 5 Stellplätze bzw. Carport, genehmigungsabhängig"]]},
    {"typ": "kpi", "x": 440, "y": "folgt", "abstand": 18, "w": 416, "h": 56, "groesse": 20, "gap": 12,
     "items": [{"wert": "+ " + e(100 * MIETE * 12), "label": "Mehrmiete p. a. rechnerisch"}, {"wert": "100 m² × 15 €", "label": "Ansatz je Monat", "stil": "hell"}]},
    {"typ": "schritte", "x": 51, "y": 150, "w": 805,
     "items": [["01 · Prüfung", "Machbarkeit", "Statik, Baurecht und Kosten mit Architekt prüfen"], ["02 · Bauantrag", "Genehmigung", "Bauantrag für Aufstockung und Ausbau stellen"],
               ["03 · Umsetzung", "Ausbau", "Ausbau nach Genehmigung, Bestand bleibt vermietet"], ["04 · Vermietung", "Mehrertrag", "Neue Einheiten vermieten, Wert steigern"]]}],
  "quelle": "Rechnerische Mehrmiete vor Bau-, Planungs- und Finanzierungskosten; nicht in der Renditerechnung enthalten. Vermerk: Umsetzung vorbehaltlich Genehmigung; Bauantrag nicht Teil des Angebots. " + Q + "."})

S.append({"modul": "raster", "id": "check", "kopf": "GRENFORD Asset Check", "dachzeile": "Unterlagen und Prüfstand", "titel": "Klarer Unterlagenstand",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 410, "w": 805, "h": 48, "groesse": 18, "gap": 12,
     "items": [{"wert": "Vermietet", "label": "7 von 7 Einheiten"}, {"wert": "Modernisiert", "label": "Bäder, Küchen, Heizung 2018", "stil": "hell"},
               {"wert": "Gesichtet", "label": "Pläne, Fotos, Objektbeschreibung"}, {"wert": "Mit Vorlage", "label": "Mieterliste und Grundbuch", "stil": "hell"}]},
    {"typ": "tabelle", "x": 51, "y": 336, "w": 805, "breiten": [236, 92, 477], "links": [0, 1, 2], "tags": [1], "bis": 92, "schrift": 8.4,
     "kopf": ["Unterlage", "Status", "Ergebnis"],
     "zeilen": [["Objektbeschreibung des Verkäufers", "Gesichtet", "Baujahr 1898, sieben Einheiten, Modernisierung 2018, Ø 15 €/m², befristete Mietverträge"],
                ["Bestandspläne KG bis DG", "Gesichtet", "Raumflächen je Geschoss; sechs Wohnungen ca. 242 m², Keller ca. 43 m², Dachgeschoss vier Räume"],
                ["Fotodokumentation", "Gesichtet", "Fassade, Garten, Remise, Wohnräume, Bäder, Küchen, Heizraum"],
                ["Mieterliste und Mietverträge", "Folgt", "Einzelmieten, Laufzeiten, Kautionen; Übergabe vor dem Kaufvertrag"],
                ["Grundbuchauszug", "Folgt", "Auf Anfrage; Lasten und Beschränkungen ergeben sich aus dem Grundbuch"],
                ["Energieausweis", "Folgt", "Vorlage spätestens zur Besichtigung (§ 80 Abs. 4 GEG)"],
                ["Wohnflächenberechnung", "Folgt", "Abgleich Verkäuferangabe ca. 453 m² mit Bestandsplänen"]]},
    {"typ": "text", "x": 51, "y": "folgt", "abstand": 10, "w": 805, "schrift": 7.8,
     "absaetze": ["Vermerk: Zur Kaufvertragsvorbereitung folgen Mieterliste, Mietverträge, Grundbuchauszug, Energieausweis und eine Flächenaufstellung. Der Asset Check ist keine Due Diligence im rechtlichen Sinne."]}],
  "quelle": Q + ", gesichtet am 24.11.2026."})

S.append({"modul": "raster", "id": "matrix", "kopf": "Value Matrix", "dachzeile": "Stärken, Hebel, Chancen, Marktfaktoren", "titel": "Stärken nutzen, Hebel definieren",
  "bloecke": [
    {"typ": "matrix", "x": 51, "y": 412, "w": 805, "h": 286, "schrift": 8.8,
     "zellen": [{"titel": "Stärken", "akzent": True, "punkte": [["Voll vermietet.", "Sieben von sieben Einheiten, laufende Mieteinnahmen ab Übergabe."], ["Gründerzeit-Substanz.", "Stuckfassade, Dielen, Fachwerk; modernisierte Bäder und Küchen."], ["Ruhige Lage.", "Wohnquartier in Britz, Bus vor der Tür, U7 in rund 750 m."], ["Großes Grundstück.", "Rund 781 m² mit Garten und Remise."]]},
                {"titel": "Hebel", "punkte": [["Unterlagen.", "Mieterliste und Flächenaufstellung früh anfordern und abgleichen."], ["Mietverträge.", "Befristungen nutzen, Anschlussvermietung marktgerecht gestalten."], ["Finanzierung.", f"Im GRENFORD-Beispiel DSCR {REIN/KD:.2f}".replace('.', ',') + "; verbindlich rechnet das Kreditinstitut mit Ihren Konditionen."], ["Kaufpreis.", "Jede 40.000 € weniger heben die Bruttorendite um rund 0,15 Prozentpunkte."]]},
                {"titel": "Chancen", "akzent": True, "punkte": [["Dachgeschoss.", "Aufstockung und Ausbau mit Bauantrag, rechnerisch rund 18.000 € Mehrmiete p. a."], ["Stellplätze.", "3 bis 5 Stellplätze bzw. Carport im Garten."], ["Werterhalt.", "Berliner Altbau in gewachsener Lage, knappes Angebot."], ["Aufteilung.", "Langfristig Option zur Bildung von Wohnungseigentum (Genehmigungslage prüfen)."]]},
                {"titel": "Marktfaktoren", "punkte": [["Mietrecht.", "Mietpreisbremse bei Neuvermietung; Befristungen rechtlich prüfen."], ["Zinsniveau.", "Rendite vor Finanzierung bei 5,3 bis 6,0 % je Mietszenario."], ["Energie.", "Gasheizung 2018; Anforderungen des GEG im Blick behalten."], ["Nachfrage.", "Kleine Wohnungen in Berlin anhaltend gefragt."]]}]},
    {"typ": "text", "x": 51, "y": "folgt", "abstand": 10, "w": 805, "box": True, "schrift": 8.6,
     "absaetze": [["Investor Insight:", "Die Pätzer Straße 11 verbindet laufende Mieteinnahmen aus sieben Einheiten mit Gründerzeit-Substanz und einer Reserve im Dachgeschoss. Ein überschaubares Ticket für Anleger, die Bestand und Potenzial in einem Objekt suchen."]]}],
  "quelle": "Quelle: Einschätzung GRENFORD auf Basis der Verkäuferunterlagen und der Rechnung auf den Seiten {seite:rendite} und {seite:finanzierung}. Indikativ, keine Zusicherung."})

S.append({"modul": "kontakt", "id": "kontakt", "bereich": "nach", "bild": "eingang-tor.jpg", "bild_pos": "center 40%", "abstand": 56, "schrift": 8.4,
  "claim": ["Ihr Interesse,", "Ihr nächster", "Schritt"], "dachzeile": "Pätzer Straße 11 · Transaktionsablauf", "titel": ["Vom Gespräch zum", "notariellen Vertrag"],
  "box_label": "Ansprechpartner", "box_titel": "Marco Kaimann, Founder &amp; Transaction Advisor",
  "schritte": [["Gespräch und Kaufinteresse", "Wir besprechen Ihre Anlageziele und Finanzierung. Mit einer schriftlichen Interessenbekundung reservieren wir den nächsten Schritt."],
               ["Identifizierung und Unterlagen", "Nach Identifizierung gemäß Geldwäschegesetz erhalten Sie Mieterliste, Mietverträge, Grundbuch, Pläne und Energieausweis."],
               ["Prüfung und Besichtigung", "Sie und Ihre Bank prüfen die Unterlagen; wir koordinieren die Besichtigung vor Ort in Berlin-Britz."],
               ["Notarvertrag", "Wir koordinieren den Kaufvertragsentwurf mit dem Notar bis zur Beurkundung."]]})
S.append({"modul": "ueber", "id": "ueber", "bereich": "nach", "bild": "fassade-strasse.jpg", "bild_pos": "center 40%"})
S.append({"modul": "raster", "id": "disclaimer", "bereich": "nach", "kopf": "Rechtliche Hinweise", "dachzeile": "The Heritage House · Pätzer Straße 11", "titel": "Rechtliche Hinweise",
  "bloecke": [
    {"typ": "text", "x": 51, "y": 412, "w": 380, "schrift": 8.3,
     "absaetze": ["Dieser Investment Brief wurde von GRENFORD erstellt und dient ausschließlich der unverbindlichen Information über das Mehrfamilienhaus Pätzer Straße 11, 12359 Berlin. Er stellt kein Angebot im rechtlichen Sinne dar und ersetzt weder eine Anlage-, Rechts- noch Steuerberatung. Verkäufer: wird im Rahmen der Vertragsvorbereitung benannt.",
                  "Alle Angaben beruhen auf Informationen und Unterlagen des Verkäufers sowie auf Annahmen und Berechnungen von GRENFORD, Stand November 2026. Trotz sorgfältiger Zusammenstellung wird für Vollständigkeit, Richtigkeit und Aktualität keine Gewähr übernommen. Irrtum und Zwischenverkauf vorbehalten.",
                  "Renditen, Finanzierungsbeispiel und Potenzialrechnung sind unverbindliche Modellrechnungen und keine Garantie künftiger Entwicklungen. Das Finanzierungsbeispiel beruht auf Annahmen GRENFORD; eine verbindliche Finanzierungsberechnung kann ausschließlich ein Kreditinstitut mit den Konditionen des jeweiligen Käufers vornehmen. Der GRENFORD Asset Check ist weder Due Diligence im rechtlichen Sinne noch Gutachten."]},
    {"typ": "text", "x": 476, "y": 412, "w": 380, "schrift": 8.3,
     "absaetze": [["Flächen und Darstellungen.", "Wohn- und Nutzfläche ca. 453 m² laut Verkäufer; die Bestandspläne weisen für die sechs Wohnungen ca. 242 m² aus. Eine Berechnung nach WoFlV liegt nicht vor. Grundrisse nicht zur Maßentnahme geeignet; Rechte an Fotos und Plänen beim Verkäufer."],
                  ["Energieausweis.", "Vorlage spätestens zur Besichtigung (§ 80 Abs. 4 GEG); die Pflichtangaben nach § 87 GEG werden ergänzt."],
                  ["Provisionshinweis.", "Der Erwerb ist für den Käufer courtagepflichtig: 6,00 % des notariellen Kaufpreises zzgl. gesetzlicher MwSt., derzeit insgesamt 7,14 %, fällig mit Wirksamkeit des notariellen Kaufvertrags. Einzelheiten regeln die AGB auf Seite {seite:agb}."],
                  ["Verantwortlich.", "GRENFORD ist die Geschäftsbezeichnung des Einzelunternehmens Marco Kaimann; Erlaubnis nach § 34c GewO, Bezirksamt Charlottenburg-Wilmersdorf von Berlin, 01.11.2022. GRENFORD ist Verpflichteter nach dem Geldwäschegesetz."]]}]})
S.append({"modul": "agb", "id": "agb", "bereich": "nach", "datei": "agb_investment_brief.html", "dachzeile": "GRENFORD Investments · Investment Brief · Nachweis und Vermittlung"})

json.dump({"meta": meta, "kosten": kosten, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
