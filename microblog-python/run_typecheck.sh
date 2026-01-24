#!/bin/bash
set -e
cd "$(dirname "$0")"
if command -v mypy &> /dev/null; then
    exec mypy app/
else
    echo "mypy not found, skipping type check"
    exit 0
fi
