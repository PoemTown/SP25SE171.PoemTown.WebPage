# Stage 1: Build the React app
FROM node:19 as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app for production
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 2: Serve the app using NGINX
FROM nginx:alpine

# Copy the built React app from the previous stage to the NGINX public directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom NGINX config (optional for reverse proxy or other configuration)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for the container
EXPOSE 3000

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
