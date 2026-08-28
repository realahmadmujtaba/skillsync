import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, apiConfigured, getToken, isBackendUp, type ApiUser } from "./api";

export type Role = "student" | "mentor" | "admin";

export type AuthUser = {
  name: string;
  email: string;
  role: Role;
  initials: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  /** "online" when talking to the FastAPI backend, "offline" for local mode. */
  mode: "online" | "offline";
  login: (email: string, password: string, role: Role) => Promise<void>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "skillsync.user";

const AuthContext = createContext<AuthState | null>(null);

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

function nameFromEmail(email: string) {
  const handle = email.split("@")[0].replace(/[._-]+/g, " ");
  return handle.replace(/\b\w/g, (c) => c.toUpperCase());
}

function toAuthUser(u: ApiUser): AuthUser {
  return { name: u.name, email: u.email, role: u.role, initials: initials(u.name) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"online" | "offline">("offline");

  function persist(u: AuthUser | null) {
    setUser(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  // On boot: detect backend, restore session (from backend token or local cache).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const up = apiConfigured && (await isBackendUp());
      if (cancelled) return;
      setMode(up ? "online" : "offline");

      if (up && getToken()) {
        try {
          const me = await api.me();
          if (!cancelled) persist(toAuthUser(me));
          if (!cancelled) setLoading(false);
          return;
        } catch {
          api.logout();
        }
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthState = {
    user,
    loading,
    mode,
    login: async (email, password, role) => {
      if (mode === "online") {
        try {
          persist(toAuthUser(await api.login(email, password)));
          return;
        } catch (err) {
          // Surface real auth errors; only fall back on network failure.
          if (await isBackendUp()) throw err;
          setMode("offline");
        }
      }
      const name = nameFromEmail(email);
      persist({ name, email, role, initials: initials(name) });
    },
    signup: async (name, email, password, role) => {
      if (mode === "online") {
        try {
          persist(toAuthUser(await api.signup(name, email, password, role)));
          return;
        } catch (err) {
          if (await isBackendUp()) throw err;
          setMode("offline");
        }
      }
      persist({ name: name || nameFromEmail(email), email, role, initials: initials(name || email) });
    },
    logout: () => {
      api.logout();
      persist(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const roleLabel: Record<Role, string> = {
  student: "Student",
  mentor: "Mentor / Recruiter",
  admin: "Administrator",
};
