import { toCsv } from "./finanzen/logic";

/** CSV-Datei im Browser herunterladen (Semikolon, UTF-8 mit BOM für Excel) */
export function downloadCsv(dateiname: string, header: string[], rows: (string | number)[][]) {
  const blob = new Blob(["﻿" + toCsv(header, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dateiname.startsWith("TESTDATEN_") ? dateiname : `TESTDATEN_${dateiname}`;
  a.click();
  URL.revokeObjectURL(url);
}
