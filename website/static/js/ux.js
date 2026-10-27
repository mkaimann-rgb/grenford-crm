// GRENFORD / Formulare: Projektanfrage in sechs Schritten, Kurznachricht, Karte.
//
// Teil 1 (bis zur Formular-Konstante "strategic") ist DOM-frei und wird von tests/transport.mjs geprüft.
// Übertragung an das GRENFORD-CRM (Google Sheet) über eine Google-Apps-Script-Web-App (crm/website-anfragen.gs).
// Kein Versand vor ausdrücklichem Absenden.
// Endpunkt: <meta name="grenford-form-endpoint"> aus site.json "formEndpoint". Leer = Versand per E-Mail anbieten.

var FORM_ENDPOINT = globalThis.GRENFORD_FORM_ENDPOINT || '';
var FORM_TIMEOUT = 20000;

function splitName(name) {
  var parts = String(name || '').trim().split(/\s+/);
  return [parts.shift() || '', parts.join(' ')];
}

// Überträgt eine Anfrage als JSON (text/plain, damit der Browser keine CORS-Vorabfrage braucht).
// Erfolg nur, wenn die Web-App {"ok": true} zurückgibt. Wirft bei HTTP-Fehler, Netzwerkfehler und abgelehnter Anfrage.
async function sendRequest(data) {
  if (!FORM_ENDPOINT) throw new Error('no-endpoint');
  var name = splitName(data.name);
  var payload = {
    source: 'grenford-website', name: String(data.name || '').trim(), firstname: name[0], lastname: name[1],
    email: data.email, phone: data.phone || '', subject: data.subject || 'general', message: data.message || '',
    page: String(location.href).split('#')[0], pageTitle: document.title
  };
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, FORM_TIMEOUT);
  try {
    var response = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: controller.signal });
    if (!response.ok) throw new Error('submission_failed');
    var result = await response.json().catch(function () { return null; });
    if (!result || result.ok !== true) throw new Error('submission_failed');
    return result;
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

// Texte wie auf der veröffentlichten Seite.
const TITLES = { investment: 'Investment Memo anfragen', property: 'Property Brief anfragen', projects: 'Renovation Memo anfragen' };
const LEADS = {
  '': 'Sechs kurze Fragen. Das erste Gespräch ist kostenfrei.',
  investment: 'Sechs kurze Fragen zu Ihrem Objekt oder Ankaufsprofil, vertraulich behandelt.',
  property: 'Sechs kurze Fragen zu Ihrem Verkauf oder Kaufwunsch.',
  projects: 'Sechs kurze Fragen zu Ihrem Bestand und Ihrem Vorhaben.'
};
const LEGEND = { '': 'Bereich & Objektart', investment: 'Asset-Klasse', property: 'Objektart', projects: 'Objektart' };
const QUESTION = {
  '': 'Wählen Sie zunächst Ihren Bereich. Danach erscheinen die passenden Objektarten.',
  investment: 'Um welche Art von Immobilie handelt es sich bei der geplanten Transaktion?',
  property: 'Welche Immobilie möchten Sie verkaufen oder kaufen?',
  projects: 'Welchen Bestand möchten Sie verändern?'
};
const BUDGET_PLACEHOLDER = { projects: 'z. B. 30.000 € netto oder noch offen' };
const SUBJECT = { investment: 'investment', property: 'property', projects: 'renovation' };
const INTENT = {
  'investment-search': ['investment', 'Suchprofil im Kundenauftrag'],
  'investment-offer': ['investment', 'Immobilie / Portfolio verkaufen'],
  'investment-interest': ['investment', 'Investment Memo / Objektinformationen'],
  'property-sell': ['property', 'Immobilie verkaufen'],
  'property-buy': ['property', 'Kaufinteresse / Property Brief'],
  'projects': ['projects', 'Sanierung / Innenumbau planen']
};
const FAILED = 'Die Übermittlung konnte nicht bestätigt werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut oder senden Sie die vorbereitete E-Mail.';
const NOT_CONFIGURED = 'Ihre Anfrage ist fertig vorbereitet. Bitte senden Sie sie mit einem Klick per E-Mail, Ihre Eingaben bleiben erhalten.';

