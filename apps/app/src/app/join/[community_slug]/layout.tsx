import { createServiceClient } from "@kavah/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { CommunityProvider } from "./community-context";

export default async function JoinLayout({
  params,
  children,
}: {
  params: Promise<{ community_slug: string }>;
  children: React.ReactNode;
}) {
  const { community_slug } = await params;
  const supabase = createServiceClient();

  const { data: community } = await supabase
    .from("communities")
    .select("id, name, slug, description, icon_url, matchmaker_display_name")
    .eq("slug", community_slug)
    .single();

  if (!community) notFound();

  // Check if logged-in user is already a member + fetch their profile
  let isMember = false;
  let userProfile: { birthday: string | null; height_inches: number | null; city: string | null } | null = null;
  try {
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();
      if (user) {
        const { data: membership } = await supabase
          .from("memberships")
          .select("id")
          .eq("user_id", user.id)
          .eq("community_id", community.id)
          .single();
        isMember = !!membership;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("birthday, height_inches, city")
          .eq("user_id", user.id)
          .single();
        if (profile) {
          userProfile = profile;
        }
      }
    }
  } catch {
    // Not authenticated — continue as non-member
  }

  // Fetch prompt sections with prompts and options
  const { data: sections } = await supabase
    .from("prompt_sections")
    .select("*")
    .eq("community_id", community.id)
    .order("sort_order");

  const sectionIds = sections?.map((s) => s.id) ?? [];

  let prompts: { id: string; section_id: string; label: string; type: string; required: boolean; sort_order: number }[] = [];
  let options: { id: string; prompt_id: string; label: string; sort_order: number }[] = [];

  if (sectionIds.length > 0) {
    const { data: p } = await supabase
      .from("prompts")
      .select("id, section_id, label, type, required, sort_order")
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
      options = o ?? [];
    }
  }

  // Assemble tree
  const optionsByPrompt = new Map<string, typeof options>();
  for (const opt of options) {
    if (!optionsByPrompt.has(opt.prompt_id)) optionsByPrompt.set(opt.prompt_id, []);
    optionsByPrompt.get(opt.prompt_id)!.push(opt);
  }

  const promptsBySection = new Map<string, typeof prompts>();
  for (const p of prompts) {
    if (!promptsBySection.has(p.section_id)) promptsBySection.set(p.section_id, []);
    promptsBySection.get(p.section_id)!.push(p);
  }

  const promptSections = (sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    step: section.step as "basics" | "videos" | "profile",
    sort_order: section.sort_order,
    prompts: (promptsBySection.get(section.id) ?? []).map((prompt) => ({
      id: prompt.id,
      label: prompt.label,
      type: prompt.type as "text_input" | "single_select" | "multi_select" | "video" | "textarea",
      required: prompt.required,
      sort_order: prompt.sort_order,
      options: (optionsByPrompt.get(prompt.id) ?? []).map((opt) => ({
        id: opt.id,
        label: opt.label,
        sort_order: opt.sort_order,
      })),
    })),
  }));

  return (
    <CommunityProvider community={community} promptSections={promptSections} isMember={isMember} userProfile={userProfile}>
      {children}
    </CommunityProvider>
  );
}
