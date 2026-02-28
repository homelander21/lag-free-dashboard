import { Navigate, Route, Routes } from "react-router-dom";
import { useTelemetry } from "./hooks/useTelemetry";
import { LayoutShell } from "./components/layout/LayoutShell";
import { HomeDashboard } from "./pages/HomeDashboard";
import { LiveIntelligence } from "./pages/LiveIntelligence";
import { TrafficShaper } from "./pages/TrafficShaper";
import { AmdSynergy } from "./pages/AmdSynergy";
import { AdvancedSettings } from "./pages/AdvancedSettings";

export default function App() {
  const telemetryApi = useTelemetry();

  return (
    <div className="min-h-screen bg-bg0 text-white selection:bg-neonBlue/30">
      <div className="pointer-events-none fixed inset-0 bg-neon-radial" />
      <LayoutShell telemetryApi={telemetryApi}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeDashboard telemetryApi={telemetryApi} />} />
          <Route path="/live" element={<LiveIntelligence telemetryApi={telemetryApi} />} />
          <Route path="/shaper" element={<TrafficShaper telemetryApi={telemetryApi} />} />
          <Route path="/amd" element={<AmdSynergy telemetryApi={telemetryApi} />} />
          <Route path="/settings" element={<AdvancedSettings telemetryApi={telemetryApi} />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </LayoutShell>
    </div>
  );
}

