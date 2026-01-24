#!/bin/bash
set -e
cd "$(dirname "$0")"
exec python scripts/generate_types.py
