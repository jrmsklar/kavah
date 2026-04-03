"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toast";
import type {
  PromptSection,
  Prompt,
  PromptOption,
  PromptType,
  StepType,
} from "@/types/prompts";
import { tempId } from "@/types/prompts";
import { SortableSectionCard } from "./sortable-section-card";

export function PromptBuilder({
  communityId,
  slug,
}: {
  communityId: string;
  slug: string;
}) {
  const router = useRouter();
  const [sections, setSections] = useState<PromptSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Fetch existing prompts
  useEffect(() => {
    fetch(`/api/communities/${communityId}/prompts`)
      .then((r) => r.json())
      .then((data) => {
        setSections(data.sections ?? []);
        setLoading(false);
      });
  }, [communityId]);

  // Mark dirty on any change
  const update = useCallback(
    (fn: (prev: PromptSection[]) => PromptSection[]) => {
      setSections((prev) => {
        const next = fn(prev);
        setDirty(true);
        return next;
      });
    },
    []
  );

  // Section mutations
  function addSection() {
    update((prev) => [
      ...prev,
      {
        id: tempId(),
        title: "",
        step: "basics" as StepType,
        sort_order: prev.length,
        prompts: [],
      },
    ]);
  }

  function removeSection(sectionId: string) {
    update((prev) => prev.filter((s) => s.id !== sectionId));
  }

  function updateSection(
    sectionId: string,
    patch: Partial<Pick<PromptSection, "title" | "step">>
  ) {
    update((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s))
    );
  }

  // Prompt mutations
  function addPrompt(sectionId: string) {
    update((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              prompts: [
                ...s.prompts,
                {
                  id: tempId(),
                  label: "",
                  type: "text_input" as PromptType,
                  required: true,
                  sort_order: s.prompts.length,
                  options: [],
                },
              ],
            }
          : s
      )
    );
  }

  function removePrompt(sectionId: string, promptId: string) {
    update((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, prompts: s.prompts.filter((p) => p.id !== promptId) }
          : s
      )
    );
  }

  function updatePrompt(
    sectionId: string,
    promptId: string,
    patch: Partial<Pick<Prompt, "label" | "type" | "required">>
  ) {
    update((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              prompts: s.prompts.map((p) =>
                p.id === promptId ? { ...p, ...patch } : p
              ),
            }
          : s
      )
    );
  }

  function updateOptions(
    sectionId: string,
    promptId: string,
    options: PromptOption[]
  ) {
    update((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              prompts: s.prompts.map((p) =>
                p.id === promptId ? { ...p, options } : p
              ),
            }
          : s
      )
    );
  }

  // DnD handler
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Section reorder
    if (activeId.startsWith("section-") && overId.startsWith("section-")) {
      const activeSectionId = activeId.replace("section-", "");
      const overSectionId = overId.replace("section-", "");

      update((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === activeSectionId);
        const newIndex = prev.findIndex((s) => s.id === overSectionId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    // Prompt reorder within section
    if (activeId.startsWith("prompt-") && overId.startsWith("prompt-")) {
      const activePromptId = activeId.replace("prompt-", "");
      const overPromptId = overId.replace("prompt-", "");

      update((prev) =>
        prev.map((s) => {
          const oldIndex = s.prompts.findIndex((p) => p.id === activePromptId);
          const newIndex = s.prompts.findIndex((p) => p.id === overPromptId);
          if (oldIndex === -1 || newIndex === -1) return s;
          return { ...s, prompts: arrayMove(s.prompts, oldIndex, newIndex) };
        })
      );
    }
  }

  // Save
  async function handleSave() {
    setSaving(true);

    // Recompute sort_order from array indices
    const payload = sections.map((s, si) => ({
      ...s,
      sort_order: si,
      prompts: s.prompts.map((p, pi) => ({
        ...p,
        sort_order: pi,
        options: p.options.map((o, oi) => ({ ...o, sort_order: oi })),
      })),
    }));

    const toastId = toaster.create({
      title: "Saving prompts...",
      description: "Your prompt configuration is being saved.",
      type: "loading",
      duration: Infinity,
    });

    try {
      const res = await fetch(`/api/communities/${communityId}/prompts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: payload }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      toaster.update(toastId, {
        title: "Prompts saved!",
        description: "Your prompt configuration has been saved successfully.",
        type: "success",
        duration: 3000,
      });

      setDirty(false);

      router.push(`/communities/${slug}`);
    } catch {
      toaster.update(toastId, {
        title: "Save failed",
        description: "Failed to save prompts. Please try again.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const sectionIds = sections.map((s) => `section-${s.id}`);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/communities/${slug}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            &larr; Back to community
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Prompt Builder
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* DnD context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableSectionCard
              key={section.id}
              section={section}
              onUpdateSection={(patch) => updateSection(section.id, patch)}
              onRemoveSection={() => removeSection(section.id)}
              onAddPrompt={() => addPrompt(section.id)}
              onUpdatePrompt={(promptId, patch) =>
                updatePrompt(section.id, promptId, patch)
              }
              onRemovePrompt={(promptId) =>
                removePrompt(section.id, promptId)
              }
              onUpdateOptions={(promptId, opts) =>
                updateOptions(section.id, promptId, opts)
              }
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add section */}
      <button
        onClick={addSection}
        className="flex items-center gap-2 w-full justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
        type="button"
      >
        <Plus className="w-4 h-4" />
        Add Section
      </button>
    </div>
  );
}
