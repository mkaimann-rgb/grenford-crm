# GRENFORD PROPERTY BRIEF – Gestaltungsbibliothek
# --------------------------------------------------------------------------
# Enthält das komplette Seitendesign (Raster, Farben, Schriften, Seitenmodule).
# Objektbezogene Inhalte stehen ausschließlich in objekte/<name>/objekt.json.
# Koordinaten in pt, Ursprung unten links (Seitenformat 907 × 567 pt).
import json, math, os, re
from PIL import ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHARED = os.path.join(ROOT, 'shared')

H = 567.0
NAVY = '#212e40'; INK = '#29394e'; ACC = '#4f6a92'; GREY = '#5f6470'
CREAM = '#faf6f2'; LINE = '#ddd6cb'; MIST = '#dfe4ec'; LIGHT = '#a9b8cf'
HALF = 453.5          # 50/50-Bildsplit
TX = 500              # Textbeginn neben linkem Halbseitenbild
COL = 368.4           # Breite der Bildspalte (Titel, Vorwort, Inhalt, Kontakt, Über GRENFORD)
FS = 8.2              # Fußzeile und Seitenzahl (1 pt größer, 19.11.2026)
FONT = {'B': ("'DM Sans',sans-serif;font-weight:500", .34),
        'N': ("'DM Sans',sans-serif;font-weight:400", .34),
        'S': ("'GF Serif',serif;font-weight:400", .22),
        'SB': ("'GF Serif',serif;font-weight:700", .22),
        'H': ("'DM Sans',sans-serif;font-weight:500", .34),
        'L': ("'DM Sans',sans-serif;font-weight:300", .34),
        'M': ("'DM Mono',monospace;font-weight:400", .34),
        'G': ("'GF Logo',serif;font-weight:500", .31)}
_TTF = {'S': 'texgyrepagella-regular.otf', 'N': 'dm-sans-400.ttf', 'B': 'dm-sans-500.ttf'}


class Ctx:
    """Laufzeitkontext: aktuelle Seite, Fußzeile, Asset-Auflösung."""
    def __init__(self, objdir, meta):
        self.objdir = objdir; self.meta = meta; self.page = 0; self.labels = {}
        self.foot = meta['fusszeile']

    def a(self, name):  # Asset-Pfad relativ zur HTML-Datei im Objektordner
        if os.path.exists(os.path.join(self.objdir, 'assets', name)):
            return 'assets/' + name
        if os.path.exists(os.path.join(SHARED, 'assets', name)):
            return '../../shared/assets/' + name
        raise FileNotFoundError(name)


C = None  # wird vom Builder gesetzt


# ------------------------------------------------------------ Grundelemente
def width(text, f, size, spacing=0.0):
    text = str(text).replace('&nbsp;', ' ').replace('&amp;', '&').replace('&gt;', '>')
    if f == 'S' and sans_only():   # Titel in DM Sans Medium, 90 %, Laufweite -0,035 em
        font = ImageFont.truetype(os.path.join(SHARED, 'fonts', 'dm-sans-var.ttf'), 400)
        try: font.set_variation_by_axes([14, 500])
        except Exception: pass
        t = re.sub(r'<[^>]+>', '', text)
        return (font.getlength(t) / 400 - .035 * len(t)) * size * .9
    font = ImageFont.truetype(os.path.join(SHARED, 'fonts', _TTF.get(f, _TTF['N'])), 400)
    return font.getlength(re.sub(r'<[^>]+>', '', text)) * size / 400 * 1.0 + spacing * size * len(text)


HEADLINE = True   # Überschriften in DM Sans Medium, eng gesetzt, ohne Schlusspunkt (wie Website)


NUMERIC = re.compile(r'^[\d\s.,–\-+×%€/²()·~]*(ca\.|ab|m²|m|kWh)?[\d\s.,–\-+×%€/²()·m]*$')


def sans_only():
    return C is not None and C.meta.get('typo') == 'sans'


_LOGO = None


def _logo_w(t):
    """Breite einer Zeile in pt bei 1 pt Schriftgröße (Versalien, Sperrung 0,08 em = Logo-Tracking +80)."""
    global _LOGO
    if _LOGO is None:
        _LOGO = ImageFont.truetype(os.path.join(SHARED, 'fonts', 'cormorant-garamond-var.ttf'), 400)
        try: _LOGO.set_variation_by_axes([500])
        except Exception: pass
    t = t.upper().strip()
    return _LOGO.getlength(t) / 400 + .08 * len(t)


def _map_serif(f, size, color, text, w, extra, x=0):
    """Typosystem ohne Serifen: DM Sans Medium (Titel), DM Sans Light (Einleitungen, große Zahlen), DM Mono (Beträge)."""
    plain = re.sub(r'<[^>]+>', ' ', text).strip()
    strip = lambda t: re.sub(r'\.(\s*</?[^>]*>)*$', '', t)
    if re.search(r'\d', plain) and (NUMERIC.match(plain) or len(plain) <= 20):
        if size >= 18: return 'L', size, text, 'letter-spacing:-.02em;font-variant-numeric:tabular-nums;' + extra
        return 'N', size, text, 'font-variant-numeric:tabular-nums;' + extra
    if size >= 19 and (plain.startswith('Ihr Marco') or (color == CREAM and x >= 600)):   # Name, Werte in blauen Spalten
        return 'H', round(size * .9, 1) if size >= 22 else size, strip(text), 'letter-spacing:-.035em;' + extra
    if size >= 19:   # Hauptüberschriften in der Logo-Typografie: Cormorant Garamond Medium, Versalien, Tracking +80 (Logo-Spezifikation 28.02.2026)
        t = strip(text); lines = [re.sub(r'<[^>]+>', '', l) for l in re.split(r'<br\s*/?>', t)]
        if color == CREAM and x < 100: maxw = 270
        elif x >= 400: maxw = 856 - x
        elif len(lines) > 1: maxw = 356
        else: maxw = 560
        sz = size * .78
        need = max(_logo_w(l) for l in lines)
        sz = round(min(sz, maxw / need), 2)
        return 'G', sz, t, f'text-transform:uppercase;letter-spacing:.08em;--tl:{sz/size};' + extra
    if w and len(plain) > 60:
        return 'L', size, text, extra
    return 'B', round(size * .94, 1), strip(text), 'letter-spacing:-.01em;' + extra


def T(x, base, f, size, tl, color, text, w=None, extra=''):
    if f in ('S', 'SB') and sans_only():
        f, size2, text, extra = _map_serif(f, size, color, text, w, extra, x)
        if f == 'G': tl = round(tl * size2 / size * 1.08, 2)
        size = size2
    elif HEADLINE and f == 'S' and size >= 22 and color == INK:
        f = 'H'; size = round(size * .9, 1); text = re.sub(r'\.$', '', text)
        extra = 'letter-spacing:-.035em;' + extra
    text = re.sub(r'(\d) (%|€|m²|Mio\.|T€|km|ha|h\b|min\b)', '\\1&nbsp;\\2', str(text))   # Zahl und Einheit nie trennen
    fam, k = FONT[f]
    top = H - base - tl / 2 - k * size
    ws = f'width:{w}pt;' if w else 'white-space:nowrap;'
    return (f'<div class="t" style="left:{x}pt;top:{top:.2f}pt;font-family:{fam};'
            f'font-size:{size}pt;line-height:{tl}pt;color:{color};{ws}{extra}">{text}</div>')


def EB(x, base, text, color=None, size=7):
    color = color or ACC
    if sans_only():
        return T(x, base, 'M', round(size * .95, 2), size * 1.45, color, text, extra='letter-spacing:.06em;text-transform:uppercase')
    return T(x, base, 'B', size, size * 1.45, color, text, extra='letter-spacing:.07em;text-transform:uppercase')


def RT(x2, base, f, size, tl, color, text, w=200):
    return T(x2 - w, base, f, size, tl, color, text, w=w, extra='text-align:right')


def R(x, y, w, h, color=None, a=1, extra=''):
    color = color or NAVY
    rad = f'border-radius:{13.5 if h >= 60 else 7}pt;' if (color == NAVY and a == 1 and C.page >= 2) else ''
    return f'<div class="t" style="left:{x}pt;top:{H-y-h:.2f}pt;width:{w}pt;height:{h}pt;background:{color};opacity:{a};{rad}{extra}"></div>'


def L(x1, y, x2, color=LINE, w=0.5):
    return f'<div class="t" style="left:{x1}pt;top:{H-y-w/2:.2f}pt;width:{x2-x1}pt;height:{w}pt;background:{color}"></div>'


def VL(x, y1, y2, color, w):
    return f'<div class="t" style="left:{x-w/2}pt;top:{H-y1}pt;width:{w}pt;height:{y1-y2}pt;background:{color}"></div>'


CH = 58   # Länge der abgeschrägten Bildecke in pt


def design(key):
    # Abgeschrägte Ecken und Linien wurden getestet und verworfen (18.11.2026):
    # Alle Property Briefs behalten die geraden Bildkanten des Originals.
    return False


def SLANT(seite):
    """Abgeschrägte Bildecke zur Seitenmitte (unten innen) inkl. feiner Fortsetzungslinie."""
    if not design('schraege'): return '', ''
    if seite == 'links':
        clip = f'clip-path:polygon(0 0,100% 0,100% calc(100% - {CH}pt),calc(100% - {CH}pt) 100%,0 100%);'
        return clip, ''
    clip = f'clip-path:polygon(0 0,100% 0,100% 100%,{CH}pt 100%,0 calc(100% - {CH}pt));'
    x0 = 907 - HALF
    return clip, ''


def DIAG(x1, y1, x2, y2, color=LIGHT, w=.7, a=.9):
    """Feine Diagonale von (x1,y1) nach (x2,y2), Ursprung unten links."""
    L_ = math.hypot(x2 - x1, y2 - y1); ang = math.degrees(math.atan2(-(y2 - y1), x2 - x1))
    return (f'<div class="t" style="left:{x1}pt;top:{H-y1:.2f}pt;width:{L_:.2f}pt;height:{w}pt;background:{color};opacity:{a};'
            f'transform-origin:0 0;transform:rotate({ang:.2f}deg)"></div>')


def COLCUT():
    """Abgeschrägte Ecke unten innen an der Bild-/Farbspalte (Titel, Vorspann, Anhang)."""
    return f'clip-path:polygon(0 0,100% 0,100% calc(100% - {CH}pt),calc(100% - {CH}pt) 100%,0 100%);' if design('spalte') else ''


def COLLINE():
    return ''   # keine Linien (Entscheidung GRENFORD 18.11.2026)


def IMG(src, x, y, w, h, pos='center', size='cover', extra=''):
    return (f'<div class="t" style="left:{x}pt;top:{H-y-h:.2f}pt;width:{w}pt;height:{h}pt;'
            f'background:url({C.a(src)}) {pos}/{size} no-repeat;{extra}"></div>')


def PIC(src, x, y, w, h):
    return f'<img class="t" src="{C.a(src)}" style="left:{x}pt;top:{H-y-h:.2f}pt;width:{w}pt;height:{h}pt">'


THEMES = {   # Dachmarke GRENFORD: gleiche Typografie und Raster, Akzentfarbe und Logo je Geschäftsbereich
    'property':   {'NAVY': '#212e40', 'ACC': '#4f6a92', 'LIGHT': '#a9b8cf', 'mark': {'navy': 'navy', 'white': 'white'}},
    'investment': {'NAVY': '#24534c', 'ACC': '#2e6b62', 'LIGHT': '#8fc7bb', 'mark': {'navy': 'inv-dark', 'white': 'inv-white'}},
}


def MARK(color='navy', x=51, y=516.0142, scale=.068564):
    color = THEMES[C.meta.get('bereich', 'property')]['mark'].get(color, color) if C else color
    return PIC(f'mark-{color}.png', x, y, round(773 * scale, 3), round(379 * scale, 3))


def HEAD(label):
    return EB(600, 529, label, ACC, 9)


SHADOW = 'font-weight:500;text-shadow:0 0 6pt rgba(20,28,40,.9),0 0 2.5pt rgba(20,28,40,.85),0 0 1pt rgba(20,28,40,.9);'
IMGCOL = '#ffffff'   # Fußzeile auf Fotos: weiß mit weichem Schatten; auf Papier: Grau


def PN(color=None, img=False):
    if img: return T(830, 12, 'B', FS, 10, IMGCOL, C.labels.get(C.page, ''), extra=SHADOW)
    return T(830, 12, 'B', FS, 10, color or INK, C.labels.get(C.page, ''))


def FOOT(color=GREY, text=None, img=False):
    if img:
        t = text or C.foot
        if len(t) > 48: t = t.split(' · ')[0]   # kurze Fassung auf schmalen Bildspalten
        return T(51, 10.8, 'N', FS, 10, IMGCOL, t, extra='letter-spacing:.05em;' + SHADOW)
    return T(51, 10.8, 'N', FS, 10, color, text or C.foot, extra='letter-spacing:.05em')


def chrome(label, logo='navy', foot=True, foot_img=False, pn_img=False):
    s = MARK(logo) if logo else ''
    s += HEAD(label)
    if foot: s += FOOT(img=foot_img)
    return s + PN(img=pn_img)


def head(eb, title, size=31, tl=34, base_t=436):
    return EB(51, 477, eb) + T(51, base_t, 'S', size, tl, INK, title)


def cap(x, base, text, w=None):
    return T(x, base, 'N', 7.4, 10.5, GREY, text, w=w)


def CHIPS(x, base, items):
    inner = ''.join(f'<span style="display:inline-block;border:.6pt solid {NAVY};color:{NAVY};border-radius:20pt;padding:1.6pt 7pt;margin:0 4pt 4pt 0;font-size:6.9pt;line-height:9pt">{c}</span>' for c in items)
    return f'<div class="t" style="left:{x}pt;top:{H-base-7:.2f}pt;width:360pt;font-family:\'DM Sans\',sans-serif;font-weight:500">{inner}</div>'


def br(v):
    return '<br>'.join(v) if isinstance(v, list) else v


def eur(v, dec=2):
    s = f'{v:,.{dec}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return s + ' €'


def pct(v, dec=2):
    return f'{v:.{dec}f}'.replace('.', ',') + ' %'


# ------------------------------------------------------------ Karte Berlin
def _berlin_projection():
    d = json.load(open(os.path.join(SHARED, 'geo', 'berlin_bezirke.geojson')))
    polys = []
    for f in d['features']:
        g = f['geometry']; cs = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        polys += cs
    k = math.cos(math.radians(52.5))
    lons = [x for p in polys for r in p for x, y in r]; lats = [y for p in polys for r in p for x, y in r]
    minx, maxx, miny, maxy = min(lons) * k, max(lons) * k, min(lats), max(lats)
    W, Hh, pad = 400, 323.68, 10
    sc = min((W - 2 * pad) / (maxx - minx), (Hh - 2 * pad) / (maxy - miny))
    ox = (W - (maxx - minx) * sc) / 2; oy = (Hh - (maxy - miny) * sc) / 2
    return polys, lambda lon, lat: ((lon * k - minx) * sc + ox, (maxy - lat) * sc + oy)


