"""Marktseite /markt/: Marktüberblick mit Filtern, Einordnung, Methodik, Fragen, nächster Schritt.

Daten stehen in market.json → "marketData". Solange keine geprüften Datensätze hinterlegt sind,
zeigt der Überblick einen gestalteten Leerzustand. Der Build prüft jeden Datensatz auf Quelle,
Zeitraum, Datentyp und Prüfdatum; Angebots- und Transaktionsdaten werden nie vermischt.
"""
from pathlib import Path
import html, json, re

ROOT = Path(__file__).parent
M = json.loads((ROOT / 'market.json').read_text(encoding='utf-8'))
E = html.escape

REQUIRED = ('city', 'assetType', 'period', 'dataType', 'metric', 'statistic', 'unit', 'sourceName', 'sourceUrl', 'usageRightsNote', 'checkedAt', 'methodologyNote')
STATISTIC = {'median': 'Median', 'mean': 'Durchschnitt', 'other': 'Kennzahl'}
DATATYPE_SHORT = {'transaction': 'Transaktionspreis', 'asking': 'Angebotspreis'}


def validate(records):
    """Bricht den Build bei unvollständigen oder ungültigen Datensätzen ab (keine ungekennzeichneten Zahlen)."""
    for i, r in enumerate(records):
        missing = [k for k in REQUIRED if not str(r.get(k, '')).strip()]
        assert not missing, f'market.json Datensatz {i}: Pflichtfelder fehlen: {missing}'
        assert r['assetType'] in M['filters']['assetType'], f'Datensatz {i}: assetType unbekannt'
        assert r['dataType'] in M['filters']['dataType'], f'Datensatz {i}: dataType muss asking oder transaction sein'
        assert r['statistic'] in STATISTIC, f'Datensatz {i}: statistic muss median, mean oder other sein'
        assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', r['checkedAt']), f'Datensatz {i}: checkedAt im Format JJJJ-MM-TT'
        assert r['sourceUrl'].startswith('https://'), f'Datensatz {i}: sourceUrl muss eine https-Adresse sein'
        assert r.get('value') is None or isinstance(r['value'], (int, float)), f'Datensatz {i}: value muss Zahl oder null sein'
    return records


def _num(v):
    return f'{v:,.0f}'.replace(',', '.') if isinstance(v, (int, float)) else '–'


def _select(name, label, options):
    opts = '<option value="">Alle</option>' + ''.join(f'<option value="{E(k)}">{E(v)}</option>' for k, v in options)
    # data-Attribute in Kleinschreibung: HTML speichert data-assetType als data-assettype (dataset.assettype)
    return f'<label class="mk-filter" for="mk-{name}"><span>{label}</span><select id="mk-{name}" data-filter="{name.lower()}">{opts}</select></label>'


def _card(r):
    stat = STATISTIC[r['statistic']]
    sample = f' · {_num(r["sampleSize"])} Fälle' if r.get('sampleSize') else ''
    value = (f'<strong class="mk-value">{_num(r["value"])}<small>{E(r["unit"])}</small></strong>' if r.get('value') is not None
             else '<strong class="mk-value mk-novalue">Kein Wert veröffentlicht</strong>')
    attrs = ' '.join(f'data-{k.lower()}="{E(str(r[k]), quote=True)}"' for k in ('city', 'assetType', 'period', 'dataType'))
    return (f'<article class="mk-card" {attrs}><div class="mk-card-head"><span class="mk-type mk-type--{r["dataType"]}">{DATATYPE_SHORT[r["dataType"]]}</span>'
            f'<span>{E(r["period"])}</span></div><h3>{E(r["metric"])}</h3><p class="mk-where">{E(r["city"])} · {E(M["filters"]["assetType"][r["assetType"]])}</p>'
            f'{value}<p class="mk-stat">{stat}{sample}</p><p class="mk-method">{E(r["methodologyNote"])}</p>'
            f'<p class="mk-source">Quelle: <a href="{E(r["sourceUrl"], quote=True)}" target="_blank" rel="noopener noreferrer">{E(r["sourceName"])}</a> · geprüft am {E(r["checkedAt"])}</p></article>')


def _table(records):
    rows = ''.join(f'<tr {" ".join(f"data-{k.lower()}={chr(34)}{E(str(r[k]), quote=True)}{chr(34)}" for k in ("city", "assetType", "period", "dataType"))}>'
                   f'<th scope="row">{E(r["city"])}</th><td>{E(M["filters"]["assetType"][r["assetType"]])}</td><td>{DATATYPE_SHORT[r["dataType"]]}</td>'
                   f'<td>{E(r["metric"])} ({STATISTIC[r["statistic"]]})</td><td class="mk-num">{_num(r.get("value"))} {E(r["unit"])}</td>'
                   f'<td>{E(r["period"])}</td><td><a href="{E(r["sourceUrl"], quote=True)}" target="_blank" rel="noopener noreferrer">{E(r["sourceName"])}</a></td></tr>' for r in records)
    return ('<div class="mk-table" role="region" aria-labelledby="mk-table-caption" tabindex="0"><table><caption id="mk-table-caption">Alle Kennzahlen der Auswahl als Tabelle</caption>'
            '<thead><tr><th scope="col">Standort</th><th scope="col">Immobilienart</th><th scope="col">Datentyp</th><th scope="col">Kennzahl</th>'
            f'<th scope="col">Wert</th><th scope="col">Zeitraum</th><th scope="col">Quelle</th></tr></thead><tbody>{rows}</tbody></table></div>')


