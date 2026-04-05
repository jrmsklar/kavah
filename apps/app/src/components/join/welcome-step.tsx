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

        <p className="mt-5 text-sm text-ink-2 leading-relaxed">
          {community.matchmaker_display_name ?? "Your matchmaker"} will
          personally match you
          within {community.description ? (
            <><span className="font-semibold text-ink">{community.name}</span> &ndash; {community.description}</>
          ) : (
            <>her group of friends</>
          )}. Just answer four short video
          prompts &ndash; no filter, no script &ndash; and we&apos;ll take care
          of the rest.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-warm border border-border-subtle p-3.5 text-center">
            <svg className="w-5 h-5 mx-auto text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-xs text-ink-2 mt-2 leading-snug font-medium">
              Authentic Videos
            </p>
          </div>
          <div className="rounded-lg bg-warm border border-border-subtle p-3.5 text-center">
            <svg className="w-5 h-5 mx-auto text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p className="text-xs text-ink-2 mt-2 leading-snug font-medium">
              Trusted Set Ups
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

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Your responses are only seen by your matchmaker
        </p>

        <button
          onClick={onNext}
          className="mt-6 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm"
        >
          Get Set Up
        </button>

        <p className="mt-5 text-xs text-ink-3 leading-relaxed">
          <span className="font-semibold text-ink-2">Kavah</span> helps
          communities make meaningful introductions. Share a bit about
          yourself, and your community organizer will match you with people
          they think you&apos;d genuinely connect with.
        </p>
      </div>

      <div className="py-6 text-center">
        <p className="text-[11px] text-ink-3 tracking-wide">
          Powered by <span className="font-serif font-medium text-ink-2">Kavah</span>
        </p>
      </div>
    </div>
  );
}
