"""Projektanfrage, Kontaktbereich und Kontaktleiste.

Rekonstruiert aus dem dist-Stand (Original-Quelle lag nicht vor) und ergänzt um:
- method="post" (ohne JavaScript landen keine Daten mehr in der URL)
- Honeypot-Feld gegen Spam
- noscript-Hinweis mit E-Mail-Adresse
- Social-Icons nur für hinterlegte Profile
"""
import html
from paths import SITE, page, img

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
    'tiktok': '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.2 4.4 5 4.6"/>',
    'facebook': '<path d="M14 21v-8h3l.5-4H14V7c0-1 1-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>',
    'whatsapp': '<path d="M4 17a9 9 0 1 1 3 3l-5 2z"/><path d="M8 7c0 5 4 9 9 9l1-3-3-1-1 1c-2-1-3-2-3-3l1-1-2-3z"/>',
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M7 14h3M14 14h3"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 5 9 7 9-7"/>',
}


def icon(name):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'


def _form_attrs(form_id):
    # Kein action: Die Übermittlung läuft nur per ux.js (JSON an das CRM-Sheet). Ohne JavaScript
    # verhindert method="post", dass Personendaten in der URL landen; noscript nennt die E-Mail.
    return f'id="{form_id}" method="post" novalidate'


def _spam_trap():
    # Unsichtbares Köderfeld: Bots füllen es aus, Menschen sehen es nicht. Name ohne Autofill-Bedeutung.
    return '<div class="hp-field" aria-hidden="true"><label>Bitte leer lassen<input name="gf_hp" tabindex="-1" autocomplete="off"></label></div>'


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
    section_id = 'projektanfrage'  # Sprungziel #anfrage liegt auf dem umgebenden <details>
    title = f'{MEMO[active]} anfragen' if active else 'Ihr Vorhaben beschreiben'
    options = (('' if active else '<option value="" selected>Bereich wählen</option>')
               + ''.join(f'<option value="{key}"{" selected" if key == active else ""}>{label}</option>' for key, label in LABELS.items()))
    return (f'<section class="strategic-inquiry" id="{section_id}" data-inquiry-context="{active}">'
            # Überschrift und Einleitung stehen schon in der Zeile zum Aufklappen; hier nur für Screenreader
            '<div class="inquiry-intro sr-only">'
            f'<h2 id="inquiry-title">{title}</h2><p id="inquiry-lead">Sechs kurze Fragen. Das erste Gespräch ist kostenfrei.</p></div>'
            f'<div class="inquiry-card"><form {_form_attrs("strategic-form")} aria-labelledby="inquiry-title">'
            f'<label class="inquiry-context">Ihr Bereich<select name="Bereich" id="inquiry-context" required>{options}</select></label>'
            '<div class="inquiry-progress"><span id="inquiry-step-label" aria-live="polite">Schritt 1 von 6</span><span id="inquiry-percent" aria-hidden="true">17 %</span></div>'
            '<progress id="inquiry-progress" value="1" max="6" aria-label="Fortschritt Ihrer Projektanfrage">1 von 6</progress>'
            '<fieldset data-inquiry-step="1"><legend tabindex="-1"><span data-asset-legend>Asset-Klasse</span></legend>'
            '<p data-asset-question>Um welche Art von Immobilie handelt es sich bei der geplanten Transaktion?</p>'
            + _group('radio', 'Objektart', ASSETS, active) + '</fieldset>'
            '<fieldset data-inquiry-step="2" hidden><legend tabindex="-1">Ihr Anliegen</legend><p>Wobei darf GRENFORD Sie unterstützen?</p>'
            + _group('radio', 'Anliegen', INTENTS, active) + '</fieldset>'
            '<fieldset data-inquiry-step="3" hidden><legend tabindex="-1">Was ist Ihnen wichtig?</legend><p>Mehrfachauswahl möglich. Dieser Schritt ist optional.</p>'
            + _group('checkbox', 'Themen', TOPICS, active) + '</fieldset>'
            '<fieldset data-inquiry-step="4" hidden><legend tabindex="-1">Ihr Vorhaben</legend><p>Eine erste Einordnung reicht. Was noch offen ist, klären wir im Gespräch.</p>'
            '<div class="ux-form-grid"><label>Standort / Suchregion *<input name="Region" id="inquiry-region" autocomplete="address-level2" required maxlength="180" placeholder="z. B. Berlin und Brandenburg"></label>'
            '<label><span data-budget-label>Budget / Preisrahmen (optional)</span><input name="Rahmen" id="inquiry-budget" maxlength="140" placeholder="z. B. bis 2 Mio. € oder noch offen"></label>'
            '<label>Zeitrahmen (optional)<select name="Zeitrahmen" id="inquiry-timing"><option value="">Noch offen</option><option>So bald wie möglich</option><option>In 3–6 Monaten</option><option>In 6–12 Monaten</option><option>Langfristige Planung</option></select></label>'
            '<label>Fläche / Größe (optional)<input name="Groesse" id="inquiry-size" maxlength="100" placeholder="z. B. 120 m² oder 25 Zimmer"></label>'
            '<label class="ux-full">Was sollten wir noch wissen? (optional)<textarea name="Beschreibung" id="inquiry-notes" rows="3" maxlength="2000" placeholder="Ihre Ziele, Wünsche oder eine konkrete Immobilie"></textarea></label></div></fieldset>'
            '<fieldset data-inquiry-step="5" hidden><legend tabindex="-1">Ihre Kontaktdaten</legend><p>Damit ich mich bei Ihnen melden kann.</p>'
            '<div class="ux-form-grid"><label>Vollständiger Name *<input name="Name" id="inquiry-name" required autocomplete="name" maxlength="150"></label>'
            '<label>E-Mail-Adresse *<input name="Email" id="inquiry-email" type="email" required autocomplete="email" maxlength="200"></label>'
            '<label>Telefonnummer (optional)<input name="Telefon" id="inquiry-phone" type="tel" autocomplete="tel" maxlength="60"></label>'
            '<label>Unternehmen (optional)<input name="Unternehmen" id="inquiry-company" autocomplete="organization" maxlength="180"></label></div></fieldset>'
            '<fieldset data-inquiry-step="6" hidden><legend tabindex="-1">Prüfen und absenden</legend><p>Bitte prüfen Sie Ihre Angaben. Über „Zurück“ können Sie alles bearbeiten.</p>'
            '<dl id="inquiry-review"></dl><label>Bevorzugter Kontakt (optional)<select name="Kontaktweg" id="inquiry-channel"><option>E-Mail</option><option>Telefon, sofern angegeben</option><option>Videogespräch abstimmen</option></select></label>'
            f'<p class="ux-privacy">Ihre Angaben dienen der Bearbeitung Ihrer Anfrage. Das Erstgespräch ist kostenfrei; ein Mandat wird gesondert vereinbart. <a href="{E(SITE["privacy"])}" target="_blank" rel="noopener">Datenschutz</a></p></fieldset>'
            + _spam_trap() +
            '<p class="ux-form-error" id="inquiry-error" role="alert"></p>'
            '<div class="inquiry-actions"><button type="button" class="text-button" id="inquiry-back" hidden>← Zurück</button><button type="submit" class="button" id="inquiry-next">Weiter →</button></div>'
            '<p class="ux-required">* Pflichtangabe. Ihre Eingaben bleiben beim Zurückgehen erhalten.</p>'
            '<div id="inquiry-result" role="status" tabindex="-1"></div>' + _noscript() + '</form></div></section>')


