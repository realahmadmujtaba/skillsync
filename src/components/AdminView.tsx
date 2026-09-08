import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users, FileText, Briefcase, GraduationCap } from "lucide-react";
import { Card, SectionLabel } from "./ui";
import { api, type ApiAdminOverview, type ApiAdminUser } from "../api";

const roleTone: Record<string, string> = {
  student: "bg-emerald-soft text-emerald",
  mentor: "bg-[#e6eef6] text-sky",
  admin: "bg-[#fbf1dc] text-amber",
};

export default function AdminView() {
  const [overview, setOverview] = useState<ApiAdminOverview | null>(null);
  const [users, setUsers] = useState<ApiAdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.adminOverview(), api.adminUsers()])
      .then(([o, u]) => {
        if (cancelled) return;
        setOverview(o);
        setUsers(u);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <Card className="p-8 text-center text-sm text-muted">Couldn&rsquo;t load platform data: {error}</Card>;
  }
  if (!overview || !users) {
    return <Card className="p-8 text-center text-sm text-muted">Loading platform data…</Card>;
  }

  const stats: [typeof Users, string, string][] = [
    [Users, "Total users", `${overview.total_users}`],
    [GraduationCap, "Students", `${overview.student_count}`],
    [Briefcase, "Applications tracked", `${overview.total_applications}`],
    [FileText, "Resumes analyzed", `${overview.resumes_analyzed}`],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map(([Icon, label, value], i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>{label}</SectionLabel>
              <Icon className="h-4 w-4 text-muted" />
            </div>
            <div className="mt-3 font-display text-2xl font-extrabold tabular text-ink">{value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <SectionLabel>Signups by week</SectionLabel>
        <div className="mt-4 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overview.weekly_signups} margin={{ left: -18, right: 8 }}>
              <CartesianGrid stroke="#eeece7" vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "#6c6a72", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6c6a72", fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "#f0eee9" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #e7e5df", fontSize: 13, fontFamily: "Inter" }}
              />
              <Bar dataKey="users" fill="#0e7c66" radius={[6, 6, 0, 0]} barSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <span className="font-display text-sm font-bold text-ink">User management</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {users.length} total
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Readiness</th>
              <th className="px-6 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-paper/60">
                <td className="px-6 py-3.5 font-semibold text-ink">{u.name}</td>
                <td className="px-6 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${roleTone[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-muted">
                  {u.role === "student" ? `${u.readiness}%` : "—"}
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-muted">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
