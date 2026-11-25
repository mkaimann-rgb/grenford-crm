# Erzeugt objekt.json für den GRENFORD Investment Brief Menzelstraße 8, 12157 Berlin-Schöneberg (GI26-004).
# Format „Investment Brief“ (siehe FORMATE.md): vermietetes Mehrfamilienhaus, 3,1 Mio. €, mit Value-Add (Mietanpassung, Dachgeschoss).
# Quellen: Datenraum des Verkäufers (Exposé, Mieterliste 01.06.2026, Flächenaufstellung 13.07.2023, Grundbuch 13.11.2024,
# Energieausweis 13.07.2023, Energieberatung 19.04.2023, Bauantrag DG mit Baubeschreibung 27.01.2025 und Eingangsbestätigung 10.02.2026).
# Eigentümer und Planverfasser-Auftraggeber werden nicht genannt; Plan-Schriftfelder sind abgeschnitten.
import json, os, math
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')

# ---------- Mieterliste 01.06.2026 (Nr, Lage, m², Ist-Miete €/Monat, Hinweis)
MIETER = [
    (1, "VH Souterrain links", 90.00, 1440.00, "Saniert, als Ferienwohnung genutzt"),
    (2, "VH Souterrain rechts", 59.00, 310.00, "Gekündigt zum 12/2026"),
    (3, "VH Hochparterre links", 108.31, 536.13, ""),
    (4, "VH Hochparterre rechts", 108.31, 1516.34, "Saniert"),
    (5, "VH 1. OG links", 128.00, 784.53, ""),
    (6, "VH 1. OG rechts", 97.46, 741.22, ""),
    (7, "VH 2. OG links", 125.02, 845.93, ""),
    (8, "VH 2. OG rechts", 63.35, 376.20, ""),
    (9, "VH 3. OG links", 130.60, 687.88, ""),
    (10, "VH 3. OG rechts", 130.35, 739.34, ""),
    (11, "SF rechts Hochparterre", 41.74, 238.23, ""),
    (12, "SF rechts 1. OG", 40.75, 308.42, ""),
    (13, "SF rechts 2. OG", 45.00, 331.29, ""),
    (14, "SF rechts 3. OG", 40.00, 640.00, "Saniert"),
    (15, "SF links Hochparterre links", 28.43, 140.73, ""),
    (16, "SF links Hochparterre rechts", 40.00, 283.60, ""),
    (17, "SF links 1. OG links", 47.00, 372.95, ""),
    (18, "SF links 1. OG rechts", 47.00, 223.58, ""),
    (19, "SF links 2. OG links", 71.56, 428.67, ""),
    (20, "SF links 2. OG rechts", 41.20, 285.11, ""),
    (21, "SF links 3. OG", 56.02, 178.85, ""),
]
FL = round(sum(m[2] for m in MIETER), 2)              # 1.539,10 m²
MM = round(sum(m[3] for m in MIETER), 2)              # 11.409,00 €
JM = round(MM * 12)                                    # 136.908 €
DG = 255.13                                            # Flächenaufstellung 13.07.2023, zwei Wohnungen 114,27 + 140,86 m²
PREIS = 3100000
GREST, COURT, NOTAR = 6.0, 7.14, 2.0
BEWI = 15.0
LTV, ZINS, TILG = 70.0, 3.8, 2.0
LTV2 = 60.0
# Value-Add (rechnerisch, Annahmen GRENFORD)
WE2_NEU = 11.0                                         # €/m² bei Neuvermietung WE 2 (Annahme; Mietpreisbremse beachten)
KAPPUNG = 15.0                                         # § 558 Abs. 3 BGB, Berlin: 15 % in drei Jahren
DG_MIETE = 14.0                                        # Planansatz laut Exposé
AUSGENOMMEN = {1, 2, 4, 14}                           # saniert/Ferienwohnung/gekündigt: keine Kappungsrechnung

def e(v, d=0): return f'{v:,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'
def p(v, d=2): return f'{v:.{d}f}'.replace('.', ',') + ' %'
def n(v, d=2): return f'{v:,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
def f1(v): return f'{v:.1f}'.replace('.', ',')
def mio(v, d=2): return f'{v/1e6:.{d}f}'.replace('.', ',') + ' Mio. €'

NK = PREIS * (GREST + COURT + NOTAR) / 100; INV = PREIS + NK
BR = JM / PREIS * 100; FAK = PREIS / JM
REIN = JM * (1 - BEWI / 100); NAR = REIN / INV * 100
QM = PREIS / FL; QM_DG = PREIS / (FL + DG)
def fin(ltv):
    dar = PREIS * ltv / 100; zi = dar * ZINS / 100; ti = dar * TILG / 100; kd = zi + ti
    return dict(dar=dar, ek=INV - dar, zi=zi, ti=ti, kd=kd, cf=REIN - kd, dscr=REIN / kd, ekr=(REIN - kd + ti) / (INV - dar) * 100)
F1, F2 = fin(LTV), fin(LTV2)
# Ertragsstufen
B_WE2 = (59.00 * WE2_NEU - 310.00) * 12
B_558 = sum(m[3] for m in MIETER if m[0] not in AUSGENOMMEN) * KAPPUNG / 100 * 12
B_DG = DG * DG_MIETE * 12
J_B = JM + B_WE2 + B_558
print(f'FL {FL} MM {MM} JM {JM} QM {QM:.0f} QM_DG {QM_DG:.0f} BR {BR:.2f} FAK {FAK:.1f} NK {NK:.0f} INV {INV:.0f} REIN {REIN:.0f} NAR {NAR:.2f}')
print('F70', {k: round(v, 2) for k, v in F1.items()}); print('F60', {k: round(v, 2) for k, v in F2.items()})
print(f'WE2 {B_WE2:.0f} 558 {B_558:.0f} DG {B_DG:.0f} J_B {J_B:.0f} BR_B {J_B/PREIS*100:.2f}')

# ---------- Standort
ZIELE = {z['id']: z for z in json.load(open(os.path.join(os.path.dirname(OUT), '..', '..', 'shared', 'geo', 'berlin_ziele.json')))['ziele']}
LON, LAT = 13.338, 52.4625                              # Menzelstraße 8 (schematisch)
def km(z):
    R = 6371.0; p1, p2 = math.radians(LAT), math.radians(z['lat']); dp = p2 - p1; dl = math.radians(z['lon'] - LON)
    return 2 * R * math.asin(math.sqrt(math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2))
