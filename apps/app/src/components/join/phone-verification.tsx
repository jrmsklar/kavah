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
    <div className="mt-4 p-4 rounded-lg border bg-gray-50">
      <p className="text-sm text-gray-600 mb-3">
        We sent a verification code to your phone. Enter it below.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-center tracking-widest font-mono shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          onClick={() => onVerify(code)}
          disabled={code.length < 6 || loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Verify"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={onResend}
        className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
      >
        Resend code
      </button>
    </div>
  );
}