def berlin_map_png(path):
    """Zeichnet die Bezirkskarte (offene Daten, CC BY) als PNG."""
    from PIL import Image, ImageDraw, ImageFilter
    polys, P = _berlin_projection(); S = 6; W, Hh = 400, 323.68
    img = Image.new('RGBA', (int(W * S), int(Hh * S)), (0, 0, 0, 0)); dr = ImageDraw.Draw(img)
    for p in polys:
        dr.polygon([(x * S, y * S) for x, y in (P(*c) for c in p[0])], fill=(230, 233, 237, 255))
    for p in polys:
        for r in p:
            dr.line([(x * S, y * S) for x, y in (P(*c) for c in r)], fill=(255, 255, 255, 255), width=int(1.2 * S), joint='curve')
    mask = Image.new('L', img.size, 0); md = ImageDraw.Draw(mask)
    for p in polys:
        md.polygon([(x * S, y * S) for x, y in (P(*c) for c in p[0])], fill=255)
    edge = mask.filter(ImageFilter.MaxFilter(9))
    base = Image.new('RGBA', img.size, (0, 0, 0, 0)); base.paste(Image.new('RGBA', img.size, (122, 134, 150, 255)), (0, 0), edge)
    base.alpha_composite(img); base.save(path)


# ============================================================ Seitenmodule
def m_titel(d):
    lines = d['titel']
    ts = d.get('titel_groesse') or min(44, 270.4 / max(width(l, 'S', 1) for l in lines))
    tl = ts * 43 / 36.5
    vals = d['kennzahlen']
    ws = [max(width(v, 'S', 19), width(l.upper(), 'N', 6.6, .04)) for v, l in vals]
    gap = (490 - sum(ws)) / (len(vals) + 1); xs = []; x = 390 + gap
    for w in ws: xs.append(round(x, 2)); x += w + gap
    s = (IMG(d['bild'], 0, 0, 907, 567, d.get('bild_pos', 'center'))
         + R(0, 0, COL, 567, NAVY, .6, extra=COLCUT()) + COLLINE() + MARK('white', 47, 450.63, .217335)
         + EB(51, 404, d.get('dachzeile', 'Property Brief'), CREAM, 8.5)
         + (RT(856, 529, 'B', 7, 10, CREAM, br(d['vertraulich']), 400, ) .replace('text-align:right', 'text-align:right;text-transform:uppercase;letter-spacing:.08em;text-shadow:0 0 4pt rgba(20,28,40,.6)') if d.get('vertraulich') else '')
         + T(49, 297 + tl, 'S', round(ts, 2), round(tl, 2), CREAM, br(lines))
         + T(51, 219, 'S', 19, 25, CREAM, br(d['untertitel']))
         + T(51, 156, 'N', 10, 15, MIST, br(d['kurz']))
         + T(51, 84, 'S', 14, 18, CREAM, d['adresse'][0]) + T(51, 68, 'N', 10, 14, CREAM, d['adresse'][1])
         + R(390, 25, 490, 83, NAVY, .6))
    for x, (v, l) in zip(xs, vals):
        s += T(x, 71, 'S', 19, 26, CREAM, v) + T(x, 48, 'N', 6.6, 9, CREAM, l.upper(), extra='letter-spacing:.04em')
    return s + T(51, 22, 'N', 6.2, 8.7, MIST, d['hinweis'])


def m_vorwort(d):
    return (HEAD('Vorwort') + PN() + IMG('marco-kaimann.jpg', 0, 0, COL, 567, 'center top', extra=COLCUT()) + COLLINE()
            + EB(447, 485, d['dachzeile']) + T(447, 440, 'S', 32, 34, INK, d['titel'])
            + T(447, 395, 'S', 14.5, 20.5, INK, d['lead'], w=409)
            + T(447, 305, 'N', 9.8, 14.8, INK, d['links'], w=180) + VL(637, 315, 240, '#a5b1bf', .8)
            + T(655, 305, 'N', 9.8, 14.8, INK, d['rechts'], w=200)
            + T(447, 200, 'N', 9.8, 14.8, INK, d['schluss'], w=409)
            + IMG('signature.png', 447, 100, 214, 43, 'left center', 'contain')
            + T(447, 70, 'S', 19, 26, INK, 'Ihr Marco Kaimann') + T(447, 50, 'N', 7.5, 10, GREY, 'Geschäftsinhaber GRENFORD')
            + FOOT(img=True))


def m_inhalt(d):
    s = (HEAD('Inhalt') + PN() + IMG(d['bild'], 0, 0, COL, 567, d.get('bild_pos', 'center'), extra=COLCUT())
         + R(0, 0, COL, 567, NAVY, .4, extra=COLCUT()) + COLLINE() + MARK('white') + FOOT(img=True)
         + EB(51, 403, 'Ihr Überblick', CREAM, 8) + T(51, 349, 'S', 32, 37, CREAM, br(d['claim']))
         + L(51, 262, 331, '#aeb5be') + EB(51, 230, d['marke'], CREAM, 9)
         + T(51, 204, 'N', 10, 14.5, CREAM, br(d['text'])) + T(51, 81, 'N', 10, 14.5, CREAM, br(d['adresse'])))
    n = len(d['kapitel']); step = min(60, 432 / n)
    for i, k in enumerate(d['kapitel']):
        ln = 494 - step * i
        s += (L(447, ln, 856) + T(447, ln - 31, 'S', 22, 30, ACC, f'{i+1:02d}')
              + T(521, ln - 24, 'S', 15.5, 21, INK, k['titel']) + T(521, ln - 40, 'N', 7.8, 11, GREY, k['sub'])
              + RT(856, ln - 24, 'N', 8, 11.6, ACC, k['_seiten'], 60))
    return s + L(447, 494 - step * n, 856)


def m_ueberblick(d):
    s = (chrome(d.get('kopf', 'Auf einen Blick')) + head(d['dachzeile'], d['titel'])
         + T(51, 397, 'N', 10.5, 15.5, INK, d['intro'], w=545) + R(632, 34, 224, 464)
         + EB(660, 469, 'Kennzahlen', CREAM, 8))
    for i, k in enumerate(d['kennzahlen']):
        b = 409 - 117 * i
        s += T(660, b, 'S', 30, 40, CREAM, k['wert']) + EB(660, b - 26, k['label'], CREAM)
        if k.get('sub'): s += T(660, b - 41, 'N', 7.5, 10, MIST, k['sub'])
    s += T(660, 76, 'N', 7, 10, MIST, br(d['kennzahlen_hinweis']))
    lx = d.get('label_x', 186)
    for i, (k, v) in enumerate(d['zeilen']):
        st = min(28, 209 / len(d['zeilen'])); ln = 331 - st * i; o_ = round(st * .62, 2)
        s += L(51, ln, 596) + T(51, ln - o_, 'N', 8, 11.6, GREY, k) + T(lx, ln - o_, 'N', 9.2, 13, INK, v)
    s += L(51, 331 - min(28, 209 / len(d['zeilen'])) * len(d['zeilen']), 596) if len(d['zeilen']) > 7 else ''
    if d.get('banner'):
        s += (R(51, 54, 545, 64) + EB(65, 100, d['banner']['label'], LIGHT, 6.8)
              + T(65, 82, 'N', 8.8, 12.5, CREAM, br(d['banner']['text'])))
    return s + cap(51, 40, d['quelle'])


def m_split(d):
    """50/50-Seite: Bild links oder rechts, Text mit Liste."""
    right = d.get('bild_seite', 'rechts') == 'rechts'
    x0, xr = (51, 407) if right else (TX, 856)
    lw = d.get('label_breite', 100)
    cl, ln_ = SLANT('rechts' if right else 'links')
    s = (IMG(d['bild'], 907 - HALF if right else 0, 0, HALF, 567, d.get('bild_pos', 'center'), extra=cl) + ln_
         + chrome(d['kopf'], foot_img=not right, pn_img=right) + EB(x0, 487, d['dachzeile']) + T(x0, 447, 'S', 31, 34, INK, br(d['titel']))
         + T(x0, 372, 'N', 9.8, 14.5, INK, d['intro'], w=356))
    for i, (h, t) in enumerate(d['liste']):
        ln = 300 - 56 * i
        s += L(x0, ln, xr) + T(x0, ln - 18, 'S', 12.5, 16, INK, h) + T(x0 + lw, ln - 18, 'N', 8.8, 12.6, INK, t, w=xr - x0 - lw)
    s += L(x0, 300 - 56 * len(d['liste']), xr)
    return s + cap(x0, 52, br(d['caption']))


def m_lage(d):
    _, P = _berlin_projection(); k = d['karte']
    tx, ty = P(k['lon'], k['lat']); tipx = 27 + tx; tipy = 73.32 + ty   # Spitze, von oben gemessen
    cx = tipx; cy = tipy - 18.03
    s = (HEAD('Lage &amp; Umfeld') + PN() + R(0, 0, HALF, 567, '#ffffff')
         + PIC('berlin-karte.png', 27, 170, 400, 323.68) + MARK() + FOOT()
         + f'<div class="t" style="left:{cx-29.25:.2f}pt;top:{cy-29.25:.2f}pt;width:58.5pt;height:58.5pt;border-radius:50%;border:.75pt dashed rgba(33,46,64,.45)"></div>'
         + f'<div class="t" style="left:{cx-12.75:.2f}pt;top:{cy-12.75:.2f}pt;width:25.5pt;height:25.5pt;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:{NAVY};box-shadow:0 0 0 2.25pt rgba(250,246,242,.85)"></div>'
         + T(round(cx - 12.75, 2), round(H - cy - 2.6, 2), 'SB', 7.5, 10, CREAM, 'GF', extra='width:25.5pt;text-align:center'))
    lx = min(cx + 26, HALF - 175); lb = H - cy + 6
    s += (R(round(lx, 2), round(lb, 2), 165, 44) + T(round(lx + 12, 2), round(lb + 28, 2), 'S', 11, 14, CREAM, k['label'][0])
          + T(round(lx + 12, 2), round(lb + 16, 2), 'N', 7, 9, MIST, k['label'][1])
          + T(round(lx + 12, 2), round(lb + 6, 2), 'N', 5.6, 8, LIGHT, 'GRENFORD PROJECT SITE', extra='letter-spacing:.06em')
          + cap(27, 40, 'Kartendarstellung schematisch, Standort ungefähr. Kartengrundlage: Bezirksgrenzen Berlin,<br>Amt für Statistik Berlin-Brandenburg (via Berliner Morgenpost, CC BY); Gestaltung: GRENFORD.')
          + EB(TX, 481, d['dachzeile']) + T(TX, 448, 'S', 24, 26, INK, br(d['titel']))
          + T(TX, 392, 'N', 8.8, 12.6, INK, d['intro'], w=356))
    for i, g in enumerate(d['gruppen']):
        ln = 336 - 58 * i
        s += L(TX, ln, 856) + T(TX, ln - 18, 'S', 12, 16, INK, g['titel']) + T(TX, ln - 34, 'N', 7.8, 11, INK, g['text'], w=356)
    s += R(TX, 56, 356, 108)
    for i, o in enumerate(d['oepnv']):
        b = 145 - 30 * i
        s += T(TX + 14, b, 'S', 9.5, 13, CREAM, o['titel']) + T(TX + 14, b - 12, 'N', 7, 9, MIST, o['text'])
    return s + cap(TX, 40, br(d['quelle']))


def m_raumprogramm(d):
    XR = 407
    cl, ln_ = SLANT('rechts')
    s = (MARK() + FOOT() + IMG(d['bild'], 907 - HALF, 0, HALF, 567, d.get('bild_pos', 'center'), extra=cl) + ln_
         + HEAD('Das Raumprogramm') + PN(img=True)
         + EB(51, 481, d['dachzeile']) + T(51, 446, 'S', 24, 26, INK, br(d['titel']))
         + T(51, 392, 'N', 8.8, 12.6, INK, d['intro'], w=XR - 51)
         + EB(51, 340, 'Ebene und Räume', NAVY, 6.6) + RT(XR, 340, 'B', 6.6, 9, NAVY, 'LAUT AUFMASS', 120))
    for i, (lv, rooms, note, area) in enumerate(d['ebenen']):
        ln = 330 - 50 * i
        s += (L(51, ln, XR) + T(51, ln - 18, 'S', 12, 15, INK, lv) + RT(XR, ln - 18, 'S', 10.5, 14, NAVY, area, 130)
              + T(51, ln - 32, 'N', 8, 11, INK, rooms) + T(51, ln - 43, 'N', 7.2, 10, GREY, note))
    s += (L(51, 330 - 50 * len(d['ebenen']), XR) + R(51, 40, XR - 51, 82)
          + EB(65, 104, 'Flächen richtig einordnen', CREAM, 6.6)
          + T(65, 87, 'N', 7.8, 11, CREAM, d['flaechen_hinweis'], w=XR - 51 - 28)
          + T(907 - HALF + 12, 22, 'N', 6.6, 9, CREAM, d['caption'], extra='text-shadow:0 0 4pt rgba(20,28,40,.55)'))
    return s


PLANCOL = {'wohn': '#bbd3f7', 'kueche': '#f1deba', 'nass': '#b3e2e2', 'weg': '#ded4eb', 'neben': '#e3d7c4', 'aussen': '#c6ddc6'}
PLANLEG = [('wohn', 'Wohnen und Schlafen'), ('kueche', 'Küche'), ('nass', 'Bad und WC'), ('weg', 'Flur und Treppe'), ('neben', 'Technik und Abstellraum'), ('aussen', 'Außenbereich')]


def _plancard(x, p):
    w = 394; s = R(x, 40, w, 364, '#ffffff')
    s += T(x + 16, 381, 'S', 16, 20, INK, p['name']) + RT(x + w - 16, 382, 'B', 6.6, 9, ACC, p['art'].upper(), 200)
    s += L(x + 16, 370, x + w - 16) + IMG(p['bild'], x + 10, 66, 218, 296, 'center', 'contain')
    tx = x + 238; tr = x + w - 14
    s += EB(tx, 352, 'Raum', GREY, 6.3) + RT(tr, 352, 'B', 6.3, 9, GREY, 'CA. M²', 50)
    for i, (n, r, a, est, col) in enumerate(p['raeume']):
        b = 336 - 16.5 * i
        s += R(tx, b - 1.5, 8, 8, PLANCOL[col]) + T(tx + 12, b, 'N', 6.5, 9, GREY, n) + T(tx + 25, b, 'N', 8.2, 11, INK, r)
        s += RT(tr, b, 'N' if est else 'B', 8.2, 11, GREY if est else NAVY, a + ('*' if est else ''), 50)
    s += L(tx, 336 - 16.5 * len(p['raeume']) + 8, tr) + EB(tx, 228, 'Maßketten (m)', GREY, 6.3)
    for i, (k, tot, part) in enumerate(p['massketten']):
        b = 212 - 23 * i
        s += T(tx, b, 'N', 7.8, 10, INK, k) + RT(tr, b, 'B', 7.8, 10, INK, tot, 50)
        if part: s += T(tx, b - 9, 'N', 6.2, 8, GREY, part)
    for i, n in enumerate(p['hinweise']):
        s += T(x + 16, 58 - 9.5 * i, 'N', 6.6, 9, GREY, n)
    return s


