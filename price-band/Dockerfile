# syntax=docker/dockerfile:1.7-labs

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL=file:./prisma/dev.db
RUN npx prisma generate && npx prisma db push --accept-data-loss

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN mkdir -p /app/public/uploads

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./standalone/.next/static

EXPOSE 3000

VOLUME ["/app/prisma", "/app/public/uploads"]

CMD ["node", "standalone/server.js"]


