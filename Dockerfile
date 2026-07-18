# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install --legacy-peer-deps

COPY frontend/ .

RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "--gzip", "--brotli"]
