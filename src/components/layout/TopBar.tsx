import type { SystemTelemetry } from "../../types";
import { Pill } from "../shared/Pill";

export function TopBar({
  telemetry,
  connection
}: {
  telemetry: SystemTelemetry;
  connection: { mode: "backend" | "sim"; apiBase: string };
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-bg1/60 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.22em] text-white/55">
            {telemetry.optimizing ? "Optimization running" : "Network stabilized"}
          </div>
          <div className="truncate text-lg font-semibold">
            {telemetry.optimizing ? "LagZero is shaping traffic in real time" : "Telemetry locked to low-latency profile"}
          </div>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <div
            className={[
              "glass flex items-center gap-2 rounded-full px-3 py-1",
              connection.mode === "backend"
                ? "border border-ok/20 bg-ok/10 shadow-[0_0_0_1px_rgba(48,242,162,0.10),0_0_20px_rgba(48,242,162,0.10)]"
                : "border border-white/10 bg-white/5"
            ].join(" ")}
            title={connection.mode === "backend" ? connection.apiBase : "Simulation mode"}
          >
            <span
              className={[
                "h-2 w-2 rounded-full",
                connection.mode === "backend" ? "bg-ok" : "bg-white/40"
              ].join(" ")}
            />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/65">
              {connection.mode === "backend" ? "LIVE" : "SIM"}
            </span>
          </div>
          <Pill label="Ping" value={`${telemetry.pingMs.toFixed(1)} ms`} tone="blue" />
          <Pill label="Jitter" value={`${telemetry.jitterMs.toFixed(1)} ms`} tone="neutral" />
          <Pill label="Loss" value={`${telemetry.lossPct.toFixed(2)}%`} tone={telemetry.lossPct < 0.6 ? "ok" : "bad"} />
          <Pill label="Grade" value={telemetry.grade} tone={telemetry.grade === "A+" || telemetry.grade === "A" ? "ok" : telemetry.grade === "B" || telemetry.grade === "C" ? "warn" : "bad"} />
        </div>
      </div>
    </header>
  );
}

