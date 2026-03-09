import { useState } from "react";
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
  const injectionFinding = modelLayer.findings.find((f) => f.control === "Prompt Injection Defenses");

  return {
    title: "5. Agentic Authorization Boundaries",
    status: "red",
    clauses: [
      `The ${CLIENT.aiSystem} operates within the following authorization boundaries:`,
      `DATA ACCESS: The AI service role (AI_SERVICE_ROLE) ${roleFinding?.severity === "green" ? "is scoped to authorized schemas only" : `currently ${roleFinding?.actual.toLowerCase()}. This must be restricted to minimum required schemas.`}`,
      `IDENTITY: ${identityFinding?.severity === "green" ? "End-user identity is propagated on every query." : `${identityFinding?.actual}. The system must propagate the requesting user's identity to enforce per-user access policies.`}`,
      `RETRIEVAL SCOPE: ${scopeFinding?.severity === "green" ? "Document retrieval is scoped to user access level." : `${scopeFinding?.actual}. Documents must be access-tagged and retrieval must be filtered by user role.`}`,
      `BEHAVIORAL GUARDRAILS: ${guardrailFinding?.actual}. The system prompt must include explicit scope limitations, refusal patterns for out-of-scope queries, and output formatting constraints.`,
      `INJECTION DEFENSE: ${injectionFinding?.actual}. Input sanitization and prompt injection detection must be active before production deployment.`,
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

const SECTIONS = [
  deriveLoggingPolicy,
  deriveAccessPolicy,
  deriveEmployeeRights,
  deriveVendorTerms,
  deriveAgenticBoundaries,
  deriveIncidentResponse,
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
          ...(clause.startsWith("RIGHT TO") || clause.startsWith("P1") || clause.startsWith("P2") || clause.startsWith("P3") || clause.startsWith("BREAK-GLASS") || clause.startsWith("RECOMMENDATION") || clause.startsWith("NOTICE") || clause.startsWith("The AI system MUST NOT")
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
