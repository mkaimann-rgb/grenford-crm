"""Rechner auf der Wertermittlungsseite: Wohnungswert (Property), Sanierungskosten, Fix & Flip.

Gerechnet wird nur im Browser (static/js/calc.js); es werden keine Daten übertragen.
Alle Annahmen stehen hier und sind auf der Seite sichtbar und änderbar. STATUS 'entwurf': nur im Vorschau-Build,
bis Grundpreis und Kostenansätze geprüft sind (Grundpreis am Marktbericht, Kostenansätze mit eigenen Angebotsdaten).
"""
import html, json

E = html.escape
STATUS = 'entwurf'
SHOW = False  # build.py setzt True im Vorschau-Build

# Grundpreis Eigentumswohnungen Berlin (Mittelwert 2025, Gutachterausschuss; Recherchestand 04.11.2026, am Original prüfen)
BASE = {'value': 5511, 'label': 'Mittlerer Kaufpreis Eigentumswohnungen Berlin 2025',
        'source': 'Gutachterausschuss für Grundstückswerte in Berlin, Immobilienmarktbericht 2025/2026',
        'url': 'https://www.berlin.de/gutachterausschuss/_assets/amarktinformationen/amarktanalyse/04-03-010-2500.pdf'}

# GRENFORD-Annahmen (Zu- und Abschläge in Prozent auf den Grundpreis)
LAGE = [('einfach', -20), ('mittel', 0), ('gut', 15), ('sehr gut', 35)]
ZUSTAND = [('sanierungsbedürftig', -20), ('gepflegt', 0), ('modernisiert', 10), ('neuwertig', 25)]
EXTRAS = [('balkon', 'Balkon, Loggia oder Terrasse', 3), ('aufzug', 'Aufzug', 3), ('stellplatz', 'Stellplatz oder Garage', 2)]
SPREAD = 10  # Spanne ± Prozent

# Kostenansätze Sanierung (von, bis) in Euro; je m² Wohnfläche oder je Stück. Annahmen, mit eigenen Angebotsdaten abgleichen.
PER_M2 = [('maler', 'Malerarbeiten', 25, 45), ('boeden', 'Böden', 60, 120), ('elektro', 'Elektrik erneuern', 90, 150), ('heizung', 'Heizkörper und Leitungen', 60, 110)]
PER_ITEM = [('bad', 'Bäder komplett', 18000, 35000, 1), ('kueche', 'Küche', 8000, 25000, 0), ('fenster', 'Fenster', 900, 1500, 0), ('tueren', 'Innentüren', 600, 1200, 0)]
STANDARD = [('einfach', 0.85), ('mittel', 1.0), ('gehoben', 1.35)]
PLANUNG = (10, 15)  # Planung, Bauleitung, Nebenkosten in Prozent
PUFFER = 10

# Fix & Flip: Beispielwerte, frei änderbar
FLIP = [('kauf', 'Kaufpreis', 300000, '€', 1000), ('nk', 'Kaufnebenkosten', 11.5, '%', 0.1), ('san', 'Sanierungskosten', 60000, '€', 1000),
        ('monate', 'Haltedauer bis zum Verkauf', 9, 'Monate', 1), ('ek', 'Eigenkapitalanteil', 30, '%', 1), ('zins', 'Zinssatz', 4.5, '% p. a.', 0.1),
        ('laufend', 'Laufende Kosten (Hausgeld, Grundsteuer, Versicherung)', 350, '€ je Monat', 10), ('vk', 'Erwarteter Verkaufspreis', 450000, '€', 1000),
        ('vkk', 'Verkaufskosten (Provision, Sonstiges)', 3.57, '%', 0.01)]


def _num(id_, label, value, unit, step, min_='0'):
    return (f'<label class="calc-field" for="{id_}"><span>{E(label)}</span><span class="calc-input"><input id="{id_}" name="{id_}" type="number" inputmode="decimal" '
            f'min="{min_}" step="{step}" value="{value}"><em>{E(unit)}</em></span></label>')


