import {
  LayoutDashboard,
  FileSearch,
  Route,
  Briefcase,
  KanbanSquare,
  Sparkles,
  Settings,
  LogOut,
  MessagesSquare,
  Users,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth, roleLabel, type Role } from "../auth";

export type ViewKey =
  | "dashboard"
  | "resume"
  | "roadmap"
  | "opportunities"
  | "applications"
  | "interview";

const navByRole: Record<Role, { key: ViewKey; label: string; icon: LucideIcon }[]> = {
  student: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "resume", label: "Resume Analysis", icon: FileSearch },
    { key: "roadmap", label: "Learning Roadmap", icon: Route },
    { key: "interview", label: "Mock Interview", icon: MessagesSquare },
    { key: "opportunities", label: "Opportunities", icon: Briefcase },
    { key: "applications", label: "Applications", icon: KanbanSquare },
  ],
  mentor: [
    { key: "dashboard", label: "Mentor Hub", icon: Users },
    { key: "opportunities", label: "Opportunities", icon: Briefcase },
  ],
  admin: [
    { key: "dashboard", label: "Admin Console", icon: ShieldCheck },
    { key: "opportunities", label: "Opportunities", icon: BarChart3 },
  ],
};

export default function Sidebar({
  active,
  onChange,
}: {
  active: ViewKey;
  onChange: (v: ViewKey) => void;
}) {
  const { user, logout } = useAuth();
  if (!user) return null;
  const nav = navByRole[user.role];

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-ink px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald">
          <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-extrabold tracking-tight text-white">
            SkillSync
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-muted">
            {roleLabel[user.role]}
          </div>
        </div>
      </div>

      <nav className="mt-9 flex flex-1 flex-col gap-1">
        {nav.map(({ key, label, icon: Icon }) => {
          const on = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                on
                  ? "bg-ink-soft text-white"
                  : "text-sidebar-fg hover:bg-ink-soft/60 hover:text-white"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${on ? "text-emerald" : "text-sidebar-muted group-hover:text-sidebar-fg"}`}
                strokeWidth={2}
              />
              <span className={on ? "font-semibold" : "font-medium"}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald font-display text-sm font-bold text-white">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-white">{user.name}</div>
            <div className="truncate text-xs text-sidebar-muted">{user.email}</div>
          </div>
        </div>
        <div className="mt-1 flex flex-col gap-1">
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-fg transition-colors hover:bg-ink-soft/60 hover:text-white">
            <Settings className="h-[18px] w-[18px] text-sidebar-muted" strokeWidth={2} />
            Settings
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-fg transition-colors hover:bg-ink-soft/60 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px] text-sidebar-muted" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
