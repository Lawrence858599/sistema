# Lume Store

Projeto de e-commerce full stack com foco em simplicidade, manutencao e organizacao. A aplicacao principal vive em `frontend/` com Next.js App Router, TypeScript, Prisma, autenticacao segura por cookie HTTP-only e um banco relacional SQLite para desenvolvimento local rapido.

O diretorio `backend/` foi mantido porque faz parte da base historica do repositorio e continua sendo validado pelo `check.ps1`, mas o e-commerce novo foi implementado de forma integrada no Next.js.

## Tecnologias utilizadas

- Next.js 16 com App Router
- TypeScript em todo o frontend integrado
- Prisma Client para acesso ao banco
- SQLite para ambiente local e seeds rapidos
- Zod para validacao de entrada
- jose para sessao autenticada em cookie HTTP-only
- bcryptjs para hash de senha
- Vitest para testes unitarios das regras principais

## Funcionalidades entregues

- Cadastro, login, logout e recuperacao de senha
- Perfil do usuario com dados pessoais, endereco e troca de senha
- Homepage com banner, busca, categorias e produtos em destaque
- Catalogo com busca, filtros e ordenacao
- Detalhe de produto com estoque e adicao ao carrinho
- Carrinho persistente por usuario autenticado
- Checkout com resumo do pedido e pagamento simulado
- Historico de pedidos do cliente
- Painel administrativo com CRUD de produtos e categorias
- Atualizacao de status dos pedidos
- Controle simples de usuarios com roles `CUSTOMER` e `ADMIN`
- API organizada em `app/api`

## Estrutura de pastas

```text
frontend/
  app/                 rotas, paginas e API do Next.js
  components/          componentes reutilizaveis da interface
  features/            schemas e actions por dominio
  hooks/               hooks pequenos de interface
  lib/                 auth, env, erros e Prisma client
  prisma/              schema, migrations e seed
  repositories/        acesso centralizado ao banco
  services/            regras de negocio por fluxo
  tests/               testes de autenticacao, carrinho, pedidos e validacoes
  types/               tipos e unions do dominio
  utils/               helpers de moeda, url, slug e formularios
backend/
  legado da base original do repositorio
```

## Como instalar

```powershell
cd frontend
npm install
```

O `postinstall` gera automaticamente o Prisma Client.

## Variaveis de ambiente

Crie `frontend/.env` a partir de `frontend/.env.example`.

Exemplo usado no workspace local:

```env
DATABASE_URL="file:C:/vs projects/sistema/frontend/prisma/lume-store.db"
AUTH_SECRET="dev-auth-secret-change-me"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STORE_NAME="Lume Store"
NEXT_PUBLIC_CUSTOMER_DOCUMENT_LABEL="CPF"
```

## Como rodar o projeto

```powershell
cd frontend
npm run db:migrate
npm run db:seed
npm run dev
```

A aplicacao sobe em `http://localhost:3000` por padrao.

## Como rodar migrations

```powershell
cd frontend
npm run db:migrate
```

Esse comando aplica os SQLs de `frontend/prisma/migrations/` usando um runner local em SQLite e mantem o schema Prisma como fonte de verdade do modelo de dados.

## Como rodar o seed

```powershell
cd frontend
npm run db:seed
```

Credenciais administrativas iniciais:

- E-mail: `admin@lumestore.com`
- Senha: `Admin123!`

## Como executar testes

```powershell
cd frontend
npm run test:run
```

Os testes cobrem:

- autenticacao
- fluxo de carrinho
- criacao de pedido
- validacoes essenciais

## Como validar tudo pelo script do repositorio

```powershell
.\scripts\check.ps1
```

O script executa:

- backend legado: `py_compile` + `pytest`
- frontend novo: `npm run test:run` + `npm run build`

## Modulos principais

- `services/auth-service.ts`: cadastro, login, perfil, troca e reset de senha
- `services/cart-service.ts`: resumo do carrinho, quantidade e validacao de estoque
- `services/order-service.ts`: checkout, criacao do pedido e historico
- `services/admin-service.ts`: operacoes do painel administrativo
- `repositories/*.ts`: camada de acesso ao banco
- `features/*/actions.ts`: server actions ligando UI e negocio
- `app/api/*`: endpoints HTTP para integracao externa ou consumo interno

## Observacoes

- O diretório `frontend/legacy-src/` e `frontend/legacy-vite/` guardam a base antiga isolada para nao misturar com o novo projeto.
- O banco local padrao e SQLite para manter setup rapido, mas o schema foi modelado para crescer sem virar bagunca.