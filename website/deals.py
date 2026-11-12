"""Investment: geschützte Deal-Seite je Off-Market-Objekt (/investment/deals/<slug>/).

Aufbau nach dem GRENFORD Investment Memo (Kennzahlen, Angebot, Lage, Konzept, Zeitplan, Investorenrechnung,
Asset Check, Value Matrix, nächster Schritt). Daten je Deal als JSON in deals/<slug>.json.

Vertraulichkeit:
- Deal-Seiten entstehen nur im Vorschau-Build. In dist/ nur, wenn site.json "dealsPublish": true gesetzt ist,
  und das erst, nachdem der Zugangsschutz eingerichtet ist (Anleitung: deals/ZUGANG.md).
- Immer noindex, nie in der Sitemap, keine englische Fassung.
- Echte Deal-Daten gehören nicht in das öffentliche Repository (siehe deals/ZUGANG.md).
"""
import html, json
from pathlib import Path

from paths import SITE, page, img

E = html.escape
ROOT = Path(__file__).parent
DEALS = {p.stem: json.loads(p.read_text(encoding='utf-8')) for p in sorted((ROOT / 'deals').glob('*.json'))}


def _rows(rows, cls=''):
    return ''.join(f'<div class="{cls}"><dt>{E(a)}</dt>' + ''.join(f'<dd>{E(x)}</dd>' for x in r) + '</div>' for a, *r in rows)


def _table(head, rows):
    th = ''.join(f'<th scope="col">{E(h)}</th>' for h in head)
    tr = ''.join('<tr>' + ''.join(f'<td>{E(c)}</td>' if i else f'<th scope="row">{E(c)}</th>' for i, c in enumerate(r)) + '</tr>' for r in rows)
    return f'<div class="dl-table-wrap"><table class="dl-table"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'


def _status(s):
    return f'<span class="dl-status dl-status--{E(s["tone"])}">{E(s["label"])}</span>'


