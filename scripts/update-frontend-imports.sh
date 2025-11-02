#!/bin/bash

# 🔄 IMPORTS UPDATE SCRIPT - Updates import statements to use shared workspace
# Run this AFTER updating config files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Updating import statements...${NC}"

# Get the root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Verify apps/frontend exists
if [ ! -d "apps/frontend/src" ]; then
    echo -e "${RED}❌ apps/frontend/src/ not found!${NC}"
    exit 1
fi

# Create packages/shared/src/types if it doesn't exist
echo -e "${YELLOW}📁 Ensuring packages/shared/src/types exists...${NC}"
mkdir -p packages/shared/src/types

# Create index.ts in packages/shared/src/types if it doesn't exist
if [ ! -f "packages/shared/src/types/index.ts" ]; then
    cat > packages/shared/src/types/index.ts << 'EOF'
// Shared type definitions for the Ichhadhari Dairy Management System
// This file will be populated with common types used across frontend and backend

export * from './api';
export * from './models';
EOF
    echo -e "${GREEN}✅ Created packages/shared/src/types/index.ts${NC}"
fi

# Check if there's a types directory in frontend
if [ -d "apps/frontend/src/types" ]; then
    echo -e "${YELLOW}📦 Found types in apps/frontend/src/types${NC}"
    echo -e "${YELLOW}   You may want to move these to packages/shared/src/types${NC}"
    echo -e "${YELLOW}   Listing types:${NC}"
    ls -la apps/frontend/src/types/
fi

# Find and update import statements
echo -e "${YELLOW}🔍 Searching for type imports to update...${NC}"

# Search for imports from @/types
if grep -r "from '@/types'" apps/frontend/src/ 2>/dev/null | head -5; then
    echo -e "${YELLOW}   Found imports from '@/types'${NC}"
    
    # Ask user if they want to proceed with automatic replacement
    echo -e "${YELLOW}⚠️  Would you like to update these imports automatically?${NC}"
    echo -e "${YELLOW}   This will replace: from '@/types' ${NC}"
    echo -e "${YELLOW}   With: from '@ichhadhari/shared/types' ${NC}"
    echo ""
    echo -e "${BLUE}   To proceed, run manually:${NC}"
    echo -e "${BLUE}   find apps/frontend/src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' \"s|from '@/types'|from '@ichhadhari/shared/types'|g\" {} +${NC}"
else
    echo -e "${GREEN}✅ No '@/types' imports found${NC}"
fi

# Search for imports from ../types or ../../types
if grep -r "from.*['\"]\.\..*types['\"]" apps/frontend/src/ 2>/dev/null | head -5; then
    echo -e "${YELLOW}   Found relative type imports${NC}"
    echo -e "${BLUE}   These may need manual review and update${NC}"
else
    echo -e "${GREEN}✅ No relative type imports found${NC}"
fi

echo ""
echo -e "${GREEN}✅ Import analysis complete!${NC}"
echo -e "${YELLOW}📝 Note: Type imports should use '@ichhadhari/shared/types'${NC}"
echo -e "${YELLOW}📝 Next step: Run ${BLUE}bash scripts/reinstall-dependencies.sh${NC}"
echo ""
