import { BRAND } from "../../brand";
import { CLIENT, LAYERS, TELEMETRY_MATRIX } from "../audit/syntheticData";

// Derive policy content from audit findings
function deriveLoggingPolicy() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const auditFinding = appLayer.findings.find((f) => f.control === "Structured Audit Logging");
  const hasStructuredLogs = auditFinding?.severity === "green";

  return {
    title: "1. What Is Logged and Why",
    status: hasStructuredLogs ? "green" : "red",
    currentState: auditFinding?.actual,
    clauses: [
      `${CLIENT.name} operates an AI-powered ${CLIENT.aiSystem} deployed on ${CLIENT.deployment}.`,
      "The system logs the following for every interaction: timestamp, authenticated user identity (via Azure AD SSO), query metadata, response confidence score, retrieval source document IDs, and response hash.",
      "Query text is stored in hashed form by default. Plaintext query content is only accessible under break-glass incident investigation procedures (see Section 6).",
      "Logging serves three purposes: (a) security and compliance monitoring, (b) model quality assurance, and (c) employee transparency.",
      hasStructuredLogs
        ? "Current state: Structured audit logging is implemented and operational."
        : `Current gap: ${auditFinding?.actual}. Remediation required before this policy is fully enforceable.`,
    ],
  };
}

function deriveAccessPolicy() {
  const matrix = TELEMETRY_MATRIX;
  return {
    title: "2. Who Can Access Logs — and Under What Conditions",
    status: "yellow",
    clauses: [
      "Access to telemetry data is governed by role-based access control. The following matrix defines what each role can see:",
    ],
    matrix: matrix,
    postClauses: [
      "System Analysts can view aggregate metadata and signals only — no query content, no response content, no user identification.",
      "Security and Compliance teams access query hashes and anonymized user identifiers for pattern analysis. They cannot read plaintext queries.",
      "Incident Investigation access requires dual approval from the AI Governance Owner and CISO, an active incident ticket, and expires automatically after 24 hours.",
      `AI Provider (Azure OpenAI) has access to query and response content per standard data processing terms. ${
        matrix.footnotes[2].includes("No opt-out")
          ? "NOTICE: Enterprise Agreement abuse monitoring opt-out is NOT currently active. Prompts may be reviewed by Microsoft for abuse monitoring purposes. Upgrade to EA opt-out is recommended."
          : "Enterprise Agreement opt-out is active — prompts are not used for abuse monitoring."
      }`,
    ],
  };
}

function deriveEmployeeRights() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const disclosureFinding = appLayer.findings.find((f) => f.control === "Employee AI Usage Disclosure");
  const hasDisclosure = disclosureFinding?.severity === "green";

  return {
    title: "3. Employee Rights",
    status: hasDisclosure ? "green" : "red",
    currentState: disclosureFinding?.actual,
    clauses: [
      `All employees of ${CLIENT.name} who interact with the ${CLIENT.aiSystem} have the following rights:`,
      "RIGHT TO KNOW: Employees must be informed that they are interacting with an AI system and that interactions are logged.",
      "RIGHT TO ACCESS: Employees may request a copy of their own query history and AI responses. Access is limited to their own interactions (see Telemetry Matrix: Employee row).",
      "RIGHT TO CORRECTION: If an AI-generated response was used in a business decision and is later found to be inaccurate, employees may flag the response for review and correction in downstream records.",
      "RIGHT TO HUMAN REVIEW: Employees may request human review of any AI-generated response before acting on it for financial, compliance, or regulatory matters.",
      hasDisclosure
        ? "Current state: AI usage policy has been communicated to all employees."
        : `Current gap: ${disclosureFinding?.actual}. This policy must be distributed and acknowledged by all employees before the system is compliant.`,
    ],
  };
}

