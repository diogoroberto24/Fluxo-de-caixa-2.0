FROM node:22.14.0

ENV NODE_ENV=production \
    YARN_ENABLE_IMMUTABLE_INSTALLS=true

WORKDIR /app

COPY .yarn/ .yarn/
COPY .yarnrc.yml package.json yarn.lock .

RUN corepack enable && \
    corepack prepare yarn@3.8.3 --activate && \
    yarn install --immutable

COPY . .

RUN yarn prisma generate && yarn build

EXPOSE 3333

CMD ["yarn", "start:prod"]
