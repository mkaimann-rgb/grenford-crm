# GRENFORD Property · Brand-Kit für Property Brief und Handouts

Dieser Ordner enthält alles, um Property-Brief-Handouts, Objekt-Exposés und Präsentationen von **GRENFORD Property** im Design der neuen Website zu erstellen.

## Inhalt
- `design/tokens.css` / `tokens.json`: Farben, Schriften, Formen (1:1 von der Website)
- `fonts/`: DM Sans 400/500 (SIL OFL) und TeX Gyre Pagella (GUST Font License, Print-Ersatz für Palatino)
- `images/`: Logos (`logo-property-white|dark|navy.png`, Dachmarke `logo-boutique-*`), Visualisierungen der Penthouses, Porträt Marco Kaimann
- `content/property-de.md`: geprüfte Texte von der Website
- `handout/`: Vorlage (4 Seiten A4, Beispiel Schlosspark Penthouse) und `render.mjs` → `GRENFORD-Property-Handout.pdf`

PDF erzeugen: `node handout/render.mjs` (Playwright mit Chromium).

## Regeln
1. **Farben:** Property-Akzent ist Memo-Blau `#222E41` (Titel, Kennzahlen, Buttons, Property-Brief-Fläche). Auf dunklem Grund `#A9B8CF`, zarte Hinterlegung `#DFE4EC`. Basis: Schwarz-Grau `#3A3D41`, Papier `#FAF6F2`, Elfenbein `#EFE9E1`, Linie `#CFC8BC`, Text `#5F6470`. Kein Projects-Orange, kein Investment-Patina. Mokka `#7A6A52` nur für die Dachmarke (z. B. Chip „Wertermittlung“).
2. **Schrift:** DM Sans 500 für Titel (enge Laufweite, -0.06em groß), DM Sans 400 für Text, Dachzeilen in Versalien 0.08em. Serifen (Pagella/Palatino) nur für Einleitungssätze.
3. **Form:** Buttons und Chips halbrund, Bilder 20px, Karten 18px mit feiner Linie. Viel Weißraum, ruhig, edel.
4. **Sprache:** GRENFORD spricht als Unternehmen, nie in der Ich-Form; Marco Kaimann in der dritten Person. Einfach und direkt, „Sie“.
5. **Nur geprüfte Inhalte:** Zahlen und Aussagen ausschließlich aus `content/property-de.md` oder freigegebenen Unterlagen. Keine Marktzahlen erfinden.
6. **Pflichtangaben:** Vor Veröffentlichung oder Weitergabe Energieausweis-Angaben nach § 87 GEG und die Käuferprovision eintragen. Bis dahin „Angabe folgt“.
7. **Bilder:** Alle Penthouse-Bilder sind Visualisierungen und müssen so gekennzeichnet sein. Keine genaue Adresse im Handout (die nennt der Property Brief).
8. **Vertraulich:** Keine Namen von Kunden, Bauträgern oder Baufirmen, keine Angebotssummen aus internen Unterlagen.
