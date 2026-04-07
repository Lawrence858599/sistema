from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from ..auth.dependencies import get_current_user, require_admin
from ..db import fetch_all, fetch_one
from ..utils import isoformat_z


router = APIRouter()

ALLOWED_STATUSES = {"Pendente", "Em Andamento", "Concluido"}
MAX_IMAGES = 20


def map_task_row(row) -> dict:
    created_by_name = row["created_by_name"] if "created_by_name" in row else None
    image_count = row["image_count"] if "image_count" in row else 0

    return {
        "id": row["id"],
        "title": row["title"],
        "clientName": row["client_name"],
        "clientPhone": row["client_phone"],
        "clientEmail": row["client_email"],
        "description": row["description"],
        "location": row["location"],
        "status": row["status"],
        "createdAt": isoformat_z(row["created_at"]),
        "updatedAt": isoformat_z(row["updated_at"]),
        "createdByName": created_by_name,
        "imageCount": int(image_count or 0),
    }


def _clean_optional_text(value):
    if value is None:
        return None
    if not isinstance(value, str):
        return value
    cleaned = value.strip()
    return cleaned if cleaned else None


def _require_non_empty(field: str, value):
    if value is None:
        return
    if isinstance(value, str) and not value.strip():
        raise ValueError(f"{field} nao pode ser vazio.")


def _validate_images(images) -> str | None:
    if images is None:
        return None

    if not isinstance(images, list):
        return "images deve ser um array."

    if len(images) > MAX_IMAGES:
        return f"Maximo de {MAX_IMAGES} imagens por chamado."

    for image in images:
        if not isinstance(image, dict):
            return "Cada imagem deve conter fileName, mimeType, sizeBytes e imageData."
        if (
            not image.get("fileName")
            or not image.get("mimeType")
            or image.get("sizeBytes") is None
            or not image.get("imageData")
        ):
            return "Cada imagem deve conter fileName, mimeType, sizeBytes e imageData."

    return None


@router.get("/tasks")
async def list_tasks(request: Request, current_user: dict = Depends(get_current_user)):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        rows = await fetch_all(
            conn,
            """
            SELECT mt.id, mt.title, mt.client_name, mt.client_phone, mt.client_email,
                   mt.description, mt.status, mt.location, mt.created_at, mt.updated_at,
                   u.name AS created_by_name,
                   COUNT(ti.id) AS image_count
              FROM maintenance_tasks mt
              LEFT JOIN users u ON u.id = mt.created_by
              LEFT JOIN task_images ti ON ti.task_id = mt.id
             GROUP BY mt.id, u.name
             ORDER BY mt.created_at DESC
            """,
        )

    return JSONResponse(status_code=200, content=[map_task_row(r) for r in rows])


@router.get("/tasks/{task_id}")
async def get_task(task_id: int, request: Request, current_user: dict = Depends(get_current_user)):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        task_row = await fetch_one(
            conn,
            """
            SELECT mt.id, mt.title, mt.client_name, mt.client_phone, mt.client_email,
                   mt.description, mt.status, mt.location, mt.created_at, mt.updated_at,
                   u.name AS created_by_name
              FROM maintenance_tasks mt
              LEFT JOIN users u ON u.id = mt.created_by
             WHERE mt.id = $1
            """,
            task_id,
        )

        if not task_row:
            return JSONResponse(status_code=404, content={"message": "Tarefa nao encontrada."})

        image_rows = await fetch_all(
            conn,
            """
            SELECT id, file_name, mime_type, size_bytes, image_data, created_at
              FROM task_images
             WHERE task_id = $1
             ORDER BY created_at ASC
            """,
            task_id,
        )

    task = map_task_row(task_row)
    images = [
        {
            "id": img["id"],
            "fileName": img["file_name"],
            "mimeType": img["mime_type"],
            "sizeBytes": img["size_bytes"],
            "imageData": img["image_data"],
            "createdAt": isoformat_z(img["created_at"]),
        }
        for img in image_rows
    ]
    task["images"] = images
    task["imageCount"] = len(images)
    return JSONResponse(status_code=200, content=task)


