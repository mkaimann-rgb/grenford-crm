"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronUp, Settings, X } from "lucide-react";
import { navSections, primaryNav, type NavItem } from "@/lib/navigation";
import { GrenfordLogo } from "./GrenfordLogo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`focus-ring flex items-center gap-[14px] whitespace-nowrap rounded-md px-[14px] py-[3.5px] text-[12.5px] leading-[17px] transition-colors ${
          active ? "bg-cream-active font-medium text-navy-950" : "text-ink-soft hover:bg-cream-active/60"
        }`}
      >
        <Icon className="h-[17px] w-[17px] shrink-0 text-navy-900" strokeWidth={1.7} />
        <span>{item.label}</span>
      </Link>
      {item.children && (
        <ul className="ml-[54px] mt-[1px] list-disc pl-[12px] text-[10px] leading-[12px] text-ink-soft marker:text-navy-900">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link href={child.href} onClick={onNavigate} className="focus-ring hover:text-royal-600">
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <>
      {/* Abdunkelung auf Tablet, wenn Menü ausgeklappt */}
      <div
        className={`fixed inset-0 z-30 bg-navy-950/30 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[218px] flex-col border-r border-cream-line bg-cream transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Hauptnavigation"
      >
        <button
          type="button"
          onClick={onClose}
          className="focus-ring absolute right-2 top-2 rounded p-1 text-navy-900 lg:hidden"
          aria-label="Menü schließen"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pb-[12px] pt-[9px]">
          <Link href="/dashboard" className="focus-ring block" onClick={onClose} aria-label="GRENFORD Dashboard">
            <GrenfordLogo />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-[13px] pb-3">
          <ul className="space-y-[4px]">
            {primaryNav.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
            ))}
          </ul>

          {navSections.map((section, i) => {
            const isCollapsed = collapsed[section.id];
            return (
              <div key={section.id} className={`mt-[8px] pt-[5px] ${i > 0 ? "border-t border-cream-line" : ""}`}>
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))}
                  className="focus-ring flex w-full items-center justify-between rounded px-[14px] py-[3px] text-[9px] font-bold uppercase tracking-[0.18em] text-navy-900"
                  aria-expanded={!isCollapsed}
                >
                  {section.title}
                  <ChevronUp
                    className={`h-3 w-3 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  />
                </button>
                {!isCollapsed && (
                  <ul className="mt-[2px] space-y-[1px]">
                    {section.items.map((item) => (
                      <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          <div className="mt-[10px] border-t border-cream-line pt-[6px]">
            <Link
              href="/einstellungen"
              onClick={onClose}
              className="focus-ring flex items-center gap-[14px] rounded-md px-[14px] py-[4px] text-[12.5px] text-ink-soft hover:bg-cream-active/60"
            >
              <Settings className="h-[17px] w-[17px] text-navy-900" strokeWidth={1.7} />
              Einstellungen
            </Link>
          </div>
        </nav>

      </aside>
    </>
  );
}
