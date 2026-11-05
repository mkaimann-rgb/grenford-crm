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
from offmarket import offmarket, properties, home_offers
from projects_comparison import comparisons
from ux_refinement import inquiry, contact, rail
from valuation import wizard_tabs, svg, TAB_LABELS_BEWERTEN
import market

# Marktseite erst veröffentlichen, wenn market.json geprüfte Datensätze enthält (bis dahin kein Link, keine Seite, kein Sitemap-Eintrag)
MARKET_LIVE = bool(market.M['marketData'])

ROOT = Path(__file__).parent
STATIC = ROOT / 'static'
D = json.loads((ROOT / 'content.json').read_text(encoding='utf-8'))
E = html.escape
CSS_ORDER = ['style.css', 'art.css', 'immersive.css', 'refinements.css', 'structure.css']


# ---------------------------------------------------------------- Bausteine

def logo():
    return f'<a class="brand" href="{page("home")}" aria-label="GRENFORD Startseite"><img src="{asset("grenford-logo-256.webp")}" alt="" width="256" height="256"></a>'


# Logo in der Kopfzeile je Seite: Bereichsseiten zeigen ihr Bereichslogo, alle übrigen das Markenlogo „Boutique Real Estate Advisory“.
HEADER_LOGO = {'investment': ('investment', 786, 392), 'property': ('property', 785, 391), 'projects': ('projects', 785, 391)}


def header_logo(active):
    name, w, h = HEADER_LOGO.get(active, ('boutique', 900, 390))
    return (f'<a class="brand brand-header brand--{name}" href="{page("home")}" aria-label="GRENFORD Startseite">'
            f'<img src="{asset(f"logo-{name}.webp")}" alt="" width="{w}" height="{h}"></a>')


def request(intent, label, kind='button'):
    return f'<button class="{kind}" type="button" data-enquire="{intent}">{label}<span aria-hidden="true">↗</span></button>'


# Großmenü je Bereich: Bild, Sprungziele der Seite, rechts das Memo als nächster Schritt
MEGA = {
    'investment': (['Leistung', '#leistung'], ['Objekt einordnen', '#bewertung'], ['Ankaufsprofil', '#bewertung-investment-search'],
                   ['Off-Market-Angebote', '#collection'], ['Investment Memo', '#memo'], ['Fragen', '#fragen']),
    'property': (['Leistung', '#leistung'], ['Immobilie bewerten', '#bewertung'], ['Suchprofil hinterlegen', '#bewertung-property-search'],
                 ['Immobilien im Angebot', '#collection'], ['Property Brief', '#memo'], ['Fragen', '#fragen']),
    'projects': (['Leistung', '#leistung'], ['Wert nach Sanierung', '#bewertung'], ['Vergütung', '#verguetung'],
                 ['Vorher & Nachher', '#beforeafter'], ['Renovation Memo', '#memo'], ['Fragen', '#fragen']),
}
AUDIENCE = {'investment': 'Für Eigentümer, Investoren und Bauträger', 'property': 'Für Eigentümer, Käufer und private Kapitalanleger',
            'projects': 'Für Eigentümer vor einer Sanierung'}
VALUE_CTA = {'investment': ('Objekt einordnen', 'investment-value'), 'property': ('Immobilie bewerten', 'property-value'),
             'projects': ('Wert nach Sanierung', 'projects-value')}
EXTRA = {'bewerten': 'Bewerten', 'ueber-grenford': 'Über GRENFORD'}
import ratgeber as RG  # Ratgeber: Inhalte, Bausteine, Entwurfsstatus
import calculators as CALC  # Rechner Wertermittlung (Entwurf: nur Vorschau)


def mega(k):
    d = D[k]
    pic = hero_images(SITE['pages'][k])[0]
    links = ''.join(f'<li><a href="{page(k)}{h}">{E(t)}</a></li>' for t, h in MEGA[k])
    cta, wid = VALUE_CTA[k]
    return (f'<div class="mega"><div class="mega-inner"><figure>' + img(pic, '', '320px', 'loading="lazy"') + f'<figcaption>GRENFORD / {d["label"].upper()}</figcaption></figure>'
            f'<div class="mega-links"><strong>{d["label"]}</strong><ul>{links}</ul></div>'
            f'<div class="mega-memo"><strong>{E(d["memo"])}</strong><p>{E(d["memoLead"])}</p>'
            f'<a class="button" href="{page(k)}#bewertung-{wid}">{cta} <span aria-hidden="true">↗</span></a></div></div></div>')


def mega_grenford(active):
    """Menüpunkt GRENFORD mit Großmenü wie die drei Bereiche: Marke, Bewertung, Markt, Kontakt."""
    links = [('Über GRENFORD', page('ueber-grenford'), ''), ('Wertermittlung', page('bewerten'), ''), ('Ratgeber', page('ratgeber'), '')] + ([('Marktperspektiven', page('markt'), '')] if MARKET_LIVE else []) + [
             ('STAYNAMIC ↗', 'https://www.staynamic.com/', ' target="_blank" rel="noopener"')]
    items = ''.join(f'<li><a href="{h}"{x}>{E(t)}</a></li>' for t, h, x in links)
    on = ' aria-current="page"' if active in ('ueber-grenford', 'bewerten', 'ratgeber', 'markt') else ''
    return (f'<div class="nav-item nav-grenford"><a href="{page("ueber-grenford")}"{on}>GRENFORD</a>'
            '<div class="mega"><div class="mega-inner"><figure>' + img('marco-kaimann.jpg', '', '320px', 'loading="lazy"') + '<figcaption>MARCO KAIMANN / GRÜNDER</figcaption></figure>'
            f'<div class="mega-links"><strong>GRENFORD</strong><ul>{items}</ul></div>'
            '<div class="mega-memo"><strong>Wert heute und nach der Sanierung</strong>'
            '<p>Persönlich eingeschätzt und kostenfrei.</p>'
            f'<a class="button" href="{page("bewerten")}">Wertermittlung starten <span aria-hidden="true">↗</span></a></div></div></div>'
            f'<ul class="nav-sub">{items}</ul></div>')


def header(active):
    current = ' aria-current="page"'
    items = ''.join(f'<div class="nav-item area-{k}"><a href="{page(k)}"{current if active == k else ""}>{d["label"]}</a>{mega(k)}</div>' for k, d in D.items())
    items += mega_grenford(active)
    return ('<header class="site-header">' + header_logo(active) +
            '<button class="menu" type="button" aria-controls="mainnav" aria-expanded="false">Menü <span aria-hidden="true">＋</span></button>'
            f'<nav id="mainnav" aria-label="Hauptnavigation">{items}<a class="nav-contact" href="#kontakt">Kontakt <span aria-hidden="true">↗</span></a></nav></header>')


def footer():
    a = SITE['address']
    cols = {
        'investment': [('Leistung', '#leistung'), ('Objekt einordnen', '#bewertung'), ('Ankaufsprofil', '#bewertung-investment-search'), ('Investment Memo', '#memo')],
        'property': [('Immobilie bewerten', '#bewertung'), ('Suchprofil', '#bewertung-property-search'), ('Immobilien im Angebot', '#collection'), ('Property Brief', '#memo')],
        'projects': [('Wert nach Sanierung', '#bewertung'), ('Vergütung', '#verguetung'), ('Vorher & Nachher', '#beforeafter'), ('Renovation Memo', '#memo')],
    }
    columns = ''.join(f'<div><strong>{D[k]["label"]}</strong>' + ''.join(f'<a href="{page(k)}{h}">{t}</a>' for t, h in links) + '</div>' for k, links in cols.items())
    columns += (f'<div><strong>GRENFORD</strong><a href="{page("ueber-grenford")}">Über GRENFORD</a><a href="{page("bewerten")}">Wertermittlung</a><a href="{page("ratgeber")}">Ratgeber</a>'
                + (f'<a href="{page("markt")}">Marktperspektiven</a>' if MARKET_LIVE else '') +
                '<a href="#kontakt">Kontakt</a><a href="https://www.staynamic.com/" target="_blank" rel="noopener">STAYNAMIC ↗</a></div>')
    return ('<footer class="site-footer"><div class="footer-main">' + logo() +
            f'<p>Der nächste Schritt zählt.</p><address>GRENFORD · Marco Kaimann<br>{E(a["street"])} · {E(a["zip"])} {E(a["city"])}<br>'
            f'<a href="tel:{E(SITE["phoneHref"])}">{E(SITE["phone"])}</a><br><a href="mailto:{E(SITE["email"])}">{E(SITE["email"])}</a></address></div>'
            f'<nav class="footer-cols" aria-label="Seitenübersicht">{columns}</nav>'
            f'<div class="footer-bottom"><span>© 2026 GRENFORD · Marco Kaimann</span><span>USt-ID: {E(SITE["vatId"])}</span>'
            f'<a href="{E(SITE["imprint"])}">Impressum</a><a href="{E(SITE["privacy"])}">Datenschutz</a></div></footer>')


