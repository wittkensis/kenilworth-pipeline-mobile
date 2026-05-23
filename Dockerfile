FROM node:22-alpine AS base

# Install build tools needed for better-sqlite3 native module
RUN apk add --no-cache python3 make g++ sqlite-dev

FROM base AS deps
WORKDIR /app
COPY package*.json ./
# NODE_ENV=development forces devDependencies install
# (Coolify injects NODE_ENV=production at build time which skips devDeps)
RUN NODE_ENV=development npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Explicit production build so Next.js uses production React builds
RUN NODE_ENV=production npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create database directory with correct permissions
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_PATH=/data/pipeline.db

CMD ["node", "server.js"]
