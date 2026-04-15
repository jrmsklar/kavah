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

  // Use the client's timezone for date bucketing (falls back to UTC)
  const tz = req.nextUrl.searchParams.get("tz") || "UTC";

  // Helper: format a Date to YYYY-MM-DD in the user's timezone
  function toLocalDateStr(date: Date): string {
    return date.toLocaleDateString("en-CA", { timeZone: tz }); // en-CA gives YYYY-MM-DD
  }

  function toLabel(date: Date): string {
    return date.toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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
    days.push({ date: toLocalDateStr(d), label: toLabel(d), count: 0 });
  }

  for (const m of memberships ?? []) {
    const dateStr = toLocalDateStr(new Date(m.created_at));
    const day = days.find((d) => d.date === dateStr);
    if (day) day.count++;
  }

  return NextResponse.json({ days });
}
