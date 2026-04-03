"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { Prompt, PromptType, PromptOption } from "@/types/prompts";
import { PROMPT_TYPE_LABELS } from "@/types/prompts";
import { OptionList } from "./option-list";

const PROMPT_TYPES = Object.entries(PROMPT_TYPE_LABELS) as [PromptType, string][];

export function SortablePromptCard({
  prompt,
  onUpdate,
  onRemove,
  onUpdateOptions,
}: {
  prompt: Prompt;
  onUpdate: (patch: Partial<Pick<Prompt, "label" | "type" | "required">>) => void;
  onRemove: () => void;
  onUpdateOptions: (options: PromptOption[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `prompt-${prompt.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const showOptions =
    prompt.type === "single_select" || prompt.type === "multi_select";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded border bg-gray-50 p-3 mb-2"
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-gray-400 hover:text-gray-600"
          type="button"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 space-y-2">
          {/* Label */}
          <input
            type="text"
            value={prompt.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter prompt label..."
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />

          <div className="flex items-center gap-3">
            {/* Type */}
            <select
              value={prompt.type}
              onChange={(e) => onUpdate({ type: e.target.value as PromptType })}
              className="rounded border border-gray-200 px-2 py-1 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {PROMPT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Required toggle */}
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={prompt.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-gray-300"
              />
              Required
            </label>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 p-1"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Options for select types */}
      {showOptions && (
        <OptionList options={prompt.options} onChange={onUpdateOptions} />
      )}
    </div>
  );
}
