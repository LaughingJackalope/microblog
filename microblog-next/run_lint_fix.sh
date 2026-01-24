#!/bin/bash
set -e
cd "$(dirname "$0")"
exec npx eslint --fix src/
