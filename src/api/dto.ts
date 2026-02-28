export type InterfaceIdDto = "ethernet" | "wifi" | "fiveg";

export type TimelinePointDto = {
  t_ms: number;
  ping_ms: number;
  jitter_ms: number;
  throughput_mbps: number;
  bufferbloat_score: number;
};

export type InterfacesDto = {
  ethernet_ms: number;
  wifi_ms: number;
  fiveg_ms: number;
  active: InterfaceIdDto;
  auto_switch: boolean;
};

export type AppKindDto = "game" | "browser" | "discord" | "steam" | "system" | "other";

export type AppDto = {
  id: string;
  name: string;
  kind: AppKindDto;
  usage_mbps: number;
  cap_mbps: number;
  kill: boolean;
  priority: boolean;
  auto_game_mode: boolean;
};

export type StateDto = {
  ping_ms: number;
  jitter_ms: number;
  loss_pct: number;
  grade?: "A+" | "A" | "B" | "C" | "D" | "F";

  anti_lag2: boolean;
  ai_predictive: boolean;
  multipath: boolean;
  sqm: boolean;

  npu_util_pct: number;
  gpu_clock_mhz: number;
  cpu_temp_c: number;
  cpu_cores_mhz: number[];

  interfaces: InterfacesDto;
  timeline: TimelinePointDto[];
  apps: AppDto[];
};

export type PatchSettingsDto = Partial<Pick<StateDto, "anti_lag2" | "ai_predictive" | "multipath" | "sqm">> & {
  kernel_ebpf_enabled?: boolean;
  udp_prioritization_enabled?: boolean;
  multipath_duplication_enabled?: boolean;
  aggressiveness?: "low" | "competitive" | "esports";
};

export type PatchInterfacesDto = Partial<Pick<InterfacesDto, "active" | "auto_switch">>;

export type PatchAppDto = Partial<Pick<AppDto, "cap_mbps" | "kill" | "priority" | "auto_game_mode">>;

