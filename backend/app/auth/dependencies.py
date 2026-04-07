from __future__ import annotations

from fastapi import Depends, HTTPException, Request

from ..db import fetch_one
from ..settings import settings
from .tokens import TokenError, verify_token


async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail={"message": "Nao autenticado."})

    token = auth.split(" ", 1)[1].strip()
    try:
        payload = verify_token(token, secret=settings.token_secret)
    except TokenError:
        raise HTTPException(status_code=401, detail={"message": "Sessao invalida."})

    user_id = int(payload.get("sub", 0) or 0)
    if not user_id:
        raise HTTPException(status_code=401, detail={"message": "Sessao invalida."})

    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        user = await fetch_one(
            conn,
            "SELECT id, name, email, role FROM users WHERE id = $1",
            user_id,
        )

    if not user:
        raise HTTPException(status_code=401, detail={"message": "Usuario nao encontrado."})

    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"] or "user"}


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if (current_user["role"] or "user") != "admin":
        raise HTTPException(status_code=403, detail={"message": "Apenas admin pode executar esta acao."})
    return current_user
