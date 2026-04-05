import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextResponse } from "next/server";

/**
 * GET /api/communities/[communityId]/admins
 * Returns all admins for a community.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Verify caller is owner or admin
  const { data: caller } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!caller) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: callerMembership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", caller.id)
    .eq("community_id", communityId)
    .in("role", ["owner", "admin"])
    .single();

  if (!callerMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all admin memberships with user info
  const { data: adminMemberships } = await supabase
    .from("memberships")
    .select("id, role, user_id, created_at")
    .eq("community_id", communityId)
    .in("role", ["owner", "admin"])
    .order("created_at");

  const userIds = adminMemberships?.map((m) => m.user_id) ?? [];
  let users: { id: string; first_name: string; last_name: string; phone: string }[] = [];

  if (userIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, first_name, last_name, phone")
      .in("id", userIds);
    users = data ?? [];
  }

  const usersMap = new Map(users.map((u) => [u.id, u]));

  const admins = (adminMemberships ?? []).map((m) => {
    const user = usersMap.get(m.user_id);
    return {
      membershipId: m.id,
      role: m.role,
      userId: m.user_id,
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      phone: user?.phone ?? "",
      createdAt: m.created_at,
    };
  });

  return NextResponse.json({ admins });
}

/**
 * POST /api/communities/[communityId]/admins
 * Add an admin by phone number. Only owners can add admins.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await req.json();
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify caller is owner
  const { data: caller } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!caller) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: callerMembership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", caller.id)
    .eq("community_id", communityId)
    .eq("role", "owner")
    .single();

  if (!callerMembership) {
    return NextResponse.json({ error: "Only owners can add admins" }, { status: 403 });
  }

  // Find user by phone number
  const formattedPhone = phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`;

  const { data: targetUser } = await supabase
    .from("users")
    .select("id, first_name, last_name, phone")
    .eq("phone", formattedPhone)
    .single();

  if (!targetUser) {
    return NextResponse.json(
      { error: "No user found with that phone number. They must sign up first." },
      { status: 404 }
    );
  }

  // Check if they already have a role in this community
  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id, role")
    .eq("user_id", targetUser.id)
    .eq("community_id", communityId)
    .single();

  if (existingMembership) {
    if (existingMembership.role === "owner") {
      return NextResponse.json({ error: "This user is already an owner" }, { status: 409 });
    }
    if (existingMembership.role === "admin") {
      return NextResponse.json({ error: "This user is already an admin" }, { status: 409 });
    }
    // Upgrade from member to admin
    await supabase
      .from("memberships")
      .update({ role: "admin" })
      .eq("id", existingMembership.id);
  } else {
    // Create new admin membership
    const { error: insertError } = await supabase
      .from("memberships")
      .insert({
        user_id: targetUser.id,
        community_id: communityId,
        role: "admin",
      });

    if (insertError) {
      console.error("Failed to add admin:", insertError);
      return NextResponse.json({ error: "Failed to add admin" }, { status: 500 });
    }
  }

  return NextResponse.json({
    admin: {
      userId: targetUser.id,
      firstName: targetUser.first_name,
      lastName: targetUser.last_name,
      phone: targetUser.phone,
      role: "admin",
    },
  }, { status: 201 });
}

/**
 * DELETE /api/communities/[communityId]/admins
 * Remove an admin. Only owners can remove admins.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { membershipId } = await req.json();
  if (!membershipId) {
    return NextResponse.json({ error: "membershipId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify caller is owner
  const { data: caller } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!caller) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: callerMembership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", caller.id)
    .eq("community_id", communityId)
    .eq("role", "owner")
    .single();

  if (!callerMembership) {
    return NextResponse.json({ error: "Only owners can remove admins" }, { status: 403 });
  }

  // Verify the target membership exists and is an admin (not owner)
  const { data: targetMembership } = await supabase
    .from("memberships")
    .select("role")
    .eq("id", membershipId)
    .eq("community_id", communityId)
    .single();

  if (!targetMembership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  if (targetMembership.role === "owner") {
    return NextResponse.json({ error: "Cannot remove an owner" }, { status: 403 });
  }

  await supabase.from("memberships").delete().eq("id", membershipId);

  return NextResponse.json({ success: true });
}
