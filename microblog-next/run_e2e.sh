#!/bin/bash
set -e
cd "$(dirname "$0")"
exec npm run e2e
