"""GRENFORD Ratgeber: Übersicht /ratgeber/ und Beiträge /ratgeber/<slug>/.

Status je Beitrag:
  'entwurf'     erscheint nur im Vorschau-Build (build.py --preview) mit Entwurfs-Hinweis und noindex.
  'freigegeben' wird veröffentlicht, auf der Übersicht verlinkt und in die Sitemap aufgenommen.
Links auf Beiträge, die in der jeweiligen Fassung nicht erscheinen, werden als normaler Text ausgegeben.

Bausteine für Beiträge (blocks): h2, p, list, checklist, table, flow, plan, example, note.
Fiktive Beispiele und schematische Pläne sind im Inhalt ausdrücklich gekennzeichnet.
"""
import html, re
from datetime import date
from paths import page, img, asset

E = html.escape
SHOW_DRAFTS = False  # build.py setzt True im Vorschau-Build

AREAS = {
    'property': {'label': 'Property', 'topic': 'Wohnimmobilien kaufen und verkaufen', 'question': 'Wie bereite ich Kauf oder Verkauf einer Wohnung vor?',
                 'text': 'Unterlagen, Rechte und Zustand einer Wohnung oder eines Hauses verstehen, bevor Sie verkaufen oder kaufen.'},
    'investment': {'label': 'Investment', 'topic': 'Transaktionen vorbereiten', 'question': 'Wie bereite ich eine Transaktion vor?',
                   'text': 'Vermarktungsweg, Käuferkreis und Unterlagen für Anlageimmobilien festlegen, bevor der erste Investor anfragt.'},
    'projects': {'label': 'Projects', 'topic': 'Sanierungen und Umbauten vorbereiten', 'question': 'Wie bereite ich einen Umbau vor?',
                 'text': 'Maßnahmen ordnen, Bauangebote vergleichbar machen und Kosten realistisch einschätzen, bevor Sie beauftragen.'},
}
AREAS['markt'] = {'label': 'Markt', 'topic': 'Marktanalyse', 'question': '', 'text': ''}
AREA_ORDER = ('investment', 'property', 'projects')
RESEARCH = '04.11.2026'  # Recherchestand der Marktzahlen
GD = 'Gutachterausschuss für Grundstückswerte in Berlin'
FEATURED = 'bauangebote-vergleichen'
PLANNED = [('property', 'Kaufangebote vergleichen: Preis, Bedingungen und Sicherheit der Finanzierung'),
           ('investment', 'Ankaufunterlagen: Was eine erste Ankaufprüfung braucht')]


# ---------------------------------------------------------------- Schematische Pläne (SVG). Kurze Marker im Plan, Erklärung als HTML-Legende.

def _marker(x, y, n, cls=''):
    return f'<g class="pl-marker{cls}" transform="translate({x} {y})"><circle r="19"/><text y="7" text-anchor="middle">{n}</text></g>'


PLAN_TEILUNG = (
    '<svg class="rg-plan" viewBox="0 0 640 420" role="img" aria-labelledby="plan-teilung-t">'
    '<title id="plan-teilung-t">Schematischer Aufteilungsplan eines Erdgeschosses mit zwei Wohnungen, Treppenhaus und zwei Abstellräumen</title>'
    '<rect x="20" y="20" width="600" height="380" class="pl-wall"/>'
    '<rect x="20" y="20" width="250" height="380" class="pl-se1"/>'          # Wohnung 1
    '<rect x="390" y="20" width="230" height="380" class="pl-se2"/>'         # Wohnung 2
    '<rect x="270" y="20" width="120" height="250" class="pl-ge"/>'          # Treppenhaus (Gemeinschaftseigentum)
    '<rect x="270" y="270" width="60" height="130" class="pl-se1"/>'         # Abstellraum 1 laut Plan
    '<rect x="330" y="270" width="60" height="130" class="pl-se2"/>'         # Abstellraum 2 laut Plan
    '<rect x="270" y="270" width="60" height="130" class="pl-check"/>'       # Prüfstelle
    '<path class="pl-line" d="M20 220H120M170 220H270M390 200H470M520 200H620M120 20V120M270 120V270M390 120V270M330 270V400"/>'
    '<text class="pl-room" x="145" y="120" text-anchor="middle">Nr. 1</text>'
    '<text class="pl-room" x="505" y="120" text-anchor="middle">Nr. 2</text>'
    '<text class="pl-room pl-small" x="330" y="150" text-anchor="middle">TH</text>'
    '<text class="pl-room pl-small" x="300" y="345" text-anchor="middle">1</text>'
    '<text class="pl-room pl-small" x="360" y="345" text-anchor="middle">2</text>'
    + _marker(145, 300, 'A') + _marker(505, 300, 'B') + _marker(330, 205, 'C') + _marker(300, 300, '!', ' is-check') +
    '</svg>')

PLAN_SNR = (
    '<svg class="rg-plan" viewBox="0 0 640 420" role="img" aria-labelledby="plan-snr-t">'
    '<title id="plan-snr-t">Schematischer Lageplan: Wohnhaus, zwei Gartenflächen mit Sondernutzungsrecht, gemeinschaftlicher Hof und vier Stellplätze</title>'
    '<rect x="20" y="20" width="600" height="380" class="pl-ground"/>'
    '<rect x="200" y="40" width="240" height="150" class="pl-house"/>'
    '<text class="pl-room" x="320" y="125" text-anchor="middle">Haus</text>'
    '<rect x="40" y="210" width="250" height="170" class="pl-se1"/>'         # Garten SNR Whg 1
    '<rect x="350" y="210" width="250" height="170" class="pl-se2"/>'        # Garten SNR Whg 2
    '<rect x="290" y="210" width="60" height="170" class="pl-ge"/>'          # Weg gemeinschaftlich
    '<rect x="40" y="40" width="140" height="150" class="pl-ge"/>'           # Hof gemeinschaftlich
    + ''.join(f'<rect x="{460 + (i % 2) * 70}" y="{40 + (i // 2) * 75}" width="60" height="65" class="pl-park{" pl-check-fill" if i == 2 else ""}"/>'
              f'<text class="pl-room pl-small" x="{490 + (i % 2) * 70}" y="{80 + (i // 2) * 75}" text-anchor="middle">S{i + 1}</text>' for i in range(4))
    + _marker(165, 295, 'A') + _marker(475, 295, 'B') + _marker(110, 115, 'C') + _marker(490, 160, '!', ' is-check') +
    '</svg>')


PLAN_BRW = (
    '<svg class="rg-plan" viewBox="0 0 640 440" role="img" aria-labelledby="plan-brw-t">'
    '<title id="plan-brw-t">Schematische Bodenrichtwertkarte mit drei Zonen, Straßen und einem markierten Grundstück</title>'
    '<rect x="20" y="20" width="600" height="400" class="pl-ground"/>'
    '<path class="brw-z1" d="M20 20H360L300 240H20Z"/>'
    '<path class="brw-z2" d="M360 20H620V300H300L300 240Z"/>'
    '<path class="brw-z3" d="M20 240H300V300H620V420H20Z"/>'
    '<path class="brw-road" d="M20 248H630M330 20L270 430"/>'
    '<path class="brw-border" d="M360 20L300 240H20M300 240V300H620"/>'
    '<g class="brw-lot"><rect x="120" y="120" width="96" height="70"/></g>'
    '<g class="brw-label" transform="translate(150 70)"><rect x="-70" y="-32" width="140" height="64" rx="6"/><text y="-5" text-anchor="middle">850</text><text class="s" y="21" text-anchor="middle">W · GFZ 1,2</text></g>'
    '<g class="brw-label" transform="translate(480 150)"><rect x="-70" y="-32" width="140" height="64" rx="6"/><text y="-5" text-anchor="middle">1.400</text><text class="s" y="21" text-anchor="middle">M · GFZ 2,5</text></g>'
    '<g class="brw-label" transform="translate(160 350)"><rect x="-70" y="-32" width="140" height="64" rx="6"/><text y="-5" text-anchor="middle">620</text><text class="s" y="21" text-anchor="middle">W · GFZ 0,4</text></g>'
    + _marker(168, 155, '!', ' is-check') +
    '</svg>')


# ---------------------------------------------------------------- Beiträge

