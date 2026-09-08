import { useEffect, useState } from "react";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card, SectionLabel, ProgressBar } from "./ui";
import { api, type ApiMentee } from "../api";

export default function MentorView() {
  const [mentees, setMentees] = useState<ApiMentee[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .mentees()
      .then((m) => !cancelled && setMentees(m))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <Card className="p-8 text-center text-sm text-muted">Couldn&rsquo;t load mentees: {error}</Card>;
  }
  if (!mentees) {
    return <Card className="p-8 text-center text-sm text-muted">Loading mentees…</Card>;
  }

  const avgReadiness = mentees.length
    ? Math.round(mentees.reduce((a, m) => a + m.readiness, 0) / mentees.length)
    : 0;
  const needingAttention = mentees.filter((m) => m.readiness < 50 || m.readiness === 0);
  const priority = mentees.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          [Users, "Active mentees", `${mentees.length}`],
          [TrendingUp, "Avg readiness", `${avgReadiness}`],
          [AlertCircle, "Needing attention", `${needingAttention.length}`],
        ].map(([Icon, label, value], i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>{label as string}</SectionLabel>
              <Icon className="h-4 w-4 text-muted" />
            </div>
            <div className="mt-3 font-display text-3xl font-extrabold tabular text-ink">
              {value as string}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <span className="font-display text-sm font-bold text-ink">Mentee progress</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {mentees.length} shown
            </span>
          </div>
          <div className="divide-y divide-line">
            {mentees.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-paper/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white">
                  {m.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">{m.name}</div>
                  <div className="text-xs text-muted">{m.target_role} · {m.flag}</div>
                </div>
                <div className="hidden w-32 sm:block">
                  <ProgressBar value={m.readiness} />
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold tabular text-ink">
                    {m.readiness}
                  </div>
                  <div className="font-mono text-[11px] text-emerald">{m.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Priority mentees</SectionLabel>
          <p className="mt-1 text-xs text-muted">Lowest readiness first — likely to need the most support.</p>
          <div className="mt-4 flex flex-col gap-3">
            {priority.map((m) => (
              <div key={m.id} className="rounded-xl border border-line bg-paper/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{m.name}</span>
                  <span className="font-mono text-[10px] text-muted">{m.readiness}% ready</span>
                </div>
                <p className="mt-1 text-xs text-muted">{m.flag} · targeting {m.target_role}</p>
              </div>
            ))}
            {priority.length === 0 && (
              <p className="text-sm text-muted">No mentees yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
