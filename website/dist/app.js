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

// Hero-Galerie: wechselt automatisch alle 6 Sekunden in einer Schleife, jedes Bild mit leichtem Zoom (CSS).
// Pausiert, solange der Hero nicht sichtbar oder der Tab im Hintergrund ist. Bei reduzierter Bewegung bleibt das erste Bild stehen.
const HERO_INTERVAL = 6000;
// Bilder 2…n tragen ihre Quelle zunächst nur in data-src (build.py) und laden erst, wenn die Seite steht.
const hydrate = image => {
  if (image.dataset.srcset) { image.srcset = image.dataset.srcset; image.removeAttribute('data-srcset'); }
  if (image.dataset.src) { image.src = image.dataset.src; image.removeAttribute('data-src'); }
};
document.querySelectorAll('[data-cover]').forEach(gallery => {
  const images = [...gallery.querySelectorAll('[data-cover-image]')];
  if (images.length < 2 || reduceMotion) return;
  let current = 0, timer = null, visible = true, paused = false;
  const later = () => setTimeout(() => images.slice(1).forEach(hydrate), 1200);
  document.readyState === 'complete' ? later() : window.addEventListener('load', later, { once: true });
  const cities = [...(gallery.closest('section')?.querySelectorAll('[data-reach-city]') || [])];  // Reichweiten-Zeile der Startseite
  const show = index => {
    const previous = images[current];
    previous.style.transform = getComputedStyle(previous).transform;  // aktuelle Zoomstufe festhalten
    previous.classList.replace('is-active', 'is-leaving');            // blendet aus, ohne zu springen
    setTimeout(() => { previous.classList.remove('is-leaving'); previous.style.transform = ''; }, 2100);
    current = index;
    cities.forEach((city, i) => city.classList.toggle('is-active', i === current));
    const image = images[current];
    image.classList.remove('is-active'); void image.offsetWidth;  // Zoom-Animation neu starten
    image.classList.add('is-active');
    hydrate(images[(current + 1) % images.length]);               // nächstes Bild sicher geladen
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!timer && !paused && visible && !document.hidden) timer = setInterval(() => show((current + 1) % images.length), HERO_INTERVAL); };
  // Sichtbarer Pause-Knopf (WCAG 2.2.2: sich selbst bewegende Inhalte anhalten können)
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'motion-toggle hero-toggle'; toggle.setAttribute('aria-pressed', 'false');
  toggle.setAttribute('aria-label', 'Bildwechsel anhalten'); toggle.innerHTML = '<span aria-hidden="true">❚❚</span>';
  toggle.addEventListener('click', () => {
    paused = !paused; paused ? stop() : start();
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Bildwechsel fortsetzen' : 'Bildwechsel anhalten');
    toggle.innerHTML = paused ? '<span aria-hidden="true">▶</span>' : '<span aria-hidden="true">❚❚</span>';
  });
  gallery.closest('section').appendChild(toggle);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visible ? start() : stop(); }).observe(gallery);
  }
  start();
});

