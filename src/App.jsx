import { useState } from "react";
import { BRAND } from "./brand";
import NavToggle from "./components/NavToggle";
import Assessment from "./components/assessment/Assessment";
import Audit from "./components/audit/Audit";
import Dashboard from "./components/dashboard/Dashboard";
import PolicyGenerator from "./components/placeholder/PolicyGenerator";

const shell = {
  minHeight: "100vh",
  background: BRAND.bg,
  fontFamily: "'DM Mono', 'Courier New', monospace",
  color: BRAND.white,
  position: "relative",
  overflow: "hidden",
};

export default function App() {
  const [mode, setMode] = useState("assessment");

  return (
    <div style={shell}>
      <NavToggle activeMode={mode} onModeChange={setMode} />
      <div style={{ paddingTop: 52 }}>
        {mode === "assessment" && <Assessment />}
        {mode === "audit" && <Audit />}
        {mode === "dashboard" && <Dashboard />}
        {mode === "policy" && <PolicyGenerator />}
      </div>
    </div>
  );
}
