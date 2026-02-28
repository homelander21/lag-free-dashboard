import type { useTelemetry } from "../hooks/useTelemetry";
import { Card } from "../components/shared/Card";
import { TelemetryChart } from "../components/charts/TelemetryChart";
import { Toggle } from "../components/shared/Toggle";

export function LiveIntelligence({ telemetryApi }: { telemetryApi: ReturnType<typeof useTelemetry> }) {
  const { telemetry, actions } = telemetryApi;
  const i = telemetry.interfaces;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Card
          title="Live Network Intelligence"
          subtitle="Last 60 seconds — ping, jitter, throughput, bufferbloat"
        >
          <TelemetryChart timeline={telemetry.timeline} modes={["ping", "jitter", "throughput", "bufferbloat"]} />
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Mini label="Ping now" value={`${telemetry.pingMs.toFixed(1)} ms`} />
            <Mini label="Jitter now" value={`${telemetry.jitterMs.toFixed(1)} ms`} />
            <Mini label="Throughput" value={`${(telemetry.timeline.at(-1)?.throughput ?? 0).toFixed(0)} Mbps`} />
            <Mini label="Bufferbloat" value={`${(telemetry.timeline.at(-1)?.bufferbloat ?? 0).toFixed(0)} / 100`} />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4">
        <Card title="Interface Monitor" subtitle="Per-interface latency + auto-switch">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <InterfaceRow
                name="Ethernet"
                ms={i.ethernet}
                active={i.active === "ethernet"}
                onSelect={() => actions.setActiveInterface("ethernet")}
                locked={!i.autoSwitch}
              />
              <InterfaceRow
                name="WiFi"
                ms={i.wifi}
                active={i.active === "wifi"}
                onSelect={() => actions.setActiveInterface("wifi")}
                locked={!i.autoSwitch}
              />
              <InterfaceRow
                name="5G"
                ms={i.fiveG}
                active={i.active === "fiveG"}
                onSelect={() => actions.setActiveInterface("fiveG")}
                locked={!i.autoSwitch}
              />
            </div>

            <Toggle
              checked={i.autoSwitch}
              onChange={actions.setAutoSwitch}
              label="Auto-switch"
              sub="Chooses the lowest-latency interface"
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">Bufferbloat score</div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-amd-gradient shadow-glowBlue transition-[width] duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - (telemetry.timeline.at(-1)?.bufferbloat ?? 0)))}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-white/70">
                Lower bufferbloat = more consistent aim + fewer “micro-stutters”.
              </div>
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

function InterfaceRow({
  name,
  ms,
  active,
  onSelect,
  locked
}: {
  name: string;
  ms: number;
  active: boolean;
  onSelect: () => void;
  locked: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
        active
          ? "border-neonBlue/25 bg-neonBlue/10 shadow-glowBlue"
          : "border-white/10 bg-white/5 hover:bg-white/10",
        locked ? "opacity-100" : "opacity-95"
      ].join(" ")}
    >
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className="mt-1 text-xs text-white/55">
          {active ? "ACTIVE" : "standby"} {locked ? "• manual" : "• auto"}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">{ms.toFixed(1)} ms</div>
        <div className="mt-1 h-2 w-20 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-amd-gradient transition-[width] duration-300"
            style={{ width: `${Math.min(100, Math.max(0, 100 - ms * 2.2))}%` }}
          />
        </div>
      </div>
    </button>
  );
}

