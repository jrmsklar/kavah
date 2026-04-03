"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
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
  onSignUpComplete: (sessionId: string, userId: string) => void;
  onNext: () => void;
}) {
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [phoneAlreadyExists, setPhoneAlreadyExists] = useState(false);

  const canSendCode =
    isLoaded && firstName.trim() && lastName.trim() && phone.length >= 10 && !phoneVerified && !verifying;

  async function handleSendCode() {
    if (!signUp || !canSendCode) return;
    setSendingCode(true);
    setVerifyError(null);
    setPhoneAlreadyExists(false);

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`;
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
        // Capture IDs SYNCHRONOUSLY before any re-render can happen
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

  function handleNext() {
    onNext();
  }

  const canProceed =
    firstName.trim() && lastName.trim() && phoneVerified;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900">
          {isExistingUser ? "Confirm your info" : "Tell us about yourself"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isExistingUser
            ? "We found your account. Confirm your details to continue."
            : "We just need a few basics to get you started."}
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isExistingUser}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isExistingUser}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  if (!phoneVerified) setPhone(e.target.value);
                }}
                disabled={phoneVerified}
                placeholder="+1 (555) 000-0000"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
              />
              {phoneVerified ? (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium px-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Verified
                </span>
              ) : (
                <button
                  onClick={handleSendCode}
                  disabled={!canSendCode || sendingCode}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingCode ? "Sending..." : "Verify"}
                </button>
              )}
            </div>
            {verifyError && !verifying && (
              <p className="mt-2 text-sm text-red-600">{verifyError}</p>
            )}
          </div>

          {verifying && (
            <PhoneVerification
              onVerify={handleVerifyCode}
              onResend={handleResendCode}
              error={verifyError}
              loading={verifyLoading}
            />
          )}

          {phoneAlreadyExists && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                This phone number is already associated with an account.
              </p>
              <p className="mt-1 text-sm text-red-600">
                Please sign in with your existing account instead, or use a
                different phone number.
              </p>
              <button
                onClick={() => {
                  setPhoneAlreadyExists(false);
                  setPhone("");
                }}
                className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-900"
              >
                Try a different number
              </button>
            </div>
          )}
        </div>

        <div id="clerk-captcha" />

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="mt-8 w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
