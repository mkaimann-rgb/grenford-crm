// GRENFORD / Seiteninteraktionen: Menü, Hero-Galerie, Collection-Karussell, Vorher-Nachher-Regler.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function watch(selector, bodyClass) {
  const el = document.querySelector(selector);
  if (el && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => document.body.classList.toggle(bodyClass, entries[0].isIntersecting), { threshold: 0 }).observe(el);
  }
}
watch('.immersive-hero', 'hero-in-view');
watch('.strategic-inquiry', 'inquiry-in-view');

// Menü (mobil)
const menu = document.querySelector('.menu'), nav = document.getElementById('mainnav');
if (menu && nav) {
  const icon = menu.querySelector('span');
  const setOpen = open => {
    menu.setAttribute('aria-expanded', String(open));
    if (icon) icon.textContent = open ? '−' : '＋';
    nav.classList.toggle('open', open);
  };
  menu.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setOpen(false); menu.focus(); }
  });
}

// Hero-Galerie: wechselt automatisch alle 5 Sekunden in einer Schleife, jedes Bild mit leichtem Zoom (CSS).
// Pausiert, solange der Hero nicht sichtbar oder der Tab im Hintergrund ist. Bei reduzierter Bewegung bleibt das erste Bild stehen.
const HERO_INTERVAL = 5000;
document.querySelectorAll('[data-cover]').forEach(gallery => {
  const images = [...gallery.querySelectorAll('[data-cover-image]')];
  if (images.length < 2 || reduceMotion) return;
  let current = 0, timer = null, visible = true;
  const show = index => {
    const previous = images[current];
    previous.classList.replace('is-active', 'is-leaving');            // blendet aus, behält den Zoom
    setTimeout(() => previous.classList.remove('is-leaving'), 1600);
    current = index;
    const image = images[current];
    image.classList.remove('is-active'); void image.offsetWidth;  // Zoom-Animation neu starten
    image.classList.add('is-active');
    images[(current + 1) % images.length].loading = 'eager';      // nächstes Bild vorladen
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!timer && visible && !document.hidden) timer = setInterval(() => show((current + 1) % images.length), HERO_INTERVAL); };
  images[1].loading = 'eager';
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visible ? start() : stop(); }).observe(gallery);
  }
  start();
});

// Collection-Karussell
const collectionTabs = [...document.querySelectorAll('[data-collection-tab]')], collectionPanels = [...document.querySelectorAll('[data-collection-panel]')], carouselUpdates = [];
collectionPanels.forEach(panel => {
  const viewport = panel.querySelector('.collection-viewport'), track = panel.querySelector('.collection-track'), cards = [...track.children];
  const previous = panel.querySelector('[data-prev]'), next = panel.querySelector('[data-next]'), counter = panel.querySelector('[data-counter]');
  const gap = () => parseFloat(getComputedStyle(track).gap) || 0;
  const step = () => cards[0].getBoundingClientRect().width + gap();
  function update() {
    if (panel.hidden) return;
    const max = viewport.scrollWidth - viewport.clientWidth, per = Math.max(1, Math.floor((viewport.clientWidth + gap() + 2) / step()));
    let index = Math.round(viewport.scrollLeft / step());
    if (viewport.scrollLeft >= max - 3) index = Math.max(0, cards.length - per);
    previous.disabled = viewport.scrollLeft <= 3; next.disabled = viewport.scrollLeft >= max - 3;
    const text = (index + 1) + (per > 1 ? '–' + Math.min(cards.length, index + per) : '') + ' / ' + cards.length;
    if (counter.textContent !== text) counter.textContent = text;  // Live-Region nur bei echter Änderung
  }
  let settle;
  const scheduleUpdate = () => { clearTimeout(settle); settle = setTimeout(update, 120); };  // erst nach dem Scrollen ansagen
  const move = sign => viewport.scrollBy({ left: sign * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
  previous.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
  viewport.addEventListener('scroll', scheduleUpdate, { passive: true });
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); viewport.scrollTo({ left: event.key === 'Home' ? 0 : viewport.scrollWidth, behavior: reduceMotion ? 'auto' : 'smooth' }); }
  });
  window.addEventListener('resize', scheduleUpdate); carouselUpdates.push(update); update();
});
collectionTabs.forEach(button => button.addEventListener('click', () => {
  collectionTabs.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  collectionPanels.forEach(panel => panel.hidden = panel.dataset.collectionPanel !== button.dataset.collectionTab);
  requestAnimationFrame(() => carouselUpdates.forEach(update => update()));
}));

// Vorher-Nachher-Regler
document.querySelectorAll('.comparison-stage input[type="range"]').forEach(range => {
  const update = () => {
    range.parentElement.style.setProperty('--split', range.value + '%');
    range.setAttribute('aria-valuetext', range.value + ' Prozent Bestand, ' + (100 - range.value) + ' Prozent Zielbild');
  };
  range.addEventListener('input', update); update();
});
