FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./

RUN apt-get update && apt-get install -y openssl
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "index.ts"]
