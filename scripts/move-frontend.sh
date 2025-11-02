#!/bin/bash

# 🚀 FRONTEND MOVE SCRIPT - Moves frontend to correct monorepo location
# Run this AFTER creating backup

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Moving frontend to apps/frontend/...${NC}"

# Get the root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Safety check - verify backup exists
if [ ! -d "backup" ]; then
    echo -e "${RED}❌ No backup found! Run backup-before-restructure.sh first!${NC}"
    exit 1
fi

# Verify source exists
if [ ! -d "dairy-management-system" ]; then
    echo -e "${RED}❌ dairy-management-system/ directory not found!${NC}"
    exit 1
fi

# Count files in source
SOURCE_COUNT=$(find dairy-management-system -type f | wc -l | tr -d ' ')
echo -e "${YELLOW}📊 Source contains $SOURCE_COUNT files${NC}"

# Remove apps/frontend if it exists and is empty or minimal
if [ -d "apps/frontend" ]; then
    echo -e "${YELLOW}🗑️  Removing existing apps/frontend/...${NC}"
    rm -rf apps/frontend
fi

# Create apps directory if it doesn't exist
mkdir -p apps

# Move dairy-management-system to apps/frontend
echo -e "${YELLOW}📦 Moving dairy-management-system/ to apps/frontend/...${NC}"
mv dairy-management-system apps/frontend

# Verify the move
if [ ! -d "apps/frontend" ]; then
    echo -e "${RED}❌ Move failed! apps/frontend/ not found!${NC}"
    exit 1
fi

# Count files in destination
DEST_COUNT=$(find apps/frontend -type f | wc -l | tr -d ' ')
echo -e "${YELLOW}📊 Destination contains $DEST_COUNT files${NC}"

# Verify file counts match
if [ "$SOURCE_COUNT" -eq "$DEST_COUNT" ]; then
    echo -e "${GREEN}✅ File count matches! Move successful.${NC}"
else
    echo -e "${RED}⚠️  Warning: File count mismatch!${NC}"
    echo -e "${RED}   Source: $SOURCE_COUNT files${NC}"
    echo -e "${RED}   Destination: $DEST_COUNT files${NC}"
    echo -e "${YELLOW}   This might be OK if some files were generated/temporary${NC}"
fi

# List key directories to verify
echo ""
echo -e "${BLUE}📁 Verifying structure:${NC}"

if [ -d "apps/frontend/src" ]; then
    echo -e "${GREEN}✅ apps/frontend/src/ exists${NC}"
else
    echo -e "${RED}❌ apps/frontend/src/ missing!${NC}"
fi

if [ -f "apps/frontend/package.json" ]; then
    echo -e "${GREEN}✅ apps/frontend/package.json exists${NC}"
else
    echo -e "${RED}❌ apps/frontend/package.json missing!${NC}"
fi

if [ -f "apps/frontend/next.config.ts" ]; then
    echo -e "${GREEN}✅ apps/frontend/next.config.ts exists${NC}"
else
    echo -e "${RED}❌ apps/frontend/next.config.ts missing!${NC}"
fi

if [ -d "apps/frontend/public" ]; then
    echo -e "${GREEN}✅ apps/frontend/public/ exists${NC}"
else
    echo -e "${YELLOW}⚠️  apps/frontend/public/ missing (might not exist)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Frontend moved to apps/frontend/!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Run: ${BLUE}bash scripts/update-frontend-config.sh${NC}"
echo -e "   2. Run: ${BLUE}bash scripts/update-frontend-imports.sh${NC}"
echo -e "   3. Run: ${BLUE}bash scripts/reinstall-dependencies.sh${NC}"
echo ""
