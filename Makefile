.PHONY: help dev test sync validate fix inner-loop outer-loop clean

# ============================================================================
# Bazel-Powered Makefile for Microblog
# ============================================================================
# This Makefile provides backwards compatibility with the existing workflow
# while delegating to Bazel for improved caching and build performance.

help:
	@echo "🚀 Microblog - Agent-Friendly Build System (Bazel-powered)"
	@echo ""
	@echo "Available targets:"
	@echo "  make dev             - Start both services (Python + Next.js)"
	@echo "  make test            - Run all unit tests"
	@echo "  make sync            - Sync types (Pydantic → TypeScript → Zod)"
	@echo "  make validate        - Run fast quality checks (linting + typecheck)"
	@echo "  make fix             - Auto-fix linting issues"
	@echo ""
	@echo "Inner/Outer Loop:"
	@echo "  make inner-loop      - Fast checks + unit tests (< 30s)"
	@echo "  make outer-loop      - Complete test suite including E2E"
	@echo ""
	@echo "Service-specific:"
	@echo "  make python-dev      - Start Python backend only"
	@echo "  make next-dev        - Start Next.js frontend only"
	@echo "  make python-test     - Run Python tests only"
	@echo "  make next-test       - Run Next.js tests only"
	@echo ""
	@echo "Bazel commands (advanced):"
	@echo "  bazel query '//...'  - List all targets"
	@echo "  bazel run :dev       - Run development servers"
	@echo "  bazel test //...     - Run all tests with caching"
	@echo ""

# ============================================================================
# Main targets
# ============================================================================

dev:
	@echo "🚀 Starting development servers..."
	@bazel run :dev

test:
	@echo "🧪 Running all unit tests..."
	@bazel build //microblog-python:test
	@bazel build //microblog-next:test
	@echo "Run: ./bazel-bin/microblog-python/test.sh"
	@echo "Run: ./bazel-bin/microblog-next/test.sh"

sync:
	@echo "🔄 Syncing type-safe tunnel..."
	@bazel run :sync_types

validate:
	@echo "✓ Running fast quality checks..."
	@bazel build //:inner_loop_fast_checks
	@echo "✅ Lint and typecheck passed (cached results)"

fix:
	@echo "🔧 Auto-fixing linting issues..."
	@bazel run :lint_fix

# ============================================================================
# Inner/Outer Loop
# ============================================================================

inner-loop:
	@echo "⚡ Running inner loop (fast checks + unit tests)..."
	@bazel build //:inner_loop

outer-loop:
	@echo "🔬 Running outer loop (complete quality suite)..."
	@bazel build //:outer_loop

# ============================================================================
# Service-specific targets
# ============================================================================

python-dev:
	@bazel run //microblog-python:dev

next-dev:
	@bazel run //microblog-next:dev

python-test:
	@bazel run //microblog-python:test

next-test:
	@bazel run //microblog-next:test

python-lint:
	@bazel run //microblog-python:lint_check

next-lint:
	@bazel run //microblog-next:lint_check

python-typecheck:
	@bazel run //microblog-python:typecheck

next-typecheck:
	@bazel run //microblog-next:typecheck

# ============================================================================
# Database & Migration
# ============================================================================

migrate:
	@echo "📊 Running database migrations..."
	@bazel run //microblog-python:migrate

# ============================================================================
# Utility
# ============================================================================

clean:
	@echo "🧹 Cleaning Bazel cache..."
	@bazel clean
	@echo "✅ Cache cleared"

# Agent status - shows what needs attention
agent-status:
	@echo "🤖 Agent Status Check"
	@echo "===================="
	@echo ""
	@bazel query 'tests(//...)' | wc -l | xargs -I {} echo "  📊 Total test targets: {}"
	@bazel query 'kind(genrule, //...)' | wc -l | xargs -I {} echo "  ⚙️  Build targets: {}"
	@echo ""
	@echo "💡 Run 'make validate' to check code quality"
	@echo "💡 Run 'make test' to run all tests"
	@echo "💡 Run 'bazel query //...' to see all targets"
