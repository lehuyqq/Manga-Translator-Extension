"""Backend configuration."""
from pathlib import Path
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    host: str = "0.0.0.0"
    port: int = 7677
    reload: bool = False

    backend_dir: Path = Path(__file__).resolve().parent
    models_dir: Path = backend_dir / "models"
    fonts_base_dir: Path = backend_dir / "fonts"

    # Backend-specific settings
    max_image_size_mb: int = 50
    request_timeout_seconds: int = 300

    # CORS
    cors_origins: list[str] = [
        "chrome-extension://*",
        "moz-extension://*",
        "http://localhost",
        "http://localhost:7677",
        "http://127.0.0.1",
        "http://127.0.0.1:7677",
        "http://192.168.1.231",
        "http://192.168.1.231:7677",
    ]

    class Config:
        env_prefix = "MT_"
        extra = "ignore"


settings = Settings()

# Ensure required directories exist
settings.models_dir.mkdir(parents=True, exist_ok=True)
settings.fonts_base_dir.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("MT_MODELS_DIR", str(settings.models_dir))
