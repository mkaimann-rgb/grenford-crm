// GRENFORD Property · Handout als PDF (A4, Hintergründe mitdrucken)
// Aufruf im Ordner brochure-property:   node handout/render.mjs
// Voraussetzung: Playwright mit Chromium (npm i -D playwright && npx playwright install chromium)
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');  // findet lokale und globale Installation
const here = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(here, 'handout.html');
const output = path.join(here, '..', 'GRENFORD-Property-Handout.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(input).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: output, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('PDF geschrieben:', output);
