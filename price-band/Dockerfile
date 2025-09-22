# syntax=docker/dockerfile:1.7-labs

############################################
# 1) Dependencies layer
############################################
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

############################################
# 2) Builder layer (build Next + Prisma)
############################################
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma: generate client and create SQLite db
ENV DATABASE_URL=file:./prisma/dev.db
RUN npx prisma generate && npx prisma db push --accept-data-loss

# Next.js build (standalone)
RUN npm run build

############################################
# 3) Runtime layer
############################################
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create writable directories for uploads (and optional bind volume)
RUN mkdir -p /app/public/uploads

# Copy runtime artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./standalone/.next/static

EXPOSE 3000

# Suggested volumes for persistence
VOLUME ["/app/prisma", "/app/public/uploads"]

CMD ["node", "standalone/server.js"]


