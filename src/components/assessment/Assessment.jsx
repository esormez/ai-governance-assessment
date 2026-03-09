import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { BRAND } from "../../brand";

const CATEGORIES = [
  {
    id: "data", label: "Data Governance", icon: "⬡",
    questions: [
      { id: "d1", text: "Are row-level security policies enforced at the data warehouse layer based on user identity?" },
      { id: "d2", text: "Is user identity propagated from the application layer through to the data warehouse on every query?" },
      { id: "d3", text: "Are data quality validation checks enforced at ingestion before records enter the warehouse?" },
      { id: "d4", text: "Are existing enterprise data governance policies integrated with AI system access controls?" },
    ],
  },
  {
    id: "semantic", label: "Semantic Layer", icon: "◈",
    questions: [
      { id: "s1", text: "Are business metric definitions version-controlled with a formal promotion and approval process?" },
      { id: "s2", text: "Is there a designated owner for each business metric definition in the semantic layer?" },
      { id: "s3", text: "Is there automated conflict detection to prevent divergent KPI definitions across teams?" },
      { id: "s4", text: "Are certified metrics clearly distinguished from experimental or draft definitions?" },
    ],
  },
  {
    id: "model", label: "Model & AI Controls", icon: "◎",
    questions: [
      { id: "m1", text: "Is there a formal evaluation pipeline that runs automated correctness and compliance checks on model outputs?" },
      { id: "m2", text: "Does the system enforce citation requirements and confidence scoring on every AI-generated response?" },
      { id: "m3", text: "Are behavioral guardrails and prompt injection defenses active in the system prompt?" },
      { id: "m4", text: "Is there a human-in-the-loop review gate for high-risk query types (financial, compliance, regulatory)?" },
    ],
  },
  {
    id: "observability", label: "Observability", icon: "◉",
    questions: [
      { id: "o1", text: "Is every AI query logged with a structured record: user ID, timestamp, query, retrieved sources, response hash?" },
      { id: "o2", text: "Are guardrail trigger events, confidence score degradation, and auth violations surfaced in a governance dashboard?" },
      { id: "o3", text: "Is there a user feedback mechanism (e.g. thumbs up/down) that feeds into a regular model review process?" },
      { id: "o4", text: "Are audit logs stored in an immutable store queryable by compliance and security teams?" },
    ],
  },
  {
    id: "operations", label: "Governance Operations", icon: "◇",
    questions: [
      { id: "op1", text: "Is there a designated AI Governance Owner with authority to pause or block use cases that exceed risk thresholds?" },
      { id: "op2", text: "Does a formal AI use case intake process exist — requiring approval before any new AI system or feature is built?" },
      { id: "op3", text: "Is there a documented incident response playbook with defined severity tiers and escalation SLAs?" },
      { id: "op4", text: "Is there a regular governance review cadence (monthly or quarterly) with defined metrics and accountable owners?" },
    ],
  },
];

const SCORE_LABELS = ["Not in place", "Partially in place", "Fully in place"];
const SCORE_COLORS = [BRAND.danger, BRAND.warn, BRAND.accent];

const RECS = {
  data: "Implement row-level security via identity-aware query policies. Enforce data quality validation at ingestion. Integrate with existing IAM/AD roles before production deployment.",
  semantic: "Establish version control for metric definitions with a formal promotion gate. Designate metric owners. Run a conflict detection scan across existing semantic layer definitions.",
  model: "Deploy an evaluation pipeline that runs automated checks on every model update. Enforce confidence scoring and citation requirements in the system prompt. Stand up a human review queue for high-risk query types.",
  observability: "Implement a structured audit log schema capturing user ID, query hash, retrieved chunks, and response hash on every query. Route guardrail trigger events to a governance dashboard with alerting thresholds.",
  operations: "Designate an AI Governance Owner at VP level or above. Launch a use case intake form — no AI build proceeds without a signed approval. Publish an incident response playbook with P1/P2/P3 severity tiers before go-live.",
};

function getMaturityLabel(pct) {
  if (pct < 30) return { label: "Critical Gap", color: BRAND.danger };
  if (pct < 55) return { label: "Developing", color: BRAND.warn };
  if (pct < 75) return { label: "Progressing", color: "#7EC8E3" };
  return { label: "Strong", color: BRAND.accent };
}

