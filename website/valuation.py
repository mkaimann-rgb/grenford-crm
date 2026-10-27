"""Bewertung und Suchprofile: mehrstufige Formulare mit Kacheln und Reglern (Logik in static/js/wizard.js).

Fünf Varianten, je Bereich angepasst:
    property-value     Property · Immobilie bewerten (privat)
    property-search    Property · Suchprofil (privat)
    projects-value     Projects · Wert heute und nach Sanierung
    investment-value   Investment · Asset einordnen (B2B)
    investment-search  Investment · Ankaufsprofil (B2B)

Übertragung wie alle Formulare über sendRequest() aus ux.js an das bestehende HubSpot-Formular
(subject: investment / property / renovation). Kein Versand vor ausdrücklichem Absenden.
"""
import html
from paths import img

E = html.escape

# Linien-Symbole im Stil der Seite (40er-Raster, Kontur in currentColor)
ICONS = {
    'wohnung': '<rect x="9" y="6" width="22" height="29"/><path d="M14 11h4v4h-4zM22 11h4v4h-4zM14 19h4v4h-4zM22 19h4v4h-4zM18 35v-6h4v6"/>',
    'haus': '<path d="M5 19 20 7l15 12"/><path d="M9 16v19h22V16"/><path d="M17 35v-9h6v9"/>',
    'mfh': '<path d="M6 35V13h12v22M18 35V5h16v30M4 35h32"/><path d="M10 18h4M10 24h4M10 30h4M23 10h6M23 16h6M23 22h6M23 28h6"/>',
    'grundstueck': '<path d="M4 30 13 12h17l6 18z"/><path d="M24 9a4 4 0 0 1 8 0c0 4-4 8-4 8s-4-4-4-8z"/><circle cx="28" cy="9" r="1"/>',
    'gewerbe': '<path d="M5 35V15h30v20M3 35h34M5 15l3-7h24l3 7"/><path d="M10 21h8v8h-8zM23 21h7v14"/>',
    'efh': '<path d="M5 19 20 7l15 12"/><path d="M9 16v19h22V16"/><path d="M13 21h5v5h-5zM23 21h4v14"/>',
    'dhh': '<path d="M3 20 12 11l8 8 8-8 9 9"/><path d="M6 18v17h28V18M20 19v16"/><path d="M10 25h4v4h-4zM26 25h4v4h-4z"/>',
    'reihe': '<path d="M2 20l6-7 6 7 6-7 6 7 6-7 6 7"/><path d="M4 18v17h32V18M14 20v15M26 20v15"/>',
    'villa': '<path d="M3 21 14 12l11 9"/><path d="M6 19v16h30V22H25"/><path d="M25 22V14h11v8"/><path d="M10 26h5v9M29 27h4"/>',
    'dach': '<path d="M3 30 20 9l17 21"/><path d="M8 30h24v5H8z"/><path d="M15 22h10"/>',
    'sanierung': '<path d="M6 35V18L20 7l14 11v17z"/><path d="M14 35V24h12v11"/><path d="M27 6l7 7-3 3-7-7z"/>',
    'anlage': '<path d="M6 35V15h28v20M4 35h32"/><circle cx="20" cy="24" r="6"/><path d="M20 21v6M18 22.5h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3"/>',
    'hotel': '<path d="M6 35V7h28v28M3 35h34"/><path d="M11 13h4M18 13h4M25 13h4M11 19h4M18 19h4M25 19h4M11 25h4M25 25h4M17 35v-8h6v8"/>',
    'portfolio': '<path d="M3 35V18h10v17M13 35V10h14v25M27 35V22h10v13M1 35h38"/>',
    'entwicklung': '<path d="M8 35V8h4M8 8h24v5M30 13v6"/><path d="M27 19h6v6h-6zM15 35V22h9v13M4 35h32"/>',
    'stern1': '<path d="M8 35V16L20 7l12 9v19z"/><path d="M20 19l1.5 3 3 .4-2.2 2 .6 3-2.9-1.5-2.9 1.5.6-3-2.2-2 3-.4z"/>',
    'stern2': '<path d="M8 35V16L20 7l12 9v19z"/><path d="M15 21l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3zM25 21l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3z"/>',
    'stern3': '<path d="M8 35V16L20 7l12 9v19z"/><path d="M13 23l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2zM20 18l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2zM27 23l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z"/>',
    'frage': '<path d="M8 35V16L20 7l12 9v19z"/><path d="M17 20a3 3 0 1 1 4 3c-1 .5-1 1-1 2.5M20 29v.5"/>',
    'vermietet': '<circle cx="20" cy="14" r="7"/><path d="M22 11h-3a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-3M20 9v2M20 19v2"/><path d="M5 30h8l6 3h9l7-5M5 26h7l9 3"/>',
    'selbst': '<path d="M20 22c0-6 4-9 8-9-1 5-4 8-8 9zM20 22c0-4-3-7-7-7 1 4 3 6 7 7zM20 22v8"/><path d="M5 30h8l6 3h9l7-5M5 26h7l9 3"/>',
    'leer': '<path d="M8 35V16L20 7l12 9v19z"/><path d="M14 35V22h12v13"/>',
    'verkauf': '<path d="M8 22l8-7 8 7v9H8z"/><path d="M28 8v10M24 14l4 4 4-4"/>',
    'kauf': '<path d="M8 22l8-7 8 7v9H8z"/><path d="M28 18V8M24 12l4-4 4 4"/>',
    'erbe': '<path d="M8 35V16L20 7l12 9v19z"/><path d="M15 22h10v8H15zM20 22v8M15 22c0-3 5-3 5 0 0-3 5-3 5 0"/>',
    'finanz': '<path d="M6 32h28M8 32V18M14 32V18M20 32V18M26 32V18M32 32V18M4 18h32L20 8z"/>',
    'kompass': '<circle cx="20" cy="20" r="14"/><path d="M25 15l-3 7-7 3 3-7z"/>',
    'balkon': '<path d="M10 6h20v16H10zM20 6v16M6 22h28M8 22v12M32 22v12M14 22v12M20 22v12M26 22v12M6 34h28"/>',
    'garten': '<path d="M20 34V20M20 20c-6 0-9-4-9-9 6 0 9 4 9 9zM20 24c5 0 8-3 8-8-5 0-8 3-8 8M4 34h32"/>',
    'aufzug': '<path d="M12 5h16v30H12zM20 5v30"/><path d="M5 15l2-3 2 3M5 21l2 3 2-3"/>',
    'keller': '<path d="M4 18h32M8 18v17h24V18"/><path d="M12 35v-5h4v-4h4v-4h4v-4"/>',
    'stellplatz': '<path d="M9 26l3-7h16l3 7v6H9z"/><circle cx="14" cy="32" r="2"/><circle cx="26" cy="32" r="2"/><path d="M27 4h8v8h-8zM30 10V6h2a1 1 0 0 1 0 2h-2"/>',
    'denkmal': '<path d="M4 14 20 5l16 9M6 14h28M9 14v16M16 14v16M24 14v16M31 14v16M4 30h32v4H4z"/>',
    'bad': '<path d="M5 20h30v5a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8zM9 20V9a3 3 0 0 1 6 0"/><path d="M12 33l-2 3M28 33l2 3"/>',
    'kueche': '<path d="M5 18h30v17H5zM5 24h30M13 24v11M27 24v11"/><path d="M11 6v8M15 6v8M11 10h4M28 6c-3 0-3 8 0 8M28 6v8"/>',
    'boden': '<path d="M4 34l8-8 8 8M12 26l8-8 8 8M20 34l8-8 8 8M4 18l8 8"/>',
    'elektro': '<path d="M22 4 10 22h9l-2 14 13-19h-9z"/>',
    'heizung': '<path d="M8 10h24v20H8zM14 10v20M20 10v20M26 10v20"/><path d="M6 34h28"/>',
    'fenster': '<path d="M9 5h22v30H9zM20 5v30M9 20h22"/>',
    'grundriss': '<path d="M5 5h30v30H5zM18 5v12M18 22v13M18 17h-6M18 22h17"/>',
    'fassade': '<path d="M5 35V9h30v26M3 35h34M5 9l15-5 15 5"/><path d="M10 15h5v5h-5zM25 15h5v5h-5zM10 25h5v5h-5zM25 25h5v5h-5z"/>',
    'komplett': '<path d="M5 19 20 7l15 12M9 16v19h22V16"/><path d="M14 26l4 4 8-9"/>',
    'idee': '<path d="M14 26a9 9 0 1 1 12 0v4H14zM16 34h8"/>',
    'plan': '<path d="M6 8h20v26H6zM26 12l6-4v26l-6 0"/><path d="M10 14h12M10 20h12M10 26h8"/>',
    'angebote': '<path d="M8 6h16l6 6v22H8z"/><path d="M24 6v6h6M12 18h14M12 23h14M12 28h9"/>',
    'firma': '<path d="M6 35V12l14-6 14 6v23M3 35h34"/><path d="M15 35V22h10v13"/>',
}

