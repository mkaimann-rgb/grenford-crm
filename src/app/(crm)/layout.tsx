import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CrmStoreProvider } from "@/lib/crm/store";
import { ToastProvider } from "@/components/ui/toast";

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <CrmStoreProvider>
      <ToastProvider>
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </CrmStoreProvider>
  );
}
