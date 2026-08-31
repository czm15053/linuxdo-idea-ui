# Linux DO · IM 外观脚本（钉钉 / 飞书 / 企业微信）

一套用户脚本，把 [linux.do](https://linux.do/) 的消息页换成 **钉钉 PC IM**、**飞书 IM** 或 **企业微信** 风格。只换皮，不碰数据——内容、链接、按钮与交互全部保留。

- 一套脚本三种皮肤：钉钉 / 飞书 / 企业微信，中栏顶部一键切换
- 公共内核：投票、小火箭（点赞）、图片灯箱、引用跳转、实时刷新、三态深色（浅色 / 深色 / 跟随系统）、伪装模式（匿名浏览）
- 按 [@match](src/meta.js) 仅在 linux.do 顶层 frame 运行，不注入 iframe 内嵌页

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）
2. 构建产物打开 `dist/linuxdo-im.user.js`，点 **Raw** 后安装；或复制 `src/meta.js` 元数据头
3. 访问 <https://linux.do/>；脚本更新后请硬刷新一次

## 皮肤

| 皮肤 | 风格 | 切换 |
|---|---|---|
| 钉钉 | 钉钉 PC IM（左导航 / 中栏会话 / 右栏聊天） | 中栏顶部皮肤名按钮 |
| 飞书 | 飞书 IM 风格（左 rail / 中栏列表 / 右栏聊天 / 深色切换） | 同左 |
| 企业微信 | 企业微信风格 | 同左 |

三皮肤互斥，同一时刻只启用一个。

## 功能一览

### 三套皮肤 + 一键切换

一套脚本内置三套皮肤（钉钉 / 飞书 / 企业微信），一个按钮下拉即可切换，偏好本地保存：

![三套皮肤预览](snapshot/三套皮肤预览.png)

![皮肤切换按钮](snapshot/皮肤切换按钮.png)

### 消息互动内核

公共能力，三皮肤通用：

![投票](snapshot/投票.png)

*投票卡：单选 / 多选、进度条、可撤销*

![小火箭](snapshot/小火箭.png)

*小火箭：消息下直接跟评 + 快捷 emoji*

![图片灯箱](snapshot/图片灯箱.png)

*图片灯箱：缩放 / 旋转 / 拖拽 / 滚轮*

![楼层跳转](snapshot/楼层跳转.png)

*楼层跳转：滚动高亮目标楼*

![点击跳转和返回楼层](snapshot/点击跳转和返回楼层.png)

*引用原文 / 楼层可点击跳转，并可返回*

### 用户与搜索

![用户信息卡片](snapshot/用户信息卡片.png)

*用户卡片：点头像 / 昵称 / @提及 弹出*

![全局搜索](snapshot/全局搜索.png)

*全局搜索：⌘/Ctrl+K 面板，帖子 / 用户 / 分类 / 标签*

### 原生编辑器

![原生编辑器表情包](snapshot/原生编辑器表情包.png)

*原地重锚嵌入的原生编辑器 + 表情选择器*

![原生编辑器扩展菜单](snapshot/原生编辑器扩展菜单.png)

*「+」扩展菜单与 Markdown 引擎*

## 开发

```bash
cd im
pnpm install        # 安装依赖（pnpm 9）
pnpm build          # 打包 → dist/linuxdo-im.user.js
pnpm check          # 产物语法 + self-check 断言
pnpm lint           # ESLint 9 检查
```

构建单一 IIFE 产物 `dist/linuxdo-im.user.js`，版本号单一来源 `src/meta.js`。

### 目录结构

```
im/
├── src/            # 源码（ES modules）
│   ├── main.js     # 入口
│   ├── meta.js     # UserScript 元数据（@name/@version/@match…）
│   ├── bootstrap.js# 启动 / 皮肤分派 / 互斥避让
│   ├── skins/      # 三皮肤实现 + dispatch
│   ├── ui/         # 三栏 IM 结构（rail/strip/list/chat/composer/titlebar…）
│   ├── bridge/     # Discourse API 封装
│   ├── state/      # 前端状态
│   ├── features/   # 互动能力（投票/点赞/灯箱/引用跳转…）
│   ├── config/     # 常量 / 图标 / 皮肤元信息
│   ├── styles/     # 各皮肤样式
│   └── theme/      # 主题（浅色/深色/跟随系统）
├── scripts/        # 开发辅助（self-check 等）
├── dist/           # 构建产物（gitignore）
├── package.json
└── vite.config.js
```

## 说明

- 全部交互仍由 Discourse 原生处理；本脚本负责外观与交互效率（如原地重锚的编辑器嵌入、全局搜索面板）
- 若与旧版单皮肤脚本同时启用会有避让处理