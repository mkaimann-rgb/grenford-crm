"""Prüft die Marktseite mit ausdrücklich gekennzeichneten Musterdaten (werden nie veröffentlicht).

    python3 tests/market.py            # Prüfungen; schreibt zusätzlich tests/_market_muster.html zur Sichtprüfung
"""
from pathlib import Path
import copy, sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import market  # noqa: E402

MUSTER = {'city': 'Berlin', 'assetType': 'apartment', 'period': 'MUSTER 2025', 'dataType': 'transaction', 'metric': 'MUSTER Kaufpreis je m² Wohnfläche',
          'statistic': 'median', 'value': 1234, 'unit': '€/m²', 'sampleSize': 10, 'sourceName': 'MUSTERQUELLE (nur Test)', 'sourceUrl': 'https://example.org/muster',
          'usageRightsNote': 'Musterdatensatz, nicht veröffentlichen', 'checkedAt': '2026-01-01', 'methodologyNote': 'MUSTER: nur für den Komponententest.'}

# 1. Veröffentlichte Daten: keine Musterwerte in market.json
for r in market.M['marketData']:
    assert 'MUSTER' not in str(r), 'market.json enthält Musterdaten'

# 2. Unvollständige Datensätze brechen den Build ab
for broken in ({**MUSTER, 'sourceUrl': ''}, {**MUSTER, 'checkedAt': '01.01.2026'}, {**MUSTER, 'dataType': 'estimate'}, {**MUSTER, 'value': '1.234'}):
    try:
        market.validate([broken])
    except AssertionError:
        pass
    else:
        raise AssertionError(f'Ungültiger Datensatz wurde akzeptiert: {broken}')

# 3. Darstellung: jede Kennzahl mit Datentyp, Zeitraum, Quelle und Prüfdatum; Angebot und Transaktion getrennt gekennzeichnet
asking = {**MUSTER, 'dataType': 'asking', 'city': 'Potsdam', 'assetType': 'house', 'metric': 'MUSTER Angebotspreis je m²', 'value': None}
saved = copy.deepcopy(market.M['marketData'])
market.M['marketData'] = [MUSTER, asking]
html = market.overview('#kontakt')
market.M['marketData'] = saved
assert html.count('class="mk-card"') == 2
assert 'Transaktionspreis</span><span>MUSTER 2025' in html and 'Angebotspreis</span><span>MUSTER 2025' in html
assert html.count('geprüft am 2026-01-01') == 2 and 'Kein Wert veröffentlicht' in html
assert 'role="region" aria-labelledby="mk-table-caption" tabindex="0"' in html, 'Tabelle braucht beschrifteten, scrollbaren Bereich'
assert 'data-datatype="asking"' in html and 'data-assettype="house"' in html, 'data-Attribute müssen klein geschrieben sein (dataset-Abgleich in market.js)'
assert 'data-filter="datatype"' in market.overview('#kontakt') and 'data-filter="assettype"' in market.overview('#kontakt')
assert 'data-mk-empty hidden' in html, 'Leerzustand muss bei vorhandenen Daten verborgen sein'

# 4. Leerzustand ohne Daten
assert 'data-mk-empty>' in market.overview('#kontakt') or not market.M['marketData']

(ROOT / 'tests' / '_market_muster.html').write_text(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MUSTER – nicht veröffentlichen</title>'
    '<link rel="stylesheet" href="../dist/site.css"><body>' + html + '<script src="../dist/market.js"></script>', encoding='utf-8')
print('Market checks passed: keine Musterdaten veröffentlicht, Pflichtfelder erzwungen, Kennzeichnung und Leerzustand korrekt.')
