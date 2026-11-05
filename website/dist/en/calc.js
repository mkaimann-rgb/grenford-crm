// GRENFORD / Rechner auf der Wertermittlungsseite (Wohnungswert, Sanierungskosten, Fix & Flip).
// Rechnet nur im Browser, sendet nichts. Alle Annahmen kommen aus dem HTML (calculators.py) und sind dort sichtbar.

(function () {
  const eur = n => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
  const pct = n => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(n) + '%';
  const round = (n, step) => Math.round(n / step) * step;
  const num = (form, name) => { const v = parseFloat((form.elements.namedItem(name) || {}).value); return isFinite(v) ? v : 0; };
  const steps = (box, rows) => {
    box.replaceChildren(...rows.flatMap(([a, b, cls]) => {
      const dt = document.createElement('dt'); dt.textContent = a;
      const dd = document.createElement('dd'); dd.textContent = b;
      if (cls) { dt.className = cls; dd.className = cls; }
      return [dt, dd];
    }));
  };

  const calcs = {
    wohnwert(form) {
      const area = num(form, 'ww-flaeche'), base = num(form, 'ww-basis');
      const lage = num(form, 'ww-lage'), zustand = num(form, 'ww-zustand');
      const extras = [...form.querySelectorAll('input[data-pct]:checked')].reduce((s, i) => s + parseFloat(i.dataset.pct), 0);
      const perm2 = base * (1 + lage / 100) * (1 + zustand / 100) * (1 + extras / 100);
      const value = perm2 * area, spread = 0.1;
      const out = n => form.querySelector(`[data-out="${n}"]`);
      out('range').textContent = area > 0 && base > 0 ? `${eur(round(value * (1 - spread), 5000))} – ${eur(round(value * (1 + spread), 5000))}` : '–';
      out('perm2').textContent = area > 0 ? `approx. ${eur(perm2)} per m² of living area` : '';
      steps(out('steps'), [['Base price', eur(base) + '/m²'], ['Location', (lage > 0 ? '+' : '') + pct(lage)], ['Condition', (zustand > 0 ? '+' : '') + pct(zustand)],
        ['Specification', '+' + pct(extras)], ['× living area', area + 'm²'], ['Mid value', eur(round(value, 1000)), 'is-sum']]);
    },

    sanierung(form) {
      const area = num(form, 'sa-flaeche'), factor = num(form, 'sa-standard');
      const [plLo, plHi] = form.dataset.planung.split(',').map(Number), puffer = Number(form.dataset.puffer);
      let lo = 0, hi = 0;
      const rows = [];
      form.querySelectorAll('input[data-lo]:not([data-item]):checked').forEach(i => {
        lo += i.dataset.lo * area; hi += i.dataset.hi * area;
      });
      form.querySelectorAll('input[data-item]').forEach(i => {
        const n = Math.max(0, parseFloat(i.value) || 0);
        lo += i.dataset.lo * n; hi += i.dataset.hi * n;
      });
      lo *= factor; hi *= factor;
      rows.push(['Works', `${eur(lo)} – ${eur(hi)}`]);
      const loPl = lo * plLo / 100, hiPl = hi * plHi / 100;
      rows.push([`Planning, ancillary costs (${plLo}–${plHi}%)`, `${eur(loPl)} – ${eur(hiPl)}`]);
      const loP = (lo + loPl) * puffer / 100, hiP = (hi + hiPl) * puffer / 100;
      rows.push([`Buffer (${puffer}%)`, `${eur(loP)} – ${eur(hiP)}`]);
      const tLo = lo + loPl + loP, tHi = hi + hiPl + hiP;
      rows.push(['Total', `${eur(round(tLo, 1000))} – ${eur(round(tHi, 1000))}`, 'is-sum']);
      const out = n => form.querySelector(`[data-out="${n}"]`);
      out('range').textContent = tHi > 0 ? `${eur(round(tLo, 1000))} – ${eur(round(tHi, 1000))}` : 'Please select works';
      out('perm2').textContent = tHi > 0 && area > 0 ? `approx. ${eur(tLo / area)} – ${eur(tHi / area)} per m² of living area` : '';
      steps(out('steps'), rows);
    },

    flip(form) {
      const v = k => num(form, 'fl-' + k);
      const kauf = v('kauf'), nk = kauf * v('nk') / 100, san = v('san'), monate = Math.max(1, v('monate'));
      const invest = kauf + nk + san;
      const fremd = invest * (1 - v('ek') / 100);
      const zinsen = fremd * v('zins') / 100 * monate / 12;
      const laufend = v('laufend') * monate;
      const vk = v('vk'), vkk = vk * v('vkk') / 100;
      const kosten = invest + zinsen + laufend;
      const gewinn = vk - vkk - kosten;
      const ekEinsatz = invest * v('ek') / 100 + zinsen + laufend;
      const rGesamt = kosten > 0 ? gewinn / kosten * 100 : 0;
      const rEk = ekEinsatz > 0 ? gewinn / ekEinsatz * 100 : 0;
      const rEkJahr = ekEinsatz > 0 && gewinn > -ekEinsatz ? (Math.pow(1 + gewinn / ekEinsatz, 12 / monate) - 1) * 100 : 0;
      const breakEven = kosten / (1 - v('vkk') / 100);
      const out = n => form.querySelector(`[data-out="${n}"]`);
      out('profit').textContent = eur(gewinn);
      out('profit').classList.toggle('is-negative', gewinn < 0);
      out('roi').textContent = `${pct(rEk)} on equity, ${pct(rEkJahr)} per year`;
      steps(out('steps'), [['Purchase price', eur(kauf)], ['Purchase costs', eur(nk)], ['Renovation', eur(san)], ['Financing costs', eur(zinsen)],
        ['Running costs', eur(laufend)], ['Total costs', eur(kosten), 'is-sum'], ['Sale price less selling costs', eur(vk - vkk)],
        ['Return on total costs', pct(rGesamt)], ['Equity invested', eur(ekEinsatz)], ['Break-even sale price', eur(round(breakEven, 1000))]]);
    }
  };

  document.querySelectorAll('form.calc').forEach(form => {
    const run = () => calcs[form.dataset.calc](form);
    form.addEventListener('input', run);
    form.addEventListener('change', run);
    form.addEventListener('submit', e => e.preventDefault());
    run();
  });

  // Umschalter zwischen den Rechnern (Pfeiltasten wie bei Tabs üblich)
  const tabs = [...document.querySelectorAll('[data-calc-tab]')];
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next); next.focus();
    });
  });
  // Direkter Sprung zu einem Rechner, z. B. #rechner-sanierung
  const m = location.hash.match(/^#rechner-(wohnwert|sanierung|flip)$/);
  if (m) { const t = tabs.find(x => x.dataset.calcTab === m[1]); if (t) { select(t); document.getElementById('rechner').scrollIntoView(); } }
})();
