---
title: "DeepSeek Harness v0.1.0-rc.7: plugin settings cards, PTC mode, and a smarter Job Panel"
date: 2026-08-17
slug: "deepseek-harness-v0-1-0-rc7"
tags: ["deepseek-harness", "release", "dsh"]
status: "published"
excerpt: "A week after the open-source drop, v0.1.0-rc.7 lands with plugin settings cards, subagents in the Job Panel, durable image attachments, and a low reasoning effort for DeepSeek models."
---

DeepSeek Harness keeps shipping fast. A week after the open-source release, **v0.1.0-rc.7** landed on August 17. It's mostly a quality-of-life release — but a few changes matter more than they look.

## What's new

### Plugins can now register their own settings cards

Until now a plugin's knobs lived in its config file. rc.7 lets a plugin ship its own settings card, so its options show up in the UI where you'd expect them. This is the kind of change that makes the ecosystem feel real: third-party plugins stop being "config you paste into a YAML" and start being "apps you configure in a panel."

### Codex and Claude Code subagents join the Job Panel

Subagent tasks coming from the Codex and Claude Code bridges now surface in the Job Panel, so you can see, collect, and stop them like any other background job. Before, they ran somewhere you couldn't easily watch.

### Durable image attachments for MCP and ACP

MCP and ACP now support persistent image attachments, and PTC mode can forward nested images. For multimodal workflows, images stop being a per-turn throwaway.

## The fixes that matter

- **Persistent Bash latency in minimal mode** — the stutter is gone.
- **Large-history pagination stack overflow** — long sessions no longer blow the stack.
- **max-token truncation no longer kills a session** — you can keep going after the cut.
- **Safari composer cursor misalignment** — the caret finally sits where it should.
- **node-pty 1.2 beta** — broader terminal compatibility.

## Two changes worth a second look

### "Code mode" is now "PTC mode"

The English "Code mode" preset has been renamed "PTC mode." Same preset, clearer name. If your muscle memory still says "Code mode," that's the one.

### DeepSeek models get a `low` reasoning effort

You can now set `low` reasoning effort on DeepSeek models; `high` remains the default. Given the peak/off-peak pricing that just went live, this is worth trying for routine work — reasoning depth is one of the biggest token drivers, and `low` is the cheapest lever you have.

## The bigger picture

rc.7 is less about new capabilities and more about the ecosystem starting to breathe on its own: plugins contributing settings UI, contributors sweeping the long tail of platform bugs. It's still early — but the shape is right.

## Try it

- Grab the release: [GitHub releases](https://github.com/deepseek-ai/deepseek-harness/releases)
- Start here: [Quick start](/docs/en/guide/quick-start)
