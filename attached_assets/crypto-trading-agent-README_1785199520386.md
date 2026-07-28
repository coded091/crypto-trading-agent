# Crypto Trading Agent — Phase 1: Observation

Market + social data collection for the autonomous trading agent
described in the project spec. **This phase does not touch a wallet,
hold a private key, or place a trade.** It only reads public market and
social data and stores it, so the signals can be validated before any
capital is at risk.

## What's here

| Component | Status |
|---|---|
| DexScreener connector (Solana) | Implemented |
| CoinGecko connector | Implemented |
| Birdeye connector | Implemented — trending is verified against docs, single-token lookup is unverified, see `agents/market_data/birdeye.py` |
| Reddit connector (PRAW) | Implemented |
| On-chain safety checks (mint/freeze authority + Token-2022 extensions + risk score) | Implemented — see `agents/onchain_intel/` |
| Holder concentration (top 1/5/10 accounts' share of supply) | Implemented, informational only — not factored into risk_score, see `agents/onchain_intel/holders.py` |
| LP lock status | Stubbed, raises `NotImplementedError` on purpose — see `agents/onchain_intel/lp_lock.py` for the plan |
| Postgres storage + read-only API | Implemented |
| GeckoTerminal / CoinMarketCap / Solscan | Not started — same `MarketDataConnector` interface, see `agents/market_data/base.py` |
| X / Telegram / Discord / TikTok / YouTube | Not started — see `docs/ARCHITECTURE.md` for why each is harder than Reddit |
| LP lock, holder concentration, dev wallet history, Token-2022 extensions | Not started — the real remaining rug-detection work, see `docs/ARCHITECTURE.md` |
| TA, narrative, risk-aggregation, learning agents | Phase 2 |
| Dashboard | Implemented — static HTML/JS, no build tooling, reads the API directly. See `services/dashboard/` |
| Technical analysis (SMA/EMA/RSI/MACD/momentum/volatility) | Implemented — pure-Python, computed from stored price snapshots, see `agents/technical_analysis/`, wired into the dashboard's detail panel |
| Render Blueprint (`render.yaml`) | Implemented — free web service + free static dashboard + free Postgres; collectors run in-process on this topology, see `services/api/inprocess_collectors.py` |
| Everything wallet/execution related | Phase 4+, deliberately not started |

## Quickstart

```bash
cp .env.example .env
# fill in REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET: https://www.reddit.com/prefs/apps
# COINGECKO_API_KEY and BIRDEYE_API_KEY are optional but recommended (both free)

docker compose up --build
```

Then:
- Open **http://localhost:8080** for the dashboard
- `GET http://localhost:8000/tokens` — tracked tokens + latest price
- `GET http://localhost:8000/tokens/solana/{address}/history` — price history for one token
- `GET http://localhost:8000/tokens/solana/{address}/safety` — live mint/freeze authority check + risk score
- `GET http://localhost:8000/tokens/solana/{address}/technical` — SMA/EMA/RSI/MACD/momentum/volatility
- `GET http://localhost:8000/social/mentions` — recent Reddit mentions
- `GET http://localhost:8000/health`

## Hosting on Render (free tier)

1. Push this repo to GitHub.
2. In Render: **New +** → **Blueprint** → connect the repo. Render reads `render.yaml` and provisions the database, API, and dashboard together in one flow.
3. It'll prompt for `COINGECKO_API_KEY`, `BIRDEYE_API_KEY`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` — fill in what you have, leave the rest blank for now.

Two honest tradeoffs of the free tier, not bugs:
- **No free background workers** (confirmed on Render's own community forum), so both collectors run *inside* the API process instead of as separate services — see `services/api/inprocess_collectors.py`. The free web service spins down after 15 minutes idle, and collection pauses with it, picking back up (from then on, not retroactively) once something wakes it. Ping `/health` every ~10 minutes from a free uptime service (cron-job.org, UptimeRobot) if you want it running continuously instead.
- **Free Postgres is deleted after 30 days**, not just paused. Swap `DATABASE_URL` for a free Neon or Supabase connection string instead if you'd rather it not expire — nothing else in the app changes.

## Running tests

```bash
pip install -r requirements.txt
pytest -v
```

Every test runs against mocked HTTP responses, a fake Reddit client, or
an in-memory SQLite DB — no real API keys or network access needed to
run the suite. (These haven't been executed inside the sandbox this was
built in, since that environment has no network access to install
dependencies — run them in your own environment or CI before trusting
the connectors further. Every file was syntax-checked with
`python -m compileall`, which catches typos but not logic errors, so
`pytest -v` is a real next step, not a formality.)

## Design notes

- **Why these three sources first**: DexScreener needs no API key and is
  strong for new/low-cap Solana tokens; CoinGecko covers established
  tokens broadly; Reddit is the most accessible social source (free,
  official OAuth API, well-maintained Python client). Everything else in
  the original spec is real work, just not v1.
- **Why no dashboard yet**: better to confirm the data is worth looking
  at before spending time on how it's displayed.
- **Reddit's terms, specifically**: free tier is ~100 req/min and is
  *personal/non-commercial use only*. Reddit's Data API terms also
  prohibit training ML models on this content without a separate
  license — fine to use as a live signal for this agent, not fine to
  fine-tune a model on. If this ever becomes a product for other users,
  re-check Reddit's commercial terms first.
- **Idempotency**: both collectors are safe to restart — tokens are
  upserted by (chain, address), social mentions by (platform,
  external_id), so re-running collection doesn't duplicate rows.

## Next steps, roughly in order

1. Run it for real: get the free API keys above, `docker compose up`,
   confirm `pytest` passes, watch a few collection cycles land in
   Postgres and show up on the dashboard.
2. Verify Birdeye's `fetch_token` field mapping against a real response
   (it's currently inferred, not confirmed — see the connector's
   docstring) and fix any field names that don't match.
3. LP lock status is the one deliberately-unfinished piece of the
   on-chain agent (`agents/onchain_intel/lp_lock.py` raises
   `NotImplementedError` with the real plan documented) — needs per-DEX
   pool discovery, genuinely harder than the checks that exist.
4. Narrative/risk-aggregation/learning agents — Phase 2, "trade
   recommendations," still no wallet involved.
5. If Render's free Postgres 30-day expiry becomes annoying, swap in a
   Neon or Supabase free connection string — one env var, nothing else
   changes.
