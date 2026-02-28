## LagZero Python Backend (local REST + SSE)

Implements the dashboard contract:
- `GET /v1/state`
- `GET /v1/telemetry/stream` (SSE)
- `POST /v1/commands/boost`
- `PATCH /v1/state/settings`
- `PATCH /v1/state/interfaces`
- `PATCH /v1/apps/{id}`

### Run
```bash
cd backend-python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 7777
```

### Connect UI
Create `../.env` (in the dashboard root) with:
```bash
VITE_LAGZERO_API_BASE=http://127.0.0.1:7777
```

