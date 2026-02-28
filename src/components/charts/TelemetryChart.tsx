import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TimePoint } from "../../types";

type Mode = "ping" | "jitter" | "throughput" | "bufferbloat";

function fmtTime(t: number) {
  const d = new Date(t);
  const s = d.getSeconds().toString().padStart(2, "0");
  return `:${s}`;
}

export function TelemetryChart({
  timeline,
  modes,
  height = 260
}: {
  timeline: TimePoint[];
  modes: Mode[];
  height?: number;
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={timeline} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="gPing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2BD9FF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2BD9FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gJitter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#30F2A2" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#30F2A2" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gThrough" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF2E62" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#FF2E62" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gBloat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC14A" stopOpacity={0.30} />
              <stop offset="100%" stopColor="#FFC14A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={fmtTime}
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
            stroke="rgba(255,255,255,0.10)"
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
            stroke="rgba(255,255,255,0.10)"
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10,14,26,0.82)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              backdropFilter: "blur(12px)",
              color: "rgba(255,255,255,0.9)"
            }}
            labelFormatter={(label) => `t ${fmtTime(label as number)}`}
          />
          <Legend
            wrapperStyle={{ color: "rgba(255,255,255,0.72)", fontSize: 12 }}
          />

          {modes.includes("ping") ? (
            <Area
              type="monotone"
              dataKey="ping"
              name="Ping (ms)"
              stroke="#2BD9FF"
              strokeWidth={2}
              fill="url(#gPing)"
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
          {modes.includes("jitter") ? (
            <Area
              type="monotone"
              dataKey="jitter"
              name="Jitter (ms)"
              stroke="#30F2A2"
              strokeWidth={2}
              fill="url(#gJitter)"
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
          {modes.includes("throughput") ? (
            <Area
              type="monotone"
              dataKey="throughput"
              name="Throughput (Mbps)"
              stroke="#FF2E62"
              strokeWidth={2}
              fill="url(#gThrough)"
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
          {modes.includes("bufferbloat") ? (
            <Area
              type="monotone"
              dataKey="bufferbloat"
              name="Bufferbloat (score)"
              stroke="#FFC14A"
              strokeWidth={2}
              fill="url(#gBloat)"
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

