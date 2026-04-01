import { useState } from "react";
import { BRAND } from "../../brand";

// ─── SYNTHETIC AI INVENTORY DATA ───────────────────────────
const RISK_TIERS = {
  low: { label: "Low Risk", color: BRAND.accent, icon: "🟢" },
  medium: { label: "Medium Risk", color: BRAND.warn, icon: "🟡" },
  high: { label: "High Risk", color: "#FF6B35", icon: "🟠" },
  prohibited: { label: "Prohibited", color: BRAND.danger, icon: "🔴" },
};

const STATUSES = {
  active: { label: "Active", color: BRAND.accent },
  pilot: { label: "Pilot", color: "#7EC8E3" },
  review: { label: "Under Review", color: BRAND.warn },
  suspended: { label: "Suspended", color: BRAND.danger },
  retired: { label: "Retired", color: BRAND.muted },
};

const REGISTRY_DATA = [
  {
    id: "UC-001",
    name: "Internal Analytics Assistant",
    department: "Product / Engineering",
    owner: "Sarah Chen",
    ownerEmail: "s.chen@company.com",
    riskTier: "high",
    status: "active",
    stage: "Production",
    vendor: "Azure OpenAI (GPT-4o)",
    implementation: "Third-party API",
    capabilities: ["Analyzing data", "Generating content"],
    dataTypes: ["Financial data", "Employee data"],
    regions: ["United States", "European Union"],
    users: "500 to 5,000",
    automationLevel: "Decision support — human makes final decision",
    lastReview: "2026-02-15",
    nextReview: "2026-05-15",
    dpiaStatus: "Completed",
    description: "AI-powered analytics assistant that queries internal financial and operational data to surface insights, generate reports, and answer natural language questions from analysts.",
  },
  {
    id: "UC-002",
    name: "Contract Summarizer",
    department: "Legal & Compliance",
    owner: "Michael Torres",
    ownerEmail: "m.torres@company.com",
    riskTier: "medium",
    status: "active",
    stage: "Production",
    vendor: "Anthropic (Claude)",
    implementation: "Third-party API",
    capabilities: ["Extracting information", "Generating content"],
    dataTypes: ["Customer contracts", "Proprietary business data"],
    regions: ["United States"],
    users: "50 to 500",
    automationLevel: "Decision support — human makes final decision",
    lastReview: "2026-01-20",
    nextReview: "2026-04-20",
    dpiaStatus: "Not required",
    description: "Automatically reviews legal agreements and generates summaries of key terms including obligations, renewal dates, termination clauses, and risk provisions.",
  },
  {
    id: "UC-003",
    name: "Customer Churn Prediction",
    department: "Sales & Marketing",
    owner: "Jessica Park",
    ownerEmail: "j.park@company.com",
    riskTier: "high",
    status: "pilot",
    stage: "Proof of concept",
    vendor: "AWS SageMaker",
    implementation: "Custom ML model",
    capabilities: ["Scoring/ranking persons", "Analyzing data"],
    dataTypes: ["Behavioral data", "Financial data", "Basic contact data"],
    regions: ["United States", "European Union", "United Kingdom"],
    users: "50 to 500",
    automationLevel: "Semi-automated — exception-based human review",
    lastReview: "2026-03-01",
    nextReview: "2026-06-01",
    dpiaStatus: "In progress",
    description: "Predicts likelihood of customer churn using behavioral signals, usage patterns, and account health metrics. Scores are surfaced to account managers for proactive outreach.",
  },
  {
    id: "UC-004",
    name: "Support Ticket Classifier",
    department: "Customer Success / Support",
    owner: "David Kim",
    ownerEmail: "d.kim@company.com",
    riskTier: "low",
    status: "active",
    stage: "Production",
    vendor: "Internal (fine-tuned BERT)",
    implementation: "Custom ML model",
    capabilities: ["Classifying/categorizing", "Automating workflow"],
    dataTypes: ["Basic contact data"],
    regions: ["Global"],
    users: "500 to 5,000",
    automationLevel: "Semi-automated — post-decision human review or reversal",
    lastReview: "2026-02-01",
    nextReview: "2026-05-01",
    dpiaStatus: "Completed",
    description: "Automatically classifies incoming support tickets by category, priority, and product area. Routes to appropriate team queues with suggested priority level.",
  },
  {
    id: "UC-005",
    name: "Resume Screening Assistant",
    department: "Human Resources / People Operations",
    owner: "Amanda Liu",
    ownerEmail: "a.liu@company.com",
    riskTier: "high",
    status: "review",
    stage: "Early exploration",
    vendor: "TBD — evaluating vendors",
    implementation: "SaaS product",
    capabilities: ["Scoring/ranking persons", "Extracting information"],
    dataTypes: ["Demographic data", "Employee/HR data"],
    regions: ["United States", "European Union"],
    users: "Fewer than 50",
    automationLevel: "Decision support — human makes final decision",
    lastReview: "2026-03-10",
    nextReview: "2026-04-10",
    dpiaStatus: "Required — not started",
    description: "AI-assisted resume screening for initial candidate filtering. Scores and ranks applicants based on job requirements. HR team makes all final decisions.",
  },
  {
    id: "UC-006",
    name: "Workplace Sentiment Monitor",
    department: "Human Resources / People Operations",
    owner: "Amanda Liu",
    ownerEmail: "a.liu@company.com",
    riskTier: "prohibited",
    status: "suspended",
    stage: "Concept rejected",
    vendor: "N/A",
    implementation: "N/A",
    capabilities: ["Emotional monitoring"],
    dataTypes: ["Behavioral data", "Employee/HR data"],
    regions: ["Global"],
    users: "N/A",
    automationLevel: "N/A",
    lastReview: "2026-02-20",
    nextReview: "N/A",
    dpiaStatus: "N/A",
    description: "Proposed system to analyze employee communications for sentiment and emotional state. REJECTED: Classified as prohibited under AI Constitution — emotional monitoring of employees in the workplace is an explicit prohibition.",
  },
  {
    id: "UC-007",
    name: "Sales Email Copilot",
    department: "Sales & Marketing",
    owner: "Ryan O'Brien",
    ownerEmail: "r.obrien@company.com",
    riskTier: "low",
    status: "active",
    stage: "Production",
    vendor: "Microsoft (Copilot)",
    implementation: "Platform AI feature",
    capabilities: ["Generating content"],
    dataTypes: ["Basic contact data"],
    regions: ["United States"],
    users: "500 to 5,000",
    automationLevel: "Decision support — human makes final decision",
    lastReview: "2026-01-15",
    nextReview: "2026-04-15",
    dpiaStatus: "Not required",
    description: "Microsoft 365 Copilot for drafting and refining sales outreach emails. All outputs are reviewed and edited by the sales team before sending.",
  },
  {
    id: "UC-008",
    name: "Fraud Detection Engine",
    department: "Finance & Accounting",
    owner: "Patricia Nguyen",
    ownerEmail: "p.nguyen@company.com",
    riskTier: "high",
    status: "active",
    stage: "Production",
    vendor: "Internal + Azure ML",
    implementation: "Custom ML model",
    capabilities: ["Scoring/ranking persons", "Analyzing data", "Automating workflow"],
    dataTypes: ["Financial data", "Behavioral data", "Basic contact data"],
    regions: ["Global"],
    users: "50 to 500",
    automationLevel: "Semi-automated — exception-based human review",
    lastReview: "2026-03-01",
    nextReview: "2026-04-01",
    dpiaStatus: "Completed",
    description: "Real-time transaction monitoring and fraud scoring system. High-risk transactions are flagged for manual review. Low-confidence scores trigger automatic holds pending human investigation.",
  },
  {
    id: "UC-009",
    name: "Knowledge Base Q&A Bot",
    department: "IT / Security / Infrastructure",
    owner: "James Wright",
    ownerEmail: "j.wright@company.com",
    riskTier: "low",
    status: "pilot",
    stage: "Proof of concept",
    vendor: "OpenAI (GPT-4o)",
    implementation: "Third-party API + RAG",
    capabilities: ["Generating content", "Extracting information"],
    dataTypes: ["Proprietary business data"],
    regions: ["United States"],
    users: "Fewer than 50",
    automationLevel: "Informational only",
    lastReview: "2026-03-15",
    nextReview: "2026-06-15",
    dpiaStatus: "Not required",
    description: "RAG-powered Q&A bot over internal IT knowledge base and runbooks. Answers IT support questions with citations to source documents. No personal data involved.",
  },
  {
    id: "UC-010",
    name: "Invoice Processing Automation",
    department: "Finance & Accounting",
    owner: "Patricia Nguyen",
    ownerEmail: "p.nguyen@company.com",
    riskTier: "medium",
    status: "active",
    stage: "Production",
    vendor: "UiPath (Document Understanding)",
    implementation: "SaaS product",
    capabilities: ["Extracting information", "Automating workflow", "Classifying/categorizing"],
    dataTypes: ["Financial data", "Basic contact data"],
    regions: ["United States", "European Union"],
    users: "50 to 500",
    automationLevel: "Semi-automated — post-decision human review or reversal",
    lastReview: "2026-02-10",
    nextReview: "2026-05-10",
    dpiaStatus: "Completed",
    description: "Automated invoice data extraction and processing. Reads invoices, extracts key fields, matches to POs, and routes for approval. Exceptions flagged for manual review.",
  },
];

