import { Search, Bell } from "lucide-react";
import { useAuth, roleLabel } from "../auth";
import type { ViewKey } from "./Sidebar";

const titles: Partial<Record<ViewKey, { title: string; sub: string }>> = {
  dashboard: { title: "Dashboard", sub: "Your internship readiness at a glance" },
  resume: { title: "Resume Analysis", sub: "AI gap analysis against your target role" },
  roadmap: { title: "Learning Roadmap", sub: "A personalized plan to close your gaps" },
  interview: { title: "Mock Interview", sub: "Practice with AI-generated feedback" },
  opportunities: { title: "Opportunities", sub: "Internships matched to your profile" },
  applications: { title: "Applications", sub: "Track every application to offer" },
};

export default function Topbar({ view }: { view: ViewKey }) {
  const { user, mode } = useAuth();
  if (!user) return null;

  let meta = titles[view] ?? titles.dashboard!;
  if (view === "dashboard" && user.role === "mentor")
    meta = { title: "Mentor Hub", sub: "Guide your mentees toward offers" };
  if (view === "dashboard" && user.role === "admin")
    meta = { title: "Admin Console", sub: "Platform health and user management" };

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-paper/80 px-6 py-4 backdrop-blur-md lg:px-10">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-extrabold tracking-tight text-ink">
          {meta.title}
        </h1>
        <p className="truncate text-sm text-muted">{meta.sub}</p>
      </div>

      <div className="ml-auto hidden items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 md:flex">
        <Search className="h-4 w-4 text-muted" />
        <input
          placeholder="Search roles, skills, companies"
          className="w-56 bg-transparent text-sm text-fg outline-none placeholder:text-muted"
        />
      </div>

      <span
        title={mode === "online" ? "Connected to API" : "Local mode (backend offline)"}
        className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted md:inline-flex"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${mode === "online" ? "bg-emerald" : "bg-amber"}`}
        />
        {mode === "online" ? "Live API" : "Local"}
      </span>

      <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-fg transition-colors hover:bg-line-soft">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald ring-2 ring-card" />
      </button>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold leading-tight text-ink">{user.name}</div>
          <div className="text-xs text-muted">{roleLabel[user.role]}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white">
          {user.initials}
        </div>
      </div>
    </header>
  );
}
