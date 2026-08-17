---
title: "DeepSeek Harness vs Claude Code, Codex, WorkBuddy, Manus, and OpenClaw: What's Actually Different?"
date: 2026-08-15
slug: "deepseek-harness-vs-other-agents"
tags: ["deepseek-harness", "ai-agents", "comparison", "claude-code", "codex", "manus", "openclaw"]
status: "published"
excerpt: "A one-line answer to what separates DeepSeek Harness from Claude Code, OpenAI Codex, Tencent WorkBuddy, Manus, and OpenClaw: they don't live on the same axis at all."
---

New agent names show up every week: Claude Code, Codex, WorkBuddy, Manus, OpenClaw. When DeepSeek Harness (DSH) landed, the obvious question followed — **how is it different from all of them?**

This post answers that from a more fundamental angle: **these tools don't sit on the same layer**. DSH is a composable, self-modifiable agent runtime. Most of the rest are finished products, closed or only semi-open.

## The short version: different axes

- **DeepSeek Harness** is the framework itself. Tools, sandbox, approval flow, subagents — all assembled from Cordis plugin rows, and even the runtime hosting the agent is open to modification.
- **Claude Code / Codex** are coding products: one in your local terminal, one in a cloud sandbox. Both exist to write code, and the vendor draws the extension boundary.
- **WorkBuddy / Manus** are task products: one drives your desktop, one hands off general tasks to a cloud agent and returns the deliverable.
- **OpenClaw** is a personal assistant: self-hosted, always on, managing your life and devices over messaging channels.

One line: other products hand you an agent **in a box**. DSH hands you the agent **in parts**.

## Six agents, side by side

| Axis | DeepSeek Harness | Claude Code | OpenAI Codex | WorkBuddy (Tencent) | Manus | OpenClaw |
|------|------------------|-------------|--------------|---------------------|-------|----------|
| Shape | Programmable agent framework + Web GUI | Terminal CLI | Cloud coding agent | Desktop app | Cloud autonomous agent | Open-source assistant framework |
| Where it runs | Local Node process + browser UI | Local terminal | OpenAI cloud sandbox VM | Your desktop | Cloud VM (E2B) | Self-hosted gateway, always on |
| Main job | General agent building & orchestration | Writing code | Repo-scale code | Office automation, driving the OS | General research & delivery | Personal life tasks |
| Extension model | Cordis plugin rows, versioned + approved + rollback | Hooks, subagents, skills, MCP, plugins | Closed, product updates only | Visual task flows, low-code | Closed, plus an API platform | Plugins, skills, channel integrations |
| Security model | Local file sandbox + stepped approval escalation | Local permission prompts | Cloud isolation + git sync | Desktop permission control | Cloud sandbox isolation | Self-hosted, channel-level control |
| Open source | ✅ | ❌ (CLI free, models paid) | ❌ | ❌ | ❌ | ✅ |

## Breaking each one down

### DeepSeek Harness: the runtime you can rewrite

DSH's philosophy is "everything is a plugin row": file tools, sandbox, approval stack, model routing, the subagent registry — each is one line in `cordis.yml`. A session is assembled from a **Host composition** (persistent, cross-session services like storage and sandbox) and an **Agent Preset** (the tools, persona, and prompts mounted per session).

Three mechanisms set it apart:

1. **A dynamic plugin lifecycle**: define → run → update → rollback → undefine temporary plugins mid-session. Packages are immutable and versioned, and client-side code needs your approval (single check = this version only, double check = authorize future versions). Nobody else offers that combination of in-runtime extension plus audit.
2. **A two-plane architecture**: Host (the Node process handling files, network, commands, and model tools) and Client (the browser GUI handling themes, slot UI, and page state), with clean separation of responsibilities.
3. **Four orchestration primitives**: long-running Goals in the same session, Subagents (forkable to inherit context), Workflows (scripted large-scale fan-out), and Ralph (fresh-context iteration loops).

The deeper point is **framework reflexivity**: the Harness source checkout lives on your machine, so you can read and edit your own presets and compositions. In other products the tool set is fixed by the vendor; in DSH it's a config file you own. [GitHub repo](https://github.com/deepseek-ai/deepseek-harness) | [Architecture breakdown](https://www.163.com/dy/article/L4AHS9B70518R7MO.html)

### Claude Code: closest cousin, different job

Anthropic's terminal coding tool runs locally, edits your files, and executes shell commands. Extension comes from [hooks, subagents, skills, MCP, and plugins](https://code.claude.com/docs/en/features-overview), plus the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) for developers.

