---
title: "Remote Access for DSH: Why a Bare Reverse Proxy Won't Work, and What Does"
date: 2026-08-17
slug: "cloudflare-tunnel-dsh-remote-access"
tags: ["deepseek-harness", "remote-access", "websocket", "reverse-proxy", "dsh"]
status: "published"
excerpt: "DSH's web GUI relies on WebSocket connections that break behind a plain reverse proxy. Here's why, and the three approaches that actually work for remote access."
---

DSH's web GUI binds to `http://127.0.0.1:3080` by default and communicates with the backend over WebSocket. The moment you try to expose it remotely through a reverse proxy — Nginx, Cloudflare Tunnel, Caddy, whatever — you hit a wall: **WebSocket connections get interrupted, requests fail, and the GUI becomes unusable.**

This post explains why, and what actually works.

## Why reverse proxying DSH breaks

DSH enforces a **loopback trust fence**. The backend checks that incoming requests have `Host` and `Origin` headers pointing to `localhost` (or `127.0.0.1`). When a reverse proxy sits in front, it rewrites these headers — or the browser sends the real domain as the Origin. The WebSocket upgrade handshake fails because the trust check rejects the non-localhost origin.

Even if you manage to get past the initial page load (since static HTTP requests may succeed), the WSS connection that powers the interactive session will not establish — or will drop shortly after. The result: you see the UI shell but nothing works.

This isn't a bug. It's a deliberate security boundary: DSH assumes that if traffic isn't coming from the loopback interface, it shouldn't be trusted without explicit opt-in.

## What actually works

There are three viable approaches, depending on your needs:

### 1. Remote-access plugins (recommended for personal use)

The plugin ecosystem has several purpose-built solutions that run a local proxy child process *inside* DSH, rewriting Host/Origin to pass the trust fence while handling WebSocket upgrades correctly:

- **[dsh-full-remote](/plugins?q=dsh-full-remote)** — Token-gated reverse proxy with full server-side API access (`settings.*`, `credentials.*`, `host.listDirectory`), per-device sessions, optional CIDR/approval/TLS, WebSocket/SSE pass-through. The key differentiator: other plugins lose access to sensitive APIs after proxy, this one doesn't.
- **[dsh-mobile-gate](/plugins?q=mobile-gate)** — LAN-focused gateway with first-visit approval, device token binding, rate limiting, and mobile layout injection.
- **[dsh-Remote](/plugins?q=dsh-Remote)** — Full mobile suite with Android app, Bearer-token gateway, self-healing on LAN/Tailscale, file transfer, and multi-server auto-switch.
- **[dsh-mobile](/plugins?q=dsh-mobile)** — iPhone/iPad focused: explicit Host/Origin rewrite through the loopback trust fence with WebSocket upgrades, plus iOS PWA shell and touch CSS.
- **[dsh-auth-tunnel](/plugins?q=dsh-auth-tunnel)** — Cloudflare Tunnel integration done right: password-gated public access with correct HTTP/WebSocket proxying.

These plugins work because they run *on the same machine as DSH* and proxy traffic through `localhost`, satisfying the trust fence while exposing a second port or tunnel endpoint to the outside.

### 2. dsh-api-gateway (for programmatic / headless access)

If your goal isn't to use the web GUI remotely but to integrate DSH capabilities into other tools or workflows, the **dsh-api-gateway** plugin exposes a REST API layer. This sidesteps the WebSocket problem entirely — HTTP request/response works fine behind any reverse proxy or tunnel.

This is the right choice for:
- CI/CD pipelines that trigger DSH tasks
- Custom frontends that talk to DSH programmatically
- Mobile apps that don't need the full web GUI

### 3. VPN / mesh network (transparent, but heavier)

**Tailscale**, WireGuard, or ZeroTier give your remote device a virtual IP on the same network as the DSH machine. From DSH's perspective, the connection still arrives at `localhost:3080` via the local interface (if you access via `100.x.x.x:3080` on Tailscale, the trust fence still sees a direct connection — no proxy rewrite needed).

The trade-off: every device needs the VPN client installed and authorized.

## What does NOT work

| Approach | Why it fails |
|----------|-------------|
| Nginx reverse proxy | Host/Origin rewrite breaks WSS trust check |
| Cloudflare Tunnel (bare) | Same — CF terminates TLS and forwards with its own headers |
| Caddy / Traefik / HAProxy | Same class of problem — any L7 proxy that touches headers |
| Binding to `0.0.0.0` alone | Trust fence still rejects non-localhost Origin from the browser |

## Practical recommendation

For most people who just want DSH on their phone or a second machine:

1. **Install a remote-access plugin** (start with `dsh-full-remote` or `dsh-auth-tunnel`).
2. The plugin handles the trust fence internally.
3. If you want public access, combine the plugin with a Cloudflare Tunnel pointed at the plugin's proxy port — not at DSH's native 3080.
4. Gate it with authentication (the plugins above all include token/approval mechanisms).

For headless / API-only use cases, use `dsh-api-gateway` and proxy that freely.

## The bigger picture

This is a conscious trade-off in DSH's architecture. The trust fence exists because an AI coding agent with shell access is not something you want accidentally exposed to the internet. The inconvenience of not being able to `nginx proxy_pass` it is the price for a safe default.

The plugin ecosystem has closed the gap — remote access works, it just requires an explicit opt-in via a plugin that understands the trust model. That's the right level of friction for something this powerful.

## Links

- [Plugin directory — Remote & Mobile](/plugins?category=remote-mobile)
- [Quick start](/docs/en/guide/quick-start)
