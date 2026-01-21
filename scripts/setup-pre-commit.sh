#!/bin/bash
# Pre-Commit Hook Setup Script
#
# This script ensures all necessary tools are installed for the Fast Inner Loop

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)

echo "🔧 Setting up Fast Inner Loop pre-commit hooks..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# 1. Install Node.js Dependencies (Next.js)
# ============================================================================
echo "${BLUE}==>${NC} Installing Node.js dependencies..."
cd "$REPO_ROOT/microblog-next"

if npm install; then
    echo "${GREEN}✓${NC} Node.js dependencies installed"
else
    echo "${YELLOW}⚠${NC} Failed to install Node.js dependencies"
    exit 1
fi

echo ""

# ============================================================================
# 2. Install Python Dependencies (FastAPI)
# ============================================================================
echo "${BLUE}==>${NC} Installing Python dependencies..."
cd "$REPO_ROOT/microblog-python"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv and install dependencies
source venv/bin/activate

if pip install -e ".[dev]" --quiet; then
    echo "${GREEN}✓${NC} Python dependencies installed (includes ruff, mypy)"
else
    echo "${YELLOW}⚠${NC} Failed to install Python dependencies"
fi

deactivate
echo ""

# ============================================================================
# 3. Verify Pre-Commit Hook is Installed
# ============================================================================
echo "${BLUE}==>${NC} Verifying pre-commit hook..."

if [ -f "$REPO_ROOT/.git/hooks/pre-commit" ]; then
    if [ -x "$REPO_ROOT/.git/hooks/pre-commit" ]; then
        echo "${GREEN}✓${NC} Pre-commit hook is installed and executable"
    else
        echo "Making pre-commit hook executable..."
        chmod +x "$REPO_ROOT/.git/hooks/pre-commit"
        echo "${GREEN}✓${NC} Pre-commit hook is now executable"
    fi
else
    echo "${YELLOW}⚠${NC} Pre-commit hook not found at .git/hooks/pre-commit"
    echo "Please ensure the hook file exists."
    exit 1
fi

echo ""

# ============================================================================
# 4. Verify Helper Scripts
# ============================================================================
echo "${BLUE}==>${NC} Verifying helper scripts..."

if [ -f "$REPO_ROOT/scripts/validate-schemas.sh" ]; then
    chmod +x "$REPO_ROOT/scripts/validate-schemas.sh"
    echo "${GREEN}✓${NC} Schema validation script ready"
else
    echo "${YELLOW}⚠${NC} Schema validation script not found"
fi

echo ""

# ============================================================================
# 5. Test the Hook
# ============================================================================
echo "${BLUE}==>${NC} Testing pre-commit hook (dry run)..."
echo ""

# Create a test file to stage (we'll unstage it after)
TEST_FILE="$REPO_ROOT/microblog-next/test-pre-commit.tmp"
echo "// Test file for pre-commit hook" > "$TEST_FILE"
git add "$TEST_FILE" 2>/dev/null || true

# Run the hook
if sh "$REPO_ROOT/.git/hooks/pre-commit"; then
    echo ""
    echo "${GREEN}✓${NC} Pre-commit hook test passed!"
else
    echo ""
    echo "${YELLOW}⚠${NC} Pre-commit hook encountered issues (this might be expected)"
fi

# Clean up test file
git reset HEAD "$TEST_FILE" 2>/dev/null || true
rm -f "$TEST_FILE"

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "${GREEN}✅ Pre-commit hook setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Make a change to any file"
echo "  2. Run: git add <file>"
echo "  3. Run: git commit -m \"Your message\""
echo "  4. Watch the Fast Inner Loop in action!"
echo ""
echo "To bypass hooks (emergency only): git commit --no-verify"
echo ""