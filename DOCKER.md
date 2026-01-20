# Docker Deployment Guide

Run the entire Microblog stack (PostgreSQL + FastAPI + Next.js) with a single command.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (or Docker + Docker Compose)
- 4GB+ RAM available for Docker

### One Command Deploy

```bash
docker-compose up
```

That's it! The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### First Time Setup

1. **Generate Secrets** (production/staging only)

   ```bash
   # Generate secrets
   echo "PYTHON_SECRET_KEY=$(openssl rand -base64 32)" > .env
   echo "NEXTJS_SESSION_SECRET=$(openssl rand -base64 32)" >> .env
   ```

   For development, Docker Compose uses safe defaults.

2. **Start Services**

   ```bash
   docker-compose up
   ```

3. **Create Your First User**

   Visit http://localhost:3000 and click "Sign up"

## 🛠️ Docker Commands

### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start specific service
docker-compose up frontend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes data!)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Rebuild After Code Changes

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and start
docker-compose up --build
```

## 🔧 Development Mode

For hot-reload during development:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This mounts your local code into containers for live updates.

## 🏗️ Services

### PostgreSQL (db)
- **Port**: 5432
- **Database**: microblog
- **User**: postgres
- **Password**: postgres
- **Volume**: `postgres_data` (persists between restarts)

### FastAPI Backend (backend)
- **Port**: 8000
- **Auto-runs migrations** on startup
- **Hot reload** in dev mode
- **Health check**: http://localhost:8000/health

### Next.js Frontend (frontend)
- **Port**: 3000
- **Server-side rendering**
- **API calls** to backend service

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5432 | xargs kill -9  # Database
```

### Database Connection Issues

```bash
# Check database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### Frontend Can't Reach Backend

```bash
# Check backend is running
curl http://localhost:8000/health

# Check backend logs
docker-compose logs backend
```

### Reset Everything

```bash
# Stop all services and remove data
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## 📦 What's Running?

```bash
# View running containers
docker-compose ps

# View resource usage
docker stats

# Exec into a container
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🧪 Running Tests in Docker

### Python Tests

```bash
docker-compose exec backend pytest
docker-compose exec backend pytest --cov=app
```

### Next.js Tests

```bash
docker-compose exec frontend npm test
```

### E2E Tests

```bash
# Install Playwright in frontend container
docker-compose exec frontend npx playwright install

# Run E2E tests
docker-compose exec frontend npm run e2e
```

## 🌐 Production Deployment

### Using Docker Compose

1. **Set Production Secrets**

   ```bash
   # .env file
   PYTHON_SECRET_KEY=$(openssl rand -base64 32)
   NEXTJS_SESSION_SECRET=$(openssl rand -base64 32)
   ENVIRONMENT=production
   NODE_ENV=production
   ```

2. **Use Production Compose File**

   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     backend:
       restart: unless-stopped
       environment:
         ENVIRONMENT: production
     frontend:
       restart: unless-stopped
       environment:
         NODE_ENV: production
   ```

3. **Deploy**

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Using Docker Swarm / Kubernetes

See deployment guides:
- Docker Swarm: `docs/deploy-swarm.md`
- Kubernetes: `docs/deploy-k8s.md`

## 📊 Monitoring

### Health Checks

All services have health checks:

```bash
# View health status
docker-compose ps

# Backend health
curl http://localhost:8000/health

# Database health
docker-compose exec db pg_isready -U postgres
```

### Logs

```bash
# Follow logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > logs.txt
```

## 🔐 Security Notes

1. **Change Default Secrets** - Never use defaults in production
2. **Use HTTPS** - Put behind reverse proxy (nginx/traefik)
3. **Limit Exposure** - Don't expose PostgreSQL port in production
4. **Update Regularly** - Keep base images updated

## ⚡ Performance Tips

1. **Use BuildKit** - Faster Docker builds
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

2. **Layer Caching** - Order Dockerfile commands by change frequency

3. **Multi-stage Builds** - Smaller images (already configured)

4. **Resource Limits** - Set in docker-compose.yml
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## 🆘 Getting Help

- Check logs: `docker-compose logs`
- Restart services: `docker-compose restart`
- Reset everything: `docker-compose down -v && docker-compose up --build`

---

**Docker = One Command Deploy** 🚀
