const { chromium } = require('playwright');
const S = process.argv[2];
const ok = (c, m) => console.log((c ? 'OK   ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await b.newContext({ viewport: { width: 1536, height: 1024 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const B = 'http://127.0.0.1:3000';
  const rows = () => p.locator('table tbody tr');
  const nav = (n) => p.locator('aside[aria-label="Hauptnavigation"]').getByRole('link', { name: n }).click();
  const mf = async (opts) => {
    await p.getByRole('button', { name: /^Geschäftsbereich/ }).first().click();
    for (const o of opts) await p.getByRole('checkbox', { name: new RegExp(o) }).first().click();
    await p.keyboard.press('Escape');
  };

  // Unternehmensliste
  await p.goto(B + '/kunden/unternehmen', { waitUntil: 'networkidle' });
  await p.getByLabel('Einträge pro Seite').selectOption('50');
  ok(await p.locator('thead th', { hasText: 'Geschäftsbereich' }).count() === 1, 'Unternehmen: Spalte Geschäftsbereich');
  const brandesRow = rows().filter({ hasText: 'Kay Brandes Immobilien' });
  ok(/INV[\s\S]*PROP/.test(await brandesRow.innerText()), 'Kay Brandes Immobilien: INV + PROP in der Liste');
  await p.screenshot({ path: S + '/qa-unternehmen.png', fullPage: false });
  await mf(['GRENFORD Property']);
  const nProp = await rows().count();
  await mf(['GRENFORD Projects']);
  const nBoth = await rows().count();
  ok(nBoth > nProp, `Filter Property ${nProp} → Property ODER Projects ${nBoth}`);
  const texts = await rows().allInnerTexts();
  ok(texts.every(t => /PROP|PROJ/.test(t)), 'Alle Treffer haben PROP oder PROJ');
  await p.getByRole('button', { name: 'Filter zurücksetzen' }).click();
  await mf(['Bereich prüfen']);
  const unklar = await rows().allInnerTexts();
  ok(unklar.some(t => t.includes('NOODLES')), `Filter „Bereich prüfen“: ${unklar.length} (u. a. NOODLES)`);
  await p.getByRole('button', { name: 'Filter zurücksetzen' }).click();
  await p.getByLabel('Unternehmen suchen …').fill('Property');
  ok(await rows().count() > 0, 'Suche findet Bereichsnamen');

  // Detail Unternehmen
  await p.goto(B + '/kunden/unternehmen/f-brandes', { waitUntil: 'networkidle' });
  const bz = p.getByTestId('bereichzeile');
  ok(/Investment[\s\S]*Property/.test(await bz.innerText()), 'Detail Unternehmen: Bereiche unter dem Namen');
  await p.screenshot({ path: S + '/qa-unternehmen-detail.png' });

  // Bearbeiten: Pflichtfeld
  await bz.getByRole('button', { name: 'bearbeiten' }).click();
  await p.getByRole('button', { name: '✓ GRENFORD Investment' }).click();
  await p.getByRole('button', { name: '✓ GRENFORD Property' }).click();
  await p.getByRole('button', { name: /speichern/i }).last().click();
  ok(await p.getByText('Bitte mindestens einen Geschäftsbereich wählen.').count() === 1, 'Bearbeiten ohne Bereich wird abgelehnt');
  await p.getByRole('button', { name: 'GRENFORD Projects' }).click();
  await p.getByLabel('Funktion in Projects (optional)').fill('Bauherr');
  await p.getByRole('button', { name: /speichern/i }).last().click();
  ok(/Projects[\s\S]*Bauherr/.test(await bz.innerText()), 'Bereich geändert: Projects · Bauherr');
  ok(await bz.getByRole('button', { name: 'übernehmen' }).count() === 1, 'Konsistenzhinweis: Investment laut Unternehmensart');
  await bz.getByRole('button', { name: 'übernehmen' }).click();
  ok(/Investment/.test(await bz.innerText()), 'Hinweis übernommen');

  // Ansprechpartnerliste
  await nav('Ansprechpartner');
  await p.waitForURL(/ansprechpartner$/);
  await p.getByLabel('Einträge pro Seite').selectOption('50');
  ok(await p.locator('thead th', { hasText: 'Geschäftsbereich' }).count() === 1, 'Ansprechpartner: Spalte Geschäftsbereich');
  const fischer = rows().filter({ hasText: 'Tobias Fischer' });
  ok(/INV[\s\S]*PROP[\s\S]*PROJ/.test(await fischer.innerText()), 'Tobias Fischer: INV + PROP + PROJ');
  await p.screenshot({ path: S + '/qa-ansprechpartner.png' });
  await mf(['GRENFORD Investment']);
  const inv = await rows().allInnerTexts();
  ok(inv.length > 0 && inv.every(t => t.includes('INV')), `Filter Investment: ${inv.length} Treffer, alle INV`);
  await p.getByRole('button', { name: 'Filter zurücksetzen' }).click();

  // Person Detail Keil: Privat + Sanierung, ein Datensatz
  await p.goto(B + '/kunden/privatkunden/p-keil', { waitUntil: 'networkidle' });
  const pz = p.getByTestId('bereichzeile');
  ok(/Projects/.test(await pz.innerText()), 'Keil: Geschäftsbereich Projects');
  ok(await p.getByRole('link', { name: 'Sanierungskunde' }).count() >= 1 && await p.getByRole('link', { name: 'Privatkunde' }).count() >= 1, 'Keil: Rollen Privat- und Sanierungskunde getrennt sichtbar');
  // Person Detail Brandes
  await p.goto(B + '/kunden/ansprechpartner/p-brandes', { waitUntil: 'networkidle' });
  ok(/Investment[\s\S]*Property/.test(await p.getByTestId('bereichzeile').innerText()), 'Kay Brandes: Investment + Property');
  await p.screenshot({ path: S + '/qa-person-detail.png' });

  // Privat- und Sanierungskunden-Listen
  for (const [n, url] of [['Privatkunden', /privatkunden$/], ['Sanierungskunden', /sanierungskunden$/]]) {
    await nav(n); await p.waitForURL(url);
    ok(await p.locator('thead th', { hasText: 'Geschäftsbereich' }).count() === 1, `${n}: Spalte Geschäftsbereich`);
    const keil = rows().filter({ hasText: 'Alexander Keil' });
    ok(await keil.count() === 1, `${n}: Alexander Keil genau einmal`);
  }
  // Responsive
  for (const w of [1920, 1536, 1280, 1024, 390]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(B + '/kunden/ansprechpartner', { waitUntil: 'networkidle' });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, `Breite ${w}: kein horizontales Scrollen der Seite (${sw})`);
    await p.screenshot({ path: S + `/qa-ap-${w}.png` });
  }
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.log('EXCEPTION', e.message); process.exit(1); });