# Leiste am unteren Rand: je Bereich der passende Einstieg
BAR = {'investment': ('Objekt verkaufen oder ankaufen?', 'Vertraulich einordnen lassen, ohne öffentliche Vermarktung.', 'Objekt einordnen', '#bewertung-investment-value'),
       'projects': ('Drei Angebote, drei Preise?', 'GRENFORD macht Bauangebote vergleichbar, für Eigentümer kostenfrei.', 'Angebote vergleichen lassen', '#anfrage')}


def value_bar(active='home'):
    title, text, cta, href = BAR.get(active, ('Was ist Ihre Immobilie wert?', 'Heute und nach der Sanierung, persönlich eingeschätzt.', 'Wertermittlung starten', None))
    href = href or page('bewerten')
    return (f'<aside class="value-bar" data-value-bar hidden aria-label="{E(cta)}"><p><strong>{E(title)}</strong>'
            f'<span>{E(text)}</span></p>'
            f'<a class="button" href="{href}">{E(cta)} <span aria-hidden="true">↗</span></a>'
            '<button type="button" class="value-bar-close" data-value-bar-close aria-label="Hinweis schließen">×</button></aside>')


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


def ld_json(data):
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'


def faq_data(items):
    return {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in items]}


def crumbs(active, label):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'GRENFORD', 'item': absolute()},
        {'@type': 'ListItem', 'position': 2, 'name': label, 'item': absolute(active + '/')}]}


def shell(active, meta, body, ld=(), path=None, noindex=False):
    path = path if path is not None else ('' if active == 'home' else active + '/')
    fonts = ''.join(f'<link rel="preload" href="{asset(f"fonts/dm-sans-{w}.woff2")}" as="font" type="font/woff2" crossorigin>' for w in (400, 500))
    social = (f'<meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="GRENFORD">'
              f'<meta property="og:title" content="{E(meta["title"])}"><meta property="og:description" content="{E(meta["description"])}">'
              f'<meta property="og:url" content="{absolute(path)}"><meta property="og:image" content="{absolute("assets/og-grenford.jpg")}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
              f'<meta property="og:image:alt" content="GRENFORD – Der nächste Schritt zählt."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{absolute("assets/og-grenford.jpg")}">')
    # 404, Entwürfe und ein Ratgeber ohne freigegebene Beiträge werden nicht indexiert
    hidden = noindex or active == '404' or (active == 'ratgeber' and path == 'ratgeber/' and not RG.published())
    meta_robots = '<meta name="robots" content="noindex">' if hidden else f'<link rel="canonical" href="{absolute(path)}">'
    return ('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(meta["title"])}</title><meta name="description" content="{E(meta["description"])}">'
            f'{meta_robots}{social}<meta name="theme-color" content="#3a3d41">'
            f'<meta name="grenford-form-endpoint" content="{E(SITE["formEndpoint"], quote=True)}"><meta name="grenford-email" content="{E(SITE["email"])}">'
            f'<link rel="icon" type="image/png" sizes="32x32" href="{asset("favicon-32.png")}"><link rel="icon" type="image/png" sizes="192x192" href="{asset("favicon-192.png")}">'
            f'<link rel="apple-touch-icon" href="{asset("apple-touch-icon.png")}">{fonts}'
            f'<link rel="stylesheet" href="{root("site.css")}"><script defer src="{root("app.js")}"></script><script defer src="{root("ux.js")}"></script><script defer src="{root("wizard.js")}"></script>{f'<script defer src="{root("market.js")}"></script>' if active == 'markt' else ''}{f'<script defer src="{root("calc.js")}"></script>' if active == 'bewerten' and CALC.SHOW else ''}{PREVIEW_HEAD.replace("{root}", root(""))}'
            + (structured_data() if active == 'home' else '') + ''.join(ld_json(x) for x in ld) +
            f'</head><body class="page-{active}"><a class="skip" href="#main">Zum Inhalt</a>' + header(active) +
            '<main id="main" tabindex="-1">' + body + '</main>' + footer() + rail(active) + ('' if active in ('bewerten', '404') else value_bar(active)) + '</body></html>')


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
        attrs = 'data-cover-image ' + ('class="is-active" fetchpriority="high"' if i == 0 else 'decoding="async"')
        tag = img(p, '', '100vw', attrs)
        if i:  # erst laden, wenn das erste Bild steht (app.js: hydrate)
            tag = tag.replace(' srcset="', ' data-srcset="', 1).replace(' src="', ' data-src="', 1)
        h += tag
    return h + '</figure>'


def reach_line():
    """Reichweite unter dem Hero: Städte der Skyline-Galerie, die gezeigte Stadt hebt app.js hervor."""
    cities = SITE['home'].get('reach') or []
    if not cities:
        return ''
    names = ''.join(f'<span data-reach-city{" class=\"is-active\"" if i == 0 else ""}>{E(region)}</span>'
                    for i, (region, city) in enumerate(cities))
    return f'<p class="hero-reach"><span class="hero-reach-cities">{names}</span><span>{E(SITE["home"]["reachNote"])}</span></p>'


INTENTS = [('Wert ermitteln', 'bewerten', '#bewertung'), ('Wohnung oder Haus verkaufen', 'property', '#bewertung-property-value'),
           ('Anlageobjekt verkaufen', 'investment', '#bewertung-investment-value'), ('Kaufen', 'property', '#bewertung-property-search'),
           ('Investieren', 'investment', '#bewertung-investment-search'), ('Sanieren', 'projects', '#bewertung-projects-value')]


def intents():
    """Einstieg nach Kundenabsicht: führt direkt ins passende Formular, ergänzt die drei Bereiche."""
    links = ''.join(f'<a href="{page(k)}{h}">{E(t)}</a>' for t, k, h in INTENTS)
    return f'<nav class="hero-intents" aria-label="Was möchten Sie tun?"><span>Ich möchte</span>{links}</nav>'


def home_hero():
    return ('<section class="immersive-hero home-hero">' + gallery(hero_images(SITE['home'])) +
            '<div class="hero-content">'
            '<h1>Der nächste<br><em>Schritt zählt.</em></h1><div class="hero-bottom"><div class="hero-lead"><p>GRENFORD berät Eigentümer, Käufer und Investoren beim Verkauf, beim Ankauf und vor einer Sanierung.</p>'
            + intents() + '</div>'
            '</div>'
            + reach_line() + '</div></section>')


def pathways():
    copy = {'investment': ('Anlageobjekte verkaufen und ankaufen, oft ohne öffentliches Inserat.', 'Für Eigentümer & Investoren'),
            'property': ('Wohnungen und Häuser verkaufen oder das passende Zuhause finden.', 'Für private Eigentümer & Käufer'),
            'projects': ('Bauangebote vergleichen und den passenden Baupartner finden.', 'Für Bauherren & Eigentümer')}
    h = ('<section class="pathways" id="perspektiven"><div class="section-head">'
         '<h2>Worum geht es bei Ihnen?</h2><p>Die meisten Anfragen betreffen eines von drei Themen. Wählen Sie Ihres, der Rest ergibt sich im Gespräch.</p></div><div class="pathway-grid">')
    pics = {'investment': 'hero-inv-wohnhaus.webp', 'property': 'hero-prop-altbauwohnung.webp', 'projects': 'dachgeschoss-after.webp'}
    for k, d in D.items():
        desc, audience = copy[k]
        h += (f'<a class="pathway pathway-{k}" href="{page(k)}"><figure class="pathway-media">'
              + img(pics[k], '', '(max-width:760px) 88vw, 30vw', 'loading="lazy"') + '<span class="pathway-arrow" aria-hidden="true">↗</span></figure>'
              f'<div class="pathway-body"><small>{audience}</small><h3>{d["label"]}</h3><p>{desc}</p>'
              f'<span class="pathway-result">Am Ende erhalten Sie {"den" if k == "property" else "das"} <strong>{d["memo"]}</strong></span></div></a>')
    return h + '</div></section>'


