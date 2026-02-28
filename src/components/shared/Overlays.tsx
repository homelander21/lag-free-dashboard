import type { SystemTelemetry } from "../../types";

export function CalibrationOverlay({ telemetry }: { telemetry: SystemTelemetry }) {
  if (!telemetry.calibrating && !telemetry.optimizing) return null;

  const label = telemetry.optimizing
    ? telemetry.optimizationLabel || "Network Optimization Running…"
    : telemetry.optimizationLabel || "Calibrating link baseline…";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg0/75 backdrop-blur-md">
      <div className="glass noise w-[min(680px,92vw)] rounded-3xl p-6 shadow-glowBlue">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">LagZero</div>
            <div className="mt-1 text-xl font-semibold">{label}</div>
            <div className="mt-2 text-sm text-white/60">
              Measuring jitter, shaping queues, and validating multi-path stability.
            </div>
          </div>
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border border-neonBlue/30 bg-neonBlue/10 shadow-glowBlue" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-neonBlue border-r-amdRed" />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="h-2 w-[140%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60 animate-shimmer" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat label="Ping" value={`${telemetry.pingMs.toFixed(1)} ms`} />
          <MiniStat label="Jitter" value={`${telemetry.jitterMs.toFixed(1)} ms`} />
          <MiniStat label="Packet Loss" value={`${telemetry.lossPct.toFixed(2)}%`} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