def m_grundrisse(d):
    s = chrome('Grundrisse', foot=False) + EB(51, 477, d['dachzeile']) + T(51, 442, 'S', 31, 34, INK, d['titel'])
    x = 51
    for k, t in PLANLEG:
        s += R(x, 415, 8, 8, PLANCOL[k]) + T(x + 12, 416.5, 'N', 7.2, 10, GREY, t); x += 22 + len(t) * 4.0
    s += RT(856, 416.5, 'N', 7.2, 10, GREY, 'Flächen fett: laut Aufmaß · * aus dem Plan geschätzt', 300)
    s += _plancard(51, d['plaene'][0]) + _plancard(462, d['plaene'][1])
    return s + RT(856, 443, 'N', 7.6, 11, GREY, 'Maße in Metern gemäß Aufmaß · nicht zur Maßentnahme geeignet', 360) + FOOT()


def m_sanierung(d):
    b = d['bilder']
    if len(b) == 1:
        cl, ln_ = SLANT('links'); s = IMG(b[0]['bild'], 0, 0, HALF, 567, b[0].get('pos', 'center'), extra=cl) + ln_
    else:
        s = IMG(b[0]['bild'], 0, 291.92, HALF, 275.08, b[0].get('pos', 'center')) + IMG(b[1]['bild'], 0, 0, HALF, 289.92, b[1].get('pos', 'center'), extra=SLANT('links')[0]) + SLANT('links')[1]
    s += chrome(d['kopf'], foot_img=True) + EB(TX, 481, d['dachzeile']) + T(TX, 446, 'S', 24, 26, INK, br(d['titel']))
    for i, (h, t) in enumerate(d['bloecke']):
        ln = 392 - 108 * i
        s += (L(TX, ln, 856) + EB(TX, ln - 15, f'0{i+1}', ACC, 7) + T(TX, ln - 35, 'S', 16, 21, INK, h)
              + T(TX, ln - 54, 'N', 9, 13.4, INK, t, w=356))
    return s + cap(TX, 40, br(d['caption']))


def m_projektstand(d):
    s = chrome(d.get('kopf', 'Projektstand')) + head(d['dachzeile'], d['titel']) + T(51, 398, 'N', 10, 15, INK, br(d['intro']))
    y0 = 348
    for blk in d['bloecke']:
        s += T(51, y0, 'S', 15, 20, INK, blk['titel'])
        for i, (k, desc, tag, akz) in enumerate(blk['zeilen']):
            ln = y0 - 12 - 31 * i
            s += (L(51, ln, 596) + T(51, ln - 16, 'N', 9.2, 12, INK, k) + T(51, ln - 28, 'N', 7.6, 10, GREY, desc)
                  + RT(596, ln - 16, 'B', 8.6, 12, ACC if akz else INK, tag, 170))
        s += L(51, y0 - 12 - 31 * len(blk['zeilen']), 596)
        y0 = y0 - 12 - 31 * len(blk['zeilen']) - 36
    s += cap(51, 40, d['quelle']) + R(632, 34, 224, 464) + EB(660, 469, d['spalte_titel'], CREAM, 8)
    # einheitliche Wertgröße und gleichmäßige Abstände
    gs = min([22] + [168 / width(k['wert'], 'S', 1) for k in d['spalte']])
    hts = [gs + 22 + (13 if k.get('sub') else 0) for k in d['spalte']]
    top, bottom = 432, 150
    gap = (top - bottom - sum(hts)) / max(1, len(hts) - 1)
    y = top
    for k, hgt in zip(d['spalte'], hts):
        b = y - gs * .8
        s += T(660, b, 'S', round(gs, 1), round(gs * 1.2, 1), CREAM, k['wert']) + EB(660, b - 20, k['label'], LIGHT, 6.8)
        if k.get('sub'): s += T(660, b - 33, 'N', 7.5, 10, MIST, k['sub'], w=180)
        y -= hgt + gap
    return s + T(660, 90, 'N', 7, 10, MIST, br(d['spalte_hinweis']))


def m_energie(d):
    s = (R(0, 0, HALF, 567, '#ffffff') + IMG(d['bild'], 40, 40, HALF - 80, 440, 'center', 'contain')
         + chrome('Energieausweis') + cap(51, 26, d['caption'])
         + EB(TX, 487, 'Pflichtangaben nach § 87 GEG') + T(TX, 447, 'S', 31, 34, INK, d['titel'])
         + T(TX, 410, 'N', 9.8, 14.5, INK, d['intro'], w=356))
    for i, (k, v) in enumerate(d['zeilen']):
        ln = 360 - 27 * i
        s += L(TX, ln, 856) + T(TX, ln - 17, 'N', 8.4, 12, GREY, k) + RT(856, ln - 17, 'B', 9, 12, NAVY, v, 200)
    s += L(TX, 360 - 27 * len(d['zeilen']), 856)
    return s + (R(TX, 40, 356, 120) + EB(TX + 18, 140, 'Energieeffizienzklasse', LIGHT, 6.6) + (T(TX + 18, 86, 'L', 34, 40, CREAM, d['klasse'], extra='letter-spacing:-.02em;') if sans_only() else T(TX + 18, 70, 'S', 54, 58, CREAM, d['klasse']))
                + VL(TX + 150, 144, 56, 'rgba(169,184,207,.45)', .6)
                + EB(TX + 170, 140, 'Endenergiebedarf', LIGHT, 6.6) + T(TX + 170, 86, 'S', 34, 40, CREAM, d['endenergie'])
                + T(TX + 170, 64, 'N', 8.4, 11, MIST, 'kWh/(m²·a)'))


def m_kosten(d, obj):
    k = obj['kosten']; ge = k['grunderwerbsteuer']; co = k['courtage_brutto']
    units = k['einheiten']
    s = chrome('Kaufpreis &amp; Kosten') + head('Kaufpreis · Erwerbsnebenkosten · Courtage', 'Was Sie einplanen sollten.')
    if len(units) == 1:
        p = units[0]['preis']; g = p * ge / 100; c = p * co / 100; tot = p + g + c
        s += (T(51, 398, 'N', 10, 15, INK, 'Alle Positionen rechnerisch auf Basis des Kaufpreises. Notar- und Grundbuchkosten hängen vom Vertrag ab<br>und werden nicht pauschal angesetzt.', w=560)
              + EB(51, 352, 'Position', NAVY, 6.8) + RT(596, 352, 'B', 6.8, 9, NAVY, 'BETRAG', 100))
        for i, (t, v) in enumerate([('Kaufpreis', p), (f'Grunderwerbsteuer {k["land"]} · {pct(ge, 0)}', g),
                                    (f'Käufercourtage · {pct(co)} ({k["courtage_netto"]} zzgl. 19 % MwSt.)', c)]):
            ln = 340 - 30 * i
            s += L(51, ln, 596) + T(51, ln - 19, 'N', 9.4, 13, INK, t) + RT(596, ln - 19, 'S', 12, 15, NAVY, eur(v), 150)
        s += (L(51, 250, 596, NAVY, 1.1) + T(51, 231, 'B', 9.6, 13, NAVY, 'Summe ohne Notar und Grundbuch') + RT(596, 230, 'SB', 13, 16, NAVY, eur(tot), 160)
              + L(51, 220, 596) + T(51, 201, 'N', 9.4, 13, INK, 'Notar- und Grundbuchkosten') + RT(596, 201, 'N', 9, 13, GREY, 'nach GNotKG, nicht beziffert', 200)
              + L(51, 190, 596))
        if k.get('optionen'):
            s += EB(51, 160, 'Optional · nicht im Kaufpreis enthalten')
            for i, (t, v, num) in enumerate(k['optionen']):
                ln = 148 - 30 * i
                s += L(51, ln, 596) + T(51, ln - 19, 'N', 9.4, 13, INK, t) + RT(596, ln - 19, 'S' if num else 'N', 12 if num else 9, 15, NAVY if num else GREY, v, 150)
            s += L(51, 148 - 30 * len(k['optionen']), 596)
        qm = p / k['flaeche_qm']
        s += cap(51, 60, f'Preis je m² {k["flaeche_art"]}: ca. {eur(qm)} ({eur(p, 0)} bei ca. {str(k["flaeche_qm"]).replace(".", ",")} m² nach Verkäuferangabe).')
        s += (R(632, 34, 224, 464) + EB(660, 469, 'Gesamt', CREAM, 8) + T(660, 422, 'S', 25, 32, CREAM, eur(tot))
              + T(660, 398, 'N', 7.8, 11, MIST, 'Kaufpreis, Grunderwerbsteuer und<br>Käufercourtage, zzgl. Notar und<br>Grundbuch.')
              + L(660, 340, 828, 'rgba(169,184,207,.45)', .6) + EB(660, 318, 'Courtage · hälftige Teilung', LIGHT, 6.8)
              + T(660, 298, 'N', 8.2, 12, MIST, k['courtage_text'], w=170)
              + L(660, 200, 828, 'rgba(169,184,207,.45)', .6) + EB(660, 178, 'Preis je m²', LIGHT, 6.8)
              + T(660, 150, 'S', 22, 28, CREAM, 'ca. ' + eur(qm, 0)) + T(660, 132, 'N', 7.8, 11, MIST, f'bezogen auf ca. {str(k["flaeche_qm"]).replace(".", ",")} m² {k["flaeche_art"]}')
              + T(660, 76, 'N', 7, 10, MIST, 'Maßgeblich sind die gesonderte<br>Maklervereinbarung und der<br>notarielle Kaufvertrag.'))
        return s
    # mehrere Einheiten: gleiches Layout wie bei einer Einheit, eine Spalte je Einheit
    s += (T(51, 398, 'N', 10, 15, INK, 'Alle Positionen rechnerisch auf Basis des jeweiligen Kaufpreises. Notar- und Grundbuchkosten hängen vom Vertrag ab<br>und werden nicht pauschal angesetzt.', w=560)
          + EB(51, 352, 'Position', NAVY, 6.6))
    xs = [596 - 120 * (len(units) - 1 - j) for j in range(len(units))]
    for x, u in zip(xs, units):
        s += RT(x, 356, 'S', 9.6, 12, NAVY, u['name'], 118) + RT(x, 345, 'N', 6.6, 9, GREY, u.get('sub', '').upper(), 118)
    rows = [('Kaufpreis', lambda p: p, 'S', 11), (f'Grunderwerbsteuer {k["land"]} · {pct(ge, 0)}', lambda p: p * ge / 100, 'N', 9),
            (f'Käufercourtage · {pct(co)}', lambda p: p * co / 100, 'N', 9)]
    for i, (t, f, fo, sz) in enumerate(rows):
        ln = 334 - 30 * i
        s += L(51, ln, 596) + T(51, ln - 19, 'N', 9.2, 13, INK, t, w=170)
        for x, u in zip(xs, units):
            s += RT(x, ln - 19, fo, sz, 15, NAVY if fo == 'S' else INK, eur(f(u['preis']), 0 if fo == 'S' else 2), 118)
    tots = [u['preis'] * (1 + (ge + co) / 100) for u in units]
    s += L(51, 244, 596, NAVY, 1.1) + T(51, 225, 'B', 9.4, 13, NAVY, 'Summe ohne Notar und Grundbuch')
    for x, t in zip(xs, tots):
        s += RT(x, 224, 'SB', 11, 16, NAVY, eur(t), 118)
    s += L(51, 214, 596) + T(51, 195, 'N', 9.2, 13, INK, 'Preis je m² ' + k.get('flaeche_art', 'DIN 277 inkl. Außen'))
    for x, u in zip(xs, units):
        s += RT(x, 195, 'N', 9, 13, INK, eur(u['preis'] / u['flaeche_num']), 118)
    s += L(51, 184, 596) + T(51, 165, 'N', 9.2, 13, INK, 'Notar- und Grundbuchkosten') + RT(596, 165, 'N', 9, 13, GREY, 'nach GNotKG, nicht beziffert', 200) + L(51, 154, 596)
    if k.get('optionen'):
        s += EB(51, 128, 'Optional · nicht im Kaufpreis enthalten')
        for i, (t, v, num) in enumerate(k['optionen']):
            ln = 116 - 28 * i
            s += L(51, ln, 596) + T(51, ln - 18, 'N', 9.2, 13, INK, t) + RT(596, ln - 18, 'S' if num else 'N', 11 if num else 9, 15, NAVY if num else GREY, v, 200)
        s += L(51, 116 - 28 * len(k['optionen']), 596)
    s += cap(51, 40, f'Summe der Einzelkaufpreise: {eur(sum(u["preis"] for u in units), 0)}. Flächen nach {k.get("flaeche_art", "DIN 277")}; keine Wohnfläche nach WoFlV.' if k.get('din277') else f'Summe der Einzelkaufpreise: {eur(sum(u["preis"] for u in units), 0)}.')
    i_min = min(range(len(units)), key=lambda j: tots[j]); qm_min = min(u['preis'] / u['flaeche_num'] for u in units)
    s += (R(632, 34, 224, 464) + EB(660, 469, 'Gesamt ab', CREAM, 8) + T(660, 422, 'S', 25, 32, CREAM, eur(tots[i_min]))
          + T(660, 398, 'N', 7.8, 11, MIST, f'{units[i_min]["name"]}: Kaufpreis, Grund-<br>erwerbsteuer und Käufercourtage,<br>zzgl. Notar und Grundbuch.')
          + L(660, 340, 828, 'rgba(169,184,207,.45)', .6) + EB(660, 318, 'Courtage · hälftige Teilung', LIGHT, 6.8)
          + T(660, 298, 'N', 8.2, 12, MIST, k['courtage_text'], w=170)
          + L(660, 200, 828, 'rgba(169,184,207,.45)', .6) + EB(660, 178, 'Preis je m² ab', LIGHT, 6.8)
          + T(660, 150, 'S', 22, 28, CREAM, 'ca. ' + eur(qm_min, 0)) + T(660, 132, 'N', 7.8, 11, MIST, k.get('qm_hinweis', ''), w=170)
          + T(660, 76, 'N', 7, 10, MIST, 'Maßgeblich sind die gesonderte<br>Maklervereinbarung und der<br>notarielle Kaufvertrag.'))
    return s


def m_vergleich(d, obj):
    units = obj['kosten']['einheiten']
    s = (chrome('Die Einheiten im Vergleich') + head(d['dachzeile'], d['titel'])
         + T(51, 400, 'N', 9.6, 14, INK, d['intro'], w=805))
    xs = [51, 250, 360, 430, 540, 680]
    for x, t in zip(xs, d['spalten']):
        s += EB(x, 340, t, NAVY, 6.6)
    for i, u in enumerate(units):
        ln = 326 - 60 * i
        row = [u['name'], u['flaeche'], u['zimmer'], u['aussenflaeche'], u['aussenraeume'], u['lage']]
        s += L(51, ln, 856)
        for j, (x, v) in enumerate(zip(xs, row)):
            s += T(x, ln - 24, 'S', 12 if j == 0 else 10.5, 15, INK if j != 1 else NAVY, v, w=(xs[j + 1] - x - 12) if j < 5 else 176)
    s += L(51, 326 - 60 * len(units), 856)
    s += (R(51, 40, 805, 60) + EB(67, 78, 'Flächen richtig einordnen', CREAM, 6.6)
          + T(260, 80, 'N', 8.4, 12, CREAM, d['flaechen_hinweis'], w=580))
    return s


