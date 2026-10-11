const { chromium } = require('playwright');
const S = process.argv[2];
const ok = (c, m) => console.log((c ? 'OK   ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await b.newContext({ viewport: { width: 1536, height: 1024 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const B = 'http://127.0.0.1:3000';
  await p.goto(B + '/kunden/unternehmen', { waitUntil: 'networkidle' });
  const rows = () => p.locator('table tbody tr');
  const n0 = await rows().count();
  ok(n0 === 25, `Unternehmen-Liste zeigt 25 Zeilen (${n0})`);

  // KPI-Filter
  await p.getByRole('button', { name: /Potenzielle Investoren/ }).click();
  ok(await rows().count() === 8, "KPI „Potenzielle Investoren“ filtert auf 8");
  await p.getByRole('button', { name: 'Filter zurücksetzen' }).click();
  // Sortierung
  await p.getByRole('button', { name: /^Unternehmen/ }).first().click();
  const first = await rows().first().locator('td').nth(1).innerText();
  ok(first.startsWith('Alpen'), `Sortierung nach Name: erste Zeile „${first}“`);
  // Seitengröße
  await p.getByLabel('Einträge pro Seite').selectOption('10');
  ok(await rows().count() === 10 && await p.getByText('1 – 10 von 25').count() === 1, 'Seitengröße 10 → 1 – 10 von 25');
  await p.getByRole('navigation', { name: 'Seiten' }).getByRole('button', { name: '3', exact: true }).click();
  ok(await rows().count() === 5, "Seite 3 zeigt 5 Zeilen");

  // Neues Unternehmen: Dublette
  await p.getByRole('button', { name: 'Neues Unternehmen' }).first().click();
  await p.getByLabel('Unternehmensname').fill('Montesana');
  ok(await p.getByRole('alert').filter({ hasText: 'existiert bereits' }).count() === 1, 'Dublettenhinweis bei „Montesana“');
  ok(await p.getByRole('button', { name: 'Unternehmen anlegen' }).isDisabled(), 'Anlegen bei Dublette gesperrt');
  await p.getByLabel('Unternehmensname').fill('Testfirma Phase A GmbH');
  await p.getByRole('button', { name: 'Unternehmen anlegen' }).click();
  ok(await p.getByText('Bitte die Unternehmensart wählen.').count() === 1, 'Pflichtfeld-Prüfung Unternehmensart');
  ok(await p.getByText('Bitte mindestens einen Geschäftsbereich wählen.').count() === 1, 'Pflichtfeld-Prüfung Geschäftsbereich');
  await p.getByRole('button', { name: 'GRENFORD Investment' }).click();
  await p.getByRole('button', { name: 'GRENFORD Property' }).click();
  await p.getByLabel('Unternehmensart').selectOption('Investor');
  await p.getByLabel('Vorsitzender / Geschäftsführer').fill('Markus Sa');
  await p.getByRole('button', { name: /Markus Sander/ }).click();
  await p.getByRole('button', { name: 'Unternehmen anlegen' }).click();
  ok(await p.getByRole('status').filter({ hasText: 'angelegt' }).count() === 1, 'Meldung „angelegt (Testmodus)“');
  await p.getByLabel('Unternehmen suchen …').fill('Testfirma');
  ok(await rows().count() === 1, 'Neues Unternehmen in Liste auffindbar');
  ok((await rows().first().innerText()).includes('Markus Sander'), 'Bestehende Person als Ansprechpartner verknüpft');
  ok(/INV[\s\S]*PROP/.test(await rows().first().innerText()), 'Neues Unternehmen zeigt INV + PROP in der Liste');

  // Detail
  await rows().first().click();
  await p.waitForURL(/kunden\/unternehmen\/f-neu/);
  ok(await p.getByRole('heading', { name: 'Testfirma Phase A GmbH' }).count() === 1, 'Detailseite des neuen Unternehmens');
  await p.getByLabel('Neues Label').fill('Testlabel');
  await p.getByRole('button', { name: 'Label hinzufügen' }).click();
  ok(await p.getByRole('button', { name: 'Testlabel' }).count() === 1, 'Label hinzugefügt');
  await p.getByRole('button', { name: 'Status ändern' }).click();
  await p.getByRole('menuitem', { name: 'Aktiv', exact: true }).click();
  ok(await p.getByText('Status „Aktiv“ gesetzt', { exact: false }).count() === 1, 'Status geändert');

  // Personen: Rolle ergänzen statt Duplikat
  await p.locator('aside[aria-label="Hauptnavigation"]').getByRole('link', { name: 'Ansprechpartner' }).click();
  await p.waitForURL(/ansprechpartner$/);
  await p.getByLabel('Einträge pro Seite').selectOption('50');
  const ap0 = await rows().count();
  await p.locator('aside[aria-label="Hauptnavigation"]').getByRole('link', { name: 'Privatkunden' }).click();
  await p.waitForURL(/privatkunden$/);
  const pk0 = await rows().count();
  await p.getByRole('button', { name: 'Neuer Privatkunde' }).first().click();
  await p.getByLabel('Vorname').fill('Markus');
  await p.getByLabel('Nachname').fill('Sander');
  ok(await p.getByRole('alert').filter({ hasText: 'existiert bereits' }).count() === 1, 'Personen-Dublette erkannt');
  await p.getByRole('button', { name: 'Bestehende Person verwenden' }).click();
  await p.getByRole('button', { name: 'Privatkunde anlegen' }).click();
  ok(await p.getByRole('status').filter({ hasText: 'um Rolle Privatkunde ergänzt' }).count() === 1, 'Meldung „um Rolle ergänzt (kein Duplikat)“');
  ok(await rows().count() === pk0 + 1, `Privatkunden ${pk0} → ${pk0 + 1}`);
  await p.locator('aside[aria-label="Hauptnavigation"]').getByRole('link', { name: 'Ansprechpartner' }).click();
  await p.waitForURL(/ansprechpartner$/);
  await p.getByLabel('Einträge pro Seite').selectOption('50');
  ok(await rows().count() === ap0, `Ansprechpartner unverändert ${ap0} (keine Kopie)`);

  // Schnellfilter & Export
  await p.getByRole('button', { name: /Entscheider \(C-Level/ }).click();
  const entsch = await rows().count();
  ok(entsch > 0 && entsch < ap0, `Schnellfilter Entscheider: ${entsch}`);
  await p.getByRole('button', { name: 'Weitere Aktionen' }).click();
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('menuitem', { name: /Export/ }).click()]);
  ok(dl.suggestedFilename().startsWith('TESTDATEN_'), 'CSV-Export ' + dl.suggestedFilename());

  // Aktivitäten
  await p.locator('aside[aria-label="Hauptnavigation"]').getByRole('link', { name: 'Aktivitäten' }).click();
  await p.waitForURL(/aktivitaeten/);
  await p.getByRole('button', { name: 'Aufgabe erstellen' }).click();
  await p.getByLabel('Titel').fill('Testaufgabe Phase A');
  await p.getByLabel('Unternehmen', { exact: true }).selectOption({ label: 'Testfirma Phase A GmbH' });
  await p.getByRole('button', { name: 'Aktivität anlegen' }).click();
  ok(await p.getByText('Testaufgabe Phase A').count() >= 1, 'Neue Aufgabe in Liste');
  await p.getByLabel('Testaufgabe Phase A als erledigt markieren').click();
  ok(await p.getByRole('status').filter({ hasText: 'erledigt' }).count() === 1, 'Erledigt: Meldung');
  ok(await p.getByLabel('Testaufgabe Phase A als erledigt markieren').count() === 0, 'Erledigte Aufgabe ausgeblendet');
  await p.getByLabel('Erledigte anzeigen').check();
  ok(await p.getByLabel('Testaufgabe Phase A als erledigt markieren').isChecked(), 'Mit „Erledigte anzeigen“ wieder sichtbar und abgehakt');
  await p.getByRole('tab', { name: /Notizen/ }).click();
  ok((await p.locator('section h3').allInnerTexts()).length > 0, 'Tab Notizen zeigt Einträge');
  await p.getByLabel('Nächste Woche').click();
  ok(await p.getByText('Keine Einträge an diesem Tag.').count() + await p.locator('aside li button').count() > 0, 'Kalender blättert');
  await p.screenshot({ path: S + '/phaseA-end.png' });

  // Detail Privatkunde Tabs
  await p.goto(B + '/kunden/privatkunden/p-legrand', { waitUntil: 'networkidle' });
  for (const t of ['Vorhaben & Objekte', 'Aktivitäten', 'Kommunikation', 'Notizen', 'Dateien']) { await p.getByRole('tab', { name: new RegExp(t) }).click(); }
  ok(await p.getByText('folgt in einer späteren Phase').count() === 1, 'Nicht implementierte Tabs gekennzeichnet');
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.log('EXCEPTION', e.message); process.exit(1); });
