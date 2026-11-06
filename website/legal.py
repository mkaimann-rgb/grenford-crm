"""Rechtliche Seiten: Impressum, Datenschutz, Bildnachweise.

Die Texte stammen 1:1 von der bisherigen Live-Website (legal/de/*.html, legal/en/*.html; Quelle und Datum stehen
in der ersten Zeile jeder Datei). Sie werden hier nur in das GRENFORD-Layout gesetzt, nicht verändert.
Die englischen Fassungen sind die Übersetzungen der Live-Website und werden nicht über i18n/en.json übersetzt.
"""
import re
from pathlib import Path

import i18n
import paths
from paths import asset

ROOT = Path(__file__).parent
PAGES = ('imprint', 'privacy', 'photo-credits')
KICKER = {'de': 'Rechtliches', 'en': 'Legal'}


def load(name, lang):
    raw = (ROOT / 'legal' / lang / f'{name}.html').read_text(encoding='utf-8')
    title = re.search(r'<!-- title: (.*?) -->', raw).group(1)
    h1 = re.search(r'<!-- h1: (.*?) -->', raw).group(1)
    body = re.sub(r'<!--.*?-->\n?', '', raw).strip()
    body = re.sub(r'\{asset:([^}]+)\}', lambda m: asset(m.group(1)), body)
    return title, h1, body


def body(name):
    """Seiteninhalt in der Sprache des laufenden Builds. Der übernommene Text ist für i18n gesperrt."""
    lang = paths.lang
    title, h1, text = load(name, lang)
    html = (f'<section class="legal-hero"><p class="legal-kicker">{KICKER[lang]}</p><h1>{h1}</h1></section>'
            f'<article class="legal-page legal-{name}"><!--i18n:off-->{text}<!--i18n:on--></article>')
    plain = re.sub(r'<[^>]+>|&shy;', '', h1)
    meta = {'title': f'{plain} | GRENFORD', 'description': f'{plain} – GRENFORD, Kurfürstendamm 96, 10709 Berlin.'}
    if lang == 'en':  # bereits englisch: nicht als fehlende Übersetzung melden
        i18n._DONE.update({meta['title'], meta['description'], plain, KICKER['en']})
    return html, meta
