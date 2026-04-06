"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key || !host) return;

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      // Session replay — only in production
      disable_session_recording: process.env.NODE_ENV !== "production",
    });
  }, []);

  return null;
}

function PostHogIdentify() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!posthog.__loaded) return;

    if (isSignedIn && user) {
      posthog.identify(user.id, {
        phone: user.primaryPhoneNumber?.phoneNumber,
        first_name: user.firstName,
        last_name: user.lastName,
      });
    }
  }, [isSignedIn, user]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  // Don't render anything PostHog-related locally
  if (!key) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
