# Erzeugt objekt.json für den Property Brief Pätzer Straße 11 (aktuelle CI wie Schlierbacher Weg 13a v32 und Sömmeringstraße 35 v9).
# Quellen: Angaben und Unterlagen des Verkäufers (Objektbeschreibung, Bestandspläne, Fotos).
import json, os
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'objekt.json')
FL = 'Wohn- und Nutzfläche lt. Verkäufer ca. 453 m²; die Bestandspläne weisen für die sechs Wohnungen ca. 242 m² aus, zzgl. Kellerräume ca. 43 m² und Dachgeschoss (Ausbau- und Aufstockungsreserve, ca. 100 m² Bestand).'

meta = {"titel": "GRENFORD Property Brief – Pätzer Straße 11", "fusszeile": "GRENFORD PROPERTY / PÄTZER STRASSE 11",
        "ausgabe": "GRENFORD_Property_Brief_Paetzer_Strasse_11.pdf", "redaktionsstand": "24.11.2026", "agb_stand": "18.11.2026",
        "variante": "haus", "typo": "sans"}

kosten = {"land": "Berlin", "grunderwerbsteuer": 6.0, "courtage_brutto": 7.14, "courtage_netto": "6,00 %",
          "courtage_label": "Courtage · Käufer",
          "courtage_text": "Käuferprovision 6,00 % zzgl. 19 % MwSt., insgesamt 7,14 % des Kaufpreises. Fällig nach wirksamem Abschluss des notariellen Kaufvertrags.",
          "agb_courtage": "Die Käufercourtage für dieses Objekt beträgt 6,00 % des notariellen Kaufpreises zzgl. 19 % MwSt., insgesamt 7,14 %. Bei Mehrfamilienhäusern gelten die §§ 656a–656d BGB nicht.",
          "ueberblick_courtage": "Courtage: Käuferprovision 6,00 % zzgl. 19 % MwSt., insgesamt 7,14 % des Kaufpreises, fällig nach wirksamem Abschluss des notariellen Kaufvertrags. Bei Mehrfamilienhäusern gelten die §§ 656a–656d BGB nicht.",
          "flaeche_qm": 453, "flaeche_art": "Wohn-/Nutzfläche",
          "einheiten": [{"id": "haus", "name": "Mehrfamilienhaus Pätzer Straße 11", "preis": 1440000, "innenflaeche": 453}],
          "optionen": [["Aufstockung und Ausbau Dachgeschoss (Bauantrag erforderlich)", "nach Planung", False],
                       ["Stellplätze im Garten (3 bis 5, Genehmigung zu prüfen)", "nach Angebot", False]]}

S = []
S.append({"modul": "titel", "id": "titel", "bild": "garten-fassade.jpg", "bild_pos": "center 38%",
  "titel": ["THE HERITAGE", "HOUSE"], "untertitel": ["Britz", "Investment Residence"],
  "kurz": ["Mehrfamilienhaus von 1898", "Stuckfassade, großer Garten", "Reserve im Dachgeschoss"],
  "adresse": ["Pätzer Straße 11", "12359 Berlin-Britz"],
  "kennzahlen": [["7", "Einheiten · voll vermietet"], ["ca. 781 m²", "Grundstück mit Garten und Remise"], ["1.440.000 €", "Kaufpreis · ca. 3.179 €/m²"]],
  "hinweis": "Gartenansicht · Flächen als Circa-Werte nach Verkäuferangabe"})

