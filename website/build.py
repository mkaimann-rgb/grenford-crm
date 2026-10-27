"""Erzeugt die GRENFORD-Website.

    python3 build.py            -> dist/     (Produktion, saubere URLs wie /investment/)
    python3 build.py --preview  -> preview/  (Links mit index.html, für Vorschau ohne Webserver)

dist/ ist reine Ausgabe und wird bei jedem Lauf komplett neu erzeugt. Quellen liegen in
static/ (CSS, JS, Bilder, Schriften), *.json (Inhalte) und den *.py-Modulen.
"""
from pathlib import Path
import argparse, html, json, re, shutil, sys

import paths
from paths import SITE, page, asset, img, absolute, root
from collection import collection
from projects_comparison import comparisons
from ux_refinement import inquiry, contact, rail

ROOT = Path(__file__).parent
STATIC = ROOT / 'static'
D = json.loads((ROOT / 'content.json').read_text(encoding='utf-8'))
E = html.escape
CSS_ORDER = ['style.css', 'art.css', 'immersive.css', 'refinements.css']


# ---------------------------------------------------------------- Bausteine

def logo():
    return f'<a class="brand" href="{page("home")}" aria-label="GRENFORD Startseite"><img src="{asset("grenford-original.webp")}" alt="" width="1024" height="1024"></a>'


def request(intent, label, kind='button'):
    return f'<button class="{kind}" type="button" data-enquire="{intent}">{label}<span aria-hidden="true">↗</span></button>'


def header(active):
    current = ' aria-current="page"'
    links = ''.join(f'<a href="{page(k)}"{current if active == k else ""}>{d["label"]}</a>' for k, d in D.items())
    return ('<header class="site-header">' + logo() +
            '<button class="menu" type="button" aria-controls="mainnav" aria-expanded="false">Menü <span aria-hidden="true">＋</span></button>'
            f'<nav id="mainnav" aria-label="Hauptnavigation">{links}<a class="nav-contact" href="#kontakt">Kontakt <span aria-hidden="true">↗</span></a></nav></header>')


def footer():
    links = ''.join(f'<a href="{page(k)}">{d["label"]}</a>' for k, d in D.items())
    return ('<footer class="site-footer"><div class="footer-main">' + logo() +
            f'<p>Wir strukturieren<br><em>Immobilienentscheidungen.</em></p><div>{links}<a href="https://www.staynamic.com/" target="_blank" rel="noopener">STAYNAMIC ↗</a></div></div>'
            f'<div class="footer-bottom"><span>© 2026 GRENFORD · Marco Kaimann</span><span>USt-ID: {E(SITE["vatId"])}</span>'
            f'<a href="{E(SITE["imprint"])}">Impressum</a><a href="{E(SITE["privacy"])}">Datenschutz</a></div></footer>')


def structured_data():
    a = SITE['address']
    data = {
        '@context': 'https://schema.org', '@type': 'RealEstateAgent', 'name': 'GRENFORD',
        'description': SITE['home']['description'], 'url': absolute(), 'logo': absolute('assets/grenford-original.webp'),
        'email': SITE['email'], 'telephone': SITE['phoneHref'], 'vatID': SITE['vatId'],
        'founder': {'@type': 'Person', 'name': 'Marco Kaimann'},
        'address': {'@type': 'PostalAddress', 'streetAddress': a['street'], 'postalCode': a['zip'], 'addressLocality': a['city'], 'addressCountry': a['country']},
        'areaServed': 'DE', 'sameAs': [s['url'] for s in SITE['socials'] if s.get('url')],
    }
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'


def shell(active, meta, body):
    path = '' if active == 'home' else active + '/'
    hero = hero_images(meta)[0]
    fonts = ''.join(f'<link rel="preload" href="{asset(f"fonts/dm-sans-{w}.woff2")}" as="font" type="font/woff2" crossorigin>' for w in (400, 500))
    social = (f'<meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="GRENFORD">'
              f'<meta property="og:title" content="{E(meta["title"])}"><meta property="og:description" content="{E(meta["description"])}">'
              f'<meta property="og:url" content="{absolute(path)}"><meta property="og:image" content="{absolute("assets/" + hero)}"><meta name="twitter:card" content="summary_large_image">')
    return ('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(meta["title"])}</title><meta name="description" content="{E(meta["description"])}">'
            f'<link rel="canonical" href="{absolute(path)}">{social}<meta name="theme-color" content="#252622">'
            f'<meta name="grenford-form-endpoint" content="{E(SITE["formEndpoint"], quote=True)}"><meta name="grenford-email" content="{E(SITE["email"])}">'
            f'<link rel="icon" type="image/webp" href="{asset("grenford-original.webp")}">{fonts}'
            f'<link rel="stylesheet" href="{root("site.css")}"><script defer src="{root("app.js")}"></script><script defer src="{root("ux.js")}"></script>{PREVIEW_HEAD.replace("{root}", root(""))}'
            + (structured_data() if active == 'home' else '') +
            f'</head><body class="page-{active}"><a class="skip" href="#main">Zum Inhalt</a>' + header(active) +
            '<main id="main" tabindex="-1">' + body + '</main>' + footer() + rail() + '</body></html>')


