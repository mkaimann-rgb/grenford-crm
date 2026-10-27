/**
 * GRENFORD · Website-Anfragen ins CRM (Google Sheet)
 *
 * Nimmt die Anfragen der Website entgegen (Projektanfrage, Kurznachricht, Bewertung, Suchprofile)
 * und schreibt sie als neue Zeile in das Blatt „Website-Anfragen“. Fehlt das Blatt, wird es angelegt.
 * Zusätzlich geht eine Benachrichtigung per E-Mail an NOTIFY, mit „Antworten“ direkt an die anfragende Person.
 *
 * Einrichtung: siehe crm/README.md (im CRM-Sheet unter Erweiterungen → Apps Script einfügen, als Web-App bereitstellen).
 */

const SHEET_NAME = 'Website-Anfragen';
const NOTIFY = 'kontakt@grenford.de';   // Empfänger der Benachrichtigung; leer lassen = keine E-Mail
const ANSWER_HOURS = 48;                // Zusage auf der Website: Antwort innerhalb von 48 Stunden

const HEADERS = ['Eingang am', 'Antwort bis', 'Status', 'Bereich', 'Art der Anfrage', 'Name', 'E-Mail', 'Telefon',
                 'Bevorzugter Kontakt', 'Angaben', 'Seite', 'Notiz'];
const AREAS = { investment: 'Investment', property: 'Property', renovation: 'Projects', general: 'Allgemein' };
const LIMITS = { name: 150, email: 200, phone: 60, message: 6000, page: 500 };

function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return reply({ ok: false, error: 'invalid_json' });
  }
  const clean = key => String(data[key] == null ? '' : data[key]).trim().slice(0, LIMITS[key] || 500);
  const entry = { name: clean('name'), email: clean('email'), phone: clean('phone'), message: clean('message'), page: clean('page') };
  if (!entry.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) return reply({ ok: false, error: 'invalid' });

  // Doppelte Zustellung (z. B. erneutes Absenden binnen 2 Minuten) nur einmal eintragen
  const cache = CacheService.getScriptCache();
  const key = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, entry.email + entry.message));
  if (cache.get(key)) return reply({ ok: true, duplicate: true });

  const lines = entry.message.split('\n');
  const kind = lines[0] || 'Anfrage';
  const contactLine = lines.find(line => line.indexOf('Bevorzugter Kontakt:') === 0) || '';
  const preferred = contactLine.replace('Bevorzugter Kontakt:', '').trim();
  const details = lines.slice(1).filter(line => line.trim() && line !== contactLine).join('\n');
  const now = new Date();
  const due = new Date(now.getTime() + ANSWER_HOURS * 3600 * 1000);
  const area = AREAS[clean('subject')] || 'Allgemein';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = targetSheet();
    sheet.appendRow([now, due, 'Neu', area, safe(kind), safe(entry.name), safe(entry.email), safe(entry.phone),
                     safe(preferred), safe(details), safe(entry.page), '']);
  } finally {
    lock.releaseLock();
  }
  cache.put(key, '1', 120);

  if (NOTIFY) {
    const body = [kind, '', details, '', 'Name: ' + entry.name, 'E-Mail: ' + entry.email, entry.phone ? 'Telefon: ' + entry.phone : '',
                  preferred ? 'Bevorzugter Kontakt: ' + preferred : '', 'Seite: ' + entry.page, '',
                  'Antwort zugesagt bis: ' + Utilities.formatDate(due, 'Europe/Berlin', 'dd.MM.yyyy HH:mm') + ' Uhr'].filter(String).join('\n');
    MailApp.sendEmail({ to: NOTIFY, replyTo: entry.email, subject: 'Neue Website-Anfrage · ' + area + ' · ' + entry.name, body: body });
  }
  return reply({ ok: true });
}

// Aufruf im Browser zeigt nur, dass die Web-App läuft.
function doGet() {
  return reply({ ok: true, service: 'GRENFORD Website-Anfragen' });
}

function targetSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#222e41').setFontColor('#faf6f2');
    sheet.setFrozenRows(1);
    sheet.getRange('A:B').setNumberFormat('dd.MM.yyyy HH:mm');
    sheet.setColumnWidth(10, 420);
    sheet.getRange('J:J').setWrap(true);
    const status = SpreadsheetApp.newDataValidation().requireValueInList(['Neu', 'In Bearbeitung', 'Beantwortet', 'Übernommen', 'Kein Bedarf'], true).build();
    sheet.getRange('C2:C').setDataValidation(status);
  }
  return sheet;
}

// Schutz vor Formeln aus Formularfeldern (z. B. „=HYPERLINK(…)“)
function safe(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Testlauf im Script-Editor: legt eine Beispielzeile an (danach im Blatt löschen).
function testEintrag() {
  const result = doPost({ postData: { contents: JSON.stringify({
    name: 'Test Eintrag', email: 'test@example.com', subject: 'property', page: 'https://www.grenford.de/bewerten/',
    message: 'Bewertungsanfrage · Property\n\nObjektart: Wohnung\nWohnfläche: 90 m²\nBevorzugter Kontakt: E-Mail'
  }) } });
  Logger.log(result.getContent());
}
