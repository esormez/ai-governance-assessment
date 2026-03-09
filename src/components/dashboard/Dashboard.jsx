import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { BRAND } from "../../brand";

// --- Synthetic Data Generators ---

function generateDailyData() {
  const data = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const total = Math.floor(180 + Math.random() * 80 + (14 - i) * 3);
    const flagged = Math.floor(total * (0.02 + Math.random() * 0.02));
    data.push({ date: label, total, flagged });
  }
  return data;
}

function generateConfidenceData() {
  const data = [];
  const now = new Date();
  let score = 0.91;
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    score = Math.max(0.78, Math.min(0.93, score - 0.003 - Math.random() * 0.008 + Math.random() * 0.004));
    data.push({ date: label, confidence: parseFloat(score.toFixed(3)) });
  }
  return data;
}

const EVENT_TEMPLATES = [
  { type: "GUARDRAIL", color: BRAND.danger, msg: "Prompt injection attempt blocked", detail: "User: anonymized" },
  { type: "REVIEW", color: BRAND.warn, msg: "Low confidence response queued for human review", detail: "Score: 0.{s}" },
  { type: "AUTH", color: BRAND.danger, msg: "Access attempt blocked — document outside user scope", detail: "Scope: restricted" },
  { type: "INFO", color: BRAND.accent, msg: "Metric definition updated — \"Gross Margin\" v2.1 certified", detail: "Owner: analytics-team" },
  { type: "REVIEW", color: BRAND.warn, msg: "Financial query flagged for human review", detail: "Category: regulatory" },
  { type: "GUARDRAIL", color: BRAND.danger, msg: "System prompt extraction attempt blocked", detail: "User: anonymized" },
  { type: "INFO", color: BRAND.accent, msg: "Retrieval scope policy updated for compliance team", detail: "Policy: v3.2" },
  { type: "AUTH", color: BRAND.danger, msg: "Unauthorized schema access attempt — FINANCE.RESTRICTED", detail: "Role: ANALYST_ROLE" },
  { type: "REVIEW", color: BRAND.warn, msg: "Compliance query routed to human review", detail: "Score: 0.{s}" },
  { type: "INFO", color: BRAND.accent, msg: "Confidence score calibration completed", detail: "Delta: +0.02" },
];

const INITIAL_REVIEW_QUEUE = [
  { id: "HRQ-041", type: "Financial query", score: 0.61, submitted: "Today 14:28", status: "Pending" },
  { id: "HRQ-040", type: "Compliance query", score: 0.58, submitted: "Today 13:44", status: "In Review" },
  { id: "HRQ-039", type: "Policy question", score: 0.71, submitted: "Today 11:02", status: "Resolved" },
  { id: "HRQ-038", type: "Executive report", score: 0.63, submitted: "Yesterday", status: "Resolved" },
];

function KPITile({ label, value, suffix, note, noteColor }) {
  return (
    <div style={{
      background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
      borderRadius: 8, padding: "18px 20px", flex: "1 1 0",
      minWidth: 150,
    }}>
      <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: "0.12em", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.white, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 400, color: BRAND.muted }}>{suffix}</span>
      </div>
      {note && (
        <div style={{ fontSize: 10, color: noteColor || BRAND.muted, marginTop: 6 }}>{note}</div>
      )}
    </div>
  );
}

const tooltipStyle = {
  background: BRAND.bgCard,
  border: `1px solid ${BRAND.border}`,
  borderRadius: 6,
  fontSize: 11,
  fontFamily: "'DM Mono', monospace",
};

