#!/bin/bash
# Test Kubernetes deployment status and connectivity

set -e

echo "========================================="
echo "Kubernetes Deployment Test"
echo "========================================="
echo ""

# Check cluster connectivity
echo "1. Checking Kubernetes cluster..."
kubectl cluster-info | head -2
echo "✓ Cluster is running"
echo ""

# Check all pods
echo "2. Checking pod status..."
kubectl get pods -l 'app in (db,backend,frontend)' -o wide
echo ""

# Check services
echo "3. Checking services..."
kubectl get svc db backend frontend
echo ""

# Test database connectivity
echo "4. Testing database pod..."
DB_POD=$(kubectl get pod -l app=db -o jsonpath='{.items[0].metadata.name}')
if kubectl exec $DB_POD -- pg_isready -U postgres > /dev/null 2>&1; then
    echo "✓ Database is ready"
else
    echo "✗ Database is not ready"
    exit 1
fi
echo ""

# Test backend health
echo "5. Testing backend health..."
BACKEND_POD=$(kubectl get pod -l app=backend -o jsonpath='{.items[0].metadata.name}')
if kubectl exec $BACKEND_POD -- python3 -c "import requests; r=requests.get('http://localhost:8000/health'); print(r.text)" | grep -q "healthy"; then
    echo "✓ Backend is healthy"
    kubectl exec $BACKEND_POD -- python3 -c "import requests; r=requests.get('http://localhost:8000/health'); print(r.text)" | python3 -m json.tool | head -15
else
    echo "✗ Backend health check failed"
    exit 1
fi
echo ""

# Test frontend
echo "6. Testing frontend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|307"; then
    echo "✓ Frontend is accessible at http://localhost:3000"
else
    echo "✗ Frontend is not accessible"
    exit 1
fi
echo ""

# Test backend API from frontend pod
echo "7. Testing backend connectivity from frontend..."
FRONTEND_POD=$(kubectl get pod -l app=frontend -o jsonpath='{.items[0].metadata.name}')
if kubectl exec $FRONTEND_POD -- wget -q -O- http://backend:8000/health | grep -q "healthy"; then
    echo "✓ Frontend can reach backend"
else
    echo "✗ Frontend cannot reach backend"
    exit 1
fi
echo ""

echo "========================================="
echo "✓ All tests passed!"
echo "========================================="
echo ""
echo "Application is running:"
echo "  Frontend: http://localhost:3000"
echo "  Backend (via kubectl port-forward):"
echo "    kubectl port-forward svc/backend 8000:8000"
echo ""
echo "To view logs:"
echo "  kubectl logs -l app=backend -f"
echo "  kubectl logs -l app=frontend -f"
echo "  kubectl logs -l app=db -f"
echo ""
echo "To clean up:"
echo "  kubectl delete -f k8s/"
echo ""
