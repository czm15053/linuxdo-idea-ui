# Linux DO · JetBrains / Darcula 外观

油猴脚本：把 [linux.do](https://linux.do/) 换成 **JetBrains IDE / Darcula** 风格。

本仓库是 [czm15053/linuxdo-idea-ui](https://github.com/czm15053/linuxdo-idea-ui) 的 fork，默认外观为 **GoLand**，帖子按 Go 源码风格渲染。点击顶栏品牌标可在 GoLand → IntelliJ IDEA → PyCharm 之间循环。

只换皮，不碰数据——内容、链接、按钮与交互全部保留。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）
2. 打开 [`linuxdo-idea.user.js`](./linuxdo-idea.user.js)，点 **Raw** 后安装
3. 访问 <https://linux.do/>；脚本更新后请硬刷新一次

Raw 直链：

```text
https://github.com/Q-xuan/linuxdo-idea-ui/raw/main/linuxdo-idea.user.js
```

## 功能

- **GoLand / IDEA / PyCharm 切换**：点击顶栏品牌标循环产品，选择写入 `localStorage`；未设置时默认 **GoLand**
- **主页**：话题列表伪装为 **Git Log**（多泳道 SVG 图谱）
- **话题页**：帖子渲染为代码编辑器阅读区（随产品切换 Go / Java / Python 风）
- **回帖**：混合语句模板；过短的回帖会补少量样板行
- **代码行内图片**：默认收起，悬停预览，点击固定
- **侧栏**：Project View 风格（路径栏、黄文件夹、箭头与选中色；GoLand 下为 `cmd` / `internal` / `testdata` / `scratch`）
- **工具窗条**：左右两侧 IDE 风格条带（Project / Commit / Go / Database 等装饰按钮，窄屏自动隐藏）
- **加载页面 / favicon / 菜单**：偏 IDE 壳层；通知区接近 Event Log；状态栏随产品切换（如 `UTF-8 · tabs · Go · Darcula`）
- **颜色模式**：跟随 linux.do 浅色 / 深色 / 自动；深色对齐 Darcula
- **SPA**：站内跳转与前进后退后自动重新套用样式

## 截图

下列快照仍来自上游的 IDEA / PyCharm 外观，尚未重拍 GoLand 默认态。

| | |
| --- | --- |
| 加载页面 | ![Splash](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/splash.png) |
| 主页 Git Log | ![Home](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/home-git-log.png) |
| 话题 · IDEA | ![Topic IDEA](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/topic-idea.png) |
| 话题 · PyCharm | ![Topic PyCharm](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/topic-pycharm.png) |
| Hover 链接显示图片 | ![Image hover](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/image-hover.png) |

## License

MIT © czm15053

JetBrains、IntelliJ IDEA、PyCharm、GoLand 均为 JetBrains s.r.o. 商标。本项目为非官方、非关联作品。

## 友链

- [linux.do](https://linux.do/)