def body(slug):
    d = DEALS[slug]
    sample = ('<p class="dl-sample">Musterdaten: Struktur einer GRENFORD-Deal-Seite mit erfundenen Werten. Kein reales Objekt.</p>' if d.get('muster') else '')
    kpi = ''.join(f'<div><strong>{E(v)}</strong><span>{E(k)}</span></div>' for v, k in d['kpis'])
    money = ''.join(f'<div><span>{E(k)}</span><strong>{E(v)}</strong><small>{E(n)}</small></div>' for k, v, n in d['money'])
    hero = ('<section class="dl-hero"><figure class="dl-hero-img">' + img(d['image'], d['title'] + ', Visualisierung', '100vw', 'fetchpriority="high"') + '</figure>'
            f'<div class="dl-hero-copy"><p class="dl-conf">{E(d["confidential"])}</p><p class="eyebrow">{E(d["eyebrow"])}</p>'
            f'<h1>{E(d["title"])}</h1><p class="dl-claim">{E(d["claim"])}</p><p class="dl-intro">{E(d["intro"])}</p></div></section>'
            f'<div class="dl-kpis">{kpi}</div><div class="dl-money">{money}</div>')

    nav = ('<nav class="section-nav" aria-label="Seitenabschnitte"><a href="#angebot">Angebot</a><a href="#kennzahlen">Kennzahlen</a>'
           '<a href="#lage">Lage</a><a href="#konzept">Konzept</a><a href="#zeitplan">Zeitplan</a><a href="#rechnung">Investorenrechnung</a>'
           '<a href="#asset-check">Asset Check</a><a href="#value-matrix">Value Matrix</a><a href="#naechster-schritt">Nächster Schritt</a></nav>')

    o = d['offer']
    offer = ('<section class="dl-sec" id="angebot"><p class="eyebrow">Preis und Zahlungsstruktur</p><h2>' + E(o['title']) + '</h2>'
             '<div class="dl-grid"><div><div class="dl-prices">'
             f'<div class="dl-price-list"><span>Listenpreis</span><s>{E(o["list"])}</s></div>'
             f'<div class="dl-price-early"><span>{E(o["earlyLabel"])}</span><strong>{E(o["early"])}</strong></div></div>'
             f'<p>{E(o["note"])}</p>'
             + (''.join(f'<div class="dl-step"><b>{E(a)}</b><span>{E(b)}</span></div>' for a, b in o.get('staffel', [])) and
                '<p class="eyebrow">Optionale Kaufpreisstaffelung</p><div class="dl-steps">' + ''.join(f'<div><strong>{E(a)}</strong><span>{E(b)}</span></div>' for a, b in o.get('staffel', [])) + '</div>')
             + '</div><div><p class="eyebrow">Konditionen im Überblick</p><dl class="dl-terms">' + _rows(o['terms']) + '</dl>'
             f'<p class="dl-hint">{E(o["hint"])}</p></div></div></section>')

    k = d['facts']
    facts = ('<section class="dl-sec dl-sec--paper" id="kennzahlen"><p class="eyebrow">Zahlen, Daten, Fakten</p><h2>Das Projekt in Kennzahlen</h2>'
             '<div class="dl-hard">' + ''.join(f'<div><strong>{E(v)}</strong><span>{E(t)}</span></div>' for v, t in k['highlights']) + '</div>'
             '<div class="dl-grid">' + ''.join(f'<div class="dl-block"><h3>{E(b["title"])}</h3>' + (_table(b['head'], b['rows'])) + '</div>' for b in k['blocks']) + '</div>'
             f'<p class="dl-src">{E(k["source"])}</p></section>')

    loc = d['location']
    location = ('<section class="dl-sec" id="lage"><div class="dl-grid"><div><p class="eyebrow">Lage und Erreichbarkeit</p><h2>' + E(loc['title']) + '</h2>'
                f'<p class="dl-lead">{E(loc["text"])}</p>' + _table(['Ziel', 'Luftlinie', 'Pkw (ca.)'], loc['distances']) + '</div>'
                '<figure class="dl-figure">' + img(loc['image'], loc['caption'], '(max-width:900px) 92vw, 45vw', 'loading="lazy"') + f'<figcaption>{E(loc["caption"])}</figcaption></figure></div></section>')

    c = d['concept']
    concept = ('<section class="dl-sec dl-sec--paper" id="konzept"><p class="eyebrow">Nutzungskonzept</p><h2>' + E(c['title']) + '</h2>'
               '<div class="dl-grid"><div>' + _table(['Nutzung', 'Fläche', 'Konzept'], c['uses']) + '</div><div>' + _table(['Einheiten', 'Anzahl', 'Ø m²', 'm² gesamt'], c['units']) + '</div></div></section>')

    t = d['timeline']
    timeline = ('<section class="dl-sec" id="zeitplan"><p class="eyebrow">Meilensteine</p><h2>' + E(t['title']) + '</h2><ol class="dl-timeline">'
                + ''.join(f'<li class="{"is-done" if done else ""}"><time>{E(when)}</time><span>{E(what)}</span></li>' for when, what, done in t['steps']) + '</ol></section>')

    r = d['returns']
    returns = ('<section class="dl-sec dl-sec--dark" id="rechnung"><p class="eyebrow">Investorenrechnung, Basisfall</p><h2>' + E(r['title']) + '</h2>'
               '<div class="dl-hard dl-hard--dark">' + ''.join(f'<div><strong>{E(v)}</strong><span>{E(t)}</span></div>' for v, t in r['kpis']) + '</div>'
               + _table(r['head'], r['scenarios']) + f'<p class="dl-hint">{E(r["note"])}</p></section>')

    a = d['check']
    check = ('<section class="dl-sec dl-sec--paper" id="asset-check"><p class="eyebrow">GRENFORD Asset Check</p><h2>' + E(a['title']) + '</h2>'
             '<div class="dl-table-wrap"><table class="dl-table dl-check"><thead><tr><th scope="col">Unterlage</th><th scope="col">Status</th><th scope="col">Ergebnis</th></tr></thead><tbody>'
             + ''.join(f'<tr><th scope="row">{E(u)}</th><td>{_status(s)}</td><td>{E(res)}</td></tr>' for u, s, res in a['rows']) + '</tbody></table></div>'
             f'<p class="dl-hint"><strong>Bis zum Signing:</strong> {E(a["todo"])}</p></section>')

    v = d['matrix']
    matrix = ('<section class="dl-sec" id="value-matrix"><p class="eyebrow">Value Matrix</p><h2>Stärken nutzen, Hebel definieren</h2><div class="dl-matrix">'
              + ''.join(f'<div class="dl-q dl-q--{key}"><h3>{E(lab)}</h3><ul>' + ''.join(f'<li>{E(x)}</li>' for x in v[key]) + '</ul></div>'
                        for key, lab in (('strengths', 'Stärken'), ('levers', 'Hebel'), ('chances', 'Chancen'), ('risks', 'Marktrisiken')))
              + '</div></section>')

    steps = ''.join(f'<li><b>{i:02d}</b><div><h3>{E(h)}</h3><p>{E(p)}</p></div></li>' for i, (h, p) in enumerate(d['next'], 1))
    nxt = ('<section class="dl-sec dl-sec--paper" id="naechster-schritt"><div class="dl-grid"><div><p class="eyebrow">Nächster Schritt</p><h2>Ihr Interesse, Ihr nächster Schritt</h2>'
           f'<ol class="dl-next">{steps}</ol></div><div class="dl-contact"><p class="eyebrow">Ihr Ansprechpartner</p><strong>GRENFORD · Marco Kaimann</strong>'
           f'<p>{E(SITE["address"]["street"])} · {E(SITE["address"]["zip"])} {E(SITE["address"]["city"])}<br>{E(SITE["phone"])} · {E(SITE["email"])}</p>'
           f'<a class="button" href="{E(SITE["calendar"], quote=True)}" target="_blank" rel="noopener">Gespräch vereinbaren <span aria-hidden="true">↗</span></a></div></div></section>')

    legal = ('<section class="dl-legal"><p>Diese Seite dient ausschließlich der unverbindlichen Information des namentlich freigeschalteten Empfängers und ist kein Angebot im rechtlichen Sinne. '
             'Alle Angaben beruhen auf Informationen Dritter und Annahmen von GRENFORD; Prognosen und Renditeberechnungen sind unverbindliche Einschätzungen. '
             'Maßgeblich sind ausschließlich notariell beurkundete Verträge. Weitergabe, Veröffentlichung oder Vervielfältigung nur mit schriftlicher Zustimmung von GRENFORD.</p></section>')
    return hero + sample + nav + offer + facts + location + concept + timeline + returns + check + matrix + nxt + legal


def meta(slug):
    d = DEALS[slug]
    return {'title': f'{d["title"]} · Investment Memo | GRENFORD Investment', 'description': d['claim']}