S.append({"modul": "inhalt", "id": "inhalt", "bereich": "vor", "bild": "fassade-strasse.jpg", "bild_pos": "center 40%",
  "claim": ["Ein Haus,", "sieben Einheiten"], "marke": "The Heritage House",
  "text": ["Ein Gründerzeithaus von 1898,", "modernisiert und voll vermietet"], "adresse": ["Pätzer Straße 11", "12359 Berlin-Britz"],
  "kapitel": [{"titel": "Vorwort", "sub": "Persönliche Einführung von Marco Kaimann", "seiten": ["vorwort"]},
              {"titel": "Das Haus auf einen Blick", "sub": "Eckdaten, Kaufpreis und Erwerbsnebenkosten", "seiten": ["ueberblick"]},
              {"titel": "Wohnen und Lage", "sub": "Wohnkonzept, Ausstattung, Umfeld und Anbindung", "seiten": ["wohnkonzept", "lage"]},
              {"titel": "Raumprogramm und Grundrisse", "sub": "Alle Ebenen mit Wohnungen und Flächen", "seiten": ["raumprogramm", "grundrisse-2"]},
              {"titel": "Haustechnik, Vermietung und Energie", "sub": "Modernisierung, Mietstand, Potenzial und Heizung", "seiten": ["sanierung", "energie"]},
              {"titel": "Kapitalanlage", "sub": "Mietorientierung und Modellrechnung", "seiten": ["markt", "rendite"]},
              {"titel": "Partner und Service", "sub": "Finanzierung, Ausbau und Innenausbau, Garten", "seiten": ["partner"]},
              {"titel": "Besichtigung und Kontakt", "sub": "Vom ersten Gespräch bis zum Notartermin", "seiten": ["kontakt"]},
              {"titel": "GRENFORD und Anhang", "sub": "Unternehmen, rechtliche Hinweise und AGB", "seiten": ["ueber", "agb"]}]})

S.append({"modul": "vorwort", "id": "vorwort", "bereich": "vor", "dachzeile": "The Heritage House",
  "titel": "Ein Haus mit Geschichte",
  "lead": "Mit diesem Property Brief stellen wir Ihnen ein Mehrfamilienhaus von 1898 in Berlin-Britz vor: sieben vermietete Einheiten und ein großer Garten in ruhiger Lage.",
  "links": "Stuckfassade, Holzdielen und Fachwerk sind erhalten. Bäder, Küchen und Heizung wurden in den vergangenen Jahren modernisiert.",
  "rechts": "Heute laufende Mieteinnahmen, morgen zusätzliches Potenzial durch Aufstockung und Ausbau des Dachgeschosses.",
  "schluss": "Auf den folgenden Seiten finden Sie alle wesentlichen Informationen kompakt und transparent aufbereitet. Wir freuen uns auf den persönlichen Austausch."})

S.append({"modul": "ueberblick_kosten", "id": "ueberblick", "bereich": "vor", "kopf": "Das Haus auf einen Blick", "dachzeile": "Das Haus",
  "titel": "Fakten und Zahlen",
  "intro": "Ein Mehrfamilienhaus aus dem Jahr 1898 mit sechs Wohnungen und einer Remise, alle sieben Einheiten vermietet – mit rund 781 m² Grundstück und Reserve im Dachgeschoss.",
  "zeilen": [["Objekt-Nr.", "GPR26-005"], ["Objektart", "Mehrfamilienhaus mit Remise und Gartenhaus"], ["Lage", "Pätzer Straße 11, 12359 Berlin-Britz (Neukölln)"],
             ["Einheiten", "6 Wohnungen auf drei Etagen und 1 Remise"], ["Vermietung", "7 von 7 vermietet · befristete Mietverträge · Ø 15 €/m²"],
             ["Flächen", "ca. 453 m² Wohn-/Nutzfläche laut Verkäufer (Details Seite {seite:raumprogramm})"],
             ["Grundstück", "ca. 781 m² mit Garten"], ["Keller und Dach", "Kellerräume; Dachgeschoss für Aufstockung und Ausbau"],
             ["Baujahr", "1898 · letzte Modernisierung 2018"], ["Heizung", "Gaszentralheizung mit Warmwasserspeicher"]],
  "quelle": "Quelle: Angaben des Verkäufers und Objektunterlagen · Circa-Werte, keine Berechnung nach WoFlV · Stand November 2026."})

