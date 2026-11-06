// GRENFORD / Cookie-Einstellungen: Einwilligung, Google Analytics und Google Maps.
// Logik und Texte 1:1 wie auf der bisherigen Live-Website (cookie-banner.js, ga-consent.js, map-consent.js),
// gleicher Speicherschlüssel, damit bestehende Einwilligungen gültig bleiben. Gestaltung im GRENFORD-Layout (structure.css).
// Ohne Einwilligung wird nichts geladen; „Cookie-Einstellungen“ im Footer öffnet den Hinweis erneut.

(function () {
  var KEY = 'grenford-cookie-consent';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; /* nach 12 Monaten erneut fragen */
  var meta = function (name) { var m = document.querySelector('meta[name="' + name + '"]'); return m ? m.content : ''; };
  var GA_ID = meta('grenford-ga'); /* in der Vorschau leer: dort wird Analytics nie geladen */
  var lang = document.documentElement.lang === 'en' ? 'en' : 'de';

  function readConsent() {
    var raw;
    try { raw = localStorage.getItem(KEY); } catch (e) { return null; }
    if (!raw) return null;
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { return null; }
    if (!parsed || !parsed.decision || !parsed.ts) return null;
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null;
    return parsed;
  }
  function writeConsent(decision) {
    try { localStorage.setItem(KEY, JSON.stringify({ decision: decision, ts: Date.now() })); } catch (e) {}
  }
  window.grenfordReadCookieConsent = readConsent;

  // ---------------------------------------------------------------- Google Analytics (Consent Mode, IP gekürzt)
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });

  window.grenfordEnableAnalytics = function () {
    if (window.__gaLoaded || !GA_ID) return;
    window.__gaLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  };
  window.grenfordDisableAnalytics = function () { gtag('consent', 'update', { analytics_storage: 'denied' }); };

  // ---------------------------------------------------------------- Google Maps: bei „Alle akzeptieren“ automatisch
  window.grenfordEnableMaps = function () {
    document.querySelectorAll('[data-load-map]:not([hidden])').forEach(function (b) { b.click(); });
  };

  // ---------------------------------------------------------------- Hinweis
  var COPY = {
    de: {
      title: 'Cookie-Einwilligung',
      text: 'Wir verwenden Cookies und ähnliche Technologien (z.B. Google Analytics) sowie eingebettete Dienste wie Google Maps, um unsere Website und Ihre Erfahrung zu verbessern. Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung dieser Technologien zu.',
      accept: 'Alle akzeptieren',
      decline: 'Nur notwendige',
      imprint: 'Impressum',
      privacy: 'Datenschutz'
    },
    en: {
      title: 'Cookie Consent',
      text: 'We use cookies and similar technologies (e.g. Google Analytics) as well as embedded services such as Google Maps to improve our website and your experience. By clicking "Accept All", you consent to the use of these technologies.',
      accept: 'Accept All',
      decline: 'Necessary Only',
      imprint: 'Imprint',
      privacy: 'Privacy'
    }
  };
  var t = COPY[lang];
  var box = null;

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'cookie-consent';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'false');
    wrap.setAttribute('aria-labelledby', 'gfcb-title');
    var h = document.createElement('h2'); h.id = 'gfcb-title'; h.textContent = t.title;
    var p = document.createElement('p'); p.textContent = t.text;
    var actions = document.createElement('div'); actions.className = 'cookie-consent-actions';
    var accept = document.createElement('button'); accept.type = 'button'; accept.className = 'cookie-btn'; accept.textContent = t.accept;
    var decline = document.createElement('button'); decline.type = 'button'; decline.className = 'cookie-btn cookie-btn-ghost'; decline.textContent = t.decline;
    actions.append(accept, decline);
    var links = document.createElement('p'); links.className = 'cookie-consent-links';
    [[meta('grenford-imprint'), t.imprint], [meta('grenford-privacy'), t.privacy]].forEach(function (l) {
      var a = document.createElement('a'); a.href = l[0]; a.textContent = l[1]; links.appendChild(a);
    });
    wrap.append(h, p, actions, links);
    document.body.appendChild(wrap);

    accept.addEventListener('click', function () {
      writeConsent('all');
      window.grenfordEnableAnalytics();
      window.grenfordEnableMaps();
      hide();
    });
    decline.addEventListener('click', function () {
      writeConsent('necessary');
      window.grenfordDisableAnalytics();
      hide();
    });
    return wrap;
  }
  function show() {
    if (!box) box = build();
    requestAnimationFrame(function () { box.classList.add('is-open'); box.querySelector('button').focus({ preventScroll: true }); });
  }
  function hide() { if (box) box.classList.remove('is-open'); }

  window.addEventListener('reopen-cookie-banner', show);
  document.addEventListener('click', function (e) { if (e.target.closest('[data-cookie-settings]')) show(); });

  var consent = readConsent();
  if (consent && consent.decision === 'all') {
    window.grenfordEnableAnalytics();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(window.grenfordEnableMaps, 0); });
    else setTimeout(window.grenfordEnableMaps, 0);
  }
  if (!consent) setTimeout(show, 500);
})();
