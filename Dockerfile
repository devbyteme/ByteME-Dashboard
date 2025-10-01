# # syntax=docker/dockerfile:1

# # --- Build Stage ---
# ARG NODE_VERSION=22.13.1
# FROM node:${NODE_VERSION}-slim AS builder
# WORKDIR /app

# # Install dependencies including devDependencies
# COPY --link package.json package-lock.json ./
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci

# # Copy source files
# COPY --link . .

# # Build Vite production assets
# RUN npm run build

# # --- Production Stage ---
# FROM node:${NODE_VERSION}-slim AS final
# WORKDIR /app

# # Create non-root user
# RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# # Copy built assets and all dependencies (including devDependencies)
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./

# # Set environment variables
# ENV NODE_ENV=production
# ENV NODE_OPTIONS="--max-old-space-size=4096"

# # Use non-root user
# USER appuser

# # Expose Vite preview port
# EXPOSE 4173

# # Start Vite preview
# CMD ["npx", "vite", "preview", "--port", "4173", "--host"]
# syntax=docker/dockerfile:1
# syntax=docker/dockerfile:1

# --- Build Stage ---
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install dependencies including devDependencies
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files and config
COPY --link . .
COPY --link vite.config.js ./

# Build Vite production assets
RUN npm run build

# --- Production Stage ---
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy only what's needed for production
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/vite.config.js ./

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Use non-root user
USER appuser

# Expose Vite preview port
EXPOSE 4173

# Start Vite preview with explicit host binding
CMD ["npx", "vite", "preview", "--port", "4173", "--host", "0.0.0.0"]
