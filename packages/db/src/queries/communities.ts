import { createServiceClient } from "../client";

/**
 * Get communities where the user is an owner or admin.
 */
export async function getManagedCommunities(clerkId: string) {
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return [];

  const { data: memberships } = await supabase
    .from("memberships")
    .select("community_id, role")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin"]);

  const communityIds = memberships?.map((m) => m.community_id) ?? [];
  if (communityIds.length === 0) return [];

  const { data: communities } = await supabase
    .from("communities")
    .select("id, name, slug, description, created_at")
    .in("id", communityIds)
    .order("created_at", { ascending: false });

  return communities ?? [];
}
