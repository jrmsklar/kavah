import { auth } from "@clerk/nextjs/server";
import { getManagedCommunities } from "@kavah/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communities = await getManagedCommunities(clerkId);
  return NextResponse.json({ communities });
}