# --------------------------------------------------------------------- Schritte

def tiles(label, options, multi=False, required=True, other=None):
    return {'kind': 'tiles', 'label': label, 'options': options, 'multi': multi, 'required': required and not multi, 'other': other}


def chips(label, options, multi=False, required=True):
    return {'kind': 'chips', 'label': label, 'options': options, 'multi': multi, 'required': required and not multi}


def slider(label, lo, hi, value, step=1, unit='', max_note=False, min_note=False):
    """Regler mit Zahlenfeld; max_note/min_note zeigen „> max“ bzw. „< min“ an der Skala."""
    return {'kind': 'range', 'label': label, 'lo': lo, 'hi': hi, 'value': value, 'step': step, 'unit': unit, 'max_note': max_note, 'min_note': min_note}


def stepper(label, lo, hi, value, unit=''):
    return {'kind': 'stepper', 'label': label, 'lo': lo, 'hi': hi, 'value': value, 'unit': unit}


def fields(label, items):
    """items: (Name, Beschriftung, Typ, Pflicht, autocomplete, Breite 1-4)."""
    return {'kind': 'fields', 'label': label, 'items': items}


def note(label, placeholder):
    return {'kind': 'note', 'label': label, 'placeholder': placeholder}


def step(title, question, *controls, when=None, aside=None):
    return {'title': title, 'question': question, 'controls': controls, 'when': when, 'aside': aside}


