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
n, out = brief.build(os.path.abspath(sys.argv[1]))
print(f'{n} Seiten -> brief.html (PDF: {out})')
