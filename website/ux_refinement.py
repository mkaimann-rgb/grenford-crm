"""Projektanfrage, Kontaktbereich und Kontaktleiste.

Rekonstruiert aus dem dist-Stand (Original-Quelle lag nicht vor) und ergänzt um:
- method="post" (ohne JavaScript landen keine Daten mehr in der URL)
- Honeypot-Feld und Zeitstempel gegen Spam
- noscript-Hinweis mit E-Mail-Adresse
- Social-Icons nur für hinterlegte Profile
"""
import html
from paths import SITE

E = html.escape
LABELS = {'investment': 'Investment', 'property': 'Property', 'projects': 'Projects'}
MEMO = {'investment': 'Investment Memo', 'property': 'Property Brief', 'projects': 'Renovation Memo'}
ASSETS = {
    'investment': ['Boutique-Hotel bis 50 Zimmer', 'Zinshaus / Mehrfamilienhaus', 'Grundstück', 'Kleine Logistikhalle', 'Büro', 'Serviced Apartments', 'Senior Living', 'Sonstiges'],
    'property': ['Wohnung', 'Einfamilienhaus', 'Reihenhaus', 'Kleines Grundstück', 'Gewerbeeinheit bis 100 m²', 'Sonstiges'],
    'projects': ['Wohnung', 'Haus', 'Bad', 'Neubau-Innenausbau', 'Ferienimmobilie', 'Sonstiges'],
}
INTENTS = {
    'investment': ['Investment Memo / Objektinformationen', 'Immobilie / Portfolio verkaufen', 'Suchprofil im Kundenauftrag'],
    'property': ['Immobilie verkaufen', 'Kaufinteresse / Property Brief'],
    'projects': ['Sanierung / Innenumbau planen', 'Bauangebote vergleichen'],
}
TOPICS = {
    'investment': ['Off-Market', 'Globalverkauf', 'Gezielte Objektsuche', 'Ertrag & Potenziale', 'Noch offen'],
    'property': ['Positionierung & Preis', 'Vermarktung', 'Besichtigung', 'Kaufentscheidung', 'Noch offen'],
    'projects': ['Wünsche & Ausstattung', 'Originalangebote einholen', 'Leistungen & Kosten vergleichen', 'Zwei Baupartner kennenlernen', 'Noch offen'],
}
ICONS = {
    'linkedin': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.1M11 17v-7h3v1c2-2 4-1 4 2v4"/>',
    'instagram': '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    'facebook': '<path d="M14 21v-8h3l.5-4H14V7c0-1 1-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>',
    'whatsapp': '<path d="M4 17a9 9 0 1 1 3 3l-5 2z"/><path d="M8 7c0 5 4 9 9 9l1-3-3-1-1 1c-2-1-3-2-3-3l1-1-2-3z"/>',
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M7 14h3M14 14h3"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 5 9 7 9-7"/>',
}


def icon(name):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'


def _form_attrs(form_id):
    action = f' action="{E(SITE["formEndpoint"], quote=True)}"' if SITE['formEndpoint'] else ''
    return f'id="{form_id}" method="post"{action} novalidate'


def _spam_trap():
    return ('<div class="hp-field" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>'
            '<input type="hidden" name="started" value="">')


def _noscript():
    mail = E(SITE['email'])
    return f'<noscript><p>Das Formular benötigt JavaScript. Schreiben Sie uns alternativ direkt an <a href="mailto:{mail}">{mail}</a>.</p></noscript>'


def _group(kind, name, data, active):
    attr = {'Objektart': 'assets', 'Anliegen': 'intents', 'Themen': 'topics'}[name]
    out = ''
    for context, values in data.items():
        hidden = '' if context == active else ' hidden'
        inputs = ''.join(f'<label><input type="{kind}" name="{name}-{context}" value="{E(v, quote=True)}"><span>{E(v)}</span></label>' for v in values)
        out += f'<div data-context-{attr}="{context}"{hidden}><div class="inquiry-options">{inputs}</div></div>'
    return out


