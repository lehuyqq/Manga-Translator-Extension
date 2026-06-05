"""FastAPI entry point for MangaTranslator backend."""
import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from endpoints.translate import router as translate_router

app = FastAPI(
    title="MangaTranslator Backend API",
    description="FastAPI backend for the MangaTranslator browser extension. "
    "Wraps the MangaTranslator ML pipeline to accept base64 images and return "
    "translated images with bubble metadata.",
    version="1.0.0",
)

# CORS — allow browser extensions and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(translate_router)


@app.get("/")
async def root():
    return {
        "name": "MangaTranslator Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    from config import settings
    from pipeline.wrapper import _get_device, warmup_models

    device = _get_device()
    print(f"Starting MangaTranslator Backend on {settings.host}:{settings.port}")
    print(f"PyTorch device: {device}")
    print(f"PyTorch version: {torch.__version__}")
    print(f"Models directory: {settings.models_dir}")
    print(f"Fonts directory: {settings.fonts_base_dir}")
    print()
    print("=" * 60)
    print(f"  GPU Acceleration: {'ENABLED' if device.type != 'cpu' else 'DISABLED'}")
    print(f"  Device: {device}")
    print(f"  CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"  GPU: {torch.cuda.get_device_name(0)}")
        print(f"  VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    print("=" * 60)
    print()

    # Pre-warm models onto GPU/CPU so first request is fast
    print("Pre-loading ML models (this takes a few seconds)...")
    warmup_results = warmup_models(settings.models_dir)
    for model_name, ok in warmup_results.items():
        status = "OK" if ok else "SKIP"
        print(f"  {model_name}: {status}")
    print(f"Models ready. Backend is up.\n")

    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
    )
