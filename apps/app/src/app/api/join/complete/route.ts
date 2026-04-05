import { createServiceClient } from "@kavah/db";
import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  const { communityId, firstName, lastName, phone, clerkUserId, responses, birthday, heightInches, city } =
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
    .select("id")
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

  // Upsert user profile (birthday, height, city)
  if (birthday || heightInches || city) {
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: user.id,
          birthday: birthday || null,
          height_inches: heightInches || null,
          city: city || null,
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("Failed to upsert user profile:", profileError);
      // Don't fail the whole request — user and membership are more critical
    }
  }

  // Check if membership already exists
  const { data: existing } = await supabase
    .from("memberships")
    .select("id")
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
      });

    if (membershipError) {
      console.error("Failed to create membership:", membershipError);
      return NextResponse.json(
        { error: "Failed to join community" },
        { status: 500 }
      );
    }
  }

  // Notify admins via email (fire-and-forget)
  if (!existing) {
    notifyAdmins(communityId, firstName, lastName, supabase);
  }

  // Save responses if provided
  if (responses && typeof responses === "object") {
    const responseEntries = Object.entries(responses as Record<string, string>);

    if (responseEntries.length > 0) {
      const responseRows = responseEntries
        .filter(([, value]) => value && value.trim().length > 0)
        .map(([promptId, content]) => ({
          prompt_id: promptId,
          user_id: user.id,
          content,
        }));

      if (responseRows.length > 0) {
        const { error: responsesError } = await supabase
          .from("responses")
          .upsert(responseRows, { onConflict: "prompt_id,user_id" });

        if (responsesError) {
          console.error("Failed to save responses:", responsesError);
          // Don't fail the whole request — membership was created
        }
      }
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

/**
 * Fire-and-forget: email admins when a new member joins.
 */
async function notifyAdmins(
  communityId: string,
  memberFirstName: string,
  memberLastName: string,
  supabase: ReturnType<typeof createServiceClient>,
) {
  try {
    const { data: community } = await supabase
      .from("communities")
      .select("name")
      .eq("id", communityId)
      .single();

    if (!community) return;

    const subject = `${memberFirstName} ${memberLastName} joined ${community.name}`;
    await sendNotificationEmail(subject, subject);
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