def hero_images(meta):
    """Originalbilder, soweit in static/assets vorhanden; sonst die Vorschau-Auswahl."""
    pics = [p for p in meta['gallery'] if (paths.ASSETS / p).is_file()]
    skipped = [p for p in meta['gallery'] if p not in pics]
    if skipped:
        paths.skipped_heroes.update(skipped)
    return pics or meta.get('previewGallery', [])


def gallery(pics):
    """Hero-Bildwelt: wechselt automatisch (app.js), ohne Bedienelemente. Bilder sind dekorativ (alt="")."""
    h = '<figure class="cover-gallery" data-cover aria-label="GRENFORD Bildwelt">'
    for i, p in enumerate(pics):
        attrs = 'data-cover-image ' + ('class="is-active" fetchpriority="high"' if i == 0 else 'loading="lazy"')
        h += img(p, '', '100vw', attrs)
    return h + '<figcaption><span>GRENFORD / RÄUME MIT PERSPEKTIVE</span></figcaption></figure>'


def home_hero():
    routes = ''.join(f'<a href="{page(k)}"><span>{i:02d}</span>{d["label"]}<b aria-hidden="true">↗</b></a>' for i, (k, d) in enumerate(D.items(), 1))
    return ('<section class="immersive-hero">' + gallery(hero_images(SITE['home'])) +
            '<div class="hero-content"><div class="hero-kicker"><span>BOUTIQUE REAL ESTATE ADVISORY</span><span class="hero-coordinate" aria-hidden="true">G / 01</span></div>'
            '<h1>Der nächste<br><em>Schritt zählt.</em></h1><div class="hero-bottom"><p>Immobilienentscheidungen brauchen einen klaren Blick. Und jemanden, der ihn mit Ihnen teilt.</p>'
            '<a class="hero-link" href="#perspektiven"><span>Ihre Perspektive wählen</span><span class="arrow-circle" aria-hidden="true">↓</span></a></div></div>'
            f'<nav class="hero-routes" aria-label="Direkt zu Ihrem Bereich">{routes}</nav></section>')


def pathways():
    copy = {'investment': ('Kapital. Werte. Zugang.', 'Off-Market-Transaktionen, Globalverkäufe und gezielte Suche im Kundenauftrag.', 'Für Eigentümer & Investoren'),
            'property': ('Räume. Menschen. Zuhause.', 'Wohnungen, Häuser und kleine Gewerbeeinheiten verkaufen oder kaufen.', 'Für private Eigentümer & Käufer'),
            'projects': ('Bestand. Wandel. Klarheit.', 'Sanierungen vorbereiten, Bauangebote vergleichen und den passenden Baupartner wählen.', 'Für Bauherren & Eigentümer')}
    h = ('<section class="pathways" id="perspektiven"><div class="section-head"><span class="eyebrow">01 / IHR VORHABEN</span>'
         '<h2>Drei Bereiche.<br><em>Ihr nächster Schritt.</em></h2><p>Verkaufen, investieren oder Bestand verändern. Hier beginnt der direkte Weg zu Ihrer Lösung.</p></div><div class="pathway-grid">')
    for i, (k, d) in enumerate(D.items(), 1):
        title, desc, audience = copy[k]
        h += (f'<a class="pathway pathway-{k}" href="{page(k)}"><div class="pathway-top"><span>{i:02d} / GRENFORD</span><span aria-hidden="true">↗</span></div>'
              f'<h3>{d["label"]}</h3><div class="pathway-description"><span>{audience}</span><h4>{title}</h4><p>{desc}</p></div>'
              f'<div class="pathway-memo"><span class="memo-mark" aria-hidden="true"></span><div><small>IHRE ENTSCHEIDUNGSGRUNDLAGE</small><strong>{d["memo"]}</strong></div><span aria-hidden="true">→</span></div></a>')
    return h + '</div></section>'


