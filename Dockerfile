# syntax=docker/dockerfile:1

# --- Build Stage ---
FROM node:22.13.1-slim AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build production assets
RUN npm run build

# --- Nginx Stage ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
