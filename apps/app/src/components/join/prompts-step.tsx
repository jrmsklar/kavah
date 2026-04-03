"use client";

import { useState } from "react";
import { useCommunity } from "@/app/join/[community_slug]/community-context";

export function PromptsStep({
  onComplete,
}: {
  onComplete: () => Promise<void>;
}) {
  const community = useCommunity();
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    setCompleting(true);
    setError("");
    try {
      await onComplete();
    } catch (err) {
      console.error("Complete error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setCompleting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900">Prompts</h1>
        <p className="mt-1 text-sm text-gray-600">
          This is where you&apos;ll answer prompts for {community.name}.
          Coming soon!
        </p>

        <div className="mt-8 rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-400 text-sm">
            Prompts will appear here.
          </p>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleComplete}
          disabled={completing}
          className="mt-8 w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {completing ? "Completing..." : "Complete"}
        </button>
      </div>
    </div>
  );
}
