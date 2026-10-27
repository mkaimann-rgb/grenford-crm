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
from valuation import wizard_tabs, svg, TAB_LABELS_BEWERTEN
import market

ROOT = Path(__file__).parent
STATIC = ROOT / 'static'
D = json.loads((ROOT / 'content.json').read_text(encoding='utf-8'))
E = html.escape
CSS_ORDER = ['style.css', 'art.css', 'immersive.css', 'refinements.css', 'structure.css']


# ---------------------------------------------------------------- Bausteine

def logo():
    return f'<a class="brand" href="{page("home")}" aria-label="GRENFORD Startseite"><img src="{asset("grenford-logo-256.webp")}" alt="" width="256" height="256"></a>'


def request(intent, label, kind='button'):
    return f'<button class="{kind}" type="button" data-enquire="{intent}">{label}<span aria-hidden="true">↗</span></button>'


# Großmenü je Bereich: Bild, Sprungziele der Seite, rechts das Memo als nächster Schritt
MEGA = {
    'investment': (['Leistung', '#leistung'], ['Asset einordnen', '#bewertung'], ['Ankaufsprofil', '#bewertung-investment-search'],
                   ['Ausgewählte Mandate', '#collection'], ['Investment Memo', '#memo'], ['Fragen', '#fragen']),
    'property': (['Leistung', '#leistung'], ['Immobilie bewerten', '#bewertung'], ['Suchprofil hinterlegen', '#bewertung-property-search'],
                 ['Ausgewählte Immobilien', '#collection'], ['Property Brief', '#memo'], ['Fragen', '#fragen']),
    'projects': (['Leistung', '#leistung'], ['Wert nach Sanierung', '#bewertung'], ['Vergütung', '#verguetung'],
                 ['Vorher & Nachher', '#beforeafter'], ['Renovation Memo', '#memo'], ['Fragen', '#fragen']),
}
AUDIENCE = {'investment': 'Für Bauträger, Projektentwickler und Investoren', 'property': 'Für Eigentümer, Käufer und private Kapitalanleger',
            'projects': 'Für Eigentümer vor einer Sanierung'}
VALUE_CTA = {'investment': ('Asset einordnen', 'investment-value'), 'property': ('Immobilie bewerten', 'property-value'),
             'projects': ('Wert nach Sanierung', 'projects-value')}
EXTRA = {'bewerten': 'Bewerten', 'ueber-grenford': 'Über GRENFORD'}


def mega(k):
    d = D[k]
    pic = hero_images(SITE['pages'][k])[0]
    links = ''.join(f'<li><a href="{page(k)}{h}">{E(t)}</a></li>' for t, h in MEGA[k])
    cta, wid = VALUE_CTA[k]
    return (f'<div class="mega"><div class="mega-inner"><figure>' + img(pic, '', '320px', 'loading="lazy"') + f'<figcaption>GRENFORD / {d["label"].upper()}</figcaption></figure>'
            f'<div class="mega-links"><span class="eyebrow">{E(AUDIENCE[k])}</span><strong>{d["label"]}</strong><ul>{links}</ul></div>'
            f'<div class="mega-memo"><span class="eyebrow">IHRE ENTSCHEIDUNGSGRUNDLAGE</span><strong>{E(d["memo"])}</strong><p>{E(d["memoLead"])}</p>'
            f'<a class="button" href="{page(k)}#bewertung-{wid}">{cta} <span aria-hidden="true">↗</span></a></div></div></div>')


def mega_grenford(active):
    """Menüpunkt GRENFORD mit Großmenü wie die drei Bereiche: Marke, Bewertung, Markt, Kontakt."""
    links = [('Über GRENFORD', page('ueber-grenford'), ''), ('Immobilie bewerten', page('bewerten'), ''), ('Marktperspektiven', page('markt'), ''),
             ('Kontakt', '#kontakt', ''), ('STAYNAMIC ↗', 'https://www.staynamic.com/', ' target="_blank" rel="noopener"')]
    items = ''.join(f'<li><a href="{h}"{x}>{E(t)}</a></li>' for t, h, x in links)
    on = ' aria-current="page"' if active in ('ueber-grenford', 'bewerten', 'markt') else ''
    return (f'<div class="nav-item nav-grenford"><a href="{page("ueber-grenford")}"{on}>GRENFORD</a>'
            '<div class="mega"><div class="mega-inner"><figure>' + img('marco-kaimann.jpg', '', '320px', 'loading="lazy"') + '<figcaption>MARCO KAIMANN / GRÜNDER</figcaption></figure>'
            f'<div class="mega-links"><span class="eyebrow">Boutique Real Estate Advisory · Berlin</span><strong>GRENFORD</strong><ul>{items}</ul></div>'
            '<div class="mega-memo"><span class="eyebrow">IHRE BEWERTUNG</span><strong>Wert heute und nach der Sanierung</strong>'
            '<p>Persönlich eingeschätzt, kostenfrei, Antwort innerhalb von 48 Stunden.</p>'
            f'<a class="button" href="{page("bewerten")}">Immobilie bewerten <span aria-hidden="true">↗</span></a></div></div></div>'
            f'<ul class="nav-sub">{items}</ul></div>')


