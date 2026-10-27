"""Investment: Off-Market-Angebote als anonyme Steckbriefe. Kennzahlen und Unterlagen erst nach Vertraulichkeitsvereinbarung.

Öffentlich: Region, Assetklasse, Größenordnung, Status, wenige Eckdaten. Gesperrte Kennzahlen erscheinen nur als Feldname.
Die Freigabe läuft über das Formular "Unterlagen anfordern" → CRM-Sheet → Prüfung → Vertraulichkeitsvereinbarung → Unterlagen.
"""
from pathlib import Path
import html, json
from paths import SITE, img
from ux_refinement import _form_attrs, _spam_trap, _noscript

E = html.escape
DATA = json.loads((Path(__file__).parent / 'offmarket.json').read_text(encoding='utf-8'))


def _card(o):
    facts = ''.join(f'<li>{E(x)}</li>' for x in o['eckdaten'])
    locked = ''.join(f'<li><span>{E(x)}</span><b aria-hidden="true">••••••</b></li>' for x in o['gesperrt'])
    return (f'<article class="om-card" data-asset="{E(o["assetklasse"], quote=True)}"><figure>'
            + img(o['bild'], '', '(max-width:760px) 88vw, 30vw', 'loading="lazy"')
            + f'<span class="om-status">{E(o["status"])}</span><span class="om-id">{E(o["id"])}</span></figure>'
            f'<div class="om-body"><small>{E(o["region"])}</small><h3>{E(o["assetklasse"])}</h3>'
            f'<p class="om-volume"><span>Volumen</span>{E(o["volumen"])}</p><ul class="om-facts">{facts}</ul>'
            f'<div class="om-locked"><p><span aria-hidden="true">🔒</span> Nach Vertraulichkeitsvereinbarung</p><ul>{locked}</ul></div>'
            f'<button class="button om-request" type="button" data-om-request="{E(o["id"] + " · " + o["assetklasse"] + " · " + o["region"], quote=True)}">'
            'Unterlagen anfordern <span aria-hidden="true">↗</span></button></div></article>')


PROPS = json.loads((Path(__file__).parent / 'property-collection.json').read_text(encoding='utf-8'))


def _property_card(d):
    """Öffentliche Immobilie im selben Kartenstil: echtes Foto, Preis, Eckdaten, Property Brief anfragen."""
    facts = ''.join(f'<li>{E(x[1])}</li>' for x in d['facts'][:3])
    price, per_m2 = (d['priceStr'].split(' · ') + [''])[:2]
    return (f'<article class="om-card om-public"><figure>'
            + img(d['localImage'], d['title'] + ', Visualisierung', '(max-width:760px) 88vw, 30vw', 'loading="lazy"')
            + '<span class="om-status">Verfügbar</span></figure>'
            f'<div class="om-body"><small>{E(d["location"])}</small><h3>{E(d["title"])}</h3>'
            f'<p class="om-volume"><span>Kaufpreis</span>{E(price)}</p><ul class="om-facts">{facts}</ul>'
            f'<p class="om-desc">{E(d["desc"])}</p>'
            + (f'<p class="om-per">{E(per_m2)}</p>' if per_m2 else '') +
            f'<button class="button" type="button" data-enquire="property-buy" data-object="{E(d["title"], quote=True)}">'
            'Property Brief anfragen <span aria-hidden="true">↗</span></button></div></article>')


STEPS = ('<ol class="om-steps"><li><b>Anfrage</b> Unterlagen zum Objekt anfordern</li><li><b>Prüfung</b> Ich melde mich innerhalb von 48 Stunden</li>'
         '<li><b>Vertraulichkeit</b> Sie unterzeichnen die Vereinbarung</li><li><b>Unterlagen</b> Exposé, Mieterliste, Kennzahlen</li></ol>')


def _carousel(key, label, context, cards, hidden=False):
    """Gleitendes Karussell (app.js: Geschwindigkeit, Pfeile, Zähler) mit den Karten im Steckbrief-Stil."""
    return (f'<div class="collection-panel om-carousel" data-collection-panel="{key}"{" hidden" if hidden else ""}><div class="collection-context"><span>{E(context)}</span>'
            f'<div class="collection-navigation"><button type="button" data-prev aria-label="Vorherige {label}-Objekte">←</button>'
            f'<span data-counter aria-live="polite">1 / {len(cards)}</span>'
            f'<button type="button" data-next aria-label="Nächste {label}-Objekte">→</button></div></div>'
            f'<div class="collection-viewport" tabindex="0" role="region" aria-roledescription="Karussell" aria-label="{label}-Angebote">'
            '<div class="collection-track">' + ''.join(cards) + '</div></div></div>')


def _sample():
    return ('<p class="om-sample">Konzeptansicht mit erfundenen Musterobjekten. Die echten Steckbriefe folgen nach Freigabe.</p>'
            if DATA.get('muster') else '')


