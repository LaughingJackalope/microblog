#!/bin/bash
set -e

echo "🚀 Starting development servers..."
echo ""
echo "📦 Python Backend: http://localhost:8000"
echo "🌐 Next.js Frontend: http://localhost:3000"
echo ""

# Start both services in parallel
cd "$(dirname "$0")"
(cd microblog-python && uvicorn app.main:app --reload --port 8000) &
PYTHON_PID=$!
(cd microblog-next && npm run dev) &
NEXTJS_PID=$!

# Cleanup on exit
trap "kill $PYTHON_PID $NEXTJS_PID 2>/dev/null" EXIT

# Wait for both
wait
