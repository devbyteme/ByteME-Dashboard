# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

# --- Build Stage ---
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Accept build-time args
ARG VITE_API_BASE_URL
ARG NEXTAUTH_URL
# Pass them as env so Vite can access at build time
ENV VITE_API_BASE_URL=api.usebyteme.com
ENV NEXTAUTH_URL=https://usebyteme.com

# Install dependencies including devDependencies
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files
COPY --link . .

# Build Vite production assets (VITE_* will be injected here)
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL npm run build

# --- Production Stage ---
FROM nginx:alpine AS final

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80 (nginx default)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


