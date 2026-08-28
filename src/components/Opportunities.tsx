import { useState } from "react";
import { MapPin, Bookmark, Plus, SlidersHorizontal } from "lucide-react";
import { Card, MatchPill } from "./ui";
import { opportunities } from "../data";

const filters = ["All", "Remote", "React", "Backend", "85%+ match"] as const;

export default function Opportunities() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const list = opportunities.filter((o) => {
    if (filter === "All") return true;
    if (filter === "Remote") return o.location.toLowerCase().includes("remote");
    if (filter === "85%+ match") return o.match >= 85;
    if (filter === "React") return o.tags.includes("React");
    if (filter === "Backend") return o.tags.some((t) => ["Node", "APIs", "Go", "PostgreSQL"].includes(t));
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "border-ink bg-ink text-white"
                : "border-line bg-card text-muted hover:border-ink/30 hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
        <button className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-1.5 text-sm font-medium text-muted hover:text-ink">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((o) => (
          <Card
            key={o.company + o.role}
            className="group flex flex-col p-5 transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_-20px_rgba(16,16,20,0.4)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white">
                  {o.company.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{o.company}</div>
                  <div className="text-xs text-muted">{o.posted}</div>
                </div>
              </div>
              <button
                onClick={() => setSaved((s) => ({ ...s, [o.company]: !s[o.company] }))}
                className="text-muted transition-colors hover:text-emerald"
                aria-label="Save opportunity"
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={saved[o.company] ? "#0e7c66" : "none"}
                  stroke={saved[o.company] ? "#0e7c66" : "currentColor"}
                />
              </button>
            </div>

            <h3 className="mt-4 font-display text-base font-bold text-ink">{o.role}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5" /> {o.location}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {o.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] text-muted"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <div className="flex items-center gap-1.5">
                <MatchPill value={o.match} />
                <span className="text-xs text-muted">match</span>
              </div>
              <button className="inline-flex items-center gap-1 rounded-lg bg-emerald px-3 py-1.5 text-sm font-semibold text-white transition-transform group-hover:-translate-y-0.5">
                <Plus className="h-4 w-4" /> Track
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
