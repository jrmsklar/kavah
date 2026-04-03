import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@kavah/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLinkButton } from "./copy-link-button";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!community) notFound();

  const joinLink = `https://app.joinkavah.com/join/${community.slug}`;

  // Get member count
  const { count: memberCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("community_id", community.id)
    .eq("role", "member");

  return (
    <div className="p-8">
      <Link
        href="/communities"
        className="text-sm text-gray-500 hover:text-gray-700 transition"
      >
        &larr; Back to communities
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
        {community.description && (
          <p className="mt-2 text-gray-600">{community.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          Created {new Date(community.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Members</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {memberCount ?? 0}
          </p>
        </div>
      </div>

      {/* Share link */}
      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Invite members
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Share this link with friends to invite them to your community.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono truncate">
            {joinLink}
          </div>
          <CopyLinkButton link={joinLink} />
        </div>
      </div>
    </div>
  );
}
