FROM node:20-alpine

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json ./
RUN npm install --production

# Remove build tools to slim the image
RUN apk del python3 make g++

COPY . .

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server.js"]
