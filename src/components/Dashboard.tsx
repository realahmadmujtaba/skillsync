import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, Target, Flame, ArrowUpRight } from "lucide-react";
import { Card, ScoreRing, SectionLabel, ProgressBar, StatusBadge } from "./ui";
import { api, type ApiDashboard } from "../api";
import type { ViewKey } from "./Sidebar";

function Stat({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <Icon className="h-4 w-4 text-muted" />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-3xl font-extrabold tabular text-ink">{value}</span>
        <span className="mb-1 inline-flex items-center gap-0.5 font-mono text-xs font-semibold text-emerald">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {delta}
        </span>
      </div>
    </Card>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const [data, setData] = useState<ApiDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .dashboard()
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        Couldn&rsquo;t load your dashboard: {error}
      </Card>
    );
  }

  if (!data) {
    return <Card className="p-8 text-center text-sm text-muted">Loading dashboard…</Card>;
  }

  const noAnalysisYet = data.skill_coverage.length === 0;
  const applied = data.funnel[0]?.value ?? 0;
  const offers = data.funnel[data.funnel.length - 1]?.value ?? 0;
  const conversion = applied > 0 ? ((offers / applied) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-6">
      {/* Hero readiness + trend */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="flex items-center gap-6 p-6">
          <ScoreRing value={data.readiness} />
          <div className="min-w-0">
            <SectionLabel>Readiness score</SectionLabel>
            <h2 className="mt-1 font-display text-lg font-bold leading-tight text-ink">
              {noAnalysisYet
                ? `Analyze your resume for ${data.target_role}`
                : `You're on track for ${data.target_role}`}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {noAnalysisYet
                ? "Upload a resume in Resume Analysis to compute your real readiness score."
                : `${data.readiness_delta >= 0 ? "+" : ""}${data.readiness_delta} since your first analysis.`}
            </p>
            <button
              onClick={() => onNavigate(noAnalysisYet ? "resume" : "roadmap")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {noAnalysisYet ? "Analyze resume" : "View roadmap"}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>Readiness trend</SectionLabel>
              <p className="mt-1 text-sm text-muted">Since you started</p>
            </div>
            {data.readiness_trend.length >= 2 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2.5 py-1 font-mono text-xs font-semibold text-emerald">
                <TrendingUp className="h-3.5 w-3.5" /> {data.readiness_delta >= 0 ? "+" : ""}
                {data.readiness_delta} pts
              </span>
            )}
          </div>
          <div className="mt-4 h-[200px] w-full">
            {data.readiness_trend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No history yet — analyze a resume to start tracking.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.readiness_trend} margin={{ left: -20, right: 8, top: 6 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0e7c66" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0e7c66" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eeece7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6c6a72", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6c6a72", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#0e7c66", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e7e5df",
                      fontSize: 13,
                      fontFamily: "Inter",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#0e7c66"
                    strokeWidth={2.5}
                    fill="url(#grad)"
                    dot={{ r: 3, fill: "#0e7c66" }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Stat icon={Target} label="Skill match" value={`${data.readiness}%`} delta={`${data.readiness_delta}`} />
        <Stat icon={Flame} label="Skills tracked" value={`${data.skill_coverage.length}`} delta="" />
        <Stat icon={TrendingUp} label="Applications" value={`${applied}`} delta="" />
      </div>

      {/* Skill coverage + funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionLabel>Skill coverage</SectionLabel>
          <div className="mt-4 h-[240px] w-full">
            {data.skill_coverage.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Analyze a resume to see your skill coverage.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.skill_coverage}
                  layout="vertical"
                  margin={{ left: 24, right: 16 }}
                >
                  <CartesianGrid stroke="#eeece7" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    tickLine={false}
                    axisLine={false}
                    width={104}
                    tick={{ fill: "#17171c", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f0eee9" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e7e5df",
                      fontSize: 13,
                      fontFamily: "Inter",
                    }}
                  />
                  <Bar dataKey="coverage" radius={[0, 6, 6, 0]} barSize={16}>
                    {data.skill_coverage.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.coverage >= 75 ? "#0e7c66" : d.coverage >= 55 ? "#c98a1a" : "#c0455b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Application funnel</SectionLabel>
          <div className="mt-6 flex flex-col gap-4">
            {data.funnel.map((f) => (
              <div key={f.stage}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{f.stage}</span>
                  <span className="font-mono font-semibold tabular text-muted">{f.value}</span>
                </div>
                <ProgressBar value={applied > 0 ? (f.value / applied) * 100 : 0} />
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">
            Conversion applied → offer:{" "}
            <span className="font-mono font-semibold text-ink">{conversion}%</span>
          </p>
        </Card>
      </div>

      {/* Gap snapshot */}
      {data.top_gaps.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <SectionLabel>Top gaps to close</SectionLabel>
            <button
              onClick={() => onNavigate("resume")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald hover:underline"
            >
              Full analysis <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {data.top_gaps.map((g) => (
              <div key={g.skill} className="rounded-xl border border-line bg-paper/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{g.skill}</span>
                  <StatusBadge status={g.status} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{g.note}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
