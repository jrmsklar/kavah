import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("user_id", user.id)
    .eq("role", "owner");

  const communityIds = memberships?.map((m) => m.community_id) ?? [];

  if (communityIds.length === 0) {
    return NextResponse.json({ communities: [] });
  }

  const { data: communities } = await supabase
    .from("communities")
    .select("id, name, slug, description, created_at")
    .in("id", communityIds)
    .order("created_at", { ascending: false });

  return NextResponse.json({ communities: communities ?? [] });
}
