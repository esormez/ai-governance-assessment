import { useState } from "react";
import { BRAND } from "../../brand";

// ─── TOOLING REQUIREMENTS & GAP ANALYSIS ──────────────────
// Maps TRiSM capabilities to required tooling, current state, and gaps

const CAPABILITY_AREAS = [
  {
    id: "observability",
    label: "Observability & Telemetry",
    pillar: "Pillar 3",
    description: "Structured logging, dashboards, and alerting for AI system behavior",
    requirements: [
      {
        id: "obs1",
        capability: "Structured Audit Logging",
        description: "Log every AI interaction with user ID, timestamp, query hash, response hash, confidence score, and retrieval sources",
        toolCategories: ["SIEM / Log Aggregation", "Application Telemetry"],
        exampleTools: ["Splunk", "Datadog", "Elastic (ELK)", "Azure Monitor", "OpenTelemetry"],
        currentState: "gap",
        currentDetail: "Basic application logs only — no structured query/response logging",
        priority: "critical",
      },
      {
        id: "obs2",
        capability: "Governance Dashboard",
        description: "Real-time dashboard surfacing guardrail triggers, confidence degradation, auth violations, and review queue metrics",
        toolCategories: ["BI / Dashboard", "AI Monitoring"],
        exampleTools: ["Grafana", "Datadog Dashboards", "Power BI", "Custom (React + API)"],
        currentState: "gap",
        currentDetail: "No AI-specific governance dashboard exists",
        priority: "high",
      },
      {
        id: "obs3",
        capability: "Immutable Audit Store",
        description: "Write-once, append-only log storage queryable by compliance and security teams",
        toolCategories: ["Immutable Storage", "Compliance"],
        exampleTools: ["AWS S3 Object Lock", "Azure Immutable Blob", "Snowflake Time Travel", "Chronicle"],
        currentState: "gap",
        currentDetail: "No immutable audit store configured",
        priority: "high",
      },
      {
        id: "obs4",
        capability: "User Feedback Loop",
        description: "Thumbs up/down mechanism that feeds into model review process",
        toolCategories: ["Application Feature", "ML Ops"],
        exampleTools: ["LangSmith", "Weights & Biases", "Custom UI component"],
        currentState: "gap",
        currentDetail: "No user feedback mechanism implemented",
        priority: "medium",
      },
    ],
  },
  {
    id: "evaluation",
    label: "Model Evaluation & Drift",
    pillar: "Pillar 3",
    description: "Automated testing, evaluation pipelines, and drift detection for AI models",
    requirements: [
      {
        id: "eval1",
        capability: "Evaluation Pipeline",
        description: "Automated correctness, compliance, and safety checks on model outputs — runs on every model update",
        toolCategories: ["LLM Evaluation", "CI/CD"],
        exampleTools: ["Promptfoo", "Ragas", "DeepEval", "LangSmith Evaluators", "Custom pytest suite"],
        currentState: "gap",
        currentDetail: "No evaluation pipeline exists",
        priority: "critical",
      },
      {
        id: "eval2",
        capability: "Drift Detection",
        description: "Continuous monitoring of output distribution, confidence trends, and response pattern changes",
        toolCategories: ["ML Monitoring", "Observability"],
        exampleTools: ["Arize AI", "WhyLabs", "Evidently AI", "Fiddler", "Azure ML Monitor"],
        currentState: "gap",
        currentDetail: "No drift detection — model performance not baselined or monitored",
        priority: "high",
      },
      {
        id: "eval3",
        capability: "Bias & Fairness Testing",
        description: "Evaluate model outputs for discrimination across protected characteristics",
        toolCategories: ["AI Fairness", "Evaluation"],
        exampleTools: ["Fairlearn", "AI Fairness 360 (IBM)", "Google What-If Tool", "Custom test suites"],
        currentState: "gap",
        currentDetail: "No bias or fairness testing exists",
        priority: "critical",
      },
      {
        id: "eval4",
        capability: "Adversarial Security Testing",
        description: "Automated prompt injection, jailbreak, and data exfiltration testing in CI/CD",
        toolCategories: ["AI Security", "Red Teaming"],
        exampleTools: ["Garak", "Promptfoo (security plugins)", "Azure AI Content Safety", "Custom red team suite"],
        currentState: "gap",
        currentDetail: "No security-specific tests — only functional tests in pipeline",
        priority: "critical",
      },
    ],
  },
  {
    id: "guardrails",
    label: "Guardrails & Safety Controls",
    pillar: "Pillar 2",
    description: "Runtime safety controls including content filtering, injection defense, and kill switch",
    requirements: [
      {
        id: "guard1",
        capability: "Content Safety API",
        description: "Category-specific content filtering for harmful, violent, sexual, or self-harm content",
        toolCategories: ["Content Safety", "API"],
        exampleTools: ["Azure AI Content Safety", "OpenAI Moderation API", "Perspective API", "LlamaGuard"],
        currentState: "gap",
        currentDetail: "Azure Content Safety API not configured",
        priority: "high",
      },
      {
        id: "guard2",
        capability: "Prompt Injection Defense",
        description: "Multi-layer defense: WAF rules, input sanitization, attack classifier, RAG document scanning",
        toolCategories: ["WAF / API Gateway", "AI Security"],
        exampleTools: ["Azure WAF", "Cloudflare AI Gateway", "Rebuff", "Custom regex + classifier"],
        currentState: "gap",
        currentDetail: "No prompt injection defenses implemented",
        priority: "critical",
      },
      {
        id: "guard3",
        capability: "AI Kill Switch (Andon Cord)",
        description: "Application-level feature flag to disable all GenAI functionality independently of model provider",
        toolCategories: ["Feature Flags", "Application"],
        exampleTools: ["LaunchDarkly", "Azure App Configuration", "Custom feature flag", "Unleash"],
        currentState: "gap",
        currentDetail: "No kill switch — disabling AI requires full deployment or Azure suspension",
        priority: "high",
      },
      {
        id: "guard4",
        capability: "Confidence Scoring & Citation",
        description: "Calibrated confidence scores on responses with mandatory source citation for factual claims",
        toolCategories: ["LLM Framework", "Application"],
        exampleTools: ["LangChain (confidence chains)", "LlamaIndex (citation engine)", "Custom scoring pipeline"],
        currentState: "gap",
        currentDetail: "Neither confidence scoring nor citation enforcement implemented",
        priority: "high",
      },
    ],
  },
  {
    id: "governance_ops",
    label: "Governance Operations Tooling",
    pillar: "Pillar 2",
    description: "Intake, registry, policy management, and training infrastructure",
    requirements: [
      {
        id: "gov1",
        capability: "AI Use Case Intake Platform",
        description: "Dynamic form with branching logic, risk tiering, and team routing for use case registration",
        toolCategories: ["Forms / Workflow", "GRC"],
        exampleTools: ["ServiceNow", "Microsoft Forms + Power Automate", "Jira Service Mgmt", "Custom (this platform)"],
        currentState: "partial",
        currentDetail: "Intake form designed (v10) — not yet deployed on a platform. This tool provides a reference implementation.",
        priority: "high",
      },
      {
        id: "gov2",
        capability: "AI Use Case Registry / Inventory",
        description: "Searchable inventory of all AI systems with risk tier, owner, status, review schedule, and compliance status",
        toolCategories: ["CMDB / Asset Mgmt", "GRC"],
        exampleTools: ["ServiceNow CMDB", "Collibra", "Custom database", "This platform (reference)"],
        currentState: "partial",
        currentDetail: "No enterprise AI inventory exists. This tool provides a reference implementation.",
        priority: "critical",
      },
      {
        id: "gov3",
        capability: "AI Literacy Training Platform",
        description: "Role-based training delivery with completion tracking for AI responsible use",
        toolCategories: ["LMS / Training"],
        exampleTools: ["Workday Learning", "Cornerstone", "Custom LMS", "Confluence + tracking"],
        currentState: "gap",
        currentDetail: "No AI-specific training program exists",
        priority: "medium",
      },
      {
        id: "gov4",
        capability: "Policy-as-Code Engine",
        description: "Machine-readable governance policies that can be enforced at deployment gates",
        toolCategories: ["Policy Engine", "CI/CD"],
        exampleTools: ["Open Policy Agent (OPA)", "Azure Policy", "Custom CI gate", "Rego policies"],
        currentState: "gap",
        currentDetail: "No policy-as-code implementation — governance is documentation-only",
        priority: "medium",
      },
    ],
  },
  {
    id: "data_security",
    label: "Data & Security Infrastructure",
    pillar: "Pillar 3",
    description: "Identity propagation, access control, secret management, and PII scanning",
    requirements: [
      {
        id: "ds1",
        capability: "Identity Propagation & RBAC",
        description: "End-user identity propagated through to data warehouse with row-level security",
        toolCategories: ["IAM / RBAC", "Data Platform"],
        exampleTools: ["Snowflake (session vars + RLS)", "Azure AD", "Okta", "Custom middleware"],
        currentState: "gap",
        currentDetail: "AI_SERVICE_ROLE used for all queries — no identity propagation",
        priority: "critical",
      },
      {
        id: "ds2",
        capability: "Secret Management & Rotation",
        description: "Managed vault for API keys and credentials with automated rotation",
        toolCategories: ["Secrets Management"],
        exampleTools: ["Azure Key Vault", "AWS Secrets Manager", "HashiCorp Vault", "1Password Secrets"],
        currentState: "gap",
        currentDetail: "Credentials unrotated for 6 months, API key in environment variable",
        priority: "critical",
      },
      {
        id: "ds3",
        capability: "PII Detection & Scanning",
        description: "Automated PII scanning in training data, retrieval documents, and model outputs",
        toolCategories: ["DLP / PII Detection"],
        exampleTools: ["Microsoft Purview", "AWS Macie", "Google DLP API", "Presidio (open source)"],
        currentState: "gap",
        currentDetail: "PII found in indexed HR documents — no scanning pipeline",
        priority: "critical",
      },
      {
        id: "ds4",
        capability: "Vendor Contract Management",
        description: "Track AI vendor contracts, data training opt-outs, and compliance obligations",
        toolCategories: ["CLM / Procurement"],
        exampleTools: ["Ironclad", "DocuSign CLM", "Icertis", "Custom tracker"],
        currentState: "gap",
        currentDetail: "No AI-specific vendor contract tracking — standard procurement process only",
        priority: "high",
      },
    ],
  },
];

