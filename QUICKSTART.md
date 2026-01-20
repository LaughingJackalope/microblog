# Quick Start Guide

Get the microblog running in 5 minutes.

## Prerequisites Check

```bash
node --version   # Should be v20+
python --version # Should be 3.12+
docker --version # Optional, for PostgreSQL
```

## Option A: Automated Setup (Fastest)

```bash
# 1. Start PostgreSQL (if you don't have one running)
docker run --name microblog-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=microblog \
  -p 5432:5432 \
  -d postgres:16

# 2. Backend setup
cd microblog-python
cp .env.example .env
# Edit .env and set: SECRET_KEY=$(openssl rand -base64 32)
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload --port 8000 &

# 3. Frontend setup (in new terminal)
cd microblog-next
cp .env.example .env
# Edit .env and set: SESSION_SECRET=$(openssl rand -base64 32)
npm install
npm run dev

# 4. Open http://localhost:3000 and create an account!
```

## Option B: Step-by-Step

### Terminal 1: PostgreSQL
```bash
docker run --name microblog-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=microblog \
  -p 5432:5432 \
  -d postgres:16
```

### Terminal 2: FastAPI Backend
```bash
cd microblog-python

# Setup
cp .env.example .env
echo "SECRET_KEY=$(openssl rand -base64 32)" >> .env
pip install -e ".[dev]"

# Database
alembic upgrade head

# Run
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs to see API documentation.

### Terminal 3: Next.js Frontend
```bash
cd microblog-next

# Setup
cp .env.example .env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
npm install

# Run
npm run dev
```

Visit http://localhost:3000 to use the app.

## Verify It's Working

1. **Backend Health Check**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok"}
   ```

2. **Frontend**
   - Navigate to http://localhost:3000
   - You should see the login page

3. **Create Test User**
   ```bash
   curl -X POST http://localhost:8000/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "testpass123"
     }'
   ```

## Common Issues

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps | grep microblog-db

# Check logs
docker logs microblog-db

# Restart container
docker restart microblog-db
```

### Python Dependencies
```bash
# Use a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e ".[dev]"
```

### Node Modules
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Create an account** at http://localhost:3000/register
2. **Post something** on your timeline
3. **Explore the code** to see the patterns:
   - `microblog-next/src/actions/` - Server Actions
   - `microblog-next/src/components/timeline/Timeline.tsx` - Server Component
   - `microblog-python/app/models/` - Pydantic models

## Demo Data

Want some posts to see? Create a few test users and have them post:

```bash
# Register users
for i in {1..3}; do
  curl -X POST http://localhost:8000/v1/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"user$i\",
      \"email\": \"user$i@example.com\",
      \"password\": \"password123\",
      \"displayName\": \"Test User $i\"
    }"
done
```

Then log in to the web UI and follow other users to see their posts in your timeline!