function deriveVendorTerms() {
  const modelLayer = LAYERS.find((l) => l.id === "model");
  const azureFinding = modelLayer.findings.find((f) => f.control === "Azure Data Processing Terms");
  const contentSafety = modelLayer.findings.find((f) => f.control === "Content Safety API");

  return {
    title: "4. Vendor Data Rights (Azure OpenAI)",
    status: azureFinding?.severity === "green" ? "green" : "yellow",
    clauses: [
      `${CLIENT.name} uses Azure OpenAI (GPT-4o) as the underlying model provider.`,
      `Current tier: ${azureFinding?.actual}.`,
      "Under standard Azure OpenAI terms, Microsoft may process prompts and completions for abuse monitoring. Content is not used for model training.",
      azureFinding?.severity !== "green"
        ? "RECOMMENDATION: Upgrade to Enterprise Agreement with abuse monitoring opt-out to ensure no prompt content is reviewed by Microsoft personnel."
        : "Enterprise opt-out is active. No prompt content is reviewed by Microsoft personnel.",
      `Content Safety API status: ${contentSafety?.actual}. ${contentSafety?.severity !== "green" ? "This must be configured before production use in a regulated industry." : ""}`,
      "Data residency: All processing occurs within the Azure region specified in the deployment agreement. No data is transferred outside the designated region.",
    ],
  };
}

function deriveAgenticBoundaries() {
  const dataLayer = LAYERS.find((l) => l.id === "data");
  const identityFinding = dataLayer.findings.find((f) => f.control === "Identity Propagation");
  const roleFinding = dataLayer.findings.find((f) => f.control === "AI Service Role Privileges");
  const vectorLayer = LAYERS.find((l) => l.id === "vector");
  const scopeFinding = vectorLayer.findings.find((f) => f.control === "Retrieval Scope Enforcement");
  const modelLayer = LAYERS.find((l) => l.id === "model");
  const guardrailFinding = modelLayer.findings.find((f) => f.control === "System Prompt Guardrails");
  const directInjection = modelLayer.findings.find((f) => f.control === "Direct Prompt Injection Defenses");
  const indirectInjection = modelLayer.findings.find((f) => f.control === "Indirect Prompt Injection Defenses");
  const outputValidation = LAYERS.find((l) => l.id === "vector")?.findings.find((f) => f.control === "Output Validation Gate");

  return {
    title: "5. Agentic Authorization Boundaries",
    status: "red",
    clauses: [
      `The ${CLIENT.aiSystem} operates within the following authorization boundaries:`,
      `DATA ACCESS: The AI service role (AI_SERVICE_ROLE) ${roleFinding?.severity === "green" ? "is scoped to authorized schemas only" : `currently ${roleFinding?.actual.toLowerCase()}. This must be restricted to minimum required schemas.`}`,
      `IDENTITY: ${identityFinding?.severity === "green" ? "End-user identity is propagated on every query." : `${identityFinding?.actual}. The system must propagate the requesting user's identity to enforce per-user access policies.`}`,
      `RETRIEVAL SCOPE: ${scopeFinding?.severity === "green" ? "Document retrieval is scoped to user access level." : `${scopeFinding?.actual}. Documents must be access-tagged and retrieval must be filtered by user role.`}`,
      `BEHAVIORAL GUARDRAILS: ${guardrailFinding?.actual}. The system prompt must include explicit scope limitations, refusal patterns for out-of-scope queries, and output formatting constraints.`,
      `DIRECT INJECTION DEFENSE: ${directInjection?.actual || "Not assessed"}. WAF-level input filtering, regex validation, and prompt attack classifiers must be active before production deployment.`,
      `INDIRECT INJECTION DEFENSE: ${indirectInjection?.actual || "Not assessed"}. All RAG-sourced documents must be scanned for embedded instructions before entering the model context window.`,
      `OUTPUT VALIDATION: ${outputValidation?.actual || "Not assessed"}. No AI-generated content may flow into downstream systems (reports, databases, APIs, Slack) without content classification, PII scanning, and confidence threshold validation.`,
      "The AI system MUST NOT: execute actions outside its defined scope, access data beyond the requesting user's permissions, make autonomous decisions on financial or compliance matters without human review, or modify any source data.",
    ],
  };
}