def paper(k):
    d = D[k]
    return (f'<div class="memo-paper memo-paper--{k}" role="img" aria-label="Schematische Vorschau: {d["memo"]}"><div class="paper-top"><span>GRENFORD<br>{d["label"].upper()}</span><span>ENTSCHEIDUNGS-<br>GRUNDLAGE</span></div>'
            f'<div class="paper-center"><h3>{d["memo"].replace(" ", "<br>", 1)}</h3><p>{d["memoLead"]}</p></div>'
            '<div class="paper-bottom"><span>Vertraulich</span><span class="paper-logo" aria-hidden="true"></span></div></div>')


def memos(k):
    d = D[k]
    chapters = ''.join(f'<article><div><h4>{E(a)}</h4><p>{E(b)}</p></div></article>' for a, b in d['chapters'])
    return ('<section class="memo-studio" id="memo"><div class="section-head"><h2 class="serif">Was Sie am Ende in der Hand haben</h2>'
            f'<p>{"Ein schriftlicher" if d["memo"].endswith("Brief") else "Ein schriftliches"} {d["memo"]}: Zahlen, Optionen und offene Punkte auf wenigen Seiten, sodass Sie {"ihn" if d["memo"].endswith("Brief") else "es"} auch mit Familie, Bank oder Steuerberater besprechen können.</p></div>'
            '<div class="memo-detail-layout">' + paper(k) + f'<div class="memo-reading"><h3>Das steht drin</h3>'
            + chapters + request(d['intent'], d['memo'] + ' besprechen') + '<small>Umfang und Inhalte werden individuell vereinbart. Schematische Produktvorschau.</small></div></div></section>')


PROCESS_INTRO = {None: 'Jedes Mandat läuft in derselben Reihenfolge ab. Wie viel davon Sie brauchen, entscheiden Sie.',
                 'investment': 'Vom vertraulichen Erstgespräch bis zur Beurkundung, mit dem Investment Memo als Grundlage.',
                 'property': 'Vom ersten Gespräch bis zum Notartermin, mit dem Property Brief als Grundlage.',
                 'projects': 'Von der Leistungsbeschreibung bis zur Fertigstellung, mit dem Renovation Memo als Grundlage.'}


def process(k=None):
    # Je Schritt: Titel, Beschreibung, was Sie in diesem Schritt konkret erhalten
    steps = D[k]['steps'] if k else [('Verstehen', 'Ihr Vorhaben, Ihre Wünsche und Ihre Ziele kennenlernen.', 'Ein Erstgespräch, kostenfrei'),
                                     ('Einordnen', 'Rahmen, Unterlagen und Möglichkeiten zusammenbringen.', 'Eine erste Einschätzung und die Liste fehlender Unterlagen'),
                                     ('Analysieren', 'Informationen und Unterschiede verständlich machen.', 'Ihr Memo: Investment Memo, Property Brief oder Renovation Memo'),
                                     ('Entscheiden', 'Eine fundierte Richtung und die nächsten Schritte festlegen.', 'Ihre Entscheidung, schriftlich festgehalten'),
                                     ('Begleiten', 'Bis zum Notartermin oder zur Fertigstellung, im vereinbarten Umfang.', 'Einen Ansprechpartner bis zum Abschluss')]
    items = ''.join(f'<li><span>{i:02d}</span><h3>{E(a)}</h3><p>{E(b)}</p><p class="step-gets"><small>Sie erhalten</small>{E(c)}</p></li>'
                    for i, (a, b, c) in enumerate(steps, 1))
    return ('<section class="method" id="ablauf"><div class="section-head"><h2>Der GRENFORD 5-Point Process</h2>'
            f'<p>{PROCESS_INTRO.get(k, PROCESS_INTRO[None])}</p></div><ol class="memo-timeline">{items}</ol></section>')


def founder():
    return ('<section class="founder" id="marco"><figure>' + img('marco-kaimann.jpg', 'Marco Kaimann, Gründer von GRENFORD', '(max-width:760px) 88vw, 350px', 'loading="lazy"') +
            '</figure><div><h2 class="serif">Ein Ansprechpartner, vom ersten Gespräch bis zum Abschluss.</h2>'
            '<p>GRENFORD wird von seinem Gründer Marco Kaimann geführt. Jede Anfrage wird von ihm gelesen, und er bleibt Ihr Ansprechpartner, bis die Sache erledigt ist. '
            'Wo Fachwissen gefragt ist, zieht GRENFORD Partner hinzu, mit denen es regelmäßig arbeitet: Gutachter, Architekten, Baufirmen, Finanzierer.</p>'
            f'<a class="text-link" href="{page("ueber-grenford")}">Warum es GRENFORD gibt <span aria-hidden="true">↗</span></a>'
            '<div class="founder-sign"><strong>Marco Kaimann</strong><span>Gründer von GRENFORD</span></div></div></section>')


def idea():
    """Über GRENFORD: warum es GRENFORD gibt und was es anders macht."""
    cols = [('Das Problem', 'Exposés sollen verkaufen, Bauangebote sollen den Auftrag gewinnen, Kennzahlen stehen ohne Zusammenhang. Wer entscheiden muss, '
             'bekommt viele Unterlagen, aber selten ein vollständiges Bild.'),
            ('Die Antwort', 'GRENFORD bereitet jede Entscheidung schriftlich vor: im Investment Memo, im Property Brief oder im Renovation Memo. Zahlen, Optionen und '
             'offene Punkte stehen nebeneinander, auch die, die gegen einen schnellen Abschluss sprechen.'),
            ('Der Unterschied', 'Auch GRENFORD wird bei Abschluss vergütet. Bevor abgeschlossen wird, liegt aber eine Grundlage vor, die Sie prüfen, weitergeben '
             'und mit Bank, Familie oder Steuerberater besprechen können. Die Entscheidung bleibt bei Ihnen.')]
    items = ''.join(f'<article><h3>{E(t)}</h3><p>{E(x)}</p></article>' for t, x in cols)
    return ('<section class="values idea" id="idee"><div class="section-head"><h2 class="serif">Die Idee hinter GRENFORD</h2>'
            '<p>Warum GRENFORD gegründet wurde und was es von einem klassischen Makler unterscheidet.</p></div>'
            f'<div class="idea-grid">{items}</div></section>')


def founder_bio():
    """Über GRENFORD: Werdegang von Marco Kaimann neben dem Portrait, in der dritten Person."""
    paras = [
        'Marco Kaimann begann seine Laufbahn bei einem der damals größten Maklerhäuser Berlins. Er beriet private Käufer zu Wohnimmobilien im Bestand, '
        'darunter Rohlingprojekte und sanierungsbedürftige Dachgeschosse, und begleitete den Verkauf von Neubauwohnungen.',
        'Für einen führenden deutsch-amerikanischen Anbieter von Immobilienmarktdaten baute er das B2B-Geschäft in Nord- und Ostdeutschland auf. Parallel vermittelte er '
        'selbstständig den Verkauf eines Mehrfamilienhauses und eines Boutiquehotels. Später begleitete er Transaktionen für private und institutionelle Investoren und '
        'baute Kooperationen für größere Mixed-Use-Projekte auf.',
        'In jeder dieser Stationen sah er dasselbe: Eigentümer, Käufer und Investoren treffen Entscheidungen über viel Geld mit Unterlagen, die jeweils nur eine Seite zeigen. '
        'Daraus entstand GRENFORD, mit dem Anspruch, jede Entscheidung schriftlich und vergleichbar vorzubereiten.',
        'In den Bereichen <strong>Property und Investment</strong> führt GRENFORD Immobilienverkäufe von der Vorbereitung und Vermarktung über die notarielle Beurkundung '
        'bis zum Closing. Im Bereich <strong>Projects</strong> vergleicht GRENFORD Bauangebote nach Leistungsumfang, Kosten und Terminen, unterstützt Bauherren bei der Wahl '
        'geeigneter Baupartner und begleitet sie bis zur Fertigstellung der Sanierung.']
    return ('<section class="founder founder-bio" id="marco"><figure>' + img('marco-kaimann.jpg', 'Marco Kaimann, Gründer von GRENFORD', '(max-width:760px) 88vw, 350px', 'loading="lazy"') +
            '</figure><div><h2 class="serif">Marco Kaimann</h2><p class="founder-role">Gründer von GRENFORD</p>'
            + ''.join(f'<p>{p}</p>' for p in paras) +
            '<a class="text-link" href="#kontakt">Gespräch vereinbaren <span aria-hidden="true">↗</span></a></div></section>')


