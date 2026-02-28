import { useMemo, useState } from "react";
import type { useTelemetry } from "../hooks/useTelemetry";
import { Card } from "../components/shared/Card";
import { Toggle } from "../components/shared/Toggle";

type Aggressiveness = "Low" | "Competitive" | "Esports";

export function AdvancedSettings({ telemetryApi }: { telemetryApi: ReturnType<typeof useTelemetry> }) {
  const { telemetry } = telemetryApi;

  const [kernelEbpf, setKernelEbpf] = useState(true);
  const [udpRules, setUdpRules] = useState(true);
  const [multipathDup, setMultipathDup] = useState(false);
  const [aggr, setAggr] = useState<Aggressiveness>("Competitive");

  const profileHint = useMemo(() => {
    if (!kernelEbpf) return "User-mode shaping only (safe fallback).";
    if (aggr === "Esports") return "Max UDP priority, strict queue depth, aggressive background caps.";
    if (aggr === "Competitive") return "Balanced shaping with spike prediction + SQM tuned.";
    return "Gentle shaping for stability; minimal interference with downloads.";
  }, [kernelEbpf, aggr]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Card title="Advanced Settings" subtitle="Kernel hooks, UDP rules, multipath duplication, aggressiveness">
          <div className="space-y-3">
            <Toggle
              checked={kernelEbpf}
              onChange={setKernelEbpf}
              label="Kernel eBPF toggle"
              sub="Load/unload programs for scheduling + queue visibility"
            />
            <Toggle
              checked={udpRules}
              onChange={setUdpRules}
              label="UDP prioritization rules"
              sub="Prefer game/voice packets under contention"
            />
            <Toggle
              checked={multipathDup}
              onChange={setMultipathDup}
              label="Multipath duplicate packet mode"
              sub="Duplicate select UDP packets for resilience (higher bandwidth)"
            />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">Aggressiveness</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["Low", "Competitive", "Esports"] as Aggressiveness[]).map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => setAggr(x)}
                    className={[
                      "rounded-2xl border px-3 py-2 text-sm font-semibold transition active:scale-[0.99]",
                      aggr === x
                        ? "border-neonBlue/25 bg-neonBlue/10 shadow-glowBlue"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    ].join(" ")}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-sm text-white/70">{profileHint}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">Current runtime</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <KV k="Active interface" v={telemetry.interfaces.active === "fiveG" ? "5G" : telemetry.interfaces.active.toUpperCase()} />
                <KV k="Auto-switch" v={telemetry.interfaces.autoSwitch ? "Enabled" : "Manual"} />
                <KV k="SQM" v={telemetry.sqm ? "Enabled" : "Disabled"} />
                <KV k="AI Predictive" v={telemetry.aiPredictive ? "Active" : "Off"} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card title="Safety + Security" subtitle="Local-only, safe fallback posture">
          <div className="space-y-3 text-sm text-white/75">
            <Bullet title="Local-only processing">
              No external telemetry uploads; all analysis stays on-device.
            </Bullet>
            <Bullet title="Signed driver model">
              Kernel components are designed to be signed; user-mode fallback remains available.
            </Bullet>
            <Bullet title="Safe kernel fallback">
              If kernel hooks fail to load, LagZero reverts to user-mode QoS rules.
            </Bullet>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">Next backend hook</div>
            <div className="mt-2 text-sm text-white/70">
              Bind these toggles to your backend’s REST settings endpoint; mirror state via gRPC telemetry streams.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">{k}</div>
      <div className="mt-1 text-sm font-semibold">{v}</div>
    </div>
  );
}

function Bullet({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/65">{children}</div>
    </div>
  );
}

