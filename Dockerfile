FROM node:18-alpine

WORKDIR /app

# Install build deps for some packages if needed
RUN apk add --no-cache python3 make g++

COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm install --production

COPY . .

# Build Next.js app
RUN npm run build || true

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
