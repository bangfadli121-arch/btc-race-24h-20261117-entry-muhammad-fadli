import { runBars } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';

// Tunable strategy parameters (per-mille where noted).
const ENTRY_RET_PM = 10; // 30-bar return needed to enter, per mille (10 = 1.0%)
const TP_PM = 30; // take profit vs entry, per mille (30 = 3.0%)
const TRAIL_PM = 15; // trailing stop vs peak, per mille (15 = 1.5%)
const SL_PM = 15; // stop loss vs entry, per mille (15 = 1.5%)
const MAX_HOLD = 360; // max bars held
const COOLDOWN = 60; // bars to wait after an exit before re-entering
const WARMUP = 240; // closes needed before first entry
const LOOKBACK = 30; // bars for the entry momentum return
const FADE_ON = 1; // 1 = exit on fade (close < EMA8 and < peak*0.995), 0 = no fade exit
const FADE_PM = 4; // fade: close must be this many per-mille below peak to count as fade

const closes: bigint[] = [];
let ema8: bigint | null = null;
let ema21: bigint | null = null;
let pending: 'buy' | 'sell' | null = null;
let wasLong = false;
let peak = 0n;
let entryClose = 0n;
let entryBar = -1;
let lastExitBar = -1_000_000;

await runBars({
  onBatch(state, batch) {
    const position = state.positions.get(SYMBOL);
    const isLong = position !== undefined;
    if (wasLong && !isLong) lastExitBar = batch.seq;

    const bar = batch.bars.find((candidate) => candidate.symbol === SYMBOL);
    if (bar === undefined) {
      wasLong = isLong;
      return [];
    }

    const close = BigInt(bar.c);
    closes.push(close);
    ema8 = ema8 === null ? close : (2n * close + 7n * ema8) / 9n;
    ema21 = ema21 === null ? close : (2n * close + 20n * ema21) / 22n;

    if (pending !== null) pending = null;

    if (isLong && !wasLong) {
      entryClose = close;
      entryBar = batch.seq;
      peak = close;
    }
    if (isLong && close > peak) peak = close;

    if (!state.warmingUp && batch.seq < 1439) {
      if (isLong) {
        const fade = FADE_ON === 1 && ema8 !== null && close < ema8 && close * 1000n < peak * (1000n - BigInt(FADE_PM));
        const shouldExit = close * 1000n <= peak * (1000n - BigInt(TRAIL_PM))
          || close * 1000n <= entryClose * (1000n - BigInt(SL_PM))
          || close * 1000n >= entryClose * (1000n + BigInt(TP_PM))
          || batch.seq - entryBar >= MAX_HOLD
          || fade;
        if (shouldExit && pending === null) {
          pending = 'sell';
          wasLong = true;
          return [{ side: 'sell', symbol: SYMBOL, qty: position.qty, max_slippage_bps: 150 }];
        }
      } else if (pending === null && closes.length >= WARMUP && batch.seq - lastExitBar >= COOLDOWN
        && ema8 !== null && ema21 !== null && close > ema21 && ema8 > ema21) {
        const oldClose = closes[closes.length - 1 - LOOKBACK];
        if (oldClose !== undefined && close * 1000n >= oldClose * (1000n + BigInt(ENTRY_RET_PM)) && state.cash > 0n) {
          pending = 'buy';
          wasLong = false;
          return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: state.cash, max_slippage_bps: 150 }];
        }
      }
    }

    wasLong = isLong;
    return [];
  },
});
