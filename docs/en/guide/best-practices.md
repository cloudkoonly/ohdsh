---
title: Best Practices
description: Battle-tested DeepSeek Harness best practices — composition patterns, security hygiene, and publishing workflows distilled from real-world DSH projects.
order: 2
---

# Best Practices

Patterns distilled from real-world DeepSeek Harness projects. Follow these to keep your agents composable, secure, and maintainable.

## Composition Patterns

- **Prefer small plugins** — one plugin, one responsibility. Small plugins are easier to test, reuse, and reason about.
- **Publish shared services in the host composition** — anything used across sessions (persistence, sandbox, model routes) belongs in the host, not in a single agent preset.
- **Isolate preset-owned services** — if only one agent needs a service, keep it inside that preset's `isolate` realm.

## Security Hygiene

- **Least privilege** — grant each plugin only the permissions it actually needs.
- **Review before running** — treat every third-party plugin as untrusted code until you have read its source.
- **Never commit secrets** — keep credentials out of content and configuration repos.

## Publishing Workflows

- **Version everything** — publish immutable versions so consumers can pin and roll back.
- **Document before publishing** — a plugin without docs is a support burden.
- **Test updates** — run an update in a staging composition before rolling it out.

> [!TIP]
> When in doubt, keep the change small: a two-line plugin is easier to review than a two-hundred-line one.

## Next Steps

- Browse the [Plugin Catalog](../plugins/index.md) for vetted plugins
- Read the [Quick Start](quick-start.md) if you are new to DSH
