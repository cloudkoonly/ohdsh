---
title: "Expose DSH on a Real Domain: Cloudflare Tunnel + HTTPS + Access Auth"
date: 2026-08-17
slug: "cloudflare-tunnel-dsh-remote-access"
tags: ["cloudflare-tunnel", "cloudflared", "deepseek-harness", "remote-access", "https", "cloudflare-access", "authentication"]
status: "published"
excerpt: "Put your local DSH web GUI on a real domain with HTTPS using Cloudflare Tunnel — no open ports, no public IP — and gate it with Cloudflare Access so only you get in."
---

DSH's web GUI binds to `http://127.0.0.1:3080` by default. That's the right default — localhost only, nothing exposed. But the moment you want it on your phone, on a VPS you SSH into, or just on a memorable URL, you need a way in that doesn't mean poking a hole in your router.

Cloudflare Tunnel is the cleanest way I've found to do that. This post walks through the whole thing: the tunnel, the HTTPS domain, and — the part people skip — putting authentication in front of it.

## Why a tunnel instead of port forwarding

Port forwarding means opening a port on your router and pointing it at the machine. It works, and it's also a standing invitation for scanners. The other options each have a catch:

- **Tailscale** is a zero-config mesh VPN and genuinely great, but every device that wants in needs the Tailscale client and membership in your tailnet.
- **frp / ngrok** work, but frp wants a server you control and ngrok's free tier gives you a random hostname and short tunnels.
- **Cloudflare Tunnel (cloudflared)** makes an *outbound-only* connection from your machine to Cloudflare. No inbound port, no public IP, free HTTPS on your own domain, and Cloudflare Access available as an auth gate in front of the app.

For a single service like DSH, that last part — auth built into the edge — is what tips it.

## What you need

- A domain whose DNS lives on Cloudflare (free plan is fine).
- The machine that runs DSH, with `cloudflared` installed.
- About ten minutes.

## Step 1: install cloudflared

Grab the binary or use your package manager:

```bash
# macOS
brew install cloudflared

# Debian / Ubuntu
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

Windows has an installer; `choco install cloudflared` also works if you use Chocolatey.

## Step 2: create the tunnel

```bash
cloudflared tunnel login          # opens a browser, authorizes your account
cloudflared tunnel create dsh     # prints a tunnel ID and writes a credentials file
```

The create step returns a tunnel ID (a UUID) and a credentials file under `~/.cloudflared/<id>.json`. Hold on to both.

## Step 3: route the traffic

Create a config file (on Linux, `/etc/cloudflared/config.yml`):

```yaml
tunnel: <your-tunnel-id>
credentials-file: /home/<you>/.cloudflared/<your-tunnel-id>.json

ingress:
  - hostname: dsh.example.com
    service: http://localhost:3080
  - service: http_status:404
```

The `ingress` block maps the hostname to your local DSH port. The trailing catch-all returns 404 for anything that doesn't match, so random requests to your tunnel don't reach your app.

Then point DNS at the tunnel:

```bash
cloudflared tunnel route dns dsh dsh.example.com
```

That creates the CNAME for you. Finally, run it — and install it as a service so it survives reboots:

```bash
cloudflared tunnel run dsh        # foreground, for a first smoke test
cloudflared service install       # then run as a system service
```

At this point `https://dsh.example.com` serves your DSH GUI over HTTPS. It's also, right now, open to anyone who guesses the domain. Fix that next.

## Step 4: gate it with Cloudflare Access

Cloudflare Access lives under the Zero Trust dashboard (free for up to 50 users). The idea is simple: requests are checked *before* they ever reach your origin.

1. In **Zero Trust → Access → Applications**, add a self-hosted application for `dsh.example.com`.
2. Add a policy. Start with **Email OTP** — a one-time code to an address you control — or use Google / GitHub OAuth if you prefer a login button.
3. Save. Now an unauthenticated visitor gets Cloudflare's login screen instead of your DSH UI.

Email OTP is the least friction option for a personal setup: no identity provider to configure, and it's still a real gate. For anything shared with a team, switch to a proper IdP (Google Workspace, GitHub org, etc.) and scope the policy to that group.

## The DSH-side layer

Cloudflare Access protects the edge. It's also worth adding a second layer inside DSH itself, because defense in depth is cheap here. The plugin directory has a few that fit:

- [dsh-mobile-gate](/plugins?q=mobile-gate) — a reverse proxy with first-visit approval, per-device token binding, and rate limiting.
- [dsh-Remote](/plugins?q=dsh-Remote) — a mobile remote-control suite with a Bearer-token gateway and self-healing on LAN/Tailscale.
- [dsh-web-lan-access](/plugins?q=web-lan-access) — a `crypto.randomUUID` polyfill so the frontend survives plain-HTTP and non-localhost origins.

They're different tools for different jobs, but the shared principle is the same: don't let the tunnel be your only door.

## Gotchas worth knowing

- **Keep DSH bound to `127.0.0.1`.** If you switch it to `0.0.0.0`, the port is open on every interface, and you've re-created the thing the tunnel was supposed to avoid. Let the tunnel be the only entry point.
- **Don't ship the tunnel without Access.** A bare tunnel + a guessable hostname is a public web app. The auth step is not optional.
- **Cloudflare terminates TLS.** Traffic is encrypted from the browser to Cloudflare, then re-encrypted inside the tunnel to your origin. That's secure, but Cloudflare does see the traffic in plaintext at the edge — know that if your threat model includes "don't let a CDN see this."
- **Streaming works, mostly.** DSH's SSE and WebSocket traffic flows through the tunnel fine. If a plugin does something exotic with long-lived connections and you see odd behavior, that's the first place to look.

## Shorter version

Install `cloudflared` → create a tunnel → map `dsh.example.com` to `localhost:3080` → route DNS → run as a service → put an Email OTP policy in front with Cloudflare Access → add an in-app auth plugin for good measure.

If you're setting up DSH itself for the first time, start with the [quick start](/docs/en/guide/quick-start). The full [plugin directory](/plugins) is where the auth and remote-access plugins above live, and if you're running this on a server you also want to think about [integration plugins](/plugins?category=notifications-integrations) for wiring DSH into the tools your team already uses.
