# syntax=docker/dockerfile:1

# --- Build Stage ---
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install dependencies (use npm ci for deterministic builds)
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files (excluding .git, .env, lock files, etc. via .dockerignore)
COPY --link . .

# Build the production assets
RUN npm run build

# Remove dev dependencies and keep only production deps
RUN rm -rf node_modules && \
    npm ci --production

# --- Production Stage ---
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy built assets and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Use non-root user
USER appuser

# Expose default Vite preview port
EXPOSE 4173

# Start the production preview server
CMD ["npm", "run", "preview"]
