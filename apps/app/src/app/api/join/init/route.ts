import { createServiceClient } from "@kavah/db";
import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  const { communityId, firstName, lastName, phone, clerkUserId } =
    await req.json();

  if (!communityId || !firstName || !lastName || !phone || !clerkUserId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Verify community exists
  const { data: community } = await supabase
    .from("communities")
    .select("id, name")
    .eq("id", communityId)
    .single();

  if (!community) {
    return NextResponse.json(
      { error: "Community not found" },
      { status: 404 }
    );
  }

  // Upsert user (handles race with Clerk webhook)
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert(
      {
        clerk_id: clerkUserId,
        phone,
        first_name: firstName,
        last_name: lastName,
      },
      { onConflict: "clerk_id" }
    )
    .select("id")
    .single();

  if (userError || !user) {
    console.error("Failed to upsert user:", userError);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  // Create membership with status = incomplete (skip if one already exists)
  const { data: existing } = await supabase
    .from("memberships")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("community_id", communityId)
    .single();

  if (!existing) {
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        user_id: user.id,
        community_id: communityId,
        role: "member",
        status: "incomplete",
      });

    if (membershipError) {
      console.error("Failed to create membership:", membershipError);
      return NextResponse.json(
        { error: "Failed to create membership" },
        { status: 500 }
      );
    }

    // Notify admins (fire-and-forget)
    notifyAdmins(communityId, community.name, firstName, lastName, supabase);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

async function notifyAdmins(
  communityId: string,
  communityName: string,
  memberFirstName: string,
  memberLastName: string,
  supabase: ReturnType<typeof createServiceClient>,
) {
  try {
    const subject = `${memberFirstName} ${memberLastName} joined ${communityName}`;
    await sendNotificationEmail(subject, subject);
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
