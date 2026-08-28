import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users, Building2, Activity, ShieldCheck, MoreHorizontal } from "lucide-react";
import { Card, SectionLabel } from "./ui";

const signups = [
  { week: "W1", users: 210 },
  { week: "W2", users: 340 },
  { week: "W3", users: 480 },
  { week: "W4", users: 620 },
  { week: "W5", users: 710 },
  { week: "W6", users: 905 },
];

const users = [
  { name: "Aarav Menon", role: "Student", status: "Active", joined: "Aug 12" },
  { name: "Northwind Labs", role: "Recruiter", status: "Verified", joined: "Aug 10" },
  { name: "Priya Nair", role: "Student", status: "Active", joined: "Aug 09" },
  { name: "Dr. Rao", role: "Mentor", status: "Pending", joined: "Aug 08" },
  { name: "Helios Systems", role: "Recruiter", status: "Verified", joined: "Aug 05" },
];

const statusTone: Record<string, string> = {
  Active: "bg-emerald-soft text-emerald",
  Verified: "bg-[#e6eef6] text-sky",
  Pending: "bg-[#fbf1dc] text-amber",
};

export default function AdminView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[
          [Users, "Total users", "12,480", "+9%"],
          [Building2, "Hiring partners", "840", "+3%"],
          [Activity, "Weekly active", "6,120", "+12%"],
          [ShieldCheck, "Uptime", "99.98%", "30d"],
        ].map(([Icon, label, value, delta], i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>{label as string}</SectionLabel>
              <Icon className="h-4 w-4 text-muted" />
            </div>
            <div className="mt-3 font-display text-2xl font-extrabold tabular text-ink">
              {value as string}
            </div>
            <div className="mt-0.5 font-mono text-xs text-emerald">{delta as string}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <SectionLabel>User growth</SectionLabel>
        <div className="mt-4 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signups} margin={{ left: -18, right: 8 }}>
              <CartesianGrid stroke="#eeece7" vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "#6c6a72", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6c6a72", fontSize: 12 }} />
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
            {users.length} shown
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Joined</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.name} className="transition-colors hover:bg-paper/60">
                <td className="px-6 py-3.5 font-semibold text-ink">{u.name}</td>
                <td className="px-6 py-3.5 text-muted">{u.role}</td>
                <td className="px-6 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${statusTone[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-muted">{u.joined}</td>
                <td className="px-6 py-3.5 text-right">
                  <button className="text-muted hover:text-ink" aria-label="Actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
