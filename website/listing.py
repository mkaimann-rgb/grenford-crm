"""Property: eigene Seite je Immobilie (/property/<slug>/), aufgebaut nach dem Vorbild beachhouseusedom.de,
im GRENFORD-Property-Stil. Daten: property-collection.json (eine Quelle für Karussell und Objektseite).

Aufbau: Hero mit Preis und zwei Wegen (Property Brief, Besichtigung) · Überblick mit Kennzahlen · Highlights ·
Ausstattung · Galerie · Selbst nutzen oder vermieten · Kosten und Energie · Lage mit Karte nach Klick ·
weitere Einheiten · Abschluss mit Anfrage. Fehlende Angaben stehen als „Angabe folgt“ und werden beim Build gemeldet.
"""
import html, json
from pathlib import Path
from urllib.parse import quote

import paths
from paths import SITE, page, img
from valuation import svg

E = html.escape
ROOT = Path(__file__).parent
OBJECTS = json.loads((ROOT / 'property-collection.json').read_text(encoding='utf-8'))
BY_SLUG = {o['slug']: o for o in OBJECTS}
missing = {}  # slug -> fehlende Pflichtangaben (Build-Hinweis)

ICON = {'area': 'grundriss', 'rooms': 'wohnung', 'loggia': 'balkon', 'terrace': 'dach', 'corner': 'kompass'}
HIGHLIGHT = {
    'area': 'Großzügig geschnitten',
    'rooms': 'Raum für Familie oder Arbeiten',
    'loggia': 'Draußen sitzen, geschützt',
    'terrace': 'Über den Dächern',
    'corner': 'Licht von zwei Seiten',
}
FOLGT = 'Angabe folgt'


def url(o):
    return page('property/' + o['slug'])


def _price(o):
    price, per = (o['priceStr'].split(' · ') + [''])[:2]
    return price, per


def _fact(o, key):
    return next((f[1] for f in o['facts'] if f[0] == key), '')


def _summary(o):
    """Kurzfassung aus den Eckdaten (statt die Beschreibung aus dem Hero zu wiederholen)."""
    facts = [f[1] for f in o['facts']]
    head = ', '.join(facts[:-1]) + (' und ' + facts[-1] if len(facts) > 1 else facts[0])
    return f'{o["type"]} mit {head} in {o["location"].replace(" · ", "-")}.'


def _check(o):
    gaps = []
    if not o.get('energy'):
        gaps.append('Energieausweis (§ 87 GEG)')
    if not (o.get('costs') or {}).get('provision'):
        gaps.append('Käuferprovision')
    if gaps:
        missing[o['slug']] = gaps