WEGE = [("schlossstrasse", "10 min", "5 min"), ("suedkreuz", "15 min", "10 min"), ("potsdamer-platz", "20 min", "20 min"),
        ("kudamm", "25 min", "15 min"), ("hbf", "30 min", "25 min"), ("alexanderplatz", "30 min", "30 min"),
        ("hermannplatz", "30 min", "20 min"), ("ber", "45 min", "30 min"), ("potsdam", "40 min", "35 min"), ("adlershof", "45 min", "30 min")]

meta = {"titel": "GRENFORD Investment Brief – Menzelstraße 8",
        "fusszeile": "GRENFORD INVESTMENTS / MENZELSTRASSE 8 · INVESTMENT BRIEF · VERTRAULICH",
        "ausgabe": "GRENFORD_Investment_Brief_Menzelstrasse_8.pdf", "redaktionsstand": "25.11.2026", "agb_stand": "18.11.2026",
        "bereich": "investment", "typo": "sans", "dokument": "Investment Brief"}
kosten = {"land": "Berlin", "grunderwerbsteuer": GREST, "courtage_brutto": COURT, "courtage_netto": "6,00 %", "flaeche_qm": FL,
          "einheiten": [{"id": "haus", "name": "Mehrfamilienhaus Menzelstraße 8", "preis": PREIS, "innenflaeche": FL}]}

Q = "Quelle: Datenraum des Verkäufers"
S = []
S.append({"modul": "titel", "id": "titel", "bild": "strasse.jpg", "bild_pos": "center 45%",
  "dachzeile": "Investment Brief · Mehrfamilienhaus", "vertraulich": ["Off-Market · Kapitalanlage", "Vertraulich"],
  "titel": ["THE MENZEL", "HOUSE"], "untertitel": ["Schöneberg", "Value-Add Residence"],
  "kurz": ["Gründerzeithaus von 1907", "21 Einheiten, voll vermietet", "Dachgeschossausbau beantragt"],
  "adresse": ["Menzelstraße 8", "12157 Berlin-Schöneberg"],
  "kennzahlen": [["21", "Einheiten vermietet"], ["3,1 Mio. €", "Kaufpreis"], [f1(FAK) + "-fach", "Kaufpreisfaktor"], [p(BR), "Bruttorendite"]],
  "hinweis": "Straßenansicht · Kennzahlen auf Basis der Mieterliste 01.06.2026, Rechnung GRENFORD · Stand 25.11.2026"})

S.append({"modul": "inhalt", "id": "inhalt", "bereich": "vor", "bild": "hof.jpg", "bild_pos": "center 40%",
  "claim": ["Ein Haus,", "zwei Hebel"], "marke": "The Menzel House · GI26-004",
  "text": ["Bestand mit Mietreserve", "und Dachgeschossausbau"], "adresse": ["Menzelstraße 8", "12157 Berlin-Schöneberg"],
  "kapitel": [{"titel": "Vorwort und Hard Facts", "sub": "Einordnung, Kaufpreis, Rendite auf einen Blick", "seiten": ["vorwort", "fakten"]},
              {"titel": "Objekt und Lage", "sub": "Das Haus, Makro- und Mikrolage in Schöneberg", "seiten": ["objekt", "lage"]},
              {"titel": "Mieteinheiten und Pläne", "sub": "21 Einheiten, Mietstruktur, Bestandsgrundriss", "seiten": ["einheiten", "plaene"]},
              {"titel": "Asset und Energie", "sub": "Substanz, Haustechnik, Energieausweis", "seiten": ["asset"]},
              {"titel": "Markt und Rendite", "sub": "Mietniveau, Ertragsstufen und Sensitivität", "seiten": ["markt", "rendite"]},
              {"titel": "Finanzierung und Dachgeschoss", "sub": "Finanzierungsbeispiel, Ausbau mit zwei Wohnungen", "seiten": ["finanzierung", "dachplanung"]},
              {"titel": "Asset Check und Value Matrix", "sub": "Unterlagenstand, Stärken, Hebel und Chancen", "seiten": ["check", "matrix"]},
              {"titel": "Nächster Schritt, GRENFORD, Anhang", "sub": "Transaktionsablauf, Kontakt, Hinweise und AGB", "seiten": ["kontakt", "agb"]}]})

S.append({"modul": "vorwort", "id": "vorwort", "bereich": "vor", "dachzeile": "The Menzel House · Investment Brief",
  "titel": "Bestand mit Reserve",
  "lead": "Mit diesem Investment Brief stellen wir Ihnen ein voll vermietetes Gründerzeithaus von 1907 in Berlin-Schöneberg vor: 21 Einheiten in Vorderhaus und zwei Seitenflügeln auf rund 953 m² Grundstück.",
  "links": f"Das Objekt: Die Ist-Miete liegt im Durchschnitt bei {n(MM/FL)} €/m². Sanierte Einheiten im Haus erzielen bereits 14 bis 16 €/m² – die Mietreserve ist im eigenen Bestand belegt.",
  "rechts": f"Das Angebot: Kaufpreis 3,1 Mio. €, Faktor {f1(FAK)}-fach, rund {n(QM, 0)} €/m². Für den Ausbau des Dachgeschosses zu zwei Wohnungen mit ca. 255 m² ist der Bauantrag gestellt.",
  "schluss": "Der Brief führt von den Hard Facts über Lage und Mietstruktur zu Rendite, Finanzierung und Dachgeschoss und schließt mit dem GRENFORD Asset Check. Für Rückfragen und den Datenraum stehen wir Ihnen persönlich zur Verfügung."})

