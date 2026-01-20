# Microblog Python Backend

FastAPI backend demonstrating modern Python patterns with async SQLAlchemy, Pydantic, and PostgreSQL.

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy 2.0** - Async ORM with relationship support
- **Pydantic v2** - Data validation and type-safe models
- **PostgreSQL** - Production database
- **Alembic** - Database migrations
- **JWT** - Secure authentication

## Features

- ✅ User registration and authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Follow/unfollow functionality
- ✅ Post creation and timeline feed
- ✅ Proper foreign key relationships
- ✅ Type-safe tunnel to TypeScript (Pydantic → TS)
- ✅ Async/await throughout
- ✅ Database migrations with Alembic

## Setup

### 1. Install dependencies

```bash
# Using pip
pip install -e ".[dev]"

# Or using uv (faster)
uv pip install -e ".[dev]"
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

### 3. Start PostgreSQL

```bash
# Using Docker
docker run --name microblog-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=microblog -p 5432:5432 -d postgres:16

# Or use your local PostgreSQL instance
```

### 4. Run migrations

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 5. Start the server

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/token` - Login and get JWT token

### Users
- `GET /v1/users/me` - Get current user profile
- `PUT /v1/users/me` - Update current user profile
- `GET /v1/users/{user_id}` - Get user by ID
- `POST /v1/users/me/following/{user_id}` - Follow user
- `DELETE /v1/users/me/following/{user_id}` - Unfollow user
- `GET /v1/users/{user_id}/followers` - Get followers
- `GET /v1/users/{user_id}/following` - Get following

### Posts
- `POST /v1/posts` - Create post
- `GET /v1/posts/{post_id}` - Get post by ID
- `DELETE /v1/posts/{post_id}` - Delete post (owner only)
- `GET /v1/posts/user/{user_id}` - Get user's posts (paginated)
- `GET /v1/posts` - Get timeline (authenticated, paginated)

## Type-Safe Tunnel

Generate TypeScript types from Pydantic models:

```bash
# Generate types for Next.js frontend
pydantic2ts --module app.models --output ../microblog-next/types/api.ts
```

This creates a "zero-trust architecture" where:
1. **Pydantic** validates data leaving Python
2. **TypeScript** provides compile-time safety
3. **Zod** validates data entering React (runtime)

## Development

### Run tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_posts.py

# Run with verbose output
pytest -v
```

**What the tests cover:**
- Pydantic model validation (egress validation)
- API endpoint contracts
- Business logic (timeline algorithm, follow relationships)
- Security (password hashing, JWT, authorization)
- Database relationships and constraints

See [../TESTING.md](../TESTING.md) for complete testing documentation.

### Format code
```bash
ruff format .
```

### Lint
```bash
ruff check .
```

### Create a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Architecture Patterns

This backend demonstrates several modern patterns:

1. **Async All The Way** - No blocking operations
2. **Dependency Injection** - FastAPI's DI for database sessions and auth
3. **Repository Pattern** - SQLAlchemy models separated from Pydantic schemas
4. **Proper Relationships** - Foreign keys and cascading deletes
5. **Security Best Practices** - Password hashing, JWT tokens, CORS
6. **Type Safety** - Pydantic models that export to TypeScript

## Differences from Kotlin/Quarkus Version

Improvements in this version:
- ✅ Password hashing (was missing)
- ✅ Proper follower relationships (many-to-many)
- ✅ Foreign key constraints in database
- ✅ Real timeline feed (from followed users)
- ✅ Async/await for better performance
- ✅ Type-safe tunnel to frontend
