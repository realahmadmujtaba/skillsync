export const student = {
  name: "Aarav Menon",
  role: "Final-year B.Tech · Information Technology",
  target: "Software Engineer Intern",
  initials: "AM",
  readiness: 78,
};

export const readinessTrend = [
  { month: "Mar", score: 41 },
  { month: "Apr", score: 48 },
  { month: "May", score: 55 },
  { month: "Jun", score: 62 },
  { month: "Jul", score: 71 },
  { month: "Aug", score: 78 },
];

export const skillCoverage = [
  { skill: "Data Structures", have: 88 },
  { skill: "System Design", have: 54 },
  { skill: "React / TS", have: 82 },
  { skill: "Databases", have: 70 },
  { skill: "APIs / Backend", have: 66 },
  { skill: "Testing", have: 45 },
];

export const funnel = [
  { stage: "Applied", value: 24 },
  { stage: "Screening", value: 11 },
  { stage: "Interview", value: 6 },
  { stage: "Offer", value: 2 },
];

export type GapItem = {
  skill: string;
  status: "strong" | "growing" | "gap";
  note: string;
};

export const gapAnalysis: GapItem[] = [
  { skill: "Data Structures & Algorithms", status: "strong", note: "Consistent problem-solving; 320+ solved." },
  { skill: "React + TypeScript", status: "strong", note: "Two shipped projects with typed contracts." },
  { skill: "REST & API design", status: "growing", note: "Solid basics; add auth + rate limiting depth." },
  { skill: "System Design", status: "gap", note: "No evidence of scalability/architecture work." },
  { skill: "Automated Testing", status: "gap", note: "Add unit + one E2E flow to a project." },
  { skill: "Cloud & CI/CD", status: "growing", note: "Docker seen; add a GitHub Actions pipeline." },
];

export type RoadmapStep = {
  title: string;
  weeks: string;
  focus: string;
  done: boolean;
  progress: number;
};

export const roadmap: RoadmapStep[] = [
  { title: "Close the System Design gap", weeks: "Weeks 1–2", focus: "Load balancing, caching, DB scaling, design a URL shortener.", done: false, progress: 35 },
  { title: "Add testing to SkillSync", weeks: "Week 3", focus: "Vitest unit tests + one Playwright E2E flow.", done: false, progress: 10 },
  { title: "Ship a CI/CD pipeline", weeks: "Week 4", focus: "GitHub Actions: lint → test → build → deploy.", done: false, progress: 0 },
  { title: "Deepen DSA for interviews", weeks: "Ongoing", focus: "Graphs, DP, and 3 mock interviews.", done: true, progress: 100 },
];

export type Opportunity = {
  company: string;
  role: string;
  location: string;
  match: number;
  tags: string[];
  posted: string;
};

export const opportunities: Opportunity[] = [
  { company: "Northwind Labs", role: "Software Engineer Intern", location: "Bengaluru · Hybrid", match: 92, tags: ["React", "TypeScript", "Node"], posted: "2d ago" },
  { company: "Helios Systems", role: "Backend Intern", location: "Remote", match: 84, tags: ["Node", "PostgreSQL", "APIs"], posted: "4d ago" },
  { company: "Vantage AI", role: "ML Platform Intern", location: "Hyderabad · On-site", match: 71, tags: ["Python", "ML", "Docker"], posted: "1w ago" },
  { company: "Cobalt Studio", role: "Frontend Intern", location: "Remote", match: 88, tags: ["React", "Tailwind", "UX"], posted: "1w ago" },
  { company: "Meridian Cloud", role: "Platform Engineer Intern", location: "Pune · Hybrid", match: 63, tags: ["Kubernetes", "CI/CD", "Go"], posted: "2w ago" },
];

export type Application = {
  id: string;
  company: string;
  role: string;
  match: number;
  stage: "applied" | "screening" | "interview" | "offer";
};

export const applications: Application[] = [
  { id: "a1", company: "Cobalt Studio", role: "Frontend Intern", match: 88, stage: "applied" },
  { id: "a2", company: "Meridian Cloud", role: "Platform Engineer Intern", match: 63, stage: "applied" },
  { id: "a3", company: "Helios Systems", role: "Backend Intern", match: 84, stage: "screening" },
  { id: "a4", company: "Vantage AI", role: "ML Platform Intern", match: 71, stage: "screening" },
  { id: "a5", company: "Northwind Labs", role: "Software Engineer Intern", match: 92, stage: "interview" },
  { id: "a6", company: "Lumen Data", role: "SWE Intern", match: 79, stage: "offer" },
];

export const stageMeta: Record<Application["stage"], { label: string }> = {
  applied: { label: "Applied" },
  screening: { label: "Screening" },
  interview: { label: "Interview" },
  offer: { label: "Offer" },
};
