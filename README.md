# MangaTranslator Extension

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688)
![Portable](https://img.shields.io/badge/Windows-portable-0078D4)

Local manga page translation for Chromium-based browsers, powered by a FastAPI backend and a bundled MangaTranslator pipeline.

[Tiếng Việt](docs/README.vi.md) · [中文](docs/README.zh.md)

## Highlights

- Page scanner for manga/comic images with selectable batch translation.
- Auto-translate mode that replaces images as you read.
- Bubble text and outside-bubble text support, with lightweight cleanup by default.
- Source/target options for Japanese, Korean, English, and Vietnamese.
- Extension UI languages: English by default, plus Vietnamese, Chinese, Japanese, and Korean.
- OpenAI-compatible model picker plus Google, OpenAI, Anthropic, xAI, DeepSeek, Z.ai, Moonshot AI, and OpenRouter provider options.
- Portable backend startup through `start-backend.bat` or `backend/main.py`.

## Project Layout

```text
manga-translator-extension/
  backend/                 FastAPI backend and MangaTranslator integration
  backend/main.py          Backend entry point
  backend/core/            Detection, cleanup, translation, and rendering code
  backend/models/          Pydantic API schemas
  backend/pipeline/        Wrapper around the core pipeline
  extension/               Manifest V3 browser extension
  extension/src/popup/     Popup UI
  extension/src/shared/    Shared types, constants, and i18n
  extension/src/background Background service worker
  extension/src/content-script Page scanner and auto-translate overlay
  docs/                    API and localized documentation
```

## Quick Start

Start the backend:

```powershell
cd manga-translator-extension
.\start-backend.bat
```

Or run it directly:

```powershell
cd manga-translator-extension\backend
python main.py
```

For this portable build, prefer `backend\runtime\python.exe` or the bundled `MangaTranslator\runtime\python.exe` when CUDA/GPU packages are required.

Build the extension:

```powershell
cd manga-translator-extension\extension
npm install
npm run build
```

Load `extension/dist/` as an unpacked extension in Chrome or Edge.

## Configuration

Open the extension popup:

- `Translate`: choose source/target language and outside-bubble text translation.
- `LLM Config`: configure provider, model, API key, sampling values, and special instructions.
- `Config`: switch extension language and set the backend URL.

The backend URL defaults to `http://localhost:7677`.

## Runtime Packaging

This project can run as a portable folder when the Python runtime is present at:

```text
manga-translator-extension/backend/runtime/
```

The runtime is large and should be distributed as a release asset or local portable archive, not committed into a normal GitHub repository. GitHub blocks files over 100 MB in regular Git history, and this runtime is several GB.

## Development

Minimum checks:

```powershell
cd manga-translator-extension\extension
npm run build

cd ..\backend
python -m py_compile pipeline\wrapper.py
```

Backend health check:

```powershell
Invoke-RestMethod http://localhost:7677/health
```

## Security

Do not commit API keys, local backend URLs, generated caches, model artifacts, `node_modules`, `dist`, or a full Python runtime. Store provider keys through the extension popup or environment variables such as `GOOGLE_API_KEY`, `OPENAI_API_KEY`, and `ANTHROPIC_API_KEY`.

## License

This portable build includes code derived from MangaTranslator. Keep upstream license requirements with any redistribution.
