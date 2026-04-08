"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Community = { id: string; name: string; slug: string };
type Member = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  joined: string;
  birthday: string | null;
  height_inches: number | null;
  city: string | null;
};
type SortKey = "first_name" | "last_name" | "joined" | "birthday" | "height_inches" | "city";
type SortDir = "asc" | "desc";

function calculateAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

export default function MembersPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("joined");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Fetch owned communities
  useEffect(() => {
    fetch("/api/communities/managed")
      .then((r) => r.json())
      .then((data) => {
        setCommunities(data.communities ?? []);
        if (data.communities?.length > 0) {
          setSelectedCommunityId(data.communities[0].id);
        }
        setLoading(false);
      });
  }, []);

  // Fetch members when community changes
  useEffect(() => {
    if (!selectedCommunityId) return;
    setLoading(true);
    fetch(`/api/members?community_id=${selectedCommunityId}`)
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.members ?? []);
        setLoading(false);
      });
  }, [selectedCommunityId]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = members.filter(
      (m) =>
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        (m.city && m.city.toLowerCase().includes(q))
    );
    result.sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      if (sortKey === "joined") {
        aVal = a.joined;
        bVal = b.joined;
      } else if (sortKey === "height_inches") {
        aVal = a.height_inches ?? 0;
        bVal = b.height_inches ?? 0;
      } else if (sortKey === "birthday") {
        aVal = a.birthday ?? "";
        bVal = b.birthday ?? "";
      } else if (sortKey === "city") {
        aVal = (a.city ?? "").toLowerCase();
        bVal = (b.city ?? "").toLowerCase();
      } else {
        aVal = a[sortKey].toLowerCase();
        bVal = b[sortKey].toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [members, search, sortKey, sortDir]);

  const SortHeader = ({ label, sortKey: key }: { label: string; sortKey: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-ink-3 uppercase tracking-wide cursor-pointer select-none hover:text-ink-2 transition"
      onClick={() => handleSort(key)}
    >
      {label}
      <span className="ml-1 text-ink-3/50">
        {sortKey === key ? (sortDir === "asc" ? "\u2191" : "\u2193") : "\u2195"}
      </span>
    </th>
  );

  if (loading && communities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <p className="text-ink-2">
          No communities yet.{" "}
          <a href="/communities/new" className="text-gold font-semibold hover:underline">
            Create one
          </a>{" "}
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-medium text-ink">Members</h1>

        {/* Community picker */}
        <select
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
          className="rounded-lg border border-border bg-warm px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        >
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-border bg-warm px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-2 text-ink-3 text-sm">
          <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          Loading members...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-ink-3">
            {members.length === 0
              ? "No members have joined this community yet."
              : "No members match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-warm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-cream">
              <tr>
                <SortHeader label="First Name" sortKey="first_name" />
                <SortHeader label="Last Name" sortKey="last_name" />
                <SortHeader label="City" sortKey="city" />
                <SortHeader label="Age" sortKey="birthday" />
                <SortHeader label="Height" sortKey="height_inches" />
                <SortHeader label="Joined" sortKey="joined" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => router.push(`/members/${member.id}?community_id=${selectedCommunityId}`)}
                  className="hover:bg-cream/50 transition cursor-pointer"
                >
                  <td className="px-4 py-3 text-ink font-medium">
                    {member.first_name}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {member.last_name}
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    {member.city || <span className="text-ink-3/50">&mdash;</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    {member.birthday ? (
                      calculateAge(member.birthday)
                    ) : (
                      <span className="text-ink-3/50">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    {member.height_inches ? (
                      formatHeight(member.height_inches)
                    ) : (
                      <span className="text-ink-3/50">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-3">
                    {new Date(member.joined).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
