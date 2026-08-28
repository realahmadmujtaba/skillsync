import { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { UploadCloud, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { Card, SectionLabel, StatusBadge, MatchPill } from "./ui";
import { gapAnalysis, skillCoverage, student } from "../data";

export default function ResumeAnalysis() {
  const [analyzed, setAnalyzed] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Upload / resume card */}
        <Card className="p-6">
          <SectionLabel>Source resume</SectionLabel>
          <div className="mt-4 flex items-center gap-4 rounded-xl border border-line bg-paper/60 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-soft text-emerald">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">
                Aarav_Menon_Resume_v4.pdf
              </div>
              <div className="text-xs text-muted">Parsed · 2 pages · updated 3 days ago</div>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald">
              <CheckCircle2 className="h-4 w-4" /> Parsed
            </span>
          </div>

          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper/40 px-6 py-8 text-center transition-colors hover:border-emerald hover:bg-emerald-soft/40">
            <UploadCloud className="h-7 w-7 text-muted" />
            <span className="mt-2 text-sm font-semibold text-ink">
              Drop a new resume or click to upload
            </span>
            <span className="mt-0.5 text-xs text-muted">PDF or DOCX · up to 5 MB</span>
            <input type="file" className="hidden" onChange={() => setAnalyzed(true)} />
          </label>
        </Card>

        {/* Match summary */}
        <Card className="flex flex-col p-6">
          <SectionLabel>AI match vs. target</SectionLabel>
          <p className="mt-1 text-sm text-muted">{student.target}</p>
          <div className="mt-5 h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillCoverage} outerRadius="72%">
                <PolarGrid stroke="#e7e5df" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#6c6a72", fontSize: 10 }}
                />
                <Radar
                  dataKey="have"
                  stroke="#0e7c66"
                  fill="#0e7c66"
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-ink px-4 py-3">
            <span className="text-sm font-medium text-white/80">Overall match</span>
            <span className="font-display text-2xl font-extrabold tabular text-white">82%</span>
          </div>
        </Card>
      </div>

      {/* Detailed gap analysis */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-6 py-4">
          <Sparkles className="h-4 w-4 text-emerald" />
          <span className="font-display text-sm font-bold text-ink">AI gap analysis</span>
          <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {gapAnalysis.length} skills evaluated
          </span>
        </div>
        <div className="divide-y divide-line">
          {gapAnalysis.map((g, i) => (
            <div
              key={g.skill}
              className="grid grid-cols-1 items-center gap-3 px-6 py-4 transition-colors hover:bg-paper/60 sm:grid-cols-[220px_1fr_auto]"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-ink">{g.skill}</span>
              </div>
              <p className="text-sm text-muted">{g.note}</p>
              <div className="flex items-center gap-3 sm:justify-end">
                <MatchPill value={skillCoverage.find((s) => g.skill.startsWith(s.skill.split(" ")[0]))?.have ?? 60} />
                <StatusBadge status={g.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {analyzed && (
        <Card className="flex flex-col items-start gap-3 border-emerald/30 bg-emerald-soft/50 p-6 sm:flex-row sm:items-center">
          <Sparkles className="h-5 w-5 shrink-0 text-emerald" />
          <p className="text-sm text-ink">
            <span className="font-semibold">AI recommendation:</span> Your strongest
            lever is System Design. Completing the 2-week module is projected to raise
            your match to <span className="font-mono font-semibold">89%</span>.
          </p>
        </Card>
      )}
    </div>
  );
}
