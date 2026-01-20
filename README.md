# Microblog - Modern Full-Stack Demo

![CI/CD](https://github.com/LaughingJackalope/microblog/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/LaughingJackalope/microblog/actions/workflows/codeql.yml/badge.svg)

A microblogging platform built to demonstrate mastery of the **2026 Server-First Stack**: Next.js 15 + FastAPI + PostgreSQL.

## 🎯 What This Demonstrates

This project showcases modern full-stack patterns that shift logic to the server for better performance, security, and developer experience.

### Architecture: The "LIFO" Model

```
┌─────────────────────────────────────────────────────┐
│  CLIENT (React)        │  User Interaction & Visual │
│  Thin, fast device     │  State                     │
├─────────────────────────────────────────────────────┤
│  BFF (Next.js)         │  Orchestration, Security,  │
│  Server Components     │  & Rendering               │
├─────────────────────────────────────────────────────┤
│  BRAIN (FastAPI)       │  Algorithms, Math, &       │
│  Python backend        │  Business Logic            │
├─────────────────────────────────────────────────────┤
│  MEMORY (PostgreSQL)   │  Data Persistence          │
└─────────────────────────────────────────────────────┘
```

## 🚀 Key Features & Patterns

### 1. **Type-Safe Tunnel** (Zero-Trust Architecture)
```
Pydantic (Python) → TypeScript → Zod (Runtime)
```

- **Egress validation**: Pydantic validates data leaving Python
- **Compile-time safety**: Auto-generated TypeScript types
- **Ingress validation**: Zod validates data entering React at runtime

**Files demonstrating this:**
- `microblog-python/app/models/` - Pydantic models
- `microblog-python/scripts/generate_types.py` - Type generation
- `microblog-next/src/lib/schemas.ts` - Zod schemas

### 2. **Resilient UI with Suspense**

Timeline streams data without blocking the page shell.

```tsx
<Suspense fallback={<TimelineSkeleton />}>
  <Timeline />  {/* Fetches from FastAPI */}
</Suspense>
```

**Files demonstrating this:**
- `microblog-next/src/app/(app)/page.tsx` - Suspense boundaries
- `microblog-next/src/components/timeline/Timeline.tsx` - Server Component
- `microblog-next/src/components/timeline/TimelineSkeleton.tsx` - Loading UI

### 3. **Server Actions** (No More Fetch!)

Mutations are server functions, not HTTP endpoints.

```tsx
// Client Component - NO fetch() calls!
<form action={createPost}>
  <textarea name="content" />
  <button type="submit">Post</button>
</form>
```

**Files demonstrating this:**
- `microblog-next/src/actions/auth.ts` - Auth actions
- `microblog-next/src/actions/posts.ts` - Post mutations
- `microblog-next/src/actions/users.ts` - Follow/unfollow

### 4. **Colocation Pattern**

Data fetching lives next to the component that uses it.

```tsx
async function Timeline() {
  const posts = await fetchPosts()  // Right here!
  return <PostList posts={posts} />
}
```

**Files demonstrating this:**
- `microblog-next/src/components/timeline/Timeline.tsx` - Colocated fetch

### 5. **Progressive Enhancement**

Forms work without JavaScript via native form actions.

```tsx
<form action={loginAction}>  {/* Works without JS */}
  <input name="username" />
  <button type="submit">Login</button>
</form>
```

**Files demonstrating this:**
- `microblog-next/src/components/auth/LoginForm.tsx`
- `microblog-next/src/components/auth/RegisterForm.tsx`

### 6. **Optimistic Updates**

UI updates immediately while the server confirms.

```tsx
const handleFollow = () => {
  setIsFollowing(true)  // Optimistic update
  startTransition(async () => {
    const result = await followUser(userId)
    if (!result.success) {
      setIsFollowing(false)  // Revert on error
    }
  })
}
```

**Files demonstrating this:**
- `microblog-next/src/components/users/FollowButton.tsx`

### 7. **Error Boundaries & Loading States**

Graceful handling of failures and slow networks.

**Files demonstrating this:**
- `microblog-next/src/app/(app)/error.tsx` - Error boundary
- `microblog-next/src/app/(app)/loading.tsx` - Route loading state
- `microblog-next/src/components/timeline/TimelineSkeleton.tsx` - Component skeleton

### 8. **Secure Session Management**

Encrypted cookies (iron-session) instead of localStorage.

**Files demonstrating this:**
- `microblog-next/src/lib/session.ts` - Session utilities
- `microblog-next/src/actions/auth.ts` - Session creation

### 9. **Comprehensive Testing**

Three-layer testing strategy: Python (pytest), React (Vitest), E2E (Playwright).

**Files demonstrating this:**
- `microblog-python/tests/` - pytest suite (Pydantic, API contracts, business logic)
- `microblog-next/tests/` - Vitest suite (Zod, Server Actions, components)
- `microblog-next/e2e/` - Playwright E2E tests (critical flows, type-safe tunnel)
- `TESTING.md` - Complete testing guide

**See [TESTING.md](TESTING.md) for the full testing strategy.**

---

## 📁 Project Structure

```
microblog/
├── microblog-python/          # FastAPI Backend (The "Brain")
│   ├── app/
│   │   ├── models/            # Pydantic schemas (for type generation)
│   │   ├── db/                # SQLAlchemy ORM models
│   │   ├── routers/           # API endpoints
│   │   ├── main.py            # FastAPI app
│   │   ├── security.py        # Password hashing, JWT
│   │   └── dependencies.py    # Auth dependencies
│   ├── alembic/               # Database migrations
│   ├── scripts/               # Type generation scripts
│   └── pyproject.toml
│
├── microblog-next/            # Next.js Frontend (The "BFF")
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── (auth)/        # Login/Register
│   │   │   ├── (app)/         # Authenticated app
│   │   │   └── layout.tsx
│   │   ├── actions/           # Server Actions
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities
│   │       ├── api.ts         # FastAPI client
│   │       ├── session.ts     # Session management
│   │       └── schemas.ts     # Zod validation
│   ├── package.json
│   └── next.config.ts
│
└── README.md                  # This file
```

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 13+
- Docker (optional, for PostgreSQL)

### Step 1: Start PostgreSQL

```bash
# Using Docker
docker run --name microblog-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=microblog \
  -p 5432:5432 \
  -d postgres:16

# Or use your local PostgreSQL instance
```

### Step 2: Setup Python Backend

```bash
cd microblog-python

# Install dependencies
pip install -e ".[dev]"

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

API will be available at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

### Step 3: Setup Next.js Frontend

```bash
cd microblog-next

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings (especially SESSION_SECRET)

# Start Next.js
npm run dev
```

Frontend will be available at http://localhost:3000

### Step 4: Create First User

1. Navigate to http://localhost:3000
2. Click "Sign up"
3. Create an account
4. Start posting!

---

## 🎤 Interview Talking Points

Use these soundbites to demonstrate understanding:

### On Type Safety
> "I use a zero-trust architecture. Pydantic validates the egress from Python, TypeScript provides compile-time safety, and Zod validates the ingress to React at runtime."

### On Performance
> "By using Suspense boundaries, React sends the shell immediately and streams in the data-heavy content as Python finishes processing. The user sees content in under 100ms, even if the backend takes 2 seconds."

### On Security
> "Server Actions eliminate the entire class of CSRF vulnerabilities because there are no client-side fetch() calls. Everything goes through secure server functions with encrypted session cookies."

### On Patterns
> "I use colocation—data fetching lives right next to the component that needs it. This eliminates prop drilling and makes the data flow obvious."

### On Progressive Enhancement
> "The app works with JavaScript disabled. Forms use native form actions, which means even on slow networks or older devices, users can still log in and post content."

---

## 📊 Comparison: Old vs New

| Old Pattern (REST/Redux) | New Pattern (Server-First) |
|--------------------------|---------------------------|
| `fetch('/api/posts')` | `<Timeline />` (Server Component) |
| Redux store + thunks | Server Actions |
| `useEffect` + loading states | Suspense boundaries |
| Client-side routing | App Router with streaming |
| JWT in localStorage | Encrypted session cookies |
| Manual type syncing | Auto-generated types |
| CORS issues | Internal server calls |
| Prop drilling | Colocation pattern |

---

## 🔧 Development Commands

### Backend
```bash
cd microblog-python
make dev         # Start dev server
make migrate     # Run migrations
make revision    # Create new migration
make types       # Generate TypeScript types
make test        # Run pytest tests
```

### Frontend
```bash
cd microblog-next
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Lint code
npm run type-check  # TypeScript check
npm test         # Run Vitest tests
npm run e2e      # Run Playwright E2E tests
```

### Testing
```bash
# Python tests
cd microblog-python && pytest

# Next.js tests
cd microblog-next && npm test

# E2E tests (requires backend running)
cd microblog-next && npm run e2e
```

See [TESTING.md](TESTING.md) for comprehensive testing documentation.

---

## 🚀 Deployment Recommendations

### Backend (FastAPI)
- Railway, Render, or Fly.io
- Use gunicorn with uvicorn workers
- Set `ENVIRONMENT=production` in env vars

### Frontend (Next.js)
- Vercel (recommended for Next.js)
- Or self-host with Docker

### Database
- Neon, Supabase, or Railway PostgreSQL
- Enable connection pooling (PgBouncer)

---

## 📚 Resources

- [Next.js 15 App Router Docs](https://nextjs.org/docs/app)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic v2 Docs](https://docs.pydantic.dev/latest/)
- [Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## 🎯 What Makes This "Mastery-Level"

1. **Type Safety Across Languages** - Not just TypeScript, but Python → TS → Zod
2. **Modern Mutation Pattern** - Server Actions instead of REST
3. **Performance Patterns** - Streaming, Suspense, colocation
4. **Security Best Practices** - No JWTs in localStorage, server-side sessions
5. **Progressive Enhancement** - Works without JavaScript
6. **Error Handling** - Boundaries, fallbacks, optimistic updates
7. **Production Ready** - Migrations, validation, proper relationships
8. **Comprehensive Testing** - Contract-first testing with pytest, Vitest, and Playwright

---

Built with ❤️ to demonstrate the **2026 Server-First Stack**
