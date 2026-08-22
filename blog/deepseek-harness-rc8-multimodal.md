---
title: "DeepSeek Harness v0.1.0-rc.8: 14 changes, native image input, and a weekly shipping cadence"
date: 2026-08-22
slug: "deepseek-harness-rc8-multimodal"
tags: ["deepseek-harness", "release", "multimodal", "dsh"]
status: "published"
excerpt: "rc.8 is the first big post-beta update: 14 changes with native image input at the top. More telling than any single feature is the cadence — Harness is now shipping roughly three times a week."
---

DeepSeek Harness shipped **v0.1.0-rc.8** this week, its first major post-beta update: 14 changes, with multimodal input as the headline. But the more telling story isn't any one feature — it's the cadence. Harness has settled into a rhythm of roughly **three updates a week**, which changes what "using DSH" means.

## What's actually in rc.8

The headline is **native image input**: agents can now take text-and-image mixed prompts directly, rather than images being a second-class, bolted-on channel. That sounds small; it isn't. Once an agent can see, a whole class of work opens up — reading a screenshot and acting on it, parsing a diagram, inspecting a rendered page instead of guessing from markup.

The other 13 changes include the sub-agent upgrades (Codex and Claude Code backends) and the usual long tail of fixes. The list is less important than the shape: multimodal is no longer "planned", it's shipping.

## Why the cadence matters more than the changelog

A young runtime that ships weekly tells you two things at once:

- **Momentum is real.** Weekly drops mean a contributor base that's actually moving, not a repo that went quiet after the launch spike.
- **Plugin authors now track a moving target.** Every update can shift a contract — we wrote about the `settings.plugin.item` slot going keyed in rc.7, and that's the pattern: the surface evolves fast, and "it worked yesterday" is not a deployment strategy.

For maintainers, the lesson is to read the release notes the way you'd read a dependency's breaking-changes log — before, not after, your plugin stops loading.

## Multimodal is the underrated unlock

Text-only agents are stuck describing what they can't see. Image input closes that loop: screenshot → diagnosis → fix, diagram → understanding → implementation, receipt/invoice → structured data. This is the kind of capability that quietly moves an agent from "copilot" to "operator".

## The takeaway

rc.8 isn't a milestone release. It's evidence of a project that has stopped being "the thing that launched" and started being "the thing that ships". If you're building on DSH, plan for velocity: pin your plugin against real versions, read the notes, and treat the changelog as part of your CI, not an afterthought.