S.append({"modul": "fakten", "id": "fakten", "bereich": "vor", "kopf": "Hard Facts", "start": 352, "zeilenhoehe": 19.5, "blockabstand": 16, "schrift": 8.8, "label_groesse": 7.6,
  "kennzahlen": [["3,1 Mio. €", "Kaufpreis"], [f"ca. {n(QM, 0)} €/m²", "Kaufpreis je m² Bestand"], [f1(FAK) + "-fach", "Kaufpreisfaktor"], [p(BR), "Bruttorendite"], ["100 %", "Vermietungsquote"]],
  "dachzeile": "Zahlen, Daten, Fakten · Objekt-Nr. GI26-004", "titel": "Das Haus in Kennzahlen",
  "links": [{"titel": "Objekt und Fläche", "zeilen": [["Objektart", "Mehrfamilienhaus, VH und 2 Seitenflügel"], ["Baujahr", "1907 · laufend modernisiert"],
                                                      ["Einheiten", "21 (davon 2 im Souterrain)"], ["Wohn-/Nutzfläche (Mieterliste)", f"ca. {n(FL)} m²"],
                                                      ["Dachgeschoss (Planung)", f"+ ca. {n(DG)} m², 2 Wohnungen"], ["Grundstück", "ca. 953 m² (823 + 130 m²)"],
                                                      ["Transaktion", "Asset Deal oder Share Deal"]]},
            {"titel": "Vermietung und Technik", "zeilen": [["Ist-Miete", f"{e(MM, 2)} / Monat"], ["Ø Ist-Miete", f"{n(MM/FL)} €/m²"],
                                                           ["Heizung", "Gas-Etagenheizungen"], ["Energieausweis", "Bedarf, 179,7 kWh/(m²·a), F"]]}],
  "rechts": [{"titel": "Kaufpreis und Erwerbsnebenkosten", "zeilen": [["Kaufpreis", e(PREIS)], [f"Grunderwerbsteuer Berlin {p(GREST,1)}", e(PREIS*GREST/100)],
                                                                    [f"Käufercourtage {p(COURT)} inkl. MwSt.", e(PREIS*COURT/100)], [f"Notar und Grundbuch (Annahme {p(NOTAR,1)})", e(PREIS*NOTAR/100)],
                                                                    ["Gesamtinvestition", e(INV)]]},
             {"titel": "Ertrag und Rendite (Ist)", "zeilen": [["Jahresnettokaltmiete", e(JM)], ["Bruttorendite auf Kaufpreis", p(BR)], ["Kaufpreisfaktor", f1(FAK) + "-fach"],
                                                             ["Reinertrag nach Bewirtschaftung", e(REIN)], ["Nettoanfangsrendite", p(NAR)],
                                                             ["Kaufpreis je m² inkl. Dachgeschoss", f"ca. {n(QM_DG, 0)} €"]]}],
  "quelle": [f"{Q}: Mieterliste 01.06.2026, Flächenaufstellung 13.07.2023, Grundbuch 13.11.2024, Energieausweis 13.07.2023. Rechnung GRENFORD; Bewirtschaftung {p(BEWI,0)} der Jahresmiete (Annahme).",
             "Vermerk: Die Flächenaufstellung 2023 nennt für den Bestand 1.501,75 m² nach Altunterlagen (nicht aufgemessen); maßgeblich sind Mieterliste und Mietverträge. Bei Share Deal gelten abweichende Erwerbsnebenkosten."]})

S.append({"modul": "bildseite", "id": "objekt", "kopf": "Das Objekt", "stil": "voll", "bild": "strasse.jpg", "bild_pos": "center 55%",
  "verlauf": [[.94, 0], [.92, 36], [.72, 50], [.32, 66], [.1, 84], [.04, 100]], "toenung": {"farbe": "navy", "alpha": .25, "modus": "color"},
  "dachzeile": "Das Objekt", "titel": ["Gründerzeit", "in Schöneberg"],
  "text": "Vorderhaus mit Stuckfassade und Erkern, zwei Seitenflügel und ein Hof: 21 Einheiten zwischen 28 und 130 m². Die Hoffassaden sind gedämmt, das Dachgeschoss ist für zwei neue Wohnungen geplant.",
  "kennzahlen": [["1907", "Baujahr"], ["21", "Einheiten"], ["953 m²", "Grundstück"]],
  "hinweis": "Straßenansicht · Fotoaufnahme Bestand"})

S.append({"modul": "raster", "id": "standort", "kopf": "Standort", "dachzeile": "Makrolage · Berlin und Brandenburg",
  "titel": "Zentral im Berliner Südwesten",
  "intro": "Mit der S1 ab Feuerbachstraße erreichen Sie den Potsdamer Platz in rund 20 Minuten; die Schloßstraße liegt fußläufig, Kurfürstendamm und Südkreuz sind in einer Viertelstunde mit dem Auto erreichbar. Schöneberg und Friedenau zählen zu den gefragten, gewachsenen Altbauquartieren der Stadt.",
  "bloecke": [
    {"typ": "karte", "x": 51, "y": 384, "w": 450, "h": 296, "geo": "geo/berlin_karte.geojson", "bbox": [12.98, 52.33, 13.87, 52.66], "grund": "#ece7df",
     "markiert": ["Tempelhof-Schöneberg"], "strahlen": True, "ringe": [5, 10, 20],
     "ziel": {"name": "Menzelstraße 8", "sub": "Berlin-Schöneberg", "lon": LON, "lat": LAT, "dx": -138, "dy": -46},
     "orte": [{"name": str(i + 1), "lon": ZIELE[k]['lon'], "lat": ZIELE[k]['lat'], "dx": 5, "dy": 2} for i, (k, _, _) in enumerate(WEGE)],
     "laender": [{"name": "Brandenburg", "lon": 13.02, "lat": 52.63}, {"name": "Berlin", "lon": 13.2, "lat": 52.62, "farbe": "acc"}],
     "nachweis": "Kartengrundlage: Bezirksgrenzen Berlin, Amt für Statistik Berlin-Brandenburg (via Berliner Morgenpost, CC BY) · Tempelhof-Schöneberg hervorgehoben"},
    {"typ": "tabelle", "x": 530, "y": 384, "w": 326, "titel": "Entfernungen ab Menzelstraße 8", "breiten": [146, 56, 62, 62], "zh": 20.5, "schrift": 8.4,
     "kopf": ["Ziel", "Luftlinie", "ÖPNV ca.", "Pkw ca."],
     "zeilen": [[f"{i + 1}  {ZIELE[k]['name']}", f"{km(ZIELE[k]):.1f} km".replace('.', ','), o, a] for i, (k, o, a) in enumerate(WEGE)]},
    {"typ": "text", "x": 530, "y": "folgt", "abstand": 14, "w": 326, "box": True, "titel": "Einordnung", "schrift": 8.4,
     "absaetze": ["S-Bahn, Einkaufsmeile und Innenstadt in kurzer Distanz: Altbauwohnungen in dieser Lage sind dauerhaft nachgefragt – eine solide Basis für Neuvermietung und Mietentwicklung."]}],
  "quelle": "Luftlinie: Berechnung GRENFORD aus Koordinaten (Kartenpunkt schematisch). Fahrzeiten: gerundete Richtwerte GRENFORD von Tür zu Tür, abhängig von Tageszeit und Verbindung. Ohne Gewähr."})

