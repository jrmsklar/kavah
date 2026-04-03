"use client";

import { StepProgress } from "./step-progress";
import type { Prompt } from "@/types/prompts";

export function VideoStep({
  prompt,
  currentIndex,
  totalCount,
  onNext,
  onBack,
}: {
  prompt: Prompt;
  currentIndex: number;
  totalCount: number;
  onNext: () => void;
  onBack: () => void;
}) {
  const isLast = currentIndex === totalCount - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <StepProgress currentStep={3} />

      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* Prompt question */}
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          {prompt.label}
        </h1>

        {/* Camera placeholder */}
        <div className="mt-6 rounded-xl bg-black aspect-video flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-12 h-12 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          <p className="text-gray-500 text-sm mt-2">
            Click below to start your camera
          </p>
        </div>

        {/* Start camera button (placeholder) */}
        <button
          type="button"
          className="mt-4 w-full rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          Start camera
        </button>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 rounded-md bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition disabled:opacity-50"
          >
            {isLast ? "Finish" : "Next prompt \u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
