"""
====================================================
OWNER: Chinmay
MODULE: ML Services & AI Inference

RESPONSIBILITIES:
- YOLOv8 Inference
- Prediction APIs
- Severity Mapping
- Heatmap Data Generation
- ML Processing
====================================================
"""

# MODULE: ML Service Settings

import os
from dataclasses import dataclass, field
from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = APP_DIR.parent


def _load_env_file():
    env_candidates = (
        PROJECT_ROOT / ".env",
        APP_DIR / ".env",
    )
    for env_path in env_candidates:
        if not env_path.exists():
            continue
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)
        break


def _resolve_credentials_path():
    raw_path = (
        os.getenv("FIREBASE_CREDENTIALS_PATH")
        or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        or str(APP_DIR / "firebase-service-account.json")
    )
    credentials_path = Path(raw_path).expanduser()
    if credentials_path.is_absolute():
        return str(credentials_path)
    return str((PROJECT_ROOT / credentials_path).resolve())


_load_env_file()


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    demo_mode: bool = field(default_factory=lambda: _as_bool(os.getenv("DEMO_MODE"), default=True))
    fallback_keywords: tuple[str, ...] = ("pothole", "road", "crack", "asphalt", "street")
    firestore_reports_collection: str = field(
        default_factory=lambda: os.getenv("FIRESTORE_REPORTS_COLLECTION", "reports")
    )
    firebase_credentials_path: str = field(
        default_factory=_resolve_credentials_path
    )


settings = Settings()
