# Browser-Tests (Playwright) – Testmodus

Diese Skripte prüfen die Oberfläche gegen einen **lokal** laufenden Produktions-Build
(`npm run build && npx next start -H 127.0.0.1 -p 3000`). Sie arbeiten ausschließlich
mit den fiktiven Testdaten und dem Browser-Zwischenspeicher – keine echten Daten, keine
externen Dienste.

Playwright ist bewusst **keine** Projektabhängigkeit (hält Vercel-Builds schlank).
Ausführen z. B. in einem separaten Ordner mit `npm i playwright@1.56.1` und
`NODE_PATH=<ordner>/node_modules node tests/e2e/integ.cjs <screenshot-ordner>`.
Optional `CHROMIUM_PATH` auf eine vorhandene Chromium-Installation setzen.

| Skript | Inhalt |
|---|---|
| `integ.cjs` | Integrationstests 1–5 (Investment, Property, Projects, bereichsübergreifende Person, Finanzkonsistenz) |
| `nav.cjs <routen…>` | Alle Routen bei 1536/1440/1280/820/390 px: HTTP-Status, Konsolenfehler, horizontales Scrollen |
| `phaseA.cjs`, `bereiche.cjs`, `vorgaenge.cjs` | Regression Phase A, Geschäftsbereiche, Objekt-/Vorgangszuordnung |
