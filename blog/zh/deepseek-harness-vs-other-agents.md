---
title: "DeepSeek Harness 与 Claude Code、Codex、WorkBuddy、Manus、OpenClaw 到底差在哪？"
date: 2026-08-15
slug: "deepseek-harness-vs-other-agents"
tags: ["deepseek-harness", "AI Agent", "对比评测", "Claude Code", "Codex", "WorkBuddy", "Manus", "OpenClaw"]
status: "published"
excerpt: "一句话说清 DeepSeek Harness 与 Claude Code、OpenAI Codex、腾讯 WorkBuddy、Manus、OpenClaw 的本质区别：它们其实并不在同一个维度上。"
---

随着 AI Agent 井喷，开发者每天都会看到新名字：Claude Code、Codex、WorkBuddy、Manus、OpenClaw……而当 DeepSeek Harness（DSH）出现时，最常见的问题就是——**它和这些 Agent 到底有什么区别？**

这篇文章试图用一个更本质的角度回答：**这几者根本不在同一个层面上**。DSH 是一个"可拼装、可自改的 Agent 运行时框架"，而其余大多是各自厂商做好的封闭或半开放产品。

## 核心结论：它们不在同一个维度

- **DeepSeek Harness** 是框架本身：你的工具、沙箱、审批流、子代理，全部由 Cordis 插件行组合出来，连承载 Agent 的运行时都可以被修改和扩展。
- **Claude Code / Codex** 是"编码产品"：一个在本地终端、一个在云端沙箱，目标都是替你写代码，扩展边界由厂商划定。
- **WorkBuddy / Manus** 是"任务产品"：一个在桌面替你操作电脑办公，一个在云端放手式完成通用任务并交付结果。
- **OpenClaw** 是"个人生活助理"：自托管、常驻运行，通过消息渠道帮你管生活和设备。

一句话：别的产品把 Agent **装进盒子**交给你用，DSH 把 Agent **拆成零件**让你自己拼。

## 六款 Agent 横向对比

| 维度 | DeepSeek Harness | Claude Code | OpenAI Codex | WorkBuddy（腾讯） | Manus | OpenClaw |
|------|------------------|-------------|--------------|-------------------|-------|----------|
| 形态 | 可编程 Agent 框架 + Web GUI | 终端 CLI 工具 | 云端编码代理 | 桌面应用 | 云端自主 Agent | 开源个人助理框架 |
| 运行位置 | 本地 Node 进程 + 浏览器界面 | 本地终端 | OpenAI 云沙箱 VM | 你的电脑桌面 | 云端 VM（E2B） | 自托管 gateway，常驻运行 |
| 主战场 | 通用 Agent 开发与编排 | 写代码 | 仓库级写代码 | 办公自动化、代操作电脑 | 通用任务研究与交付 | 个人生活事务 |
| 扩展机制 | Cordis 插件行，版本化 + 审批 + 回滚 | Hooks、Subagents、Skills、MCP、Plugins | 封闭，靠产品更新 | 图形化任务流、低代码 | 封闭，另有 API 平台 | 插件、技能、渠道集成 |
| 安全模型 | 本地文件沙箱 + 逐级审批升级 | 本地权限确认 | 云隔离 + git 同步 | 桌面权限控制 | 云沙箱隔离 | 自托管、渠道级控制 |
| 开源 | ✅ | ❌（CLI 免费，模型付费） | ❌ | ❌ | ❌ | ✅ |

## 逐个拆解

### DeepSeek Harness：连框架本身都能改的运行时

DSH 的架构哲学是"一切皆插件行"：文件工具、沙箱、审批栈、模型路由、子代理注册表……每一项能力都是 `cordis.yml` 里的一行插件。整个会话由 **Host 组合**（持久化、沙箱等跨会话共享服务）与 **Agent Preset**（单个会话挂载的工具、人设、提示词）拼装而成。

它还有三个独门机制：

1. **动态插件生命周期**：会话中可以 `define → run → update → rollback → undefine` 临时插件，代码包不可变、按版本切换，客户端代码需用户审批（单勾=仅当前版本，双勾=授权未来版本）。这是其它产品都没有的"运行时内扩展 + 审计"能力。
2. **双平面架构**：Host（Node 进程，管文件、网络、命令、模型工具）+ Client（浏览器 GUI，管主题、Slot UI、页面状态），前后端能力分工清晰。
3. **四种编排原语**：同会话长期 Goal、Subagent（可 fork 继承上下文）、Workflow（脚本化大规模扇出）、Ralph（全新上下文迭代循环）。

