import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { DashboardShell } from "@/components/dashboard-shell";

export default function Dashboard() {
  return (
    <>
      <SignedOut>
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-serif text-xl font-medium text-ink">kavah</span>
          <div className="flex items-center gap-4">
            <SignInButton mode="redirect">
              <button className="text-sm font-medium text-ink-2 hover:text-ink transition">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 transition">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </nav>
        <main className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-65px)]">
          <h1 className="font-serif text-4xl font-medium text-ink">kavah</h1>
          <p className="mt-4 text-lg text-ink-2">
            Manage your community and create matches.
          </p>
        </main>
      </SignedOut>
      <SignedIn>
        <DashboardShell>
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="font-serif text-3xl font-medium text-ink">Welcome back</h1>
            <p className="mt-3 text-ink-2">
              Select Members or Matches from the sidebar to get started.
            </p>
          </div>
        </DashboardShell>
      </SignedIn>
    </>
  );
}
