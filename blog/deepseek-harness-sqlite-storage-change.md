---
title: "DSH rc.8 changed its SQLite storage format — a heads-up before you upgrade"
date: 2026-08-26
slug: "deepseek-harness-sqlite-storage-change"
tags: ["deepseek-harness", "breaking-change", "storage", "sqlite", "dsh"]
status: "published"
excerpt: "Buried in rc.8's changelog is a line that matters more than it looks: the SQLite storage format is now incompatible. Here's what that means and how to plan your upgrade."
---

The most consequential line in DeepSeek Harness's rc.8 release isn't a feature. It's buried under "Chores": the SQLite backend got faster reads, writes, and forks, with smaller storage — **but the data structure is incompatible**. If you've been treating DSH's upgrade cycle as a no-op, this is the release that says otherwise.

## What actually changed

rc.8 reworked the SQLite backend. The upside is real: better read/write performance, faster fork operations for large histories, and a smaller on-disk footprint. The cost is compatibility: the new storage format **is not backward-compatible** with what the previous versions wrote.

## What "incompatible" means in practice

- **Old data won't just open.** A store written by rc.7 (or earlier) is not guaranteed to be readable by rc.8.
- **Sessions and storage may not carry over.** If your workflow depends on persisted sessions in SQLite, an upgrade without preparation can look like data loss — it's actually a format break.
- **This is the kind of thing you want to catch before, not after.** Once you've upgraded and the new version has written to the store, going back is its own problem.

## How to plan the upgrade

1. **Back up your data directory first.** Whatever storage DSH writes, copy it before you upgrade.
2. **Read the release notes for the migration path.** The authoritative steps live with the official release/upgrade docs — treat third-party summaries as pointers, not instructions.
3. **Export anything you can't afford to lose.** If sessions or settings matter, export or note them before the jump.
4. **Upgrade on one machine first.** Validate the migration in a disposable environment before rolling it to the one you depend on.

## The real lesson

DSH ships roughly three times a week, and breaking changes ride in under quiet labels like "Chores" or "其他变更". The `settings.plugin.item` slot went keyed in rc.7; the SQLite format broke in rc.8. The pattern is clear: **at this cadence, the changelog is part of your upgrade checklist, not an afterthought.** Read the small print — especially the lines that don't look like features.