def gateway(k):
    """Zweiter Weg im Einstiegs-Block: die Projektanfrage in sechs Schritten, eingeklappt unter der Bewertung.
    So gibt es pro Seite einen Einstieg statt zwei konkurrierender Blöcke. #anfrage und die „… anfragen“-Buttons öffnen sie."""
    lead = {'investment': 'Objekt verkaufen oder Ankaufsprofil besprechen? Sechs kurze Fragen, vertraulich behandelt.',
            'property': 'Verkauf, Kauf oder ein anderes Anliegen? Sechs kurze Fragen, danach meldet sich GRENFORD bei Ihnen.',
            'projects': 'Sie wissen schon, was gemacht werden soll? Sechs kurze Fragen zu Ihrem Vorhaben.'}.get(
        k, 'Etwas anderes als eine Wertermittlung? Sechs kurze Fragen, danach meldet sich GRENFORD bei Ihnen.')
    return ('<details class="project-gateway entry-alt" id="anfrage"><summary><span>'
            f'<strong>Oder beschreiben Sie Ihr Vorhaben</strong><em>{lead}</em></span><b aria-hidden="true">＋</b></summary>' + inquiry(k) + '</details>')


def contact_for(k):
    """Kontakt ist auf allen Seiten derselbe Block; Investment spricht Eigentümer und Investoren gezielt an."""
    if k == 'investment':
        return contact(subject='investment', company=True,
                       lead='Sprechen Sie GRENFORD vertraulich zu Ihrem Objekt oder Ankaufsprofil an. Eine Vertraulichkeitsvereinbarung vor dem ersten Austausch ist selbstverständlich möglich.')
    return contact(subject={'property': 'property', 'projects': 'renovation'}.get(k))


def subpage(k):
    d = D[k]
    titles = {'investment': 'Strategische Off-Market-Transaktionen, <em>diskret begleitet</em>', 'property': 'Wohnungen und Häuser <em>verkaufen oder finden</em>',
              'projects': 'Sanieren mit Angeboten, <em>die Sie wirklich verstehen</em>'}
    actions = {'investment': (('Objekt einordnen', 'investment-value'), ('Ankaufsprofil hinterlegen', 'investment-search')),
               'property': (('Immobilie bewerten', 'property-value'), ('Immobilien ansehen', '#collection')),
               'projects': (('Angebote vergleichen lassen', '#anfrage'), ('Wert nach Sanierung ermitteln', 'projects-value'))}
    (p_label, p_key), sec = actions[k]
    primary = (f'<a class="button" href="{p_key}">{p_label}<span aria-hidden="true">↓</span></a>' if p_key.startswith('#') else
               f'<a class="button" href="#bewertung-{p_key}" data-wz-open="{p_key}">{p_label}<span aria-hidden="true">↓</span></a>')
    if not sec:
        second = f'<a class="text-link" href="#memo">{d["memo"]} ↓</a>'
    elif sec[1].startswith('#'):  # einfacher Sprung, z. B. Property → ausgewählte Immobilien
        second = f'<a class="text-link" href="{sec[1]}">{sec[0]} <span aria-hidden="true">↓</span></a>'
    else:
        second = f'<a class="text-link" href="#bewertung-{sec[1]}" data-wz-open="{sec[1]}">{sec[0]} <span aria-hidden="true">↓</span></a>'
    # Property: Käufer-Suchwunsch als kleiner ergänzender Link unter den beiden Buttons
    if k == 'property':
        second += ('<a class="hero-aside-link" href="#bewertung-property-search" data-wz-open="property-search">'
                   'Auf der Suche? Suchprofil hinterlegen <span aria-hidden="true">↓</span></a>')
    body = ('<div class="hero-stage"><section class="immersive-hero immersive-sub">' + gallery(hero_images(SITE['pages'][k])) +
            f'<div class="hero-content">'
            f'<h1>{titles[k]}</h1><div class="hero-bottom"><p>{d["intro"]}</p><div class="hero-actions">' + primary + second + '</div></div></div></section></div>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#leistung">Leistung</a><a href="#bewertung">'
             + {'investment': 'Objekt einordnen', 'property': 'Bewertung & Suchprofil', 'projects': 'Wert nach Sanierung'}[k] + '</a>'
             + ('<a href="#verguetung">Vergütung</a>' if k == 'projects' else '')
             + {'investment': '<a href="#collection">Off-Market</a>', 'property': '<a href="#collection">Immobilien</a>', 'projects': '<a href="#beforeafter">Vorher & Nachher</a>'}[k]
             + f'<a href="#memo">{d["memo"]}</a><a href="#ablauf">5-Point Process</a><a href="#fragen">Fragen</a><a href="#kontakt">Kontakt</a></nav>')
    intros = {
        'investment': ('Verkaufen oder ankaufen', 'Eigentümer begleitet GRENFORD beim Verkauf an passende Investoren. Käufer beauftragen GRENFORD, nach Anlageimmobilien zu suchen, die ihrem Profil entsprechen.',
                       'Verkaufen', 'Objekt und Ziele einordnen, dann gezielt einzelne Investoren ansprechen. Off-Market oder als Verkauf eines Gesamtobjekts beziehungsweise Portfolios.',
                       'Gezielt suchen', 'Assetklasse, Region, Budget und Ihre Anforderungen bilden die Grundlage Ihres Suchprofils.'),
        'property': ('Verkaufen oder kaufen', 'Erbschaft, Umzug, Trennung oder einfach eine neue Lebensphase: Der Anlass bestimmt, wie schnell und wie offen verkauft wird. Darum geht es im ersten Gespräch.',
                     'Mit klarem Profil verkaufen', 'Die Besonderheiten Ihrer Immobilie erkennen, verständlich präsentieren und passende Interessenten erreichen.',
                     'Das Passende entdecken', 'Wünsche mitteilen, Angebote besprechen und den nächsten Schritt klären. Ein individueller Suchauftrag wird bei Bedarf gesondert vereinbart.'),
        'projects': ('Warum drei Angebote selten vergleichbar sind', 'Meist stecken die Unterschiede in Leistungen, Mengen und Ausstattung, nicht im Preis. Im Renovation Memo werden Originalangebote zunächst anonymisiert als A, B und C verglichen.',
                     'Vergleichbar machen', 'Auf gemeinsamer Grundlage in der Regel mindestens drei Originalangebote einholen. Leistungen, Kosten und offene Punkte verständlich gegenüberstellen.',
                     'Persönlich entscheiden', 'Sie wählen zwei Partner für die vertiefende Vor-Ort-Abstimmung. Die Beauftragung erfolgt direkt durch Sie. GRENFORD begleitet bis zur Fertigstellung, ohne technische Bauleitung oder Abnahmevollmacht.'),
    }
    title, lead, a, aa, b, bb = intros[k]
    focus = ''.join('<span>' + E(x) + '</span>' for x in d['focus'])
    if k == 'investment':
        body += invest_services(focus)
    else:
        body += (f'<section class="service-story" id="leistung"><div><h2>{title}</h2><p>{lead}</p></div>'
             f'<div><article><h3>{a}</h3><p>{aa}</p></article><article><h3>{b}</h3><p>{bb}</p></article></div>'
             f'<div class="service-focus"><span class="eyebrow">Typische Objekte</span><p>{focus}</p></div></section>')
    body += valuation_section(k)
    body += {'investment': offmarket, 'property': properties, 'projects': lambda: fee_band() + comparisons()}[k]()
    body += memos(k) + process(k)
    faq = ''.join(f'<details><summary>{E(q)}<span aria-hidden="true">＋</span></summary><p>{E(a)}</p></details>' for q, a in d['faq'])
    body += (f'<section class="questions" id="fragen"><div><h2>Häufige Fragen</h2></div><div>{faq}</div></section>'
             + contact_for(k))
    return shell(k, SITE['pages'][k], body, ld=(faq_data(d['faq']), crumbs(k, d['label'])))


