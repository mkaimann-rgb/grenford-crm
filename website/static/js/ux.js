// GRENFORD / Formulare: Projektanfrage in sechs Schritten, Kurznachricht, Karte, Kontaktleiste.
//
// Teil 1 (bis zur Formular-Konstante "strategic") ist DOM-frei und wird von tests/transport.mjs geprüft.
// Endpunkt: <meta name="grenford-form-endpoint"> aus site.json "formEndpoint".
// Leer = keine Online-Übermittlung; die Formulare bieten dann den Versand per E-Mail an.

var FORM_ENDPOINT = globalThis.GRENFORD_FORM_ENDPOINT || '/api/anfrage';
var FORM_TIMEOUT = 15000;

function splitName(name) {
  var parts = String(name || '').trim().split(/\s+/);
  return [parts.shift() || '', parts.join(' ')];
}

// Überträgt eine Anfrage im bisherigen CRM-Schema (fields + context). Wirft bei HTTP-Fehler und Netzwerkfehler.
async function sendRequest(data) {
  if (!FORM_ENDPOINT) throw new Error('no-endpoint');
  var name = splitName(data.name);
  var fields = [['firstname', name[0]], ['lastname', name[1]], ['email', data.email], ['phone', data.phone || ''],
    ['subject', data.subject || 'general'], ['message', data.message || ''], ['brand', 'grenford']]
    .map(function (pair) { return { name: pair[0], value: String(pair[1] == null ? '' : pair[1]) }; });
  var payload = { fields: fields, context: { pageUri: String(location.href).split('#')[0], pageName: document.title } };
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, FORM_TIMEOUT);
  try {
    var response = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
    if (!response.ok) throw new Error('status ' + response.status);
    return response;
  } finally {
    clearTimeout(timer);
  }
}

const strategic=document.getElementById('strategic-form');
const quick = document.getElementById('quick-contact');
const reduceMotionUx = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const endpointMeta = document.querySelector('meta[name="grenford-form-endpoint"]');
if (endpointMeta) FORM_ENDPOINT = endpointMeta.content.trim();
const MAIL = (document.querySelector('meta[name="grenford-email"]') || {}).content || 'kontakt@grenford.de';
const MIN_FILL_MS = 3000;

const LABEL = { investment: 'Investment', property: 'Property', projects: 'Projects' };
const SUBJECT = { investment: 'investment', property: 'property', projects: 'renovation' };
const CONTEXT_TEXT = {
  '': { legend: 'Asset-Klasse', question: 'Wählen Sie oben Ihren Bereich. Danach erscheinen die passenden Optionen.', budget: 'Budget / Preisrahmen (optional)' },
  investment: { legend: 'Asset-Klasse', question: 'Um welche Art von Immobilie handelt es sich bei der geplanten Transaktion?', budget: 'Budget / Volumen (optional)', title: 'Investment Memo anfragen.' },
  property: { legend: 'Immobilienart', question: 'Um welche Immobilie geht es?', budget: 'Preisrahmen (optional)', title: 'Property Brief anfragen.' },
  projects: { legend: 'Art des Vorhabens', question: 'Welches Objekt oder welchen Raum möchten Sie verändern?', budget: 'Budgetrahmen (optional)', title: 'Renovation Memo anfragen.' }
};
const INTENT = {
  'investment-search': ['investment', 'Suchprofil im Kundenauftrag'],
  'investment-offer': ['investment', 'Immobilie / Portfolio verkaufen'],
  'investment-interest': ['investment', 'Investment Memo / Objektinformationen'],
  'property-sell': ['property', 'Immobilie verkaufen'],
  'property-buy': ['property', 'Kaufinteresse / Property Brief'],
  'projects': ['projects', 'Sanierung / Innenumbau planen']
};

// ---------------------------------------------------------------- Hilfen

const el = (tag, props, children) => {
  const node = Object.assign(document.createElement(tag), props || {});
  (children || []).forEach(child => node.append(child));
  return node;
};
const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const scrollTo = node => node.scrollIntoView({ behavior: reduceMotionUx ? 'auto' : 'smooth', block: 'start' });

