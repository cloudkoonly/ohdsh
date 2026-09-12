---
subject: "【DSH Weekly #005】V4.1 Flash 改写价目表，Harness 换了会话格式"
from: "support@ohdsh.com"
from_name: "Oh! dsh 周刊"
tag: "newsletter_ohdsh_zh"
status: "ready"
---

你好，

这是 Oh! dsh 周刊（DSH Weekly）中文版第 5 期。本周的主线是「变便宜」和「变不稳」：模型层在降价，运行时层在连发版本。

## DeepSeek：最小的模型，让旗舰退场

9 月 10 日，DeepSeek 发布 V4.1 Flash：552B 参数 MoE、新 Causal Encoder-Decoder 结构（输入激活 8B、输出 16B）、原生多模态、1M 上下文，权重以 MIT 协议开源。同一天，Flash 系列价格下调最高 60%——缓存命中降到 0.02 元/百万 token，输出只降 11%。

更值得注意的动作是：官方称 Flash 全面超过 V4 Pro，并宣布 9 月 14 日 12:00 起把 `deepseek-v4-pro` 的请求全部路由到 V4.1 Flash、按 Flash 计费，直到 V4.1 Pro 出现。另外，官方表格里也写了 Flash 落后于 V4 Pro 的地方：SimpleQA-Verified（42.3% 对 55.2%）、LongBench-V2（45.2% 对 51.5%）、不带工具的 HLE（36.8% 对 42.7%）。如果你的负载偏知识型而非 agent 型，这次改动是降级，不是升级。

## DSH：四天四个版本，其中一个是单行道

- **09-07 v0.1.3-alpha.2** —— pi-ai 升级、Web「在应用中打开」、子代理消息排队与 Steer
- **09-08 v0.1.5-alpha.1** —— **会话格式升级 V3**：历史会话被重写、原文件保留，但升级后的会话无法被旧版本读取；同时删除了 `ctx.agent`，`Inbox` 改为纯类型接口
- **09-10 v0.1.5-rc.1** —— 适配器新增 `DeepSeek-V41-Flash`，**新会话默认用它**；任意文件上传、Sidebar 预览、代理变量支持；`minimal` 配置默认只启用 shell
- **09-10 v0.1.5-rc.2** —— 反馈提交改为弹窗确认，界面细节整理

升级前请备份：V3 是单行道。

## AI 圈其他事

- 英伟达以超 129 亿美元收购 Hugging Face，开源权重集散地的中立性成了问题
- OpenAI 推出 GPT-Image 2.5（延迟约降 50%），并与三星联合开发下一代芯片
- Anthropic 的 Fable 5.1 / Mythos 5.1 把成本最多压低 45%
- 有报道称 DeepSeek 已启动科创板上市筹备，中信证券进场尽调

## 本周博文

- [DeepSeek V4.1 Flash 上线：进步在哪，哪里仍落后 V4 Pro](https://ohdsh.com/blog/zh/deepseek-v4-1-flash)
- [DeepSeek 下调 Flash 价格：真正的主角是缓存命中价](https://ohdsh.com/blog/zh/deepseek-flash-price-cut)

[阅读完整周刊 →](https://ohdsh.com/zh/newsletter/dsh-weekly-005)

—— Oh! dsh 编辑团队
