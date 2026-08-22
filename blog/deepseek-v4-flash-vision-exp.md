---
title: "DeepSeek V4-Flash-Vision-Exp: multimodal for agents, at Flash pricing"
date: 2026-08-22
slug: "deepseek-v4-flash-vision-exp"
tags: ["deepseek", "multimodal", "vision", "v4", "agent"]
status: "published"
excerpt: "DeepSeek launched V4-Flash-Vision-Exp: text capability on par with V4-Flash, multimodal agent capability approaching Opus-4.8 — and images cost at most 384 tokens, same as Flash."
---

This week DeepSeek quietly dropped a new experimental model: **V4-Flash-Vision-Exp**, the first vision-capable member of the V4 lineup. It's "Exp" — experimental — but the economics are already concrete: images bill like Flash, and the multimodal agent benchmarks punch well above Flash's weight.

## Text stays flat, vision jumps

The official framing is a balance claim:

- On pure text — agent tasks, reasoning, world knowledge — V4-Flash-Vision-Exp matches the V4-Flash release.
- On agent benchmarks that need vision, it jumps sharply past V4-Flash, landing multimodal agent capability near **Opus-4.8**.

So the model doesn't trade text quality for eyes. That's the thing that usually goes wrong with vision models; here the claim is explicitly "no trade".

## The economics: 384 tokens per image

Vision pricing is where most multimodal APIs get expensive. Here it's simple: an image is converted to tokens, capped at **384 tokens per image**, billed at V4-Flash rates — no separate vision surcharge. That's the difference between "vision is available" and "vision is usable in production".

## Three ways in, plus a free Files API

Input is flexible: base64 inline, an external URL, or the new **Files API**. The Files API is free — upload an image once, reference it by `file_id`, and skip re-uploading the same image across requests. For agents that revisit the same screenshots or documents, that's a real bandwidth saving.

## What it actually unlocks

The launch page makes the point with three examples:

- A business-customized Tibet self-drive tour PPT, generated end-to-end with real-photo-style images.
- A full re-creation of the DeepSeek Harness website with a specific visual direction — deep-sea blue, glass UI, ASCII atom pixels — refined over long multi-turn interaction.
- A front-end mini-demo of 3D clay monsters in a retro dance-floor party.

These aren't OCR demos. They're design and creative work — the kind of output that needs a model to *see* what it's producing and correct it. That's the agent gap vision closes.

## The small print worth noting

- It's experimental: `Exp` means the model and its behavior can shift between releases. Don't pin production to it blindly.
- The benchmarks were run with DeepSeek Harness in minimal mode as the framework — a quiet reminder that the model and the runtime now come from the same house.

## The takeaway

V4-Flash-Vision-Exp is the multimodal piece of the V4 lineup slotting into place, and the pricing is the real story: vision at Flash cost, with text that doesn't regress. If your agent needs eyes — screenshots, documents, design work — this is the cheap way to give them sight.
