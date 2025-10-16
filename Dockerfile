# Build
FROM oven/bun:1 as builder

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . . 

RUN bunx prisma generate

# Production
FROM oven/bun:1

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/index.ts ./index.ts
COPY --from=builder /app/src ./src

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "run", "index.ts"]