def socials():
    # Profile ohne hinterlegte Adresse (site.json → socials.url) erscheinen als Icon ohne Link, bis die Adresse eingetragen ist.
    out = ''.join(f'<a href="{E(s["url"])}" target="_blank" rel="noopener noreferrer" aria-label="{E(s["label"])}">{icon(s["icon"])}</a>' if s.get('url')
                  else f'<span class="social-pending" title="{E(s["label"])}: Profil folgt">{icon(s["icon"])}</span>' for s in SITE['socials'])
    out += f'<a href="{E(SITE["whatsapp"])}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{icon("whatsapp")}</a>'
    return f'<div class="social-links" role="group" aria-label="GRENFORD online">{out}</div>'



# Lageskizze des Büros (eigene Zeichnung, kein Kartendienst): lädt ohne Google und ohne Lizenzfragen.
MAP_SKETCH = (
    '<svg class="ux-map-sketch" viewBox="0 0 600 360" role="img" aria-label="Lageskizze: GRENFORD am Kurfürstendamm 96, westlich des Adenauerplatzes">'
    '<rect width="600" height="360" class="m-bg"/>'
    '<g class="m-blocks">'
    + ''.join(f'<path d="M{x} 0 L{x - 40} 360"/>' for x in (70, 170, 280, 390, 470, 580))
    + ''.join(f'<path d="M0 {y} L600 {y - 70}"/>' for y in (70, 330))
    + '</g>'
    '<path class="m-main" d="M-10 262 L610 150"/>'
    '<circle class="m-square" cx="468" cy="178" r="30"/>'
    '<path class="m-blocks" d="M468 120 L468 236 M410 178 L526 178"/>'
    '<text class="m-label" x="30" y="240" transform="rotate(-10.2 30 240)">KURFÜRSTENDAMM</text>'
    '<text class="m-label m-small" x="440" y="238">ADENAUERPLATZ</text>'
    '<text class="m-label m-small" x="440" y="258">U7</text>'
    '<text class="m-label m-small" x="18" y="320">← HALENSEE</text>'
    '<text class="m-label m-small" x="380" y="36">CHARLOTTENBURG ↗</text>'
    '<g class="m-pin" transform="translate(300 220)"><circle r="46" class="m-halo"/><circle r="24"/>'
    '<text y="8" text-anchor="middle">G</text></g>'
    '<text class="m-label m-office" x="300" y="300" text-anchor="middle">GRENFORD · KURFÜRSTENDAMM 96</text>'
    '</svg>')


