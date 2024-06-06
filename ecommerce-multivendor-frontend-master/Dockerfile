# Use an official Node.js runtime as the base image
FROM node:14 AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install --only=production

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build
