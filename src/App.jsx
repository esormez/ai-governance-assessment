import { useState } from "react";
import { BRAND } from "./brand";
import NavToggle from "./components/NavToggle";
import Assessment from "./components/assessment/Assessment";
import IntakeForm from "./components/intake/IntakeForm";
import Registry from "./components/registry/Registry";
import Blueprints from "./components/blueprints/Blueprints";
import Checklist from "./components/checklist/Checklist";
import Audit from "./components/audit/Audit";
import ToolingGaps from "./components/tooling/ToolingGaps";
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
        {mode === "intake" && <IntakeForm />}
        {mode === "registry" && <Registry />}
        {mode === "blueprints" && <Blueprints />}
        {mode === "checklist" && <Checklist />}
        {mode === "audit" && <Audit />}
        {mode === "tooling" && <ToolingGaps />}
        {mode === "dashboard" && <Dashboard />}
        {mode === "policy" && <PolicyGenerator />}
      </div>
    </div>
  );
}
