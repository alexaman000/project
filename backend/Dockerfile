# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production-only deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled dist from builder stage
COPY --from=builder /app/dist ./dist

# Expose the backend port
EXPOSE 3001

CMD ["node", "dist/main"]
