"""Local server configuration; no secrets belong in frontend Vite variables."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")


@dataclass(frozen=True)
class Settings:
    supabase_url: str
    supabase_publishable_key: str
    database_url: str
    cors_origin: str


def get_settings() -> Settings:
    return Settings(
        supabase_url=os.getenv("WAVE_SUPABASE_URL", "").rstrip("/"),
        supabase_publishable_key=os.getenv("WAVE_SUPABASE_PUBLISHABLE_KEY", ""),
        database_url=os.getenv("WAVE_DATABASE_URL", ""),
        cors_origin=os.getenv("WAVE_CORS_ORIGIN", "http://localhost:5173"),
    )
