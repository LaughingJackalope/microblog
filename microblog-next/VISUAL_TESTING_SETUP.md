# Visual Testing Setup Guide

This guide walks you through setting up and running the "Outer Loop" quality suite for the first time.

## Prerequisites

Before generating baseline screenshots, ensure the full stack is running:

### 1. Start PostgreSQL

```bash
docker run --name microblog-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=microblog \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Start FastAPI Backend

```bash
cd /Users/mp/microblog/microblog-python

# Ensure migrations are up to date
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Install Playwright Browsers (First Time Only)

```bash
cd /Users/mp/microblog/microblog-next
npx playwright install
```

## Generating Baseline Screenshots

Once your stack is running:

```bash
cd /Users/mp/microblog/microblog-next

# Generate baseline screenshots for all browsers
npm run e2e:update-snapshots -- visual-quality
```

This will:
- Create a test user
- Navigate through the application
- Capture screenshots of key components and pages
- Save them in `e2e/visual-quality.spec.ts-snapshots/`

## Verify the Baselines

After generating, you should see snapshot directories:

```bash
ls -la e2e/*.spec.ts-snapshots/
```

Expected structure:
```
e2e/visual-quality.spec.ts-snapshots/
├── chromium/
│   ├── home-page-baseline.png
│   ├── post-card-component.png
│   ├── sidebar-component.png
│   └── timeline-full-page.png
├── firefox/
│   └── (same files)
└── Mobile-Safari/
    └── (same files)
```

## Running Visual Regression Tests

Once baselines are generated:

```bash
# Run all quality tests
npm run e2e

# Run ONLY visual regression tests
npm run e2e:visual

# Run ONLY Server Action behavioral tests
npm run e2e:mutations
```

## Updating Baselines (After Intentional UI Changes)

If you intentionally change the UI (e.g., update Tailwind styles):

```bash
# Update all snapshots
npm run e2e:update-snapshots

# Update only specific test file
npm run e2e:update-snapshots -- visual-quality

# Review the changes before committing
git diff e2e/*.spec.ts-snapshots/
```

## Viewing Test Results

After a test run:

```bash
# Open HTML report
npm run e2e:report
```

If tests fail, check `test-results/` for:
- Actual screenshots
- Expected screenshots
- Diff images (showing pixel differences)

## Debugging Failures

```bash
# Run in debug mode (opens Playwright Inspector)
npm run e2e:debug

# Run specific test
npx playwright test visual-quality --debug

# Run with headed browser (see what's happening)
npx playwright test visual-quality --headed
```

## Common Issues

### Issue: Screenshots differ due to font rendering

**Solution:** This is normal across different OS/environments. In CI, always use the same OS (e.g., ubuntu-latest).

### Issue: Dynamic timestamps causing failures

**Solution:** The tests use `Date.now()` for unique usernames. Screenshots are taken after content loads, so this shouldn't affect visual tests.

### Issue: Accessibility violations detected

**Solution:** Fix the violations! The tests catch real issues. Common fixes:
- Add `aria-label` to buttons
- Ensure sufficient color contrast
- Add alt text to images
- Fix heading hierarchy

## CI/CD Integration

The baselines should be committed to the repository. CI will:
1. Run the tests against the committed baselines
2. Fail if any screenshot differs by more than the threshold
3. Upload diff images as artifacts for review

Example workflow snippet:

```yaml
- name: Run visual regression tests
  run: npm run e2e:visual

- name: Upload diff images on failure
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: visual-diffs
    path: test-results/
```

## Best Practices

1. **Commit baselines to Git**: Screenshots should be version controlled
2. **Review diffs carefully**: Before updating baselines, ensure changes are intentional
3. **Run tests before commits**: Catch visual regressions early
4. **Use consistent environments**: Run CI on same OS as your local dev environment
5. **Keep snapshots lean**: Only snapshot critical components/pages

## Interview Talking Points

When discussing this setup in interviews:

> "I've implemented a comprehensive visual regression suite using Playwright. Every PR triggers pixel-perfect screenshot comparisons across Chromium, Firefox, and Mobile Safari. This catches UI regressions automatically and gives me confidence when refactoring CSS or updating component libraries. The tests also include accessibility audits with axe-playwright, ensuring WCAG 2.1 compliance is enforced in CI, not just documented."