def overview(contact_href):
    records = validate(M['marketData'])
    periods = sorted({r['period'] for r in records}, reverse=True)
    filters = (_select('city', 'Standort', [(c, c) for c in M['filters']['city']])
               + _select('assetType', 'Immobilienart', M['filters']['assetType'].items())
               + _select('period', 'Zeitraum', [(p, p) for p in periods])
               + _select('dataType', 'Datentyp', M['filters']['dataType'].items()))
    empty = (f'<div class="mk-empty" data-mk-empty{"" if not records else " hidden"}><span class="eyebrow">NOCH KEINE GEPRÜFTEN DATEN</span>'
             '<p>Für diese Auswahl sind noch keine geprüften Daten hinterlegt. Sprechen Sie mit uns über Ihr konkretes Vorhaben.</p>'
             f'<a class="text-link" href="{contact_href}">Vorhaben besprechen <span aria-hidden="true">↗</span></a></div>')
    cards = ''.join(_card(r) for r in records)
    legend = ('<p class="mk-legend"><span class="mk-type mk-type--transaction">Transaktionspreis</span> tatsächlich vereinbarter Kaufpreis · '
              '<span class="mk-type mk-type--asking">Angebotspreis</span> inserierte Preisvorstellung, kein Verkaufspreis</p>')
    return ('<section class="mk-overview" id="marktueberblick"><div class="section-head"><span class="eyebrow">MARKTÜBERBLICK</span><h2>Der Markt<br><em>im Überblick.</em></h2>'
            '<p>Wählen Sie Standort und Immobilienart. Jede Kennzahl wird mit Zeitraum, Datenbasis und Quelle dargestellt.</p></div>'
            f'<form class="mk-filters" method="post" aria-label="Marktdaten filtern" onsubmit="return false">{filters}</form>{legend}'
            f'<p class="mk-count" aria-live="polite" data-mk-count>{len(records)} Kennzahl{"" if len(records) == 1 else "en"}</p>'
            f'<div class="mk-cards" data-mk-cards>{cards}</div>{empty}' + (_table(records) if records else '') + '</section>')


def interpretation(page):
    items = [('Verkaufen', 'Vergleichbare Angebote helfen bei der Positionierung. Zustand, Mikrolage und Vermarktungsstrategie müssen zusätzlich betrachtet werden.', 'property', 'Property'),
             ('Investieren', 'Für eine Transaktion zählen neben dem Standort auch Erträge, Mietverträge, Investitionsbedarf und mögliche Nutzungsstrategien.', 'investment', 'Investment'),
             ('Bestand verändern', 'Bei einer Sanierung gehören Marktpotenzial, gewünschte Nutzung und Kosten zusammen betrachtet.', 'projects', 'Projects')]
    cols = ''.join(f'<a class="mk-path" href="{page(k)}"><span class="eyebrow">{label}</span><h3>{t}</h3><p>{x}</p><span class="mk-more">Zu {label} <span aria-hidden="true">↗</span></span></a>'
                   for t, x, k, label in items)
    return ('<section class="mk-interpretation" id="einordnung"><div class="section-head"><span class="eyebrow">EINORDNUNG</span><h2>Was bedeutet das<br><em>für Ihr Vorhaben?</em></h2>'
            f'<p>Marktdaten geben Orientierung. Für eine Entscheidung zählt, was sie für Ihre Immobilie bedeuten.</p></div><div class="mk-paths">{cols}</div></section>')


def methodology():
    items = [('Angebotspreise', 'Inserierte Preise zeigen die Erwartungen der Anbieter. Sie belegen keinen tatsächlich erzielten Verkaufspreis.'),
             ('Transaktionspreise', 'Dokumentierte Kaufpreise geben Auskunft über abgeschlossene Verkäufe. Ihre Veröffentlichung kann zeitlich nachlaufen.'),
             ('Vergleichbarkeit', 'Median und Durchschnitt, Wohnfläche und Grundstücksfläche sowie Neubau und Bestand dürfen nicht ungekennzeichnet vermischt werden.')]
    cols = ''.join(f'<article><span>{i:02d}</span><h3>{a}</h3><p>{b}</p></article>' for i, (a, b) in enumerate(items, 1))
    return ('<section class="values mk-method-band" id="methodik"><div class="section-head"><span class="eyebrow">METHODIK</span><h2>Jede Zahl<br><em>braucht Kontext.</em></h2>'
            f'<p>So lesen Sie die Kennzahlen richtig.</p></div><div class="values-grid mk-method-grid">{cols}</div></section>')


FAQ = [('Ist ein Stadtwert der Wert meiner Immobilie?', 'Nein. Ein aggregierter Stadtwert ist eine Orientierung. Eine objektspezifische Einschätzung berücksichtigt unter anderem Mikrolage, Zustand und Nutzung.'),
       ('Wie aktuell sind die Daten?', 'Jeder Datensatz erhält einen sichtbaren Berichtszeitraum und ein Prüfdatum. Wo keine belastbaren Daten vorliegen, werden keine Werte angezeigt.'),
       ('Woher stammen die Zahlen?', 'Quellen werden direkt am jeweiligen Datensatz genannt. Methodik und Nutzbarkeit werden vor einer Veröffentlichung geprüft.')]


def next_step(contact_href):
    return ('<section class="mk-next" id="naechster-schritt"><div><span class="eyebrow">NÄCHSTER SCHRITT</span><h2>Von der Marktübersicht<br><em>zur nächsten Entscheidung.</em></h2>'
            '<p>Besprechen Sie Verkauf, Investment oder Sanierung mit GRENFORD.</p></div>'
            f'<a class="button" href="{contact_href}">Kontakt aufnehmen <span aria-hidden="true">↓</span></a></section>')
