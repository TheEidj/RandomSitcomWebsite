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
COPY apps/web apps/web
COPY packages/shared packages/shared
COPY packages/db packages/db
EXPOSE 5173
CMD ["npm", "run", "dev", "-w", "web", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
ENV NODE_ENV=production
COPY apps/web apps/web
COPY packages/shared packages/shared
COPY packages/db packages/db
RUN npm run prisma:generate -w @acme/db
RUN npm run build -w @acme/shared
RUN npm run build -w web