def m_einheit(d, obj):
    u = next(x for x in obj['kosten']['einheiten'] if x['id'] == d['einheit'])
    qm = u['preis'] / u['flaeche_num']
    cl, ln_ = SLANT('links')
    s = (IMG(d['bild'], 0, 0, HALF, 567, d.get('bild_pos', 'center'), extra=cl) + ln_ + chrome(d['kopf'], foot_img=True)
         + R(0, 70, 70, 70, NAVY, .6) + T(16, 96, 'S', 30, 34, CREAM, d['nummer'])
         + EB(TX, 487, d['dachzeile']) + T(TX, 452, 'S', 26, 30, INK, u['name'])
         + T(TX, 434, 'N', 8, 11, GREY, d['zuordnung'])
         + R(TX, 318, 356, 100, '#ffffff') + IMG(d['plan'], TX + 8, 322, 340, 92, 'center', 'contain')
         + T(TX, 282, 'S', 24, 30, INK, u['flaeche']) + EB(TX, 262, d.get('flaeche_label', 'DIN 277 inkl. Außenflächen'), ACC, 6.4)
         + T(TX + 190, 282, 'S', 24, 30, INK, u['zimmer']) + EB(TX + 190, 262, 'Zimmer', ACC, 6.4)
         + L(TX, 248, 856)
         + T(TX, 222, 'S', 24, 30, NAVY, eur(u['preis'], 0)) + T(TX, 203, 'N', 7.6, 10, ACC, f'{eur(qm)} / m² {d.get("qm_bezug", "DIN 277 inkl. Außenflächen")}')
         + T(TX, 176, 'S', 14, 18, INK, d['headline']) + T(TX, 160, 'N', 8.6, 12.4, INK, d['text'], w=356))
    for i, (k, v) in enumerate(d['flaechen']):
        ln = 104 - 20 * i
        s += L(TX, ln, 856) + T(TX, ln - 13, 'N', 7.8, 11, GREY, k) + RT(856, ln - 13, 'B', 8.6, 11, NAVY, v, 160)
    s += L(TX, 104 - 20 * len(d['flaechen']), 856)
    return s + T(12, 22, 'N', 6.6, 9, CREAM, d['caption'], extra='text-shadow:0 0 4pt rgba(20,28,40,.6)') + cap(TX, 26, d.get('fussnote', ''))


def m_plaene(d):
    s = chrome(d['kopf']) + head(d['dachzeile'], d['titel'])
    s += R(51, 50, 150, 350)
    s += EB(67, 380, 'Zuordnung', CREAM, 7)
    for i, z in enumerate(d['zuordnung']):
        b = 350 - 70 * i
        s += (R(67, b - 2, 9, 9, z['farbe']) + EB(82, b, z['kurz'], LIGHT, 6.4)
              + T(67, b - 18, 'S', 11, 14, CREAM, z['name'], w=125) + T(67, b - 46, 'N', 7, 9, MIST, z['sub']))
    for i, b in enumerate(d['bilder']):
        x = 216 + i * 324
        s += R(x, 50, 312, 350, '#ffffff') + EB(x + 12, 386, b['titel'], GREY, 6.6) + IMG(b['bild'], x + 8, 58, 296, 318, 'center', 'contain')
    return s + cap(51, 34, d['caption'])


def m_markt(d):
    lo, hi = d['spanne']; comps = d['vergleiche']
    s = chrome(d['kopf']) + head(d['dachzeile'], d['titel']) + T(51, 400, 'N', 9.6, 14, INK, d['intro'], w=545)
    # Streudiagramm
    X0, Y0, Wd, Hd = 80, 110, 500, 230
    xmin, xmax, ymin, ymax, xs_, ys_ = d.get('achsen', [50, 260, 20, 32, 50, 2])
    s += EB(51, 362, 'Nettokaltmiete im Verhältnis zur Inseratsfläche', NAVY, 6.6)
    for v in range(ymin, ymax + 1, ys_):
        y = Y0 + (v - ymin) / (ymax - ymin) * Hd
        s += L(X0, y, X0 + Wd, '#e7e2da', .5) + RT(X0 - 6, y - 3, 'N', 6.6, 9, GREY, str(v), 30)
    for v in range(xmin if xmin % xs_ == 0 else xmin + xs_ - xmin % xs_, xmax + 1, xs_):
        x = X0 + (v - xmin) / (xmax - xmin) * Wd
        s += T(x - 10, Y0 - 14, 'N', 6.6, 9, GREY, str(v), w=20, extra='text-align:center')
    avg = sum(c['miete'] / c['flaeche'] for c in comps) / len(comps)
    ya = Y0 + (avg - ymin) / (ymax - ymin) * Hd
    s += f'<div class="t" style="left:{X0}pt;top:{H-ya:.2f}pt;width:{Wd}pt;border-top:.7pt dashed {ACC}"></div>'
    s += RT(X0 + Wd, ya + 4, 'B', 6.8, 9, ACC, 'Ø ' + f'{avg:.2f}'.replace('.', ','), 80)
    for c in comps:
        q = c['miete'] / c['flaeche']
        x = X0 + (c['flaeche'] - xmin) / (xmax - xmin) * Wd; y = Y0 + (q - ymin) / (ymax - ymin) * Hd
        s += f'<div class="t" style="left:{x-4:.2f}pt;top:{H-y-4:.2f}pt;width:8pt;height:8pt;border-radius:50%;background:{NAVY}"></div>'
        s += T(x + 7, y + 3, 'B', 7.5, 10, NAVY, c['key'])
    s += T(X0, Y0 - 28, 'N', 6.8, 9, GREY, 'Fläche laut Inserat in m² · Nettokaltmiete in €/m² und Monat')
    s += (R(632, 250, 224, 132) + EB(650, 362, 'Angenommene Mietspanne', CREAM, 6.8)
          + T(650, 326, 'S', 22, 28, CREAM, f'{lo:.2f}–{hi:.2f} €/m²'.replace('.', ','))
          + T(650, 300, 'N', 7.4, 10.5, MIST, br(d.get('spanne_text', ['Nettokaltmiete pro Monat · Szenarioannahme,', 'keine belegte Projektmiete.']))))
    for i, c in enumerate(comps):
        ln = 236 - (36 if len(comps) <= 4 else 30) * i
        s += (L(632, ln, 856) + T(632, ln - 16, 'B', 8.6, 12, NAVY, c['key']) + T(650, ln - 16, 'N', 8.6, 12, INK, c['adresse'])
              + T(650, ln - 28, 'N', 7, 10, GREY, f"{c['flaeche']:.2f}".replace('.', ',') + f" m² laut Inserat · {eur(c['miete'], 0)} kalt · " + f"{c['miete']/c['flaeche']:.2f}".replace('.', ',') + ' €/m²'))
    s += L(632, 236 - (36 if len(comps) <= 4 else 30) * len(comps), 856)
    return s + cap(51, 40, br(d['quelle']), w=805)


def _num(v, dmax=3):
    t = f'{v:.{dmax}f}'.rstrip('0').rstrip('.')
    if '.' in t and len(t.split('.')[1]) < 2: t = f'{v:.2f}'
    return t.replace('.', ',')


def m_rendite(d, obj):
    lo, hi = d['spanne']; m = (lo + hi) / 2
    units = obj['kosten']['einheiten']
    s = (chrome(d['kopf']) + head(d['dachzeile'], d['titel'])
         + T(51, 400, 'N', 9.6, 14, INK, f'Mittelwert der angenommenen Spanne: ({_num(lo)} + {_num(hi)}) ÷ 2 = {_num(m)} €/m² monatlich.<br>' + d['basis'], w=805))
    if len(units) == 1:   # ein Objekt: drei Szenarien (untere, mittlere, obere Annahme)
        u = units[0]
        rows = [(f'{nm} · {_num(q)} €/m²', f"{u['name']} · {eur(u['preis'], 0)}", u['innenflaeche'], q, u['preis'])
                for nm, q in [('Untere Annahme', lo), ('Mittelwert', m), ('Obere Annahme', hi)]]
        h0 = 'Szenario / Kaufpreis'
    else:
        rows = [(u['name'], f"{u.get('sub', '')} · {eur(u['preis'], 0)}", u['innenflaeche'], m, u['preis']) for u in units]
        h0 = 'Einheit / Kaufpreis'
    xs = [51, 300, 400, 510, 620, 740]; heads = [h0, d.get('flaeche_label', 'Innenfläche') + '¹', 'Miete / Monat²', 'Miete / Jahr²', 'Bruttorendite²', 'Kaufpreisfaktor²']
    s += R(51, 330, 805, 26)
    for x, t in zip(xs, heads):
        s += EB(x + 12 if x == 51 else x, 340, t, CREAM, 6.4)
    for i, (n1, n2, a, q, preis) in enumerate(rows):
        ln = 330 - 44 * i; mon = a * q; yr = round(mon * 12); r = yr / preis * 100; f = preis / yr
        if i % 2 == 0: s += R(51, ln - 44, 805, 44, '#efe9e1')
        s += (T(63, ln - 18, 'S', 11, 14, INK, n1) + T(63, ln - 32, 'N', 7.2, 10, GREY, n2)
              + T(300, ln - 22, 'N', 9, 12, INK, f'{a:.2f} m²'.replace('.', ',')) + T(400, ln - 22, 'N', 9, 12, INK, eur(mon))
              + T(510, ln - 22, 'N', 9, 12, INK, eur(yr, 0)) + T(620, ln - 22, 'B', 9.6, 12, NAVY, pct(r))
              + T(740, ln - 22, 'B', 9.6, 12, NAVY, f'{f:.1f}-fach'.replace('.', ',')))
    yb = 330 - 44 * len(rows) - 20
    for i, (t, f) in enumerate([('Jahresnettokaltmiete', 'Monatsmiete × 12'), ('Bruttomietrendite', 'Jahresnettokaltmiete ÷ Kaufpreis × 100'), ('Kaufpreisfaktor', 'Kaufpreis ÷ Jahresnettokaltmiete')]):
        x = 51 + i * 273
        s += R(x, yb - 52, 259, 52) + EB(x + 14, yb - 16, t, CREAM, 6.6) + T(x + 14, yb - 36, 'N', 8.4, 11, MIST, f)
    return s + T(51, 62, 'N', 6.8, 9.6, GREY, br(d['fussnoten']), w=805)


def m_partner(d, shared):
    p = shared['partner']; d = {**p, **(d or {})}
    s = (chrome('Partner &amp; Service') + EB(51, 477, 'Rund um Ihren Kauf') + T(51, 440, 'S', 31, 34, INK, 'Gut vernetzt<br>für jeden Schritt' if sans_only() else 'Gut vernetzt.<br>Für jeden Schritt.')
         + T(51, 370, 'N', 9.8, 14.5, INK, d['intro'], w=340) + R(51, 40, 356, 268) + EB(71, 286, 'So funktioniert es', LIGHT, 6.8))
    for i, (n, t) in enumerate(d['schritte']):
        b = 252 - 54 * i
        s += (L(71, b + 22, 387, 'rgba(169,184,207,.35)', .6) + T(71, b, 'S', 20, 24, LIGHT, f'0{i+1}')
              + T(111, b + 2, 'S', 13, 17, CREAM, n) + T(111, b - 13, 'N', 8.2, 11, MIST, t))
    s += (L(71, 252 - 54 * 3 + 22, 387, 'rgba(169,184,207,.35)', .6)
          + T(71, 64, 'N', 8.4, 12, CREAM, 'Ihr Ansprechpartner: Marco Kaimann') + T(71, 51, 'N', 8, 11, MIST, '+49 172 425 9087 · mkaimann@grenford.de'))
    for i, b in enumerate(d['bereiche']):
        ln = 487 - 134 * i
        s += (L(TX, ln, 856) + EB(TX, ln - 15, f'0{i+1}', ACC, 7) + T(TX, ln - 36, 'S', 17, 22, INK, b['titel'])
              + T(TX, ln - 56, 'N', 9, 13.4, INK, b['text'], w=356) + CHIPS(TX, ln - 112, b['chips']))
    return s + L(TX, 487 - 134 * 3, 856) + cap(TX, 68, br(d['hinweis']), w=356)


def m_kontakt(d):
    st = d.get('abstand', 64); n = len(d['schritte'])
    s = (HEAD(d.get('kopf', 'Nächster Schritt &amp; Kontakt')) + PN() + IMG(d['bild'], 0, 0, COL, 567, d.get('bild_pos', 'center'), extra=COLCUT())
         + R(0, 0, COL, 567, NAVY, .4, extra=COLCUT()) + COLLINE() + MARK('white') + FOOT(img=True)
         + T(51, 140, 'S', 29, 33, CREAM, br(d['claim'])) + EB(412, 488, d['dachzeile']) + T(412, 448, 'S', 30, 32, INK, br(d['titel'])))
    for i, (h, t) in enumerate(d['schritte']):
        ln = 382 - st * i
        s += (L(412, ln, 856) + T(412, ln - 30, 'S', 22, 30, ACC, f'0{i+1}')
              + T(466, ln - 22, 'S', 14.5, 19, INK, h) + T(466, ln - 39, 'N', d.get('schrift', 9), 12.8, INK, t, w=388))
    return (s + L(412, 382 - st * n, 856) + R(412, 48 if n > 3 else 74, 444, 92 if n > 3 else 102) + EB(432, 119 if n > 3 else 155, d.get('box_label', 'Besichtigung vereinbaren'), LIGHT, 6.8)
            + T(432, 98 if n > 3 else 132, 'S', 16, 21, CREAM, d.get('box_titel', 'Marco Kaimann begleitet Sie persönlich.'))
            + T(432, 78 if n > 3 else 110, 'N', 9.2, 14, CREAM, '+49 172 425 9087 · mkaimann@grenford.de')
            + T(432, 64 if n > 3 else 96, 'N', 8.4, 13, MIST, 'GRENFORD · Kurfürstendamm 96 · 10709 Berlin · www.grenford.de')
            + T(412, 30 if n > 3 else 28, 'N', 6.6, 9, GREY, 'GRENFORD ist die Geschäftsbezeichnung des Einzelunternehmens Marco Kaimann · USt-IdNr.: DE362752159'))


def m_ueber(d, shared):
    s = (HEAD('Über GRENFORD') + PN() + IMG(d['bild'], 0, 0, COL, 567, d.get('bild_pos', 'center'), extra=COLCUT())
         + R(0, 0, COL, 567, NAVY, .4, extra=COLCUT()) + COLLINE() + MARK('white') + FOOT(img=True)
         + T(51, 121, 'S', 29, 32, CREAM, 'Wir strukturieren<br>Immobilien-<br>entscheidungen' + ('' if sans_only() else '.')))
    h = round(95 * 379 / 773, 2)
    aktiv = C.meta.get('dokument')
    for i, (brand, t, desc, lab, logo) in enumerate(shared['geschaeftsfelder']):
        if aktiv and lab == aktiv: lab += ' · dieses Dokument'
        ln = 500 - 122 * i
        s += (L(412, ln, 856) + PIC(logo, 418, round(ln - 48.5 - h / 2, 2), 95, h)
              + EB(522, ln - 17, brand, ACC, 6.6) + T(522, ln - 38, 'S', 17.5, 23, INK, t)
              + T(522, ln - 60, 'N', 8.2, 12, INK, desc) + EB(522, ln - 97, lab, NAVY, 6.6))
    return s + PIC('logo-boutique.jpg', 456, 30, 356, 105.2)


