# MangaTranslator Backend API

FastAPI backend with a vendored MangaTranslator-derived pipeline for use by the browser extension.

## Base URL

```
http://localhost:7677
```

## Endpoints

### `GET /health`

Health check. Returns backend status and GPU availability.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "backend_version": "1.0.0",
  "gpu_available": true,
  "device": "cuda",
  "cuda_available": true
}
```

---

### `GET /providers`

List available LLM translation providers.

**Response `200 OK`:**
```json
{
  "providers": [
    "Google", "OpenAI", "Anthropic", "xAI", "DeepSeek",
    "Z.ai", "Moonshot AI", "OpenRouter", "OpenAI-Compatible"
  ],
  "default_provider": "Google"
}
```

---

### `POST /translate`

Translate a single image.

**Request body:**
```json
{
  "image": "<raw base64 string (no data: prefix)>",
  "input_language": "Japanese",
  "output_language": "English",
  "provider": "Google",
  "model_name": "gemini-3.1-flash-lite-preview",
  "api_key": "<your key>",
  "temperature": 0.1,
  "top_p": 0.95,
  "top_k": 1,
  "max_tokens": null,
  "translation_mode": "one-step",
  "ocr_method": "LLM",
  "reasoning_effort": null,
  "special_instructions": null,
  "font_dir": null,
  "max_font_size": 16,
  "min_font_size": 8,
  "supersampling_factor": 4,
  "send_full_page_context": true,
  "image_detail": "auto"
}
```

**Fields:**
| Field | Type | Default | Description |
|---|---|---|---|
| `image` | `string` | **required** | Base64-encoded image (no `data:image/...;base64,` prefix) |
| `input_language` | `string` | `"Japanese"` | Source language |
| `output_language` | `string` | `"English"` | Target language |
| `provider` | `string` | `"Google"` | LLM provider |
| `model_name` | `string?` | `null` | Model name override |
| `api_key` | `string?` | `null` | API key override |
| `temperature` | `float` | `0.1` | Sampling temperature (0.0–2.0) |
| `top_p` | `float` | `0.95` | Nucleus sampling (0.0–1.0) |
| `top_k` | `int` | `1` | Top-k sampling |
| `max_tokens` | `int?` | `null` | Max output tokens |
| `translation_mode` | `"one-step" \| "two-step"` | `"one-step"` | One-shot or two-pass translation |
| `ocr_method` | `"LLM" \| "manga-ocr" \| "paddleocr-vl"` | `"LLM"` | Text recognition method |
| `reasoning_effort` | `string?` | `null` | Reasoning effort for supported models |
| `special_instructions` | `string?` | `null` | Custom instructions for the translator |
| `font_dir` | `string?` | `null` | Font pack name under `./fonts` |
| `max_font_size` | `int` | `16` | Maximum rendered font size (px) |
| `min_font_size` | `int` | `8` | Minimum rendered font size (px) |
| `supersampling_factor` | `int` | `4` | Render quality multiplier (1–4) |
| `send_full_page_context` | `bool` | `true` | Send full page context to LLM |
| `image_detail` | `"auto" \| "low" \| "high"` | `"auto"` | Vision detail level |
| `outside_text_enabled` | `bool` | `false` | Detect and translate text outside speech bubbles |

**Response `200 OK`:**
```json
{
  "translated_image": "<raw base64 PNG>",
  "bubbles": [
    {
      "bbox": [45, 120, 380, 245],
      "confidence": 0.94,
      "original_text": "お前はもう死んでいる",
      "translated_text": "You are already dead"
    }
  ],
  "processing_time_seconds": 4.23,
  "source_language": "Japanese",
  "target_language": "English",
  "provider": "Google"
}
```

---

### `POST /translate/batch`

Translate up to 20 images concurrently.

**Request body:**
```json
{
  "images": [
    { "image": "<base64>", "id": "page-1" },
    { "image": "<base64>", "id": "page-2" }
  ],
  "input_language": "Japanese",
  "output_language": "English",
  "provider": "Google",
  ...same config fields as /translate...
}
```

**Response `200 OK`:**
```json
{
  "results": [
    {
      "id": "page-1",
      "translated_image": "<base64 PNG>",
      "bubbles": [...],
      "processing_time_seconds": 3.5
    },
    {
      "id": "page-2",
      "translated_image": null,
      "error": "Image too large",
      "processing_time_seconds": 0.1
    }
  ],
  "total_time_seconds": 8.2,
  "success_count": 1,
  "error_count": 1
}
```

---

## CORS

The backend allows requests from:
- `chrome-extension://*`
- `moz-extension://*`
- `http://localhost`
- `http://localhost:7677`

To add more origins, set the `MT_CORS_ORIGINS` environment variable (comma-separated).

## Error Responses

All error responses return `JSON` with a `detail` field:

```json
{ "detail": "Maximum 20 images per batch" }
```

| Status | Meaning |
|---|---|
| `400 Bad Request` | Invalid request body |
| `422 Unprocessable Entity` | Validation error (Pydantic) |
| `500 Internal Server Error` | Translation pipeline failed |

## Image Format

- **Input**: Accepts any format PIL can decode (PNG, JPEG, WebP, GIF, BMP, TIFF)
- **Output**: Always PNG (raw base64, no `data:` prefix)
- **Max size**: Configurable via `MT_MAX_IMAGE_SIZE_MB` (default: 50MB)
- **Timeout**: Configurable via `MT_REQUEST_TIMEOUT_SECONDS` (default: 300s)