ADDRESS = fields('Lage', [('PLZ', 'PLZ', 'text', True, 'postal-code', 1), ('Ort', 'Ort', 'text', True, 'address-level2', 3),
                          ('Strasse', 'Straße (optional)', 'text', False, 'address-line1', 3), ('Nr', 'Nr.', 'text', False, '', 1)])
BERLIN_AREAS = ['Charlottenburg', 'Wilmersdorf', 'Grunewald / Dahlem', 'Zehlendorf / Wannsee', 'Mitte', 'Prenzlauer Berg',
                'Friedrichshain / Kreuzberg', 'Schöneberg / Tempelhof', 'Potsdam', 'Berliner Umland']
NO_PLOT = 'Objektart!=Grundstück'

WIZARDS = {
    'property-value': {
        'subject': 'property', 'title': 'Bewertungsanfrage · Property', 'submit': 'Einschätzung anfordern',
        'eyebrow': 'PROPERTY · IMMOBILIE BEWERTEN', 'tab': ('Verkaufen', 'Immobilie bewerten'),
        'success': 'Vielen Dank. Ihre Angaben sind angekommen. Ich melde mich persönlich mit Ihrer Einschätzung. – Marco Kaimann',
        'steps': [
            step('Ihre Immobilie', 'Welche Immobilie möchten Sie bewerten lassen?',
                 tiles('Objektart', [('Wohnung', 'wohnung'), ('Haus', 'haus'), ('Mehrfamilienhaus', 'mfh'), ('Grundstück', 'grundstueck'), ('Gewerbeeinheit', 'gewerbe')])),
            step('Die Hausart', 'Um welche Art von Haus handelt es sich?',
                 tiles('Hausart', [('Einfamilienhaus', 'efh'), ('Doppelhaushälfte', 'dhh'), ('Reihenhaus', 'reihe'), ('Villa', 'villa')]), when='Objektart=Haus'),
            step('Die Größe', 'Wie groß ist die Immobilie?',
                 slider('Wohnfläche', 20, 400, 90, 1, 'm²', max_note=True), stepper('Zimmer', 1, 20, 3), when=NO_PLOT, aside='grundriss'),
            step('Das Grundstück', 'Wie groß ist das Grundstück?',
                 slider('Grundstücksfläche', 0, 5000, 600, 10, 'm²', max_note=True), when='Objektart=Haus|Mehrfamilienhaus|Grundstück', aside='grundstueck'),
            step('Das Baujahr', 'Wann wurde die Immobilie gebaut?',
                 slider('Baujahr', 1850, 2026, 1960, 1, '', min_note=True), when=NO_PLOT, aside='fassade'),
            step('Der Zustand', 'Wie ist der Zustand heute?',
                 tiles('Zustand', [('Sanierungsbedürftig', 'stern1'), ('Gepflegt', 'stern2'), ('Modernisiert', 'stern3'), ('Unbekannt', 'frage')]), when=NO_PLOT),
            step('Die Ausstattung', 'Welche Qualität hat die Ausstattung?',
                 chips('Ausstattung', ['Einfach', 'Mittel', 'Gehoben', 'Exklusiv', 'Unbekannt']), when=NO_PLOT),
            step('Die Besonderheiten', 'Was zeichnet die Immobilie aus? Mehrfachauswahl möglich.',
                 tiles('Besonderheiten', [('Balkon / Terrasse', 'balkon'), ('Garten', 'garten'), ('Aufzug', 'aufzug'), ('Keller', 'keller'),
                                          ('Stellplatz / Garage', 'stellplatz'), ('Denkmalschutz', 'denkmal')], multi=True),
                 note('Weitere Besonderheiten', 'z. B. Dachterrasse, Kamin, Sauna'), when=NO_PLOT),
            step('Die Nutzung', 'Wie wird die Immobilie heute genutzt?',
                 tiles('Nutzung', [('Vermietet', 'vermietet'), ('Selbst bewohnt', 'selbst'), ('Leerstehend', 'leer')]), when=NO_PLOT),
            step('Die Miete', 'Wie hoch ist die monatliche Nettokaltmiete?',
                 slider('Nettokaltmiete', 100, 10000, 1200, 50, '€ / Monat', max_note=True), when='Nutzung=Vermietet', aside='vermietet'),
            step('Ihr Anlass', 'Wofür benötigen Sie die Einschätzung?',
                 tiles('Anlass', [('Verkauf', 'verkauf'), ('Erbe / Schenkung', 'erbe'), ('Finanzierung', 'finanz'), ('Sanierung planen', 'sanierung'), ('Orientierung', 'kompass')])),
            step('Die Lage', 'Wo befindet sich die Immobilie?', ADDRESS, aside='grundstueck'),
        ],
    },
    'property-search': {
        'subject': 'property', 'title': 'Suchprofil · Property', 'submit': 'Suchprofil hinterlegen',
        'eyebrow': 'PROPERTY · SUCHPROFIL', 'tab': ('Kaufen', 'Suchprofil hinterlegen'),
        'success': 'Vielen Dank. Ihr Suchprofil ist angekommen. Passende Angebote, auch diskrete, stelle ich Ihnen persönlich vor. – Marco Kaimann',
        'steps': [
            step('Ihre Suche', 'Was suchen Sie?',
                 tiles('Gesucht', [('Wohnung', 'wohnung'), ('Haus', 'haus'), ('Kapitalanlage', 'anlage'), ('Sanierungsobjekt', 'sanierung'), ('Grundstück', 'grundstueck')])),
            step('Die Nutzung', 'Wie möchten Sie die Immobilie nutzen?',
                 tiles('Nutzung', [('Selbst nutzen', 'selbst'), ('Vermieten', 'vermietet'), ('Noch offen', 'kompass')])),
            step('Ihr Budget', 'Welcher Kaufpreis ist Ihr Rahmen?',
                 slider('Budget bis', 200000, 5000000, 900000, 25000, '€', max_note=True), aside='finanz'),
            step('Größe und Zimmer', 'Was brauchen Sie mindestens?',
                 slider('Wohnfläche ab', 30, 400, 90, 5, 'm²', max_note=True), stepper('Zimmer ab', 1, 12, 3), when='Gesucht!=Grundstück', aside='grundriss'),
            step('Die Lage', 'Wo suchen Sie? Mehrfachauswahl möglich.',
                 chips('Wunschlagen', BERLIN_AREAS, multi=True), note('Weitere Lagen', 'z. B. Kleinmachnow, Hamburg')),
            step('Was Ihnen wichtig ist', 'Mehrfachauswahl möglich.',
                 tiles('Wünsche', [('Balkon / Terrasse', 'balkon'), ('Garten', 'garten'), ('Aufzug', 'aufzug'), ('Altbau', 'denkmal'), ('Neubau', 'entwicklung'), ('Stellplatz', 'stellplatz')], multi=True)),
            step('Ihr Zeitrahmen', 'Wann möchten Sie kaufen, und wie ist die Finanzierung?',
                 chips('Zeitrahmen', ['Sofort', 'In 3 bis 6 Monaten', 'Später', 'Noch offen']),
                 chips('Finanzierung', ['Geklärt', 'In Klärung', 'Eigenkapital', 'Noch offen'])),
        ],
    },
    'projects-value': {
        'subject': 'renovation', 'title': 'Sanierungsanfrage · Wert heute und nach Sanierung', 'submit': 'Einschätzung anfordern',
        'eyebrow': 'PROJECTS · WERT HEUTE UND SANIERT', 'tab': ('Sanieren', 'Wert nach Sanierung'),
        'success': 'Vielen Dank. Ihr Vorhaben ist angekommen. Ich melde mich persönlich und wir besprechen den nächsten Schritt. Für Sie als Eigentümer bleibt die Beratung kostenfrei. – Marco Kaimann',
        'steps': [
            step('Ihre Immobilie', 'Was möchten Sie sanieren oder umbauen?',
                 tiles('Objektart', [('Wohnung', 'wohnung'), ('Haus', 'haus'), ('Mehrfamilienhaus', 'mfh'), ('Dachgeschoss / Rohbau', 'dach'), ('Gewerbeeinheit', 'gewerbe')])),
            step('Die Größe', 'Wie groß ist die Fläche?', slider('Fläche', 20, 600, 120, 5, 'm²', max_note=True), stepper('Bäder', 0, 8, 1), aside='grundriss'),
            step('Das Baujahr', 'Wann wurde die Immobilie gebaut?', slider('Baujahr', 1850, 2026, 1930, 1, '', min_note=True), aside='fassade'),
            step('Der Zustand heute', 'Wo stehen Sie?',
                 tiles('Zustand', [('Rohbau / entkernt', 'dach'), ('Sanierungsbedürftig', 'stern1'), ('Teilweise saniert', 'stern2'), ('Gepflegt', 'stern3')])),
            step('Ihr Vorhaben', 'Was soll passieren? Mehrfachauswahl möglich.',
                 tiles('Maßnahmen', [('Bäder', 'bad'), ('Küche', 'kueche'), ('Böden', 'boden'), ('Elektro', 'elektro'), ('Heizung / Wärmepumpe', 'heizung'),
                                     ('Fenster', 'fenster'), ('Grundriss ändern', 'grundriss'), ('Dach / Fassade', 'fassade'), ('Komplettsanierung', 'komplett')], multi=True),
                 note('Weitere Wünsche', 'z. B. Wintergarten, Klimaanlage, Stahlträger')),
            step('Ihr Anspruch', 'Welche Ausstattung schwebt Ihnen vor?', chips('Ausstattungsziel', ['Solide', 'Gehoben', 'Exklusiv', 'Noch offen'])),
            step('Der Stand', 'Wie weit ist Ihr Vorhaben?',
                 tiles('Stand', [('Erste Idee', 'idee'), ('Planung vorhanden', 'plan'), ('Angebote liegen vor', 'angebote'), ('Baufirma gewählt', 'firma')]),
                 chips('Zeitrahmen', ['Sofort', 'In 3 Monaten', 'In 6 bis 12 Monaten', 'Noch offen'])),
            step('Ihr Ziel', 'Was passiert nach der Sanierung?',
                 tiles('Ziel', [('Selbst nutzen', 'selbst'), ('Vermieten', 'vermietet'), ('Verkaufen', 'verkauf'), ('Noch offen', 'kompass')])),
            step('Die Lage', 'Wo befindet sich die Immobilie?', ADDRESS, aside='grundstueck'),
        ],
    },
    'investment-value': {
        'subject': 'investment', 'title': 'Asset-Einordnung · Investment', 'submit': 'Einordnung anfragen',
        'eyebrow': 'INVESTMENT · ASSET EINORDNEN', 'tab': ('Verkaufen', 'Asset einordnen'), 'company': True,
        'success': 'Vielen Dank. Ihre Angaben sind angekommen. Ich melde mich persönlich und vertraulich bei Ihnen. – Marco Kaimann',
        'steps': [
            step('Die Assetklasse', 'Um welches Objekt geht es?',
                 tiles('Assetklasse', [('Wohn- und Geschäftshaus', 'mfh'), ('Portfolio', 'portfolio'), ('Hotel / Serviced', 'hotel'), ('Büro / Gewerbe', 'gewerbe'),
                                       ('Projektentwicklung', 'entwicklung'), ('Grundstück', 'grundstueck')])),
            step('Die Kennzahlen', 'Die wichtigsten Eckdaten. Schätzungen genügen.',
                 slider('Mietfläche', 100, 30000, 1500, 50, 'm²', max_note=True), stepper('Einheiten', 1, 500, 12),
                 fields('Ertrag', [('Jahresmiete', 'Jahresnettokaltmiete in € (optional)', 'number', False, '', 2), ('Leerstand', 'Leerstand in % (optional)', 'number', False, '', 2)]),
                 aside='portfolio'),
            step('Das Profil', 'Wie würden Sie das Objekt einordnen?',
                 tiles('Profil', [('Stabiler Bestand (Core)', 'stern3'), ('Mit Potenzial (Value-Add)', 'stern2'), ('Entwicklung (Opportunistic)', 'entwicklung'), ('Noch offen', 'frage')])),
            step('Ihr Ziel', 'Was haben Sie vor?',
                 tiles('Ziel', [('Off-Market-Verkauf', 'verkauf'), ('Globalverkauf / Portfolio', 'portfolio'), ('Werteinschätzung', 'kompass'),
                                ('Finanzierung / Partner', 'finanz')]),
                 chips('Struktur', ['Asset Deal', 'Share Deal', 'Noch offen'])),
            step('Die Lage', 'Wo befindet sich das Objekt?',
                 fields('Lage', [('PLZ', 'PLZ', 'text', False, 'postal-code', 1), ('Ort', 'Ort / Region', 'text', True, 'address-level2', 3)]), aside='grundstueck'),
        ],
    },
    'investment-search': {
        'subject': 'investment', 'title': 'Ankaufsprofil · Investment', 'submit': 'Ankaufsprofil hinterlegen',
        'eyebrow': 'INVESTMENT · ANKAUFSPROFIL', 'tab': ('Ankaufen', 'Ankaufsprofil'), 'company': True,
        'success': 'Vielen Dank. Ihr Ankaufsprofil ist angekommen. Passende Off-Market-Gelegenheiten stelle ich Ihnen vertraulich vor. – Marco Kaimann',
        'steps': [
            step('Die Assetklassen', 'Was suchen Sie? Mehrfachauswahl möglich.',
                 tiles('Assetklassen', [('Wohn- und Geschäftshaus', 'mfh'), ('Portfolio', 'portfolio'), ('Hotel / Serviced', 'hotel'), ('Büro / Gewerbe', 'gewerbe'),
                                        ('Projektentwicklung', 'entwicklung'), ('Grundstück', 'grundstueck')], multi=True, required=True)),
            step('Das Volumen', 'Welche Ticketgröße passt?',
                 fields('Volumen', [('VolumenVon', 'Ab (Mio. €)', 'number', False, '', 2), ('VolumenBis', 'Bis (Mio. €)', 'number', True, '', 2)]), aside='finanz'),
            step('Die Strategie', 'Welches Risikoprofil? Mehrfachauswahl möglich.',
                 chips('Strategie', ['Core', 'Core+', 'Value-Add', 'Opportunistic', 'Projektentwicklung'], multi=True),
                 fields('Ziel', [('Zielrendite', 'Zielrendite oder Faktor (optional)', 'text', False, '', 4)])),
            step('Die Regionen', 'Wo investieren Sie? Mehrfachauswahl möglich.',
                 chips('Regionen', ['Berlin', 'Potsdam / Umland', 'Top-7-Städte', 'B-Städte', 'Süddeutschland / Bodensee', 'Bundesweit'], multi=True)),
            step('Die Struktur', 'Wie möchten Sie erwerben?',
                 chips('Struktur', ['Asset Deal', 'Share Deal', 'Beides']),
                 chips('Zeitrahmen', ['Sofort', 'In 6 Monaten', 'Laufend'])),
        ],
    },
}

