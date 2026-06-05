# Repository Guidelines

## Project Structure & Module Organization

This repository is split into a local ML backend and a browser extension.

- `backend/` contains the FastAPI service. Entry point: `backend/main.py`.
- `backend/endpoints/` defines API routes such as `/translate`, `/translate/batch`, `/health`, and `/providers`.
- `backend/pipeline/wrapper.py` bridges request data into the sibling `MangaTranslator` core pipeline.
- `backend/models/schemas.py` contains Pydantic request and response models.
- `extension/` contains the Manifest V3 browser extension built with TypeScript and Vite.
- `extension/src/background/` handles service worker messages, backend calls, image fetches, and model listing.
- `extension/src/content-script/` contains scanner UI, image discovery, translation queueing, caching, and page image replacement.
- `extension/src/popup/` contains the extension popup UI and settings persistence.
- `extension/public/icons/` stores extension icons; `extension/dist/` is generated build output.
- `docs/API.md` documents backend endpoints.

## Build, Test, and Development Commands

Backend:

```powershell
cd backend
pip install -e .
python main.py
```

Use the bundled `MangaTranslator\runtime\python.exe` when GPU/CUDA dependencies are required.

Extension:

```powershell
cd extension
npm install
npm run build
```

`npm run build` runs TypeScript checking and Vite bundling into `extension/dist/`. Load `extension/dist/` as an unpacked extension in Chrome or Edge.

## Coding Style & Naming Conventions

Python uses standard PEP 8 style, type hints where practical, and Pydantic models for API contracts. Keep route logic in `backend/endpoints/` and pipeline integration in `backend/pipeline/`.

TypeScript uses strict compiler settings. Prefer explicit interfaces from `extension/src/shared/types.ts`, camelCase variables/functions, and PascalCase types. Keep generated files in `dist/` untouched.

## Testing Guidelines

No dedicated test framework is currently configured. Before submitting changes, run:

```powershell
cd extension
npm run build
```

For backend changes, start `python main.py` and verify `GET /health`. For translation changes, test one small manga image through `/translate` before broad UI testing.

## Commit & Pull Request Guidelines

No local Git history is available in this checkout. Use short, imperative commit messages such as `Fix backend health response` or `Add popup model picker handling`.

Pull requests should include a concise summary, affected areas (`backend`, `extension`, or docs), manual verification steps, and screenshots or screen recordings for UI changes.

## Security & Configuration Tips

Do not commit API keys or personal backend URLs. Store provider keys through the popup or environment variables such as `GOOGLE_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`. Keep large model files and generated caches out of source changes unless intentionally updating bundled assets.
