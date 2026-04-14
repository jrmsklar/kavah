"use client";

import { useEffect, useState } from "react";
import { useCommunity } from "@/components/community-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DayData = { date: string; label: string; count: number };

export default function AnalyticsPage() {
  const { selected: selectedCommunity, loading: communitiesLoading } = useCommunity();
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCommunity) return;
    setLoading(true);
    fetch(`/api/analytics/memberships?community_id=${selectedCommunity.id}`)
      .then((r) => r.json())
      .then((data) => {
        setDays(data.days ?? []);
        setLoading(false);
      });
  }, [selectedCommunity]);

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

  const totalNew = days.reduce((sum, d) => sum + d.count, 0);

  // Format labels for the chart — "Mon", "Tue", etc. for the axis, full label for tooltip
  const chartData = days.map((d) => {
    const date = new Date(d.date + "T12:00:00");
    const short = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      name: short,
      fullLabel: d.label,
      count: d.count,
    };
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium text-ink">Analytics</h1>
      </div>

      {/* New memberships chart */}
      <div className="rounded-xl border border-border bg-warm p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">New Memberships</h2>
            <p className="mt-0.5 text-xs text-ink-3">Last 7 days</p>
          </div>
          {!loading && (
            <p className="text-2xl font-semibold text-ink">{totalNew}</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-ink-3 text-sm py-12">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9a948d" }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9a948d" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-warm px-3 py-2 shadow-md">
                      <p className="text-xs text-ink-3">{data.fullLabel}</p>
                      <p className="text-sm font-semibold text-ink">
                        {data.count} {data.count === 1 ? "member" : "members"}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                fill="#c5a44e"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
