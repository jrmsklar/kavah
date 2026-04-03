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
  // Check if all required basics prompts are answered
  const allRequiredFilled = sections.every((section) =>
    section.prompts.every((prompt) => {
      if (!prompt.required) return true;
      const val = responses[prompt.id];
      return val && val.trim().length > 0;
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <StepProgress currentStep={2} />

      <div className="max-w-2xl mx-auto px-4 pb-8">
        {sections.map((section) => (
          <div
            key={section.id}
            className="mb-6 rounded-xl border bg-white p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {section.title}
            </h2>

            <div className="space-y-5">
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

        <button
          onClick={onNext}
          disabled={!allRequiredFilled}
          className="w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to videos &rarr;
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
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          {prompt.label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
    );
  }

  if (prompt.type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          {prompt.label}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
    );
  }

  if (prompt.type === "single_select") {
    return (
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
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
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  isSelected
                    ? "border-amber-600 bg-amber-50 text-amber-700 font-medium"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
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
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
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
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  isSelected
                    ? "border-amber-600 bg-amber-50 text-amber-700 font-medium"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
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
