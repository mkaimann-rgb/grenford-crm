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
FS = 7.2              # Fußzeile und Seitenzahl
FONT = {'B': ("'DM Sans',sans-serif;font-weight:500", .34),
        'N': ("'DM Sans',sans-serif;font-weight:400", .34),
        'S': ("'GF Serif',serif;font-weight:400", .22),
        'SB': ("'GF Serif',serif;font-weight:700", .22)}
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
    font = ImageFont.truetype(os.path.join(SHARED, 'fonts', _TTF.get(f, _TTF['N'])), 400)
    return font.getlength(re.sub(r'<[^>]+>', '', text)) * size / 400 * 1.0 + spacing * size * len(text)


def T(x, base, f, size, tl, color, text, w=None, extra=''):
    fam, k = FONT[f]
    top = H - base - tl / 2 - k * size
    ws = f'width:{w}pt;' if w else 'white-space:nowrap;'
    return (f'<div class="t" style="left:{x}pt;top:{top:.2f}pt;font-family:{fam};'
            f'font-size:{size}pt;line-height:{tl}pt;color:{color};{ws}{extra}">{text}</div>')


def EB(x, base, text, color=ACC, size=7):
    return T(x, base, 'B', size, size * 1.45, color, text, extra='letter-spacing:.07em;text-transform:uppercase')


def RT(x2, base, f, size, tl, color, text, w=200):
    return T(x2 - w, base, f, size, tl, color, text, w=w, extra='text-align:right')


def R(x, y, w, h, color=NAVY, a=1, extra=''):
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


def MARK(color='navy', x=51, y=516.0142, scale=.068564):
    return PIC(f'mark-{color}.png', x, y, round(773 * scale, 3), round(379 * scale, 3))


def HEAD(label):
    return EB(600, 529, label, ACC, 9)


def PN(color=None):
    return T(830, 12, 'N', FS, 10, color or GREY, C.labels.get(C.page, ''))


def FOOT(color=GREY, text=None):
    return T(51, 10.8, 'N', FS, 10, color, text or C.foot, extra='letter-spacing:.05em')


def chrome(label, logo='navy', foot=True):
    s = MARK(logo) if logo else ''
    s += HEAD(label)
    if foot: s += FOOT()
    return s + PN()


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
    gap = (490 - sum(ws)) / 4; xs = []; x = 390 + gap
    for w in ws: xs.append(round(x, 2)); x += w + gap
    s = (IMG(d['bild'], 0, 0, 907, 567, d.get('bild_pos', 'center'))
         + R(0, 0, COL, 567, NAVY, .6, extra=COLCUT()) + COLLINE() + MARK('white', 47, 450.63, .217335)
         + EB(51, 404, d.get('dachzeile', 'Property Brief'), CREAM, 8.5)
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
            + FOOT(CREAM))


