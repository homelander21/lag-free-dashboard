from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from state import STATE, add_subscriber_queue, remove_subscriber_queue, run_simulation_loop

app = FastAPI(title="LagZero Local Backend", version="0.1.0")

# Dev-friendly CORS (still local-only by binding to 127.0.0.1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    asyncio.create_task(run_simulation_loop())


@app.get("/v1/health")
async def health() -> Dict[str, Any]:
    return {"ok": True}


@app.get("/v1/state")
async def get_state() -> JSONResponse:
    async with STATE.lock:
        return JSONResponse(STATE.to_dto())


@app.get("/v1/telemetry/stream")
async def telemetry_stream(request: Request) -> StreamingResponse:
    q = await add_subscriber_queue()

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                msg = await q.get()
                payload = json.dumps(msg, separators=(",", ":"), ensure_ascii=False)
                yield f"data: {payload}\n\n"
        finally:
            await remove_subscriber_queue(q)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/v1/commands/boost")
async def boost(body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    # Contract: {"reason":"user_click","profile":"esports"|...} (optional)
    _ = body or {}
    async with STATE.lock:
        # apply a short boost window (~5s)
        import time

        STATE.boost_until_ms = int(time.time() * 1000) + 5200
    return {"ok": True}


@app.patch("/v1/state/settings")
async def patch_settings(patch: Dict[str, Any]) -> Dict[str, Any]:
    allowed = {"anti_lag2", "ai_predictive", "multipath", "sqm"}
    async with STATE.lock:
        for k, v in patch.items():
            if k in allowed and isinstance(v, bool):
                setattr(STATE, k, v)
    return {"ok": True}


@app.patch("/v1/state/interfaces")
async def patch_interfaces(patch: Dict[str, Any]) -> Dict[str, Any]:
    async with STATE.lock:
        if "auto_switch" in patch and isinstance(patch["auto_switch"], bool):
            STATE.interfaces["auto_switch"] = patch["auto_switch"]
        if "active" in patch:
            active = patch["active"]
            if active not in ("ethernet", "wifi", "fiveg"):
                raise HTTPException(status_code=400, detail="Invalid interface id")
            STATE.interfaces["active"] = active
            # When manually selecting, auto-switch is typically disabled
            if patch.get("auto_switch") is False:
                STATE.interfaces["auto_switch"] = False
    return {"ok": True}


@app.patch("/v1/apps/{app_id}")
async def patch_app(app_id: str, patch: Dict[str, Any]) -> Dict[str, Any]:
    allowed = {"cap_mbps", "kill", "priority", "auto_game_mode"}
    async with STATE.lock:
        app_obj = next((a for a in STATE.apps if a.get("id") == app_id), None)
        if not app_obj:
            raise HTTPException(status_code=404, detail="App not found")
        for k, v in patch.items():
            if k not in allowed:
                continue
            if k == "cap_mbps" and isinstance(v, (int, float)):
                app_obj["cap_mbps"] = max(0, min(int(v), 200))
            elif k in ("kill", "priority", "auto_game_mode") and isinstance(v, bool):
                app_obj[k] = v
    return {"ok": True}

