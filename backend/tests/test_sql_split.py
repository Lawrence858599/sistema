from __future__ import annotations

from app.db import _split_sql_statements


def test_split_sql_statements_basic() -> None:
    sql = "CREATE TABLE a(id int);\nCREATE TABLE b(id int);\n"
    stmts = _split_sql_statements(sql)
    assert stmts == ["CREATE TABLE a(id int)", "CREATE TABLE b(id int)"]


def test_split_sql_ignores_semicolons_in_strings() -> None:
    sql = "INSERT INTO t(v) VALUES('a;b');\nSELECT 1;\n"
    stmts = _split_sql_statements(sql)
    assert stmts[0].startswith("INSERT INTO t")
    assert stmts[1] == "SELECT 1"
