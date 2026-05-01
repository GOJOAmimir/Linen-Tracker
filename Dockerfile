# ── Stage 1: Build frontend ─────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Install frontend dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source and build
COPY . .
ARG VITE_API_URL=""
ARG VITE_WS_URL=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
RUN npm run build

# ── Stage 2: Production API ────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install API dependencies only
COPY linen-tracker-api/package.json linen-tracker-api/package-lock.json ./
RUN npm ci --omit=dev

# Copy API source code
COPY linen-tracker-api/ .

# Copy built frontend into the path the API serves
COPY --from=frontend-build /app/dist ./client/dist

EXPOSE 8080

CMD ["node", "index.js"]