def inquiry(k):
    active = k if k in LABELS else ''
    section_id = 'anfrage' if active else 'projektanfrage'
    title = f'{MEMO[active]} anfragen.' if active else 'Ihr Vorhaben anfragen.'
    options = (f'<option value=""{" selected" if not active else ""}>Bereich wählen</option>'
               + ''.join(f'<option value="{key}"{" selected" if key == active else ""}>{label}</option>' for key, label in LABELS.items()))
    return (f'<section class="strategic-inquiry" id="{section_id}" data-inquiry-context="{active}">'
            '<div class="inquiry-intro"><span class="eyebrow">STRATEGISCHE PROJEKTANFRAGE</span>'
            f'<h2 id="inquiry-title">{title}</h2><p id="inquiry-lead">In sechs Schritten zu Ihrem Vorhaben. Das strategische Erstgespräch ist kostenfrei.</p>'
            '<a class="text-link" href="#kontakt">Nur eine kurze Frage? Direkt zum Kontakt ↓</a></div>'
            f'<div class="inquiry-card"><form {_form_attrs("strategic-form")} aria-labelledby="inquiry-title">'
            f'<label class="inquiry-context">Ihr Bereich<select name="Bereich" id="inquiry-context" required>{options}</select></label>'
            '<div class="inquiry-progress"><span id="inquiry-step-label" aria-live="polite">Schritt 1 von 6</span><span id="inquiry-percent" aria-hidden="true">17 %</span></div>'
            '<progress id="inquiry-progress" value="1" max="6" aria-label="Fortschritt Ihrer Projektanfrage">1 von 6</progress>'
            '<fieldset data-inquiry-step="1"><legend tabindex="-1">01 / <span data-asset-legend>Asset-Klasse</span></legend>'
            '<p data-asset-question>Um welche Art von Immobilie handelt es sich bei der geplanten Transaktion?</p>'
            + _group('radio', 'Objektart', ASSETS, active) + '</fieldset>'
            '<fieldset data-inquiry-step="2" hidden><legend tabindex="-1">02 / Ihr Anliegen</legend><p>Wobei darf GRENFORD Sie unterstützen?</p>'
            + _group('radio', 'Anliegen', INTENTS, active) + '</fieldset>'
            '<fieldset data-inquiry-step="3" hidden><legend tabindex="-1">03 / Was ist Ihnen wichtig?</legend><p>Mehrfachauswahl möglich. Dieser Schritt ist optional.</p>'
            + _group('checkbox', 'Themen', TOPICS, active) + '</fieldset>'
            '<fieldset data-inquiry-step="4" hidden><legend tabindex="-1">04 / Ihr Vorhaben</legend><p>Eine erste Einordnung reicht. Was noch offen ist, klären wir im Gespräch.</p>'
            '<div class="ux-form-grid"><label>Standort / Suchregion *<input name="Region" id="inquiry-region" autocomplete="address-level2" required maxlength="180" placeholder="z. B. Berlin und Brandenburg"></label>'
            '<label><span data-budget-label>Budget / Preisrahmen (optional)</span><input name="Rahmen" id="inquiry-budget" maxlength="140" placeholder="z. B. bis 2 Mio. € oder noch offen"></label>'
            '<label>Zeitrahmen (optional)<select name="Zeitrahmen" id="inquiry-timing"><option value="">Noch offen</option><option>So bald wie möglich</option><option>In 3–6 Monaten</option><option>In 6–12 Monaten</option><option>Langfristige Planung</option></select></label>'
            '<label>Fläche / Größe (optional)<input name="Groesse" id="inquiry-size" maxlength="100" placeholder="z. B. 120 m² oder 25 Zimmer"></label>'
            '<label class="ux-full">Was sollten wir noch wissen? (optional)<textarea name="Beschreibung" id="inquiry-notes" rows="3" maxlength="2000" placeholder="Ihre Ziele, Wünsche oder eine konkrete Immobilie"></textarea></label></div></fieldset>'
            '<fieldset data-inquiry-step="5" hidden><legend tabindex="-1">05 / Ihre Kontaktdaten</legend><p>Damit ich persönlich auf Ihre Anfrage zurückkommen kann.</p>'
            '<div class="ux-form-grid"><label>Vollständiger Name *<input name="Name" id="inquiry-name" required autocomplete="name" maxlength="150"></label>'
            '<label>E-Mail-Adresse *<input name="Email" id="inquiry-email" type="email" required autocomplete="email" maxlength="200"></label>'
            '<label>Telefonnummer (optional)<input name="Telefon" id="inquiry-phone" type="tel" autocomplete="tel" maxlength="60"></label>'
            '<label>Unternehmen (optional)<input name="Unternehmen" id="inquiry-company" autocomplete="organization" maxlength="180"></label></div></fieldset>'
            '<fieldset data-inquiry-step="6" hidden><legend tabindex="-1">06 / Prüfen & anfragen</legend><p>Bitte prüfen Sie Ihre Angaben. Über „Zurück“ können Sie alles bearbeiten.</p>'
            '<dl id="inquiry-review"></dl><label>Bevorzugter Kontakt (optional)<select name="Kontaktweg" id="inquiry-channel"><option>E-Mail</option><option>Telefon, sofern angegeben</option><option>Videogespräch abstimmen</option></select></label>'
            f'<p class="ux-privacy">Ihre Angaben dienen der Bearbeitung Ihrer Anfrage. Das Erstgespräch ist kostenfrei; ein Mandat wird gesondert vereinbart. <a href="{E(SITE["privacy"])}" target="_blank" rel="noopener">Datenschutz</a></p></fieldset>'
            + _spam_trap() +
            '<p class="ux-form-error" id="inquiry-error" role="alert"></p>'
            '<div class="inquiry-actions"><button type="button" class="text-button" id="inquiry-back" hidden>← Zurück</button><button type="submit" class="button" id="inquiry-next">Weiter →</button></div>'
            '<p class="ux-required">* Pflichtangabe. Ihre Eingaben bleiben beim Zurückgehen erhalten.</p>'
            '<div id="inquiry-result" role="status" tabindex="-1"></div>' + _noscript() + '</form></div></section>')


