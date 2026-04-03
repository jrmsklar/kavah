import { createServiceClient } from "@kavah/db";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const { communityId } = await params;
  const supabase = createServiceClient();

  const { data: sections } = await supabase
    .from("prompt_sections")
    .select("*")
    .eq("community_id", communityId)
    .order("sort_order");

  if (!sections || sections.length === 0) {
    return NextResponse.json({ sections: [] });
  }

  const sectionIds = sections.map((s) => s.id);

  const { data: prompts } = await supabase
    .from("prompts")
    .select("*")
    .in("section_id", sectionIds)
    .order("sort_order");

  const promptIds = prompts?.map((p) => p.id) ?? [];

  let options: { id: string; prompt_id: string; label: string; sort_order: number }[] = [];
  if (promptIds.length > 0) {
    const { data } = await supabase
      .from("prompt_options")
      .select("*")
      .in("prompt_id", promptIds)
      .order("sort_order");
    options = data ?? [];
  }

  const optionsByPrompt = new Map<string, typeof options>();
  for (const opt of options) {
    if (!optionsByPrompt.has(opt.prompt_id)) optionsByPrompt.set(opt.prompt_id, []);
    optionsByPrompt.get(opt.prompt_id)!.push(opt);
  }

  type PromptRow = NonNullable<typeof prompts>[number];
  const promptsBySection = new Map<string, PromptRow[]>();
  for (const prompt of prompts ?? []) {
    if (!promptsBySection.has(prompt.section_id)) promptsBySection.set(prompt.section_id, []);
    promptsBySection.get(prompt.section_id)!.push(prompt);
  }

  const tree = sections.map((section) => ({
    id: section.id,
    title: section.title,
    step: section.step,
    sort_order: section.sort_order,
    prompts: (promptsBySection.get(section.id) ?? []).map((prompt) => ({
      id: prompt.id,
      label: prompt.label,
      type: prompt.type,
      required: prompt.required,
      sort_order: prompt.sort_order,
      options: (optionsByPrompt.get(prompt.id) ?? []).map((opt) => ({
        id: opt.id,
        label: opt.label,
        sort_order: opt.sort_order,
      })),
    })),
  }));

  return NextResponse.json({ sections: tree });
}
