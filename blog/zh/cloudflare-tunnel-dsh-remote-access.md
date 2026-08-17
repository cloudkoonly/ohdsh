---
title: "用 Cloudflare Tunnel 给 DSH 做内网穿透：真实域名 + HTTPS + Access 认证"
date: 2026-08-17
slug: "cloudflare-tunnel-dsh-remote-access"
tags: ["cloudflare-tunnel", "cloudflared", "deepseek-harness", "内网穿透", "https", "cloudflare-access", "认证"]
status: "published"
excerpt: "用 Cloudflare Tunnel 把本地 DSH Web 界面挂到真实域名上，免费 HTTPS、不用开端口、不用公网 IP，再用 Cloudflare Access 挡在前面，只有你能进。"
---

DSH 的 Web 界面默认只绑 `http://127.0.0.1:3080`。这是对的默认值——只服务本机、什么都不暴露。但一旦你想在手机上用、想在一台 SSH 进去的 VPS 上用，或者只是想要个好记的网址，就得找一条「不用在路由器上开洞」的路。

Cloudflare Tunnel 是我目前试下来最干净的做法。这篇把整套流程走一遍：隧道、HTTPS 域名，以及最容易被跳过的——在入口前加认证。

## 为什么不选端口转发

端口转发是在路由器上开个口、指向内网机器。能用，但等于给扫描器留了个门。其它方案各有各的坑：

- **Tailscale** 是零配置的 mesh VPN，确实好用，但每个想连进来的设备都得装 Tailscale 客户端、加入你的网络。
- **frp / ngrok** 也能用，但 frp 需要一台你控制的服务器，ngrok 免费版给的是随机域名和短时隧道。
- **Cloudflare Tunnel（cloudflared）** 让你的机器向 Cloudflare 建一条**只出不进**的连接。不用开入站端口、不用公网 IP，自己的域名免费上 HTTPS，还能用 Cloudflare Access 在应用前面加一道认证门。

对 DSH 这种单服务场景，「认证直接做在边缘」这一点才是决定性优势。

## 你需要什么

- 一个 DNS 托管在 Cloudflare 上的域名（免费套餐就行）。
- 跑 DSH 的机器，装好 `cloudflared`。
- 大约十分钟。

## 第一步：装 cloudflared

直接下二进制，或者用包管理器：

```bash
# macOS
brew install cloudflared

# Debian / Ubuntu
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

Windows 有安装包，用 Chocolatey 的话 `choco install cloudflared` 也行。

## 第二步：创建隧道

```bash
cloudflared tunnel login          # 打开浏览器，授权你的账号
cloudflared tunnel create dsh     # 打印隧道 ID，并写入凭证文件
```

create 这一步会返回一个隧道 ID（一个 UUID），并把凭证写到 `~/.cloudflared/<id>.json`。两个都留好。

## 第三步：把流量引过来

建一个配置文件（Linux 上是 `/etc/cloudflared/config.yml`）：

```yaml
tunnel: <你的隧道 ID>
credentials-file: /home/<你>/.cloudflared/<你的隧道 ID>.json

ingress:
  - hostname: dsh.example.com
    service: http://localhost:3080
  - service: http_status:404
```

`ingress` 块把域名映射到本地 DSH 端口，末尾那条兜底规则对不匹配的请求一律返回 404，让乱撞的请求到不了你的应用。

再把 DNS 指到隧道：

```bash
cloudflared tunnel route dns dsh dsh.example.com
```

它会帮你创建 CNAME。最后跑起来，并装成服务让它开机自启：

```bash
cloudflared tunnel run dsh        # 前台跑，先做个冒烟测试
cloudflared service install       # 再装成系统服务
```

到这一步，`https://dsh.example.com` 就能通过 HTTPS 访问你的 DSH 界面了。但此刻它也对任何猜中域名的人开放。下一步把它关起来。

## 第四步：用 Cloudflare Access 上锁

Cloudflare Access 在 Zero Trust 控制台里（50 个用户以内免费）。原理很简单：请求在到达你的源站**之前**就被检查。

1. 在 **Zero Trust → Access → Applications** 里，给 `dsh.example.com` 加一个自托管应用。
2. 加一条策略。个人用先上 **Email OTP**——往你控制的邮箱发一次性验证码；想要登录按钮就选 Google / GitHub OAuth。
3. 保存。现在未登录的访客看到的是 Cloudflare 的登录页，而不是你的 DSH 界面。

个人场景 Email OTP 摩擦最小：不用配身份提供商，又是一道实打实的门。要团队共享，就换成正经 IdP（Google Workspace、GitHub 组织等），把策略限定到那个组。

## DSH 内部再补一层

Cloudflare Access 守的是边缘。DSH 内部再加一层也划算——纵深防御在这里成本很低。插件目录里有几个正好用得上：

- [dsh-mobile-gate](/zh/plugins?q=mobile-gate) —— 反向代理 + 首次访问审批 + 设备令牌绑定 + 限流。
- [dsh-Remote](/zh/plugins?q=dsh-Remote) —— 移动端远程控制套件，带 Bearer 令牌网关，局域网/Tailscale 下自愈。
- [dsh-web-lan-access](/zh/plugins?q=web-lan-access) —— 注入 `crypto.randomUUID` polyfill，让前端在纯 HTTP、非 localhost 源下不崩。

它们各管各的活，但背后的原则一致：别让隧道成为唯一的门。

## 该知道的坑

- **DSH 保持绑在 `127.0.0.1`。**要是改成 `0.0.0.0`，端口就在所有网卡上开放，等于把隧道本想避免的事又做了一遍。让隧道成为唯一入口。
- **别不带 Access 就上线。**裸隧道 + 好猜的域名，就是一个公开的 Web 应用。认证这一步不是可选项。
- **Cloudflare 在中间终结 TLS。**流量从浏览器到 Cloudflare 是加密的，隧道内到源站再加密一次。这很安全，但 Cloudflare 在边缘确实能看到明文——如果你的威胁模型包含「不让 CDN 看到流量」，得知道这一点。
- **流式基本没问题。**DSH 的 SSE 和 WebSocket 流量走隧道都正常。要是有插件用长连接做点特殊操作、你看到怪现象，先往这里查。

## 一句话版

装 `cloudflared` → 建隧道 → 把 `dsh.example.com` 映射到 `localhost:3080` → 配 DNS → 装成服务 → 用 Cloudflare Access 加个 Email OTP 策略 → 再补一个应用内认证插件，齐活。

要是 DSH 本身还是第一次搭，从[快速开始](/docs/zh/guide/quick-start)入手。上面那些认证和远程访问插件都在[插件目录](/zh/plugins)里；如果是跑在服务器上，还可以看看[通知与集成类插件](/zh/plugins?category=notifications-integrations)，把 DSH 接进团队已经在用的工具里。
