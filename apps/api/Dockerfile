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
COPY . .
RUN npm run db:generate
RUN npm run build -ws

FROM node:20-alpine AS prod
WORKDIR /repo
ENV NODE_ENV=production

# Copy node_modules
COPY --from=build /repo/node_modules ./node_modules

# Copy built artifacts
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=build /repo/packages/db/dist ./packages/db/dist
COPY --from=build /repo/packages/db/prisma ./packages/db/prisma

# Copy package files (needed for module resolution)
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /repo/packages/db/package.json ./packages/db/package.json

EXPOSE 3000
CMD ["node", "apps/api/dist/src/server.js"]