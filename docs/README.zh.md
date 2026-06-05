# MangaTranslator Extension

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688)
![Portable](https://img.shields.io/badge/Windows-portable-0078D4)

面向 Chromium 系浏览器的本地漫画页面翻译扩展，使用 FastAPI 后端和随附的 MangaTranslator 管线。

[English](../README.md) · [Tiếng Việt](README.vi.md)

## 功能亮点

- 页面漫画/Comic 图片扫描器，支持选择图片并批量翻译。
- 自动翻译模式，可在阅读时替换为已翻译图片。
- 支持气泡内文字和气泡外文字，默认使用轻量清理方式。
- 源语言/目标语言选项：日语、韩语、英语和越南语。
- 扩展界面语言：默认英语，另有越南语、中文、日语和韩语。
- OpenAI-compatible 模型选择器，以及 Google、OpenAI、Anthropic、xAI、DeepSeek、Z.ai、Moonshot AI 和 OpenRouter 等 provider。
- 可通过 `start-backend.bat` 或 `backend/main.py` 启动 portable 后端。

## 项目结构

```text
manga-translator-extension/
  backend/                 FastAPI 后端和 MangaTranslator 集成
  backend/main.py          后端入口
  backend/core/            检测、清理、翻译和文字渲染代码
  backend/models/          Pydantic API schema
  backend/pipeline/        core pipeline 的 wrapper
  extension/               Manifest V3 浏览器扩展
  extension/src/popup/     弹窗 UI
  extension/src/shared/    共享 types、constants 和 i18n
  extension/src/background 后台 service worker
  extension/src/content-script 页面扫描器和自动翻译 overlay
  docs/                    API 和本地化文档
```

## 快速开始

启动后端：

```powershell
cd manga-translator-extension
.\start-backend.bat
```

或直接运行：

```powershell
cd manga-translator-extension\backend
python main.py
```

对于此 portable build，如果需要 CUDA/GPU 包，建议使用 `backend\runtime\python.exe` 或随附的 `MangaTranslator\runtime\python.exe`。

构建扩展：

```powershell
cd manga-translator-extension\extension
npm install
npm run build
```

在 Chrome 或 Edge 中以 unpacked extension 加载 `extension/dist/`。

## 配置

打开扩展弹窗：

- `Translate`：选择源语言/目标语言，并启用气泡外文字翻译。
- `LLM Config`：配置 provider、model、API key、sampling values 和 special instructions。
- `Config`：切换扩展语言并设置 backend URL。

默认 backend URL 为 `http://localhost:7677`。

## Runtime 打包

当 Python runtime 位于以下路径时，本项目可以作为 portable 文件夹运行：

```text
manga-translator-extension/backend/runtime/
```

Runtime 体积很大，应作为 release asset 或本地 portable archive 分发，不应提交到普通 GitHub repository。GitHub 会阻止普通 Git 历史中超过 100 MB 的文件，而此 runtime 有数 GB。

## 开发

最低检查：

```powershell
cd manga-translator-extension\extension
npm run build

cd ..\backend
python -m py_compile pipeline\wrapper.py
```

后端 health check：

```powershell
Invoke-RestMethod http://localhost:7677/health
```

## 安全

不要提交 API key、个人 backend URL、生成的 cache、model artifact、`node_modules`、`dist` 或完整 Python runtime。请通过扩展弹窗或环境变量保存 provider key，例如 `GOOGLE_API_KEY`、`OPENAI_API_KEY` 和 `ANTHROPIC_API_KEY`。

## License

此 portable build 包含源自 MangaTranslator 的代码。重新分发时请保留 upstream license 要求。
