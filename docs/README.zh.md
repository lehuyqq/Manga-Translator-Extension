# MangaTranslator Extension

面向 Chromium 浏览器的本地漫画页面翻译扩展，使用 FastAPI 后端和随附的 MangaTranslator 管线。

[English](../README.md) · [Tiếng Việt](README.vi.md)

## 主要功能

- 扫描网页上的漫画/Comic 图片，并支持批量翻译。
- 自动翻译模式，阅读时替换为已翻译图片。
- 支持气泡内文字和气泡外文字，默认使用轻量清理方式。
- 主要翻译语言：日语、韩语、英语、越南语。
- 扩展界面语言：默认英语，另有越南语、中文、日语、韩语。
- 支持 OpenAI-compatible 模型选择，以及 Google、OpenAI、Anthropic、xAI、DeepSeek、Z.ai、Moonshot AI、OpenRouter 等服务商。
- 可通过 `start-backend.bat` 或 `backend/main.py` 启动便携式后端。

## 快速开始

```powershell
cd manga-translator-extension
.\start-backend.bat
```

构建扩展：

```powershell
cd manga-translator-extension\extension
npm install
npm run build
```

然后在 Chrome 或 Edge 中以 unpacked extension 加载 `extension/dist/`。

## 配置

在扩展弹窗中：

- `Translate`：选择源语言/目标语言，并开启气泡外文字翻译。
- `LLM Config`：配置服务商、模型、API key 和额外指令。
- `Config`：切换扩展界面语言并设置后端 URL。

默认后端 URL 为 `http://localhost:7677`。

## 便携式运行环境

Python runtime 可以放在：

```text
manga-translator-extension/backend/runtime/
```

该 runtime 体积很大，应作为 release asset 或本地便携压缩包分发。不建议直接提交到普通 GitHub 仓库，因为 GitHub 对常规 Git 历史中的单文件限制为 100 MB，而该 runtime 通常有数 GB。
