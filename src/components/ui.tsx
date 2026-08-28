import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-card ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
      {children}
    </span>
  );
}

export function ScoreRing({
  value,
  size = 132,
  stroke = 10,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-emerald)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold tabular text-ink">{value}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          / 100
        </span>
      </div>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
      <div
        className="h-full rounded-full bg-emerald transition-[width] duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

const statusStyles: Record<string, string> = {
  strong: "bg-emerald-soft text-emerald",
  growing: "bg-[#fbf1dc] text-amber",
  gap: "bg-[#fae6ea] text-rose",
};

export function StatusBadge({ status }: { status: "strong" | "growing" | "gap" }) {
  const label = status === "strong" ? "Strong" : status === "growing" ? "Growing" : "Gap";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[status]}`}
    >
      {label}
    </span>
  );
}

export function MatchPill({ value }: { value: number }) {
  const tone =
    value >= 85 ? "text-emerald" : value >= 70 ? "text-amber" : "text-muted";
  return (
    <span className={`font-mono text-sm font-semibold tabular ${tone}`}>{value}%</span>
  );
}
