"use client";

import { useState } from "react";

export function PhoneVerification({
  onVerify,
  onResend,
  error,
  loading,
}: {
  onVerify: (code: string) => void;
  onResend: () => void;
  error: string | null;
  loading: boolean;
}) {
  const [code, setCode] = useState("");

  return (
    <div className="mt-3 rounded-xl border border-gold-light bg-gold-pale/40 p-4">
      <p className="text-sm text-ink-2">
        We sent a verification code to your phone.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="flex-1 rounded-lg border border-border bg-warm px-3 py-2.5 text-sm text-center tracking-[0.3em] font-medium focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          onClick={() => onVerify(code)}
          disabled={code.length < 6 || loading}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Verify"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
      <button
        onClick={onResend}
        className="mt-2 text-xs text-ink-3 hover:text-ink-2 underline underline-offset-2"
      >
        Resend code
      </button>
    </div>
  );
}
