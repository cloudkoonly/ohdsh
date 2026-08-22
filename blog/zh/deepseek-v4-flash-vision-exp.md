---
title: "DeepSeek V4-Flash-Vision-Exp 上线：Agent 的多模态，Flash 的价格"
date: 2026-08-22
slug: "deepseek-v4-flash-vision-exp"
tags: ["deepseek", "多模态", "视觉", "v4", "agent"]
status: "published"
excerpt: "DeepSeek 上线 V4-Flash-Vision-Exp：纯文本能力与 V4-Flash 持平，多模态 Agent 能力接近 Opus-4.8——图片最多计 384 tokens，价格与 Flash 一致。"
---

这周 DeepSeek 悄悄放出了一个新的实验性模型：**V4-Flash-Vision-Exp**，V4 系列里第一个带视觉能力的成员。它标着「Exp」（实验性），但账已经算得很清楚了：图片按 Flash 计费，多模态 Agent 基准却明显高过 Flash 一个身位。

## 文本不降，视觉跳升

官方给的是一个「平衡」的说法：

- 纯文本——Agent 任务、推理、世界知识——V4-Flash-Vision-Exp 与 V4-Flash 正式版持平。
- 在需要视觉理解的 Agent 基准上，它相对 V4-Flash 大幅跃升，多模态 Agent 能力已接近 **Opus-4.8**。

也就是说，这个模型没有用文本能力去换「眼睛」。这是视觉模型最容易翻车的地方，而官方这次明说「不牺牲」。

## 经济账：一张图最多 384 tokens

多模态 API 最贵的环节通常是视觉。这里很简单：图片转成 token 计费，一张图最多 **384 tokens**，价格与 V4-Flash 一致，没有单独的视觉附加费。「视觉可用」和「视觉能在生产里用」的区别，就在这里。

## 三种传入方式 + 免费的 Files API

输入很灵活：base64 内联、外部 URL，或新的 **Files API**。Files API 免费——图片上传一次、用 `file_id` 引用，同一张图在多个请求里无需重复上传。对反复引用同一批截图或文档的 agent 来说，这是实打实的带宽节省。

## 它真正解锁了什么

发布页用三个例子把重点讲清楚了：

- 一份商业定制的西藏自驾游 PPT，端到端生成，配真实摄影图风格。
- 对 DeepSeek Harness 官网做二次创作——深蓝深海、玻璃 UI、ASCII 原子像素的视觉方向，经过长多轮交互重构出未来主义风格的开发者网站。
- 一个「3D 黏土小怪兽 + 复古舞池派对」的前端 Mini Demo。

这些不是 OCR 演示，而是设计与创作类工作——这类产出需要模型**看见**自己做出了什么、再修正。这正是视觉补上的那个 Agent 缺口。

## 值得注意的小字

- 它是实验性的：`Exp` 意味着模型和行为会随版本变化，别盲目把生产钉死在它上面。
- 基准测试用的是 DeepSeek Harness 极简模式作为框架——顺带提醒一句：模型和运行时，现在是同一家在开发。

## 结论

V4-Flash-Vision-Exp 是 V4 系列里补上多模态的那块拼图，而真正的故事是定价：Flash 的成本拿到视觉，文本还不回退。如果你的 agent 需要眼睛——截图、文档、设计工作——这是给它「装上视力」最便宜的一条路。