// Collection-Karussell (Startseite, Investment, Property: identisches Verhalten)
// Gleitet langsam und durchgehend nach links, als Endlosschleife (die Karten sind dafür einmal unsichtbar für Screenreader dupliziert).
// Ein Klick auf eine Karte hält es dauerhaft an; die Pfeile bleiben nutzbar. Pausiert bei Wischen, Tastaturfokus,
// außerhalb des Sichtbereichs und im Hintergrund-Tab. Bei reduzierter Bewegung kein automatischer Lauf und keine Duplikate.
const COLLECTION_SPEED = 28;  // Pixel pro Sekunde
const collectionTabs = [...document.querySelectorAll('[data-collection-tab]')], collectionPanels = [...document.querySelectorAll('[data-collection-panel]')], carouselUpdates = [];
collectionPanels.forEach(panel => {
  const viewport = panel.querySelector('.collection-viewport'), track = panel.querySelector('.collection-track');
  if (!track) return;
  const cards = [...track.children];
  const previous = panel.querySelector('[data-prev]'), next = panel.querySelector('[data-next]'), counter = panel.querySelector('[data-counter]');
  const looping = !reduceMotion && cards.length > 1;
  if (looping) cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button, [tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));
    track.appendChild(clone);
  });
  const gap = () => parseFloat(getComputedStyle(track).gap) || 0;
  const step = () => cards[0].getBoundingClientRect().width + gap();
  const loopWidth = () => cards.length * step();
  const wrap = () => {  // unsichtbarer Sprung zwischen Original und Duplikat
    if (!looping) return;
    const w = loopWidth();
    if (viewport.scrollLeft >= w) viewport.scrollLeft -= w;
  };
  function update() {
    if (panel.hidden) return;
    const max = viewport.scrollWidth - viewport.clientWidth, per = Math.max(1, Math.floor((viewport.clientWidth + gap() + 2) / step()));
    let index = Math.round(viewport.scrollLeft / step()) % cards.length;
    if (!looping && viewport.scrollLeft >= max - 3) index = Math.max(0, cards.length - per);
    previous.disabled = !looping && viewport.scrollLeft <= 3; next.disabled = !looping && viewport.scrollLeft >= max - 3;
    const last = (index + per - 1) % cards.length + 1;
    const text = (index + 1) + (per > 1 ? (last > index + 1 ? '–' : ', ') + last : '') + ' / ' + cards.length;
    if (counter.textContent !== text) counter.textContent = text;
  }
  let settle;
  const scheduleUpdate = () => { clearTimeout(settle); settle = setTimeout(() => { if (!frame) wrap(); update(); }, 150); };
  const move = sign => {
    if (looping && sign < 0 && viewport.scrollLeft < step() - 3) viewport.scrollLeft += loopWidth();
    const target = Math.round(viewport.scrollLeft / step()) + sign;
    viewport.scrollTo({ left: target * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  let frame = null, last = 0, pos = 0, stopped = !looping, visible = false, focused = false, held = false, hovering = false, resume;
  const tick = now => {
    pos += Math.min(now - last, 100) / 1000 * COLLECTION_SPEED; last = now;
    const w = loopWidth();
    if (pos >= w) pos -= w;
    viewport.scrollLeft = pos;
    frame = requestAnimationFrame(tick);
  };
  const pause = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    viewport.classList.remove('is-gliding');
    counter.setAttribute('aria-live', 'polite');
  };
  const play = () => {
    if (frame || stopped || held || hovering || panel.hidden || !visible || focused || document.hidden) return;
    viewport.classList.add('is-gliding');           // Einrasten aus, solange es gleitet
    counter.setAttribute('aria-live', 'off');       // keine Dauer-Ansagen während des Gleitens
    pos = viewport.scrollLeft; last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  if (looping) {
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'motion-toggle'; toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', 'Karussell anhalten'); toggle.innerHTML = '<span aria-hidden="true">❚❚</span>';
    toggle.addEventListener('click', () => {
      stopped = !stopped; clearTimeout(resume);
      stopped ? (pause(), panel.classList.add('is-stopped')) : (panel.classList.remove('is-stopped'), held = false, play());
      toggle.setAttribute('aria-pressed', String(stopped));
      toggle.setAttribute('aria-label', stopped ? 'Karussell fortsetzen' : 'Karussell anhalten');
      toggle.innerHTML = stopped ? '<span aria-hidden="true">▶</span>' : '<span aria-hidden="true">❚❚</span>';
    });
    panel.querySelector('.collection-navigation').prepend(toggle);
    panel._syncToggle = () => {
      toggle.setAttribute('aria-pressed', String(stopped));
      toggle.setAttribute('aria-label', stopped ? 'Karussell fortsetzen' : 'Karussell anhalten');
      toggle.innerHTML = stopped ? '<span aria-hidden="true">▶</span>' : '<span aria-hidden="true">❚❚</span>';
    };
  }
  const holdFor = ms => { held = true; pause(); clearTimeout(resume); resume = setTimeout(() => { held = false; wrap(); play(); }, ms); };
  // Maus über einer Karte: anhalten (Karte färbt sich per CSS); weg ohne Klick: weiter. Klick: dauerhaft anhalten, Karte bleibt markiert.
  viewport.addEventListener('pointerover', event => { if (event.pointerType === 'mouse' && event.target.closest('.collection-track > article')) { hovering = true; pause(); } });
  viewport.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovering = false; play(); } });
  track.addEventListener('click', event => {
    stopped = true; clearTimeout(resume); pause(); panel.classList.add('is-stopped');
    if (panel._syncToggle) panel._syncToggle();
    const card = event.target.closest('.collection-track > article');
    track.querySelectorAll('.is-selected').forEach(c => c.classList.remove('is-selected'));
    if (card) card.classList.add('is-selected');
  });
  previous.addEventListener('click', () => { holdFor(4000); move(-1); });
  next.addEventListener('click', () => { holdFor(4000); move(1); });
  viewport.addEventListener('touchstart', () => { held = true; clearTimeout(resume); pause(); }, { passive: true });
  viewport.addEventListener('touchend', () => holdFor(4000), { passive: true });
  viewport.addEventListener('wheel', () => holdFor(4000), { passive: true });
  viewport.addEventListener('focusin', () => { focused = true; pause(); });
  viewport.addEventListener('focusout', event => { if (!viewport.contains(event.relatedTarget)) { focused = false; play(); } });
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visible ? play() : pause(); }, { threshold: 0.3 }).observe(viewport);
  }

  viewport.addEventListener('scroll', scheduleUpdate, { passive: true });
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); viewport.scrollTo({ left: event.key === 'Home' ? 0 : (looping ? (cards.length - 1) * step() : viewport.scrollWidth), behavior: reduceMotion ? 'auto' : 'smooth' }); }
  });
  window.addEventListener('resize', scheduleUpdate);
  carouselUpdates.push(() => { update(); panel.hidden ? pause() : play(); });
  update();
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
  range.addEventListener('input', event => { if (event.isTrusted) range.dataset.manual = '1'; update(); });
  update();
});

