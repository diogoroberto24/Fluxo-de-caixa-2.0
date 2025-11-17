## Visão Geral
- Projeto é Next.js 14 com Prisma; `start` usa `next start` (package.json:9).
- Já há Dockerfile multi-stage, docker-compose e `docker-entrypoint.sh`. Falta endpoint de saúde.
- Vamos padronizar envs (DEV/PROD), trocar base para `node:20-alpine`, ajustar CORS, scripts Prisma e preparar instruções Render/Neon.

## 1. Variáveis de Ambiente
- Criar/atualizar `.env.example` com placeholders:
  - `DATABASE_URL_PROD=postgres://<NEON_USER>:<NEON_PASSWORD>@<NEON_HOST>:5432/<NEON_DBNAME>?sslmode=require&channel_binding=require`
  - `DATABASE_URL_DEV=postgres://<LOCAL_USER>:<LOCAL_PASSWORD>@localhost:5432/<LOCAL_DBNAME>`
  - `DATABASE_URL` definido via arquivo de ambiente: em DEV apontar para `DATABASE_URL_DEV`; em PROD apontar para `DATABASE_URL_PROD` (Render usará `DATABASE_URL` diretamente).
  - `PORT` (Render define automaticamente; manter fallback `3000`).
  - `FRONTEND_URL=https://seu-site.vercel.app`.
  - `NODE_ENV=production` em produção.
  - `JWT_SECRET=<placeholder>`.
- Adicionar `.env.production.example` contendo somente chaves de produção com placeholders.
- Manter outras variáveis existentes (ex.: e-mail, Redis) como placeholders, sem credenciais reais.

## 2. Docker (Produção)
- Converter Dockerfile para `node:20-alpine` com multi-stage:
  - Stage builder: copiar `package.json`/lockfiles, `prisma/`, `npm ci`, `npx prisma generate`, copiar código, `npm run build`.
  - Stage final: copiar `.next`, `node_modules`, `prisma`, `next.config.mjs`, `public`.
  - `EXPOSE ${PORT}` e `CMD` via `docker-entrypoint.sh`.
  - `HEALTHCHECK` com `curl http://localhost:${PORT}/api/health || exit 1`.
  - Instalar `curl` e `libc6-compat` no Alpine para compatibilidade.
- `.dockerignore`: garantir exclusão de `node_modules`, `.next`, `dist`, `.env*` (já está adequado).

## 3. Docker Compose (Dev)
- `docker-compose.yml` apenas para desenvolvimento:
  - Serviço `app`: build local do Dockerfile, `ports: "3000:3000"`, montar volume do código, `env_file: .env`.
  - Serviço `postgres_local`: `image: postgres:16`, `POSTGRES_USER/PASSWORD/DB`, volume persistente, `ports: "5432:5432"`.
  - Remover dependência de `postgres_local` para produção; usar Neon em PROD.

## 4. Prisma + Scripts
- `prisma/schema.prisma` já aponta `env("DATABASE_URL")` (prisma/schema.prisma:7); manter.
- Garantir `postinstall: prisma generate` (package.json:10) e `build: tsc && prisma generate && next build` (ajuste se usarmos TypeScript build separado).
- Adicionar scripts:
  - `"migrate:deploy": "prisma migrate deploy"`.
  - `"start": "next start"` (já existe) e manter.
- `docker-entrypoint.sh`: manter `prisma migrate deploy` antes do `next start`.

## 5. Endpoint de Saúde
- Criar `app/api/health/route.ts`:
  - `GET` retorna `{status: "ok"}` e, opcionalmente, resultado de `checkDatabaseConnection()` de `lib/db.ts` (lib/db.ts:15–23).
  - Usado pelo HEALTHCHECK e verificação pós-deploy.

## 6. Deploy na Render
- Conectar o repositório (branch `main`) ao Render.
- Criar Web Service usando Docker; Render lerá `Dockerfile`.
- Variáveis no painel Render:
  - `DATABASE_URL` = string completa da Neon (PROD) com `sslmode=require&channel_binding=require`.
  - `NODE_ENV=production`.
  - `PORT` opcional (Render fornece), `JWT_SECRET`, `FRONTEND_URL` e demais chaves necessárias.
- Start Command: deixar o Dockerfile comandar; opcionalmente `prisma migrate deploy && next start` se não usar entrypoint.
- Health Check URL: `/api/health`.

## 7. Neon: Formato Exato
- Exemplo pronto para Render:
  - `postgres://<NEON_USER>:<NEON_PASSWORD>@<NEON_HOST>:5432/<NEON_DBNAME>?sslmode=require&channel_binding=require`.
- Como obter:
  - No painel da Neon, copiar a "Connection string" e substituir `<NEON_USER>/<NEON_PASSWORD>/<NEON_DBNAME>` conforme exibido.
  - Observação: o host costuma ser `ep-xxx.us-east-2.aws.neon.tech`; se usar pooler, a string pode incluir `-pooler`. Manter `sslmode=require`.
- Não comitar credenciais; usar Secrets no Render.

## 8. Testes Locais e Verificação
- Build local da imagem: `docker build -t meu-backend:local .`.
- Rodar container simulando produção (Neon):
  - `docker run --rm -e DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require&channel_binding=require" -e NODE_ENV=production -e PORT=3000 -p 3000:3000 meu-backend:local`.
- Dev com Postgres local:
  - `docker compose up --build`.
- Migrations Prisma:
  - `npx prisma migrate deploy --schema=./prisma/schema.prisma`.
  - `npx prisma generate`.
- Testar endpoints:
  - `curl -v http://localhost:3000/api/health`.
  - `curl -v http://localhost:3000/api/algum-endpoint`.
- Logs: `docker logs <container_id>`.
- Pós-deploy Render:
  - `curl -v https://<sua-api-on-render>/api/health`.
  - Confirmar migrations; se necessário rodar `prisma migrate deploy` via job/start command.
  - Testar endpoints com dados da Neon.
  - Verificar CORS com front na Vercel.

## 9. CORS e Segurança
- Atualizar `next.config.mjs` para usar `process.env.FRONTEND_URL` como origem única.
- Em produção, garantir `sslmode=require&channel_binding=require` no `DATABASE_URL`.
- Não comitar `.env` com credenciais; distribuir somente `.env.example`.

## 10. Entregáveis
- `.env.example` e `.env.production.example` (placeholders).
- Dockerfile final (produção em `node:20-alpine`) e `docker-entrypoint.sh`.
- `docker-compose.yml` (dev) e `.dockerignore` atualizado.
- `prisma/schema.prisma` (sem mudanças funcionais; validação do datasource).
- `package.json` com scripts (`build`, `start`, `postinstall`, `migrate:deploy`).
- `app/api/health/route.ts`.
- `README` com:
  - Passo-a-passo Render (service, env vars, start/health check).
  - Como obter connection string Neon e formato exato.
  - Comandos de teste local e verificação pós-deploy.

## Observações Técnicas
- O projeto atual usa otimizações para Tailwind/LightningCSS em Debian; ao migrar para Alpine, instalaremos `libc6-compat` e `curl` e validaremos build. Se houver incompatibilidade de binários, alternativamente manteremos base Debian para estabilidade (avisaremos).