"use client";

import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type {
  PromptSection,
  Prompt,
  PromptOption,
  StepType,
} from "@/types/prompts";
import { STEP_TYPE_LABELS } from "@/types/prompts";
import { SortablePromptCard } from "./sortable-prompt-card";

const STEP_TYPES = Object.entries(STEP_TYPE_LABELS) as [StepType, string][];

export function SortableSectionCard({
  section,
  onUpdateSection,
  onRemoveSection,
  onAddPrompt,
  onUpdatePrompt,
  onRemovePrompt,
  onUpdateOptions,
}: {
  section: PromptSection;
  onUpdateSection: (patch: Partial<Pick<PromptSection, "title" | "step">>) => void;
  onRemoveSection: () => void;
  onAddPrompt: () => void;
  onUpdatePrompt: (
    promptId: string,
    patch: Partial<Pick<Prompt, "label" | "type" | "required">>
  ) => void;
  onRemovePrompt: (promptId: string) => void;
  onUpdateOptions: (promptId: string, options: PromptOption[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${section.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const promptIds = section.prompts.map((p) => `prompt-${p.id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-white p-4 mb-4 shadow-sm"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
          type="button"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateSection({ title: e.target.value })}
          placeholder="Section title..."
          className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm font-semibold focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />

        <select
          value={section.step}
          onChange={(e) =>
            onUpdateSection({ step: e.target.value as StepType })
          }
          className="rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        >
          {STEP_TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          onClick={onRemoveSection}
          className="text-gray-400 hover:text-red-500 p-1"
          type="button"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Prompts */}
      <SortableContext items={promptIds} strategy={verticalListSortingStrategy}>
        {section.prompts.map((prompt) => (
          <SortablePromptCard
            key={prompt.id}
            prompt={prompt}
            onUpdate={(patch) => onUpdatePrompt(prompt.id, patch)}
            onRemove={() => onRemovePrompt(prompt.id)}
            onUpdateOptions={(opts) => onUpdateOptions(prompt.id, opts)}
          />
        ))}
      </SortableContext>

      {/* Add prompt button */}
      <button
        onClick={onAddPrompt}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-2 px-2"
        type="button"
      >
        <Plus className="w-4 h-4" />
        Add Prompt
      </button>
    </div>
  );
}
