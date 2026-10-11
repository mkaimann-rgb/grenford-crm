import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function MoreLink({ href, label = "Alle anzeigen" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="link-more focus-ring rounded">
      {label}
      <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
    </Link>
  );
}
