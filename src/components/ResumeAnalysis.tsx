import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { UploadCloud, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { Card, SectionLabel, StatusBadge, MatchPill } from "./ui";
import { api, type ApiSkill } from "../api";

export default function ResumeAnalysis() {
  const [targetRole, setTargetRole] = useState("Software Engineer Intern");
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [readiness, setReadiness] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .dashboard()
      .then((d) => {
        if (cancelled) return;
        setTargetRole(d.target_role);
        setSkills(d.skill_coverage);
        setReadiness(d.skill_coverage.length ? d.readiness : null);
      })
      .catch(() => {
        /* offline mode — leave the upload form empty */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }
    setError(null);
    setBusy(true);
    setFileName(file.name);
    try {
      const result = await api.analyzeResume(file, targetRole);
      setSkills(result.skills);
      setReadiness(result.readiness);
      setRecommendation(result.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  const overallMatch = readiness ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Upload / resume card */}
        <Card className="p-6">
          <SectionLabel>Source resume</SectionLabel>

          <div className="mt-4">
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Target role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer Intern"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-emerald"
            />
          </div>

          {fileName && !busy && !error && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-line bg-paper/60 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-soft text-emerald">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{fileName}</div>
                <div className="text-xs text-muted">Analyzed by Claude</div>
              </div>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald">
                <CheckCircle2 className="h-4 w-4" /> Parsed
              </span>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-[#fae6ea] px-3 py-2 text-sm text-rose">{error}</p>
          )}

          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper/40 px-6 py-8 text-center transition-colors hover:border-emerald hover:bg-emerald-soft/40">
            <UploadCloud className="h-7 w-7 text-muted" />
            <span className="mt-2 text-sm font-semibold text-ink">
              {busy ? "Analyzing with AI…" : "Drop your resume or click to upload"}
            </span>
            <span className="mt-0.5 text-xs text-muted">PDF only · up to 5 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              disabled={busy}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </Card>

        {/* Match summary */}
        <Card className="flex flex-col p-6">
          <SectionLabel>AI match vs. target</SectionLabel>
          <p className="mt-1 text-sm text-muted">{targetRole}</p>
          <div className="mt-5 h-[190px] w-full">
            {skills.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Upload a resume to see your match.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skills} outerRadius="72%">
                  <PolarGrid stroke="#e7e5df" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "#6c6a72", fontSize: 10 }} />
                  <Radar
                    dataKey="coverage"
                    stroke="#0e7c66"
                    fill="#0e7c66"
                    fillOpacity={0.22}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-ink px-4 py-3">
            <span className="text-sm font-medium text-white/80">Overall match</span>
            <span className="font-display text-2xl font-extrabold tabular text-white">
              {overallMatch}%
            </span>
          </div>
        </Card>
      </div>

      {/* Detailed gap analysis */}
      {skills.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-6 py-4">
            <Sparkles className="h-4 w-4 text-emerald" />
            <span className="font-display text-sm font-bold text-ink">AI gap analysis</span>
            <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {skills.length} skills evaluated
            </span>
          </div>
          <div className="divide-y divide-line">
            {skills.map((s, i) => (
              <div
                key={s.skill}
                className="grid grid-cols-1 items-center gap-3 px-6 py-4 transition-colors hover:bg-paper/60 sm:grid-cols-[220px_1fr_auto]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-ink">{s.skill}</span>
                </div>
                <p className="text-sm text-muted">{s.note}</p>
                <div className="flex items-center gap-3 sm:justify-end">
                  <MatchPill value={s.coverage} />
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {recommendation && (
        <Card className="flex flex-col items-start gap-3 border-emerald/30 bg-emerald-soft/50 p-6 sm:flex-row sm:items-center">
          <Sparkles className="h-5 w-5 shrink-0 text-emerald" />
          <p className="text-sm text-ink">
            <span className="font-semibold">AI recommendation:</span> {recommendation}
          </p>
        </Card>
      )}
    </div>
  );
}
