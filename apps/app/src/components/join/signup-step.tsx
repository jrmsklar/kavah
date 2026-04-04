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
    firstName.trim() && lastName.trim() && phoneVerified && birthday && heightInches !== null && city.trim();

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
              <div className="flex flex-1 rounded-md border border-gray-300 shadow-sm focus-within:border-black focus-within:ring-1 focus-within:ring-black overflow-hidden">
                <div className="relative flex items-center">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={phoneVerified}
                    className="appearance-none bg-gray-50 pl-3 pr-7 py-2 text-sm text-gray-700 border-r border-gray-300 focus:outline-none cursor-pointer disabled:cursor-default disabled:text-gray-500"
                  >
                    <option value="US">US</option>
                    <option value="CA">CA</option>
                  </select>
                  <svg className="pointer-events-none absolute right-1.5 w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                <span className="flex items-center px-2 text-sm text-gray-500 select-none">
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
                  className="flex-1 px-2 py-2 text-sm border-0 focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
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

            {verifying && (
              <PhoneVerification
                onVerify={handleVerifyCode}
                onResend={handleResendCode}
                error={verifyError}
                loading={verifyLoading}
              />
            )}

            {phoneAlreadyExists && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-4">
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

          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
              Birthday
            </label>
            <input
              id="birthday"
              type="date"
              required
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
              Height
            </label>
            <select
              id="height"
              required
              value={heightInches ?? ""}
              onChange={(e) => setHeightInches(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="">Select height</option>
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
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <select
              id="city"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="">Select city</option>
              <option value="New York, NY">New York, NY</option>
              <option value="Los Angeles, CA">Los Angeles, CA</option>
              <option value="Miami, FL">Miami, FL</option>
            </select>
          </div>
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
