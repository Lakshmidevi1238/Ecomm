# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the application
COPY . .
RUN npm run build # Creates the 'build' directory

# ---------- Run Stage ----------
FROM nginx:stable-alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# (optional) copy placeholder image into the served static site so /images/placeholder.png exists
# If you already have public/images/placeholder.png in your React project it will be in /usr/share/nginx/html/images/placeholder.png
# If not, provide one or remove this line.
# COPY public/images/placeholder.png /usr/share/nginx/html/images/placeholder.png

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