TAB_SETS = {
    'property': ['property-value', 'property-search'],
    'investment': ['investment-value', 'investment-search'],
    'projects': ['projects-value'],
    'bewerten': ['property-value', 'projects-value', 'investment-value'],
}
TAB_LABELS_BEWERTEN = {'property-value': ('Property', 'Immobilie bewerten'), 'projects-value': ('Projects', 'Wert nach Sanierung'),
                       'investment-value': ('Investment', 'Asset einordnen')}

# --------------------------------------------------------------------- Ausgabe

def svg(name, cls='wz-icon'):
    return f'<svg class="{cls}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">{ICONS[name]}</svg>'


def _slug(text):
    return ''.join(c if c.isalnum() else '-' for c in text.lower()).strip('-')


def _control(wid, c, n):
    label, name = c['label'], _slug(c['label'])
    fid = f'wz-{wid}-{name}'
    if c['kind'] in ('tiles', 'chips'):
        kind = 'checkbox' if c['multi'] else 'radio'
        req = f' data-required-group="{E(c["label"])}"' if c['required'] else ''
        cls = 'wz-tiles' if c['kind'] == 'tiles' else 'wz-chips'
        opts = ''
        for opt in c['options']:
            text, icon = (opt if isinstance(opt, tuple) else (opt, None))
            inner = (svg(icon) if icon else '') + f'<span>{E(text)}</span>'
            opts += (f'<label class="wz-option"><input type="{kind}" name="{E(c["label"])}" value="{E(text)}">'
                     f'<span class="wz-box">{inner}</span></label>')
        head = '' if n == 0 and c['kind'] == 'tiles' else f'<span class="wz-label" id="{fid}-l">{E(label)}</span>'
        aria = f' aria-labelledby="{fid}-l"' if head else ''
        return f'<div class="wz-group" data-row="{E(label)}"{req}>{head}<div class="{cls}" role="group"{aria}>{opts}</div></div>'
    if c['kind'] == 'range':
        lo_note = ('< ' if c['min_note'] else '') + f'{c["lo"]:,}'.replace(',', '.')
        hi_note = ('> ' if c['max_note'] else '') + f'{c["hi"]:,}'.replace(',', '.')
        return (f'<div class="wz-range" data-row="{E(label)}" data-unit="{E(c["unit"])}"><label class="wz-label" for="{fid}">{E(label)}</label>'
                f'<input type="range" min="{c["lo"]}" max="{c["hi"]}" step="{c["step"]}" value="{c["value"]}" data-sync="{fid}" aria-hidden="true" tabindex="-1">'
                f'<div class="wz-scale" aria-hidden="true"><span>{lo_note}</span><span>{hi_note}</span></div>'
                f'<div class="wz-number"><input id="{fid}" type="number" inputmode="numeric" name="{E(label)}" min="{c["lo"]}" step="{c["step"]}" value="{c["value"]}" required>'
                f'<span>{E(c["unit"])}</span></div></div>')
    if c['kind'] == 'stepper':
        return (f'<div class="wz-stepper" data-row="{E(label)}"><label class="wz-label" for="{fid}">{E(label)}</label><div>'
                f'<button type="button" data-step-by="-1" aria-controls="{fid}" aria-label="{E(label)} verringern">−</button>'
                f'<input id="{fid}" type="number" inputmode="numeric" name="{E(label)}" min="{c["lo"]}" max="{c["hi"]}" value="{c["value"]}" required>'
                f'<button type="button" data-step-by="1" aria-controls="{fid}" aria-label="{E(label)} erhöhen">+</button></div></div>')
    if c['kind'] == 'fields':
        items = ''
        for fname, flabel, ftype, freq, auto, width in c['items']:
            iid = f'wz-{wid}-{_slug(fname)}'
            items += (f'<label class="wz-field w{width}" for="{iid}"><span>{E(flabel)}{" *" if freq else ""}</span>'
                      f'<input id="{iid}" type="{ftype}" name="{E(fname)}"{" required" if freq else ""}{f" autocomplete={chr(34)}{auto}{chr(34)}" if auto else ""}'
                      f'{" inputmode=" + chr(34) + "decimal" + chr(34) if ftype == "number" else ""}></label>')
        return f'<div class="wz-fields" data-row="{E(label)}">{items}</div>'
    if c['kind'] == 'note':
        return (f'<div class="wz-note" data-row="{E(label)}"><label class="wz-label" for="{fid}">{E(label)}</label>'
                f'<input id="{fid}" type="text" name="{E(label)}" placeholder="{E(c["placeholder"])}"></div>')
    raise ValueError(c['kind'])