def m_inhalt(d):
    s = (HEAD('Inhalt') + PN() + IMG(d['bild'], 0, 0, COL, 567, d.get('bild_pos', 'center'), extra=COLCUT())
         + R(0, 0, COL, 567, NAVY, .4, extra=COLCUT()) + COLLINE() + MARK('white') + FOOT(CREAM)
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
         + chrome(d['kopf']) + EB(x0, 487, d['dachzeile']) + T(x0, 447, 'S', 31, 34, INK, br(d['titel']))
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
         + T(round(cx - 12.75, 2), round(H - cy + 3, 2), 'SB', 7.5, 10, CREAM, 'GF', extra='width:25.5pt;text-align:center'))
    lx = min(cx + 43.7, HALF - 175); lb = H - cy + 21
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
         + HEAD('Das Raumprogramm') + PN(INK)
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
    s += chrome(d['kopf']) + EB(TX, 481, d['dachzeile']) + T(TX, 446, 'S', 24, 26, INK, br(d['titel']))
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
    for i, k in enumerate(d['spalte']):
        b = 409 - 117 * i
        s += T(660, b, 'S', k.get('groesse', 22 if i else 30), 40 if not i else 30, CREAM, k['wert']) + EB(660, b - 26, k['label'], LIGHT, 6.8)
        if k.get('sub'): s += T(660, b - 41, 'N', 7.5, 10, MIST, k['sub'], w=180)
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
    return s + (R(TX, 40, 356, 120) + EB(TX + 18, 140, 'Energieeffizienzklasse', LIGHT, 6.6) + T(TX + 18, 70, 'S', 54, 58, CREAM, d['klasse'])
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
    s = (IMG(d['bild'], 0, 0, HALF, 567, d.get('bild_pos', 'center'), extra=cl) + ln_ + chrome(d['kopf'])
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
    s = (chrome('Partner &amp; Service') + EB(51, 477, 'Rund um Ihren Kauf') + T(51, 440, 'S', 31, 34, INK, 'Gut vernetzt.<br>Für jeden Schritt.')
         + T(51, 370, 'N', 9.8, 14.5, INK, d['intro'], w=340) + R(51, 40, 356, 268) + EB(71, 286, 'So funktioniert es', LIGHT, 6.8))
    for i, (n, t) in enumerate(d['schritte']):
        b = 252 - 54 * i
        s += (L(71, b + 22, 387, 'rgba(169,184,207,.35)', .6) + T(71, b, 'S', 20, 24, LIGHT, f'0{i+1}')
              + T(111, b + 2, 'S', 13, 17, CREAM, n) + T(111, b - 13, 'N', 8.2, 11, MIST, t))
    s += (L(71, 252 - 54 * 3 + 22, 387, 'rgba(169,184,207,.35)', .6)
          + T(71, 64, 'N', 8.4, 12, CREAM, 'Ihr Ansprechpartner: Marco Kaimann') + T(71, 51, 'N', 8, 11, MIST, '+49 172 425 9087 · mkaimann@grenford.de'))
    for i, b in enumerate(d['bereiche']):
        ln = 487 - 140 * i
        s += (L(TX, ln, 856) + EB(TX, ln - 15, f'0{i+1}', ACC, 7) + T(TX, ln - 36, 'S', 17, 22, INK, b['titel'])
              + T(TX, ln - 56, 'N', 9, 13.4, INK, b['text'], w=356) + CHIPS(TX, ln - 112, b['chips']))
    return s + L(TX, 487 - 140 * 3, 856) + cap(TX, 34, br(d['hinweis']), w=356)


def m_kontakt(d):
    s = (HEAD('Nächster Schritt &amp; Kontakt') + PN() + IMG(d['bild'], 0, 0, COL, 567, d.get('bild_pos', 'center'), extra=COLCUT())
         + R(0, 0, COL, 567, NAVY, .4, extra=COLCUT()) + COLLINE() + MARK('white') + FOOT(CREAM)
         + T(51, 140, 'S', 29, 33, CREAM, br(d['claim'])) + EB(412, 488, d['dachzeile']) + T(412, 448, 'S', 30, 32, INK, br(d['titel'])))
    for i, (h, t) in enumerate(d['schritte']):
        ln = 382 - 64 * i
        s += (L(412, ln, 856) + T(412, ln - 30, 'S', 22, 30, ACC, f'0{i+1}')
              + T(466, ln - 22, 'S', 14.5, 19, INK, h) + T(466, ln - 39, 'N', 9, 12.8, INK, t, w=388))
    return (s + L(412, 382 - 64 * 3, 856) + R(412, 74, 444, 102) + EB(432, 155, 'Besichtigung vereinbaren', LIGHT, 6.8)
            + T(432, 132, 'S', 16, 21, CREAM, 'Marco Kaimann begleitet Sie persönlich.')
            + T(432, 110, 'N', 9.2, 14, CREAM, '+49 172 425 9087 · mkaimann@grenford.de')
            + T(432, 96, 'N', 8.4, 13, MIST, 'GRENFORD · Kurfürstendamm 96 · 10709 Berlin · www.grenford.de')
            + T(412, 28, 'N', 6.6, 9, GREY, 'GRENFORD ist die Geschäftsbezeichnung des Einzelunternehmens Marco Kaimann · USt-IdNr.: DE362752159'))


def m_ueber(d, shared):
    s = (HEAD('Über GRENFORD') + PN() + IMG(d['bild'], 0, 0, COL, 567, d.get('bild_pos', 'center'), extra=COLCUT())
         + R(0, 0, COL, 567, NAVY, .4, extra=COLCUT()) + COLLINE() + MARK('white') + FOOT(CREAM)
         + T(51, 121, 'S', 29, 32, CREAM, 'Wir strukturieren<br>Immobilien-<br>entscheidungen.'))
    h = round(95 * 379 / 773, 2)
    for i, (brand, t, desc, lab, logo) in enumerate(shared['geschaeftsfelder']):
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
    agb = open(os.path.join(SHARED, 'agb.html')).read().replace('{{courtage_satz}}', k['agb_courtage'])
    p = re.findall(r'<h4>.*?</p>', agb)
    cols = [''.join(p[0:4]), ''.join(p[4:8]), ''.join(p[8:])]
    return (chrome('Anhang · Allgemeine Geschäftsbedingungen') + head('GRENFORD Property · Immobilienvermittlung', 'Allgemeine Geschäftsbedingungen.', 29, 32, 438)
            + T(51, 417, 'N', 8, 11.6, GREY, f'Marco Kaimann, Einzelunternehmer, Geschäftsbezeichnung GRENFORD · Kurfürstendamm 96, 10709 Berlin · mkaimann@grenford.de · Stand: {obj["meta"]["agb_stand"]}')
            + ''.join(f'<div class="t agb" style="left:{x}pt;top:{H-399:.1f}pt;width:255pt">{c}</div>' for x, c in zip((51, 324, 597), cols)))


MODULE = {'titel': m_titel, 'vorwort': m_vorwort, 'inhalt': m_inhalt, 'ueberblick': m_ueberblick, 'split': m_split,
          'lage': m_lage, 'raumprogramm': m_raumprogramm, 'grundrisse': m_grundrisse, 'sanierung': m_sanierung,
          'projektstand': m_projektstand, 'energie': m_energie, 'kosten': m_kosten, 'vergleich': m_vergleich,
          'einheit': m_einheit, 'plaene': m_plaene, 'markt': m_markt, 'rendite': m_rendite, 'partner': m_partner,
          'kontakt': m_kontakt, 'ueber': m_ueber, 'recht': m_recht, 'agb': m_agb}
NEEDS_OBJ = {'kosten', 'vergleich', 'einheit', 'rendite', 'recht', 'agb'}
NEEDS_SHARED = {'partner', 'ueber'}

ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']


def css():
    return f"""@font-face{{font-family:'DM Sans';src:url(../../shared/fonts/dm-sans-400.ttf);font-weight:400}}
@font-face{{font-family:'DM Sans';src:url(../../shared/fonts/dm-sans-500.ttf);font-weight:500}}
@font-face{{font-family:'GF Serif';src:url(../../shared/fonts/texgyrepagella-regular.otf);font-weight:400}}
@font-face{{font-family:'GF Serif';src:url(../../shared/fonts/texgyrepagella-bold.otf);font-weight:700}}
@font-face{{font-family:'GF Serif';src:url(../../shared/fonts/texgyrepagella-italic.otf);font-style:italic}}
@page{{size:907pt 567pt;margin:0}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:{CREAM};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{{width:907pt;height:567pt;position:relative;overflow:hidden;background:{CREAM};break-after:page}}
.t{{position:absolute}}
.agb{{font-family:'DM Sans',sans-serif;color:{INK};font-size:7.0pt;line-height:9.2pt}}
.agb h4{{font-size:7.9pt;line-height:10.4pt;font-weight:500;margin:0 0 2pt}}
.agb p{{margin:0 0 7pt}}"""


def build(objdir):
    global C
    obj = json.load(open(os.path.join(objdir, 'objekt.json')))
    shared = json.load(open(os.path.join(SHARED, 'grenford.json')))
    C = Ctx(objdir, obj['meta'])
    # Seitenzählung: Titel ohne Zahl · Vorspann römisch · Objektteil arabisch · Anhang römisch fortlaufend
    labels, ids = {}, {}; rom = 0; arab = 0
    for i, sd in enumerate(obj['seiten'], 1):
        b = sd.get('bereich', 'objekt')
        if i == 1: lab = ''
        elif b == 'objekt': arab += 1; lab = str(arab)
        else: lab = ROMAN[rom]; rom += 1
        labels[i] = lab
        if sd.get('id'): ids[sd['id']] = lab
    C.labels = labels
    # Inhaltsverzeichnis: Seitenbereiche automatisch
    for sd in obj['seiten']:
        if sd['modul'] == 'inhalt':
            for k in sd['kapitel']:
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
