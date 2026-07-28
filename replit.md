# Crypto Trading Dashboard

A mission-control dashboard for the Crypto Trading Agent — Phase 1 observation UI that surfaces Solana token market data, on-chain safety scores, technical analysis indicators, and Claude AI trade recommendations from your Python backend.

## Run & Operate

- `pnpm --filter @workspace/dashboard run dev` — run the React dashboard (previewed at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the Express proxy API (port 8080, served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS + shadcn/ui + Recharts + Wouter
- API: Express 5 (proxy layer — forwards all requests to the Python API)
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Python backend: FastAPI (run separately via Docker Compose or Render)

## Where things live

- `artifacts/dashboard/` — React dashboard frontend
- `artifacts/api-server/` — Express proxy server (forwards to `PYTHON_API_URL`)
- `artifacts/api-server/src/lib/proxy.ts` — generic proxy utility
- `artifacts/api-server/src/routes/tokens.ts` — token endpoint proxies
- `artifacts/api-server/src/routes/social.ts` — social mentions proxy
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit)

## Architecture decisions

- **Proxy architecture**: The Express server proxies all requests to `PYTHON_API_URL`. This avoids CORS issues and lets the dashboard use the same-origin API path (`/api/...`) regardless of where the Python backend is hosted.
- **No DB in this workspace**: All data lives in the Python backend's Postgres. The Node.js workspace has a Postgres database provisioned but unused — it's there if you ever want to cache responses or add dashboard-specific features.
- **OpenAPI-first**: `lib/api-spec/openapi.yaml` mirrors the Python FastAPI routes. After any Python API change, update the spec here and re-run codegen.
- **`indexFiles: false` for api-zod**: Orval's `split` mode generates a barrel that collides with its own Zod schema names for parameterized operations. Setting `indexFiles: false` prevents Orval from overwriting `lib/api-zod/src/index.ts`, which only re-exports from `generated/api`.

## Product

- **Token Watchlist** (`/`) — live list of tracked Solana tokens with price, source, and risk indicator
- **Token Detail** (`/tokens/:chain/:address`) — price history chart, TA indicators (RSI/MACD/SMA/EMA), on-chain safety breakdown, Claude AI recommendation
- **Social Feed** (`/social`) — recent Reddit mentions filterable by token symbol

## User preferences

_Populate as needed._

## Gotchas

- Set `PYTHON_API_URL` to your Python backend URL (e.g. `http://localhost:8000` for local Docker, or your Render URL). Without it the API server returns 503.
- Always run codegen after changing `lib/api-spec/openapi.yaml`.
- Do not add `export * from "./generated/types"` to `lib/api-zod/src/index.ts` — Orval will not overwrite it (`indexFiles: false`) but the types directory no longer exists.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Python backend source: `attached_assets/crypto-trading-agent-project_*.zip`
- Python backend README: `attached_assets/crypto-trading-agent-README_*.md`
