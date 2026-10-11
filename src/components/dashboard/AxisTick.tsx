/** Y-Achsen-Beschriftung ohne Zeilenumbruch (Recharts bricht sonst „€ 400 Tsd.“ um). */
export function YTick({ x, y, payload, format }: { x?: number; y?: number; payload?: { value: number }; format: (v: number) => string }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={10.5} fill="#6b7690">
      {format(payload?.value ?? 0)}
    </text>
  );
}
