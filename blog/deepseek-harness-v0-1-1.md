---
title: "DeepSeek Harness v0.1.1: Files API image uploads, sandbox hardening, and the vision model lands"
date: 2026-08-26
slug: "deepseek-harness-v0-1-1"
tags: ["deepseek-harness", "release", "multimodal", "vision", "security", "dsh"]
status: "published"
excerpt: "The v0.1.1 line is here: V4-Flash-Vision-Exp lands in the DeepSeek adapter, image uploads route through the Files API, and a Bubblewrap sandbox escape gets patched."
---

DeepSeek Harness has moved past 0.1.0. The **v0.1.1** line landed across two release candidates this week, and it's a tight, focused pair: the vision model arrives in the adapter, image handling gets more efficient, and a real sandbox escape gets fixed.

## The vision model lands in the adapter

rc.1 adds **DeepSeek-V4-Flash-Vision-Exp** to the DeepSeek adapter — the multimodal vision model that launched on the API the same week. That's the missing link between "the API can do vision" and "Harness can actually use it." Native image input now has a first-class model behind it.

## Images get cheaper to send

rc.2 tunes the image pipeline on both ends:

- **Files API first**: the adapter now prioritizes uploading images through the Files API and **reuses already-uploaded files**. Send the same screenshot to ten requests, and it's uploaded once.
- **Automatic preprocessing**: images are resized and converted to the right format based on what the model needs — so you stop paying for oversized payloads and stop debugging format mismatches.

For anyone whose agents actually work with screenshots and documents, this is the difference between "vision works" and "vision is affordable."

## A real sandbox escape, patched

The most underrated line in rc.1 is a security fix: a confined process inside the **Bubblewrap** sandbox could escape its restrictions through `/proc/<pid>/root`. That's not a theoretical nitpick — it's the sandbox's whole job, and it's now patched.

It's a useful reminder that Harness's security story is being actively hardened in the same releases that add features — and why staying current matters.

## The smaller stuff

- Multiline `ask_user_question` answers, with wrapping and `Shift+Enter`.
- Responsive Markdown tables in conversations.
- Precision fixes for 99.x% cache-hit ratios.

## The takeaway

v0.1.1 isn't a headline release — it's the kind of release that makes a framework usable day-to-day: the vision model is wired in, image costs come down, and the sandbox gets tighter. If you're still on rc.8, the upgrade is mostly upside.
