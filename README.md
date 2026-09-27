<div align="center">
  <img src="src-tauri/icons/128x128.png" alt="FocuSD Island 图标" width="96" height="96">

  <h1>FocuSD Island</h1>

  <p>把待办、剪贴板、Codex状态和快捷翻译放在屏幕顶部的Windows灵动岛</p>

  <p>
    <a href="https://github.com/flyl1u/FocuSD/releases/latest">下载 Windows 版</a>
    ·
    <a href="https://github.com/flyl1u/FocuSD/issues">反馈问题</a>
  </p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.2.4-blue">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows-0078D4">
    <img alt="Tauri" src="https://img.shields.io/badge/Tauri-2-24C8DB">
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB">
  </p>
</div>

## 它能做什么

FocuSD Island 平时以紧凑的小岛停靠在屏幕顶部，需要时展开操作。窗口无边框、始终置顶，可设置折叠和展开后的尺寸，也可从托盘管理。

| 功能 | 用法 |
| --- | --- |
| 待办与每日笔记 | 安排今日任务、标记当前专注任务、拖动排序、回顾跨天归档；每日内容可保存为本地 Markdown。 |
| 剪贴板历史 | 记录文本与图片，按内容或备注搜索，收藏常用片段并再次复制。 |
| Codex 状态灯 | 在岛屿上查看 Codex 任务的运行、完成、失败或中断状态。 |
| 快捷翻译 | 按 `Alt+C` 打开置顶翻译窗，使用 DeepSeek 进行中英互译。 |
| 媒体与外观 | 控制系统媒体，调整岛屿布局、颜色、透明度和样式预设。 |

## 下载与安装

面向 Windows 10/11。打开 [GitHub Releases](https://github.com/flyl1u/FocuSD/releases/latest)，下载适合你的 x64 安装包：

- `FocuSD Island_0.2.4_x64-setup.exe`：常规安装程序，推荐多数用户使用。
- `FocuSD Island_0.2.4_x64_en-US.msi`：适合需要 MSI 安装包的环境。

运行安装包并按提示完成安装。应用使用 WebView2；如果系统尚未安装，需先安装 Microsoft Edge WebView2 Runtime。

## 使用指南

### 悬浮岛与日常记录

展开岛屿即可添加待办、设置当前专注任务和写每日笔记。你可以在设置中分别调整折叠岛与展开岛的尺寸；新用户默认值分别为 `0.82` 和 `0.91`。需要保存每日内容时，在设置中选择 Markdown 文件夹，应用会按 `YYYY-MM-DD.md` 写入。默认 Todo 文件夹为 `%USERPROFILE%\Documents\FocuSD`。

剪贴板历史支持文本、图片、备注、搜索和收藏。它与快捷翻译读取的系统剪贴板是两个功能：即使没有打开历史面板，翻译窗的 `Tab` 仍会读取当前最新复制的文本。

### 快捷翻译

按 `Alt+C` 或点击岛屿中的翻译按钮打开翻译窗；再次按快捷键或点击关闭按钮即可隐藏。翻译窗默认居中并保持置顶，可以拖动标题栏移动，也可以拖动右侧、下侧和右下角调整大小。本次运行期间会记住你调整后的位置与尺寸。

| 操作 | 效果 |
| --- | --- |
| `Tab` | 在翻译主界面的任意控件上，重新读取**当前**文本剪贴板并替换原文。 |
| `Enter` | 翻译原文。 |
| `Shift+Enter` | 在原文中换行。 |
| `Alt+C` | 打开或关闭翻译窗；可在翻译设置中修改。 |

可选择自动识别、中文译英文或英文译中文。翻译由 DeepSeek API 提供，首次使用时请在翻译窗设置中填入自己的 API 密钥。密钥存入本机 Windows 凭据管理器；只有发起翻译时，原文才会发送至 DeepSeek。单次最多翻译 5,000 字。

如果 `Alt+C` 已被其他软件占用，请在翻译设置中录入新的全局快捷键。

### Codex 状态灯

在 **设置 → AI Agent 状态灯** 中点击 **安装/修复**，然后前往 Codex 的 **设置 → Hooks**（CLI 使用 `/hooks`），找到两条 **Updating FocuSD agent status**，审核并信任它们，最后重启 Codex。未经信任的 hook 可能被 Codex 跳过。

状态文件位于 `%APPDATA%\com.focusd.island\agent-status.json`。

## 数据与隐私

待办、笔记、归档、外观和翻译偏好保存在本机。剪贴板历史与 Codex 状态保存在应用数据目录；你选择 Markdown 保存目录后，每日内容也会写入该目录。DeepSeek API 密钥保存在 Windows 凭据管理器，翻译原文会在你主动翻译时发送给 DeepSeek。

## 从源码构建

需要 Windows 10/11、Node.js、pnpm、Rust、Visual Studio C++ Build Tools 和 WebView2 Runtime。

```powershell
git clone https://github.com/flyl1u/FocuSD.git
cd FocuSD
pnpm install
pnpm tauri dev
```

构建供 GitHub Release 上传的安装包：

```powershell
pnpm tauri build
```

构建完成后，独立程序位于 `src-tauri/target/release/focusd-island.exe`，NSIS 安装包位于 `src-tauri/target/release/bundle/nsis/`，MSI 位于 `src-tauri/target/release/bundle/msi/`。

## 反馈与许可

欢迎通过 [Issue](https://github.com/flyl1u/FocuSD/issues) 反馈问题，并附上 Windows 版本、应用版本、复现步骤及截图。仓库目前尚未声明开源许可证。

---
## Star History

<a href="https://www.star-history.com/?repos=flyl1u%2Ffocusd&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=flyl1u/focusd&type=date&legend=top-left" />
 </picture>
</a>
---

## English

FocuSD Island is an always-on-top Windows desktop island for tasks, daily notes, clipboard history, Codex status, media controls, and quick Chinese–English translation.

Download the x64 `.exe` installer or `.msi` package from [GitHub Releases](https://github.com/flyl1u/FocuSD/releases/latest). To build from source, install Node.js, pnpm, Rust, Visual Studio C++ Build Tools, and WebView2, then run `pnpm install` and `pnpm tauri build`.

Press `Alt+C` to open the DeepSeek translation window. Press `Tab` anywhere in its main view to read the **current text clipboard** and replace the source text, `Enter` to translate, or `Shift+Enter` for a new line. Add your own DeepSeek API key in translation settings; it is stored in Windows Credential Manager. Translation text is sent to DeepSeek only when you request a translation. The window stays on top and can be moved or resized.

To enable the Codex status light, use **Settings → AI Agent status light → Install/Repair**, trust both **Updating FocuSD agent status** hooks in Codex, and restart Codex.
