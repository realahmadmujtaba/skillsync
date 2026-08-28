import { useState } from "react";
import { GripVertical } from "lucide-react";
import { MatchPill, SectionLabel } from "./ui";
import { applications as seed, stageMeta } from "../data";
import type { Application } from "../data";
import { useAuth } from "../auth";
import { api } from "../api";

const stages: Application["stage"][] = ["applied", "screening", "interview", "offer"];

const accent: Record<Application["stage"], string> = {
  applied: "bg-sky",
  screening: "bg-amber",
  interview: "bg-emerald",
  offer: "bg-ink",
};

export default function Applications() {
  const { mode } = useAuth();
  const [items, setItems] = useState<Application[]>(seed);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Application["stage"] | null>(null);

  function drop(stage: Application["stage"]) {
    if (!dragId) return;
    const id = dragId;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, stage } : it)));
    setDragId(null);
    setOver(null);
    // Persist to the backend when online; ignore failures (optimistic UI).
    if (mode === "online") api.moveApplication(id, stage).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Drag a card between columns to update its stage.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => {
          const cards = items.filter((i) => i.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver((o) => (o === stage ? null : o))}
              onDrop={() => drop(stage)}
              className={`flex min-h-[420px] flex-col rounded-2xl border p-3 transition-colors ${
                over === stage
                  ? "border-emerald bg-emerald-soft/40"
                  : "border-line bg-line-soft/40"
              }`}
            >
              <div className="flex items-center gap-2 px-2 py-2">
                <span className={`h-2 w-2 rounded-full ${accent[stage]}`} />
                <SectionLabel>{stageMeta[stage].label}</SectionLabel>
                <span className="ml-auto font-mono text-xs font-semibold tabular text-muted">
                  {cards.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => setDragId(null)}
                    className={`group cursor-grab rounded-xl border border-line bg-card p-3.5 transition-all active:cursor-grabbing ${
                      dragId === c.id ? "opacity-40" : "hover:shadow-[0_8px_20px_-16px_rgba(16,16,20,0.4)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-ink">
                          {c.company}
                        </div>
                        <div className="truncate text-xs text-muted">{c.role}</div>
                      </div>
                      <GripVertical className="h-4 w-4 shrink-0 text-line group-hover:text-muted" />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-2.5">
                      <MatchPill value={c.match} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        match
                      </span>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line py-8 text-center text-xs text-muted">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