// ---------------------------------------------------------------- Hilfen

const el = (tag, props, children) => {
  const node = Object.assign(document.createElement(tag), props || {});
  (children || []).forEach(child => node.append(child));
  return node;
};
const scrollTo = node => node.scrollIntoView({ behavior: reduceMotionUx ? 'auto' : 'smooth', block: 'start' });

// Köderfeld ausgefüllt = Bot: Erfolg anzeigen, aber nichts senden.
function looksAutomated(form) {
  const trap = form.querySelector('[name="gf_hp"]');
  return Boolean(trap && trap.value);
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
// Erste ungültige Pflichtangabe in einem Bereich (Browser-Validierung, versteckte Felder ausgenommen).
function firstInvalid(scope) {
  return [...scope.querySelectorAll('input,textarea,select')].find(field =>
    field.willValidate && !field.closest('[hidden]') && field.type !== 'hidden' && (!field.checkValidity() || (field.required && !field.value.trim())));
}
function invalidMessage(field) {
  return field.validity.typeMismatch ? 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' : 'Bitte ergänzen Sie die markierte Pflichtangabe.';
}

function showSuccess(result, text) {
  result.replaceChildren(el('p', { textContent: text }));
  result.focus();
}
// E-Mail-Alternative mit vorbereitetem Text, falls die Übermittlung scheitert.
function showFallback(result, data, reason) {
  const body = data.message + '\n\n' + data.name + '\n' + data.email + (data.phone ? '\n' + data.phone : '');
  const subject = 'GRENFORD · ' + data.subject;
  const text = el('textarea', { readOnly: true, value: body, id: result.id + '-text' });
  text.setAttribute('aria-label', 'Vorbereiteter Text Ihrer Anfrage');
  const mail = el('a', { className: 'text-link', href: 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body), textContent: 'Alternativ per E-Mail senden ↗' });
  const copy = el('button', { type: 'button', className: 'text-button', textContent: 'Text kopieren' });
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(body); copy.textContent = 'Text kopiert'; }
    catch (e) { text.focus(); text.select(); copy.textContent = 'Text markiert – jetzt kopieren'; }
  });
  result.replaceChildren(el('div', { className: 'form-fallback' }, [
    el('p', {}, [(reason === 'no-endpoint' ? NOT_CONFIGURED : FAILED) + ' Adresse: ', el('span', { className: 'fallback-address', textContent: MAIL })]),
    text, el('div', { className: 'fallback-actions' }, [copy, mail])
  ]));
  result.focus();
}

// ---------------------------------------------------------------- Projektanfrage

