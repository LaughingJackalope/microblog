# Agent Experience Improvements - Quick Start

This is a practical guide to start implementing agent-friendly tooling **today**.

## The Problem

Your agent identified that multi-step workflows slow down development:
- **Type-safe tunnel updates**: 4 manual steps (Pydantic → TS → Zod → tests)
- **Pre-commit iterations**: 3-5 cycles to fix errors
- **New features**: 30-45 minutes of boilerplate across 10+ files
- **Testing**: 20-40 minutes writing tests for 3 frameworks

## Quick Wins (Start Here)

### 1. Create Root Makefile (30 minutes)

```makefile
# /Users/mp/microblog/Makefile
.PHONY: help dev test sync validate fix

help:
	@echo "Agent-Friendly Commands:"
	@echo "  make dev          - Start both services"
	@echo "  make test         - Run all tests"
	@echo "  make sync         - Sync types (Pydantic → TS → Zod)"
	@echo "  make validate     - Run pre-commit checks"
	@echo "  make fix          - Auto-fix linting issues"

dev:
	@echo "Starting FastAPI backend..."
	cd microblog-python && uvicorn app.main:app --reload --port 8000 &
	@echo "Starting Next.js frontend..."
	cd microblog-next && npm run dev

test:
	@echo "Running Python tests..."
	cd microblog-python && pytest
	@echo "Running Next.js tests..."
	cd microblog-next && npm test

sync:
	@echo "Generating TypeScript types from Pydantic..."
	cd microblog-python && python scripts/generate_types.py
	@echo "TODO: Add Zod generation here"

validate:
	@echo "Running pre-commit checks..."
	.git/hooks/pre-commit

fix:
	@echo "Auto-fixing ESLint issues..."
	cd microblog-next && npx eslint --fix src/
	@echo "Auto-fixing ruff issues..."
	cd microblog-python && ruff check --fix app/
```

**Test it:**
```bash
cd /Users/mp/microblog
make help
make validate
```

### 2. Add Auto-Fix to Pre-commit (15 minutes)

Edit `.git/hooks/pre-commit` and add auto-fix before validation:

```bash
# Find the ESLint section and add --fix:
if ! npx eslint --fix src/ 2>&1 | grep -v "warning" > /dev/null; then
    print_error "ESLint violations (after auto-fix)"
    npx eslint src/ # Show remaining errors
fi

# Find the ruff section and add --fix:
if ! ruff check --fix app/ 2>&1; then
    print_error "Ruff violations (after auto-fix)"
fi
```

### 3. Create Agent Status Command (20 minutes)

```bash
# scripts/agent-status.sh
#!/bin/bash

echo "🤖 Agent Status Check"
echo "===================="

# Check for pending migrations
cd microblog-python
if [ -n "$(alembic upgrade head --sql 2>&1 | grep -v 'up to date')" ]; then
    echo "⚠️  Pending migrations in microblog-python"
else
    echo "✅ Database migrations up to date"
fi

# Check for TypeScript errors
cd ../microblog-next
if ! npx tsc --noEmit > /dev/null 2>&1; then
    echo "❌ TypeScript errors detected"
else
    echo "✅ TypeScript types valid"
fi

# Check for test failures
if ! npm test -- --run --reporter=dot > /dev/null 2>&1; then
    echo "❌ Some Next.js tests failing"
else
    echo "✅ Next.js tests passing"
fi

cd ../microblog-python
if ! pytest --tb=no -q > /dev/null 2>&1; then
    echo "❌ Some Python tests failing"
else
    echo "✅ Python tests passing"
fi

echo ""
echo "💡 Run 'make fix' to auto-fix linting issues"
echo "💡 Run 'make sync' to regenerate types"
```

```bash
chmod +x scripts/agent-status.sh
make agent-status  # Add this target to Makefile
```

## Medium-Term Improvements (Next Week)

### Priority 1: Unified Type Sync

Create `scripts/sync-types.sh`:
```bash
#!/bin/bash
set -e

echo "🔄 Syncing type-safe tunnel..."

# 1. Generate TypeScript from Pydantic
cd microblog-python
python scripts/generate_types.py

# 2. TODO: Generate Zod from Pydantic
# python scripts/update_zod.py

# 3. Validate sync
cd ..
bash scripts/validate-schemas.sh

echo "✅ Type sync complete"
```

### Priority 2: Test Generator

Create `scripts/generate-tests.py`:
```python
#!/usr/bin/env python3
"""Generate test stubs across all test layers."""
import argparse
from pathlib import Path

def generate_pytest(model: str, operation: str) -> str:
    return f'''"""Tests for {model} {operation} operations."""
import pytest
from httpx import AsyncClient

async def test_{operation}_{model.lower()}(client: AsyncClient):
    """Test {operation} {model}."""
    # TODO: Implement test
    pass

async def test_{operation}_{model.lower()}_validation(client: AsyncClient):
    """Test validation for {operation} {model}."""
    # TODO: Implement validation test
    pass
'''

def generate_vitest(model: str, operation: str) -> str:
    return f'''import {{ describe, it, expect }} from 'vitest'
import {{ {operation}{model} }} from '@/actions/{model.lower()}s'

describe('{operation}{model}', () => {{
  it('should {operation.lower()} {model.lower()} successfully', async () => {{
    // TODO: Implement test
  }})

  it('should validate input', async () => {{
    // TODO: Implement validation test
  }})
}})
'''

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True)
    parser.add_argument('--operation', required=True)
    args = parser.parse_args()

    # Generate pytest
    pytest_file = Path(f'microblog-python/tests/test_{args.model.lower()}s.py')
    pytest_file.write_text(generate_pytest(args.model, args.operation))
    print(f"✅ Generated {pytest_file}")

    # Generate vitest
    vitest_file = Path(f'microblog-next/tests/actions/{args.model.lower()}s.test.ts')
    vitest_file.parent.mkdir(exist_ok=True)
    vitest_file.write_text(generate_vitest(args.model, args.operation))
    print(f"✅ Generated {vitest_file}")

if __name__ == '__main__':
    main()
```

**Usage:**
```bash
python scripts/generate-tests.py --model Post --operation create
```

## Longer-Term (Week 2-3)

1. **Full Feature Scaffolder** - Generates entire stack from spec
2. **Documentation Drift Detection** - Warns when docs need updating
3. **Zod Auto-generation** - Derives Zod schemas from Pydantic

## Measuring Success

Track these metrics before and after improvements:

| Task | Before | Target | Actual |
|------|--------|--------|--------|
| Update Pydantic model | 15-30 min | 2-3 min | _measure_ |
| Add new endpoint | 30-45 min | 5-10 min | _measure_ |
| Generate tests | 20-40 min | 3-5 min | _measure_ |
| Pre-commit fix cycle | 3-5 iterations | 1-2 iterations | _measure_ |

## Next Steps

1. **Today**: Create root Makefile (30 min)
2. **This week**: Add auto-fix to pre-commit (15 min)
3. **This week**: Create agent-status command (20 min)
4. **Next week**: Linear issues for comprehensive improvements

## Reference

- **Full Plan**: See plan in Warp (created)
- **Linear Issues**: `LINEAR_ISSUES_AGENT_EXPERIENCE.md`
- **Current Pre-commit**: `INNER_LOOP_IMPLEMENTATION.md`

---

**The goal**: Reduce mechanical work by 80% so agents (and humans) focus on architecture, not boilerplate.
