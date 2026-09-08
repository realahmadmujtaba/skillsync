import { useEffect, useState } from "react";
import { Check, Circle, PlayCircle, ExternalLink } from "lucide-react";
import { Card, SectionLabel, ProgressBar } from "./ui";
import { api, type ApiRoadmapMilestone } from "../api";

export default function Roadmap() {
  const [milestones, setMilestones] = useState<ApiRoadmapMilestone[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .roadmap()
      .then((r) => !cancelled && setMilestones(r.milestones))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <Card className="p-8 text-center text-sm text-muted">Couldn&rsquo;t load your roadmap: {error}</Card>;
  }
  if (!milestones) {
    return <Card className="p-8 text-center text-sm text-muted">Loading roadmap…</Card>;
  }
  if (milestones.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        Analyze a resume first — your roadmap is generated from your gap analysis.
      </Card>
    );
  }

  const done = milestones.filter((m) => m.status === "done").length;
  const overall = Math.round(milestones.reduce((a, m) => a + m.progress, 0) / milestones.length);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SectionLabel>Roadmap progress</SectionLabel>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">
            {done} of {milestones.length} milestones complete
          </h2>
          <p className="mt-1 text-sm text-muted">
            Personalized from your latest resume gap analysis.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Overall</span>
            <span className="font-mono font-semibold tabular text-ink">{overall}%</span>
          </div>
          <ProgressBar value={overall} />
        </div>
      </Card>

      <div className="relative pl-6">
        <div className="absolute bottom-2 left-[9px] top-2 w-px bg-line" />
        <div className="flex flex-col gap-4">
          {milestones.map((m) => (
            <div key={m.skill} className="relative">
              <span
                className={`absolute -left-6 top-6 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-4 ring-paper ${
                  m.status === "done" ? "bg-emerald" : m.status === "active" ? "bg-amber" : "bg-line"
                }`}
              >
                {m.status === "done" ? (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                ) : m.status === "active" ? (
                  <PlayCircle className="h-3 w-3 text-white" />
                ) : (
                  <Circle className="h-2.5 w-2.5 text-muted" />
                )}
              </span>

              <Card className="p-5 transition-shadow hover:shadow-[0_1px_0_#e7e5df,0_8px_24px_-16px_rgba(16,16,20,0.25)]">
                <div className="flex flex-wrap items-center gap-2">
                  {m.status === "done" && (
                    <span className="rounded-full bg-emerald-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald">
                      Done
                    </span>
                  )}
                  {m.status === "active" && (
                    <span className="rounded-full bg-amber/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber">
                      In progress
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-ink">{m.title}</h3>
                <p className="mt-1 text-sm text-muted">{m.focus}</p>
                {m.status !== "done" && (
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar value={m.progress} />
                    <span className="shrink-0 font-mono text-xs font-semibold tabular text-muted">
                      {m.progress}%
                    </span>
                  </div>
                )}
                {m.resources.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.resources.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          r.kind === "free"
                            ? "border-emerald/30 bg-emerald-soft/60 text-emerald hover:bg-emerald-soft"
                            : "border-line bg-paper/60 text-muted hover:bg-line-soft"
                        }`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {r.title}
                        <span className="rounded-full bg-white/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide">
                          {r.kind}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
