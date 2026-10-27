# Marktseite `/markt/`: benötigte Daten und vorgeschlagene Primärquellen

Stand der Recherche: 27.10.2026. **Es wurde keine Rechteprüfung durchgeführt.** Die Angaben zu Lizenzen geben wieder,
was in Metadaten oder auf den Quellseiten gefunden wurde. Vor jeder Veröffentlichung die Nutzungsbedingungen am
konkreten Datensatz prüfen und im Feld `usageRightsNote` festhalten.

## 1. Benötigte Daten (je Standort und Objektart)

| # | Kennzahl | Datentyp | Standorte | Turnus |
|---|---|---|---|---|
| D1 | Kaufpreis je m² Wohnfläche, Median, Eigentumswohnungen (Bestand / Neubau getrennt) | Transaktion | Berlin, Bezirke, Potsdam | jährlich |
| D2 | Kaufpreis je m² bzw. je Objekt, Ein- und Zweifamilienhäuser | Transaktion | Berlin, Bezirke, Potsdam | jährlich |
| D3 | Anzahl der Kauffälle und Geldumsatz je Teilmarkt | Transaktion | Berlin | jährlich, ggf. unterjährig |
| D4 | Bodenrichtwerte für typische Lagen | Transaktion (abgeleitet) | Berlin, Potsdam | jährlich (Stichtag 1.1.) |
| D5 | Preisindex Wohnimmobilien (Veränderung zum Vorjahr/Vorquartal) | Transaktion (Index) | Berlin, Bezirke soweit verfügbar | quartalsweise |
| D6 | Angebotspreis je m², Median, Wohnungen und Häuser | Angebot | Berlin, Bezirke | quartalsweise |
| D7 | Nachfrage je Inserat, Vermarktungsdauer | Angebot | Berlin | quartalsweise |

Pflicht je Datensatz (siehe `market.json` → `dataSchema`): Zeitraum, Datentyp, Statistik (Median/Durchschnitt), Einheit,
Fallzahl soweit veröffentlicht, Quelle mit Adresse, Nutzungshinweis, Prüfdatum, Methodik-Hinweis.

## 2. Vorgeschlagene Primärquellen

| Quelle | Liefert | Datentyp | Zugang | Nutzung (Fundstand, ungeprüft) |
|---|---|---|---|---|
| **Gutachterausschuss für Grundstückswerte in Berlin**, Immobilienmarktbericht und Pressemitteilungen | D1, D2, D3 (alle notariell beurkundeten Verkäufe in Berlin) | Transaktion | öffentlich, Bericht kostenfrei abrufbar | Nutzungsbedingungen des Berichts nicht ermittelt. Einzelwerte mit Quellenangabe zitieren; Tabellen nicht ungeprüft übernehmen. **Prüfen bzw. beim Gutachterausschuss anfragen.** |
| **BORIS Berlin / Geoportal Berlin**, Bodenrichtwerte | D4 | Transaktion (abgeleitet) | öffentlich | Metadaten neuerer Jahrgänge nennen *Datenlizenz Deutschland – Zero – 2.0*, ältere *Namensnennung 2.0*. **Am verwendeten Jahrgang prüfen.** |
| **Gutachterausschuss Potsdam / BORIS Brandenburg** | D1, D2, D4 für Potsdam | Transaktion | öffentlich | Nicht ermittelt. **Prüfen.** |
| **GREIX** (Kiel Institut, ECONtribute, Gutachterausschüsse) | D5 für Berlin und Stadtteile | Transaktion (Index aus Kaufpreissammlungen) | öffentlich, Daten frei abrufbar | Nutzungsbedingungen nicht gefunden. **Auf greix.de prüfen.** |
| **Statistisches Bundesamt**, Häuserpreisindex (GENESIS 61262) | D5 nur Bund und Städtetypen | Transaktion (Index) | öffentlich, kostenfrei | Metadaten nennen *Datenlizenz Deutschland – Namensnennung – 2.0*. **Auf destatis.de bestätigen.** |
| **ImmoScout24, VALUE Marktdaten, empirica-systeme o. ä.** | D6, D7 | Angebot | kommerziell | **Gesonderte Nutzungserlaubnis bzw. Datenlieferung erforderlich.** Ohne Vertrag keine Werte veröffentlichen. |
| **Eigene Daten GRENFORD** (anonymisierte Angebote aus Renovation Memos, eigene Vermittlungen) | z. B. Sanierungskosten je m² | eigene Auswertung | intern | Nur mit Zustimmung der Beteiligten und anonymisiert. Als eigene Auswertung kennzeichnen, nicht als Marktdaten. |

## 3. Empfohlene Reihenfolge

1. Mit **Transaktionsdaten** des Gutachterausschusses Berlin (D1–D3) und den **Bodenrichtwerten** (D4) beginnen: öffentlich und belastbar.
2. **GREIX** (D5) ergänzen, sobald die Nutzungsbedingungen geklärt sind; liefert die zeitnahe Entwicklung.
3. **Angebotsdaten** (D6, D7) nur mit Datenvertrag. Bis dahin bleibt dieser Datentyp leer; die Seite zeigt den Leerzustand.

## 4. Pflege

Datensatz in `market.json` → `marketData` eintragen, `python3 build.py`, dann `python3 tests/markup.py` und `python3 tests/market.py`.
Der Build bricht ab, wenn Pflichtfelder fehlen, `checkedAt` nicht im Format JJJJ-MM-TT ist oder `dataType` nicht `asking`/`transaction` lautet.
