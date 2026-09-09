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

export type SkillStatus = "strong" | "growing" | "gap";

export type ApiSkill = {
  skill: string;
  coverage: number;
  status: SkillStatus;
  note: string;
};

export type ApiResumeAnalysis = {
  target_role: string;
  readiness: number;
  recommendation: string;
  skills: ApiSkill[];
};

export type ApiResumeEducation = {
  school: string;
  degree: string;
  start: string;
  end: string;
};

export type ApiResumeExperience = {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
};

export type ApiResumeProject = {
  name: string;
  tech: string;
  bullets: string[];
};

export type ApiResumeDraft = {
  name: string;
  email: string;
  phone: string;
  summary: string;
  education: ApiResumeEducation[];
  experience: ApiResumeExperience[];
  projects: ApiResumeProject[];
  skills: string[];
};

export type ApiDashboard = {
  name: string;
  target_role: string;
  readiness: number;
  readiness_delta: number;
  readiness_trend: { date: string; score: number }[];
  skill_coverage: ApiSkill[];
  funnel: { stage: string; value: number }[];
  top_gaps: ApiSkill[];
};

export type ApiResourceLink = {
  title: string;
  url: string;
  kind: "free" | "paid";
};

export type ApiRoadmapMilestone = {
  skill: string;
  title: string;
  focus: string;
  status: "done" | "active" | "upcoming";
  progress: number;
  resources: ApiResourceLink[];
};

export type ApiAdminOverview = {
  total_users: number;
  student_count: number;
  mentor_count: number;
  admin_count: number;
  total_applications: number;
  resumes_analyzed: number;
  weekly_signups: { week: string; users: number }[];
};

export type ApiMentee = {
  id: string;
  name: string;
  email: string;
  target_role: string;
  readiness: number;
  trend: string;
  flag: string;
};

export type ApiAdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  readiness: number;
  joined: string;
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

  dashboard: () => request<ApiDashboard>("/api/dashboard"),
  roadmap: () =>
    request<{ milestones: ApiRoadmapMilestone[] }>("/api/roadmap"),
  adminOverview: () => request<ApiAdminOverview>("/api/admin/overview"),
  adminUsers: () => request<ApiAdminUser[]>("/api/admin/users"),
  mentees: () => request<ApiMentee[]>("/api/mentor/mentees"),

  async analyzeResume(file: File, targetRole: string): Promise<ApiResumeAnalysis> {
    const form = new FormData();
    form.append("file", file);
    form.append("target_role", targetRole);
    const headers = new Headers();
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${BASE}/api/resume/analyze`, { method: "POST", body: form, headers });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail.detail ?? "Resume analysis failed");
    }
    return res.json() as Promise<ApiResumeAnalysis>;
  },

  async forgotPassword(email: string): Promise<void> {
    await request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },

  async loginWithGoogle(idToken: string, role: Role): Promise<ApiUser> {
    const data = await request<{ access_token: string; user: ApiUser }>(
      "/api/auth/google",
      { method: "POST", body: JSON.stringify({ id_token: idToken, role }) },
    );
    setToken(data.access_token);
    return data.user;
  },

  async setTargetRole(targetRole: string): Promise<void> {
    await request<{ target_role: string }>("/api/resume/target-role", {
      method: "POST",
      body: JSON.stringify({ target_role: targetRole }),
    });
  },

  async getResumeDraft(): Promise<ApiResumeDraft> {
    return request<ApiResumeDraft>("/api/resume/draft");
  },

  async saveResumeDraft(draft: ApiResumeDraft): Promise<ApiResumeDraft> {
    return request<ApiResumeDraft>("/api/resume/draft", {
      method: "PUT",
      body: JSON.stringify(draft),
    });
  },

  async polishResumeDraft(draft: ApiResumeDraft): Promise<ApiResumeDraft> {
    return request<ApiResumeDraft>("/api/resume/draft/polish", {
      method: "POST",
      body: JSON.stringify(draft),
    });
  },
};