S.append({"modul": "lage", "id": "lage", "kopf": "Mikrolage", "bild": "hof-2.jpg", "bild_pos": "center",
  "toenung": {"farbe": "navy", "alpha": .65, "modus": "color"}, "caption": "Hof mit gedämmten Fassaden · Fotoaufnahme Bestand",
  "dachzeile": "Mikrolage · Menzelstraße 8", "titel": ["Gewachsenes Quartier,", "kurze Wege"],
  "intro": "Die Menzelstraße liegt in einem ruhigen Altbauquartier zwischen Friedenau und Steglitz. S-Bahn, Bus und die Einkaufsmeile Schloßstraße sind zu Fuß erreichbar.",
  "gruppen": [{"titel": "Einkauf &amp; Versorgung", "text": "Einkaufsmeile Schloßstraße ca. 750 m · Nahversorgung und Fachgeschäfte im Quartier."},
              {"titel": "Schule &amp; Familie", "text": "Schulen, Kitas und Arztpraxen in Schöneberg, Friedenau und Steglitz."},
              {"titel": "Grün &amp; Kultur", "text": "Grünflächen und Parks in Friedenau und Steglitz · Cafés und Gastronomie im Kiez."}],
  "oepnv": [{"titel": "S-Bahn S1", "text": "S Feuerbachstraße, ca. 400 m"},
            {"titel": "Bus", "text": "Nächste Haltestelle ca. 250 m"},
            {"titel": "U-Bahn U9", "text": "U Walther-Schreiber-Platz, ca. 1,1 km"}],
  "quelle": ["Entfernungen laut Exposé des Verkäufers; Linien und Wege vor Ort prüfen.", "Ziele in Berlin und Brandenburg: Seite {seite:standort}."]})

ROWS = [[str(m[0]), m[1], n(m[2]), e(m[3], 2), n(m[3] / m[2]), m[4]] for m in MIETER]
S.append({"modul": "raster", "id": "einheiten", "kopf": "Mieteinheiten", "dachzeile": "Mieterliste · Stand 01.06.2026", "titel": "21 Einheiten, voll vermietet",
  "bloecke": [
    {"typ": "tabelle", "x": 51, "y": 422, "w": 600, "breiten": [26, 156, 66, 92, 56, 204], "links": [0, 1, 5], "zh": 14.2, "schrift": 7.6,
     "kopf": ["Nr.", "Lage", "m²", "Ist-Miete", "€/m²", "Hinweis"], "hervorheben": [],
     "markiere": [[i, 4] for i, m in enumerate(MIETER) if m[3] / m[2] >= 14],
     "zeilen": ROWS + [["", "Summe", n(FL), e(MM, 2), n(MM / FL), "Jahresnettokaltmiete " + e(JM)]]},
    {"typ": "kpi", "x": 676, "y": 422, "w": 180, "h": 58, "groesse": 20, "items": [{"wert": "100 %", "label": "Vermietungsquote"}]},
    {"typ": "kpi", "x": 676, "y": 352, "w": 180, "h": 58, "groesse": 20, "items": [{"wert": f"Ø {n(MM/FL)} €", "label": "Ist-Miete je m²", "stil": "hell"}]},
    {"typ": "kpi", "x": 676, "y": 282, "w": 180, "h": 58, "groesse": 20, "items": [{"wert": "14–16 €", "label": "Sanierte Einheiten je m²"}]},
    {"typ": "text", "x": 676, "y": 210, "w": 180, "schrift": 8.0,
     "absaetze": ["Markiert: Einheiten, die nach Sanierung bereits 14 bis 16 €/m² erzielen. Sie belegen die Mietreserve im eigenen Haus."]}],
  "quelle": [f"{Q}: Mieterliste 01.06.2026 (Flächen und Ist-Mieten laut Liste). VH = Vorderhaus, SF = Seitenflügel.",
             "Vermerk: WE 1 und WE 2 liegen im Souterrain (laut Flächenaufstellung 2023 als Gewerbe geführt); die Nutzung von WE 1 als Ferienwohnung ist genehmigungsrechtlich zu prüfen. Mietverträge folgen im Datenraum."]})

S.append({"modul": "raster", "id": "plaene", "kopf": "Pläne", "dachzeile": "Bestand und Planung", "titel": "Erdgeschoss und Dachgeschoss",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 410, "w": 330, "h": 330, "bild": "plan-eg.png", "contain": True, "weiss": True, "pad": 10, "titel": "Erdgeschoss Bestand · Vorderhaus und Seitenflügel"},
    {"typ": "bild", "x": 396, "y": 410, "w": 460, "h": 226, "bild": "plan-dg.png", "contain": True, "weiss": True, "pad": 8, "titel": "Dachgeschoss Planung · Wohnung A und B mit Terrassen"},
    {"typ": "kv", "x": 396, "y": 158, "w": 460, "kw": 90, "schrift": 7.8,
     "zeilen": [["Gebäude", "Vorderhaus in Blockrandbebauung, zwei Seitenflügel, je eigenes Treppenhaus; EG und vier Obergeschosse, Gebäudeklasse 5"],
                ["Dachgeschoss", "Wohnung A mit Dachterrasse über dem Seitenflügel, Wohnung B im Vorderhaus; Aufzug am Treppenhaus des Vorderhauses"],
                ["Keller", "Mieterkeller in den Seitenflügeln; zwei Abstellräume für die neuen Wohnungen geplant"]]}],
  "quelle": "Quelle: Bestandspläne (Antrag auf Abgeschlossenheit, 1999) und Genehmigungsplanung Dachgeschoss (Ing.-Büro Arndt & Partner, 14.01.2025). Ausschnitte ohne Schriftfeld; nicht zur Maßentnahme geeignet."})

