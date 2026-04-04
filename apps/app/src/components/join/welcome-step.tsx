"use client";

import { useCommunity } from "@/app/join/[community_slug]/community-context";
import { CommunityHeader } from "./community-header";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  const community = useCommunity();

  return (
    <div className="min-h-screen flex flex-col">
      <CommunityHeader />

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto px-6 pb-12 text-center">
        <p className="text-xs font-semibold text-gold uppercase tracking-widest">
          Community Matchmaking
        </p>

        <p className="font-serif text-xl font-medium text-ink leading-snug mt-2">
          Tell us who you are.{" "}
          <em className="text-gold">Not what you do.</em>
        </p>

        <p className="mt-3 text-sm text-ink-2 leading-relaxed">
          Short video prompts. No filter, no script — just you, the way
          you&apos;d show up at a Friday night table.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-warm border border-border-subtle p-3.5 text-center">
            <svg className="w-5 h-5 mx-auto text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-xs text-ink-2 mt-2 leading-snug font-medium">
              Authentic, Easy Responses
            </p>
          </div>
          <div className="rounded-lg bg-warm border border-border-subtle p-3.5 text-center">
            <svg className="w-5 h-5 mx-auto text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            <p className="text-xs text-ink-2 mt-2 leading-snug font-medium">
              AI Scores Values &amp; Energy
            </p>
          </div>
          <div className="rounded-lg bg-warm border border-border-subtle p-3.5 text-center">
            <svg className="w-5 h-5 mx-auto text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-xs text-ink-2 mt-2 leading-snug font-medium">
              Matchmaker Eyes Only
            </p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="mt-8 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm"
        >
          Join {community.name}
        </button>

        <p className="mt-5 text-xs text-ink-3 leading-relaxed">
          <span className="font-semibold text-ink-2">Kavah</span> helps
          communities make meaningful introductions. Share a bit about
          yourself, and your community organizer will match you with people
          they think you&apos;d genuinely connect with.
        </p>
      </div>
    </div>
  );
}
