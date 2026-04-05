"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Admin = {
  membershipId: string;
  role: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
};

export default function CommunitySettingsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // Phone input state
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("US");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Removing state
  const [removingId, setRemovingId] = useState<string | null>(null);

  function formatPhoneDisplay(digits: string): string {
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const fetchData = useCallback(async () => {
    // First get community ID from slug
    const commRes = await fetch(`/api/communities/managed`);
    if (!commRes.ok) return;
    const { communities } = await commRes.json();
    const community = communities.find((c: { slug: string }) => c.slug === slug);
    if (!community) return;

    setCommunityId(community.id);
    setCommunityName(community.name);

    // Fetch admins
    const adminsRes = await fetch(`/api/communities/${community.id}/admins`);
    if (adminsRes.ok) {
      const { admins } = await adminsRes.json();
      setAdmins(admins);
    }

    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!communityId || phone.length < 10) return;

    setError("");
    setSuccess("");
    setIsAdding(true);

    try {
      const res = await fetch(`/api/communities/${communityId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+1${phone}` }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setError("Failed to add admin — unexpected server response");
        return;
      }

      if (!res.ok) {
        setError(data.error || `Failed to add admin (${res.status})`);
        return;
      }

      setSuccess(`${data.admin.firstName} ${data.admin.lastName} added as admin.`);
      setPhone("");
      fetchData();
    } catch {
      setError("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveAdmin(membershipId: string) {
    if (!communityId) return;
    setRemovingId(membershipId);

    try {
      const res = await fetch(`/api/communities/${communityId}/admins`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId }),
      });

      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.membershipId !== membershipId));
      }
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        href={`/communities/${slug}`}
        className="text-sm text-gray-500 hover:text-gray-700 transition"
      >
        &larr; Back to {communityName}
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-600">
        Manage admins for {communityName}.
      </p>

      {/* Current admins/owners */}
      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900">Team</h2>
        <p className="mt-1 text-sm text-gray-600">
          Owners and admins who can view members and manage this community.
        </p>

        <div className="mt-4 divide-y">
          {admins.map((admin) => (
            <div key={admin.membershipId} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {admin.firstName[0]}{admin.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {admin.firstName} {admin.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{admin.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  admin.role === "owner"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {admin.role === "owner" ? "Owner" : "Admin"}
                </span>
                {admin.role === "admin" && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.membershipId)}
                    disabled={removingId === admin.membershipId}
                    className="text-xs text-red-600 hover:text-red-700 transition disabled:opacity-50"
                  >
                    {removingId === admin.membershipId ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add admin */}
      <div className="mt-6 rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900">Add an admin</h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter the phone number of someone who has already signed up on Kavah.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          The phone number must be associated with an existing Kavah account.
        </p>

        <form onSubmit={handleAddAdmin} className="mt-4">
          <div className="flex gap-2">
            <div className="flex flex-1 rounded-lg border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black overflow-hidden">
              <div className="relative flex items-center">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="appearance-none bg-gray-50 pl-3 pr-7 py-2.5 text-sm text-gray-600 border-r border-gray-300 focus:outline-none cursor-pointer"
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                </select>
                <svg className="pointer-events-none absolute right-1.5 w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              <span className="flex items-center px-2 text-sm text-gray-400 select-none">
                +1
              </span>
              <input
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(digits);
                }}
                placeholder="(555) 000-0000"
                className="flex-1 px-2 py-2.5 text-sm bg-transparent text-gray-900 placeholder:text-gray-400 border-0 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding || phone.length < 10}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAdding ? "Adding..." : "Add Admin"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="mt-2 text-sm text-green-600">{success}</p>
          )}
        </form>
      </div>
    </div>
  );
}
