# Stage 1: Build the React App
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine
# Copy the built files from Stage 1 to NGINX
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80 (internal)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]