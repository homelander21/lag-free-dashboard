import { gradeFromMetrics } from "../lib/utils";
import type { StateDto } from "./dto";
import type { SystemTelemetry, TrafficApp, TimePoint } from "../types";

function mapInterfaceActive(active: StateDto["interfaces"]["active"]): SystemTelemetry["interfaces"]["active"] {
  return active === "fiveg" ? "fiveG" : active;
}

function mapKindToIcon(kind: StateDto["apps"][number]["kind"]): TrafficApp["icon"] {
  return kind;
}

export function mapStateDtoToUi(dto: StateDto): { telemetry: SystemTelemetry; apps: TrafficApp[] } {
  const grade = dto.grade ?? gradeFromMetrics(dto.ping_ms, dto.jitter_ms, dto.loss_pct);

  const timeline: TimePoint[] = dto.timeline.map((p) => ({
    t: p.t_ms,
    ping: p.ping_ms,
    jitter: p.jitter_ms,
    throughput: p.throughput_mbps,
    bufferbloat: p.bufferbloat_score
  }));

  const apps: TrafficApp[] = dto.apps.map((a) => ({
    id: a.id,
    name: a.name,
    icon: mapKindToIcon(a.kind),
    bandwidthCapMbps: a.cap_mbps,
    usageMbps: a.usage_mbps,
    kill: a.kill,
    priority: a.priority,
    autoGameMode: a.auto_game_mode
  }));

  const telemetry: SystemTelemetry = {
    pingMs: dto.ping_ms,
    jitterMs: dto.jitter_ms,
    lossPct: dto.loss_pct,
    grade,

    antiLag2: dto.anti_lag2,
    aiPredictive: dto.ai_predictive,
    multipath: dto.multipath,
    sqm: dto.sqm,

    npuUtilPct: dto.npu_util_pct,
    gpuClockMhz: dto.gpu_clock_mhz,
    cpuTempC: dto.cpu_temp_c,
    cpuCoresMhz: dto.cpu_cores_mhz,

    interfaces: {
      ethernet: dto.interfaces.ethernet_ms,
      wifi: dto.interfaces.wifi_ms,
      fiveG: dto.interfaces.fiveg_ms,
      active: mapInterfaceActive(dto.interfaces.active),
      autoSwitch: dto.interfaces.auto_switch
    },

    timeline,
    optimizing: false,
    calibrating: false,
    optimizationLabel: ""
  };

  return { telemetry, apps };
}

