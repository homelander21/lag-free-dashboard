from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Literal, Optional

InterfaceId = Literal["ethernet", "wifi", "fiveg"]
AppKind = Literal["game", "browser", "discord", "steam", "system", "other"]


def _now_ms() -> int:
    return int(time.time() * 1000)


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _round1(x: float) -> float:
    return round(x, 1)


def _round2(x: float) -> float:
    return round(x, 2)


def grade_from_metrics(ping_ms: float, jitter_ms: float, loss_pct: float) -> str:
    score = 100.0 - (ping_ms * 0.9 + jitter_ms * 2.2 + loss_pct * 18.0)
    if score >= 92:
        return "A+"
    if score >= 85:
        return "A"
    if score >= 75:
        return "B"
    if score >= 62:
        return "C"
    if score >= 50:
        return "D"
    return "F"


def make_initial_timeline(now_ms: int) -> List[Dict[str, Any]]:
    pts: List[Dict[str, Any]] = []
    for i in range(59, -1, -1):
        t = now_ms - i * 1000
        pts.append(
            {
                "t_ms": t,
                "ping_ms": 18 + (i % 7) * 0.4 + (i % 3) * 0.7,
                "jitter_ms": 1.2 + (i % 5) * 0.2,
                "throughput_mbps": 160 + (i % 11) * 4.2,
                "bufferbloat_score": 18 + (i % 9) * 1.8,
            }
        )
    return pts


