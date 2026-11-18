#!/usr/bin/env python3
"""GRENFORD Property Brief erzeugen.

Aufruf:   python3 build.py objekte/<objektordner>
Danach:   node render.mjs objekte/<objektordner>
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import brief

if len(sys.argv) != 2:
    sys.exit(__doc__)
import re
n, out = brief.build(os.path.abspath(sys.argv[1]))
print(f'{n} Seiten -> brief.html (PDF: {out})')
# Prüfung: keine Platzhalter oder internen Hinweise im Brief für Interessenten
text = re.sub(r'<[^>]+>', ' ', open(os.path.join(sys.argv[1], 'brief.html'), encoding='utf-8').read().split('<body>')[1])
treffer = sorted(set(re.findall(r'\[[^\]]{0,60}\]|Beispiel nach Schema|Angabe folgt|wird nachgereicht', text)))
if treffer:
    print('ACHTUNG – noch nicht weitergabefähig, interne Hinweise/Platzhalter gefunden:')
    for t in treffer: print('  ', t)
