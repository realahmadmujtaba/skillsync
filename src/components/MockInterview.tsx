import { useEffect, useMemo, useState } from "react";
import {
  MessagesSquare,
  Clock,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, SectionLabel, ScoreRing, ProgressBar } from "./ui";
import { tracks, questionBank, type Track, type Question } from "../data.interview";
import { useAuth } from "../auth";
import { api } from "../api";

type Phase = "select" | "session" | "results";

type Scored = {
  question: Question;
  answer: string;
  score: number;
  strengths: string[];
  improvements: string[];
};

/**
 * Local heuristic feedback engine — stands in for the AI backend (step 3).
 * Scores on length, structure signals, and track-specific keyword coverage.
 */
function evaluate(q: Question, answer: string): Scored {
  const text = answer.toLowerCase();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const hits = q.keywords.filter((k) => text.includes(k.toLowerCase()));

  const lengthScore = Math.min(40, Math.round((words / 90) * 40));
  const keywordScore = Math.round((hits.length / q.keywords.length) * 45);
  const structureScore =
    (/because|therefore|first|then|finally|for example/.test(text) ? 8 : 0) +
    (words > 40 ? 7 : 0);
  const score = Math.max(
    words === 0 ? 0 : 12,
    Math.min(100, lengthScore + keywordScore + structureScore),
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (words >= 60) strengths.push("Thorough, well-developed answer.");
  if (hits.length >= Math.ceil(q.keywords.length / 2))
    strengths.push(`Covered key concepts: ${hits.slice(0, 3).join(", ")}.`);
  if (/first|then|finally|because/.test(text))
    strengths.push("Clear, structured reasoning.");

  if (words < 40) improvements.push("Add more depth — aim for 60+ words.");
  const missing = q.keywords.filter((k) => !text.includes(k.toLowerCase()));
  if (missing.length) improvements.push(`Mention: ${missing.slice(0, 3).join(", ")}.`);
  if (!/for example|e\.g\.|instance/.test(text))
    improvements.push("Ground it with a concrete example.");

  if (!strengths.length) strengths.push("You made an attempt — build on it.");
  return { question: q, answer, score, strengths, improvements };
}

export default function MockInterview() {
  const { mode } = useAuth();
  const [phase, setPhase] = useState<Phase>("select");
  const [track, setTrack] = useState<Track>("behavioral");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);

  const questions = questionBank[track];
  const meta = tracks.find((t) => t.key === track)!;

  useEffect(() => {
    if (phase !== "session") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const scored = useMemo(
    () => (phase === "results" ? questions.map((q, i) => evaluate(q, answers[i] ?? "")) : []),
    [phase, questions, answers],
  );
  const overall =
    scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : 0;

  // Persist the result to the backend when a session finishes online.
  useEffect(() => {
    if (phase === "results" && mode === "online" && scored.length) {
      const summary = scored.map((s) => `${s.score}: ${s.question.prompt}`).join(" | ");
      api.saveInterview(track, overall, summary).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function start(t: Track) {
    setTrack(t);
    setIdx(0);
    setAnswers(Array(questionBank[t].length).fill(""));
    setSeconds(0);
    setPhase("session");
  }

  function reset() {
    setPhase("select");
    setSeconds(0);
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  /* ---------- Track selection ---------- */
  if (phase === "select") {
    return (
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald">
            <MessagesSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Practice like it&rsquo;s the real thing
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pick a track, answer timed questions, and get instant AI-style
              feedback with a score and next steps.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tracks.map((t) => (
            <Card
              key={t.key}
              className="group flex flex-col p-5 transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_-20px_rgba(16,16,20,0.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-ink">{t.label}</span>
                <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                  <Clock className="h-3.5 w-3.5" /> {t.minutes}m
                </span>
              </div>
              <p className="mt-1 flex-1 text-sm text-muted">{t.blurb}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {questionBank[t.key].length} questions
                </span>
                <button
                  onClick={() => start(t.key)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3.5 py-2 text-sm font-semibold text-white transition-transform group-hover:-translate-y-0.5"
                >
                  Start <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Live session ---------- */
  if (phase === "session") {
    const q = questions[idx];
    const last = idx === questions.length - 1;
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SectionLabel>{meta.label} · Question {idx + 1} of {questions.length}</SectionLabel>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 font-mono text-sm font-semibold tabular text-ink">
            <Clock className="h-4 w-4 text-emerald" /> {mmss}
          </span>
        </div>

        <ProgressBar value={((idx + 1) / questions.length) * 100} />

        <Card className="p-6">
          <h2 className="font-display text-xl font-bold leading-snug text-ink">
            {q.prompt}
          </h2>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-soft/50 p-3.5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
            <p className="text-sm text-ink">{q.hint}</p>
          </div>

          <textarea
            value={answers[idx] ?? ""}
            onChange={(e) =>
              setAnswers((a) => {
                const next = [...a];
                next[idx] = e.target.value;
                return next;
              })
            }
            placeholder="Type your answer here… speak out loud too, as you would in a real interview."
            className="mt-4 h-52 w-full resize-none rounded-xl border border-line bg-paper/50 p-4 text-sm leading-relaxed text-fg outline-none transition-colors focus:border-emerald placeholder:text-muted"
          />
          <div className="mt-2 flex justify-end">
            <span className="font-mono text-xs text-muted">
              {(answers[idx] ?? "").trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-line-soft disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
          {last ? (
            <button
              onClick={() => setPhase("results")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 text-emerald" /> Get AI feedback
            </button>
          ) : (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Results ---------- */
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row">
        <ScoreRing value={overall} />
        <div className="min-w-0">
          <SectionLabel>{meta.label} · session complete</SectionLabel>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">
            {overall >= 80
              ? "Interview-ready — strong performance."
              : overall >= 60
                ? "Solid. A few tweaks and you're there."
                : "Good start — focus on the fixes below."}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Completed in {mmss}. Feedback is generated per answer — the same engine
            will run on the AI backend in the next step.
          </p>
          <button
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
          >
            <RotateCcw className="h-4 w-4" /> Practice again
          </button>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {scored.map((s, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base font-bold leading-snug text-ink">
                  {s.question.prompt}
                </h3>
              </div>
              <span
                className={`shrink-0 font-mono text-lg font-semibold tabular ${
                  s.score >= 80 ? "text-emerald" : s.score >= 60 ? "text-amber" : "text-rose"
                }`}
              >
                {s.score}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                </div>
                <ul className="flex flex-col gap-1.5">
                  {s.strengths.map((t, k) => (
                    <li key={k} className="text-sm text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
                  <AlertCircle className="h-3.5 w-3.5" /> To improve
                </div>
                <ul className="flex flex-col gap-1.5">
                  {s.improvements.length ? (
                    s.improvements.map((t, k) => (
                      <li key={k} className="text-sm text-muted">
                        {t}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted">Nothing major — nicely done.</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
