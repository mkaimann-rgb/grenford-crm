# Schneidet die gemeinfreien Natural-Earth-Daten (1:10 Mio.) auf den Ausschnitt Hochrhein / Nordschweiz zu.
# Aufruf: python3 -I geo_extrakt.py <ordner mit ne_10m_*.geojson>
import json, os, sys
from shapely.geometry import shape, box, mapping
SRC = sys.argv[1]; OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'geo', 'region.geojson')
BB = box(6.9, 46.95, 9.6, 48.45)
feats = []
def add(geom, props, simp=0.002):
    g = shape(geom).intersection(BB)
    if g.is_empty: return
    feats.append({'type': 'Feature', 'properties': props, 'geometry': mapping(g.simplify(simp, preserve_topology=True))})
for f in json.load(open(os.path.join(SRC, 'ne_10m_admin_0_countries.geojson')))['features']:
    iso = f['properties'].get('ADM0_A3')
    if iso in ('DEU', 'CHE', 'FRA', 'AUT', 'LIE'): add(f['geometry'], {'typ': 'land', 'iso': iso})
for f in json.load(open(os.path.join(SRC, 'ne_10m_admin_1_states_provinces.geojson')))['features']:
    p = f['properties']
    if p.get('adm0_a3') in ('CHE', 'DEU'): add(f['geometry'], {'typ': 'region', 'iso': p.get('adm0_a3'), 'name': p.get('name')})
for f in json.load(open(os.path.join(SRC, 'ne_10m_lakes.geojson')))['features']:
    add(f['geometry'], {'typ': 'see', 'name': f['properties'].get('name')})
for f in json.load(open(os.path.join(SRC, 'ne_10m_rivers_lake_centerlines.geojson')))['features']:
    add(f['geometry'], {'typ': 'fluss', 'name': f['properties'].get('name')}, .001)
json.dump({'type': 'FeatureCollection', 'features': feats}, open(OUT, 'w'), separators=(',', ':'))
print(len(feats), 'Features,', os.path.getsize(OUT) // 1024, 'KB')
