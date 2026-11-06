"""Englische Fassung: übersetzt die fertig gebauten deutschen Seiten anhand von i18n/en.json.

Schlüssel ist der deutsche Text eines Textknotens oder Attributs (Leerraum zusammengefasst), Wert die englische Fassung.
Übersetzt werden Textknoten, sichtbare Attribute (alt, aria-label, placeholder, title, Meta-Beschreibungen),
JSON-LD und die Zeichenketten in den Skripten (für Meldungen, die erst im Browser entstehen).
Was fehlt, sammelt `missing`; build.py meldet es, die Seite zeigt dann den deutschen Text.
"""
import html, json, re
from pathlib import Path

ROOT = Path(__file__).parent
FILE = ROOT / 'i18n' / 'en.json'
EN = json.loads(FILE.read_text(encoding='utf-8')) if FILE.exists() else {}
missing = {}  # deutscher Text -> erste Seite, auf der er fehlt
_DONE = set(EN.values())  # bereits englisch (z. B. <title> nach der Meta-Übersetzung)

# Texte ohne Buchstaben, Eigennamen und Adressen bleiben, wie sie sind
_SKIP = re.compile(r'^[\W\d_]*$|^(GRENFORD|Marco Kaimann|STAYNAMIC|kontakt@grenford\.de|Investment|Property|Projects|Investment Memo|Property Brief|Renovation Memo|'
                   r'GRENFORD / INVESTMENT|GRENFORD / PROPERTY|GRENFORD / PROJECTS|MARCO KAIMANN / GRÜNDER|WhatsApp|E-Mail|DE|EN|Off-Market|Core|Core\+|Value-Add|Opportunistic|'
                   r'Senior Living|Serviced Apartments|Asset Deal|Share Deal|Family Office|Multi-Tenant|Ist-Miete p\. a\.)$')
_ATTR = re.compile(r'(\s(?:alt|aria-label|placeholder|title|data-label|data-confirm|data-error|data-success)=")([^"]*)(")')
_META = re.compile(r'(<meta (?:name|property)="(?:description|og:title|og:description|og:image:alt|twitter:title|twitter:description)" content=")([^"]*)(")')


def _norm(s):
    return ' '.join(s.split())


def tr(text, where=''):
    """Einzelner Text: Übersetzung oder Original (und als fehlend vermerkt)."""
    key = _norm(text)
    if not key:
        return text
    if _SKIP.match(key):
        return numbers(text) if re.search(r'\d', key) else text
    if key in _DONE and key not in EN:
        return text
    if key in EN and EN[key]:
        lead = text[:len(text) - len(text.lstrip())]
        tail = text[len(text.rstrip()):]
        return lead + EN[key] + tail
    missing.setdefault(key, where)
    return text


def _tr_escaped(raw, where):
    plain = html.unescape(raw)
    out = tr(plain, where)
    return raw if out is plain else html.escape(out, quote=False)


def _ld(m, where):
    def walk(o):
        if isinstance(o, dict):
            return {k: (walk(v) if k not in ('@context', '@type', 'url', '@id', 'image', 'logo', 'telephone', 'email', 'sameAs') else v) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v) for v in o]
        return tr(o, where) if isinstance(o, str) else o
    try:
        data = json.loads(m.group(2))
    except ValueError:
        return m.group(0)
    return m.group(1) + json.dumps(walk(data), ensure_ascii=False) + m.group(3)


def page(doc, where):
    """Fertige deutsche Seite -> englische Seite."""
    doc = re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', lambda m: _ld(m, where), doc, flags=re.S)
    doc = _META.sub(lambda m: m.group(1) + html.escape(tr(html.unescape(m.group(2)), where), quote=True) + m.group(3), doc)
    doc = re.sub(r'(<title>)(.*?)(</title>)', lambda m: m.group(1) + html.escape(tr(html.unescape(m.group(2)), where), quote=False) + m.group(3), doc)

    parts = re.split(r'(<!--i18n:off-->.*?<!--i18n:on-->|<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)', doc, flags=re.S)
    for i, part in enumerate(parts):
        if not part or part.startswith('<!--i18n:off-->'):  # gesperrter Bereich (z. B. übernommene Rechtstexte)
            continue
        if part.startswith('<'):
            if part.startswith('<script') or part.startswith('<style'):
                continue
            parts[i] = _ATTR.sub(lambda m: m.group(1) + html.escape(tr(html.unescape(m.group(2)), where), quote=True) + m.group(3), part)
        elif part.strip():
            parts[i] = _tr_escaped(part, where)
    doc = ''.join(parts)
    return (doc.replace('<html lang="de">', '<html lang="en">', 1)
               .replace('content="de_DE"', 'content="en_GB"', 1))


