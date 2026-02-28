import type { useTelemetry } from "../hooks/useTelemetry";
import { Card } from "../components/shared/Card";
import { Slider } from "../components/shared/Slider";
import { Toggle } from "../components/shared/Toggle";

export function TrafficShaper({ telemetryApi }: { telemetryApi: ReturnType<typeof useTelemetry> }) {
  const { apps, actions } = telemetryApi;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Card title="Traffic Shaper Console" subtitle="Per-application bandwidth, priority, kill switch (simulated)">
          <div className="space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AppIcon kind={app.icon} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{app.name}</div>
                      <div className="mt-1 text-xs text-white/55">
                        Real-time usage: <span className="text-white/85">{app.usageMbps.toFixed(1)} Mbps</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => actions.updateApp(app.id, { kill: !app.kill })}
                      className={[
                        "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                        app.kill
                          ? "bg-bad/20 text-white shadow-glowRed border border-bad/25"
                          : "bg-white/5 text-white/85 hover:bg-white/10 border border-white/10"
                      ].join(" ")}
                    >
                      {app.kill ? "Killed" : "Kill"}
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.updateApp(app.id, { priority: !app.priority })}
                      className={[
                        "rounded-2xl px-4 py-2 text-sm font-semibold transition border",
                        app.priority
                          ? "border-ok/25 bg-ok/10 text-white shadow-[0_0_0_1px_rgba(48,242,162,0.12),0_0_24px_rgba(48,242,162,0.10)]"
                          : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                      ].join(" ")}
                    >
                      {app.priority ? "Priority" : "Normal"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Slider
                      label="Bandwidth cap"
                      value={app.bandwidthCapMbps}
                      min={0}
                      max={200}
                      step={1}
                      onChange={(v) => actions.updateApp(app.id, { bandwidthCapMbps: v })}
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-white/65">Usage</div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-3 rounded-full bg-amd-gradient shadow-glowBlue transition-[width] duration-300"
                        style={{ width: `${Math.min(100, (app.usageMbps / 120) * 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-white/55">
                      {app.bandwidthCapMbps === 0
                        ? "Unlimited profile"
                        : `Capped to ${app.bandwidthCapMbps} Mbps`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <Toggle
                    checked={app.autoGameMode}
                    onChange={(v) => actions.updateApp(app.id, { autoGameMode: v })}
                    label="Auto-detect game mode"
                    sub="Boosts UDP + priority when a match starts"
                  />
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-sm font-semibold">Smart notes</div>
                    <div className="mt-1 text-xs text-white/55">
                      LagZero will favor interactive flows (voice + game) over background downloads.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4">
        <Card title="Rules Engine" subtitle="How shaping decisions are made (UI only)">
          <div className="space-y-3 text-sm text-white/75">
            <Rule k="Game detection" v="Foreground + known anti-cheat signatures" />
            <Rule k="Priority queues" v="UDP first, then voice, then browser" />
            <Rule k="Burst control" v="Short bursts allowed, long downloads capped" />
            <Rule k="Kill switch" v="Immediate process throttle/terminate (sim)" />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">Integration ready</div>
            <div className="mt-2 text-sm text-white/70">
              Hook these controls to your local REST/gRPC bridge to apply real bandwidth caps and priorities.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Rule({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-white/75">{k}</div>
      <div className="text-xs font-semibold text-white/85">{v}</div>
    </div>
  );
}

function AppIcon({ kind }: { kind: "game" | "browser" | "discord" | "steam" | "system" | "other" }) {
  const base =
    kind === "game"
      ? "from-neonBlue/35 to-ok/20"
      : kind === "discord"
        ? "from-neonBlue/25 to-white/5"
        : kind === "steam"
          ? "from-amdRed/25 to-white/5"
          : kind === "browser"
            ? "from-warn/25 to-white/5"
            : "from-white/10 to-white/5";
  return (
    <div
      className={[
        "grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br",
        base
      ].join(" ")}
    >
      <div className="h-2.5 w-2.5 rounded-full bg-white/75 shadow" />
    </div>
  );
}