function deriveIncidentResponse() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const reviewFinding = appLayer.findings.find((f) => f.control === "Human Review Queue");
  const anomalyFinding = appLayer.findings.find((f) => f.control === "Anomaly Detection");

  return {
    title: "6. Incident Investigation Process",
    status: reviewFinding?.severity === "green" && anomalyFinding?.severity === "green" ? "green" : "red",
    clauses: [
      "AI governance incidents are classified into three severity tiers:",
      "P1 — CRITICAL: Confirmed data breach, PII exposure via AI responses, unauthorized access to restricted documents, or prompt injection resulting in data exfiltration. Response SLA: 1 hour. Requires immediate system suspension pending investigation.",
      "P2 — HIGH: Repeated hallucination in financial/compliance responses, systematic confidence score degradation below 0.60, or unauthorized query pattern anomalies. Response SLA: 4 hours.",
      "P3 — MODERATE: Individual low-confidence responses, single guardrail trigger events, or employee complaints about AI accuracy. Response SLA: 24 hours.",
      "BREAK-GLASS PROCEDURE: For P1 incidents, investigators may access plaintext query and response logs. This requires: (a) dual approval from AI Governance Owner and CISO, (b) an active incident ticket with severity classification, (c) access automatically expires after 24 hours, (d) all access is logged and auditable.",
      `Human review queue status: ${reviewFinding?.actual}. ${reviewFinding?.severity !== "green" ? "A human review queue must be operational before this process is fully enforceable." : ""}`,
      `Anomaly detection status: ${anomalyFinding?.actual}. ${anomalyFinding?.severity !== "green" ? "Behavioral anomaly detection must be implemented to enable proactive incident identification." : ""}`,
    ],
  };
}

function deriveRetentionPolicy() {
  const dataLayer = LAYERS.find((l) => l.id === "data");
  const retentionFinding = dataLayer.findings.find((f) => f.control === "Prompt & Response Retention Policy");

  return {
    title: "7. Prompt & Response Retention",
    status: retentionFinding?.severity === "green" ? "green" : "red",
    currentState: retentionFinding?.actual,
    clauses: [
      `${CLIENT.name} retains a temporary, complete record of all model prompts and responses for a rolling 30-day window.`,
      "PURPOSE: Retention exists solely to ensure documentation is available for potential workplace safety, legal, or security matters. Records are kept regardless of any user-facing product-level decisions.",
      "RESTRICTED USE: Retained prompt and response data can ONLY be used for workplace safety, security investigation, and privacy compliance purposes. This data cannot be used for application analytics, benchmarking, troubleshooting, debugging, or any other purpose.",
      "APPROVAL REQUIRED: Any use of retained prompts/responses outside of security, privacy, and legal purposes requires explicit written approval from the CISO, Privacy Officer, and General Counsel.",
      "RAG DATA: Any prompt content sourced from customer input or external data (including RAG retrieval of non-company documents) requires explicit legal and customer consent before storage. Customer-sourced content must not be classified, analyzed, or retained beyond the security audit window without consent.",
      retentionFinding?.severity !== "green"
        ? `Current gap: ${retentionFinding?.actual}. A 30-day retention pipeline with restricted access must be implemented.`
        : "Current state: Prompt retention policy is implemented and enforced.",
    ],
  };
}

function deriveSecurityControls() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const modelLayer = LAYERS.find((l) => l.id === "model");
  const cspFinding = appLayer.findings.find((f) => f.control === "Security Headers (CSP / XSS)");
  const rateFinding = appLayer.findings.find((f) => f.control === "DDoS / Rate Limiting");
  const sessionFinding = appLayer.findings.find((f) => f.control === "User Session Isolation");
  const andonFinding = modelLayer.findings.find((f) => f.control.includes("Kill Switch"));
  const secTestFinding = modelLayer.findings.find((f) => f.control === "Security Testing Pipeline");

  const allGreen = [cspFinding, rateFinding, sessionFinding, andonFinding, secTestFinding]
    .every((f) => f?.severity === "green");
  const hasRed = [cspFinding, rateFinding, sessionFinding, andonFinding, secTestFinding]
    .some((f) => f?.severity === "red");

  return {
    title: "8. Application Security Controls",
    status: allGreen ? "green" : hasRed ? "red" : "yellow",
    clauses: [
      "The following application-level security controls are required for all AI-enabled interfaces:",
      `SECURITY HEADERS: ${cspFinding?.actual || "Not assessed"}. Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options, and HSTS must be configured to mitigate XSS, clickjacking, and data injection attacks.`,
      `RATE LIMITING: ${rateFinding?.actual || "Not assessed"}. All AI query endpoints must enforce per-user and per-IP rate limits to prevent abuse and resource exhaustion. API keys must be used for throttling only, never for authentication.`,
      `SESSION ISOLATION: ${sessionFinding?.actual || "Not assessed"}. Each user session must be fully isolated — no cross-session context leakage, conversation history, or retrieved document bleed between users.`,
      `ANDON CORD (AI KILL SWITCH): ${andonFinding?.actual || "Not assessed"}. A mechanism must exist to disable all GenAI functionality independently of the model provider. When activated, users receive a generic fallback message. The kill switch must be testable quarterly.`,
      `SECURITY TESTING PIPELINE: ${secTestFinding?.actual || "Not assessed"}. Automated adversarial tests (prompt injection, data exfiltration, jailbreak, system prompt extraction) must run in CI/CD on every deployment.`,
    ],
  };
}