# Zusammengesetzte Texte in Skripten (Platzhalter, Zahlenformat): genaue Ersetzungen vor der Übersetzung der Zeichenketten
JS_REPLACE = [
    ("'Schritt ' + step + ' von 6'", "'Step ' + step + ' of 6'"),
    ("step + ' von 6'", "step + ' of 6'"),
    ("'Schritt ' + (current + 1) + ' von ' + list.length", "'Step ' + (current + 1) + ' of ' + list.length"),
    ("' Prozent Bestand, '", "' percent existing condition, '"),
    ("' Prozent Zielbild'", "' percent result'"),
    ("new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €'",
     "new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))"),
    ("new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(n) + ' %'", "new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(n) + '%'"),
    ("`rund ${eur(perm2)} je m² Wohnfläche`", "`approx. ${eur(perm2)} per m² of living area`"),
    ("`Planung, Nebenkosten (${plLo}–${plHi} %)`", "`Planning, ancillary costs (${plLo}–${plHi}%)`"),
    ("`Puffer (${puffer} %)`", "`Buffer (${puffer}%)`"),
    ("`rund ${eur(tLo / area)} – ${eur(tHi / area)} je m² Wohnfläche`", "`approx. ${eur(tLo / area)} – ${eur(tHi / area)} per m² of living area`"),
    ("`${pct(rEk)} auf das Eigenkapital, ${pct(rEkJahr)} pro Jahr`", "`${pct(rEk)} on equity, ${pct(rEkJahr)} per year`"),
    ("eur(base) + '/m²'", "eur(base) + '/m²'"),
    ("area + ' m²'", "area + ' m²'"),
]

# Zeichenketten, die Skripte mit Formularwerten vergleichen (value-Attribute bleiben deutsch): nicht übersetzen
NO_JS = {'Suchprofil im Kundenauftrag', 'Immobilie / Portfolio verkaufen', 'Investment Memo / Objektinformationen', 'Immobilie verkaufen',
         'Kaufinteresse / Property Brief', 'Sanierung / Innenumbau planen'}

_NUM = re.compile(r'\d{1,3}(?:\.\d{3})+|\d+,\d+')


def numbers(text):
    """Deutsche Zahlen in englische Schreibweise: 1.810.000 € -> €1,810,000; 3,5 -> 3.5."""
    t = _NUM.sub(lambda m: m.group(0).replace('.', '\0').replace(',', '.').replace('\0', ','), text)
    t = re.sub(r'(\d[\d,.]*)\s?€(?!/)', r'€\1', t)
    t = re.sub(r'(\d[\d,.]*)\s?€/m²', r'€\1/m²', t)
    t = re.sub(r'(?<![€\d,.])(\d[\d,.]*)(\s?[–-]\s?)€', r'€\1\2€', t)
    return t


_JS_STR = re.compile(r"""'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`""")


def script(src, where):
    """Zeichenketten in Skripten übersetzen, sofern sie vollständig im Wörterbuch stehen (keine Selektoren, keine Platzhalter)."""
    def sub(m):
        q = "'" if m.group(1) is not None else ('"' if m.group(2) is not None else '`')
        body = m.group(1) if q == "'" else (m.group(2) if q == '"' else m.group(3))
        key = _norm(body)
        if '${' in body or key in NO_JS:
            return m.group(0)
        if key in EN and EN[key] and not _SKIP.match(key):
            out = EN[key].replace('\\', '\\\\').replace(q, '\\' + q)
            return q + out + q
        return m.group(0)
    for a, b in JS_REPLACE:
        src = src.replace(a, b)
    return _JS_STR.sub(sub, src)
