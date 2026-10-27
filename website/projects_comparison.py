"""Original Projects comparisons, sourced from grenford.de/projects/ (2026-10-22)."""
from html import escape as E
from paths import img

PROJECTS = [
    ('Dachgeschosswohnung', 'Innenausbau · ca. 35 m² · Dachgeschoss Berlin', 'dachgeschoss', 'Rohbau unter der Schräge',
     'Kompakte Dachgeschosswohnung mit Balkonzugang, ohne fertige Oberflächen und klare Raumwirkung.', 'Schlüsselfertiger Ausbau',
     'Eichenparkett, Spotinstallation, Maler- und Spachtelarbeiten, stimmige Materialwahl bis zur Übergabe.', '8 Wochen',
     'Ruhige, helle Wohnung mit klarem Grundriss trotz Dachschräge. Aus unfertigem Bestand wurde zu einem Raum mit echtem Wohngefühl.'),
    ('Penthouse-Ausbau', 'Energetisch + Ausbau · Oberstes Geschoss Berlin', 'penthouse', 'Oberstes Geschoss',
     'Wenig Wohnkomfort, hohe Energiekosten. Der Raum wirkte wie ein Dachboden statt wie ein repräsentatives Zuhause.', 'Energetisch & Innenausbau',
     'Wärmepumpe, KfW-Begleitung, hydraulischer Abgleich, plus Oberflächen und Ausbau für Penthouse-Charakter.', '14 Wochen',
     'Lichtdurchfluteter Wohnraum mit repräsentativem Charakter, moderner Haustechnik und deutlich verbesserter Energiebilanz.'),
]
SIZES = '(max-width:760px) 88vw, 45vw'


def comparisons():
    h = ('<section class="project-comparisons" id="beforeafter"><div class="comparison-heading"><div>'
         '<span class="eyebrow">Vorher und nachher</span><h2>Derselbe Raum, vor und nach der Sanierung</h2></div>'
         '<p>Schieben Sie den Regler zur Seite. Links der Bestand, rechts das Zielbild.</p></div>'
         '<div class="comparison-grid">')
    for i, (title, meta, slug, start, desc, scope, work, weeks, result) in enumerate(PROJECTS, 1):
        t = E(title)
        h += (f'<article class="comparison-card"><header><h3>{t}</h3><p>{E(meta)}</p></header>'
              f'<div class="comparison-stage" style="--split:50%">'
              + img(f'{slug}-before.webp', f'Bestand: {title}', SIZES, 'loading="lazy"')
              + img(f'{slug}-after.webp', f'Zielbild: {title}', SIZES, 'class="comparison-after" loading="lazy"')
              + '<span class="comparison-tag is-before" aria-hidden="true">Bestand</span><span class="comparison-tag is-after" aria-hidden="true">Zielbild</span>'
              '<span class="comparison-line" aria-hidden="true"><b>↔</b></span>'
              f'<input type="range" min="0" max="100" value="50" id="compare-{slug}" aria-label="Vorher-Nachher-Vergleich: {t}" aria-valuetext="50 Prozent Bestand, 50 Prozent Zielbild"></div>'
              '<div class="comparison-hint" aria-hidden="true"><span>← BESTAND</span><span>REGLER VERSCHIEBEN</span><span>ZIELBILD →</span></div>'
              f'<div class="comparison-details"><div><small>Vorher</small><h4>{E(start)}</h4><p>{E(desc)}</p></div>'
              f'<div><small>Was gemacht wurde</small><h4>{E(scope)}</h4><p>{E(work)}</p></div>'
              f'<div class="comparison-result"><small>Ergebnis nach {E(weeks)}</small><p>{E(result)}</p></div></div></article>')
    return h + ('</div><div class="comparison-note"><p>Die Vergleiche zeigen Bestand und Zielbild als visuelle Orientierung. Die finale Umsetzung, '
                'Gestaltung und Kostenstruktur werden projektbezogen über das Renovation Memo und geeignete Fachpartner geprüft.</p>'
                '<a class="text-link" href="#memo">Vom Zielbild zum Renovation Memo ↗</a></div></section>')
