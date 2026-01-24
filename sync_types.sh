#!/bin/bash
set -e
echo "🔄 Syncing type-safe tunnel (Pydantic → TypeScript → Zod)..."
cd microblog-python
python scripts/generate_types.py
echo "✅ Type sync complete"