def _contact_step(wid, w, total):
    company = ''
    if w.get('company'):
        company = (f'<label class="wz-field w2" for="wz-{wid}-firma"><span>Unternehmen</span><input id="wz-{wid}-firma" type="text" name="Unternehmen" autocomplete="organization"></label>'
                   f'<div class="wz-group w2" data-row="Rolle"><span class="wz-label" id="wz-{wid}-rolle-l">Ihre Rolle</span><div class="wz-chips" role="group" aria-labelledby="wz-{wid}-rolle-l">'
                   + ''.join(f'<label class="wz-option"><input type="radio" name="Rolle" value="{r}"><span class="wz-box"><span>{r}</span></span></label>'
                             for r in ('Eigentümer', 'Bauträger / Entwickler', 'Investor / Family Office', 'Berater / Bank')) + '</div></div>')
    return (f'<fieldset class="wizard-step" data-step data-contact hidden><legend tabindex="-1"><span>Fast geschafft</span><small>Wohin darf ich Ihre persönliche Rückmeldung senden?</small></legend>'
            '<div class="wizard-body"><div class="wz-fields wz-contact">'
            f'<label class="wz-field w2" for="wz-{wid}-name"><span>Name *</span><input id="wz-{wid}-name" type="text" name="Name" autocomplete="name" required></label>'
            f'<label class="wz-field w2" for="wz-{wid}-email"><span>E-Mail *</span><input id="wz-{wid}-email" type="email" name="Email" autocomplete="email" required></label>'
            f'<label class="wz-field w2" for="wz-{wid}-tel"><span>Telefon (optional)</span><input id="wz-{wid}-tel" type="tel" name="Telefon" autocomplete="tel"></label>'
            + company +
            f'<div class="wz-group w4"><span class="wz-label" id="wz-{wid}-weg-l">Rückmeldung am liebsten per</span><div class="wz-chips" role="group" aria-labelledby="wz-{wid}-weg-l">'
            + ''.join(f'<label class="wz-option"><input type="radio" name="Kontaktweg" value="{v}"{" checked" if i == 0 else ""}><span class="wz-box"><span>{v}</span></span></label>'
                      for i, v in enumerate(('E-Mail', 'Telefon', 'Video-Termin'))) + '</div></div>'
            f'<label class="wz-field w4" for="wz-{wid}-msg"><span>Nachricht (optional)</span><textarea id="wz-{wid}-msg" name="Nachricht" rows="3"></textarea></label>'
            f'<label class="wz-consent w4" for="wz-{wid}-ok"><input id="wz-{wid}-ok" type="checkbox" name="Einwilligung" value="ja" required>'
            '<span>Ich bin einverstanden, dass GRENFORD meine Angaben zur Bearbeitung dieser Anfrage verwendet. Die Einwilligung kann ich jederzeit widerrufen. *</span></label>'
            '</div><aside class="wz-person">' + img('marco-kaimann.jpg', '', '96px', 'loading="lazy"') +
            '<p><strong>Marco Kaimann</strong><span>Founder &amp; Strategic Advisor</span>Ihre Angaben lese ich persönlich. Sie erhalten eine Einschätzung von mir, keinen automatisch errechneten Wert.</p></aside></div></fieldset>')


