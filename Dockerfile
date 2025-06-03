# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend only
RUN npm run build

# Build the production server without vite dependencies
RUN npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/server.js

# Create public directory and copy built files
RUN mkdir -p public && cp -r dist/public/* ./public/ 2>/dev/null || cp -r dist/* ./public/ 2>/dev/null || true

# Remove devDependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 5000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application with custom script
CMD ["node", "start-production.js"]