@router.post("/tasks")
async def create_task(request: Request, current_user: dict = Depends(get_current_user)):
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    title = _clean_optional_text(payload.get("title"))
    client_name = _clean_optional_text(payload.get("clientName"))
    client_phone = _clean_optional_text(payload.get("clientPhone"))
    client_email = _clean_optional_text(payload.get("clientEmail"))
    description = _clean_optional_text(payload.get("description"))
    location = _clean_optional_text(payload.get("location"))
    created_by = int(current_user["id"])
    images = payload.get("images", [])

    if not title or not client_name or not client_phone or not client_email or not description or not location:
        return JSONResponse(
            status_code=400,
            content={
                "message": "title, clientName, clientPhone, clientEmail, description e location sao obrigatorios."
            },
        )

    if images is None:
        images = []

    error_message = _validate_images(images)
    if error_message:
        return JSONResponse(status_code=400, content={"message": error_message})

    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        async with conn.transaction():
            task_row = await fetch_one(
                conn,
                """
                INSERT INTO maintenance_tasks (
                    title, client_name, client_phone, client_email, description, location, status, created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, title, client_name, client_phone, client_email,
                          description, status, location, created_at, updated_at, created_by
                """,
                title,
                client_name,
                client_phone,
                client_email,
                description,
                location,
                "Pendente",
                created_by,
            )

            for image in images:
                await conn.execute(
                    """
                    INSERT INTO task_images (task_id, file_name, mime_type, size_bytes, image_data)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    task_row["id"],
                    image["fileName"],
                    image["mimeType"],
                    int(image["sizeBytes"]),
                    image["imageData"],
                )

            created_by_name = await fetch_one(
                conn, "SELECT name FROM users WHERE id = $1", task_row["created_by"]
            )

    result = {
        "id": task_row["id"],
        "title": task_row["title"],
        "clientName": task_row["client_name"],
        "clientPhone": task_row["client_phone"],
        "clientEmail": task_row["client_email"],
        "description": task_row["description"],
        "location": task_row["location"],
        "status": task_row["status"],
        "createdAt": isoformat_z(task_row["created_at"]),
        "updatedAt": isoformat_z(task_row["updated_at"]),
        "createdByName": (created_by_name["name"] if created_by_name else None),
        "imageCount": len(images),
    }
    return JSONResponse(status_code=201, content=result)


@router.put("/tasks/{task_id}")
async def update_task(task_id: int, request: Request, current_user: dict = Depends(require_admin)):
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    title = _clean_optional_text(payload.get("title"))
    client_name = _clean_optional_text(payload.get("clientName"))
    client_phone = _clean_optional_text(payload.get("clientPhone"))
    client_email = _clean_optional_text(payload.get("clientEmail"))
    location = _clean_optional_text(payload.get("location"))
    status = _clean_optional_text(payload.get("status"))
    description = _clean_optional_text(payload.get("description"))
    images_to_add = payload.get("images")

    try:
        _require_non_empty("title", title)
        _require_non_empty("clientName", client_name)
        _require_non_empty("clientPhone", client_phone)
        _require_non_empty("clientEmail", client_email)
        _require_non_empty("location", location)
        _require_non_empty("status", status)
        _require_non_empty("description", description)
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})

    error_message = _validate_images(images_to_add)
    if error_message:
        return JSONResponse(status_code=400, content={"message": error_message})

    if not any([title, client_name, client_phone, client_email, location, status, description, images_to_add]):
        return JSONResponse(status_code=400, content={"message": "Envie ao menos um campo para atualizar."})

    if status and status not in ALLOWED_STATUSES:
        return JSONResponse(status_code=400, content={"message": "Status informado e invalido."})

    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        async with conn.transaction():
            current = await fetch_one(conn, "SELECT * FROM maintenance_tasks WHERE id = $1", task_id)
            if not current:
                return JSONResponse(status_code=404, content={"message": "Tarefa nao encontrada."})

            next_title = title or current["title"]
            next_client_name = client_name or current["client_name"]
            next_client_phone = client_phone or current["client_phone"]
            next_client_email = client_email or current["client_email"]
            next_location = location or current["location"]
            next_status = status or current["status"]
            next_description = description or current["description"]

            updated = await fetch_one(
                conn,
                """
                UPDATE maintenance_tasks
                   SET title = $1,
                       client_name = $2,
                       client_phone = $3,
                       client_email = $4,
                       location = $5,
                       status = $6,
                       description = $7,
                       updated_at = CURRENT_TIMESTAMP
                 WHERE id = $8
             RETURNING id, title, client_name, client_phone, client_email,
                       description, status, location, created_at, updated_at, created_by
                """,
                next_title,
                next_client_name,
                next_client_phone,
                next_client_email,
                next_location,
                next_status,
                next_description,
                task_id,
            )

            if images_to_add:
                current_count_row = await fetch_one(
                    conn,
                    "SELECT COUNT(1) AS c FROM task_images WHERE task_id = $1",
                    task_id,
                )
                current_count = int(current_count_row["c"] if current_count_row else 0)
                if current_count + len(images_to_add) > MAX_IMAGES:
                    return JSONResponse(
                        status_code=400,
                        content={"message": f"Maximo de {MAX_IMAGES} imagens por chamado."},
                    )

                for image in images_to_add:
                    await conn.execute(
                        """
                        INSERT INTO task_images (task_id, file_name, mime_type, size_bytes, image_data)
                        VALUES ($1, $2, $3, $4, $5)
                        """,
                        task_id,
                        image["fileName"],
                        image["mimeType"],
                        int(image["sizeBytes"]),
                        image["imageData"],
                    )

            created_by_name = await fetch_one(
                conn, "SELECT name FROM users WHERE id = $1", updated["created_by"]
            )
            image_rows = await fetch_all(
                conn,
                """
                SELECT id, file_name, mime_type, size_bytes, image_data, created_at
                  FROM task_images
                 WHERE task_id = $1
                 ORDER BY created_at ASC
                """,
                task_id,
            )

    images = [
        {
            "id": img["id"],
            "fileName": img["file_name"],
            "mimeType": img["mime_type"],
            "sizeBytes": img["size_bytes"],
            "imageData": img["image_data"],
            "createdAt": isoformat_z(img["created_at"]),
        }
        for img in image_rows
    ]

    result = {
        "id": updated["id"],
        "title": updated["title"],
        "clientName": updated["client_name"],
        "clientPhone": updated["client_phone"],
        "clientEmail": updated["client_email"],
        "description": updated["description"],
        "location": updated["location"],
        "status": updated["status"],
        "createdAt": isoformat_z(updated["created_at"]),
        "updatedAt": isoformat_z(updated["updated_at"]),
        "createdByName": (created_by_name["name"] if created_by_name else None),
        "images": images,
        "imageCount": len(images),
    }
    return JSONResponse(status_code=200, content=result)
