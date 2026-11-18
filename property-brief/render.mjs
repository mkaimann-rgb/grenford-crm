// GRENFORD Property Brief: brief.html -> PDF (Playwright + Chromium)
// Aufruf: node render.mjs objekte/<objektordner>
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const dir = path.resolve(process.argv[2] || '.');
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'objekt.json'), 'utf8')).meta;
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(path.join(dir, 'brief.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: path.join(dir, meta.ausgabe), preferCSSPageSize: true, printBackground: true });
await b.close(); console.log('PDF geschrieben:', path.join(dir, meta.ausgabe));
