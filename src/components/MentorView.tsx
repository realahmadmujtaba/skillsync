import { MessageSquare, TrendingUp, CheckCircle2, Plus } from "lucide-react";
import { Card, SectionLabel, ProgressBar, MatchPill } from "./ui";

const mentees = [
  { name: "Aarav Menon", target: "SWE Intern", readiness: 78, trend: "+7", flag: "System Design gap" },
  { name: "Priya Nair", target: "Data Intern", readiness: 64, trend: "+4", flag: "Needs portfolio" },
  { name: "Kabir Shah", target: "Frontend Intern", readiness: 88, trend: "+9", flag: "Interview-ready" },
  { name: "Sara Iyer", target: "Backend Intern", readiness: 52, trend: "+2", flag: "Low activity" },
];

const requests = [
  { name: "Priya Nair", ask: "Resume review for Data roles", time: "1h ago" },
  { name: "Aarav Menon", ask: "Mock system-design session", time: "3h ago" },
];

export default function MentorView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          [MessageSquare, "Active mentees", "12"],
          [TrendingUp, "Avg readiness", "71"],
          [CheckCircle2, "Reviews this week", "8"],
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
            <button className="inline-flex items-center gap-1 rounded-lg bg-emerald px-3 py-1.5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Post opportunity
            </button>
          </div>
          <div className="divide-y divide-line">
            {mentees.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-paper/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white">
                  {m.name.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">{m.name}</div>
                  <div className="text-xs text-muted">{m.target} · {m.flag}</div>
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
          <SectionLabel>Pending requests</SectionLabel>
          <div className="mt-4 flex flex-col gap-3">
            {requests.map((r) => (
              <div key={r.ask} className="rounded-xl border border-line bg-paper/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{r.name}</span>
                  <span className="font-mono text-[10px] text-muted">{r.time}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{r.ask}</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white">
                    Accept
                  </button>
                  <button className="flex-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink">
                    Later
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-emerald-soft/50 p-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <MatchPill value={92} /> best-fit mentee
            </div>
            <p className="mt-1 text-xs text-muted">
              Kabir Shah matches your Frontend openings — recommend a referral.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
