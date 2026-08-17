---
title: "DSH Multi-Agent Concurrency: What Actually Works (and What Burns Tokens)"
date: 2026-08-17
slug: "dsh-multi-agent-concurrency"
tags: ["deepseek-harness", "multi-agent", "concurrency", "subagents", "workflow", "orchestration"]
status: "published"
excerpt: "DSH makes spawning parallel agents easy, but easy to start isn't the same as worth running. A field-notes look at DSH's concurrency model: what fans out cleanly, what breaks, and how to keep token spend sane."
---

DeepSeek Harness is built around plugins, and one of the first things people do once they realize that is spawn a pile of agents and let them work at once. The tooling makes that genuinely easy. Whether it's a good idea is a different question, and the answer depends almost entirely on the shape of the work.

This is a field-notes post, not a spec sheet. It's what I've found actually holds up in practice when you run several DSH agents in parallel.

## How DSH actually runs things in parallel

DSH gives you a few different concurrency primitives, and they behave differently:

- **Subagents** run in the background by default. You delegate a self-contained task, get a durable handle back, and a notice lands when the work settles. A subagent has its own context window — it doesn't bloat the parent's, but the token bill still adds up across all of them.
- **Workflows** are the big lever: a small script that fans work out across many subagents in phases. `parallel()` is a barrier — it waits for every branch before continuing. `pipeline()` streams items through stages with no barrier, so a slow item doesn't hold up the rest.
- **Goals** are one long-running objective that continues across rounds, sequential by design.
- **Ralph** opens a fresh agent each round, with no conversation carried over.

The important distinction is between *spawning* (cheap) and *coordinating* (expensive). Most of the failure modes live on the coordinating side.

## What genuinely parallelizes

Work that is embarrassingly parallel — no shared state, independent inputs, structured outputs — fans out beautifully:

- **Research fan-out.** Split one question into five angles, one subagent each, merge the notes. The five don't need to talk to each other.
- **Per-file or per-module review.** One subagent per module reads the code and returns findings. Nothing writes anything.
- **Adversarial verification.** One agent writes a plan or a patch, a second tries to break it, a third checks the claims against sources. The tension is the point.

In all three, each branch produces text and returns it. There's no shared file to fight over, and that's exactly why they work.

## Where it falls apart

The failure modes are consistent enough that they're worth listing outright:

**Shared workspace contention.** Two agents writing the same file is a last-write-wins race. It looks fine until one agent's edit silently vanishes. The rule that fixes it: one writer, many readers.

**Cost multiplies.** Ten agents each carrying a few thousand tokens of context is ten times the spend of one. DSH's pricing is also time-of-day on the DeepSeek side — the 09:00–12:00 and 14:00–18:00 Beijing windows cost more. A big fan-out at the wrong hour is how you burn through a balance in an afternoon.

**Barriers wait for the slowest.** A `parallel()` phase finishes when the last branch finishes. One stuck agent — a flaky network call, an approval prompt nobody answered — stalls the whole phase.

**Non-determinism.** Scheduling order isn't guaranteed, so two identical runs can produce slightly different merges. That's fine for research, annoying for anything you want reproducible.

**Approvals don't parallelize.** Every approval is a serial human checkpoint. Fanning out doesn't help if the work is gated on your click; it just queues up more prompts.

## Patterns worth copying

- **Fan out, then merge.** Many subagents produce structured results; exactly one agent merges. The merge step is sequential and cheap.
- **Bound the fan-out.** Three to five branches get most of the benefit without the coordination tax. Fifty agents is usually a statement, not a strategy.
- **One writer, many readers.** Designate a single owner for each file or artifact. Everyone else returns text.
- **Use barriers only when you need all results.** If stages are independent, pipeline them. If you need the full set before the next step, that's when a barrier earns its keep.
- **Run heavy fan-out off-peak.** The lunch window and after 18:00 are the cheap hours. Batch the big parallel jobs there.

## The verdict

DSH's concurrency is real and useful — for the right shape of work. The bottleneck is almost never the spawning; it's coordination, shared state, and cost. Start with two to four parallel subagents on an embarrassingly parallel task, measure the token spend and the merge quality, and only then scale.

If you're setting up your first multi-agent run, the [quick start](/docs/en/guide/quick-start) gets a single agent going, and the [best practices](/docs/en/guide/best-practices) cover the hygiene side. There are also [Workflow & Automation plugins](/plugins?category=workflow-automation) in the directory if you'd rather compose than script. And if you're still deciding whether DSH is even the right runtime for this, the [comparison with Claude Code, Codex, and friends](/blog/deepseek-harness-vs-other-agents) covers that ground.
