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


def offmarket():
    objs = DATA['objekte']
    kinds = sorted({o['assetklasse'] for o in objs})
    chips = ('<div class="om-filter" role="group" aria-label="Nach Assetklasse filtern">'
             '<button type="button" aria-pressed="true" data-om-filter="">Alle</button>'
             + ''.join(f'<button type="button" aria-pressed="false" data-om-filter="{E(k, quote=True)}">{E(k)}</button>' for k in kinds) + '</div>')
    sample = ('<p class="om-sample">Konzeptansicht mit erfundenen Musterobjekten. Die echten Steckbriefe folgen nach Freigabe.</p>'
              if DATA.get('muster') else '')
    return ('<section class="offmarket" id="collection"><div class="section-head"><h2>Off-Market-Angebote</h2>'
            '<p>Diese Objekte werden nicht öffentlich angeboten. Hier sehen Sie Region, Assetklasse und Größenordnung. '
            'Kennzahlen, Adresse und Unterlagen erhalten geprüfte Investoren nach einer Vertraulichkeitsvereinbarung.</p></div>'
            + sample + chips + '<div class="om-grid">' + ''.join(_card(o) for o in objs) + '</div>'
            '<ol class="om-steps"><li><b>Anfrage</b> Unterlagen zum Objekt anfordern</li><li><b>Prüfung</b> Ich melde mich innerhalb von 48 Stunden</li>'
            '<li><b>Vertraulichkeit</b> Sie unterzeichnen die Vereinbarung</li><li><b>Unterlagen</b> Exposé, Mieterliste, Kennzahlen</li></ol>'
            + dialog() + '</section>')


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
