import { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Sparkles, Plus, Trash2, Download, Loader2 } from "lucide-react";
import { Card, SectionLabel } from "./ui";
import { ResumeReview } from "./ResumeReview";
import { api, type ApiResumeDraft } from "../api";

const EMPTY_DRAFT: ApiResumeDraft = {
  name: "",
  email: "",
  phone: "",
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
};

const STEPS = [
  "Contact",
  "Education",
  "Experience",
  "Projects",
  "Skills",
  "Review",
] as const;

const inputClass =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-emerald";
const labelClass = "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted";

export default function ResumeBuilder() {
  const [draft, setDraft] = useState<ApiResumeDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getResumeDraft()
      .then((d) => {
        if (!cancelled) setDraft(d);
      })
      .catch(() => {
        /* start with an empty draft */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveDraft(next: ApiResumeDraft) {
    setSaving(true);
    setError(null);
    try {
      await api.saveResumeDraft(next);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft");
    } finally {
      setSaving(false);
    }
  }

  async function polish() {
    setPolishing(true);
    setError(null);
    try {
      const polished = await api.polishResumeDraft(draft);
      setDraft(polished);
      await api.saveResumeDraft(polished);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Polishing failed");
    } finally {
      setPolishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your draft…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                step === i
                  ? "border-emerald bg-emerald-soft text-emerald"
                  : "border-line bg-card text-muted hover:border-ink/30"
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>
      </Card>

      {error && (
        <p className="rounded-lg bg-[#fae6ea] px-3 py-2 text-sm text-rose">{error}</p>
      )}

      <Card className="p-6">
        {step === 0 && <ContactStep draft={draft} onChange={setDraft} />}
        {step === 1 && <EducationStep draft={draft} onChange={setDraft} />}
        {step === 2 && <ExperienceStep draft={draft} onChange={setDraft} />}
        {step === 3 && <ProjectsStep draft={draft} onChange={setDraft} />}
        {step === 4 && <SkillsStep draft={draft} onChange={setDraft} />}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <SectionLabel>Review</SectionLabel>
            <ResumeReview draft={draft} />
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
            >
              Next
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedAt && !saving && (
            <span className="text-xs text-muted">Draft saved</span>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => saveDraft(draft)}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={polishing}
            onClick={polish}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald/90 disabled:opacity-60"
          >
            {polishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Polish with AI
          </button>
          <PDFDownloadLink
            document={<ResumePdfDocument draft={draft} />}
            fileName={`${(draft.name || "resume").replace(/\s+/g, "_")}.pdf`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}

type StepProps = {
  draft: ApiResumeDraft;
  onChange: (d: ApiResumeDraft) => void;
};

function ContactStep({ draft, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Contact info</SectionLabel>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Full name</label>
          <input
            className={inputClass}
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            value={draft.email}
            onChange={(e) => onChange({ ...draft, email: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={draft.phone}
            onChange={(e) => onChange({ ...draft, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Professional summary</label>
        <textarea
          rows={4}
          className={inputClass}
          placeholder="2-3 sentences summarizing your background and target role…"
          value={draft.summary}
          onChange={(e) => onChange({ ...draft, summary: e.target.value })}
        />
      </div>
    </div>
  );
}

function EducationStep({ draft, onChange }: StepProps) {
  function update(i: number, patch: Partial<ApiResumeDraft["education"][number]>) {
    const education = draft.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    onChange({ ...draft, education });
  }
  function add() {
    onChange({
      ...draft,
      education: [...draft.education, { school: "", degree: "", start: "", end: "" }],
    });
  }
  function remove(i: number) {
    onChange({ ...draft, education: draft.education.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Education</SectionLabel>
        <AddButton onClick={add} label="Add school" />
      </div>
      {draft.education.length === 0 && <EmptyHint text="No education added yet." />}
      {draft.education.map((edu, i) => (
        <div key={i} className="relative rounded-xl border border-line p-4">
          <RemoveButton onClick={() => remove(i)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>School</label>
              <input
                className={inputClass}
                value={edu.school}
                onChange={(e) => update(i, { school: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Degree</label>
              <input
                className={inputClass}
                value={edu.degree}
                onChange={(e) => update(i, { degree: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Start</label>
              <input
                className={inputClass}
                placeholder="2022"
                value={edu.start}
                onChange={(e) => update(i, { start: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input
                className={inputClass}
                placeholder="2026 (or Present)"
                value={edu.end}
                onChange={(e) => update(i, { end: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceStep({ draft, onChange }: StepProps) {
  function update(i: number, patch: Partial<ApiResumeDraft["experience"][number]>) {
    const experience = draft.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    onChange({ ...draft, experience });
  }
  function add() {
    onChange({
      ...draft,
      experience: [
        ...draft.experience,
        { company: "", role: "", start: "", end: "", bullets: [] },
      ],
    });
  }
  function remove(i: number) {
    onChange({ ...draft, experience: draft.experience.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Experience</SectionLabel>
        <AddButton onClick={add} label="Add role" />
      </div>
      {draft.experience.length === 0 && <EmptyHint text="No experience added yet — that's fine, internships count too." />}
      {draft.experience.map((exp, i) => (
        <div key={i} className="relative rounded-xl border border-line p-4">
          <RemoveButton onClick={() => remove(i)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Company</label>
              <input
                className={inputClass}
                value={exp.company}
                onChange={(e) => update(i, { company: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <input
                className={inputClass}
                value={exp.role}
                onChange={(e) => update(i, { role: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Start</label>
              <input
                className={inputClass}
                value={exp.start}
                onChange={(e) => update(i, { start: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input
                className={inputClass}
                placeholder="Present"
                value={exp.end}
                onChange={(e) => update(i, { end: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Bullet points (one per line)</label>
            <textarea
              rows={4}
              className={inputClass}
              placeholder={"Built X that did Y\nImproved Z by N%"}
              value={exp.bullets.join("\n")}
              onChange={(e) =>
                update(i, { bullets: e.target.value.split("\n") })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsStep({ draft, onChange }: StepProps) {
  function update(i: number, patch: Partial<ApiResumeDraft["projects"][number]>) {
    const projects = draft.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    onChange({ ...draft, projects });
  }
  function add() {
    onChange({ ...draft, projects: [...draft.projects, { name: "", tech: "", bullets: [] }] });
  }
  function remove(i: number) {
    onChange({ ...draft, projects: draft.projects.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Projects</SectionLabel>
        <AddButton onClick={add} label="Add project" />
      </div>
      {draft.projects.length === 0 && <EmptyHint text="No projects added yet." />}
      {draft.projects.map((proj, i) => (
        <div key={i} className="relative rounded-xl border border-line p-4">
          <RemoveButton onClick={() => remove(i)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Project name</label>
              <input
                className={inputClass}
                value={proj.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Tech used</label>
              <input
                className={inputClass}
                placeholder="React, FastAPI, Postgres…"
                value={proj.tech}
                onChange={(e) => update(i, { tech: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Bullet points (one per line)</label>
            <textarea
              rows={4}
              className={inputClass}
              value={proj.bullets.join("\n")}
              onChange={(e) => update(i, { bullets: e.target.value.split("\n") })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsStep({ draft, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Skills</SectionLabel>
      <div>
        <label className={labelClass}>Comma-separated list</label>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="Python, React, SQL, Docker…"
          value={draft.skills.join(", ")}
          onChange={(e) =>
            onChange({
              ...draft,
              skills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
      {draft.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {draft.skills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-line bg-paper/60 px-2.5 py-1 text-xs font-medium text-ink"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-emerald hover:text-emerald"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-3 rounded-lg p-1.5 text-muted transition-colors hover:bg-[#fae6ea] hover:text-rose"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}

const pdfStyles = StyleSheet.create({
  page: { padding: 36, fontSize: 10.5, fontFamily: "Helvetica", color: "#1c1c1c" },
  name: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  contact: { fontSize: 9.5, color: "#555", marginBottom: 10 },
  summary: { marginBottom: 12, lineHeight: 1.4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "1 solid #ccc",
    paddingBottom: 2,
  },
  entry: { marginBottom: 8 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontWeight: 700 },
  entrySub: { color: "#555" },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1, lineHeight: 1.35 },
});

function ResumePdfDocument({ draft }: { draft: ApiResumeDraft }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.name}>{draft.name || "Your Name"}</Text>
        <Text style={pdfStyles.contact}>
          {[draft.email, draft.phone].filter(Boolean).join("  ·  ")}
        </Text>
        {draft.summary ? <Text style={pdfStyles.summary}>{draft.summary}</Text> : null}

        {draft.experience.length > 0 && (
          <View>
            <Text style={pdfStyles.sectionTitle}>Experience</Text>
            {draft.experience.map((e, i) => (
              <View key={i} style={pdfStyles.entry}>
                <View style={pdfStyles.entryHeader}>
                  <Text style={pdfStyles.entryTitle}>
                    {e.role} · {e.company}
                  </Text>
                  <Text style={pdfStyles.entrySub}>
                    {e.start}–{e.end}
                  </Text>
                </View>
                {e.bullets.filter(Boolean).map((b, bi) => (
                  <View key={bi} style={pdfStyles.bullet}>
                    <Text style={pdfStyles.bulletDot}>•</Text>
                    <Text style={pdfStyles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {draft.projects.length > 0 && (
          <View>
            <Text style={pdfStyles.sectionTitle}>Projects</Text>
            {draft.projects.map((p, i) => (
              <View key={i} style={pdfStyles.entry}>
                <View style={pdfStyles.entryHeader}>
                  <Text style={pdfStyles.entryTitle}>{p.name}</Text>
                  <Text style={pdfStyles.entrySub}>{p.tech}</Text>
                </View>
                {p.bullets.filter(Boolean).map((b, bi) => (
                  <View key={bi} style={pdfStyles.bullet}>
                    <Text style={pdfStyles.bulletDot}>•</Text>
                    <Text style={pdfStyles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {draft.education.length > 0 && (
          <View>
            <Text style={pdfStyles.sectionTitle}>Education</Text>
            {draft.education.map((e, i) => (
              <View key={i} style={pdfStyles.entry}>
                <View style={pdfStyles.entryHeader}>
                  <Text style={pdfStyles.entryTitle}>{e.school}</Text>
                  <Text style={pdfStyles.entrySub}>
                    {e.start}–{e.end}
                  </Text>
                </View>
                <Text style={pdfStyles.entrySub}>{e.degree}</Text>
              </View>
            ))}
          </View>
        )}

        {draft.skills.length > 0 && (
          <View>
            <Text style={pdfStyles.sectionTitle}>Skills</Text>
            <Text>{draft.skills.join("  ·  ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
