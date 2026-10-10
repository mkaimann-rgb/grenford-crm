import {
  Building2,
  CalendarRange,
  ClipboardList,
  Database,
  FileSpreadsheet,
  FileText,
  Files,
  FolderKanban,
  Handshake,
  HardHat,
  House,
  HousePlus,
  LayoutGrid,
  ReceiptText,
  Search,
  Share2,
  Target,
  User,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavLeaf = { label: string; href: string };

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Unterpunkte als Aufzählung (z. B. Forderungsstatus) */
  children?: NavLeaf[];
};

export type NavSection = { id: string; title: string; items: NavItem[] };

/** Einträge ohne Bereichsüberschrift ganz oben */
export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "Aktivitäten", href: "/aktivitaeten", icon: CalendarRange },
];

/** Vollständige Menüstruktur gemäß freigegebener Visualisierung */
export const navSections: NavSection[] = [
  {
    id: "kunden",
    title: "Kunden",
    items: [
      { label: "Unternehmen", href: "/kunden/unternehmen", icon: Building2 },
      { label: "Ansprechpartner", href: "/kunden/ansprechpartner", icon: Users },
      { label: "Privatkunden", href: "/kunden/privatkunden", icon: User },
      { label: "Sanierungskunden", href: "/kunden/sanierungskunden", icon: HousePlus },
    ],
  },
  {
    id: "akquise",
    title: "Akquise",
    items: [{ label: "Pipeline", href: "/akquise/pipeline", icon: ClipboardList }],
  },
  {
    id: "investment",
    title: "Investment",
    items: [
      { label: "Projekte", href: "/investment/projekte", icon: LayoutGrid },
      { label: "Käuferprozesse", href: "/investment/kaeuferprozesse", icon: Handshake },
      { label: "Ankaufsprofile", href: "/investment/ankaufsprofile", icon: Target },
      { label: "Suchaufträge", href: "/investment/suchauftraege", icon: Search },
    ],
  },
  {
    id: "property",
    title: "Property",
    items: [
      { label: "Objekte & Mandate", href: "/property/objekte", icon: House },
      { label: "Käuferprozesse", href: "/property/kaeuferprozesse", icon: Handshake },
      { label: "Interessenten", href: "/property/interessenten", icon: UsersRound },
      { label: "Suchaufträge", href: "/property/suchauftraege", icon: Search },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    items: [
      { label: "Mandate", href: "/projects/mandate", icon: FileText },
      { label: "Projekte", href: "/projects/projekte", icon: FolderKanban },
      { label: "Projektprozesse", href: "/projects/projektprozesse", icon: Files },
      { label: "GU-Partner", href: "/projects/gu-partner", icon: HardHat },
    ],
  },
  {
    id: "netzwerk",
    title: "Netzwerk",
    items: [
      { label: "Empfehlungspartner", href: "/netzwerk/empfehlungspartner", icon: Share2 },
      { label: "Provisionsbeteiligte", href: "/netzwerk/provisionsbeteiligte", icon: Database },
    ],
  },
  {
    id: "finanzen",
    title: "Finanzen",
    items: [
      { label: "Übersicht", href: "/finanzen/uebersicht", icon: FileSpreadsheet },
      { label: "Provisionen & Zahlungen", href: "/finanzen/provisionen", icon: Files },
      {
        label: "Forderungen",
        href: "/finanzen/forderungen",
        icon: ReceiptText,
        children: [
          { label: "Offen", href: "/finanzen/forderungen?status=offen" },
          { label: "Überfällig", href: "/finanzen/forderungen?status=ueberfaellig" },
          { label: "1. Mahnung", href: "/finanzen/forderungen?status=mahnung-1" },
          { label: "2. Mahnung", href: "/finanzen/forderungen?status=mahnung-2" },
          { label: "Vollstreckung", href: "/finanzen/forderungen?status=vollstreckung" },
        ],
      },
      {
        label: "Verbindlichkeiten",
        href: "/finanzen/verbindlichkeiten",
        icon: FileText,
        children: [
          { label: "Noch nicht fällig", href: "/finanzen/verbindlichkeiten?status=nicht-faellig" },
          { label: "Fällig", href: "/finanzen/verbindlichkeiten?status=faellig" },
          { label: "Überfällig", href: "/finanzen/verbindlichkeiten?status=ueberfaellig" },
          { label: "Bezahlt", href: "/finanzen/verbindlichkeiten?status=bezahlt" },
        ],
      },
    ],
  },
];

/** Findet den Menüeintrag zu einem Pfad (für Seitentitel der Platzhalter) */
export function findNavItem(pathname: string): { item: NavItem; section?: NavSection } | null {
  for (const item of primaryNav) if (item.href === pathname) return { item };
  for (const section of navSections) {
    for (const item of section.items) if (item.href === pathname) return { item, section };
  }
  return null;
}