function stamp(form) {
  const started = form && form.querySelector('[name="started"]');
  if (started) started.value = String(Date.now());
}
function looksAutomated(form) {
  const trap = form.querySelector('[name="website"]'), started = Number((form.querySelector('[name="started"]') || {}).value);
  return (trap && trap.value) || (started && Date.now() - started < MIN_FILL_MS);
}
function clearErrors(form, box) {
  form.querySelectorAll('[aria-invalid]').forEach(field => { field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby'); });
  box.textContent = '';
}
function fail(field, box, message) {
  box.textContent = message;
  if (field) { field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', box.id); field.focus(); }
  return false;
}

// Ergebnis anzeigen: Erfolg oder E-Mail-Alternative mit vorbereitetem Text.
function showSuccess(result, text) {
  result.replaceChildren(el('p', { textContent: text }));
  result.focus();
}
function showFallback(result, subject, body, reason) {
  const intro = reason === 'no-endpoint'
    ? 'Die Online-Übermittlung ist hier nicht eingerichtet. Bitte senden Sie Ihre Anfrage per E-Mail an'
    : 'Ihre Anfrage konnte gerade nicht übertragen werden. Ihre Eingaben sind nicht verloren. Bitte senden Sie sie per E-Mail an';
  const text = el('textarea', { readOnly: true, value: body, id: result.id + '-text' });
  text.setAttribute('aria-label', 'Vorbereiteter Text Ihrer Anfrage');
  const mail = el('a', { className: 'text-link', href: 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body), textContent: 'E-Mail-Programm öffnen ↗' });
  const copy = el('button', { type: 'button', className: 'text-button', textContent: 'Text kopieren' });
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(body); copy.textContent = 'Text kopiert'; }
    catch (e) { text.focus(); text.select(); copy.textContent = 'Text markiert – jetzt kopieren'; }
  });
  result.replaceChildren(el('div', { className: 'form-fallback' }, [
    el('p', {}, [intro + ' ', el('span', { className: 'fallback-address', textContent: MAIL }), '.']),
    text, el('div', { className: 'fallback-actions' }, [copy, mail])
  ]));
  result.focus();
}

async function deliver(form, button, result, payload, mailSubject, successText, onSuccess) {
  if (looksAutomated(form)) { showSuccess(result, successText); onSuccess(); return; }
  button.disabled = true; button.setAttribute('aria-busy', 'true');
  try {
    await sendRequest(payload);
    showSuccess(result, successText);
    onSuccess();
  } catch (error) {
    showFallback(result, mailSubject, payload.message + '\n\n' + payload.name + '\n' + payload.email + (payload.phone ? '\n' + payload.phone : ''), error.message);
  } finally {
    button.disabled = false; button.removeAttribute('aria-busy');
  }
}

// ---------------------------------------------------------------- Projektanfrage

