# Sistema de Manutencao

Estrutura inicial full stack com:

- `frontend/`: HTML5, CSS3 e JavaScript puro.
- `backend/`: Node.js + Express + PostgreSQL.

## Backend

1. Copie `backend/.env.example` para `backend/.env`.
2. Ajuste `DATABASE_URL` com seu PostgreSQL.
3. Execute o schema ou reaplique-o para criar as novas colunas e a tabela de imagens:

```sql
\i schema.sql
```

4. Instale as dependencias e inicie a API:

```bash
cd backend
npm install
npm start
```

## Frontend

O frontend agora foi reescrito em React com Vite.
1. `cd frontend`
2. `npm install`
3. `npm run dev`

A aplicacao ainda aponta para `http://localhost:3000` (via `VITE_API_BASE_URL`) para se comunicar com o backend.

## Recursos atuais

- Login com sessao simples em `localStorage`.
- Tema claro/escuro com persistencia em `localStorage`.
- Interface renovada com tipografia moderna, espacos arejados e paleta amarelo/laranja.
- Cadastro de chamado com cliente, telefone, email e imagens.
- Armazenamento de imagens no PostgreSQL com metadados em `task_images`.
- Download direto dos anexos no modal e na pagina dedicada.
- Visualizacao detalhada do chamado no dashboard e em uma nova guia de detalhes.

## Credenciais iniciais

- Email: `admin@sistema.com`
- Senha: `123456`
