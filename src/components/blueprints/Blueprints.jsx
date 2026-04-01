import { useState } from "react";
import { BRAND } from "../../brand";

// ─── GOVERNANCE BLUEPRINT REQUIREMENTS BY TIER ─────────────
// Each control maps to a pillar and specifies what is required at each risk tier.
// "none" = not required, "recommended" = should have, "required" = must have, "mandatory" = hard gate

const PILLARS = {
  p2: { label: "Pillar 2 — Policies & Controls", color: BRAND.accent },
  p3: { label: "Pillar 3 — Oversight Systems (TRiSM)", color: "#7EC8E3" },
};

const CONTROL_CATEGORIES = [
  {
    id: "guardrails",
    label: "Guardrails & Safety",
    pillar: "p2",
    controls: [
      { id: "g1", label: "System prompt behavioral constraints", low: "recommended", medium: "required", high: "mandatory" },
      { id: "g2", label: "Prompt injection defenses (direct & indirect)", low: "none", medium: "required", high: "mandatory" },
      { id: "g3", label: "Content safety filtering (hate, violence, self-harm)", low: "recommended", medium: "required", high: "mandatory" },
      { id: "g4", label: "Output validation gate before downstream systems", low: "none", medium: "recommended", high: "mandatory" },
      { id: "g5", label: "AI kill switch (independent of model provider)", low: "none", medium: "recommended", high: "mandatory" },
      { id: "g6", label: "Prohibited use case enforcement (technical blocks)", low: "recommended", medium: "required", high: "mandatory" },
    ],
  },
  {
    id: "hitl",
    label: "Human-in-the-Loop",
    pillar: "p2",
    controls: [
      { id: "h1", label: "Human review queue for low-confidence outputs", low: "none", medium: "required", high: "mandatory" },
      { id: "h2", label: "Human approval gate for high-risk decisions", low: "none", medium: "recommended", high: "mandatory" },
      { id: "h3", label: "Escalation paths with defined SLAs", low: "none", medium: "recommended", high: "mandatory" },
      { id: "h4", label: "Override mechanism for AI recommendations", low: "recommended", medium: "required", high: "mandatory" },
    ],
  },
  {
    id: "fairness",
    label: "Fairness & Bias",
    pillar: "p2",
    controls: [
      { id: "f1", label: "Bias testing across protected characteristics", low: "none", medium: "recommended", high: "mandatory" },
      { id: "f2", label: "Fairness metrics defined per use case", low: "none", medium: "recommended", high: "mandatory" },
      { id: "f3", label: "Demographic parity / equalized odds evaluation", low: "none", medium: "none", high: "mandatory" },
      { id: "f4", label: "Third-party fairness audit", low: "none", medium: "none", high: "recommended" },
    ],
  },
  {
    id: "transparency",
    label: "Transparency & Explainability",
    pillar: "p2",
    controls: [
      { id: "t1", label: "AI disclosure to end users", low: "required", medium: "required", high: "mandatory" },
      { id: "t2", label: "Citation / source attribution on outputs", low: "recommended", medium: "required", high: "mandatory" },
      { id: "t3", label: "Confidence scoring on responses", low: "none", medium: "required", high: "mandatory" },
      { id: "t4", label: "Explainability documentation (data, model, limitations)", low: "none", medium: "recommended", high: "mandatory" },
      { id: "t5", label: "Decision lineage traceability", low: "none", medium: "none", high: "mandatory" },
    ],
  },
  {
    id: "data",
    label: "Data Governance & Privacy",
    pillar: "p2",
    controls: [
      { id: "d1", label: "Data classification policy for AI use", low: "required", medium: "required", high: "mandatory" },
      { id: "d2", label: "Row-level security / identity propagation", low: "none", medium: "recommended", high: "mandatory" },
      { id: "d3", label: "PII scanning in training / retrieval data", low: "none", medium: "required", high: "mandatory" },
      { id: "d4", label: "Data Protection Impact Assessment (DPIA)", low: "none", medium: "recommended", high: "mandatory" },
      { id: "d5", label: "Vendor data training opt-out (contractual)", low: "recommended", medium: "required", high: "mandatory" },
      { id: "d6", label: "Prompt / response retention policy", low: "recommended", medium: "required", high: "mandatory" },
    ],
  },
  {
    id: "observability",
    label: "Observability & Monitoring",
    pillar: "p3",
    controls: [
      { id: "o1", label: "Structured audit logging (user, query, response hash)", low: "recommended", medium: "required", high: "mandatory" },
      { id: "o2", label: "Governance dashboard with alerting", low: "none", medium: "recommended", high: "mandatory" },
      { id: "o3", label: "Model drift detection & performance baselines", low: "none", medium: "recommended", high: "mandatory" },
      { id: "o4", label: "Guardrail trigger event monitoring", low: "none", medium: "required", high: "mandatory" },
      { id: "o5", label: "User feedback loop (thumbs up/down → review)", low: "recommended", medium: "required", high: "mandatory" },
      { id: "o6", label: "Immutable audit log store", low: "none", medium: "recommended", high: "mandatory" },
    ],
  },
  {
    id: "incident",
    label: "Incident Response",
    pillar: "p3",
    controls: [
      { id: "i1", label: "Incident response playbook with severity tiers", low: "none", medium: "required", high: "mandatory" },
      { id: "i2", label: "Defined escalation SLAs (P1: 1hr, P2: 4hr, P3: 24hr)", low: "none", medium: "recommended", high: "mandatory" },
      { id: "i3", label: "Break-glass procedure for plaintext log access", low: "none", medium: "none", high: "mandatory" },
      { id: "i4", label: "Post-incident review and governance update process", low: "none", medium: "recommended", high: "mandatory" },
    ],
  },
  {
    id: "lifecycle",
    label: "Lifecycle & Maintenance",
    pillar: "p3",
    controls: [
      { id: "l1", label: "Use case registered in AI inventory", low: "required", medium: "required", high: "mandatory" },
      { id: "l2", label: "Designated use case owner with accountability", low: "required", medium: "required", high: "mandatory" },
      { id: "l3", label: "Regular governance review cadence", low: "none", medium: "required", high: "mandatory" },
      { id: "l4", label: "Model evaluation pipeline (automated checks)", low: "none", medium: "recommended", high: "mandatory" },
      { id: "l5", label: "Security testing in CI/CD (adversarial tests)", low: "none", medium: "recommended", high: "mandatory" },
      { id: "l6", label: "Regulatory compliance artifact generation", low: "none", medium: "recommended", high: "mandatory" },
    ],
  },
  {
    id: "vendor",
    label: "Vendor & Third-Party",
    pillar: "p3",
    controls: [
      { id: "v1", label: "Third-party AI vendor risk assessment", low: "recommended", medium: "required", high: "mandatory" },
      { id: "v2", label: "Contractual AI governance clauses", low: "recommended", medium: "required", high: "mandatory" },
      { id: "v3", label: "Ongoing vendor compliance monitoring", low: "none", medium: "recommended", high: "mandatory" },
      { id: "v4", label: "Vendor AI feature change review process", low: "none", medium: "recommended", high: "required" },
    ],
  },
];