The difference: Claude Code is a **CLI product for coding tasks**, and its extensions are **hook-style** (intercept events, add tools via MCP). DSH is a **general agent runtime**, and its extensions are **compositional** (capability = plugin row, session = preset assembly), with dynamic plugins, version rollback, and a Node + browser dual platform. Claude Code is great at **writing code**; DSH is built for **assembling agents**.

### OpenAI Codex: the coding agent in a cloud sandbox

Codex runs tasks in parallel inside OpenAI-managed cloud VMs, syncs your repo through git (triggered by GitHub PRs and issues), and never executes directly on your machine. A parent task can spawn child tasks (delegation). It ships as a CLI, an IDE extension, and a web app. [Codex handbook](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/) | [Codex vs Claude Code](https://www.superblocks.com/blog/codex-vs-claude-code)

The difference: Codex is a closed cloud product centered on the repo, with the sandbox in the cloud and internals you can't touch. DSH runs in a local process, with sandbox policy you can see and configure and every tool and orchestration path open source.

### WorkBuddy (Tencent): the visual desktop agent

Tencent's productivity agent is a desktop app built around "AI operating your computer": moving the mouse, driving the browser, organizing files. It bundles an AI-native knowledge base, uses visual task flows (Vibe Working) for orchestration, and offers team collaboration in the enterprise tier. [Tencent Cloud techpedia](https://www.tencentcloud.com/techpedia/145043) | [iFanr hands-on](https://www.ifanr.com/1671739)

The difference: WorkBuddy targets **office users** with low-code, point-and-click interaction, and its object is the GUI desktop. DSH targets **developers**, expresses everything in code and config, and its object is the agent runtime itself.

### Manus: the hands-off general task agent

Manus focuses on autonomous general tasks: web search, browser control, running code in an Ubuntu sandbox, a VS Code environment, and internal multi-agent collaboration. It runs asynchronously and delivers a report, spreadsheet, or site when done, and it has opened an API platform in recent years. [Architecture analysis](https://sahin.io/blog/how-manus-built-an-ai-agent-platform) | [E2B sandbox mechanics](https://e2b.dev/blog/how-manus-uses-e2b-to-provide-agents-with-virtual-computers) | [Heise review](https://www.heise.de/en/background/The-Chinese-AI-agent-Manus-brings-web-search-Ubuntu-sandbox-and-VS-Code-10364463.html)

The difference: Manus is a **task finisher** — give it a goal, it completes it in the cloud and returns a result, with the process a black box. DSH is a **runtime** — the process and every capability are transparent, auditable, and rollback-able.

### OpenClaw (formerly Clawdbot/Moltbot): the open-source life assistant

A self-hosted, always-on assistant: one gateway running 24/7, plugged into WhatsApp, Telegram, Discord, and more, able to control computers and phones, automate a browser, take voice input, and keep cross-session memory — a personal Jarvis. It has been renamed Clawdbot → Moltbot → OpenClaw. [DigitalOcean guide](https://www.digitalocean.com/resources/articles/what-is-openclaw) | [Milvus explainer](https://milvus.io/zh/blog/openclaw-formerly-clawdbot-moltbot-explained-a-complete-guide-to-the-autonomous-ai-agent.md) | [O'Reilly review](https://www.oreilly.com/radar/what-openclaw-reveals-about-the-next-phase-of-ai-agents/)

The difference: OpenClaw's territory is **personal life and messaging channels** (replying, scheduling, controlling devices); DSH's territory is **software development and agent building**. One is bounded by channels and devices, the other by plugins and sessions.

## How to choose, in one line each

- Want AI to **do work for you** (office tasks) → WorkBuddy / Manus
- Want AI to **write code in your terminal** → Claude Code
- Want AI to **batch-edit repos in the cloud** → Codex
- Want a **personal assistant for life** → OpenClaw
- Want an **agent framework you can take apart, modify, assemble, approve, and roll back** — one where the framework itself is the thing you build on → DeepSeek Harness

## Wrapping up

The agent space is splitting in two: on one side, increasingly "ready out of the box" task products; on the other, increasingly programmable runtimes. DeepSeek Harness is clearly betting on the latter, treating composability, auditability, and rollback as first-class concerns. If you want to start from zero, the [quick start](/docs/en/guide/quick-start) is the fastest way in; if you want to go deeper on a specific plugin or practice, keep browsing [Oh! dsh](/docs/en/index).
