---
title: "DSH v0.1.0-rc.7: the settings.plugin.item slot is now keyed — a migration note"
date: 2026-08-18
slug: "dsh-rc7-settings-plugin-item-keyed"
tags: ["deepseek-harness", "release", "breaking-change", "plugin-development", "dsh"]
status: "published"
excerpt: "In v0.1.0-rc.7 the settings.plugin.item slot changed from a list (id-based) to a keyed slot (key-based). Plugins registering a Settings card with id now fail to load — here's the fix."
---

If your plugin draws a card in **Settings → Plugins → Configurable**, v0.1.0-rc.7 breaks you. The `settings.plugin.item` slot changed from a list to a keyed slot, and the registration shape changed with it. Plugins that still register with `id` — the old list-slot convention — fail to load.

## What changed

`settings.plugin.item` used to be a plain **list** slot: every card registered with an `id`, and the tab rendered them in order. In rc.7 it's a **keyed** slot, keyed on the settings namespace the card edits.

The rationale is worth understanding: the "Configurable" tab now reads which settings namespaces the Host actually serves, then dispatches one slot key per namespace. A card registered under a namespace key appears only if the Host serves that namespace — so a plugin distributed outside the repository can register its namespace on the Host and its card in the browser, and the tab pairs the two without knowing what the namespace means.

## Before and after

The old registration (rc.6, list style):

```ts
ctx.slots.inject('settings.plugin.item', () => ctx.slots.register(
  { name: 'settings.plugin.item', id: 'api-gateway', order: 50, label: 'API Gateway' },
  () => React.createElement(GatewayCard),
))
```

The new registration (rc.7, keyed style):

```ts
ctx.slots.inject('settings.plugin.item', () => ctx.slots.register(
  { name: 'settings.plugin.item', key: 'api-gateway', order: 50, label: 'API Gateway' },
  () => React.createElement(GatewayCard),
))
```

The change is one field: `id` becomes `key`, and the value is the settings namespace the card edits — not an arbitrary identifier.

## Why it fails loudly

A list slot accepts `id`; a keyed slot requires `key`. Register a keyed slot with the old `id` shape and the slot invariant rejects it, so the plugin fails to load instead of silently rendering nothing. That's deliberate: failing closed beats a card that quietly disappears.

## The full migration

The `id` → `key` swap is the minimum. Two things make a card actually show up under the keyed contract:

1. **Register the settings namespace on the Host.** The tab only dispatches keys for namespaces the Host serves. If your card edits a settings namespace, make sure the Host half of your plugin registers it.
2. **Key the card on that namespace.** The browser card's `key` must match the namespace the Host registered, or the tab never dispatches it.

A card whose namespace isn't served renders nothing — and, unlike a list slot, it won't hold the tab back from its empty state.

## Checklist for plugin authors

- [ ] Find every `settings.plugin.item` registration in your client code.
- [ ] Replace `id` with `key`, using the settings namespace you edit.
- [ ] Confirm the Host side registers that namespace.
- [ ] Rebuild, reload, and check the Configurable tab shows your card.

## The bigger picture

This is one of those rc-cycle changes that looks cosmetic but changes a contract. Keyed slots let plugins contribute UI without the host surface having to understand their semantics — which is exactly what a plugin ecosystem needs if third-party plugins are going to feel first-class. The cost is a one-line migration now.

If you're following along with the dsh-api-gateway fix, the change is in its client registration: `id: 'api-gateway'` → `key: 'api-gateway'`.