def valuation_teaser():
    tiles = [('Wohnung', 'wohnung', 'property-value'), ('Haus', 'haus', 'property-value'), ('Mehrfamilienhaus', 'mfh', 'property-value'),
             ('Sanierungsobjekt', 'sanierung', 'projects-value'), ('Anlageobjekt', 'anlage', 'investment-value')]
    links = ''.join(f'<a class="teaser-tile" href="{page("bewerten")}#bewertung-{w}">{svg(icon)}<span>{t}</span></a>' for t, icon, w in tiles)
    return ('<section class="valuation-teaser" id="bewertung"><div class="section-head">'
            '<h2>Was ist Ihre Immobilie wert, und was wäre sie nach einer Sanierung wert?</h2>'
            '<p>Sie bekommen zwei Zahlen statt einer, beide persönlich eingeschätzt anhand von Lage, Zustand und vergleichbaren Verkäufen.</p></div>'
            f'<div class="teaser-tiles">{links}</div><div class="teaser-foot"><p class="wz-note">Kostenfrei, ohne Verpflichtung. <a href="{page("bewerten")}#ergebnis">So sieht das Ergebnis aus ↗</a></p><a class="button" href="{page("bewerten")}">Wertermittlung starten <span aria-hidden="true">↗</span></a></div>' + gateway('home') + '</section>')


def valuation_section(k):
    heads = {
        'investment': ('', 'Objekt einordnen lassen oder Ankaufsprofil hinterlegen',
                       'Für Eigentümer, Bauträger und Investoren: Eckdaten in wenigen Schritten, vertraulich behandelt. Daraus entsteht die Grundlage für Ihr Investment Memo.'),
        'property': ('', 'Was ist Ihre Immobilie wert?',
                     'Wer verkaufen möchte, erhält eine Einschätzung des Werts. Wer sucht, hinterlegt ein Suchprofil und hört von passenden Immobilien, bevor sie inseriert werden.'),
        'projects': ('', 'Was kostet die Sanierung, und was bringt sie?',
                     'Beschreiben Sie Ihre Immobilie und Ihr Vorhaben. Sie erhalten eine Einordnung, was die Sanierung kostet und was sie bringt, als Start für Ihr Renovation Memo.'),
        'bewerten': ('', 'Wählen Sie Ihren Bereich',
                     'Jede Variante fragt nur, was für Ihre Immobilie zählt. Am Ende entscheiden Sie, wie Sie Ihre Rückmeldung erhalten möchten.'),
    }
    eyebrow, title, lead = heads[k]
    eyebrow = f'<span class="eyebrow">{eyebrow}</span>' if eyebrow else ''
    calc = {'property': ('wohnwert', 'Wohnungswert selbst überschlagen'), 'projects': ('sanierung', 'Sanierungskosten grob selbst rechnen')}.get(k) if CALC.SHOW else None
    if calc:
        lead += f' <a class="calc-link" href="{page("bewerten")}#rechner-{calc[0]}">{calc[1]} ↗</a>'
    return (f'<section class="valuation" id="bewertung"><div class="section-head">{eyebrow}<h2>{title}</h2><p>{lead}</p></div>'
            f'<div class="valuation-frame">{wizard_tabs(k, TAB_LABELS_BEWERTEN if k == "bewerten" else None)}</div>'
            '<p class="wz-note">Kostenfrei und vertraulich. Rückmeldung innerhalb von 48 Stunden.</p>' + (gateway(k) if k in D else '') + '</section>')


def fee_band():
    facts = [('Gleich für alle', 'Die Vergütung steht vor der Angebotsrunde fest und ist für jede beteiligte Firma gleich. Der Vergleich bleibt fair.'),
             ('Aus eingesparten Kosten', 'Die Firmen erhalten eine fertige Leistungsbeschreibung und einen entscheidungsbereiten Bauherrn. Akquise, Vorab-Termine und Angebote ins Blaue entfallen.'),
             ('Wettbewerb', 'Mindestens drei Angebote auf derselben Grundlage. Eine Firma, die einen Aufschlag einrechnet, verliert den Vergleich.'),
             ('Offen im Memo', 'Die Höhe der Vergütung steht im Renovation Memo. Sie beauftragen die Firma selbst, Zahlungen laufen nur zwischen Ihnen und ihr.')]
    items = ''.join(f'<div><strong>{a}</strong><p>{b}</p></div>' for a, b in facts)
    return ('<section class="fee-band" id="verguetung"><div><h2 class="serif">Wer bezahlt die Beratung?</h2>'
            '<p class="fee-answer">Nicht Sie, und auch nicht über einen Aufschlag.</p>'
            '<p>GRENFORD wird vom Bauunternehmen vergütet, das Sie am Ende beauftragen. Jede Firma kalkuliert ihre Vertriebskosten ohnehin ein, ob für Werbung, Vorab-Termine oder Angebote, die nie beauftragt werden. '
            'Die GRENFORD-Vergütung ersetzt einen Teil davon und kommt nicht obendrauf. Dafür sorgen vier Regeln. Ob und wen Sie beauftragen, entscheiden allein Sie.</p></div>'
            f'<div class="fee-facts">{items}</div></section>')


def home():
    # hero-stage: Bühne für das ruhige Öffnen des Heros beim ersten Scrollen (app.js, nur Startseite)
    body = ('<div class="hero-stage">' + home_hero() + '</div>' + pathways() + valuation_teaser() + home_offers() + '<div class="personal-approach">' + founder() + process() + '</div>' + contact())
    return shell('home', SITE['home'], body)


def sub_hero(key, kicker, n, title, lead, actions):
    return ('<div class="hero-stage"><section class="immersive-hero immersive-sub">' + gallery(hero_images(SITE['pages'][key])) +
            f'<div class="hero-content">'
            f'<h1>{title}</h1><div class="hero-bottom"><p>{lead}</p><div class="hero-actions">{actions}</div></div></div></section></div>')


def result_example():
    """So sieht das Ergebnis einer Bewertung aus. Ausdrücklich fiktive Musterwerte, keine Marktdaten."""
    def bar(label, lo, hi, a, b, cls=''):
        return (f'<div class="rx-row{cls}"><span class="rx-label">{label}</span><div class="rx-track" aria-hidden="true">'
                f'<i style="left:{a}%;width:{b - a}%"></i></div><strong>{lo} – {hi} €</strong></div>')
    return ('<section class="result-example" id="ergebnis"><div class="section-head"><h2>So sieht Ihr Ergebnis aus</h2>'
            '<p>Sie erhalten nicht eine einzelne Zahl, sondern zwei Wertspannen mit Begründung. '
            'Die Werte unten sind ein erfundenes Beispiel, damit Sie sehen, was Sie erwartet.</p></div>'
            '<div class="rx-card"><div class="rx-head"><span class="rx-stamp">Fiktives Beispiel</span>'
            '<div><small>Ersteinschätzung</small><h3>3-Zimmer-Altbauwohnung, 85 m², Baujahr um 1905</h3></div></div>'
            + bar('Wert heute', '410.000', '450.000', 18, 46)
            + bar('Wert nach Sanierung', '495.000', '540.000', 52, 82, ' rx-after')
            + '<dl class="rx-facts"><div><dt>Grober Kostenrahmen der Sanierung</dt><dd>45.000 – 60.000 €</dd></div>'
            '<div><dt>Was die Spanne bestimmt</dt><dd>Lage, Zustand von Bad und Elektrik, Stockwerk, vergleichbare Verkäufe</dd></div>'
            '<div><dt>Empfehlung</dt><dd>Sanierung vor dem Verkauf prüfen: Mehrwert liegt über den Kosten</dd></div></dl>'
            '<p class="rx-note">Alle Zahlen sind erfunden und gelten für kein reales Objekt. Ihre Einschätzung wird persönlich erstellt, '
            'anhand Ihrer Angaben, der Lage und vergleichbarer Verkäufe.</p></div></section>')


