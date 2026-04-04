"use client";

import { useCommunity } from "@/app/join/[community_slug]/community-context";
import Link from "next/link";

export function AlreadyJoinedStep() {
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

        <h1 className="text-2xl font-bold text-gray-900">
          Already joined {community.name}
        </h1>
        <p className="mt-3 text-gray-600">
          You&apos;re already a member of this community. Head to the home page
          to see your matches and updates.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition text-center"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
