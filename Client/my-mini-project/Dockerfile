# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files first to install dependencies
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the frontend project files
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the app using NGINX
FROM nginx:alpine

# Copy the build output to the NGINX html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
