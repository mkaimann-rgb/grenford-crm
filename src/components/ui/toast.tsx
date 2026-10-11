"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

const Ctx = createContext<(msg: string) => void>(() => {});

/** Globale Kurzmeldung unten rechts (z. B. „Gespeichert (Testmodus)“) */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => setMsg(m), []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3800);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <div role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-lg bg-navy-950 px-4 py-3 text-[12.5px] text-white shadow-lg">
          <span className="flex-1">{msg}</span>
          <button type="button" onClick={() => setMsg(null)} className="focus-ring rounded text-white/70 hover:text-white" aria-label="Hinweis schließen">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
export const NICHT_IMPLEMENTIERT = "ist in dieser Testversion noch nicht implementiert.";