def _select(id_, label, opts, selected):
    o = ''.join(f'<option value="{v}"{" selected" if n == selected else ""}>{E(n)}</option>' for n, v in opts)
    return f'<label class="calc-field" for="{id_}"><span>{E(label)}</span><select id="{id_}" name="{id_}">{o}</select></label>'


def _fmt(n):
    return f'{n:,.0f}'.replace(',', '.')


def wohnwert():
    lage = [(f'{n} ({"+" if p > 0 else ""}{p} %)' if p else n, p) for n, p in LAGE]
    zust = [(f'{n} ({"+" if p > 0 else ""}{p} %)' if p else n, p) for n, p in ZUSTAND]
    extras = ''.join(f'<label class="calc-check"><input type="checkbox" name="x-{k}" data-pct="{p}"> {E(t)} <em>+{p} %</em></label>' for k, t, p in EXTRAS)
    return (f'<form class="calc" data-calc="wohnwert" method="post" aria-labelledby="calc-ww-t"><div class="calc-inputs">'
            '<h3 id="calc-ww-t">Wohnungswert in Berlin</h3>'
            + _num('ww-flaeche', 'Wohnfläche', 75, 'm²', 1, '10')
            + _select('ww-lage', 'Lage innerhalb Berlins', lage, 'mittel')
            + _select('ww-zustand', 'Zustand', zust, 'gepflegt')
            + f'<fieldset class="calc-checks"><legend>Ausstattung</legend>{extras}</fieldset>'
            + _num('ww-basis', 'Grundpreis je m²', BASE['value'], '€/m²', 10, '500')
            + f'<p class="calc-src">Grundpreis: {E(BASE["label"])}. Quelle: <a href="{E(BASE["url"], quote=True)}" target="_blank" rel="noopener">{E(BASE["source"])} ↗</a>. '
              'Sie können ihn überschreiben, etwa mit einem Wert aus dem Marktbericht für Ihren Bezirk.</p></div>'
            '<div class="calc-out" aria-live="polite"><p class="calc-out-l">Orientierungswert</p><p class="calc-out-v" data-out="range">–</p>'
            '<p class="calc-out-s" data-out="perm2"></p><dl class="calc-steps" data-out="steps"></dl>'
            '<p class="calc-note">Orientierung, keine Wertermittlung. Lage innerhalb eines Bezirks, Grundriss, Stockwerk, Energiekennwerte, Hausgeld und '
            'Rücklage, Vermietung und die Lage des Hauses selbst verändern den Wert erheblich. Die Zu- und Abschläge sind Annahmen von GRENFORD.</p>'
            '<a class="button" href="#bewertung">Persönlich einschätzen lassen <span aria-hidden="true">↑</span></a></div></form>')


def sanierung():
    m2 = ''.join(f'<label class="calc-check"><input type="checkbox" name="m2-{k}" data-lo="{lo}" data-hi="{hi}"{" checked" if k in ("maler", "boeden") else ""}> '
                 f'{E(t)} <em>{lo}–{hi} €/m²</em></label>' for k, t, lo, hi in PER_M2)
    items = ''.join(_num(f'sa-{k}', f'{t} ({_fmt(lo)}–{_fmt(hi)} € je Stück)', n, 'Stück', 1).replace('<input ', f'<input data-lo="{lo}" data-hi="{hi}" data-item ')
                    for k, t, lo, hi, n in PER_ITEM)
    std = [(f'{n} (× {f:.2f})'.replace('.', ','), f) for n, f in STANDARD]
    return (f'<form class="calc" data-calc="sanierung" method="post" aria-labelledby="calc-sa-t" data-planung="{PLANUNG[0]},{PLANUNG[1]}" data-puffer="{PUFFER}"><div class="calc-inputs">'
            '<h3 id="calc-sa-t">Sanierungskosten grob einschätzen</h3>'
            + _num('sa-flaeche', 'Wohnfläche', 75, 'm²', 1, '10')
            + _select('sa-standard', 'Ausstattungsstandard', std, 'mittel (× 1,00)')
            + f'<fieldset class="calc-checks"><legend>Arbeiten je m² Wohnfläche</legend>{m2}</fieldset>'
            + f'<fieldset class="calc-checks"><legend>Arbeiten je Stück</legend>{items}</fieldset></div>'
            '<div class="calc-out" aria-live="polite"><p class="calc-out-l">Grober Kostenrahmen</p><p class="calc-out-v" data-out="range">–</p>'
            '<p class="calc-out-s" data-out="perm2"></p><dl class="calc-steps" data-out="steps"></dl>'
            f'<p class="calc-note">Grobe Orientierung mit Annahmen von GRENFORD, inklusive {PLANUNG[0]}–{PLANUNG[1]} % für Planung und Nebenkosten und {PUFFER} % Puffer. '
            'Nicht enthalten: Schadstoffe, Statik, Grundrissänderungen, Gemeinschaftseigentum, Förderung. Verbindlich sind nur Angebote auf gemeinsamer Leistungsbeschreibung.</p>'
            '<a class="button" href="#bewertung">Wert nach Sanierung einschätzen lassen <span aria-hidden="true">↑</span></a></div></form>')