S.append({"modul": "raster", "id": "asset", "kopf": "Asset", "dachzeile": "Substanz, Technik und Energie", "titel": "Solide Substanz mit klarem Fahrplan",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 410, "w": 180, "h": 150, "bild": "hof.jpg", "titel": "Hof, Fassaden gedämmt"},
    {"typ": "bild", "x": 241, "y": 410, "w": 180, "h": 150, "bild": "dach.jpg", "titel": "Dach, Ausbaufläche"},
    {"typ": "bild", "x": 51, "y": 238, "w": 180, "h": 150, "bild": "innen-ofen.jpg", "titel": "Altbau mit Kachelofen"},
    {"typ": "bild", "x": 241, "y": 238, "w": 180, "h": 150, "bild": "innen-parkett.jpg", "titel": "Parkett, Kastendoppelfenster"},
    {"typ": "kv", "x": 452, "y": 410, "w": 404, "kw": 100, "titel": "Zustand im Überblick", "schrift": 8.2, "bis": 70,
     "zeilen": [["Fassaden", "Hoffassaden und hintere Giebel gedämmt; Straßenfassade und Brandwand zu Nr. 9 ungedämmt"],
                ["Dach", "Berliner Dach, ungedämmt und erneuerungsbedürftig; Erneuerung im Zuge des Dachgeschossausbaus geplant"],
                ["Fenster", "Teilweise erneuert (Isolierverglasung), sonst Kastendoppelfenster"],
                ["Heizung", "Gas-Etagenheizungen (Kombithermen, Ø Baujahr ca. 2000), vereinzelt Kaminöfen"],
                ["Decken", "Holzbalkendecken; Kellerdecken in den Seitenflügeln teilweise sanierungsbedürftig"],
                ["Energieausweis", "Bedarfsausweis 13.07.2023, gültig bis 12.07.2033; Endenergie 179,7 kWh/(m²·a), Klasse F; Erdgas"],
                ["Energieberatung", "Fahrplan 2023: Dämmung, Fenster, Wärmepumpe mit PV; Primärenergie −73 %, Effizienzhaus 85 EE erreichbar"]]}],
  "quelle": "Quelle: Energieberatungsbericht Ing.-Büro Arndt & Partner (19.04.2023), Energieausweis BE-2023-004632227, Baubeschreibung Dachgeschoss (27.01.2025). Fotos: Bestand 2023."})

S.append({"modul": "raster", "id": "markt", "kopf": "GRENFORD Research", "dachzeile": "Mietniveau · Recherche 25.11.2026", "titel": "Deutlich unter Marktniveau",
  "intro": f"Die Ist-Miete von Ø {n(MM/FL)} €/m² liegt weit unter den Werten, die sanierte Einheiten im Haus und Neuvermietungen in der Umgebung erzielen. Die Spanne zeigt die Reserve – ihr Heben richtet sich nach Mietrecht und Modernisierung.",
  "bloecke": [
    {"typ": "spanne", "x": 51, "y": 362, "w": 520, "lw": 210, "titel": "Nettokaltmiete in €/m² und Monat", "achse": [2, 18, 2], "abstand": 36,
     "items": [["Ist-Miete Menzelstraße 8, Spanne", 3.19, 7.94, "3,19–7,94 €", ""], [f"Ist-Miete Menzelstraße 8, Ø", round(MM/FL, 2), round(MM/FL, 2), f"{n(MM/FL)} €", "h"],
               ["Sanierte Einheiten im Haus", 14, 16, "14,00–16,00 €", "h"], ["Dachgeschoss, Planansatz", 14, 14, "14,00 €", "h"],
               ["Friedenau, Angebotsmieten 2026", 16.77, 16.77, "16,77 €"]]},
    {"typ": "dunkel", "x": 612, "y": 362, "w": 244, "h": 178, "titel": "Reserve im Bestand", "abstand": 62,
     "werte": [[f"Ø {n(MM/FL)} €", "Ist-Miete je m²", 26], ["14–16 €", "Sanierte Einheiten je m²", 26]]},
    {"typ": "text", "x": 612, "y": 166, "w": 244, "schrift": 8.2,
     "absaetze": ["Der Abstand zwischen Ist-Miete und sanierten Einheiten ist der zentrale Werttreiber des Hauses."]},
    {"typ": "text", "x": 51, "y": 172, "w": 520, "titel": "Mietrechtlicher Rahmen", "schrift": 8.2,
     "absaetze": ["Bestand: Mieterhöhungen bis zur ortsüblichen Vergleichsmiete, in Berlin höchstens 15 % in drei Jahren (§ 558 BGB). Neuvermietung: Mietpreisbremse (§§ 556d ff. BGB, verlängert bis 31.12.2029); Ausnahmen nach umfassender Modernisierung und für Erstvermietung neuer Wohnungen (§ 556f BGB).",
                  "Vermerk: Das Haus liegt in einem sozialen Erhaltungsgebiet (§ 172 BauGB); bauliche Änderungen und Modernisierungen sind genehmigungspflichtig."]}],
  "quelle": ["Quellen: Mieterliste 01.06.2026; miete-aktuell.de, Mietpreise Friedenau (Angebotsmieten 2026, inkl. PLZ 12157), Recherche 25.11.2026, nicht repräsentativ; Planansatz Dachgeschoss laut Exposé.",
             "Energieberatung 19.04.2023 (Hinweis Erhaltungsgebiet). Angebotsmieten sind keine Bestandsmieten."]})

def br_(j, kp): return p(j / kp * 100)
S.append({"modul": "raster", "id": "rendite", "kopf": "Rendite", "dachzeile": "Ertragsstufen und Sensitivität", "titel": "Ertrag mit drei Stufen nach oben",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 410, "w": 805, "h": 50, "groesse": 19, "gap": 12,
     "items": [{"wert": e(JM), "label": "Jahresnettokaltmiete Ist"}, {"wert": p(BR), "label": "Bruttorendite Ist", "stil": "hell"},
               {"wert": e(J_B), "label": "Ertrag Bestand nach Stufe 1 und 2"}, {"wert": p(J_B / PREIS * 100), "label": "Bruttorendite Bestand nach Stufen", "stil": "hell"}]},
    {"typ": "tabelle", "x": 51, "y": 330, "w": 470, "titel": "Ertragsstufen, rechnerisch", "breiten": [250, 110, 110], "zh": 24, "hervorheben": ["Bestand nach Stufe 1 und 2", "Mit Dachgeschoss"],
     "kopf": ["Stufe", "Mehrertrag p. a.", "Jahresmiete"],
     "zeilen": [["Ist laut Mieterliste", "–", e(JM)],
                [f"1 · Neuvermietung WE 2 (59 m² zu {n(WE2_NEU)} €)", "+ " + e(B_WE2), e(JM + B_WE2)],
                [f"2 · Anpassung § 558 BGB, + {p(KAPPUNG,0)} (17 Einheiten)", "+ " + e(B_558), e(J_B)],
                ["Bestand nach Stufe 1 und 2", "", e(J_B)],
                [f"3 · Dachgeschoss {n(DG)} m² zu {n(DG_MIETE)} €", "+ " + e(B_DG), e(J_B + B_DG)],
                ["Mit Dachgeschoss", "", e(J_B + B_DG)]]},
    {"typ": "tabelle", "x": 546, "y": 330, "w": 310, "titel": "Bruttorendite: Kaufpreis × Ertrag", "breiten": [94, 72, 72, 72], "zh": 24,
     "kopf": ["Kaufpreis", "Ist", "Stufe 1+2", "+ DG"], "heat": {"zeilen": [0, 1, 2], "spalten": [1, 2, 3]},
     "zeilen": [[mio(kp, 2).replace(',00', ''), br_(JM, kp), br_(J_B, kp), br_(J_B + B_DG, kp)] for kp in (2800000, 2950000, 3100000)]},
    {"typ": "text", "x": 546, "y": "folgt", "abstand": 14, "w": 310, "schrift": 8.0,
     "absaetze": ["Spalte „+ DG“ ohne Bau- und Planungskosten des Ausbaus; nur zur Einordnung der Ertragskraft."]}],
  "quelle": [f"Rechnung GRENFORD auf Basis der Mieterliste 01.06.2026; vor Finanzierung und Steuern. Stufe 1: Annahme {n(WE2_NEU)} €/m², zulässige Miete im Einzelfall prüfen. Stufe 2: ohne WE 1, 2, 4 und 14; setzt voraus, dass die ortsübliche Vergleichsmiete die Anpassung trägt.",
             "Stufe 3: Planansatz laut Exposé; Baugenehmigung, Baukosten und Erstvermietung stehen aus. Vermerk: Keine Mietprognose und keine Zusicherung."]})

