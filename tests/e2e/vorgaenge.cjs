const { chromium } = require('playwright');
const S = process.argv[2];
const ok = (c, m) => console.log((c ? 'OK   ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const p = await (await b.newContext({ viewport: { width: 1536, height: 1000 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const B = 'http://127.0.0.1:3000';
  const txt = (sel) => p.getByTestId(sel).innerText();

  // Privatkunde Legrand
  await p.goto(B + '/kunden/privatkunden/p-legrand', { waitUntil: 'networkidle' });
  let t = await txt('objekte-uebersicht');
  ok(/Penthouse Charlottenburg[\s\S]*Property[\s\S]*Rolle: Kaufinteressent[\s\S]*Kauf \(Eigennutzung\)/.test(t), 'Legrand: Penthouse → Property → Kauf (Eigennutzung) → Kaufinteressent');
  ok(/Malplaquetstraße 39[\s\S]*Projects[\s\S]*Rolle: Bauherr[\s\S]*Sanierung \/ Modernisierung/.test(t), 'Legrand: Malplaquetstraße 39 → Projects → Sanierung / Modernisierung → Bauherr');
  ok(/Property[\s\S]*Projects/.test(await txt('bereichzeile')), 'Kontakt-Bereiche im Kopf unverändert (Property, Projects)');
  await p.screenshot({ path: S + '/v-legrand.png' });
  await p.getByRole('tab', { name: /Vorhaben & Objekte/ }).click();
  t = await txt('vorgaenge-liste');
  ok(/Referenz[\s\S]*PROP-OPT-0011/.test(t) && /Herkunft/.test(t), 'Reiter: Referenz und Herkunft sichtbar');
  await p.screenshot({ path: S + '/v-legrand-tab.png' });

  // Neues Vorhaben am bestehenden Objekt in anderem Bereich
  await p.getByRole('button', { name: 'Neues Vorhaben' }).click();
  await p.getByLabel('Objekt / Projekt').fill('Malplaquetstr. 39');
  await p.getByLabel('Ort', { exact: true }).fill('Berlin');
  ok(await p.getByText('existiert bereits – der Vorgang wird damit verknüpft').count() === 1, 'Objekt-Dublette erkannt (Malplaquetstr. 39)');
  await p.getByLabel('Art').selectOption('Verkauf');
  ok(await p.getByLabel('Geschäftsbereich des Vorgangs').inputValue() === 'Property', 'Vorschlag Bereich Property');
  ok(await p.getByLabel('Rolle des Kunden im Vorgang').inputValue() === 'Verkäufer', 'Vorschlag Rolle Verkäufer');
  await p.getByRole('button', { name: 'Speichern' }).click();
  ok(await p.getByRole('status').filter({ hasText: 'mit bestehendem Objekt verknüpft' }).count() === 1, 'Meldung „mit bestehendem Objekt verknüpft“');
  t = await txt('vorgaenge-liste');
  ok((t.match(/Malplaquetstraße 39/g) || []).length === 2, 'Objekt zweimal gelistet (zwei Vorgänge), Titel aus Stammsatz');
  ok(/Objekt auch in:/.test(t), 'Hinweis „Objekt auch in …“ für zweiten Bereich');
  await p.screenshot({ path: S + '/v-legrand-mehrbereich.png' });

  // Pflichtfeld Bereich beim Bearbeiten
  await p.getByTestId('vorgaenge-liste').getByRole('button', { name: /Penthouse/ }).click();
  ok(await p.getByLabel('Geschäftsbereich des Vorgangs').inputValue() === 'Property', 'Bearbeiten: Bereich vorbelegt');
  await p.getByLabel('Geschäftsbereich des Vorgangs').selectOption('');
  await p.getByRole('button', { name: 'Speichern' }).click();
  ok(await p.getByText('Bitte den Geschäftsbereich des Vorgangs wählen').count() === 1, 'Pflichtfeld Geschäftsbereich des Vorgangs');
  await p.getByRole('button', { name: 'Abbrechen' }).click();

  // Ansprechpartner Kay Brandes
  await p.goto(B + '/kunden/ansprechpartner/p-brandes', { waitUntil: 'networkidle' });
  t = await txt('objekte-uebersicht');
  ok(/Investment/.test(t), 'Brandes: Investment-Vorgänge in der Übersicht');
  await p.screenshot({ path: S + '/v-brandes.png' });
  await p.getByRole('tab', { name: /Vorhaben & Objekte/ }).click();
  t = await txt('vorgaenge-liste');
  ok(/Investment/.test(t) && /Property/.test(t) && /Rolle: Empfehlungspartner/.test(t) && /Rolle prüfen|Bereich prüfen|Rolle offen/.test(t), 'Brandes: Investment+Property, Rollen und unklarer Fall gekennzeichnet');
  await p.screenshot({ path: S + '/v-brandes-tab.png', fullPage: true });

  // Unternehmen ERZ
  await p.goto(B + '/kunden/unternehmen/f-erz', { waitUntil: 'networkidle' });
  t = await txt('objekte-uebersicht');
  ok(/Investment/.test(t) && /Projects/.test(t) && /Objekt auch in/.test(t), 'ERZ: Objekt mit Investment- und Projects-Vorgang');
  await p.screenshot({ path: S + '/v-erz.png' });
  await p.getByRole('tab', { name: /Objekte & Projekte/ }).click();
  await p.screenshot({ path: S + '/v-erz-tab.png' });

  // Sanierungskunde Keil
  await p.goto(B + '/kunden/sanierungskunden/p-keil', { waitUntil: 'networkidle' });
  ok(/Projects[\s\S]*Rolle: Sanierungskunde/.test(await p.locator('main').innerText()), 'Keil: Projects / Sanierungskunde');
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.log('EXCEPTION', e.message); process.exit(1); });