function RadarViz({ scores }) {
  const data = CATEGORIES.map((c) => ({
    category: c.label.split(" ")[0],
    score: scores[c.id] ?? 0,
    fullMark: 100,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke={BRAND.border} strokeOpacity={0.5} />
        <PolarAngleAxis dataKey="category" tick={{ fill: BRAND.light, fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
        <Radar name="Score" dataKey="score" stroke={BRAND.accent} fill={BRAND.accent} fillOpacity={0.15} strokeWidth={2} dot={{ fill: BRAND.accent, r: 3 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

const wrap = { maxWidth: 760, margin: "0 auto", padding: "68px 24px 60px" };

export default function Assessment() {
  const [answers, setAnswers] = useState({});
  const [activeCategory, setActiveCategory] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [orgName, setOrgName] = useState("");

  const allQuestions = CATEGORIES.flatMap((c) => c.questions);
  const answered = Object.keys(answers).length;
  const total = allQuestions.length;
  const progress = (answered / total) * 100;

  const categoryScores = {};
  CATEGORIES.forEach((c) => {
    const qs = c.questions;
    const catAnswered = qs.filter((q) => answers[q.id] !== undefined);
    if (catAnswered.length === 0) { categoryScores[c.id] = 0; return; }
    const sum = catAnswered.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
    categoryScores[c.id] = Math.round((sum / (qs.length * 2)) * 100);
  });

  const overallScore = answered === 0 ? 0 :
    Math.round(Object.values(categoryScores).reduce((a, b) => a + b, 0) / CATEGORIES.length);

  const priorities = [...CATEGORIES]
    .sort((a, b) => (categoryScores[a.id] ?? 0) - (categoryScores[b.id] ?? 0))
    .slice(0, 3);

  const handleAnswer = (qId, val) => setAnswers((prev) => ({ ...prev, [qId]: val }));
  const catProgress = (cat) => cat.questions.filter((q) => answers[q.id] !== undefined).length / cat.questions.length;

  const progressBar = { height: 2, background: BRAND.border, borderRadius: 1, marginBottom: 24 };
  const progressFill = { height: "100%", background: BRAND.accent, width: `${progress}%`, transition: "width 0.4s ease", borderRadius: 1 };

  // INTRO
  if (phase === "intro") return (
    <div style={{ ...wrap, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "calc(100vh - 52px)" }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>Assessment Tool · v1.0</span>
      </div>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 20px", color: BRAND.white }}>
        AI Governance<br /><span style={{ color: BRAND.accent }}>Readiness Assessment</span>
      </h1>
      <p style={{ fontSize: 15, color: BRAND.light, lineHeight: 1.7, maxWidth: 520, margin: "0 0 40px" }}>
        20 questions across five governance domains. Understand your current posture,
        identify critical gaps, and get a prioritized action plan — in under 10 minutes.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
        {CATEGORIES.map((c) => (
          <div key={c.id} style={{
            padding: "8px 14px", background: BRAND.bgCard,
            border: `1px solid ${BRAND.border}`, borderRadius: 6,
            fontSize: 12, color: BRAND.muted, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ color: BRAND.accent }}>{c.icon}</span> {c.label}
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 12, color: BRAND.muted, display: "block", marginBottom: 8, letterSpacing: "0.1em" }}>
          ORGANIZATION NAME (OPTIONAL)
        </label>
        <input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g. Acme Financial Group"
          style={{
            background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
            borderRadius: 6, padding: "12px 16px", fontSize: 14,
            color: BRAND.white, width: "100%", maxWidth: 360,
            outline: "none", fontFamily: "inherit",
          }}
        />
      </div>
      <button
        onClick={() => setPhase("assessment")}
        style={{
          background: BRAND.accent, color: BRAND.bg, border: "none",
          borderRadius: 6, padding: "14px 32px", fontSize: 14, fontWeight: 700,
          cursor: "pointer", letterSpacing: "0.05em", width: "fit-content",
        }}
      >
        Begin Assessment →
      </button>
    </div>
  );

  // RESULTS
  if (phase === "results") {
    const maturity = getMaturityLabel(overallScore);
    return (
      <div style={wrap}>
        <div style={progressBar}><div style={{ ...progressFill, width: "100%" }} /></div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {orgName || "Your Organization"} · Governance Report
          </span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 32px", color: BRAND.white }}>Readiness Assessment Results</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: 28 }}>
            <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 16 }}>OVERALL MATURITY</div>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, color: maturity.color, marginBottom: 8 }}>
              {overallScore}<span style={{ fontSize: 28 }}>%</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: maturity.color, marginBottom: 20 }}>{maturity.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: BRAND.muted, marginBottom: 3 }}>
                    <span>{c.label}</span><span style={{ color: BRAND.light }}>{categoryScores[c.id]}%</span>
                  </div>
                  <div style={{ height: 4, background: BRAND.border, borderRadius: 2 }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${categoryScores[c.id]}%`,
                      background: categoryScores[c.id] < 30 ? BRAND.danger : categoryScores[c.id] < 60 ? BRAND.warn : BRAND.accent,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 4, paddingLeft: 12 }}>COVERAGE MAP</div>
            <RadarViz scores={categoryScores} />
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 16 }}>PRIORITY ACTIONS</div>
          {priorities.map((cat, i) => (
            <div key={cat.id} style={{
              background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
              borderLeft: `3px solid ${i === 0 ? BRAND.danger : i === 1 ? BRAND.warn : BRAND.accent}`,
              borderRadius: 8, padding: "20px 24px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                  color: i === 0 ? BRAND.danger : i === 1 ? BRAND.warn : BRAND.accent,
                  background: `${i === 0 ? BRAND.danger : i === 1 ? BRAND.warn : BRAND.accent}18`,
                  padding: "3px 8px", borderRadius: 4,
                }}>PRIORITY {i + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.white }}>{cat.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: BRAND.muted }}>{categoryScores[cat.id]}% mature</span>
              </div>
              <p style={{ fontSize: 13, color: BRAND.light, lineHeight: 1.65, margin: 0 }}>{RECS[cat.id]}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${BRAND.bgMid}, ${BRAND.bgCard})`,
          border: `1px solid ${BRAND.accent}44`, borderRadius: 10, padding: "24px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.white, marginBottom: 4 }}>Ready to close these gaps?</div>
            <div style={{ fontSize: 13, color: BRAND.muted }}>Intralytics can scope a governance readiness sprint in 2 weeks.</div>
          </div>
          <button
            onClick={() => { setAnswers({}); setPhase("intro"); setActiveCategory(0); }}
            style={{
              background: "transparent", color: BRAND.accent,
              border: `1px solid ${BRAND.accent}`, borderRadius: 6,
              padding: "10px 20px", fontSize: 12, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "0.05em",
            }}
          >
            Restart Assessment
          </button>
        </div>
      </div>
    );
  }

  // ASSESSMENT
  const currentCat = CATEGORIES[activeCategory];
  return (
    <div style={wrap}>
      <div style={progressBar}><div style={progressFill} /></div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -16, marginBottom: 24 }}>
        <span style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.05em" }}>{answered}/{total}</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
        {CATEGORIES.map((c, i) => {
          const pct = catProgress(c);
          const isActive = i === activeCategory;
          return (
            <button key={c.id} onClick={() => setActiveCategory(i)} style={{
              background: isActive ? BRAND.bgCard : "transparent",
              border: `1px solid ${isActive ? BRAND.accent : BRAND.border}`,
              borderRadius: 6, padding: "8px 14px", fontSize: 11,
              color: isActive ? BRAND.accent : BRAND.muted,
              cursor: "pointer", fontFamily: "inherit",
              letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              <span>{c.icon}</span>
              <span>{c.label}</span>
              {pct === 1 && <span style={{ color: BRAND.accent, fontSize: 10 }}>✓</span>}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Domain {activeCategory + 1} of {CATEGORIES.length}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: BRAND.white }}>{currentCat.label}</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {currentCat.questions.map((q, qi) => {
          const val = answers[q.id];
          return (
            <div key={q.id} style={{
              background: BRAND.bgCard,
              border: `1px solid ${val !== undefined ? BRAND.accent + "44" : BRAND.border}`,
              borderRadius: 10, padding: "20px 24px",
              transition: "border-color 0.2s",
            }}>
              <div style={{ fontSize: 13, color: BRAND.light, lineHeight: 1.6, marginBottom: 16 }}>
                <span style={{ color: BRAND.muted, marginRight: 8, fontSize: 11 }}>{String(qi + 1).padStart(2, "0")}</span>
                {q.text}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {SCORE_LABELS.map((label, score) => (
                  <button key={score} onClick={() => handleAnswer(q.id, score)} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 6, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 11, letterSpacing: "0.03em",
                    transition: "all 0.15s",
                    background: val === score ? SCORE_COLORS[score] + "22" : "transparent",
                    border: `1px solid ${val === score ? SCORE_COLORS[score] : BRAND.border}`,
                    color: val === score ? SCORE_COLORS[score] : BRAND.muted,
                    fontWeight: val === score ? 700 : 400,
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
        <button
          onClick={() => setActiveCategory(Math.max(0, activeCategory - 1))}
          disabled={activeCategory === 0}
          style={{
            background: "transparent", border: `1px solid ${BRAND.border}`,
            borderRadius: 6, padding: "12px 24px", fontSize: 13,
            color: activeCategory === 0 ? BRAND.border : BRAND.muted,
            cursor: activeCategory === 0 ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Previous
        </button>
        {activeCategory < CATEGORIES.length - 1 ? (
          <button
            onClick={() => setActiveCategory(activeCategory + 1)}
            style={{
              background: BRAND.accent, color: BRAND.bg, border: "none",
              borderRadius: 6, padding: "12px 28px", fontSize: 13,
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Next Domain →
          </button>
        ) : (
          <button
            onClick={() => setPhase("results")}
            style={{
              background: answered === total ? BRAND.accent : BRAND.bgCard,
              color: answered === total ? BRAND.bg : BRAND.muted,
              border: `1px solid ${answered === total ? BRAND.accent : BRAND.border}`,
              borderRadius: 6, padding: "12px 28px", fontSize: 13,
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            View Results →
          </button>
        )}
      </div>
    </div>
  );
}
