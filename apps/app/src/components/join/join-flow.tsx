"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useCommunity,
  usePromptSections,
  useIsMember,
} from "@/app/join/[community_slug]/community-context";
import { WelcomeStep } from "./welcome-step";
import { SignupStep } from "./signup-step";
import { BasicsStep } from "./basics-step";
import { VideoStep } from "./video-step";
import { StepProgress } from "./step-progress";
import { AlreadyJoinedStep } from "./already-joined-step";

type Step = "landing" | "welcome" | "basics" | "video" | "complete";

export function JoinFlow() {
  const community = useCommunity();
  const promptSections = usePromptSections();
  const isMember = useIsMember();
  const router = useRouter();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();

  const wasSignedInRef = useRef(false);
  useEffect(() => {
    if (userLoaded) {
      wasSignedInRef.current = isSignedIn ?? false;
    }
  }, [userLoaded]);

  const isExistingUser = wasSignedInRef.current && !!user;

  const [step, setStep] = useState<Step>("landing");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [videoPromptIndex, setVideoPromptIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");

  const clerkSessionIdRef = useRef<string | null>(null);
  const clerkUserIdRef = useRef<string | null>(null);

  // Split sections by step type
  const basicsSections = useMemo(
    () => promptSections.filter((s) => s.step === "basics"),
    [promptSections]
  );

  const videoPrompts = useMemo(
    () =>
      promptSections
        .filter((s) => s.step === "videos")
        .flatMap((s) => s.prompts),
    [promptSections]
  );

  const hasBasics = basicsSections.length > 0;
  const hasVideos = videoPrompts.length > 0;

  // Pre-fill from existing Clerk user
  useEffect(() => {
    if (isExistingUser && user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      const rawPhone = user.primaryPhoneNumber?.phoneNumber ?? "";
      setPhone(rawPhone.replace(/^\+1/, ""));
      setPhoneVerified(true);
    }
  }, [isExistingUser, user]);

  function handleSignUpComplete(sessionId: string, userId: string) {
    clerkSessionIdRef.current = sessionId;
    clerkUserIdRef.current = userId;
  }

  function handleUpdateResponse(promptId: string, value: string) {
    setResponses((prev) => ({ ...prev, [promptId]: value }));
  }

  // Determine what happens after welcome (signup) step
  function afterWelcome() {
    if (hasBasics) {
      setStep("basics");
    } else if (hasVideos) {
      setVideoPromptIndex(0);
      setStep("video");
    } else {
      setStep("complete");
    }
  }

  // Determine what happens after basics
  function afterBasics() {
    if (hasVideos) {
      setVideoPromptIndex(0);
      setStep("video");
    } else {
      setStep("complete");
    }
  }

  // Handle video navigation
  function handleVideoNext() {
    if (videoPromptIndex < videoPrompts.length - 1) {
      setVideoPromptIndex((i) => i + 1);
    } else {
      setStep("complete");
    }
  }

  function handleVideoBack() {
    if (videoPromptIndex > 0) {
      setVideoPromptIndex((i) => i - 1);
    } else if (hasBasics) {
      setStep("basics");
    } else {
      setStep("welcome");
    }
  }

  async function handleComplete() {
    setCompleting(true);
    setCompleteError("");

    try {
      let clerkUserId: string | null = null;

      if (isExistingUser && user) {
        clerkUserId = user.id;
      } else {
        clerkUserId = clerkUserIdRef.current ?? signUp?.createdUserId ?? null;
      }

      if (!clerkUserId) {
        throw new Error("Sign-up did not complete. Please start over.");
      }

      const res = await fetch("/api/join/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: community.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.startsWith("+") ? phone : `+1${phone}`,
          clerkUserId,
          responses,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete sign-up");
      }

      // Activate session if new user
      const sessionId = clerkSessionIdRef.current ?? signUp?.createdSessionId;
      if (sessionId && setActive && !isExistingUser) {
        await setActive({ session: sessionId });
      }

      router.push("/");
    } catch (err) {
      setCompleteError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setCompleting(false);
    }
  }

  if (!userLoaded || !signUpLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Already a member — show message instead of join flow
  if (step === "landing" && isMember) {
    return <AlreadyJoinedStep />;
  }

  // STEP: Landing (community info + Join CTA)
  if (step === "landing") {
    return <WelcomeStep onNext={() => setStep("welcome")} />;
  }

  // STEP: Welcome (signup — name + phone verification)
  if (step === "welcome") {
    return (
      <div>
        <StepProgress currentStep={1} />
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
          onNext={afterWelcome}
        />
      </div>
    );
  }

  // STEP: Basics
  if (step === "basics") {
    return (
      <BasicsStep
        sections={basicsSections}
        responses={responses}
        onUpdateResponse={handleUpdateResponse}
        onNext={afterBasics}
      />
    );
  }

  // STEP: Video (one prompt at a time)
  if (step === "video" && videoPrompts.length > 0) {
    const currentVideoPrompt = videoPrompts[videoPromptIndex];
    const resolvedClerkUserId =
      isExistingUser && user
        ? user.id
        : clerkUserIdRef.current ?? signUp?.createdUserId ?? null;

    return (
      <VideoStep
        prompt={currentVideoPrompt}
        currentIndex={videoPromptIndex}
        totalCount={videoPrompts.length}
        communityId={community.id}
        clerkUserId={resolvedClerkUserId}
        existingResponse={responses[currentVideoPrompt.id] ?? null}
        onRecorded={handleUpdateResponse}
        onNext={handleVideoNext}
        onBack={handleVideoBack}
      />
    );
  }

  // STEP: Complete
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            You&apos;re all set!
          </h1>
          <p className="mt-2 text-gray-600">
            Complete your registration to join {community.name}.
          </p>

          {completeError && (
            <p className="mt-4 text-sm text-red-600">{completeError}</p>
          )}

          <button
            onClick={handleComplete}
            disabled={completing}
            className="mt-8 w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing ? "Completing..." : "Complete"}
          </button>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return null;
}
