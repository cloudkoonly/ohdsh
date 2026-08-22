---
title: "DeepSeek Harness 把 Claude Code 和 Codex 收编成子代理，要当 Agent 时代的调度层"
date: 2026-08-22
slug: "deepseek-harness-subagents-scheduling-layer"
tags: ["deepseek-harness", "子代理", "claude-code", "codex", "编排", "dsh"]
status: "published"
excerpt: "本周 DeepSeek Harness 最有分量的一步不是某个功能，而是定位：Harness 现在能把 Claude Code 和 Codex 当作子代理来跑，把自己摆到了所有 Agent 之上的调度层。"
---

本周 DeepSeek Harness 最有分量的一件事，不是一个功能，而是一次定位：Harness 现在能把 **Claude Code** 和 **Codex** 当作子代理来跑。光这一个能力，就重新定义了 DSH 是什么——不是这些工具的对手，而是它们**之上**的那一层。

## 这里的「子代理」是什么意思

在 DSH 的世界观里，「一切皆插件」一路延伸到了别的 Agent 身上。你用来派生一个新 DSH 子进程的那套子代理机制，现在也能把任务交给 Claude Code 或 Codex 后端。编排只写一次，活儿在哪里跑得最好就丢到哪里。

社区甚至已经有工具在把这个想法往前推——统一子代理委派，同时支持原生 spawn/fork 加 Claude Code、Codex、Grok、ACP 桥接。

## 「调度层」这个判断

这是它的战略下注，值得说破：**谁调度 Agent，谁就拥有模型之上的那一层。** 模型是流动中的大宗商品，Agent 是干活的地方，但「协调」——决定谁做什么、带什么上下文、在什么信任边界内——才是高价值的位置。

DSH 明摆着在抢这个位置。它不需要比 Claude Code 更会写代码，也不需要比 Codex 更懂云沙箱。它需要成为你把它们组合起来的地方。

## 为什么这一步聪明

- **复用，而不是重造。** Claude Code 的终端编码、Codex 的云沙箱，是好几年的积累。调度器免费继承它们。
- **什么活儿用什么工具。** 一个工作流可以按需路由——编码给 Claude Code，批量改仓库给 Codex，内部步骤给原生 DSH 子进程。
- **结构上就是模型无关的。** 子代理自带模型，DSH 天然对「底下哪个模型赢」保持中立。

## 诚实地看代价

编排不是免费的。每一次委派都多一跳：上下文封送、凭据处理，以及「让一个 agent 驱动另一个 agent」的信任问题。而让这一切成为可能的「无内核、一切皆插件」设计，也正是批评者所说的复杂度税。调度器的好坏取决于它的失败模式——子代理卡住或跑偏，责任都归编排者。

## 结论

把 Claude Code 和 Codex 收编成子代理，是 DSH 迄今最明确的信号：它在奔着「不只是又一个编码 Agent，而是 Agent 时代的**调度层**」去。如果你还在一个功能一个功能地把 DSH 和 Claude Code 对比，那你问错了问题。真正有意思的问题是：最后谁会被装进谁里面。
