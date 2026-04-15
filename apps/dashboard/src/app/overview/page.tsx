"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/community-context";
import { PROMPT_TYPE_LABELS } from "@/types/prompts";
import type { PromptType } from "@/types/prompts";

type PromptOption = { id: string; prompt_id: string; label: string; sort_order: number };
type PromptData = { id: string; section_id: string; label: string; type: string; required: boolean; sort_order: number; options: PromptOption[] };
type SectionData = { id: string; title: string; step: string; sort_order: number; prompts: PromptData[] };
type CommunityData = { id: string; name: string; slug: string; description: string | null; icon_url: string | null; created_at: string };

type OverviewData = {
  community: CommunityData;
  memberCount: number;
  promptSections: SectionData[];
};

function LogoEditor({
  communityId,
  iconUrl,
  name,
  onChange,
}: {
  communityId: string;
  iconUrl: string | null;
  name: string;
  onChange: (url: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch(`/api/communities/${communityId}/logo`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        onChange(data.community.icon_url);
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!confirm("Remove the community logo?")) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("remove", "true");
      const res = await fetch(`/api/communities/${communityId}/logo`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to remove");
      } else {
        onChange(null);
      }
    } catch {
      setError("Failed to remove");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div className="flex items-center gap-4">
        {iconUrl ? (
          <img src={iconUrl} alt={name} className="h-14 w-14 rounded-lg object-cover border border-border-subtle" />
        ) : (
          <div className="h-14 w-14 rounded-lg border border-dashed border-border bg-warm flex items-center justify-center text-ink-3 text-[10px]">
            No logo
          </div>
        )}
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="font-medium text-gold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {uploading ? "Uploading…" : iconUrl ? "Change" : "Upload"}
          </button>
          {iconUrl && !uploading && (
            <>
              <span className="text-border" aria-hidden>·</span>
              <button
                type="button"
                onClick={handleRemove}
                className="font-medium text-ink-3 hover:text-ink-2 hover:underline"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-rose">{error}</p>}
    </div>
  );
}

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 transition"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}

export default function OverviewPage() {
  const { selected: selectedCommunity, loading: communitiesLoading } = useCommunity();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCommunity) return;
    setLoading(true);
    fetch(`/api/communities/${selectedCommunity.id}/overview`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [selectedCommunity]);

  if (communitiesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedCommunity || !data?.community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <p className="text-ink-2">
          No communities yet.{" "}
          <a href="/communities/new" className="text-gold font-semibold hover:underline">
            Create one
          </a>{" "}
          to get started.
        </p>
      </div>
    );
  }

  const { community, memberCount, promptSections } = data;
  const joinLink = `https://app.joinkavah.com/join/${community.slug}`;
  const sectionCount = promptSections.length;
  const promptCount = promptSections.reduce((sum, s) => sum + s.prompts.length, 0);

  return (
    <div className="p-4 sm:p-8">
      <div>
        <LogoEditor
          communityId={community.id}
          iconUrl={community.icon_url}
          name={community.name}
          onChange={(newUrl) =>
            setData((prev) =>
              prev ? { ...prev, community: { ...prev.community, icon_url: newUrl } } : prev
            )
          }
        />
        <h1 className="font-serif text-3xl font-medium text-ink">{community.name}</h1>
        {community.description && (
          <p className="mt-1 text-ink-2">{community.description}</p>
        )}
        <p className="mt-3 text-sm text-ink-3">
          Created {new Date(community.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-warm p-5">
          <p className="text-sm text-ink-3">Members</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{memberCount}</p>
        </div>
      </div>

      {/* Share link */}
      <div className="mt-8 rounded-xl border border-border bg-warm p-6">
        <h2 className="font-serif text-lg font-medium text-ink">
          Invite members
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          Share this link with friends to invite them to your community.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-border-subtle bg-cream px-3 py-2 text-sm text-ink-2 font-mono truncate">
            {joinLink}
          </div>
          <CopyLinkButton link={joinLink} />
        </div>
      </div>

      {/* Prompts */}
      <div className="mt-8 rounded-xl border border-border bg-warm p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-ink">Prompts</h2>
          {sectionCount > 0 && (
            <Link
              href={`/communities/${community.slug}/prompts`}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 transition"
            >
              Edit Prompts
            </Link>
          )}
        </div>

        {sectionCount === 0 ? (
          <>
            <p className="mt-2 text-sm text-ink-2">
              Set up the questions members will answer when joining your
              community. You can add text fields, multiple choice, video
              prompts, and more.
            </p>
            <Link
              href={`/communities/${community.slug}/prompts`}
              className="mt-4 inline-block rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 transition"
            >
              Add Prompts
            </Link>
          </>
        ) : (
          <div className="mt-4 space-y-4">
            {promptSections.map((section) => (
              <div key={section.id} className="rounded-xl border border-border-subtle bg-cream p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-ink">
                    {section.title || "Untitled Section"}
                  </h3>
                  <span className="rounded-full bg-gold-pale px-2 py-0.5 text-xs text-gold font-medium">
                    {section.step}
                  </span>
                </div>
                {section.prompts.length === 0 ? (
                  <p className="text-xs text-ink-3">No prompts in this section</p>
                ) : (
                  <ul className="space-y-2">
                    {section.prompts.map((prompt) => {
                      const showOptions =
                        prompt.type === "single_select" || prompt.type === "multi_select";
                      return (
                        <li
                          key={prompt.id}
                          className="rounded-lg border border-border-subtle bg-warm p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-ink">
                              {prompt.label || "Untitled Prompt"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-ink-3">
                                {PROMPT_TYPE_LABELS[prompt.type as PromptType] ?? prompt.type}
                              </span>
                              {prompt.required && (
                                <span className="text-xs text-rose font-medium">Required</span>
                              )}
                            </div>
                          </div>
                          {showOptions && prompt.options.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {prompt.options.map((opt) => (
                                <span
                                  key={opt.id}
                                  className="rounded-full border border-border-subtle bg-cream px-2.5 py-0.5 text-xs text-ink-2"
                                >
                                  {opt.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
            <p className="text-xs text-ink-3">
              {sectionCount} {sectionCount === 1 ? "section" : "sections"},{" "}
              {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
