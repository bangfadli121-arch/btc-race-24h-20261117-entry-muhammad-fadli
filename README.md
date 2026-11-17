# btc-race-24h-20261117-entry-muhammad-fadli

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/bangfadli121-arch/btc-race-24h-20261117-entry-muhammad-fadli/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/bangfadli121-arch/btc-race-24h-20261117-entry-muhammad-fadli/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

BTC Burst Rider v4 — a momentum-burst trading bot for CBBTC: long-only, staying in cash most of the time and making a few full-size trades when momentum confirms a sharp upward move.

## Strategy

- Entry (flat only, after 240 closes, 60 bars since last exit): 30-bar return ≥ +1.0% AND close > EMA21 AND EMA8 > EMA21 → buy with all cash.
- Exit: trailing stop 1.5% from peak, stop-loss 1.5% from entry, take-profit 3%, max hold 360 bars, or fade (close < EMA8 and < peak × 0.996).
- Deterministic, no network, no wall clock, no files outside the repo. Pure stdin/stdout via the kit SDK shim (`vendor/makefun-bars.ts`, copied unchanged from the kit).

## Dev-window grade (kit `btc-race-24h-20261117-0603`, 1,440 bars)

- Net PnL **+2.430878 USDC**, 2 trades, win rate 100%, max drawdown 0.55%, fees 0.80 USDC (at 2x fees still +1.63 USDC).
- Same parameters on the previous race's dev window (15 Nov kit): +10.87 USDC.
- L1 regrade reproduced byte for byte (deterministic).

## Run it

```sh
node cli/makefun.mjs grade-local --kit . --bot <path-to-this-repo> --driver process
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=8y9pksda&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>

---
