import { useEffect, useState } from "react";
import { MapPin, Bookmark, Plus, Check, SlidersHorizontal } from "lucide-react";
import { Card, MatchPill } from "./ui";
import { opportunities as seed } from "../data";
import type { Opportunity } from "../data";
import { useAuth } from "../auth";
import { api } from "../api";

const filters = ["All", "Remote", "React", "Backend", "85%+ match"] as const;

export default function Opportunities() {
  const { mode } = useAuth();
  const [list, setList] = useState<Opportunity[]>(seed);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [tracked, setTracked] = useState<Record<string, boolean>>({});
  const [trackingId, setTrackingId] = useState<string | null>(null);

  // Load live listings from the backend when online; keep the bundled
  // sample data as a fallback so the view is never empty.
  useEffect(() => {
    if (mode !== "online") return;
    let cancelled = false;
    api
      .opportunities()
      .then((rows) => {
        if (!cancelled && rows.length) setList(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const filtered = list.filter((o) => {
    if (filter === "All") return true;
    if (filter === "Remote") return o.location.toLowerCase().includes("remote");
    if (filter === "85%+ match") return o.match >= 85;
    if (filter === "React") return o.tags.includes("React");
    if (filter === "Backend") return o.tags.some((t) => ["Node", "APIs", "Go", "PostgreSQL"].includes(t));
    return true;
  });

  async function track(o: Opportunity) {
    const key = o.company + o.role;
    if (mode === "online") {
      setTrackingId(key);
      try {
        await api.createApplication(o.company, o.role, o.match);
      } catch {
        /* ignore — still mark as tracked locally */
      } finally {
        setTrackingId(null);
      }
    }
    setTracked((t) => ({ ...t, [key]: true }));
  }

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
        {filtered.map((o) => {
          const key = o.company + o.role;
          const isTracked = tracked[key];
          return (
            <Card
              key={key}
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
                  onClick={() => setSaved((s) => ({ ...s, [key]: !s[key] }))}
                  className="text-muted transition-colors hover:text-emerald"
                  aria-label="Save opportunity"
                >
                  <Bookmark
                    className="h-5 w-5"
                    fill={saved[key] ? "#0e7c66" : "none"}
                    stroke={saved[key] ? "#0e7c66" : "currentColor"}
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
                <button
                  onClick={() => track(o)}
                  disabled={isTracked || trackingId === key}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-transform disabled:translate-y-0 ${
                    isTracked ? "bg-ink" : "bg-emerald group-hover:-translate-y-0.5"
                  }`}
                >
                  {isTracked ? (
                    <>
                      <Check className="h-4 w-4" /> Tracked
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> {trackingId === key ? "Adding…" : "Track"}
                    </>
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
