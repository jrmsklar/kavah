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
          <div className="w-14 h-14 rounded-xl mx-auto mb-3 bg-gold-pale flex items-center justify-center shadow-sm">
            <span className="text-lg font-semibold text-gold">
              {community.name[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {!community.icon_url && (
          <h2 className="font-serif text-xl font-medium text-ink">
            {community.name}
          </h2>
        )}

        {community.description && (
          <p className="mt-1 text-sm text-ink-2 leading-relaxed">
            {community.description}
          </p>
        )}
      </div>
    </div>
  );
}
