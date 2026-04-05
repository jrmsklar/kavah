import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ communityId: string }> };

async function verifyOwnership(clerkId: string, communityId: string) {
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("community_id", communityId)
    .in("role", ["owner", "admin"])
    .single();

  return membership ? user : null;
}

// GET: Fetch all sections, prompts, and options for a community
export async function GET(req: Request, { params }: RouteContext) {
  const { communityId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyOwnership(clerkId, communityId);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();

  // Fetch sections
  const { data: sections } = await supabase
    .from("prompt_sections")
    .select("*")
    .eq("community_id", communityId)
    .order("sort_order");

  if (!sections || sections.length === 0) {
    return NextResponse.json({ sections: [] });
  }

  const sectionIds = sections.map((s) => s.id);

  // Fetch prompts
  const { data: prompts } = await supabase
    .from("prompts")
    .select("*")
    .in("section_id", sectionIds)
    .order("sort_order");

  const promptIds = prompts?.map((p) => p.id) ?? [];

  // Fetch options
  let options: { id: string; prompt_id: string; label: string; sort_order: number }[] = [];
  if (promptIds.length > 0) {
    const { data } = await supabase
      .from("prompt_options")
      .select("*")
      .in("prompt_id", promptIds)
      .order("sort_order");
    options = data ?? [];
  }

  // Assemble tree
  const optionsByPrompt = new Map<string, typeof options>();
  for (const opt of options) {
    if (!optionsByPrompt.has(opt.prompt_id)) {
      optionsByPrompt.set(opt.prompt_id, []);
    }
    optionsByPrompt.get(opt.prompt_id)!.push(opt);
  }

  const promptsBySection = new Map<string, (typeof prompts extends (infer T)[] | null ? T : never)[]>();
  for (const prompt of prompts ?? []) {
    if (!promptsBySection.has(prompt.section_id)) {
      promptsBySection.set(prompt.section_id, []);
    }
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

// PUT: Full sync — create/update/delete sections, prompts, and options
export async function PUT(req: Request, { params }: RouteContext) {
  const { communityId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyOwnership(clerkId, communityId);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sections: incomingSections } = await req.json();
  const supabase = createServiceClient();

  // Fetch existing data
  const { data: existingSections } = await supabase
    .from("prompt_sections")
    .select("id")
    .eq("community_id", communityId);

  const existingSectionIds = new Set(existingSections?.map((s) => s.id) ?? []);

  const { data: existingPrompts } = existingSectionIds.size > 0
    ? await supabase
        .from("prompts")
        .select("id, section_id")
        .in("section_id", [...existingSectionIds])
    : { data: [] };

  const existingPromptIds = new Set(existingPrompts?.map((p) => p.id) ?? []);

  const { data: existingOptions } = existingPromptIds.size > 0
    ? await supabase
        .from("prompt_options")
        .select("id, prompt_id")
        .in("prompt_id", [...existingPromptIds])
    : { data: [] };

  const existingOptionIds = new Set(existingOptions?.map((o) => o.id) ?? []);

  // Compute incoming IDs (non-temp)
  const isTempId = (id: string) => id.startsWith("temp_");

  const incomingSectionIds = new Set<string>();
  const incomingPromptIds = new Set<string>();
  const incomingOptionIds = new Set<string>();

  for (const section of incomingSections) {
    if (!isTempId(section.id)) incomingSectionIds.add(section.id);
    for (const prompt of section.prompts) {
      if (!isTempId(prompt.id)) incomingPromptIds.add(prompt.id);
      for (const option of prompt.options ?? []) {
        if (!isTempId(option.id)) incomingOptionIds.add(option.id);
      }
    }
  }

  // DELETE removed items (child-first)
  const optionsToDelete = [...existingOptionIds].filter((id) => !incomingOptionIds.has(id));
  const promptsToDelete = [...existingPromptIds].filter((id) => !incomingPromptIds.has(id));
  const sectionsToDelete = [...existingSectionIds].filter((id) => !incomingSectionIds.has(id));

  if (optionsToDelete.length > 0) {
    await supabase.from("prompt_options").delete().in("id", optionsToDelete);
  }
  if (promptsToDelete.length > 0) {
    await supabase.from("prompts").delete().in("id", promptsToDelete);
  }
  if (sectionsToDelete.length > 0) {
    await supabase.from("prompt_sections").delete().in("id", sectionsToDelete);
  }

  // UPSERT sections (parent-first), mapping temp IDs to real IDs
  const sectionIdMap = new Map<string, string>(); // tempId -> realId

  for (let i = 0; i < incomingSections.length; i++) {
    const section = incomingSections[i];
    const isNew = isTempId(section.id);

    if (isNew) {
      const { data, error } = await supabase
        .from("prompt_sections")
        .insert({
          community_id: communityId,
          title: section.title,
          step: section.step,
          sort_order: i,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("Failed to insert section:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
      }
      sectionIdMap.set(section.id, data.id);
    } else {
      await supabase
        .from("prompt_sections")
        .update({
          title: section.title,
          step: section.step,
          sort_order: i,
        })
        .eq("id", section.id);
      sectionIdMap.set(section.id, section.id);
    }
  }

  // UPSERT prompts, mapping temp IDs
  const promptIdMap = new Map<string, string>();

  for (const section of incomingSections) {
    const realSectionId = sectionIdMap.get(section.id)!;

    for (let j = 0; j < section.prompts.length; j++) {
      const prompt = section.prompts[j];
      const isNew = isTempId(prompt.id);

      if (isNew) {
        const { data, error } = await supabase
          .from("prompts")
          .insert({
            section_id: realSectionId,
            label: prompt.label,
            type: prompt.type,
            required: prompt.required,
            sort_order: j,
          })
          .select("id")
          .single();

        if (error || !data) {
          console.error("Failed to insert prompt:", error);
          return NextResponse.json({ error: "Failed to save" }, { status: 500 });
        }
        promptIdMap.set(prompt.id, data.id);
      } else {
        await supabase
          .from("prompts")
          .update({
            section_id: realSectionId,
            label: prompt.label,
            type: prompt.type,
            required: prompt.required,
            sort_order: j,
          })
          .eq("id", prompt.id);
        promptIdMap.set(prompt.id, prompt.id);
      }
    }
  }

  // UPSERT options
  for (const section of incomingSections) {
    for (const prompt of section.prompts) {
      const realPromptId = promptIdMap.get(prompt.id)!;

      for (let k = 0; k < (prompt.options ?? []).length; k++) {
        const option = prompt.options[k];
        const isNew = isTempId(option.id);

        if (isNew) {
          await supabase.from("prompt_options").insert({
            prompt_id: realPromptId,
            label: option.label,
            sort_order: k,
          });
        } else {
          await supabase
            .from("prompt_options")
            .update({
              label: option.label,
              sort_order: k,
            })
            .eq("id", option.id);
        }
      }
    }
  }

  // Re-fetch and return the canonical tree
  const response = await GET(req, { params });
  return response;
}
