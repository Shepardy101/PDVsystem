# Dockerfile para PDVsystem
# Build multi-stage: frontend (Vite) + backend (Express)

# Etapa 1: Build do frontend
FROM node:20 AS build-client
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:client

# Etapa 2: Build do backend
FROM node:20 AS build-server
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:server

# Etapa 3: Imagem final para produção
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-client /app/dist ./dist
COPY --from=build-server /app/server/dist ./server/dist
COPY --from=build-server /app/package.json ./
COPY --from=build-server /app/package-lock.json ./
COPY --from=build-server /app/data ./data
COPY --from=build-server /app/public ./public
COPY --from=build-server /app/docs ./docs
RUN npm ci --omit=dev
EXPOSE 8787
CMD ["node", "server/dist/index.js"]
