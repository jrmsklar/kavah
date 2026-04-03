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
        <nav className="flex items-center justify-between px-6 py-4 border-b">
          <span className="text-xl font-bold">Kavah Dashboard</span>
          <div className="flex items-center gap-4">
            <SignInButton mode="redirect">
              <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </nav>
        <main className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-65px)]">
          <h1 className="text-4xl font-bold">Kavah Dashboard</h1>
          <p className="mt-4 text-lg text-gray-600">
            Manage your community and create matches.
          </p>
        </main>
      </SignedOut>
      <SignedIn>
        <DashboardShell>
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold">Welcome back</h1>
            <p className="mt-4 text-lg text-gray-600">
              Select Members or Matches from the sidebar to get started.
            </p>
          </div>
        </DashboardShell>
      </SignedIn>
    </>
  );
}
