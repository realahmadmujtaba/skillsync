import { useEffect, useRef, useState } from "react";
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
import { api } from "../api";

const roles: { key: Role; icon: typeof Users; blurb: string }[] = [
  { key: "student", icon: GraduationCap, blurb: "Track readiness & apply" },
  { key: "mentor", icon: Users, blurb: "Guide & post roles" },
  { key: "admin", icon: Shield, blurb: "Manage the platform" },
];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function Login() {
  const { login, signup, loginWithGoogle, mode: authMode } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;
    let cancelled = false;

    function render(attempt = 0) {
      const g = (window as unknown as { google?: any }).google;
      if (!g?.accounts?.id) {
        if (attempt < 20 && !cancelled) setTimeout(() => render(attempt + 1), 150);
        return;
      }
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp: { credential: string }) => {
          setError(null);
          setBusy(true);
          try {
            await loginWithGoogle(resp.credential, role);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign-in failed");
          } finally {
            setBusy(false);
          }
        },
      });
      if (googleButtonRef.current) {
        g.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: 320,
        });
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [role, loginWithGoogle]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "forgot") {
        if (authMode !== "online") throw new Error("Password reset needs a live backend connection.");
        await api.forgotPassword(email);
        setForgotSent(true);
      } else if (mode === "signup") {
        await signup(name || "New User", email, password, role);
      } else {
        await login(email || `${role}@skillsync.io`, password, role);
      }
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
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {mode === "login"
              ? "Sign in to continue your journey."
              : mode === "signup"
                ? "Start building your internship readiness."
                : "Enter your email and we'll send you a reset link."}
          </p>

          {/* Role selector */}
          {mode !== "forgot" && (
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
          )}

          {mode === "forgot" && forgotSent ? (
            <div className="mt-6 rounded-xl border border-emerald/30 bg-emerald-soft/50 p-4 text-sm text-ink">
              If that email is registered, a reset link has been sent. Check your inbox
              (and spam folder) — the link expires in 30 minutes.
            </div>
          ) : (
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
              {mode !== "forgot" && (
                <Field
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                />
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("forgot");
                  }}
                  className="self-end text-xs font-semibold text-emerald hover:underline"
                >
                  Forgot password?
                </button>
              )}

              {error && (
                <p className="rounded-lg bg-[#fae6ea] px-3 py-2 text-sm text-rose">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
                {!busy && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {mode !== "forgot" && GOOGLE_CLIENT_ID && (
            <>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                <div className="h-px flex-1 bg-line" />
                or
                <div className="h-px flex-1 bg-line" />
              </div>
              <div ref={googleButtonRef} className="mt-4 flex w-full justify-center" />
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            {mode === "forgot" ? (
              <button
                onClick={() => {
                  setError(null);
                  setForgotSent(false);
                  setMode("login");
                }}
                className="font-semibold text-emerald hover:underline"
              >
                Back to sign in
              </button>
            ) : (
              <>
                {mode === "login" ? "New to SkillSync?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-semibold text-emerald hover:underline"
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </button>
              </>
            )}
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
