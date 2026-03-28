# ===== BUILD STAGE =====
FROM node:25.8-alpine3.22 AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files and install (cached layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm build

# ===== RUNTIME STAGE =====
FROM node:25.8-alpine3.22 

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy node_modules from builder (includes vite as devDependency)
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json for the preview script
COPY package.json ./

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4173

ENTRYPOINT ["pnpm", "preview", "--host", "0.0.0.0"]