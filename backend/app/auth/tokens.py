from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any


class TokenError(Exception):
    pass


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("ascii"))


def create_token(*, user_id: int, role: str, secret: str, ttl_seconds: int) -> str:
    now = int(time.time())
    payload = {"sub": int(user_id), "role": role, "iat": now, "exp": now + int(ttl_seconds)}
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = _b64url_encode(payload_json)

    sig = hmac.new(secret.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    return f"v1.{payload_b64}.{sig_b64}"


def verify_token(token: str, *, secret: str) -> dict[str, Any]:
    try:
        version, payload_b64, sig_b64 = token.split(".", 2)
    except ValueError as exc:
        raise TokenError("invalid token format") from exc

    if version != "v1":
        raise TokenError("unsupported token version")

    expected_sig = hmac.new(secret.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    expected_sig_b64 = _b64url_encode(expected_sig)

    if not hmac.compare_digest(expected_sig_b64, sig_b64):
        raise TokenError("invalid token signature")

    try:
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except Exception as exc:
        raise TokenError("invalid token payload") from exc

    exp = int(payload.get("exp", 0))
    if exp and int(time.time()) > exp:
        raise TokenError("token expired")

    return payload
