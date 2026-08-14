---
title: 快速开始
description: 两分钟内上手 DeepSeek Harness 插件 —— 用 oh! dsh 查找、安装并运行你的第一个插件。
order: 1
---

# 快速开始

两分钟内安装你的第一个 DeepSeek Harness 插件。

## 第一步：挑选插件

浏览[插件目录](../plugins/index.md)，选择一个符合你需求的插件。每个条目都说明了该插件的作用及适用场景。

## 第二步：安装插件

将插件加入你的 DSH 组合（例如智能体预设或 `cordis.yml`）：

```yaml
- plugin: <plugin-id>
```

然后重启 harness，让插件行完成挂载。

## 第三步：验证生效

检查插件是否已贡献其能力：

```bash
dsh status
```

你应该能在列表中看到该插件及其提供的服务和工具。

## 下一步

- 在添加更多插件前，先阅读[最佳实践](best-practices.md)
- 了解 DeepSeek Harness 组合结构
- 需要英文文档？请阅读 [Quick Start](../../en/guide/quick-start.md)
