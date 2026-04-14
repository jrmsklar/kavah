"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCommunity } from "@/components/community-context";

type Member = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  joined: string;
  profile_status: string;
  birthday: string | null;
  height_inches: number | null;
  city: string | null;
};
type SortKey = "first_name" | "last_name" | "joined" | "profile_status" | "birthday" | "height_inches" | "city";
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
  const { selected: selectedCommunity, loading: communitiesLoading } = useCommunity();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("joined");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Fetch members when selected community changes
  useEffect(() => {
    if (!selectedCommunity) return;
    setLoading(true);
    fetch(`/api/members?community_id=${selectedCommunity.id}`)
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.members ?? []);
        setLoading(false);
      });
  }, [selectedCommunity]);

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
      } else if (sortKey === "profile_status") {
        aVal = a.profile_status;
        bVal = b.profile_status;
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

  if (communitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedCommunity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
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

  const totalMembers = members.length;
  const completeProfiles = members.filter((m) => m.profile_status === "complete").length;
  const incompleteProfiles = totalMembers - completeProfiles;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium text-ink">Members</h1>
      </div>

      {/* Summary stats */}
      {!loading && members.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-warm p-4">
            <p className="text-xs text-ink-3 uppercase tracking-wide font-semibold">Total Members</p>
            <p className="mt-1.5 text-2xl font-semibold text-ink">{totalMembers}</p>
          </div>
          <div className="rounded-xl border border-border bg-warm p-4">
            <p className="text-xs text-ink-3 uppercase tracking-wide font-semibold">Complete Profiles</p>
            <p className="mt-1.5 text-2xl font-semibold text-ink">{completeProfiles}</p>
          </div>
          <div className="rounded-xl border border-border bg-warm p-4">
            <p className="text-xs text-ink-3 uppercase tracking-wide font-semibold">Incomplete Profiles</p>
            <p className="mt-1.5 text-2xl font-semibold text-ink">{incompleteProfiles}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm rounded-lg border border-border bg-warm px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Table / Cards */}
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
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-border bg-warm">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-cream">
                <tr>
                  <SortHeader label="First Name" sortKey="first_name" />
                  <SortHeader label="Last Name" sortKey="last_name" />
                  <SortHeader label="City" sortKey="city" />
                  <SortHeader label="Age" sortKey="birthday" />
                  <SortHeader label="Height" sortKey="height_inches" />
                  <SortHeader label="Joined" sortKey="joined" />
                  <SortHeader label="Profile" sortKey="profile_status" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => router.push(`/members/${member.id}?community_id=${selectedCommunity.id}`)}
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
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.profile_status === "complete"
                            ? "bg-sage-light text-sage"
                            : "bg-ink/5 text-ink-3"
                        }`}
                      >
                        {member.profile_status === "complete" ? "Complete" : "Incomplete"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((member) => (
              <div
                key={member.id}
                onClick={() => router.push(`/members/${member.id}?community_id=${selectedCommunity.id}`)}
                className="rounded-xl border border-border bg-warm p-4 cursor-pointer active:bg-cream transition"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">
                    {member.first_name} {member.last_name}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      member.profile_status === "complete"
                        ? "bg-sage-light text-sage"
                        : "bg-ink/5 text-ink-3"
                    }`}
                  >
                    {member.profile_status === "complete" ? "Complete" : "Incomplete"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                  {member.city && <span>{member.city}</span>}
                  {member.birthday && <span>Age {calculateAge(member.birthday)}</span>}
                  {member.height_inches && <span>{formatHeight(member.height_inches)}</span>}
                  <span>Joined {new Date(member.joined).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
