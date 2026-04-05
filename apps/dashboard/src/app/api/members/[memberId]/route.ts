import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ memberId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { memberId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.nextUrl.searchParams.get("community_id");
  if (!communityId) {
    return NextResponse.json(
      { error: "community_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Verify the caller owns this community
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

  // Fetch the membership record (memberId is the membership ID)
  const { data: membership } = await supabase
    .from("memberships")
    .select("id, user_id, community_id, role, created_at")
    .eq("id", memberId)
    .eq("community_id", communityId)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Fetch user details
  const { data: user } = await supabase
    .from("users")
    .select("id, first_name, last_name, phone, birthday, avatar_url")
    .eq("id", membership.user_id)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch prompt sections for this community
  const { data: sections } = await supabase
    .from("prompt_sections")
    .select("id, title, step, sort_order")
    .eq("community_id", communityId)
    .order("sort_order");

  const sectionIds = sections?.map((s) => s.id) ?? [];

  let prompts: {
    id: string;
    section_id: string;
    label: string;
    type: string;
    sort_order: number;
  }[] = [];
  let promptOptions: {
    id: string;
    prompt_id: string;
    label: string;
    sort_order: number;
  }[] = [];

  if (sectionIds.length > 0) {
    const { data: p } = await supabase
      .from("prompts")
      .select("id, section_id, label, type, sort_order")
      .in("section_id", sectionIds)
      .order("sort_order");
    prompts = p ?? [];

    const promptIds = prompts.map((pr) => pr.id);
    if (promptIds.length > 0) {
      const { data: o } = await supabase
        .from("prompt_options")
        .select("id, prompt_id, label, sort_order")
        .in("prompt_id", promptIds)
        .order("sort_order");
      promptOptions = o ?? [];
    }
  }

  // Fetch this member's responses
  const promptIds = prompts.map((p) => p.id);
  let responses: { prompt_id: string; content: string }[] = [];
  if (promptIds.length > 0) {
    const { data: r } = await supabase
      .from("responses")
      .select("prompt_id, content")
      .eq("user_id", membership.user_id)
      .in("prompt_id", promptIds);
    responses = r ?? [];
  }

  const responseMap = new Map(responses.map((r) => [r.prompt_id, r.content]));
  const optionsByPrompt = new Map<string, typeof promptOptions>();
  for (const opt of promptOptions) {
    if (!optionsByPrompt.has(opt.prompt_id))
      optionsByPrompt.set(opt.prompt_id, []);
    optionsByPrompt.get(opt.prompt_id)!.push(opt);
  }

  const promptsBySection = new Map<string, typeof prompts>();
  for (const p of prompts) {
    if (!promptsBySection.has(p.section_id))
      promptsBySection.set(p.section_id, []);
    promptsBySection.get(p.section_id)!.push(p);
  }

  // Helper to extract storage path from a Supabase public URL
  function extractStoragePath(url: string): string | null {
    const marker = "/object/public/video-responses/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.substring(idx + marker.length);
  }

  // Build response tree, generating signed URLs for video responses
  const promptTree = await Promise.all(
    (sections ?? []).map(async (section) => ({
      id: section.id,
      title: section.title,
      step: section.step,
      prompts: await Promise.all(
        (promptsBySection.get(section.id) ?? []).map(async (prompt) => {
          const options = optionsByPrompt.get(prompt.id) ?? [];
          const rawResponse = responseMap.get(prompt.id) ?? null;

          // Resolve option labels for select types
          let displayResponse: string | string[] | null = rawResponse;
          if (rawResponse && prompt.type === "single_select") {
            const opt = options.find((o) => o.id === rawResponse);
            displayResponse = opt?.label ?? rawResponse;
          } else if (rawResponse && prompt.type === "multi_select") {
            try {
              const ids: string[] = JSON.parse(rawResponse);
              displayResponse = ids.map(
                (id) => options.find((o) => o.id === id)?.label ?? id
              );
            } catch {
              displayResponse = rawResponse;
            }
          }

          // Generate signed URL for video responses
          if (
            rawResponse &&
            typeof rawResponse === "string" &&
            rawResponse.includes("video-responses")
          ) {
            const filePath = extractStoragePath(rawResponse);
            if (filePath) {
              const { data } = await supabase.storage
                .from("video-responses")
                .createSignedUrl(filePath, 3600); // 1 hour expiry
              if (data?.signedUrl) {
                displayResponse = data.signedUrl;
              }
            }
          }

          return {
            id: prompt.id,
            label: prompt.label,
            type: prompt.type,
            response: displayResponse,
          };
        })
      ),
    }))
  );

  return NextResponse.json({
    member: {
      id: membership.id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      birthday: user.birthday,
      avatar_url: user.avatar_url,
      joined: membership.created_at,
    },
    promptSections: promptTree,
  });
}
