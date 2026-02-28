import type { PatchAppDto, PatchInterfacesDto, PatchSettingsDto, StateDto } from "./dto";

function baseUrl() {
  const raw = import.meta.env.VITE_LAGZERO_API_BASE as string | undefined;
  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}

async function jsonFetch<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const ctrl = new AbortController();
  const timeoutMs = init?.timeoutMs ?? 2500;
  const to = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {})
      },
      signal: ctrl.signal
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
    }
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(to);
  }
}

export const lagZeroApi = {
  baseUrl,
  getState(): Promise<StateDto> {
    return jsonFetch<StateDto>("/v1/state", { method: "GET", timeoutMs: 2500 });
  },
  boost(payload?: { reason?: string; profile?: "low" | "competitive" | "esports" }) {
    return jsonFetch<{ ok: true }>("/v1/commands/boost", {
      method: "POST",
      body: JSON.stringify(payload ?? { reason: "user_click" }),
      timeoutMs: 3500
    });
  },
  patchSettings(patch: PatchSettingsDto) {
    return jsonFetch<{ ok: true }>("/v1/state/settings", {
      method: "PATCH",
      body: JSON.stringify(patch),
      timeoutMs: 2500
    });
  },
  patchInterfaces(patch: PatchInterfacesDto) {
    return jsonFetch<{ ok: true }>("/v1/state/interfaces", {
      method: "PATCH",
      body: JSON.stringify(patch),
      timeoutMs: 2500
    });
  },
  patchApp(id: string, patch: PatchAppDto) {
    return jsonFetch<{ ok: true }>(`/v1/apps/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
      timeoutMs: 2500
    });
  },
  subscribeTelemetry(onMessage: (dto: StateDto) => void, onError?: (err: unknown) => void) {
    const url = `${baseUrl()}/v1/telemetry/stream`;
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data) as StateDto);
      } catch (e) {
        onError?.(e);
      }
    };
    es.onerror = (e) => {
      onError?.(e);
    };
    return () => es.close();
  }
};

