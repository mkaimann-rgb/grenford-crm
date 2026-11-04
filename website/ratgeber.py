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
    'property': {'label': 'Property', 'topic': 'Wohnimmobilien kaufen und verkaufen', 'question': 'Wie bereite ich einen Immobilienverkauf vor?',
                 'text': 'Unterlagen, Rechte und Zustand einer Wohnung oder eines Hauses verstehen, bevor Sie verkaufen oder kaufen.'},
    'investment': {'label': 'Investment', 'topic': 'Transaktionen vorbereiten', 'question': 'Wie bereite ich eine Transaktion vor?',
                   'text': 'Vermarktungsweg, Käuferkreis und Unterlagen für Anlageimmobilien festlegen, bevor der erste Investor anfragt.'},
    'projects': {'label': 'Projects', 'topic': 'Sanierungen und Umbauten vorbereiten', 'question': 'Wie bereite ich einen Umbau vor?',
                 'text': 'Maßnahmen ordnen, Bauangebote vergleichbar machen und Kosten realistisch einschätzen, bevor Sie beauftragen.'},
}
AREA_ORDER = ('property', 'investment', 'projects')
FEATURED = 'bauangebote-vergleichen'
PLANNED = [('property', 'Kaufangebote vergleichen: Preis, Bedingungen und Sicherheit der Finanzierung')]


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
  'next': ('Angebote vergleichen lassen', 'projects', '#memo', 'Im Renovation Memo stelle ich Ihre Originalangebote anonymisiert als A, B und C gegenüber.'),
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
             ('Antrag stellen', 'Beim Grundbuchamt des zuständigen Amtsgerichts, schriftlich oder persönlich; in einigen Ländern auch online.'),
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
  'key': ['Ein Sondernutzungsrecht erlaubt die alleinige Nutzung, Eigentümer bleibt die Gemeinschaft.',
          'Maßgeblich sind Teilungserklärung und Grundbuch, nicht die tatsächliche Nutzung.',
          'Klären Sie, wer Pflege und Kosten der Fläche trägt.'],
  'next': ('Property Brief anfragen', 'property', '#memo', 'Im Property Brief stehen Rechte an Garten und Stellplatz mit den Fundstellen in den Unterlagen.'),
  'related': ['teilungserklaerung-pruefen', 'grundbuchauszug-anfordern'],
  'review': ['Aussagen zu Sondereigentum an Stellplätzen und Freiflächen (§ 3 WEG seit 2020) juristisch prüfen lassen'],
  'blocks': [
   ('h2', 'was', 'Was ein Sondernutzungsrecht ist'),
   ('p', 'Ein Sondernutzungsrecht erlaubt einem Eigentümer, einen Teil des Gemeinschaftseigentums allein zu nutzen, zum Beispiel eine Gartenfläche oder einen Stellplatz. Die Fläche selbst bleibt Gemeinschaftseigentum. Begründet wird das Recht in der Teilungserklärung beziehungsweise Gemeinschaftsordnung, damit es auch gegenüber späteren Eigentümern wirkt, wird es im Grundbuch vermerkt.'),
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
  'next': ('Objekt vertraulich einordnen lassen', 'investment', '#bewertung-investment-value', 'Sie geben die Eckdaten Ihres Objekts an. Ich schlage Ihnen den passenden Vermarktungsweg vor.'),
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

BY_SLUG = {a['slug']: a for a in ARTICLES}


def visible():
    return [a for a in ARTICLES if a['status'] == 'freigegeben' or SHOW_DRAFTS]


def published():
    return [a for a in ARTICLES if a['status'] == 'freigegeben']


def article_url(slug):
    return page('ratgeber/' + slug)


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


def overview_body(hero_img):
    arts = visible()
    by_area = {k: [a for a in arts if k in a['areas']] for k in AREA_ORDER}
    intro = ('<section class="rg-intro"><div class="rg-intro-text"><p class="rg-kicker">GRENFORD Ratgeber</p>'
             '<h1>Immobilien&shy;entscheidungen vorbereiten</h1>'
             '<p>Was sollten Sie vor einem Immobilienverkauf klären? Welche Unterlagen braucht eine erste Ankaufprüfung? '
             'Wie lassen sich Bauangebote sinnvoll vergleichen? Im GRENFORD Ratgeber finden Sie Leitfäden und Checklisten für diese Entscheidungen.</p></div>'
             f'<figure class="rg-intro-img">{hero_img}</figure></section>')
    entries = '<nav class="rg-entries" aria-label="Themenbereiche">' + ''.join(
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
                     f'<h2>{AREAS[k]["label"]} <span>— {E(AREAS[k]["topic"])}</span></h2><p>{E(AREAS[k]["text"])}</p></div>'
                     f'<div class="rg-grid">{cards}</div></section>')
    note = ('<p class="rg-preview-note">Vorschau: Alle Beiträge sind Entwürfe und erscheinen erst nach Freigabe auf der Website.</p>'
            if SHOW_DRAFTS and any(a['status'] != 'freigegeben' for a in arts) else '')
    return intro + entries + note + feat + sections


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
    body = f'<div class="rg-article-body">{toc}<div class="rg-prose">{draft}{key}{render_blocks(a["blocks"])}{nxt}</div></div>'
    return f'<article class="rg-article area-{a["areas"][0]}">{head}{body}{related}</article>'