if (strategic) {
  stamp(strategic);
  const section = strategic.closest('.strategic-inquiry');
  const contextSelect = document.getElementById('inquiry-context');
  const steps = [...strategic.querySelectorAll('[data-inquiry-step]')];
  const progress = document.getElementById('inquiry-progress');
  const stepLabel = document.getElementById('inquiry-step-label');
  const percent = document.getElementById('inquiry-percent');
  const back = document.getElementById('inquiry-back');
  const next = document.getElementById('inquiry-next');
  const errorBox = document.getElementById('inquiry-error');
  const result = document.getElementById('inquiry-result');
  const title = document.getElementById('inquiry-title');
  const defaultTitle = title.textContent;
  let step = 1;

  const context = () => contextSelect.value;
  const value = name => ((strategic.elements[name] || {}).value || '').trim();
  const checked = name => { const input = strategic.querySelector(`input[name="${name}"]:checked`); return input ? input.value : ''; };

  function applyContext() {
    const c = context(), text = CONTEXT_TEXT[c] || CONTEXT_TEXT[''];
    strategic.querySelectorAll('[data-context-assets],[data-context-intents],[data-context-topics]').forEach(block => {
      block.hidden = (block.dataset.contextAssets || block.dataset.contextIntents || block.dataset.contextTopics) !== c;
    });
    strategic.querySelector('[data-asset-legend]').textContent = text.legend;
    strategic.querySelector('[data-asset-question]').textContent = text.question;
    strategic.querySelector('[data-budget-label]').textContent = text.budget;
    title.textContent = text.title || defaultTitle;
    section.dataset.inquiryContext = c;
  }

  function collect() {
    const c = context();
    const topics = [...strategic.querySelectorAll(`input[name="Themen-${c}"]:checked`)].map(input => input.value).join(', ');
    return [['Bereich', LABEL[c] || ''], ['Objektart', checked('Objektart-' + c)], ['Anliegen', checked('Anliegen-' + c)], ['Themen', topics],
      ['Region', value('Region')], ['Budget / Rahmen', value('Rahmen')], ['Zeitrahmen', value('Zeitrahmen')], ['Fläche / Größe', value('Groesse')],
      ['Beschreibung', value('Beschreibung')], ['Name', value('Name')], ['E-Mail', value('Email')], ['Telefon', value('Telefon')], ['Unternehmen', value('Unternehmen')]]
      .filter(pair => pair[1]);
  }

  function buildReview() {
    const list = document.getElementById('inquiry-review');
    list.replaceChildren(...collect().flatMap(([label, text]) => [el('dt', { textContent: label }), el('dd', { textContent: text })]));
  }

  function showStep(n, focus) {
    step = n;
    steps.forEach(fieldset => fieldset.hidden = Number(fieldset.dataset.inquiryStep) !== n);
    progress.value = n; progress.textContent = n + ' von 6';
    stepLabel.textContent = 'Schritt ' + n + ' von 6';
    percent.textContent = Math.round(n / 6 * 100) + ' %';
    back.hidden = n === 1;
    next.textContent = n === 6 ? 'Anfrage senden ↗' : 'Weiter →';
    if (n === 6) buildReview();
    if (focus !== false) steps[n - 1].querySelector('legend').focus();
  }

  function validate(n) {
    clearErrors(strategic, errorBox);
    const c = context();
    if (n === 1) {
      if (!c) return fail(contextSelect, errorBox, 'Bitte wählen Sie oben Ihren Bereich: Investment, Property oder Projects.');
      if (!checked('Objektart-' + c)) return fail(strategic.querySelector(`input[name="Objektart-${c}"]`), errorBox, 'Bitte wählen Sie eine Option aus.');
    }
    if (n === 2 && !checked('Anliegen-' + c)) return fail(strategic.querySelector(`input[name="Anliegen-${c}"]`), errorBox, 'Bitte wählen Sie Ihr Anliegen aus.');
    if (n === 4 && !value('Region')) return fail(strategic.elements.Region, errorBox, 'Bitte nennen Sie Standort oder Suchregion, zum Beispiel „Berlin“.');
    if (n === 5) {
      if (!value('Name')) return fail(strategic.elements.Name, errorBox, 'Bitte geben Sie Ihren Namen ein.');
      if (!isEmail(value('Email'))) return fail(strategic.elements.Email, errorBox, 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@firma.de.');
    }
    return true;
  }

  contextSelect.addEventListener('change', () => { applyContext(); clearErrors(strategic, errorBox); });
  back.addEventListener('click', () => { clearErrors(strategic, errorBox); showStep(step - 1); });
  strategic.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate(step)) return;
    if (step < 6) { showStep(step + 1); return; }
    const c = context(), name = value('Name');
    const lines = collect().filter(([label]) => !['Name', 'E-Mail', 'Telefon'].includes(label)).map(([label, text]) => label + ': ' + text);
    if (value('Kontaktweg')) lines.push('Bevorzugter Kontakt: ' + value('Kontaktweg'));
    const payload = { name, email: value('Email'), phone: value('Telefon'), subject: SUBJECT[c] || 'general', message: lines.join('\n') };
    deliver(strategic, next, result, payload, 'Projektanfrage ' + (LABEL[c] || ''),
      'Vielen Dank, ' + name + '. Ihre Projektanfrage ist eingegangen. Ich melde mich persönlich bei Ihnen.',
      () => { steps.forEach(fieldset => fieldset.hidden = true); next.hidden = true; back.hidden = true; });
  });

  // "… anfragen"-Buttons auf der Seite füllen die Anfrage vor.
  document.querySelectorAll('[data-enquire]').forEach(button => button.addEventListener('click', () => {
    const preset = INTENT[button.dataset.enquire];
    if (!preset) return;
    const gateway = section.closest('details');
    if (gateway) gateway.open = true;
    contextSelect.value = preset[0];
    applyContext();
    const intent = strategic.querySelector(`input[name="Anliegen-${preset[0]}"][value="${CSS.escape(preset[1])}"]`);
    if (intent) intent.checked = true;
    const notes = strategic.elements.Beschreibung;
    if (button.dataset.object && notes && !notes.value.trim()) notes.value = 'Interesse an: ' + button.dataset.object;
    showStep(1, false);
    scrollTo(section);
    setTimeout(() => steps[0].querySelector('legend').focus({ preventScroll: true }), reduceMotionUx ? 0 : 450);
  }));

  applyContext();
}

