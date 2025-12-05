# Use a light version of Node
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies (cached if package.json doesn't change)
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# We don't specify CMD here, we will do it in docker-compose