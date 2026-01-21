# Testing Strategy for Server-First Architecture

This project demonstrates comprehensive testing of a distributed system (React + Next.js + FastAPI). The testing strategy follows the **Contract-First** approach recommended for modern full-stack applications.

## Overview: The Testing Pyramid for 2026

```
        ╱╲
       ╱ E2E ╲          Playwright - 5-10 critical flows
      ╱────────╲
     ╱  Integration ╲    pytest + httpx - API contracts
    ╱──────────────╲
   ╱      Unit       ╲   Vitest + pytest - Logic & validation
  ╱──────────────────╲
```

---

## Fast Inner Loop: Pre-Commit Hooks (< 30 seconds)

**Before any tests run, the pre-commit hooks catch issues in seconds!**

The **Fast Inner Loop** runs automatically before every commit:

- ✅ **TypeScript Type Checking** - Catch type errors instantly
- ✅ **ESLint + Accessibility Linting** - Enforce jsx-a11y rules
- ✅ **Python Type Checking + Linting** - ruff + mypy validation
- ✅ **Schema Validation** - Prevent Pydantic ↔ Zod drift
- ✅ **Fast Unit Tests** - Run tests affected by changes
- ✅ **Security Scanning** - Block hardcoded secrets
- ✅ **Debug Code Detection** - Warn about console.log, debugger

**Time:** < 30 seconds | **Issues Caught:** 80% of regressions

**See:** [PRE_COMMIT_GUIDE.md](PRE_COMMIT_GUIDE.md) for complete documentation.

**Setup:**
```bash
sh scripts/setup-pre-commit.sh
```

---

## Layer 1: Python/FastAPI Tests (The "Source of Truth")

**Tool:** pytest + httpx + SQLAlchemy

**What We Test:**
- **Pydantic Validation:** Ensure models reject invalid data
- **API Contracts:** Endpoints return exactly what React expects
- **Business Logic:** Timeline algorithms, follow relationships
- **Security:** Password hashing, authentication, authorization
- **Database:** Relationships, cascading deletes, constraints

### Running Python Tests

```bash
cd microblog-python

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_posts.py

# Run specific test
pytest tests/test_posts.py::TestCreatePost::test_create_post_success

# Run with verbose output
pytest -v

# Run only fast tests (skip integration if marked as slow)
pytest -m "not slow"
```

### Key Test Files

| File | Purpose |
|------|---------|
| `tests/test_models.py` | Pydantic validation (egress from Python) |
| `tests/test_auth.py` | Authentication, password hashing, JWT |
| `tests/test_posts.py` | Post CRUD, timeline algorithm |
| `tests/test_users.py` | Follow/unfollow, relationship counts |
| `tests/conftest.py` | Fixtures, test database, test users |

### Example: Testing the Timeline Algorithm

```python
@pytest.mark.asyncio
async def test_timeline_shows_followed_posts(client, test_user, test_user2):
    """Timeline shows posts from followed users (business logic test)."""
    # User 2 creates a post
    await client.post(
        "/v1/posts",
        json={"content": "User 2's post"},
        headers=test_user2["headers"],
    )

    # User 1 follows User 2
    await client.post(
        f"/v1/users/me/following/{test_user2['user']['id']}",
        headers=test_user["headers"],
    )

    # User 1's timeline should show User 2's post
    response = await client.get("/v1/posts", headers=test_user["headers"])
    data = response.json()
    assert data["total"] == 1
    assert data["posts"][0]["author"]["username"] == "testuser2"
```

**Why This Matters:**
This test validates the "Brain" layer logic without involving React. If this passes, we know the Python API is correct.

---

## Layer 2: Next.js Tests (The "BFF" Layer)

**Tool:** Vitest + React Testing Library

**What We Test:**
- **Zod Validation:** Runtime validation of API responses (ingress to React)
- **Server Actions:** Mutation logic, error handling, revalidation
- **Component Rendering:** UI correctly displays data
- **Client Logic:** Form validation, optimistic updates

### Running Next.js Tests

