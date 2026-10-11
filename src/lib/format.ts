const de = new Intl.NumberFormat("de-DE");

/** € 482.000 */
export function euro(value: number) {
  return `€ ${de.format(value)}`;
}

/** € 1,26 Mio. */
export function euroMio(valueMio: number, digits?: number) {
  const f = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: digits ?? (valueMio % 1 === 0 ? 0 : 1),
    maximumFractionDigits: digits ?? 2,
  });
  return `€ ${f.format(valueMio)} Mio.`;
}

/** € 1,26 Mio. bzw. € 482.000 – je nach Größenordnung */
export function euroCompact(value: number) {
  return value >= 1_000_000 ? euroMio(value / 1_000_000) : euro(value);
}
