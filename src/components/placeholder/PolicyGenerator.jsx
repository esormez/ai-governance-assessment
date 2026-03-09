import { BRAND } from "../../brand";

export default function PolicyGenerator() {
  return (
    <div style={{
      maxWidth: 760, margin: "0 auto", padding: "68px 24px 60px",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "calc(100vh - 52px)",
      textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, marginBottom: 24,
      }}>
        ◈
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
        color: BRAND.accent, background: BRAND.accent + "18",
        padding: "4px 12px", borderRadius: 4, marginBottom: 20,
      }}>COMING SOON</span>
      <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px", color: BRAND.white }}>
        Workplace Trust<br />Policy Generator
      </h2>
      <p style={{ fontSize: 14, color: BRAND.muted, lineHeight: 1.7, maxWidth: 480, margin: "0 0 32px" }}>
        Input your organization name, industry, AI provider tier, and employee population —
        generate a complete AI Transparency & Workplace Trust Policy covering logging,
        access controls, employee rights, vendor terms, and incident response.
      </p>
      <div style={{
        background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
        borderRadius: 10, padding: "24px 28px", maxWidth: 400, width: "100%",
        textAlign: "left",
      }}>
        <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.12em", marginBottom: 14 }}>POLICY SECTIONS</div>
        {[
          "What is logged and why",
          "Who can access logs — and under what conditions",
          "Employee rights (view own query history)",
          "Vendor data rights (Azure OpenAI terms)",
          "Agentic authorization boundaries",
          "Incident investigation process",
        ].map((item, i) => (
          <div key={i} style={{
            padding: "8px 0", borderBottom: i < 5 ? `1px solid ${BRAND.border}22` : "none",
            fontSize: 12, color: BRAND.light, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: BRAND.border, fontSize: 10 }}>○</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
