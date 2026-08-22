FROM node:18-alpine

WORKDIR /app

# Install Docker CLI in worker to spawn execution sandboxes
RUN apk add --no-cache docker-cli bash

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
