import { createServiceClient } from "@kavah/db";
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
    .select("id, name, slug, description, icon_url")
    .eq("slug", community_slug)
    .single();

  if (!community) notFound();

  return (
    <CommunityProvider community={community}>{children}</CommunityProvider>
  );
}