S.append({"modul": "raster", "id": "finanzierung", "kopf": "Finanzierung", "dachzeile": "Finanzierungsbeispiel · Annahmen GRENFORD", "titel": "Zwei Beleihungen im Vergleich",
  "bloecke": [
    {"typ": "hstack", "x": 51, "y": 410, "w": 560, "lw": 150, "sw": 80, "max": INV / 1e6, "bh": 20, "abstand": 32, "titel": "Mittelverwendung und Mittelherkunft, Mio. €",
     "zeilen": [["Mittelverwendung", [[PREIS/1e6, "navy", "Kaufpreis 3,10"], [NK/1e6, "light", f"NK {NK/1e6:.2f}".replace('.', ',')]], mio(INV)],
                ["Herkunft bei 70 %", [[F1['dar']/1e6, "mid", f"Darlehen {F1['dar']/1e6:.2f}".replace('.', ',')], [F1['ek']/1e6, "grey", f"EK {F1['ek']/1e6:.2f}".replace('.', ',')]], mio(INV)],
                ["Herkunft bei 60 %", [[F2['dar']/1e6, "mid", f"Darlehen {F2['dar']/1e6:.2f}".replace('.', ',')], [F2['ek']/1e6, "grey", f"EK {F2['ek']/1e6:.2f}".replace('.', ',')]], mio(INV)]]},
    {"typ": "tabelle", "x": 51, "y": "folgt", "abstand": 14, "w": 560, "titel": "Jährliche Rechnung (Jahr 1, Ist-Miete)", "breiten": [260, 150, 150], "zh": 18, "hervorheben": ["Cashflow vor Steuern"],
     "kopf": ["Position", "Beleihung 70 %", "Beleihung 60 %"],
     "zeilen": [["Reinertrag nach Bewirtschaftung", e(REIN), e(REIN)], [f"Zinsen {p(ZINS,1)}", "− " + e(F1['zi']), "− " + e(F2['zi'])],
                [f"Tilgung {p(TILG,1)} anfänglich", "− " + e(F1['ti']), "− " + e(F2['ti'])],
                ["Cashflow vor Steuern", ("− " if F1['cf'] < 0 else "") + e(abs(F1['cf'])), e(F2['cf'])]]},
    {"typ": "text", "x": 51, "y": "folgt", "abstand": 10, "w": 560, "schrift": 8.0,
     "absaetze": [["Aussage:", "Bei 70 % Beleihung trägt der heutige Ist-Ertrag den Kapitaldienst nahezu; mit 60 % Beleihung ist er im ersten Jahr gedeckt. Jede Stufe der Mietentwicklung verbessert die Deckung unmittelbar."],
                  "Wichtiger Hinweis: Das Finanzierungsbeispiel beruht auf Annahmen GRENFORD und dient allein Ihrer Orientierung; es ist kein Finanzierungsangebot. Die verbindliche Berechnung erstellt ein Kreditinstitut – mit Ihren persönlichen Konditionen, Ihrem Eigenkapital und Ihrer Bonität."]},
    {"typ": "dunkel", "x": 640, "y": 410, "w": 216, "h": 340, "titel": "Schuldendienstdeckung", "abstand": 82,
     "werte": [[f"{F1['dscr']:.2f}".replace('.', ','), "DSCR bei 70 % Beleihung", 30], [f"{F2['dscr']:.2f}".replace('.', ','), "DSCR bei 60 % Beleihung", 30],
               [f"{(J_B*(1-BEWI/100))/F1['kd']:.2f}".replace('.', ','), "DSCR 70 % nach Stufe 1 und 2", 30]],
     "text": "Annahme GRENFORD zur Orientierung. Ihre verbindlichen Werte berechnet Ihr Kreditinstitut."}],
  "quelle": [f"Annahmen GRENFORD, Stand November 2026: Sollzins {p(ZINS,1)}, anfängliche Tilgung {p(TILG,1)}; Eigenkapital deckt Erwerbsnebenkosten und Restkaufpreis. Bewirtschaftung {p(BEWI,0)} der Miete. Vor Steuern und Abschreibung.",
             "Zins, Beleihung und Tilgung legt das Kreditinstitut nach Prüfung von Bonität, Eigenkapital und Objektunterlagen fest. Finanzierungspartner vermittelt GRENFORD auf Wunsch."]})

