FROM node:20-alpine AS base
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/db/package.json packages/db/package.json
RUN npm ci

FROM base AS dev
ENV NODE_ENV=development
COPY apps/api apps/api
COPY packages/shared packages/shared
COPY packages/db packages/db
EXPOSE 3000
CMD ["npm", "run", "dev", "-w", "@acme/api"]

FROM base AS build
ENV NODE_ENV=production
COPY apps/api apps/api
COPY packages/shared packages/shared
COPY packages/db packages/db
RUN npm run prisma:generate -w @acme/db
RUN npm run build -w @acme/shared
RUN npm run build -w @acme/api

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/server.js"]