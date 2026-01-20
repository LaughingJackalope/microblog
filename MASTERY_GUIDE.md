# Mastery Guide - Interview Cheat Sheet Mapping

This document maps your cheat sheet concepts to actual code in this project. Use this to prepare for technical discussions.

---

## 1. The Core Mental Model (LIFO Style)

### Theory
> In the modern stack, we move logic as far back as possible to keep the user's device "thin" and fast.

### In This Project

| Layer | File Example | What It Does |
|-------|--------------|--------------|
| **CLIENT** | `microblog-next/src/components/posts/CreatePostForm.tsx` | Just captures user input and shows UI state |
| **BFF** | `microblog-next/src/actions/posts.ts` | Validates, authenticates, calls Python API |
| **BRAIN** | `microblog-python/app/routers/posts.py` | Business logic: timeline algorithms, follower queries |
| **MEMORY** | `microblog-python/app/db/user.py` | PostgreSQL relationships and data persistence |

**Interview Talking Point:**
> "I keep the client thin. For example, when creating a post, the React component just collects the textarea input. The Next.js server validates it with Zod, checks authentication, and forwards to FastAPI. FastAPI handles the database transaction and returns the result. The client never talks directly to the database or even to FastAPI."

---

## 2. The "Type-Safe Tunnel" Checklist

### Theory
> To ensure your Python and TypeScript never drift apart: Pydantic → TypeScript → Zod

### In This Project

**Step 1: Define in Pydantic**
```python
# microblog-python/app/models/post.py
class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=280)
```

**Step 2: Generate Types**
```bash
# microblog-python/scripts/generate_types.py
python scripts/generate_types.py
# Outputs TypeScript interfaces
```

**Step 3: Validate with Zod**
```typescript
// microblog-next/src/lib/schemas.ts
export const postCreateSchema = z.object({
  content: z.string().min(1).max(280),
});
```

**Interview Talking Point:**
> "I use a zero-trust architecture. Pydantic validates the egress from Python—ensuring the API returns valid data. I generate TypeScript types from these schemas for compile-time safety. Then Zod validates the ingress to React at runtime. This means both ends are always in sync, and I catch type errors before they hit production."

**Files to Show:**
- `microblog-python/app/models/post.py` (Pydantic)
- `microblog-python/scripts/generate_types.py` (Generator)
- `microblog-next/src/lib/schemas.ts` (Zod)
- `microblog-next/src/components/timeline/Timeline.tsx` (Usage: line with `postListSchema.parse()`)

---

## 3. The "Resilient UI" Toolkit

### Theory
> Don't let slow Python logic ruin the UX. Use Suspense, error boundaries, and streaming.

### In This Project

**Suspense for Loading**
```tsx
// microblog-next/src/app/(app)/page.tsx
<Suspense fallback={<TimelineSkeleton />}>
  <Timeline />  {/* Can take 2 seconds, page still loads in 100ms */}
</Suspense>
```

**Error Boundary**
```tsx
// microblog-next/src/app/(app)/error.tsx
export default function Error({ error, reset }) {
  return <div>Something went wrong: {error.message}</div>
}
```

**Streaming**
- Next.js sends the Header immediately
- Timeline data "pops in" as FastAPI responds
- User sees content progressively, never a blank screen

**Interview Talking Point:**
> "By wrapping the Timeline in Suspense, React sends the shell—header, post form—to the browser immediately, in under 100ms. Meanwhile, FastAPI is querying the database for followed users' posts. When that data arrives, Next.js streams it to the browser and the Timeline component hydrates. The user never sees a blank page, even on slow connections."

**Files to Show:**
- `microblog-next/src/app/(app)/page.tsx` (Suspense usage)
- `microblog-next/src/app/(app)/error.tsx` (Error boundary)
- `microblog-next/src/components/timeline/TimelineSkeleton.tsx` (Loading skeleton)

---

## 4. Key Jargon & "Elevator Pitch" Terms

### Colocation
**Where:** `microblog-next/src/components/timeline/Timeline.tsx`

```tsx
export async function Timeline({ token }: TimelineProps) {
  // Data fetching RIGHT HERE, next to the component
  const data = await postsAPI.getTimeline(token);
  return <PostList posts={data.posts} />
}
```

**Talking Point:**
> "The Timeline component fetches its own data. No Redux, no prop drilling. This is colocation—the data fetching logic lives right next to the component that needs it."

### Hydration
**What It Means:** The HTML is sent from the server. JavaScript then "attaches" to it to make it interactive.

**In This Project:** All Server Components (Timeline, Header) render to HTML on the server. Client Components like CreatePostForm hydrate after the page loads.

**Talking Point:**
> "The initial page load is pure HTML from the Next.js server. No JavaScript needed to see content. Then React hydrates the interactive parts—like the post form—after the JavaScript bundle loads."

### Server Actions
**Where:** `microblog-next/src/actions/posts.ts`

```typescript
"use server"
export async function createPostAction(formData: FormData) {
  await postsAPI.createPost(token, content);
  revalidatePath("/");  // Tell Next.js to refresh
}
```