S.append({"modul": "split", "id": "wohnkonzept", "kopf": "Architektur &amp; Charakter", "bild": "fachwerk.jpg", "bild_pos": "center",
  "bild_seite": "rechts", "dachzeile": "Das Wohnkonzept", "titel": ["Gründerzeit,", "gut vermietet"],
  "intro": "Je zwei Wohnungen auf drei Etagen um ein gemeinsames Treppenhaus, dazu die Remise im Garten. Keller und Dachgeschoss bilden die Reserve.",
  "label_breite": 100,
  "liste": [["Erdgeschoss", "Zwei Wohnungen mit ca. 44 und 34 m²."],
            ["1. Obergeschoss", "Zwei Wohnungen mit ca. 46 und 34 m²."],
            ["2. Obergeschoss", "Zwei Wohnungen mit ca. 47 und 37 m²."],
            ["Remise", "Siebte Einheit im Garten, daneben ein Gartenhaus."]],
  "caption": ["Wohnraum mit erhaltenem Fachwerk und Holzdielen.", "Fotoaufnahme Bestand."]})

S.append({"modul": "split", "id": "ausstattung", "kopf": "Ausstattung", "bild": "wohnen.jpg", "bild_pos": "center 60%",
  "bild_seite": "links", "dachzeile": "Bestand &amp; Materialien", "titel": ["Altbau mit", "Substanz"],
  "intro": "Originalsubstanz und zeitgemäßer Komfort: Der Altbaucharakter ist erhalten, die Nassbereiche sind modernisiert.",
  "label_breite": 72,
  "liste": [["Böden", "Originale Holzdielen in den Wohnräumen, teils mit sichtbarem Fachwerk und Holzbalken; Fliesen in Küchen und Bädern."],
            ["Bäder", "Modernisierte Bäder mit Dusche bzw. Wanne; WC teils separat."],
            ["Fenster", "Doppelt verglaste Fenster in allen Etagen."],
            ["Küchen", "Küchen in allen sechs Wohnungen vorhanden."]],
  "caption": ["Wohnraum mit Dielenboden. Fotoaufnahme Bestand.", "Ausstattung im Detail bei der Besichtigung."]})

S.append({"modul": "lage", "id": "lage", "karte": {"lat": 52.4545, "lon": 13.441, "label": ["Pätzer Straße 11", "12359 Berlin-Britz"]},
  "dachzeile": "Pätzer Straße 11 · Berlin-Britz", "titel": ["Ruhig wohnen,", "schnell in der Stadt"],
  "intro": "Die Pätzer Straße liegt in einem ruhigen Wohnquartier in Britz, ohne Durchgangsverkehr. Bus, U-Bahn und Stadtautobahn sind in wenigen Minuten erreichbar.",
  "gruppen": [{"titel": "Einkauf &amp; Versorgung", "text": "Supermärkte und Fachgeschäfte im Quartier · Einkaufszentrum Gropius Passagen in der Nähe."},
              {"titel": "Schule &amp; Familie", "text": "Schulen, Kindergärten und Arztpraxen in Britz; Gymnasien und Hochschulen im Bezirk Neukölln."},
              {"titel": "Grün &amp; Kultur", "text": "Britzer Garten · Schloss Britz mit Gutspark · Grünflächen entlang des Teltowkanals."}],
  "oepnv": [{"titel": "Bus Britzer Damm / Gradestraße", "text": "Haltestelle ca. 1 Minute zu Fuß"},
            {"titel": "U-Bahn U7", "text": "U Blaschkoallee, ca. 750 m"},
            {"titel": "S-Bahn und Autobahn", "text": "S Hermannstraße ca. 1,7 km · A100 und A113 in der Nähe"}],
  "quelle": ["Entfernungen laut Verkäuferunterlagen; Südkreuz ca. 13 Minuten mit dem Auto, ca. 36 Minuten mit Bus und S-Bahn.",
             "Kartenpunkt schematisch; Linien und Wege vor Ort prüfen."]})

