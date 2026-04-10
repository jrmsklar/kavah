"use client";

import { useEffect, useRef, useState } from "react";
import { useSignUp, useSignIn } from "@clerk/nextjs";

type SignUpResource = NonNullable<ReturnType<typeof useSignUp>["signUp"]>;

type Mode = "signup" | "signin";

export function SignupStep({
  signUp,
  isLoaded,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  setPhoneVerified,
  onSignUpComplete,
  onNext,
  onSignInSuccess,
  setActiveSignUp,
}: {
  signUp: SignUpResource | undefined;
  isLoaded: boolean;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  setPhoneVerified: (v: boolean) => void;
  onSignUpComplete: (sessionId: string, userId: string) => void;
  onNext: () => void;
  onSignInSuccess: () => void | Promise<void>;
  setActiveSignUp: ((params: { session: string }) => Promise<void>) | undefined;
}) {
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();

  const [mode, setMode] = useState<Mode>("signup");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [country, setCountry] = useState("US");

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the code input once it slides in
  useEffect(() => {
    if (verifying) {
      const t = setTimeout(() => codeInputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [verifying]);

  function formatPhoneDisplay(digits: string): string {
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const fieldsValid =
    isLoaded && signInLoaded && firstName.trim() && lastName.trim() && phone.length >= 10;

  const canSubmit = verifying ? code.length === 6 && !submitting : fieldsValid && !submitting;

  async function startSignIn(formattedPhone: string) {
    if (!signIn) throw new Error("Sign-in not ready");
    const attempt = await signIn.create({ identifier: formattedPhone });
    const phoneFactor = attempt.supportedFirstFactors?.find(
      (f): f is Extract<typeof f, { strategy: "phone_code" }> => f.strategy === "phone_code"
    );
    if (!phoneFactor) {
      throw new Error("Phone verification isn't available for this account.");
    }
    await signIn.prepareFirstFactor({
      strategy: "phone_code",
      phoneNumberId: phoneFactor.phoneNumberId,
    });
  }

  async function handleSendCode() {
    if (!fieldsValid || !signUp) return;
    setSubmitting(true);
    setVerifyError(null);

    const formattedPhone = `+1${phone}`;

    try {
      await signUp.create({
        phoneNumber: formattedPhone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      setMode("signup");
      setVerifying(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { code: string; message: string }[] };
      const errors = clerkError.errors ?? [];
      const exists = errors.some((e) => e.code === "form_identifier_exists");

      if (exists) {
        // Phone already has an account — switch to sign-in flow
        try {
          await startSignIn(formattedPhone);
          setMode("signin");
          setVerifying(true);
        } catch (signInErr: unknown) {
          console.error("Clerk signIn error:", signInErr);
          const e = signInErr as { errors?: { message: string }[] };
          setVerifyError(
            e.errors?.[0]?.message ?? "Failed to send verification code"
          );
        }
      } else {
        console.error("Clerk signUp error:", err);
        setVerifyError(errors[0]?.message ?? "Failed to send verification code");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode() {
    if (code.length !== 6) return;
    setSubmitting(true);
    setVerifyError(null);

    try {
      if (mode === "signin") {
        if (!signIn) throw new Error("Sign-in not ready");
        const result = await signIn.attemptFirstFactor({
          strategy: "phone_code",
          code,
        });
        if (result.status === "complete") {
          if (result.createdSessionId && setActiveSignIn) {
            await setActiveSignIn({ session: result.createdSessionId });
          }
          setPhoneVerified(true);
          await onSignInSuccess();
          setSubmitting(false);
          return;
        }
        setVerifyError("Verification failed. Please try again.");
      } else {
        if (!signUp) throw new Error("Sign-up not ready");
        const result = await signUp.attemptPhoneNumberVerification({ code });
        const phoneStatus = result.verifications?.phoneNumber?.status;
        if (phoneStatus === "verified" || result.status === "complete") {
          const sessionId = result.createdSessionId;
          const userId = result.createdUserId;
          if (sessionId || userId) {
            onSignUpComplete(sessionId ?? "", userId ?? "");
          }
          // Activate session immediately so Clerk context updates (PostHog, etc.)
          if (sessionId && setActiveSignUp) {
            await setActiveSignUp({ session: sessionId });
          }
          setPhoneVerified(true);
          setSubmitting(false);
          onNext();
          return;
        }
        setVerifyError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setVerifyError(
        clerkError.errors?.[0]?.message ?? "Invalid code. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendCode() {
    setVerifyError(null);
    try {
      if (mode === "signin") {
        await startSignIn(`+1${phone}`);
      } else {
        if (!signUp) return;
        await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      }
    } catch {
      setVerifyError("Failed to resend code. Please try again.");
    }
  }

  function handleNextClick() {
    if (verifying) {
      handleVerifyCode();
    } else {
      handleSendCode();
    }
  }

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-border bg-warm px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-cream disabled:text-ink-3";

  return (
    <div className="px-6 pb-12">
      <div className="max-w-md mx-auto w-full">
        <h1 className="font-serif text-2xl font-medium text-ink">Get started</h1>
        <p className="mt-1.5 text-sm text-ink-2">
          Let's get you set up.
        </p>

        <div className="mt-8 space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={verifying}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={verifying}
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="mt-1.5 flex rounded-lg border border-border bg-warm focus-within:border-gold focus-within:ring-1 focus-within:ring-gold overflow-hidden">
              <div className="relative flex items-center">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={verifying}
                  className="appearance-none bg-cream pl-3 pr-7 py-2.5 text-sm text-ink-2 border-r border-border focus:outline-none cursor-pointer disabled:cursor-default disabled:text-ink-3"
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                </select>
                <svg className="pointer-events-none absolute right-1.5 w-3 h-3 text-ink-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              <span className="flex items-center px-2 text-sm text-ink-3 select-none">
                +1
              </span>
              <input
                id="phone"
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => {
                  if (!verifying) {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(digits);
                  }
                }}
                disabled={verifying}
                placeholder="(555) 000-0000"
                className="flex-1 px-2 py-2.5 text-sm bg-transparent text-ink placeholder:text-ink-3 border-0 focus:outline-none focus:ring-0 disabled:text-ink-3"
              />
            </div>
          </div>

          {/* Verification code (animated) */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              verifying ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="rounded-xl border border-border bg-cream p-4">
                {mode === "signin" && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sage-light px-2.5 py-1 text-xs font-medium text-sage">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Welcome back
                  </div>
                )}
                <p className="text-sm font-medium text-ink">
                  We sent a verification code to your phone.
                </p>
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="mt-3 block w-full rounded-lg border border-border bg-warm px-3.5 py-2.5 text-center text-lg tracking-[0.4em] text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="mt-2 text-xs font-medium text-ink-3 underline underline-offset-2 hover:text-ink-2"
                >
                  Resend code
                </button>
              </div>
            </div>
          </div>

          {verifyError && (
            <p className="text-sm text-rose">{verifyError}</p>
          )}
        </div>

        <div id="clerk-captcha" />

        <button
          onClick={handleNextClick}
          disabled={!canSubmit}
          className="mt-8 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Please wait..." : "Next"}
        </button>
      </div>
    </div>
  );
}
