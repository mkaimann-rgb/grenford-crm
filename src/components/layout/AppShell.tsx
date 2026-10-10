"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-full">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[218px]">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="px-4 pb-8 pt-[18px] md:px-[22px]">{children}</main>
      </div>
    </div>
  );
}