def wizard(wid):
    w = WIZARDS[wid]
    total = len(w['steps']) + 1
    h = (f'<form class="wizard" id="wz-{wid}" data-wizard data-subject="{w["subject"]}" data-title="{E(w["title"])}" data-submit="{E(w["submit"])}" '
         f'data-success="{E(w["success"])}" method="post" novalidate aria-labelledby="wz-{wid}-title">'
         f'<div class="wizard-head"><span class="eyebrow" id="wz-{wid}-title">{w["eyebrow"]}</span><span class="wizard-count" aria-live="polite">Schritt 1 von {total}</span></div>'
         '<div class="wizard-progress" aria-hidden="true"><span></span></div>')
    for i, s in enumerate(w['steps']):
        when = f' data-if="{E(s["when"])}"' if s['when'] else ''
        aside = f'<div class="wizard-aside" aria-hidden="true">{svg(s["aside"], "wz-aside-icon")}</div>' if s['aside'] else ''
        body = ''.join(_control(wid, c, n) for n, c in enumerate(s['controls']))
        h += (f'<fieldset class="wizard-step{" has-aside" if aside else ""}" data-step{when}{"" if i == 0 else " hidden"}>'
              f'<legend tabindex="-1"><span>{E(s["title"])}</span><small>{E(s["question"])}</small></legend>'
              f'<div class="wizard-body"><div class="wz-controls">{body}</div>{aside}</div></fieldset>')
    h += _contact_step(wid, w, total)
    h += (f'<p class="wizard-error" id="wz-{wid}-error" role="alert"></p>'
          '<div class="hp-field" aria-hidden="true"><label>Bitte leer lassen<input type="text" name="gf_hp" tabindex="-1" autocomplete="off"></label></div>'
          '<div class="wizard-actions"><button type="button" class="text-button" data-back hidden>← Zurück</button>'
          '<button type="button" class="button wizard-next" data-next>Weiter <span aria-hidden="true">→</span></button></div>'
          f'<div class="wizard-result" id="wz-{wid}-result" tabindex="-1" role="status" aria-live="polite"></div>'
          f'<noscript><p class="wizard-noscript">Für dieses Formular wird JavaScript benötigt. Schreiben Sie gern direkt an kontakt@grenford.de.</p></noscript></form>')
    return h


def wizard_tabs(key, labels=None):
    ids = TAB_SETS[key]
    if len(ids) == 1:
        return f'<div class="wz-panel" id="bewertung-{ids[0]}">{wizard(ids[0])}</div>'
    tabs = ''
    for i, wid in enumerate(ids):
        small, big = (labels or {}).get(wid) or WIZARDS[wid]['tab']
        tabs += (f'<button type="button" role="tab" id="tab-{wid}" aria-controls="bewertung-{wid}" aria-selected="{"true" if i == 0 else "false"}"'
                 f'{"" if i == 0 else " tabindex=" + chr(34) + "-1" + chr(34)} data-key="{wid}"><small>{small}</small><span>{big}</span></button>')
    panels = ''.join(f'<div class="wz-panel" role="tabpanel" id="bewertung-{wid}" aria-labelledby="tab-{wid}"{"" if i == 0 else " hidden"}>{wizard(wid)}</div>'
                     for i, wid in enumerate(ids))
    return f'<div class="wz-switch" role="tablist" aria-label="Ihr Anliegen" data-wz-tabs>{tabs}</div>{panels}'
