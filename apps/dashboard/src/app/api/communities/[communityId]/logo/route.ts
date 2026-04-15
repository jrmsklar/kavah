import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Verify caller is owner/admin
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

  const formData = await req.formData();
  const logoFile = formData.get("logo") as File | null;
  const remove = formData.get("remove") === "true";

  // Fetch existing community to clean up prior logo
  const { data: existing } = await supabase
    .from("communities")
    .select("icon_url")
    .eq("id", communityId)
    .single();

  function extractStoragePath(url: string | null): string | null {
    if (!url) return null;
    const marker = "/community-logos/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.substring(idx + marker.length);
  }

  let iconUrl: string | null = null;

  if (remove) {
    iconUrl = null;
  } else {
    if (!logoFile || logoFile.size === 0) {
      return NextResponse.json({ error: "Logo file is required" }, { status: 400 });
    }
    if (!logoFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const ext = logoFile.name.split(".").pop() ?? "png";
    const filePath = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("community-logos")
      .upload(filePath, logoFile, {
        contentType: logoFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("community-logos")
      .getPublicUrl(filePath);

    iconUrl = urlData.publicUrl;
  }

  const { data: updated, error: updateError } = await supabase
    .from("communities")
    .update({ icon_url: iconUrl })
    .eq("id", communityId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error("Failed to update community:", updateError);
    return NextResponse.json({ error: "Failed to update community" }, { status: 500 });
  }

  // Best-effort delete of old logo
  const oldPath = extractStoragePath(existing?.icon_url ?? null);
  if (oldPath) {
    await supabase.storage.from("community-logos").remove([oldPath]);
  }

  return NextResponse.json({ community: updated });
}
