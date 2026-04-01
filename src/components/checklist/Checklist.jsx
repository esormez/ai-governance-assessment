import { useState } from "react";
import { BRAND } from "../../brand";

// ─── ETHICAL AI PRE-DEPLOYMENT CHECKLIST ───────────────────
// Aligned to AI Constitution pillars: Safety, Transparency, Accountability, Fairness

const CHECKLIST_SECTIONS = [
  {
    id: "safety",
    pillar: "Pillar — Safety",
    label: "Safety & Security",
    color: "#FF6B35",
    items: [
      { id: "s1", text: "System prompt includes behavioral constraints, scope limitations, and refusal patterns for out-of-scope queries", gate: "all" },
      { id: "s2", text: "Prompt injection defenses (direct and indirect) are active and tested", gate: "medium" },
      { id: "s3", text: "Content safety filtering is configured for the deployment context", gate: "medium" },
      { id: "s4", text: "AI kill switch exists and has been tested — can disable AI independently of the model provider", gate: "high" },
      { id: "s5", text: "Output validation gate prevents unreviewed AI content from flowing into downstream systems", gate: "high" },
      { id: "s6", text: "Security testing pipeline includes adversarial tests (injection, exfiltration, jailbreak) in CI/CD", gate: "high" },
      { id: "s7", text: "Incident response playbook is documented with severity tiers and escalation SLAs", gate: "medium" },
      { id: "s8", text: "Data classification policy defines which data categories are permitted for this AI system", gate: "all" },
    ],
  },
  {
    id: "transparency",
    pillar: "Pillar — Transparency",
    label: "Transparency & Explainability",
    color: "#7EC8E3",
    items: [
      { id: "t1", text: "End users are informed they are interacting with an AI system (disclosure notice visible)", gate: "all" },
      { id: "t2", text: "AI-generated outputs are distinguishable from human-authored content", gate: "all" },
      { id: "t3", text: "Confidence scoring is implemented and visible — low-confidence outputs are flagged", gate: "medium" },
      { id: "t4", text: "Citation / source attribution is enforced for factual claims", gate: "medium" },
      { id: "t5", text: "Explainability documentation exists: what data informs outputs, model logic, known limitations", gate: "high" },
      { id: "t6", text: "Decision lineage is traceable — outputs can be traced to underlying data sources", gate: "high" },
      { id: "t7", text: "Gen AI disclaimer banner is displayed with data classification, verification requirement, and prompt usage notice", gate: "all" },
      { id: "t8", text: "AI use is logged and registered — this system appears in the AI Use Case Registry", gate: "all" },
    ],
  },
  {
    id: "accountability",
    pillar: "Pillar — Accountability",
    label: "Accountability & Oversight",
    color: BRAND.accent,
    items: [
      { id: "a1", text: "A designated use case owner is identified with clear accountability for outcomes", gate: "all" },
      { id: "a2", text: "Use case has been registered through the formal AI intake process and approved", gate: "all" },
      { id: "a3", text: "Risk tier has been assigned and the corresponding governance blueprint requirements are met", gate: "all" },
      { id: "a4", text: "Human-in-the-loop review gate exists for high-risk query types (financial, compliance, regulatory)", gate: "medium" },
      { id: "a5", text: "Escalation paths are defined with named owners and SLAs", gate: "medium" },
      { id: "a6", text: "Regular governance review cadence is established (monthly or quarterly) with defined metrics", gate: "medium" },
      { id: "a7", text: "AI Decision Authority Matrix (RACI) is documented for this use case", gate: "high" },
      { id: "a8", text: "Structured audit logging captures user ID, timestamp, query, sources, and response hash", gate: "medium" },
      { id: "a9", text: "Audit logs are stored in an immutable store queryable by compliance and security teams", gate: "high" },
    ],
  },
  {
    id: "fairness",
    pillar: "Pillar — Fairness",
    label: "Fairness & Bias Prevention",
    color: BRAND.warn,
    items: [
      { id: "f1", text: "This use case has been confirmed as NOT prohibited under the AI Constitution", gate: "all" },
      { id: "f2", text: "Bias and fairness testing has been conducted across protected characteristics (race, gender, age, disability)", gate: "high" },
      { id: "f3", text: "Fairness metrics are defined for this use case with acceptable thresholds approved by Legal", gate: "high" },
      { id: "f4", text: "If the system scores, ranks, or profiles individuals — a DPIA has been completed", gate: "high" },
      { id: "f5", text: "Vulnerable populations are identified and safeguards are in place (if applicable)", gate: "medium" },
      { id: "f6", text: "Users can request human review of any AI-generated decision that affects them", gate: "medium" },
    ],
  },
  {
    id: "vendor",
    pillar: "Cross-Cutting",
    label: "Vendor & Data Governance",
    color: BRAND.muted,
    items: [
      { id: "v1", text: "Third-party AI vendor risk assessment has been completed (if vendor involved)", gate: "medium" },
      { id: "v2", text: "Vendor is contractually restricted from using organizational data for model training", gate: "medium" },
      { id: "v3", text: "Data retention and deletion policies are defined for prompt logs and model artifacts", gate: "all" },
      { id: "v4", text: "PII scanning has been performed on training data and retrieval documents", gate: "medium" },
      { id: "v5", text: "Model drift detection is configured with performance baselines and alerting", gate: "high" },
      { id: "v6", text: "All employees using this system have completed AI literacy training", gate: "all" },
      { id: "v7", text: "Regulatory compliance artifacts (audit trails, risk assessments) are generated and maintained", gate: "high" },
    ],
  },
];