def flip():
    fields = ''.join(_num(f'fl-{k}', t, v, u, s) for k, t, v, u, s in FLIP)
    return ('<form class="calc" data-calc="flip" method="post" aria-labelledby="calc-fl-t"><div class="calc-inputs">'
            '<h3 id="calc-fl-t">Fix & Flip: kaufen, sanieren, verkaufen</h3>' + fields +
            '<p class="calc-src">Kaufnebenkosten in Berlin: Grunderwerbsteuer 6 %, dazu Notar, Grundbuch und gegebenenfalls Provision. Alle Werte sind Beispielwerte.</p></div>'
            '<div class="calc-out" aria-live="polite"><p class="calc-out-l">Gewinn vor Steuern</p><p class="calc-out-v" data-out="profit">–</p>'
            '<p class="calc-out-s" data-out="roi"></p><dl class="calc-steps" data-out="steps"></dl>'
            '<p class="calc-note">Vereinfachte Rechnung ohne Steuern. Gewinne aus dem Verkauf innerhalb von zehn Jahren nach dem Kauf sind bei Privatpersonen in der Regel '
            'einkommensteuerpflichtig; bei mehreren Verkäufen in kurzer Zeit kann gewerblicher Grundstückshandel vorliegen. Klären Sie das mit Ihrer Steuerberatung.</p>'
            '<a class="button" href="#bewertung">Objekt und Sanierung einschätzen lassen <span aria-hidden="true">↑</span></a></div></form>')


def section():
    """Drei Rechner mit Umschalter; Investment bewusst ausgenommen (dort direkte Ansprache)."""
    if not SHOW:
        return ''
    tabs = [('wohnwert', 'Wohnungswert', wohnwert()), ('sanierung', 'Sanierungskosten', sanierung()), ('flip', 'Fix & Flip', flip())]
    head = ''.join(f'<button type="button" role="tab" id="calc-tab-{k}" aria-controls="calc-panel-{k}" aria-selected="{"true" if i == 0 else "false"}"'
                   f'{"" if i == 0 else " tabindex=\"-1\""} data-calc-tab="{k}">{E(t)}</button>' for i, (k, t, _) in enumerate(tabs))
    panels = ''.join(f'<div role="tabpanel" id="calc-panel-{k}" aria-labelledby="calc-tab-{k}"{"" if i == 0 else " hidden"}>{c}</div>' for i, (k, _, c) in enumerate(tabs))
    draft = ('<p class="calc-draft">Entwurf: Grundpreis und Kostenansätze vor Veröffentlichung prüfen.</p>' if STATUS != 'freigegeben' else '')
    return ('<section class="calculators" id="rechner"><div class="section-head"><h2>Rechner zur ersten Orientierung</h2>'
            '<p>Drei Rechner für einen ersten Überblick. Gerechnet wird nur in Ihrem Browser, es werden keine Daten übertragen. '
            'Alle Annahmen sind sichtbar und lassen sich ändern.</p></div>' + draft +
            f'<div class="calc-tabs" role="tablist" aria-label="Rechner">{head}</div>{panels}</section>')
