from __future__ import annotations

from pathlib import Path
from typing import Any

import asyncpg

from .settings import settings


async def create_pool() -> asyncpg.Pool:
    return await asyncpg.create_pool(dsn=settings.database_url, min_size=1, max_size=10)


def _split_sql_statements(sql: str) -> list[str]:
    sql = sql.lstrip("\ufeff")
    statements: list[str] = []
    buf: list[str] = []

    in_single = False
    in_double = False
    in_line_comment = False
    in_block_comment = False
    dollar_tag: str | None = None

    i = 0
    n = len(sql)
    while i < n:
        ch = sql[i]
        nxt = sql[i + 1] if i + 1 < n else ""

        if in_line_comment:
            buf.append(ch)
            if ch == "\n":
                in_line_comment = False
            i += 1
            continue

        if in_block_comment:
            buf.append(ch)
            if ch == "*" and nxt == "/":
                buf.append(nxt)
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if dollar_tag is not None:
            buf.append(ch)
            if ch == "$":
                tag = dollar_tag
                if tag and sql.startswith(tag, i):
                    buf.extend(tag[1:])
                    dollar_tag = None
                    i += len(tag)
                else:
                    i += 1
            else:
                i += 1
            continue

        if in_single:
            buf.append(ch)
            if ch == "'" and nxt == "'":
                buf.append(nxt)
                i += 2
                continue
            if ch == "'":
                in_single = False
            i += 1
            continue

        if in_double:
            buf.append(ch)
            if ch == '"':
                in_double = False
            i += 1
            continue

        if ch == "-" and nxt == "-":
            buf.append(ch)
            buf.append(nxt)
            in_line_comment = True
            i += 2
            continue

        if ch == "/" and nxt == "*":
            buf.append(ch)
            buf.append(nxt)
            in_block_comment = True
            i += 2
            continue

        if ch == "'":
            buf.append(ch)
            in_single = True
            i += 1
            continue

        if ch == '"':
            buf.append(ch)
            in_double = True
            i += 1
            continue

        if ch == "$":
            j = i + 1
            while j < n and (sql[j].isalnum() or sql[j] == "_"):
                j += 1
            if j < n and sql[j] == "$":
                tag = sql[i : j + 1]
                buf.append(tag)
                dollar_tag = tag
                i = j + 1
                continue

        if ch == ";":
            stmt = "".join(buf).strip()
            if stmt:
                statements.append(stmt)
            buf.clear()
            i += 1
            continue

        buf.append(ch)
        i += 1

    tail = "".join(buf).strip()
    if tail:
        statements.append(tail)
    return statements


async def run_schema(pool: asyncpg.Pool) -> None:
    schema_path = Path(__file__).resolve().parents[1] / "schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    async with pool.acquire() as conn:
        statements = _split_sql_statements(schema_sql)
        async with conn.transaction():
            for stmt in statements:
                await conn.execute(stmt)


async def fetch_one(conn: asyncpg.Connection, query: str, *args: Any) -> asyncpg.Record | None:
    return await conn.fetchrow(query, *args)


async def fetch_all(conn: asyncpg.Connection, query: str, *args: Any) -> list[asyncpg.Record]:
    rows = await conn.fetch(query, *args)
    return list(rows)
