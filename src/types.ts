import type { Grade } from "./lib/utils";

export type TimePoint = {
  t: number; // epoch ms
  ping: number;
  jitter: number;
  throughput: number; // Mbps
  bufferbloat: number; // 0-100 (lower is better)
};

export type InterfaceLatencies = {
  ethernet: number;
  wifi: number;
  fiveG: number;
  active: "ethernet" | "wifi" | "fiveG";
  autoSwitch: boolean;
};

export type SystemTelemetry = {
  pingMs: number;
  jitterMs: number;
  lossPct: number;
  grade: Grade;

  antiLag2: boolean;
  aiPredictive: boolean;
  multipath: boolean;
  sqm: boolean;

  npuUtilPct: number;
  gpuClockMhz: number;
  cpuTempC: number;
  cpuCoresMhz: number[];

  interfaces: InterfaceLatencies;
  timeline: TimePoint[]; // last 60s
  optimizing: boolean;
  calibrating: boolean;
  optimizationLabel: string;
};

export type TrafficApp = {
  id: string;
  name: string;
  icon: "game" | "browser" | "discord" | "steam" | "system" | "other";
  bandwidthCapMbps: number; // 0..200
  usageMbps: number; // live
  kill: boolean;
  priority: boolean;
  autoGameMode: boolean;
};