// ─── SYNTHETIC USE CASES (mirrors Registry) ────────────────
const USE_CASES = [
  { id: "UC-001", name: "Internal Analytics Assistant", tier: "high", department: "Product / Engineering", status: "active" },
  { id: "UC-002", name: "Contract Summarizer", tier: "medium", department: "Legal & Compliance", status: "active" },
  { id: "UC-003", name: "Customer Churn Prediction", tier: "high", department: "Sales & Marketing", status: "pilot" },
  { id: "UC-004", name: "Support Ticket Classifier", tier: "low", department: "Customer Success / Support", status: "active" },
  { id: "UC-005", name: "Resume Screening Assistant", tier: "high", department: "Human Resources", status: "review" },
  { id: "UC-007", name: "Sales Email Copilot", tier: "low", department: "Sales & Marketing", status: "active" },
  { id: "UC-008", name: "Fraud Detection Engine", tier: "high", department: "Finance & Accounting", status: "active" },
  { id: "UC-009", name: "Knowledge Base Q&A Bot", tier: "low", department: "IT / Security", status: "pilot" },
  { id: "UC-010", name: "Invoice Processing Automation", tier: "medium", department: "Finance & Accounting", status: "active" },
];

// Synthetic compliance status per use case per control
function getControlStatus(ucId, controlId, requiredLevel) {
  if (requiredLevel === "none") return "na";
  // Deterministic pseudo-random based on IDs
  const hash = (ucId.charCodeAt(3) * 31 + controlId.charCodeAt(1) * 17 + controlId.charCodeAt(0) * 7) % 100;
  if (requiredLevel === "mandatory") {
    if (hash < 35) return "gap";
    if (hash < 60) return "partial";
    return "met";
  }
  if (requiredLevel === "required") {
    if (hash < 25) return "gap";
    if (hash < 50) return "partial";
    return "met";
  }
  // recommended
  if (hash < 40) return "gap";
  if (hash < 55) return "partial";
  return "met";
}