S.append({"modul": "raster", "id": "dachplanung", "kopf": "Wertpotenzial", "dachzeile": "Dachgeschossausbau · Bauantrag vom 19.01.2026", "titel": "Zwei neue Wohnungen unter dem Dach",
  "bloecke": [
    {"typ": "bild", "x": 51, "y": 410, "w": 250, "h": 236, "bild": "plan-strasse.png", "contain": True, "weiss": True, "pad": 8, "titel": "Straßenansicht mit Dachgeschoss"},
    {"typ": "bild", "x": 311, "y": 410, "w": 250, "h": 236, "bild": "plan-hof.png", "contain": True, "weiss": True, "pad": 8, "titel": "Hofansichten mit Aufzug"},
    {"typ": "kv", "x": 590, "y": 410, "w": 266, "kw": 84, "titel": "Planung", "schrift": 8.0,
     "zeilen": [["Wohnungen", "A ca. 114 m², B ca. 141 m² (inkl. Terrassen)"],
                ["Fläche", f"+ {n(DG)} m², Gebäude danach ca. 1.757 m² laut Flächenaufstellung"],
                ["Bau", "Dachstuhl teilweise neu, Dämmung nach GEG, Gauben, Terrasse"],
                ["Technik", "Aufzug nur für das Dachgeschoss, Wärmepumpe mit PV"],
                ["Verfahren", "Vereinfachtes Verfahren nach § 63 BauO Bln"]]},
    {"typ": "kpi", "x": 590, "y": "folgt", "abstand": 10, "w": 266, "h": 40, "groesse": 16, "gap": 0, "items": [{"wert": "+ " + e(B_DG), "label": "Mehrmiete p. a. rechnerisch"}]},
    {"typ": "kpi", "x": 590, "y": "folgt", "abstand": 6, "w": 266, "h": 40, "groesse": 16, "gap": 0, "items": [{"wert": f"ca. {n(QM_DG, 0)} €/m²", "label": "Kaufpreis inkl. DG-Fläche", "stil": "hell"}]},
    {"typ": "schritte", "x": 51, "y": 134, "w": 805,
     "items": [["01 · Januar 2026", "Bauantrag", "Eingang 28.01.2026, Geschäftszeichen erteilt"], ["02 · Nachreichung", "Unterlagen", "Lageplan öbVI, Baubeschreibung, Nachweise"],
               ["03 · Genehmigung", "Baugenehmigung", "Nach Vorlage von Statik und Brandschutz"], ["04 · Umsetzung", "Ausbau und Vermietung", "Erstvermietung neuer Wohnungen"]]}],
  "quelle": "Quelle: Baubeschreibung (27.01.2025), Genehmigungsplanung (14.01.2025), Flächenaufstellung (13.07.2023), Eingangsbestätigung Bauaufsicht Tempelhof-Schöneberg (10.02.2026). Vermerk: Laut Eingangsbestätigung waren Unterlagen bis 10.03.2026 nachzureichen; der aktuelle Verfahrensstand ist mit dem Verkäufer zu bestätigen. Baukosten liegen nicht vor."})

S.append({"modul": "raster", "id": "check", "kopf": "GRENFORD Asset Check", "dachzeile": "Unterlagen und Prüfstand", "titel": "Umfangreicher Datenraum",
  "bloecke": [
    {"typ": "kpi", "x": 51, "y": 410, "w": 805, "h": 48, "groesse": 18, "gap": 12,
     "items": [{"wert": "Lastenfrei", "label": "Grundbuch Abt. II und III"}, {"wert": "100 %", "label": "Vermietet laut Mieterliste", "stil": "hell"},
               {"wert": "Gestellt", "label": "Bauantrag Dachgeschoss"}, {"wert": "Bis 2033", "label": "Energieausweis gültig", "stil": "hell"}]},
    {"typ": "tabelle", "x": 51, "y": 336, "w": 805, "breiten": [236, 92, 477], "links": [0, 1, 2], "tags": [1], "bis": 84, "schrift": 8.0,
     "kopf": ["Unterlage", "Status", "Ergebnis"],
     "zeilen": [["Grundbuch Schöneberg Blatt 18089 (13.11.2024)", "Gesichtet", "Flurstücke 25 und 26, zusammen 953 m²; Abt. II und III ohne bestehende Eintragungen"],
                ["Mieterliste (01.06.2026)", "Gesichtet", f"21 Einheiten, {n(FL)} m², {e(MM, 2)} Ist-Miete im Monat; WE 2 gekündigt zum 12/2026"],
                ["Flächenaufstellung (13.07.2023)", "Gesichtet", "Bestand 1.501,75 m² nach Altunterlagen, Dachgeschoss 255,13 m²"],
                ["Energieausweis und Energieberatung (2023)", "Gesichtet", "Bedarfsausweis Klasse F; Modernisierungsfahrplan mit Fördermöglichkeiten"],
                ["Bauantrag Dachgeschoss mit Planung", "Gesichtet", "Eingang 28.01.2026; Nachforderungen der Bauaufsicht bis 10.03.2026"],
                ["Bauantrag Umnutzung Gewerbe zu Wohnen", "Folgt", "Laut Exposé gestellt; Unterlagen nicht im Datenraum"],
                ["Mietverträge, Abgeschlossenheit, Ferienwohnung WE 1", "Folgt", "Mietverträge, Abgeschlossenheitsbescheinigung und Genehmigungslage zur Prüfung"]]},
    {"typ": "text", "x": 51, "y": "folgt", "abstand": 10, "w": 805, "schrift": 7.8,
     "absaetze": ["Vermerk: Zur Kaufvertragsvorbereitung folgen Mietverträge, aktueller Stand beider Bauanträge, Abgeschlossenheitsbescheinigung und Genehmigungslage der Ferienwohnung. Der Asset Check ist keine Due Diligence im rechtlichen Sinne."]}],
  "quelle": Q + ", gesichtet am 25.11.2026."})

