"use client";

import { ChevronUp, ChevronDown, Plus, X } from "lucide-react";
import type { PromptOption } from "@/types/prompts";
import { tempId } from "@/types/prompts";

export function OptionList({
  options,
  onChange,
}: {
  options: PromptOption[];
  onChange: (options: PromptOption[]) => void;
}) {
  function addOption() {
    onChange([
      ...options,
      { id: tempId(), label: "", sort_order: options.length },
    ]);
  }

  function removeOption(id: string) {
    onChange(options.filter((o) => o.id !== id));
  }

  function updateLabel(id: string, label: string) {
    onChange(options.map((o) => (o.id === id ? { ...o, label } : o)));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...options];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === options.length - 1) return;
    const next = [...options];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="ml-6 mt-2 space-y-1">
      <p className="text-xs font-medium text-gray-500 mb-1">Options</p>
      {options.map((option, index) => (
        <div key={option.id} className="flex items-center gap-1">
          <div className="flex flex-col">
            <button
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              type="button"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => moveDown(index)}
              disabled={index === options.length - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              type="button"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <input
            type="text"
            value={option.label}
            onChange={(e) => updateLabel(option.id, e.target.value)}
            placeholder="Option label"
            className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={() => removeOption(option.id)}
            className="text-gray-400 hover:text-red-500 p-1"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        onClick={addOption}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-1"
        type="button"
      >
        <Plus className="w-3 h-3" />
        Add option
      </button>
    </div>
  );
}