function deriveDisclaimerPolicy() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const disclaimerFinding = appLayer.findings.find((f) => f.control === "Gen AI Disclaimer Banner");

  return {
    title: "9. Gen AI Disclaimer & Data Classification",
    status: disclaimerFinding?.severity === "green" ? "green" : "red",
    currentState: disclaimerFinding?.actual,
    clauses: [
      "A persistent disclaimer must be displayed on every AI interaction screen containing the following information:",
      "DATA CLASSIFICATION: This system is approved for Internal Use only. Do not enter customer data, customer PII, or any data classified above Internal without explicit authorization.",
      "OUTPUT VERIFICATION: AI-generated outputs must be independently verified before being relied upon for business decisions, regulatory filings, or external communications.",
      "PROMPT USAGE: User prompts may be used to improve system quality and safety within the bounds defined by this policy (see Section 7 for retention terms).",
      "EMPLOYEE/CANDIDATE DATA: Use of employee or candidate personal data in AI prompts must comply with HR data handling guidelines. Do not enter performance reviews, compensation data, or disciplinary records.",
      "JUDGMENT REQUIRED: Users must exercise their own professional judgment and not solely depend on AI-generated responses. The AI system is an assistive tool, not a decision-maker.",
      disclaimerFinding?.severity !== "green"
        ? `Current gap: ${disclaimerFinding?.actual}. A disclaimer banner must be implemented before go-live.`
        : "Current state: Gen AI disclaimer is displayed on all AI interaction screens.",
    ],
  };
}

function deriveModelGovernance() {
  const modelLayer = LAYERS.find((l) => l.id === "model");
  const legalFinding = modelLayer.findings.find((f) => f.control === "Pre-Trained Model Legal Approval");
  const dataLayer = LAYERS.find((l) => l.id === "data");
  const iamFinding = dataLayer.findings.find((f) => f.control === "Scoped IAM Policies");
  const secretFinding = dataLayer.findings.find((f) => f.control === "Secret Rotation");

  const allGreen = [legalFinding, iamFinding, secretFinding].every((f) => f?.severity === "green");
  const hasRed = [legalFinding, iamFinding, secretFinding].some((f) => f?.severity === "red");

  return {
    title: "10. Model & Infrastructure Governance",
    status: allGreen ? "green" : hasRed ? "red" : "yellow",
    clauses: [
      "All foundation models and infrastructure components used in AI systems must meet the following governance requirements:",
      `MODEL LEGAL APPROVAL: ${legalFinding?.actual || "Not assessed"}. Every pre-trained model (including foundation models and fine-tuned variants) must have documented legal approval covering: IP ownership of outputs, licensing terms, data processing agreements, and approved use cases. No model may be deployed to production without legal sign-off.`,
      `IAM LEAST PRIVILEGE: ${iamFinding?.actual || "Not assessed"}. All service roles must follow least-privilege IAM policies scoped to specific resources. IAM policy drift detection must be active with automated alerting.`,
      `SECRET MANAGEMENT: ${secretFinding?.actual || "Not assessed"}. All API keys, service credentials, and connection strings must be stored in a managed vault with automated rotation (90-day cycle minimum). No hardcoded secrets in application code or environment variables.`,
      "INFRASTRUCTURE SECURITY: All cloud resources must enforce HTTPS-only access, enable access logging, disable legacy authentication mechanisms (e.g. IMDSv1), and use secure-by-default configuration templates.",
    ],
  };
}

