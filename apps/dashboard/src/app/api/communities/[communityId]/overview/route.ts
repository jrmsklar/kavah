import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Verify the caller is an owner/admin
  const { data: callerUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!callerUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: callerMembership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", callerUser.id)
    .eq("community_id", communityId)
    .in("role", ["owner", "admin"])
    .single();

  if (!callerMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  // Member count
  const { count: memberCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("community_id", communityId)
    .eq("role", "member");

  // Prompt sections with prompts and options
  const { data: promptSections } = await supabase
    .from("prompt_sections")
    .select("id, title, step, sort_order")
    .eq("community_id", communityId)
    .order("sort_order");

  const sectionIds = promptSections?.map((s) => s.id) ?? [];

  let prompts: { id: string; section_id: string; label: string; type: string; required: boolean; sort_order: number }[] = [];
  let promptOptions: { id: string; prompt_id: string; label: string; sort_order: number }[] = [];

  if (sectionIds.length > 0) {
    const { data } = await supabase
      .from("prompts")
      .select("id, section_id, label, type, required, sort_order")
      .in("section_id", sectionIds)
      .order("sort_order");
    prompts = data ?? [];

    const promptIds = prompts.map((p) => p.id);
    if (promptIds.length > 0) {
      const { data: opts } = await supabase
        .from("prompt_options")
        .select("id, prompt_id, label, sort_order")
        .in("prompt_id", promptIds)
        .order("sort_order");
      promptOptions = opts ?? [];
    }
  }

  // Group options by prompt
  const optionsByPrompt: Record<string, typeof promptOptions> = {};
  for (const opt of promptOptions) {
    if (!optionsByPrompt[opt.prompt_id]) optionsByPrompt[opt.prompt_id] = [];
    optionsByPrompt[opt.prompt_id].push(opt);
  }

  // Group prompts by section
  const sections = (promptSections ?? []).map((section) => ({
    ...section,
    prompts: prompts
      .filter((p) => p.section_id === section.id)
      .map((p) => ({
        ...p,
        options: optionsByPrompt[p.id] ?? [],
      })),
  }));

  return NextResponse.json({
    community,
    memberCount: memberCount ?? 0,
    promptSections: sections,
  });
}
