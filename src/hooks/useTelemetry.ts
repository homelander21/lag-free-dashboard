import { useEffect, useMemo, useRef, useState } from "react";
import { clamp, gradeFromMetrics, lerp, round1, round2 } from "../lib/utils";
import type { SystemTelemetry, TimePoint, TrafficApp } from "../types";
import { lagZeroApi } from "../api/client";
import { mapStateDtoToUi } from "../api/map";

function makeInitialTimeline(now: number): TimePoint[] {
  const pts: TimePoint[] = [];
  for (let i = 59; i >= 0; i--) {
    const t = now - i * 1000;
    pts.push({
      t,
      ping: 18 + Math.random() * 12,
      jitter: 1.2 + Math.random() * 2.2,
      throughput: 120 + Math.random() * 80,
      bufferbloat: 12 + Math.random() * 24
    });
  }
  return pts;
}

function seededNoise(prev: number, target: number, speed = 0.35) {
  return lerp(prev, target, speed);
}

export function useTelemetry() {
  const [boostPulse, setBoostPulse] = useState(0);
  const [backendMode, setBackendMode] = useState<"auto" | "backend" | "sim">(
    lagZeroApi.baseUrl() ? "auto" : "sim"
  );
  const backendRetryRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const [apps, setApps] = useState<TrafficApp[]>(() => [
    {
      id: "valorant",
      name: "VALORANT",
      icon: "game",
      bandwidthCapMbps: 0,
      usageMbps: 2.4,
      kill: false,
      priority: true,
      autoGameMode: true
    },
    {
      id: "discord",
      name: "Discord",
      icon: "discord",
      bandwidthCapMbps: 12,
      usageMbps: 3.8,
      kill: false,
      priority: true,
      autoGameMode: false
    },
    {
      id: "chrome",
      name: "Chrome (Background Tabs)",
      icon: "browser",
      bandwidthCapMbps: 25,
      usageMbps: 18.2,
      kill: false,
      priority: false,
      autoGameMode: false
    },
    {
      id: "steam",
      name: "Steam Download Service",
      icon: "steam",
      bandwidthCapMbps: 40,
      usageMbps: 52.0,
      kill: false,
      priority: false,
      autoGameMode: false
    },
    {
      id: "windows",
      name: "Windows Update",
      icon: "system",
      bandwidthCapMbps: 18,
      usageMbps: 10.7,
      kill: false,
      priority: false,
      autoGameMode: false
    }
  ]);

  const [telemetry, setTelemetry] = useState<SystemTelemetry>(() => {
    const now = Date.now();
    const ping = 22;
    const jitter = 2.3;
    const loss = 0.2;
    const grade = gradeFromMetrics(ping, jitter, loss);
    return {
      pingMs: ping,
      jitterMs: jitter,
      lossPct: loss,
      grade,
      antiLag2: true,
      aiPredictive: true,
      multipath: true,
      sqm: true,
      npuUtilPct: 18,
      gpuClockMhz: 2680,
      cpuTempC: 68,
      cpuCoresMhz: [5150, 5075, 4980, 4920, 4850, 4775, 4700, 4650],
      interfaces: {
        ethernet: 18.2,
        wifi: 28.4,
        fiveG: 36.9,
        active: "ethernet",
        autoSwitch: true
      },
      timeline: makeInitialTimeline(now),
      optimizing: false,
      calibrating: true,
      optimizationLabel: "Calibrating link baseline…"
    };
  });

  const optimizationTimeout = useRef<number | null>(null);
  const calibrationTimeout = useRef<number | null>(null);
  const sseUnsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    // Initial calibration animation.
    calibrationTimeout.current = window.setTimeout(() => {
      setTelemetry((t) => ({
        ...t,
        calibrating: false,
        optimizationLabel: ""
      }));
    }, 2200);

    return () => {
      if (optimizationTimeout.current) window.clearTimeout(optimizationTimeout.current);
      if (calibrationTimeout.current) window.clearTimeout(calibrationTimeout.current);
      if (sseUnsubRef.current) sseUnsubRef.current();
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (backendMode === "backend") return;
    if (backendMode === "auto" && !lagZeroApi.baseUrl()) {
      setBackendMode("sim");
      return;
    }
    if (backendMode !== "sim" && backendMode !== "auto") return;

    const id = window.setInterval(() => {
      setTelemetry((prev) => {
        const now = Date.now();
        const last = prev.timeline[prev.timeline.length - 1];

        const multipathBonus = prev.multipath ? 0.9 : 1.0;
        const sqmBonus = prev.sqm ? 0.85 : 1.0;
        const predictiveBonus = prev.aiPredictive ? 0.92 : 1.0;
        const antiLagBonus = prev.antiLag2 ? 0.95 : 1.0;
        const boostFactor = multipathBonus * sqmBonus * predictiveBonus * antiLagBonus;

        // Random spikes (AI predictive reduces probability).
        const spikeProb = prev.aiPredictive ? 0.035 : 0.07;
        const spike = Math.random() < spikeProb ? 10 + Math.random() * 26 : 0;
        const lossSpike = Math.random() < 0.03 ? Math.random() * 0.8 : 0;

        const basePingTarget = clamp(18 + Math.random() * 12 + spike, 8, 120);
        const baseJitterTarget = clamp(1.0 + Math.random() * 3.0 + spike * 0.05, 0.3, 30);
        const baseLossTarget = clamp(0.05 + Math.random() * 0.35 + lossSpike, 0, 8);

        const pingMs = round1(seededNoise(prev.pingMs, basePingTarget * boostFactor, 0.28));
        const jitterMs = round1(seededNoise(prev.jitterMs, baseJitterTarget * boostFactor, 0.35));
        const lossPct = round2(seededNoise(prev.lossPct, baseLossTarget * (prev.sqm ? 0.85 : 1), 0.22));
        const grade = gradeFromMetrics(pingMs, jitterMs, lossPct);

        const throughputTarget = clamp(120 + Math.random() * 140 - spike * 1.2, 8, 980);
        const bufferbloatTarget = clamp(
          8 + Math.random() * 28 + spike * 0.55,
          0,
          100
        );

        const nextPoint: TimePoint = {
          t: now,
          ping: clamp((last?.ping ?? pingMs) * 0.75 + pingMs * 0.25, 0, 250),
          jitter: clamp((last?.jitter ?? jitterMs) * 0.75 + jitterMs * 0.25, 0, 80),
          throughput: clamp(seededNoise(last?.throughput ?? 240, throughputTarget, 0.25), 0, 1000),
          bufferbloat: clamp(seededNoise(last?.bufferbloat ?? 20, bufferbloatTarget * (prev.sqm ? 0.7 : 1), 0.22), 0, 100)
        };

        const timeline = [...prev.timeline.slice(1), nextPoint];

        const npuUtilPct = clamp(round1(seededNoise(prev.npuUtilPct, prev.aiPredictive ? 22 + Math.random() * 28 : 4 + Math.random() * 8, 0.18)), 0, 100);
        const gpuClockMhz = clamp(Math.round(seededNoise(prev.gpuClockMhz, 2520 + Math.random() * 380, 0.08)), 500, 6000);
        const cpuTempC = clamp(round1(seededNoise(prev.cpuTempC, 63 + Math.random() * 12 + (prev.optimizing ? 2.2 : 0), 0.12)), 25, 98);

        const cpuCoresMhz = prev.cpuCoresMhz.map((mhz) => {
          const target = 4550 + Math.random() * 800 - (prev.optimizing ? 0 : 120);
          return clamp(Math.round(seededNoise(mhz, target, 0.10)), 1200, 5900);
        });

        // Interface latencies and auto-switch.
        const ethernet = round1(seededNoise(prev.interfaces.ethernet, pingMs - 2 + Math.random() * 4, 0.22));
        const wifi = round1(seededNoise(prev.interfaces.wifi, pingMs + 6 + Math.random() * 10, 0.18));
        const fiveG = round1(seededNoise(prev.interfaces.fiveG, pingMs + 12 + Math.random() * 12, 0.14));

        let active = prev.interfaces.active;
        if (prev.interfaces.autoSwitch) {
          const best = ([
            ["ethernet", ethernet],
            ["wifi", wifi],
            ["fiveG", fiveG]
          ] as const).sort((a, b) => a[1] - b[1])[0][0];
          active = best;
        }

        return {
          ...prev,
          pingMs,
          jitterMs,
          lossPct,
          grade,
          timeline,
          npuUtilPct,
          gpuClockMhz,
          cpuTempC,
          cpuCoresMhz,
          interfaces: {
            ...prev.interfaces,
            ethernet,
            wifi,
            fiveG,
            active
          }
        };
      });

      setApps((prev) =>
        prev.map((a) => {
          const jitter = (Math.random() - 0.5) * 1.8;
          const base = a.icon === "game" ? 2.8 : a.icon === "steam" ? 40 : a.icon === "browser" ? 18 : 7;
          const usage = clamp(round1(a.usageMbps * 0.72 + (base + Math.random() * base * 0.35 + jitter) * 0.28), 0, 200);
          return { ...a, usageMbps: usage };
        })
      );
    }, 1000);

    return () => window.clearInterval(id);
  }, [backendMode]);

  useEffect(() => {
    if (backendMode === "sim") return;
    if (!lagZeroApi.baseUrl()) return;

    let cancelled = false;
    const tryConnect = async () => {
      try {
        const dto = await lagZeroApi.getState();
        if (cancelled) return;
        const { telemetry: nextTelemetry, apps: nextApps } = mapStateDtoToUi(dto);
        setTelemetry((prev) => ({
          ...nextTelemetry,
          // Keep UI-only overlay behavior.
          calibrating: prev.calibrating,
          optimizing: prev.optimizing,
          optimizationLabel: prev.optimizationLabel
        }));
        setApps(nextApps);
        setBackendMode("backend");
        backendRetryRef.current = 0;

        if (sseUnsubRef.current) sseUnsubRef.current();
        sseUnsubRef.current = lagZeroApi.subscribeTelemetry(
          (state) => {
            const mapped = mapStateDtoToUi(state);
            setTelemetry((prev) => ({
              ...mapped.telemetry,
              calibrating: prev.calibrating,
              optimizing: prev.optimizing,
              optimizationLabel: prev.optimizationLabel
            }));
            setApps(mapped.apps);
          },
          () => {
            // SSE broke; attempt reconnect a few times, then fall back to simulation.
            if (cancelled) return;
            backendRetryRef.current += 1;
            if (backendRetryRef.current >= 4) {
              setBackendMode("sim");
              return;
            }
            if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = window.setTimeout(() => {
              setBackendMode("auto");
            }, 800 * backendRetryRef.current);
          }
        );
      } catch {
        if (!cancelled) setBackendMode("sim");
      }
    };
    void tryConnect();

    return () => {
      cancelled = true;
    };
  }, [backendMode]);

  const actions = useMemo(() => {
    return {
      async oneClickBoost() {
        setBoostPulse((p) => p + 1);
        setTelemetry((t) => ({
          ...t,
          optimizing: true,
          optimizationLabel: "Network Optimization Running…"
        }));
        if (optimizationTimeout.current) window.clearTimeout(optimizationTimeout.current);
        optimizationTimeout.current = window.setTimeout(() => {
          setTelemetry((t) => ({
            ...t,
            optimizing: false,
            optimizationLabel: ""
          }));
        }, 5200);

        if (backendMode === "backend") {
          try {
            await lagZeroApi.boost({ reason: "user_click" });
          } catch {
            // UI keeps local animation even if backend call fails.
          }
        }
      },
      async toggle(key: "antiLag2" | "aiPredictive" | "multipath" | "sqm") {
        setTelemetry((t) => ({ ...t, [key]: !t[key] }));
        if (backendMode !== "backend") return;
        const patch =
          key === "antiLag2"
            ? { anti_lag2: !telemetry.antiLag2 }
            : key === "aiPredictive"
              ? { ai_predictive: !telemetry.aiPredictive }
              : key === "multipath"
                ? { multipath: !telemetry.multipath }
                : { sqm: !telemetry.sqm };
        try {
          await lagZeroApi.patchSettings(patch);
        } catch {
          // If backend rejects, it will overwrite via telemetry stream later.
        }
      },
      async setAutoSwitch(v: boolean) {
        setTelemetry((t) => ({ ...t, interfaces: { ...t.interfaces, autoSwitch: v } }));
        if (backendMode === "backend") {
          try {
            await lagZeroApi.patchInterfaces({ auto_switch: v });
          } catch {
            // ignore
          }
        }
      },
      async setActiveInterface(next: SystemTelemetry["interfaces"]["active"]) {
        setTelemetry((t) => ({ ...t, interfaces: { ...t.interfaces, active: next, autoSwitch: false } }));
        if (backendMode === "backend") {
          const dtoActive = next === "fiveG" ? "fiveg" : next;
          try {
            await lagZeroApi.patchInterfaces({ active: dtoActive, auto_switch: false });
          } catch {
            // ignore
          }
        }
      },
      async updateApp(id: string, patch: Partial<TrafficApp>) {
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
        if (backendMode !== "backend") return;
        const dtoPatch: Record<string, unknown> = {};
        if (typeof patch.bandwidthCapMbps === "number") dtoPatch.cap_mbps = patch.bandwidthCapMbps;
        if (typeof patch.kill === "boolean") dtoPatch.kill = patch.kill;
        if (typeof patch.priority === "boolean") dtoPatch.priority = patch.priority;
        if (typeof patch.autoGameMode === "boolean") dtoPatch.auto_game_mode = patch.autoGameMode;
        try {
          await lagZeroApi.patchApp(id, dtoPatch);
        } catch {
          // ignore
        }
      }
    };
  }, [backendMode, telemetry.antiLag2, telemetry.aiPredictive, telemetry.multipath, telemetry.sqm]);

  return {
    telemetry,
    apps,
    actions,
    boostPulse,
    connection: {
      mode: backendMode === "backend" ? "backend" : "sim",
      apiBase: lagZeroApi.baseUrl()
    }
  };
}

