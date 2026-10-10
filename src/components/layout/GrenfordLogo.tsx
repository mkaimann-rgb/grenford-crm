/**
 * GRENFORD-Wortbildmarke (Nachbau als SVG nach der Visualisierung).
 * Sobald die Original-Logodatei vorliegt, wird sie hier 1:1 eingesetzt.
 */
export function GrenfordMonogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      <circle cx="24" cy="24" r="21" strokeWidth="1.6" />
      <path d="M33.5 16.5 A12 12 0 1 0 34.5 30" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.5 14.5 H33" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 14.5 V39" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 25 H31" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function GrenfordLogo() {
  return (
    <div className="flex flex-col items-center text-navy-900">
      <GrenfordMonogram className="h-[42px] w-[42px]" />
      <div className="mt-1 font-serif text-[21px] leading-none tracking-[0.14em]">GRENFORD</div>
      <div className="mt-[5px] text-[7.5px] font-bold leading-none tracking-[0.09em]">
        BOUTIQUE REAL ESTATE ADVISORY
      </div>
    </div>
  );
}
