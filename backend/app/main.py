from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware

from .db import create_pool, run_schema
from .routes.auth import router as auth_router
from .routes.tasks import router as tasks_router
from .routes.users import router as users_router
from .settings import settings


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.frontend_urls),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(users_router)


@app.on_event("startup")
async def on_startup() -> None:
    pool = await create_pool()
    await run_schema(pool)
    app.state.db_pool = pool


@app.on_event("shutdown")
async def on_shutdown() -> None:
    pool = getattr(app.state, "db_pool", None)
    if pool is not None:
        await pool.close()


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = getattr(exc, "detail", "Erro interno do servidor.")
    if isinstance(detail, dict) and "message" in detail:
        message = detail["message"]
    elif isinstance(detail, str):
        message = detail
    else:
        message = "Erro interno do servidor."

    return JSONResponse(status_code=exc.status_code, content={"message": message})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for err in exc.errors():
        loc = err.get("loc", ())
        field = ".".join(str(p) for p in loc if p not in {"body"})
        details.append({"field": field or "body", "message": err.get("msg", "invalid")})

    return JSONResponse(
        status_code=400,
        content={"message": "Requisicao invalida.", "details": details},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print("[maintenance-api]", exc)
    return JSONResponse(status_code=500, content={"message": "Erro interno do servidor."})
