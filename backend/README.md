# Backend (FastAPI)

## Requisitos

- Python 3.11+
- PostgreSQL

## Configuracao

1) Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL`.

2) (Opcional) Crie o banco:

```bash
createdb reidosol
```

## Instalacao e execucao

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 3000
```

O backend executa o `backend/schema.sql` automaticamente no startup (criando tabelas e seed do admin).

## Exemplos (curl)

```bash
curl -s -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@sistema.com\",\"password\":\"123456\"}"
```

```bash
curl -s http://localhost:3000/tasks
```

```bash
curl -s -X POST http://localhost:3000/tasks ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Vazamento\",\"location\":\"Sala de maquinas\",\"clientName\":\"Carlos\",\"clientPhone\":\"(11) 99999-9999\",\"clientEmail\":\"cliente@empresa.com\",\"description\":\"Detalhe o problema\",\"createdBy\":1,\"images\":[]}" 
```

```bash
curl -s -X PUT http://localhost:3000/tasks/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"Concluido\"}"
```
