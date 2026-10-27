from pathlib import Path
import html, json
from paths import img

ROOT = Path(__file__).parent
I = json.loads((ROOT / 'investment-collection.json').read_text(encoding='utf-8'))
P = json.loads((ROOT / 'property-collection.json').read_text(encoding='utf-8'))
E = html.escape

# Überschriften je Ansicht: Startseite zeigt beide Collections, Unterseiten nur ihre eigene.
HEADINGS = {
    None: ('AUSGEWÄHLTE IMMOBILIEN & MANDATE', 'Räume mit<br><em>Perspektive.</em>',
           'Ausgewählte Investmentmandate und private Immobilien. Entdecken Sie passende Möglichkeiten – und sprechen Sie mit mir über die Details.'),
    'investment': ('GRENFORD INVESTMENT COLLECTION', 'Ausgewählte Mandate.',
                   'Investmentthemen und ausgewählte Mandate. Weitere Informationen erhalten Sie im persönlichen Gespräch.'),
    'property': ('GRENFORD PROPERTY COLLECTION', 'Ausgewählte Immobilien.',
                 'Entdecken Sie unsere ausgewählten Immobilien und fragen Sie den passenden Property Brief an.'),
}
CONTEXT = {'investment': 'INVESTMENT / AUSGEWÄHLTE MANDATE', 'property': 'PROPERTY / BERLIN-CHARLOTTENBURG'}


def _mandate(i, d):
    return (f'<article class="mandate-card"><div class="mandate-top"><span>GRENFORD INVESTMENT</span><span>{i:02d}</span></div>'
            f'<span class="mandate-region">{E(d["region"])}</span><h3>{E(d["title"])}</h3><p>{E(d["desc"])}</p>'
            f'<span class="mandate-status"><i></i>{E(d["status"])}</span>'
            f'<button class="collection-enquire" type="button" data-enquire="investment-interest" data-object="{E(d["title"] + " · " + d["region"], quote=True)}">'
            f'Investment Memo anfragen <span aria-hidden="true">↗</span></button></article>')


def _property(i, d):
    picture = img(d['localImage'], d['title'] + ' – Immobilienvisualisierung', '(max-width:760px) 88vw, 45vw', 'loading="lazy"')
    facts = ''.join('<span>' + E(f[1]) + '</span>' for f in d['facts'])
    return (f'<article class="property-card"><figure>{picture}<span>GRENFORD PROPERTY / {i:02d}</span></figure>'
            f'<div class="property-card-body"><span class="eyebrow">{E(d["location"])}</span><h3>{E(d["title"])}</h3>'
            f'<div class="property-facts">{facts}</div><p>{E(d["desc"])}</p>'
            f'<strong class="property-price">{E(d["priceStr"].split(" · ")[0])}</strong>'
            f'<button class="collection-enquire" type="button" data-enquire="property-buy" data-object="{E(d["title"], quote=True)}">'
            f'Property Brief anfragen <span aria-hidden="true">↗</span></button></div></article>')


def collection(selected=None):
    eyebrow, title, desc = HEADINGS[selected]
    h = (f'<section class="perspective-collection" id="collection"><div class="collection-heading"><div>'
         f'<span class="eyebrow">{eyebrow}</span><h2>{title}</h2></div><p>{desc}</p></div>')
    if not selected:
        h += ('<div class="collection-toolbar"><div role="group" aria-label="Collection auswählen">'
              f'<button type="button" data-collection-tab="investment" aria-pressed="true">Investment <span>{len(I):02d}</span></button>'
              f'<button type="button" data-collection-tab="property" aria-pressed="false">Property <span>{len(P):02d}</span></button>'
              '</div><a class="collection-shortcut" href="#kontakt">Ihr Vorhaben besprechen ↗</a></div>')
    for key, items, card in (('investment', I, _mandate), ('property', P, _property)):
        if selected and key != selected:
            continue
        label = key.capitalize()
        hidden = ' hidden' if key == 'property' and not selected else ''
        h += (f'<div class="collection-panel" data-collection-panel="{key}"{hidden}><div class="collection-context"><span>{CONTEXT[key]}</span>'
              f'<div class="collection-navigation"><button type="button" data-prev aria-label="Vorherige {label}-Objekte">←</button>'
              f'<span data-counter aria-live="polite">1 / {len(items)}</span>'
              f'<button type="button" data-next aria-label="Nächste {label}-Objekte">→</button></div></div>'
              f'<div class="collection-viewport" tabindex="0" role="region" aria-roledescription="Karussell" aria-label="{label} Collection">'
              '<div class="collection-track">' + ''.join(card(i, d) for i, d in enumerate(items, 1)) + '</div></div></div>')
    return h + '<p class="collection-note">Verfügbarkeit, Mandatsstatus und vollständige Objektunterlagen erhalten Sie im persönlichen Gespräch.</p></section>'