def paper(k):
    d = D[k]
    n = list(D).index(k) + 1
    return (f'<div class="memo-paper memo-paper--{k}" role="img" aria-label="Schematische Vorschau: {d["memo"]}"><div class="paper-top"><span>GRENFORD<br>{d["label"].upper()}</span><span>{n:02d}<br>DECISION PAPER</span></div>'
            f'<div class="paper-center"><span class="paper-caption">DIE GRUNDLAGE FÜR IHRE ENTSCHEIDUNG</span><h3>{d["memo"].replace(" ", "<br>", 1)}</h3><p>{d["memoLead"]}</p></div>'
            '<div class="paper-bottom"><span>Strategisch. Diskret. Professionell.</span><span class="paper-logo" aria-hidden="true"></span></div></div>')


def memos(k):
    d = D[k]
    chapters = ''.join(f'<article><span>{i:02d}</span><div><h4>{E(a)}</h4><p>{E(b)}</p></div></article>' for i, (a, b) in enumerate(d['chapters'], 1))
    return ('<section class="memo-studio" id="memo"><div class="section-head"><span class="eyebrow">DIE GRENFORD MEMOS</span><h2>Gedanken ordnen.<br><em>Richtung finden.</em></h2>'
            '<p>Keine Entscheidung aus dem Bauch heraus. Die Memos bringen das Wesentliche zusammen – verständlich, strukturiert und auf Ihr Vorhaben abgestimmt.</p></div>'
            '<div class="memo-detail-layout">' + paper(k) + f'<div class="memo-reading"><span class="eyebrow">{E(d["memo"])}</span><h3>Was Sie<br>weiterbringt.</h3>'
            + chapters + request(d['intent'], d['memo'] + ' besprechen') + '<small>Umfang und Inhalte werden individuell vereinbart. Schematische Produktvorschau.</small></div></div></section>')


def process(k=None):
    steps = D[k]['steps'] if k else [('Verstehen', 'Ihr Vorhaben, Ihre Wünsche und Ihre Ziele kennenlernen.'), ('Einordnen', 'Rahmen, Unterlagen und Möglichkeiten zusammenbringen.'),
                                     ('Analysieren', 'Informationen und Unterschiede verständlich machen.'), ('Entscheiden', 'Eine fundierte Richtung und die nächsten Schritte festlegen.'),
                                     ('Begleiten', 'An Ihrer Seite bleiben – im gemeinsam vereinbarten Umfang.')]
    items = ''.join(f'<li><span>{i:02d}</span><div><h3>{E(a)}</h3><p>{E(b)}</p></div></li>' for i, (a, b) in enumerate(steps, 1))
    return ('<section class="method" id="ablauf"><div><span class="eyebrow">DER GRENFORD 5-POINT PROCESS</span><h2>Die Struktur hinter<br><em>Ihrer Entscheidung.</em></h2>'
            f'<p>Fünf Schritte, die Orientierung geben. Persönlich begleitet und auf Ihre Ausgangslage abgestimmt.</p></div><ol>{items}</ol></section>')


def founder():
    return ('<section class="founder" id="marco"><figure>' + img('marco-kaimann.jpg', 'Marco Kaimann, Gründer von GRENFORD', '(max-width:760px) 88vw, 350px', 'loading="lazy"') +
            '<figcaption>MARCO KAIMANN / GRÜNDER</figcaption></figure><div><span class="eyebrow">PERSÖNLICH GEFÜHRT. GUT VERBUNDEN.</span><h2>Klare Haltung.<br><em>Direkter Kontakt.</em></h2>'
            '<p>Ich bin Marco Kaimann, Gründer von GRENFORD und Ihr persönlicher Ansprechpartner. Je nach Vorhaben arbeiten wir mit spezialisierten Fach- und Baupartnern zusammen. '
            'So verbinden wir persönliche Beratung mit der passenden Expertise für Investment, Verkauf und Sanierung.</p><a class="text-link" href="#kontakt">Lernen wir uns kennen <span aria-hidden="true">↗</span></a>'
            '<div class="founder-sign"><strong>Marco Kaimann</strong><span>Founder & Strategic Advisor</span></div></div></section>')


