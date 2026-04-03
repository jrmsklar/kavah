import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { notFound, redirect } from "next/navigation";
import { PromptBuilder } from "@/components/prompts/prompt-builder";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function PromptsPage({
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
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (!community) notFound();

  return (
    <DashboardShell>
      <PromptBuilder communityId={community.id} slug={community.slug} />
    </DashboardShell>
  );
}