```bash
cd microblog-next

# Install dependencies (if not done)
npm install

# Run tests in watch mode
npm test

# Run tests once
npm test run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Key Test Files

| File | Purpose |
|------|---------|
| `tests/lib/schemas.test.ts` | Zod validation (ingress to React) |
| `tests/actions/posts.test.ts` | Server Action for posts |
| `tests/actions/auth.test.ts` | Server Action for auth |
| `tests/components/PostCard.test.tsx` | Component rendering |

### Example: Testing Server Actions

```typescript
it("should validate content length", async () => {
  vi.mocked(session.getCurrentUser).mockResolvedValue({
    userId: "user_123",
    username: "testuser",
    accessToken: "fake-token",
    isLoggedIn: true,
  });

  // Try to create post with content over 280 chars
  const formData = new FormData();
  formData.append("content", "a".repeat(281));

  const result = await createPostAction(null, formData);

  expect(result.success).toBe(false);
  expect(result.error).toContain("280");
  expect(api.postsAPI.createPost).not.toHaveBeenCalled();
});
```

**Why This Matters:**
This test validates that the Next.js BFF layer correctly validates data before calling FastAPI. We mock the FastAPI call to isolate the BFF logic.

### Example: Testing Zod (The "Ingress" Validation)

```typescript
describe("postCreateSchema", () => {
  it("should reject content over 280 characters", () => {
    const data = { content: "a".repeat(281) };
    expect(() => postCreateSchema.parse(data)).toThrow();
  });
});
```

**Why This Matters:**
This validates that even if FastAPI returns bad data, Zod will catch it before it reaches your components. This is the "zero-trust" ingress validation.

---

## Layer 3: E2E Tests (The "Connective Tissue")

**Tool:** Playwright

**What We Test:**
- **Type-Safe Tunnel:** Data flows correctly from React → Next.js → FastAPI → PostgreSQL
- **Critical User Flows:** Register, login, post, follow
- **Progressive Enhancement:** Forms work without JavaScript
- **Error Handling:** Error boundaries catch failures

### Running E2E Tests

```bash
cd microblog-next

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests (requires backend running)
npm run e2e

# Run with UI
npm run e2e:ui

# Run specific test file
npx playwright test e2e/posts.spec.ts

# Debug mode
npx playwright test --debug
```

### Prerequisites for E2E Tests

**Backend must be running:**
```bash
# Terminal 1: Start PostgreSQL
docker run --name microblog-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=microblog -p 5432:5432 -d postgres:16

# Terminal 2: Start FastAPI
cd microblog-python
uvicorn app.main:app --reload --port 8000

# Terminal 3: Run E2E tests
cd microblog-next
npm run e2e
```

### Key Test Files

| File | Purpose |
|------|---------|
| `e2e/auth.spec.ts` | Registration, login, authentication flow |
| `e2e/posts.spec.ts` | Create post, timeline, type-safe tunnel |
| `e2e/follow.spec.ts` | Follow users, optimistic updates, timeline |
| `e2e/progressive-enhancement.spec.ts` | No-JS functionality |

### Example: Testing the Type-Safe Tunnel

```typescript
test("should create a post and see it in timeline", async ({ page }) => {
  const postContent = `Test post ${Date.now()}`;

  // User creates a post (React)
  await page.fill('textarea[name="content"]', postContent);
  await page.click('button[type="submit"]:has-text("Post")');

  // Success message (from Server Action)
  await expect(page.locator("text=Post created successfully")).toBeVisible();

  // Post appears in timeline (from FastAPI/PostgreSQL)
  await expect(page.locator(`text=${postContent}`)).toBeVisible();
});
```

**Why This Matters:**
This test validates the **entire stack**. If it passes, we know:
1. React submitted the form correctly
2. Next.js Server Action validated and forwarded
3. FastAPI created the post in PostgreSQL
4. Next.js revalidated the timeline
5. React re-rendered with the new post

---

## Layer 4: "Outer Loop" Quality Enforcement (Pro-Tier)

**Tool:** Playwright + axe-playwright

**What We Test:**
- **Visual Regression:** Pixel-perfect UI consistency across browsers
- **Accessibility:** WCAG 2.1 compliance auditing
- **Performance:** Cumulative Layout Shift (CLS) tracking
- **Server Action Behavior:** Optimistic updates, revalidation without page reload

### Why "Outer Loop"?

The Outer Loop transforms this project from a "demo" into a "product" by enforcing:
- **Brand Integrity:** Visual regressions are caught automatically
- **Inclusive Design:** Accessibility violations block deployment
- **UX Stability:** Layout shifts are measured and minimized

### Running Outer Loop Tests

```bash
cd microblog-next

