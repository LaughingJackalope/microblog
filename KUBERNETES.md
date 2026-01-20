# Kubernetes Deployment Guide

This project includes Kubernetes manifests for deploying the Microblog application to a Kubernetes cluster, such as the one provided by Docker Desktop.

## Prerequisites

- Docker Desktop with Kubernetes enabled.
- `kubectl` command-line tool installed.

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

```bash
kubectl get pods
kubectl get services
```

## Cleaning Up

To remove all resources:
```bash
kubectl delete -f k8s/
```

## Note on Database Migrations

In this Kubernetes setup, migrations are handled in the backend container's start command, similar to the Docker Compose setup. For a production-ready Kubernetes setup, consider using a Kubernetes `Job` or an init container to run `alembic upgrade head`.
