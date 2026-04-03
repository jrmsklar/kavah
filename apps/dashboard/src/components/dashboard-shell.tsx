"use client";

import DashboardSidebar from "@/components/ui/sidebar-with-submenu";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto sm:ml-80">
        {children}
      </main>
    </div>
  );
}
