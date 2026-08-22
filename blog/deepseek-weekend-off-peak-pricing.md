---
title: "DeepSeek makes weekends all off-peak: no peak pricing on Saturday and Sunday"
date: 2026-08-22
slug: "deepseek-weekend-off-peak-pricing"
tags: ["deepseek", "pricing", "deepseek-api", "off-peak"]
status: "published"
excerpt: "From August 23 (Beijing time), DeepSeek's peak/off-peak billing no longer applies on weekends — Saturdays and Sundays bill entirely at the off-peak price."
---

DeepSeek is tweaking its peak/off-peak pricing again — and this time it's a clear win for developers. Starting **August 23, 2026, 00:00 Beijing time**, weekends no longer distinguish peak from off-peak: **Saturday and Sunday bill entirely at the off-peak rate**.

## A quick recap of the current scheme

DeepSeek's V4 API has been running time-of-day pricing since mid-August:

- **Peak** (weekdays): 09:00–12:00 and 14:00–18:00, Beijing time.
- **Off-peak**: everything else — at **half** the peak price.

That split has been the single biggest lever for anyone watching their token bill. Now the weekend just got folded into the cheap side.

## What actually changes

Nothing about your code. The change is purely on the meter:

- **Weekdays** keep the peak/off-peak split, with peak windows at 09:00–12:00 and 14:00–18:00.
- **Weekends** (Saturday + Sunday) charge at the off-peak rate around the clock.

So a batch job you run on a Sunday afternoon — previously peak-priced if it fell in the window — now costs half. No scheduling gymnastics required.

## What this means in practice

- **Move weekend-tolerant work to the weekend.** Batch jobs, backfills, evaluations, fine-tuning runs, data processing — anything that can wait for the weekend should.
- **Weekdays are unchanged.** The 9–12 / 14–18 peak windows still cost double, so keep retiming your weekday workloads around them.
- **Hobby and side-project usage just got cheaper.** Weekend tinkering is the most common kind, and it's now always off-peak.

## The bigger picture

This is the second pricing move in as many weeks — first the peak/off-peak split, now the weekend carve-out. The pattern is consistent: DeepSeek is using price to smooth load, nudging usage into the hours where capacity is idle. "Off-peak is half price" was the headline last time; "weekends are always off-peak" is the sequel.

For anyone building on DSH or the API directly, the practical rule is simple: **weekdays, mind the two peak windows. Weekends, don't think about it.**

## The takeaway

Cheaper weekends are a small change with an outsized effect for individual developers and small teams — the people most likely to run heavy jobs on their own time. If you've been rationing weekend experiments, you no longer need to.
