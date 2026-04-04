import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function App() {
  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5">
          <SignedOut>
            <div />
          </SignedOut>
          <SignedIn>
            <span className="text-sm font-medium text-ink-3">My Community</span>
          </SignedIn>

          <span className="font-serif text-xl font-medium text-ink">kavah</span>

          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="redirect">
                <button className="text-sm font-medium text-ink-2 hover:text-ink transition">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        {/* Signed out hero */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] text-center">
            <p className="text-sm font-medium text-gold uppercase tracking-widest">
              Community Matchmaking
            </p>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl font-medium text-ink leading-tight max-w-lg">
              Matching people at the level of who they actually are.
            </h1>
            <p className="mt-4 text-ink-2 max-w-md leading-relaxed">
              No swiping. No algorithms. Just real introductions from people who
              know you, powered by what you actually say and how you show up.
            </p>
            <div className="mt-8 flex gap-3">
              <SignUpButton mode="redirect">
                <button className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm">
                  Get Started
                </button>
              </SignUpButton>
              <SignInButton mode="redirect">
                <button className="rounded-xl border border-border bg-warm px-6 py-3 text-sm font-medium text-ink-2 hover:bg-cream transition">
                  Log In
                </button>
              </SignInButton>
            </div>
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
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-warm p-5">
                <div className="w-10 h-10 rounded-lg bg-gold-pale flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-ink">Your Profile</p>
                <p className="mt-0.5 text-xs text-ink-3">Complete</p>
              </div>

              <div className="rounded-xl border border-border bg-warm p-5">
                <div className="w-10 h-10 rounded-lg bg-sage-light flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-ink">Matches</p>
                <p className="mt-0.5 text-xs text-ink-3">Pending review</p>
              </div>

              <div className="rounded-xl border border-border bg-warm p-5">
                <div className="w-10 h-10 rounded-lg bg-rose-light flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-rose" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-ink">Messages</p>
                <p className="mt-0.5 text-xs text-ink-3">No messages yet</p>
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
