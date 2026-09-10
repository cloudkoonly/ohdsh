---
title: "DeepSeek cuts Flash prices by up to 60% — and the cache-hit line is the real story"
date: 2026-09-10
slug: "deepseek-flash-price-cut"
tags: ["deepseek", "pricing", "deepseek-api", "v4", "agents", "cost"]
status: "published"
excerpt: "A month after raising prices, DeepSeek is cutting them: from September 10, Flash cache-hit input drops to ¥0.02 per million tokens (down 60%). Output falls just 11% — which tells you where the savings really are."
---

Less than a month after raising API prices, DeepSeek is cutting them again. The company announced that from **September 10, 2026, 12:00 Beijing time**, the Flash series moves to new pricing — with a headline number of **up to 60% off**.

Here's the table, at off-peak rates (peak is double):

| Item | Before | After | Change |
|---|---|---|---|
| Input — cache hit | ¥0.05 / M tokens | **¥0.02** / M tokens | **−60%** |
| Input — cache miss | ¥1.5 / M tokens | **¥1.0** / M tokens | −33% |
| Output | ¥4.5 / M tokens | **¥4.0** / M tokens | −11% |

Both `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` move to the same rates — the vision model still bills at Flash pricing with no visual surcharge, consistent with how it launched in August ([our post on that release](/blog/deepseek-v4-flash-vision-exp)).

## The 60% headline is really a cache subsidy

Read the three lines separately and the intent is hard to miss:

- **Cached input: down 60%.** This is what you pay for tokens the model has already seen — a stable system prompt, a codebase, a document you keep re-sending. It just got 2.5x cheaper.
- **Uncached input: down 33%.** New material still costs real money, just less of it.
- **Output: down 11%.** The tokens the model *writes* barely moved.

That shape is a targeted discount on **high-reuse agent workloads**: long system prompts, repeated context, retrieval headers, tool schemas, multi-turn sessions that keep re-reading the same prefix. If most of your input is cached, your bill moves a lot. If most of your bill is generated output, this cut is closer to a rounding error.

## The peak/off-peak multiplier still rules

Nothing changes about *when* you run. Peak hours remain weekdays 09:00–12:00 and 14:00–18:00 Beijing time, billed at double the off-peak rate, and weekends are entirely off-peak (the change we covered in [weekends are now all off-peak](/blog/deepseek-weekend-off-peak-pricing)).

Stack the two levers and the cheapest cell in the table is striking: a cached input token on a Sunday now costs **¥0.02 per million** — while the same token at 10am on a Tuesday costs ¥0.04, and the output token that follows it costs ¥8 instead of ¥4.

## A month of pricing whiplash

Line the moves up and the pattern is hard to miss:

- **Mid-August:** peak/off-peak pricing arrives, and reports describe steep increases on some line items (reported at up to 1,100%) — commentary at the time asked whether DeepSeek was [giving up on being the price disruptor](https://finance.sina.cn/2026-08-18/detail-ininthzy0171141.d.html).
- **August 23:** weekends get folded into the cheap tier.
- **September 9–10:** the Flash series gets cut by up to 60%.

The fair reading: the increase overshot, and DeepSeek is walking it back — at exactly the moment a new model is waiting in the wings. Multiple outlets report **V4.1 Flash** is expected around September 10 and is already in internal testing, [reportedly beating V4 Pro across the board](https://www.ithome.com/1/000/222.htm). Cutting prices the same week you ship a model is a familiar play: land the new model on a cheaper meter and make "upgrade" an easy yes for everyone already running Flash. The same week, DeepSeek also [started another large hiring round](https://m.mp.oeeee.com/a/BAAFRD0000202609091662437.html).

## What this means if you build agents

1. **Cache aggressively — it's now the highest-leverage lever you have.** Stable prefixes, deterministic system prompts, tool schemas that don't churn: every token you keep in the cache costs ¥0.02 instead of ¥1. If you've been sloppy about prompt stability, the price list just made that expensive.
2. **Re-run your cost model, because the ratios changed.** Cached input is now 200x cheaper than output (¥0.02 vs ¥4 per million). Context-heavy agents got a real budget cut; generation-heavy agents got a rounding error. Both should re-check, only one should celebrate.
3. **Schedule around the meter.** Batch jobs, backfills, and evals belong in off-peak windows and on weekends — same code, half the price.
4. **Don't over-index on one vendor's price list.** A hike and a 60% cut inside a month is the strongest argument yet for keeping a routing layer that lets you move workloads between providers by task, price, and availability.
5. **Watch for V4.1 Flash.** If it ships at the new Flash rates with better benchmarks, the upgrade decision may be trivially obvious. Test it when it lands — and re-benchmark before assuming the price cut made your choice for you.

## The bottom line

DeepSeek's "up to 60%" is real, but it isn't a 60%-cheaper model — it's a 60%-cheaper *cache*. The bill that falls the most belongs to agents that keep re-reading the same context; the bill that falls least belongs to the ones that mostly write. Know which one you are, then re-run the numbers: for the right workload, this is the cheapest Flash has ever been.