def m_recht(d, obj):
    s = (chrome('Grundlagen &amp; rechtliche Hinweise') + head(d['dachzeile'], 'Transparenz im Detail.')
         + T(51, 398, 'N', 10, 15, INK, br(d['intro'])))
    for (x, ln), (hh, t) in zip([(51, 352), (473, 352), (51, 218), (473, 218)], d['bloecke']):
        s += L(x, ln, x + 383) + T(x, ln - 21, 'S', 12.5, 16, INK, hh) + T(x, ln - 44, 'N', d.get('schrift', 9.9), d.get('zeile', 14.6), INK, t, w=383)
    return s + L(51, 74, 856) + T(51, 58, 'N', 7.4, 10, GREY, f'Redaktionsstand: {obj["meta"]["redaktionsstand"]} · Vollständige AGB auf Seite {{seite:agb}} · Verbraucherinformationen und Widerrufsbelehrung werden gesondert bereitgestellt.')


def m_agb(d, obj):
    k = obj['kosten']
    agb = open(os.path.join(SHARED, d.get('datei', 'agb.html'))).read().replace('{{courtage_satz}}', k.get('agb_courtage', ''))
    p = re.findall(r'<h4>.*?</p>', agb)
    cols = [''.join(p[0:3]), ''.join(p[3:7]), ''.join(p[7:])]
    return (chrome('Anhang · Allgemeine Geschäftsbedingungen') + head(d.get('dachzeile', 'GRENFORD Property · Immobilienvermittlung'), 'Allgemeine Geschäftsbedingungen.', 29, 32, 438)
            + T(51, 417, 'N', 8, 11.6, GREY, f'Marco Kaimann, Einzelunternehmer, Geschäftsbezeichnung GRENFORD · Kurfürstendamm 96, 10709 Berlin · mkaimann@grenford.de · Stand: {obj["meta"]["agb_stand"]}')
            + ''.join(f'<div class="t agb" style="left:{x}pt;top:{H-399:.1f}pt;width:255pt;{d.get("stil", "")}">{c}</div>' for x, c in zip((51, 324, 597), cols)))


def m_ueberblick_kosten(d, obj):
    """Überblick und Kosten auf einer Seite, 50/50: links Eckdaten, rechts Kosten. Jede Angabe nur einmal."""
    k = obj['kosten']; ge = k['grunderwerbsteuer']; co = k['courtage_brutto']
    units = k['einheiten']
    if len(units) == 1:
        p = units[0]['preis']; g = p * ge / 100; c = p * co / 100; tot = p + g + c; qm = p / k['flaeche_qm']
    LX, LR, RX, RR = 51, 425, 482, 856
    s = (chrome(d.get('kopf', 'Auf einen Blick')) + EB(51, 487, d['dachzeile']) + T(51, 450, 'S', 31, 34, INK, d['titel'])
         + T(51, 415, 'N', 10.5, 15.5, INK, d['intro'], w=805)
         + VL(453.5, 378, 52, LINE, .5))
    # links: Eckdaten
    z = d['zeilen']; st = min(31, 300 / len(z))
    s += EB(LX, 372, 'Das Objekt', NAVY, 7.8)
    for i, (lab, v) in enumerate(z):
        ln = 362 - st * i
        s += L(LX, ln, LR) + T(LX, ln - st * .55, 'N', 7.8, 11, GREY, lab) + T(LX + 100, ln - st * .55, 'N', 8.8, 12, INK, v, w=LR - LX - 100)
    s += L(LX, 362 - st * len(z), LR)
    if len(units) > 1:   # rechts: Kosten je Einheit in Spalten
        s += EB(RX, 372, 'Kaufpreis und Erwerbsnebenkosten', NAVY, 7.8)
        cw = 88; xs = [RR - cw * (len(units) - 1 - j) for j in range(len(units))]
        for x_, u in zip(xs, units):
            s += RT(x_, 352, 'B', 7.2, 9.5, NAVY, u.get('kurz', u['name']), cw - 4) + RT(x_, 341, 'N', 6.2, 8.5, GREY, u.get('nr', ''), cw - 4)
        rows = [('Kaufpreis', lambda q: eur(q, 0), 'N', 9.4, INK),
                (f'Grunderwerbsteuer · {pct(ge, 0)}', lambda q: eur(q * ge / 100), 'N', 8.4, INK),
                (f'Käufercourtage · {pct(co)}', lambda q: eur(q * co / 100), 'N', 8.4, INK)]
        ln = 334
        for t, fn, fo, sz, col in rows:
            s += L(RX, ln, RR) + T(RX, ln - 17, 'N', 8.6, 12, INK, t)
            for x_, u in zip(xs, units): s += RT(x_, ln - 17, fo, sz, 12, col, fn(u['preis']), cw - 4)
            ln -= 27
        s += L(RX, ln, RR, NAVY, 1.1) + T(RX, ln - 20, 'B', 8.8, 12, NAVY, 'Gesamt ohne Notar<br>und Grundbuch', w=110, extra='line-height:11pt')
        for x_, u in zip(xs, units): s += RT(x_, ln - 19, 'B', 10.4, 13, NAVY, eur(u['preis'] * (1 + (ge + co) / 100)), cw - 2)
        ln -= 34
        s += L(RX, ln, RR) + T(RX, ln - 17, 'N', 8.6, 12, INK, 'Preis je m² ' + k.get('flaeche_kurz', ''))
        for x_, u in zip(xs, units): s += RT(x_, ln - 17, 'N', 8.4, 12, INK, eur(u['preis'] / u['flaeche_num']), cw - 4)
        ln -= 27
        extra = [('Notar- und Grundbuchkosten', 'nach GNotKG, nicht beziffert')] + [(t + ' (optional)', v) for t, v, *_ in k.get('optionen', [])]
        for t, v in extra:
            s += L(RX, ln, RR) + T(RX, ln - 17, 'N', 8.6, 12, INK, t) + RT(RR, ln - 17, 'N', 8.4, 12, GREY, v, 170)
            ln -= 27
        s += L(RX, ln, RR)
        s += T(RX, ln - 14, 'N', 7.4, 10.5, GREY, 'Courtage: hälftige Teilung – Käufer und Verkäufer zahlen jeweils 3,00 % zzgl. 19 % MwSt. (§§ 656c, 656d BGB), fällig nach wirksamem Abschluss des notariellen Kaufvertrags.', w=RR - RX)
        return s + cap(51, 32, d['quelle'])
    # rechts: Kosten
    s += EB(RX, 372, 'Kaufpreis und Erwerbsnebenkosten', NAVY, 7.8)
    rows = [('Kaufpreis', eur(p)), (f'Grunderwerbsteuer {k["land"]} · {pct(ge, 0)}', eur(g)),
            (f'Käufercourtage · {pct(co)} inkl. MwSt.', eur(c))]
    for i, (t, v) in enumerate(rows):
        ln = 362 - 29 * i
        s += L(RX, ln, RR) + T(RX, ln - 17, 'N', 9, 12, INK, t) + RT(RR, ln - 17, 'S', 11, 14, NAVY, v, 150)
    ln = 362 - 29 * 3
    s += (L(RX, ln, RR, NAVY, 1.1) + T(RX, ln - 24, 'B', 9.4, 12, NAVY, 'Gesamt ohne Notar und Grundbuch') + RT(RR, ln - 26, 'SB', 17, 20, NAVY, eur(tot), 180)
          + L(RX, ln - 38, RR))
    ln -= 38
    extra = [('Notar- und Grundbuchkosten', 'nach GNotKG, nicht beziffert'), (f'Preis je m² {k["flaeche_art"]}', 'ca. ' + eur(qm))]
    for t, v, *_ in k.get('optionen', []):
        extra.append((t + ' (optional)', v))
    for i, (t, v) in enumerate(extra):
        b = ln - 29 * i
        s += T(RX, b - 17, 'N', 8.6, 12, INK, t) + RT(RR, b - 17, 'N', 8.6, 12, GREY, v, 160) + L(RX, b - 29, RR)
    b = ln - 29 * len(extra) - 16
    s += T(RX, b - 8, 'N', 7.4, 10.5, GREY, 'Courtage: hälftige Teilung – Käufer und Verkäufer zahlen jeweils 3,00 % zzgl. 19 % MwSt. (§§ 656c, 656d BGB), fällig nach wirksamem Abschluss des notariellen Kaufvertrags.', w=RR - RX)
    return s + cap(51, 32, d['quelle'])


def m_fakten(d, obj):
    """B2B-Faktenseite: links Objekt und Kosten, rechts Kaufpreis und Rendite in Varianten-Spalten."""
    LX, LR, RX, RR = 51, 425, 482, 856
    s = chrome(d.get('kopf', 'Hard Facts')) + EB(51, 487, d['dachzeile']) + T(51, 450, 'S', 31, 34, INK, d['titel'])
    top = 384
    if d.get('kennzahlen'):
        k = d['kennzahlen']; bw = (805 - 10 * (len(k) - 1)) / len(k)
        for j, (v, lab) in enumerate(k):
            xx = round(51 + j * (bw + 10), 2)
            s += R(xx, 380, round(bw, 2), 44, extra='border-radius:0') + T(xx + 12, 405, 'L', 17, 20, '#ffffff', v, extra='font-variant-numeric:tabular-nums') + EB(xx + 12, 389, lab, LIGHT, 5.8)
        top = d.get('start', 360)
    else:
        s += T(51, 418, 'N', 9.6, 14, INK, d['intro'], w=805)
    s += VL(453.5, top + 8, 46, LINE, .5)
    rh = d.get('zeilenhoehe', 15.6)
    def side(x0, x1, blocks, cols):
        y = top; out = ''
        for blk in blocks:
            out += EB(x0, y, blk['titel'], NAVY, 7.4)
            for j, h in enumerate(cols if blk.get('spalten', True) and cols else []):
                out += RT(x1 - 78 * (len(cols) - 1 - j), y, 'B', 6.6, 9, GREY, h.upper(), 76)
            y -= 8
            for r in blk['zeilen']:
                out += L(x0, y, x1) + T(x0, y - rh * .66, 'N', 7.9, 10.5, INK, r[0])
                vals = r[1:]
                if len(vals) == 1 and len(cols) <= 1:
                    out += RT(x1, y - rh * .66, 'N', 7.9, 10.5, NAVY, vals[0], 220)
                else:
                    for j, v in enumerate(vals):
                        out += RT(x1 - 78 * (len(vals) - 1 - j), y - rh * .66, 'B' if j == 0 and len(vals) > 1 else 'N', 7.9, 10.5, NAVY if j == 0 else GREY, v, 76)
                y -= rh
            out += L(x0, y, x1); y -= d.get('blockabstand', 20)
        return out
    s += side(LX, LR, d['links'], []) + side(RX, RR, d['rechts'], d.get('spalten', []))
    return s + cap(51, d.get('quelle_y', 40), br(d['quelle']), w=805)


def m_tabelle(d, obj):
    """Zahlentabelle über die volle Breite (z. B. 10-Jahres-Cashflow) mit Kennzahlenband."""
    s = chrome(d['kopf']) + EB(51, 487, d['dachzeile']) + T(51, 450, 'S', 31, 34, INK, d['titel'])
    cols = d['spalten']; lw = d.get('label_breite', 196); cw = (856 - 51 - lw) / len(cols)
    y = 412
    s += R(51, y - 8, 805, 24, extra='border-radius:0')
    for j, c in enumerate(cols):
        s += RT(51 + lw + cw * (j + 1) - 6, y + 1, 'B', 8, 10, '#ffffff', c, cw)
    y -= 12
    for i, r in enumerate(d['zeilen']):
        strong = r[0] in d.get('hervorheben', [])
        if strong: s += L(51, y, 856, NAVY, 1)
        elif i: s += L(51, y, 856)
        zh = d.get('zh', 17.5); fs = d.get('schrift', 7.8)
        s += T(57, y - zh / 2 - fs * .36, 'B' if strong else 'N', fs, 10.5, NAVY if strong else INK, r[0])
        for j, v in enumerate(r[1:]):
            s += RT(51 + lw + cw * (j + 1) - 6, y - zh / 2 - fs * .36, 'B' if strong else 'N', fs, 10.5, NAVY if strong else INK, v, cw)
        y -= zh
    s += L(51, y, 856)
    # Kennzahlenband
    k = d['kennzahlen']; bw = (805 - 12 * (len(k) - 1)) / len(k); yb = y - 82
    for j, (v, lab) in enumerate(k):
        x = 51 + j * (bw + 12)
        s += R(round(x, 2), yb, round(bw, 2), 64, extra='border-radius:0') + T(round(x + 16, 2), yb + 37, 'L', 24, 28, '#ffffff', v, extra='font-variant-numeric:tabular-nums') + EB(round(x + 16, 2), yb + 14, lab, LIGHT, 7)
    if d.get('hinweis'):
        s += T(51, yb - 22, 'N', 8.8, 12.4, INK, d['hinweis'], w=805)
    return s + cap(51, 40, br(d['quelle']), w=805)


# ------------------------------------------------------------ Raster-Seiten (Investment Memo und Berichte)
# Eine Seite = Kopf (Dachzeile, Überschrift, optional Einleitung) + frei platzierte Blöcke.
# Blockkoordinaten: x, y = Oberkante in pt (Ursprung unten links), w = Breite.
POS = ('gesichtet', 'gegeben', 'erteilt', 'vorhanden')


def nlines(text, size, w, f='N'):
    if not w: return 1
    n = 0
    for part in re.split(r'<br\s*/?>', str(text)):
        words = re.sub(r'<[^>]+>', '', part).split(); cur = ''; k = 1
        for wd in words:
            t = (cur + ' ' + wd).strip()
            if cur and width(t, f, size) * 1.01 > w: k += 1; cur = wd
            else: cur = t
        n += k
    return max(1, n)


def _farbe(k):
    return {'navy': NAVY, 'acc': ACC, 'mid': '#6c9f95' if NAVY == '#24534c' else '#7f97b8', 'light': LIGHT, 'grey': '#b9b4ab', 'mist': MIST}.get(k, k)


SQ = 'border-radius:0;'


def CHIP(x, base, text, gross=False):
    t0 = text.lower().split()[0]
    if t0 in POS or t0 in ('top-potenzial',): st = f'background:{NAVY if t0 == "top-potenzial" else ACC};color:#fff;'
    elif t0 in ('gut', 'stabilität'): st = f'background:{LIGHT};color:{NAVY};'
    else: st = f'border:.7pt solid {ACC};color:{ACC};'
    fs = 7 if gross else 6.5
    return (f'<div class="t" style="left:{x}pt;top:{H-base-8:.2f}pt;{st}font-family:\'DM Mono\',monospace;font-size:{fs}pt;line-height:8pt;'
            f'letter-spacing:.06em;text-transform:uppercase;padding:1.6pt 5pt;white-space:nowrap">{text}</div>')


