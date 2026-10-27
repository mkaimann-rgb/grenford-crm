// GRENFORD / Bewertung und Suchprofile: mehrstufige Formulare mit Kacheln und Reglern.
// Nutzt aus ux.js: sendRequest(), showSuccess(), showFallback(), looksAutomated(), clearErrors(), fail(), firstInvalid(), invalidMessage().
// Kein Versand vor ausdrücklichem Absenden im letzten Schritt.
const reduceMotionWz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reiter (Verkaufen / Kaufen, Property / Projects / Investment)
document.querySelectorAll('[data-wz-tabs]').forEach(list => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      select(tabs[(i + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
    });
  });
});

// Links und Buttons mit data-wz-open="property-search" öffnen den passenden Reiter und scrollen hin.
function openWizard(key, smooth) {
  const form = document.getElementById('wz-' + key);
  if (!form) return false;
  const tab = document.getElementById('tab-' + key);
  if (tab) tab.click();
  (form.closest('section') || form).scrollIntoView({ behavior: smooth && !reduceMotionWz ? 'smooth' : 'auto', block: 'start' });
  return true;
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-wz-open]');
  if (trigger && openWizard(trigger.dataset.wzOpen, true)) event.preventDefault();
});
// Sprung von anderen Seiten oder aus dem Menü: #bewertung-property-search
const openFromHash = smooth => {
  const match = location.hash.match(/^#bewertung-(.+)$/);
  if (match) openWizard(match[1], smooth);
};
openFromHash(false);
window.addEventListener('hashchange', () => openFromHash(true));

document.querySelectorAll('form[data-wizard]').forEach(form => {
  const steps = [...form.querySelectorAll('[data-step]')];
  const next = form.querySelector('[data-next]'), back = form.querySelector('[data-back]');
  const bar = form.querySelector('.wizard-progress span'), count = form.querySelector('.wizard-count');
  const error = form.querySelector('.wizard-error'), result = form.querySelector('.wizard-result');
  let current = 0, sending = false, sent = false;

  const checked = name => [...form.querySelectorAll('input:checked')].filter(input => input.name === name).map(input => input.value);
  // data-if="Objektart=Haus|Grundstück" oder "Objektart!=Grundstück"
  const applies = step => {
    const rule = step.dataset.if;
    if (!rule) return true;
    const negate = rule.includes('!=');
    const [name, values] = rule.split(negate ? '!=' : '=');
    const hit = checked(name).some(value => values.split('|').includes(value));
    return negate ? !hit : hit;
  };
  const active = () => steps.filter(applies);

  function show(focus) {
    const list = active();
    current = Math.min(current, list.length - 1);
    const step = list[current], last = current === list.length - 1;
    steps.forEach(s => { s.hidden = s !== step; });
    back.hidden = current === 0;
    next.innerHTML = (last ? form.dataset.submit + ' <span aria-hidden="true">↗</span>' : 'Weiter <span aria-hidden="true">→</span>');
    bar.style.width = ((current + 1) / list.length * 100) + '%';
    count.textContent = 'Schritt ' + (current + 1) + ' von ' + list.length;
    clearErrors(form, error);
    if (focus) {
      step.querySelector('legend').focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) form.scrollIntoView({ behavior: reduceMotionWz ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function validate(step) {
    clearErrors(form, error);
    for (const group of step.querySelectorAll('[data-required-group]')) {
      if (!checked(group.dataset.requiredGroup).length) return fail(group.querySelector('input'), error, 'Bitte wählen Sie eine Option.');
    }
    const bad = firstInvalid(step);
    if (bad) return fail(bad, error, bad.type === 'checkbox' ? 'Bitte bestätigen Sie die Einwilligung.' : invalidMessage(bad));
    return true;
  }

  // Zusammenfassung aller beantworteten Schritte für die Nachricht ans CRM
  function summary() {
    const rows = [];
    active().filter(step => !step.hasAttribute('data-contact')).forEach(step => {
      step.querySelectorAll('[data-row]').forEach(row => {
        const inputs = [...row.querySelectorAll('input[name],textarea[name]')];
        if (!inputs.length) return;
        const choice = inputs[0].type === 'radio' || inputs[0].type === 'checkbox';
        const value = choice ? checked(inputs[0].name).join(', ') : inputs.map(input => input.value.trim()).filter(Boolean).join(' · ');
        if (value) rows.push(row.dataset.row + ': ' + value + (row.dataset.unit && !choice ? ' ' + row.dataset.unit : ''));
      });
    });
    return rows;
  }

  // Regler und Zahlenfeld synchron halten
  form.querySelectorAll('input[type="range"][data-sync]').forEach(range => {
    const number = document.getElementById(range.dataset.sync);
    range.addEventListener('input', () => { number.value = range.value; number.removeAttribute('aria-invalid'); });
    number.addEventListener('input', () => { if (number.value !== '') range.value = number.value; });
  });
  form.querySelectorAll('[data-step-by]').forEach(button => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', () => {
      const value = (parseInt(input.value, 10) || 0) + Number(button.dataset.stepBy);
      input.value = Math.max(Number(input.min), Math.min(Number(input.max), value));
    });
  });
  form.addEventListener('input', event => { event.target.removeAttribute('aria-invalid'); error.textContent = ''; });

  async function submit() {
    if (sending || sent) return;
    const field = name => ((form.elements.namedItem(name) || {}).value || '').trim();
    const extra = [['Unternehmen', field('Unternehmen')], ['Rolle', checked('Rolle').join('')], ['Nachricht', field('Nachricht')]]
      .filter(pair => pair[1]).map(pair => pair[0] + ': ' + pair[1]);
    const data = {
      name: field('Name'), email: field('Email'), phone: field('Telefon'), subject: form.dataset.subject,
      message: form.dataset.title + '\n\n' + summary().concat(extra).join('\n') + '\nBevorzugter Kontakt: ' + checked('Kontaktweg').join('')
    };
    const finish = () => {
      sent = true;
      steps.forEach(s => { s.hidden = true; });
      form.querySelector('.wizard-actions').hidden = true;
      bar.style.width = '100%';
      count.textContent = 'Übermittelt';
      showSuccess(result, form.dataset.success);
    };
    if (looksAutomated(form)) { finish(); return; }
    sending = true; next.disabled = true; back.disabled = true;
    next.textContent = 'Wird übermittelt …';
    try {
      await sendRequest(data);
      finish();
    } catch (e) {
      showFallback(result, data, e && e.message);
    } finally {
      sending = false;
      if (!sent) { next.disabled = false; back.disabled = false; show(false); }
    }
  }

  next.addEventListener('click', () => {
    const list = active();
    if (!validate(list[current])) return;
    if (current === list.length - 1) { submit(); return; }
    current += 1;
    show(true);
  });
  back.addEventListener('click', () => { current = Math.max(0, current - 1); show(true); });
  // Enter im Feld = Weiter, nie ein nativer Versand
  form.addEventListener('submit', event => { event.preventDefault(); next.click(); });
  show(false);
});

// Dezente Leiste "Was ist Ihre Immobilie wert?" – erscheint nach dem Hero, nicht über Formularen, schließbar.
const valueBar = document.querySelector('[data-value-bar]');
if (valueBar) {
  let closed = false;
  try { closed = sessionStorage.getItem('gf-value-bar') === 'closed'; } catch (e) { /* ohne Speicher einfach anzeigen */ }
  const busy = new Set();
  const update = () => {
    const show = !closed && !document.body.classList.contains('hero-in-view') && busy.size === 0;
    valueBar.hidden = !show;
    document.body.classList.toggle('value-bar-on', show);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? busy.add(entry.target) : busy.delete(entry.target));
      update();
    }, { rootMargin: '-20% 0px -20% 0px' });  // nur Abschnitte, die wirklich im Blick sind
    document.querySelectorAll('.valuation, .strategic-inquiry, .ux-contact, .site-footer, .valuation-teaser').forEach(node => io.observe(node));
    new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  valueBar.querySelector('[data-value-bar-close]').addEventListener('click', () => {
    closed = true;
    try { sessionStorage.setItem('gf-value-bar', 'closed'); } catch (e) { /* nur für diese Ansicht */ }
    update();
  });
  update();
}

// Ablauf 01/04 auf der Bewertungsseite: Schritte mit Pfeilen durchblättern
document.querySelectorAll('[data-slides]').forEach(box => {
  const slides = [...box.querySelectorAll('[data-slide]')];
  const num = box.querySelector('[data-slide-num]');
  let i = 0;
  const go = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { s.hidden = k !== i; });
    num.textContent = String(i + 1).padStart(2, '0');
  };
  box.querySelector('[data-slide-prev]').addEventListener('click', () => go(i - 1));
  box.querySelector('[data-slide-next]').addEventListener('click', () => go(i + 1));
  box.classList.add('is-enhanced');
  go(0);
});
