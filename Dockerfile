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
COPY --from=builder /app/dist ./dist
# Copy migration/seed scripts if needed
COPY --from=builder /app/src/ensure-data.ts ./src/ensure-data.ts

# Expose port and start
EXPOSE 3000
CMD ["node", "dist/index.js"]