def inquiries(k):
    if k == 'home':
        gateway = ('<details class="project-gateway" id="anfrage"><summary><span><small>STRATEGISCHE PROJEKTANFRAGE</small><strong>Ihr Vorhaben. Konkret werden.</strong>'
                   '<em>In sechs Schritten · kostenfreies Erstgespräch</em></span><b aria-hidden="true">＋</b></summary>' + inquiry(k) + '</details>')
        return gateway + contact(collapsible=True)
    return inquiry(k) + contact(subject='renovation' if k == 'projects' else k)


def subpage(k):
    d = D[k]
    titles = {'investment': 'Werte erkennen.<br><em>Chancen einordnen.</em>', 'property': 'Räume entdecken.<br><em>Menschen verbinden.</em>', 'projects': 'Angebote verstehen.<br><em>Baupartner finden.</em>'}
    second = f'<a class="text-link" href="#memo">{d["memo"]} ↓</a>' if k == 'projects' else request(d['secondIntent'], d['second'], 'text-button')
    body = ('<section class="immersive-hero immersive-sub">' + gallery(hero_images(SITE['pages'][k])) +
            f'<div class="hero-content"><div class="hero-kicker"><a href="{page("home")}">GRENFORD / {d["label"].upper()}</a><span class="hero-coordinate" aria-hidden="true">G / {d["n"]}</span></div>'
            f'<h1>{titles[k]}</h1><div class="hero-bottom"><p>{d["intro"]}</p><div class="hero-actions">' + request(d['intent'], d['primary']) + second + '</div></div></div></section>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#leistung">Leistung</a>'
             + ('<a href="#collection">Immobilien</a>' if k != 'projects' else '<a href="#beforeafter">Vorher & Nachher</a>')
             + f'<a href="#memo">{d["memo"]}</a><a href="#ablauf">Der Ablauf</a><a href="#fragen">Fragen</a><a href="#anfrage">Projektanfrage</a></nav>')
    intros = {
        'investment': ('Sie haben ein Asset.<br>Oder ein <em>Anlageziel.</em>', 'Ich unterstütze Eigentümer bei der Positionierung und Ansprache passender Investoren – und suche im Kundenauftrag nach passenden Anlageimmobilien.',
                       'Verkaufen', 'Objekt und Ziele einordnen, diskret positionieren und passende Investoren ansprechen. Off-Market oder als Verkauf eines Gesamtobjekts beziehungsweise Portfolios.',
                       'Gezielt suchen', 'Assetklasse, Region, Budget und Ihre Anforderungen bilden die Grundlage Ihres Suchprofils.'),
        'property': ('Eine Immobilie.<br>Viele persönliche <em>Gründe.</em>', 'Ob Verkauf oder Kauf: Ihre Situation gibt die Richtung vor. Eine verständliche Präsentation und persönliche Begleitung schaffen Orientierung.',
                     'Mit klarem Profil verkaufen', 'Die Besonderheiten Ihrer Immobilie erkennen, verständlich präsentieren und passende Interessenten erreichen.',
                     'Das Passende entdecken', 'Wünsche mitteilen, Angebote besprechen und den nächsten Schritt klären. Einen individuellen Suchauftrag vereinbaren wir bei Bedarf gesondert.'),
        'projects': ('Drei Preise.<br>Aber dieselbe <em>Leistung?</em>', 'Leistungen, Mengen und Ausstattung machen den Unterschied. Im Renovation Memo werden Originalangebote zunächst anonymisiert als A, B und C verglichen.',
                     'Vergleichbar machen', 'Auf gemeinsamer Grundlage regulär mindestens drei Originalangebote einholen. Leistungen, Kosten und offene Punkte verständlich gegenüberstellen.',
                     'Persönlich entscheiden', 'Sie wählen zwei Partner für die vertiefende Vor-Ort-Abstimmung. Die Beauftragung erfolgt direkt durch Sie. GRENFORD begleitet bis zur Fertigstellung, ohne technische Bauleitung oder Abnahmevollmacht.'),
    }
    title, lead, a, aa, b, bb = intros[k]
    focus = ''.join('<span>' + E(x) + '</span>' for x in d['focus'])
    body += (f'<section class="service-story" id="leistung"><div><span class="eyebrow">GRENFORD {d["label"].upper()}</span><h2>{title}</h2><p>{lead}</p></div>'
             f'<div><article><span>01</span><h3>{a}</h3><p>{aa}</p></article><article><span>02</span><h3>{b}</h3><p>{bb}</p></article></div>'
             f'<div class="service-focus"><span class="eyebrow">DER FOKUS</span><p>{focus}</p></div></section>')
    body += collection(k) if k != 'projects' else comparisons()
    body += memos(k) + process(k)
    faq = ''.join(f'<details><summary>{E(q)}<span aria-hidden="true">＋</span></summary><p>{E(a)}</p></details>' for q, a in d['faq'])
    body += (f'<section class="questions" id="fragen"><div><span class="eyebrow">GUT ZU WISSEN</span><h2>Die Fragen<br><em>vor dem ersten Schritt.</em></h2></div><div>{faq}</div></section>'
             + inquiries(k))
    return shell(k, SITE['pages'][k], body)


