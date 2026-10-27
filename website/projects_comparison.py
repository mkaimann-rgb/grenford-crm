"""Original Projects comparisons, sourced from grenford.de/projects/ (2026-10-22)."""
from html import escape as E
from paths import img

PROJECTS = [
    ('Dachgeschosswohnung', 'Innenausbau · ca. 35 m² · Dachgeschoss Berlin', 'dachgeschoss', 'Rohbau unter der Schräge',
     'Kompakte Dachgeschosswohnung mit Balkonzugang, ohne fertige Oberflächen und klare Raumwirkung.', 'Schlüsselfertiger Ausbau',
     'Eichenparkett, Spotinstallation, Maler- und Spachtelarbeiten, stimmige Materialwahl bis zur Übergabe.', '8 Wochen',
     'Ruhige, helle Wohnung mit klarem Grundriss trotz Dachschräge – von unfertigem Bestand zu einem Raum mit echtem Wohngefühl.'),
    ('Penthouse-Ausbau', 'Energetisch + Ausbau · Oberstes Geschoss Berlin', 'penthouse', 'Oberstes Geschoss',
     'Wenig Wohnkomfort, hohe Energiekosten – der Raum wirkte wie ein Dachboden statt wie ein repräsentatives Zuhause.', 'Energetisch & Innenausbau',
     'Wärmepumpe, KfW-Begleitung, hydraulischer Abgleich, plus Oberflächen und Ausbau für Penthouse-Charakter.', '14 Wochen',
     'Lichtdurchfluteter Wohnraum mit repräsentativem Charakter, moderner Haustechnik und deutlich verbesserter Energiebilanz.'),
]
SIZES = '(max-width:760px) 88vw, 45vw'


def comparisons():
    h = ('<section class="project-comparisons" id="beforeafter"><div class="comparison-heading"><div>'
         '<span class="eyebrow">GRENFORD PROJECTS / VORHER & NACHHER</span><h2>Bestand sehen.<br><span>Potenzial erkennen.</span></h2></div>'
         '<p>Zwei Perspektiven auf denselben Raum. Verschieben Sie den Regler und entdecken Sie, wie aus Bestand ein neues Zielbild wird.</p></div>'
         '<div class="comparison-grid">')
    for i, (title, meta, slug, start, desc, scope, work, weeks, result) in enumerate(PROJECTS, 1):
        t = E(title)
        h += (f'<article class="comparison-card"><header><span class="eyebrow">PROJEKT / {i:02d}</span><h3>{t}</h3><p>{E(meta)}</p></header>'
              f'<div class="comparison-stage" style="--split:50%">'
              + img(f'{slug}-before.webp', f'Bestand: {title}', SIZES, 'loading="lazy"')
              + img(f'{slug}-after.webp', f'Zielbild: {title}', SIZES, 'class="comparison-after" loading="lazy"')
              + '<span class="comparison-tag is-before" aria-hidden="true">Bestand</span><span class="comparison-tag is-after" aria-hidden="true">Zielbild</span>'
              '<span class="comparison-line" aria-hidden="true"><b>↔</b></span>'
              f'<input type="range" min="0" max="100" value="50" id="compare-{slug}" aria-label="Vorher-Nachher-Vergleich: {t}" aria-valuetext="50 Prozent Bestand, 50 Prozent Zielbild"></div>'
              '<div class="comparison-hint" aria-hidden="true"><span>← BESTAND</span><span>REGLER VERSCHIEBEN</span><span>ZIELBILD →</span></div>'
              f'<div class="comparison-details"><div><span class="eyebrow">AUSGANGSSITUATION</span><h4>{E(start)}</h4><p>{E(desc)}</p></div>'
              f'<div><span class="eyebrow">LEISTUNGSUMFANG</span><h4>{E(scope)}</h4><p>{E(work)}</p></div>'
              f'<div class="comparison-result"><span class="eyebrow">ERGEBNIS · {E(weeks.upper())}</span><p>{E(result)}</p></div></div></article>')
    return h + ('</div><div class="comparison-note"><p>Die Vergleiche zeigen Bestand und Zielbild als visuelle Orientierung. Die finale Umsetzung, '
                'Gestaltung und Kostenstruktur werden projektbezogen über das Renovation Memo und geeignete Fachpartner geprüft.</p>'
                '<a class="text-link" href="#memo">Vom Zielbild zum Renovation Memo ↗</a></div></section>')
