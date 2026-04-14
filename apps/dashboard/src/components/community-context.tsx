"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Community = { id: string; name: string; slug: string };

type CommunityContextValue = {
  communities: Community[];
  selected: Community | null;
  setSelected: (community: Community) => void;
  loading: boolean;
};

const CommunityContext = createContext<CommunityContextValue>({
  communities: [],
  selected: null,
  setSelected: () => {},
  loading: true,
});

const STORAGE_KEY = "kavah_selected_community_id";

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelectedState] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  function setSelected(community: Community) {
    setSelectedState(community);
    try { localStorage.setItem(STORAGE_KEY, community.id); } catch {}
  }

  useEffect(() => {
    fetch("/api/communities/managed")
      .then((r) => r.json())
      .then((data) => {
        const list: Community[] = data.communities ?? [];
        setCommunities(list);
        if (list.length > 0) {
          let savedId: string | null = null;
          try { savedId = localStorage.getItem(STORAGE_KEY); } catch {}
          const saved = savedId ? list.find((c) => c.id === savedId) : null;
          setSelectedState(saved ?? list[0]);
        }
        setLoading(false);
      });
  }, []);

  return (
    <CommunityContext.Provider value={{ communities, selected, setSelected, loading }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
