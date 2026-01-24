#!/bin/bash
set -e
echo "🔧 Auto-fixing lint issues..."
cd "$(dirname "$0")"
echo "  Python..."
(cd microblog-python && ruff check --fix app/ tests/)
echo "  Next.js..."
(cd microblog-next && npx eslint --fix src/)
echo "✅ Lint fixes applied"