S.append({"modul": "raumprogramm", "id": "raumprogramm", "bild": "dachgeschoss.jpg", "bild_pos": "center",
  "dachzeile": "Fünf Ebenen · sieben Einheiten", "titel": ["Wie das Haus", "aufgeteilt ist"],
  "intro": "Sechs Wohnungen auf drei Etagen und die Remise als siebte Einheit, dazu Kellerräume und ein Dachgeschoss mit vier Räumen. Alle Grundrisse mit Raumflächen finden Sie auf den Seiten {seite:grundrisse-1} und {seite:grundrisse-2}.",
  "ebenen": [["Erdgeschoss", "Wohnung 44,30 m² · Wohnung 34,30 m²", "Zugang über Treppenhaus und Diele", "78,60 m²"],
             ["1. Obergeschoss", "Wohnung 46,25 m² · Wohnung 34,00 m²", "WC im Treppenhausbereich", "80,25 m²"],
             ["2. Obergeschoss", "Wohnung 46,50 m² · Wohnung 37,00 m²", "Bad mit Wanne, Diele", "83,50 m²"],
             ["Keller und Dach", "Büro-/Aufenthaltsräume ca. 42,90 m² · Heizraum · Dachboden", "Potenzial im Dachgeschoss: Seite {seite:projektstand}", "42,90 m²"]],
  "flaechen_hinweis": "Flächen laut Bestandsplänen: sechs Wohnungen zusammen ca. 242 m². Der Verkäufer gibt die Wohn- und Nutzfläche mit ca. 453 m² an. Eine Flächenberechnung nach WoFlV liegt nicht vor.",
  "caption": "Dachgeschoss mit Holzbalken · Fotoaufnahme Bestand"})

def plan(name, art, bild, raeume, hinweise):
    return {"name": name, "art": art, "bild": bild, "quer": True, "raeume": raeume, "massketten": [], "hinweise": hinweise}
H = ["Raumflächen laut Bestandsplan; Gebäudebreite 18,85 m, Tiefe 6,30 m."]
S.append({"modul": "grundrisse", "id": "grundrisse-1", "dachzeile": "Wohnebenen", "titel": "Erdgeschoss und 1. Obergeschoss",
  "legende_rechts": "Flächen laut Bestandsplan", "hinweis_oben": "Bestandspläne · nicht zur Maßentnahme geeignet",
  "plaene": [plan("Erdgeschoss", "Zwei Wohnungen", "plan-eg.png",
                  [["01", "Zimmer 1", "32,00", False, "wohn"], ["02", "Küche", "12,30", False, "kueche"], ["03", "Zimmer 3", "23,65", False, "wohn"],
                   ["04", "Zimmer 2", "6,80", False, "wohn"], ["05", "Bad", "3,85", False, "nass"], ["06", "Diele, Treppe", "–", True, "weg"]],
                  ["Wohnungen ca. 44,30 m² (Zimmer 1, Küche) und ca. 34,30 m² (Zimmer 2 und 3, Bad).", H[0]]),
             plan("1. Obergeschoss", "Zwei Wohnungen", "plan-1og.png",
                  [["01", "Zimmer 2", "21,90", False, "wohn"], ["02", "Zimmer 1", "11,65", False, "wohn"], ["03", "Küche", "12,70", False, "kueche"],
                   ["04", "Zimmer 4", "23,40", False, "wohn"], ["05", "Zimmer 3", "6,65", False, "wohn"], ["06", "Bad", "3,95", False, "nass"]],
                  ["Wohnungen ca. 46,25 m² und ca. 34,00 m²; WC im Treppenhausbereich.", H[0]])]})
S.append({"modul": "grundrisse", "id": "grundrisse-2", "dachzeile": "Wohnebene und Keller", "titel": "2. Obergeschoss und Keller",
  "legende_rechts": "Flächen laut Bestandsplan", "hinweis_oben": "Bestandspläne · nicht zur Maßentnahme geeignet",
  "plaene": [plan("2. Obergeschoss", "Zwei Wohnungen", "plan-2og.png",
                  [["01", "Zimmer 2", "22,75", False, "wohn"], ["02", "Zimmer 1", "11,25", False, "wohn"], ["03", "Bad", "7,10", False, "nass"],
                   ["04", "Diele", "5,40", False, "weg"], ["05", "Zimmer 3", "25,50", False, "wohn"], ["06", "Küche", "11,50", False, "kueche"]],
                  ["Wohnungen ca. 46,50 m² und ca. 37,00 m².", "Darüber das Dachgeschoss mit vier Räumen."]),
             plan("Kellergeschoss", "Nutzfläche · keine Wohnfläche", "plan-kg.png",
                  [["01", "Büroraum", "21,75", False, "neben"], ["02", "Büroraum", "11,65", False, "neben"], ["03", "Aufenthalt", "5,75", False, "neben"],
                   ["04", "Vorraum", "3,75", False, "weg"], ["05", "Heizraum", "–", True, "neben"], ["06", "Abstellraum, Tankraum", "–", True, "neben"]],
                  ["Rechter Keller ca. 42,90 m², eigener Zugang von außen.", "Kellerflächen sind keine Wohnfläche."])]})