def home():
    body = (home_hero() + pathways() + collection() + '<div class="personal-approach">' + founder() + process() + '</div>' + inquiries('home'))
    return shell('home', SITE['home'], body)


# ---------------------------------------------------------------- Ausgabe

# Nur im Vorschau-Build: Farbumschalter zum Vergleich der Akzentfarben (static/preview/).
PREVIEW_HEAD = ''


def copy_static(out):
    shutil.copytree(STATIC / 'assets', out / 'assets')
    shutil.copy(STATIC / 'js' / 'app.js', out / 'app.js')
    shutil.copy(STATIC / 'js' / 'ux.js', out / 'ux.js')
    css = '\n'.join(f'/* ---- {name} ---- */\n' + (STATIC / 'css' / name).read_text(encoding='utf-8') for name in CSS_ORDER)
    # site.css liegt im Wurzelordner: absolute /assets/-Pfade werden relativ, damit dist/ überall läuft.
    (out / 'site.css').write_text(css.replace("url('/assets/", "url('assets/"), encoding='utf-8')


def responsive_variants(out):
    """Kleinere Bildbreiten für srcset; ohne Pillow wird nur das Original verwendet."""
    try:
        from PIL import Image
    except ImportError:
        print('Hinweis: Pillow fehlt, srcset-Varianten werden nicht erzeugt (pip install pillow).')
        return
    for name in sorted(paths.used):
        if not name.endswith(('.webp', '.jpg', '.jpeg', '.png')):
            continue
        with Image.open(STATIC / 'assets' / name) as im:
            for w in paths.WIDTHS:
                if w < im.width * 0.9:
                    target = out / 'assets' / f'w{w}' / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(target, quality=80)


def seo_files(out):
    urls = [absolute()] + [absolute(k + '/') for k in D]
    (out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                     + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n', encoding='utf-8')
    (out / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {absolute("sitemap.xml")}\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--preview', action='store_true', help='Links mit index.html, Ausgabe nach preview/')
    args = parser.parse_args()
    paths.pretty = not args.preview
    if args.preview:
        SITE['formEndpoint'] = ''  # Vorschau: keine Übermittlung ins CRM
        global PREVIEW_HEAD
        PREVIEW_HEAD = ('<script>try{var f=localStorage.getItem("gf-palette");if(f)document.documentElement.dataset.palette=f}catch(e){}</script>'
                        f'<link rel="stylesheet" href="{{root}}palette.css"><script defer src="{{root}}palette.js"></script>')
    out = ROOT / ('preview' if args.preview else 'dist')
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    copy_static(out)
    if args.preview:
        for name in ('palette.css', 'palette.js'):
            shutil.copy(STATIC / 'preview' / name, out / name)

    pages = {'index.html': (0, home)}
    for k in D:
        pages[f'{k}/index.html'] = (1, lambda k=k: subpage(k))
    for target, (depth, render) in pages.items():
        paths.set_page(depth)
        (out / target).parent.mkdir(parents=True, exist_ok=True)
        (out / target).write_text(render(), encoding='utf-8')
    responsive_variants(out)
    seo_files(out)

    print(f'{len(pages)} Seiten nach {out.relative_to(ROOT)}/ geschrieben.')
    if paths.missing:
        print('Fehlende Bilder (Ersatzbild eingesetzt), bitte nach static/assets/ kopieren:')
        for name in sorted(paths.missing):
            print('  -', name)
    if paths.skipped_heroes:
        print('Hero-Bilder fehlen (Vorschau-Auswahl bzw. übersprungen), bitte nach static/assets/ kopieren:')
        for name in sorted(paths.skipped_heroes):
            print('  -', name)
    if not SITE['formEndpoint']:
        print('Hinweis: site.json "formEndpoint" ist leer. Formulare bieten den Versand per E-Mail an.')


if __name__ == '__main__':
    sys.exit(main())
