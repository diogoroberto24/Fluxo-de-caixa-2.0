# Fluxo de caixa UI

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/martinsdiogo1124-2024s-projects/v0-fluxo-de-caixa-ui)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/hZgRXArybng)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/martinsdiogo1124-2024s-projects/v0-fluxo-de-caixa-ui](https://vercel.com/martinsdiogo1124-2024s-projects/v0-fluxo-de-caixa-ui)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/hZgRXArybng](https://v0.app/chat/projects/hZgRXArybng)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Deploy na Render (Backend Docker)
- Conecte o repositório (branch `main`) em `https://dashboard.render.com/`.
- Crie um Web Service e selecione "Use Docker". O Render lerá o `Dockerfile`.
- Crie um recurso PostgreSQL no Render (Render PostgreSQL) e copie a **External Connection String**.
- Defina as variáveis de ambiente no painel do Web Service:
  - `DATABASE_URL` = `postgres://<RENDER_USER>:<RENDER_PASSWORD>@<RENDER_HOST>:5432/<RENDER_DBNAME>?sslmode=require`
  - `NODE_ENV=production`
  - `PORT` (opcional; Render fornece automaticamente)
  - `JWT_SECRET`, `FRONTEND_URL` e demais chaves necessárias.
- Health check: `/api/health`.
- Start: deixe o Dockerfile iniciar via `docker-entrypoint.sh`; alternativamente, `prisma migrate deploy && next start`.

## Banco de Dados no Render
- No dashboard do Render, crie o serviço PostgreSQL.
- Use a **External Connection String** como `DATABASE_URL` no Web Service.
- Recomendado manter `sslmode=require` na connection string.
- Nunca comite credenciais no repositório; use Secrets/Env Vars no Render.

## Testes Locais
- Build da imagem Docker:
  - `docker build -t meu-backend:local .`
- Execução simulando produção (Render DB):
  - `docker run --rm -e DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -e NODE_ENV=production -e PORT=3000 -p 3000:3000 meu-backend:local`
- Desenvolvimento com Postgres local:
  - `docker compose up --build`
- Migrations Prisma:
  - `npx prisma migrate deploy --schema=./prisma/schema.prisma`
  - `npx prisma generate`
- Health e endpoints:
  - `curl -v http://localhost:3000/api/health`
  - `curl -v http://localhost:3000/api/algum-endpoint`
- Logs:
  - `docker logs <container_id>`

## Verificação Pós-Deploy (Render)
- `curl -v https://<sua-api-on-render>/api/health`.
- Confirmar que `prisma migrate deploy` aplicou migrations.
- Testar endpoints que consultam/escrevem dados no PostgreSQL do Render.
- Verificar CORS a partir do frontend na Vercel (`FRONTEND_URL`).

## Integração Front-end (Vercel)
- Em produção, defina `NEXT_PUBLIC_API_URL=https://<sua-api-on-render>`.
- Faça o deploy do front e teste o fluxo completo (login, CRUD, relatórios).
