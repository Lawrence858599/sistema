from __future__ import annotations

import time

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from ..db import fetch_one
from ..settings import settings
from ..auth.tokens import create_token


router = APIRouter()


@router.post("/auth/login")
async def login(request: Request) -> JSONResponse:
    payload: dict = {}
    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            payload = {}
    except Exception:
        try:
            form = await request.form()
            payload = dict(form)
        except Exception:
            try:
                from urllib.parse import parse_qs

                body = (await request.body()).decode("utf-8", errors="ignore")
                payload = {k: v[0] for k, v in parse_qs(body).items() if v}
            except Exception:
                payload = {}

    email = payload.get("email") or payload.get("username")
    password = payload.get("password") or payload.get("senha")

    if isinstance(email, str):
        email = email.strip()
    if isinstance(password, str):
        password = password.strip()

    if not email or not password:
        return JSONResponse(
            status_code=400, content={"message": "Email e senha sao obrigatorios."}
        )

    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        user = await fetch_one(
            conn,
            "SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2",
            email,
            password,
        )

    if not user:
        return JSONResponse(status_code=401, content={"message": "Credenciais invalidas."})

    role = (user["role"] or "user")

    token = create_token(
        user_id=int(user["id"]),
        role=role,
        secret=settings.token_secret,
        ttl_seconds=settings.token_ttl_seconds,
    )

    return JSONResponse(
        status_code=200,
        content={
            "message": "Login realizado com sucesso.",
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": role,
            },
        },
    )
