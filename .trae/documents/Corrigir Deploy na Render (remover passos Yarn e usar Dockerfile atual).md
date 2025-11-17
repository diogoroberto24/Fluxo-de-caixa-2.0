## Diagnóstico
- O build da Render está usando um Dockerfile diferente do que existe no repositório local (base `node:22.14.0` e passos Yarn). Isso causa erro ao copiar `.yarn/` e `.yarnrc.yml` que não existem.
- Nosso Dockerfile atual usa `node:20-alpine` e `npm ci`, sem Yarn, e já inclui `prisma generate`, HEALTHCHECK e entrypoint.

## Correções no Render
- Reconectar o repositório e garantir acesso completo do Render ao GitHub.
- Configurar o Web Service para apontar para a branch correta (`main`) onde está o Dockerfile atualizado.
- Selecionar "Use Docker" (sem Build/Start commands custom) para usar o `Dockerfile` da raiz.
- Limpar cache de build e disparar novo deploy.

## Alternativa (se precisar manter a branch `test`)
- Substituir o Dockerfile dessa branch pelo conteúdo npm-based (sem Yarn):
  - Base `node:20-alpine` em dois estágios (builder/production).
  - `COPY package.json package-lock.json* pnpm-lock.yaml* ./` + `npm ci`.
  - `npx prisma generate` + `npm run build`.
  - No estágio final, copiar `.next`, `node_modules`, `prisma`, `next.config.mjs`, `public`.
  - `HEALTHCHECK` com `curl` em `/api/health`.
  - `CMD` via `docker-entrypoint.sh` que roda `prisma migrate deploy` e `next start`.

## Variáveis e Migrations
- Definir `DATABASE_URL` com a “External Connection String” do PostgreSQL da Render.
- `NODE_ENV=production`, `JWT_SECRET`, `FRONTEND_URL` e (opcional) `PORT`.
- Migrations são aplicadas pelo entrypoint (`prisma migrate deploy`) antes do `next start`.

## Validação
- Local: `docker build -t fluxo-backend:local .` e `docker run --rm -e DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DB?sslmode=require" -e NODE_ENV=production -e PORT=3000 -p 3000:3000 fluxo-backend:local`.
- Health: `curl -v http://localhost:3000/api/health`.
- Pós-deploy Render: `curl -v https://<sua-api-on-render>/api/health`.

Posso aplicar a alternativa na branch usada pelo serviço (removendo os passos Yarn) ou ajustar o Web Service para usar a `main` e forçar novo build. Confirma qual caminho deseja seguir?