FT = 8.8      # Grundschrift Tabellen und Listen in Raster-Seiten
BTS = 8.2     # Blocktitel


def BT(x, y, t):
    return EB(x, y, t, NAVY, BTS)


def b_tabelle(b):
    x, y, w = b['x'], b['y'], b['w']; s = ''
    cols = b['breiten']; fs = b.get('schrift', FT); zh = b.get('zh', 21); lft = set(b.get('links', [0]))
    tags = set(b.get('tags', [])); hl = b.get('hervorheben', []); mark = {tuple(m) for m in b.get('markiere', [])}
    xs = [x]; [xs.append(xs[-1] + c) for c in cols]
    if b.get('titel'): s += BT(x, y, b['titel']); y -= 16
    if b.get('kopf'):
        for j, h in enumerate(b['kopf']):
            if j in lft or j in tags: s += T(xs[j] + (0 if j == 0 else 6), y, 'B', 7, 9, GREY, h.upper(), extra='letter-spacing:.05em')
            else: s += RT(xs[j + 1], y, 'B', 7, 9, GREY, h.upper(), cols[j] - 4)
        y -= 8
    lh = fs * 1.36
    nls = [max(nlines(c, fs, cols[j] - 8) if (j in lft and j < len(cols)) else 1 for j, c in enumerate(r)) for r in b['zeilen']]
    rhs = [zh + (n - 1) * lh for n in nls]
    if b.get('bis') is not None:
        extra = min(b.get('max_extra', 16), max(0, (y - b['bis'] - sum(rhs)) / len(rhs)))
        rhs = [r + extra for r in rhs]
    for i, (r, nl, rh) in enumerate(zip(b['zeilen'], nls, rhs)):
        strong = r[0] in hl
        s += L(x, y, x + w, NAVY if strong else LINE, 1 if strong else .5)
        for j, c in enumerate(r):
            if (i, j) in mark: s += R(xs[j] + 2, y - rh + 1.5, cols[j] - 2, rh - 3, LIGHT, .35, extra=SQ)
            if b.get('heat') and i in b['heat']['zeilen'] and j in b['heat']['spalten']:
                num = lambda t: float(str(t).replace('.', '').replace(',', '.').replace(' %', '').replace('&nbsp;', ''))
                vals = [num(rr[jj]) for ii, rr in enumerate(b['zeilen']) if ii in b['heat']['zeilen'] for jj in b['heat']['spalten']]
                v = num(c)
                s += R(xs[j] + 2, y - rh + 1.5, cols[j] - 2, rh - 3, ACC, round(.1 + .45 * (v - min(vals)) / (max(vals) - min(vals) or 1), 2), extra=SQ)
            col = NAVY if (strong or (j == b.get('akzent'))) else INK
            f = 'B' if (strong or j == b.get('akzent')) else 'N'
            ncell = nlines(c, fs, cols[j] - 8) if j in lft else 1
            yb = y - (rh - (ncell - 1) * lh) / 2 - fs * .36
            if j in tags and c: s += CHIP(xs[j] + 6, y - rh / 2 + 4.4, c)
            elif j in lft: s += T(xs[j] + (0 if j == 0 else 6), yb, f, fs, lh, col if j == 0 or strong else INK, c, w=cols[j] - 8)
            else: s += RT(xs[j + 1] - (4 if (i, j) in mark else 0), yb, f, fs, lh, col, c, cols[j] - 4)
        y -= rh
    s += L(x, y, x + w)
    b['_unten'] = y
    return s


def b_kv(b):
    x, y, w = b['x'], b['y'], b['w']; kw = b.get('kw', 120); fs = b.get('schrift', FT); s = ''
    if b.get('titel'): s += BT(x, y, b['titel']); y -= 10
    lh = fs * 1.38
    hts = [10 + max(nlines(v, fs, w - kw - 4), nlines(k, fs - .6, kw - 8)) * lh for k, v in b['zeilen']]
    pad = 0
    if b.get('bis') is not None: pad = min(16, max(0, (y - b['bis'] - sum(hts)) / len(hts)))
    for (k, v), hgt in zip(b['zeilen'], hts):
        rh = hgt + pad; top = y - 5 - pad / 2 - fs * .9
        s += L(x, y, x + w) + T(x, top, 'N', fs - .6, (fs - .6) * 1.38, GREY, k, w=kw - 8) + T(x + kw, top, 'N', fs, lh, INK, v, w=w - kw - 4)
        y -= rh
    b['_unten'] = y
    return s + L(x, y, x + w)


def b_text(b):
    x, y, w = b['x'], b['y'], b['w']; fs = b.get('schrift', 9.2); tl = fs * 1.48; s = ''
    inner_x, inner_w = (x + 18, w - 34) if b.get('box') else (x, w)
    paras = []
    for p in b['absaetze']:
        if isinstance(p, list): paras.append((f'<span style="font-weight:500;color:{NAVY}">{p[0]}</span> {p[1]}', p[0] + ' ' + p[1]))
        else: paras.append((p, p))
    hts = [nlines(pl, fs, inner_w) * tl for _, pl in paras]
    total = sum(hts) + 8 * (len(paras) - 1) + (18 if b.get('titel') else 0)
    hbox = max(total + 30, b.get('h', 0))
    if b.get('box'):
        s += R(x, y - hbox, w, hbox, LIGHT, .22, extra=SQ) + R(x, y - hbox, 2.4, hbox, ACC, extra=SQ)
        y -= 15
    if b.get('titel'): s += BT(inner_x, y - 4, b['titel']); y -= 18
    for (html, _), h in zip(paras, hts):
        s += T(inner_x, y - fs * .9, 'N', fs, tl, INK, html, w=inner_w); y -= h + 8
    b['_unten'] = (b['y'] - hbox) if b.get('box') else y
    return s


def b_balken(b):
    x, y, w = b['x'], b['y'], b['w']; lw = b.get('lw', 130); vw = b.get('vw', 70); mx = b.get('max') or max(i[1] for i in b['items'])
    s = ''; bh = b.get('bh', 13); fs = b.get('schrift', 8.6)
    if b.get('titel'): s += BT(x, y, b['titel']); y -= 20
    n = len(b['items'])
    st = b.get('abstand', 22) if b.get('bis') is None else min(40, (y - b['bis']) / n)
    for it in b['items']:
        lab, val, txt = it[0], it[1], it[2]; kind = it[3] if len(it) > 3 else ''
        col = LIGHT if kind == 'h' else ('#b9b4ab' if kind == 'r' else NAVY)
        bwid = max(1.5, (w - lw - vw) * val / mx)
        s += (T(x, y - bh / 2 - 2.6, 'B' if kind == 'h' else 'N', fs, fs * 1.2, NAVY if kind == 'h' else INK, lab, w=lw - 6) + R(x + lw, y - bh, round(bwid, 2), bh, col, extra=SQ)
              + T(x + lw + bwid + 6, y - bh / 2 - 2.6, 'B', fs, fs * 1.2, NAVY, txt))
        y -= st
    b['_unten'] = y
    return s


def b_spanne(b):
    """Preisspannen als Bereichsbalken (von–bis) auf gemeinsamer Achse."""
    x, y, w = b['x'], b['y'], b['w']; lw = b.get('lw', 190); lo, hi, step = b['achse']; s = ''
    if b.get('titel'): s += BT(x, y, b['titel']); y -= 22
    X = lambda v: x + lw + (v - lo) / (hi - lo) * (w - lw - 10)
    n = len(b['items']); st = b.get('abstand', 26)
    v = lo
    while v <= hi:
        s += VL(X(v), y + 4, y - st * n + 6, '#e7e2da', .5) + T(X(v) - 20, y - st * n - 2, 'N', 7.4, 9, GREY, f'{v} €', w=40, extra='text-align:center')
        v += step
    for lab, a, z, txt, *kind in b['items']:
        h_ = kind and kind[0] == 'h'
        col = LIGHT if h_ else NAVY
        s += T(x, y - 9, 'B' if h_ else 'N', 8.6, 10, NAVY if h_ else INK, lab, w=lw - 8)
        if a == z: s += f'<div class="t" style="left:{X(a)-5:.1f}pt;top:{H-y+3:.1f}pt;width:10pt;height:10pt;border-radius:50%;background:{col}"></div>'
        else: s += R(round(X(a), 1), y - 13, round(X(z) - X(a), 1), 10, col, extra='border-radius:5pt;')
        s += T(X(z) + 8, y - 9, 'B', 8.4, 10, NAVY, txt)
        y -= st
    b['_unten'] = y - 14
    return s


def b_saeulen(b):
    x, y, w, h = b['x'], b['y'], b['w'], b['h']; s = ''
    if b.get('titel'): s += BT(x, y, b['titel']); y -= 26
    kat = b['kategorien']; ser = b['serien']; stacked = b.get('gestapelt', False)
    y0 = y - h; n = len(kat); gw = w / n
    mx = b.get('max') or max((sum(sr['werte'][i] for sr in ser) if stacked else max(sr['werte'][i] for sr in ser)) for i in range(n))
    bwid = gw * b.get('breite', .56) / (1 if stacked else len(ser))
    s += L(x, y0, x + w, INK, .6)
    for i, k in enumerate(kat):
        cx = x + gw * i + gw * (1 - b.get('breite', .56)) / 2; acc_y = y0
        for j, sr in enumerate(ser):
            v = sr['werte'][i]; hh = h * v / mx
            col = _farbe(sr.get('farben', [])[i] if sr.get('farben') else sr.get('farbe', 'navy'))
            if stacked:
                s += R(round(cx, 2), round(acc_y, 2), round(bwid, 2), round(hh, 2), col, extra=SQ); acc_y += hh
            else:
                bx = cx + j * bwid
                s += R(round(bx + .8, 2), y0, round(bwid - 1.6, 2), round(hh, 2), col, extra=SQ)
                if sr.get('labels'): s += T(round(bx - 6, 2), y0 + hh + 10, 'B', 8.4, 10, NAVY, sr['labels'][i], w=round(bwid + 12, 2), extra='text-align:center')
        if stacked and b.get('summen'): s += T(round(cx - 14, 2), acc_y + 10, 'B', 8.6, 10, NAVY, b['summen'][i], w=round(bwid + 28, 2), extra='text-align:center')
        s += T(round(x + gw * i, 2), y0 - 14, 'N', 8, 10, GREY, k, w=round(gw, 2), extra='text-align:center')
    ly = y0 - 34
    if b.get('legende', True):
        lx = x
        for sr in ser:
            s += R(lx, ly - 2, 8, 8, _farbe(sr.get('farbe', 'navy')), extra=SQ) + T(lx + 12, ly + 1.5, 'N', 8, 10, GREY, sr['name'])
            lx += 26 + width(sr['name'], 'N', 8)
    b['_unten'] = ly - 10
    return s


