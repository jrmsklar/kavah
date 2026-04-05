import { auth } from "@clerk/nextjs/server";
import { getManagedCommunities } from "@kavah/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CommunitiesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const communities = await getManagedCommunities(clerkId);

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create your first community
          </h2>
          <p className="mt-2 text-gray-600">
            Get started by creating a community. You&apos;ll be able to invite
            members, set up prompts, and start making matches.
          </p>
          <Link
            href="/communities/new"
            className="mt-6 inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
        <Link
          href="/communities/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          New Community
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => (
          <Link
            key={community.id}
            href={`/communities/${community.slug}`}
            className="block rounded-lg border p-6 hover:border-gray-400 transition"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {community.name}
            </h3>
            {community.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {community.description}
              </p>
            )}
            <p className="mt-3 text-xs text-gray-400">
              Created {new Date(community.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
