"use client";

import { useState } from "react";
import { StepProgress } from "./step-progress";
import type { PromptSection, Prompt } from "@/types/prompts";

function formatHeight(inches: number): string {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
}

export function ReviewStep({
  firstName,
  lastName,
  birthday,
  heightInches,
  city,
  basicsSections,
  responses,
  videoPrompts,
  onSubmit,
  submitting,
  submitError,
  onBack,
}: {
  firstName: string;
  lastName: string;
  birthday: string;
  heightInches: number | null;
  city: string;
  basicsSections: PromptSection[];
  responses: Record<string, string>;
  videoPrompts: Prompt[];
  onSubmit: () => void;
  submitting: boolean;
  submitError: string;
  onBack: () => void;
}) {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  // Format birthday for display
  const formattedBirthday = birthday
    ? new Date(birthday + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Get display value for a response
  function getResponseDisplay(prompt: Prompt, value: string): string {
    if (prompt.type === "single_select") {
      const option = prompt.options.find((o) => o.id === value);
      return option?.label ?? value;
    }
    if (prompt.type === "multi_select") {
      try {
        const ids: string[] = JSON.parse(value);
        return ids
          .map((id) => prompt.options.find((o) => o.id === id)?.label ?? id)
          .join(", ");
      } catch {
        return value;
      }
    }
    return value;
  }

  return (
    <div className="min-h-screen">
      <StepProgress currentStep={4} />

      <div className="max-w-lg mx-auto px-5 pb-10">
        <h1 className="font-serif text-2xl font-medium text-ink mt-2">
          Review your profile
        </h1>
        <p className="mt-1.5 text-sm text-ink-2">
          Take a moment to review everything before submitting.
        </p>

        {/* Personal info */}
        <div className="mt-6 rounded-xl border border-border bg-warm p-5">
          <h2 className="text-xs font-semibold text-ink-2 uppercase tracking-wide">
            About You
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-xs text-ink-3">Name</p>
              <p className="text-sm font-medium text-ink mt-0.5">
                {firstName} {lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-3">Birthday</p>
              <p className="text-sm font-medium text-ink mt-0.5">
                {formattedBirthday}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-3">Height</p>
              <p className="text-sm font-medium text-ink mt-0.5">
                {heightInches !== null ? formatHeight(heightInches) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-3">City</p>
              <p className="text-sm font-medium text-ink mt-0.5">{city}</p>
            </div>
          </div>
        </div>

        {/* Basics responses */}
        {basicsSections.map((section) => {
          const sectionResponses = section.prompts.filter(
            (p) => responses[p.id]
          );
          if (sectionResponses.length === 0) return null;

          return (
            <div
              key={section.id}
              className="mt-4 rounded-xl border border-border bg-warm p-5"
            >
              <h2 className="text-xs font-semibold text-ink-2 uppercase tracking-wide">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {sectionResponses.map((prompt) => (
                  <div key={prompt.id}>
                    <p className="text-xs text-ink-3">{prompt.label}</p>
                    <p className="text-sm font-medium text-ink mt-0.5">
                      {getResponseDisplay(prompt, responses[prompt.id])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Video responses */}
        {videoPrompts.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-warm p-5">
            <h2 className="text-xs font-semibold text-ink-2 uppercase tracking-wide">
              Your Videos
            </h2>
            <div className="mt-3 space-y-3">
              {videoPrompts.map((prompt, index) => {
                const videoUrl = responses[prompt.id];
                const isExpanded = expandedVideo === prompt.id;

                return (
                  <div key={prompt.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sage-light flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-sage"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </span>
                        <p className="text-sm text-ink truncate">
                          {prompt.label}
                        </p>
                      </div>
                      {videoUrl && (
                        <button
                          onClick={() =>
                            setExpandedVideo(isExpanded ? null : prompt.id)
                          }
                          className="flex-shrink-0 text-xs font-medium text-gold hover:text-gold/80 transition ml-2"
                        >
                          {isExpanded ? "Hide" : "Watch"}
                        </button>
                      )}
                    </div>
                    {isExpanded && videoUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden bg-ink aspect-video">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tooltips */}
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-gold-light bg-gold-pale p-5">
            <h3 className="text-xs font-semibold text-gold uppercase tracking-wide">
              Matchmaker Eyes Only
            </h3>
            <p className="mt-2 text-sm text-ink-2 leading-relaxed">
              Your profile will only be reviewed by your community&apos;s
              matchmaker. Other members won&apos;t browse or search for you
              directly — introductions happen through your matchmaker.
            </p>
          </div>

          <div className="rounded-xl border border-sage/20 bg-sage-light p-5">
            <h3 className="text-xs font-semibold text-sage uppercase tracking-wide">
              Who to Look For
            </h3>
            <p className="mt-2 text-sm text-ink-2 leading-relaxed">
              Your matchmaker uses your videos and answers to find people who
              complement your personality and values — not just what looks good
              on paper.
            </p>
          </div>
        </div>

        {submitError && (
          <p className="mt-4 text-sm text-rose">{submitError}</p>
        )}

        {/* Submit CTA */}
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? "Submitting..." : "Submit my profile →"}
        </button>

        <button
          onClick={onBack}
          disabled={submitting}
          className="mt-3 w-full rounded-xl border border-border bg-warm px-6 py-3 text-sm font-medium text-ink-2 hover:bg-cream transition disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </div>
  );
}