**Talking Point:**
> "Server Actions replace REST API endpoints for mutations. Instead of POSTing JSON to /api/posts, I call createPostAction directly. It runs on the server, has built-in CSRF protection, and automatically revalidates the cache."

### Progressive Enhancement
**Where:** `microblog-next/src/components/auth/LoginForm.tsx`

```tsx
<form action={loginAction}>  {/* Native HTML form action */}
  <input name="username" />
  <button type="submit">Login</button>
</form>
```

**Talking Point:**
> "This form works even if JavaScript is disabled. It uses a native form action that posts to the server. JavaScript enhances it with loading states and error messages, but the core functionality doesn't require it."

---

## 5. The "Standard" Data Flow

### Theory
> User → Server Action → Flask/FastAPI → Revalidation → Streaming Update

### In This Project: Creating a Post

1. **User types content** in `CreatePostForm.tsx`
2. **Form submits** to `createPostAction()` (Server Action)
3. **Next.js validates** with Zod, checks session
4. **Calls FastAPI** `POST /v1/posts` with JWT token
5. **FastAPI creates post** in PostgreSQL, returns response
6. **Next.js revalidates** the timeline with `revalidatePath("/")`
7. **React re-renders** Timeline component with fresh data
8. **Streams to browser** - user sees their new post instantly

**Interview Talking Point:**
> "When a user creates a post, the form calls a Server Action—no client-side fetch(). The Server Action validates the input with Zod, checks the session, and forwards to FastAPI. FastAPI writes to PostgreSQL and returns. Next.js then tells React to revalidate the timeline, and the new post appears via streaming—no page refresh, no manual cache invalidation."

**Files to Trace:**
1. `microblog-next/src/components/posts/CreatePostForm.tsx` (form submission)
2. `microblog-next/src/actions/posts.ts` (createPostAction)
3. `microblog-next/src/lib/api.ts` (postsAPI.createPost)
4. `microblog-python/app/routers/posts.py` (POST /v1/posts endpoint)
5. `microblog-python/app/db/post.py` (database write)

---

## 6. Architecture Improvements Over Old Kotlin/Quarkus Version

| Feature | Old (Kotlin/Quarkus) | New (Python/Next.js) |
|---------|---------------------|---------------------|
| Password Storage | ⚠️ No hashing | ✅ bcrypt hashing |
| Follow Relationships | ❌ Not implemented | ✅ Many-to-many table |
| Type Safety | TypeScript only | ✅ Pydantic → TS → Zod |
| Frontend | HTMX (hardcoded user) | ✅ React with auth |
| API Pattern | REST endpoints | ✅ Server Actions |
| Data Fetching | Client-side fetch | ✅ Server Components |
| Loading States | Manual | ✅ Suspense boundaries |
| Timeline | ❌ Not implemented | ✅ Fully functional |

**Interview Talking Point:**
> "The old version was a good REST API, but it was missing key features like password hashing and follower relationships. More importantly, it used client-side data fetching, which meant slower initial page loads and more complex state management. The new architecture moves that logic to the server, improving both security and performance."

---

## 7. Demo Script for Interviewers

### Live Code Walkthrough (5 minutes)

**1. Show the Type-Safe Tunnel (1 min)**
```bash
# Open three files side-by-side:
# 1. microblog-python/app/models/post.py
# 2. microblog-next/src/lib/schemas.ts
# 3. microblog-next/src/components/timeline/Timeline.tsx (line with .parse())

"See how PostCreate is defined in Python with Pydantic,
then validated in React with Zod? The content field
is max 280 chars on both sides. If I change it in Python
and regenerate types, TypeScript will catch any mismatches."
```

**2. Show Server Actions (1 min)**
```bash
# Open: microblog-next/src/actions/posts.ts

"This is a Server Action. Notice the 'use server' directive.
When the user submits the form, this function runs on the
Next.js server—not in the browser. It checks authentication,
validates input with Zod, calls FastAPI, and revalidates
the cache. No fetch() call from the client, no CORS, no
manual cache invalidation."
```

**3. Show Streaming with Suspense (1 min)**
```bash
# Open: microblog-next/src/app/(app)/page.tsx

"The Timeline is wrapped in Suspense. Watch what happens
when I reload: the header appears instantly, and the skeleton
shows while FastAPI fetches posts. This is streaming—the shell
loads in 100ms, data 'pops in' as it's ready."
```

**4. Show Optimistic Updates (1 min)**
```bash
# Open: microblog-next/src/components/users/FollowButton.tsx

"When you click Follow, the UI updates immediately—that's
the optimistic update. Meanwhile, the Server Action runs.
If it fails, we revert the UI. But 99% of the time, it
succeeds, so the user gets instant feedback."
```

**5. Show Progressive Enhancement (1 min)**
```bash
# Open browser DevTools, disable JavaScript
# Navigate to /login

"With JavaScript disabled, the form still works. It's a
native HTML form that posts to the server. JavaScript
enhances it with loading states and inline errors, but
the core functionality is built on web standards."
```

---

## 8. Preparation Checklist

Before the interview, make sure you can:

