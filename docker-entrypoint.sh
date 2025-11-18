#!/bin/sh
set -e
echo "Aguardando banco de dados em ${DATABASE_URL}..."
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL não definido. Configure a variável no Render."
  exit 1
fi
COUNT=0
until npx prisma migrate status >/dev/null 2>&1 || [ $COUNT -ge 30 ]; do
  COUNT=$((COUNT+1))
  sleep 2
done
echo "Aplicando migrações do Prisma..."
npx prisma migrate deploy
echo "Iniciando Next.js na porta ${PORT:-3000}..."
exec npx next start -p ${PORT:-3000}