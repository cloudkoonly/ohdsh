---
title: "DeepSeek Harness v0.1.0-rc.8: multimodal commands, persistent PowerShell, and the SQLite rewrite"
date: 2026-08-20
slug: "deepseek-harness-v0-1-0-rc8"
tags: ["deepseek-harness", "release", "dsh"]
status: "published"
excerpt: "rc.8 expands multimodal input across slash commands, ships persistent PowerShell on Windows, turns Claude Code and Codex into installable bundles, and rewrites the SQLite storage layer with an incompatible format change."
---

Three days after rc.7, **v0.1.0-rc.8** drops — and this one has more surface area than usual. The headline is multimodal everywhere, but the real story is that DSH is starting to treat Windows and plugin distribution as first-class concerns rather than afterthoughts.

## New features

### Multimodal is no longer gated to chat

The DeepSeek model adapter now accepts a config flag to enable native image requests. That alone is plumbing — what matters is where images flow: `/goal`, `/plan`, and other slash commands can now take image+text input, and the `@` menu lets you reference files and past conversation turns directly.

This closes a gap that's been annoying since rc.5: you could paste an image into chat, but structured commands only understood text. Now you can `/goal` with a screenshot attached and the planner actually sees it.

### Claude Code and Codex as Profile Bundles

Both subagent bridges are now installable on demand via Profile Bundles rather than baked in. Codex additionally supports a non-interactive permission mode (useful for CI-like pipelines) and named instances (run multiple Codex agents scoped to different repos simultaneously).

The bundle approach is the right call. Not everyone needs these bridges — and distributing them as bundles means they follow the same install/update lifecycle as plugins. One less special case in the architecture.

### Persistent PowerShell on Windows

Windows PTY terminals now support persistent PowerShell sessions, and the Minimal preset enables this by default. Before this, every tool call that shelled out started a fresh session, losing environment variables, working directory, and any background context. Now it behaves like an actual terminal.

If you're on Windows, this is probably the single biggest quality-of-life improvement in the entire rc cycle.

## Bug fixes worth knowing

- **Oversized image payloads** — Images that exceeded size limits or accumulated across a long session no longer crash the model request. The adapter truncates or evicts gracefully.
- **Cancelled stream prefixes lost** — If you cancelled a streaming response, the partial text that was already visible got dropped from follow-ups and forks. Fixed: the displayed prefix is now preserved in context.
- **Custom OpenAI-compatible gateways** — Some gateways with slightly non-standard request shapes (or that omit reasoning content in responses) stopped working. Both issues are patched.

## Improvements that compound

A list of small things that collectively make the tool feel more polished:

- **Layout**: home paths display as `~`, composer doesn't break on narrow viewports, feedback UI cleaned up.
- **UI interactions**: sidebar search grabs focus properly, workflow panel actions are snappier, model selector highlights correctly, failed local file opens can be retried.
- **Tool calls**: `web_search` fires queries concurrently; subagent `reportDelivery` now wakes the parent task immediately instead of waiting for a poll cycle.
- **Install & startup**: smaller dependency download, `dsh web` auto-opens your browser.
- **Fork performance**: forking a session with a large history is meaningfully faster.

## The breaking change: SQLite storage format

The SQLite backend got a rewrite that improves read, write, and fork performance while shrinking storage size. The trade-off: **the storage format is incompatible with rc.7.** Old sessions won't load. If you rely on conversation history, export before upgrading.

This is the kind of change that's painful now and invisible in a month. The old format wasn't designed for fork-heavy workflows, and it showed — fork latency scaled linearly with history length. The new layout is append-friendly and deduplicates shared prefixes.

## Other notes

- **Brand usage guidelines**: "DeepSeek Harness" is now a registered trademark with published usage rules. If you're writing about DSH in docs or marketing, check the guidelines.
- **Python SDK**: Runtime configuration now covers all four built-in Agent Presets, plus the dependencies for `rg`/`glob` search and MCP stdio tools. Less "install this extra thing" friction for SDK users.

## The bigger picture

rc.8 is where DSH stops feeling like a Linux-first tool that tolerates Windows. Persistent PowerShell, proper image handling across the command surface, and the bundle distribution model for subagents — these are choices that say "we expect people to actually use this in production on every platform."

The SQLite break is bold for a release candidate, but the performance ceiling of the old format was going to bite sooner or later. Better to break now while the user base is still in "early adopter expects turbulence" mode.

## Try it

- Grab the release: [GitHub releases](https://github.com/deepseek-ai/deepseek-harness/releases)
- Start here: [Quick start](/docs/en/guide/quick-start)
