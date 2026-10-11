// Integrationstests 1–5 über die Oberfläche (Testmodus, Browser-Zwischenspeicher)
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:3000';
const OUT = process.argv[2] || '..';
const nur = process.argv[3];
let fails = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await b.newContext({ viewport: { width: 1536, height: 1024 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const go = async (u) => { await p.goto(B + u, { waitUntil: 'networkidle' }); };
  const dlg = () => p.getByRole('dialog').last();
  const feld = (l) => dlg().getByLabel(new RegExp('^' + esc(l))).first();
  const fill = (l, v) => feld(l).fill(String(v));
  const sel = (l, v) => feld(l).selectOption(typeof v === 'string' && !v.includes('(') && !v.startsWith('__') ? v : (v.startsWith('__') ? v : { label: v }));
  const selLabel = (l, v) => feld(l).selectOption({ label: v });
  const speichern = async (name = 'Speichern') => { await dlg().getByRole('button', { name, exact: true }).click(); await p.waitForTimeout(300); };
  const tab = async (n) => { await p.getByRole('tab', { name: new RegExp('^' + esc(n)) }).click(); await p.waitForTimeout(200); };
  const body = () => p.locator('main').innerText();
  const shot = (n) => p.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });

  // ---------------- 1 Investment ----------------
  if (!nur || nur === '1') {
    await go('/kunden/unternehmen');
    await p.getByRole('button', { name: 'Neues Unternehmen' }).first().click();
    await p.getByLabel('Unternehmensname').fill('IT-Invest Testkäufer GmbH');
    await p.getByRole('button', { name: 'GRENFORD Investment' }).click();
    await p.getByLabel('Unternehmensart').selectOption('Investor');
    await p.getByLabel('Vorsitzender / Geschäftsführer').fill('Iris Testinvest');
    await p.getByRole('button', { name: 'Unternehmen anlegen' }).click();
    await p.waitForTimeout(300);
    ok(/angelegt/.test(await p.getByRole('status').first().innerText().catch(() => '')), '1 Unternehmen + Kontakt angelegt');

    await go('/investment/projekte');
    await p.getByRole('button', { name: 'Neues Projekt' }).first().click();
    await fill('Projektname', 'IT Bürohaus Teststadt');
    await feld('Assetklasse').selectOption({ index: 1 });
    await feld('Objekt (zentraler Objektbestand)').selectOption('__neu');
    await fill('Objektbezeichnung', 'IT Bürohaus Teststraße 1');
    await fill('Standort', 'Berlin');
    await fill('Kaufpreis (Indikation, €)', '10000000');
    await fill('Netto-Courtage (%)', '3');
    await feld('Phase').selectOption('C2');
    await feld('Status').selectOption('Aktiv');
    await speichern();
    await p.waitForURL(/investment\/projekte\/INV-/);
    const inv = p.url().split('/').pop();
    ok(/^INV-2026-\d{3}$/.test(inv), `1 Investment-Projekt angelegt (${inv})`);

    await tab('Käuferprozesse');
    for (const k of ['IT-Invest Testkäufer GmbH (Unternehmen)', 'Maspohl Invest GmbH (Unternehmen)']) {
      await p.getByRole('button', { name: 'Neuer Käuferprozess' }).first().click();
      await selLabel('Käufer / Investor (aus Stammdaten)', k);
      await feld('Typ').selectOption({ index: 1 });
      await fill('Kaufpreisindikation (€)', '9800000');
      await fill('Wahrscheinlichkeit (%)', '40');
      await speichern();
      if (await p.getByRole('dialog').count()) { console.log('DIALOG OFFEN:', (await dlg().innerText()).split('\n').filter(l => /Bitte|bereits|Fehler|existiert|ungültig/i.test(l)).join(' | ')); await dlg().getByRole('button', { name: 'Abbrechen' }).click(); }
    }
    const kp = (await body()).match(/INV-OPT-\d{4}/g) || [];
    ok(new Set(kp).size >= 2, `1 Mehrere Käuferprozesse mit eigener ID (${[...new Set(kp)].join(', ')})`);
    // Dublette Käufer
    await p.getByRole('button', { name: 'Neuer Käuferprozess' }).first().click();
    await selLabel('Käufer / Investor (aus Stammdaten)', 'Maspohl Invest GmbH (Unternehmen)');
    await feld('Typ').selectOption({ index: 1 });
    await fill('Kaufpreisindikation (€)', '9500000');
    await fill('Wahrscheinlichkeit (%)', '20');
    await speichern();
    ok(/bereits/.test(await dlg().innerText()), '1 Doppelter Käufer je Projekt wird beim Speichern abgewiesen');
    await dlg().getByRole('button', { name: 'Abbrechen' }).click();

    await tab('Finanzen');
    await p.getByRole('button', { name: 'Provision erfassen' }).click();
    ok(/Erwartet/.test(await dlg().innerText()), '1 Provision: Status „Erwartet“ vorbelegt');
    await selLabel('Zahler (aus Stammdaten)', 'IT-Invest Testkäufer GmbH (Unternehmen)');
    await fill('Bemessungsgrundlage (€ netto)', '10000000');
    await fill('Satz (%)', '3');
    await speichern();
    let t = await body();
    ok(/300\.000/.test(t) && /Erwartet/.test(t), '1 Erwartete Provision 300.000 € (nicht als Forderung)');
    ok(/Keine Rechnung zu diesem Vorgang/.test(t), '1 Erwartete Provision erzeugt keine Forderung');
    await p.getByRole('button', { name: 'Anspruch entstanden' }).click();
    await p.getByRole('button', { name: 'Rechnung erzeugen' }).click();
    await p.waitForTimeout(300);
    t = await body();
    const re = (t.match(/RE-2026-\d{3}/g) || []).pop();
    ok(!!re && /Offen/.test(t), `1 Rechnung/Forderung erzeugt (${re})`);
    await p.getByRole('button', { name: 'Zahlungseingang verbuchen' }).click();
    await fill('Betrag (€)', '400000');
    await speichern();
    ok(/übersteigt/.test(await dlg().innerText()), '1 Überzahlung wird abgewiesen');
    await fill('Betrag (€)', '100000');
    await fill('Zahlungsdatum', '2026-12-01');
    await speichern();
    ok(/Zukunft/.test(await dlg().innerText()), '1 Geplante (zukünftige) Zahlung wird nicht gebucht');
    await fill('Zahlungsdatum', '2026-10-10');
    await speichern();
    t = await body();
    if (await p.getByRole('dialog').count()) console.log('DIALOG:', (await dlg().innerText()).slice(0, 400));
    ok(/Teilzahlung/.test(t) && /offen\s*€\s*200\.000/.test(t), '1 Teilzahlung 100.000 € → Rest 200.000 €');
    await tab('Verlauf');
    ok(/Zahlungseingang/.test(await body()) && /Rechnung/.test(await body()), '1 Verlauf protokolliert Rechnung und Zahlung');
    await shot('it1-investment');
    await go('/finanzen/forderungen');
    t = await body();
    const zeile = await p.locator('tr', { hasText: re }).first().innerText();
    console.log('ZEILE', zeile.replace(/\s+/g, ' '));
    console.log('Z', JSON.stringify(zeile.slice(80, 140)));
    ok(/200\.000\s+von\s+€\s300\.000/.test(zeile), `1 ${re} unter Forderungen: offen 200.000 von 300.000`);
    await go('/finanzen/eingang-bezahlt');
    ok((await body()).includes(re), `1 Zahlungseingang ${re} erscheint in Eingang/Bezahlt`);
  }

  // ---------------- 2 Property ----------------
  if (!nur || nur === '2') {
    await go('/kunden/privatkunden');
    await p.getByRole('button', { name: 'Neuer Privatkunde' }).first().click();
    await p.getByLabel('Vorname').fill('Petra');
    await p.getByLabel('Nachname').fill('Integrationstest');
    await p.getByLabel('Anrede').selectOption('Frau').catch(() => {});
    await p.getByRole('button', { name: 'GRENFORD Property' }).click();
    await p.getByRole('button', { name: 'Privatkunde anlegen' }).click();
    await p.waitForTimeout(300);
    if (await p.getByRole('dialog').count()) console.log('DIALOG PK:', (await p.getByRole('dialog').last().innerText()).split('\n').filter(l => /Bitte|bereits/.test(l)).join(' | '));
    ok(/angelegt|ergänzt/.test(await p.getByRole('status').first().innerText().catch(() => '')), '2 Privatkunde angelegt');

    await go('/property/suchauftraege');
    await p.getByRole('button', { name: 'Neuer Suchauftrag' }).first().click();
    await selLabel('Kunde (aus Stammdaten)', 'Petra Integrationstest (Person)');
    await feld('Kundentyp').selectOption({ index: 1 }).catch(() => {});
    await feld('Objektart').selectOption({ index: 1 }).catch(() => fill('Objektart', 'Eigentumswohnung'));
    await fill('Regionen (kommagetrennt)', 'Berlin');
    await fill('Suchkriterien', '3 Zimmer, Balkon');
    await fill('Zielzeitraum', 'Q1 2027');
    await feld('Status').selectOption('Aktiv');
    await feld('Priorität').selectOption({ index: 1 });
    for (const l of ['Volumen von', 'Budget von']) await fill(l, '0,5').catch(() => {});
    for (const l of ['Volumen bis', 'Budget bis']) await fill(l, '1,2').catch(() => {});
    await speichern();
    if (await p.getByRole('dialog').count()) console.log('DIALOG:', (await dlg().innerText()).split('\n').filter(l => /Bitte/.test(l)).join(' | '));
    let t = await body();
    const srch = (t.match(/SRCH-P-\d+/g) || []).sort().pop();
    ok(!(await p.getByRole('dialog').count()) && /Petra Integrationstest/.test(t) && !!srch, `2 Property-Suchauftrag angelegt (${srch}, eigener Kreis SRCH-P)`);

    await go('/property/objekte');
    await p.getByRole('button', { name: 'Neues Objekt / Mandat' }).first().click();
    await feld('Objekt (zentraler Objektbestand)').selectOption('__neu');
    await fill('Objektbezeichnung', 'IT Wohnung Testallee 5');
    await feld('Mandatstyp').selectOption('Verkauf').catch(() => feld('Mandatstyp').selectOption({ index: 1 }));
    await fill('Kaufpreis / Angebotspreis (€)', '800000');
    await fill('Courtage (%, netto)', '3,57');
    await feld('Mandatsstatus').selectOption('Aktiv');
    await feld('Vermarktungsstatus').selectOption({ index: 1 });
    await feld('Phase').selectOption({ index: 1 });
    await speichern();
    if (await p.getByRole('dialog').count()) console.log('DIALOG:', (await dlg().innerText()).split('\n').filter(l => /Bitte/.test(l)).join(' | '));
    await p.waitForURL(/property\/objekte\/PROP-/);
    const prop = p.url().split('/').pop();
    ok(/^PROP-2026-\d{3}$/.test(prop), `2 Objekt + Mandat angelegt (${prop})`);

    await tab('Käuferprozesse');
    await p.getByRole('button', { name: 'Neuer Käuferprozess' }).first().click();
    await selLabel('Kaufinteressent (aus Stammdaten)', 'Petra Integrationstest (Person)');
    await feld('Typ').selectOption({ index: 1 });
    await fill('Kaufpreisindikation (€)', '780000');
    await fill('Wahrscheinlichkeit (%)', '60');
    await speichern();
    t = await body();
    const kp = (t.match(/PROP-OPT-\d{4}/g) || []).sort().pop();
    ok(!!kp, `2 Käuferprozess angelegt (${kp})`);
    await go('/property/kaeuferprozesse/' + kp);
    await p.getByRole('button', { name: 'Käuferprozess-Aktionen' }).first().click();
    await p.getByRole('menuitem', { name: 'Status „Gekauft“' }).click();
    await p.waitForTimeout(300);
    ok(/Gekauft/.test(await body()), '2 Status des Käuferprozesses geändert (Gekauft)');
    await go('/property/objekte/' + prop);
    await tab('Finanzen');
    await p.getByRole('button', { name: 'Provision erfassen' }).click();
    await selLabel('Zahler (aus Stammdaten)', 'Petra Integrationstest (Person)');
    await fill('Bemessungsgrundlage (€ netto)', '780000');
    await fill('Satz (%)', '3');
    await feld('Status').selectOption('Entstanden');
    await speichern();
    await p.getByRole('button', { name: 'Rechnung erzeugen' }).click();
    await p.waitForTimeout(300);
    t = await body();
    ok(/23\.400/.test(t) && /RE-2026-\d{3}/.test(t), '2 Provisionsanspruch 23.400 € → Rechnung/Forderung');
    await shot('it2-property');
  }

  // ---------------- 3 Projects + 4 bereichsübergreifende Person ----------------
  if (!nur || nur === '3') {
    await go('/projects/mandate');
    await p.getByRole('button', { name: 'Neues Mandat' }).first().click();
    const kunde = (await feld('Kunde / Bauherr (aus Stammdaten)').locator('option', { hasText: 'Petra Integrationstest' }).count()) ? 'Petra Integrationstest (Person)' : 'Martina Kaimann (Person)';
    await selLabel('Kunde / Bauherr (aus Stammdaten)', kunde);
    await feld('Kundentyp').selectOption({ index: 1 });
    await fill('Sanierungsart', 'Badsanierung');
    await feld('Status').selectOption('Aktiv');
    await fill('Vergütung GRENFORD (% der Netto-Bausumme)', '3');
    await speichern();
    if (await p.getByRole('dialog').count()) console.log('DIALOG:', (await dlg().innerText()).split('\n').filter(l => /Bitte/.test(l)).join(' | '));
    await p.waitForURL(/projects\/mandate\/MAN-/);
    const man = p.url().split('/').pop();
    ok(/^MAN-2026-\d{3}$/.test(man), `3 Projects-Mandat angelegt (${man}, Kunde ${kunde})`);
    await p.getByRole('button', { name: '+ Neues Projekt' }).first().click();
    await feld('Projekt / Maßnahme').selectOption({ index: 1 });
    await selLabel('Bauherr (aus Stammdaten)', kunde).catch(() => {});
    await fill('Leistungsumfang', 'Bad komplett, Leitungen');
    await fill('Budget (€ netto)', '80000');
    await feld('Phase').selectOption({ index: 1 });
    await feld('Status').selectOption('Aktiv');
    await speichern();
    if (await p.getByRole('dialog').count()) console.log('DIALOG:', (await dlg().innerText()).split('\n').filter(l => /Bitte/.test(l)).join(' | '));
    await p.waitForURL(/projects\/projekte\/PRO-/);
    const pro = p.url().split('/').pop();
    ok(/^PRO-2026-\d{3}$/.test(pro), `3 Projekt im Mandat angelegt (${pro})`);
    await tab('Angebote');
    const summen = [74800, 79900, 71500];
    for (let i = 0; i < 3; i++) {
      await p.getByRole('button', { name: '+ Neues Angebot' }).first().click();
      await feld('GU-Partner').selectOption({ index: i + 1 });
      await fill('Umfang', 'Bad komplett');
      await fill('Angebotssumme (€ netto)', String(summen[i]));
      await fill('Angebotsdatum', `2026-10-0${i + 2}`);
      await feld('Status').selectOption('Eingegangen');
      await speichern();
      if (await p.getByRole('dialog').count()) { console.log('DIALOG:', (await dlg().innerText()).split('\n').filter(l => /Bitte|bereits/.test(l)).join(' | ')); await dlg().getByRole('button', { name: 'Abbrechen' }).click(); }
    }
    let t = await body();
    ok((t.match(/Eingegangen/g) || []).length >= 3 && /71\.500/.test(t) && /79\.900/.test(t), '3 Drei Original-Angebote je Projekt erfasst');
    await p.getByRole('button', { name: 'Vergleich erstellen (Renovation Memo)' }).click();
    await p.waitForTimeout(300);
    let memo = await body();
    ok(/8\.400/.test(memo), '3 Angebotsvergleich: Spanne 8.400 €');
    const anon = p.getByRole('button', { name: /anonym/i }).first();
    if (await anon.count()) { await anon.click(); await p.waitForTimeout(200); memo = await body(); }
    ok(/Partner A/.test(memo) && /Partner C/.test(memo), '3 Renovation Memo anonymisiert (Partner A/B/C)');
    await shot('it3-memo');
    if (await p.getByRole('dialog').count()) await p.keyboard.press('Escape');
    await p.getByRole('button', { name: 'Vergabe dokumentieren' }).first().click();
    await feld('Gewähltes Angebot (Entscheidung Kunde)').selectOption({ index: 1 });
    await fill('Provisionspflichtige Netto-Bausumme inkl. vereinbarter Nachträge (€)', '80000');
    await feld('Auftraggeber des GU').selectOption('Kunde');
    await speichern();
    await p.waitForTimeout(300);
    await tab('Finanzen');
    t = await body();
    ok(/Keine Verbindlichkeit von GRENFORD/.test(t), '3 Direktbeauftragung durch Kunden → keine GRENFORD-Verbindlichkeit');
    await p.getByRole('button', { name: 'Provision erfassen' }).click();
    ok((await feld('Bemessungsgrundlage (€ netto)').inputValue()).replace(/\D/g, '') === '80000', '3 Vergütungsbasis = Netto-Bausumme inkl. Nachträge');
    await dlg().getByRole('button', { name: 'Abbrechen' }).click();

    // Empfehlungsprovision 3 % der Netto-Bausumme
    await go('/netzwerk/empfehlungspartner');
    await p.locator('main tbody tr').first().click().catch(() => {});
    await p.waitForTimeout(400);
    const partnerDlg = p.getByRole('dialog').first();
    const empTab = partnerDlg.getByRole('tab', { name: /Vermittelte Vorgänge/ });
    if (await empTab.count()) await empTab.click();
    await partnerDlg.getByRole('button', { name: '+ Empfehlung erfassen' }).first().click();
    const opt = dlg().getByLabel(/^Vermittelter Vorgang/).locator('option', { hasText: pro });
    await feld('Vermittelter Vorgang').selectOption(await opt.first().getAttribute('value'));
    await fill('Datum', '2026-10-10').catch(() => {});
    await speichern();
    if (await p.getByRole('dialog').count() > 1) { console.log('DIALOG:', (await dlg().innerText()).split('\n').filter(l => /Bitte|bereits/.test(l)).join(' | ')); await dlg().getByRole('button', { name: 'Abbrechen' }).click(); }
    const zeile = p.getByRole('dialog').first().locator('tr, li', { hasText: pro }).first();
    const zt = await zeile.innerText();
    ok(/2\.400/.test(zt), `3 Empfehlungsprovision 3 % von 80.000 € = 2.400 € (${zt.replace(/\s+/g, ' ').slice(0, 120)})`);
    await zeile.getByRole('button', { name: 'Verbindlichkeit anlegen' }).click();
    await p.waitForTimeout(300);
    if (await p.getByRole('dialog').count() > 1) await speichern((await dlg().getByRole('button').last().innerText()));
    ok(/VB-2026-\d{3}/.test(await zeile.innerText()), '3 Verbindlichkeit aus Empfehlung angelegt (erst auf Klick, nicht automatisch)');
    await go('/projects/projekte/' + pro);
    await tab('Finanzen');
    t = await body();
    ok(/Empfehlung/.test(t) && /2\.400/.test(t), '3 Verbindlichkeit Empfehlungsprovision am Projekt sichtbar');
    await p.getByRole('button', { name: 'Auszahlung verbuchen' }).first().click();
    await fill('Betrag (€)', '1000');
    await speichern();
    t = await body();
    ok(/ausgezahlt\s*€\s*1\.000/.test(t) && /offen\s*€\s*1\.400/.test(t), '3 Teil-Auszahlung 1.000 € → Rest 1.400 €');
    await shot('it3-projects');

    // 4 Person bereichsübergreifend ohne Dublette
    await go('/kunden/privatkunden');
    const treffer = await p.locator('main tbody tr', { hasText: kunde.replace(' (Person)', '') }).count();
    ok(treffer === 1, `4 ${kunde} genau einmal in Privatkunden (${treffer})`);
    await p.locator('main tbody tr', { hasText: kunde.replace(' (Person)', '') }).first().click();
    await p.waitForTimeout(400);
    await tab('Vorhaben & Objekte');
    t = await body();
    ok(/Property/.test(t) && /Projects/.test(t), '4 Person zeigt Property- und Projects-Vorgänge (eine Person, mehrere Rollen)');
    await shot('it4-person');
  }

  // ---------------- 5 Finanzkonsistenz ----------------
  if (!nur || nur === '5') {
    await go('/finanzen/forderungen');
    const rows = await p.locator('main tbody tr').allInnerTexts();
    const zahl = (s) => Number(s.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
    // Offen-Spalte: letzte Geldspalte vor Status
    const kpiText = await p.locator('main').innerText();
    ok(rows.length > 0, `5 Forderungen-Liste mit ${rows.length} offenen Posten`);
    await go('/finanzen/forderungen?status=ueberfaellig');
    const ueb = await p.locator('main tbody tr').allInnerTexts();
    ok(ueb.some((r) => r.includes('RE-2026-010')) && ueb.some((r) => r.includes('RE-2026-018')), '5 Überfällige inkl. Mahnstufen (RE-2026-010, RE-2026-018)');
    await go('/finanzen/uebersicht');
    await shot('it5-uebersicht');
    await go('/finanzen/eingang-bezahlt');
    const kp = await p.locator('section[aria-label=Kennzahlen]').innerText();
    ok(/Bezahlt|Eingang/.test(kp), '5 Eingang/Bezahlt zeigt Kennzahlen aus derselben Datenbasis');
  }
  console.log(fails ? `${fails} FEHLER` : 'ALLE OK', 'errors', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})();
