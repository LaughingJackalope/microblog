# Microblog Next.js Frontend

Modern Next.js 15 frontend demonstrating Server Components, Server Actions, and streaming.

## Key Features

### Server Components by Default
- Timeline, user profiles - all Server Components
- Data fetching happens on the server
- Smaller client JavaScript bundle

### Server Actions for Mutations
- No `fetch()` calls from client
- Direct function invocation
- Built-in CSRF protection

### Streaming with Suspense
- Shell renders immediately
- Content streams in as ready
- Loading skeletons automatically shown

### Progressive Enhancement
- Forms work without JavaScript
- Native form actions
- Graceful degradation

## Project Structure

```
src/
├── app/                    # App Router
│   ├── (auth)/            # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (app)/             # App routes (require auth)
│   │   ├── page.tsx       # Timeline
│   │   ├── loading.tsx    # Loading UI
│   │   └── error.tsx      # Error boundary
│   ├── layout.tsx         # Root layout
│   └── globals.css
│
├── actions/               # Server Actions (mutations)
│   ├── auth.ts           # Login, register, logout
│   ├── posts.ts          # Create, delete post
│   └── users.ts          # Follow, unfollow
│
├── components/            # React components
│   ├── auth/             # Login/Register forms
│   ├── layout/           # Header, navigation
│   ├── posts/            # Post card, create form
│   ├── timeline/         # Timeline, skeleton
│   └── users/            # Follow button
│
└── lib/                   # Utilities
    ├── api.ts            # FastAPI client
    ├── session.ts        # Iron-session wrapper
    └── schemas.ts        # Zod schemas
```

## Development

```bash
# Install
npm install

# Setup environment
cp .env.example .env
# Set SESSION_SECRET to a random string (openssl rand -base64 32)

# Run dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm test              # Vitest (unit tests)
npm run e2e           # Playwright (E2E tests)

# Build for production
npm run build
npm start
```

## Testing

### Unit Tests (Vitest)

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

**What the tests cover:**
- Zod schema validation (ingress validation)
- Server Action logic and error handling
- Component rendering
- Client-side state management

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run E2E tests
npm run e2e

# Run with UI
npm run e2e:ui

# Debug mode
npx playwright test --debug
```

**What the tests cover:**
- Critical user flows (register, login, post, follow)
- Type-safe tunnel (React → Next.js → FastAPI → PostgreSQL)
- Progressive enhancement (no-JS functionality)
- Error boundaries and loading states

**Note:** E2E tests require the FastAPI backend to be running on port 8000.

See [../TESTING.md](../TESTING.md) for complete testing documentation.

## Environment Variables

```env
# FastAPI backend
NEXT_PUBLIC_API_URL=http://localhost:8000  # Client-side
API_URL=http://localhost:8000              # Server-side

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-secret-here
```

## Architecture Patterns

### 1. Server Component with Suspense
```tsx
// app/(app)/page.tsx
export default async function HomePage() {
  return (
    <Suspense fallback={<TimelineSkeleton />}>
      <Timeline />  {/* Server Component */}
    </Suspense>
  )
}
```

### 2. Server Action
```tsx
// actions/posts.ts
"use server"

export async function createPost(formData: FormData) {
  const content = formData.get("content")
  await postsAPI.createPost(token, content)
  revalidatePath("/")  // Refresh timeline
}
```

### 3. Client Component with useActionState
```tsx
// components/posts/CreatePostForm.tsx
"use client"

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, null)

  return (
    <form action={formAction}>
      <textarea name="content" />
      <button disabled={isPending}>Post</button>
    </form>
  )
}
```

### 4. Optimistic Updates
```tsx
// components/users/FollowButton.tsx
const handleFollow = () => {
  setIsFollowing(true)  // Update UI immediately

  startTransition(async () => {
    const result = await followUserAction(userId)
    if (!result.success) {
      setIsFollowing(false)  // Revert on error
    }
  })
}
```

## Benefits Over Traditional SPA

| Traditional SPA | This Approach |
|----------------|---------------|
| Client-side routing | Server-side routing with instant navigation |
| useEffect + fetch() | Server Components + colocation |
| Loading states everywhere | Suspense boundaries |
| CORS configuration | Internal server calls |
| Token management | Secure session cookies |
| Manual cache invalidation | revalidatePath() |
| Large JS bundles | Minimal client JavaScript |

## Learn More

- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Streaming and Suspense](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
