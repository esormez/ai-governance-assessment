import { useState, useMemo } from "react";
import { BRAND } from "../../brand";

// ─── SECTIONS ──────────────────────────────────────────────
const SECTIONS = [
  { id: "identification", label: "Use Case Identification", icon: "01" },
  { id: "description", label: "Description, Users & Impact", icon: "02" },
  { id: "geography", label: "Geographic Scope & Scale", icon: "03" },
  { id: "data", label: "Data & Privacy", icon: "04" },
  { id: "risk", label: "Risk Assessment", icon: "05" },
  { id: "technical", label: "Technical & IT Scope", icon: "06" },
  { id: "vendor", label: "Vendor & Third-Party", icon: "07" },
  { id: "additional", label: "Anything Else", icon: "08" },
];

// ─── QUESTION DEFINITIONS ──────────────────────────────────
// type: "text" | "select" | "multiselect" | "textarea"
// routes: which review teams see this question
// riskWeight: points added when certain answers are selected
// branch: { field, value, show } for conditional display

const QUESTIONS = {
  identification: [
    { id: "q1_1", label: "What is the name of this AI use case?", type: "text", placeholder: "e.g., AI-Powered Contract Summarizer", required: true },
    { id: "q1_2", label: "Submitter name", type: "text", placeholder: "First and last name", required: true },
    { id: "q1_3", label: "Submitter email", type: "text", placeholder: "name@company.com", required: true },
    { id: "q1_4", label: "Job title / level", type: "text", placeholder: "e.g., Senior Product Manager" },
    { id: "q1_5", label: "Department", type: "select", required: true, options: [
      "Product / Engineering", "Sales & Marketing", "Customer Success / Support",
      "Finance & Accounting", "Human Resources / People Operations", "Legal & Compliance",
      "IT / Security / Infrastructure", "Operations / Supply Chain", "Risk & Governance", "Other",
    ]},
    { id: "q1_6", label: "Who is the executive sponsor or business owner accountable for this use case?", type: "select", required: true, routes: ["GOV"], options: [
      "I am the owner",
      "A different individual is the owner",
      "An accountable owner has not yet been identified",
    ]},
    { id: "q1_6b", label: "Owner email", type: "text", placeholder: "owner@company.com", branch: { field: "q1_6", value: "A different individual is the owner" } },
    { id: "q1_7", label: "Which department will be responsible for the outcomes of this AI use case?", type: "select", options: [
      "Product / Engineering", "Sales & Marketing", "Customer Success / Support",
      "Finance & Accounting", "Human Resources / People Operations", "Legal & Compliance",
      "IT / Security / Infrastructure", "Operations / Supply Chain", "Risk & Governance", "Other",
    ]},
    { id: "q1_8", label: "Current stage of this AI initiative", type: "select", required: true, routes: ["CYBER/IT"], options: [
      "A — Early exploration / idea stage",
      "B — Proof of concept or pilot underway",
      "C — Ready for production deployment",
      "D — Already live in production (retroactive review)",
    ]},
    { id: "q1_8b", label: "When do you expect this to be deployed in production?", type: "select",
      branch: { field: "q1_8", values: ["A — Early exploration / idea stage", "B — Proof of concept or pilot underway", "C — Ready for production deployment"] },
      options: ["Within 30 days", "1 to 3 months", "3 to 6 months", "6+ months", "Timeline not yet determined"],
      riskFlag: { values: ["Within 30 days", "1 to 3 months"], label: "PRIORITY REVIEW" },
    },
    { id: "q1_8c", label: "Has funding already been approved?", type: "select",
      branch: { field: "q1_8", values: ["A — Early exploration / idea stage", "B — Proof of concept or pilot underway", "C — Ready for production deployment"] },
      options: ["Yes — funding approved", "Not yet — being evaluated", "No — not yet requested"],
    },
  ],
  description: [
    { id: "q2_1", label: "In plain language, what does this AI use case do and what problem does it solve?", type: "textarea", placeholder: "2-5 sentences. Avoid technical jargon.", required: true, routes: ["LEG", "PRIV"] },
    { id: "q2_2", label: "Which capabilities will this AI use case involve?", type: "multiselect", required: true, routes: ["LEG", "PRIV", "CYBER/IT"], options: [
      "Analyzing data to surface insights, trends, or patterns",
      "Classifying, categorizing, routing, or tagging items",
      "Scoring, ranking, or predicting an outcome about a person or object",
      "Extracting information from documents, emails, or contracts",
      "Automating a task or workflow step without human initiation each time",
      "Generating content (text, images, audio, video, code)",
      "Identifying or verifying individuals (facial recognition, voice ID)",
      "Taking autonomous actions across systems (sending emails, updating records)",
      "Other",
    ],
    riskTriggers: {
      "Identifying or verifying individuals (facial recognition, voice ID)": "prohibited",
      "Taking autonomous actions across systems (sending emails, updating records)": "high",
    }},
    { id: "q2_3", label: "What is the primary output this AI system will produce?", type: "select", required: true, routes: ["LEG", "PRIV", "CYBER/IT"], options: [
      "A written response, draft, summary, or document",
      "Data insights, analysis results, or a visualized report",
      "An image, audio, code, or video output",
      "A score, rating, or ranking applied to a person",
      "A score, rating, or ranking applied to something other than a person",
      "A classification or label applied to an item or record",
      "A recommendation or suggested next best action for a human",
      "An automated action or triggered workflow",
    ]},
    { id: "q2_4", label: "How would you best describe this AI's role in decision-making?", type: "select", required: true, routes: ["LEG", "PRIV"], options: [
      "Informational only — no recommendations or decisions made by AI",
      "Decision support — human makes final decision",
      "Semi-automated — exception-based human review",
      "Semi-automated — post-decision human review or reversal",
      "Fully automated — no human oversight",
      "I don't know — I need help from the Governance board",
    ],
    riskWeights: {
      "Fully automated — no human oversight": 3,
      "Semi-automated — exception-based human review": 2,
      "Semi-automated — post-decision human review or reversal": 2,
    }},
    { id: "q2_5", label: "Who will actively use or interact with this AI system?", type: "multiselect", routes: ["LEG", "PRIV"], options: [
      "Internal employees (general workforce)",
      "Internal employees in sensitive or regulated roles (HR, finance, legal)",
      "Contractors (non-employees)",
      "Business customers",
      "Job applicants or candidates",
      "Other",
    ]},
    { id: "q2_6", label: "Does this AI system's output influence decisions affecting people NOT directly using the tool?", type: "select", routes: ["LEG", "PRIV"], options: [
      "No — output only affects the person using the tool",
      "Yes — output influences decisions affecting other individuals",
      "Not sure — I need governance input",
    ]},
    { id: "q2_7", label: "Does this use case disproportionately affect any of the following groups?", type: "multiselect", routes: ["LEG", "PRIV"], options: [
      "Children or young people (under 18)",
      "Elderly individuals",
      "People with disabilities or health conditions",
      "Individuals in financial hardship",
      "People with limited digital literacy",
      "Other vulnerable or protected group",
      "No — applies equally across general population",
    ]},
  ],
  geography: [
    { id: "q3_1", label: "In which countries or regions will this AI system be used or deployed?", type: "multiselect", required: true, routes: ["LEG", "PRIV", "DATA GOV"], options: [
      "United States", "European Union", "United Kingdom", "Canada",
      "Australia / New Zealand", "Asia-Pacific", "Middle East / Africa",
      "Latin America", "Global", "Unknown",
    ]},
    { id: "q3_2", label: "Approximately how many people will actively use this AI system per month?", type: "select", options: [
      "Fewer than 50 users", "50 to 500 users", "500 to 5,000 users",
      "5,000 to 50,000 users", "More than 50,000 users", "Unknown at this stage",
    ],
    riskWeights: { "5,000 to 50,000 users": 1, "More than 50,000 users": 2 }},
  ],
  data: [
    { id: "q4_1", label: "Will this AI use case involve any personal data?", type: "select", required: true, routes: ["LEG", "PRIV", "DATA GOV"], options: [
      "Yes — involves personal data",
      "No — only anonymized, aggregated, synthetic, or non-personal business data",
      "I am not sure",
    ]},
    { id: "q4_2", label: "Which types of personal data will this AI system use?", type: "multiselect",
      branch: { field: "q4_1", values: ["Yes — involves personal data", "I am not sure"] },
      routes: ["LEG", "PRIV", "DATA GOV"], options: [
      "Basic contact or identity data (name, email, phone, user ID, IP)",
      "Government-issued identifiers (SSN, passport, tax ID)",
      "Demographic or personal characteristics (age, gender, race, nationality)",
      "Employee or HR data (performance records, compensation, attendance)",
      "Behavioral or usage data (clickstream, session data linked to individual)",
      "Location or movement data (GPS, IP-based location)",
      "Financial data (account details, payment history, credit info)",
      "Health or medical data (diagnoses, prescriptions, mental health)",
      "Biometric data (fingerprints, facial images, voice recordings)",
      "Data about children under 18",
      "Legal or judicial data (criminal records, litigation history)",
      "Inferred or AI-generated data about a person (predicted scores, profiles)",
      "Customer data processed on their behalf",
      "Unsure or not yet determined",
    ],
    riskTriggers: {
      "Government-issued identifiers (SSN, passport, tax ID)": "high",
      "Biometric data (fingerprints, facial images, voice recordings)": "high",
      "Health or medical data (diagnoses, prescriptions, mental health)": "high",
      "Data about children under 18": "high",
      "Legal or judicial data (criminal records, litigation history)": "high",
    }},
    { id: "q4_3", label: "Will this AI use case involve any sensitive or confidential business data?", type: "multiselect", routes: ["LEG", "CYBER/IT", "DATA GOV"], options: [
      "Proprietary business data, trade secrets, or confidential documents",
      "Intellectual property or source code",
      "Financial records, forecasts, or strategic plans",
      "Customer contracts, proposals, or commercially sensitive information",
      "None of the above",
    ]},
    { id: "q4_4", label: "Has a Data Protection Impact Assessment (DPIA) been initiated or completed?", type: "select", routes: ["PRIV", "DATA GOV"], options: [
      "Yes — completed", "Yes — in progress",
      "No — not started but I believe one is required",
      "No — I do not believe one is required",
      "I don't know",
    ]},
  ],
  risk: [
    { id: "q5_1", label: "Does this use case fall into any of the following high-risk areas?", type: "multiselect", required: true, routes: ["GOV", "LEG", "PRIV"], options: [
      "Employment decisions (screening, hiring, performance evaluation, termination)",
      "Emotional monitoring of employees in the workplace",
      "Credit, insurance, or financial access scoring",
      "Healthcare or medical decisions",
      "Education (access, assessment, academic placement)",
      "Access to essential public or private services",
      "Biometric identification or categorization of individuals",
      "Behavior manipulation (subliminal or deceptive AI influence)",
      "Critical infrastructure management",
      "None of the above",
    ],
    riskTriggers: {
      "Emotional monitoring of employees in the workplace": "prohibited",
      "Biometric identification or categorization of individuals": "prohibited",
      "Behavior manipulation (subliminal or deceptive AI influence)": "prohibited",
      "Employment decisions (screening, hiring, performance evaluation, termination)": "high",
      "Credit, insurance, or financial access scoring": "high",
      "Healthcare or medical decisions": "high",
      "Critical infrastructure management": "high",
    }},
    { id: "q5_2", label: "If this AI system produced an incorrect, biased, or manipulated result, what is the most serious outcome?", type: "select", required: true, options: [
      "No meaningful harm — cosmetic or inconvenient only",
      "Minor impact — internal inefficiency or rework",
      "Moderate impact — incorrect internal decisions, limited and reversible",
      "Significant impact — material financial, legal, or reputational consequences",
      "Severe impact — major legal, financial, or safety consequences",
      "Catastrophic impact — widespread, systemic, or irreversible harm",
      "Unknown — I need help assessing this",
    ],
    riskWeights: {
      "Significant impact — material financial, legal, or reputational consequences": 2,
      "Severe impact — major legal, financial, or safety consequences": 3,
      "Catastrophic impact — widespread, systemic, or irreversible harm": 4,
    }},
    { id: "q5_3a", label: "Does this AI use case create structured insights about individual people (profiles, predictions, scores)?", type: "select", routes: ["PRIV", "LEG"], options: [
      "No", "Yes", "Not sure",
    ]},
    { id: "q5_3b", label: "How will these profiles, predictions, or scores be used?", type: "select", routes: ["PRIV", "LEG"],
      branch: { field: "q5_3a", value: "Yes" },
      options: [
      "Internal analysis or reporting only",
      "Used to make or influence decisions about individuals",
      "Not sure",
    ]},
  ],
  technical: [
    { id: "q6_1", label: "How do you plan to implement this AI use case?", type: "select", required: true, routes: ["PROC", "CYBER/IT"], options: [
      "A — Building on a third-party AI model or API (OpenAI, Anthropic, Google, AWS)",
      "B — Custom-built or open-source AI model hosted internally",
      "C — Procuring a ready-made AI SaaS product from a vendor",
      "D — Enabling AI features within an existing platform (Copilot, Einstein, etc.)",
      "E — Combining multiple approaches above",
      "F — Not yet decided",
    ]},
    { id: "q6_2", label: "Which systems or data sources will this AI connect to?", type: "multiselect", routes: ["CYBER/IT"], options: [
      "No integration — works with user-provided data only",
      "CRM (Salesforce, HubSpot)", "ERP or financial systems (SAP, NetSuite)",
      "HR or people management system", "Customer support platform",
      "Internal databases or data warehouses (Snowflake, Redshift, BigQuery)",
      "Product or application data", "Email or calendar systems",
      "External data sources or public APIs", "Identity/access management (Okta, AD)",
      "Other",
    ]},
    { id: "q6_3", label: "Will this AI system write to or modify data in any connected systems?", type: "select", routes: ["CYBER/IT"], options: [
      "No — read/analyze only", "Yes — will write or modify data", "Not sure",
    ]},
    { id: "q6_4", label: "Where do you plan to host this AI system?", type: "select", routes: ["CYBER/IT"], options: [
      "Internal infrastructure (on-premise)", "Private cloud environment",
      "Public cloud we manage (AWS, Azure, GCP)", "Vendor's hosted environment",
      "Not yet decided", "I'm not sure",
    ]},
  ],
  vendor: [
    { id: "q7_1", label: "Primary vendor, model provider, or AI platform name(s)", type: "text", placeholder: "e.g., OpenAI (GPT-4o), Anthropic (Claude), Microsoft (Azure OpenAI)", routes: ["PROC", "LEG"],
      branch: { field: "q6_1", values: [
        "A — Building on a third-party AI model or API (OpenAI, Anthropic, Google, AWS)",
        "C — Procuring a ready-made AI SaaS product from a vendor",
        "D — Enabling AI features within an existing platform (Copilot, Einstein, etc.)",
        "E — Combining multiple approaches above",
      ]},
    },
    { id: "q7_2", label: "Current vendor status", type: "select", routes: ["PROC", "LEG"],
      branch: { field: "q6_1", values: [
        "A — Building on a third-party AI model or API (OpenAI, Anthropic, Google, AWS)",
        "C — Procuring a ready-made AI SaaS product from a vendor",
        "D — Enabling AI features within an existing platform (Copilot, Einstein, etc.)",
        "E — Combining multiple approaches above",
      ]},
      options: [
      "Existing vendor, active contract — already in use for this initiative",
      "Existing vendor, active contract — not yet in use for this initiative",
      "Previously used vendor (no current contract) — re-evaluating",
      "New vendor — in evaluation or PoC, no contract yet",
      "New vendor — not yet engaged, still considering",
      "I'm not sure",
    ]},
    { id: "q7_3", label: "Will the vendor have access to or process any of your data?", type: "select", routes: ["PROC", "PRIV", "LEG"],
      branch: { field: "q6_1", values: [
        "A — Building on a third-party AI model or API (OpenAI, Anthropic, Google, AWS)",
        "C — Procuring a ready-made AI SaaS product from a vendor",
        "D — Enabling AI features within an existing platform (Copilot, Einstein, etc.)",
        "E — Combining multiple approaches above",
      ]},
      options: [
      "Yes — vendor will process or access our data",
      "No — fully isolated, no data leaves our systems",
      "I'm not sure",
    ]},
    { id: "q7_4", label: "Will the vendor use your data to train or improve their AI model?", type: "select", routes: ["PROC", "LEG"],
      branch: { field: "q6_1", values: [
        "A — Building on a third-party AI model or API (OpenAI, Anthropic, Google, AWS)",
        "C — Procuring a ready-made AI SaaS product from a vendor",
        "D — Enabling AI features within an existing platform (Copilot, Einstein, etc.)",
        "E — Combining multiple approaches above",
      ]},
      options: [
      "No — documented that they will not",
      "Yes — vendor may use our data for model training",
      "Not sure — not yet confirmed with vendor",
    ]},
  ],
  additional: [
    { id: "q8_1", label: "Is there anything else the AI Governance team should know about this use case?", type: "textarea", placeholder: "Optional. Include any concerns, risks you have identified, or constraints.", routes: ["GOV"] },
  ],
};