function deriveFairnessPolicy() {
  const modelLayer = LAYERS.find((l) => l.id === "model");
  const biasFinding = modelLayer.findings.find((f) => f.control === "Bias & Fairness Testing Framework");
  const prohibitedFinding = modelLayer.findings.find((f) => f.control === "Prohibited Use Case Enforcement");

  const allGreen = [biasFinding, prohibitedFinding].every((f) => f?.severity === "green");
  const hasRed = [biasFinding, prohibitedFinding].some((f) => f?.severity === "red");

  return {
    title: "11. Fairness, Bias & Prohibited Uses",
    status: allGreen ? "green" : hasRed ? "red" : "yellow",
    clauses: [
      `${CLIENT.name} is committed to ensuring its AI systems do not discriminate unlawfully or produce unjust outcomes based on protected characteristics including race, gender, age, disability, religion, sexual orientation, or national origin.`,
      `BIAS TESTING: ${biasFinding?.actual || "Not assessed"}. All AI systems must undergo bias and fairness evaluation before production deployment. Fairness metrics (demographic parity, equalized odds) must be defined per use case with Legal and Compliance sign-off. Deployment is blocked if thresholds are exceeded.`,
      `PROHIBITED USES: ${prohibitedFinding?.actual || "Not assessed"}. The following AI applications are explicitly prohibited and must be blocked at the intake and deployment gates:`,
      "- Emotional monitoring or inference of employee emotional state in the workplace",
      "- Social scoring or behavioral ranking of individuals",
      "- Subliminal or deceptive manipulation of individual behavior",
      "- Real-time biometric identification in publicly accessible spaces without explicit consent",
      "- AI systems that exploit vulnerabilities of specific groups (age, disability, economic situation)",
      "No business justification, commercial opportunity, or industry precedent overrides these prohibitions.",
      biasFinding?.severity !== "green"
        ? `Current gap: ${biasFinding?.actual}. A bias and fairness testing framework must be implemented before production deployment.`
        : "Current state: Bias and fairness testing framework is operational.",
    ],
  };
}

function deriveVendorGovernancePolicy() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const vendorGovFinding = appLayer.findings.find((f) => f.control === "Vendor Governance & Monitoring");
  const dataLayer = LAYERS.find((l) => l.id === "data");
  const trainingFinding = dataLayer.findings.find((f) => f.control === "Vendor Data Training Restrictions");
  const modelLayer = LAYERS.find((l) => l.id === "model");
  const vendorReviewFinding = modelLayer.findings.find((f) => f.control === "Third-Party Vendor AI Risk Review");

  const allGreen = [vendorGovFinding, trainingFinding, vendorReviewFinding].every((f) => f?.severity === "green");
  const hasRed = [vendorGovFinding, trainingFinding, vendorReviewFinding].some((f) => f?.severity === "red");

  return {
    title: "12. Third-Party & Vendor AI Governance",
    status: allGreen ? "green" : hasRed ? "red" : "yellow",
    clauses: [
      `When AI capabilities operate under ${CLIENT.name}'s name or affect its customers, accountability remains with ${CLIENT.name} regardless of the vendor source.`,
      `VENDOR ASSESSMENT: ${vendorReviewFinding?.actual || "Not assessed"}. Before procuring, integrating, or renewing any AI-powered product, a Third-Party AI Vendor Assessment must evaluate: governance framework, risk classification, data handling practices, explainability, incident response obligations, and contractual protections.`,
      `DATA TRAINING RESTRICTIONS: ${trainingFinding?.actual || "Not assessed"}. All contracts with AI vendors must restrict the vendor from using organizational or customer data to train their models without explicit written consent.`,
      "REQUIRED CONTRACT CLAUSES: All AI vendor contracts must include: (a) data training opt-out, (b) prompt incident notification, (c) audit rights over AI compliance, (d) data protection alignment with GDPR/CCPA, (e) EU AI Act compliance where applicable.",
      `ONGOING MONITORING: ${vendorGovFinding?.actual || "Not assessed"}. Third-party AI relationships must be monitored continuously. High-risk vendors reviewed quarterly, medium-risk annually. New AI features introduced by vendors within existing contracts are subject to the same intake and assessment process as new procurement.`,
      "VENDOR REGISTRY: All third-party AI systems must be registered in the AI Use Case Registry with designated internal owners, risk tier classification, and review schedules.",
    ],
  };
}