# Run all quality tests (visual + mutations + accessibility)
npm run e2e

# Run ONLY visual regression tests
npm run e2e:visual

# Run ONLY Server Action behavioral tests
npm run e2e:mutations

# Generate/update baseline screenshots (first time or after intentional UI changes)
npm run e2e:update-snapshots

# View test report
npm run e2e:report

# Debug failing tests
npm run e2e:debug
```

### Prerequisites

**Full stack must be running:**
```bash
# Terminal 1: PostgreSQL
docker run --name microblog-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=microblog -p 5432:5432 -d postgres:16

# Terminal 2: FastAPI
cd microblog-python && uvicorn app.main:app --reload --port 8000

# Terminal 3: Run tests (Next.js auto-starts via playwright.config.ts)
cd microblog-next && npm run e2e:visual
```

### Visual Regression Testing ("The Pixel Shield")

Tests screenshot comparison across:
- **Desktop:** Chromium, Firefox
- **Mobile:** iPhone 13 viewport
- **Components:** PostCard, Sidebar, Timeline
- **Full Pages:** Home, Login, Register

**Example:**
```typescript
test("should have consistent PostCard visual across viewports", async ({ page }) => {
  const postCard = page.locator("article").filter({ hasText: postContent }).first();

  // This will fail if the UI differs by more than 50 pixels from baseline
  await expect(postCard).toHaveScreenshot("post-card-component.png", {
    maxDiffPixels: 50,
  });
});
```

**When to Update Snapshots:**
```bash
# After intentional Tailwind/CSS changes
npm run e2e:update-snapshots

