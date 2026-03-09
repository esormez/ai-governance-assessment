import { useState } from "react";
import { BRAND } from "../../brand";
import { CLIENT, LAYERS, TELEMETRY_MATRIX } from "./syntheticData";

const severityColor = (s) => s === "red" ? BRAND.danger : s === "yellow" ? BRAND.warn : BRAND.accent;
const severityLabel = (s) => s === "red" ? "CRITICAL" : s === "yellow" ? "WARNING" : "PASSING";

function countBySeverity(layers) {
  let red = 0, yellow = 0, green = 0;
  layers.forEach((l) => l.findings.forEach((f) => {
    if (f.severity === "red") red++;
    else if (f.severity === "yellow") yellow++;
    else green++;
  }));
  return { red, yellow, green };
}

function layerStatus(layer) {
  const hasRed = layer.findings.some((f) => f.severity === "red");
  const hasYellow = layer.findings.some((f) => f.severity === "yellow");
  if (hasRed) return "red";
  if (hasYellow) return "yellow";
  return "green";
}

export default function Audit() {
  const [activeLayer, setActiveLayer] = useState(0);
  const counts = countBySeverity(LAYERS);
  const layer = LAYERS[activeLayer];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "68px 24px 60px" }}>
      {/* Client Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Engaged Audit · {CLIENT.industry}
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 4px", color: BRAND.white }}>{CLIENT.name}</h1>
        <p style={{ fontSize: 13, color: BRAND.muted, margin: 0 }}>
          {CLIENT.aiSystem} — {CLIENT.deployment}
        </p>
      </div>

      {/* Summary Counts */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Critical Findings", count: counts.red, color: BRAND.danger },
          { label: "Warnings", count: counts.yellow, color: BRAND.warn },
          { label: "Passing", count: counts.green, color: BRAND.accent },
        ].map((item) => (
          <div key={item.label} style={{
            background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
            borderRadius: 8, padding: "16px 24px", flex: 1,
            borderLeft: `3px solid ${item.color}`,
          }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.count}</div>
            <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.1em", marginTop: 6 }}>{item.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 8, paddingLeft: 12 }}>
            ARCHITECTURE LAYERS
          </div>
          {LAYERS.map((l, i) => {
            const status = layerStatus(l);
            const isActive = i === activeLayer;
            return (
              <button key={l.id} onClick={() => setActiveLayer(i)} style={{
                background: isActive ? BRAND.bgCard : "transparent",
                border: `1px solid ${isActive ? BRAND.border : "transparent"}`,
                borderRadius: 6, padding: "12px 12px",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "all 0.15s",
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: severityColor(status), flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 12, color: isActive ? BRAND.white : BRAND.light, fontWeight: isActive ? 600 : 400 }}>
                    {l.label}
                  </div>
                  <div style={{ fontSize: 10, color: BRAND.muted }}>{l.subtitle}</div>
                </div>
              </button>
            );
          })}

          {/* Export Button */}
          <button style={{
            marginTop: 16, background: "transparent",
            border: `1px solid ${BRAND.border}`, borderRadius: 6,
            padding: "10px 16px", fontSize: 11, color: BRAND.muted,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.08em",
          }}>
            Generate Audit Report ↓
          </button>
        </div>

        {/* Main Content */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18, color: BRAND.accent }}>{layer.icon}</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: BRAND.white }}>
                Layer {activeLayer + 1}: {layer.label}
              </h2>
            </div>
            <p style={{ fontSize: 13, color: BRAND.muted, margin: 0, lineHeight: 1.5 }}>{layer.summary}</p>
          </div>

          {/* Findings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {layer.findings.map((f, fi) => (
              <div key={fi} style={{
                background: BRAND.bgCard,
                border: `1px solid ${BRAND.border}`,
                borderLeft: `3px solid ${severityColor(f.severity)}`,
                borderRadius: 8, padding: "20px 24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.white }}>{f.control}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                    color: severityColor(f.severity),
                    background: severityColor(f.severity) + "18",
                    padding: "3px 10px", borderRadius: 4,
                  }}>
                    {severityLabel(f.severity)}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em", marginBottom: 4 }}>EXPECTED</div>
                    <div style={{ fontSize: 12, color: BRAND.light, lineHeight: 1.5 }}>{f.expected}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em", marginBottom: 4 }}>ACTUAL</div>
                    <div style={{ fontSize: 12, color: severityColor(f.severity), lineHeight: 1.5 }}>{f.actual}</div>
                  </div>
                </div>
                <div style={{
                  background: BRAND.bgMid, borderRadius: 6, padding: "12px 16px",
                  borderLeft: `2px solid ${BRAND.accent}44`,
                }}>
                  <div style={{ fontSize: 10, color: BRAND.accent, letterSpacing: "0.1em", marginBottom: 4 }}>REMEDIATION</div>
                  <div style={{ fontSize: 12, color: BRAND.light, lineHeight: 1.55 }}>{f.remediation}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Telemetry Matrix - show on last layer */}
          {activeLayer === LAYERS.length - 1 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.15em", marginBottom: 12 }}>
                TELEMETRY ACCESS CONTROL MATRIX
              </div>
              <div style={{
                background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
                borderRadius: 8, overflow: "hidden",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "inherit" }}>
                  <thead>
                    <tr>
                      {TELEMETRY_MATRIX.headers.map((h) => (
                        <th key={h} style={{
                          padding: "12px 16px", textAlign: "left",
                          borderBottom: `1px solid ${BRAND.border}`,
                          color: BRAND.muted, fontSize: 10, letterSpacing: "0.1em",
                          fontWeight: 600,
                        }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TELEMETRY_MATRIX.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td style={{ padding: "10px 16px", color: BRAND.light, borderBottom: `1px solid ${BRAND.border}22` }}>{row.role}</td>
                        {["queryText", "response", "userIdentity", "metadata"].map((key) => {
                          const val = row[key];
                          const isYes = val === "YES" || val === "YES*" || val === "YES**";
                          const isNo = val === "NO";
                          return (
                            <td key={key} style={{
                              padding: "10px 16px",
                              borderBottom: `1px solid ${BRAND.border}22`,
                              color: isYes ? BRAND.accent : isNo ? BRAND.danger : BRAND.warn,
                              fontWeight: 600,
                            }}>{val}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${BRAND.border}` }}>
                  {TELEMETRY_MATRIX.footnotes.map((fn, i) => (
                    <div key={i} style={{
                      fontSize: 10, color: i === 2 ? BRAND.warn : BRAND.muted,
                      fontWeight: i === 2 ? 600 : 400, marginBottom: 2,
                    }}>{fn}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
