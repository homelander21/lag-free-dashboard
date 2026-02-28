import { NavLink } from "react-router-dom";
import type { SystemTelemetry } from "../../types";

const links: Array<{ to: string; label: string; sub: string }> = [
  { to: "/home", label: "Home Dashboard", sub: "Latency meter + boost" },
  { to: "/live", label: "Live Intelligence", sub: "60s telemetry graphs" },
  { to: "/shaper", label: "Traffic Shaper", sub: "Per-app controls" },
  { to: "/amd", label: "AMD Synergy", sub: "Anti-Lag 2 + Ryzen AI" },
  { to: "/settings", label: "Advanced Settings", sub: "Kernel + rules" }
];

export function Sidebar({ telemetry }: { telemetry: SystemTelemetry }) {
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-4 p-5 lg:flex">
      <div className="glass noise rounded-2xl p-4 shadow-glowBlue">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-amd-gradient shadow-glowRed" />
          <div className="min-w-0">
            <div className="truncate text-sm uppercase tracking-[0.22em] text-white/70">
              Smart Gaming Network Stabilizer
            </div>
            <div className="truncate text-xl font-semibold">LagZero</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">Active Interface</div>
            <div className="mt-1 text-sm font-semibold">
              {telemetry.interfaces.active === "fiveG" ? "5G" : telemetry.interfaces.active.toUpperCase()}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">Grade</div>
            <div className="mt-1 text-sm font-semibold">{telemetry.grade}</div>
          </div>
        </div>
      </div>

      <nav className="glass rounded-2xl p-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              [
                "group block rounded-xl px-3 py-3 transition",
                isActive
                  ? "bg-white/10 shadow-glowBlue"
                  : "hover:bg-white/5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{l.label}</div>
                  <div
                    className={[
                      "h-2 w-2 rounded-full bg-neonBlue/50 transition",
                      isActive ? "opacity-100" : "opacity-0"
                    ].join(" ")}
                  />
                </div>
                <div className="mt-1 text-xs text-white/55">{l.sub}</div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="glass rounded-2xl p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-white/60">Status</div>
        <div className="mt-3 space-y-2 text-sm">
          <StatusRow label="Anti-Lag 2" on={telemetry.antiLag2} />
          <StatusRow label="AI Predictive Mode" on={telemetry.aiPredictive} />
          <StatusRow label="Multi-path" on={telemetry.multipath} />
          <StatusRow label="SQM" on={telemetry.sqm} />
        </div>
      </div>
    </aside>
  );
}

function StatusRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-white/80">{label}</div>
      <div className={["text-xs font-semibold", on ? "text-ok" : "text-white/50"].join(" ")}>
        {on ? "ON" : "OFF"}
      </div>
    </div>
  );
}

