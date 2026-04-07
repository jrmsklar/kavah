import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function App() {
  return (
    <>
      {/* Navbar (signed in only) */}
      <SignedIn>
        <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border-subtle">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5">
            <div />
            <span className="font-serif text-xl font-medium text-ink">kavah</span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </nav>
      </SignedIn>

      <main className="max-w-5xl mx-auto px-6">
        {/* Signed out */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] text-center px-6">
            <p className="text-sm text-ink-2 max-w-xs leading-relaxed">
              To get started, reach out to your community owner for your unique sign-up link.
            </p>
            <Link
              href="https://joinkavah.com"
              className="mt-6 rounded-xl border border-border bg-warm px-6 py-3 text-sm font-medium text-ink-2 hover:bg-cream transition"
            >
              Learn more about Kavah
            </Link>
          </div>
        </SignedOut>

        {/* Signed in dashboard */}
        <SignedIn>
          <div className="py-10">
            <h1 className="font-serif text-2xl font-medium text-ink">
              Welcome back
            </h1>
            <p className="mt-1 text-ink-2">
              Your matchmaker is reviewing profiles. Check back soon for your
              matches.
            </p>

            {/* Status cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-warm p-5">
                <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-ink">Your Profile</p>
                <p className="mt-0.5 text-xs text-ink-3">Complete</p>
              </div>

              <div className="rounded-xl border border-border bg-warm p-5">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-ink">Matches</p>
                <p className="mt-0.5 text-xs text-ink-3">Pending review</p>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-10 rounded-xl border border-border-subtle bg-warm p-6">
              <h2 className="font-serif text-lg font-medium text-ink">
                How Kavah works
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-pale text-gold text-xs font-semibold flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">You share</p>
                    <p className="text-xs text-ink-3 mt-0.5">
                      Short video answers to thoughtful prompts
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-pale text-gold text-xs font-semibold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">We listen</p>
                    <p className="text-xs text-ink-3 mt-0.5">
                      Your matchmaker reviews every response personally
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-pale text-gold text-xs font-semibold flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">We connect</p>
                    <p className="text-xs text-ink-3 mt-0.5">
                      Thoughtful introductions when there&apos;s a real match
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
    </>
  );
}
