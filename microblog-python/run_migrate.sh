#!/bin/bash
set -e
cd "$(dirname "$0")"
exec alembic upgrade head
