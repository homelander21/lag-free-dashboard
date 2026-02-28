import type { useTelemetry } from "../hooks/useTelemetry";
import { Card } from "../components/shared/Card";
import { Toggle } from "../components/shared/Toggle";
import { TelemetryChart } from "../components/charts/TelemetryChart";

export function AmdSynergy({ telemetryApi }: { telemetryApi: ReturnType<typeof useTelemetry> }) {
  const { telemetry, actions } = telemetryApi;

  const coreData = telemetry.cpuCoresMhz.map((mhz, idx) => ({
    core: `C${idx + 1}`,
    mhz
  }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Card title="AMD Synergy Panel" subtitle="Toggles + hardware-aware telemetry (simulated)">
          <div className="space-y-3">
            <Toggle
              checked={telemetry.antiLag2}
              onChange={() => actions.toggle("antiLag2")}
              label="Radeon Anti-Lag 2"
              sub="Prioritize interactive network frames"
            />
            <Toggle
              checked={telemetry.aiPredictive}
              onChange={() => actions.toggle("aiPredictive")}
              label="Ryzen AI Predictive Engine"
              sub="Predicts congestion + shapes proactively"
            />

            <div className="grid grid-cols-1 gap-3">
              <Meter label="NPU Utilization" value={telemetry.npuUtilPct} suffix="%" tone="blue" />
              <Meter label="GPU Clock" value={telemetry.gpuClockMhz} suffix=" MHz" tone="red" />
              <Meter label="CPU Thermals" value={telemetry.cpuTempC} suffix=" °C" tone="warn" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">Per-core clock (snapshot)</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {coreData.map((c) => (
                  <div key={c.core} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-xs font-semibold text-white/75">{c.core}</div>
                    <div className="text-xs font-semibold text-white/85">{c.mhz} MHz</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-7">
        <Card title="Thermal + Performance Trend" subtitle="Co-visualize network + system responsiveness">
          <TelemetryChart timeline={telemetry.timeline} modes={["ping", "jitter"]} />
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Mini label="NPU" value={`${telemetry.npuUtilPct.toFixed(1)}%`} />
            <Mini label="GPU clock" value={`${telemetry.gpuClockMhz} MHz`} />
            <Mini label="CPU temp" value={`${telemetry.cpuTempC.toFixed(1)} °C`} />
          </div>
        </Card>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Anti-Lag 2 Path" subtitle="Input → render → network pacing">
            <div className="space-y-2">
              <PathRow k="Frame pacing" v={telemetry.antiLag2 ? "Tight" : "Default"} ok={telemetry.antiLag2} />
              <PathRow k="Packet scheduling" v={telemetry.antiLag2 ? "UDP prioritized" : "Balanced"} ok={telemetry.antiLag2} />
              <PathRow k="Queue depth" v={telemetry.sqm ? "Shallow" : "Unmanaged"} ok={telemetry.sqm} />
            </div>
          </Card>

          <Card title="Ryzen AI Decisions" subtitle="Predict spike probability + act pre-emptively">
            <div className="space-y-2">
              <PathRow k="Spike probability" v={telemetry.aiPredictive ? "Low" : "Medium"} ok={telemetry.aiPredictive} />
              <PathRow k="Proactive shaping" v={telemetry.aiPredictive ? "Enabled" : "Disabled"} ok={telemetry.aiPredictive} />
              <PathRow k="Model runtime" v={telemetry.aiPredictive ? "ONNX (local)" : "Idle"} ok={telemetry.aiPredictive} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Meter({
  label,
  value,
  suffix,
  tone
}: {
  label: string;
  value: number;
  suffix: string;
  tone: "blue" | "red" | "warn";
}) {
  const pct = tone === "red" ? Math.min(100, (value / 3500) * 100) : tone === "warn" ? Math.min(100, (value / 95) * 100) : Math.min(100, value);
  const bar = tone === "red" ? "bg-bad/25" : tone === "warn" ? "bg-warn/25" : "bg-neonBlue/20";
  const fill = tone === "red" ? "bg-amd-gradient shadow-glowRed" : tone === "warn" ? "bg-warn shadow-[0_0_24px_rgba(255,193,74,0.14)]" : "bg-neonBlue shadow-glowBlue";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-sm font-semibold text-white/85">
          {value.toFixed(1)}
          {suffix}
        </div>
      </div>
      <div className={["mt-3 h-3 overflow-hidden rounded-full", bar].join(" ")}>
        <div className={["h-3 rounded-full transition-[width] duration-300", fill].join(" ")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PathRow({ k, v, ok }: { k: string; v: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-sm text-white/75">{k}</div>
      <div className={["text-xs font-semibold", ok ? "text-ok" : "text-white/55"].join(" ")}>{v}</div>
    </div>
  );
}

