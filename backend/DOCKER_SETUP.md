# Backend Docker Deployment Guide

## 🚨 Security Note

**NEVER commit `serviceAccountKey.json` to Git!** This file contains sensitive credentials and is already in `.dockerignore` and `.gitignore`.

## Quick Start

### Local Development (without Docker)

```bash
cd backend
npm install
npm start
```

### Docker Deployment

#### Option 1: Docker Compose (Recommended)

```bash
cd backend
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f
```

Stop:
```bash
docker-compose down
```

#### Option 2: Docker Build & Run Manually

```bash
cd backend

# Build the image
docker build -t smart-gas-backend .

# Run with service account key mounted as volume
docker run -d \
  --name smart-gas-backend \
  -v $(pwd)/serviceAccountKey.json:/app/serviceAccountKey.json:ro \
  -e FIREBASE_DATABASE_URL=https://smart-gas-detector-98d0c-default-rtdb.firebaseio.com \
  smart-gas-backend
```

View logs:
```bash
docker logs -f smart-gas-backend
```

Stop and remove:
```bash
docker stop smart-gas-backend
docker rm smart-gas-backend
```

## 🔐 Security Best Practices

### 1. Service Account Key Management

**Current Setup:**
- ✅ `serviceAccountKey.json` is in `.dockerignore` (not copied into image)
- ✅ Mounted as read-only volume at runtime
- ✅ Never committed to Git

**Production Deployment:**

For production, use Docker secrets or cloud secret management:

#### Docker Swarm Secrets:
```bash
# Create secret
docker secret create firebase_service_account ./serviceAccountKey.json

# Update docker-compose.yml to use secrets
```

#### Kubernetes Secrets:
```bash
kubectl create secret generic firebase-service-account \
  --from-file=serviceAccountKey.json
```

#### Cloud Providers:
- **AWS**: Use AWS Secrets Manager + ECS task role
- **GCP**: Use Secret Manager + Cloud Run service account
- **Azure**: Use Key Vault + managed identity

### 2. Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### 3. Firebase Database Rules

Ensure your Firebase Realtime Database has proper security rules:

```json
{
  "rules": {
    "gasDetector": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "userTokens": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 📊 Monitoring

Add health check endpoint (optional):

```javascript
// Add to pushNotificationService.js
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(3000, () => {
  console.log('Health check endpoint running on port 3000');
});
```

Then enable health check in `docker-compose.yml`.

## 🐛 Troubleshooting

### Container won't start

Check logs:
```bash
docker logs smart-gas-backend
```

### Permission denied on serviceAccountKey.json

```bash
# Check file exists
ls -la serviceAccountKey.json

# On Windows PowerShell, use full path
docker run -v "$(pwd)/serviceAccountKey.json:/app/serviceAccountKey.json:ro" ...
```

### Firebase connection issues

Verify:
1. `serviceAccountKey.json` is valid JSON
2. Database URL is correct
3. Firebase project allows service account access

## 📦 What's Excluded from Docker Image

The `.dockerignore` ensures these are NOT copied into the image:
- `node_modules/` (installed fresh in container)
- `serviceAccountKey.json` (mounted at runtime)
- `.env` files (passed as environment variables)
- `.git/` (not needed in production)
- `*.log` files

## 🚀 Production Deployment Checklist

- [ ] Replace `npm install` with `npm ci --only=production` in Dockerfile ✅ (already done)
- [ ] Use Docker secrets or cloud secret management for serviceAccountKey.json
- [ ] Set `NODE_ENV=production`
- [ ] Enable Firebase authentication and security rules
- [ ] Set up monitoring and logging
- [ ] Configure restart policy: `restart: unless-stopped`
- [ ] Use specific Node.js version tag (not `latest`)
- [ ] Scan image for vulnerabilities: `docker scan smart-gas-backend`
- [ ] Set resource limits in docker-compose.yml

## 🔗 Related Files

- `Dockerfile` - Container definition
- `docker-compose.yml` - Multi-container orchestration
- `.dockerignore` - Files excluded from build context
- `.env.example` - Environment variable template
- `serviceAccountKey.json` - Firebase service account (git-ignored)