const TIER_COLORS = { low: BRAND.accent, medium: BRAND.warn, high: "#FF6B35" };
const LEVEL_STYLES = {
  none: { label: "—", color: BRAND.border, bg: "transparent" },
  recommended: { label: "RECOMMENDED", color: "#7EC8E3", bg: "#7EC8E318" },
  required: { label: "REQUIRED", color: BRAND.warn, bg: `${BRAND.warn}18` },
  mandatory: { label: "MANDATORY", color: "#FF6B35", bg: "#FF6B3518" },
};
const STATUS_STYLES = {
  na: { label: "N/A", color: BRAND.border },
  met: { label: "MET", color: BRAND.accent },
  partial: { label: "PARTIAL", color: BRAND.warn },
  gap: { label: "GAP", color: BRAND.danger },
};

const wrap = { maxWidth: 1100, margin: "0 auto", padding: "68px 24px 60px" };

export default function Blueprints() {
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedPillar, setSelectedPillar] = useState("all");
  const [appliedUC, setAppliedUC] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  const filteredCategories = CONTROL_CATEGORIES.filter(
    (cat) => selectedPillar === "all" || cat.pillar === selectedPillar
  );

  const selectedUC = USE_CASES.find((uc) => uc.id === appliedUC);

  // Compute gap summary for applied use case
  const gapSummary = selectedUC ? (() => {
    let total = 0, met = 0, partial = 0, gap = 0;
    CONTROL_CATEGORIES.forEach((cat) => {
      cat.controls.forEach((ctrl) => {
        const level = ctrl[selectedUC.tier];
        if (level === "none") return;
        total++;
        const status = getControlStatus(selectedUC.id, ctrl.id, level);
        if (status === "met") met++;
        else if (status === "partial") partial++;
        else gap++;
      });
    });
    return { total, met, partial, gap, pct: total > 0 ? Math.round((met / total) * 100) : 0 };
  })() : null;

  // Stats per tier
  const tierStats = {};
  ["low", "medium", "high"].forEach((tier) => {
    let total = 0, mandatory = 0, required = 0, recommended = 0;
    CONTROL_CATEGORIES.forEach((cat) => {
      cat.controls.forEach((ctrl) => {
        if (ctrl[tier] === "none") return;
        total++;
        if (ctrl[tier] === "mandatory") mandatory++;
        else if (ctrl[tier] === "required") required++;
        else recommended++;
      });
    });
    tierStats[tier] = { total, mandatory, required, recommended };
  });

  return (
    <div style={wrap}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Governance Blueprints · Pillar 2 & 3
        </span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: BRAND.white }}>
        Tiered Governance Blueprints
      </h1>
      <p style={{ fontSize: 13, color: BRAND.muted, margin: "0 0 28px", maxWidth: 620, lineHeight: 1.6 }}>
        Blueprints define governance requirements per risk tier. Each control is classified as mandatory, required,
        or recommended based on the use case's risk classification. Select a use case to see applied compliance status.
      </p>

      {/* Tier Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {["low", "medium", "high"].map((tier) => (
          <div key={tier}
            onClick={() => setSelectedTier(selectedTier === tier ? "all" : tier)}
            style={{
              background: BRAND.bgCard, border: `1px solid ${selectedTier === tier ? TIER_COLORS[tier] : BRAND.border}`,
              borderLeft: `3px solid ${TIER_COLORS[tier]}`, borderRadius: 8,
              padding: "16px 20px", cursor: "pointer", transition: "all 0.15s",
            }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TIER_COLORS[tier], marginBottom: 8, textTransform: "capitalize" }}>
              {tier} Risk
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
              <div><span style={{ color: "#FF6B35", fontWeight: 700 }}>{tierStats[tier].mandatory}</span> <span style={{ color: BRAND.muted }}>mandatory</span></div>
              <div><span style={{ color: BRAND.warn, fontWeight: 700 }}>{tierStats[tier].required}</span> <span style={{ color: BRAND.muted }}>required</span></div>
              <div><span style={{ color: "#7EC8E3", fontWeight: 700 }}>{tierStats[tier].recommended}</span> <span style={{ color: BRAND.muted }}>recommended</span></div>
            </div>
            <div style={{ fontSize: 10, color: BRAND.muted, marginTop: 6 }}>{tierStats[tier].total} total controls applicable</div>
          </div>
        ))}
      </div>

      {/* Applied Governance — Use Case Selector */}
      <div style={{
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        borderRadius: 10, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.15em", marginBottom: 12 }}>
          APPLIED GOVERNANCE — MAP BLUEPRINT TO USE CASE
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: appliedUC ? 16 : 0 }}>
          {USE_CASES.map((uc) => (
            <button key={uc.id} onClick={() => setAppliedUC(appliedUC === uc.id ? null : uc.id)} style={{
              background: appliedUC === uc.id ? `${TIER_COLORS[uc.tier]}18` : "transparent",
              border: `1px solid ${appliedUC === uc.id ? TIER_COLORS[uc.tier] : BRAND.border}`,
              borderRadius: 6, padding: "8px 12px", fontSize: 11, cursor: "pointer",
              color: appliedUC === uc.id ? TIER_COLORS[uc.tier] : BRAND.light,
              fontFamily: "inherit", fontWeight: appliedUC === uc.id ? 600 : 400,
              transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 9, color: TIER_COLORS[uc.tier] }}>{uc.id}</span>
              {uc.name}
            </button>
          ))}
        </div>

        {/* Applied Gap Summary */}
        {selectedUC && gapSummary && (
          <div style={{
            background: BRAND.bgMid, borderRadius: 8, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em", marginBottom: 4 }}>USE CASE</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.white }}>{selectedUC.name}</div>
              <div style={{ fontSize: 11, color: BRAND.muted }}>{selectedUC.department} · <span style={{ color: TIER_COLORS[selectedUC.tier], textTransform: "capitalize" }}>{selectedUC.tier} risk</span></div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: gapSummary.pct >= 75 ? BRAND.accent : gapSummary.pct >= 50 ? BRAND.warn : BRAND.danger }}>
                  {gapSummary.pct}%
                </div>
                <div style={{ fontSize: 9, color: BRAND.muted, letterSpacing: "0.1em" }}>COMPLIANT</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.accent }}>{gapSummary.met}</div>
                  <div style={{ fontSize: 9, color: BRAND.muted }}>MET</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.warn }}>{gapSummary.partial}</div>
                  <div style={{ fontSize: 9, color: BRAND.muted }}>PARTIAL</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.danger }}>{gapSummary.gap}</div>
                  <div style={{ fontSize: 9, color: BRAND.muted }}>GAP</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pillar Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[{ id: "all", label: "All Pillars" }, ...Object.entries(PILLARS).map(([id, p]) => ({ id, label: p.label }))].map((p) => (
          <button key={p.id} onClick={() => setSelectedPillar(p.id)} style={{
            background: selectedPillar === p.id ? BRAND.bgCard : "transparent",
            border: `1px solid ${selectedPillar === p.id ? BRAND.accent : BRAND.border}`,
            borderRadius: 6, padding: "8px 14px", fontSize: 11, cursor: "pointer",
            color: selectedPillar === p.id ? BRAND.accent : BRAND.muted,
            fontFamily: "inherit", transition: "all 0.15s",
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Blueprint Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredCategories.map((cat) => {
          const isExpanded = expandedCat === cat.id;
          const pillar = PILLARS[cat.pillar];
          return (
            <div key={cat.id} style={{
              background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
              borderRadius: 10, overflow: "hidden",
            }}>
              {/* Category Header */}
              <div
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                style={{
                  padding: "16px 20px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderBottom: isExpanded ? `1px solid ${BRAND.border}` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.white }}>{cat.label}</span>
                  <span style={{
                    fontSize: 9, padding: "2px 8px", borderRadius: 3,
                    background: `${pillar.color}18`, color: pillar.color, letterSpacing: "0.08em",
                  }}>{cat.pillar === "p2" ? "PILLAR 2" : "PILLAR 3"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: BRAND.muted }}>{cat.controls.length} controls</span>
                  <span style={{ color: BRAND.muted, fontSize: 12, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                </div>
              </div>

              {/* Controls Table */}
              {isExpanded && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "inherit" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "10px 16px", textAlign: "left", color: BRAND.muted, fontSize: 9, letterSpacing: "0.1em", fontWeight: 600, borderBottom: `1px solid ${BRAND.border}`, minWidth: 280 }}>CONTROL</th>
                        {(selectedTier === "all" ? ["low", "medium", "high"] : [selectedTier]).map((tier) => (
                          <th key={tier} style={{ padding: "10px 14px", textAlign: "center", color: TIER_COLORS[tier], fontSize: 9, letterSpacing: "0.1em", fontWeight: 600, borderBottom: `1px solid ${BRAND.border}`, textTransform: "uppercase", minWidth: 110 }}>
                            {tier} RISK
                          </th>
                        ))}
                        {selectedUC && (
                          <th style={{ padding: "10px 14px", textAlign: "center", color: TIER_COLORS[selectedUC.tier], fontSize: 9, letterSpacing: "0.1em", fontWeight: 600, borderBottom: `1px solid ${BRAND.border}`, minWidth: 100 }}>
                            {selectedUC.id} STATUS
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {cat.controls.map((ctrl) => (
                        <tr key={ctrl.id}>
                          <td style={{ padding: "10px 16px", color: BRAND.light, borderBottom: `1px solid ${BRAND.border}22`, lineHeight: 1.4 }}>
                            {ctrl.label}
                          </td>
                          {(selectedTier === "all" ? ["low", "medium", "high"] : [selectedTier]).map((tier) => {
                            const level = LEVEL_STYLES[ctrl[tier]];
                            return (
                              <td key={tier} style={{ padding: "10px 14px", textAlign: "center", borderBottom: `1px solid ${BRAND.border}22` }}>
                                <span style={{
                                  fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 3,
                                  background: level.bg, color: level.color, letterSpacing: "0.06em",
                                }}>{level.label}</span>
                              </td>
                            );
                          })}
                          {selectedUC && (() => {
                            const level = ctrl[selectedUC.tier];
                            const status = getControlStatus(selectedUC.id, ctrl.id, level);
                            const s = STATUS_STYLES[status];
                            return (
                              <td style={{ padding: "10px 14px", textAlign: "center", borderBottom: `1px solid ${BRAND.border}22` }}>
                                <span style={{
                                  fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 3,
                                  background: `${s.color}18`, color: s.color, letterSpacing: "0.06em",
                                }}>{s.label}</span>
                              </td>
                            );
                          })()}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        borderRadius: 10, padding: "16px 20px", marginTop: 24,
        display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>REQUIREMENT LEVELS:</span>
        {["mandatory", "required", "recommended"].map((level) => {
          const s = LEVEL_STYLES[level];
          return (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: s.bg, color: s.color }}>{s.label}</span>
              <span style={{ fontSize: 10, color: BRAND.muted }}>
                {level === "mandatory" ? "Hard gate — blocks deployment" : level === "required" ? "Must have — flagged if missing" : "Should have — best practice"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
