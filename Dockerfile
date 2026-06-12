FROM node:20-alpine AS builder

WORKDIR /app

COPY client/package*.json client/
RUN cd client && npm ci

COPY client/ client/
RUN cd client && npm run build

FROM node:20-alpine AS server

WORKDIR /app

COPY server/package*.json server/
RUN cd server && npm ci --omit=dev

COPY server/ server/
COPY --from=builder /app/client/dist/ client/dist/

WORKDIR /app/server

EXPOSE 3000

CMD npx prisma generate && npx prisma migrate deploy && node server.js
