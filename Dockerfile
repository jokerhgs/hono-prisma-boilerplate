# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder
# Build the TypeScript source into JavaScript
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: Lambda runtime image
# Use the official AWS Lambda Node.js 20 base image
# ──────────────────────────────────────────────────────────────────────────────
FROM public.ecr.aws/lambda/nodejs:20 AS runner

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy only production dependencies and package.json (needed for "type": "module")
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled JavaScript output directly into task root
COPY --from=builder /app/dist ./

# The Lambda handler must be: <file>.<export>
# Our compiled output is now: lambda.js  →  export handler
CMD ["lambda.handler"]
