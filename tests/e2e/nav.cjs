const { chromium } = require('playwright');
const routes = process.argv.slice(2);
const sizes = [[1536,1024],[1440,900],[1280,800],[820,1180],[390,844]];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const probleme = [];
  for (const [w,h] of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    let errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,160)); });
    p.on('pageerror', e => errs.push(String(e).slice(0,160)));
    for (const r of routes) {
      errs = [];
      const res = await p.goto('http://127.0.0.1:3000' + r, { waitUntil: 'networkidle' });
      await p.waitForTimeout(150);
      const info = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, txt: document.body.innerText }));
      const prob = [];
      if (res.status() >= 400) prob.push('HTTP ' + res.status());
      if (info.sw > info.cw + 1) prob.push(`overflow ${info.sw}>${info.cw}`);
      if (/in Vorbereitung|nicht gefunden/i.test(info.txt) && !r.includes('gibtsnicht')) prob.push('Platzhalter/nicht gefunden');
      if (errs.length) prob.push('console: ' + errs.join(' | '));
      if (prob.length) probleme.push(`${w} ${r}: ${prob.join('; ')}`);
    }
    await p.close();
  }
  console.log(probleme.length ? probleme.join('\n') : 'ALLE OK');
  await b.close();
})();
