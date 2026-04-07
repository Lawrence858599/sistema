# AGENTS.md (guia rapido do repo)

## Visao geral

- `backend/`: FastAPI + PostgreSQL (asyncpg)
  - Aplica `backend/schema.sql` no startup
  - Autenticacao via `Authorization: Bearer <token>` (role `admin`/`user`)
- `frontend/`: React + Vite (SPA)
  - Layout com sidebar (hover) + temas claro/escuro
  - Chamadas HTTP centralizadas em `frontend/src/services/`

## Como validar antes de finalizar (obrigatorio)

Rode sempre:

```powershell
.\scripts\check.ps1
```

Isso executa:
- Backend: `py_compile` + `pytest`
- Frontend: `npm run build`

Se algum passo falhar, corrija antes de encerrar a tarefa.

## Convencoes do projeto

- Frontend:
  - Preferir estado React / hooks; evitar `window.location.reload()`.
  - Preferir animacoes por `transform/opacity` para performance.
  - Assets estaticos em `frontend/src/assets/` (logo placeholder ja existe).
- Backend:
  - Mudancas no banco devem ser idempotentes (`IF NOT EXISTS`).
  - Rotas sensiveis devem usar `require_admin`.