def body(slug):
    o = BY_SLUG[slug]
    _check(o)
    price, per = _price(o)
    obj = E(o['title'], quote=True)
    enquire = f'<button class="button" type="button" data-enquire="property-buy" data-object="{obj}">Property Brief anfragen <span aria-hidden="true">↗</span></button>'
    visit = f'<a class="text-link" href="{E(SITE["calendar"], quote=True)}" target="_blank" rel="noopener">Besichtigung vereinbaren <span aria-hidden="true">↗</span></a>'

    # ---------- Hero
    hero = ('<section class="lx-hero"><figure class="lx-hero-img">' + img(o['gallery'][0], o['title'] + ', Visualisierung', '100vw', 'fetchpriority="high"') + '</figure>'
            f'<div class="lx-hero-copy"><a class="lx-back" href="{page("property")}#collection">← Alle Immobilien</a>'
            f'<p class="eyebrow">{E(o["type"])} · {E(o["location"])}</p><h1>{E(o["title"])}</h1>'
            f'<p class="lx-hero-sub">{E(o["desc"])}</p>'
            f'<div class="lx-hero-foot"><p class="lx-price"><span>Kaufpreis</span><strong>{E(price)}</strong>' + (f'<small>{E(per)}</small>' if per else '') + '</p>'
            f'<div class="lx-actions">{enquire}{visit}</div></div><p class="lx-vis">Visualisierung</p></div></section>')

    nav = ('<nav class="section-nav lx-nav" aria-label="Seitenabschnitte"><a href="#ueberblick">Überblick</a><a href="#highlights">Highlights</a>'
           '<a href="#galerie">Galerie</a><a href="#nutzung">Selbst nutzen oder vermieten</a><a href="#kosten">Kosten und Energie</a>'
           '<a href="#lage">Lage</a><a href="#anfrage-objekt">Anfrage</a></nav>')

    # ---------- Überblick
    figures = [('Wohnfläche', _fact(o, 'area')), ('Zimmer', _fact(o, 'rooms').replace(' Zimmer', '')), ('Kaufpreis', price), ('Preis je m²', per)]
    figs = ''.join(f'<div><dt>{E(k)}</dt><dd>{E(v)}</dd></div>' for k, v in figures if v)
    overview = ('<section class="lx-overview" id="ueberblick"><figure class="lx-overview-img">'
                + img(o['gallery'][1 % len(o['gallery'])], o['title'] + ', Innenansicht, Visualisierung', '(max-width:900px) 92vw, 40vw', 'loading="lazy"') +
                '</figure><div><p class="eyebrow">Das Objekt</p><h2>Im Überblick</h2>'
                f'<p class="lx-lead">{E(_summary(o))}</p>'
                '<p>Ob zum Selbstnutzen oder als Kapitalanlage: Der Property Brief enthält Grundriss, Unterlagen und die Zahlen für beide Blickwinkel.</p>'
                f'<dl class="lx-figures">{figs}</dl></div></section>')

    # ---------- Highlights (aus den Eckdaten)
    cards = ''.join(f'<article class="lx-card">{svg(ICON.get(k, "stern2"), "lx-icon")}<div><h3>{E(v)}</h3><p>{E(HIGHLIGHT.get(k, ""))}</p></div></article>'
                    for k, v in o['facts'])
    cards += ('<article class="lx-card">' + svg('kueche', 'lx-icon') + '<div><h3>Ausstattung nach Wahl</h3>'
              '<p>Eine frei wählbare Ausstattungslinie ohne Aufpreis, von klassischem Fischgrätparkett bis zum Kamin.</p></div></article>')
    highlights = f'<section class="lx-highlights" id="highlights"><div class="section-head"><p class="eyebrow">Highlights</p><h2>Was diese Wohnung ausmacht</h2></div><div class="lx-cards">{cards}</div></section>'

    # ---------- Galerie
    pics = ''.join(f'<figure>{img(g, o["title"] + ", Visualisierung", "(max-width:900px) 92vw, 33vw", "loading=\"lazy\"")}</figure>' for g in o['gallery'])
    gallery = (f'<section class="lx-gallery" id="galerie"><div class="section-head"><p class="eyebrow">Interieur</p><h2>Galerie</h2>'
               '<p>Visualisierungen. Grundrisse und Baubeschreibung erhalten Sie mit dem Property Brief.</p></div><div class="lx-pics">' + pics + '</div></section>')

    # ---------- Selbst nutzen oder vermieten (Verkaufs- und Kapitalanlageobjekt)
    rent = o.get('rent')
    use = ('<section class="lx-use" id="nutzung"><div class="section-head"><p class="eyebrow">Für Selbstnutzer und Kapitalanleger</p><h2>Selbst nutzen oder vermieten</h2></div>'
           '<div class="lx-use-grid"><article><h3>Selbst nutzen</h3><ul>'
           '<li>Grundriss und Ausstattungslinie im Property Brief</li><li>Besichtigung nach Terminabsprache</li>'
           '<li>Finanzierung über unabhängige Finanzierungsvermittler und Banken aus dem GRENFORD-Partnernetz</li></ul></article>'
           '<article><h3>Als Kapitalanlage</h3><ul>'
           f'<li>Kaufpreis {E(price)}' + (f', {E(per)}' if per else '') + '</li>'
           f'<li>Erwartete Kaltmiete: {E(rent) if rent else FOLGT}</li>'
           '<li>Hausgeld, Rücklage und Teilungserklärung im Property Brief</li></ul>'
           '<p class="combo-chips"><b class="combo-property">Property Brief</b><i aria-hidden="true">+</i><b class="combo-grenford">Wertermittlung</b>'
           '<i aria-hidden="true">+</i><b class="combo-partner">Finanzierung über Partner</b></p></article></div></section>')

    # ---------- Kosten und Energie (Pflichtangaben)
    en = o.get('energy') or {}
    costs = o.get('costs') or {}
    rows = [('Kaufpreis', price), ('Preis je m² Wohnfläche', per or FOLGT), ('Käuferprovision', costs.get('provision') or FOLGT),
            ('Hausgeld', costs.get('hausgeld') or FOLGT)]
    erows = [('Art des Energieausweises', en.get('art')), ('Energiekennwert', en.get('kennwert')), ('Wesentlicher Energieträger', en.get('traeger')),
             ('Baujahr laut Energieausweis', en.get('baujahr')), ('Energieeffizienzklasse', en.get('klasse'))]
    dl = lambda rs: ''.join(f'<div><dt>{E(k)}</dt><dd{" class=\"is-open\"" if not v or v == FOLGT else ""}>{E(v or FOLGT)}</dd></div>' for k, v in rs)
    kosten = ('<section class="lx-costs" id="kosten"><div class="section-head"><p class="eyebrow">Transparenz</p><h2>Kosten und Energie</h2></div>'
              f'<div class="lx-costs-grid"><div><h3>Kosten</h3><dl>{dl(rows)}</dl></div><div><h3>Energie</h3><dl>{dl(erows)}</dl></div></div>'
              '<p class="lx-note">Offene Angaben ergänzt GRENFORD, sobald die Unterlagen des Bauträgers vorliegen. Verbindlich sind Exposé, Property Brief und Kaufvertrag.</p></section>')

    # ---------- Lage (Karte erst nach Klick bzw. nach Zustimmung)
    places = ''.join(f'<li>{E(p)}</li>' for p in o.get('places', []))
    map_src = 'https://www.google.com/maps?q=' + quote(o.get('mapQuery', 'Berlin')) + '&output=embed'
    lage = ('<section class="lx-location" id="lage"><div><p class="eyebrow">Lage</p><h2>' + E(o['location']) + '</h2>'
            f'<p>{E(o.get("lageText", ""))}</p><ul class="lx-places">{places}</ul></div>'
            '<figure class="ux-map lx-map"><figcaption><strong>Lage im Stadtteil</strong><span>Die genaue Adresse nennt der Property Brief.</span>'
            f'<button type="button" class="text-button" data-load-map data-map-src="{E(map_src, quote=True)}" data-map-title="Lage: {obj}">Karte laden</button></figcaption>'
            '<div data-map-host></div><small class="ux-map-note">Beim Laden der Karte werden Daten (u. a. Ihre IP-Adresse) an Google übertragen.</small></figure></section>')

    # ---------- Weitere Einheiten
    others = [x for x in OBJECTS if x['slug'] != slug]
    more = ''
    if others:
        items = ''.join(f'<a class="lx-more-card" href="{url(x)}"><figure>{img(x["localImage"], x["title"] + ", Visualisierung", "(max-width:900px) 92vw, 30vw", "loading=\"lazy\"")}</figure>'
                        f'<div><small>{E(x["location"])}</small><h3>{E(x["title"])}</h3><p>{E(" · ".join(f[1] for f in x["facts"][:2]))}</p>'
                        f'<strong>{E(_price(x)[0])}</strong></div></a>' for x in others)
        more = f'<section class="lx-more"><div class="section-head"><p class="eyebrow">Ebenfalls im Angebot</p><h2>Weitere Wohnungen</h2></div><div class="lx-more-grid">{items}</div></section>'

    # ---------- Abschluss
    final = (f'<section class="lx-final" id="anfrage-objekt"><h2>Interesse an {E(o["title"])}?</h2>'
             '<p>Im Property Brief erhalten Sie Grundriss, Unterlagen und einen Besichtigungstermin. Das erste Gespräch ist kostenfrei.</p>'
             f'<div class="lx-actions">{enquire}{visit}</div><p class="lx-note">Alle Bilder sind Visualisierungen.</p></section>')
    return hero + nav + overview + highlights + gallery + use + kosten + lage + more + final


def meta(slug):
    o = BY_SLUG[slug]
    price = _price(o)[0]
    return {'title': f'{o["title"]} · {o["location"].replace(" · ", "-")} | GRENFORD Property',
            'description': f'{o["type"]} in {o["location"].replace(" · ", "-")}: {" · ".join(f[1] for f in o["facts"])}. Kaufpreis {price}. Property Brief mit Grundriss und Unterlagen anfragen.'}


def structured(slug):
    o = BY_SLUG[slug]
    price = _price(o)[0].replace('.', '').replace(' €', '').strip()
    return {'@context': 'https://schema.org', '@type': 'RealEstateListing', 'name': o['title'], 'description': o['desc'],
            'url': paths.absolute('property/' + o['slug'] + '/'),
            'offers': {'@type': 'Offer', 'price': price, 'priceCurrency': 'EUR', 'availability': 'https://schema.org/InStock'}}