export default function Dashboard() {
  const [queryData] = useState(generateDailyData);
  const [confidenceData] = useState(generateConfidenceData);
  const [queriesToday, setQueriesToday] = useState(247);
  const [avgConfidence, setAvgConfidence] = useState(0.84);
  const [guardrailTriggers, setGuardrailTriggers] = useState(47);
  const [reviewQueue] = useState(12);
  const [authViolations] = useState(3);
  const [hallucinationRate] = useState(1.2);
  const [events, setEvents] = useState([]);
  const eventIdRef = useRef(0);

  // Simulate KPI drift
  useEffect(() => {
    const interval = setInterval(() => {
      setQueriesToday((prev) => prev + Math.floor(Math.random() * 3) + 1);
      setAvgConfidence((prev) => {
        const drift = (Math.random() - 0.52) * 0.005;
        return parseFloat(Math.max(0.79, Math.min(0.88, prev + drift)).toFixed(2));
      });
      if (Math.random() > 0.7) {
        setGuardrailTriggers((prev) => prev + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live events
  useEffect(() => {
    const addEvent = () => {
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const detail = template.detail.replace("{s}", String(Math.floor(Math.random() * 30) + 55));
      eventIdRef.current += 1;
      setEvents((prev) => [
        { id: eventIdRef.current, type: template.type, color: template.color, msg: template.msg, detail, time },
        ...prev.slice(0, 19),
      ]);
    };

    // Seed a few events immediately
    for (let i = 0; i < 4; i++) {
      const template = EVENT_TEMPLATES[i];
      const now = new Date();
      now.setSeconds(now.getSeconds() - (4 - i) * 30);
      const time = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      eventIdRef.current += 1;
      setEvents((prev) => [
        ...prev,
        { id: eventIdRef.current, type: template.type, color: template.color, msg: template.msg, detail: template.detail.replace("{s}", "61"), time },
      ]);
    }

    const interval = setInterval(addEvent, 8000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "68px 24px 60px" }}>
      {/* Telemetry Policy Banner */}
      <div style={{
        background: BRAND.bgMid, border: `1px solid ${BRAND.border}`,
        borderRadius: 6, padding: "10px 20px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
          color: BRAND.warn, background: BRAND.warn + "18",
          padding: "3px 8px", borderRadius: 3,
        }}>TELEMETRY POLICY</span>
        <span style={{ fontSize: 12, color: BRAND.light }}>
          Query content is not visible at this access level.
        </span>
        <span style={{ fontSize: 11, color: BRAND.muted, marginLeft: "auto" }}>
          Viewing: metadata and aggregate signals only. Role: <span style={{ color: BRAND.accent }}>System Analyst</span>
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, color: BRAND.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Monitoring Dashboard · Live
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0", color: BRAND.white }}>Governance Telemetry</h1>
      </div>

      {/* KPI Tiles */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <KPITile label="QUERIES TODAY" value={queriesToday} note="Live — updates every 5s" />
        <KPITile label="AVG CONFIDENCE" value={avgConfidence} note="Slight drift detected" noteColor={BRAND.warn} />
        <KPITile label="GUARDRAIL TRIGGERS" value={guardrailTriggers} suffix=" /wk" note="This week" />
        <KPITile label="HUMAN REVIEW QUEUE" value={reviewQueue} suffix=" pending" />
        <KPITile label="AUTH VIOLATIONS" value={authViolations} suffix=" /wk" note="This week" noteColor={BRAND.danger} />
        <KPITile label="HALLUCINATION FLAGS" value={hallucinationRate} suffix="%" note="Amber threshold" noteColor={BRAND.warn} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Query Volume */}
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 10, padding: "20px 20px 12px",
        }}>
          <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.12em", marginBottom: 16 }}>QUERY VOLUME — 14 DAYS</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={queryData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid stroke={BRAND.border} strokeOpacity={0.3} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: BRAND.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: BRAND.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: BRAND.light }} />
              <Line type="monotone" dataKey="total" stroke={BRAND.accent} strokeWidth={2} dot={false} name="Total Queries" />
              <Line type="monotone" dataKey="flagged" stroke={BRAND.warn} strokeWidth={2} dot={false} name="Flagged" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Trend */}
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 10, padding: "20px 20px 12px",
        }}>
          <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.12em", marginBottom: 16 }}>CONFIDENCE SCORE TREND — 14 DAYS</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={confidenceData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid stroke={BRAND.border} strokeOpacity={0.3} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: BRAND.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0.75, 0.95]} tick={{ fill: BRAND.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: BRAND.light }} />
              <Area type="monotone" dataKey="confidence" stroke={BRAND.warn} fill={BRAND.warn} fillOpacity={0.1} strokeWidth={2} name="Confidence" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Events + Review Queue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Live Event Feed */}
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 10, padding: 20, maxHeight: 360, display: "flex", flexDirection: "column",
        }}>
          <div style={{
            fontSize: 11, color: BRAND.muted, letterSpacing: "0.12em", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: BRAND.accent,
              animation: "pulse 2s infinite",
            }} />
            LIVE EVENT FEED
          </div>
          <div style={{ overflow: "auto", flex: 1 }}>
            {events.map((e) => (
              <div key={e.id} style={{
                padding: "8px 0", borderBottom: `1px solid ${BRAND.border}22`,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
                  color: e.color, background: e.color + "18",
                  padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap", marginTop: 2,
                }}>{e.type}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: BRAND.light, lineHeight: 1.4 }}>{e.msg}</div>
                  <div style={{ fontSize: 10, color: BRAND.muted }}>{e.detail}</div>
                </div>
                <span style={{ fontSize: 10, color: BRAND.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{e.time}</span>
              </div>
            ))}
            {events.length === 0 && (
              <div style={{ fontSize: 12, color: BRAND.muted, padding: "20px 0", textAlign: "center" }}>
                Waiting for events...
              </div>
            )}
          </div>
        </div>

        {/* Human Review Queue */}
        <div style={{
          background: BRAND.bgCard, border: `1px solid ${BRAND.border}`,
          borderRadius: 10, padding: 20,
        }}>
          <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: "0.12em", marginBottom: 12 }}>
            HUMAN REVIEW QUEUE
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "inherit" }}>
            <thead>
              <tr>
                {["ID", "Type", "Score", "Submitted", "Status"].map((h) => (
                  <th key={h} style={{
                    padding: "8px 10px", textAlign: "left",
                    borderBottom: `1px solid ${BRAND.border}`,
                    color: BRAND.muted, fontSize: 9, letterSpacing: "0.1em", fontWeight: 600,
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INITIAL_REVIEW_QUEUE.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "10px 10px", color: BRAND.light, borderBottom: `1px solid ${BRAND.border}22`, fontWeight: 600 }}>{item.id}</td>
                  <td style={{ padding: "10px 10px", color: BRAND.light, borderBottom: `1px solid ${BRAND.border}22` }}>{item.type}</td>
                  <td style={{
                    padding: "10px 10px", borderBottom: `1px solid ${BRAND.border}22`,
                    color: item.score < 0.65 ? BRAND.danger : BRAND.warn, fontWeight: 600,
                  }}>{item.score.toFixed(2)}</td>
                  <td style={{ padding: "10px 10px", color: BRAND.muted, borderBottom: `1px solid ${BRAND.border}22` }}>{item.submitted}</td>
                  <td style={{ padding: "10px 10px", borderBottom: `1px solid ${BRAND.border}22` }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
                      padding: "2px 8px", borderRadius: 3,
                      color: item.status === "Pending" ? BRAND.warn : item.status === "In Review" ? BRAND.accent : BRAND.muted,
                      background: (item.status === "Pending" ? BRAND.warn : item.status === "In Review" ? BRAND.accent : BRAND.muted) + "18",
                    }}>{item.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