def value_steps():
    steps = [('Anfrage und Termin', 'Formular, Anruf oder Video-Termin. GRENFORD meldet sich persönlich und stimmt den nächsten Schritt mit Ihnen ab.', 'hero-prop-altbauwohnung.webp'),
             ('Besichtigung vor Ort', 'Lage, Substanz, Ausstattung und Unterlagen. Dazu der Blick darauf, was eine Sanierung verändern würde.', 'dachgeschoss-before.webp'),
             ('Wertermittlung', 'Der Wert heute und der Wert nach einer Sanierung, mit grobem Kostenrahmen und vergleichbaren Objekten eingeordnet.', 'projects-bauplan.webp'),
             ('Ergebnis im Gespräch', 'Persönliche Vorstellung der Ergebnisse, auf Wunsch schriftlich: die Grundlage für Ihre Entscheidung, ob Sie verkaufen, sanieren oder halten.', 'soemmering-wohnzimmer.webp')]
    # Vier Stationen nebeneinander (kein Schieber): Bild, Kreis mit Verbindungslinie, Titel, Text
    items = ''.join(f'<li><figure>' + img(pic, '', '(max-width:760px) 80vw, 24vw', 'loading="lazy"') + '</figure>'
                    f'<div class="vp-row"><span class="vp-num">{i:02d}</span></div><h3>{E(a)}</h3><p>{E(b)}</p></li>' for i, (a, b, pic) in enumerate(steps, 1))
    return ('<section class="value-steps" id="ablauf"><div class="section-head"><h2>So läuft die Wertermittlung ab</h2>'
            '<p>Vom ersten Kontakt bis zum Ergebnis sprechen Sie mit derselben Person. Sie können digital beginnen, per Video oder mit einer Besichtigung vor Ort.</p></div>'
            f'<ol class="value-path">{items}</ol>'
            '<p class="vp-ways"><a class="button" href="#bewertung">Digital starten <span aria-hidden="true">↑</span></a>'
            f'<a class="text-link" href="{E(SITE["calendar"])}" target="_blank" rel="noopener noreferrer">Video-Termin buchen <span aria-hidden="true">↗</span></a>'
            '<a class="text-link" href="#kontakt">Besichtigung anfragen <span aria-hidden="true">↓</span></a></p></section>')


def faq_section(items, title='Häufige Fragen'):
    faq = ''.join(f'<details><summary>{E(q)}<span aria-hidden="true">＋</span></summary><p>{E(a)}</p></details>' for q, a in items)
    return f'<section class="questions" id="fragen"><div><h2>{title}</h2></div><div>{faq}</div></section>'


def bewerten():
    body = sub_hero('bewerten', 'Wertermittlung', '', 'Was ist Ihre Immobilie wert, <em>heute und nach einer Sanierung?</em>',
                    'GRENFORD schätzt beides persönlich ein, anhand Ihrer Angaben, der Lage und vergleichbarer Verkäufe. Kostenfrei, ohne Verpflichtung, Antwort innerhalb von 48 Stunden.',
                    '<a class="button" href="#bewertung">Wertermittlung starten<span aria-hidden="true">↓</span></a><a class="text-link" href="#ablauf">So läuft es ab ↓</a>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#bewertung">Wertermittlung</a>' + ('<a href="#rechner">Rechner</a>' if CALC.SHOW else '') + '<a href="#ergebnis">Beispiel-Ergebnis</a><a href="#ablauf">Der Ablauf</a>'
             '<a href="#fragen">Fragen</a><a href="#kontakt">Kontakt</a></nav>')
    body += valuation_section('bewerten') + CALC.section() + result_example() + value_steps()
    faqs = [
        ('Was kostet die Bewertung?', 'Die Ersteinschätzung ist kostenfrei und unverbindlich. Ein Auftrag entsteht dadurch nicht.'),
        ('Wie schnell erhalte ich eine Rückmeldung?', 'Innerhalb von 48 Stunden meldet sich Marco Kaimann persönlich, auf dem Weg, den Sie im letzten Schritt gewählt haben: per E-Mail, Telefon oder im Video-Termin.'),
        ('Ist das ein automatisch berechneter Wert?', 'Nein. Ihre Angaben liest Marco Kaimann persönlich und ordnet sie mit Lage, Zustand und vergleichbaren Objekten ein. Sie erhalten eine Wertspanne und eine Erläuterung.'),
        ('Was bedeutet „Wert nach der Sanierung“?', 'Neben dem heutigen Wert zeigt die Einschätzung, wie sich eine sinnvolle Sanierung auf den Wert auswirken kann, mit einem groben Kostenrahmen. So sehen Sie, ob sich ein Vorhaben lohnt, bevor Sie Angebote einholen.'),
        ('Ist die Wertermittlung ein Gutachten?', 'Nein. GRENFORD erstellt eine marktorientierte Einschätzung als Grundlage für Verkauf, Kauf oder Sanierung. '
         'Für Finanzamt, Gericht oder eine Erbauseinandersetzung wird meist ein Verkehrswertgutachten nach § 194 BauGB verlangt. Dafür zieht GRENFORD auf Wunsch einen Sachverständigen hinzu.'),
        ('Welche Unterlagen helfen?', 'Für die Ersteinschätzung genügen Ihre Angaben. Für eine genaue Wertermittlung helfen Grundriss, Wohnflächenberechnung, Energieausweis und bei vermieteten Objekten die Mietaufstellung.'),
        ('Was passiert mit meinen Angaben?', 'Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und vertraulich behandelt. Details finden Sie in der Datenschutzerklärung.'),
    ]
    body += faq_section(faqs)
    body += contact()
    service = {'@context': 'https://schema.org', '@type': 'Service', 'serviceType': 'Immobilienbewertung', 'name': 'Immobilienbewertung: Wert heute und nach der Sanierung',
               'description': SITE['pages']['bewerten']['description'], 'areaServed': {'@type': 'City', 'name': 'Berlin'},
               'provider': {'@type': 'RealEstateAgent', 'name': 'GRENFORD', 'url': absolute()},
               'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR', 'description': 'Kostenfreie Ersteinschätzung, Antwort innerhalb von 48 Stunden'}}
    return shell('bewerten', SITE['pages']['bewerten'], body, ld=(faq_data(faqs), service, crumbs('bewerten', 'Wertermittlung')))


def founder_video():
    """Über GRENFORD: Vorstellungsvideo. Startet nur auf Klick (preload=none), Vorschaubild statt Vorladen."""
    return ('<section class="founder-video" id="video"><div class="section-head"><h2>Marco Kaimann im Video</h2>'
            '<p>In einer Minute: wer hinter GRENFORD steht, wie GRENFORD arbeitet und was die drei Bereiche Investment, Property und Projects verbindet.</p></div>'
            '<div class="fv-frame"><video class="fv-video" controls preload="none" playsinline width="848" height="424" '
            f'poster="{asset("video/grenford-marco-kaimann-poster.jpg")}" aria-label="Video: Marco Kaimann stellt GRENFORD vor (1 Minute, mit Ton)">'
            f'<source src="{asset("video/grenford-marco-kaimann.mp4")}" type="video/mp4">'
            f'Ihr Browser kann das Video nicht abspielen. <a href="{asset("video/grenford-marco-kaimann.mp4")}">Video herunterladen</a></video>'
            '<button type="button" class="fv-play" data-video-play aria-label="Video abspielen"><span aria-hidden="true">▶</span><small>Video ansehen · 1 Min.</small></button></div>'
            '</section>')


