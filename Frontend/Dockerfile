FROM node:22-alpine

WORKDIR /app

COPY Frontend/package.json Frontend/pnpm-lock.yaml Frontend/pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY Frontend/ ./

EXPOSE 3000
CMD ["pnpm", "run", "dev"]