def contact(subject=None, company=False, lead=None):
    """Kontakt: auf jeder Seite derselbe Block. Links Person und direkte Wege samt Lageskizze, rechts die kurze Nachricht."""
    a = SITE['address']
    subjects = [('general', 'Allgemeine Anfrage'), ('investment', 'Investment Memo anfragen'), ('property', 'Property Brief anfragen'), ('renovation', 'Renovation Memo anfragen')]
    options = ''.join(f'<option value="{v}"{" selected" if v == subject else ""}>{label}</option>' for v, label in subjects)
    firm = ('<label class="ux-full">Unternehmen (optional)<input name="company" id="contact-company" autocomplete="organization" maxlength="180"></label>'
            if company else '')
    form = (f'<form {_form_attrs("quick-contact")} aria-label="Kurze Nachricht"><div class="ux-form-grid">'
            '<label>Vollständiger Name *<input name="name" id="contact-name" required autocomplete="name" maxlength="150"></label>'
            '<label>E-Mail-Adresse *<input name="email" id="contact-email" type="email" required autocomplete="email" maxlength="200"></label>'
            '<label>Telefonnummer (optional)<input name="phone" id="contact-phone" type="tel" autocomplete="tel" maxlength="60"></label>'
            f'<label>Betreff<select name="subject" id="contact-subject">{options}</select></label>' + firm +
            '<label class="ux-full">Nachricht *<textarea name="message" id="contact-message" required rows="5" maxlength="4000"></textarea></label></div>'
            + _spam_trap() +
            f'<p class="ux-privacy">Ihre Daten werden vertraulich zur Bearbeitung Ihrer Anfrage verarbeitet. <a href="{E(SITE["privacy"])}" target="_blank" rel="noopener">Datenschutz</a></p>'
            '<p class="ux-form-error" id="contact-error" role="alert"></p><button class="button" type="submit">Nachricht senden ↗</button>'
            '<div id="contact-result" role="status" tabindex="-1"></div>' + _noscript() + '</form>')
    mail = E(SITE['email'])
    lead = lead or 'Am schnellsten per E-Mail oder WhatsApp. Wenn Sie lieber sprechen, buchen Sie direkt einen Termin.'
    channels = (f'<a href="mailto:{mail}"><small>E-Mail</small><strong>{mail}</strong><span aria-hidden="true">↗</span></a>'
                f'<a href="tel:{E(SITE["phoneHref"])}"><small>Telefon</small><strong>{E(SITE["phone"])}</strong><span aria-hidden="true">↗</span></a>'
                f'<a href="{E(SITE["whatsapp"])}" target="_blank" rel="noopener noreferrer"><small>WhatsApp</small><strong>Direktnachricht</strong><span aria-hidden="true">↗</span></a>'
                f'<a href="{E(SITE["calendar"])}" target="_blank" rel="noopener noreferrer"><small>Termin</small><strong>30 Minuten, online buchbar</strong><span aria-hidden="true">↗</span></a>')
    return ('<section class="ux-contact contact" id="kontakt"><div class="contact-person">'
            '<div class="contact-head">' + img('marco-kaimann.jpg', 'Marco Kaimann', '120px', 'loading="lazy" class="contact-portrait"') +
            '<div><h2>So erreichen Sie mich</h2></div></div>'
            f'<p class="contact-lead">{E(lead)}</p><nav class="contact-channels" aria-label="Direkte Kontaktwege">{channels}</nav>'
            '<figure class="ux-map">' + MAP_SKETCH + f'<figcaption><span>{E(a["street"])}, {E(a["zip"])} {E(a["city"])} · Nähe Adenauerplatz (U7)</span>'
            f'<a class="small" href="https://www.google.com/maps/search/?api=1&amp;query={SITE["mapsQuery"]}" target="_blank" rel="noopener noreferrer">In Google Maps öffnen ↗</a>'
            '<button type="button" class="text-button" data-load-map>Interaktive Karte laden</button></figcaption>'
            '<div data-map-host></div><small class="ux-map-note">Lageskizze, nicht maßstabsgetreu. Die Google-Karte wird erst nach Ihrem Klick geladen.</small></figure>'
            + socials() + '</div>'
            f'<div class="contact-card"><h3>Kurze Nachricht</h3><p>Ich lese jede Nachricht selbst und antworte innerhalb von 48 Stunden.</p>{form}</div></section>')


def rail():
    # Läuft auf jeder Seite dauerhaft mit: Termin buchen (Akzentfarbe) und WhatsApp (WhatsApp-Grün).
    return ('<aside class="ux-contact-rail" aria-label="Direktkontakt">'
            f'<a class="rail-termin" href="{E(SITE["calendar"])}" target="_blank" rel="noopener noreferrer" aria-label="Termin buchen">{icon("calendar")}<span aria-hidden="true">Termin buchen</span></a>'
            f'<a class="rail-whatsapp" href="{E(SITE["whatsapp"])}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{icon("whatsapp")}<span aria-hidden="true">WhatsApp</span></a></aside>')
