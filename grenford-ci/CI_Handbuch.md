# GRENFORD – CI-Handbuch für Dokumente

Stand 19.11.2026 · gilt für Property Brief, Investment Memo und Projects-Unterlagen.
Technische Umsetzung: `property-brief/lib/brief.py` (ein Design, Farbthema je Bereich über `meta.bereich`).

## 1 Grundsatz

Ein GRENFORD-Dokument ist an Typografie, Raster und Sprache erkennbar – nicht an der Farbe.
Alle Bereiche teilen Schrift, Seitenaufbau, Seitenzählung und Sprachregeln.
Jeder Bereich behält: eigene Akzentfarbe, eigenes Logo, eigene Tonalität, eigene Fachseiten.

| Bereich | Dokument | Zielgruppe | Tonalität |
|---|---|---|---|
| GRENFORD Property | Property Brief | Käufer, Selbstnutzer, Privatanleger | ruhig, persönlich, Wir-Form |
| GRENFORD Investments | Investment Memo | institutionelle und professionelle Investoren (B2B) | nüchtern, faktisch, keine Werbesprache |
| GRENFORD Projects | Projekt-Exposé / Projektbericht | Projektpartner, Bauherren | sachlich, technisch, prozessorientiert |

## 2 Format und Raster

- Querformat 907 × 567 pt (≈ 320 × 200 mm), Papierton hell, keine Rahmen, keine schrägen Ecken oder Diagonalen.
- Logo-Zeichen oben links ab Seite 2, Kopfzeile (Kapitel) oben rechts, Fußzeile 8,2 pt unten links, Seitenzahl unten rechts.
- Bildseiten 50/50 (Bild links oder rechts, Textspalte ab 500 pt).
- Farbflächen: Akzentdunkel mit 60 % Deckkraft über Fotos (Titel), sonst vollflächig; Ecken eckig.

## 3 Typografie

| Rolle | Schrift | Ausprägung |
|---|---|---|
| Überschriften, Objektname | Cormorant Garamond (Logo-Schrift) | Versalien, Weight 500, Laufweite +80 |
| Fließtext, Tabellen | DM Sans | 400 / 500 |
| Große Zahlen, Leads | DM Sans Light (300) | tabellarische Ziffern |
| Dachzeilen, Labels | DM Mono | Versalien, klein |

- Keine Serifenschrift im Fließtext und in Zahlen. Kein künstliches Fett.
- Überschriften ohne Schlusspunkt. Zahlen immer in DM Sans, nie in Versalien-Serif.

## 4 Farben

| Bereich | Dunkel | Akzent | Hell |
|---|---|---|---|
| Property | #212e40 | #4f6a92 | #a9b8cf |
| Investments (Patina) | #24534c | #2e6b62 | #8fc7bb |
| Projects | Festlegung offen – Vorschlag: eigener Akzentton, gleiche drei Stufen | | |

Fließtext immer Dunkelgrau/Ink, Akzent nur für Flächen, Linien, Labels.

## 5 Dramaturgie und Seitenzählung

Titel (ohne Zahl) · I Inhalt · II Vorwort · III Fakten und Zahlen · Hauptteil arabisch (1, 2, …) ·
Anhang römisch fortlaufend (Partner/Nächster Schritt, Kontakt, Über GRENFORD, Rechtliche Hinweise, AGB).
Inhaltsverzeichnis und Querverweise werden automatisch berechnet.

## 6 Sprachregeln

- Wir-Form für GRENFORD; Investoren und Käufer werden gesiezt.
- Keine Ausrufezeichen, keine Superlative, kein Stakkato („Ruhig. Hell. Grün.“), keine Anglizismen, wo ein deutsches Wort genügt (Fachbegriffe wie IRR, CapEx, LOI, Asset Deal bleiben).
- Zahlenformate: `5,30 Mio. €` · `381 T€` · `13,9-fach` · `23,1 %` · `5.000 €/m²` · Datum `19.11.2026`.
- Jede Seite mit Zahlen hat eine Quellenzeile („Quelle: … Stand …“). Annahmen als „Annahme GRENFORD“ kennzeichnen.
- Visualisierungen: „Visualisierung, virtuell möbliert“ bzw. „Visualisierung, unverbindlich“ – kein Hinweis „KI-gestützt“.
- Keine internen Notizen, Platzhalter oder Beispieltexte im Dokument (Build-Prüfung warnt).

## 7 Objektnummern

| Bereich | Präfix | Beispiel |
|---|---|---|
| Investments | GI | GI26-002 |
| Property | GPR | GPR26-004 |
| Projects | GP | GP26-102 |
| STAYNAMIC | GS | GS26-001 |

Jede Einheit erhält eine eigene Nummer. Rechnungsnummer = Objektnummer + laufender Zähler ohne Jahresreset (GP26-102-01).

## 8 Recht (alle Bereiche)

- Einzelunternehmen eindeutig benennen (Kontaktzeile, AGB § 1).
- Finanzierung nur als Kontaktherstellung zu Partnern, keine Darlehensvermittlung; Partnerprovision offenlegen (ohne Betrag).
- Bildrechte: Visualisierungen GRENFORD, Originalfotos und Pläne Verkäufer/Projektgesellschaft; Fremdvisualisierungen nur mit geklärtem Nutzungsrecht.
- Karten nur aus frei lizenzierten Daten mit Quellenangabe.

## 9 Bereich Investments – Zusatzregeln

- Kennzeichnung „Streng vertraulich (C3)“ auf Titel und in der Fußzeile; „Off-Market · nur für professionelle Investoren“.
- Hard Facts als Gegenüberstellung (z. B. Early-Commit | Listenpreis), alle Werte netto, vor Steuern und Finanzierung, indikativ.
- Cashflow als Jahrestabelle mit Kennzahlenband (IRR, Multiple, Überschuss, Spitzenbedarf) und Sensitivitätshinweis.
- Keine emotionalen Bildunterschriften, keine Lifestyle-Sprache.
