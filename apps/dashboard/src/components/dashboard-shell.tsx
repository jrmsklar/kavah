"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import DashboardSidebar from "@/components/ui/sidebar-with-submenu";
import { CommunityProvider } from "@/components/community-context";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CommunityProvider>
      <div className="flex h-screen">
        <DashboardSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col sm:ml-80">
          {/* Top navbar */}
          <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-warm">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-md text-ink-2 hover:bg-cream sm:hidden"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Mobile brand */}
            <span className="font-serif text-lg font-medium text-ink sm:hidden">Kavah</span>

            {/* Spacer for desktop (pushes avatar right) */}
            <div className="hidden sm:block" />

            {/* Clerk UserButton */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </CommunityProvider>
  );
}
