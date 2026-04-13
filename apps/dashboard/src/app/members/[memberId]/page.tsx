"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

type MemberDetail = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birthday: string | null;
  avatar_url: string | null;
  joined: string;
  profile_status: string;
  height_inches: number | null;
  city: string | null;
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

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export default function MemberDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const memberId = params.memberId as string;
  const communityId = searchParams.get("community_id");

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [promptSections, setPromptSections] = useState<PromptSectionWithResponses[]>([]);
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
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-rose font-medium">{error || "Member not found"}</p>
        <Link
          href="/members"
          className="mt-4 inline-block text-sm text-ink-3 hover:text-ink-2 transition"
        >
          &larr; Back to members
        </Link>
      </div>
    );
  }

  const age = member.birthday ? calculateAge(member.birthday) : null;

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <Link
        href="/members"
        className="text-sm text-ink-3 hover:text-ink-2 transition"
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
            <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center text-xl font-semibold text-gold">
              {member.first_name[0]}
              {member.last_name[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-medium text-ink">
                {member.first_name} {member.last_name}
              </h1>
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
            <p className="text-sm text-ink-3">{formatPhone(member.phone)}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-warm p-4">
            <p className="text-xs text-ink-3 uppercase tracking-wide font-semibold">
              Joined
            </p>
            <p className="mt-1.5 text-sm font-medium text-ink">
              {new Date(member.joined).toLocaleDateString()}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-warm p-4">
            <p className="text-xs text-ink-3 uppercase tracking-wide font-semibold">
              Birthday
            </p>
            <p className="mt-1.5 text-sm font-medium text-ink">
              {member.birthday ? (
                <>
                  {new Date(member.birthday).toLocaleDateString()}
                  {age !== null && (
                    <span className="text-ink-3 font-normal ml-1">({age})</span>
                  )}
                </>
              ) : (
                <span className="text-ink-3/50 font-normal">&mdash;</span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-warm p-4">
            <p className="text-xs text-ink-3 uppercase tracking-wide font-semibold">
              Height
            </p>
            <p className="mt-1.5 text-sm font-medium text-ink">
              {member.height_inches ? (
                formatHeight(member.height_inches)
              ) : (
                <span className="text-ink-3/50 font-normal">&mdash;</span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-warm p-4">
            <p className="text-xs text-ink-3 uppercase tracking-wide font-semibold">
              City
            </p>
            <p className="mt-1.5 text-sm font-medium text-ink">
              {member.city || (
                <span className="text-ink-3/50 font-normal">&mdash;</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Responses */}
      {promptSections.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg font-medium text-ink mb-4">
            Responses
          </h2>
          <div className="space-y-4">
            {promptSections.map((section) => (
              <div key={section.id} className="rounded-xl border border-border bg-warm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-ink">
                    {section.title}
                  </h3>
                  <span className="rounded-full bg-gold-pale px-2 py-0.5 text-xs text-gold font-medium">
                    {section.step}
                  </span>
                </div>

                <div className="space-y-4">
                  {section.prompts.map((prompt) => (
                    <div key={prompt.id}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                        {prompt.label}
                      </p>
                      <div className="mt-1">
                        {prompt.response === null ? (
                          <p className="text-sm text-ink-3/50 italic">
                            No response
                          </p>
                        ) : Array.isArray(prompt.response) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {prompt.response.map((val, i) => (
                              <span
                                key={i}
                                className="rounded-full border border-border-subtle bg-cream px-2.5 py-0.5 text-sm text-ink-2"
                              >
                                {val}
                              </span>
                            ))}
                          </div>
                        ) : prompt.type === "video" ||
                          (typeof prompt.response === "string" &&
                            prompt.response.includes("video-responses")) ? (
                          <video
                            src={prompt.response}
                            controls
                            playsInline
                            className="mt-2 w-full max-w-lg rounded-xl"
                          />
                        ) : (
                          <p className="text-sm text-ink">
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
