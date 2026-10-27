"""Erzeugt Browser-Symbole und das Teilen-Bild aus Logo, Schrift und Skyline (einmalig, Ergebnis liegt in static/assets/).

    python3 tools/brand_images.py

favicon-32.png, favicon-192.png, apple-touch-icon.png  Logo in Navy auf Elfenbein
grenford-logo-256.webp                                  Logo für Kopf und Footer
og-grenford.jpg (1200 × 630)                            Vorschau beim Teilen in WhatsApp, LinkedIn, Mail
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'static' / 'assets'
NAVY, BRONZE, IVORY, MUTED = (34, 46, 65), (122, 106, 82), (250, 246, 242), (95, 100, 112)


def logo(size, monogram=False):
    im = Image.open(ASSETS / 'grenford-original.webp').convert('RGBA')
    im = im.crop(im.getbbox())
    if monogram:  # nur das Kreis-Monogramm: oberhalb der ersten leeren Zeile zwischen Zeichen und Schriftzug
        alpha = im.getchannel('A')
        rows = [any(alpha.getpixel((x, y)) > 40 for x in range(0, im.width, 2)) for y in range(im.height)]
        top = next(y for y, r in enumerate(rows) if r)
        gap = next(y for y in range(top + 20, im.height) if not rows[y])
        im = im.crop((0, 0, im.width, gap))
        im = im.crop(im.getbbox())
    im.thumbnail((size, size), Image.LANCZOS)
    return im


def icon(px, pad, monogram=False):
    canvas = Image.new('RGB', (px, px), IVORY)
    mark = logo(px - 2 * pad, monogram)
    canvas.paste(mark, ((px - mark.width) // 2, (px - mark.height) // 2), mark)
    return canvas


def og():
    w, h, panel = 1200, 630, 640
    canvas = Image.new('RGB', (w, h), IVORY)
    photo = Image.open(ASSETS / 'hero-berlin.webp').convert('L')
    photo = ImageOps.fit(photo, (w - panel, h), Image.LANCZOS, centering=(0.55, 0.5))
    tinted = ImageOps.colorize(photo, black=(20, 27, 39), white=(232, 228, 222))
    canvas.paste(tinted, (panel, 0))
    draw = ImageDraw.Draw(canvas)
    regular = lambda s: ImageFont.truetype(str(ASSETS / 'fonts' / 'dm-sans-400.ttf'), s)
    medium = lambda s: ImageFont.truetype(str(ASSETS / 'fonts' / 'dm-sans-500.ttf'), s)
    mark = logo(150)
    canvas.paste(mark, (64, 56), mark)
    draw.text((64, 250), 'BOUTIQUE REAL ESTATE ADVISORY · BERLIN', font=medium(19), fill=BRONZE)
    draw.text((60, 286), 'Der nächste', font=medium(74), fill=NAVY)
    draw.text((60, 366), 'Schritt zählt.', font=medium(74), fill=BRONZE)
    draw.line((64, 488, 576, 488), fill=(207, 200, 188), width=2)
    draw.text((64, 510), 'Investment · Property · Projects', font=regular(26), fill=MUTED)
    draw.text((64, 552), 'grenford.de', font=regular(22), fill=MUTED)
    return canvas


if __name__ == '__main__':
    icon(32, 3, monogram=True).save(ASSETS / 'favicon-32.png', optimize=True)
    icon(192, 18).save(ASSETS / 'favicon-192.png', optimize=True)
    icon(180, 18).save(ASSETS / 'apple-touch-icon.png', optimize=True)
    og().save(ASSETS / 'og-grenford.jpg', quality=86, optimize=True, progressive=True)
    # Logo für Kopf und Footer: wird mit ca. 90–100 px angezeigt, 256 px reichen auch für hochauflösende Bildschirme
    small = Image.open(ASSETS / 'grenford-original.webp').convert('RGBA').resize((256, 256), Image.LANCZOS)
    small.save(ASSETS / 'grenford-logo-256.webp', quality=90, method=6)
    print('Symbole und Teilen-Bild in static/assets/ geschrieben.')
