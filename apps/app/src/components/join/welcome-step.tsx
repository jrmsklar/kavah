"use client";

import { useCommunity } from "@/app/join/[community_slug]/community-context";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  const community = useCommunity();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full text-center">
        {community.icon_url ? (
          <img
            src={community.icon_url}
            alt={community.name}
            className="w-20 h-20 rounded-2xl mx-auto mb-8 object-cover shadow-sm"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl mx-auto mb-8 bg-gold-pale flex items-center justify-center shadow-sm">
            <span className="text-2xl font-semibold text-gold">
              {community.name[0]?.toUpperCase()}
            </span>
          </div>
        )}

        <h1 className="font-serif text-3xl font-medium text-ink leading-tight">
          {community.name}
        </h1>

        {community.description && (
          <p className="mt-3 text-ink-2 leading-relaxed">
            {community.description}
          </p>
        )}

        <div className="mt-8 rounded-xl bg-warm border border-border-subtle p-5 text-left">
          <p className="text-sm text-ink-2 leading-relaxed">
            <span className="font-semibold text-ink">Kavah</span> helps
            communities make meaningful introductions. Share a bit about
            yourself, and your community organizer will match you with people
            they think you&apos;d genuinely connect with.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
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
      </div>
    </div>
  );
}
