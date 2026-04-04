"use client";

import { createContext, useContext } from "react";
import type { PromptSection } from "@/types/prompts";

type Community = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
};

type CommunityContextValue = {
  community: Community;
  promptSections: PromptSection[];
  isMember: boolean;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({
  community,
  promptSections,
  isMember,
  children,
}: {
  community: Community;
  promptSections: PromptSection[];
  isMember: boolean;
  children: React.ReactNode;
}) {
  return (
    <CommunityContext.Provider value={{ community, promptSections, isMember }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context.community;
}

export function usePromptSections() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("usePromptSections must be used within a CommunityProvider");
  }
  return context.promptSections;
}

export function useIsMember() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useIsMember must be used within a CommunityProvider");
  }
  return context.isMember;
}