def _om_carousel(hidden=False):
    return _carousel('investment', 'Investment', 'Off-Market · anonym', [_card(o) for o in DATA['objekte']], hidden)


def _property_carousel(hidden=False):
    return _carousel('property', 'Property', 'Öffentlich · mit Preis', [_property_card(d) for d in PROPS], hidden)


def offmarket():
    """Investment-Seite: Off-Market-Steckbriefe im Karussell."""
    return ('<section class="offmarket" id="collection"><div class="section-head"><h2>Off-Market-Angebote</h2>'
            '<p>Diese Objekte werden nicht öffentlich angeboten. Hier sehen Sie Region, Assetklasse und Größenordnung. '
            'Kennzahlen, Adresse und Unterlagen erhalten geprüfte Investoren nach einer Vertraulichkeitsvereinbarung.</p></div>'
            + _sample() + _om_carousel() + STEPS + dialog() + '</section>')


def properties():
    """Property-Seite: öffentliche Angebote im selben Stil, im Karussell."""
    return ('<section class="offmarket" id="collection"><div class="section-head"><h2>Wohnungen und Häuser im Angebot</h2>'
            '<p>Zu jeder Immobilie gibt es einen Property Brief mit Grundriss, Zahlen und Lage.</p></div>' + _property_carousel()
            + '<p class="om-note">Visualisierungen. Grundriss, Unterlagen und Besichtigungstermin erhalten Sie mit dem Property Brief.</p></section>')


def home_offers():
    """Startseite: Umschalter Investment (Off-Market) und Property (öffentlich), beide als gleitendes Karussell."""
    tabs = ('<div class="collection-toolbar"><div role="group" aria-label="Angebote auswählen">'
            f'<button type="button" data-collection-tab="investment" aria-pressed="true">Investment <span>{len(DATA["objekte"])}</span></button>'
            f'<button type="button" data-collection-tab="property" aria-pressed="false">Property <span>{len(PROPS)}</span></button></div></div>')
    return ('<section class="offmarket" id="collection"><div class="section-head"><h2>Aktuelle Mandate und Immobilien</h2>'
            '<p>Investment-Objekte zeigen wir nur anonym; Unterlagen gibt es nach einer Vertraulichkeitsvereinbarung. '
            'Wohnungen und Häuser sind öffentlich mit Preis und Eckdaten zu sehen.</p></div>' + tabs + _sample()
            + _om_carousel() + _property_carousel(hidden=True) + dialog() + '</section>')


def dialog():
    types = ['Privatinvestor', 'Family Office', 'Institutioneller Investor', 'Projektentwickler / Bauträger', 'Sonstiges']
    tickets = ['bis 5 Mio. €', '5–15 Mio. €', '15–30 Mio. €', 'über 30 Mio. €']
    opt = lambda xs: ''.join(f'<option>{E(x)}</option>' for x in xs)
    return ('<dialog class="om-dialog" id="om-dialog" aria-labelledby="om-title"><form ' + _form_attrs('om-form') + '>'
            '<button class="om-close" type="button" data-om-close aria-label="Schließen">×</button>'
            '<small>Unterlagen anfordern</small><h3 id="om-title">Zugang zu den Objektunterlagen</h3>'
            '<p class="om-object" id="om-object"></p><input type="hidden" name="Objekt" id="om-object-field">'
            '<div class="ux-form-grid">'
            '<label>Vollständiger Name *<input name="name" required autocomplete="name" maxlength="150"></label>'
            '<label>E-Mail-Adresse *<input name="email" type="email" required autocomplete="email" maxlength="200"></label>'
            '<label>Telefon (optional)<input name="phone" type="tel" autocomplete="tel" maxlength="60"></label>'
            '<label>Unternehmen (optional)<input name="company" autocomplete="organization" maxlength="180"></label>'
            f'<label>Investorentyp *<select name="Investorentyp" required><option value="">Bitte wählen</option>{opt(types)}</select></label>'
            f'<label>Ticketgröße (optional)<select name="Ticket"><option value="">Noch offen</option>{opt(tickets)}</select></label></div>'
            '<label class="om-nda"><input type="checkbox" name="NDA" required> Ich bin bereit, vor Erhalt der Unterlagen eine Vertraulichkeitsvereinbarung zu unterzeichnen. *</label>'
            + _spam_trap() +
            f'<p class="ux-privacy">Ihre Angaben werden vertraulich zur Prüfung Ihrer Anfrage verwendet. <a href="{E(SITE["privacy"])}" target="_blank" rel="noopener">Datenschutz</a></p>'
            '<p class="ux-form-error" id="om-error" role="alert"></p><button class="button" type="submit">Zugang anfragen ↗</button>'
            '<div id="om-result" role="status" tabindex="-1"></div>' + _noscript() + '</form></dialog>')