def header(active):
    current = ' aria-current="page"'
    items = ''.join(f'<div class="nav-item"><a href="{page(k)}"{current if active == k else ""}>{d["label"]}</a>{mega(k)}</div>' for k, d in D.items())
    items += mega_grenford(active)
    return ('<header class="site-header">' + logo() +
            '<button class="menu" type="button" aria-controls="mainnav" aria-expanded="false">Menü <span aria-hidden="true">＋</span></button>'
            f'<nav id="mainnav" aria-label="Hauptnavigation">{items}<a class="nav-contact" href="#kontakt">Kontakt <span aria-hidden="true">↗</span></a></nav></header>')


def footer():
    a = SITE['address']
    cols = {
        'investment': [('Leistung', '#leistung'), ('Asset einordnen', '#bewertung'), ('Ankaufsprofil', '#bewertung-investment-search'), ('Investment Memo', '#memo')],
        'property': [('Immobilie bewerten', '#bewertung'), ('Suchprofil', '#bewertung-property-search'), ('Ausgewählte Immobilien', '#collection'), ('Property Brief', '#memo')],
        'projects': [('Wert nach Sanierung', '#bewertung'), ('Vergütung', '#verguetung'), ('Vorher & Nachher', '#beforeafter'), ('Renovation Memo', '#memo')],
    }
    columns = ''.join(f'<div><strong>{D[k]["label"]}</strong>' + ''.join(f'<a href="{page(k)}{h}">{t}</a>' for t, h in links) + '</div>' for k, links in cols.items())
    columns += (f'<div><strong>GRENFORD</strong><a href="{page("ueber-grenford")}">Über GRENFORD</a><a href="{page("bewerten")}">Immobilie bewerten</a>'
                f'<a href="{page("markt")}">Marktperspektiven</a>'
                '<a href="#kontakt">Kontakt</a><a href="https://www.staynamic.com/" target="_blank" rel="noopener">STAYNAMIC ↗</a></div>')
    return ('<footer class="site-footer"><div class="footer-main">' + logo() +
            f'<p>Wir strukturieren<br><em>Immobilienentscheidungen.</em></p><address>GRENFORD · Marco Kaimann<br>{E(a["street"])} · {E(a["zip"])} {E(a["city"])}<br>'
            f'<a href="tel:{E(SITE["phoneHref"])}">{E(SITE["phone"])}</a><br><a href="mailto:{E(SITE["email"])}">{E(SITE["email"])}</a></address></div>'
            f'<nav class="footer-cols" aria-label="Seitenübersicht">{columns}</nav>'
            f'<div class="footer-bottom"><span>© 2026 GRENFORD · Marco Kaimann</span><span>USt-ID: {E(SITE["vatId"])}</span>'
            f'<a href="{E(SITE["imprint"])}">Impressum</a><a href="{E(SITE["privacy"])}">Datenschutz</a></div></footer>')