const PRIORITY_STYLES = {
  critical: { label: "CRITICAL", color: BRAND.danger },
  high: { label: "HIGH", color: "#FF6B35" },
  medium: { label: "MEDIUM", color: BRAND.warn },
  low: { label: "LOW", color: BRAND.muted },
};

const STATE_STYLES = {
  gap: { label: "GAP", color: BRAND.danger, bg: `${BRAND.danger}18` },
  partial: { label: "PARTIAL", color: BRAND.warn, bg: `${BRAND.warn}18` },
  met: { label: "IN PLACE", color: BRAND.accent, bg: `${BRAND.accent}18` },
};

const wrap = { maxWidth: 1100, margin: "0 auto", padding: "68px 24px 60px" };

export default function ToolingGaps() {
  const [expandedArea, setExpandedArea] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");

  // Stats
  const allReqs = CAPABILITY_AREAS.flatMap((a) => a.requirements);
  const gapCount = allReqs.filter((r) => r.currentState === "gap").length;
  const partialCount = allReqs.filter((r) => r.currentState === "partial").length;
  const metCount = allReqs.filter((r) => r.currentState === "met").length;
  const criticalGaps = allReqs.filter((r) => r.currentState === "gap" && r.priority === "critical").length;

  return (
    <div style={wrap}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          TRiSM Tooling · Gap Analysis
        </span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: BRAND.white }}>
        Tooling Requirements & Gap Analysis
      </h1>
      <p style={{ fontSize: 13, color: BRAND.muted, margin: "0 0 28px", maxWidth: 620, lineHeight: 1.6 }}>
        Maps AI TRiSM capabilities to required tooling categories. Identifies gaps between
        current state and governance requirements derived from the Engaged Audit findings.
      </p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <div style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.border}`, borderLeft: `3px solid ${BRAND.danger}`, borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.danger }}>{gapCount}</div>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>GAPS</div>
        </div>
        <div style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.border}`, borderLeft: `3px solid ${BRAND.warn}`, borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.warn }}>{partialCount}</div>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>PARTIAL</div>
        </div>
        <div style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.border}`, borderLeft: `3px solid ${BRAND.accent}`, borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.accent }}>{metCount}</div>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>IN PLACE</div>
        </div>
        <div style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.border}`, borderLeft: `3px solid ${BRAND.danger}`, borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.danger }}>{criticalGaps}</div>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>CRITICAL GAPS</div>
        </div>
      </div>

      {/* Priority Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["all", "critical", "high", "medium"].map((p) => (
          <button key={p} onClick={() => setFilterPriority(p)} style={{
            background: filterPriority === p ? BRAND.bgCard : "transparent",
            border: `1px solid ${filterPriority === p ? BRAND.accent : BRAND.border}`,
            borderRadius: 6, padding: "6px 14px", fontSize: 11, cursor: "pointer",
            color: filterPriority === p ? BRAND.accent : BRAND.muted,
            fontFamily: "inherit", textTransform: "capitalize",
          }}>
            {p === "all" ? "All Priorities" : p}
          </button>
        ))}
      </div>

      {/* Capability Areas */}
      {CAPABILITY_AREAS.map((area) => {
        const isExpanded = expandedArea === area.id;
        const filteredReqs = area.requirements.filter(
          (r) => filterPriority === "all" || r.priority === filterPriority
        );
        if (filteredReqs.length === 0) return null;
        const areaGaps = filteredReqs.filter((r) => r.currentState === "gap").length;

        return (
          <div key={area.id} style={{
            background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
            borderRadius: 10, marginBottom: 12, overflow: "hidden",
          }}>
            <div onClick={() => setExpandedArea(isExpanded ? null : area.id)} style={{
              padding: "16px 20px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: isExpanded ? `1px solid ${BRAND.border}` : "none",
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.white }}>{area.label}</div>
                <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 2 }}>{area.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: "#7EC8E318", color: "#7EC8E3" }}>{area.pillar.toUpperCase()}</span>
                {areaGaps > 0 && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: `${BRAND.danger}18`, color: BRAND.danger, fontWeight: 700 }}>{areaGaps} GAPS</span>}
                <span style={{ color: BRAND.muted, fontSize: 12, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
              </div>
            </div>

            {isExpanded && filteredReqs.map((req) => {
              const state = STATE_STYLES[req.currentState];
              const priority = PRIORITY_STYLES[req.priority];
              return (
                <div key={req.id} style={{
                  padding: "16px 20px", borderBottom: `1px solid ${BRAND.border}22`,
                  borderLeft: `3px solid ${state.color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.white }}>{req.capability}</div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 3, background: state.bg, color: state.color }}>{state.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 3, background: `${priority.color}18`, color: priority.color }}>{priority.label}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: BRAND.light, lineHeight: 1.5, margin: "0 0 10px" }}>{req.description}</p>

                  {/* Current state */}
                  <div style={{
                    background: BRAND.bgMid, borderRadius: 4, padding: "8px 12px", marginBottom: 10,
                    fontSize: 11, color: state.color, borderLeft: `2px solid ${state.color}44`,
                  }}>
                    Current: {req.currentDetail}
                  </div>

                  {/* Tooling categories */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: BRAND.muted, alignSelf: "center" }}>Categories:</span>
                    {req.toolCategories.map((tc) => (
                      <span key={tc} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 3, background: BRAND.bgMid, color: BRAND.light }}>{tc}</span>
                    ))}
                  </div>

                  {/* Example tools */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: BRAND.muted, alignSelf: "center" }}>Options:</span>
                    {req.exampleTools.map((tool) => (
                      <span key={tool} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 3, border: `1px solid ${BRAND.border}`, color: BRAND.accent }}>{tool}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
