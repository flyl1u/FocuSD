<div align="center">
  <img src="src-tauri/icons/128x128.png" alt="FocuSD Island logo" width="96" height="96">

  <h1>FocuSD Island</h1>

  <p>一款 Windows 优先的桌面灵动岛，把待办、剪贴板、Codex 状态和快捷翻译放在屏幕顶部。</p>

  <p>
    <a href="https://github.com/flyl1u/FocuSD/releases/latest">下载 Release</a>
    ·
    <a href="https://github.com/flyl1u/FocuSD/issues">反馈 Issue</a>
  </p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.2.4-blue">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows-0078D4">
    <img alt="Tauri" src="https://img.shields.io/badge/Tauri-2-24C8DB">
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB">
  </p>
</div>

## What is this? 这是什么？

这是一款 Windows 优先的桌面灵动岛，把待办、剪贴板、Codex 状态和快捷翻译放在屏幕顶部。

FocuSD 以轻量、无边框、始终置顶的悬浮岛形式运行。它会在需要时展开，用完后回到紧凑状态，减少为了获取一条信息而切换窗口的次数。

## Why I built this？ 我为什么做它？

在日常工作或学习过程中，我经常需要在 Obsidian 里写下 Todo List，为了隔绝噪音，我还会打开音乐软件并把音量调到合适的临界点，工作和学习又经常需要借助翻译网站，同时还会反复复制和粘贴代码、密码或文档片段等等

在这些界面之间来回切换，不仅会降低效率，也容易让人分心，因此我开始思考：能不能把这些高频功能集成到一个足够轻量的地方？

我想到了苹果的灵动岛，它把外卖配送、计时器、媒体控制等信息集中到一个小岛上，缩短了我们获取信息的路程。于是，FocuSD 诞生了。这个名字寓意 **Focu Study and DeepWork**，专注学习和深度工作，项目使用更轻量的 Tauri 架构开发

## Features 解决了什么问题？

FocuSD 想解决的核心问题，是工作和学习过程中频繁的窗口切换。

它把一些高频、但原本分散在不同软件中的操作放到了屏幕顶部：

- **Todo List**：随手记录和查看当前待办，不需要反复打开笔记软件。
- **Clipboard**：快速找到最近复制过的内容，减少重复查找和复制。
- **Codex Status**：随时查看 Codex 当前任务状态，不需要频繁切回窗口确认进度。
- **Quick Translate**：复制选中的文字后快速翻译，减少在浏览器和翻译工具之间来回跳转。

这些功能本身并不复杂，FocuSD 真正想做的是**缩短获取高频信息的路径**：需要的时候看一眼屏幕顶部，用完之后继续专注于当前的事情

## Demo 实际效果

下面是 FocuSD 的功能演示：

<a href="https://raw.githubusercontent.com/flyl1u/FocuSD/main/docs/demo.mp4">
  <img src="https://raw.githubusercontent.com/flyl1u/FocuSD/ac9ba9e0d61a8f779a66bb0b5a52ccef3e515ef7/docs/demo-preview.gif" alt="FocuSD Demo 预览">
</a>

点击上方预览图可以打开完整视频，也可以直接[下载 Demo 视频](https://raw.githubusercontent.com/flyl1u/FocuSD/main/docs/demo.mp4)。

## Tech Stack 如何使用

项目使用以下技术构建：

- Tauri 2：Windows 桌面应用外壳和原生能力
- React 19 + TypeScript：前端界面和交互
- Rust：窗口、快捷键、剪贴板、媒体和文件等桌面能力
- pnpm：依赖安装与项目脚本

### 从源码构建

需要 Windows 10/11、Node.js、pnpm、Rust、Visual Studio C++ Build Tools 和 WebView2 Runtime。

```powershell
git clone https://github.com/flyl1u/FocuSD.git
cd FocuSD
pnpm install
pnpm tauri dev
```

### 构建 Release

```powershell
pnpm tauri build
```

构建完成后，安装包位于：

- `src-tauri/target/release/bundle/nsis/FocuSD Island_版本号_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/FocuSD Island_版本号_x64_en-US.msi`

也可以直接从 [GitHub Releases](https://github.com/flyl1u/FocuSD/releases/latest) 下载 Windows x64 安装包。

## Star History 增长趋势

<a href="https://www.star-history.com/?repos=flyl1u%2Ffocusd&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&legend=top-left" />
  </picture>
</a>

---

# English

## What is this?

FocuSD Island is a Windows-first desktop island that puts your Todo List, clipboard, Codex status, and quick translation at the top of the screen.

It runs as a lightweight, borderless, always-on-top floating island. Expand it when you need information, then return to the compact state and keep working.

## Why I built this

During everyday work and study, I often write Todo Lists in Obsidian, open music to block out noise, use translation websites, and copy or paste code, passwords, and document snippets.

Switching between all those windows reduces efficiency and makes it easier to lose focus. I wanted to bring these frequent actions into one lightweight place.

Apple's Dynamic Island was an inspiration: it gathers delivery updates, timers, media controls, and other information into one small surface. FocuSD follows the same idea for focused study and deep work. The name stands for **Focu Study and DeepWork**, and the app is built with the lightweight Tauri framework.

## Features

FocuSD is designed to reduce the number of window switches during work and study:

- **Todo List**: write down and review current tasks without reopening a notes app.
- **Clipboard**: find recently copied content quickly instead of searching for it again.
- **Codex Status**: check the current Codex task state without switching back to Codex.
- **Quick Translate**: copy selected text and translate it without jumping between a browser and a translation website.

The goal is simple: shorten the path to high-frequency information so you can look at the top of the screen and return to your work.

## Screenshots / Demo

<a href="https://raw.githubusercontent.com/flyl1u/FocuSD/main/docs/demo.mp4">
  <img src="https://raw.githubusercontent.com/flyl1u/FocuSD/ac9ba9e0d61a8f779a66bb0b5a52ccef3e515ef7/docs/demo-preview.gif" alt="FocuSD Demo preview">
</a>

Click the preview to open the full demo, or [download the demo video](https://raw.githubusercontent.com/flyl1u/FocuSD/main/docs/demo.mp4).

## Tech Stack / How to use

- Tauri 2 for the Windows desktop shell and native capabilities
- React 19 + TypeScript for the interface and interactions
- Rust for windows, shortcuts, clipboard, media, and file capabilities
- pnpm for dependency management and project scripts

### Build from source

You need Windows 10/11, Node.js, pnpm, Rust, Visual Studio C++ Build Tools, and WebView2 Runtime.

```powershell
git clone https://github.com/flyl1u/FocuSD.git
cd FocuSD
pnpm install
pnpm tauri dev
```

### Build a release

```powershell
pnpm tauri build
```

The generated installers are placed in:

- `src-tauri/target/release/bundle/nsis/FocuSD Island_VERSION_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/FocuSD Island_VERSION_x64_en-US.msi`

You can also download the latest Windows x64 installers from [GitHub Releases](https://github.com/flyl1u/FocuSD/releases/latest).

## Star History

<a href="https://www.star-history.com/?repos=flyl1u%2Ffocusd&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&legend=top-left" />
  </picture>
</a>
