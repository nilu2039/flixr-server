FROM node:21-alpine AS base

RUN npm install -g pnpm
RUN npm install -g pm2
RUN npm install -g tsx

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

FROM base AS dev

COPY . .

FROM dev AS build

RUN pnpm build

FROM base AS prod

RUN mkdir /app/src/ && mkdir /app/src/db/

COPY --from=dev /app/src/db/ /app/src/db/
COPY --from=dev /app/src/env.ts /app/src/env.ts

COPY --from=build /app/dist /app