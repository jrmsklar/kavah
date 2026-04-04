"use client";

import { useState } from "react";
import { useSignUp, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { PhoneVerification } from "./phone-verification";

type SignUpResource = NonNullable<ReturnType<typeof useSignUp>["signUp"]>;

export function SignupStep({
  signUp,
  isLoaded,
  isExistingUser,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  phoneVerified,
  setPhoneVerified,
  birthday,
  setBirthday,
  heightInches,
  setHeightInches,
  city,
  setCity,
  onSignUpComplete,
  onNext,
}: {
  signUp: SignUpResource | undefined;
  isLoaded: boolean;
  isExistingUser: boolean;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  phoneVerified: boolean;
  setPhoneVerified: (v: boolean) => void;
  birthday: string;
  setBirthday: (v: string) => void;
  heightInches: number | null;
  setHeightInches: (v: number | null) => void;
  city: string;
  setCity: (v: string) => void;
  onSignUpComplete: (sessionId: string, userId: string) => void;
  onNext: () => void;
}) {
  const clerk = useClerk();
  const pathname = usePathname();

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [phoneAlreadyExists, setPhoneAlreadyExists] = useState(false);
  const [country, setCountry] = useState("US");

  function formatPhoneDisplay(digits: string): string {
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const canSendCode =
    isLoaded && firstName.trim() && lastName.trim() && phone.length >= 10 && !phoneVerified && !verifying;

  async function handleSendCode() {
    if (!signUp || !canSendCode) return;
    setSendingCode(true);
    setVerifyError(null);
    setPhoneAlreadyExists(false);

    try {
      const formattedPhone = `+1${phone}`;
      await signUp.create({
        phoneNumber: formattedPhone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      setVerifying(true);
    } catch (err: unknown) {
      console.error("Clerk signUp error:", err);
      const clerkError = err as { errors?: { code: string; message: string }[] };
      const errors = clerkError.errors ?? [];
      const exists = errors.some(
        (e) => e.code === "form_identifier_exists"
      );
      if (exists) {
        setPhoneAlreadyExists(true);
      } else {
        setVerifyError(errors[0]?.message ?? "Failed to send verification code");
      }
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyCode(code: string) {
    if (!signUp) return;
    setVerifyLoading(true);
    setVerifyError(null);

    try {
      const result = await signUp.attemptPhoneNumberVerification({ code });

      const phoneStatus = result.verifications?.phoneNumber?.status;
      if (phoneStatus === "verified" || result.status === "complete") {
        const sessionId = result.createdSessionId;
        const userId = result.createdUserId;

        if (sessionId || userId) {
          onSignUpComplete(sessionId ?? "", userId ?? "");
        }

        setPhoneVerified(true);
        setVerifying(false);
        setVerifyError(null);
        setVerifyLoading(false);
        return;
      } else {
        setVerifyError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setVerifyError(
        clerkError.errors?.[0]?.message ?? "Invalid code. Please try again."
      );
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResendCode() {
    if (!signUp) return;
    setVerifyError(null);
    try {
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
    } catch {
      setVerifyError("Failed to resend code. Please try again.");
    }
  }

  const canProceed =
    firstName.trim() && lastName.trim() && phoneVerified && birthday && heightInches !== null && city.trim();

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-border bg-warm px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-cream disabled:text-ink-3";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full">
        <h1 className="font-serif text-2xl font-medium text-ink">
          {isExistingUser ? "Confirm your info" : "Tell us about yourself"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-2">
          {isExistingUser
            ? "We found your account. Confirm your details to continue."
            : "We just need a few basics to get you started."}
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
                disabled={isExistingUser}
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
                disabled={isExistingUser}
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="mt-1.5 flex gap-2">
              <div className="flex flex-1 rounded-lg border border-border bg-warm focus-within:border-gold focus-within:ring-1 focus-within:ring-gold overflow-hidden">
                <div className="relative flex items-center">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={phoneVerified}
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
                    if (!phoneVerified) {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(digits);
                    }
                  }}
                  disabled={phoneVerified}
                  placeholder="(555) 000-0000"
                  className="flex-1 px-2 py-2.5 text-sm bg-transparent text-ink placeholder:text-ink-3 border-0 focus:outline-none focus:ring-0 disabled:text-ink-3"
                />
              </div>
              {phoneVerified ? (
                <span className="flex items-center gap-1.5 text-sm text-sage font-medium px-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Verified
                </span>
              ) : (
                <button
                  onClick={handleSendCode}
                  disabled={!canSendCode || sendingCode}
                  className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sendingCode ? "Sending..." : "Verify"}
                </button>
              )}
            </div>
            {verifyError && !verifying && (
              <p className="mt-2 text-sm text-rose">{verifyError}</p>
            )}

            {verifying && (
              <PhoneVerification
                onVerify={handleVerifyCode}
                onResend={handleResendCode}
                error={verifyError}
                loading={verifyLoading}
              />
            )}

            {phoneAlreadyExists && (
              <div className="mt-3 rounded-xl border border-rose-light bg-rose-light/40 p-4">
                <p className="text-sm font-medium text-rose">
                  This phone number is already associated with an account.
                </p>
                <p className="mt-1 text-sm text-ink-2">
                  Sign in to continue, or try a different number.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => clerk.redirectToSignIn({ redirectUrl: pathname })}
                    className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setPhoneAlreadyExists(false);
                      setPhone("");
                    }}
                    className="text-sm font-medium text-ink-2 underline underline-offset-2 hover:text-ink"
                  >
                    Try a different number
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label htmlFor="birthday" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
              Birthday
            </label>
            <input
              id="birthday"
              type="date"
              required
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>

          {/* Height & City row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="height" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
                Height
              </label>
              <select
                id="height"
                required
                value={heightInches ?? ""}
                onChange={(e) => setHeightInches(e.target.value ? Number(e.target.value) : null)}
                className={inputClass}
              >
                <option value="">Select</option>
                {Array.from({ length: 37 }, (_, i) => 48 + i).map((inches) => {
                  const ft = Math.floor(inches / 12);
                  const rem = inches % 12;
                  return (
                    <option key={inches} value={inches}>
                      {ft}&apos;{rem}&quot;
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
                City
              </label>
              <select
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="New York, NY">New York, NY</option>
                <option value="Los Angeles, CA">Los Angeles, CA</option>
                <option value="Miami, FL">Miami, FL</option>
              </select>
            </div>
          </div>
        </div>

        <div id="clerk-captcha" />

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="mt-8 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
