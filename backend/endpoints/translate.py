"""FastAPI translation endpoints."""
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException

from models.schemas import (
    TranslateBatchItem,
    TranslateBatchItemResponse,
    TranslateBatchRequest,
    TranslateBatchResponse,
    TranslateRequest,
    TranslateResponse,
)
from pipeline.wrapper import (
    _build_config,
    image_to_base64_raw,
    translate_image_base64,
)
from config import settings

router = APIRouter(prefix="", tags=["translate"])

# Thread pool for batch processing
_executor = ThreadPoolExecutor(max_workers=4)


def _build_bubble_info(bubbles: list[dict]) -> list:
    """Convert bubble dicts to BubbleInfo schema items."""
    from models.schemas import BubbleInfo

    results = []
    for b in bubbles:
        results.append(
            BubbleInfo(
                bbox=b.get("bbox", []),
                confidence=float(b.get("confidence", 0.0)),
                original_text=b.get("ocr_text"),
                translated_text=b.get("translation", ""),
            )
        )
    return results


@router.post("/translate", response_model=TranslateResponse)
async def translate_single(req: TranslateRequest) -> TranslateResponse:
    """Translate a single image.

    Accepts a base64-encoded image and returns the translated image
    plus bubble metadata.
    """
    models_dir = settings.models_dir
    fonts_dir = settings.fonts_base_dir

    config = _build_config(
        input_language=req.input_language,
        output_language=req.output_language,
        provider=req.provider,
        base_url=req.base_url,
        model_name=req.model_name,
        api_key=req.api_key,
        temperature=req.temperature,
        top_p=req.top_p,
        top_k=req.top_k,
        max_tokens=req.max_tokens,
        translation_mode=req.translation_mode,
        ocr_method=req.ocr_method,
        reasoning_effort=req.reasoning_effort,
        special_instructions=req.special_instructions,
        font_dir=req.font_dir,
        max_font_size=req.max_font_size,
        min_font_size=req.min_font_size,
        supersampling_factor=req.supersampling_factor,
        send_full_page_context=req.send_full_page_context,
        image_detail=req.image_detail,
        outside_text_enabled=req.outside_text_enabled,
        models_dir=models_dir,
        fonts_base_dir=fonts_dir,
    )

    start = time.time()
    try:
        result_image, bubbles, elapsed = await asyncio.to_thread(translate_image_base64, req.image, config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {e}")

    translated_b64 = image_to_base64_raw(result_image)

    return TranslateResponse(
        translated_image=translated_b64,
        bubbles=_build_bubble_info(bubbles),
        processing_time_seconds=elapsed,
        source_language=req.input_language,
        target_language=req.output_language,
        provider=req.provider,
    )


def _translate_single_item(
    item: TranslateBatchItem, req: TranslateBatchRequest
) -> TranslateBatchItemResponse:
    """Translate one item from a batch request (runs in thread pool)."""
    import time as t

    models_dir = settings.models_dir
    fonts_dir = settings.fonts_base_dir

    item_start = t.time()
    try:
        config = _build_config(
            input_language=req.input_language,
            output_language=req.output_language,
            provider=req.provider,
            base_url=req.base_url,
            model_name=req.model_name,
            api_key=req.api_key,
            temperature=req.temperature,
            top_p=req.top_p,
            top_k=req.top_k,
            max_tokens=req.max_tokens,
            translation_mode=req.translation_mode,
            ocr_method=req.ocr_method,
            reasoning_effort=req.reasoning_effort,
            special_instructions=req.special_instructions,
            font_dir=req.font_dir,
            max_font_size=req.max_font_size,
            min_font_size=req.min_font_size,
            supersampling_factor=req.supersampling_factor,
            send_full_page_context=req.send_full_page_context,
            image_detail=req.image_detail,
            outside_text_enabled=req.outside_text_enabled,
            models_dir=models_dir,
            fonts_base_dir=fonts_dir,
        )

        result_image, bubbles, _ = translate_image_base64(item.image, config)
        translated_b64 = image_to_base64_raw(result_image)
        return TranslateBatchItemResponse(
            id=item.id,
            translated_image=translated_b64,
            bubbles=_build_bubble_info(bubbles),
            processing_time_seconds=t.time() - item_start,
        )
    except Exception as e:
        return TranslateBatchItemResponse(
            id=item.id,
            translated_image=None,
            bubbles=[],
            error=str(e),
            processing_time_seconds=t.time() - item_start,
        )


@router.post("/translate/batch", response_model=TranslateBatchResponse)
async def translate_batch(req: TranslateBatchRequest) -> TranslateBatchResponse:
    """Translate multiple images concurrently.

    Processes up to 20 images in parallel using a thread pool.
    Returns results in the same order as the input.
    """
    if len(req.images) > 20:
        raise HTTPException(
            status_code=400, detail="Maximum 20 images per batch"
        )

    start = time.time()
    futures = [
        _executor.submit(_translate_single_item, item, req)
        for item in req.images
    ]
    results = [f.result() for f in futures]

    success_count = sum(1 for r in results if r.error is None)
    error_count = len(results) - success_count

    return TranslateBatchResponse(
        results=results,
        total_time_seconds=time.time() - start,
        success_count=success_count,
        error_count=error_count,
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    import torch

    return {
        "status": "ok",
        "version": "1.0.0",
        "backend_version": "1.0.0",
        "gpu_available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu",
        "cuda_available": torch.cuda.is_available(),
    }


@router.get("/providers")
async def list_providers():
    """Return available LLM providers."""
    return {
        "providers": [
            "Google",
            "OpenAI",
            "Anthropic",
            "xAI",
            "DeepSeek",
            "Z.ai",
            "Moonshot AI",
            "OpenRouter",
            "OpenAI-Compatible",
        ],
        "default_provider": "Google",
    }
