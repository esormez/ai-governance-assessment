import { BRAND } from "../brand";

const MODES = [
  { id: "assessment", label: "Pre-Sales Assessment" },
  { id: "intake", label: "Use Case Intake" },
  { id: "registry", label: "AI Registry" },
  { id: "audit", label: "Engaged Audit" },
  { id: "dashboard", label: "Monitoring Dashboard" },
  { id: "policy", label: "Policy Generator" },
];

export default function NavToggle({ activeMode, onModeChange }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: `${BRAND.bg}ee`,
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${BRAND.border}`,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center", gap: 0,
        height: 52,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginRight: 32, flexShrink: 0,
        }}>
          <img src="/favicon.png" alt="Intralytics" style={{ width: 22, height: 22 }} />
          <span style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
            color: BRAND.accent, textTransform: "uppercase",
          }}>
            Intralytics
          </span>
        </div>
        <div style={{
          display: "flex", gap: 2, overflow: "auto",
          msOverflowStyle: "none", scrollbarWidth: "none",
        }}>
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                style={{
                  background: isActive ? BRAND.bgCard : "transparent",
                  border: "none",
                  borderBottom: `2px solid ${isActive ? BRAND.accent : "transparent"}`,
                  padding: "16px 16px 14px",
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.06em",
                  color: isActive ? BRAND.accent : BRAND.muted,
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
