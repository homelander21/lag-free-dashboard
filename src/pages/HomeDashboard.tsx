import type { useTelemetry } from "../hooks/useTelemetry";
import { Card } from "../components/shared/Card";
import { LatencyMeter } from "../components/home/LatencyMeter";
import { Toggle } from "../components/shared/Toggle";

export function HomeDashboard({ telemetryApi }: { telemetryApi: ReturnType<typeof useTelemetry> }) {
  const { telemetry, actions } = telemetryApi;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Card
          title="Home Dashboard"
          subtitle="Instant latency grade + one-click stabilization"
          right={
            <button
              type="button"
              onClick={actions.oneClickBoost}
              className={[
                "relative overflow-hidden rounded-2xl px-5 py-3 font-semibold",
                "bg-amd-gradient shadow-glowBlue transition active:scale-[0.99]",
                "hover:shadow-[0_0_0_1px_rgba(43,217,255,0.18),0_0_38px_rgba(255,46,98,0.14)]"
              ].join(" ")}
            >
              <span className="relative z-10">One Click Boost</span>
              <span className="absolute inset-0 opacity-40 animate-shimmer bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            </button>
          }
        >
          <div className="grid grid-cols-1 items-center gap-5 xl:grid-cols-2">
            <div className="grid place-items-center">
              <LatencyMeter
                pingMs={telemetry.pingMs}
                jitterMs={telemetry.jitterMs}
                lossPct={telemetry.lossPct}
                grade={telemetry.grade}
              />
            </div>

            <div className="space-y-3">
              <Toggle
                checked={telemetry.antiLag2}
                onChange={() => actions.toggle("antiLag2")}
                label="Anti-Lag 2"
                sub="Cuts input-to-network latency path"
              />
              <Toggle
                checked={telemetry.aiPredictive}
                onChange={() => actions.toggle("aiPredictive")}
                label="AI Predictive Mode"
                sub="Pre-emptively shapes before spikes"
              />
              <Toggle
                checked={telemetry.multipath}
                onChange={() => actions.toggle("multipath")}
                label="Multi-path"
                sub="Failover + optional duplication"
              />
              <Toggle
                checked={telemetry.sqm}
                onChange={() => actions.toggle("sqm")}
                label="Smart Queue Management (SQM)"
                sub="Bufferbloat reduction for consistent aim"
              />

              <div className="glass rounded-2xl p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Live status</div>
                <div className="mt-2 text-sm text-white/70">
                  {telemetry.optimizing
                    ? "Network Optimization Running… shaping queues + prioritizing UDP."
                    : "Stable profile engaged. Real-time telemetry updating every second."}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Mini label="Bufferbloat" value={`${telemetry.timeline[telemetry.timeline.length - 1]?.bufferbloat.toFixed(0) ?? "--"}`} />
                  <Mini label="Throughput" value={`${telemetry.timeline[telemetry.timeline.length - 1]?.throughput.toFixed(0) ?? "--"} Mbps`} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card title="Optimization Log" subtitle="Micro-interactions + system-level actions (simulated)">
          <div className="space-y-2">
            <LogRow k="Kernel hooks" v={telemetry.sqm ? "SQM attached" : "Bypassed"} ok={telemetry.sqm} />
            <LogRow k="UDP rules" v={telemetry.antiLag2 ? "Prioritized (games)" : "Default"} ok={telemetry.antiLag2} />
            <LogRow k="AI engine" v={telemetry.aiPredictive ? "Predicting spikes" : "Idle"} ok={telemetry.aiPredictive} />
            <LogRow k="Multi-path" v={telemetry.multipath ? "Active + monitored" : "Single path"} ok={telemetry.multipath} />
            <LogRow
              k="Interface"
              v={`${telemetry.interfaces.active === "fiveG" ? "5G" : telemetry.interfaces.active.toUpperCase()} selected`}
              ok
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">Pro tip</div>
            <div className="mt-2 text-sm text-white/70">
              For esports profiles, enable <span className="text-white">SQM</span> + <span className="text-white">AI Predictive Mode</span> and cap non-game background apps in the Traffic Shaper.
            </div>
          </div>
        </Card>
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

function LogRow({ k, v, ok }: { k: string; v: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-sm text-white/75">{k}</div>
      <div className={["text-xs font-semibold", ok ? "text-ok" : "text-white/55"].join(" ")}>{v}</div>
    </div>
  );
}

