from __future__ import annotations

import time

import pytest

from app.auth.tokens import TokenError, create_token, verify_token


def test_token_roundtrip() -> None:
    token = create_token(user_id=1, role="admin", secret="secret", ttl_seconds=60)
    payload = verify_token(token, secret="secret")
    assert payload["sub"] == 1
    assert payload["role"] == "admin"
    assert payload["exp"] >= payload["iat"]


def test_token_tamper_fails() -> None:
    token = create_token(user_id=1, role="user", secret="secret", ttl_seconds=60)
    parts = token.split(".")
    assert len(parts) == 3
    tampered = ".".join([parts[0], parts[1] + "x", parts[2]])
    with pytest.raises(TokenError):
        verify_token(tampered, secret="secret")


def test_token_expired() -> None:
    token = create_token(user_id=1, role="user", secret="secret", ttl_seconds=1)
    time.sleep(2)
    with pytest.raises(TokenError):
        verify_token(token, secret="secret")
