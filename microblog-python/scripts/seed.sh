#!/bin/bash
# Convenience script to run database seeding inside Docker container

set -e

CONTAINER_NAME="microblog-python"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Container '${CONTAINER_NAME}' is not running"
    echo ""
    echo "Start it with:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "🌱 Running database seeding in container '${CONTAINER_NAME}'..."
echo ""

# Run seeding script inside container
docker exec -it "${CONTAINER_NAME}" python scripts/seed_database.py "$@"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Seeding completed successfully!"
else
    echo ""
    echo "❌ Seeding failed with exit code: $exit_code"
fi

exit $exit_code
