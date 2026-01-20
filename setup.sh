#!/bin/bash
set -e

echo "🚀 Microblog Setup Script"
echo "========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.12+${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. You'll need to install PostgreSQL manually.${NC}"
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Generate secrets
echo -e "${BLUE}Generating secure secrets...${NC}"
PYTHON_SECRET=$(openssl rand -base64 32)
NEXTJS_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓ Secrets generated${NC}"
echo ""

# Setup Python backend
echo -e "${BLUE}Setting up Python backend...${NC}"
cd microblog-python

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/microblog

# Security (Auto-generated - DO NOT COMMIT)
SECRET_KEY=${PYTHON_SECRET}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Environment
ENVIRONMENT=development
EOF
    echo -e "${GREEN}✓ Created .env file with secure secrets${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping...${NC}"
fi

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
if command -v uv &> /dev/null; then
    echo "Using uv (fast)..."
    uv pip install -e ".[dev]"
else
    pip install -e ".[dev]"
fi
echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo ""

cd ..

# Setup Next.js frontend
echo -e "${BLUE}Setting up Next.js frontend...${NC}"
cd microblog-next

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
# FastAPI Backend
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000

# Session Secret (Auto-generated - DO NOT COMMIT)
SESSION_SECRET=${NEXTJS_SECRET}
EOF
    echo -e "${GREEN}✓ Created .env.local file with secure secrets${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists, skipping...${NC}"
fi

# Install Node dependencies
echo -e "${BLUE}Installing Node dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Node dependencies installed${NC}"
echo ""

cd ..

# Database setup
echo ""
echo -e "${BLUE}Database setup options:${NC}"
echo "1. Start PostgreSQL in Docker (recommended)"
echo "2. I'll set up PostgreSQL myself"
read -p "Choose option (1 or 2): " db_choice

if [ "$db_choice" = "1" ]; then
    if command -v docker &> /dev/null; then
        echo -e "${BLUE}Starting PostgreSQL in Docker...${NC}"

        # Check if container already exists
        if docker ps -a --format '{{.Names}}' | grep -q '^microblog-db$'; then
            echo -e "${YELLOW}Container microblog-db already exists${NC}"
            read -p "Remove and recreate? (y/n): " recreate
            if [ "$recreate" = "y" ]; then
                docker rm -f microblog-db
                docker run --name microblog-db \
                  -e POSTGRES_PASSWORD=postgres \
                  -e POSTGRES_DB=microblog \
                  -p 5432:5432 \
                  -d postgres:16
                echo -e "${GREEN}✓ PostgreSQL started in Docker${NC}"
            fi
        else
            docker run --name microblog-db \
              -e POSTGRES_PASSWORD=postgres \
              -e POSTGRES_DB=microblog \
              -p 5432:5432 \
              -d postgres:16
            echo -e "${GREEN}✓ PostgreSQL started in Docker${NC}"
        fi

        # Wait for PostgreSQL to be ready
        echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
        sleep 3

        # Run migrations
        echo -e "${BLUE}Running database migrations...${NC}"
        cd microblog-python
        alembic upgrade head
        echo -e "${GREEN}✓ Database migrations complete${NC}"
        cd ..
    else
        echo -e "${RED}❌ Docker not available. Please install PostgreSQL manually.${NC}"
    fi
elif [ "$db_choice" = "2" ]; then
    echo -e "${YELLOW}Please ensure PostgreSQL is running on localhost:5432${NC}"
    echo -e "${YELLOW}Database: microblog, User: postgres, Password: postgres${NC}"
    read -p "Press enter when ready to run migrations..."

    cd microblog-python
    alembic upgrade head
    echo -e "${GREEN}✓ Database migrations complete${NC}"
    cd ..
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Setup complete! ✨${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd microblog-python"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd microblog-next"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo -e "${BLUE}To run tests:${NC}"
echo ""
echo "Python tests:"
echo "  cd microblog-python && pytest"
echo ""
echo "Next.js tests:"
echo "  cd microblog-next && npm test"
echo ""
echo "E2E tests (requires backend running):"
echo "  cd microblog-next && npm run e2e"
echo ""