function deriveTrainingCulturePolicy() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const trainingFinding = appLayer.findings.find((f) => f.control === "AI Literacy & Training Program");
  const concernsFinding = appLayer.findings.find((f) => f.control === "AI Concern Reporting Channels");
  const raciFinding = appLayer.findings.find((f) => f.control === "AI Decision Authority Matrix (RACI)");

  const allGreen = [trainingFinding, concernsFinding, raciFinding].every((f) => f?.severity === "green");
  const hasRed = [trainingFinding, concernsFinding, raciFinding].some((f) => f?.severity === "red");

  return {
    title: "13. Training, Culture & Accountability",
    status: allGreen ? "green" : hasRed ? "red" : "yellow",
    clauses: [
      "Governance documents do not create responsible AI on their own. Culture and capability matter at least as much.",
      `AI TRAINING: ${trainingFinding?.actual || "Not assessed"}. All employees who interact with AI systems must complete role-based training: (a) General workforce — AI literacy, responsible use, data handling. (b) Technical teams — model evaluation, bias awareness, security. (c) Leadership — governance responsibilities, risk oversight, accountability.`,
      `SPEAK-UP CULTURE: ${concernsFinding?.actual || "Not assessed"}. Clear channels must exist for employees to raise AI-related concerns (bias, safety, misuse, policy violations). There must be no adverse consequences for raising concerns in good faith. Leaders set the tone — a team that sees its leader question an AI output understands it is safe to do the same.`,
      `DECISION AUTHORITY: ${raciFinding?.actual || "Not assessed"}. An AI Decision Authority Matrix (RACI) must define who is accountable at every level: use case registration, risk tier escalation, deployment gates, incident response, and ongoing monitoring.`,
      "AI GOVERNANCE BODY: An AI Governance Body with enterprise-level oversight must be established. Responsibilities include: maintaining the AI Constitution, approving high-risk AI deployments, receiving incident reports, monitoring the AI risk landscape, and reporting to senior leadership.",
      trainingFinding?.severity !== "green"
        ? `Current gap: ${trainingFinding?.actual}. Training and accountability infrastructure must be established before AI adoption scales further.`
        : "Current state: AI training and accountability framework is operational.",
    ],
  };
}

function deriveTransparencyPolicy() {
  const appLayer = LAYERS.find((l) => l.id === "app");
  const transparencyFinding = appLayer.findings.find((f) => f.control === "AI Transparency Disclosure");
  const modelLayer = LAYERS.find((l) => l.id === "model");
  const driftFinding = modelLayer.findings.find((f) => f.control === "Model Drift Detection");

  const allGreen = [transparencyFinding, driftFinding].every((f) => f?.severity === "green");
  const hasRed = [transparencyFinding, driftFinding].some((f) => f?.severity === "red");

  return {
    title: "14. Transparency & Explainability",
    status: allGreen ? "green" : hasRed ? "red" : "yellow",
    clauses: [
      "Transparency means being open about what AI is in use, how it works, what it can and cannot do, and how decisions informed by AI are made. Transparency is a precondition for trust.",
      `AI DISCLOSURE: ${transparencyFinding?.actual || "Not assessed"}. End users must be clearly informed when they are interacting with AI-generated content. All AI interaction screens must display a persistent transparency indicator. AI-generated outputs must be distinguishable from human-authored content.`,
      "EXPLAINABILITY: AI systems whose outputs inform material business decisions must provide documentation of: (a) what data informed the output, (b) the model or logic used, (c) confidence level, and (d) known limitations. The obligation to explain is proportional to the impact of the decision.",
      `DRIFT MONITORING: ${driftFinding?.actual || "Not assessed"}. AI behavior can change or degrade without code changes. Performance baselines must be established for all production AI systems with automated alerting when outputs degrade beyond defined thresholds.`,
      "SHADOW AI PREVENTION: The obligation to log and register AI use is a core accountability measure. It prevents Shadow AI from taking root. It is not punitive — it is how the organization learns what AI is in use and can support people using it responsibly.",
      "REGULATORY DOCUMENTATION: Compliance artifacts (audit trails, risk assessments, impact analyses) must be generated and maintained as part of the AI system lifecycle, not created retroactively when regulators ask.",
    ],
  };
}