S.append({"modul": "sanierung", "id": "sanierung", "kopf": "Modernisierung &amp; Haustechnik",
  "bilder": [{"bild": "bad.jpg", "pos": "center"}, {"bild": "kueche-balken.jpg", "pos": "center 40%"}],
  "dachzeile": "Der Bestand", "titel": ["Substanz von 1898,", "Technik von heute"],
  "bloecke": [["Modernisierung", "Umfassende Renovierung vor rund sechs Jahren nach Angabe des Verkäufers, letzte Modernisierung 2018."],
              ["Haustechnik", "Zentrale Gasheizung mit Warmwasserspeicher für alle Einheiten; Kennwerte auf Seite {seite:energie}."],
              ["Fassade", "Gründerzeitliche Stuckfassade mit Gesimsen und Fensterverdachungen zur Straße und zum Garten."]],
  "caption": ["Oben: Bad, Fotoaufnahme Bestand.", "Unten: Küche mit Holzbalken, Fotoaufnahme Bestand."]})

S.append({"modul": "projektstand", "id": "projektstand", "kopf": "Vermietung &amp; Potenzial", "dachzeile": "Vermietung und Potenzial",
  "titel": "Was läuft und was möglich ist",
  "intro": ["Stand nach Angabe des Verkäufers. Die Remise ist seit rund einem Jahr vermietet;", "weitere Reserven bestehen im Dachgeschoss und im Garten."],
  "bloecke": [{"titel": "Vermietung", "zeilen": [["Sechs Wohnungen und Remise", "Ø 15 €/m² laut Verkäufer", "Vermietet", False],
                                                 ["Mietverträge", "Laufzeiten laut Mieterliste", "Befristet", False],
                                                 ["Mieterliste und Verträge", "Zur Prüfung vor Kaufvertrag", "Auf Anfrage", True]]},
              {"titel": "Potenzial", "zeilen": [["Aufstockung Dachgeschoss", "Zusätzliche Wohnfläche durch Aufstockung", "Bauantrag", True],
                                                ["Ausbau Dachgeschoss", "Ausbau der vier Bestandsräume, Vorplanung liegt vor", "Bauantrag", True],
                                                ["Stellplätze im Garten", "3 bis 5 Stellplätze bzw. Carport", "Option", True]]}],
  "quelle": "Quelle: Angaben des Verkäufers und Objektunterlagen. Umbau und Stellplätze vorbehaltlich Genehmigung.",
  "spalte_titel": "Auf einen Blick",
  "spalte": [{"wert": "7 von 7", "label": "Einheiten vermietet"}, {"wert": "3 Optionen", "label": "Aufstockung, Ausbau, Stellplätze"},
             {"wert": "Bauantrag", "label": "für das Dachgeschoss", "sub": "Noch zu stellen"}],
  "spalte_hinweis": ["Angaben des Verkäufers.", "Genehmigungen nicht Teil des Angebots."]})

S.append({"modul": "energie", "id": "energie", "kopf": "Energie &amp; Heizung", "dachzeile": "Heizung und Energieausweis", "bild": "heizung.jpg",
  "caption": "Heizraum im Keller. Fotoaufnahme Bestand.",
  "titel": "Zentral und effizient beheizt", "intro": "Wärme und Warmwasser kommen zentral aus dem Heizraum im Keller. Den Energieausweis erhalten Sie spätestens zur Besichtigung.",
  "zeilen": [["Heizung", "Bosch-Gaszentralheizung"], ["Warmwasser", "Zentraler Speicher"], ["Baujahr Anlage", "2018 (Verkäuferangabe)"],
             ["Energieträger", "Erdgas"]],
  "box_label": "Energieausweis", "box_titel": ["Vorlage zur Besichtigung"],
  "box_text": ["Pflichtangaben nach § 87 GEG ergänzen wir,", "sobald der Ausweis vorliegt."]})

