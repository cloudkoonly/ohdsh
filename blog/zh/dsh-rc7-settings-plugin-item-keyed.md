---
title: "DSH v0.1.0-rc.7：settings.plugin.item 槽位改为 keyed，插件作者注意迁移"
date: 2026-08-18
slug: "dsh-rc7-settings-plugin-item-keyed"
tags: ["deepseek-harness", "更新", "破坏性变更", "插件开发", "dsh"]
status: "published"
excerpt: "v0.1.0-rc.7 把 settings.plugin.item 槽位从 list（基于 id）改成了 keyed（基于 key）。用 id 注册设置卡片的插件现在会加载失败——这是修复方法。"
---

如果你的插件在 **设置 → 插件 → 可配置** 里画了一张卡片，v0.1.0-rc.7 会直接让你翻车。`settings.plugin.item` 槽位从 list 改成了 keyed，注册的字段也跟着变了。还在用 `id` 注册的插件（旧 list 槽位的写法）现在会加载失败。

## 改了什么

`settings.plugin.item` 以前是个普通的 **list** 槽位：每张卡片用 `id` 注册，标签页按顺序渲染。rc.7 里它变成了 **keyed** 槽位，以卡片所编辑的 settings 命名空间为键。

这个改动的动机值得理解：「可配置」标签页现在会先读 Host 实际服务了哪些 settings 命名空间，再为每个命名空间派发一个槽位键。注册在某个命名空间键下的卡片，只有当 Host 服务了那个命名空间时才会出现——于是，一个在仓库外分发的插件可以在 Host 上注册命名空间、在浏览器里注册卡片，标签页把两者配对，却完全不需要知道那个命名空间是什么含义。

## 前后对照

旧写法（rc.6，list 风格）：

```ts
ctx.slots.inject('settings.plugin.item', () => ctx.slots.register(
  { name: 'settings.plugin.item', id: 'api-gateway', order: 50, label: 'API Gateway' },
  () => React.createElement(GatewayCard),
))
```

新写法（rc.7，keyed 风格）：

```ts
ctx.slots.inject('settings.plugin.item', () => ctx.slots.register(
  { name: 'settings.plugin.item', key: 'api-gateway', order: 50, label: 'API Gateway' },
  () => React.createElement(GatewayCard),
))
```

改动只有一个字段：`id` 换成 `key`，值是你所编辑的 settings 命名空间——而不是随便起的一个标识符。

## 为什么它直接报错

list 槽位接受 `id`；keyed 槽位要求 `key`。用旧的 `id` 形状去注册 keyed 槽位，槽位不变量校验会拒绝它，于是插件加载失败，而不是悄悄渲染出空白。这是有意为之：失败关闭，好过一张卡片无声消失。

## 完整迁移

`id` → `key` 是必要的最小改动。要让卡片在 keyed 契约下真正显示，还要满足两点：

1. **在 Host 上注册 settings 命名空间。** 标签页只会为 Host 服务的命名空间派发键。如果你的卡片编辑某个 settings 命名空间，确保插件 Host 那一半注册了它。
2. **用那个命名空间给卡片做键。** 浏览器卡片的 `key` 必须和 Host 注册的命名空间一致，否则标签页永远不会派发它。

一个命名空间没被服务的卡片，什么都不渲染——而且，和 list 槽位不同，它也不会挡住标签页的空态文案。

## 插件作者自查清单

- [ ] 找出客户端代码里所有 `settings.plugin.item` 注册点。
- [ ] 把 `id` 换成 `key`，值用你所编辑的 settings 命名空间。
- [ ] 确认 Host 侧注册了那个命名空间。
- [ ] 重新构建、重载，确认「可配置」标签页里能看到你的卡片。

## 更大的图景

这是 rc 周期里那种「看着像表面改动、实则改了契约」的变更。keyed 槽位让插件贡献 UI 时，宿主界面不必理解它们的语义——而这正是一个插件生态想让第三方插件有「一等公民」待遇时需要的。代价是现在的一次一行迁移。

如果你在跟进 dsh-api-gateway 的修复，改动就在它的客户端注册里：`id: 'api-gateway'` → `key: 'api-gateway'`。
