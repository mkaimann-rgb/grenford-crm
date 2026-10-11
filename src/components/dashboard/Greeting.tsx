"use client";

import { useSyncExternalStore } from "react";

function greetingFor(hour: number) {
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

const subscribe = () => () => {};

/** Begrüßung nach Tageszeit des Browsers; auf dem Server „Guten Morgen“ wie im Entwurf. */
export function Greeting({ name }: { name: string }) {
  const greeting = useSyncExternalStore(
    subscribe,
    () => greetingFor(new Date().getHours()),
    () => "Guten Morgen",
  );
  return <>{greeting}, {name}.</>;
}
