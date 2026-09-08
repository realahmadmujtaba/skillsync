import { useState } from "react";
import { Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { api } from "../api";

export default function ResetPassword({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">SkillSync</span>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald/30 bg-emerald-soft/50 p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald" />
            <h2 className="font-display text-lg font-bold text-ink">Password updated</h2>
            <p className="text-sm text-muted">
              You can now close this tab and log in with your new password.
            </p>
            <a
              href="/"
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white"
            >
              Go to login
            </a>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              Set a new password
            </h2>
            <p className="mt-1 text-sm text-muted">Choose a new password for your account.</p>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-3 focus-within:border-emerald">
                <Lock className="h-4 w-4 text-muted" />
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
                />
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-3 focus-within:border-emerald">
                <Lock className="h-4 w-4 text-muted" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-[#fae6ea] px-3 py-2 text-sm text-rose">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
