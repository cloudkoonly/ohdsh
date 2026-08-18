---
title: "DeepSeek Harness v0.1.0-rc.7：插件设置卡片、PTC 模式与更顺手的任务面板"
date: 2026-08-17
slug: "deepseek-harness-v0-1-0-rc7"
tags: ["deepseek-harness", "更新", "dsh"]
status: "published"
excerpt: "开源一周后，v0.1.0-rc.7 于 8 月 17 日发布：插件可自带设置卡片、子代理任务接入任务面板、MCP/ACP 支持持久化图片附件，并给 DeepSeek 模型加了 low 推理强度。"
---

DeepSeek Harness 还在快速迭代。开源发布一周后，**v0.1.0-rc.7** 在 8 月 17 日落地。这期主要是体验向的更新——但有几个改动比表面看起来更值得注意。

## 新增了什么

### 插件可以自带设置卡片了

以前插件的配置都躺在配置文件里。rc.7 允许插件自己注册设置卡片，选项直接出现在界面上该出现的位置。这种改动让插件生态开始「有感觉」了：第三方插件不再是你往 YAML 里贴的一段配置，而是你可以在面板里直接配置的「应用」。

### Codex 和 Claude Code 的子代理任务接入任务面板

来自 Codex 和 Claude Code 桥接的子代理任务，现在会出现在任务面板里，可以像其他后台任务一样查看、收集、停止。以前它们跑在你看不太见的地方。

### MCP / ACP 支持持久化图片附件

MCP 和 ACP 现在支持持久化图片附件，PTC 模式也能转发嵌套图片。对多模态工作流来说，图片不再是「每轮用完就丢」的一次性东西。

## 值得注意的修复

- **极简模式下持久 Bash 卡顿** —— 卡顿没了。
- **大历史消息分页栈溢出** —— 长会话不再崩栈。
- **max-token 截断不再卡死会话** —— 截断之后还能继续。
- **Safari 输入框光标错位** —— 光标终于归位。
- **node-pty 1.2 beta** —— 终端平台兼容性更好。

## 两个值得多看一眼的改动

### 「Code mode」改名为「PTC mode」

英文预设「Code mode」改名为「PTC mode」。还是那个预设，名字更清楚了。如果你的肌肉记忆还停留在「Code mode」，认准这个。

### DeepSeek 模型新增 `low` 推理强度

DeepSeek 模型现在可以设 `low` 推理强度，默认仍是 `high`。考虑到峰谷定价刚生效，这个开关值得在日常任务里试一下——推理深度是 token 消耗的大头之一，`low` 是你手里最便宜的一个旋钮。

## 更大的图景

rc.7 的重点不是新能力，而是生态开始自己喘气：插件贡献设置界面，贡献者在清扫平台 bug 的长尾。还早，但方向对了。

## 试试看

- 获取发布：[GitHub releases](https://github.com/deepseek-ai/deepseek-harness/releases)
- 从这里开始：[快速开始](/docs/zh/guide/quick-start)