// ─── RISK TIER CALCULATION ─────────────────────────────────
function calculateRiskTier(answers) {
  let score = 0;
  let prohibited = false;
  let highTrigger = false;

  // Check all riskTriggers across multiselect questions
  Object.entries(QUESTIONS).forEach(([, sectionQs]) => {
    sectionQs.forEach((q) => {
      const val = answers[q.id];
      if (!val) return;

      // Multiselect risk triggers
      if (q.riskTriggers && Array.isArray(val)) {
        val.forEach((selected) => {
          if (q.riskTriggers[selected] === "prohibited") prohibited = true;
          if (q.riskTriggers[selected] === "high") highTrigger = true;
        });
      }

      // Single select risk triggers
      if (q.riskTriggers && typeof val === "string") {
        if (q.riskTriggers[val] === "prohibited") prohibited = true;
        if (q.riskTriggers[val] === "high") highTrigger = true;
      }

      // Risk weights
      if (q.riskWeights && typeof val === "string" && q.riskWeights[val]) {
        score += q.riskWeights[val];
      }
    });
  });

  // Compound triggers
  const automation = answers.q2_4;
  const autonomousActions = Array.isArray(answers.q2_2) && answers.q2_2.includes("Taking autonomous actions across systems (sending emails, updating records)");
  if (automation === "Fully automated — no human oversight" && autonomousActions) highTrigger = true;

  if (prohibited) return { tier: "Prohibited", color: BRAND.danger, icon: "🔴" };
  if (highTrigger || score >= 5) return { tier: "High Risk", color: "#FF6B35", icon: "🟠" };
  if (score >= 2) return { tier: "Medium Risk", color: BRAND.warn, icon: "🟡" };
  return { tier: "Low Risk", color: BRAND.accent, icon: "🟢" };
}

