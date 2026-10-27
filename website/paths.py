"""URLs, Bilder und responsive Varianten für den Build.

Alle Pfade im HTML sind relativ zur jeweiligen Seite. Dadurch läuft dist/ auf jedem
Webserver, in einem Unterordner und als lokale Vorschau.
"""
from pathlib import Path
import html, json

ROOT = Path(__file__).parent
ASSETS = ROOT / 'static' / 'assets'
SITE = json.loads((ROOT / 'site.json').read_text(encoding='utf-8'))
WIDTHS = (800, 1280)  # zusätzliche Breiten für srcset; das Original bleibt die größte Stufe

_prefix = ''
pretty = True          # False = Links mit index.html (für Vorschau ohne Verzeichnis-Index)
missing = set()        # Bilder, die in static/assets fehlen
used = set()           # Bilder, die tatsächlich eingebunden werden


def set_page(depth):
    global _prefix
    _prefix = '../' * depth


def page(key):
    """Link auf eine Seite: 'home', 'investment', 'property', 'projects'."""
    target = '' if key == 'home' else key + '/'
    url = _prefix + target
    if not pretty:
        url += 'index.html'
    return url or './'


def root(name):
    """Datei im Wurzelordner der Ausgabe (site.css, app.js, ux.js)."""
    return _prefix + name


def asset(name):
    if not (ASSETS / name).is_file():
        missing.add(name)
        return _prefix + 'assets/placeholder.svg'
    used.add(name)
    return _prefix + 'assets/' + name


def absolute(path=''):
    return SITE['siteUrl'].rstrip('/') + '/' + path.lstrip('/')


def _size(name):
    try:
        from PIL import Image
        with Image.open(ASSETS / name) as im:
            return im.size
    except Exception:
        return None


def img(name, alt='', sizes='100vw', attrs=''):
    """<img> mit srcset, width/height und Ersatzbild für fehlende Dateien."""
    src = asset(name)
    alt = html.escape(alt, quote=True)
    if name in missing:
        return f'<img src="{src}" alt="{alt}" data-missing="{html.escape(name)}" {attrs}>'
    size = _size(name)
    wh = f' width="{size[0]}" height="{size[1]}"' if size else ''
    srcset = ''
    if size:
        steps = [w for w in WIDTHS if w < size[0] * 0.9]
        if steps:
            parts = [f'{_prefix}assets/w{w}/{name} {w}w' for w in steps] + [f'{src} {size[0]}w']
            srcset = f' srcset="{", ".join(parts)}" sizes="{sizes}"'
    return f'<img src="{src}"{srcset} alt="{alt}"{wh} {attrs}>'.replace('  ', ' ').replace(' >', '>')