ARTICLES = [
 {
  'slug': 'bauangebote-vergleichen', 'areas': ['projects'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Drei Bauangebote, drei Preise: So vergleichen Sie den Leistungsumfang',
  'meta_title': 'Bauangebote vergleichen: Leistungsumfang statt Endpreis | GRENFORD Ratgeber',
  'description': 'Warum drei Angebote für dieselbe Sanierung selten vergleichbar sind und wie Sie Leistungen, Mengen und offene Punkte nebeneinanderlegen. Mit Checkliste und fiktivem Beispiel.',
  'lead': 'Drei Baufirmen, drei Endsummen, die zehntausend Euro auseinanderliegen. Meist steckt der Unterschied nicht im Preis, sondern darin, was jeweils enthalten ist. Wer nur die Summe vergleicht, vergleicht oft drei verschiedene Bauvorhaben.',
  'key': ['Vergleichen Sie Positionen, nicht Endsummen: Was fehlt, wird später teuer.',
          'Eine gemeinsame Leistungsbeschreibung macht Angebote überhaupt erst vergleichbar.',
          'Rechnen Sie fehlende Leistungen in jedes Angebot ein, bevor Sie entscheiden.'],
  'next': ('Angebote vergleichen lassen', 'projects', '#memo', 'Im Renovation Memo stellt GRENFORD Ihre Originalangebote anonymisiert als A, B und C gegenüber.'),
  'related': ['renovieren-modernisieren-sanieren', 'vor-dem-verkauf-sanieren'],
  'review': ['Hinweis auf DIN 18534 (Abdichtung von Innenräumen) fachlich bestätigen', 'Aussagen zu Gewährleistung allgemein halten oder juristisch prüfen lassen'],
  'blocks': [
   ('h2', 'warum', 'Warum die Endsummen so weit auseinanderliegen'),
   ('p', 'Jede Firma kalkuliert, was sie unter Ihrem Vorhaben versteht. Die eine rechnet Abbruch und Entsorgung ein, die andere setzt voraus, dass der Raum leer übergeben wird. Die eine plant ein Markenprodukt, die andere „gleichwertig“. Kleine Unterschiede in vielen Positionen ergeben am Ende große Unterschiede in der Summe.'),
   ('list', ['Unterschiedliche Mengen, zum Beispiel Fliesen nur am Boden oder raumhoch',
             'Fehlende Positionen wie Baustelleneinrichtung, Schutz der Böden oder Entsorgung',
             'Ausstattung als Platzhalter („nach Wahl“, „gleichwertig“) statt mit Fabrikat',
             'Eventualpositionen, die nur „bei Bedarf“ anfallen, aber oft gebraucht werden']),
   ('h2', 'grundlage', 'Erst die Grundlage, dann die Angebote'),
   ('p', 'Vergleichbar werden Angebote nur, wenn alle Firmen dasselbe anbieten. Dafür reicht eine kurze, gemeinsame Leistungsbeschreibung: Was soll gemacht werden, in welchem Umfang, mit welcher Ausstattung, bis wann. Diese Beschreibung geht an alle Firmen gleichzeitig.'),
   ('h2', 'matrix', 'Die Vergleichsmatrix'),
   ('p', 'Legen Sie die Angebote Position für Position nebeneinander. Markieren Sie, was enthalten ist, was fehlt und was unklar bleibt. Das folgende Beispiel zeigt, wie sich das Bild dabei dreht.'),
   ('table', 'Fiktives Beispiel: Badsanierung, 8 m², drei Angebote', ['Position', 'Angebot A', 'Angebot B', 'Angebot C'], [
     ['Rückbau und Entsorgung', 'enthalten', 'nicht enthalten', 'enthalten'],
     ['Abdichtung nach DIN 18534', 'enthalten', 'enthalten', 'unklar'],
     ['Elektro (Leitungen, Spiegelleuchte)', 'nicht enthalten', 'enthalten', 'enthalten'],
     ['Fliesen', 'nur Boden', 'raumhoch', 'raumhoch'],
     ['Sanitärobjekte', 'Platzhalter', 'mit Fabrikat', 'mit Fabrikat'],
     ['Baustelleneinrichtung, Schutz', 'nicht enthalten', 'enthalten', 'enthalten'],
     ['Endsumme laut Angebot', '38.400 €', '46.900 €', '52.300 €']],
    'Alle Zahlen sind erfunden und gelten für kein reales Bauvorhaben.'),
   ('example', 'Was nach der Bereinigung übrig bleibt',
    '<p>Rechnet man in Angebot A die fehlenden Leistungen ein (Entsorgung, Elektro, raumhohe Fliesen, Baustelleneinrichtung) und in Angebot B die Entsorgung, '
    'liegen die Angebote plötzlich eng beieinander:</p><ul><li>Angebot A bereinigt: rund 49.500 €</li><li>Angebot B bereinigt: rund 48.700 €</li>'
    '<li>Angebot C: 52.300 €, Abdichtung noch klären</li></ul><p>Das vermeintlich günstigste Angebot ist nach der Bereinigung nicht mehr das günstigste.</p>'),
   ('h2', 'checkliste', 'Checkliste vor der Beauftragung'),
   ('checklist', 'Bevor Sie unterschreiben', [
     'Alle Firmen haben dieselbe Leistungsbeschreibung erhalten.',
     'Jede Position ist mit Menge und Einheit angegeben, nicht nur pauschal.',
     'Ausstattung ist mit Fabrikat oder Preisklasse benannt.',
     'Abbruch, Entsorgung und Schutzmaßnahmen sind geklärt.',
     'Eventualpositionen sind aufgeführt und mit Preisen versehen.',
     'Zeitplan, Zahlungsplan und Gewährleistung stehen schriftlich im Angebot.',
     'Offene Punkte sind schriftlich nachgefragt und beantwortet.']),
   ('p', 'Welche Maßnahmen überhaupt in die Leistungsbeschreibung gehören, klärt der Beitrag [[renovieren-modernisieren-sanieren|Renovieren, modernisieren oder sanieren?]].'),
  ],
 },
 {
  'slug': 'renovieren-modernisieren-sanieren', 'areas': ['projects'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Renovieren, modernisieren oder sanieren?',
  'meta_title': 'Renovieren, modernisieren oder sanieren? Nach Anlass entscheiden | GRENFORD Ratgeber',
  'description': 'Was der Unterschied zwischen Renovierung, Modernisierung und Sanierung ist, welcher Anlass welche Maßnahmen verlangt und in welcher Reihenfolge Sie umbauen sollten. Mit fiktivem Beispiel.',
  'lead': 'Die drei Begriffe werden oft gleich verwendet, meinen aber Verschiedenes. Wichtiger als das Wort ist der Anlass: Ob Sie Schäden beheben, selbst einziehen, vermieten oder verkaufen wollen, entscheidet darüber, was sich lohnt und in welcher Reihenfolge.',
  'key': ['Renovieren frischt auf, Modernisieren verbessert, Sanieren behebt Schäden.',
          'Der Anlass bestimmt, welche Maßnahmen sich lohnen.',
          'Erst was in der Wand liegt, dann was man sieht: Die Reihenfolge spart Geld.'],
  'next': ('Wert nach Sanierung ermitteln', 'projects', '#bewertung-projects-value', 'Sie beschreiben Ihre Immobilie und Ihr Vorhaben und erhalten eine Einordnung, was die Maßnahmen kosten und was sie bringen.'),
  'related': ['bauangebote-vergleichen', 'vor-dem-verkauf-sanieren'],
  'review': ['Abgrenzung der Begriffe allgemein gehalten; bei Bezug auf Mietrecht (§ 555b BGB) juristisch prüfen lassen'],
  'blocks': [
   ('h2', 'begriffe', 'Drei Begriffe, drei Ziele'),
   ('table', 'Abgrenzung im Überblick', ['', 'Renovieren', 'Modernisieren', 'Sanieren'], [
     ['Ziel', 'Optik auffrischen', 'Standard verbessern', 'Schäden und Mängel beheben'],
     ['Typische Maßnahmen', 'Malerarbeiten, Böden aufarbeiten', 'neues Bad, Heizung, Fenster, Elektrik', 'Feuchte, Leitungen, Dach, Statik'],
     ['Wirkung', 'besserer Eindruck', 'höherer Wohnwert, oft Energieersparnis', 'Substanz gesichert, Risiko gesenkt']], ''),
   ('h2', 'anlass', 'Nach Anlass entscheiden'),
   ('flow', [('Schäden klären', 'Zuerst Ursache und Umfang feststellen lassen, etwa Feuchte, alte Leitungen oder undichte Fenster. Ohne diese Klärung wird jede weitere Maßnahme zum Risiko.'),
             ('Selbst einziehen', 'Hier zählt Ihr Wohnwert: Grundriss, Bad, Küche, Licht. Planen Sie, was Sie in den nächsten Jahren nicht wieder anfassen möchten.'),
             ('Vermieten', 'Robuste, pflegeleichte Ausstattung, die Mieter erwarten. Bei bestehenden Mietverhältnissen gelten besondere Regeln für Modernisierungen.'),
             ('Verkaufen', 'Nur was Käufer bezahlen oder was ihre Unsicherheit senkt. Oft reicht eine gezielte Auffrischung; mehr dazu im Beitrag zum Verkauf.')]),
   ('h2', 'reihenfolge', 'Die richtige Reihenfolge'),
   ('p', 'Teuer wird es, wenn fertige Oberflächen für eine spätere Maßnahme wieder geöffnet werden müssen. Deshalb gilt: Erst was in Wänden und Böden liegt, dann was man sieht.'),
   ('example', 'Fiktiver Wohnungsumbau: 3 Zimmer, 78 m², Altbau',
    '<p>Die Eigentümerin möchte einziehen. Bei der Besichtigung fallen auf: alte Elektrik, Feuchte hinter der Badewanne, abgenutzte Dielen, ein dunkler Flur.</p>'
    '<ol><li><strong>Schäden und Sicherheit:</strong> Ursache der Feuchte klären, Elektrik erneuern lassen.</li>'
    '<li><strong>Leitungen vor Oberflächen:</strong> Elektro- und Sanitärleitungen verlegen, bevor geputzt und gefliest wird.</li>'
    '<li><strong>Grundriss und Bad:</strong> Wand zum Flur öffnen, Bad neu aufbauen.</li>'
    '<li><strong>Böden und Wände:</strong> Dielen aufarbeiten, Malerarbeiten zum Schluss.</li>'
    '<li><strong>Ausstattung:</strong> Leuchten, Küche, Einbauten.</li></ol>'
    '<p>Wer die Reihenfolge umdreht, etwa zuerst die Dielen schleift und dann neue Leitungen verlegt, bezahlt Teile der Arbeit zweimal.</p>'),
   ('p', 'Sobald feststeht, was gemacht werden soll, geht es um die Angebote: [[bauangebote-vergleichen|Drei Bauangebote, drei Preise: So vergleichen Sie den Leistungsumfang]].'),
  ],
 },
 {
  'slug': 'teilungserklaerung-pruefen', 'areas': ['property'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Teilungserklärung: Was Käufer vor dem Wohnungskauf prüfen sollten',
  'meta_title': 'Teilungserklärung prüfen vor dem Wohnungskauf | GRENFORD Ratgeber',
  'description': 'Was in der Teilungserklärung steht, wie Sie den Aufteilungsplan lesen und wo Plan und Bestand häufig voneinander abweichen. Mit schematischem Beispiel und Checkliste.',
  'lead': 'Wer eine Eigentumswohnung kauft, kauft mehr als die Wohnung: einen Anteil an einer Gemeinschaft mit eigenen Regeln. Die Teilungserklärung legt fest, was Ihnen allein gehört, was allen gehört und wer was nutzen darf. Ein Blick hinein gehört vor jeden Kauf.',
  'key': ['Die Teilungserklärung bestimmt, was zu Ihrer Wohnung gehört und was der Gemeinschaft.',
          'Gleichen Sie den Aufteilungsplan mit dem tatsächlichen Bestand ab.',
          'Achten Sie auf Nutzungsregeln, Kostenverteilung und Sondernutzungsrechte.'],
  'next': ('Suchprofil hinterlegen', 'property', '#bewertung-property-search', 'Sie beschreiben, was Sie suchen. Zu passenden Wohnungen erhalten Sie die Unterlagen vorab, auch die Teilungserklärung.'),
  'related': ['grundbuchauszug-anfordern', 'sondernutzungsrecht-pruefen'],
  'review': ['Rechtliche Aussagen zum Wohnungseigentumsgesetz (WEG) vor Veröffentlichung juristisch prüfen lassen'],
  'blocks': [
   ('h2', 'inhalt', 'Was in der Teilungserklärung steht'),
   ('list', ['<strong>Sondereigentum:</strong> die Räume, die nur Ihnen gehören, mit ihrer Nummer im Aufteilungsplan',
             '<strong>Gemeinschaftseigentum:</strong> alles, was allen gehört, etwa Treppenhaus, Dach, tragende Wände',
             '<strong>Miteigentumsanteil:</strong> Ihr Anteil am Gemeinschaftseigentum, oft Grundlage der Kostenverteilung',
             '<strong>Gemeinschaftsordnung:</strong> Regeln zu Nutzung, Kosten und Sondernutzungsrechten',
             '<strong>Aufteilungsplan:</strong> die Zeichnungen, in denen jede Einheit nummeriert ist']),
   ('h2', 'plan', 'Den Aufteilungsplan lesen'),
   ('p', 'Im Aufteilungsplan trägt jeder Raum, der zu einer Wohnung gehört, dieselbe Nummer. Gleichen Sie die Nummern mit dem ab, was Sie bei der Besichtigung sehen. Besonders Keller, Abstellräume und ausgebaute Dachflächen werden im Alltag oft anders genutzt, als es im Plan steht.'),
   ('plan', PLAN_TEILUNG, [('A', 'Wohnung Nr. 1, Sondereigentum'), ('B', 'Wohnung Nr. 2, Sondereigentum'), ('C', 'Treppenhaus (TH), Gemeinschaftseigentum'),
                            ('!', 'Prüfstelle: Abstellraum laut Plan Nr. 1, im Bestand von Wohnung Nr. 2 genutzt')],
    'Schematisches Beispiel. Farben: Wohnung 1 hell, Wohnung 2 sandfarben, Gemeinschaftseigentum grau.'),
   ('example', 'Was die Abweichung bedeutet',
    '<p>Im Beispiel gehört der Abstellraum laut Plan zu Wohnung 1, wird aber von Wohnung 2 genutzt. Für Käufer von Wohnung 1 heißt das: Der Raum steht ihnen zu, '
    'die Nutzung muss aber erst geklärt werden. Für Käufer von Wohnung 2 heißt das: Der Raum, den sie bei der Besichtigung gesehen haben, gehört nicht zur Wohnung.</p>'),
   ('h2', 'regeln', 'Nutzung und Kosten'),
   ('p', 'Die Gemeinschaftsordnung kann regeln, ob eine Wohnung gewerblich genutzt oder kurzzeitig vermietet werden darf, wie Kosten verteilt werden und wer Garten oder Stellplatz nutzen darf. Solche Regeln gelten auch für Sie als neuen Eigentümer.'),
   ('h2', 'checkliste', 'Checkliste für Käufer'),
   ('checklist', 'Vor dem Kauf prüfen', [
     'Nummer der Wohnung im Plan stimmt mit Aufteilungsplan und Kaufvertragsentwurf überein.',
     'Keller, Abstellraum und Stellplatz tragen dieselbe Nummer oder sind als Sondernutzungsrecht zugeordnet.',
     'Grundriss im Bestand entspricht dem Plan, Umbauten sind genehmigt.',
     'Nutzungsregeln passen zu Ihren Plänen (Eigennutzung, Vermietung, Büro).',
     'Kostenverteilung und Miteigentumsanteil sind nachvollziehbar.',
     'Nachträge zur Teilungserklärung liegen vollständig vor.',
     'Protokolle der Eigentümerversammlungen und die Beschlusssammlung sind gelesen.']),
   ('p', 'Ob die Angaben auch im Grundbuch stehen, zeigt der Grundbuchauszug: [[grundbuchauszug-anfordern|Grundbuchauszug anfordern: Welche Angaben Sie vorbereiten sollten]]. '
         'Wie Garten und Stellplatz zugeordnet sein können, erklärt [[sondernutzungsrecht-pruefen|Garten und Stellplatz: Wie Sie ein Sondernutzungsrecht prüfen]].'),
  ],
 },
 {
  'slug': 'grundbuchauszug-anfordern', 'areas': ['property'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Grundbuchauszug anfordern: Welche Angaben Sie vorbereiten sollten',
  'meta_title': 'Grundbuchauszug anfordern: Angaben und Ablauf | GRENFORD Ratgeber',
  'description': 'Wer einen Grundbuchauszug erhalten kann, welche Angaben der Antrag braucht und was in den Abteilungen des Grundbuchs steht. Mit Ablauf von der Vorbereitung bis zum Erhalt.',
  'lead': 'Der Grundbuchauszug zeigt, wem eine Immobilie gehört und welche Rechte und Lasten darauf liegen. Für Verkäufer gehört er zu den ersten Unterlagen, Käufer sehen ihn meist über den Notar. Mit den richtigen Angaben ist er schnell beantragt.',
  'key': ['Einsicht erhält, wer ein berechtigtes Interesse hat, etwa als Eigentümer oder mit Vollmacht.',
          'Grundbuchbezirk und Blattnummer beschleunigen den Antrag deutlich.',
          'Lesen Sie vor allem Abteilung II und III: Dort stehen Rechte Dritter und Grundschulden.'],
  'next': ('Immobilie bewerten lassen', 'bewerten', '#bewertung', 'Mit Grundbuchauszug und Ihren Angaben erhalten Sie eine Einschätzung des Werts, heute und nach einer Sanierung.'),
  'related': ['teilungserklaerung-pruefen', 'sondernutzungsrecht-pruefen'],
  'review': ['Voraussetzungen für die Einsicht (§ 12 GBO) und aktuelle Gebühren vor Veröffentlichung prüfen', 'Online-Antrag je Bundesland unterschiedlich: Angabe allgemein halten'],
  'blocks': [
   ('h2', 'wer', 'Wer einen Auszug erhält'),
   ('p', 'Das Grundbuch ist nicht öffentlich. Einen Auszug erhält, wer ein berechtigtes Interesse darlegen kann: in der Regel der Eigentümer selbst, wer eine Vollmacht des Eigentümers hat, oder der Notar im Rahmen eines Kaufs. Kaufinteressenten bitten deshalb meist den Verkäufer um den Auszug.'),
   ('h2', 'ablauf', 'Von der Vorbereitung bis zum Erhalt'),
   ('flow', [('Berechtigung klären', 'Eigentümer, Bevollmächtigter oder Notar. Bei Vollmacht diese schriftlich beilegen.'),
             ('Angaben zusammenstellen', 'Adresse, Name des Eigentümers, möglichst Grundbuchbezirk und Blattnummer sowie Flur und Flurstück.'),
             ('Antrag stellen', 'Beim Grundbuchamt des zuständigen Amtsgerichts, schriftlich oder persönlich, teils über ein Online-Formular. Den direkten Online-Abruf nutzen nur Notare, Banken und Behörden.'),
             ('Gebühr zahlen', 'Für einfache und beglaubigte Ausdrucke fallen geringe Gebühren an.'),
             ('Auszug erhalten', 'Per Post oder bei Abholung. Für Behörden oder Banken wird oft ein beglaubigter Ausdruck verlangt.')]),
   ('h2', 'angaben', 'Diese Angaben helfen'),
   ('checklist', 'Für den Antrag bereitlegen', [
     'Adresse der Immobilie und Name des Eigentümers',
     'Grundbuchbezirk und Blattnummer, etwa aus dem Kaufvertrag oder einem alten Auszug',
     'Flur und Flurstück, etwa aus dem Grundsteuerbescheid',
     'Bei Wohnungen: Nummer laut Aufteilungsplan',
     'Vollmacht, wenn Sie nicht selbst Eigentümer sind',
     'Angabe, ob ein einfacher oder beglaubigter Ausdruck gebraucht wird']),
   ('h2', 'lesen', 'Was im Auszug steht'),
   ('table', 'Aufbau des Grundbuchs', ['Teil', 'Inhalt', 'Worauf achten'], [
     ['Bestandsverzeichnis', 'Grundstück, bei Wohnungen Miteigentumsanteil und Sondereigentum', 'Stimmt die Bezeichnung mit Plan und Exposé überein?'],
     ['Abteilung I', 'Eigentümer', 'Ist der Verkäufer eingetragen, gibt es mehrere Eigentümer?'],
     ['Abteilung II', 'Lasten und Beschränkungen, etwa Wegerechte, Wohnrechte, Vorkaufsrechte', 'Welche Rechte Dritter bleiben nach dem Kauf bestehen?'],
     ['Abteilung III', 'Grundpfandrechte, etwa Grundschulden', 'Werden sie beim Verkauf abgelöst?']], ''),
   ('p', 'Bei Wohnungen gehört die [[teilungserklaerung-pruefen|Teilungserklärung]] zum Auszug dazu, denn auf sie verweist das Bestandsverzeichnis.'),
  ],
 },
 {
  'slug': 'sondernutzungsrecht-pruefen', 'areas': ['property'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Garten und Stellplatz: Wie Sie ein Sondernutzungsrecht prüfen',
  'meta_title': 'Sondernutzungsrecht an Garten und Stellplatz prüfen | GRENFORD Ratgeber',
  'description': 'Was ein Sondernutzungsrecht ist, wie es sich von Sondereigentum unterscheidet und wo Sie prüfen, ob Garten oder Stellplatz wirklich zur Wohnung gehören. Mit schematischem Lageplan.',
  'lead': 'Die Wohnung mit eigenem Garten, der Stellplatz direkt vor dem Haus: Oft gehören diese Flächen nicht der Wohnung, sondern der Gemeinschaft, und die Wohnung hat nur das Recht, sie allein zu nutzen. Ob dieses Recht wirklich besteht, steht in Unterlagen, nicht im Exposé.',
  'key': ['Ein Sondernutzungsrecht erlaubt die alleinige Nutzung; die Fläche bleibt Gemeinschaftseigentum aller Eigentümer.',
          'Maßgeblich sind Teilungserklärung und Grundbuch, nicht die tatsächliche Nutzung.',
          'Klären Sie, wer Pflege und Kosten der Fläche trägt.'],
  'next': ('Property Brief anfragen', 'property', '#memo', 'Im Property Brief stehen Rechte an Garten und Stellplatz mit den Fundstellen in den Unterlagen.'),
  'related': ['teilungserklaerung-pruefen', 'grundbuchauszug-anfordern'],
  'review': ['Aussagen zu Sondereigentum an Stellplätzen und Freiflächen (§ 3 WEG seit 2020) juristisch prüfen lassen'],
  'blocks': [
   ('h2', 'was', 'Was ein Sondernutzungsrecht ist'),
   ('p', 'Ein Sondernutzungsrecht erlaubt einem Eigentümer, einen Teil des Gemeinschaftseigentums allein zu nutzen, zum Beispiel eine Gartenfläche oder einen Stellplatz. Die Fläche selbst bleibt Gemeinschaftseigentum. Seit der WEG-Reform 2020 können Stellplätze und Flächen außerhalb des Gebäudes auch als Sondereigentum zugeordnet sein (§ 3 Abs. 1 und 2 WEG); welche Variante vorliegt, zeigt die Teilungserklärung. Begründet wird das Recht in der Teilungserklärung beziehungsweise Gemeinschaftsordnung; damit es auch gegenüber späteren Eigentümern wirkt, wird es im Grundbuch vermerkt.'),
   ('h2', 'lageplan', 'Den Lageplan lesen'),
   ('plan', PLAN_SNR, [('A', 'Garten mit Sondernutzungsrecht für Wohnung 1'), ('B', 'Garten mit Sondernutzungsrecht für Wohnung 2'), ('C', 'Hof und Weg, Gemeinschaftseigentum'),
                        ('!', 'Prüfstelle: Stellplatz S3 wird genutzt, ist in der Teilungserklärung aber keiner Wohnung zugeordnet')],
    'Schematisches Beispiel. S1 bis S4: Stellplätze.'),
   ('h2', 'unterschied', 'Sondernutzungsrecht, Sondereigentum, Gemeinschaftseigentum'),
   ('table', 'Kurzer Vergleich', ['', 'Sondernutzungsrecht', 'Sondereigentum', 'Gemeinschaftseigentum'], [
     ['Wem die Fläche gehört', 'der Gemeinschaft', 'Ihnen allein', 'allen gemeinsam'],
     ['Wer sie nutzen darf', 'Sie allein', 'Sie allein', 'alle nach den Regeln der Gemeinschaft'],
     ['Wo es steht', 'Teilungserklärung, Grundbuch', 'Teilungserklärung, Grundbuch', 'Teilungserklärung'],
     ['Wer Pflege und Kosten trägt', 'laut Gemeinschaftsordnung, oft der Nutzer', 'Sie', 'die Gemeinschaft']], ''),
   ('h2', 'checkliste', 'Checkliste'),
   ('checklist', 'Garten oder Stellplatz prüfen', [
     'Die Fläche ist in der Teilungserklärung oder einem Nachtrag der Wohnung zugeordnet.',
     'Die Lage im Plan stimmt mit der Fläche vor Ort überein.',
     'Das Recht ist im Grundbuch vermerkt.',
     'Die Gemeinschaftsordnung regelt Pflege, Kosten und Veränderungen, etwa Terrasse oder Zaun.',
     'Es gibt keine abweichenden Beschlüsse oder Streit in den Protokollen.']),
   ('p', 'Die Zuordnung steht in der [[teilungserklaerung-pruefen|Teilungserklärung]], den Vermerk zeigt der [[grundbuchauszug-anfordern|Grundbuchauszug]].'),
  ],
 },
 {
  'slug': 'off-market-oder-oeffentlich', 'areas': ['investment'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Off-Market oder öffentlich verkaufen?',
  'meta_title': 'Off-Market oder öffentlich verkaufen? Vermarktungswege im Vergleich | GRENFORD Ratgeber',
  'description': 'Diskrete Ansprache, öffentliche Vermarktung oder ein gestufter Prozess: Was die Wege bei Diskretion, Reichweite, Preisfindung, Steuerbarkeit und Aufwand leisten. Mit zwei fiktiven Fällen.',
  'lead': 'Off-Market klingt exklusiv, ist aber nicht immer der bessere Weg. Wie Sie verkaufen, hängt davon ab, wer als Käufer infrage kommt, wie viel Ruhe das Objekt braucht und wie sicher der Preis schon ist.',
  'key': ['Off-Market schützt Mieter und Ruf, erreicht aber weniger Käufer.',
          'Öffentliche Vermarktung zeigt den Marktpreis, kostet aber Diskretion.',
          'Ein gestufter Prozess verbindet beides: erst gezielt, dann bei Bedarf breiter.'],
  'next': ('Objekt vertraulich einordnen lassen', 'investment', '#bewertung-investment-value', 'Sie geben die Eckdaten Ihres Objekts an. GRENFORD schlägt Ihnen den passenden Vermarktungsweg vor.'),
  'related': ['vor-dem-verkauf-sanieren'],
  'review': ['Einschätzungen in der Matrix sind qualitativ; vor Veröffentlichung mit Praxisbeispielen abgleichen'],
  'blocks': [
   ('h2', 'wege', 'Drei Wege im Vergleich'),
   ('table', 'Vermarktungswege', ['Kriterium', 'Diskrete Ansprache', 'Öffentliche Vermarktung', 'Gestufter Prozess'], [
     ['Diskretion', '●●● hoch', '● gering', '●● mittel'],
     ['Reichweite', '● ausgewählter Kreis', '●●● breiter Markt', '●● erst gezielt, dann breiter'],
     ['Preisfindung', '●● im Gespräch', '●●● durch Wettbewerb', '●●● Wettbewerb unter Geprüften'],
     ['Steuerbarkeit', '●●● hoch', '● gering', '●● mittel'],
     ['Aufwand', '●● Käuferauswahl, Vertraulichkeit', '●●● Anfragen, Besichtigungen', '●● geplant in Phasen']],
    'Qualitative Einordnung: drei Punkte = stark ausgeprägt.'),
   ('h2', 'wann', 'Wann welcher Weg passt'),
   ('list', ['<strong>Diskrete Ansprache:</strong> vermietete Objekte, bekannte Eigentümer, Objekte, deren Verkauf nicht öffentlich werden soll',
             '<strong>Öffentliche Vermarktung:</strong> breiter Käuferkreis, etwa Selbstnutzer; wenn der Preis erst am Markt gefunden werden muss',
             '<strong>Gestufter Prozess:</strong> zuerst ausgewählte Investoren mit Vertraulichkeitsvereinbarung, danach bei Bedarf öffentlich']),
   ('h2', 'faelle', 'Zwei fiktive Fälle'),
   ('example', 'Fall 1: vermietetes Mehrfamilienhaus, 12 Einheiten',
    '<p>Die Erbengemeinschaft möchte verkaufen, ohne dass die Mieter durch Besichtigungen und Gerüchte verunsichert werden. Gewählt wird die diskrete Ansprache: '
    'ein anonymer Steckbrief an acht passende Investoren, Unterlagen erst nach Vertraulichkeitsvereinbarung, Besichtigung nur mit zwei Interessenten. '
    'Der Preis entsteht in Gesprächen mit den beiden ernsthaften Käufern.</p>'),
   ('example', 'Fall 2: Eigentumswohnung, 3 Zimmer, eigengenutzt',
    '<p>Für diese Wohnung kommen vor allem Selbstnutzer infrage, ein breiter Kreis, den man nicht persönlich kennt. Ein Off-Market-Verkauf würde die Preisfindung einschränken. '
    'Gewählt wird ein gestufter Prozess: zwei Wochen Vorstellung bei hinterlegten Suchprofilen, danach öffentliche Vermarktung.</p>'),
   ('p', 'Sobald mehrere Kaufangebote vorliegen, stellt sich die nächste Frage: welches das bessere ist. Ein Beitrag dazu ist in Vorbereitung.'),
  ],
 },
 {
  'slug': 'vor-dem-verkauf-sanieren', 'areas': ['property', 'projects'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Vor dem Verkauf sanieren?',
  'meta_title': 'Vor dem Verkauf sanieren? Ist-Verkauf, Auffrischung oder Sanierung | GRENFORD Ratgeber',
  'description': 'Wann sich eine Sanierung vor dem Verkauf rechnet: Ist-Verkauf, gezielte Auffrischung und größere Sanierung im Vergleich, mit fiktivem Rechenbeispiel zu Preis, Kosten, Haltedauer und Nettoerlös.',
  'lead': 'Ein frisches Bad verkauft sich besser, aber rechnet es sich auch? Die Antwort hängt davon ab, was Käufer tatsächlich mehr bezahlen, was die Maßnahme kostet und wie lange die Immobilie dafür länger in Ihrem Besitz bleibt.',
  'key': ['Vergleichen Sie den Nettoerlös, nicht den Verkaufspreis.',
          'Trennen Sie Preiswirkung, bessere Präsentation und weniger Unsicherheit für Käufer.',
          'Zeit kostet Geld: Jede Sanierung verlängert die Haltedauer.'],
  'next': ('Wert heute und nach Sanierung ermitteln', 'bewerten', '#bewertung', 'Sie erhalten zwei Wertspannen: im heutigen Zustand und nach einer sinnvollen Sanierung.'),
  'related': ['renovieren-modernisieren-sanieren', 'bauangebote-vergleichen', 'off-market-oder-oeffentlich'],
  'review': ['Rechenbeispiel ist fiktiv; Hinweis auf Verkaufsnebenkosten und Steuern vor Veröffentlichung prüfen'],
  'blocks': [
   ('h2', 'optionen', 'Drei Möglichkeiten'),
   ('table', 'Im Überblick', ['', 'Ist-Verkauf', 'Gezielte Auffrischung', 'Größere Sanierung'], [
     ['Was gemacht wird', 'nichts, Verkauf im heutigen Zustand', 'Maler, Böden, Licht, kleine Reparaturen', 'Bad, Elektrik, Böden, ggf. Grundriss'],
     ['Für wen es passt', 'Käufer, die selbst gestalten wollen', 'die meisten Wohnungen mit Gebrauchsspuren', 'wenn Mängel Käufer abschrecken'],
     ['Risiko', 'Preisabschlag für Unsicherheit', 'gering', 'Kosten und Zeit können steigen']], ''),
   ('h2', 'rechnung', 'Ein fiktives Rechenbeispiel'),
   ('table', 'Fiktives Beispiel: 3-Zimmer-Altbauwohnung, 85 m²', ['', 'Ist-Verkauf', 'Auffrischung', 'Sanierung'], [
     ['Erwarteter Verkaufspreis', '410.000 €', '430.000 €', '495.000 €'],
     ['Kosten der Maßnahmen', '0 €', '12.000 €', '60.000 €'],
     ['Zusätzliche Haltedauer', '0 Monate', '1 Monat', '5 Monate'],
     ['Kosten der Haltedauer (Annahme 600 € je Monat)', '0 €', '600 €', '3.000 €'],
     ['Nettoerlös vor Verkaufsnebenkosten und Steuern', '410.000 €', '417.400 €', '432.000 €']],
    'Alle Zahlen sind erfunden. Annahmen: Hausgeld und Finanzierung zusammen 600 € je Monat; Verkaufsnebenkosten und Steuern nicht berücksichtigt.'),
   ('p', 'Im Beispiel bringt die Sanierung den höchsten Nettoerlös, aber auch das größte Risiko: Steigen die Kosten um 20 Prozent oder verzögert sich der Verkauf, schrumpft der Vorsprung schnell.'),
   ('h2', 'wirkung', 'Drei Wirkungen auseinanderhalten'),
   ('flow', [('Erwartete Preiswirkung', 'Was Käufer für den besseren Zustand tatsächlich mehr zahlen. Das ist selten so viel, wie die Maßnahme gekostet hat.'),
             ('Bessere Präsentation', 'Frische Wände und gutes Licht machen Fotos und Besichtigungen überzeugender. Das verkürzt oft die Vermarktung, erhöht aber nicht automatisch den Preis.'),
             ('Weniger Unsicherheit', 'Wer alte Elektrik oder Feuchte beseitigt, nimmt Käufern einen Grund für Abschläge. Manchmal reicht dafür auch ein Gutachten mit Kostenschätzung.')]),
   ('h2', 'checkliste', 'Checkliste'),
   ('checklist', 'Lohnt sich die Maßnahme?', [
     'Wert heute und nach der Maßnahme sind getrennt eingeschätzt.',
     'Die Kosten beruhen auf vergleichbaren Angeboten, nicht auf einer Schätzung.',
     'Die zusätzliche Haltedauer ist eingerechnet.',
     'Es ist klar, ob die Maßnahme den Preis erhöht oder vor allem Unsicherheit senkt.',
     'Es gibt einen Puffer für höhere Kosten und Verzögerungen.']),
   ('p', 'Welche Maßnahmen sinnvoll sind, ordnet [[renovieren-modernisieren-sanieren|Renovieren, modernisieren oder sanieren?]]. Wie Sie die Angebote dafür vergleichen, zeigt [[bauangebote-vergleichen|Drei Bauangebote, drei Preise]].'),
  ],
 },
]

ARTICLES += [
 {
  'slug': 'markt', 'path': 'markt', 'areas': ['markt'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Immobilienmarkt Deutschland und Berlin',
  'meta_title': 'Immobilienmarkt Deutschland und Berlin: Preise, Kauffälle, Umsatz | GRENFORD',
  'description': 'Bundesweiter Wohnimmobilienpreisindex und Berliner Kauffälle getrennt dargestellt, Geldumsatz als eigene Kennzahl, Teilmärkte eingeordnet. Mit datierter GRENFORD-Einschätzung für 6 bis 12 Monate.',
  'lead': 'Bundesweit steigen die Preise für Wohnimmobilien wieder leicht, in Berlin wurden 2025 deutlich mehr Immobilien verkauft als im Vorjahr. Was die amtlichen Zahlen zeigen, was sie nicht zeigen und was das für Verkauf und Kauf in den nächsten Monaten bedeutet.',
  'key': ['Bundesweit: Preise im 2. Quartal 2026 nur noch leicht über dem Vorjahr, Werte vorläufig.',
          'Berlin 2025: mehr Kauffälle und höherer Geldumsatz; 2026 ruhiger.',
          'Teilmärkte entwickeln sich unterschiedlich: Wohnungen, Mietwohnhäuser und Bauland getrennt betrachten.'],
  'next': ('Wert Ihrer Immobilie einordnen lassen', 'bewerten', '#bewertung', 'Marktzahlen sind Durchschnitte. Was sie für Ihre Immobilie bedeuten, ordnet GRENFORD persönlich ein, heute und nach einer Sanierung.'),
  'related': ['off-market-oder-oeffentlich', 'vor-dem-verkauf-sanieren', 'bodenrichtwert-verstehen'],
  'review': [f'Alle Kennzahlen stammen aus Suchergebnissen mit Recherchestand {RESEARCH}, die amtliche Veröffentlichungen zitieren. Vor Freigabe jede Zahl am Original (Destatis-Pressemitteilung, Immobilienmarktbericht Berlin) prüfen.',
             'Vor Freigabe prüfen, ob neuere Datenstände vorliegen (Destatis 3. Quartal 2026, Berlin Jahresbericht 2026).',
             'Teilmarktzahlen Berlin (Wohnungseigentum, bebaute und unbebaute Grundstücke) nur aus Zweitquellen; Abgrenzung im Bericht klären.',
             'GRENFORD-Einschätzung ist eine Meinung, keine Prognose; Formulierung freigeben.'],
  'blocks': [
   ('h2', 'deutschland', 'Deutschland: Preise für Wohnimmobilien'),
   ('p', 'Das Statistische Bundesamt misst mit dem Häuserpreisindex, wie sich die Preise für Wohnimmobilien entwickeln, auf Grundlage notariell beurkundeter Kaufverträge. Seit Juni 2026 ist das Basisjahr 2025. Die Werte ab dem 1. Quartal 2026 sind vorläufig und werden mit der nächsten Veröffentlichung oft noch korrigiert.'),
   ('bars', 'Häuserpreisindex Deutschland: Veränderung zum Vorjahresquartal', [
     ('4. Quartal 2025', 2.6, '+2,6 %', 'revidiert'), ('1. Quartal 2026', 1.2, '+1,2 %', 'revidiert, vorläufig'), ('2. Quartal 2026', 0.6, '+0,6 %', 'vorläufig')],
    'Statistisches Bundesamt (Destatis), Häuserpreisindex, Pressemitteilungen Nr. 101, 219 und 336/2026',
    'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/09/PD26_336_61262.html'),
   ('kpis', [
     {'label': 'Häuserpreisindex Deutschland', 'value': '100,6', 'unit': 'Index, 2025 = 100', 'period': '2. Quartal 2026', 'change': '+0,6 % zum Vorjahresquartal, +0,3 % zum Vorquartal',
      'source': 'Destatis, Pressemitteilung Nr. 336 vom 24.09.2026', 'url': 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/09/PD26_336_61262.html', 'status': 'vorläufig'},
     {'label': 'Eigentumswohnungen in den 7 größten Metropolen', 'value': '−0,4 %', 'unit': 'Veränderung zum Vorjahresquartal', 'period': '2. Quartal 2026', 'change': 'Ein- und Zweifamilienhäuser dort: +0,7 %',
      'source': 'Destatis, Pressemitteilung Nr. 336 vom 24.09.2026', 'url': 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/09/PD26_336_61262.html', 'status': 'vorläufig'}]),
   ('h2', 'berlin', 'Berlin: Kauffälle und Geldumsatz'),
   ('p', 'Der Gutachterausschuss für Grundstückswerte in Berlin wertet alle notariell beurkundeten Kaufverträge aus. Die Anzahl der Kauffälle zeigt, wie viel gehandelt wird; der Geldumsatz zeigt, wie viel Geld dabei bewegt wird. Beides ist kein Preisindex: Werden mehr teure Objekte verkauft, steigt der Umsatz, auch wenn die Preise gleich bleiben.'),
   ('bars', 'Berlin 2025: Kauffälle nach Teilmarkt', [
     ('Wohnungs- und Teileigentum', 18303, '18.303', '+10 %'), ('Bebaute Grundstücke', 3754, '3.754', '+11 %'), ('Unbebaute Grundstücke', 855, '855', '+9 %')],
    f'{GD}, Immobilienmarktbericht Berlin 2025/2026; Teilmarktzahlen aus Zweitquellen',
    'https://www.berlin.de/gutachterausschuss/_assets/amarktinformationen/amarktanalyse/04-03-010-2500.pdf'),
   ('kpis', [
     {'label': 'Kauffälle Berlin, alle Teilmärkte', 'value': '22.912', 'unit': 'Kauffälle', 'period': 'Kalenderjahr 2025', 'change': 'rund +10 % zum Vorjahr',
      'source': f'{GD}, Immobilienmarktbericht 2025/2026', 'url': 'https://www.berlin.de/gutachterausschuss/_assets/amarktinformationen/amarktanalyse/04-03-010-2500.pdf', 'status': 'endgültig; vorläufiger Wert war 22.696'},
     {'label': 'Geldumsatz Berlin, alle Teilmärkte', 'value': 'rund 16,1', 'unit': 'Mrd. €', 'period': 'Kalenderjahr 2025', 'change': 'rund +8 % zum Vorjahr',
      'source': f'{GD}, Immobilienmarktbericht 2025/2026', 'url': 'https://www.berlin.de/gutachterausschuss/_assets/amarktinformationen/amarktanalyse/04-03-010-2500.pdf', 'status': 'endgültig; vorläufiger Wert war 15,86 Mrd. €'}]),
   ('h2', 'teilmaerkte', 'Teilmärkte in Berlin'),
   ('table', 'Einordnung nach Objektart', ['Teilmarkt', 'Kennzahl', 'Zeitraum', 'Quelle und Stand'], [
     ['Eigentumswohnungen', 'mittlerer Kaufpreis 5.511 €/m² Wohnfläche; Anzahl der Verkäufe 1. Halbjahr 2026: −3 % zum Vorjahreszeitraum', '2025; 1. Hj. 2026',
      'Gutachterausschuss Berlin, Marktbericht 2025/2026 und Halbjahresbericht 2026; Halbjahr vorläufig'],
     ['Mehrfamilienhäuser (Mietwohnhäuser)', 'Mietwohnhäuser mit Gewerbeanteil 2025: Verkäufe +16 %, Geldumsatz −11 %; reine Mietwohnhäuser 1. Hj. 2026: Verkäufe −12 %, Geldumsatz −4 %', '2025; 1. Hj. 2026',
      'Gutachterausschuss Berlin; 2025 aus vorläufiger Fassung, Halbjahr vorläufig'],
     ['Baugrundstücke (unbebaut)', '855 Kauffälle, Geldumsatz rund 1,5 Mrd. €', '2025',
      'Zweitquelle zum Marktbericht 2025/2026; widersprüchliche Angaben, Abgrenzung prüfen']],
    f'Recherchestand {RESEARCH}. Werte aus Suchergebnissen, die die amtlichen Berichte zitieren; vor Freigabe am Original prüfen. Der Umsatz eines Teilmarkts hängt stark davon ab, welche Objekte verkauft wurden.'),
   ('h2', 'einschaetzung', 'GRENFORD-Einschätzung für die nächsten 6 bis 12 Monate'),
   ('p', 'Stand 4. November 2026. Diese Einschätzung ist eine Meinung von Marco Kaimann auf Grundlage der Zahlen oben und der eigenen Mandate, keine Prognose. Sie wird überprüft, sobald neue amtliche Daten vorliegen.'),
   ('scenarios', [
     ('base', 'Basisszenario', 'Preise im Durchschnitt seitwärts bis leicht steigend, mit deutlichen Unterschieden nach Lage und Zustand. Gut gepflegte, energetisch ordentliche Objekte verkaufen sich weiter zügig; Objekte mit Sanierungsbedarf brauchen eine klare Kostenaussage, um nicht mit hohen Abschlägen gehandelt zu werden.'),
     ('up', 'Positive Treiber', 'Sinkende oder stabile Finanzierungszinsen; anhaltend knappes Angebot an Wohnungen in Berlin; Investoren, die nach einer Phase der Zurückhaltung wieder Mietwohnhäuser kaufen.'),
     ('down', 'Negative Treiber', 'Steigende Zinsen; schwächere Konjunktur und Unsicherheit bei Einkommen; Kosten und Vorgaben für energetische Sanierung, die Käufer bei älteren Gebäuden einpreisen.')]),
   ('h2', 'bedeutung', 'Was das für Ihren Verkauf bedeutet'),
   ('p', 'In einem ruhigeren Markt zählt der Weg zum Käufer mehr als der Zeitpunkt. Wann eine diskrete Ansprache sinnvoll ist, zeigt [[off-market-oder-oeffentlich|Off-Market oder öffentlich verkaufen?]]. Ob sich eine Maßnahme vorher rechnet, klärt [[vor-dem-verkauf-sanieren|Vor dem Verkauf sanieren?]]. Wie der Grundstückswert in die Bewertung einfließt, erklärt [[bodenrichtwert-verstehen|Bodenrichtwert verstehen]].'),
  ],
 },
 {
  'slug': 'bodenrichtwert-verstehen', 'areas': ['property'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Bodenrichtwert verstehen',
  'meta_title': 'Bodenrichtwert verstehen: Ermittlung, BORIS Berlin, Rechnung | GRENFORD Ratgeber',
  'description': 'Wie der Bodenrichtwert amtlich ermittelt wird, wie Sie ihn in BORIS Berlin abfragen, wie die einfache Rechnung funktioniert und welche Merkmale den Wert verändern. Mit schematischer Zonenkarte und Rechenbeispiel.',
  'lead': 'Der Bodenrichtwert ist der Ausgangspunkt für den Wert eines Grundstücks. Er ist schnell abgefragt und schnell gerechnet. Ob das Ergebnis zu Ihrem Grundstück passt, hängt aber davon ab, wie sehr es vom typischen Grundstück der Zone abweicht.',
  'key': ['Der Bodenrichtwert ist ein amtlicher Durchschnittswert je m² für eine Zone, ermittelt aus tatsächlichen Verkäufen.',
          'Bodenrichtwert × Grundstücksfläche ergibt einen ersten Ausgangswert, keinen Verkehrswert.',
          'Abweichungen bei Größe, Bebaubarkeit oder Erschließung verändern den Wert.'],
  'next': ('Wert Ihrer Immobilie ermitteln lassen', 'bewerten', '#bewertung', 'GRENFORD ordnet Bodenwert und Gebäude gemeinsam ein und erläutert, wie sich beide auf Ihren Verkaufspreis auswirken.'),
  'related': ['markt', 'grundbuchauszug-anfordern', 'teilungserklaerung-pruefen'],
  'review': ['Darstellung der Ermittlung (§ 196 BauGB, Immobilienwertermittlungsverordnung) fachlich prüfen',
             'Bedienschritte in BORIS Berlin am aktuellen Portal prüfen; Stichtag 01.01.2026 bestätigen',
             'Zonenkarte und alle Werte sind schematisch bzw. fiktiv'],
  'blocks': [
   ('h2', 'ermittlung', 'Wie der Bodenrichtwert ermittelt wird'),
   ('p', 'Die Gutachterausschüsse werten alle Kaufverträge über Grundstücke aus. Daraus leiten sie für Zonen mit ähnlichen Grundstücken einen durchschnittlichen Wert je Quadratmeter ab, bezogen auf ein unbebautes Grundstück mit typischen Merkmalen: Nutzungsart, Maß der Bebauung, Erschließung. In Berlin werden die Werte jährlich zum Stichtag 1. Januar festgelegt.'),
   ('h2', 'karte', 'Die Zonenkarte lesen'),
   ('plan', PLAN_BRW, [('W', 'Wohnbaufläche'), ('M', 'gemischte Baufläche'), ('GFZ', 'Geschossflächenzahl: zulässige Geschossfläche je m² Grundstück'),
                       ('!', 'Ihr Grundstück: liegt in der Zone mit 850 €/m², W, GFZ 1,2')],
    'Schematisches Beispiel. Bodenrichtwerte in €/m², Stichtag 01.01.2026 (fiktiv). Gestrichelte Linien: Zonengrenzen.'),
   ('h2', 'boris', 'Abfrage in BORIS Berlin'),
   ('flow', [('Portal öffnen', 'BORIS Berlin über die Seiten des Gutachterausschusses aufrufen; die Abfrage ist kostenfrei.'),
             ('Stichtag wählen', 'Den aktuellen Stichtag einstellen, derzeit 1. Januar 2026, für ältere Vergleiche frühere Jahrgänge.'),
             ('Adresse suchen', 'Straße und Hausnummer eingeben; die Karte zoomt auf das Grundstück.'),
             ('Zone ablesen', 'Bodenrichtwert in €/m², Nutzungsart und weitere Merkmale wie die Geschossflächenzahl notieren.'),
             ('Erläuterungen lesen', 'Die Zeichenerklärung zeigt, welche Merkmale das typische Grundstück der Zone hat.')]),
   ('p', 'Zur Abfrage: <a href="https://www.berlin.de/gutachterausschuss/service/informationen-zu-den-bodenrichtwerten/" target="_blank" rel="noopener">Informationen zu den Bodenrichtwerten und BORIS Berlin beim Gutachterausschuss ↗</a>'),
   ('h2', 'rechnung', 'Die einfache Rechnung'),
   ('calc', 'Fiktives Beispiel', [('Bodenrichtwert', '850 €/m²'), ('× Grundstücksfläche', '600 m²')], ('= Ausgangswert Boden', '510.000 €'),
    'Ein erster Anhaltspunkt. Weicht Ihr Grundstück vom typischen Grundstück der Zone ab, verändert sich der Wert.'),
   ('h2', 'merkmale', 'Was den Ausgangswert verändert'),
   ('table', 'Typische Abweichungen', ['Merkmal', 'Wirkung', 'Beispiel'], [
     ['Maß der Bebauung (GFZ)', 'mehr zulässige Geschossfläche erhöht den Wert, weniger senkt ihn', 'Zone GFZ 1,2, Grundstück darf nur 0,8'],
     ['Größe und Zuschnitt', 'sehr große, schmale oder verwinkelte Grundstücke sind je m² oft weniger wert', 'Hinterlandgrundstück mit langer Zufahrt'],
     ['Erschließung', 'fehlende Erschließung oder offene Beiträge mindern den Wert', 'Straße noch nicht endgültig hergestellt'],
     ['Lasten und Rechte', 'Wegerechte, Leitungsrechte oder Baulasten schränken die Nutzung ein', 'Leitungstrasse quer über das Grundstück'],
     ['Boden', 'Altlasten oder schwieriger Baugrund kosten Geld', 'frühere gewerbliche Nutzung']], ''),
   ('h2', 'bebaut', 'Wenn das Grundstück bebaut ist'),
   ('p', 'Bei Häusern und Mietwohnhäusern ist der Bodenwert nur ein Teil. Im Sachwertverfahren, etwa beim Einfamilienhaus, werden Bodenwert und Wert des Gebäudes addiert und an den Markt angepasst. Im Ertragswertverfahren, etwa beim Mietwohnhaus, zählt vor allem die Miete; der Bodenwert geht ein, weil der Boden dauerhaft bleibt, während das Gebäude altert. Je älter das Gebäude, desto größer der Anteil des Bodenwerts am Gesamtwert.'),
   ('h2', 'pruefliste', 'Prüfliste'),
   ('checklist', 'Bevor Sie mit dem Bodenrichtwert rechnen', [
     'Aktuellen Stichtag in BORIS Berlin gewählt.',
     'Grundstück liegt eindeutig in einer Zone, nicht auf der Grenze.',
     'Nutzungsart und GFZ der Zone mit Ihrem Grundstück verglichen.',
     'Grundstücksfläche aus Grundbuch oder Kataster übernommen.',
     'Lasten, Rechte und Erschließung geprüft.',
     'Bei bebauten Grundstücken: Gebäude gesondert bewerten lassen.']),
   ('p', 'Wie sich der Markt insgesamt entwickelt, zeigt die Marktanalyse [[markt|Immobilienmarkt Deutschland und Berlin]]. Die Grundstücksfläche finden Sie im Bestandsverzeichnis des Grundbuchs: [[grundbuchauszug-anfordern|Grundbuchauszug anfordern]].'),
  ],
 },
]

BY_SLUG = {a['slug']: a for a in ARTICLES}


PILL_OK = "<span class='rg-pill is-ok'>belegt</span>"
PILL_ASSUME = "<span class='rg-pill is-assume'>Annahme</span>"
PILL_OPEN = "<span class='rg-pill is-open'>offen</span>"
PILL_RISK = "<span class='rg-pill is-risk'>Risiko</span>"

ARTICLES += [
 {
  'slug': 'kaufpreisfaktor-mehrfamilienhaus', 'areas': ['investment'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Mehrfamilienhaus kaufen: Was der Kaufpreisfaktor allein nicht zeigt',
  'meta_title': 'Mehrfamilienhaus kaufen: Was der Kaufpreisfaktor nicht zeigt | GRENFORD Ratgeber',
  'description': 'Für Käufer, Transaktions- und Asset Manager: belastbare Ist-Miete, zusätzlicher Kapitalbedarf und offene Prüfpunkte mit Einfluss auf das Kaufangebot. Mit fiktivem Vergleich zweier Objekte und Prüfmatrix.',
  'lead': 'Zwei Mehrfamilienhäuser, gleicher Kaufpreis, gleiche Miete, Faktor 20. Auf dem Papier sind sie gleich teuer. Ob sie es sind, entscheiden drei Fragen: Wie belastbar ist die Miete, wie viel Kapital braucht das Objekt nach dem Kauf, und welche Punkte sind noch offen.',
  'key': ['Der Faktor bezieht sich auf die angesetzte Miete; prüfen Sie, wie viel davon belegt ist.',
          'Investitionsbedarf der ersten Jahre gehört in den Einstandspreis, nicht in die Zukunft.',
          'Offene Prüfpunkte gehören als Vorbehalt oder Abschlag ins Kaufangebot.'],
  'next': ('Transaktion besprechen', 'investment', '#bewertung-investment-search', 'Ankaufsprofil hinterlegen oder ein konkretes Objekt vertraulich einordnen lassen. Die Prüfung fasst GRENFORD im Investment Memo zusammen.'),
  'related': ['off-market-oder-oeffentlich', 'markt', 'bodenrichtwert-verstehen'],
  'review': ['Rechenbeispiel fiktiv; Darstellung der Kennzahlen (Faktor, Bruttoanfangsrendite) fachlich prüfen',
             'Hinweise zu Grunderwerbsteuer Berlin, sozialen Erhaltungsgebieten, Vorkaufsrecht und Mietrecht vor Veröffentlichung juristisch bzw. steuerlich prüfen lassen'],
  'blocks': [
   ('h2', 'faktor', 'Was der Faktor misst und was nicht'),
   ('p', 'Der Kaufpreisfaktor teilt den Kaufpreis durch die Jahresnettokaltmiete. Er ist schnell gerechnet und gut vergleichbar, aber nur so belastbar wie die Miete, auf die er sich stützt. Kosten nach dem Kauf, Erwerbsnebenkosten und Risiken aus Vertrag, Recht und Bausubstanz enthält er nicht.'),
   ('list', ['<strong>Belegte Einnahmen:</strong> durch Mietverträge und Zahlungseingänge nachgewiesene Ist-Miete',
             '<strong>Annahmen:</strong> angesetzte Marktmiete für Leerstand, erwartete Indexanpassungen, geschätzte Kosten',
             '<strong>Mögliche Mehrerträge:</strong> Potenzial nach Investition oder Neuvermietung, rechtlich und zeitlich unsicher']),
   ('p', 'Ein Kaufangebot sollte auf belegten Einnahmen beruhen. Annahmen gehören offen ausgewiesen daneben, Mehrerträge in eine eigene Rechnung.'),
   ('h2', 'istmiete', 'Belastbare Ist-Miete'),
   ('checklist', 'Miete belegen', [
     'Mieterliste mit Fläche, Miete, Vertragsbeginn, Staffel oder Index je Einheit',
     'Mietverträge stichprobenweise oder vollständig gegen die Mieterliste abgeglichen',
     'Zahlungseingänge der letzten 12 Monate; Rückstände und Minderungen benannt',
     'Leerstand mit Angabe, ob die Miete dafür angesetzt oder tatsächlich erzielt ist',
     'Gewerbeeinheiten: Laufzeit, Optionen, Bonität des Mieters',
     'Mietrechtliche Grenzen für Erhöhungen und Neuvermietung geprüft']),
   ('h2', 'kapital', 'Zusätzlicher Kapitalbedarf'),
   ('p', 'Was in den ersten Jahren investiert werden muss, gehört gedanklich zum Kaufpreis: Dach, Fassade, Heizung, Leitungen, leerstehende Wohnungen. Maßgeblich ist, was technisch oder rechtlich nötig ist, nicht was wünschenswert wäre.'),
   ('table', 'Fiktives Beispiel: zwei Mehrfamilienhäuser mit Faktor 20', ['', 'Objekt A', 'Objekt B'], [
     ['Kaufpreis', '3.000.000 €', '3.000.000 €'],
     ['Jahresnettokaltmiete, belegt', '150.000 €', '150.000 €'],
     ['Kaufpreisfaktor', '20,0', '20,0'],
     ['Investitionsbedarf in den ersten zwei Jahren', '100.000 €', '400.000 €'],
     ['Kaufpreis plus Investition', '3.100.000 €', '3.400.000 €'],
     ['Faktor auf diese Summe', '20,7', '22,7'],
     ['Miete im Verhältnis zur Summe (Bruttoanfangsrendite)', '4,8 %', '4,4 %']],
    'Vereinfachtes Beispiel, alle Zahlen erfunden. Nicht enthalten: Erwerbsnebenkosten (Grunderwerbsteuer, Notar, Grundbuch, gegebenenfalls Provision), nicht umlagefähige Bewirtschaftungskosten, Mietausfall und Leerstand während der Arbeiten, Finanzierungskosten, Steuern sowie Mietsteigerungen.'),
   ('example', 'Mögliche Mehrerträge getrennt rechnen',
    '<p>Angenommen, Objekt B ließe sich nach der Investition um 30.000 € Jahresmiete besser vermieten. Dann läge die Miete bei 180.000 € und der Faktor auf 3,4 Mio. € bei 18,9.</p>'
    '<p>Diese Rechnung beruht auf einer Annahme: Ob, wann und in welcher Höhe die Mehrmiete rechtlich und am Markt erzielbar ist, muss gesondert belegt werden. Sie gehört deshalb nicht in die Grundlage des Kaufangebots, sondern in eine eigene Szenariorechnung.</p>'),
   ('h2', 'pruefpunkte', 'Offene Prüfpunkte mit Einfluss auf das Angebot'),
   ('p', 'Was vor Abgabe des Angebots nicht geklärt ist, gehört als Vorbehalt, Abschlag oder Bedingung in das Angebot. Die Prüfmatrix zeigt, wie das im Investment Memo zusammengefasst wird.'),
   ('table', 'Prüfmatrix im Stil des GRENFORD Investment Memo', ['Prüfpunkt', 'Grundlage', 'Status', 'Wirkung auf das Angebot'], [
     ['Ist-Miete', 'Mieterliste, Verträge, Kontoauszüge', PILL_OK, 'Basis des Angebots'],
     ['Leerstand und Marktmiete', 'Annahme aus Vergleichsmieten', PILL_ASSUME, 'getrennt ausweisen, nicht voll ansetzen'],
     ['Instandhaltungsbedarf', 'Begehung, Kostenschätzung Fachplaner', PILL_ASSUME, 'vom Angebot abziehen'],
     ['Heizung und Energie', 'Energieausweis, Alter der Anlage', PILL_OPEN, 'Vorbehalt bis zur Prüfung'],
     ['Grundbuch, Baulasten', 'Grundbuchauszug, Baulastenverzeichnis', PILL_OK, 'keine Wirkung, wenn lastenfrei'],
     ['Erhaltungsgebiet, Vorkaufsrecht', 'Auskunft Bezirk', PILL_OPEN, 'Bedingung im Kaufvertrag'],
     ['Gewerbemietverträge', 'Verträge, Laufzeiten, Bonität', PILL_RISK, 'Abschlag oder Garantie des Verkäufers']],
    'Schematische Darstellung. Status: belegt, Annahme, offen, Risiko.'),
   ('h2', 'naechste', 'Vom Faktor zum Angebot'),
   ('flow', [('Ist-Miete belegen', 'Nur nachgewiesene Einnahmen bilden die Grundlage.'),
             ('Kapitalbedarf ansetzen', 'Investitionen der ersten Jahre zum Kaufpreis addieren.'),
             ('Offene Punkte bepreisen', 'Abschlag, Vorbehalt oder Bedingung je Prüfpunkt festlegen.'),
             ('Angebot formulieren', 'Preis, Bedingungen und Fristen schriftlich, mit Verweis auf die Prüfung.')]),
   ('p', 'Welche Unterlagen Sie für die erste Prüfung anfordern sollten, zeigt der geplante Beitrag [[ankaufunterlagen|Ankaufunterlagen: Was eine erste Ankaufprüfung braucht]]. Wie sich Preise und Umsätze bundesweit und in Berlin entwickeln, steht im [[markt|Marktüberblick Deutschland und Berlin]].'),
  ],
 },
]
BY_SLUG = {a['slug']: a for a in ARTICLES}

GII = 'https://www.gesetze-im-internet.de/bbaug/'
BLN_VORBESCHEID = 'https://www.berlin.de/ba-marzahn-hellersdorf/politik-und-verwaltung/aemter/stadtentwicklungsamt/bauaufsicht-wohnungsaufsicht-denkmalschutz/artikel.187786.php'
BLN_BAUANTRAG = 'https://www.berlin.de/sen/stadt/service/formularcenter/bereich-bauen/bauaufsicht/bauantrag-und-baudurchfuehrung/'


def _src(label, url):
    return f'<a href="{url}" target="_blank" rel="noopener">{label} ↗</a>'


PLAN_BAULUECKE = (
    '<svg class="rg-plan" viewBox="0 0 640 460" role="img" aria-labelledby="plan-bl-t">'
    '<title id="plan-bl-t">Schematische Berliner Baulücke zwischen zwei Brandwänden: Variante A Straßenbaukörper, Variante B zusätzlich Hinterhaus</title>'
    '<rect x="20" y="20" width="600" height="360" class="pl-ground"/>'
    '<rect x="20" y="60" width="150" height="320" class="bl-nb"/><rect x="470" y="60" width="150" height="320" class="bl-nb"/>'
    '<text class="pl-room" x="95" y="230" text-anchor="middle">Nachbar</text><text class="pl-room" x="545" y="230" text-anchor="middle">Nachbar</text>'
    '<rect x="170" y="60" width="300" height="320" class="bl-lot"/>'
    '<rect x="170" y="270" width="300" height="110" class="bl-a"/>'
    '<rect x="170" y="70" width="300" height="80" class="bl-b"/>'
    '<text class="pl-room" x="320" y="332" text-anchor="middle">Vorderhaus</text>'
    '<text class="pl-room" x="320" y="118" text-anchor="middle">Hinterhaus</text>'
    '<text class="pl-room" x="320" y="215" text-anchor="middle">Hof</text>'
    '<rect x="20" y="385" width="600" height="55" class="bl-street"/>'
    '<text class="pl-room bl-street-t" x="320" y="420" text-anchor="middle">Straße</text>'
    + _marker(230, 300, 'A') + _marker(230, 100, 'B') + _marker(420, 215, 'C') +
    '</svg>')

BM_PAGE = 'https://www.berlin.de/sen/bauen/neubau/berliner-modell/'
BM_LEITLINIE = 'https://www.berlin.de/sen/bauen/_assets/neubau/modell_baulandentwicklung.pdf'
BM_ANGEMESSEN = 'https://www.berlin.de/sen/stadtentwicklung/_assets/planung/bebauungsplanverfahren/dv_9-83ve_anl_04_250407_angemessenheit.pdf'
BM_DISPENS = 'https://www.berlin.de/sen/bauen/_assets/neubau/2025-12-08_handreichung_dispensvertraege.pdf'
BM_TURBO = 'https://www.berlin.de/sen/stadtentwicklung/_assets/planung/bebauungsplanverfahren/202603_berliner_leitfaden_wohnungsbau-turbo.pdf'
BM_AENDERUNG = 'https://www.berlin.de/ba-charlottenburg-wilmersdorf/aktuelles/pressemitteilungen/2026/pressemitteilung.1717144.php'

PILL_DECIDED = "<span class='rg-pill is-ok'>beschieden</span>"
PILL_NONE = "<span class='rg-pill is-assume'>kein Baurecht</span>"

ARTICLES += [
 {
  'slug': 'grundstueck-kaufen-und-bauen', 'areas': ['investment'], 'status': 'entwurf', 'published': '2026-11-04', 'updated': None,
  'title': 'Grundstück kaufen und bauen: Vom Bebauungsplan bis zum Baubeginn',
  'meta_title': 'Grundstück kaufen und bauen: Baurecht prüfen, vom Bebauungsplan bis zum Baubeginn | GRENFORD Ratgeber',
  'description': 'Für Käufer und Projektentwickler: wie belastbar das Baurecht ist, das im Grundstückspreis steckt. § 30, § 34 und § 35 BauGB im Vergleich, das Berliner Verfahren vom Vorbescheid bis zum Baubeginn und ein fiktiver Fall einer Baulücke.',
  'lead': 'Wer ein Grundstück kauft, bezahlt meist nicht den Boden, sondern das, was darauf gebaut werden darf. Die Leitfrage jeder Ankaufprüfung lautet deshalb: Wie belastbar ist das Baurecht, das im Kaufpreis bereits eingerechnet ist?',
  'key': ['Wo ein qualifizierter Bebauungsplan gilt, ist das Baurecht am klarsten; nach § 34 und § 35 BauGB hängt es vom Einzelfall ab.',
          'Ein Vorbescheid bindet nur für die Fragen, die gestellt wurden.',
          'Bezahlen Sie nur das Baurecht, das belegt ist; alles Weitere gehört in Option oder Nachzahlung.'],
  'next': ('Entwicklungspotenzial besprechen', 'investment', '#bewertung-investment-value', 'Sie nennen Grundstück und vorhandene Unterlagen. GRENFORD ordnet ein, welches Baurecht belegt ist und wie es sich im Kaufpreis abbilden lässt.'),
  'related': ['bodenrichtwert-verstehen', 'kaufpreisfaktor-mehrfamilienhaus', 'markt'],
  'review': ['Alle rechtlichen Aussagen sind allgemein gehalten und vor Veröffentlichung juristisch zu prüfen, insbesondere § 34 Abs. 3b und § 246e BauGB (in Kraft seit 30.10.2025) am amtlichen Wortlaut einschließlich der Rolle der Gemeinde.',
             'Geltungsdauer und Verlängerung des Vorbescheids nach § 75 BauO Bln am aktuellen Gesetzestext prüfen (Quellen widersprechen sich).',
             'Berliner Verfahrensschritte (§§ 69, 71, 72, 75 BauO Bln) und Zuständigkeit der Bezirke bestätigen.',
             'Plan, Flächen und Fall sind fiktiv.',
             'Berliner Modell: aktuelle Leitlinie einschließlich aller Änderungen (zuletzt Schreiben vom 14.09.2026), Bindungsanteil 30 %, Bagatellgrenze, Kostenkennwerte ab 01.04.2025 und Angemessenheitsprüfung am Original prüfen.',
             'Handreichung Dispensverträge (08.12.2025) und Leitfaden Wohnungsbau-Turbo (März 2026): Anwendungsbereich und Vertragsinhalte am Original prüfen.'],
  'blocks': [
   ('h2', 'grundlagen', 'Drei Grundlagen für Baurecht'),
   ('p', 'Ob und was gebaut werden darf, regelt zuerst das Bauplanungsrecht des Bundes im Baugesetzbuch. Es unterscheidet drei Lagen: das Gebiet eines Bebauungsplans, den im Zusammenhang bebauten Innenbereich und den Außenbereich.'),
   ('table', 'Vergleich der Zulässigkeit nach BauGB', ['', '§ 30 Bebauungsplan', '§ 34 Innenbereich', '§ 35 Außenbereich'], [
     ['Wo', 'Geltungsbereich eines Bebauungsplans', 'im Zusammenhang bebauter Ortsteil ohne qualifizierten Plan', 'alles außerhalb dieser Gebiete'],
     ['Maßstab', 'Festsetzungen des Plans', 'Einfügen in die nähere Umgebung', 'grundsätzlich freizuhalten'],
     ['Belastbarkeit für Käufer', 'hoch, wenn qualifiziert', 'mittel, Auslegung im Einzelfall', 'gering, außer bei privilegierten Vorhaben'],
     ['Typische Prüfung', 'Plan, Begründung, Änderungsverfahren', 'Umgebungsbebauung, Vorbescheid', 'Privilegierung, öffentliche Belange'],
     ['Gesetzestext', _src('§ 30 BauGB', GII + '__30.html'), _src('§ 34 BauGB', GII + '__34.html'), _src('§ 35 BauGB', GII + '__35.html')]],
    'Vereinfachte Übersicht. Maßgeblich ist der amtliche Gesetzestext.'),
   ('h2', 'bebauungsplan', 'Qualifizierter und einfacher Bebauungsplan'),
   ('p', 'Ein Bebauungsplan ist qualifiziert, wenn er mindestens Art und Maß der baulichen Nutzung, die überbaubaren Grundstücksflächen und die örtlichen Verkehrsflächen festsetzt (' + _src('§ 30 Abs. 1 BauGB', GII + '__30.html') + '). Ein Vorhaben ist dort zulässig, wenn es den Festsetzungen nicht widerspricht und die Erschließung gesichert ist. Fehlt eine dieser Festsetzungen, ist der Plan einfach: Er gilt für das, was er regelt; im Übrigen richtet sich die Zulässigkeit nach § 34 oder § 35 (§ 30 Abs. 3).'),
   ('h2', 'berliner-modell', 'Berliner Modell der kooperativen Baulandentwicklung'),
   ('p', 'Entsteht in Berlin neues Wohnbaurecht durch einen Bebauungsplan, beteiligt sich der Vorhabenträger nach der Leitlinie des Senats an den Folgen der Planung. Grundlage ist ein städtebaulicher Vertrag nach ' + _src('§ 11 BauGB', GII + '__11.html') + ' zwischen Land beziehungsweise Bezirk und Vorhabenträger. Er wird geschlossen, bevor der Plan festgesetzt wird, und ist damit Teil der Grundstückskalkulation, nicht erst der Baukalkulation.'),
   ('list', ['<strong>Städtebaulicher Vertrag:</strong> regelt Bindungen, Beiträge, Fristen und Sicherheiten; ohne Vertrag in der Regel kein neues Baurecht',
             '<strong>Mietpreis- und Belegungsbindungen:</strong> ein Anteil der Geschossfläche Wohnen wird als geförderter, mietpreis- und belegungsgebundener Wohnraum errichtet; die Leitlinie nennt 30 %, unterhalb einer Bagatellgrenze entfällt die Pflicht',
             '<strong>Projektbezogene Infrastrukturbeiträge:</strong> Beiträge zu Kita- und Grundschulplätzen sowie weiteren Folgeeinrichtungen, soweit das Vorhaben sie auslöst, berechnet nach den vom Senat fortgeschriebenen Kostenkennwerten',
             '<strong>Angemessenheit:</strong> die Belastungen dürfen den planungsbedingten Bodenwertzuwachs nicht übersteigen; dafür gibt es ein eigenes Prüfschema']),
   ('table', 'Wann das Berliner Modell greift', ['', 'Neues Wohnbaurecht durch Bebauungsplan', 'Regulär nach § 34 BauGB', 'Sonderwege mit Dispensvertrag'], [
     ['Baurecht entsteht durch', 'Aufstellung oder Änderung des Bebauungsplans', 'Einfügen in die nähere Umgebung', 'Befreiung oder Abweichung, etwa § 31 Abs. 3, § 34 Abs. 3a und 3b, § 246e BauGB'],
     ['Berliner Modell', 'ja, nach der Leitlinie', 'in der Regel nicht: Besteht ein Anspruch auf Genehmigung, kann er nicht an Beiträge geknüpft werden', 'Vertragsinhalte angelehnt an das Berliner Modell, verhandelt mit dem Bezirk'],
     ['Bindungen und Beiträge', 'Bindungsanteil und Infrastrukturbeiträge', 'keine aus dem Modell', 'nach Handreichung, im Einzelfall'],
     ['Planungssicherheit', 'erst mit Festsetzung des Plans', 'mit Vorbescheid oder Genehmigung', 'erst mit Zustimmung und Vertrag'],
     ['Amtliche Grundlage', _src('Leitlinie', BM_LEITLINIE), _src('§ 34 BauGB', GII + '__34.html'), _src('Handreichung Dispensverträge', BM_DISPENS)]],
    'Vereinfachte Übersicht. Maßgeblich sind die Leitlinie in ihrer aktuellen Fassung, die Handreichung und der Einzelfall.'),
   ('split', 'Fiktives Beispiel: 8.000 m² Geschossfläche Wohnen', [('gebunden', 2400, 'mietpreis- und belegungsgebunden', '2.400 m² · 30 %'), ('frei', 5600, 'übrige Wohnflächen', '5.600 m² · 70 %')],
    'Annahme: Bindungsanteil 30 % der Geschossfläche Wohnen. Alle Werte fiktiv.'),
   ('h2', 'kalkulation-modell', 'Wie das Modell in die Grundstückskalkulation eingeht'),
   ('flow', [('Bindungen', 'Die 2.400 m² gebundene Fläche erzielt über die Bindungsdauer nur die zulässige Anfangsmiete und ist an berechtigte Mieter gebunden. Ihr Wert ist deutlich niedriger als der der 5.600 m² übrigen Fläche und wird getrennt gerechnet.'),
             ('Förderannahmen', 'Ob und in welcher Höhe Wohnungsbauförderung für die gebundene Fläche fließt, ist bis zur Bewilligung eine Annahme. In der Kalkulation steht sie getrennt und mit Szenario ohne Förderung.'),
             ('Folgekosten', 'Infrastrukturbeiträge, öffentliche Grün- und Erschließungsflächen sowie Planungs- und Gutachterkosten mindern den Wert, den der Käufer für das Grundstück zahlen kann.'),
             ('Fälligkeiten', 'Wann Beiträge fällig werden und welche Sicherheiten, etwa Bürgschaften, verlangt sind, bestimmt der Vertrag. Frühe Fälligkeit bindet Kapital und erhöht die Finanzierungskosten.')]),
   ('p', 'Aus Erlösen der freien und der gebundenen Flächen abzüglich Baukosten, Folgekosten, Finanzierung und Gewinn ergibt sich der tragfähige Grundstückswert. Ein Kaufpreis, der auf Baurecht ohne Bindungen kalkuliert ist, überschätzt den Wert, wenn das Baurecht erst über einen Bebauungsplan mit Berliner Modell entsteht.'),
   ('note', 'Prüfstand 4. November 2026, über Websuche ermittelt; die Dokumente wurden nicht direkt geöffnet: '
            + _src('Leitlinie Berliner Modell', BM_LEITLINIE) + ' mit Änderungen, zuletzt laut ' + _src('Pressemitteilung des Bezirks Charlottenburg-Wilmersdorf', BM_AENDERUNG) + ' per Schreiben vom 14.09.2026 (Spielplätze); '
            + _src('Angemessenheitsprüfung, Version 7.0 vom 01.04.2025', BM_ANGEMESSEN) + '; '
            + _src('Handreichung Dispensverträge vom 08.12.2025', BM_DISPENS) + '; '
            + _src('Berliner Leitfaden Wohnungsbau-Turbo, 2. Auflage März 2026', BM_TURBO) + '. Übersicht: ' + _src('Berliner Modell, berlin.de', BM_PAGE) + '.'),
   ('h2', 'innenbereich', 'Innenbereich: die vier Einfügungskriterien'),
   ('p', 'Nach ' + _src('§ 34 Abs. 1 BauGB', GII + '__34.html') + ' muss sich ein Vorhaben in die Eigenart der näheren Umgebung einfügen, und zwar nach vier Kriterien:'),
   ('list', ['<strong>Art der baulichen Nutzung:</strong> etwa Wohnen, Gewerbe, gemischte Nutzung',
             '<strong>Maß der baulichen Nutzung:</strong> Höhe, Geschosszahl, Grundfläche im Vergleich zur Umgebung',
             '<strong>Bauweise:</strong> offen oder geschlossen, in Berlin oft geschlossene Blockrandbebauung',
             '<strong>Überbaubare Grundstücksfläche:</strong> wo auf dem Grundstück gebaut wird, etwa Vorderhaus oder auch Hinterhaus']),
   ('p', 'Zusätzlich muss die Erschließung gesichert sein, gesunde Wohn- und Arbeitsverhältnisse müssen gewahrt bleiben, und das Ortsbild darf nicht beeinträchtigt werden. Gerade bei Hinterhäusern entscheidet die überbaubare Grundstücksfläche: Gibt es in der näheren Umgebung vergleichbare Hinterbebauung?'),
   ('h2', 'aussenbereich', 'Außenbereich: privilegierte und sonstige Vorhaben'),
   ('p', 'Im Außenbereich nach ' + _src('§ 35 BauGB', GII + '__35.html') + ' sind privilegierte Vorhaben nach Absatz 1 zulässig, wenn öffentliche Belange nicht entgegenstehen und die Erschließung gesichert ist, zum Beispiel land- oder forstwirtschaftliche Betriebe. Sonstige Vorhaben nach Absatz 2 können nur im Einzelfall zugelassen werden, wenn öffentliche Belange nicht beeinträchtigt werden. Für Wohnungsbau ist das in der Praxis die Ausnahme.'),
   ('note', 'Stand 4. November 2026: Seit dem 30. Oktober 2025 gelten mit dem Gesetz zur Beschleunigung des Wohnungsbaus und zur Wohnraumsicherung zusätzliche Möglichkeiten. '
            + _src('§ 34 Abs. 3b BauGB', GII + '__34.html') + ' lockert das Einfügungsgebot für bestimmte Wohnbauvorhaben, '
            + _src('§ 246e BauGB', GII + '__246e.html') + ' erlaubt befristet bis zum 31. Dezember 2030 Abweichungen von Vorschriften des Baugesetzbuchs zugunsten des Wohnungsbaus. '
            'Beide setzen eine Entscheidung im Einzelfall voraus; ein Anspruch des Käufers folgt daraus nicht. Voraussetzungen und Beteiligung der Gemeinde am amtlichen Wortlaut prüfen.'),
   ('h2', 'ebenen', 'Bundesplanungsrecht und Berliner Bauordnungsrecht'),
   ('table', 'Zwei Ebenen, zwei Prüfungen', ['', 'Bauplanungsrecht', 'Bauordnungsrecht'], [
     ['Frage', 'Ob und was gebaut werden darf', 'Wie gebaut werden muss'],
     ['Rechtsgrundlage', 'Baugesetzbuch (Bund)', 'Bauordnung für Berlin (BauO Bln)'],
     ['Beispiele', 'Nutzungsart, Maß, Bauweise, überbaubare Fläche', 'Abstandsflächen, Brandschutz, Standsicherheit, Barrierefreiheit'],
     ['Zuständig in Berlin', 'Bezirk (Stadtentwicklungsamt), teils Senat', 'Bauaufsicht des Bezirks']], ''),
   ('h2', 'verfahren', 'Das Berliner Verfahren: was geklärt ist und was offen bleibt'),
   ('flow', [('Bauvorbescheid (§ 75 BauO Bln)', 'Geklärt: nur die Fragen, die im Antrag gestellt wurden, zum Beispiel die planungsrechtliche Zulässigkeit einer bestimmten Kubatur. Er bindet für einen späteren Bauantrag, solange er gilt. Offen: alle nicht gestellten Fragen, das Bauordnungsrecht, Statik und Nachbarrechte.'),
             ('Bauantrag (§ 69 BauO Bln)', 'Geklärt: das konkrete Vorhaben liegt mit vollständigen Bauvorlagen einer bauvorlageberechtigten Person bei der Bauaufsicht. Offen: das Ergebnis der Prüfung, Nachforderungen und Stellungnahmen anderer Stellen.'),
             ('Baugenehmigung (§ 71 BauO Bln)', 'Geklärt: das Vorhaben entspricht im Prüfumfang den öffentlich-rechtlichen Vorschriften. Offen: private Rechte Dritter, ein möglicher Widerspruch von Nachbarn und die bautechnischen Nachweise, sofern sie noch nicht geprüft sind.'),
             ('Baubeginn (§ 72 BauO Bln)', 'Geklärt: Bauen darf beginnen, wenn die Genehmigung zugegangen ist, die bautechnischen Nachweise und gegebenenfalls das Prüfergebnis vorliegen und die Baubeginnanzeige mindestens eine Woche vorher eingegangen ist. Offen: Ausführung, Bauüberwachung und Abnahmen.')]),
   ('p', 'Amtliche Informationen: ' + _src('Vorbescheid und planungsrechtlicher Bescheid, berlin.de', BLN_VORBESCHEID) + ' · ' + _src('Bauantrag und Baudurchführung, Formularcenter Berlin', BLN_BAUANTRAG)),
   ('h2', 'fall', 'Fiktiver Fall: Baulücke mit zwei Varianten'),
   ('plan', PLAN_BAULUECKE, [('A', 'Variante A: Straßenbaukörper (Vorderhaus), Gegenstand des Vorbescheids'),
                             ('B', 'Variante B: zusätzliches Hinterhaus, nicht Gegenstand des Vorbescheids'),
                             ('C', 'Hof, nach Variante A unbebaut')],
    'Schematisches Beispiel einer Berliner Baulücke zwischen zwei Brandwänden. Flächen und Bescheid sind fiktiv.'),
   ('example', 'Der Vorbescheid gilt nur für Variante A',
    '<p>Der Verkäufer bietet das Grundstück mit rund 3.100 m² Bruttogrundfläche an: 2.200 m² im Vorderhaus und 900 m² in einem Hinterhaus. '
    'Der vorliegende Vorbescheid bestätigt ausdrücklich nur das Vorderhaus nach Art und Maß. Zum Hinterhaus wurde keine Frage gestellt.</p>'
    '<p>Für den Käufer ist damit nur Variante A belegt. Ob sich ein Hinterhaus nach § 34 BauGB einfügt, hängt von der Hinterbebauung in der näheren Umgebung ab und ist offen.</p>'),
   ('table', 'Prüfmatrix: Flächen in der Kalkulation des Käufers', ['Fläche', 'Grundlage', 'Status', 'Behandlung in der Kalkulation'], [
     ['Vorderhaus, 2.200 m² BGF', 'Vorbescheid zu Variante A', PILL_DECIDED, 'voll im Kaufpreis ansetzen, Geltungsdauer beachten'],
     ['Vorderhaus, Bauordnungsrecht', 'Entwurf, Abstandsflächen, Brandschutz', PILL_OPEN, 'Risikopuffer in Kosten und Zeit'],
     ['Hinterhaus, 900 m² BGF', 'keine; Umgebung nicht geprüft', PILL_OPEN, 'nicht im Kaufpreis; Nachzahlung bei Genehmigung vereinbaren'],
     ['Hof', 'unbebaut nach Variante A', PILL_NONE, 'Freifläche, kein Baurecht ansetzen'],
     ['Erschließung', 'Straßenland, Leitungen', PILL_ASSUME, 'mit Versorgern klären, Kosten schätzen']],
    'Fiktives Beispiel. Status: beschieden, offen, Annahme, kein Baurecht.'),
   ('h2', 'pruefliste', 'Prüfliste vor dem Kaufangebot'),
   ('checklist', 'Baurecht belegen', [
     'Planungsrechtliche Lage bestimmt: § 30, § 34 oder § 35 BauGB, bei Bebauungsplan qualifiziert oder einfach.',
     'Bebauungsplan, Begründung und laufende Änderungsverfahren eingesehen.',
     'Vorbescheid gelesen: Welche Fragen wurden gestellt, für welche Variante gilt er, wie lange gilt er?',
     'Bauordnungsrechtliche Machbarkeit grob geprüft: Abstandsflächen, Brandschutz, Rettungswege.',
     'Erschließung, Baulasten und Leitungsrechte geklärt.',
     'Kaufpreis nur auf belegtes Baurecht gestützt; weiteres Potenzial über Nachzahlung oder Bedingung geregelt.']),
   ('p', 'Wie der Bodenwert ohne gesichertes Mehr an Baurecht einzuordnen ist, erklärt [[bodenrichtwert-verstehen|Bodenrichtwert verstehen]]. Wie Sie belegte Einnahmen, Annahmen und Potenzial in der Ankaufprüfung trennen, zeigt [[kaufpreisfaktor-mehrfamilienhaus|Mehrfamilienhaus kaufen: Was der Kaufpreisfaktor allein nicht zeigt]]; die Unterlagen für die erste Prüfung behandelt der geplante Beitrag [[ankaufunterlagen|Ankaufunterlagen]].'),
  ],
 },
]
BY_SLUG = {a['slug']: a for a in ARTICLES}

def visible():
    return [a for a in ARTICLES if a['status'] == 'freigegeben' or SHOW_DRAFTS]


def published():
    return [a for a in ARTICLES if a['status'] == 'freigegeben']


def article_path(a):
    return a.get('path', 'ratgeber/' + a['slug'])


def article_url(slug):
    return page(article_path(BY_SLUG[slug]) if slug in BY_SLUG else 'ratgeber/' + slug)


def _is_visible(slug):
    a = BY_SLUG.get(slug)
    return bool(a) and (a['status'] == 'freigegeben' or SHOW_DRAFTS)


def inline(text):
    """[[slug|Text]] wird zum Link, wenn der Beitrag in dieser Fassung erscheint; sonst bleibt nur der Text."""
    return re.sub(r'\[\[([a-z0-9-]+)\|([^\]]+)\]\]',
                  lambda m: f'<a href="{article_url(m.group(1))}">{m.group(2)}</a>' if _is_visible(m.group(1)) else m.group(2), text)


def _date(iso):
    d = date.fromisoformat(iso)
    months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    return f'{d.day}. {months[d.month - 1]} {d.year}'


def _words(a):
    parts = [a['title'], a['lead']] + a['key']
    for b in a['blocks']:
        parts.append(re.sub(r'<[^>]+>', ' ', str(b[1:])))
    return len(re.sub(r'\s+', ' ', ' '.join(parts)).split())


def reading_time(a):
    return max(3, -(-_words(a) // 170))  # rund 170 Wörter je Minute für Fachtexte, aufgerundet


def _labels(a, dark=False):
    return ''.join(f'<span class="rg-label area-{k}{" on-dark" if dark else ""}">{AREAS[k]["label"]}</span>' for k in a['areas'])


# ---------------------------------------------------------------- Bausteine

def _table(caption, head, rows, note):
    th = ''.join(f'<th scope="col">{E(h)}</th>' for h in head)
    body = ''
    for r in rows:
        cells = f'<th scope="row">{r[0]}</th>' + ''.join(f'<td data-label="{E(head[i + 1], quote=True)}">{c}</td>' for i, c in enumerate(r[1:]))
        body += f'<tr>{cells}</tr>'
    fict = ' is-fictional' if 'Fiktiv' in caption else ''
    return (f'<figure class="rg-table-wrap{fict}"><table class="rg-table"><caption>{E(caption)}</caption><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>'
            + (f'<figcaption>{E(note)}</figcaption>' if note else '') + '</figure>')


def _flow(steps):
    items = ''.join(f'<li><span class="rg-flow-n">{i:02d}</span><div><h3>{E(t)}</h3><p>{E(x)}</p></div></li>' for i, (t, x) in enumerate(steps, 1))
    return f'<ol class="rg-flow">{items}</ol>'


def _checklist(title, items):
    lis = ''.join(f'<li><span aria-hidden="true"></span>{E(x)}</li>' for x in items)
    return f'<div class="rg-checklist"><h3>{E(title)}</h3><ul>{lis}</ul></div>'


def _plan(svg, legend, caption):
    leg = ''.join(f'<li><span class="pl-key{" is-check" if k == "!" else ""}">{E(k)}</span>{E(t)}</li>' for k, t in legend)
    return (f'<figure class="rg-plan-wrap"><span class="rg-stamp">Schematisches Beispiel</span>{svg}'
            f'<figcaption><ul class="rg-legend">{leg}</ul><small>{E(caption)}</small></figcaption></figure>')


def _example(title, body):
    return f'<aside class="rg-example"><span class="rg-stamp">Fiktives Beispiel</span><h3>{E(title)}</h3>{body}</aside>'


def _bars(title, rows, source, url):
    top = max(v for _, v, _, _ in rows)
    items = ''.join(f'<li><span class="rg-bar-l">{E(l)}</span><span class="rg-bar-t"><i style="width:{v / top * 100:.1f}%"></i></span>'
                    f'<strong>{E(d)}</strong><small>{E(n)}</small></li>' for l, v, d, n in rows)
    return (f'<figure class="rg-bars"><figcaption class="rg-bars-t">{E(title)}</figcaption><ul>{items}</ul>'
            f'<p class="rg-src">Quelle: <a href="{E(url, quote=True)}" target="_blank" rel="noopener">{E(source)} ↗</a> · Recherchestand {RESEARCH}, am Original prüfen</p></figure>')


def _kpis(items):
    cards = ''.join(
        f'<div class="rg-kpi"><p class="rg-kpi-l">{E(k["label"])}</p><p class="rg-kpi-v">{E(k["value"])} <span>{E(k["unit"])}</span></p>'
        f'<p class="rg-kpi-c">{E(k["change"])}</p><dl><div><dt>Zeitraum</dt><dd>{E(k["period"])}</dd></div><div><dt>Stand</dt><dd>{E(k["status"])}</dd></div>'
        f'<div><dt>Quelle</dt><dd><a href="{E(k["url"], quote=True)}" target="_blank" rel="noopener">{E(k["source"])} ↗</a></dd></div></dl></div>' for k in items)
    return f'<div class="rg-kpis">{cards}</div>'


def _scenarios(items):
    cards = ''.join(f'<div class="rg-scn is-{c}"><h3>{E(t)}</h3><p>{E(x)}</p></div>' for c, t, x in items)
    return f'<div class="rg-scns">{cards}</div>'


def _calc(stamp, rows, result, note):
    lines = ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in rows)
    return (f'<div class="rg-calc"><span class="rg-stamp">{E(stamp)}</span><dl>{lines}<div class="rg-calc-r"><dt>{E(result[0])}</dt><dd>{E(result[1])}</dd></div></dl>'
            f'<p>{E(note)}</p></div>')


def _split(title, parts, note):
    """Geteilter Balken für Flächenanteile, Segmentbreite proportional."""
    total = sum(p[1] for p in parts)
    segs = ''.join(f'<span class="rg-split-seg is-{k}" style="flex:{v}"><b>{E(lab)}</b><small>{E(val)}</small></span>' for k, v, lab, val in parts)
    label = E(title + ': ' + ', '.join(f'{p[3]} {p[2]}' for p in parts), quote=True)
    return (f'<figure class="rg-split"><span class="rg-stamp">Fiktives Beispiel</span><figcaption>{E(title)}</figcaption>'
            f'<div class="rg-split-bar" role="img" aria-label="{label}">{segs}</div>'
            f'<p class="rg-split-total">Summe {total:,} m² Geschossfläche Wohnen</p>'.replace(f'{total:,}', f'{total:,}'.replace(',', '.'))
            + '<ul class="rg-split-legend">' + ''.join(f'<li><i class="is-{k}"></i><span><b>{E(val)}</b>{E(lab)}</span></li>' for k, v, lab, val in parts) + '</ul>'
            + f'<p class="rg-split-note">{E(note)}</p></figure>')


def render_blocks(blocks):
    out = ''
    for b in blocks:
        kind = b[0]
        if kind == 'h2':
            out += f'<h2 id="{b[1]}">{E(b[2])}</h2>'
        elif kind == 'p':
            out += f'<p>{inline(b[1])}</p>'
        elif kind == 'list':
            out += '<ul class="rg-list">' + ''.join(f'<li>{x}</li>' for x in b[1]) + '</ul>'
        elif kind == 'checklist':
            out += _checklist(b[1], b[2])
        elif kind == 'table':
            out += _table(*b[1:])
        elif kind == 'flow':
            out += _flow(b[1])
        elif kind == 'plan':
            out += _plan(*b[1:])
        elif kind == 'example':
            out += _example(b[1], b[2])
        elif kind == 'split':
            out += _split(*b[1:])
        elif kind == 'note':
            out += f'<aside class="rg-note"><span class="rg-stamp">Hinweis</span><p>{b[1]}</p></aside>'
        elif kind == 'bars':
            out += _bars(*b[1:])
        elif kind == 'kpis':
            out += _kpis(b[1])
        elif kind == 'scenarios':
            out += _scenarios(b[1])
        elif kind == 'calc':
            out += _calc(*b[1:])
    return out


# ---------------------------------------------------------------- Seiten

def _card(a, cls='rg-card'):
    return (f'<article class="{cls}"><div class="rg-card-top">{_labels(a)}<span class="rg-time">{reading_time(a)} Min. Lesezeit</span>'
            + ('<span class="rg-draft-tag">Entwurf</span>' if a['status'] != 'freigegeben' else '') + '</div>'
            f'<h3><a href="{article_url(a["slug"])}">{E(a["title"])}</a></h3><p>{E(a["description"])}</p>'
            f'<a class="text-link" href="{article_url(a["slug"])}" aria-hidden="true" tabindex="-1">Beitrag lesen ↗</a></article>')


def _featured_visual():
    """Vorschau auf die Vergleichsmatrix des hervorgehobenen Beitrags."""
    rows = [('Rückbau, Entsorgung', 'ok', 'no', 'ok'), ('Abdichtung', 'ok', 'ok', 'q'), ('Elektro', 'no', 'ok', 'ok'), ('Fliesen raumhoch', 'no', 'ok', 'ok')]
    sym = {'ok': '<i class="m-ok" aria-label="enthalten">✓</i>', 'no': '<i class="m-no" aria-label="nicht enthalten">–</i>', 'q': '<i class="m-q" aria-label="unklar">?</i>'}
    body = ''.join(f'<tr><th scope="row">{r[0]}</th>' + ''.join(f'<td>{sym[c]}</td>' for c in r[1:]) + '</tr>' for r in rows)
    return ('<div class="rg-matrix" aria-hidden="true"><table><thead><tr><th></th><th>A</th><th>B</th><th>C</th></tr></thead>'
            f'<tbody>{body}<tr class="m-sum"><th>Endsumme</th><td>38,4 T€</td><td>46,9 T€</td><td>52,3 T€</td></tr></tbody></table>'
            '<span class="rg-stamp">Fiktives Beispiel</span></div>')


def overview_body():
    arts = visible()
    # Jeder Beitrag erscheint nur einmal: im ersten seiner Bereiche, der hervorgehobene nur oben
    listed = [a for a in arts if a['slug'] != FEATURED]
    by_area = {k: [a for a in listed if a['areas'][0] == k] for k in AREA_ORDER}
    entries = '<nav class="rg-entries" id="themen" aria-label="Themenbereiche">' + ''.join(
        f'<a class="rg-entry area-{k}" href="#{k}"><span class="rg-label area-{k}">{AREAS[k]["label"]}</span>'
        f'<h2>{E(AREAS[k]["question"])}</h2><p>{E(AREAS[k]["text"])}</p>'
        f'<span class="rg-entry-more">{len(by_area[k])} {"Beitrag" if len(by_area[k]) == 1 else "Beiträge"} ↓</span></a>' for k in AREA_ORDER) + '</nav>'
    feat = ''
    f = BY_SLUG[FEATURED]
    if f in arts:
        feat = (f'<section class="rg-featured" aria-labelledby="rg-feat-t"><div class="rg-featured-text"><p class="rg-kicker">Hervorgehobener Beitrag</p>'
                f'<div class="rg-card-top">{_labels(f)}<span class="rg-time">{reading_time(f)} Min. Lesezeit</span>'
                + ('<span class="rg-draft-tag">Entwurf</span>' if f['status'] != 'freigegeben' else '') + '</div>'
                f'<h2 id="rg-feat-t"><a href="{article_url(f["slug"])}">{E(f["title"])}</a></h2><p>{E(f["lead"])}</p>'
                f'<a class="button" href="{article_url(f["slug"])}">Beitrag lesen <span aria-hidden="true">↗</span></a></div>'
                f'{_featured_visual()}</section>')
    sections = ''
    for k in AREA_ORDER:
        items = by_area[k]
        planned = [t for a, t in PLANNED if a == k] if SHOW_DRAFTS else []
        cards = ''.join(_card(a) for a in items) + ''.join(
            f'<article class="rg-card is-planned"><div class="rg-card-top"><span class="rg-label area-{k}">{AREAS[k]["label"]}</span><span class="rg-draft-tag">geplant</span></div>'
            f'<h3>{E(t)}</h3><p>Folgebeitrag, noch nicht geschrieben.</p></article>' for t in planned)
        if not cards:
            cards = '<p class="rg-empty-note">Beiträge zu diesem Thema erscheinen in Kürze.</p>'
        sections += (f'<section class="rg-area area-{k}" id="{k}"><div class="rg-area-head"><span class="rg-label area-{k}">{AREAS[k]["label"]}</span>'
                     f'<h2>{AREAS[k]["label"]} <span>— {E(AREAS[k]["topic"])}</span></h2></div>'
                     f'<div class="rg-grid">{cards}</div></section>')
    m = BY_SLUG['markt']
    if m in arts:
        sections += (f'<section class="rg-area rg-market" id="markt"><div class="rg-area-head"><span class="rg-label">Markt</span>'
                     f'<h2>Marktanalyse <span>— Deutschland und Berlin</span></h2><p>Preise, Kauffälle und Geldumsatz aus amtlichen Quellen, mit Stand und Quelle an jeder Zahl.</p></div>'
                     f'<div class="rg-grid">{_card(m)}</div></section>')
    note = ('<p class="rg-preview-note">Vorschau: Alle Beiträge sind Entwürfe und erscheinen erst nach Freigabe auf der Website.</p>'
            if SHOW_DRAFTS and any(a['status'] != 'freigegeben' for a in arts) else '')
    return entries + note + feat + sections


def article_body(a, author_img):
    h2s = [b for b in a['blocks'] if b[0] == 'h2']
    toc = ('<nav class="rg-toc" aria-label="Inhalt"><p>Inhalt</p><ol>' + ''.join(f'<li><a href="#{b[1]}">{E(b[2])}</a></li>' for b in h2s) + '</ol></nav>'
           if len(h2s) >= 4 else '')
    dates = f'<time datetime="{a["published"]}">{_date(a["published"])}</time>'
    if a.get('updated'):
        dates += f' · aktualisiert <time datetime="{a["updated"]}">{_date(a["updated"])}</time>'
    draft = ''
    if a['status'] != 'freigegeben':
        checks = ''.join(f'<li>{E(x)}</li>' for x in a.get('review', []))
        draft = (f'<div class="rg-draft"><strong>Entwurf, nicht veröffentlicht.</strong> Fachliche Aussagen vor Veröffentlichung prüfen'
                 + (f':<ul>{checks}</ul>' if checks else '.') + '</div>')
    head = (f'<header class="rg-article-head"><div class="rg-article-head-in">'
            f'<a class="rg-back" href="{page("ratgeber")}">← Ratgeber</a>'
            f'<div class="rg-card-top">{_labels(a, dark=True)}</div><h1>{E(a["title"])}</h1><p class="rg-lead">{E(a["lead"])}</p>'
            f'<div class="rg-byline">{author_img}<div><strong>Marco Kaimann</strong><span>Gründer von GRENFORD</span></div>'
            f'<div class="rg-meta">{dates} · {reading_time(a)} Min. Lesezeit</div></div></div></header>')
    key = '<aside class="rg-key"><h2>Das Wichtigste in Kürze</h2><ul>' + ''.join(f'<li>{E(x)}</li>' for x in a['key']) + '</ul></aside>'
    label, k, hash_, text = a['next']
    nxt = (f'<section class="rg-next area-{k if k in AREAS else "grenford"}"><p class="rg-kicker">Ihr nächster Schritt</p><h2>{E(label)}</h2><p>{E(text)}</p>'
           f'<a class="button" href="{page(k)}{hash_}">{E(label)} <span aria-hidden="true">↗</span></a></section>')
    rel = [BY_SLUG[s] for s in a.get('related', []) if _is_visible(s)]
    related = ('<section class="rg-related"><h2>Weiterlesen</h2><div class="rg-grid">' + ''.join(_card(r) for r in rel) + '</div></section>') if rel else ''
    stand = _date(a.get('updated') or a['published'])
    legal = (f'<p class="rg-legal">Stand: {stand}. Dieser Beitrag dient der allgemeinen Information und ersetzt keine Rechts-, Steuer- oder Finanzierungsberatung im Einzelfall. '
             'Gesetze, Verwaltungsvorschriften und Marktdaten können sich ändern; maßgeblich sind die verlinkten amtlichen Quellen.</p>')
    body = f'<div class="rg-article-body">{toc}<div class="rg-prose">{draft}{key}{render_blocks(a["blocks"])}{legal}{nxt}</div></div>'
    return f'<article class="rg-article area-{a["areas"][0]}">{head}{body}{related}</article>'


# ---------------------------------------------------------------- Lebenssituationen (Property) und energetische Sanierung (Projects)
ARTICLES += [
 {
  'slug': 'immobilie-geerbt', 'areas': ['property'], 'status': 'entwurf', 'published': '2026-11-12', 'updated': None,
  'title': 'Immobilie geerbt: behalten, vermieten oder verkaufen?',
  'meta_title': 'Immobilie geerbt: behalten, vermieten oder verkaufen? | GRENFORD Ratgeber',
  'description': 'Welche Schritte nach einer Erbschaft zuerst anstehen, wie eine Erbengemeinschaft entscheidet und wie Sie Selbstnutzung, Vermietung und Verkauf mit denselben Zahlen vergleichen. Mit fiktivem Fall und Unterlagenliste.',
  'lead': 'Mit einer geerbten Wohnung oder einem Haus kommen in kurzer Zeit viele Fragen: Wem gehört die Immobilie jetzt, was ist sie wert, und was kostet es, sie zu behalten? Am Anfang steht deshalb die Klärung, nicht der Verkauf.',
  'key': ['Erst Erbnachweis und Grundbuch klären, dann entscheiden.',
          'Eine Erbengemeinschaft kann nur gemeinsam verkaufen.',
          'Selbstnutzung, Vermietung und Verkauf mit denselben Zahlen vergleichen.'],
  'next': ('Wert der geerbten Immobilie ermitteln', 'bewerten', '#bewertung', 'Wert heute und nach einer Sanierung, als gemeinsame Grundlage für alle Erben.'),
  'related': ['vor-dem-verkauf-sanieren', 'grundbuchauszug-anfordern', 'immobilie-trennung-scheidung'],
  'review': ['Gebührenfreiheit der Grundbuchberichtigung binnen zwei Jahren nach dem Erbfall (GNotKG, KV 14110) am Original prüfen',
             'Erbschaftsteuer: Freibeträge und Befreiung für das Familienheim (§§ 13, 16 ErbStG) am aktuellen Stand prüfen',
             'Erbengemeinschaft und Teilungsversteigerung (§§ 2040, 2042 BGB, § 180 ZVG) juristisch prüfen lassen',
             'Übernahme des Anschaffungszeitpunkts bei Erbschaft (§ 23 EStG) steuerlich bestätigen'],
  'blocks': [
   ('h2', 'schritte', 'Die ersten Schritte'),
   ('flow', [('Erbnachweis klären', 'Ein Erbschein oder ein notarielles Testament mit Eröffnungsprotokoll weist nach, wer erbt. Ohne diesen Nachweis kann das Grundbuch nicht berichtigt werden.'),
             ('Grundbuch berichtigen', 'Die Erben werden als neue Eigentümer eingetragen. Wird der Antrag innerhalb von zwei Jahren nach dem Erbfall gestellt, fallen dafür in der Regel keine Grundbuchgebühren an.'),
             ('Laufende Kosten sichern', 'Grundsteuer, Hausgeld oder Nebenkosten, Versicherungen und Kredite laufen weiter. Prüfen Sie, ob Verträge auf die Erben umgeschrieben werden müssen.'),
             ('Wert einschätzen', 'Der Wert ist die Grundlage für die Einigung unter den Erben und für die Erbschaftsteuer. Für das Finanzamt kann ein Verkehrswertgutachten sinnvoll sein.')]),
   ('h2', 'wege', 'Drei Wege im Vergleich'),
   ('table', 'Im Überblick', ['', 'Was passiert', 'Was es braucht', 'Worauf achten'], [
     ['Selbst nutzen', 'Ein Erbe zieht ein, die anderen werden ausgezahlt', 'Einigung über den Wert, Finanzierung der Auszahlung', 'Sanierungsbedarf vor dem Einzug'],
     ['Vermieten', 'Laufende Einnahmen, die Immobilie bleibt in der Familie', 'Verwaltung, Rücklagen, Einigung über Ausgaben', 'Mietrecht, Instandhaltung, Abstimmung unter den Erben'],
     ['Verkaufen', 'Der Erlös wird nach Erbquoten verteilt', 'Zustimmung aller Erben', 'im heutigen Zustand oder nach einer Auffrischung']], ''),
   ('h2', 'erbengemeinschaft', 'Wenn mehrere erben'),
   ('p', 'Erben mehrere Personen, gehört ihnen die Immobilie gemeinsam als Erbengemeinschaft. Verkaufen können sie nur gemeinsam. Kommt keine Einigung zustande, kann jeder Miterbe die Teilungsversteigerung beantragen. Das ist meist der teuerste Weg, weil der Erlös oft unter dem Marktwert liegt. Eine gemeinsame, nachvollziehbare Wertermittlung ist deshalb häufig der erste Schritt zur Einigung.'),
   ('h2', 'steuern', 'Steuern im Blick'),
   ('list', ['<strong>Erbschaftsteuer:</strong> Maßgeblich ist der Wert der Immobilie am Todestag. Ehepartner und Kinder haben hohe persönliche Freibeträge; für ein Familienheim, das weiter selbst bewohnt wird, gibt es zusätzliche Befreiungen.',
             '<strong>Späterer Verkauf:</strong> Erben übernehmen den Anschaffungszeitpunkt der verstorbenen Person. Liegt deren Kauf mehr als zehn Jahre zurück, ist ein Gewinn beim Verkauf in der Regel nicht einkommensteuerpflichtig.',
             'Einzelheiten klären Sie mit Ihrer Steuerberatung, bevor Sie entscheiden.']),
   ('example', 'Fiktiver Fall: Zwei Geschwister erben eine Wohnung',
    '<p>3 Zimmer, 78 m², Altbau, seit Jahren selbst bewohnt, Bad und Elektrik im Originalzustand. Die Schwester möchte verkaufen, der Bruder überlegt zu vermieten.</p>'
    '<ol><li><strong>Wertermittlung:</strong> Wert heute und nach einer Auffrischung, als gemeinsame Zahlengrundlage.</li>'
    '<li><strong>Vergleich:</strong> Mieteinnahmen abzüglich Kosten und Rücklagen gegen den Verkaufserlös nach Erbquoten.</li>'
    '<li><strong>Entscheidung:</strong> Die Geschwister verkaufen nach einer kleinen Auffrischung, der Property Brief bereitet den Verkauf vor.</li></ol>'
    '<p>Gestritten wurde nicht über den Weg, sondern über den Wert. Mit einer gemeinsamen Grundlage fiel die Entscheidung in wenigen Wochen.</p>'),
   ('h2', 'unterlagen', 'Unterlagen'),
   ('checklist', 'Für das erste Gespräch bereitlegen', [
     'Erbschein oder Testament mit Eröffnungsprotokoll',
     'Grundbuchauszug',
     'Bei Wohnungen: Teilungserklärung, Protokolle der Eigentümerversammlungen, Hausgeldabrechnung',
     'Energieausweis',
     'Mietverträge, falls die Immobilie vermietet ist',
     'Unterlagen zu Krediten und Grundschulden']),
   ('p', 'Ob sich vor dem Verkauf eine Auffrischung lohnt, zeigt [[vor-dem-verkauf-sanieren|Vor dem Verkauf sanieren?]]. Den Grundbuchauszug beantragen Sie wie in [[grundbuchauszug-anfordern|Grundbuchauszug anfordern]] beschrieben.'),
  ],
 },
 {
  'slug': 'immobilie-trennung-scheidung', 'areas': ['property'], 'status': 'entwurf', 'published': '2026-11-12', 'updated': None,
  'title': 'Trennung und Scheidung: Was mit der gemeinsamen Immobilie geschieht',
  'meta_title': 'Immobilie bei Trennung und Scheidung: Übernahme, Verkauf oder Vermietung | GRENFORD Ratgeber',
  'description': 'Was bei einer Trennung zuerst geklärt wird, welche vier Wege es für die gemeinsame Immobilie gibt und warum Grundbuch und Darlehen getrennt betrachtet werden müssen. Mit fiktivem Rechenbeispiel.',
  'lead': 'Bei einer Trennung ist die gemeinsame Wohnung oder das Haus oft der größte Vermögenswert und zugleich der emotionalste. Eine sachliche Entscheidung braucht zwei Dinge: einen Wert, dem beide vertrauen, und einen Überblick über die Wege.',
  'key': ['Ein gemeinsam anerkannter Wert entschärft die meisten Konflikte.',
          'Grundbuch und Darlehensvertrag sind zwei verschiedene Dinge.',
          'Übernahme, Verkauf und Vermietung mit denselben Zahlen vergleichen.'],
  'next': ('Gemeinsamen Wert ermitteln', 'bewerten', '#bewertung', 'Eine Wertspanne mit Begründung, die beide Seiten nachvollziehen können.'),
  'related': ['immobilie-geerbt', 'grundbuchauszug-anfordern', 'vor-dem-verkauf-sanieren'],
  'review': ['Zugewinnausgleich, Teilungsversteigerung (§ 180 ZVG) und Haftung aus dem Darlehen juristisch prüfen lassen',
             'Vorfälligkeitsentschädigung (§§ 490, 502 BGB) allgemein halten', 'Rechenbeispiel ist fiktiv'],
  'blocks': [
   ('h2', 'klaeren', 'Was zuerst geklärt wird'),
   ('list', ['<strong>Eigentum:</strong> Wer steht im Grundbuch, und zu welchen Anteilen?',
             '<strong>Finanzierung:</strong> Wer ist Darlehensnehmer, wie hoch ist die Restschuld, wann endet die Zinsbindung?',
             '<strong>Wert:</strong> Was ist die Immobilie heute wert? Ohne diese Zahl lassen sich weder Auszahlung noch Verkauf sinnvoll verhandeln.',
             '<strong>Nutzung:</strong> Wer wohnt bis zur Entscheidung in der Immobilie, und wer trägt in dieser Zeit die Kosten?']),
   ('h2', 'wege', 'Vier Wege'),
   ('table', 'Im Überblick', ['', 'Was passiert', 'Voraussetzung', 'Worauf achten'], [
     ['Übernahme', 'Einer behält die Immobilie und zahlt den anderen aus', 'Finanzierung der Auszahlung, Zustimmung der Bank', 'Entlassung des anderen aus dem Darlehen schriftlich klären'],
     ['Gemeinsamer Verkauf', 'Der Erlös wird nach Anteilen geteilt, das Darlehen abgelöst', 'Einigung über Preis und Vermarktung', 'Vorfälligkeitsentschädigung bei vorzeitiger Ablösung'],
     ['Vermietung', 'Beide bleiben Eigentümer, die Miete trägt die Kosten', 'dauerhafte Zusammenarbeit', 'Abstimmung über Ausgaben und Verwaltung'],
     ['Teilungsversteigerung', 'Das Gericht versteigert auf Antrag eines Eigentümers', 'keine Einigung', 'meist niedrigerer Erlös, lange Dauer']], ''),
   ('h2', 'darlehen', 'Grundbuch und Darlehen'),
   ('p', 'Aus dem Grundbuch auszuscheiden heißt nicht, aus dem Kredit entlassen zu sein. Übernimmt einer die Immobilie, muss die Bank zustimmen, dass der andere aus dem Darlehensvertrag ausscheidet. Sonst haftet er weiter, obwohl ihm nichts mehr gehört.'),
   ('p', 'Wie die Immobilie im Zugewinnausgleich zählt und wie eine Auszahlung steuerlich wirkt, hängt vom Einzelfall ab. Das klären Anwalt und Steuerberatung; GRENFORD liefert dafür den Wert und die Unterlagen.'),
   ('example', 'Fiktiver Fall: Doppelhaushälfte, beide im Grundbuch',
    '<p>Wert laut gemeinsamer Einschätzung 520.000 €, Restschuld 220.000 €. Im Haus stecken damit 300.000 € Eigenkapital, je Hälfte 150.000 €.</p>'
    '<ul><li><strong>Übernahme:</strong> Er möchte bleiben, müsste 150.000 € auszahlen und die Restschuld allein tragen. Die Bank prüft, ob sein Einkommen für 370.000 € Darlehen reicht.</li>'
    '<li><strong>Verkauf:</strong> Nach Ablösung der Restschuld bleiben je rund 150.000 €, vor Verkaufskosten und gegebenenfalls Vorfälligkeitsentschädigung.</li></ul>'
    '<p>Die Zahlen sind für beide gleich. Offen bleibt nur noch die Frage, ob die Übernahme finanzierbar ist.</p>'),
   ('h2', 'unterlagen', 'Unterlagen'),
   ('checklist', 'Für das erste Gespräch bereitlegen', [
     'Grundbuchauszug',
     'Darlehensverträge und aktuelle Restschuld',
     'Kaufvertrag und Unterlagen zu Umbauten',
     'Bei Wohnungen: Teilungserklärung und Hausgeldabrechnung',
     'Energieausweis']),
   ('p', 'Wird verkauft, hilft [[vor-dem-verkauf-sanieren|Vor dem Verkauf sanieren?]] bei der Frage, ob sich eine Auffrischung vorher lohnt.'),
  ],
 },
 {
  'slug': 'wohnen-im-alter', 'areas': ['property'], 'status': 'entwurf', 'published': '2026-11-12', 'updated': None,
  'title': 'Wohnen im Alter: verkaufen, umbauen oder mit Wohnrecht bleiben?',
  'meta_title': 'Wohnen im Alter: Immobilie verkaufen, umbauen oder Wohnrecht | GRENFORD Ratgeber',
  'description': 'Welche Wege es gibt, wenn Haus oder Wohnung im Alter nicht mehr passen: barrierearm umbauen, verkaufen und kleiner wohnen, Verkauf mit Wohnrecht, Leibrente oder Teilverkauf. Mit fiktivem Fall und Checkliste.',
  'lead': 'Das Haus ist zu groß geworden, die Treppe zu steil, der Garten zu viel Arbeit. Wer im Alter über seine Immobilie nachdenkt, hat mehr Möglichkeiten als Bleiben oder Verkaufen. Entscheidend ist, was Sie in den nächsten Jahren brauchen und wie viel Kapital Sie freisetzen möchten.',
  'key': ['Erst die Wohnwünsche klären, dann über die Immobilie entscheiden.',
          'Umbau, Verkauf und Verkauf mit Wohnrecht mit denselben Zahlen vergleichen.',
          'Leibrente und Teilverkauf über die gesamte Laufzeit durchrechnen lassen.'],
  'next': ('Wert Ihrer Immobilie einschätzen lassen', 'bewerten', '#bewertung', 'Wert heute und nach einem Umbau, als Grundlage für jede Variante.'),
  'related': ['renovieren-modernisieren-sanieren', 'bauangebote-vergleichen', 'immobilie-geerbt'],
  'review': ['Wohnrecht und Nießbrauch (§§ 1030, 1093 BGB), Leibrente und Teilverkauf allgemein gehalten; juristisch und steuerlich prüfen lassen',
             'Förderung für altersgerechten Umbau am aktuellen Stand prüfen'],
  'blocks': [
   ('h2', 'fragen', 'Die Ausgangsfragen'),
   ('list', ['<strong>Wohnen:</strong> Möchten Sie in der Umgebung bleiben oder näher an Familie und Versorgung ziehen?',
             '<strong>Größe:</strong> Wie viele Zimmer nutzen Sie tatsächlich?',
             '<strong>Barrieren:</strong> Sind Treppen, Bad und Eingang auch in zehn Jahren noch gut zu bewältigen?',
             '<strong>Finanzen:</strong> Brauchen Sie Kapital, etwa für Pflege, Familie oder eine neue Wohnung?']),
   ('h2', 'wege', 'Vier Wege im Vergleich'),
   ('table', 'Im Überblick', ['', 'Was passiert', 'Für wen es passt', 'Worauf achten'], [
     ['Bleiben und umbauen', 'Bad, Eingang und Wege werden barrierearm', 'wer in der Umgebung bleiben möchte', 'Kosten und Bauzeit; Förderung vor dem Auftrag prüfen'],
     ['Verkaufen und kleiner wohnen', 'Der Erlös finanziert eine passende Wohnung', 'wer bereit ist umzuziehen', 'Verkauf und Umzug zeitlich abstimmen'],
     ['Verkauf mit Wohnrecht oder Nießbrauch', 'Ein Käufer erwirbt, Sie bleiben wohnen', 'wer Kapital braucht und bleiben möchte', 'Der Kaufpreis sinkt um den Wert des Rechts'],
     ['Leibrente oder Teilverkauf', 'Rente oder Teilerlös gegen weiteres Nutzungsrecht', 'wer Kapital braucht, ohne auszuziehen', 'laufende Entgelte und Vertragsbedingungen genau prüfen']], ''),
   ('h2', 'wohnrecht', 'Wohnrecht, Nießbrauch und Teilverkauf'),
   ('p', 'Wohnrecht und Nießbrauch werden im Grundbuch eingetragen und sichern, dass Sie in der Immobilie bleiben können. Mit einem Wohnrecht dürfen Sie selbst darin wohnen, mit einem Nießbrauch dürfen Sie die Immobilie auch vermieten und die Miete behalten. Für Käufer mindert jedes dieser Rechte den Wert, abhängig von Ihrem Alter und der Dauer.'),
   ('p', 'Beim Teilverkauf verkaufen Sie einen Anteil und zahlen für die weitere Nutzung des verkauften Teils ein monatliches Entgelt. Lassen Sie sich die Gesamtkosten über die erwartete Dauer berechnen und mit einem Verkauf mit Wohnrecht vergleichen.'),
   ('example', 'Fiktiver Fall: Einfamilienhaus, 140 m², Ehepaar über 70',
    '<p>Das Haus ist schuldenfrei, Bad und Schlafzimmer liegen im Obergeschoss. Beide möchten im Ort bleiben.</p>'
    '<ol><li><strong>Wert heute:</strong> Ausgangspunkt für jede Variante.</li>'
    '<li><strong>Umbau:</strong> Schlafzimmer und Bad ins Erdgeschoss, Kosten aus vergleichbaren Angeboten statt aus Schätzungen.</li>'
    '<li><strong>Alternative:</strong> Verkauf und Kauf einer barrierefreien Wohnung im Ort.</li></ol>'
    '<p>Mit beiden Varianten nebeneinander fiel die Entscheidung für den Umzug: Der Umbau hätte viel gekostet, ohne die Gartenarbeit zu lösen.</p>'),
   ('h2', 'checkliste', 'Checkliste'),
   ('checklist', 'Vor der Entscheidung', [
     'Der Wert heute ist eingeschätzt.',
     'Umbaukosten beruhen auf Angeboten, nicht auf Schätzungen.',
     'Förderung für den barrierearmen Umbau ist vor dem Auftrag geprüft.',
     'Bei Wohnrecht, Leibrente oder Teilverkauf liegt eine unabhängige Berechnung vor.',
     'Familie und spätere Erben sind in die Entscheidung einbezogen.']),
   ('p', 'Wer umbaut, findet die richtige Reihenfolge in [[renovieren-modernisieren-sanieren|Renovieren, modernisieren oder sanieren?]] und vergleicht die Angebote wie in [[bauangebote-vergleichen|Drei Bauangebote, drei Preise]] beschrieben.'),
  ],
 },
 {
  'slug': 'energetisch-sanieren', 'areas': ['projects'], 'status': 'entwurf', 'published': '2026-11-12', 'updated': None,
  'title': 'Energetisch sanieren: Pflichten, Reihenfolge und Förderung',
  'meta_title': 'Energetisch sanieren: GEG-Pflichten, Reihenfolge und Förderung | GRENFORD Ratgeber',
  'description': 'Welche Nachrüstpflichten nach einem Kauf gelten, warum die Gebäudehülle vor der Heizung kommt, was bei der Förderung vor dem Auftrag passieren muss und warum energetische Angebote schwer vergleichbar sind. Mit fiktivem Fall.',
  'lead': 'Neue Heizung, Dämmung, Fenster: Energetische Maßnahmen sind teuer, gefördert und teilweise Pflicht. Wer die Reihenfolge einhält und die Förderung vor dem Auftrag klärt, spart doppelt. Vergleichbar werden die Angebote aber erst, wenn alle Firmen dieselben technischen Anforderungen kalkulieren.',
  'key': ['Nach einem Eigentümerwechsel gelten Nachrüstpflichten mit Fristen.',
          'Erst die Hülle, dann die Heizung: Die Heizlast hängt von der Dämmung ab.',
          'Förderung immer vor der Beauftragung beantragen.'],
  'next': ('Angebote vergleichen lassen', 'projects', '#memo', 'Im Renovation Memo kalkulieren alle Firmen dieselbe Leistung, einschließlich der Förderanforderungen.'),
  'related': ['bauangebote-vergleichen', 'renovieren-modernisieren-sanieren', 'vor-dem-verkauf-sanieren'],
  'review': ['GEG §§ 47, 71, 72, 73 (Nachrüstpflichten, Eigentümerwechsel, Fristen) am aktuellen Gesetzestext prüfen',
             'Vorgaben für neue Heizungen und die angekündigte GEG-Reform: Stand vor Freigabe prüfen',
             'Förderbedingungen (BAFA-Einzelmaßnahmen, KfW-Heizungsförderung, Antrag vor Vorhabenbeginn, Vertrag mit aufschiebender Bedingung) am Original prüfen'],
  'blocks': [
   ('h2', 'pflichten', 'Was nach dem Kauf Pflicht ist'),
   ('p', 'Das Gebäudeenergiegesetz (GEG) schreibt bei bestehenden Gebäuden einige Nachrüstungen vor. In Ein- und Zweifamilienhäusern, die der Eigentümer selbst bewohnt, greifen sie erst nach einem Eigentümerwechsel, mit einer Frist von zwei Jahren.'),
   ('list', ['<strong>Oberste Geschossdecke:</strong> dämmen, wenn sie ungedämmt ist und den Mindestwärmeschutz nicht erfüllt; alternativ das Dach darüber.',
             '<strong>Alte Heizkessel:</strong> Öl- und Gaskessel mit konstanter Temperatur, die älter als 30 Jahre sind, müssen in der Regel ersetzt werden. Brennwert- und Niedertemperaturkessel sind ausgenommen.',
             '<strong>Leitungen:</strong> ungedämmte Heizungs- und Warmwasserleitungen in unbeheizten Räumen dämmen.']),
   ('note', 'Stand 12. November 2026: Für neu eingebaute Heizungen gelten Vorgaben zum Anteil erneuerbarer Energien, abhängig von der kommunalen Wärmeplanung. Eine Überarbeitung des GEG ist politisch angekündigt. Vor jeder Heizungsentscheidung den aktuellen Gesetzesstand prüfen.'),
   ('h2', 'reihenfolge', 'Die sinnvolle Reihenfolge'),
   ('flow', [('Bestand aufnehmen', 'Energieausweis, Verbrauch der letzten Jahre, Zustand von Dach, Fenstern, Fassade und Heizung. Ein individueller Sanierungsfahrplan (iSFP) aus einer Energieberatung ordnet die Maßnahmen.'),
             ('Hülle vor Technik', 'Dämmung und Fenster senken den Wärmebedarf. Erst danach lässt sich die Heizung richtig auslegen, etwa eine Wärmepumpe.'),
             ('Heizung und Abgleich', 'Neue Heizung, hydraulischer Abgleich, passende Heizflächen. Wärmepumpen arbeiten am besten mit niedrigen Vorlauftemperaturen.'),
             ('Nachweise', 'Geförderte Maßnahmen brauchen meist die Bestätigung einer Energieeffizienz-Expertin oder eines Energieeffizienz-Experten.')]),
   ('h2', 'foerderung', 'Förderung: Was vor dem Auftrag passieren muss'),
   ('p', 'Bund und Länder fördern Maßnahmen an der Gebäudehülle, den Heizungstausch und die Energieberatung, als Zuschuss oder zinsgünstigen Kredit. Die Programme ändern sich regelmäßig. Zwei Regeln gelten aber fast immer:'),
   ('list', ['Der Antrag wird vor der Beauftragung gestellt. Ein bereits unterschriebener Auftrag kann die Förderung kosten, wenn er nicht ausdrücklich unter dem Vorbehalt der Förderzusage steht.',
             'Die Angebote müssen die technischen Mindestanforderungen des Programms erfüllen. Fehlen sie in einem Angebot, ist es billiger, aber nicht förderfähig.']),
   ('h2', 'angebote', 'Warum energetische Angebote schwer vergleichbar sind'),
   ('p', 'Bei Heizung und Dämmung unterscheiden sich Angebote nicht nur im Preis, sondern in der Auslegung: mit oder ohne Heizlastberechnung, welche Dämmstärke, Fenster mit welchem Wärmedurchgang, hydraulischer Abgleich enthalten oder nicht. Im Renovation Memo legt GRENFORD fest, was alle Firmen anbieten, einschließlich der Förderanforderungen, und vergleicht erst dann die Preise.'),
   ('example', 'Fiktiver Fall: Einfamilienhaus von 1978, neu gekauft',
    '<p>Gaskessel mit konstanter Temperatur von 1992, oberste Geschossdecke ungedämmt, Fenster aus den 1990er-Jahren.</p>'
    '<ol><li><strong>Pflicht:</strong> Geschossdecke dämmen und Kessel ersetzen, beides innerhalb von zwei Jahren nach dem Kauf.</li>'
    '<li><strong>Reihenfolge:</strong> erst Geschossdecke und Fenster, dann die Heizlast neu berechnen lassen.</li>'
    '<li><strong>Angebote:</strong> drei Angebote für eine Wärmepumpe auf derselben Grundlage, mit Heizlastberechnung und hydraulischem Abgleich.</li>'
    '<li><strong>Förderung:</strong> Antrag mit Energieberatung vor der Unterschrift.</li></ol>'
    '<p>Die Wärmepumpe fiel kleiner aus als im ersten Angebot, weil die Heizlast nach der Dämmung neu berechnet wurde.</p>'),
   ('h2', 'checkliste', 'Checkliste'),
   ('checklist', 'Vor der Beauftragung', [
     'Energieausweis und Verbrauchswerte liegen vor.',
     'Nachrüstpflichten und Fristen sind geprüft.',
     'Die Reihenfolge Hülle vor Heizung ist geklärt.',
     'Das Förderprogramm ist ausgewählt, der Antrag wird vor dem Auftrag gestellt.',
     'Alle Angebote erfüllen dieselben technischen Anforderungen.',
     'Heizlastberechnung und hydraulischer Abgleich sind enthalten.']),
   ('p', 'Wie Sie Angebote Position für Position vergleichen, zeigt [[bauangebote-vergleichen|Drei Bauangebote, drei Preise]]. Welche Maßnahmen überhaupt sinnvoll sind, ordnet [[renovieren-modernisieren-sanieren|Renovieren, modernisieren oder sanieren?]].'),
  ],
 },
]
BY_SLUG = {a['slug']: a for a in ARTICLES}
