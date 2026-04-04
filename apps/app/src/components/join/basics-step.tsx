"use client";

import { StepProgress } from "./step-progress";
import type { PromptSection, Prompt } from "@/types/prompts";

export function BasicsStep({
  sections,
  responses,
  onUpdateResponse,
  onNext,
}: {
  sections: PromptSection[];
  responses: Record<string, string>;
  onUpdateResponse: (promptId: string, value: string) => void;
  onNext: () => void;
}) {
  const allRequiredFilled = sections.every((section) =>
    section.prompts.every((prompt) => {
      if (!prompt.required) return true;
      const val = responses[prompt.id];
      return val && val.trim().length > 0;
    })
  );

  return (
    <div className="min-h-screen">
      <StepProgress currentStep={2} />

      <div className="max-w-lg mx-auto px-5 pb-10">
        <h1 className="font-serif text-2xl font-medium text-ink mt-2">
          A few quick things
        </h1>
        <p className="mt-1.5 text-sm text-ink-2">
          These help your matchmaker understand who you are.
        </p>

        <div className="mt-6 space-y-5">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-border bg-warm p-5"
            >
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">
                {section.title}
              </h2>

              <div className="mt-4 space-y-5">
                {section.prompts.map((prompt) => (
                  <PromptField
                    key={prompt.id}
                    prompt={prompt}
                    value={responses[prompt.id] ?? ""}
                    onChange={(val) => onUpdateResponse(prompt.id, val)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!allRequiredFilled}
          className="mt-8 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to videos
        </button>
      </div>
    </div>
  );
}

function PromptField({
  prompt,
  value,
  onChange,
}: {
  prompt: Prompt;
  value: string;
  onChange: (val: string) => void;
}) {
  if (prompt.type === "text_input") {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-2 mb-1.5">
          {prompt.label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>
    );
  }

  if (prompt.type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-2 mb-1.5">
          {prompt.label}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>
    );
  }

  if (prompt.type === "single_select") {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-2 mb-2">
          {prompt.label}
        </label>
        <div className="flex flex-wrap gap-2">
          {prompt.options.map((option) => {
            const isSelected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isSelected
                    ? "border-gold bg-gold-pale text-ink font-medium"
                    : "border-border bg-cream text-ink-2 hover:border-ink-3"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (prompt.type === "multi_select") {
    const selectedIds: string[] = value ? JSON.parse(value) : [];

    function toggleOption(optionId: string) {
      const next = selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId];
      onChange(JSON.stringify(next));
    }

    return (
      <div>
        <label className="block text-sm font-medium text-ink-2 mb-2">
          {prompt.label}
        </label>
        <div className="flex flex-wrap gap-2">
          {prompt.options.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isSelected
                    ? "border-gold bg-gold-pale text-ink font-medium"
                    : "border-border bg-cream text-ink-2 hover:border-ink-3"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