S.append({"modul": "raster", "id": "markt", "kopf": "Markt &amp; Mietorientierung", "dachzeile": "Optionales Modul · GRENFORD Research 24.11.2026",
  "titel": "Mietorientierung für Kapitalanleger",
  "intro": "Die Durchschnittsmiete des Hauses laut Verkäufer im Verhältnis zu veröffentlichten Marktwerten für Britz. Durchschnittswerte umfassen alle Baujahre und Zustände; modernisierte Altbauwohnungen liegen erfahrungsgemäß darüber.",
  "bloecke": [
    {"typ": "spanne", "x": 51, "y": 362, "w": 520, "lw": 200, "titel": "Nettokaltmiete in €/m² und Monat", "achse": [8, 18, 2], "abstand": 36,
     "items": [["Pätzer Straße 11 · Ø laut Verkäufer", 15, 15, "15,00 €", "h"],
               ["Annahme Modellrechnung", 14, 16, "14,00–16,00 €", "h"],
               ["PLZ 12359 · miet-check.de", 11.65, 11.65, "11,65 €"],
               ["Britz · immoportal.com", 10.66, 10.66, "10,66 €"]]},
    {"typ": "kpi", "x": 612, "y": 362, "w": 244, "h": 64, "groesse": 22, "items": [{"wert": "7 von 7", "label": "Einheiten vermietet"}]},
    {"typ": "kpi", "x": 612, "y": 284, "w": 244, "h": 64, "groesse": 22, "items": [{"wert": "Ø 15 €/m²", "label": "Miete laut Verkäufer", "stil": "hell"}]},
    {"typ": "text", "x": 612, "y": 200, "w": 244, "titel": "Einordnung",
     "absaetze": ["Kleine, modernisierte Wohnungen mit Altbaucharakter sind in Britz gut nachgefragt. Die Remise ergänzt das Haus als siebte Einheit. Mieterliste und Mietverträge werden vor dem Kaufvertrag zur Prüfung übergeben."]},
    {"typ": "text", "x": 51, "y": 172, "w": 520, "titel": "Lesehilfe",
     "absaetze": ["Die Marktwerte sind Durchschnittswerte aus Angebots- und Bestandsdaten, keine Vergleichsobjekte und keine Prognose für dieses Haus. Die Objektmiete ist eine Angabe des Verkäufers. Vermerk: Für Wohnraum in Berlin gilt bei Neuvermietung die Mietpreisbremse; die zulässige Miete ist im Einzelfall zu prüfen."]}],
  "quelle": ["Quellen: miet-check.de, Mietpreis PLZ 12359 (2026, 181 Einträge); immoportal.com, Mietspiegel Berlin-Britz (2026). Recherche 24.11.2026, nicht repräsentativ.",
             "Objektmiete: Angabe des Verkäufers. Mietspanne der Modellrechnung: Annahme GRENFORD."]})

S.append({"modul": "rendite", "id": "rendite", "kopf": "Vermietung · Modellrechnung", "dachzeile": "Kapitalanlage Mehrfamilienhaus · drei Szenarien",
  "titel": "Miete, Rendite und Kaufpreisfaktor", "spanne": [14.0, 16.0], "flaeche_label": "Wohn-/Nutzfläche",
  "basis": "Rechenbasis: Wohn- und Nutzfläche ca. 453 m² und Durchschnittsmiete Ø 15 €/m² nach Angabe des Verkäufers. Keine Berechnung nach WoFlV.",
  "fussnoten": ["¹ Fläche nach Verkäuferangabe, keine Berechnung nach WoFlV. Vermerk: Die Bestandspläne weisen für die sechs Wohnungen ca. 242 m² aus, zzgl. Remise, Keller und Dachgeschoss. Maßgeblich für die tatsächliche Rendite ist die Mieterliste.",
                "² Rein rechnerisches Beispiel, keine Miet- oder Renditezusage. Ohne Erwerbsnebenkosten, Leerstand, Finanzierung und Steuern. Instandhaltung, Verwaltung und nicht umlagefähige Kosten trägt der Eigentümer; die Nettorendite liegt entsprechend darunter.",
                "Potenzial: Aufstockung und Ausbau des Dachgeschosses (Bauantrag erforderlich) sowie Stellplätze im Garten sind in der Rechnung nicht enthalten."]})