def value_bar():
    return ('<aside class="value-bar" data-value-bar hidden aria-label="Immobilienbewertung"><p><strong>Was ist Ihre Immobilie wert?</strong>'
            '<span>Heute und nach der Sanierung. Persönlich eingeschätzt, Antwort innerhalb von 48 Stunden.</span></p>'
            f'<a class="button" href="{page("bewerten")}">Bewertung starten <span aria-hidden="true">↗</span></a>'
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


def shell(active, meta, body, ld=()):
    path = '' if active == 'home' else active + '/'
    fonts = ''.join(f'<link rel="preload" href="{asset(f"fonts/dm-sans-{w}.woff2")}" as="font" type="font/woff2" crossorigin>' for w in (400, 500))
    social = (f'<meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="GRENFORD">'
              f'<meta property="og:title" content="{E(meta["title"])}"><meta property="og:description" content="{E(meta["description"])}">'
              f'<meta property="og:url" content="{absolute(path)}"><meta property="og:image" content="{absolute("assets/og-grenford.jpg")}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
              f'<meta property="og:image:alt" content="GRENFORD – Der nächste Schritt zählt."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{absolute("assets/og-grenford.jpg")}">')
    meta_robots = '<meta name="robots" content="noindex">' if active == '404' else f'<link rel="canonical" href="{absolute(path)}">'
    return ('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(meta["title"])}</title><meta name="description" content="{E(meta["description"])}">'
            f'{meta_robots}{social}<meta name="theme-color" content="#222e41">'
            f'<meta name="grenford-form-endpoint" content="{E(SITE["formEndpoint"], quote=True)}"><meta name="grenford-email" content="{E(SITE["email"])}">'
            f'<link rel="icon" type="image/png" sizes="32x32" href="{asset("favicon-32.png")}"><link rel="icon" type="image/png" sizes="192x192" href="{asset("favicon-192.png")}">'
            f'<link rel="apple-touch-icon" href="{asset("apple-touch-icon.png")}">{fonts}'
            f'<link rel="stylesheet" href="{root("site.css")}"><script defer src="{root("app.js")}"></script><script defer src="{root("ux.js")}"></script><script defer src="{root("wizard.js")}"></script>{f'<script defer src="{root("market.js")}"></script>' if active == 'markt' else ''}{PREVIEW_HEAD.replace("{root}", root(""))}'
            + (structured_data() if active == 'home' else '') + ''.join(ld_json(x) for x in ld) +
            f'</head><body class="page-{active}"><a class="skip" href="#main">Zum Inhalt</a>' + header(active) +
            '<main id="main" tabindex="-1">' + body + '</main>' + footer() + rail() + ('' if active in ('bewerten', '404') else value_bar()) + '</body></html>')


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


def reach_line():
    """Reichweite unter dem Hero: Städte der Skyline-Galerie, die gezeigte Stadt hebt app.js hervor."""
    cities = SITE['home'].get('reach') or []
    if not cities:
        return ''
    names = ''.join(f'<span data-reach-city{" class=\"is-active\"" if i == 0 else ""}>{E(c)}</span>' for i, c in enumerate(cities))
    return f'<p class="hero-reach"><span class="hero-reach-cities">{names}</span><span>{E(SITE["home"]["reachNote"])}</span></p>'


def home_hero():
    routes = ''.join(f'<a href="{page(k)}"><span>{i:02d}</span>{d["label"]}<b aria-hidden="true">↗</b></a>' for i, (k, d) in enumerate(D.items(), 1))
    return ('<section class="immersive-hero">' + gallery(hero_images(SITE['home'])) +
            '<div class="hero-content"><div class="hero-kicker"><span>BOUTIQUE REAL ESTATE ADVISORY</span><span class="hero-coordinate" aria-hidden="true">G / 01</span></div>'
            '<h1>Der nächste<br><em>Schritt zählt.</em></h1><div class="hero-bottom"><p>Immobilienentscheidungen brauchen einen klaren Blick. Und jemanden, der ihn mit Ihnen teilt.</p>'
            '<a class="hero-link" href="#perspektiven"><span>Ihre Perspektive wählen</span><span class="arrow-circle" aria-hidden="true">↓</span></a></div>'
            + reach_line() + '</div>'
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
    # Die Projektanfrage in sechs Schritten ist überall eingeklappt: Bewertung und Suchprofile sind der Haupteinstieg,
    # so stehen nicht mehrere offene Formulare untereinander. #anfrage und die „… anfragen“-Buttons öffnen sie.
    summary = {'home': ('Ihr Vorhaben. Konkret werden.', 'In sechs Schritten · kostenfreies Erstgespräch')}.get(
        k, (f'{D[k]["memo"]} anfragen.', 'In sechs Schritten · kostenfreies Erstgespräch · Antwort innerhalb von 48 Stunden') if k in D else None)
    gateway = ('<details class="project-gateway" id="anfrage"><summary><span><small>STRATEGISCHE PROJEKTANFRAGE</small>'
               f'<strong>{summary[0]}</strong><em>{summary[1]}</em></span><b aria-hidden="true">＋</b></summary>' + inquiry(k) + '</details>')
    if k == 'home':
        return gateway + contact(collapsible=True)
    return '<div class="gateway-band">' + gateway + '</div>' + contact(subject='renovation' if k == 'projects' else k)


def subpage(k):
    d = D[k]
    titles = {'investment': 'Werte erkennen.<br><em>Chancen einordnen.</em>', 'property': 'Räume entdecken.<br><em>Menschen verbinden.</em>', 'projects': 'Angebote verstehen.<br><em>Baupartner finden.</em>'}
    actions = {'investment': (('Asset einordnen', 'investment-value'), ('Ankaufsprofil hinterlegen', 'investment-search')),
               'property': (('Immobilie bewerten', 'property-value'), ('Suchprofil hinterlegen', 'property-search')),
               'projects': (('Wert nach Sanierung ermitteln', 'projects-value'), None)}
    (p_label, p_key), sec = actions[k]
    primary = f'<a class="button" href="#bewertung-{p_key}" data-wz-open="{p_key}">{p_label}<span aria-hidden="true">↓</span></a>'
    second = (f'<a class="text-link" href="#memo">{d["memo"]} ↓</a>' if not sec else
              f'<a class="text-link" href="#bewertung-{sec[1]}" data-wz-open="{sec[1]}">{sec[0]} <span aria-hidden="true">↓</span></a>')
    body = ('<section class="immersive-hero immersive-sub">' + gallery(hero_images(SITE['pages'][k])) +
            f'<div class="hero-content"><div class="hero-kicker"><a href="{page("home")}">GRENFORD / {d["label"].upper()}</a><span class="hero-coordinate" aria-hidden="true">G / {d["n"]}</span></div>'
            f'<h1>{titles[k]}</h1><div class="hero-bottom"><p>{d["intro"]}</p><div class="hero-actions">' + primary + second + '</div></div></div></section>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#leistung">Leistung</a><a href="#bewertung">'
             + {'investment': 'Asset einordnen', 'property': 'Bewertung & Suchprofil', 'projects': 'Wert nach Sanierung'}[k] + '</a>'
             + ('<a href="#verguetung">Vergütung</a>' if k == 'projects' else '')
             + ('<a href="#collection">Immobilien</a>' if k != 'projects' else '<a href="#beforeafter">Vorher & Nachher</a>')
             + f'<a href="#memo">{d["memo"]}</a><a href="#ablauf">Der Ablauf</a><a href="#fragen">Fragen</a><a href="#anfrage">Projektanfrage</a></nav>')
    intros = {
        'investment': ('Sie haben ein Asset.<br>Oder ein <em>Anlageziel.</em>', 'GRENFORD unterstützt Eigentümer bei der Positionierung und Ansprache passender Investoren – und sucht im Kundenauftrag nach passenden Anlageimmobilien.',
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
    body += valuation_section(k)
    body += collection(k) if k != 'projects' else fee_band() + comparisons()
    body += memos(k) + process(k)
    faq = ''.join(f'<details><summary>{E(q)}<span aria-hidden="true">＋</span></summary><p>{E(a)}</p></details>' for q, a in d['faq'])
    body += (f'<section class="questions" id="fragen"><div><span class="eyebrow">GUT ZU WISSEN</span><h2>Die Fragen<br><em>vor dem ersten Schritt.</em></h2></div><div>{faq}</div></section>'
             + inquiries(k))
    return shell(k, SITE['pages'][k], body, ld=(faq_data(d['faq']), crumbs(k, d['label'])))


def valuation_teaser():
    tiles = [('Wohnung', 'wohnung', 'property-value'), ('Haus', 'haus', 'property-value'), ('Mehrfamilienhaus', 'mfh', 'property-value'),
             ('Sanierungsobjekt', 'sanierung', 'projects-value'), ('Anlageobjekt', 'anlage', 'investment-value')]
    links = ''.join(f'<a class="teaser-tile" href="{page("bewerten")}#bewertung-{w}">{svg(icon)}<span>{t}</span></a>' for t, icon, w in tiles)
    return ('<section class="valuation-teaser" id="bewertung"><div class="section-head"><span class="eyebrow">02 / BEWERTUNG</span>'
            '<h2>Was ist Ihre Immobilie wert?<br><em>Heute und nach der Sanierung.</em></h2>'
            '<p>Zwei Zahlen statt einer: der Wert im heutigen Zustand und der Wert nach einer sinnvollen Sanierung. Persönlich eingeschätzt, nicht automatisch errechnet.</p></div>'
            f'<div class="teaser-tiles">{links}</div><div class="teaser-foot"><p class="wz-checks"><span>Kostenfrei und unverbindlich</span><span>Antwort innerhalb von 48 Stunden</span>'
            f'<span>Mit Sanierungsblick</span></p><a class="button" href="{page("bewerten")}">Bewertung starten <span aria-hidden="true">↗</span></a></div></section>')


def valuation_section(k):
    heads = {
        'investment': ('IHR EINSTIEG / INVESTMENT', 'Asset einordnen.<br><em>Oder Ankauf profilieren.</em>',
                       'Für Eigentümer, Bauträger und Investoren: Eckdaten in wenigen Schritten, vertraulich behandelt. Daraus entsteht die Grundlage für Ihr Investment Memo.'),
        'property': ('IHR EINSTIEG / PROPERTY', 'Verkaufen oder kaufen.<br><em>Mit klarem Wert.</em>',
                     'Wer verkauft, erhält eine persönliche Einschätzung des Werts. Wer sucht, hinterlegt sein Profil und erfährt von passenden Immobilien zuerst, auch von diskreten.'),
        'projects': ('IHR EINSTIEG / PROJECTS', 'Wert heute.<br><em>Wert nach der Sanierung.</em>',
                     'Beschreiben Sie Ihre Immobilie und Ihr Vorhaben. Sie erhalten eine Einordnung, was die Sanierung kostet und was sie bringt, als Start für Ihr Renovation Memo.'),
        'bewerten': ('IHRE BEWERTUNG', 'In wenigen Schritten<br><em>zur Einschätzung.</em>',
                     'Wählen Sie Ihren Bereich. Jede Variante fragt nur, was für Ihre Immobilie zählt. Am Ende entscheiden Sie, wie Sie Ihre Rückmeldung erhalten möchten.'),
    }
    eyebrow, title, lead = heads[k]
    return (f'<section class="valuation" id="bewertung"><div class="section-head"><span class="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{lead}</p></div>'
            f'<div class="valuation-frame">{wizard_tabs(k, TAB_LABELS_BEWERTEN if k == "bewerten" else None)}</div>'
            '<p class="wz-checks"><span>Kostenfrei und unverbindlich</span><span>Antwort innerhalb von 48 Stunden</span><span>Persönlich von Marco Kaimann</span><span>Vertraulich behandelt</span></p></section>')


def fee_band():
    facts = [('0 €', 'Honorar für Sie als Eigentümer, auch nach Ihrer Entscheidung.'), ('Direkt', 'Sie beauftragen die Baufirma selbst. Zahlungen laufen nur zwischen Ihnen und ihr.'),
             ('Bis zum Ende', 'Beratende Begleitung bis zur Fertigstellung.')]
    items = ''.join(f'<div><strong>{a}</strong><p>{b}</p></div>' for a, b in facts)
    return ('<section class="fee-band" id="verguetung"><div><span class="eyebrow">TRANSPARENT VERGÜTET</span><h2>Für Eigentümer<br><em>kostenfrei.</em></h2>'
            '<p>GRENFORD wird für die Vermittlung vom beauftragten Bauunternehmen vergütet. Die Entscheidung, ob und wen Sie beauftragen, treffen allein Sie. '
            'So steht es auch in jedem Renovation Memo.</p></div>'
            f'<div class="fee-facts">{items}</div></section>')


def home():
    body = (home_hero() + pathways() + valuation_teaser() + collection() + '<div class="personal-approach">' + founder() + process() + '</div>' + inquiries('home'))
    return shell('home', SITE['home'], body)


def sub_hero(key, kicker, n, title, lead, actions):
    return ('<section class="immersive-hero immersive-sub">' + gallery(hero_images(SITE['pages'][key])) +
            f'<div class="hero-content"><div class="hero-kicker"><a href="{page("home")}">GRENFORD / {kicker}</a><span class="hero-coordinate" aria-hidden="true">G / {n}</span></div>'
            f'<h1>{title}</h1><div class="hero-bottom"><p>{lead}</p><div class="hero-actions">{actions}</div></div></div></section>')


def ways():
    items = [('Innerhalb von 48 Stunden · digital', 'Ersteinschätzung', 'Sie beschreiben Ihre Immobilie in wenigen Schritten. Innerhalb von 48 Stunden erhalten Sie eine Einschätzung mit Wertspanne, persönlich erstellt.',
              '<a class="button" href="#bewertung">Bewertung starten <span aria-hidden="true">↑</span></a>'),
             ('30 Minuten · Video', 'Video-Termin', 'Gemeinsam Unterlagen, Fotos und Ihre Fragen durchgehen. Direkt im Kalender buchbar.',
              f'<a class="text-link" href="{E(SITE["calendar"])}" target="_blank" rel="noopener noreferrer">Termin buchen <span aria-hidden="true">↗</span></a>'),
             ('Vor Ort', 'Besichtigung', 'Persönlich vor Ort, mit Blick auf Lage, Substanz, Ausstattung und das Potenzial einer Sanierung.',
              '<a class="text-link" href="#kontakt">Besichtigung anfragen <span aria-hidden="true">↓</span></a>')]
    cols = ''.join(f'<article><span class="eyebrow">{a}</span><h3>{b}</h3><p>{c}</p>{d}</article>' for a, b, c, d in items)
    return ('<section class="ways" id="wege"><div class="section-head"><span class="eyebrow">DREI WEGE</span><h2>Wie Sie zu Ihrem Wert<br><em>kommen möchten.</em></h2>'
            f'<p>Digital, im Video oder vor Ort. Jeder Weg ist kostenfrei und führt zu einer persönlichen Einschätzung.</p></div><div class="ways-grid">{cols}</div></section>')


def value_steps():
    steps = [('Anfrage und Termin', 'Formular, Anruf oder Video-Termin. GRENFORD meldet sich persönlich und stimmt den nächsten Schritt mit Ihnen ab.', 'hero-prop-altbauwohnung.webp'),
             ('Besichtigung vor Ort', 'Lage, Substanz, Ausstattung und Unterlagen. Dazu der Blick darauf, was eine Sanierung verändern würde.', 'dachgeschoss-before.webp'),
             ('Wertermittlung', 'Der Wert heute und der Wert nach einer Sanierung, mit grobem Kostenrahmen und vergleichbaren Objekten eingeordnet.', 'projects-bauplan.webp'),
             ('Ergebnis im Gespräch', 'Persönliche Vorstellung der Ergebnisse. Auf Wunsch als Property Brief, die Grundlage für Ihre Entscheidung: verkaufen, sanieren oder halten.', 'soemmering-wohnzimmer.webp')]
    slides = ''.join(f'<article class="slide" data-slide><div><span class="eyebrow">SCHRITT {i:02d} VON 04</span><h3>{E(a)}</h3><p>{E(b)}</p></div>'
                     + img(pic, '', '(max-width:760px) 88vw, 45vw', 'loading="lazy"') + '</article>' for i, (a, b, pic) in enumerate(steps, 1))
    return ('<section class="value-steps" id="ablauf"><div class="section-head"><span class="eyebrow">DER ABLAUF</span><h2>Vier Schritte<br><em>zu Ihrem Wert.</em></h2>'
            '<p>Vom ersten Kontakt bis zum Ergebnis, mit einem Ansprechpartner.</p></div>'
            '<div class="slides" data-slides><div class="slides-count"><span class="slides-num"><span data-slide-num>01</span><small>/04</small></span>'
            '<span class="slides-nav"><button type="button" data-slide-prev aria-label="Vorheriger Schritt">←</button><button type="button" data-slide-next aria-label="Nächster Schritt">→</button></span></div>'
            f'<div class="slides-track" aria-live="polite">{slides}</div></div></section>')


def faq_section(items, title='Die Fragen<br><em>vor dem ersten Schritt.</em>'):
    faq = ''.join(f'<details><summary>{E(q)}<span aria-hidden="true">＋</span></summary><p>{E(a)}</p></details>' for q, a in items)
    return f'<section class="questions" id="fragen"><div><span class="eyebrow">GUT ZU WISSEN</span><h2>{title}</h2></div><div>{faq}</div></section>'


def bewerten():
    body = sub_hero('bewerten', 'BEWERTUNG', '04', 'Den Wert kennen.<br><em>Die Richtung wählen.</em>',
                    'Was ist Ihre Immobilie heute wert, und was nach einer Sanierung? GRENFORD ordnet beides persönlich ein. Kostenfrei, unverbindlich und mit Antwort innerhalb von 48 Stunden.',
                    '<a class="button" href="#bewertung">Bewertung starten<span aria-hidden="true">↓</span></a><a class="text-link" href="#ablauf">So läuft es ab ↓</a>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#bewertung">Bewertung</a><a href="#wege">Drei Wege</a><a href="#ablauf">Der Ablauf</a>'
             '<a href="#fragen">Fragen</a><a href="#kontakt">Kontakt</a></nav>')
    body += valuation_section('bewerten') + ways() + value_steps()
    faqs = [
        ('Was kostet die Bewertung?', 'Die Ersteinschätzung ist kostenfrei und unverbindlich. Ein Auftrag entsteht dadurch nicht.'),
        ('Wie schnell erhalte ich eine Rückmeldung?', 'Innerhalb von 48 Stunden meldet sich Marco Kaimann persönlich, auf dem Weg, den Sie im letzten Schritt gewählt haben: per E-Mail, Telefon oder im Video-Termin.'),
        ('Ist das ein automatisch berechneter Wert?', 'Nein. Ihre Angaben liest Marco Kaimann persönlich und ordnet sie mit Lage, Zustand und vergleichbaren Objekten ein. Sie erhalten eine Wertspanne und eine Erläuterung.'),
        ('Was bedeutet „Wert nach der Sanierung“?', 'Neben dem heutigen Wert zeigt die Einschätzung, wie sich eine sinnvolle Sanierung auf den Wert auswirken kann, mit einem groben Kostenrahmen. So sehen Sie, ob sich ein Vorhaben lohnt, bevor Sie Angebote einholen.'),
        ('Welche Unterlagen helfen?', 'Für die Ersteinschätzung genügen Ihre Angaben. Für eine genaue Wertermittlung helfen Grundriss, Wohnflächenberechnung, Energieausweis und bei vermieteten Objekten die Mietaufstellung.'),
        ('Was passiert mit meinen Angaben?', 'Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und vertraulich behandelt. Details finden Sie in der Datenschutzerklärung.'),
    ]
    body += faq_section(faqs)
    body += contact(hint='valuation')
    service = {'@context': 'https://schema.org', '@type': 'Service', 'serviceType': 'Immobilienbewertung', 'name': 'Immobilienbewertung: Wert heute und nach der Sanierung',
               'description': SITE['pages']['bewerten']['description'], 'areaServed': {'@type': 'City', 'name': 'Berlin'},
               'provider': {'@type': 'RealEstateAgent', 'name': 'GRENFORD', 'url': absolute()},
               'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR', 'description': 'Kostenfreie Ersteinschätzung, Antwort innerhalb von 48 Stunden'}}
    return shell('bewerten', SITE['pages']['bewerten'], body, ld=(faq_data(faqs), service, crumbs('bewerten', 'Immobilie bewerten')))


def ueber():
    body = sub_hero('ueber-grenford', 'ÜBER GRENFORD', '00', 'Eine Marke.<br><em>Ein Ansprechpartner.</em>',
                    'GRENFORD ist die Boutique-Immobilienberatung von Marco Kaimann aus Berlin. Drei Geschäftsfelder, eine Haltung: Immobilienentscheidungen strukturieren.',
                    '<a class="button" href="#kontakt">Lernen wir uns kennen<span aria-hidden="true">↓</span></a><a class="text-link" href="#haltung">Die Haltung ↓</a>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#marco">Der Gründer</a><a href="#haltung">Die Haltung</a><a href="#felder">Drei Geschäftsfelder</a>'
             '<a href="#ablauf">So entsteht ein Memo</a><a href="#kontakt">Kontakt</a></nav>')
    body += '<div class="personal-approach">' + founder() + '</div>'
    values = [('Struktur', 'Jede Entscheidung bekommt ihre Grundlage: das Memo. Wünsche, Zahlen und Optionen auf einen Blick, statt Bauchgefühl.'),
              ('Transparenz', 'Woher die Zahlen stammen, welche Rolle GRENFORD hat und wie die Vergütung geregelt ist, steht offen im Memo.'),
              ('Diskretion', 'Off-Market-Mandate, vertrauliche Angebote und persönliche Ziele bleiben vertraulich.'),
              ('Verantwortung', 'Ein Ansprechpartner vom ersten Gespräch bis zum Notartermin oder zur Fertigstellung.')]
    body += ('<section class="values" id="haltung"><div class="section-head"><span class="eyebrow">DIE HALTUNG</span><h2>Struktur statt<br><em>Bauchgefühl.</em></h2>'
             '<p>Vier Grundsätze, die jedes Mandat tragen, ob Investment, Property oder Projects.</p></div><div class="values-grid">'
             + ''.join(f'<article><span>{i:02d}</span><h3>{a}</h3><p>{b}</p></article>' for i, (a, b) in enumerate(values, 1)) + '</div></section>')
    fields = [('investment', 'Transaktionen und Kapital', 'Ausgewählte Off-Market-Transaktionen, Projektentwicklungen und Wohnimmobilieninvestments, mit Analyse, Positionierung und diskreter Vermarktung.'),
              ('property', 'Immobilien und Perspektiven', 'Beratung für Eigentümer, Käufer und Verkäufer von Wohn-, Ferien- und Gewerbeimmobilien, von der Einordnung bis zur Vermarktung.'),
              ('projects', 'Umbau und Entwicklung', 'Wünsche, Maßnahmen und Baupartner zusammenführen: Beratung für Sanierung, Modernisierung und Repositionierung.')]
    rows = ''.join(f'<a class="field-row" href="{page(k)}"><span class="eyebrow">{D[k]["label"].upper()} · {E(AUDIENCE[k])}</span><h3>{t}</h3><p>{E(x)}</p>'
                   f'<span class="field-memo">{E(D[k]["memo"])} <span aria-hidden="true">↗</span></span></a>' for k, t, x in fields)
    body += ('<section class="fields" id="felder"><div class="section-head"><span class="eyebrow">DREI GESCHÄFTSFELDER</span><h2>Ein Haus.<br><em>Drei Perspektiven.</em></h2>'
             f'<p>Jedes Feld hat sein eigenes Memo als Entscheidungsgrundlage.</p></div><div class="field-rows">{rows}</div></section>')
    steps = [('Aufnehmen', 'Wünsche, Bestand und Ziele erfassen.'), ('Vergleichen', 'Zahlen, Angebote und Optionen gegenüberstellen.'),
             ('Besprechen', 'Unterschiede erläutern, offene Punkte klären.'), ('Kennenlernen', 'Partner und Objekte vor Ort erleben.'),
             ('Entscheiden', 'Mit dem Memo als Grundlage den nächsten Schritt festlegen.')]
    body += ('<section class="memo-line" id="ablauf"><div class="section-head"><span class="eyebrow">SO ENTSTEHT EIN GRENFORD MEMO</span><h2>Erst der Vergleich.<br><em>Dann die Entscheidung.</em></h2>'
             '<p>Derselbe Weg, ob Renovation Memo, Property Brief oder Investment Memo.</p></div><ol class="memo-timeline">'
             + ''.join(f'<li><span>{i:02d}</span><h3>{a}</h3><p>{b}</p></li>' for i, (a, b) in enumerate(steps, 1)) + '</ol></section>')
    body += ('<section class="reach-band"><div><span class="eyebrow">REICHWEITE</span><h2>Berlin als Basis.<br><em>Mandate bundesweit.</em></h2></div>'
             '<div><p class="reach-cities">' + ' · '.join(E(c) for c in SITE['home']['reach']) + '</p>'
             '<p>Je nach Vorhaben arbeitet GRENFORD mit spezialisierten Fach- und Baupartnern zusammen. So verbindet sich persönliche Beratung mit der passenden Expertise.</p></div></section>')
    body += contact(hint='valuation')
    return shell('ueber-grenford', SITE['pages']['ueber-grenford'], body, ld=(crumbs('ueber-grenford', 'Über GRENFORD'),))


def markt():
    """Marktseite: ergänzende Orientierung, keine Leistungsseite und keine automatische Objektbewertung."""
    body = sub_hero('markt', 'MARKTPERSPEKTIVEN', 'M', 'Zahlen verstehen.<br><em>Klarer entscheiden.</em>',
                    'Ein Marktwert entsteht im Zusammenspiel von Lage, Zustand, Nutzung und Nachfrage. Marktdaten geben Orientierung. '
                    'Entscheidend ist, was sie für Ihre Immobilie bedeuten.',
                    '<a class="button" href="#kontakt">Vorhaben besprechen<span aria-hidden="true">↓</span></a><a class="text-link" href="#marktueberblick">Zur Marktübersicht ↓</a>')
    body += ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#marktueberblick">Marktüberblick</a><a href="#einordnung">Einordnung</a>'
             '<a href="#methodik">Methodik</a><a href="#fragen">Fragen</a><a href="#kontakt">Kontakt</a></nav>')
    body += market.overview('#kontakt') + market.interpretation(page) + market.methodology()
    body += faq_section(market.FAQ, 'Häufige<br><em>Fragen.</em>') + market.next_step('#kontakt') + contact(hint='valuation')
    return shell('markt', SITE['pages']['markt'], body, ld=(faq_data(market.FAQ), crumbs('markt', 'Marktperspektiven')))


def not_found():
    """404-Seite: absolute Pfade, weil der Server sie unter beliebigen Adressen ausliefert."""
    links = ''.join(f'<a class="field-row" href="{page(k)}"><span class="eyebrow">{D[k]["label"].upper()}</span><h3>{t}</h3><p>{x}</p>'
                    f'<span class="field-memo">Zur Seite <span aria-hidden="true">↗</span></span></a>' for k, t, x in (
                        ('investment', 'Transaktionen und Kapital', 'Off-Market, Globalverkauf, Ankaufsprofil.'),
                        ('property', 'Immobilien und Perspektiven', 'Verkaufen, kaufen, bewerten.'),
                        ('projects', 'Umbau und Entwicklung', 'Sanierung planen, Angebote vergleichen.')))
    body = ('<section class="immersive-hero immersive-sub not-found-hero">' + gallery(['hero-berlin.webp']) +
            f'<div class="hero-content"><div class="hero-kicker"><a href="{page("home")}">GRENFORD / 404</a><span class="hero-coordinate" aria-hidden="true">G / 404</span></div>'
            '<h1>Diese Seite<br><em>gibt es nicht.</em></h1><div class="hero-bottom"><p>Vielleicht wurde sie verschoben oder die Adresse ist unvollständig. '
            'Hier geht es weiter.</p><div class="hero-actions">'
            f'<a class="button" href="{page("home")}">Zur Startseite<span aria-hidden="true">↗</span></a><a class="text-link" href="{page("bewerten")}">Immobilie bewerten ↗</a></div></div></div></section>'
            f'<section class="fields" id="felder"><div class="section-head"><span class="eyebrow">DIE DREI BEREICHE</span><h2>Wohin<br><em>möchten Sie?</em></h2>'
            f'<p>Oder schreiben Sie direkt an {E(SITE["email"])}.</p></div><div class="field-rows">{links}</div></section>' + contact(hint='valuation'))
    meta = {'title': 'Seite nicht gefunden | GRENFORD', 'description': 'Diese Seite gibt es nicht. Zur Startseite von GRENFORD oder direkt zu Investment, Property und Projects.'}
    return shell('404', meta, body)


# ---------------------------------------------------------------- Ausgabe

# Nur im Vorschau-Build: Farbumschalter zum Vergleich der Akzentfarben (static/preview/).
PREVIEW_HEAD = ''


def copy_static(out):
    shutil.copytree(STATIC / 'assets', out / 'assets')
    shutil.copy(STATIC / 'js' / 'app.js', out / 'app.js')
    shutil.copy(STATIC / 'js' / 'ux.js', out / 'ux.js')
    shutil.copy(STATIC / 'js' / 'wizard.js', out / 'wizard.js')
    shutil.copy(STATIC / 'js' / 'market.js', out / 'market.js')
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
    urls = [absolute()] + [absolute(k + '/') for k in list(D) + list(EXTRA) + ['markt']]
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
    pages['bewerten/index.html'] = (1, bewerten)
    pages['ueber-grenford/index.html'] = (1, ueber)
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