function getRoutingTeams(answers) {
  const teams = new Set(["AI Governance Board"]);
  Object.entries(QUESTIONS).forEach(([, sectionQs]) => {
    sectionQs.forEach((q) => {
      if (!answers[q.id]) return;
      if (q.routes) q.routes.forEach((r) => teams.add(r));
    });
  });
  return [...teams];
}

// ─── QUESTION VISIBILITY (BRANCHING) ──────────────────────
function isVisible(q, answers) {
  if (!q.branch) return true;
  const val = answers[q.branch.field];
  if (q.branch.value) return val === q.branch.value;
  if (q.branch.values) return q.branch.values.includes(val);
  return true;
}

// ─── COMPONENT ─────────────────────────────────────────────
const wrap = { maxWidth: 760, margin: "0 auto", padding: "68px 24px 60px" };

export default function IntakeForm() {
  const [answers, setAnswers] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [phase, setPhase] = useState("intro");

  const currentSection = SECTIONS[activeSection];
  const currentQuestions = (QUESTIONS[currentSection.id] || []).filter((q) => isVisible(q, answers));

  const totalVisible = useMemo(() => {
    let count = 0;
    Object.entries(QUESTIONS).forEach(([, qs]) => {
      qs.forEach((q) => { if (isVisible(q, answers)) count++; });
    });
    return count;
  }, [answers]);

  const totalAnswered = useMemo(() => {
    let count = 0;
    Object.entries(QUESTIONS).forEach(([, qs]) => {
      qs.forEach((q) => {
        if (!isVisible(q, answers)) return;
        const val = answers[q.id];
        if (val && (typeof val === "string" ? val.trim() : val.length > 0)) count++;
      });
    });
    return count;
  }, [answers]);

  const progress = totalVisible > 0 ? (totalAnswered / totalVisible) * 100 : 0;
  const riskTier = calculateRiskTier(answers);
  const routingTeams = getRoutingTeams(answers);

  const handleChange = (qId, val) => setAnswers((prev) => ({ ...prev, [qId]: val }));

  const handleMultiSelect = (qId, option) => {
    setAnswers((prev) => {
      const current = prev[qId] || [];
      return { ...prev, [qId]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option] };
    });
  };

  const sectionProgress = (sectionId) => {
    const qs = (QUESTIONS[sectionId] || []).filter((q) => isVisible(q, answers));
    if (qs.length === 0) return 0;
    const answered = qs.filter((q) => {
      const v = answers[q.id];
      return v && (typeof v === "string" ? v.trim() : v.length > 0);
    }).length;
    return answered / qs.length;
  };

  const progressBar = { height: 2, background: BRAND.border, borderRadius: 1, marginBottom: 24 };
  const progressFill = { height: "100%", background: BRAND.accent, width: `${progress}%`, transition: "width 0.4s ease", borderRadius: 1 };

  // ─── INTRO ───────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={{ ...wrap, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "calc(100vh - 52px)" }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>Use Case Intake · v1.0</span>
      </div>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 20px", color: BRAND.white }}>
        AI Use Case<br /><span style={{ color: BRAND.accent }}>Intake & Risk Tiering</span>
      </h1>
      <p style={{ fontSize: 15, color: BRAND.light, lineHeight: 1.7, maxWidth: 520, margin: "0 0 32px" }}>
        Register a new AI use case with the governance function. Your responses assign a risk tier,
        route the use case to review teams, and add it to the AI inventory.
      </p>
      <p style={{ fontSize: 13, color: BRAND.muted, lineHeight: 1.6, maxWidth: 520, margin: "0 0 12px" }}>
        Aligned to NIST AI RMF, EU AI Act, GDPR/UK GDPR
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        {[
          { label: "Prohibited", color: BRAND.danger },
          { label: "High Risk", color: "#FF6B35" },
          { label: "Medium Risk", color: BRAND.warn },
          { label: "Low Risk", color: BRAND.accent },
        ].map((t) => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: t.color }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} /> {t.label}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
        {SECTIONS.map((s) => (
          <div key={s.id} style={{
            padding: "6px 12px", background: BRAND.bgCard,
            border: `1px solid ${BRAND.border}`, borderRadius: 6,
            fontSize: 11, color: BRAND.muted,
          }}>
            <span style={{ color: BRAND.accent, marginRight: 6 }}>{s.icon}</span>{s.label}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: BRAND.muted, marginBottom: 32 }}>
        Estimated time: 20-30 minutes. Answer based on your current understanding. This is an intake form, not a technical audit.
      </p>
      <button onClick={() => setPhase("form")} style={{
        background: BRAND.accent, color: BRAND.bg, border: "none",
        borderRadius: 6, padding: "14px 32px", fontSize: 14, fontWeight: 700,
        cursor: "pointer", letterSpacing: "0.05em", width: "fit-content",
      }}>
        Begin Intake →
      </button>
    </div>
  );

  // ─── RESULTS ─────────────────────────────────────────────
  if (phase === "results") return (
    <div style={wrap}>
      <div style={progressBar}><div style={{ ...progressFill, width: "100%" }} /></div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Intake Complete · Risk Tiering Result
        </span>
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 32px", color: BRAND.white }}>
        {answers.q1_1 || "AI Use Case"} — Risk Assessment
      </h2>

      {/* Risk Tier Card */}
      <div style={{
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        borderLeft: `4px solid ${riskTier.color}`, borderRadius: 10,
        padding: 32, marginBottom: 24, display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{ fontSize: 48 }}>{riskTier.icon}</div>
        <div>
          <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 4 }}>ASSIGNED RISK TIER</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: riskTier.color }}>{riskTier.tier}</div>
        </div>
      </div>

      {/* Use Case Summary */}
      <div style={{
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        borderRadius: 10, padding: 24, marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 16 }}>USE CASE SUMMARY</div>
        {[
          { label: "Name", value: answers.q1_1 },
          { label: "Submitter", value: answers.q1_2 },
          { label: "Department", value: answers.q1_5 },
          { label: "Stage", value: answers.q1_8 },
          { label: "Decision Role", value: answers.q2_4 },
          { label: "Primary Output", value: answers.q2_3 },
        ].filter((r) => r.value).map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BRAND.border}22` }}>
            <span style={{ fontSize: 12, color: BRAND.muted }}>{row.label}</span>
            <span style={{ fontSize: 12, color: BRAND.light, maxWidth: "60%", textAlign: "right" }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Routing Teams */}
      <div style={{
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        borderRadius: 10, padding: 24, marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 16 }}>ROUTED TO REVIEW TEAMS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {routingTeams.map((team) => (
            <span key={team} style={{
              padding: "6px 12px", borderRadius: 4,
              background: `${BRAND.accent}18`, border: `1px solid ${BRAND.accent}44`,
              fontSize: 11, color: BRAND.accent, fontWeight: 600,
            }}>{team}</span>
          ))}
        </div>
      </div>

      {/* Risk Flags */}
      {riskTier.tier === "Prohibited" && (
        <div style={{
          background: `${BRAND.danger}12`, border: `1px solid ${BRAND.danger}44`,
          borderRadius: 10, padding: 20, marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.danger, marginBottom: 8 }}>
            PROHIBITED USE CASE DETECTED
          </div>
          <p style={{ fontSize: 13, color: BRAND.light, lineHeight: 1.6, margin: 0 }}>
            This use case involves capabilities classified as prohibited under the EU AI Act and/or your organization's
            AI Constitution. It cannot proceed without an exception approved by the AI Governance Board and Legal.
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.bgMid}, ${BRAND.bgCard})`,
        border: `1px solid ${BRAND.accent}44`, borderRadius: 10, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.white, marginBottom: 4 }}>Submission recorded</div>
          <div style={{ fontSize: 13, color: BRAND.muted }}>This use case has been added to the AI inventory and routed for review.</div>
        </div>
        <button onClick={() => { setAnswers({}); setPhase("intro"); setActiveSection(0); }} style={{
          background: "transparent", color: BRAND.accent,
          border: `1px solid ${BRAND.accent}`, borderRadius: 6,
          padding: "10px 20px", fontSize: 12, cursor: "pointer",
          fontFamily: "inherit", letterSpacing: "0.05em",
        }}>
          Submit Another
        </button>
      </div>
    </div>
  );

  // ─── FORM ────────────────────────────────────────────────
  return (
    <div style={wrap}>
      <div style={progressBar}><div style={progressFill} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: -16, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: BRAND.muted }}>{totalAnswered}/{totalVisible}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: riskTier.color, fontWeight: 600 }}>{riskTier.icon} {riskTier.tier}</span>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 40, flexWrap: "wrap" }}>
        {SECTIONS.map((s, i) => {
          const pct = sectionProgress(s.id);
          const isActive = i === activeSection;
          return (
            <button key={s.id} onClick={() => setActiveSection(i)} style={{
              background: isActive ? BRAND.bgCard : "transparent",
              border: `1px solid ${isActive ? BRAND.accent : BRAND.border}`,
              borderRadius: 6, padding: "6px 10px", fontSize: 10,
              color: isActive ? BRAND.accent : BRAND.muted,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em",
              display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s",
            }}>
              <span style={{ fontWeight: 700 }}>{s.icon}</span>
              <span style={{ display: isActive ? "inline" : "none" }}>{s.label}</span>
              {pct === 1 && <span style={{ color: BRAND.accent, fontSize: 9 }}>✓</span>}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Section {activeSection + 1} of {SECTIONS.length}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: BRAND.white }}>{currentSection.label}</h2>
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {currentQuestions.map((q) => {
          const val = answers[q.id];
          const hasVal = val && (typeof val === "string" ? val.trim() : val.length > 0);
          return (
            <div key={q.id} style={{
              background: BRAND.bgCard, border: `1px solid ${hasVal ? BRAND.accent + "44" : BRAND.border}`,
              borderRadius: 10, padding: "20px 24px", transition: "border-color 0.2s",
            }}>
              <div style={{ fontSize: 13, color: BRAND.light, lineHeight: 1.6, marginBottom: 14 }}>
                {q.label}
                {q.required && <span style={{ color: BRAND.danger, marginLeft: 4 }}>*</span>}
              </div>

              {q.routes && (
                <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                  {q.routes.map((r) => (
                    <span key={r} style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 3,
                      background: `${BRAND.accent}12`, color: BRAND.muted, letterSpacing: "0.08em",
                    }}>{r}</span>
                  ))}
                </div>
              )}

              {/* Text input */}
              {q.type === "text" && (
                <input
                  value={val || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  style={{
                    width: "100%", background: BRAND.bgMid, border: `1px solid ${BRAND.border}`,
                    borderRadius: 6, padding: "10px 14px", fontSize: 13, color: BRAND.white,
                    fontFamily: "inherit", outline: "none",
                  }}
                />
              )}

              {/* Textarea */}
              {q.type === "textarea" && (
                <textarea
                  value={val || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={4}
                  style={{
                    width: "100%", background: BRAND.bgMid, border: `1px solid ${BRAND.border}`,
                    borderRadius: 6, padding: "10px 14px", fontSize: 13, color: BRAND.white,
                    fontFamily: "inherit", outline: "none", resize: "vertical",
                  }}
                />
              )}

              {/* Single select */}
              {q.type === "select" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt) => {
                    const isSelected = val === opt;
                    return (
                      <button key={opt} onClick={() => handleChange(q.id, opt)} style={{
                        background: isSelected ? `${BRAND.accent}18` : "transparent",
                        border: `1px solid ${isSelected ? BRAND.accent : BRAND.border}`,
                        borderRadius: 6, padding: "10px 14px", fontSize: 12,
                        color: isSelected ? BRAND.accent : BRAND.light,
                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        fontWeight: isSelected ? 600 : 400, transition: "all 0.15s",
                      }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multi select */}
              {q.type === "multiselect" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt) => {
                    const isSelected = (val || []).includes(opt);
                    const triggerLevel = q.riskTriggers?.[opt];
                    return (
                      <button key={opt} onClick={() => handleMultiSelect(q.id, opt)} style={{
                        background: isSelected ? `${BRAND.accent}18` : "transparent",
                        border: `1px solid ${isSelected ? BRAND.accent : BRAND.border}`,
                        borderRadius: 6, padding: "10px 14px", fontSize: 12,
                        color: isSelected ? BRAND.accent : BRAND.light,
                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        fontWeight: isSelected ? 600 : 400, transition: "all 0.15s",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <span>{opt}</span>
                        {triggerLevel && (
                          <span style={{
                            fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700,
                            background: triggerLevel === "prohibited" ? `${BRAND.danger}22` : "#FF6B3522",
                            color: triggerLevel === "prohibited" ? BRAND.danger : "#FF6B35",
                          }}>
                            {triggerLevel === "prohibited" ? "PROHIBITED" : "HIGH RISK"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Risk flag indicator */}
              {q.riskFlag && val && q.riskFlag.values.includes(val) && (
                <div style={{
                  marginTop: 10, padding: "6px 10px", borderRadius: 4,
                  background: `${BRAND.warn}18`, border: `1px solid ${BRAND.warn}44`,
                  fontSize: 10, color: BRAND.warn, fontWeight: 600,
                }}>
                  {q.riskFlag.label}: Flagged for expedited AI Governance Board review
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
        <button
          onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
          disabled={activeSection === 0}
          style={{
            background: "transparent", border: `1px solid ${BRAND.border}`,
            borderRadius: 6, padding: "12px 24px", fontSize: 13,
            color: activeSection === 0 ? BRAND.border : BRAND.muted,
            cursor: activeSection === 0 ? "default" : "pointer", fontFamily: "inherit",
          }}
        >
          ← Previous
        </button>
        {activeSection < SECTIONS.length - 1 ? (
          <button onClick={() => setActiveSection(activeSection + 1)} style={{
            background: BRAND.accent, color: BRAND.bg, border: "none",
            borderRadius: 6, padding: "12px 28px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Next Section →
          </button>
        ) : (
          <button onClick={() => setPhase("results")} style={{
            background: BRAND.accent, color: BRAND.bg, border: "none",
            borderRadius: 6, padding: "12px 28px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Submit & View Risk Tier →
          </button>
        )}
      </div>
    </div>
  );
}
