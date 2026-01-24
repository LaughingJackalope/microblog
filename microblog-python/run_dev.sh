#!/bin/bash
set -e
cd "$(dirname "$0")"
exec uvicorn app.main:app --reload --port 8000
