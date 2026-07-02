# ── Stage 1: Build the React app ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite picks up VITE_API_URL at build time.
# In Docker Compose, the Nginx proxy handles /api → backend,
# so we use a relative path which works for both local & cloud.
ENV VITE_API_URL=/api

RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