# Review the diff images in test-results/ before committing
git diff e2e/*.spec.ts-snapshots/
```

### Accessibility Testing ("The Inclusive UI Audit")

Uses `axe-playwright` to scan every route for WCAG 2.1 violations.

**Example:**
```typescript
test("should pass A11y audit on Home page", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();

  // Fail build on critical/serious violations
  const violations = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );

  expect(violations).toHaveLength(0);
});
```

**What Gets Caught:**
- Missing ARIA labels
- Low contrast ratios
- Missing alt text on images
- Inaccessible form inputs
- Keyboard navigation issues

### Performance Testing (CLS Tracking)

Verifies that Suspense skeletons prevent layout shifts during RSC streaming.

**Example:**
```typescript
test("should maintain layout stability during RSC streaming", async ({ page }) => {
  const cls = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 1000);
    });
  });

  // Assert CLS is below "good" threshold (0.1)
  expect(cls).toBeLessThan(0.1);
});
```

### Server Action Behavioral Testing

Verifies the "Server-First" mutation pattern works correctly.

**Key Behaviors Tested:**
- ✅ Optimistic updates without page reload
- ✅ Loading states during network delays
- ✅ Zod validation errors displayed correctly
- ✅ API errors handled gracefully
- ✅ Form resets after successful submission
- ✅ Scroll position maintained during mutations
- ✅ Race conditions handled (rapid successive mutations)

**Example:**
```typescript
test("Server Action: should optimistically update and revalidate the feed", async ({ page }) => {
  const postContent = `Test Post: ${Math.random()}`;

  await page.fill('textarea[name="content"]', postContent);
  await page.click('button[type="submit"]:has-text("Post")');

  // Post appears WITHOUT full page reload (RSC revalidation)
  await expect(page.locator(`text=${postContent}`)).toBeVisible();

  // Verify no reload occurred
  const didReload = await page.evaluate(() => {
    return (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type === "reload";
  });
  expect(didReload).toBe(false);
});
```

### Test Files

| File | Purpose | Key Validations |
|------|---------|----------------|
| `e2e/visual-quality.spec.ts` | Visual regression + A11y | Screenshot diffs, WCAG violations, CLS |
| `e2e/mutations.spec.ts` | Server Action behavior | Optimistic updates, error handling, no-reload verification |

### Browser Coverage

- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **Mobile Safari** (iPhone 13)

### CI/CD Integration

```yaml
# .github/workflows/quality-gate.yml
e2e-visual:
  runs-on: ubuntu-latest
  steps:
    - run: npm run e2e:visual
    - name: Upload diff images on failure
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: visual-diffs
        path: test-results/
```

### Interview Talking Points

#### On Visual Regression
> "I use Playwright's screenshot comparison to enforce pixel-perfect UI consistency. This allows me to refactor Tailwind styles or update components with total confidence that I haven't introduced visual bugs. The CI pipeline fails if any screenshot differs by more than 50 pixels from the baseline."

#### On Accessibility
> "Every route is automatically scanned for WCAG 2.1 violations using axe-playwright. This ensures our 'Inclusive UI' commitment is enforced in CI, not just documented. Critical and serious violations block deployment."

#### On Performance
> "I measure Cumulative Layout Shift to prove our Suspense skeletons are well-aligned with the actual content. This ensures users don't experience jarring layout shifts when the FastAPI data streams in. Our CLS is consistently under 0.1, which is Google's 'good' threshold."

#### On Server Actions
> "I verify that our Server Actions perform optimistic updates without triggering full page reloads. The tests check that the navigation type remains 'navigate' (not 'reload'), proving that RSC revalidation is working correctly. This demonstrates the 'Server-First' pattern in action."

---

## Testing Strategy: What Gets Tested Where

### ✅ Test at Python Layer

- Pydantic model validation
- Password hashing
- JWT token creation/validation
- Database relationships
- Business logic (timeline algorithm)
- API endpoint contracts

### ✅ Test at Next.js Layer

- Zod schema validation
- Server Action input validation
- Error handling in Server Actions
- Component rendering
- Client-side state management

### ✅ Test at E2E Layer

- Critical user journeys (register → post → see in timeline)
- Cross-boundary data flow (React → FastAPI → DB → React)
- Progressive enhancement (no-JS functionality)
- Error boundaries catching failures

### ❌ DON'T Test (Avoid Duplication)

- Don't test Pydantic validation again in Next.js tests (already tested in Python)
- Don't test component rendering in E2E (too slow, use Vitest)
- Don't test mocked functions (test real integration or skip)

---

## Interview Talking Points

### On Testing Philosophy

> "I use a **Contract-First** strategy. I test my FastAPI logic and Pydantic models with pytest to ensure the 'Brain' is correct. Then I test my React Server Actions and Zod schemas with Vitest to ensure the 'BFF' layer validates correctly. Finally, I run a few critical Playwright E2E tests to ensure the 'Tunnel' between Next.js and FastAPI is holding up under real-world conditions."

### On the Type-Safe Tunnel

> "I validate data at **three points**: Pydantic validates the egress from Python, TypeScript provides compile-time safety, and Zod validates the ingress to React at runtime. Each layer has its own tests, so if something breaks, I know exactly where."

### On Test Speed

> "My unit tests (Pydantic and Zod) run in milliseconds. My integration tests (Server Actions and API endpoints) run in seconds. My E2E tests run in minutes, but I only have 5-10 of them for critical flows. This gives me fast feedback during development."

### On Avoiding Duplication

> "I don't test the same thing twice. For example, I test that Pydantic rejects posts over 280 characters in Python. I don't need to test that again in React—I just need to test that Zod also validates 280 characters on its side. The E2E test then validates that both layers work together."

---

## Coverage Goals

| Layer | Coverage Target | Why |
|-------|----------------|-----|
| **Python (pytest)** | 80%+ | Business logic must be reliable |
| **Next.js (Vitest)** | 70%+ | Server Actions and validation |
| **E2E (Playwright)** | 5-10 tests | Critical flows only |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  python-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: microblog_test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - run: pip install -e ".[dev]"
      - run: pytest --cov=app

  nextjs-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test run

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - uses: actions/setup-node@v3
      - run: pip install -e "."
      - run: npm install
      - run: npx playwright install
      - run: uvicorn app.main:app --port 8000 &
      - run: npm run build
      - run: npm run e2e
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/lib/api'"

**Solution:** Check your `vitest.config.ts` has the correct path alias:

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

### Issue: E2E tests timing out

**Solution:** Ensure backend is running:

```bash
# Check if FastAPI is running
curl http://localhost:8000/health

# Check if Next.js is running
curl http://localhost:3000
```

### Issue: Database errors in pytest

**Solution:** Ensure you're using the test database (SQLite in-memory by default):

```python
# In conftest.py
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
```

---

## Further Reading

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [Playwright documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Kent C. Dodds - Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Testing = Confidence = Ship Faster** 🚀
