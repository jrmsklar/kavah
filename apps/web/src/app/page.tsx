import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5">
          <div className="w-20" />
          <span className="font-serif text-xl font-medium text-ink">kavah</span>
          <div className="w-20 flex justify-end">
            <Link
              href="https://app.joinkavah.com"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 transition"
            >
              Join
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
          <p className="text-sm font-medium text-gold uppercase tracking-widest">
            Community Matchmaking
          </p>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ink leading-tight max-w-2xl mx-auto">
            Tell us who you are.{" "}
            <span className="italic text-gold">Not what you do.</span>
          </h1>
          <p className="mt-5 text-lg text-ink-2 max-w-lg mx-auto leading-relaxed">
            Just answer four short video prompts &ndash; no filter, no
            script &ndash; and we&apos;ll take care of the rest.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="https://app.joinkavah.com"
              className="rounded-xl bg-ink px-8 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm"
            >
              Get started
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-border bg-warm px-8 py-3.5 text-sm font-medium text-ink-2 hover:bg-cream transition"
            >
              How it works
            </a>
          </div>
        </section>

        {/* What makes Kavah different */}
        <section className="bg-warm border-y border-border-subtle">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-gold uppercase tracking-widest">
                The anti-swipe
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl font-medium text-ink">
                Matching at the level of who people actually are
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="rounded-xl border border-border bg-cream p-6">
                <p className="text-xs font-medium text-ink-3 uppercase tracking-wide">
                  Other apps match on
                </p>
                <ul className="mt-3 space-y-2.5">
                  <li className="flex items-center gap-2 text-sm text-ink-3">
                    <span className="w-1 h-1 rounded-full bg-ink-3" />
                    Photos and first impressions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-ink-3">
                    <span className="w-1 h-1 rounded-full bg-ink-3" />
                    Surface filters
                  </li>
                  <li className="flex items-center gap-2 text-sm text-ink-3">
                    <span className="w-1 h-1 rounded-full bg-ink-3" />
                    Who you swiped on
                  </li>
                  <li className="flex items-center gap-2 text-sm text-ink-3">
                    <span className="w-1 h-1 rounded-full bg-ink-3" />
                    Checklist compatibility
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-gold-light bg-gold-pale/50 p-6">
                <p className="text-xs font-medium text-gold uppercase tracking-wide">
                  Kavah matches on
                </p>
                <ul className="mt-3 space-y-2.5">
                  <li className="flex items-center gap-2 text-sm text-ink">
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    How you think and show up
                  </li>
                  <li className="flex items-center gap-2 text-sm text-ink">
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    Self-awareness and relational patterns
                  </li>
                  <li className="flex items-center gap-2 text-sm text-ink">
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    Voice, presence, and energy
                  </li>
                  <li className="flex items-center gap-2 text-sm text-ink">
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    Life vision and values
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gold uppercase tracking-widest">
              Simple & intentional
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl font-medium text-ink">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gold-pale mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-medium text-ink">
                Record
              </h3>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">
                Answer four short video prompts. 90 seconds each. No script,
                just you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-sage-light mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-medium text-ink">
                Review
              </h3>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">
                Your matchmaker personally reviews every response. No
                algorithms decide for you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-light mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-rose" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-medium text-ink">
                Connect
              </h3>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">
                A real introduction when there&apos;s a thoughtful match. No
                swiping, no endless browsing.
              </p>
            </div>
          </div>
        </section>

        {/* The questions */}
        <section className="bg-warm border-y border-border-subtle">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-gold uppercase tracking-widest">
                The heart of Kavah
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl font-medium text-ink">
                Four questions that reveal who you are
              </h2>
              <p className="mt-3 text-ink-2 max-w-lg mx-auto">
                Each question feels like natural conversation while surfacing
                the things that actually matter in a partner.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                {
                  num: "01",
                  title: "Relationship Patterns",
                  q: "What do the people closest to you rely on you for?",
                },
                {
                  num: "02",
                  title: "Life Vision",
                  q: "What does your day-to-day life look like in 5\u201310 years?",
                },
                {
                  num: "03",
                  title: "Current Needs",
                  q: "What do you need more of in your life right now?",
                },
                {
                  num: "04",
                  title: "Attraction",
                  q: "Describe your person \u2014 what they feel like to be around.",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="rounded-xl border border-border bg-cream p-5"
                >
                  <span className="text-xs font-semibold text-gold">
                    {item.num}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-2 italic leading-relaxed">
                    &ldquo;{item.q}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ink max-w-lg mx-auto leading-tight">
            Ready to be seen for who you actually are?
          </h2>
          <p className="mt-4 text-ink-2 max-w-md mx-auto">
            No swiping. Just a real introduction when the time is right.
          </p>
          <Link
            href="https://app.joinkavah.com"
            className="mt-8 inline-block rounded-xl bg-ink px-8 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm"
          >
            Get started
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-warm">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-sm text-ink-3">kavah</span>
          <div className="flex items-center gap-4 text-xs text-ink-3">
            <Link href="/terms" className="hover:text-ink-2 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-ink-2 transition">Privacy</Link>
          </div>
          <p className="text-xs text-ink-3">&copy; 2026 Kavah</p>
        </div>
      </footer>
    </>
  );
}