- [ ] Explain the LIFO model (Client → BFF → Brain → Memory)
- [ ] Show a Pydantic model, generated TS type, and Zod validation
- [ ] Point to a Suspense boundary and explain streaming
- [ ] Open a Server Action and explain how it's different from REST
- [ ] Demonstrate colocation by showing Timeline.tsx
- [ ] Show an optimistic update in FollowButton.tsx
- [ ] Explain why error.tsx and loading.tsx exist
- [ ] Demo the app working with JavaScript disabled (login form)

---

## 9. Common Interview Questions

### "Why Server Components instead of useEffect?"

> "Server Components eliminate the waterfall problem. In a traditional SPA, the browser downloads the JS bundle, renders the component, executes useEffect, makes the API call, waits for the response, then updates the UI. That's 3-4 network roundtrips. With Server Components, the data fetching happens on the server before any HTML is sent. The browser gets HTML with data already in it—one roundtrip."

### "How do you handle authentication?"

> "I use iron-session for encrypted session cookies. When a user logs in, the Server Action stores their userId and JWT token in an encrypted cookie. Every Server Component and Server Action can access this session. No localStorage, no tokens in URL params—it's secure by default."

### "What about SEO?"

> "Every page is server-rendered HTML. Search engines get fully rendered content on the first request. No need for complex pre-rendering or 'isomorphic' setups—it's HTML from the start."

### "How do you test Server Actions?"

> "Server Actions are just async functions. I can import and test them directly:
```typescript
import { createPostAction } from '@/actions/posts';
const result = await createPostAction(mockFormData);
expect(result.success).toBe(true);
```
No need to mock fetch() or set up a test server."

---

## 10. Mastery Signals

What makes this "senior-level" code:

✅ **Type safety across languages** (Python → TS → Zod)
✅ **Security best practices** (password hashing, session cookies, CSRF protection)
✅ **Performance patterns** (Suspense, streaming, colocation)
✅ **Production-ready** (migrations, error boundaries, validation)
✅ **Progressive enhancement** (works without JavaScript)
✅ **Modern patterns** (Server Actions, not REST)
✅ **Clean architecture** (BFF layer, clear separation of concerns)
✅ **Comprehensive testing** (pytest, Vitest, Playwright - contract-first strategy)

---

## 11. Testing Strategy (Show This!)

### The Testing Pyramid

When asked "How do you test this distributed system?", show this structure:

```
   E2E (Playwright)      ← 5-10 critical flows
  ──────────────────
 Integration (pytest)    ← API contracts, business logic
──────────────────────
Unit (pytest + Vitest)   ← Pydantic + Zod validation
```

### Key Testing Files to Demonstrate

| Layer | File | What It Tests |
|-------|------|---------------|
| **Python Unit** | `tests/test_models.py` | Pydantic validation (egress) |
| **Python Integration** | `tests/test_posts.py` | Timeline algorithm, API contracts |
| **Next.js Unit** | `tests/lib/schemas.test.ts` | Zod validation (ingress) |
| **Next.js Integration** | `tests/actions/posts.test.ts` | Server Actions, error handling |
| **E2E** | `e2e/posts.spec.ts` | Type-safe tunnel end-to-end |

### Interview Talking Point

> "I use a **Contract-First** testing strategy. I test my FastAPI logic and Pydantic models with pytest to ensure the 'Brain' is correct. Then I test my React Server Actions and Zod schemas with Vitest to ensure the 'BFF' layer validates correctly. Finally, I run a few critical Playwright E2E tests to ensure the 'Tunnel' between Next.js and FastAPI is holding up under real-world conditions. This gives me fast feedback—unit tests run in milliseconds, integration in seconds, and E2E in minutes."

### Live Demo Script (Testing)

**Show the three layers (2 minutes):**

```bash
# 1. Python tests (30 seconds)
cd microblog-python
pytest tests/test_models.py -v
# "This validates that Pydantic rejects invalid data—the egress validation"

# 2. Next.js tests (30 seconds)
cd microblog-next
npm test -- tests/lib/schemas.test.ts
# "This validates that Zod also rejects invalid data—the ingress validation"

# 3. E2E test (1 minute)
npm run e2e -- e2e/posts.spec.ts
# "This tests the full flow: React form → Server Action → FastAPI → PostgreSQL → back to timeline"
```

### Common Testing Questions

**Q: "How do you avoid testing the same thing twice?"**

> "I test Pydantic validation at the Python layer and Zod validation at the React layer separately. The E2E test validates that both layers work together, but I'm not re-testing the validation logic itself. Each layer has its own contract."

**Q: "What's your coverage target?"**

> "I aim for 80%+ on the Python backend because that's where the business logic lives. 70%+ on Next.js Server Actions. And 5-10 E2E tests for critical flows. I don't chase 100% coverage—I focus on testing what matters."

**Q: "How long do your tests take?"**

> "Unit tests: milliseconds. Integration: 2-3 seconds for the full suite. E2E: about 2 minutes for 10 tests. I can run unit tests on every save, integration on every commit, and E2E before merging to main."

---

See [TESTING.md](TESTING.md) for the complete testing documentation.

---

Good luck with the interview! You have a complete, production-ready example of modern full-stack architecture with comprehensive testing. 🚀