def socials():
    links = [s for s in SITE['socials'] if s.get('url')]
    out = ''.join(f'<a href="{E(s["url"])}" target="_blank" rel="noopener noreferrer" aria-label="{E(s["label"])}">{icon(s["icon"])}</a>' for s in links)
    out += f'<a href="{E(SITE["whatsapp"])}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{icon("whatsapp")}</a>'
    return f'<div class="social-links" role="group" aria-label="GRENFORD online">{out}</div>'


def contact(subject=None, collapsible=False):
    a = SITE['address']
    subjects = [('general', 'Allgemeine Anfrage'), ('investment', 'Investment Memo anfragen'), ('property', 'Property Brief anfragen'), ('renovation', 'Renovation Memo anfragen')]
    options = ''.join(f'<option value="{v}"{" selected" if v == subject else ""}>{label}</option>' for v, label in subjects)
    form = (f'<p>Für ein konkretes Vorhaben können Sie auch die <a href="#anfrage">Projektanfrage in sechs Schritten</a> nutzen.</p>'
            f'<form {_form_attrs("quick-contact")} aria-label="Kurze Nachricht"><div class="ux-form-grid">'
            '<label>Vollständiger Name *<input name="name" id="contact-name" required autocomplete="name" maxlength="150"></label>'
            '<label>E-Mail-Adresse *<input name="email" id="contact-email" type="email" required autocomplete="email" maxlength="200"></label>'
            '<label>Telefonnummer (optional)<input name="phone" id="contact-phone" type="tel" autocomplete="tel" maxlength="60"></label>'
            f'<label>Betreff<select name="subject" id="contact-subject">{options}</select></label>'
            '<label class="ux-full">Nachricht *<textarea name="message" id="contact-message" required rows="4" maxlength="4000"></textarea></label></div>'
            + _spam_trap() +
            f'<p class="ux-privacy">Ihre Daten werden vertraulich zur Bearbeitung Ihrer Anfrage verarbeitet. <a href="{E(SITE["privacy"])}" target="_blank" rel="noopener">Datenschutz</a></p>'
            '<p class="ux-form-error" id="contact-error" role="alert"></p><button class="button" type="submit">Nachricht senden ↗</button>'
            '<div id="contact-result" role="status" tabindex="-1"></div>' + _noscript() + '</form>')
    if collapsible:
        form_block = ('<details class="ux-contact-form quick-message"><summary>Eine Nachricht schreiben <span aria-hidden="true">↗</span></summary>'
                      f'<div class="quick-message-content"><h3>Eine kurze Nachricht.</h3>{form}</div></details>')
    else:
        form_block = f'<div class="ux-contact-form"><h3>Eine kurze Nachricht.</h3>{form}</div>'
    mail = E(SITE['email'])
    return ('<section class="ux-contact" id="kontakt"><div class="ux-contact-head"><span class="eyebrow">KONTAKT / GRENFORD BERLIN</span>'
            '<h2>Nehmen Sie<br><span>Kontakt auf.</span></h2><p>Besprechen Sie Ihre Immobilie, Ihre Transaktion oder Ihr Sanierungsvorhaben mit mir.</p>'
            '<strong>Strategisch. Diskret. Professionell.</strong></div><div class="ux-contact-grid"><div class="ux-contact-direct"><h3>Ihr direkter Draht.</h3>'
            f'<a class="ux-email" href="mailto:{mail}">{mail} <span aria-hidden="true">↗</span></a><a href="tel:{E(SITE["phoneHref"])}">{E(SITE["phone"])}</a>'
            f'<p><span class="eyebrow">BÜRO</span><br>{E(a["street"])}<br>{E(a["zip"])} {E(a["city"])}</p>'
            f'<div class="ux-contact-links"><a href="{E(SITE["calendar"])}" target="_blank" rel="noopener noreferrer">{icon("calendar")}<span><b>Termin buchen ↗</b><small>Google Kalender · 30 Minuten</small></span></a>'
            f'<a href="{E(SITE["whatsapp"])}" target="_blank" rel="noopener noreferrer">{icon("whatsapp")}<span><b>WhatsApp ↗</b><small>Direktnachricht</small></span></a></div>'
            + socials() +
            '<details class="ux-map"><summary>Büro auf der Karte ansehen <span aria-hidden="true">＋</span></summary><p>Die Karte wird erst nach Ihrem Klick von Google geladen.</p>'
            '<button type="button" class="text-button" data-load-map>Google-Karte laden ↗</button><div data-map-host></div>'
            f'<a class="small" href="https://www.google.com/maps/search/?api=1&amp;query={SITE["mapsQuery"]}" target="_blank" rel="noopener noreferrer">In Google Maps öffnen ↗</a></details></div>'
            + form_block + '</div></section>')


def rail():
    return ('<aside class="ux-contact-rail" aria-label="Direktkontakt">'
            f'<a href="#kontakt" aria-label="Kontakt">{icon("mail")}<span aria-hidden="true">Kontakt</span></a>'
            f'<a href="{E(SITE["whatsapp"])}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{icon("whatsapp")}<span aria-hidden="true">WhatsApp</span></a></aside>')
