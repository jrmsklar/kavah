"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCommunity } from "@/components/community-context";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

export default function NewCommunityPage() {
  const router = useRouter();
  const { refresh } = useCommunity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [matchmakerName, setMatchmakerName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dragCounterRef = useRef(0);

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPEG, WebP, SVG, or GIF image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Logo must be under 2 MB.");
      return;
    }

    setError("");
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function removeLogo() {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (description.trim()) formData.append("description", description.trim());
      if (matchmakerName.trim()) formData.append("matchmakerDisplayName", matchmakerName.trim());
      if (logoFile) formData.append("logo", logoFile);

      const res = await fetch("/api/communities", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create community");
      }

      const { community } = await res.json();
      await refresh(community.id);
      router.push("/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center p-8 pt-24">
      <div className="w-full max-w-lg">
        <Link
          href="/overview"
          className="text-sm text-ink-3 hover:text-ink-2 transition"
        >
          &larr; Back to overview
        </Link>

        <h1 className="mt-4 font-serif text-2xl font-medium text-ink">
          Create a new community
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Give your community a name and optional description. You can always
          change these later.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Logo upload */}
          <div>
            <label className="block text-sm font-medium text-ink">
              Logo{" "}
              <span className="text-ink-3 font-normal">(optional)</span>
            </label>
            <div className="mt-2">
              {logoPreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 rounded-xl object-cover border border-border"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-ink-2 truncate max-w-[200px]">
                      {logoFile?.name}
                    </p>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-sm text-rose hover:text-rose/80 transition text-left"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`flex items-center gap-3 w-full rounded-xl border border-dashed px-4 py-4 transition ${
                    isDragging
                      ? "border-gold bg-gold-pale ring-2 ring-gold/20"
                      : "border-border hover:border-ink-3/30 hover:bg-cream"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                    isDragging ? "bg-gold-light" : "bg-cream"
                  }`}>
                    <svg className={`w-6 h-6 transition ${isDragging ? "text-gold" : "text-ink-3"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      {isDragging ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      )}
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-ink">
                      {isDragging ? "Drop image to upload" : "Upload a logo"}
                    </p>
                    {!isDragging && (
                      <p className="text-xs text-ink-3">
                        PNG, JPEG, WebP, SVG, or GIF. Max 2 MB.
                      </p>
                    )}
                  </div>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-ink"
            >
              Community name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friday Tables"
              className="mt-1 block w-full rounded-lg border border-border bg-warm px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label
              htmlFor="matchmakerName"
              className="block text-sm font-medium text-ink"
            >
              Matchmaker name(s){" "}
              <span className="text-ink-3 font-normal">(optional)</span>
            </label>
            <input
              id="matchmakerName"
              type="text"
              value={matchmakerName}
              onChange={(e) => setMatchmakerName(e.target.value)}
              placeholder="e.g. Danielle and Justin"
              className="mt-1 block w-full rounded-lg border border-border bg-warm px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <p className="mt-1 text-xs text-ink-3">
              Shown to members on the join page as who&apos;s doing the matching.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-ink"
            >
              Description{" "}
              <span className="text-ink-3 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Tell potential members what your community is about..."
              className="mt-1 block w-full rounded-lg border border-border bg-warm px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {error && (
            <p className="text-sm text-rose">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
}
