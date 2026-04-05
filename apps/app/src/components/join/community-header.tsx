"use client";

import { useCommunity } from "@/app/join/[community_slug]/community-context";

export function CommunityHeader() {
  const community = useCommunity();

  return (
    <div className="text-center pt-8 pb-2 px-6">
      <div className="max-w-md mx-auto">
        {community.icon_url ? (
          <img
            src={community.icon_url}
            alt={community.name}
            className="h-14 mx-auto mb-3"
          />
        ) : (
          <h2 className="font-serif text-2xl font-semibold text-ink mb-3">
            {community.name}
          </h2>
        )}

        <p className="mt-1 text-xs text-ink-3 tracking-wide">
          Set ups powered by <span className="font-serif font-medium text-ink-2">Kavah</span>
        </p>
      </div>
    </div>
  );
}
