import type { ReactNode } from "react";
import type { ApiResumeDraft } from "../api";

export function ResumeReview({ draft }: { draft: ApiResumeDraft }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-lg font-bold text-ink">{draft.name || "Your name"}</h3>
        <p className="text-sm text-muted">
          {[draft.email, draft.phone].filter(Boolean).join(" · ")}
        </p>
        {draft.summary && <p className="mt-2 text-sm text-ink">{draft.summary}</p>}
      </div>
      {draft.education.length > 0 && (
        <ReviewSection title="Education">
          {draft.education.map((e, i) => (
            <div key={i} className="text-sm text-ink">
              <span className="font-semibold">{e.school}</span> — {e.degree}{" "}
              <span className="text-muted">
                ({e.start}–{e.end})
              </span>
            </div>
          ))}
        </ReviewSection>
      )}
      {draft.experience.length > 0 && (
        <ReviewSection title="Experience">
          {draft.experience.map((e, i) => (
            <div key={i} className="text-sm text-ink">
              <div>
                <span className="font-semibold">{e.role}</span> · {e.company}{" "}
                <span className="text-muted">
                  ({e.start}–{e.end})
                </span>
              </div>
              <ul className="ml-4 list-disc text-muted">
                {e.bullets.filter(Boolean).map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </ReviewSection>
      )}
      {draft.projects.length > 0 && (
        <ReviewSection title="Projects">
          {draft.projects.map((p, i) => (
            <div key={i} className="text-sm text-ink">
              <div>
                <span className="font-semibold">{p.name}</span>{" "}
                <span className="text-muted">{p.tech}</span>
              </div>
              <ul className="ml-4 list-disc text-muted">
                {p.bullets.filter(Boolean).map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </ReviewSection>
      )}
      {draft.skills.length > 0 && (
        <ReviewSection title="Skills">
          <p className="text-sm text-ink">{draft.skills.join(", ")}</p>
        </ReviewSection>
      )}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {title}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
