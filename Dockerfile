FROM node:20-bookworm AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund
RUN npm rebuild @tailwindcss/oxide || true
RUN LCSS_VER=$(node -p "require('./node_modules/lightningcss/package.json').version") && npm install "lightningcss-linux-x64-gnu@${LCSS_VER}" --no-save || true
RUN npx prisma generate
COPY . .
RUN npm run build
ENV NEXT_TELEMETRY_DISABLED=1

FROM node:20-bookworm AS production
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost:${PORT:-3000}/api/health || exit 1
CMD ["/usr/local/bin/docker-entrypoint.sh"]
