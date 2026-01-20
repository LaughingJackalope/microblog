# Kubernetes Deployment Guide

This project includes Kubernetes manifests for deploying the Microblog application to a Kubernetes cluster, such as the one provided by Docker Desktop.

## Status: ✅ VERIFIED WORKING

The Kubernetes deployment has been tested and verified on Docker Desktop's Kubernetes cluster.

## Prerequisites

- Docker Desktop with Kubernetes enabled
- `kubectl` command-line tool installed
- Images built locally (see below)

## Building Images

Before deploying to Kubernetes, you need to build the Docker images for the backend and frontend. If you are using Docker Desktop, the local images will be available to the Kubernetes cluster if `imagePullPolicy: IfNotPresent` is set (which it is in the manifests).

```bash
# Build backend
docker build -t microblog-backend:latest ./microblog-python

# Build frontend
docker build -t microblog-frontend:latest ./microblog-next
```

## Deployment Steps

1. **Apply Configuration and Secrets:**
   ```bash
   kubectl apply -f k8s/config.yaml
   ```

2. **Deploy the Database:**
   ```bash
   kubectl apply -f k8s/db.yaml
   ```
   Wait for the database pod to be ready.

3. **Deploy the Backend:**
   ```bash
   kubectl apply -f k8s/backend.yaml
   ```

4. **Deploy the Frontend:**
   ```bash
   kubectl apply -f k8s/frontend.yaml
   ```

## Accessing the Application

- **Frontend:** The frontend service is configured as a `LoadBalancer`. On Docker Desktop, it will be accessible at `http://localhost:3000`.
- **Backend:** The backend service is accessible within the cluster at `http://backend:8000`.

## Verifying the Deployment

### Quick Test
```bash
# Run comprehensive test suite
./scripts/test_k8s_deployment.sh
```

### Manual Verification
```bash
# Check all resources
kubectl get pods,svc -l 'app in (db,backend,frontend)'

# Check backend health
kubectl port-forward svc/backend 8001:8000 &
curl http://localhost:8001/health

# Access frontend
open http://localhost:3000
```

## Cleaning Up

To remove all resources:
```bash
kubectl delete -f k8s/
```

## Notes

### Database Migrations
Migrations are handled in the backend container's start command, similar to the Docker Compose setup. For production, consider using a Kubernetes `Job` or an init container to run `alembic upgrade head`.

### LoadBalancer on Docker Desktop
The frontend service uses type `LoadBalancer`. On Docker Desktop, this will show as `<pending>` but the service is actually accessible at `http://localhost:3000`.

### What's Working
- ✅ PostgreSQL database with persistent storage
- ✅ FastAPI backend with health checks and readiness probes
- ✅ Next.js frontend accessible at localhost:3000
- ✅ Service-to-service communication (frontend → backend → db)
- ✅ ConfigMaps and Secrets for configuration
- ✅ All observability features (logging, metrics, rate limiting)

## Differences from Docker Compose

The Kubernetes deployment is functionally identical to Docker Compose but with these k8s-specific features:
- Persistent volume claims for database storage
- Liveness and readiness probes for health checking
- ConfigMaps/Secrets for configuration management
- Service discovery via DNS (http://backend:8000, http://db:5432)
- Easier horizontal scaling with `kubectl scale`
