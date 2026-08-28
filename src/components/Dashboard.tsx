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
import { Card, ScoreRing, SectionLabel, ProgressBar } from "./ui";
import {
  student,
  readinessTrend,
  skillCoverage,
  funnel,
  gapAnalysis,
} from "../data";
import { StatusBadge } from "./ui";
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
  return (
    <div className="flex flex-col gap-6">
      {/* Hero readiness + trend */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="flex items-center gap-6 p-6">
          <ScoreRing value={student.readiness} />
          <div className="min-w-0">
            <SectionLabel>Readiness score</SectionLabel>
            <h2 className="mt-1 font-display text-lg font-bold leading-tight text-ink">
              You&rsquo;re on track for {student.target}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              +7 this month. Close your System Design gap to reach the 85+ range
              top companies shortlist.
            </p>
            <button
              onClick={() => onNavigate("roadmap")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              View roadmap
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>Readiness trend</SectionLabel>
              <p className="mt-1 text-sm text-muted">Last 6 months</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2.5 py-1 font-mono text-xs font-semibold text-emerald">
              <TrendingUp className="h-3.5 w-3.5" /> +37 pts
            </span>
          </div>
          <div className="mt-4 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readinessTrend} margin={{ left: -20, right: 8, top: 6 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e7c66" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#0e7c66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eeece7" vertical={false} />
                <XAxis
                  dataKey="month"
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
          </div>
        </Card>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Stat icon={Target} label="Skill match" value="82%" delta="6%" />
        <Stat icon={Flame} label="Day streak" value="24" delta="4" />
        <Stat icon={TrendingUp} label="Applications" value="24" delta="9" />
      </div>

      {/* Skill coverage + funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionLabel>Skill coverage</SectionLabel>
          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillCoverage} layout="vertical" margin={{ left: 24, right: 16 }}>
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
                <Bar dataKey="have" radius={[0, 6, 6, 0]} barSize={16}>
                  {skillCoverage.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.have >= 75 ? "#0e7c66" : d.have >= 55 ? "#c98a1a" : "#c0455b"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Application funnel</SectionLabel>
          <div className="mt-6 flex flex-col gap-4">
            {funnel.map((f) => (
              <div key={f.stage}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{f.stage}</span>
                  <span className="font-mono font-semibold tabular text-muted">{f.value}</span>
                </div>
                <ProgressBar value={(f.value / funnel[0].value) * 100} />
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">
            Conversion applied → offer:{" "}
            <span className="font-mono font-semibold text-ink">8.3%</span> — above
            the 6% cohort median.
          </p>
        </Card>
      </div>

      {/* Gap snapshot */}
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
          {gapAnalysis
            .filter((g) => g.status !== "strong")
            .slice(0, 3)
            .map((g) => (
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
    </div>
  );
}