// ─── COMPONENT ─────────────────────────────────────────────
const wrap = { maxWidth: 1100, margin: "0 auto", padding: "68px 24px 60px" };

export default function Registry() {
  const [selectedId, setSelectedId] = useState(null);
  const [filterTier, setFilterTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [search, setSearch] = useState("");

  const departments = [...new Set(REGISTRY_DATA.map((r) => r.department))].sort();

  const filtered = REGISTRY_DATA.filter((item) => {
    if (filterTier !== "all" && item.riskTier !== filterTier) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterDept !== "all" && item.department !== filterDept) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = REGISTRY_DATA.find((r) => r.id === selectedId);

  // Stats
  const tierCounts = { low: 0, medium: 0, high: 0, prohibited: 0 };
  const statusCounts = { active: 0, pilot: 0, review: 0, suspended: 0, retired: 0 };
  REGISTRY_DATA.forEach((r) => { tierCounts[r.riskTier]++; statusCounts[r.status]++; });

  return (
    <div style={wrap}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          AI Inventory · {REGISTRY_DATA.length} Use Cases
        </span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 28px", color: BRAND.white }}>
        AI Use Case Registry
      </h1>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {Object.entries(RISK_TIERS).map(([key, tier]) => (
          <div key={key} style={{
            background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
            borderLeft: `3px solid ${tier.color}`, borderRadius: 8, padding: "14px 18px",
            cursor: "pointer", transition: "all 0.15s",
            ...(filterTier === key ? { borderColor: tier.color } : {}),
          }} onClick={() => setFilterTier(filterTier === key ? "all" : key)}>
            <div style={{ fontSize: 28, fontWeight: 700, color: tier.color }}>{tierCounts[key]}</div>
            <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>{tier.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or ID..."
          style={{
            background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
            borderRadius: 6, padding: "8px 14px", fontSize: 12, color: BRAND.white,
            fontFamily: "inherit", outline: "none", width: 220,
          }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 6, padding: "8px 12px", fontSize: 11, color: BRAND.light,
          fontFamily: "inherit", outline: "none",
        }}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 6, padding: "8px 12px", fontSize: 11, color: BRAND.light,
          fontFamily: "inherit", outline: "none",
        }}>
          <option value="all">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <span style={{ fontSize: 11, color: BRAND.muted, marginLeft: "auto" }}>
          {filtered.length} of {REGISTRY_DATA.length} shown
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        borderRadius: 10, overflow: "hidden", marginBottom: 24,
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "inherit" }}>
          <thead>
            <tr>
              {["ID", "Use Case", "Department", "Owner", "Risk Tier", "Status", "Last Review"].map((h) => (
                <th key={h} style={{
                  padding: "12px 14px", textAlign: "left",
                  borderBottom: `1px solid ${BRAND.border}`,
                  color: BRAND.muted, fontSize: 9, letterSpacing: "0.12em", fontWeight: 600,
                }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const tier = RISK_TIERS[item.riskTier];
              const status = STATUSES[item.status];
              return (
                <tr key={item.id} onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  style={{ cursor: "pointer", transition: "background 0.1s",
                    background: selectedId === item.id ? BRAND.bgMid : "transparent",
                  }}>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}22`, color: BRAND.muted, fontSize: 11 }}>{item.id}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}22`, color: BRAND.white, fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}22`, color: BRAND.light, fontSize: 11 }}>{item.department}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}22`, color: BRAND.light, fontSize: 11 }}>{item.owner}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}22` }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                      background: `${tier.color}18`, color: tier.color, letterSpacing: "0.08em",
                    }}>{tier.label.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}22` }}>
                    <span style={{ color: status.color, fontSize: 11 }}>{status.label}</span>
                  </td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}22`, color: BRAND.muted, fontSize: 11 }}>{item.lastReview}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderLeft: `3px solid ${RISK_TIERS[selected.riskTier].color}`,
          borderRadius: 10, padding: 28, marginBottom: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: BRAND.muted, marginBottom: 4 }}>{selected.id}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: BRAND.white }}>{selected.name}</h3>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 4,
                background: `${RISK_TIERS[selected.riskTier].color}18`, color: RISK_TIERS[selected.riskTier].color,
              }}>{RISK_TIERS[selected.riskTier].label.toUpperCase()}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 4,
                background: `${STATUSES[selected.status].color}18`, color: STATUSES[selected.status].color,
              }}>{STATUSES[selected.status].label.toUpperCase()}</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: BRAND.light, lineHeight: 1.65, margin: "0 0 20px" }}>
            {selected.description}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Department", value: selected.department },
              { label: "Owner", value: `${selected.owner} (${selected.ownerEmail})` },
              { label: "Stage", value: selected.stage },
              { label: "Vendor / Platform", value: selected.vendor },
              { label: "Implementation", value: selected.implementation },
              { label: "Automation Level", value: selected.automationLevel },
              { label: "Monthly Users", value: selected.users },
              { label: "Regions", value: selected.regions.join(", ") },
              { label: "DPIA Status", value: selected.dpiaStatus },
              { label: "Last Review", value: selected.lastReview },
              { label: "Next Review", value: selected.nextReview },
            ].map((row) => (
              <div key={row.label} style={{ padding: "8px 0", borderBottom: `1px solid ${BRAND.border}22` }}>
                <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em", marginBottom: 3 }}>{row.label.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: BRAND.light }}>{row.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em", marginBottom: 8 }}>CAPABILITIES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.capabilities.map((c) => (
                <span key={c} style={{
                  fontSize: 10, padding: "4px 8px", borderRadius: 4,
                  background: BRAND.bgMid, border: `1px solid ${BRAND.border}`, color: BRAND.light,
                }}>{c}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em", marginBottom: 8 }}>DATA TYPES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.dataTypes.map((d) => (
                <span key={d} style={{
                  fontSize: 10, padding: "4px 8px", borderRadius: 4,
                  background: BRAND.bgMid, border: `1px solid ${BRAND.border}`, color: BRAND.light,
                }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
