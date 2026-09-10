import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Route,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { Card, SectionLabel, StatusBadge, MatchPill } from "./ui";
import { ResumeReview } from "./ResumeReview";
import { api, type ApiSkill, type ApiResumeExample } from "../api";
import type { ViewKey } from "./Sidebar";

const ROLE_SUGGESTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Django Developer",
  "Laravel Developer",
  "Python Developer",
  "FastAPI Developer",
  "Machine Learning Engineer",
  "AI Agent Developer",
  "Automation Engineer",
  "DevOps Engineer",
];

export default function ResumeAnalysis({
  onNavigate,
}: {
  onNavigate?: (view: ViewKey) => void;
}) {
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [readiness, setReadiness] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingRole, setSettingRole] = useState(false);
  const [examples, setExamples] = useState<ApiResumeExample[] | null>(null);
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [examplesError, setExamplesError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [selectedExample, setSelectedExample] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .dashboard()
      .then((d) => {
        if (cancelled) return;
        // Only trust the server's target_role once they've actually run an
        // analysis before — otherwise it's just the unset DB default, and
        // the field should stay open for them to choose.
        if (d.skill_coverage.length) setTargetRole(d.target_role);
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
    if (!targetRole.trim()) {
      setError("Enter or pick a target role first.");
      return;
    }
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

  async function handleNoResume() {
    if (!targetRole.trim()) {
      setError("Enter or pick a target role first.");
      return;
    }
    setError(null);
    setSettingRole(true);
    try {
      await api.setTargetRole(targetRole);
      onNavigate?.("roadmap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set target role");
    } finally {
      setSettingRole(false);
    }
  }

  function openExamples() {
    setShowExamples(true);
    if (examples || examplesLoading) return;
    setExamplesLoading(true);
    setExamplesError(null);
    api
      .getExampleResumes()
      .then((res) => {
        setExamples(res);
        const roleLower = targetRole.trim().toLowerCase();
        const idx = roleLower
          ? res.findIndex(
              (e) =>
                e.target_role.toLowerCase().includes(roleLower) ||
                roleLower.includes(e.target_role.toLowerCase()),
            )
          : -1;
        if (idx >= 0) setSelectedExample(idx);
      })
      .catch((err) => {
        setExamplesError(err instanceof Error ? err.message : "Could not load examples");
      })
      .finally(() => setExamplesLoading(false));
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
              placeholder="Any programming role — Frontend, Backend, ML, DevOps, Django, React…"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-emerald"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ROLE_SUGGESTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTargetRole(r)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    targetRole === r
                      ? "border-emerald bg-emerald-soft text-emerald"
                      : "border-line bg-card text-muted hover:border-ink/30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {fileName && !busy && !error && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-line bg-paper/60 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-soft text-emerald">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{fileName}</div>
                <div className="text-xs text-muted">Analyzed by AI</div>
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

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-line bg-paper/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <Route className="h-5 w-5 shrink-0 text-emerald" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Don't have a resume yet?</p>
                <p className="text-xs text-muted">
                  Pick your target role above, then start learning or see what a strong
                  resume looks like.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-8">
              <button
                type="button"
                disabled={settingRole}
                onClick={handleNoResume}
                className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
              >
                {settingRole ? "Setting up…" : "Start roadmap"}
              </button>
              <button
                type="button"
                onClick={openExamples}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-emerald hover:text-emerald"
              >
                <Eye className="h-3.5 w-3.5" /> See an example resume
              </button>
            </div>
          </div>
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

      {showExamples && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowExamples(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <SectionLabel>Example resumes</SectionLabel>
              <button
                type="button"
                onClick={() => setShowExamples(false)}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              {examplesLoading && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading examples…
                </div>
              )}
              {examplesError && (
                <p className="rounded-lg bg-[#fae6ea] px-3 py-2 text-sm text-rose">
                  {examplesError}
                </p>
              )}
              {examples && examples.length > 0 && (
                <>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {examples.map((ex, i) => (
                      <button
                        key={ex.target_role}
                        type="button"
                        onClick={() => setSelectedExample(i)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          selectedExample === i
                            ? "border-emerald bg-emerald-soft text-emerald"
                            : "border-line bg-paper text-muted hover:border-ink/30"
                        }`}
                      >
                        {ex.target_role}
                      </button>
                    ))}
                  </div>

                  <div className="mb-4 rounded-lg bg-amber/10 px-3 py-2 text-xs font-medium text-amber">
                    AI-generated example — not a real person's resume.
                  </div>

                  <ResumeReview draft={examples[selectedExample].resume} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
