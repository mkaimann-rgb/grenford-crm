"use client";

import { useMemo } from "react";
import { useCrm } from "@/lib/crm/store";
import { dashboardDaten } from "@/lib/crm/dashboard";
import type { ID } from "@/lib/crm/types";

/** Dashboard-Werte aus der zentralen Datenbasis (dieselben Daten wie Fach- und Finanzmodule) */
export function useDashboard(behalten: ID[] = []) {
  const crm = useCrm();
  const schluessel = behalten.join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => dashboardDaten(crm, crm.refName, behalten), [crm, schluessel]);
}
