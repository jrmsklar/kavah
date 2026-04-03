"use client";

import { useCommunity } from "@/app/join/[community_slug]/community-context";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  const community = useCommunity();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center">
        {community.icon_url ? (
          <img
            src={community.icon_url}
            alt={community.name}
            className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto mb-6 bg-gray-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">
              {community.name[0]?.toUpperCase()}
            </span>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>

        {community.description && (
          <p className="mt-3 text-gray-600">{community.description}</p>
        )}

        <div className="mt-6 p-4 rounded-lg bg-gray-50 text-sm text-gray-500">
          <p>
            <strong>Kavah</strong> helps communities make meaningful
            introductions. Join to share a bit about yourself, and your
            community organizer will match you with people they think
            you&apos;d hit it off with.
          </p>
        </div>

        <button
          onClick={onNext}
          className="mt-8 w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          Join {community.name}
        </button>
      </div>
    </div>
  );
}
