---
title: "DeepSeek V4.1 Flash is live: what the benchmarks show, and where it still trails V4 Pro"
date: 2026-09-10
slug: "deepseek-v4-1-flash"
tags: ["deepseek", "v4.1", "deepseek-flash", "model-release", "benchmarks", "agents"]
status: "published"
excerpt: "DeepSeek's new 552B-parameter multimodal model is the smallest member of a new architecture family, and it is being placed above the company's own flagship. The agentic gains are large. The knowledge benchmarks went the other way."
---

DeepSeek released V4.1 Flash on September 10, together with an unusual claim: the smallest model in its new architecture family performs better than its own flagship. The company says V4.1 Flash beats V4 Pro on performance, cost, speed and total runtime, and it is acting on that conclusion — starting 12:00 Beijing time on September 14, requests to `deepseek-v4-pro` will be routed to V4.1 Flash and billed at Flash rates, until a V4.1 Pro model ships. V4 Flash and V4 Flash Vision Exp are already retired, with their API names temporarily routed to the new model for compatibility.

That is a strong thing for a lab to say about its own flagship line, and it is worth separating what DeepSeek measured from what outside evaluators have found so far.

## What shipped

V4.1 Flash is a 552B-parameter mixture-of-experts model built on a new Causal Encoder-Decoder architecture, with asymmetric activation: 8B parameters active during input processing, 16B during output. DeepSeek describes it as a new base model rather than a refresh of V4 Flash — 45 trillion tokens of from-scratch pretraining, sparse attention trained at 64K context and extended to 1M, and reinforcement learning post-training at a larger scale than the previous generation.

Other specifications from the model card and release notes:

- Native multimodal input. The vision encoder is trained jointly with the language model from pretraining rather than bolted on afterwards.
- A 1M-token context window, and a `reasoning_effort` parameter adjustable from 1 to 100.
- Weights on Hugging Face under an MIT license, plus a technical report. DeepSeek is inviting large-scale deployment partners, and its note mentions a 2,000-GPU cluster with storage as the scale it has in mind.
- Official integrations with Tencent's WorkBuddy and CodeBuddy, and with OpenCode.

## The cache work is the part with the widest effect

DeepSeek's architecture notes spend more space on memory than on benchmark scores, and for agent workloads that is where the money is. The decoder reuses the encoder's final hidden states for global KV rather than keeping a per-layer global cache; sliding-window states are rebuilt from the most recent window instead of being persisted; and an FP4 KV cache brings global storage to roughly 890 bytes per token. Compared with V4 Flash, DeepSeek reports the new model needs a quarter of the HBM and an eighth of the SSD capacity, and that its KV cache is 437 times smaller than its first-generation model.

KV cache size matters because cache-hit charges are a large share of the cost of long-running agents. The prices that took effect at 12:00 Beijing time on September 10 reflect that: off-peak rates of ¥0.02 per million cache-hit tokens, ¥1 per million cache-miss tokens and ¥4 per million output tokens, with peak rates double and weekends billed off-peak. Reported dollar rates are $0.003, $0.15 and $0.60 per million tokens respectively. We covered the pricing decision in more detail [in this post](/blog/deepseek-flash-price-cut); what is new today is that those rates now belong to a model DeepSeek also publishes as open weights.

## What the benchmarks show

DeepSeek's chart reports large agentic gains from V4 Flash to V4.1 Flash, using maximum reasoning effort at temperature 1.0:

| Evaluation | V4 Flash | V4.1 Flash |
|---|---|---|
| Terminal-Bench 2.1 (Pass@1) | 82.7% | 90.6% |
| DeepSWE v1.1 (resolved) | 54.4% | 74.2% |
| CyberGym (Pass@1) | 76.7% | 88.1% |
| AutomationBench (Pass@1) | 37.7% | 54.8% |
| HLE with tools (Pass@1) | 51.5% | 63.9% |

Reading these requires noting how they were produced. The code-agent results use DeepSeek's own minimal DeepSeek Harness scaffold with a 1M-token context, and the visual-agent tasks use Claude Code with 512K context. Those are legitimate choices, but they mean the numbers include the scaffold, not only the model.

Outside results so far are mixed but not contradictory. A BridgeBench run spent 23.5 million tokens on a single task at 344 tokens per second, for $0.33 — a useful illustration of both the throughput and how cheaply a long agent session can run at these rates. One frozen visual comparison moved from 0 of 4 tasks to 3 of 4. A vendor-side security evaluation reported a small improvement in tool calls per turn and more persistence when an initial scope came up empty.

## Where V4.1 Flash is behind V4 Pro

The same DeepSeek table shows the new model losing to V4 Pro on several base-model evaluations:

| Evaluation | V4 Pro | V4.1 Flash |
|---|---|---|
| SimpleQA-Verified | 55.2% | 42.3% |
| LongBench-V2 | 51.5% | 45.2% |
| HLE without tools | 42.7% | 36.8% |

The pattern is consistent with the architecture: agentic tasks that reward long tool-use trajectories look strong, while factual recall, long-document reasoning without tools, and knowledge-heavy question answering look weaker. DeepSeek labels these base-model evaluations under the same internal settings, so they are its own measurements, not an external verdict. But they are the company's own numbers, and they matter to anyone whose workload is knowledge-heavy rather than agentic. The retirement of V4 Pro is a migration with a real cost if you are in that group.

Third-party variance also runs wider than vendor charts suggest. One engineering evaluation reported a 16.77-point drop when the model was moved into DeepSeek Harness, along with functional correctness of 78 against Qwen 3.8 Flash at 82. Harness sensitivity of that size is not unique to this release, but it is a reminder that the scaffold, context budget and effort setting are part of the measurement.

## What to take from it

The claim that a smaller, cheaper model beats a larger flagship is credible for the workloads DeepSeek is optimizing for, and those are agentic ones. Benchmarks like Terminal-Bench, AutomationBench and DeepSWE reward sustained tool use and long-horizon execution more than stored knowledge, and an asymmetric encoder-decoder with a small active parameter count is a plausible way to serve that economically. The cache compression reinforces the same direction: it lowers the cost of the session lengths agents actually use.

For anyone already running V4 Flash, the migration is mostly mechanical, and the compatibility routing gives room to test. For teams running V4 Pro against knowledge-heavy work, the September 14 reroute is a forced change, and the numbers above suggest evaluating before, not after, it lands. And for everyone: the model card is the vendor's own instrument. The measurement that counts is the one taken in your harness, at your context length, on your tasks.

Two things to watch next. Whether independent evaluations reproduce the agentic gains outside DeepSeek's scaffold, and whether V4.1 Pro closes the knowledge gap the company has now published about its own model.