S.append({"modul": "raster", "id": "matrix", "kopf": "Value Matrix", "dachzeile": "Stärken, Hebel, Chancen, Marktfaktoren", "titel": "Stärken nutzen, Hebel definieren",
  "bloecke": [
    {"typ": "matrix", "x": 51, "y": 412, "w": 805, "h": 286, "schrift": 8.6,
     "zellen": [{"titel": "Stärken", "akzent": True, "punkte": [["Voll vermietet.", "21 Einheiten, laufende Mieteinnahmen ab Übergabe."], ["Lage.", "Schöneberg, S1 in rund 400 m, Schloßstraße fußläufig."], ["Grundbuch.", "Abt. II und III ohne bestehende Eintragungen."], ["Einstieg.", f"Rund {n(QM, 0)} €/m² Bestand, {n(QM_DG, 0)} €/m² inkl. Dachgeschoss."]]},
                {"titel": "Hebel", "punkte": [["Mietanpassung.", "Ist-Miete Ø 7,41 €/m²; Anpassung nach § 558 BGB im Rahmen der Kappungsgrenze."], ["Neuvermietung.", "WE 2 wird zum 12/2026 frei."], ["Bauantrag.", "Nachforderungen erfüllen, Genehmigung sichern."], ["Finanzierung.", "DSCR 1,08 bei 60 %; verbindlich rechnet das Kreditinstitut mit Ihren Konditionen."]]},
                {"titel": "Chancen", "akzent": True, "punkte": [["Dachgeschoss.", f"Zwei Wohnungen, rechnerisch rund {n(B_DG/1000, 1)} T€ Mehrmiete p. a."], ["Sanierte Einheiten.", "14 bis 16 €/m² im Haus belegt."], ["Umnutzung.", "Gewerbe im Souterrain zu Wohnen (laut Exposé beantragt)."], ["Energie.", "Fahrplan 2023 mit Förderung: Primärenergie −73 %."]]},
                {"titel": "Marktfaktoren", "punkte": [["Erhaltungsgebiet.", "Soziales Erhaltungsgebiet (§ 172 BauGB): Maßnahmen genehmigungspflichtig."], ["Mietrecht.", "Mietpreisbremse bis 31.12.2029; Kappungsgrenze 15 % in drei Jahren."], ["Heizung.", "Gas-Etagenheizungen; GEG-Anforderungen bei Erneuerung beachten."], ["Zinsniveau.", f"Bruttorendite {p(BR)} Ist; Hebel über Mietentwicklung."]]}]},
    {"typ": "text", "x": 51, "y": "folgt", "abstand": 10, "w": 805, "box": True, "schrift": 8.6,
     "absaetze": [["Investor Insight:", "Die Menzelstraße 8 verbindet einen voll vermieteten Altbaubestand in guter Lage mit zwei klar benannten Hebeln: einer im eigenen Haus belegten Mietreserve und dem beantragten Dachgeschossausbau. Ein Objekt für Anleger mit langfristigem Horizont."]]}],
  "quelle": "Quelle: Einschätzung GRENFORD auf Basis des Datenraums und der Rechnung auf den Seiten {seite:rendite} und {seite:finanzierung}. Indikativ, keine Zusicherung."})

S.append({"modul": "kontakt", "id": "kontakt", "bereich": "nach", "bild": "hof.jpg", "bild_pos": "center 40%", "abstand": 56, "schrift": 8.4,
  "claim": ["Ihr Interesse,", "Ihr nächster", "Schritt"], "dachzeile": "Menzelstraße 8 · Transaktionsablauf", "titel": ["Vom Gespräch zum", "notariellen Vertrag"],
  "box_label": "Ansprechpartner", "box_titel": "Marco Kaimann, Founder &amp; Transaction Advisor",
  "schritte": [["Gespräch und Kaufinteresse", "Wir besprechen Ihre Anlageziele, Finanzierung und die gewünschte Struktur (Asset oder Share Deal). Mit Ihrer schriftlichen Interessenbekundung leiten wir die nächsten Schritte ein."],
               ["Identifizierung und Datenraum", "Nach Identifizierung gemäß Geldwäschegesetz erhalten Sie Zugang zu Mieterliste, Grundbuch, Plänen, Energieunterlagen und Bauantrag."],
               ["Prüfung und Besichtigung", "Sie und Ihre Berater prüfen die Unterlagen; wir koordinieren die Besichtigung vor Ort in Schöneberg."],
               ["Notarvertrag", "Wir koordinieren den Kaufvertragsentwurf mit dem Notar bis zur Beurkundung."]]})
S.append({"modul": "ueber", "id": "ueber", "bereich": "nach", "bild": "strasse.jpg", "bild_pos": "center 40%"})
S.append({"modul": "recht", "id": "recht", "bereich": "nach", "dachzeile": "The Menzel House · Menzelstraße 8", "schrift": 8.6, "zeile": 12.4,
  "intro": ["Dieser Investment Brief dient der ersten Information und ist kein Angebot im rechtlichen Sinne; er ersetzt keine Anlage-, Rechts- oder Steuerberatung.", "Maßgeblich ist der notarielle Kaufvertrag. Verkäufer: wird im Rahmen der Vertragsvorbereitung benannt."],
  "bloecke": [["Objekt und Vermietung", f"Mehrfamilienhaus, Baujahr 1907, 21 vermietete Einheiten laut Mieterliste 01.06.2026, Ist-Miete {e(MM, 2)} im Monat. Mietverträge werden vor Abschluss zur Prüfung übergeben. Nutzung WE 1 als Ferienwohnung und Souterrain-Einheiten: Genehmigungslage zu prüfen."],
              ["Flächen und Darstellungen", f"Flächen laut Mieterliste ca. {n(FL)} m²; die Flächenaufstellung 2023 nennt 1.501,75 m² nach Altunterlagen, nicht aufgemessen. Pläne als Ausschnitte, nicht zur Maßentnahme geeignet. Rechte an Fotos und Plänen beim Verkäufer bzw. Planverfasser."],
              ["Rendite und Finanzierung", "Ertragsstufen, Renditen und Finanzierungsbeispiel sind Modellrechnungen auf Annahmen GRENFORD, keine Garantie künftiger Entwicklungen. Die verbindliche Finanzierungsberechnung nimmt ausschließlich ein Kreditinstitut mit den Konditionen des jeweiligen Käufers vor."],
              ["Recht, Energie, Bauantrag", "Grundbuch Blatt 18089 (13.11.2024). Soziales Erhaltungsgebiet (§ 172 BauGB). Mietpreisbremse (§§ 556d ff. BGB, bis 31.12.2029). Energieausweis BE-2023-004632227, 179,7 kWh/(m²·a), F. Dachgeschoss: Bauantrag gestellt, nicht genehmigt."],
              ["Provision", "Der Erwerb ist für den Käufer courtagepflichtig: 6,00 % des notariellen Kaufpreises zzgl. gesetzlicher MwSt., derzeit insgesamt 7,14 %, fällig mit Wirksamkeit des notariellen Kaufvertrags; bei Share Deal entsprechend. Einzelheiten regeln die AGB."],
              ["Quellen und Verantwortlichkeit", "Angaben und Unterlagen des Verkäufers, Stand November 2026. Irrtum und Zwischenverkauf vorbehalten. GRENFORD ist die Geschäftsbezeichnung des Einzelunternehmens Marco Kaimann; Erlaubnis nach § 34c GewO, Bezirksamt Charlottenburg-Wilmersdorf von Berlin, 01.11.2022. Verpflichteter nach GwG."]]})
S.append({"modul": "agb", "id": "agb", "bereich": "nach", "datei": "agb_investment_brief.html", "dachzeile": "GRENFORD Investments · Investment Brief · Nachweis und Vermittlung"})

json.dump({"meta": meta, "kosten": kosten, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
