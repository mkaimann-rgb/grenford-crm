"""Original Projects comparisons, sourced from grenford.de/projects/ (2026-10-22)."""
from html import escape as E
from paths import img

PROJECTS = [
    ('Dachgeschosswohnung', 'Innenausbau · ca. 35 m² · Dachgeschoss Berlin', 'dachgeschoss', 'Rohbau unter der Schräge',
     'Kompakte Dachgeschosswohnung mit Balkonzugang, ohne fertige Oberflächen und klare Raumwirkung.', 'Schlüsselfertiger Ausbau',
     'Eichenparkett, Spotinstallation, Maler- und Spachtelarbeiten, stimmige Materialwahl bis zur Übergabe.', '3,5 Monate',
     'Ruhige, helle Wohnung mit klarem Grundriss trotz Dachschräge. Aus unfertigem Bestand wurde zu einem Raum mit echtem Wohngefühl.'),
    ('Penthouse-Ausbau', 'Energetisch + Ausbau · Oberstes Geschoss Berlin', 'penthouse', 'Oberstes Geschoss',
     'Wenig Wohnkomfort, hohe Energiekosten. Der Raum wirkte wie ein Dachboden statt wie ein repräsentatives Zuhause.', 'Energetisch & Innenausbau',
     'Wärmepumpe, KfW-Begleitung, hydraulischer Abgleich, plus Oberflächen und Ausbau für Penthouse-Charakter.', '7 Monate',
     'Lichtdurchfluteter Wohnraum mit repräsentativem Charakter, moderner Haustechnik und deutlich verbesserter Energiebilanz.'),
]
SIZES = '(max-width:760px) 88vw, 45vw'


def comparisons():
    h = ('<section class="project-comparisons" id="beforeafter"><div class="comparison-heading"><div>'
         '<h2>Derselbe Raum, vor und nach der Sanierung</h2></div>'
         '<p>Schieben Sie den Regler zur Seite. Links der Bestand, rechts das Ergebnis. Beides als Visualisierung eines realen Projekts.</p></div>'
         '<div class="comparison-grid">')
    for i, (title, meta, slug, start, desc, scope, work, weeks, result) in enumerate(PROJECTS, 1):
        t = E(title)
        h += (f'<article class="comparison-card"><header><h3>{t}</h3><p>{E(meta)}</p></header>'
              f'<div class="comparison-stage" style="--split:50%">'
              + img(f'{slug}-before.webp', f'Bestand: {title}', SIZES, 'loading="lazy"')
              + img(f'{slug}-after.webp', f'Ergebnis, Visualisierung: {title}', SIZES, 'class="comparison-after" loading="lazy"')
              + '<span class="comparison-tag is-before" aria-hidden="true">Bestand</span><span class="comparison-tag is-after" aria-hidden="true">Ergebnis</span>'
              '<span class="comparison-line" aria-hidden="true"><b>↔</b></span>'
              f'<input type="range" min="0" max="100" value="50" id="compare-{slug}" aria-label="Vorher-Nachher-Vergleich: {t}" aria-valuetext="50 Prozent Bestand, 50 Prozent Ergebnis"></div>'
              '<div class="comparison-hint" aria-hidden="true"><span>← BESTAND</span><span>REGLER ZIEHEN</span><span>ERGEBNIS →</span></div>'
              f'<div class="comparison-details"><div><small>Vorher</small><h4>{E(start)}</h4><p>{E(desc)}</p></div>'
              f'<div><small>Was gemacht wurde</small><h4>{E(scope)}</h4><p>{E(work)}</p></div>'
              f'<div class="comparison-result"><small>Bauzeit im realen Projekt: {E(weeks)}</small><p>{E(result)}</p></div></div></article>')
    return h + ('</div><div class="comparison-note"><p>Die Beispiele beruhen auf realen GRENFORD-Projekten. Aus Datenschutzgründen zeigt GRENFORD keine Fotos aus Kundenobjekten, '
                'sondern Visualisierungen von Bestand und Ergebnis. Kosten und Umfang jedes Vorhabens werden im Renovation Memo geprüft.</p>'
                '<a class="text-link" href="#memo">Vom Vergleich zum Renovation Memo ↗</a></div></section>')
