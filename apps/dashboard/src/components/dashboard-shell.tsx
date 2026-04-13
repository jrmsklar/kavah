"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/ui/sidebar-with-submenu";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center h-14 px-4 border-b border-border bg-warm sm:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 -ml-1 rounded-md text-ink-2 hover:bg-cream"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="ml-3 font-serif text-lg font-medium text-ink">Kavah</span>
      </div>

      <main className="flex-1 overflow-auto sm:ml-80 pt-14 sm:pt-0">
        {children}
      </main>
    </div>
  );
}
