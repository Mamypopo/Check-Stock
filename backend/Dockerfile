# Stage 1: Build the Node.js backend application with Node.js Alpine
FROM node:20.15-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install
# Copy the rest of the application files
COPY . .

RUN npx prisma generate

# Stage 2: Production-ready image
FROM node:20.15-alpine

# Set the working directory
WORKDIR /app

# Copy the node_modules from the builder stage to the production stage
COPY --from=builder /app /app

# Expose port 8004
EXPOSE 8004

# Start the app using npm start (defined in package.json)
CMD ["npm", "start"]
