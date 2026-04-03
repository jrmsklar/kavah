"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

type MemberDetail = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birthday: string | null;
  avatar_url: string | null;
  joined: string;
};

type PromptResponse = {
  id: string;
  label: string;
  type: string;
  response: string | string[] | null;
};

type PromptSectionWithResponses = {
  id: string;
  title: string;
  step: string;
  prompts: PromptResponse[];
};

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

export default function MemberDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const memberId = params.memberId as string;
  const communityId = searchParams.get("community_id");

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [promptSections, setPromptSections] = useState<
    PromptSectionWithResponses[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!memberId || !communityId) return;

    fetch(`/api/members/${memberId}?community_id=${communityId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load member");
        return r.json();
      })
      .then((data) => {
        setMember(data.member);
        setPromptSections(data.promptSections ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [memberId, communityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || "Member not found"}</p>
        <Link
          href="/members"
          className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to members
        </Link>
      </div>
    );
  }

  const age = member.birthday ? calculateAge(member.birthday) : null;

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/members"
        className="text-sm text-gray-500 hover:text-gray-700 transition"
      >
        &larr; Back to members
      </Link>

      {/* Member info */}
      <div className="mt-6">
        <div className="flex items-center gap-4">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={`${member.first_name} ${member.last_name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-500">
              {member.first_name[0]}
              {member.last_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {member.first_name} {member.last_name}
            </h1>
            <p className="text-sm text-gray-500">{member.phone}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Joined
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {new Date(member.joined).toLocaleDateString()}
            </p>
          </div>
          {member.birthday && (
            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Birthday
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {new Date(member.birthday).toLocaleDateString()}
              </p>
            </div>
          )}
          {age !== null && (
            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Age
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">{age}</p>
            </div>
          )}
        </div>
      </div>

      {/* Responses */}
      {promptSections.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Responses
          </h2>
          <div className="space-y-6">
            {promptSections.map((section) => (
              <div key={section.id} className="rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {section.step}
                  </span>
                </div>

                <div className="space-y-4">
                  {section.prompts.map((prompt) => (
                    <div key={prompt.id}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {prompt.label}
                      </p>
                      <div className="mt-1">
                        {prompt.response === null ? (
                          <p className="text-sm text-gray-400 italic">
                            No response
                          </p>
                        ) : Array.isArray(prompt.response) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {prompt.response.map((val, i) => (
                              <span
                                key={i}
                                className="rounded-full border bg-gray-50 px-2.5 py-0.5 text-sm text-gray-700"
                              >
                                {val}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900">
                            {prompt.response}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
