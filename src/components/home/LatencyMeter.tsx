import { gradeColor, gradeRingStops } from "../../lib/utils";
import type { Grade } from "../../lib/utils";

export function LatencyMeter({
  pingMs,
  jitterMs,
  lossPct,
  grade
}: {
  pingMs: number;
  jitterMs: number;
  lossPct: number;
  grade: Grade;
}) {
  const radius = 118;
  const stroke = 16;
  const circ = 2 * Math.PI * radius;
  // Map grade to fill percent.
  const fillPct =
    grade === "A+"
      ? 0.97
      : grade === "A"
        ? 0.9
        : grade === "B"
          ? 0.78
          : grade === "C"
            ? 0.62
            : grade === "D"
              ? 0.45
              : 0.28;

  const dash = circ * fillPct;
  const stops = gradeRingStops(grade);

  return (
    <div className="relative grid place-items-center">
      <svg width="320" height="320" viewBox="0 0 320 320" className="drop-shadow-[0_0_30px_rgba(43,217,255,0.10)]">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stops.a} />
            <stop offset="100%" stopColor={stops.b} />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(160 160)">
          <circle r={radius} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} />
          <circle
            r={radius}
            fill="transparent"
            stroke="url(#ring)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform="rotate(-92)"
            filter="url(#softGlow)"
          />
          <circle r={radius - 22} fill="rgba(5,7,14,0.70)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className={["text-4xl font-semibold tracking-tight", gradeColor(grade)].join(" ")}>
            {grade}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.26em] text-white/55">Latency Grade</div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Metric label="Ping" value={`${pingMs.toFixed(1)} ms`} />
            <Metric label="Jitter" value={`${jitterMs.toFixed(1)} ms`} />
            <Metric label="Loss" value={`${lossPct.toFixed(2)}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/90">{value}</div>
    </div>
  );
}

