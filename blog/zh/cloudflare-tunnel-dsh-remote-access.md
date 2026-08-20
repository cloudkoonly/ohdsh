---
title: "DSH 远程访问：为什么裸反向代理不行，该怎么做"
date: 2026-08-17
slug: "cloudflare-tunnel-dsh-remote-access"
tags: ["deepseek-harness", "远程访问", "websocket", "反向代理", "dsh"]
status: "published"
excerpt: "DSH Web GUI 依赖 WebSocket 通信，放在反向代理后面 WSS 会被中断。这里讲清楚原因，以及三种真正可行的远程访问方案。"
---

DSH 的 Web 界面默认绑在 `http://127.0.0.1:3080`，前后端通过 WebSocket 通信。一旦你试图用反向代理（Nginx、Cloudflare Tunnel、Caddy 等）把它暴露出去，就会撞墙：**WebSocket 连接被中断，请求异常，界面直接废掉。**

这篇讲清楚为什么，以及真正能用的做法。

## 为什么反向代理 DSH 会挂

DSH 有一个**回环信任栅栏（loopback trust fence）**。后端会检查请求的 `Host` 和 `Origin` 头是否指向 `localhost`（或 `127.0.0.1`）。反向代理一介入，这些头要么被改写，要么浏览器会把真实域名作为 Origin 发出来。WebSocket 升级握手在信任检查这一步就被拒绝了。

你可能看到页面加载出来了（静态 HTTP 请求可能通过），但驱动交互会话的 WSS 连接建立不了——或者建立后很快断开。结果是：UI 壳子在那里，但什么都不能用。

这不是 bug。这是刻意的安全边界：DSH 认为，不从回环接口来的流量，默认不应该被信任——除非你显式 opt-in。

## 三种能用的方案

### 1. 远程访问插件（个人使用推荐）

插件生态有多个专门的解决方案。它们在 DSH **内部**启动一个本地代理子进程，改写 Host/Origin 通过信任栅栏，同时正确处理 WebSocket 升级：

- **[dsh-full-remote](/zh/plugins?q=dsh-full-remote)** —— 令牌门控反向代理，完整保留服务端 API 访问（`settings.*`、`credentials.*`、`host.listDirectory`），按设备会话，可选 CIDR/审批/TLS，WebSocket/SSE 透传。关键差异：其他插件经代理后会丢失敏感 API，这个不会。
- **[dsh-mobile-gate](/zh/plugins?q=mobile-gate)** —— 面向局域网的网关：首次访问审批 + 设备令牌绑定 + 限流 + 手机端排版注入。
- **[dsh-Remote](/zh/plugins?q=dsh-Remote)** —— 移动端全套：Android App + Bearer 令牌网关 + 局域网/Tailscale 自愈 + 文件传输 + 多服务器测速自动切换。
- **[dsh-mobile](/zh/plugins?q=dsh-mobile)** —— 面向 iPhone/iPad：显式 Host/Origin 改写通过信任栅栏 + WebSocket 升级 + iOS PWA 外壳 + 触屏 CSS。
- **[dsh-auth-tunnel](/zh/plugins?q=dsh-auth-tunnel)** —— 正确做法的 Cloudflare Tunnel 集成：密码保护的公网访问，代理 HTTP/WebSocket 流量。

这些插件之所以能用，是因为它们跑在**和 DSH 同一台机器上**，通过 `localhost` 代理流量满足信任栅栏，再对外暴露第二个端口或隧道端点。

### 2. dsh-api-gateway（程序化 / 无头访问）

如果你的目标不是远程用 Web GUI，而是把 DSH 的能力接入其他工具或工作流，**dsh-api-gateway** 插件暴露一层 REST API。这完全绕过了 WebSocket 问题——HTTP 请求/响应在任何反向代理或隧道后面都能正常工作。

适合的场景：
- CI/CD 流水线触发 DSH 任务
- 自定义前端通过 API 与 DSH 交互
- 不需要完整 Web GUI 的移动端应用

### 3. VPN / mesh 网络（透明，但更重）

**Tailscale**、WireGuard、ZeroTier 给远程设备分配一个和 DSH 同网段的虚拟 IP。对 DSH 来说，连接仍然到达 `localhost:3080` 的本地接口（通过 Tailscale 的 `100.x.x.x:3080` 访问时，信任栅栏看到的是直连——不经过代理改写）。

代价是：每个设备都得装 VPN 客户端并授权。

## 什么做法不行

| 方案 | 失败原因 |
|------|----------|
| Nginx 反向代理 | Host/Origin 改写导致 WSS 信任检查不通过 |
| Cloudflare Tunnel（裸用） | 同上——CF 终结 TLS 后用自己的头转发 |
| Caddy / Traefik / HAProxy | 同类问题——任何改动请求头的 L7 代理 |
| 只绑 `0.0.0.0` | 信任栅栏仍然拒绝浏览器发出的非 localhost Origin |

## 实操建议

对大多数只想在手机或第二台机器上用 DSH 的人：

1. **装一个远程访问插件**（从 `dsh-full-remote` 或 `dsh-auth-tunnel` 开始）。
2. 插件在内部处理信任栅栏。
3. 如果要公网访问，把 Cloudflare Tunnel 指向**插件的代理端口**——而不是 DSH 原生的 3080。
4. 认证由插件自带的令牌/审批机制覆盖。

纯 API / 无头场景，用 `dsh-api-gateway`，随便怎么代理都行。

## 更大的图景

这是 DSH 架构里一个有意识的取舍。信任栅栏存在的理由是：一个有 shell 权限的 AI 编码代理不是你想不小心暴露在公网上的东西。不能直接 `nginx proxy_pass` 的不便，换来的是一个安全的默认值。

插件生态已经把这个缺口补上了——远程访问能用，只是需要通过一个理解信任模型的插件来显式 opt-in。对这样一个强力工具来说，这是恰当的摩擦水平。

## 链接

- [插件目录 — 远程与移动端](/zh/plugins?category=remote-mobile)
- [快速开始](/docs/zh/guide/quick-start)
