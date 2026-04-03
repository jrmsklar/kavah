"use client";

import { useEffect, useMemo, useState } from "react";

type Community = { id: string; name: string; slug: string };
type Member = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  joined: string;
};
type SortKey = "first_name" | "last_name" | "joined";
type SortDir = "asc" | "desc";

export default function MembersPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("joined");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Fetch owned communities
  useEffect(() => {
    fetch("/api/communities/owned")
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
        m.last_name.toLowerCase().includes(q)
    );
    result.sort((a, b) => {
      let aVal: string, bVal: string;
      if (sortKey === "joined") {
        aVal = a.joined;
        bVal = b.joined;
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

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return " \u2195";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  if (loading && communities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <p className="text-gray-600">
          No communities yet.{" "}
          <a href="/communities/new" className="text-black underline">
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
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>

        {/* Community picker */}
        <select
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
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
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading members...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-500">
            {members.length === 0
              ? "No members have joined this community yet."
              : "No members match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort("first_name")}
                >
                  First Name{sortIcon("first_name")}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort("last_name")}
                >
                  Last Name{sortIcon("last_name")}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort("joined")}
                >
                  Joined{sortIcon("joined")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-900">
                    {member.first_name}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {member.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
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
