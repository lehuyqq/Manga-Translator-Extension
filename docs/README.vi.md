# MangaTranslator Extension

Bản dịch trang manga cục bộ cho trình duyệt Chromium, dùng backend FastAPI và pipeline MangaTranslator đi kèm.

[English](../README.md) · [中文](README.zh.md)

## Điểm chính

- Quét ảnh manga/comic trên trang và dịch theo lô.
- Chế độ tự động dịch, thay ảnh đã dịch khi bạn đọc.
- Hỗ trợ chữ trong bubble và chữ ngoài bubble, mặc định dùng cleanup nhẹ.
- Ngôn ngữ dịch chính: Nhật, Hàn, Anh, Việt.
- Ngôn ngữ giao diện extension: Anh mặc định, Việt, Trung, Nhật, Hàn.
- Chọn model OpenAI-compatible và các provider Google, OpenAI, Anthropic, xAI, DeepSeek, Z.ai, Moonshot AI, OpenRouter.
- Chạy backend portable qua `start-backend.bat` hoặc `backend/main.py`.

## Bắt đầu nhanh

```powershell
cd manga-translator-extension
.\start-backend.bat
```

Build extension:

```powershell
cd manga-translator-extension\extension
npm install
npm run build
```

Sau đó load thư mục `extension/dist/` dưới dạng unpacked extension trong Chrome hoặc Edge.

## Cấu hình

Trong popup extension:

- `Translate`: chọn ngôn ngữ nguồn/đích và bật dịch chữ ngoài bubble.
- `LLM Config`: cấu hình provider, model, API key và chỉ dẫn bổ sung.
- `Config`: đổi ngôn ngữ giao diện extension và URL backend.

Backend mặc định là `http://localhost:7677`.

## Đóng gói portable

Runtime Python có thể đặt tại:

```text
manga-translator-extension/backend/runtime/
```

Runtime này rất lớn, nên phân phối bằng release asset hoặc file nén portable. Không nên commit trực tiếp vào GitHub repo thông thường vì GitHub giới hạn file 100 MB và runtime có dung lượng nhiều GB.
