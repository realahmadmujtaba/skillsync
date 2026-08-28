import { useState } from "react";
import {
  Sparkles,
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { useAuth, roleLabel, type Role } from "../auth";

const roles: { key: Role; icon: typeof Users; blurb: string }[] = [
  { key: "student", icon: GraduationCap, blurb: "Track readiness & apply" },
  { key: "mentor", icon: Users, blurb: "Guide & post roles" },
  { key: "admin", icon: Shield, blurb: "Manage the platform" },
];

export default function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") await signup(name || "New User", email, password, role);
      else await login(email || `${role}@skillsync.io`, password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            SkillSync
          </span>
        </div>

        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald">
            Intern-ready, faster
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white">
            Turn your resume into a shortlist at top companies.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-fg">
            AI gap analysis, a personalized roadmap, mock interviews, and an
            application tracker — everything you need to go from final year to
            offer.
          </p>
        </div>

        <div className="flex gap-8">
          {[
            ["12k+", "students matched"],
            ["840", "hiring partners"],
            ["8.3%", "offer rate"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-2xl font-extrabold text-white">{n}</div>
              <div className="text-xs text-sidebar-muted">{l}</div>
            </div>
          ))}
        </div>

        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,124,102,0.35), transparent 70%)" }}
        />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center overflow-y-auto bg-paper px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">
              SkillSync
            </span>
          </div>

          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {mode === "login"
              ? "Sign in to continue your journey."
              : "Start building your internship readiness."}
          </p>

          {/* Role selector */}
          <div className="mt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              I am a
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {roles.map(({ key, icon: Icon, blurb }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors ${
                    role === key
                      ? "border-emerald bg-emerald-soft"
                      : "border-line bg-card hover:border-ink/30"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${role === key ? "text-emerald" : "text-muted"}`}
                  />
                  <span className="text-[11px] font-semibold leading-tight text-ink">
                    {roleLabel[key].split(" ")[0]}
                  </span>
                  <span className="text-[10px] leading-tight text-muted">{blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
            {mode === "signup" && (
              <Field
                icon={User}
                placeholder="Full name"
                value={name}
                onChange={setName}
              />
            )}
            <Field
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={setEmail}
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />

            {error && (
              <p className="rounded-lg bg-[#fae6ea] px-3 py-2 text-sm text-rose">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-line" />
            or
            <div className="h-px flex-1 bg-line" />
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-line-soft">
            <span className="font-display font-bold text-emerald">G</span>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted">
            {mode === "login" ? "New to SkillSync?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-emerald hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon: typeof Mail;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-3 focus-within:border-emerald">
      <Icon className="h-4 w-4 text-muted" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
      />
    </div>
  );
}
