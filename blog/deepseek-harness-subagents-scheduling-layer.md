---
title: "DeepSeek Harness turns Claude Code and Codex into sub-agents — and claims the scheduling layer"
date: 2026-08-22
slug: "deepseek-harness-subagents-scheduling-layer"
tags: ["deepseek-harness", "subagents", "claude-code", "codex", "orchestration", "dsh"]
status: "published"
excerpt: "The most consequential DSH move this week isn't a feature — it's positional. Harness now runs Claude Code and Codex as sub-agents, positioning itself as the scheduling layer above every agent."
---

The most consequential thing DeepSeek Harness did this week wasn't a feature. It was a positioning move: Harness can now run **Claude Code** and **Codex** as sub-agents. That single capability re-frames what DSH is — not a competitor to those tools, but the layer *above* them.

## What "sub-agent" means here

In DSH's model, "everything is a plugin" extends all the way to other agents. The same sub-agent machinery you'd use to spawn a fresh DSH child can now hand a task to a Claude Code or Codex backend instead. You write the orchestration once; the work runs wherever it runs best.

There's even community tooling pushing the idea further — unified sub-agent delegation across native spawn/fork plus Claude Code, Codex, Grok, and ACP bridges.

## The "scheduling layer" thesis

This is the strategic bet, and it's worth naming plainly: **whoever schedules the agents owns the layer above the models.** Models are commodities-in-motion; agents are where the work happens; but the *coordination* — deciding who does what, with what context, under what trust boundary — is the high-value seat.

DSH is explicitly going for that seat. It doesn't need to be better than Claude Code at coding or better than Codex at cloud sandboxes. It needs to be the place you compose them from.

## Why this is smart

- **Reuse instead of rebuild.** Claude Code's terminal coding and Codex's cloud sandbox are years of work. A scheduler inherits them for free.
- **Best tool for the job.** A single workflow can route to the agent that fits — coding to Claude Code, batch repo edits to Codex, internal steps to native DSH children.
- **Model-agnostic by construction.** Since the child agents bring their own models, DSH stays neutral about which model wins underneath.

## The honest caveats

Orchestration isn't free. Every delegation adds a hop: context marshalling, credential handling, and the trust question of letting one agent drive another. And the "no kernel, everything is a plugin" design that makes this possible is also what critics call its complexity tax. A scheduler is only as good as its failure modes — if a sub-agent hangs or misbehaves, the orchestrator owns it.

## The takeaway

Running Claude Code and Codex as sub-agents is the clearest signal yet of what DSH is building toward: not "another coding agent", but the **scheduling layer** of the agent era. If you've been comparing DSH to Claude Code feature-by-feature, you've been asking the wrong question. The interesting question is which one ends up *inside* the other.
