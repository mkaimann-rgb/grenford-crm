import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Schriften werden beim Build heruntergeladen und selbst ausgeliefert –
// keine Verbindung der Nutzer zu Google-Servern (datenschutzfreundlich).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: "GRENFORD CRM Lightning", template: "%s · GRENFORD CRM" },
  description: "Internes CRM der GRENFORD Boutique Real Estate Advisory",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