let inquirySent = false;
if (strategic) {
  const section = strategic.closest('.strategic-inquiry');
  const context = document.getElementById('inquiry-context');
  const panels = [...strategic.querySelectorAll('[data-inquiry-step]')];
  const back = document.getElementById('inquiry-back');
  const next = document.getElementById('inquiry-next');
  const error = document.getElementById('inquiry-error');
  const result = document.getElementById('inquiry-result');
  const title = document.getElementById('inquiry-title');
  const lead = document.getElementById('inquiry-lead');
  let step = 1, sending = false;

  const val = name => ((strategic.elements.namedItem(name) || {}).value || '').trim();
  const selected = name => [...strategic.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);

  function review() {
    const c = context.value;
    const rows = [['Bereich', context.selectedOptions[0].text], ['Objektart', selected('Objektart-' + c).join(', ')], ['Anliegen', selected('Anliegen-' + c).join(', ')],
      ['Schwerpunkte', selected('Themen-' + c).join(', ') || 'Im Gespräch klären'], ['Standort / Suchregion', val('Region')],
      ['Budget / Preisrahmen', val('Rahmen') || 'Noch offen'], ['Zeitrahmen', val('Zeitrahmen') || 'Noch offen'], ['Größe', val('Groesse') || 'Noch offen'],
      ['Weitere Angaben', val('Beschreibung') || 'Keine ergänzenden Angaben'], ['Name', val('Name')], ['E-Mail', val('Email')],
      ['Telefon', val('Telefon') || 'Nicht angegeben'], ['Unternehmen', val('Unternehmen') || 'Nicht angegeben']];
    document.getElementById('inquiry-review').replaceChildren(...rows.flatMap(([label, text]) => [el('dt', { textContent: label }), el('dd', { textContent: text })]));
    return rows;
  }

  function show(focus) {
    panels.forEach((panel, i) => panel.hidden = i !== step - 1);
    back.hidden = step === 1;
    next.textContent = step === 6 ? 'Anfrage senden ↗' : step === 3 ? 'Weiter / überspringen →' : 'Weiter →';
    document.getElementById('inquiry-step-label').textContent = 'Schritt ' + step + ' von 6';
    document.getElementById('inquiry-percent').textContent = Math.round(step / 6 * 100) + ' %';
    const progress = document.getElementById('inquiry-progress');
    progress.value = step; progress.textContent = step + ' von 6';
    clearErrors(strategic, error);
    if (step === 6) review();
    if (focus !== false) panels[step - 1].querySelector('legend').focus();
  }

  function changeContext() {
    const c = context.value;
    section.dataset.inquiryContext = c;
    title.textContent = TITLES[c] || 'Ihr Vorhaben beschreiben';
    lead.textContent = LEADS[c] || LEADS[''];
    strategic.querySelectorAll('[data-context-assets],[data-context-intents],[data-context-topics]').forEach(block => {
      block.hidden = (block.dataset.contextAssets || block.dataset.contextIntents || block.dataset.contextTopics) !== c;
    });
    strategic.querySelector('[data-asset-legend]').textContent = LEGEND[c] || LEGEND[''];
    strategic.querySelector('[data-asset-question]').textContent = QUESTION[c] || QUESTION[''];
    strategic.elements.Rahmen.placeholder = BUDGET_PLACEHOLDER[c] || 'z. B. bis 2 Mio. € oder noch offen';
    step = 1; show(false);
  }

  function validate() {
    clearErrors(strategic, error);
    if (!context.value) return fail(context, error, 'Bitte wählen Sie Investment, Property oder Projects.');
    if (step === 1 || step === 2) {
      const name = (step === 1 ? 'Objektart-' : 'Anliegen-') + context.value;
      if (!selected(name).length) return fail(strategic.querySelector(`input[name="${name}"]`), error,
        step === 1 ? 'Bitte wählen Sie eine Objektart aus. „Sonstiges“ ist ebenfalls möglich.' : 'Bitte wählen Sie Ihr Anliegen aus.');
    }
    const invalid = firstInvalid(panels[step - 1]);
    if (invalid) return fail(invalid, error, invalidMessage(invalid));
    return true;
  }

  context.addEventListener('change', changeContext);
  strategic.addEventListener('input', event => { event.target.removeAttribute('aria-invalid'); error.textContent = ''; });
  back.addEventListener('click', () => { if (!sending && step > 1) { step--; show(); } });

  strategic.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || inquirySent || !validate()) return;
    if (step < 6) { step++; show(); return; }
    const rows = review();
    const data = {
      name: val('Name'), email: val('Email'), phone: val('Telefon'), subject: SUBJECT[context.value],
      message: 'Projektanfrage · ' + TITLES[context.value] + '\n\n' + rows.map(([a, b]) => a + ': ' + b).join('\n') + '\nBevorzugter Kontakt: ' + val('Kontaktweg')
    };
    const finish = () => {
      inquirySent = true;
      showSuccess(result, 'Vielen Dank. Ihre Anfrage wurde übermittelt. Ich melde mich persönlich bei Ihnen. – Marco Kaimann');
      next.hidden = true; back.hidden = true; context.disabled = true; panels.forEach(panel => panel.hidden = true);
    };
    if (looksAutomated(strategic)) { finish(); return; }
    sending = true; next.disabled = true; back.disabled = true; context.disabled = true;
    next.setAttribute('aria-busy', 'true'); next.textContent = 'Wird gesendet …';
    try {
      await sendRequest(data);
      finish();
    } catch (e) {
      showFallback(result, data, e.message);
    } finally {
      sending = false; next.removeAttribute('aria-busy');
      if (!inquirySent) { next.disabled = false; back.disabled = false; context.disabled = false; next.textContent = 'Anfrage senden ↗'; }
    }
  });

  // "… anfragen"-Buttons füllen Bereich, Anliegen und Objekt vor.
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-enquire]');
    if (!trigger) return;
    event.preventDefault();
    if (inquirySent) { scrollTo(document.getElementById('kontakt')); return; }
    const preset = INTENT[trigger.dataset.enquire];
    if (preset) context.value = preset[0];
    changeContext();
    if (preset) {
      const intent = [...strategic.querySelectorAll(`input[name="Anliegen-${preset[0]}"]`)].find(input => input.value === preset[1]);
      if (intent) intent.checked = true;
    }
    if (trigger.dataset.object) strategic.elements.Beschreibung.value = 'Ich interessiere mich für: ' + trigger.dataset.object;
    const gateway = section.closest('details');
    if (gateway) gateway.open = true;
    scrollTo(section);
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  });

  changeContext();
}

