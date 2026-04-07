from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


def _parse_frontend_urls() -> tuple[str, ...]:
    env = os.getenv("FRONTEND_URLS")
    if env:
        urls = [u.strip() for u in env.split(",") if u.strip()]
        return tuple(dict.fromkeys(urls))

    primary = os.getenv("FRONTEND_URL", "http://127.0.0.1:5500")
    defaults = [
        primary,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ]
    return tuple(dict.fromkeys(defaults))


@dataclass(frozen=True)
class Settings:
    port: int = int(os.getenv("PORT", "3000"))
    frontend_url: str = os.getenv("FRONTEND_URL", "http://127.0.0.1:5500")
    frontend_urls: tuple[str, ...] = _parse_frontend_urls()
    database_url: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/reidosol"
    )

    token_secret: str = os.getenv("TOKEN_SECRET", "dev-token-secret-change-me")
    token_ttl_seconds: int = int(os.getenv("TOKEN_TTL_SECONDS", "86400"))


settings = Settings()
