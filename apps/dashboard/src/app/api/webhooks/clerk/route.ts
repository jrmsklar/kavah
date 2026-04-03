import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createServiceClient();

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, phone_numbers, first_name, last_name, birthday, image_url } =
      evt.data;

    const primaryPhone = phone_numbers?.find(
      (p) => p.id === evt.data.primary_phone_number_id
    );

    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: id,
        phone: primaryPhone?.phone_number ?? "",
        first_name: first_name ?? "",
        last_name: last_name ?? "",
        birthday: birthday ?? null,
        avatar_url: image_url ?? null,
      },
      { onConflict: "clerk_id" }
    );

    if (error) {
      console.error("Failed to upsert user:", error);
      return new Response("Database error", { status: 500 });
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("clerk_id", id!);

    if (error) {
      console.error("Failed to delete user:", error);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
