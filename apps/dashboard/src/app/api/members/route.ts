import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", callerUser.id)
    .eq("community_id", communityId)
    .in("role", ["owner", "admin"])
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all members (role='member') with their user info
  const { data: memberships } = await supabase
    .from("memberships")
    .select("id, created_at, user_id")
    .eq("community_id", communityId)
    .eq("role", "member");

  if (!memberships || memberships.length === 0) {
    return NextResponse.json({ members: [] });
  }

  const userIds = memberships.map((m) => m.user_id);

  const { data: users } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .in("id", userIds);

  const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

  const members = memberships.map((m) => {
    const user = userMap.get(m.user_id);
    return {
      id: m.id,
      user_id: m.user_id,
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      joined: m.created_at,
    };
  });

  return NextResponse.json({ members });
}
