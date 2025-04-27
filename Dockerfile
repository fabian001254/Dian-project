# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production=false
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production

# Copiar los archivos compilados
COPY --from=builder /app/dist ./dist

# Copiar los scripts de inicio
COPY railway-start.js ./railway-start.js
COPY server.js ./server.js

# Crear directorio para datos persistentes
RUN mkdir -p /data
VOLUME ["/data"]

# Healthcheck para verificar que la aplicación esté funcionando
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-10000}/api/health || exit 1

# Expose port and start
EXPOSE ${PORT:-10000}

# Usar el script de inicio de Railway
CMD ["node", "railway-start.js"]