def ueber():
    body = sub_hero('ueber-grenford', 'Über GRENFORD', '', 'Entscheiden mit <em>vollständigem Bild</em>',
                    'Wer eine Immobilie verkauft, kauft oder saniert, entscheidet über viel Geld, oft auf Grundlage von Unterlagen, die jeweils nur eine Seite zeigen. '
                    'GRENFORD legt die Informationen nebeneinander, bevor entschieden wird.',
                    '<a class="button" href="#idee">Die Idee hinter GRENFORD<span aria-hidden="true">↓</span></a><a class="text-link" href="#marco">Der Gründer ↓</a>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#idee">Die Idee</a><a href="#marco">Der Gründer</a><a href="#video">Video</a><a href="#haltung">Zusagen</a><a href="#felder">Geschäftsfelder</a>'
             f'<a href="#ablauf">5-Point Process</a><a href="{page("bewerten")}">Wertermittlung ↗</a><a href="{page("ratgeber")}">Ratgeber ↗</a><a href="#kontakt">Kontakt</a></nav>')
    body += idea() + '<div class="personal-approach">' + founder_bio() + '</div>' + founder_video()
    values = [('Schriftlich statt aus dem Bauch', 'Jede Empfehlung steht in einem Memo, mit Zahlen und Optionen. Sie können sie nachlesen und weitergeben.'),
              ('Offene Vergütung', 'Woher die Zahlen stammen, welche Rolle GRENFORD hat und wie die Vergütung geregelt ist, steht offen im Memo.'),
              ('Diskretion', 'Off-Market-Mandate, Angebote der Baufirmen und Ihre Ziele verlassen das Haus nicht.')]
    body += ('<section class="values" id="haltung"><div class="section-head"><h2 class="serif">Woran Sie GRENFORD messen können</h2>'
             '<p>Drei Zusagen, die für jedes Mandat gelten.</p></div><div class="values-grid">'
             + ''.join(f'<article><h3>{a}</h3><p>{b}</p></article>' for a, b in values) + '</div></section>')
    fields = [('investment', 'Anlageimmobilien kaufen und verkaufen', 'Ausgewählte Off-Market-Transaktionen, Projektentwicklungen und Wohnimmobilieninvestments, mit Analyse, Positionierung und diskreter Vermarktung.'),
              ('property', 'Wohnungen und Häuser', 'Für Eigentümer, Selbstnutzer und private Kapitalanleger: Wohnungen, Häuser und Ferienimmobilien verkaufen oder kaufen, von der Bewertung bis zum Notartermin.'),
              ('projects', 'Sanierung vorbereiten', 'Wünsche, Maßnahmen und Baupartner zusammenführen: Beratung für Sanierung, Modernisierung und Repositionierung.')]
    rows = ''.join(f'<a class="field-row" href="{page(k)}"><h3>{t}</h3><p>{E(x)}</p>'
                   f'<span class="field-memo">{E(D[k]["memo"])} <span aria-hidden="true">↗</span></span></a>' for k, t, x in fields)
    body += ('<section class="fields" id="felder"><div class="section-head"><h2>Drei Geschäftsfelder</h2>'
             f'<p>Jedes Feld endet mit einem eigenen Memo.</p></div><div class="field-rows">{rows}</div></section>')
    body += process()
    more = [(page('bewerten'), 'Wertermittlung', 'Was ist Ihre Immobilie wert, heute und nach einer Sanierung? Persönlich eingeschätzt, nicht automatisch errechnet.', 'Wertermittlung starten'),
            (page('ratgeber'), 'Ratgeber', 'Leitfäden und Checklisten für Verkauf, Kauf, Transaktion und Sanierung.', 'Zum Ratgeber')]
    body += ('<section class="fields grenford-more" id="angebote"><div class="section-head"><h2>Mehr von GRENFORD</h2>'
             '<p>Zwei Angebote, die allen drei Geschäftsfeldern dienen.</p></div><div class="field-rows">'
             + ''.join(f'<a class="field-row" href="{h}"><h3>{t}</h3><p>{x}</p><span class="field-memo">{c} <span aria-hidden="true">↗</span></span></a>' for h, t, x, c in more)
             + '</div></section>')
    body += contact()
    return shell('ueber-grenford', SITE['pages']['ueber-grenford'], body, ld=(crumbs('ueber-grenford', 'Über GRENFORD'),))


def ratgeber():
    """Ratgeber-Übersicht: Einstieg, drei Themenfragen, hervorgehobener Beitrag, Beiträge nach Bereichen (ratgeber.py)."""
    # Hero wie auf den anderen Seiten: Architekturmotiv über die volle Breite, Text darauf
    body = sub_hero('ratgeber', 'Ratgeber', '', 'Immobilien&shy;entscheidungen <em>vorbereiten</em>',
                    'Was sollten Sie vor einem Immobilienverkauf klären? Welche Unterlagen braucht eine erste Ankaufprüfung? '
                    'Wie lassen sich Bauangebote sinnvoll vergleichen? Im GRENFORD Ratgeber finden Sie Leitfäden und Checklisten für diese Entscheidungen.',
                    '<a class="button" href="#themen">Zu den Themen<span aria-hidden="true">↓</span></a>')
    body += RG.overview_body() + contact()
    meta = {'title': 'GRENFORD Ratgeber | Immobilienentscheidungen vorbereiten',
            'description': 'Leitfäden und Checklisten für Verkauf, Kauf, Transaktion und Sanierung: Was Sie vor einer Immobilienentscheidung klären sollten.'}
    return shell('ratgeber', meta, body, ld=(crumbs('ratgeber', 'Ratgeber'),), path='ratgeber/')


def ratgeber_article(a):
    """Beitrag unter /ratgeber/<slug>/. Entwürfe nur im Vorschau-Build, dort mit Hinweis und noindex."""
    author = img('marco-kaimann.jpg', 'Marco Kaimann', '64px', 'class="rg-author" loading="lazy"')
    path = RG.article_path(a) + '/'
    crumb = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'GRENFORD', 'item': absolute()},
        {'@type': 'ListItem', 'position': 2, 'name': 'Ratgeber', 'item': absolute('ratgeber/')},
        {'@type': 'ListItem', 'position': 3, 'name': a['title'], 'item': absolute(path)}]}
    art = {'@context': 'https://schema.org', '@type': 'Article', 'headline': a['title'], 'description': a['description'],
           'datePublished': a['published'], 'dateModified': a.get('updated') or a['published'],
           'author': {'@type': 'Person', 'name': 'Marco Kaimann', 'jobTitle': 'Gründer von GRENFORD'},
           'publisher': {'@type': 'Organization', 'name': 'GRENFORD'}, 'mainEntityOfPage': absolute(path)}
    body = RG.article_body(a, author) + contact()
    return shell('ratgeber', {'title': a['meta_title'], 'description': a['description']}, body, ld=(crumb, art), path=path,
                 noindex=a['status'] != 'freigegeben')


def markt():
    """Marktseite: ergänzende Orientierung, keine Leistungsseite und keine automatische Objektbewertung."""
    body = sub_hero('markt', 'Marktperspektiven', '', 'Was Marktdaten über <em>Ihre Immobilie sagen</em>',
                    'Ein Marktwert entsteht im Zusammenspiel von Lage, Zustand, Nutzung und Nachfrage. Marktdaten geben Orientierung. '
                    'Entscheidend ist, was sie für Ihre Immobilie bedeuten.',
                    '<a class="button" href="#kontakt">Vorhaben besprechen<span aria-hidden="true">↓</span></a><a class="text-link" href="#marktueberblick">Zur Marktübersicht ↓</a>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#marktueberblick">Marktüberblick</a><a href="#einordnung">Einordnung</a>'
             '<a href="#methodik">Methodik</a><a href="#fragen">Fragen</a><a href="#kontakt">Kontakt</a></nav>')
    body += market.overview('#kontakt') + market.interpretation(page) + market.methodology()
    body += faq_section(market.FAQ) + market.next_step('#kontakt') + contact()
    return shell('markt', SITE['pages']['markt'], body, ld=(faq_data(market.FAQ), crumbs('markt', 'Marktperspektiven')))


