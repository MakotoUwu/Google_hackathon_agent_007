# Multi-stage Dockerfile for Maps Agent with Google ADK
# Stage 1: Build frontend
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files, .npmrc, and patches
COPY package.json pnpm-lock.yaml .npmrc ./
COPY patches ./patches

# Enable pnpm via corepack and install dependencies
RUN corepack enable pnpm && \
    pnpm install --no-frozen-lockfile

# Copy all source code
COPY . .

# Build frontend and backend
RUN pnpm run build

# Stage 2: Production image with Python + Node.js
FROM node:22-slim

WORKDIR /app

# Install Python 3.11 and pip
RUN apt-get update && \
    apt-get install -y python3.11 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies for ADK
# Use --break-system-packages for Debian 12 Python 3.11
RUN pip3 install --no-cache-dir --break-system-packages \
    google-genai==1.27.0 \
    google-adk \
    google-cloud-aiplatform \
    fastapi \
    uvicorn \
    python-dotenv \
    requests

# Enable pnpm via corepack
RUN corepack enable pnpm

# Copy patches and package files (patches must be present before pnpm install)
COPY package.json pnpm-lock.yaml .npmrc ./
COPY patches ./patches
RUN pnpm install --prod --no-frozen-lockfile

# Copy built files from builder stage
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/dist ./dist

# Copy server code and Python agent
COPY server ./server
COPY shared ./shared
COPY maps_agent ./maps_agent
COPY tsconfig.json ./

# Create directory for credentials
RUN mkdir -p /app/credentials

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    PYTHONUNBUFFERED=1 \
    GOOGLE_GENAI_USE_VERTEXAI=TRUE

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the server
CMD ["pnpm", "start"]
