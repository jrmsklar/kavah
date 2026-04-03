"use client";

import { createContext, useContext } from "react";

type Community = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
};

const CommunityContext = createContext<Community | null>(null);

export function CommunityProvider({
  community,
  children,
}: {
  community: Community;
  children: React.ReactNode;
}) {
  return (
    <CommunityContext.Provider value={community}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
}
