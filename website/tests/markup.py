"""Strukturprüfung der erzeugten Seiten.

    python3 build.py && python3 tests/markup.py          # prüft dist/
    python3 tests/markup.py preview                       # prüft preview/
"""
from pathlib import Path
from html.parser import HTMLParser
import re, sys

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'dist')


class Markup(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.anchors, self.files, self.controls = [], [], [], []
        self.h1 = 0
        self.imgs_without_alt = 0
        self.forms_without_post = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        href = a.get('href') or ''
        if href.startswith('#') and len(href) > 1: self.anchors.append(href[1:])
        for key in ('src', 'href'):
            value = a.get(key) or ''
            if value and not re.match(r'^(#|https?:|mailto:|tel:|data:)', value): self.files.append(value)
        for candidate in (a.get('srcset') or '').split(','):
            if candidate.strip(): self.files.append(candidate.split()[0])
        if a.get('aria-controls'): self.controls.append(a['aria-controls'])
        if tag == 'h1': self.h1 += 1
        if tag == 'img' and 'alt' not in a: self.imgs_without_alt += 1
        if tag == 'form' and (a.get('method') or '').lower() != 'post': self.forms_without_post += 1


def resolve(page, ref):
    ref = ref.split('#')[0].split('?')[0]
    if ref.startswith('/'):  # 404-Seite: Pfade ab der Domain-Wurzel
        ref = ref.lstrip('/')
        return OUT / ref / 'index.html' if ref.endswith('/') or ref == '' else OUT / ref
    target = (page.parent / ref).resolve()
    return target / 'index.html' if ref.endswith('/') or ref in ('', './') else target


pages = sorted(OUT.rglob('*.html'))
assert pages, f'Keine Seiten in {OUT}'
for page in pages:
    s = page.read_text(encoding='utf-8')
    m = Markup(); m.feed(s)
    assert m.h1 == 1, (page, 'genau eine H1')
    assert len(m.ids) == len(set(m.ids)), (page, 'doppelte ID', [i for i in m.ids if m.ids.count(i) > 1])
    assert set(m.anchors) <= set(m.ids), (page, 'Sprungziel fehlt', set(m.anchors) - set(m.ids))
    assert set(m.controls) <= set(m.ids), (page, 'aria-controls ohne Ziel')
    assert m.imgs_without_alt == 0, (page, 'img ohne alt')
    assert m.forms_without_post == 0, (page, 'Formular ohne method="post"')
    for ref in m.files:
        assert resolve(page, ref).is_file(), (page, 'Datei fehlt', ref)
    if page.name == '404.html':
        assert 'noindex' in s, (page, '404 ohne noindex')
        print(page.relative_to(ROOT), 'verified')
        continue
    if 'id="strategic-form"' in s:
        assert s.count('data-inquiry-step=') == 6
    else:
        assert page.parent.name in ('bewerten', 'ueber-grenford', 'markt'), (page, 'Projektanfrage fehlt')
    # Bewertung/Suchprofile: jedes Formular hat Schritte, einen Kontaktschritt mit Einwilligung und eine Ergebniszone
    for wid in re.findall(r'<form class="wizard" id="wz-([a-z-]+)"', s):
        block = s.split(f'id="wz-{wid}"', 1)[1].split('</form>', 1)[0]
        assert block.count('data-step') >= 3 and 'data-contact' in block and 'name="Einwilligung"' in block, (page, 'Formular unvollständig', wid)
        assert f'id="wz-{wid}-result"' in block and 'name="gf_hp"' in block, (page, 'Ergebnis/Honeypot fehlt', wid)
    if page.parent.name == 'markt':
        # Marktseite: Leerzustand ohne Daten; jede Kennzahl mit Datentyp, Zeitraum, Quelle und Prüfdatum
        cards = s.count('class="mk-card"')
        assert 'data-mk-empty' in s and 'id="marktueberblick"' in s, (page, 'Marktüberblick oder Leerzustand fehlt')
        assert cards == 0 or (s.count('class="mk-type ') >= cards + 2 and s.count('geprüft am') == cards), (page, 'Kennzahl ohne Datentyp/Quelle')
        assert s.count('<label class="mk-filter"') == 4, (page, 'Filter ohne Label')
    else:
        assert 'id="ablauf"' in s
    assert '<meta name="description"' in s and '<link rel="canonical"' in s
    print(page.relative_to(ROOT), 'verified')

css = (OUT / 'site.css').read_text(encoding='utf-8')
for ref in set(re.findall(r"url\('([^']+)'\)", css)):
    assert (OUT / ref).is_file(), ('site.css verweist auf fehlende Datei', ref)
print('site.css verified')
