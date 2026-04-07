from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from ..auth.dependencies import require_admin
from ..db import fetch_all, fetch_one


router = APIRouter()

ALLOWED_ROLES = {"admin", "user"}


@router.get("/users")
async def list_users(request: Request, current_user: dict = Depends(require_admin)):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        rows = await fetch_all(
            conn,
            """
            SELECT id, name, email, role, created_at
              FROM users
             ORDER BY created_at DESC
            """,
        )

    users = [
        {
            "id": r["id"],
            "name": r["name"],
            "email": r["email"],
            "role": r["role"] or "user",
            "createdAt": (r["created_at"].isoformat() if r["created_at"] else None),
        }
        for r in rows
    ]
    return JSONResponse(status_code=200, content=users)


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int, request: Request, current_user: dict = Depends(require_admin)
):
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    role = payload.get("role")
    if not role or not isinstance(role, str):
        return JSONResponse(status_code=400, content={"message": "role e obrigatorio."})

    role = role.strip().lower()
    if role not in ALLOWED_ROLES:
        return JSONResponse(status_code=400, content={"message": "role invalido."})

    if int(user_id) == int(current_user["id"]) and role != "admin":
        return JSONResponse(
            status_code=400,
            content={"message": "Voce nao pode remover sua propria permissao de admin."},
        )

    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        updated = await fetch_one(
            conn,
            """
            UPDATE users
               SET role = $1
             WHERE id = $2
         RETURNING id, name, email, role, created_at
            """,
            role,
            user_id,
        )

    if not updated:
        return JSONResponse(status_code=404, content={"message": "Usuario nao encontrado."})

    return JSONResponse(
        status_code=200,
        content={
            "id": updated["id"],
            "name": updated["name"],
            "email": updated["email"],
            "role": updated["role"] or "user",
            "createdAt": (updated["created_at"].isoformat() if updated["created_at"] else None),
        },
    )
