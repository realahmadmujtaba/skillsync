import { Check, Circle, PlayCircle } from "lucide-react";
import { Card, SectionLabel, ProgressBar } from "./ui";
import { roadmap } from "../data";

export default function Roadmap() {
  const done = roadmap.filter((r) => r.done).length;
  const overall = Math.round(
    roadmap.reduce((a, r) => a + r.progress, 0) / roadmap.length,
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SectionLabel>Roadmap progress</SectionLabel>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">
            {done} of {roadmap.length} milestones complete
          </h2>
          <p className="mt-1 text-sm text-muted">
            Personalized from your gap analysis. Finish by end of the month to peak
            before interview season.
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
          {roadmap.map((step) => (
            <div key={step.title} className="relative">
              <span
                className={`absolute -left-6 top-6 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-4 ring-paper ${
                  step.done ? "bg-emerald" : step.progress > 0 ? "bg-amber" : "bg-line"
                }`}
              >
                {step.done ? (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                ) : step.progress > 0 ? (
                  <PlayCircle className="h-3 w-3 text-white" />
                ) : (
                  <Circle className="h-2.5 w-2.5 text-muted" />
                )}
              </span>

              <Card className="p-5 transition-shadow hover:shadow-[0_1px_0_#e7e5df,0_8px_24px_-16px_rgba(16,16,20,0.25)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald">
                    {step.weeks}
                  </span>
                  {step.done && (
                    <span className="rounded-full bg-emerald-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald">
                      Done
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{step.focus}</p>
                {!step.done && (
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar value={step.progress} />
                    <span className="shrink-0 font-mono text-xs font-semibold tabular text-muted">
                      {step.progress}%
                    </span>
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
