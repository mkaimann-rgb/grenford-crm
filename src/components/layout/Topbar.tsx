"use client";

import { Bell, ChevronDown, Menu, Plus, Search } from "lucide-react";
import { testUser } from "@/lib/testdata/dashboard";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-[56px] items-center gap-3 bg-topbar px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="focus-ring rounded p-1.5 text-navy-900 lg:hidden"
        aria-label="Menü öffnen"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 justify-center lg:justify-start lg:pl-[160px]">
        <label className="relative flex h-[32px] w-full max-w-[596px] items-center rounded-md border border-line bg-white shadow-card">
          <Search className="ml-3 h-[15px] w-[15px] text-navy-800" strokeWidth={2} />
          <span className="sr-only">Suche</span>
          <input
            type="search"
            placeholder="Suche nach Kunden, Projekten, Ansprechpartnern …"
            className="h-full flex-1 bg-transparent px-2.5 text-[12px] text-ink placeholder:text-muted outline-none"
          />
          <kbd className="mr-2 rounded bg-line-soft px-1.5 py-0.5 text-[10px] font-medium text-navy-800">⌘ K</kbd>
        </label>
      </div>

      <div className="flex items-center gap-4 lg:gap-5">
        <button
          type="button"
          className="focus-ring flex h-[31px] w-[31px] items-center justify-center rounded-full bg-navy-900 text-white shadow-card hover:bg-navy-800"
          aria-label="Neu anlegen"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
        </button>
        <button type="button" className="focus-ring relative rounded p-1 text-navy-900" aria-label="Benachrichtigungen">
          <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
          <span className="absolute right-[3px] top-[2px] h-[6px] w-[6px] rounded-full bg-neg ring-2 ring-topbar" />
        </button>
        <button type="button" className="focus-ring flex items-center gap-2.5 rounded-full pr-1">
          <span className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#dbe5f6] text-[11px] font-bold text-navy-800">
            {testUser.initials}
          </span>
          <span className="hidden text-[13px] font-semibold text-navy-950 md:inline">{testUser.name}</span>
          <ChevronDown className="h-4 w-4 text-navy-900" />
        </button>
      </div>
    </header>
  );
}
