"use client";

import { useEffect, useState, useRef } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCommunity } from "@/app/join/[community_slug]/community-context";
import { WelcomeStep } from "./welcome-step";
import { SignupStep } from "./signup-step";
import { PromptsStep } from "./prompts-step";

type Step = "welcome" | "signup" | "prompts";

export function JoinFlow() {
  const community = useCommunity();
  const router = useRouter();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();

  // Track whether user was signed in BEFORE starting the join flow
  const wasSignedInRef = useRef(false);
  useEffect(() => {
    if (userLoaded) {
      wasSignedInRef.current = isSignedIn ?? false;
    }
  }, [userLoaded]); // Only run once on initial load

  const isExistingUser = wasSignedInRef.current && !!user;

  const [step, setStep] = useState<Step>("welcome");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Store Clerk IDs from sign-up completion (captured during phone verification)
  const clerkSessionIdRef = useRef<string | null>(null);
  const clerkUserIdRef = useRef<string | null>(null);

  // Pre-fill from existing Clerk user
  useEffect(() => {
    if (isExistingUser && user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.primaryPhoneNumber?.phoneNumber ?? "");
      setPhoneVerified(true);
    }
  }, [isExistingUser, user]);

  function handleSignUpComplete(sessionId: string, userId: string) {
    clerkSessionIdRef.current = sessionId;
    clerkUserIdRef.current = userId;
  }

  async function handleComplete() {
    let clerkUserId: string | null = null;

    if (isExistingUser && user) {
      clerkUserId = user.id;
    } else {
      clerkUserId = clerkUserIdRef.current ?? signUp?.createdUserId ?? null;
    }

    if (!clerkUserId) {
      throw new Error("Sign-up did not complete. Please start over.");
    }

    // Create user + membership in Supabase
    const res = await fetch("/api/join/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communityId: community.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        clerkUserId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to complete sign-up");
    }

    // Activate the Clerk session if not already active
    const sessionId = clerkSessionIdRef.current ?? signUp?.createdSessionId;
    if (sessionId && setActive) {
      await setActive({ session: sessionId });
    }

    router.push("/");
  }

  if (!userLoaded || !signUpLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (step === "signup") {
    return (
      <SignupStep
        signUp={signUp ?? undefined}
        isLoaded={signUpLoaded}
        isExistingUser={isExistingUser}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        phone={phone}
        setPhone={setPhone}
        phoneVerified={phoneVerified}
        setPhoneVerified={setPhoneVerified}
        onSignUpComplete={handleSignUpComplete}
        onNext={() => setStep("prompts")}
      />
    );
  }

  if (step === "prompts") {
    return <PromptsStep onComplete={handleComplete} />;
  }

  return <WelcomeStep onNext={() => setStep("signup")} />;
}