// Startseite: #anfrage zeigt auf das eingeklappte <details> und soll es öffnen.
function openTarget(hash) {
  const target = hash && document.getElementById(hash.slice(1));
  if (target && target.tagName === 'DETAILS') { target.open = true; scrollTo(target); }
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link) openTarget(link.getAttribute('href'));
});
window.addEventListener('hashchange', () => openTarget(location.hash));
openTarget(location.hash);
document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => {
  if (details.open) details.querySelectorAll('form').forEach(stamp);
}));

// ---------------------------------------------------------------- Kurznachricht

if (quick) {
  stamp(quick);
  const errorBox = document.getElementById('contact-error');
  const result = document.getElementById('contact-result');
  const button = quick.querySelector('button[type="submit"]');
  const value = name => (quick.elements[name].value || '').trim();
  quick.addEventListener('submit', event => {
    event.preventDefault();
    clearErrors(quick, errorBox);
    if (!value('name')) return fail(quick.elements.name, errorBox, 'Bitte geben Sie Ihren Namen ein.');
    if (!isEmail(value('email'))) return fail(quick.elements.email, errorBox, 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@firma.de.');
    if (!value('message')) return fail(quick.elements.message, errorBox, 'Bitte schreiben Sie kurz, worum es geht.');
    const subjectSelect = quick.elements.subject;
    const payload = { name: value('name'), email: value('email'), phone: value('phone'), subject: subjectSelect.value, message: value('message') };
    deliver(quick, button, result, payload, subjectSelect.options[subjectSelect.selectedIndex].text,
      'Vielen Dank, ' + payload.name + '. Ihre Nachricht ist eingegangen. Ich melde mich persönlich bei Ihnen.',
      () => { quick.elements.message.value = ''; });
  });
}

// ---------------------------------------------------------------- Karte (lädt erst nach Klick)

document.querySelectorAll('[data-load-map]').forEach(button => button.addEventListener('click', () => {
  const box = button.closest('.ux-map'), host = box.querySelector('[data-map-host]');
  const link = box.querySelector('a[href*="google.com/maps"]');
  const query = link ? (link.getAttribute('href').split('query=')[1] || '') : '';
  host.replaceChildren(el('iframe', { src: 'https://www.google.com/maps?q=' + query + '&output=embed', title: 'Karte: Büro GRENFORD', loading: 'lazy', referrerPolicy: 'no-referrer-when-downgrade' }));
  button.hidden = true;
}));

// ---------------------------------------------------------------- Kontaktleiste

const contactRail = document.querySelector('.ux-contact-rail');
const contactSection = document.getElementById('kontakt');
if (contactRail && contactSection && 'IntersectionObserver' in window) {
  new IntersectionObserver(entries => contactRail.classList.toggle('is-muted', entries[0].isIntersecting), { threshold: 0.15 }).observe(contactSection);
}
document.addEventListener('focusin', event => { if (event.target.closest('form')) document.body.classList.add('form-focused'); });
document.addEventListener('focusout', event => { if (event.target.closest('form')) document.body.classList.remove('form-focused'); });
