export type Track = "behavioral" | "dsa" | "system" | "frontend";

export type Question = {
  prompt: string;
  hint: string;
  keywords: string[];
};

export const tracks: {
  key: Track;
  label: string;
  blurb: string;
  minutes: number;
}[] = [
  { key: "behavioral", label: "Behavioral", blurb: "STAR-method stories & culture fit", minutes: 15 },
  { key: "dsa", label: "Data Structures", blurb: "Algorithmic thinking & complexity", minutes: 25 },
  { key: "system", label: "System Design", blurb: "Scalability & architecture tradeoffs", minutes: 30 },
  { key: "frontend", label: "Frontend", blurb: "React, performance & UX depth", minutes: 20 },
];

export const questionBank: Record<Track, Question[]> = {
  behavioral: [
    {
      prompt: "Tell me about a time you disagreed with a teammate. How did you resolve it?",
      hint: "Use STAR: Situation, Task, Action, Result. Focus on your specific actions.",
      keywords: ["situation", "listened", "compromise", "outcome", "team", "result"],
    },
    {
      prompt: "Describe a project you're proud of and the biggest challenge you overcame.",
      hint: "Quantify impact. Name the challenge, your decision, and the measurable result.",
      keywords: ["challenge", "decision", "impact", "learned", "shipped", "users"],
    },
    {
      prompt: "How do you prioritize when everything feels urgent?",
      hint: "Show a framework (impact vs. effort), and give a concrete example.",
      keywords: ["priority", "impact", "deadline", "framework", "communicate"],
    },
  ],
  dsa: [
    {
      prompt: "Find the length of the longest substring without repeating characters. Explain your approach and complexity.",
      hint: "Think sliding window with a hash set. State time and space complexity.",
      keywords: ["sliding window", "hash", "set", "o(n)", "pointer", "complexity"],
    },
    {
      prompt: "Given a binary tree, return its level-order traversal. Walk through your solution.",
      hint: "BFS with a queue. Mention how you separate levels.",
      keywords: ["bfs", "queue", "level", "traversal", "o(n)"],
    },
  ],
  system: [
    {
      prompt: "Design a URL shortener like bit.ly. Cover the API, storage, and how you scale reads.",
      hint: "Discuss hashing/base62, DB choice, caching (Redis), and read/write ratio.",
      keywords: ["base62", "hash", "cache", "redis", "database", "load balancer", "shard"],
    },
    {
      prompt: "How would you design a notification system that handles millions of users?",
      hint: "Talk about queues, fan-out, workers, retries, and delivery guarantees.",
      keywords: ["queue", "fan-out", "worker", "retry", "kafka", "scale", "async"],
    },
  ],
  frontend: [
    {
      prompt: "A React list re-renders slowly with 10k rows. How do you diagnose and fix it?",
      hint: "Mention profiling, memoization, virtualization, and key stability.",
      keywords: ["virtualization", "memo", "usememo", "profiler", "keys", "render"],
    },
    {
      prompt: "Explain how you'd make a component accessible and keyboard-navigable.",
      hint: "Cover semantic HTML, ARIA, focus management, and contrast.",
      keywords: ["aria", "focus", "semantic", "keyboard", "contrast", "role"],
    },
  ],
};