const GATE_LABELS = { all: "All Tiers", medium: "Medium + High", high: "High Only" };
const GATE_COLORS = { all: BRAND.accent, medium: BRAND.warn, high: "#FF6B35" };

const wrap = { maxWidth: 800, margin: "0 auto", padding: "68px 24px 60px" };

export default function Checklist() {
  const [checks, setChecks] = useState({});
  const [riskTier, setRiskTier] = useState("high");
  const [phase, setPhase] = useState("checklist");

  const applicableItems = CHECKLIST_SECTIONS.flatMap((section) =>
    section.items.filter((item) => {
      if (item.gate === "all") return true;
      if (item.gate === "medium" && (riskTier === "medium" || riskTier === "high")) return true;
      if (item.gate === "high" && riskTier === "high") return true;
      return false;
    })
  );

  const totalApplicable = applicableItems.length;
  const totalChecked = applicableItems.filter((item) => checks[item.id]).length;
  const totalNA = applicableItems.filter((item) => checks[item.id] === "na").length;
  const totalPassed = applicableItems.filter((item) => checks[item.id] === true).length;
  const progress = totalApplicable > 0 ? ((totalChecked + totalNA) / totalApplicable) * 100 : 0;
  const allComplete = totalChecked + totalNA === totalApplicable;
  const passRate = totalApplicable > 0 ? Math.round(((totalPassed + totalNA) / totalApplicable) * 100) : 0;
  const failedItems = applicableItems.filter((item) => checks[item.id] === false);

  const handleCheck = (id, value) => setChecks((prev) => ({ ...prev, [id]: value }));

  if (phase === "results") {
    const passed = failedItems.length === 0;
    return (
      <div style={wrap}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Pre-Deployment Gate · Results
          </span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 32px", color: BRAND.white }}>Checklist Results</h2>

        {/* Result Card */}
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${passed ? BRAND.accent : BRAND.danger}`,
          borderRadius: 10, padding: 32, marginBottom: 24, textAlign: "center",
        }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{passed ? "✓" : "✗"}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: passed ? BRAND.accent : BRAND.danger, marginBottom: 8 }}>
            {passed ? "DEPLOYMENT APPROVED" : "DEPLOYMENT BLOCKED"}
          </div>
          <div style={{ fontSize: 13, color: BRAND.muted }}>
            {passed
              ? `All ${totalApplicable} applicable controls are met or marked N/A for ${riskTier} risk tier.`
              : `${failedItems.length} control${failedItems.length > 1 ? "s" : ""} failed. Remediate before deployment.`}
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 24 }}>
            <div><span style={{ fontSize: 28, fontWeight: 700, color: BRAND.accent }}>{totalPassed}</span><div style={{ fontSize: 9, color: BRAND.muted }}>PASSED</div></div>
            <div><span style={{ fontSize: 28, fontWeight: 700, color: BRAND.muted }}>{totalNA}</span><div style={{ fontSize: 9, color: BRAND.muted }}>N/A</div></div>
            <div><span style={{ fontSize: 28, fontWeight: 700, color: BRAND.danger }}>{failedItems.length}</span><div style={{ fontSize: 9, color: BRAND.muted }}>FAILED</div></div>
          </div>
        </div>

        {/* Failed Items */}
        {failedItems.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: BRAND.danger, letterSpacing: "0.15em", marginBottom: 12 }}>BLOCKING ITEMS</div>
            {failedItems.map((item) => {
              const section = CHECKLIST_SECTIONS.find((s) => s.items.some((i) => i.id === item.id));
              return (
                <div key={item.id} style={{
                  background: BRAND.bgCard, border: `1px solid ${BRAND.danger}44`,
                  borderLeft: `3px solid ${BRAND.danger}`, borderRadius: 8,
                  padding: "14px 18px", marginBottom: 8,
                }}>
                  <div style={{ fontSize: 10, color: section.color, marginBottom: 4 }}>{section.label}</div>
                  <div style={{ fontSize: 12, color: BRAND.light, lineHeight: 1.5 }}>{item.text}</div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => { setChecks({}); setPhase("checklist"); }} style={{
          background: "transparent", color: BRAND.accent, border: `1px solid ${BRAND.accent}`,
          borderRadius: 6, padding: "10px 20px", fontSize: 12, cursor: "pointer",
          fontFamily: "inherit", letterSpacing: "0.05em",
        }}>
          Restart Checklist
        </button>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Pre-Deployment Gate · Ethical AI Checklist
        </span>
      </div>
      <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 12px", color: BRAND.white }}>
        Ethical AI<br /><span style={{ color: BRAND.accent }}>Pre-Deployment Checklist</span>
      </h1>
      <p style={{ fontSize: 13, color: BRAND.muted, lineHeight: 1.6, maxWidth: 520, margin: "0 0 28px" }}>
        Complete this checklist before deploying any AI system to production.
        Controls are filtered by risk tier — higher tiers require more controls.
        Aligned to the four pillars of the AI Constitution.
      </p>

      {/* Risk Tier Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <span style={{ fontSize: 11, color: BRAND.muted, alignSelf: "center", marginRight: 8 }}>Risk Tier:</span>
        {["low", "medium", "high"].map((tier) => (
          <button key={tier} onClick={() => { setRiskTier(tier); setChecks({}); }} style={{
            background: riskTier === tier ? `${GATE_COLORS[tier === "low" ? "all" : tier]}18` : "transparent",
            border: `1px solid ${riskTier === tier ? GATE_COLORS[tier === "low" ? "all" : tier] : BRAND.border}`,
            borderRadius: 6, padding: "8px 16px", fontSize: 12, cursor: "pointer",
            color: riskTier === tier ? GATE_COLORS[tier === "low" ? "all" : tier] : BRAND.muted,
            fontFamily: "inherit", fontWeight: riskTier === tier ? 700 : 400,
            textTransform: "capitalize",
          }}>
            {tier} Risk
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ height: 2, background: BRAND.border, borderRadius: 1, marginBottom: 8 }}>
        <div style={{ height: "100%", background: BRAND.accent, width: `${progress}%`, transition: "width 0.4s ease", borderRadius: 1 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <span style={{ fontSize: 11, color: BRAND.muted }}>{totalChecked + totalNA}/{totalApplicable} reviewed</span>
        <span style={{ fontSize: 11, color: passRate >= 80 ? BRAND.accent : passRate >= 50 ? BRAND.warn : BRAND.muted }}>{passRate}% pass rate</span>
      </div>

      {/* Checklist Sections */}
      {CHECKLIST_SECTIONS.map((section) => {
        const visibleItems = section.items.filter((item) => {
          if (item.gate === "all") return true;
          if (item.gate === "medium" && (riskTier === "medium" || riskTier === "high")) return true;
          if (item.gate === "high" && riskTier === "high") return true;
          return false;
        });
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 3, height: 20, borderRadius: 2, background: section.color }} />
              <div>
                <div style={{ fontSize: 9, color: section.color, letterSpacing: "0.12em" }}>{section.pillar.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.white }}>{section.label}</div>
              </div>
            </div>

            {visibleItems.map((item) => {
              const val = checks[item.id];
              return (
                <div key={item.id} style={{
                  background: BRAND.bgCard, border: `1px solid ${val === true ? BRAND.accent + "44" : val === false ? BRAND.danger + "44" : BRAND.border}`,
                  borderRadius: 8, padding: "14px 18px", marginBottom: 8,
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
                    <button onClick={() => handleCheck(item.id, val === true ? undefined : true)} style={{
                      width: 22, height: 22, borderRadius: 4, border: `1px solid ${val === true ? BRAND.accent : BRAND.border}`,
                      background: val === true ? BRAND.accent : "transparent", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: val === true ? BRAND.bg : "transparent", fontWeight: 700,
                    }}>✓</button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 12, color: val === true ? BRAND.light : val === false ? BRAND.danger : BRAND.light,
                      lineHeight: 1.5, textDecoration: val === "na" ? "line-through" : "none",
                      opacity: val === "na" ? 0.5 : 1,
                    }}>
                      {item.text}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <span style={{
                        fontSize: 9, padding: "2px 6px", borderRadius: 3,
                        background: GATE_COLORS[item.gate] + "18", color: GATE_COLORS[item.gate],
                        letterSpacing: "0.06em",
                      }}>{GATE_LABELS[item.gate]}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => handleCheck(item.id, val === false ? undefined : false)} style={{
                      padding: "4px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600, cursor: "pointer",
                      background: val === false ? `${BRAND.danger}22` : "transparent",
                      border: `1px solid ${val === false ? BRAND.danger : BRAND.border}`,
                      color: val === false ? BRAND.danger : BRAND.muted, fontFamily: "inherit",
                    }}>FAIL</button>
                    <button onClick={() => handleCheck(item.id, val === "na" ? undefined : "na")} style={{
                      padding: "4px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600, cursor: "pointer",
                      background: val === "na" ? `${BRAND.muted}22` : "transparent",
                      border: `1px solid ${val === "na" ? BRAND.muted : BRAND.border}`,
                      color: BRAND.muted, fontFamily: "inherit",
                    }}>N/A</button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Submit */}
      <button onClick={() => setPhase("results")} disabled={!allComplete} style={{
        background: allComplete ? BRAND.accent : BRAND.bgCard,
        color: allComplete ? BRAND.bg : BRAND.muted,
        border: `1px solid ${allComplete ? BRAND.accent : BRAND.border}`,
        borderRadius: 6, padding: "14px 32px", fontSize: 14, fontWeight: 700,
        cursor: allComplete ? "pointer" : "default", fontFamily: "inherit",
        letterSpacing: "0.05em", transition: "all 0.2s",
      }}>
        {allComplete ? "Submit Checklist →" : `Review all ${totalApplicable - totalChecked - totalNA} remaining items`}
      </button>
    </div>
  );
}
