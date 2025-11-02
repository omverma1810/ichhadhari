#!/bin/bash

# 📦 DEPENDENCIES REINSTALL SCRIPT
# Run this AFTER all configuration updates

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Reinstalling dependencies...${NC}"

# Get the root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Remove all node_modules and lock files
echo -e "${YELLOW}🗑️  Removing old node_modules and lock files...${NC}"

if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✅ Removed root node_modules${NC}"
fi

if [ -d "apps/frontend/node_modules" ]; then
    rm -rf apps/frontend/node_modules
    echo -e "${GREEN}✅ Removed apps/frontend/node_modules${NC}"
fi

if [ -d "packages/shared/node_modules" ]; then
    rm -rf packages/shared/node_modules
    echo -e "${GREEN}✅ Removed packages/shared/node_modules${NC}"
fi

if [ -f "pnpm-lock.yaml" ]; then
    rm pnpm-lock.yaml
    echo -e "${GREEN}✅ Removed pnpm-lock.yaml${NC}"
fi

if [ -f "apps/frontend/package-lock.json" ]; then
    rm apps/frontend/package-lock.json
    echo -e "${GREEN}✅ Removed apps/frontend/package-lock.json${NC}"
fi

# Remove .next build folder
if [ -d "apps/frontend/.next" ]; then
    rm -rf apps/frontend/.next
    echo -e "${GREEN}✅ Removed .next build folder${NC}"
fi

# Remove tsbuildinfo files
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

echo ""
echo -e "${YELLOW}📥 Installing dependencies with pnpm...${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed!${NC}"
    echo -e "${YELLOW}Install it with: npm install -g pnpm${NC}"
    exit 1
fi

# Install dependencies
pnpm install

echo ""
echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Verifying installation:${NC}"

# Verify key packages
if [ -d "apps/frontend/node_modules/next" ]; then
    echo -e "${GREEN}✅ Next.js installed${NC}"
else
    echo -e "${RED}❌ Next.js not found${NC}"
fi

if [ -d "apps/frontend/node_modules/react" ]; then
    echo -e "${GREEN}✅ React installed${NC}"
else
    echo -e "${RED}❌ React not found${NC}"
fi

if [ -d "node_modules/@ichhadhari/shared" ]; then
    echo -e "${GREEN}✅ @ichhadhari/shared workspace linked${NC}"
else
    echo -e "${YELLOW}⚠️  @ichhadhari/shared not linked (this is OK if packages/shared is minimal)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Dependency installation complete!${NC}"
echo -e "${YELLOW}📝 Next step: Run ${BLUE}bash scripts/verify-structure.sh${NC}"
echo ""