def b_linie(b):
    x, y, w, h = b['x'], b['y'], b['w'], b['h']; s = ''
    if b.get('titel'): s += BT(x, y, b['titel']); y -= 22
    lo, hi, step = b['achse']; kat = b['kategorien']; X0 = x + 26; Wd = w - 60; y0 = y - h
    Y = lambda v: y0 + (v - lo) / (hi - lo) * h
    v = lo
    while v <= hi + 1e-9:
        s += L(X0, Y(v), X0 + Wd, INK if v == 0 else '#e7e2da', .6 if v == 0 else .5) + RT(X0 - 6, Y(v) - 3, 'N', 7.6, 9, GREY, f'{v:g}'.replace('-', '−'), 30)
        v += step
    for i, k in enumerate(kat):
        s += T(X0 + Wd * i / (len(kat) - 1) - 15, y0 - 14, 'N', 7.6, 9, GREY, k, w=30, extra='text-align:center')
    pts_svg = ''
    for sr in b['serien']:
        col = _farbe(sr.get('farbe', 'navy'))
        pts = [(X0 + Wd * i / (len(kat) - 1), H - Y(val)) for i, val in enumerate(sr['werte'])]
        pts_svg += f'<polyline fill="none" stroke="{col}" stroke-width="2" points="' + ' '.join(f'{px:.1f},{py:.1f}' for px, py in pts) + '"/>'
        pts_svg += ''.join(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="2.3" fill="{col}"/>' for px, py in pts)
        lx, ly = pts[-1]
        s += T(lx + 6, H - ly + sr.get('dy', 0) - 3, 'B', 8.6, 10, col, sr['ende'])
    if b.get('nulllinie_text'): s += T(X0 + 4, Y(0) + 5, 'N', 7, 9, GREY, b['nulllinie_text'])
    s += f'<svg class="t" style="left:0;top:0;width:907pt;height:567pt;overflow:visible" viewBox="0 0 907 567">{pts_svg}</svg>'
    lx = X0; ly = y0 - 34
    for sr in b['serien']:
        s += R(lx, ly - 2, 14, 2.6, _farbe(sr.get('farbe', 'navy')), extra=SQ) + T(lx + 18, ly + 1.5, 'N', 8, 10, GREY, sr['name'])
        lx += 34 + width(sr['name'], 'N', 8)
    b['_unten'] = ly - 10
    return s


def b_kpi(b):
    x, y, w = b['x'], b['y'], b['w']; gap = b.get('gap', 12); h = b.get('h', 62); vs = b.get('groesse', 22); s = ''
    items = [it if isinstance(it, dict) else {'wert': it[0], 'label': it[1], **({'stil': it[2]} if len(it) > 2 and it[2] in ('durch', 'hell') else {'sub': it[2]} if len(it) > 2 else {})} for it in b['items']]
    bw = (w - gap * (len(items) - 1)) / len(items); low = y - h
    for j, it in enumerate(items):
        xx = round(x + j * (bw + gap), 2); v, lab = it['wert'], it['label']; st = it.get('stil')
        if b.get('hell'):
            s += L(xx, y, xx + bw, NAVY, 1.2) + T(xx, y - vs * 1.25, 'L', vs, vs * 1.2, NAVY, v, extra='font-variant-numeric:tabular-nums;letter-spacing:-.02em') + EB(xx, y - vs * 1.25 - 20, lab, ACC, 6.8)
            if it.get('sub'): s += T(xx, y - vs * 1.25 - 34, 'N', 8, 10.5, GREY, it['sub'], w=bw - 6)
            low = min(low, y - vs * 1.25 - (48 if it.get('sub') else 30))
        else:
            if st == 'durch':
                s += R(xx, y - h, round(bw, 2), h, LIGHT, .3, extra=SQ) + T(xx + 14, y - h + h * .52, 'L', vs, vs * 1.1, GREY, v, extra='font-variant-numeric:tabular-nums;text-decoration:line-through;text-decoration-thickness:1pt') + EB(xx + 14, y - h + 14, lab, GREY, 6.8)
            elif st == 'hell':
                s += R(xx, y - h, round(bw, 2), h, LIGHT, 1, extra=SQ) + T(xx + 14, y - h + h * .52, 'L', vs, vs * 1.1, NAVY, v, extra='font-variant-numeric:tabular-nums') + EB(xx + 14, y - h + 14, lab, NAVY, 6.8)
            else:
                s += R(xx, y - h, round(bw, 2), h, extra=SQ) + T(xx + 14, y - h + h * .52, 'L', vs, vs * 1.1, '#ffffff', v, extra='font-variant-numeric:tabular-nums') + EB(xx + 14, y - h + 14, lab, LIGHT, 6.8)
            if it.get('text'):
                s += T(xx, y - h - 14, 'N', 8.4, 11.4, INK, it['text'], w=bw - 4)
                low = min(low, y - h - 10 - nlines(it['text'], 8.4, bw - 4) * 11.4)
    b['_unten'] = low
    return s


def b_dunkel(b):
    x, y, w, h = b['x'], b['y'], b['w'], b['h']; s = R(x, y - h, w, h, extra=SQ)
    yy = y - 26
    if b.get('titel'): s += EB(x + 20, yy, b['titel'], CREAM, 7.6); yy -= 40
    for it in b['werte']:
        s += T(x + 20, yy, 'L', it[2] if len(it) > 2 else 30, 34, '#ffffff', it[0], extra='font-variant-numeric:tabular-nums;letter-spacing:-.02em') + EB(x + 20, yy - 25, it[1], LIGHT, 7)
        yy -= b.get('abstand', 72)
    if b.get('text'): s += T(x + 20, y - h + 18 + nlines(b['text'], 8.4, w - 40) * 12, 'N', 8.4, 12, MIST, b['text'], w=w - 40)
    b['_unten'] = y - h
    return s


def _monat(t):
    yy, mm = t.split('-'); return int(yy) * 12 + int(mm) - 1


def b_gantt(b):
    x, y, w = b['x'], b['y'], b['w']; lw = b.get('lw', 210); zh = b.get('zh', 30); s = ''
    a, z = _monat(b['von']), _monat(b['bis']) + 1; n = z - a; mw = (w - lw) / n; X = lambda m: x + lw + (m - a) * mw
    for m in range(a, z):
        if m % 12 == 0 or m == a: s += T(X(m) + 2, y, 'B', 8.6, 10, NAVY, str(m // 12))
        s += T(X(m), y - 15, 'N', 7.4, 9, GREY, 'JFMAMJJASOND'[m % 12], w=mw, extra='text-align:center')
        if m % 12 == 0: s += VL(X(m), y + 4, y - 24 - zh * len(b['zeilen']), LINE, .6)
    yy = y - 24
    for lab, v, bis, typ in b['zeilen']:
        s += L(x, yy, x + w) + T(x, yy - zh / 2 - 3, 'N', 8.8, 11, INK, lab, w=lw - 8)
        s += R(round(X(_monat(v)), 2), yy - zh / 2 - 6, round(max(mw * .6, (_monat(bis) + 1 - _monat(v)) * mw), 2), 12, _farbe({'bau': 'navy', 'vertrieb': 'light', 'betrieb': 'mid', 'aussen': 'grey'}[typ]), extra=SQ)
        yy -= zh
    s += L(x, yy, x + w)
    if b.get('heute'):
        hx = X(_monat(b['heute']))
        s += f'<div class="t" style="left:{hx:.2f}pt;top:{H-y-6:.2f}pt;height:{y+6-yy:.2f}pt;border-left:1pt dashed {ACC}"></div>' + T(hx - 20, yy - 11, 'B', 7.4, 9, ACC, 'HEUTE', w=40, extra='text-align:center;letter-spacing:.06em')
    lx = x + lw
    for nm, k in b.get('legende', []):
        s += R(lx, yy - 32, 14, 8, _farbe(k), extra=SQ) + T(lx + 19, yy - 26, 'N', 8, 10, GREY, nm); lx += 40 + width(nm, 'N', 8)
    b['_unten'] = yy - 40
    return s


def b_zeitstrahl(b):
    x, y, w = b['x'], b['y'], b['w']; s = ''
    a, z = _monat(b['von']), _monat(b['bis']); X = lambda m: x + (m - a) / (z - a) * w
    s += L(x, y, x + w, INK, 1.4)
    for yr in range(a // 12 + 1, z // 12 + 1):
        s += VL(X(yr * 12), y + 5, y - 5, INK, 1) + T(X(yr * 12) - 15, y - 16, 'B', 8, 10, GREY, str(yr), w=30, extra='text-align:center')
    for p in b['punkte']:
        px = X(_monat(p['monat'])); up = p.get('oben', True); col = ACC if p.get('plan') else NAVY; r = 4.8
        s += f'<div class="t" style="left:{px-r:.2f}pt;top:{H-y-r:.2f}pt;width:{2*r}pt;height:{2*r}pt;border-radius:50%;background:{CREAM if p.get("plan") else col};border:1.8pt solid {col}"></div>'
        hgt = p.get('h', 46)
        if up: s += VL(px, y + hgt, y + 6, LINE, .8) + T(px - 55, y + hgt + 24, 'B', 9, 11, col, p['datum'], w=110, extra='text-align:center') + T(px - 60, y + hgt + 11, 'N', 8.2, 10, INK, p['text'], w=120, extra='text-align:center')
        else: s += VL(px, y - 6, y - hgt, LINE, .8) + T(px - 55, y - hgt - 11, 'B', 9, 11, col, p['datum'], w=110, extra='text-align:center') + T(px - 60, y - hgt - 24, 'N', 8.2, 10, INK, p['text'], w=120, extra='text-align:center')
    for p in b.get('phasen', []):   # Phasenbänder über der Achse
        x1, x2 = X(_monat(p[0])), X(_monat(p[1]))
        s += R(round(x1, 1), y + 10, round(x2 - x1 - 2, 1), 22, _farbe(p[3]), extra=SQ) + T(round(x1 + 8, 1), y + 18, 'B', 8, 10, '#ffffff' if p[3] in ('navy', 'acc', 'mid') else NAVY, p[2], extra='letter-spacing:.02em')
    if b.get('heute'):
        hx = X(_monat(b['heute']))
        s += (f'<div class="t" style="left:{hx:.2f}pt;top:{H-y-70:.2f}pt;height:140pt;border-left:1.2pt dashed {ACC}"></div>'
              + R(round(hx - 26, 1), y - 92, 52, 16, ACC, extra=SQ) + T(round(hx - 26, 1), y - 86, 'B', 7.4, 9, '#ffffff', 'HEUTE', w=52, extra='text-align:center;letter-spacing:.08em'))
    b['_unten'] = y - 100
    return s


def b_matrix(b):
    x, y, w, h = b['x'], b['y'], b['w'], b['h']; g = b.get('gap', 10); s = ''
    ox = 30 if b.get('zeilen_titel') else 0; oy = 18 if b.get('spalten_titel') else 0
    cw = (w - ox - g) / 2; chh = (h - oy - g) / 2
    for i, t in enumerate(b.get('spalten_titel', [])):
        s += EB(x + ox + i * (cw + g), y - 2, t, ACC, 7.6)
    for i, t in enumerate(b.get('zeilen_titel', [])):
        cy_ = y - oy - i * (chh + g) - chh / 2
        s += (f'<div class="t" style="left:{x-chh/2+10:.1f}pt;top:{H-cy_-6:.1f}pt;width:{chh:.1f}pt;transform:rotate(-90deg);text-align:center;'
              f'font-family:\'DM Mono\',monospace;font-size:7.2pt;line-height:10pt;letter-spacing:.06em;text-transform:uppercase;color:{ACC}">{t}</div>')
    for i, c in enumerate(b['zellen']):
        cx = x + ox + (i % 2) * (cw + g); cy = y - oy - (i // 2) * (chh + g)
        s += R(round(cx, 2), round(cy - chh, 2), round(cw, 2), round(chh, 2), LIGHT, .18, extra=SQ) + R(round(cx, 2), round(cy - 2.6, 2), round(cw, 2), 2.6, ACC if c.get('akzent') else NAVY, extra=SQ)
        yy = cy - 20
        if c.get('tag'): s += CHIP(cx + 16, yy + 4, c['tag'], True); yy -= 18
        s += EB(cx + 16, yy, c['titel'], NAVY, 7.6); yy -= 18; fs = b.get('schrift', 8.8)
        for p in c['punkte']:
            html = f'<span style="font-weight:500;color:{NAVY}">{p[0]}</span> {p[1]}' if isinstance(p, list) else p
            pl = (p[0] + ' ' + p[1]) if isinstance(p, list) else p
            s += T(cx + 16, yy, 'N', fs, fs * 1.42, INK, html, w=cw - 32); yy -= nlines(pl, fs, cw - 32) * fs * 1.42 + 6
    b['_unten'] = y - h
    return s


def b_bild(b):
    x, y, w, h = b['x'], b['y'], b['w'], b['h']; s = ''
    if b.get('weiss'): s += R(x, y - h, w, h, '#ffffff', extra=SQ)
    pad = b.get('pad', 0)
    s += IMG(b['bild'], x + pad, y - h + pad, w - 2 * pad, h - 2 * pad, b.get('pos', 'center'), 'contain' if b.get('contain') else 'cover')
    if b.get('titel'): s += EB(x, y - h - 13, b['titel'], GREY, 7)
    b['_unten'] = y - h - 16
    return s


def b_schritte(b):
    x, y, w = b['x'], b['y'], b['w']; s = ''; n = len(b['items']); cw = w / n
    for i, (d_, t1, t2) in enumerate(b['items']):
        cx = x + i * cw
        s += L(cx, y, cx + cw - 14, NAVY, 1.2) + EB(cx, y - 15, d_, ACC, 7.2) + T(cx, y - 33, 'B', 9.4, 12, NAVY, t1, w=cw - 18) + T(cx, y - 49, 'N', 8.4, 11.4, INK, t2, w=cw - 18)
    b['_unten'] = y - 49 - max(nlines(t2, 8.4, cw - 18) for _, _, t2 in b['items']) * 11.4
    return s


BLOECKE = {'tabelle': b_tabelle, 'kv': b_kv, 'text': b_text, 'balken': b_balken, 'saeulen': b_saeulen, 'linie': b_linie, 'spanne': b_spanne,
           'kpi': b_kpi, 'dunkel': b_dunkel, 'gantt': b_gantt, 'zeitstrahl': b_zeitstrahl, 'matrix': b_matrix, 'bild': b_bild, 'schritte': b_schritte}


def _rgba(hexc, a):
    h = hexc.lstrip('#'); return f'rgba({int(h[0:2],16)},{int(h[2:4],16)},{int(h[4:6],16)},{a})'


def _svg(inner, clip=None):
    cp = ''
    if clip:
        x, y, w, h = clip; cid = f'c{abs(hash((x, y, w, h, C.page))) % 10**8}'
        cp = f'<defs><clipPath id="{cid}"><rect x="{x}" y="{H-y}" width="{w}" height="{h}"/></clipPath></defs>'
        inner = f'<g clip-path="url(#{cid})">{inner}</g>'
    return f'<svg class="t" style="left:0;top:0;width:907pt;height:567pt;overflow:visible" viewBox="0 0 907 567">{cp}{inner}</svg>'


HALO = 'text-shadow:0 0 2pt #fff,0 0 2pt #fff,0 0 1pt #fff;'


def b_karte(b):
    """Regionalkarte aus gemeinfreien Geodaten: Länder, Kantone, Rhein, Standort mit Strahlen oder Radien."""
    x, y, w, h = b['x'], b['y'], b['w'], b['h']
    geo = json.load(open(os.path.join(C.objdir, b['geo'])))
    lon0, lat0, lon1, lat1 = b['bbox']; latc = (lat0 + lat1) / 2; cs = math.cos(math.radians(latc))
    k = min(w / ((lon1 - lon0) * cs), h / (lat1 - lat0)); lonc = (lon0 + lon1) / 2
    cx0, cy0 = x + w / 2, y - h / 2
    P = lambda lon, lat: (cx0 + (lon - lonc) * cs * k, cy0 + (lat - latc) * k)   # Seitenkoordinaten, Ursprung unten
    def path(g):
        t = g['type']; cs_ = g['coordinates']
        rings = {'Polygon': cs_, 'MultiPolygon': [r for p in cs_ for r in p], 'LineString': [cs_], 'MultiLineString': cs_}.get(t, [])
        close = 'Z' if 'Polygon' in t else ''
        return ''.join('M' + 'L'.join(f'{P(a, c)[0]:.1f},{H-P(a, c)[1]:.1f}' for a, c in r) + close for r in rings if r)
    fill = {'DEU': '#ffffff', 'CHE': _rgba(LIGHT, .30), 'FRA': '#ece7df', 'AUT': '#ece7df', 'LIE': '#ece7df'}
    sv = f'<rect x="{x}" y="{H-y}" width="{w}" height="{h}" fill="#ece7df"/>'
    feats = geo['features']
    for f in feats:
        if f['properties']['typ'] == 'land': sv += f'<path d="{path(f["geometry"])}" fill="{fill.get(f["properties"]["iso"], "#ece7df")}" stroke="none"/>'
    for f in feats:
        if f['properties']['typ'] == 'region': sv += f'<path d="{path(f["geometry"])}" fill="none" stroke="#cfc7bb" stroke-width=".45"/>'
    for f in feats:
        if f['properties']['typ'] == 'see': sv += f'<path d="{path(f["geometry"])}" fill="#d3e2e8" stroke="none"/>'
        if f['properties']['typ'] == 'fluss': sv += f'<path d="{path(f["geometry"])}" fill="none" stroke="#9dbfcc" stroke-width="1.3"/>'
    for f in feats:
        if f['properties']['typ'] == 'land' and f['properties']['iso'] in ('CHE',):
            sv += f'<path d="{path(f["geometry"])}" fill="none" stroke="{NAVY}" stroke-width=".9" stroke-dasharray="3 1.6"/>'
    z = b['ziel']; zx, zy = P(z['lon'], z['lat'])
    for r in b.get('ringe', []):
        rp = r / 111.2 * k
        sv += f'<circle cx="{zx:.1f}" cy="{H-zy:.1f}" r="{rp:.1f}" fill="none" stroke="{ACC}" stroke-width=".8" stroke-dasharray="2.5 2"/>'
    s = ''
    for o in b.get('orte', []):
        ox, oy = P(o['lon'], o['lat'])
        if b.get('strahlen'): sv += f'<line x1="{zx:.1f}" y1="{H-zy:.1f}" x2="{ox:.1f}" y2="{H-oy:.1f}" stroke="{ACC}" stroke-width=".8" stroke-dasharray="3 2"/>'
        sv += f'<circle cx="{ox:.1f}" cy="{H-oy:.1f}" r="2.6" fill="{NAVY}"/>'
        dx, dy = o.get('dx', 6), o.get('dy', 2); al = o.get('align', 'left')
        lx = ox + dx if al == 'left' else ox - dx - 140
        st = '' if al == 'left' else 'text-align:right'
        s += T(round(lx, 1), oy + dy, 'B', 8.4, 10, NAVY, o['name'], w=140, extra=st + ';text-shadow:0 0 2pt #fff,0 0 2pt #fff,0 0 1pt #fff;')
        if o.get('sub'): s += T(round(lx, 1), oy + dy - 10.5, 'N', 7.4, 9, GREY, o['sub'], w=140, extra=st + ';text-shadow:0 0 2pt #fff,0 0 2pt #fff,0 0 1pt #fff;')
    for r in b.get('ringe', []):
        rp = r / 111.2 * k
        s += T(round(zx + rp * .71 + 2, 1), zy - rp * .71 - 2, 'B', 6.6, 9, ACC, f'{r} km', extra='text-shadow:0 0 2pt #fff,0 0 2pt #fff,0 0 1pt #fff;')
    for f_ in b.get('fern', []):
        fx, fy = P(f_['lon'], f_['lat']); m = 16; dx_, dy_ = fx - zx, fy - zy
        ts = [t for t in ((x + w - m - zx) / dx_ if dx_ > 0 else None, (x + m - zx) / dx_ if dx_ < 0 else None,
                          (y - m - zy) / dy_ if dy_ > 0 else None, (y - h + m - zy) / dy_ if dy_ < 0 else None) if t]
        t = min(ts); bx_, by_ = zx + dx_ * t, zy + dy_ * t
        ang = math.degrees(math.atan2(-(by_ - zy), bx_ - zx))
        sv += f'<line x1="{zx:.1f}" y1="{H-zy:.1f}" x2="{bx_:.1f}" y2="{H-by_:.1f}" stroke="{ACC}" stroke-width=".8" stroke-dasharray="3 2"/>'
        sv += f'<g transform="translate({bx_:.1f},{H-by_:.1f}) rotate({ang:.1f})"><path d="M0,0 L-7,-3.5 L-7,3.5 Z" fill="{NAVY}"/></g>'
        right = bx_ > x + w * .6
        lx2 = bx_ - 150 - 6 if right else bx_ + 8; ly2 = by_ - 14 if by_ > y - 30 else by_ + 16
        al = 'text-align:right;' if right else ''
        s += T(round(lx2, 1), ly2, 'B', 8, 10, NAVY, f_['name'] + ' →' if right else f_['name'], w=150, extra=al + HALO) + T(round(lx2, 1), ly2 - 10, 'N', 7, 9, GREY, f_.get('sub', ''), w=150, extra=al + HALO)
    for lab in b.get('laender', []):
        lx_, ly_ = P(lab['lon'], lab['lat'])
        s += EB(round(lx_, 1), ly_, lab['name'], _farbe(lab['farbe']) if lab.get('farbe') else GREY, 7)
    sv += f'<circle cx="{zx:.1f}" cy="{H-zy:.1f}" r="6.5" fill="#ffffff" stroke="{NAVY}" stroke-width="1.6"/><circle cx="{zx:.1f}" cy="{H-zy:.1f}" r="3" fill="{NAVY}"/>'
    bw = max(width(z['name'], 'B', 8.4), width(z.get('sub', ''), 'N', 6.8)) + 20
    bx = zx + z.get('dx', 12); by = zy + z.get('dy', 10)
    s += R(round(bx, 1), round(by - 6, 1), round(bw, 1), 30, NAVY, extra='border-radius:0') + T(round(bx + 10, 1), by + 13, 'B', 8.4, 11, '#ffffff', z['name']) + T(round(bx + 10, 1), by + 2, 'N', 6.8, 9, MIST, z.get('sub', ''))
    out = _svg(sv, (x, y, w, h)) + f'<div class="t" style="left:{x}pt;top:{H-y}pt;width:{w}pt;height:{h}pt;border:.6pt solid {LINE}"></div>' + s
    if b.get('nachweis'): out += T(x, y - h - 11, 'N', 7, 9, GREY, b['nachweis'])
    b['_unten'] = y - h - 14
    return out


def b_donut(b):
    x, y = b['x'], b['y']; r = b.get('r', 70); ring = b.get('ring', 22); items = b['items']; tot = sum(i[1] for i in items)
    cx, cy = x + r, y - r - (18 if b.get('titel') else 0); s = ''
    if b.get('titel'): s += BT(x, y, b['titel'])
    sv = ''; a0 = -90
    for lab, v, col in items:
        a1 = a0 + 360 * v / tot; rm = r - ring / 2
        p0 = (cx + rm * math.cos(math.radians(a0)), H - cy + rm * math.sin(math.radians(a0)))
        p1 = (cx + rm * math.cos(math.radians(a1 - .6)), H - cy + rm * math.sin(math.radians(a1 - .6)))
        sv += f'<path d="M{p0[0]:.2f},{p0[1]:.2f} A{rm},{rm} 0 {1 if a1 - a0 > 180 else 0} 1 {p1[0]:.2f},{p1[1]:.2f}" fill="none" stroke="{_farbe(col)}" stroke-width="{ring}"/>'
        a0 = a1
    s += _svg(sv) + T(cx - 60, cy + 2, 'L', b.get('mitte_groesse', 15), 18, NAVY, b['mitte'][0], w=120, extra='text-align:center;font-variant-numeric:tabular-nums') + T(cx - 60, cy - 16, 'M', 6.4, 9, GREY, b['mitte'][1].upper(), w=120, extra='text-align:center;letter-spacing:.06em')
    lx = x + 2 * r + 30; ly = cy + 10.5 * len(items) - 6
    for lab, v, col in items:
        s += R(lx, ly - 3, 9, 9, _farbe(col), extra=SQ) + T(lx + 15, ly, 'N', 8.8, 11, INK, lab) + RT(lx + b.get('lw', 190), ly, 'B', 8.8, 11, NAVY, b.get('format', '{:,.0f} m²').format(v).replace(',', '.'), 80)
        ly -= 21
    b['_unten'] = cy - r - 10
    return s


def b_hstack(b):
    x, y, w = b['x'], b['y'], b['w']; lw = b.get('lw', 150); sw = b.get('sw', 70); mx = b['max']; s = ''; bh = b.get('bh', 24); st = b.get('abstand', 42)
    if b.get('titel'): s += BT(x, y, b['titel']); y -= 20
    leg = []
    for lab, segs, summe in b['zeilen']:
        s += T(x, y - bh / 2 - 3, 'N', 8.8, 11, INK, lab, w=lw - 8); bx = x + lw
        for v, col, nm in segs:
            sw_ = (w - lw - sw) * v / mx
            s += R(round(bx, 2), y - bh, round(sw_, 2) - .8, bh, _farbe(col), extra=SQ)
            if sw_ > 40: s += T(round(bx + 6, 2), y - bh / 2 - 2.8, 'B', 7.6, 9, '#ffffff' if col in ('navy', 'acc', 'mid') else NAVY, nm)
            if nm not in [l[0] for l in leg]: leg.append((nm, col))
            bx += sw_
        s += T(round(bx + 7, 2), y - bh / 2 - 3, 'B', 9.4, 11, NAVY, summe)
        y -= st
    b['_unten'] = y
    return s


def b_achsen(b):
    """Achsenbeschriftung für eine Matrix: Spaltenköpfe oben, Zeilenköpfe links (gedreht)."""
    s = ''
    for i, t in enumerate(b['oben']):
        s += EB(b['x'] + b['lx'] + i * b['cw'], b['y'], t, ACC, 6.8)
    for i, t in enumerate(b['links']):
        yy = b['y'] - 14 - b['ch'] * i - b['ch'] / 2
        s += T(b['x'] - 30, yy, 'M', 6.4, 9, ACC, t.upper(), w=b['ch'], extra=f'letter-spacing:.06em;transform:rotate(-90deg);transform-origin:left top;left:{b["x"]}pt;top:{H-yy+b["ch"]/2:.1f}pt;text-align:center')
    b['_unten'] = b['y']
    return s


BLOECKE.update({'karte': b_karte, 'donut': b_donut, 'hstack': b_hstack, 'achsen': b_achsen})


def m_raster(d, obj):
    s = chrome(d['kopf']) + EB(51, 487, d['dachzeile']) + T(51, 450, 'S', 31, 34, INK, d['titel'])
    if d.get('intro'): s += T(51, 418, 'N', 9.6, 14, INK, d['intro'], w=805)
    prev = None
    for blk in d['bloecke']:
        if blk.get('y') == 'folgt': blk['y'] = prev['_unten'] - blk.get('abstand', 18)
        s += BLOECKE[blk['typ']](blk); prev = blk
    if d.get('quelle'):
        q = br(d['quelle']); nl = nlines(q.replace('<br>', ' '), 7.4, 805) + q.count('<br>')
        s += cap(51, 30 + 10.5 * nl, q, w=805)
    return s


def m_bildseite(d):
    """Atmosphärische Doppelseite: Foto vollflächig, Textspalte links mit Akzentfarbe, Kennzahlen unten."""
    over = (f'<div class="t" style="left:0;top:0;width:907pt;height:567pt;background:linear-gradient(90deg,{_rgba(NAVY,.9)} 0%,{_rgba(NAVY,.72)} 30%,{_rgba(NAVY,.15)} 62%,{_rgba(NAVY,0)} 80%)"></div>'
            if d.get('stil') == 'voll' else R(0, 0, COL, 567, NAVY, .62))
    s = (IMG(d['bild'], 0, 0, 907, 567, d.get('bild_pos', 'center')) + over
         + MARK('white') + HEAD(d['kopf']) .replace(f'color:{ACC}', 'color:#ffffff;' + SHADOW) + FOOT(img=True) + PN(img=True)
         + EB(51, 404, d['dachzeile'], CREAM, 8.5) + T(51, 360, 'S', 32, 37, CREAM, br(d['titel']))
         + T(51, 360 - 37 * (len(d['titel']) - 1) - 46, 'N', 9.8, 14.8, MIST, d['text'], w=270))
    for i, (v, lab) in enumerate(d['kennzahlen']):
        x = 51 + i * 100
        s += L(x, 108, x + 86, LIGHT, .8) + T(x, 82, 'L', 20, 24, '#ffffff', v, extra='font-variant-numeric:tabular-nums;letter-spacing:-.02em') + EB(x, 60, lab, LIGHT, 6.2)
    return s + (T(51, 36, 'N', 6.2, 8.7, MIST, d['hinweis']) if d.get('hinweis') else '')


MODULE = {'raster': m_raster, 'bildseite': m_bildseite, 'titel': m_titel, 'vorwort': m_vorwort, 'inhalt': m_inhalt, 'ueberblick': m_ueberblick, 'fakten': m_fakten, 'tabelle': m_tabelle, 'ueberblick_kosten': m_ueberblick_kosten, 'split': m_split,
          'lage': m_lage, 'raumprogramm': m_raumprogramm, 'grundrisse': m_grundrisse, 'sanierung': m_sanierung,
          'projektstand': m_projektstand, 'energie': m_energie, 'kosten': m_kosten, 'vergleich': m_vergleich,
          'einheit': m_einheit, 'plaene': m_plaene, 'markt': m_markt, 'rendite': m_rendite, 'partner': m_partner,
          'kontakt': m_kontakt, 'ueber': m_ueber, 'recht': m_recht, 'agb': m_agb}
NEEDS_OBJ = {'raster', 'fakten', 'tabelle', 'kosten', 'ueberblick_kosten', 'vergleich', 'einheit', 'rendite', 'recht', 'agb'}
NEEDS_SHARED = {'partner', 'ueber'}

ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']


def css():
    return f"""@font-face{{font-family:'DM Sans';src:url(../../shared/fonts/dm-sans-400.ttf);font-weight:400}}
@font-face{{font-family:'DM Sans';src:url(../../shared/fonts/dm-sans-500.ttf);font-weight:500}}
@font-face{{font-family:'DM Sans';src:url(../../shared/fonts/dm-sans-var.ttf);font-weight:300}}
@font-face{{font-family:'DM Mono';src:url(../../shared/fonts/dm-mono-400.ttf);font-weight:400}}
@font-face{{font-family:'GF Logo';src:url(../../shared/fonts/cormorant-garamond-var.ttf);font-weight:300 700}}
@font-face{{font-family:'GF Serif';src:url(../../shared/fonts/texgyrepagella-regular.otf);font-weight:400}}
@font-face{{font-family:'GF Serif';src:url(../../shared/fonts/texgyrepagella-bold.otf);font-weight:700}}
@font-face{{font-family:'GF Serif';src:url(../../shared/fonts/texgyrepagella-italic.otf);font-style:italic}}
@page{{size:907pt 567pt;margin:0}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:{CREAM};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{{width:907pt;height:567pt;position:relative;overflow:hidden;background:{CREAM};break-after:page}}
.t{{position:absolute}}
.agb{{font-family:'DM Sans',sans-serif;color:{INK};font-size:6.8pt;line-height:8.5pt}}
.agb h4{{font-size:7.9pt;line-height:10.4pt;font-weight:500;margin:0 0 2pt}}
.agb p{{margin:0 0 6pt}}"""


def build(objdir):
    global C
    obj = json.load(open(os.path.join(objdir, 'objekt.json')))
    shared = json.load(open(os.path.join(SHARED, 'grenford.json')))
    C = Ctx(objdir, obj['meta'])
    global NAVY, ACC, LIGHT
    th = THEMES[obj['meta'].get('bereich', 'property')]; NAVY, ACC, LIGHT = th['NAVY'], th['ACC'], th['LIGHT']
    # Seitenzählung: Titel ohne Zahl · Vorspann römisch · Objektteil arabisch · Anhang römisch fortlaufend
    labels, ids = {}, {}; rom = 0; arab = 0
    for i, sd in enumerate(obj['seiten'], 1):
        b = sd.get('bereich', 'objekt')
        if i == 1: lab = ''
        elif b == 'objekt': arab += 1; lab = str(arab)
        else: lab = ROMAN[rom]; rom += 1
        lab = sd.get('label', lab)
        labels[i] = lab
        if sd.get('id'): ids[sd['id']] = lab
    C.labels = labels
    # Inhaltsverzeichnis: Seitenbereiche automatisch
    for sd in obj['seiten']:
        if sd['modul'] == 'inhalt':
            for k in sd['kapitel']:
                if 'seiten_text' in k: k['_seiten'] = k['seiten_text']; continue
                a, z = ids[k['seiten'][0]], ids[k['seiten'][-1]]
                k['_seiten'] = a if a == z else f'{a}–{z}'
    if any(sd['modul'] == 'lage' for sd in obj['seiten']) and not os.path.exists(os.path.join(SHARED, 'assets', 'berlin-karte.png')):
        berlin_map_png(os.path.join(SHARED, 'assets', 'berlin-karte.png'))
    pages = []
    for i, sd in enumerate(obj['seiten'], 1):
        C.page = i; m = sd['modul']; fn = MODULE[m]
        if m in NEEDS_OBJ: html = fn(sd, obj)
        elif m in NEEDS_SHARED: html = fn(sd, shared)
        else: html = fn(sd)
        pages.append(html)
    out = ''.join(f'<section class="page">{p}</section>' for p in pages)
    # Seitenverweise {seite:id}
    out = re.sub(r'\{seite:([\w-]+)\}', lambda m: ids[m.group(1)], out)
    html = (f'<!doctype html><html lang="de"><head><meta charset="utf-8"><title>{obj["meta"]["titel"]}</title>'
            f'<style>{css()}</style></head><body>{out}</body></html>')
    open(os.path.join(objdir, 'brief.html'), 'w').write(html)
    return len(pages), obj['meta']['ausgabe']
