FROM node:25-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# The service account key should be mounted as a secret at runtime
# DO NOT copy serviceAccountKey.json into the image!

# Port is not really used (this is a Firebase listener, not HTTP server)
# But we expose it in case you add an HTTP health check endpoint later
EXPOSE 3000

# Run the service
CMD ["npm", "start"]
