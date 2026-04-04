"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useCommunity,
  usePromptSections,
  useIsMember,
  useUserProfile,
} from "@/app/join/[community_slug]/community-context";
import { WelcomeStep } from "./welcome-step";
import { SignupStep } from "./signup-step";
import { BasicsStep } from "./basics-step";
import { VideoStep } from "./video-step";
import { ReviewStep } from "./review-step";
import { StepProgress } from "./step-progress";
import { AlreadyJoinedStep } from "./already-joined-step";

type Step = "landing" | "welcome" | "basics" | "video" | "review" | "complete";

export function JoinFlow() {
  const community = useCommunity();
  const promptSections = usePromptSections();
  const isMember = useIsMember();
  const userProfile = useUserProfile();
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
  const [birthday, setBirthday] = useState("");
  const [heightInches, setHeightInches] = useState<number | null>(null);
  const [city, setCity] = useState("");
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

  // Pre-fill from existing Clerk user + user_profiles
  useEffect(() => {
    if (isExistingUser && user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      const rawPhone = user.primaryPhoneNumber?.phoneNumber ?? "";
      setPhone(rawPhone.replace(/^\+1/, ""));
      setPhoneVerified(true);

      if (userProfile) {
        if (userProfile.birthday) setBirthday(userProfile.birthday);
        if (userProfile.height_inches) setHeightInches(userProfile.height_inches);
        if (userProfile.city) setCity(userProfile.city);
      }
    }
  }, [isExistingUser, user, userProfile]);

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
      setStep("review");
    }
  }

  // Determine what happens after basics
  function afterBasics() {
    if (hasVideos) {
      setVideoPromptIndex(0);
      setStep("video");
    } else {
      setStep("review");
    }
  }

  // Handle video navigation
  function handleVideoNext() {
    if (videoPromptIndex < videoPrompts.length - 1) {
      setVideoPromptIndex((i) => i + 1);
    } else {
      setStep("review");
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
          birthday,
          heightInches,
          city: city.trim(),
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

      setStep("complete");
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
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
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
          birthday={birthday}
          setBirthday={setBirthday}
          heightInches={heightInches}
          setHeightInches={setHeightInches}
          city={city}
          setCity={setCity}
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

  // STEP: Review (profile summary before submission)
  if (step === "review") {
    return (
      <ReviewStep
        firstName={firstName}
        lastName={lastName}
        birthday={birthday}
        heightInches={heightInches}
        city={city}
        basicsSections={basicsSections}
        responses={responses}
        videoPrompts={videoPrompts}
        onSubmit={handleComplete}
        submitting={completing}
        submitError={completeError}
        onBack={() => {
          if (hasVideos) {
            setVideoPromptIndex(videoPrompts.length - 1);
            setStep("video");
          } else if (hasBasics) {
            setStep("basics");
          } else {
            setStep("welcome");
          }
        }}
      />
    );
  }

  // STEP: Complete (success confirmation)
  if (step === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full rounded-2xl border border-border bg-warm p-10 text-center">
          {community.icon_url && (
            <img
              src={community.icon_url}
              alt={community.name}
              className="w-14 h-14 mx-auto mb-5 rounded-xl"
            />
          )}

          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-sage-light flex items-center justify-center">
            <svg className="w-7 h-7 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="font-serif text-3xl font-medium text-ink">
            You&apos;re in the pool.
          </h1>

          <p className="mt-4 text-ink-2 leading-relaxed">
            Your profile has been received. The {community.name} matchmaker will
            review your responses personally and reach out when there&apos;s a
            thoughtful match.
          </p>

          <p className="mt-4 text-ink-3 italic leading-relaxed">
            No algorithm. No swiping. Just a real introduction when the time is
            right.
          </p>

          <div className="mt-6">
            <p className="font-serif text-2xl text-gold">&#1489;&#1492;&#1510;&#1500;&#1495;&#1492;</p>
            <p className="mt-1 text-sm text-ink-3 italic">
              B&apos;hatzlacha — good luck
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-8 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return null;
}