更关键的是**框架自反性**：Harness 源码在本地就有 checkout，你可以读改自己的 Agent Preset 与组合——别的产品里"工具集"是厂商写死的，在 DSH 里它只是一份你可以编辑的配置。[GitHub 仓库](https://github.com/deepseek-ai/deepseek-harness)｜[架构拆解](https://www.163.com/dy/article/L4AHS9B70518R7MO.html)

### Claude Code：最接近的同类，但定位不同

Anthropic 出品的终端编码工具，本地运行、直接修改你的文件系统、执行 shell 命令。扩展靠 [Hooks、Subagents、Skills、MCP、Plugins](https://code.claude.com/docs/en/features-overview)，还有面向开发者的 [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)。

与 DSH 的区别在于：Claude Code 是"面向编码任务的 CLI 产品"，扩展是**挂点式**（hook 拦截事件、MCP 加工具）；DSH 是"通用 Agent 运行时"，扩展是**组合式**（能力=插件行，会话由 preset 拼装），且支持动态插件、版本回滚、Node + 浏览器双平台。可以说 Claude Code 擅长**写代码**，DSH 擅长**搭 Agent**。

### OpenAI Codex：云端沙箱里的编码代理

Codex 在 OpenAI 托管的云 VM 中并行执行任务，通过 git 同步你的仓库（GitHub PR/issue 触发），本地不直接执行命令；父任务可以派生子任务（delegation）。提供 CLI、IDE 插件和 Web 端。[Codex 手册](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/)｜[Codex 与 Claude Code 对比](https://www.superblocks.com/blog/codex-vs-claude-code)

与 DSH 的区别：Codex 是封闭云产品，以"仓库"为中心，沙箱在云端，内部机制不可改；DSH 在本地进程运行，沙箱策略可见可配，工具与编排逻辑全部开源。

### WorkBuddy（腾讯）：图形化桌面办公 Agent

腾讯的效率智能体，桌面应用形态，主打"AI 替你操作电脑"：控制鼠标键盘、操作浏览器、整理文件，内置 AI 原生资料库，用图形化任务流（Vibe Working）编排，企业版支持团队协同。[腾讯云技术百科](https://www.tencentcloud.com/techpedia/145043)｜[爱范儿上手体验](https://www.ifanr.com/1671739)

与 DSH 的区别：WorkBuddy 面向**办公用户**，低代码、鼠标点击式交互，操作对象是 GUI 桌面；DSH 面向**开发者**，一切以代码和配置表达，操作对象是 Agent 运行时本身。

### Manus：云端"放手式"通用任务 Agent

主打通用自主任务：网页搜索、浏览器操作、Ubuntu 沙箱内执行代码、VS Code 环境，内部多智能体协作，异步跑完直接交付报告、表格、网站等成果物，近年还开放了 API 平台。[架构解析](https://sahin.io/blog/how-manus-built-an-ai-agent-platform)｜[E2B 沙箱机制](https://e2b.dev/blog/how-manus-uses-e2b-to-provide-agents-with-virtual-computers)｜[Heise 评测](https://www.heise.de/en/background/The-Chinese-AI-agent-Manus-brings-web-search-Ubuntu-sandbox-and-VS-Code-10364463.html)

与 DSH 的区别：Manus 是"任务完成器"——给它目标，它在云端做完给你结果，过程与机制黑盒；DSH 是"运行时"——过程与每个能力都透明、可审计、可回滚。

### OpenClaw（原 Clawdbot/Moltbot）：开源个人生活助理

自托管的常驻 AI 助手：一个 gateway 7×24 小时运行，接入 WhatsApp、Telegram、Discord 等消息渠道，能控制电脑与手机、做浏览器自动化、语音交互、跨会话记忆，像一台"私人 Jarvis"。它先后更名 Clawdbot → Moltbot → OpenClaw。[DigitalOcean 指南](https://www.digitalocean.com/resources/articles/what-is-openclaw)｜[Milvus 详解](https://milvus.io/zh/blog/openclaw-formerly-clawdbot-moltbot-explained-a-complete-guide-to-the-autonomous-ai-agent.md)｜[O'Reilly 评论](https://www.oreilly.com/radar/what-openclaw-reveals-about-the-next-phase-of-ai-agents/)

与 DSH 的区别：OpenClaw 的战场是**个人生活与消息渠道**（回消息、管日程、控设备），DSH 的战场是**软件开发与 Agent 构建**；前者以"渠道 + 设备"为边界，后者以"插件 + 会话"为边界。

## 怎么选：一句话速记

- 想让 AI **帮你干活**（办公）→ WorkBuddy / Manus
- 想让 AI **替你写代码**（终端本地）→ Claude Code
- 想让 AI **在云端批量改仓库** → Codex
- 想要一个**管生活的私人助理** → OpenClaw
- 想要一个**能拆、能改、能拼、能审批、能回滚的 Agent 框架**，甚至把框架本身当作开发对象 → DeepSeek Harness

## 结语

Agent 赛道正在分化：一端是越来越"开箱即用"的任务产品，另一端是越来越"可编程"的运行时框架。DeepSeek Harness 显然押注后者——把可组合性、可审计性和可回滚性作为一等公民。如果你想从零开始体验 DSH，可以从本站的[快速开始](/docs/zh/guide/quick-start)入手；想深入了解某个插件或实践，欢迎继续浏览 [Oh! dsh](/docs/zh/index) 的其它内容。
