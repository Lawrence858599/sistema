# Regras de validacao (para manter o projeto consistente)

## Antes de finalizar qualquer alteracao

1) Rode o verificador do repo:

```powershell
.\scripts\check.ps1
```

2) Se algo falhar, corrija antes de seguir (nao use `window.location.reload()` no front; prefira atualizar estado).

Arquivos de regras (checklist) vivem em `rules/*.rules`.

## Frontend

- Sempre que mexer em UI/rotas/components: garantir que `npm run build` passa.
- Preferir componentes reutilizaveis em `frontend/src/components/` e chamadas HTTP em `frontend/src/services/`.
- Evitar travamentos: animacoes por `transform/opacity` (nao `left/width`), e polling leve (ex.: 15s).

## Backend

- Sempre que mexer em auth/rotas/db: garantir que `pytest` passa.
- Rotas protegidas devem exigir `Authorization: Bearer <token>` via `app/auth/dependencies.py`.
- Mudancas no schema devem ser idempotentes (`CREATE/ALTER ... IF NOT EXISTS`).
