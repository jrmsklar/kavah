import { createServiceClient } from "@kavah/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { communityId } = await params;
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ isMember: false });
  }

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (!user) {
    return NextResponse.json({ isMember: false });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("community_id", communityId)
    .single();

  return NextResponse.json({ isMember: !!membership });
}
