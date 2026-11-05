// GRENFORD / Marktseite: Kennzahlen nach Standort, Immobilienart, Zeitraum und Datentyp filtern.
// Ohne passende Daten erscheint der Leerzustand. Ohne JavaScript bleiben alle Kennzahlen sichtbar.
const marketBox = document.getElementById('marktueberblick');
if (marketBox) {
  const selects = [...marketBox.querySelectorAll('[data-filter]')];
  const items = [...marketBox.querySelectorAll('.mk-card, .mk-table tbody tr')];
  const cards = [...marketBox.querySelectorAll('.mk-card')];
  const empty = marketBox.querySelector('[data-mk-empty]');
  const count = marketBox.querySelector('[data-mk-count]');
  const table = marketBox.querySelector('.mk-table');
  const apply = () => {
    const wanted = Object.fromEntries(selects.map(s => [s.dataset.filter, s.value]));
    items.forEach(item => {
      item.hidden = Object.entries(wanted).some(([key, value]) => value && item.dataset[key] !== value);
    });
    const shown = cards.filter(card => !card.hidden).length;
    count.textContent = shown + (shown === 1 ? ' Kennzahl' : ' Kennzahlen');
    empty.hidden = shown > 0;
    if (table) table.hidden = shown === 0;
  };
  selects.forEach(select => select.addEventListener('change', apply));
  marketBox.querySelector('.mk-filters').addEventListener('submit', event => event.preventDefault());
  apply();
}