// ---------------------------------------------------------------- Erzählen beim Scrollen (ruhig, nur scrollgesteuert)
// Vorher-Nachher: Beim Scrollen wandelt sich der Raum vom Bestand zum Zielbild. Sobald jemand den Regler selbst bewegt,
// übernimmt er. Zeitstrahl: Die Linie füllt sich von 01 bis 05, erreichte Schritte werden hervorgehoben.
// Ohne JavaScript oder mit „Bewegung reduzieren“ bleibt alles im Ausgangszustand vollständig sichtbar.
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const scrollStories = [];

if (!reduceMotion) {
  document.querySelectorAll('.comparison-stage input[type="range"]').forEach(range => {
    const stage = range.parentElement;
    scrollStories.push(vh => {
      if (range.dataset.manual) return;
      const r = stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.55), 0, 1);
      range.value = Math.round(90 - p * 80);  // 90 % Bestand → 10 % Bestand
      range.dispatchEvent(new Event('input'));
    });
  });

  document.querySelectorAll('.memo-timeline').forEach(line => {
    const steps = [...line.children];
    if (steps.length < 2) return;
    line.classList.add('is-staged');
    scrollStories.push(vh => {
      const r = line.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / Math.max(r.height, vh * 0.35), 0, 1);
      const pos = p * (steps.length - 1);
      steps.forEach((step, i) => {
        step.classList.toggle('is-reached', p > 0 && pos >= i - 0.001);
        step.style.setProperty('--fill', clamp(pos - i, 0, 1).toFixed(3));
      });
    });
  });
}

// Startseite: Der Hero öffnet sich beim ersten Scrollen. Desktop: Bild bleibt kurz stehen, zoomt leicht heraus und dunkelt ab,
// die Überschrift tritt zurück, der nächste Block schiebt sich darüber. Handy: nur leichter Zoom und Abdunkeln.
const heroStage = document.querySelector('.hero-stage');
if (heroStage && !reduceMotion) {
  heroStage.classList.add('is-opening');
  const wide = window.matchMedia('(min-width: 761px)');
  scrollStories.push(vh => {
    const span = wide.matches ? vh * (document.body.classList.contains('page-home') ? 0.6 : 0.35) : vh * 0.8;
    heroStage.style.setProperty('--hp', clamp(window.scrollY / span, 0, 1).toFixed(3));
  });
}

if (scrollStories.length) {
  let queued = false;
  const run = () => { queued = false; const vh = window.innerHeight; scrollStories.forEach(story => story(vh)); };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  run();
}

// Abschnittsleiste: markiert den Abschnitt, in dem man sich gerade befindet; auf dem Handy rückt der Eintrag ins Bild.
const sectionNav = document.querySelector('.section-nav');
if (sectionNav) {
  const links = [...sectionNav.querySelectorAll('a[href^="#"]')];
  const pairs = links.map(link => [link, document.getElementById(link.getAttribute('href').slice(1))]).filter(([, t]) => t);
  let currentLink = null, queued = false;
  const mark = link => {
    if (link === currentLink) return;
    currentLink = link;
    links.forEach(l => l === link ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current'));
    if (link && sectionNav.scrollWidth > sectionNav.clientWidth) {
      sectionNav.scrollTo({ left: link.offsetLeft - 24, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };
  // Aktiv ist der letzte Abschnitt, dessen Anfang das obere Drittel erreicht hat; am Seitenende der letzte.
  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.35;
    let active = null;
    pairs.forEach(([link, target]) => { if (target.getBoundingClientRect().top <= line) active = link; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = pairs[pairs.length - 1][0];
    mark(active);
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