@dataclass
class LagZeroState:
    # Telemetry + flags
    ping_ms: float = 22.0
    jitter_ms: float = 2.3
    loss_pct: float = 0.2

    anti_lag2: bool = True
    ai_predictive: bool = True
    multipath: bool = True
    sqm: bool = True

    npu_util_pct: float = 18.0
    gpu_clock_mhz: int = 2680
    cpu_temp_c: float = 68.0
    cpu_cores_mhz: List[int] = field(default_factory=lambda: [5150, 5075, 4980, 4920, 4850, 4775, 4700, 4650])

    interfaces: Dict[str, Any] = field(
        default_factory=lambda: {
            "ethernet_ms": 18.2,
            "wifi_ms": 28.4,
            "fiveg_ms": 36.9,
            "active": "ethernet",
            "auto_switch": True,
        }
    )

    timeline: List[Dict[str, Any]] = field(default_factory=lambda: make_initial_timeline(_now_ms()))

    apps: List[Dict[str, Any]] = field(
        default_factory=lambda: [
            {
                "id": "valorant",
                "name": "VALORANT",
                "kind": "game",
                "usage_mbps": 2.4,
                "cap_mbps": 0,
                "kill": False,
                "priority": True,
                "auto_game_mode": True,
            },
            {
                "id": "discord",
                "name": "Discord",
                "kind": "discord",
                "usage_mbps": 3.8,
                "cap_mbps": 12,
                "kill": False,
                "priority": True,
                "auto_game_mode": False,
            },
            {
                "id": "chrome",
                "name": "Chrome (Background Tabs)",
                "kind": "browser",
                "usage_mbps": 18.2,
                "cap_mbps": 25,
                "kill": False,
                "priority": False,
                "auto_game_mode": False,
            },
            {
                "id": "steam",
                "name": "Steam Download Service",
                "kind": "steam",
                "usage_mbps": 52.0,
                "cap_mbps": 40,
                "kill": False,
                "priority": False,
                "auto_game_mode": False,
            },
            {
                "id": "windows",
                "name": "Windows Update",
                "kind": "system",
                "usage_mbps": 10.7,
                "cap_mbps": 18,
                "kill": False,
                "priority": False,
                "auto_game_mode": False,
            },
        ]
    )

    # Backend-only “boost” shaping window
    boost_until_ms: int = 0

    # Async plumbing
    lock: asyncio.Lock = field(default_factory=asyncio.Lock, repr=False)
    subscribers: List[asyncio.Queue] = field(default_factory=list, repr=False)

    def to_dto(self) -> Dict[str, Any]:
        grade = grade_from_metrics(self.ping_ms, self.jitter_ms, self.loss_pct)
        return {
            "ping_ms": _round1(self.ping_ms),
            "jitter_ms": _round1(self.jitter_ms),
            "loss_pct": _round2(self.loss_pct),
            "grade": grade,
            "anti_lag2": self.anti_lag2,
            "ai_predictive": self.ai_predictive,
            "multipath": self.multipath,
            "sqm": self.sqm,
            "npu_util_pct": _round1(self.npu_util_pct),
            "gpu_clock_mhz": int(self.gpu_clock_mhz),
            "cpu_temp_c": _round1(self.cpu_temp_c),
            "cpu_cores_mhz": list(self.cpu_cores_mhz),
            "interfaces": dict(self.interfaces),
            "timeline": list(self.timeline),
            "apps": list(self.apps),
        }

    async def broadcast(self) -> None:
        dto = self.to_dto()
        dead: List[asyncio.Queue] = []
        for q in self.subscribers:
            try:
                if q.full():
                    # drop oldest to keep “most recent” semantics
                    _ = q.get_nowait()
                q.put_nowait(dto)
            except Exception:
                dead.append(q)
        for q in dead:
            try:
                self.subscribers.remove(q)
            except ValueError:
                pass

    async def tick(self) -> None:
        now = _now_ms()
        boost_on = now < self.boost_until_ms

        # Bonuses based on enabled modules.
        multipath_bonus = 0.9 if self.multipath else 1.0
        sqm_bonus = 0.85 if self.sqm else 1.0
        predictive_bonus = 0.92 if self.ai_predictive else 1.0
        anti_lag_bonus = 0.95 if self.anti_lag2 else 1.0
        boost_factor = multipath_bonus * sqm_bonus * predictive_bonus * anti_lag_bonus
        if boost_on:
            boost_factor *= 0.88

        spike_prob = 0.035 if self.ai_predictive else 0.07
        spike = (10 + (now % 17) * 0.8) if (now % 1000) < spike_prob * 1000 else 0.0

        ping_target = _clamp(18 + (now % 9) * 0.9 + spike, 8, 120) * boost_factor
        jitter_target = _clamp(1.0 + (now % 7) * 0.25 + spike * 0.05, 0.3, 30) * boost_factor
        loss_target = _clamp(0.05 + ((now // 3000) % 7) * 0.03 + (0.4 if spike else 0.0), 0, 8) * (0.85 if self.sqm else 1.0)

        # Smooth step.
        self.ping_ms = _clamp(self.ping_ms * 0.72 + ping_target * 0.28, 0, 250)
        self.jitter_ms = _clamp(self.jitter_ms * 0.65 + jitter_target * 0.35, 0, 80)
        self.loss_pct = _clamp(self.loss_pct * 0.78 + loss_target * 0.22, 0, 10)

        throughput_target = _clamp(140 + (now % 19) * 6.5 - spike * 1.2, 8, 980)
        bufferbloat_target = _clamp(10 + (now % 13) * 1.2 + spike * 0.55, 0, 100)
        if self.sqm:
            bufferbloat_target *= 0.7

        last = self.timeline[-1] if self.timeline else None
        next_pt = {
            "t_ms": now,
            "ping_ms": _clamp(((last["ping_ms"] if last else self.ping_ms) * 0.75 + self.ping_ms * 0.25), 0, 250),
            "jitter_ms": _clamp(((last["jitter_ms"] if last else self.jitter_ms) * 0.75 + self.jitter_ms * 0.25), 0, 80),
            "throughput_mbps": _clamp(((last["throughput_mbps"] if last else 240.0) * 0.75 + throughput_target * 0.25), 0, 1000),
            "bufferbloat_score": _clamp(((last["bufferbloat_score"] if last else 20.0) * 0.78 + bufferbloat_target * 0.22), 0, 100),
        }
        self.timeline = (self.timeline[-59:] + [next_pt]) if self.timeline else [next_pt]

        self.npu_util_pct = _clamp(self.npu_util_pct * 0.82 + (32.0 if self.ai_predictive else 6.0) * 0.18, 0, 100)
        self.gpu_clock_mhz = int(_clamp(self.gpu_clock_mhz * 0.92 + (2520 + (now % 13) * 26) * 0.08, 500, 6000))
        self.cpu_temp_c = _clamp(self.cpu_temp_c * 0.88 + (64.0 + (now % 7) * 1.2 + (2.2 if boost_on else 0.0)) * 0.12, 25, 98)
        self.cpu_cores_mhz = [
            int(_clamp(m * 0.90 + (4550 + (now % 23) * 18 + i * 12) * 0.10, 1200, 5900)) for i, m in enumerate(self.cpu_cores_mhz)
        ]

        # Interface measurements
        eth = _round1(_clamp(self.ping_ms - 2 + (now % 5) * 0.4, 1, 200))
        wifi = _round1(_clamp(self.ping_ms + 6 + (now % 7) * 0.6, 1, 220))
        fiveg = _round1(_clamp(self.ping_ms + 12 + (now % 9) * 0.7, 1, 240))
        self.interfaces["ethernet_ms"] = eth
        self.interfaces["wifi_ms"] = wifi
        self.interfaces["fiveg_ms"] = fiveg
        if self.interfaces.get("auto_switch", True):
            best = min([("ethernet", eth), ("wifi", wifi), ("fiveg", fiveg)], key=lambda x: x[1])[0]
            self.interfaces["active"] = best

        # App usage simulation
        for a in self.apps:
            kind = a.get("kind")
            base = 2.8 if kind == "game" else 40.0 if kind == "steam" else 18.0 if kind == "browser" else 7.0
            usage = _clamp(a.get("usage_mbps", base) * 0.72 + (base * (0.9 + ((now % 11) * 0.02))) * 0.28, 0, 200)
            a["usage_mbps"] = _round1(usage)


STATE = LagZeroState()


async def run_simulation_loop() -> None:
    while True:
        async with STATE.lock:
            await STATE.tick()
            await STATE.broadcast()
        await asyncio.sleep(1.0)


async def add_subscriber_queue(maxsize: int = 2) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue(maxsize=maxsize)
    async with STATE.lock:
        STATE.subscribers.append(q)
        # push current snapshot immediately
        q.put_nowait(STATE.to_dto())
    return q


async def remove_subscriber_queue(q: asyncio.Queue) -> None:
    async with STATE.lock:
        try:
            STATE.subscribers.remove(q)
        except ValueError:
            pass

