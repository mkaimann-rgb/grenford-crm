import type { BelegStatus } from "@/lib/crm/dashboard";

const styles: Record<BelegStatus, string> = {
  Überfällig: "bg-neg-bg text-neg",
  Offen: "bg-warn-bg text-warn",
  Fällig: "bg-warn-bg text-warn",
  Entwurf: "bg-draft-bg text-draft",
  Bezahlt: "bg-pos-bg text-pos",
};

export function StatusBadge({ status }: { status: BelegStatus }) {
  return (
    <span className={`inline-flex min-w-[64px] justify-center rounded-[4px] px-2.5 py-[2px] text-[11px] ${styles[status]}`}>
      {status}
    </span>
  );
}
