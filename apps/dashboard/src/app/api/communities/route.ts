import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextResponse } from "next/server";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up the user by clerk_id
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Generate slug and ensure uniqueness
  let slug = generateSlug(name.trim());
  const { data: existing } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Create the community
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .insert({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    })
    .select()
    .single();

  if (communityError || !community) {
    console.error("Failed to create community:", communityError);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }

  // Create the owner membership
  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      user_id: user.id,
      community_id: community.id,
      role: "owner",
    });

  if (membershipError) {
    console.error("Failed to create membership:", membershipError);
    // Clean up the community if membership failed
    await supabase.from("communities").delete().eq("id", community.id);
    return NextResponse.json(
      { error: "Failed to create membership" },
      { status: 500 }
    );
  }

  return NextResponse.json({ community }, { status: 201 });
}
