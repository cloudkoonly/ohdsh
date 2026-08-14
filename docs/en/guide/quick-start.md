---
title: Quick Start
description: Get started with DeepSeek Harness plugins in under two minutes — find, install, and run your first plugin with oh! dsh.
order: 1
---

# Quick Start

Install your first DeepSeek Harness plugin in under two minutes.

## Step 1: Find a plugin

Browse the [Plugin Catalog](../plugins/index.md) and pick a plugin that matches what you want to build. Every entry describes what the plugin does and when to use it.

## Step 2: Install the plugin

Add the plugin to your DSH composition (for example, your agent preset or `cordis.yml`):

```yaml
- plugin: <plugin-id>
```

Then restart the harness so the plugin row is mounted.

## Step 3: Verify it works

Check that the plugin contributed its capabilities:

```bash
dsh status
```

You should see the plugin listed with its provided services and tools.

## Next Steps

- Follow the [Best Practices](best-practices.md) guide before adding more plugins
- Learn how compositions are structured in the DeepSeek Harness documentation
- Prefer Chinese? Read the [快速开始](../../zh/guide/quick-start.md)
