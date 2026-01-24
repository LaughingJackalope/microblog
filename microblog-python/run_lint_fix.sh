#!/bin/bash
set -e
cd "$(dirname "$0")"
exec ruff check --fix app/ tests/