// Startseite: #anfrage zeigt auf das eingeklappte <details> und soll es öffnen.
function openTarget(hash) {
  const target = hash && document.getElementById(hash.slice(1));
  const details = target && (target.tagName === 'DETAILS' ? target : target.closest('details'));
  if (details) details.open = true;
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link) openTarget(link.getAttribute('href'));
});
window.addEventListener('hashchange', () => openTarget(location.hash));
openTarget(location.hash);

// ---------------------------------------------------------------- Kurznachricht

if (quick) {
  const error = document.getElementById('contact-error');
  const result = document.getElementById('contact-result');
  const button = quick.querySelector('[type="submit"]');
  let busy = false;
  quick.addEventListener('input', event => { event.target.removeAttribute('aria-invalid'); error.textContent = ''; });
  quick.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    clearErrors(quick, error);
    const invalid = firstInvalid(quick);
    if (invalid) return fail(invalid, error, invalidMessage(invalid));
    const fd = new FormData(quick);
    const company = (fd.get('company') || '').trim();
    const data = { name: fd.get('name').trim(), email: fd.get('email').trim(), phone: fd.get('phone').trim(), subject: fd.get('subject'),
      message: (company ? 'Unternehmen: ' + company + '\n\n' : '') + fd.get('message').trim() };
    const finish = () => {
      showSuccess(result, 'Vielen Dank. Ihre Nachricht wurde übermittelt. Ich melde mich persönlich bei Ihnen.');
      button.hidden = true;
      quick.querySelectorAll('input,textarea,select').forEach(field => field.disabled = true);
    };
    if (looksAutomated(quick)) { finish(); return; }
    busy = true; button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Wird gesendet …';
    try {
      await sendRequest(data);
      finish();
    } catch (e) {
      showFallback(result, data, e.message);
      button.disabled = false; button.textContent = 'Nachricht senden ↗';
    } finally {
      busy = false; button.removeAttribute('aria-busy');
    }
  });
}

// ---------------------------------------------------------------- Karte (lädt erst nach Klick)

document.querySelectorAll('[data-load-map]').forEach(button => button.addEventListener('click', () => {
  const host = button.closest('.ux-map').querySelector('[data-map-host]');
  host.replaceChildren(el('iframe', {
    title: 'GRENFORD Büro – Kurfürstendamm 96, Berlin', loading: 'lazy', referrerPolicy: 'no-referrer',
    src: 'https://www.google.com/maps?q=Kurf%C3%BCrstendamm%2096%2C%2010709%20Berlin&output=embed'
  }));
  button.hidden = true;
}));

// ---------------------------------------------------------------- Kontaktleiste

// Die Leiste (Termin buchen, WhatsApp) bleibt immer sichtbar, auch im Kontaktbereich.
document.addEventListener('focusin', event => document.body.classList.toggle('form-focused', Boolean(event.target.closest('form'))));
document.addEventListener('focusout', event => { if (!(event.relatedTarget && event.relatedTarget.closest('form'))) document.body.classList.remove('form-focused'); });