def not_found():
    """404-Seite: absolute Pfade, weil der Server sie unter beliebigen Adressen ausliefert."""
    links = ''.join(f'<a class="field-row" href="{page(k)}"><h3>{t}</h3><p>{x}</p>'
                    f'<span class="field-memo">Zur Seite <span aria-hidden="true">↗</span></span></a>' for k, t, x in (
                        ('investment', 'Anlageimmobilien', 'Off-Market, Globalverkauf, Ankaufsprofil.'),
                        ('property', 'Wohnungen und Häuser', 'Verkaufen, kaufen, bewerten.'),
                        ('projects', 'Sanierung', 'Sanierung planen, Angebote vergleichen.')))
    body = ('<section class="immersive-hero immersive-sub not-found-hero">' + gallery(['hero-berlin.webp']) +
            f'<div class="hero-content">'
            '<h1>Diese Seite gibt es nicht <em>(mehr)</em></h1><div class="hero-bottom"><p>Vielleicht wurde sie verschoben oder die Adresse ist unvollständig. '
            'Hier geht es weiter.</p><div class="hero-actions">'
            f'<a class="button" href="{page("home")}">Zur Startseite<span aria-hidden="true">↗</span></a><a class="text-link" href="{page("bewerten")}">Immobilie bewerten ↗</a></div></div></div></section>'
            f'<section class="fields" id="felder"><div class="section-head"><h2>Wohin möchten Sie?</h2>'
            f'<p>Oder schreiben Sie direkt an {E(SITE["email"])}.</p></div><div class="field-rows">{links}</div></section>' + contact())
    meta = {'title': 'Seite nicht gefunden | GRENFORD', 'description': 'Diese Seite gibt es nicht. Zur Startseite von GRENFORD oder direkt zu Investment, Property und Projects.'}
    return shell('404', meta, body)


INVEST_SERVICES = [
    ('Objekt- und Transaktionsanalyse', 'Was ist das Objekt wert, und für wen ist es interessant?',
     'Mieten, Leerstand, Bewirtschaftungskosten, Zustand und Lage ergeben zusammen den Wert, den ein Investor tatsächlich zahlt. '
     'GRENFORD rechnet das Objekt so, wie ein Käufer es rechnen würde, und zeigt, wo Reserven liegen: Mietanpassungen, Ausbau, Aufteilung oder eine andere Nutzung. '
     'Das Ergebnis steht im Investment Memo und ist die Grundlage für Preis und Käuferkreis.'),
    ('Grundstücks- und Projektanalyse', 'Was darf gebaut werden, und rechnet sich das?',
     'Bei Grundstücken und Projektentwicklungen beginnt der Wert beim Planungsrecht. Gemeinsam mit Architekten und Gutachtern aus dem Partnernetz '
     'prüft GRENFORD mögliche Nutzung, Baumasse und eine erste Kosten- und Erlösrechnung. So wissen Sie, mit welchen Argumenten Sie in Gespräche mit Bauträgern gehen.'),
    ('Diskrete Vermarktung', 'Verkaufen, ohne dass der Markt davon erfährt',
     'Ihr Objekt erscheint auf keinem Portal. Ausgewählte Investoren, Family Offices und Bauträger erhalten zuerst einen anonymen Steckbrief. '
     'Adresse, Mieterliste und Unterlagen gibt es erst nach einer Vertraulichkeitsvereinbarung und nach Ihrer Freigabe, über einen geordneten Datenraum.'),
    ('Ankauf im Kundenauftrag', 'Objekte finden, die nie inseriert werden',
     'Investoren hinterlegen ein Ankaufsprofil: Assetklasse, Region, Volumen, Rendite- und Zustandsanforderungen. GRENFORD sucht gezielt, spricht Eigentümer direkt an '
     'und legt Ihnen nur Objekte vor, die vorher geprüft wurden.'),
    ('Begleitung bis zum Notartermin', 'Prüfung, Verhandlung, Abschluss',
     'GRENFORD koordiniert die Prüfung der Unterlagen, führt die Preisverhandlung und stimmt den Kaufvertragsentwurf mit Notar, Finanzierern und den Beratern beider Seiten ab, '
     'bis zur Beurkundung. Rechts- und Steuerberatung übernehmen Ihre Anwälte und Steuerberater; GRENFORD sorgt dafür, dass alle zur richtigen Zeit am Tisch sitzen.'),
]


def invest_services(focus):
    """Investment: Leistungen als aufklappbare Liste (eine offen), angelehnt an den Aufbau großer Transaktionshäuser, in GRENFORD-Sprache."""
    rows = ''.join(f'<details class="svc" name="invest-services"{" open" if i == 0 else ""}><summary><span><strong>{E(t)}</strong><em>{E(q)}</em></span>'
                   f'<b aria-hidden="true">＋</b></summary><p>{E(x)}</p></details>' for i, (t, q, x) in enumerate(INVEST_SERVICES))
    return ('<section class="services" id="leistung"><div class="services-intro">'
            '<h2>Fünf Leistungen von der Analyse bis zum Notartermin</h2>'
            '<p>GRENFORD begleitet Verkäufe und Ankäufe von Wohn- und Geschäftshäusern, Boutique-Hotels, Grundstücken und Projektentwicklungen. '
            'Auf der einen Seite stehen Eigentümer, Erbengemeinschaften und Bauträger, auf der anderen private Investoren, Family Offices und Projektentwickler. '
            'Sie haben einen Ansprechpartner vom ersten Gespräch bis zum Notartermin.</p>'
            f'<div class="service-focus"><span class="eyebrow">Typische Objekte</span><p>{focus}</p></div></div>'
            f'<div class="services-list">{rows}</div></section>')


# ---------------------------------------------------------------- Ausgabe

# Nur im Vorschau-Build: Farbumschalter zum Vergleich der Akzentfarben (static/preview/).
PREVIEW_HEAD = ''


def copy_static(out):
    shutil.copytree(STATIC / 'assets', out / 'assets')
    shutil.copy(STATIC / 'js' / 'app.js', out / 'app.js')
    shutil.copy(STATIC / 'js' / 'ux.js', out / 'ux.js')
    shutil.copy(STATIC / 'js' / 'wizard.js', out / 'wizard.js')
    shutil.copy(STATIC / 'js' / 'market.js', out / 'market.js')
    shutil.copy(STATIC / 'js' / 'calc.js', out / 'calc.js')
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
                    im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(target, quality=76, method=6)


def seo_files(out):
    urls = [absolute()] + [absolute(k + '/') for k in list(D) + list(EXTRA) + (['markt'] if MARKET_LIVE else []) + (['ratgeber'] if RG.published() else [])] + [absolute(RG.article_path(a) + '/') for a in RG.published() if not (MARKET_LIVE and RG.article_path(a) == 'markt')]
    (out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                     + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n', encoding='utf-8')
    (out / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {absolute("sitemap.xml")}\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--preview', action='store_true', help='Links mit index.html, Ausgabe nach preview/')
    args = parser.parse_args()
    paths.pretty = not args.preview
    RG.SHOW_DRAFTS = args.preview
    CALC.SHOW = args.preview or CALC.STATUS == 'freigegeben'
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
    pages['bewerten/index.html'] = (1, bewerten)
    pages['ueber-grenford/index.html'] = (1, ueber)
    pages['ratgeber/index.html'] = (1, ratgeber)
    for a in RG.visible():  # Entwürfe nur in der Vorschau; /markt/ als Beitrag nur, solange die Datenseite (market.py) aus ist
        p = RG.article_path(a)
        if p == 'markt' and MARKET_LIVE:
            continue
        pages[f'{p}/index.html'] = (p.count('/') + 1, lambda a=a: ratgeber_article(a))
    if MARKET_LIVE:
        pages['markt/index.html'] = (1, markt)
    for target, (depth, render) in pages.items():
        paths.set_page(depth)
        (out / target).parent.mkdir(parents=True, exist_ok=True)
        (out / target).write_text(render(), encoding='utf-8')
    if not args.preview:
        paths.set_root_absolute()
        (out / '404.html').write_text(not_found(), encoding='utf-8')
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