const SECTIONS = [
  deriveLoggingPolicy,
  deriveAccessPolicy,
  deriveEmployeeRights,
  deriveVendorTerms,
  deriveAgenticBoundaries,
  deriveIncidentResponse,
  deriveRetentionPolicy,
  deriveSecurityControls,
  deriveDisclaimerPolicy,
  deriveModelGovernance,
  deriveFairnessPolicy,
  deriveVendorGovernancePolicy,
  deriveTrainingCulturePolicy,
  deriveTransparencyPolicy,
];

const severityColor = (s) => s === "red" ? BRAND.danger : s === "yellow" ? BRAND.warn : BRAND.accent;
const severityLabel = (s) => s === "red" ? "GAPS FOUND" : s === "yellow" ? "REVIEW NEEDED" : "COMPLIANT";

function PolicySection({ section }) {
  return (
    <div style={{
      background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
      borderLeft: `3px solid ${severityColor(section.status)}`,
      borderRadius: 8, padding: "24px 28px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: BRAND.white, margin: 0 }}>{section.title}</h3>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
          color: severityColor(section.status),
          background: severityColor(section.status) + "18",
          padding: "3px 10px", borderRadius: 4,
        }}>{severityLabel(section.status)}</span>
      </div>

      {section.currentState && (
        <div style={{
          background: BRAND.bgMid, borderRadius: 4, padding: "8px 12px",
          marginBottom: 14, fontSize: 11, color: BRAND.warn,
          borderLeft: `2px solid ${BRAND.warn}44`,
        }}>
          Audit finding: {section.currentState}
        </div>
      )}

      {section.clauses.map((clause, i) => (
        <p key={i} style={{
          fontSize: 13, color: BRAND.light, lineHeight: 1.65, margin: "0 0 10px",
          ...(/^(RIGHT TO|P[123] —|BREAK-GLASS|RECOMMENDATION|NOTICE|The AI system MUST NOT|PURPOSE:|RESTRICTED USE:|APPROVAL REQUIRED:|RAG DATA:|DATA CLASSIFICATION:|OUTPUT VERIFICATION:|PROMPT USAGE:|EMPLOYEE\/CANDIDATE|JUDGMENT REQUIRED:|DATA ACCESS:|IDENTITY:|RETRIEVAL SCOPE:|BEHAVIORAL GUARDRAILS:|DIRECT INJECTION|INDIRECT INJECTION|OUTPUT VALIDATION:|SECURITY HEADERS:|RATE LIMITING:|SESSION ISOLATION:|ANDON CORD|SECURITY TESTING|MODEL LEGAL|IAM LEAST|SECRET MANAGEMENT:|INFRASTRUCTURE)/.test(clause)
            ? { fontWeight: 600, color: BRAND.white }
            : {}),
          ...(clause.startsWith("Current gap:") || clause.startsWith("Current state:")
            ? { color: clause.startsWith("Current gap:") ? BRAND.warn : BRAND.accent, fontSize: 12, fontStyle: "italic" }
            : {}),
        }}>
          {clause}
        </p>
      ))}

      {/* Telemetry matrix inline */}
      {section.matrix && (
        <div style={{
          background: BRAND.bgMid, border: `1px solid ${BRAND.border}`,
          borderRadius: 6, overflow: "hidden", margin: "14px 0",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "inherit" }}>
            <thead>
              <tr>
                {section.matrix.headers.map((h) => (
                  <th key={h} style={{
                    padding: "10px 12px", textAlign: "left",
                    borderBottom: `1px solid ${BRAND.border}`,
                    color: BRAND.muted, fontSize: 9, letterSpacing: "0.1em", fontWeight: 600,
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.matrix.rows.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ padding: "8px 12px", color: BRAND.light, borderBottom: `1px solid ${BRAND.border}22` }}>{row.role}</td>
                  {["queryText", "response", "userIdentity", "metadata"].map((key) => {
                    const val = row[key];
                    const isYes = val.startsWith("YES");
                    const isNo = val === "NO";
                    return (
                      <td key={key} style={{
                        padding: "8px 12px", borderBottom: `1px solid ${BRAND.border}22`,
                        color: isYes ? BRAND.accent : isNo ? BRAND.danger : BRAND.warn, fontWeight: 600,
                      }}>{val}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.postClauses?.map((clause, i) => (
        <p key={`post-${i}`} style={{
          fontSize: 13, color: BRAND.light, lineHeight: 1.65, margin: "0 0 10px",
          ...(clause.startsWith("NOTICE:") || clause.startsWith("RECOMMENDATION:")
            ? { color: BRAND.warn, fontWeight: 600 }
            : {}),
        }}>
          {clause}
        </p>
      ))}
    </div>
  );
}

export default function PolicyGenerator() {
  const sections = SECTIONS.map((fn) => fn());
  const redCount = sections.filter((s) => s.status === "red").length;
  const yellowCount = sections.filter((s) => s.status === "yellow").length;
  const greenCount = sections.filter((s) => s.status === "green").length;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "68px 24px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Generated Policy · {CLIENT.industry}
        </span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: BRAND.white }}>
        AI Transparency & Workplace Trust Policy
      </h1>
      <p style={{ fontSize: 14, color: BRAND.muted, margin: "0 0 24px" }}>
        {CLIENT.name} — {CLIENT.aiSystem} ({CLIENT.deployment})
      </p>

      {/* Compliance summary */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap",
      }}>
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 6, padding: "12px 20px", flex: 1,
          borderLeft: `3px solid ${BRAND.danger}`,
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: BRAND.danger }}>{redCount}</div>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>SECTIONS WITH GAPS</div>
        </div>
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 6, padding: "12px 20px", flex: 1,
          borderLeft: `3px solid ${BRAND.warn}`,
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: BRAND.warn }}>{yellowCount}</div>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>SECTIONS NEED REVIEW</div>
        </div>
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 6, padding: "12px 20px", flex: 1,
          borderLeft: `3px solid ${BRAND.accent}`,
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: BRAND.accent }}>{greenCount}</div>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em" }}>SECTIONS COMPLIANT</div>
        </div>
      </div>

      {/* Derivation notice */}
      <div style={{
        background: BRAND.bgMid, border: `1px solid ${BRAND.border}`,
        borderRadius: 6, padding: "12px 20px", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 14 }}>◎</span>
        <span style={{ fontSize: 12, color: BRAND.light, lineHeight: 1.5 }}>
          This policy was auto-generated from the Engaged Audit findings for {CLIENT.name}.
          Sections flagged with gaps require remediation before the policy is fully enforceable.
        </span>
      </div>

      {/* Policy Sections */}
      {sections.map((section, i) => (
        <PolicySection key={i} section={section} />
      ))}

      {/* Export */}
      <div style={{
        display: "flex", gap: 12, marginTop: 8,
      }}>
        <button style={{
          background: "transparent", border: `1px solid ${BRAND.border}`,
          borderRadius: 6, padding: "12px 24px", fontSize: 12,
          color: BRAND.muted, cursor: "pointer", fontFamily: "inherit",
          letterSpacing: "0.08em",
        }}>
          Export as PDF ↓
        </button>
        <button style={{
          background: "transparent", border: `1px solid ${BRAND.border}`,
          borderRadius: 6, padding: "12px 24px", fontSize: 12,
          color: BRAND.muted, cursor: "pointer", fontFamily: "inherit",
          letterSpacing: "0.08em",
        }}>
          Export as Markdown ↓
        </button>
      </div>
    </div>
  );
}
