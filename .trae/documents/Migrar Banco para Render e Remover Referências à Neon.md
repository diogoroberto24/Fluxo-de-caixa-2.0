## Objetivo
- Remover toda referência à Neon e configurar produção usando apenas Render (Web Service + PostgreSQL gerenciado).

## Alterações de Configuração
- `.env.example`:
  - Substituir `DATABASE_URL_PROD` pelo formato do PostgreSQL da Render: `postgres://<RENDER_USER>:<RENDER_PASSWORD>@<RENDER_HOST>:5432/<RENDER_DBNAME>?sslmode=require`.
  - Manter `DATABASE_URL_DEV` para Postgres local.
  - Deixar `DATABASE_URL` em branco (será definido pelo ambiente).
- `.env.production.example`:
  - `DATABASE_URL=postgres://<RENDER_USER>:<RENDER_PASSWORD>@<RENDER_HOST>:5432/<RENDER_DBNAME>?sslmode=require`.
- `README.md`:
  - Remover seção da Neon e instruções de `channel_binding`.
  - Adicionar guia de criação do PostgreSQL no Render, obtenção da connection string e configuração das variáveis (inclui `sslmode=require`).
  - Atualizar checklist de testes locais e pós-deploy para referenciar Render Postgres, não Neon.

## Código/Infra
- `prisma/schema.prisma` permanece com `env("DATABASE_URL")`.
- Dockerfile/entrypoint/dcompose permanecem válidos; usam `DATABASE_URL` do ambiente.
- CORS continua com `FRONTEND_URL`.

## Passo-a-passo Render
- Criar recurso PostgreSQL no Render.
- Copiar `External Connection String` e definir como `DATABASE_URL` no Web Service.
- Variáveis obrigatórias: `NODE_ENV=production`, `JWT_SECRET`, `FRONTEND_URL`, opcional `PORT`.
- Health check: `/api/health`.

## Testes
- Local prod: `docker run` com `DATABASE_URL` do Render (atenção ao uso em base real).
- Dev: `docker compose up --build` com Postgres local.
- Prisma: `npx prisma migrate deploy` e `npx prisma generate`.
- Verificação: curl em `/api/health` local e no Render.

## Entregáveis
- `.env.example` e `.env.production.example` sem Neon.
- `README.md` com instruções Render PostgreSQL e testes.

Confirma que posso aplicar as mudanças agora?