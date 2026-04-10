"use client";

import { useCommunity } from "@/app/join/[community_slug]/community-context";
import Link from "next/link";

export function CompletedProfileStep() {
  const community = useCommunity();

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 bg-sage-light flex items-center justify-center">
          <svg className="w-8 h-8 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl font-medium text-ink">
          Completed Profile
        </h1>
        <p className="mt-3 text-ink-2 leading-relaxed">
          You&apos;ve already completed your profile for <span className="font-semibold">{community.name}</span>. Head
          home to see your matches and updates.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm text-center"
        >
          Go to Home
        </Link>
      </div>

      <div className="py-6 text-center">
        <p className="text-[11px] text-ink-3 tracking-wide">
          Powered by <span className="font-serif font-medium text-ink-2">Kavah</span>
        </p>
      </div>
    </div>
  );
}
