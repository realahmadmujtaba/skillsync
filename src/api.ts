/**
 * SkillSync API client.
 *
 * Talks to the FastAPI backend when `VITE_API_URL` is set and reachable, and
 * degrades gracefully to local/offline mode otherwise — so the preview always
 * works even without the backend running.
 */
import type { Role } from "./auth";

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const TOKEN_KEY = "skillsync.token";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  readiness: number;
};

export type ApiOpportunity = {
  id: string;
  company: string;
  role: string;
  location: string;
  tags: string[];
  match: number;
  posted: string;
};

export type ApplicationStage = "applied" | "screening" | "interview" | "offer";

export type ApiApplication = {
  id: string;
  company: string;
  role: string;
  match: number;
  stage: ApplicationStage;
};

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** True when a backend URL is configured. */
export const apiConfigured = Boolean(BASE);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

/** Quick reachability probe — used to decide online vs. offline mode. */
export async function isBackendUp(): Promise<boolean> {
  if (!BASE) return false;
  try {
    const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  async signup(name: string, email: string, password: string, role: Role): Promise<ApiUser> {
    const data = await request<{ access_token: string; user: ApiUser }>(
      "/api/auth/signup",
      { method: "POST", body: JSON.stringify({ name, email, password, role }) },
    );
    setToken(data.access_token);
    return data.user;
  },

  async login(email: string, password: string): Promise<ApiUser> {
    // OAuth2 password flow expects form-encoded `username`/`password`.
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE}/api/auth/login`, { method: "POST", body });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? "Login failed");
    const data = (await res.json()) as { access_token: string; user: ApiUser };
    setToken(data.access_token);
    return data.user;
  },

  async me(): Promise<ApiUser> {
    return request<ApiUser>("/api/auth/me");
  },

  logout() {
    setToken(null);
  },

  opportunities: () => request<ApiOpportunity[]>("/api/opportunities"),
  applications: () => request<ApiApplication[]>("/api/applications"),
  createApplication: (company: string, role: string, match: number) =>
    request<ApiApplication>("/api/applications", {
      method: "POST",
      body: JSON.stringify({ company, role, match, stage: "applied" }),
    }),
  moveApplication: (id: string, stage: string) =>
    request(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),
  saveInterview: (track: string, score: number, feedback: string) =>
    request("/api/interviews", {
      method: "POST",
      body: JSON.stringify({ track, score, feedback }),
    }),
};
