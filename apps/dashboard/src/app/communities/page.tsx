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
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-pale flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-gold"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-medium text-ink">
            Create your first community
          </h2>
          <p className="mt-2 text-ink-2">
            Get started by creating a community. You&apos;ll be able to invite
            members, set up prompts, and start making matches.
          </p>
          <Link
            href="/communities/new"
            className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-medium text-ink">Communities</h1>
        <Link
          href="/communities/new"
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 transition"
        >
          New Community
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => (
          <Link
            key={community.id}
            href={`/communities/${community.slug}`}
            className="block rounded-xl border border-border bg-warm p-6 hover:border-ink-3/30 transition"
          >
            <h3 className="font-serif text-lg font-medium text-ink">
              {community.name}
            </h3>
            {community.description && (
              <p className="mt-1 text-sm text-ink-2 line-clamp-2">
                {community.description}
              </p>
            )}
            <p className="mt-3 text-xs text-ink-3">
              Created {new Date(community.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