S.append({"modul": "partner", "id": "partner", "bereich": "nach",
  "intro": "Ein Mehrfamilienhaus zu kaufen bedeutet mehr als den Kaufvertrag. GRENFORD stellt Ihnen auf Wunsch passende Partner zur Seite – für Finanzierung, Ausbau und Garten."})
S.append({"modul": "kontakt", "id": "kontakt", "bereich": "nach", "bild": "eingang-tor.jpg", "bild_pos": "center 40%",
  "claim": ["Ihre Anlage,", "Ihr nächster", "Schritt"], "dachzeile": "Das Haus persönlich erleben", "titel": ["Lernen Sie das", "Haus kennen."],
  "schritte": [["Erstgespräch", "Wir klären mit Ihnen Ihre Anlageziele, Finanzierung und Zeitplan."],
               ["Unterlagen und Prüfung", "Mieterliste, Mietverträge, Pläne und Energieausweis für Ihre Prüfung und Finanzierung."],
               ["Besichtigung und Notar", "Nach der Besichtigung koordinieren wir den Kaufvertragsentwurf mit dem Notar."]]})
S.append({"modul": "ueber", "id": "ueber", "bereich": "nach", "bild": "fassade-seite.jpg", "bild_pos": "center 40%"})
S.append({"modul": "recht", "id": "recht", "bereich": "nach", "dachzeile": "The Heritage House · Pätzer Straße 11",
  "intro": ["Dieser Property Brief dient der ersten Information und ist kein Angebot im rechtlichen Sinne. Maßgeblich ist der notarielle", "Kaufvertrag. Verkäufer: wird im Rahmen der Vertragsvorbereitung benannt."],
  "bloecke": [["Objekt und Vermietung", "Mehrfamilienhaus, Baujahr 1898, sieben vermietete Einheiten (sechs Wohnungen und Remise) mit befristeten Mietverträgen, Ø 15 €/m² laut Verkäufer. Mieterliste und Mietverträge werden vor Abschluss zur Prüfung übergeben. Aufstockung und Ausbau des Dachgeschosses erfordern einen Bauantrag; Stellplätze im Garten sind genehmigungsabhängig."],
              ["Flächen und Darstellungen", FL + " Eine Wohnflächenberechnung nach WoFlV liegt nicht vor. Grundrisse aus den Bestandsplänen, nicht zur Maßentnahme geeignet. Die Rechte an Fotos und Plänen liegen beim Verkäufer."],
              ["Grundbuch und Energieausweis", "Grundbuchauszug auf Anfrage; Einzelheiten ergeben sich aus dem Grundbuch. Der Energieausweis wird spätestens zur Besichtigung vorgelegt (§ 80 Abs. 4 GEG). Angaben zu Modernisierung und Heizung beruhen auf Verkäuferangaben."],
              ["Quellen und Verantwortlichkeit", "Angaben und Unterlagen des Verkäufers, Stand November 2026. Irrtum und Zwischenverkauf vorbehalten. GRENFORD ist die Geschäftsbezeichnung des Einzelunternehmens Marco Kaimann; Erlaubnis nach § 34c GewO, Bezirksamt Charlottenburg-Wilmersdorf von Berlin, 01.11.2022."]]})
S.append({"modul": "agb", "id": "agb", "bereich": "nach"})

json.dump({"meta": meta, "kosten": kosten, "seiten": S}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(S), 'Seiten')
