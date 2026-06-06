# MangaTranslator Extension

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688)
![Portable](https://img.shields.io/badge/Windows-portable-0078D4)

Dịch trang manga cục bộ cho các trình duyệt dựa trên Chromium, dùng backend FastAPI và pipeline MangaTranslator đi kèm.

[English](../README.md) · [中文](README.zh.md)

## Điểm Nổi Bật

- Trình quét ảnh manga/comic trên trang với lựa chọn dịch theo lô.
- Chế độ tự động dịch, thay ảnh bằng bản đã dịch khi bạn đọc.
- Hỗ trợ chữ trong bubble và chữ ngoài bubble, mặc định dùng cleanup nhẹ.
- Có thể tải tùy chọn Flux Klein 4B inpainting sau bằng `setup.bat`.
- Tùy chọn ngôn ngữ nguồn/đích: Nhật, Hàn, Anh và Việt.
- Ngôn ngữ giao diện extension: tiếng Anh mặc định, kèm tiếng Việt, tiếng Trung, tiếng Nhật và tiếng Hàn.
- Bộ chọn model OpenAI-compatible cùng các provider Google, OpenAI, Anthropic, xAI, DeepSeek, Z.ai, Moonshot AI và OpenRouter.
- Khởi động backend portable qua `start-backend.bat` hoặc `backend/main.py`.

## Cấu Trúc Dự Án

```text
manga-translator-extension/
  backend/                 Backend FastAPI và tích hợp MangaTranslator
  backend/main.py          Điểm vào backend
  backend/core/            Nhận diện, cleanup, dịch và render chữ
  backend/models/          Schema API Pydantic
  backend/pipeline/        Wrapper quanh core pipeline
  extension/               Browser extension Manifest V3
  extension/src/popup/     Giao diện popup
  extension/src/shared/    Type, constants và i18n dùng chung
  extension/src/background Service worker nền
  extension/src/content-script Trình quét trang và overlay tự động dịch
  docs/                    API và tài liệu đa ngôn ngữ
```

## Bắt Đầu Nhanh

Khởi động backend:

```powershell
cd manga-translator-extension
.\start-backend.bat
```

Hoặc chạy trực tiếp:

```powershell
cd manga-translator-extension\backend
python main.py
```

Với bản portable này, nên dùng `backend\runtime\python.exe` hoặc `MangaTranslator\runtime\python.exe` đi kèm khi cần các gói CUDA/GPU.

Build extension:

```powershell
cd manga-translator-extension\extension
npm install
npm run build
```

Load `extension/dist/` dưới dạng unpacked extension trong Chrome hoặc Edge.

Thiết lập Flux tùy chọn:

```powershell
cd manga-translator-extension
.\setup.bat
```

Chỉ chọn Flux nếu bạn muốn dùng inpainting nặng hơn. Gói portable mặc định được giữ nhẹ và không bao gồm model Flux.

## Cấu Hình

Mở popup extension:

- `Translate`: chọn ngôn ngữ nguồn/đích và bật dịch chữ ngoài bubble.
- `LLM Config`: cấu hình provider, model, API key, sampling values và special instructions.
- `Config`: đổi ngôn ngữ extension và đặt backend URL.

Backend URL mặc định là `http://localhost:7677`.

## Đóng Gói Runtime

Dự án có thể chạy như một thư mục portable khi Python runtime nằm tại:

```text
manga-translator-extension/backend/runtime/
```

Runtime có dung lượng lớn và nên được phân phối dưới dạng release asset hoặc archive portable cục bộ, không commit vào GitHub repository thông thường. GitHub chặn file trên 100 MB trong lịch sử Git thường, còn runtime này có dung lượng vài GB. Model Flux không đi kèm mặc định; dùng `setup.bat` để tải khi cần.

## Phát Triển

Kiểm tra tối thiểu:

```powershell
cd manga-translator-extension\extension
npm run build

cd ..\backend
python -m py_compile pipeline\wrapper.py
```

Kiểm tra health của backend:

```powershell
Invoke-RestMethod http://localhost:7677/health
```

## Bảo Mật

Không commit API key, backend URL cá nhân, cache sinh ra, model artifact, `node_modules`, `dist` hoặc toàn bộ Python runtime. Lưu provider key qua popup extension hoặc biến môi trường như `GOOGLE_API_KEY`, `OPENAI_API_KEY` và `ANTHROPIC_API_KEY`.

## Giấy Phép

Bản portable này có chứa code phát triển từ MangaTranslator. Hãy giữ đúng yêu cầu license upstream khi phân phối lại.
