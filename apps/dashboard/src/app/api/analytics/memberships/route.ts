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

  // Verify the caller is an owner/admin
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

  // Get memberships created in the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: memberships } = await supabase
    .from("memberships")
    .select("created_at")
    .eq("community_id", communityId)
    .eq("role", "member")
    .gte("created_at", sevenDaysAgo.toISOString());

  // Build daily counts for last 7 days
  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    days.push({ date: dateStr, label, count: 0 });
  }

  for (const m of memberships ?? []) {
    const dateStr = new Date(m.created_at).toISOString().split("T")[0];
    const day = days.find((d) => d.date === dateStr);
    if (day) day.count++;
  }

  return NextResponse.json({ days });
}
