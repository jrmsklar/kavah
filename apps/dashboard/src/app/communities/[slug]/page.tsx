import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLinkButton } from "./copy-link-button";
import { PROMPT_TYPE_LABELS } from "@/types/prompts";
import type { PromptType } from "@/types/prompts";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!community) notFound();

  const joinLink = `https://app.joinkavah.com/join/${community.slug}`;

  // Get member count
  const { count: memberCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("community_id", community.id)
    .eq("role", "member");

  // Get prompt sections with prompts and options
  const { data: promptSections } = await supabase
    .from("prompt_sections")
    .select("id, title, step, sort_order")
    .eq("community_id", community.id)
    .order("sort_order");

  const sectionCount = promptSections?.length ?? 0;
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

  const promptCount = prompts.length;

  // Group options by prompt
  const optionsByPrompt = new Map<string, typeof promptOptions>();
  for (const opt of promptOptions) {
    if (!optionsByPrompt.has(opt.prompt_id)) optionsByPrompt.set(opt.prompt_id, []);
    optionsByPrompt.get(opt.prompt_id)!.push(opt);
  }

  // Group prompts by section
  const promptsBySection = new Map<string, typeof prompts>();
  for (const p of prompts) {
    if (!promptsBySection.has(p.section_id)) promptsBySection.set(p.section_id, []);
    promptsBySection.get(p.section_id)!.push(p);
  }

  return (
    <div className="p-8">
      <Link
        href="/communities"
        className="text-sm text-gray-500 hover:text-gray-700 transition"
      >
        &larr; Back to communities
      </Link>

      <div className="mt-6">
        {community.icon_url && (
          <img
            src={community.icon_url}
            alt={community.name}
            className="h-14 mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
        {community.description && (
          <p className="mt-1 text-gray-600">{community.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          Created {new Date(community.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Members</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {memberCount ?? 0}
          </p>
        </div>
      </div>

      {/* Share link */}
      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Invite members
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Share this link with friends to invite them to your community.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono truncate">
            {joinLink}
          </div>
          <CopyLinkButton link={joinLink} />
        </div>
      </div>

      {/* Prompts */}
      <div className="mt-8 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Prompts</h2>
          {sectionCount > 0 && (
            <Link
              href={`/communities/${slug}/prompts`}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
            >
              Edit Prompts
            </Link>
          )}
        </div>

        {sectionCount === 0 ? (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Set up the questions members will answer when joining your
              community. You can add text fields, multiple choice, video
              prompts, and more.
            </p>
            <Link
              href={`/communities/${slug}/prompts`}
              className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
            >
              Add Prompts
            </Link>
          </>
        ) : (
          <div className="mt-4 space-y-4">
            {promptSections!.map((section) => {
              const sectionPrompts = promptsBySection.get(section.id) ?? [];
              return (
                <div key={section.id} className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {section.title || "Untitled Section"}
                    </h3>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                      {section.step}
                    </span>
                  </div>
                  {sectionPrompts.length === 0 ? (
                    <p className="text-xs text-gray-400">No prompts in this section</p>
                  ) : (
                    <ul className="space-y-2">
                      {sectionPrompts.map((prompt) => {
                        const options = optionsByPrompt.get(prompt.id) ?? [];
                        const showOptions =
                          prompt.type === "single_select" || prompt.type === "multi_select";
                        return (
                          <li
                            key={prompt.id}
                            className="rounded border bg-white p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-900">
                                {prompt.label || "Untitled Prompt"}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {PROMPT_TYPE_LABELS[prompt.type as PromptType] ?? prompt.type}
                                </span>
                                {prompt.required && (
                                  <span className="text-xs text-red-500">Required</span>
                                )}
                              </div>
                            </div>
                            {showOptions && options.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {options.map((opt) => (
                                  <span
                                    key={opt.id}
                                    className="rounded-full border bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600"
                                  >
                                    {opt.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-gray-400">
              {sectionCount} {sectionCount === 1 ? "section" : "sections"},{" "}
              {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
