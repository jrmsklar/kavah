"use client";

import { useState } from "react";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
