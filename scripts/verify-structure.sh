#!/bin/bash

# ✅ VERIFICATION SCRIPT - Checks if restructure was successful
# Run this AFTER reinstalling dependencies

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}✅ Verifying monorepo structure...${NC}"
echo ""

# Get the root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ERRORS=0

# Check apps/frontend structure
echo -e "${BLUE}📁 Checking apps/frontend/:${NC}"

if [ -d "apps/frontend" ]; then
    echo -e "${GREEN}✅ apps/frontend/ exists${NC}"
else
    echo -e "${RED}❌ apps/frontend/ missing${NC}"
    ((ERRORS++))
fi

if [ -f "apps/frontend/package.json" ]; then
    echo -e "${GREEN}✅ apps/frontend/package.json exists${NC}"
    
    # Check package name
    PKG_NAME=$(node -e "console.log(require('./apps/frontend/package.json').name)" 2>/dev/null)
    if [ "$PKG_NAME" = "@ichhadhari/frontend" ]; then
        echo -e "${GREEN}✅ Package name is @ichhadhari/frontend${NC}"
    else
        echo -e "${YELLOW}⚠️  Package name is '$PKG_NAME' (expected @ichhadhari/frontend)${NC}"
    fi
else
    echo -e "${RED}❌ apps/frontend/package.json missing${NC}"
    ((ERRORS++))
fi

if [ -d "apps/frontend/src" ]; then
    echo -e "${GREEN}✅ apps/frontend/src/ exists${NC}"
else
    echo -e "${RED}❌ apps/frontend/src/ missing${NC}"
    ((ERRORS++))
fi

if [ -d "apps/frontend/src/app" ]; then
    echo -e "${GREEN}✅ apps/frontend/src/app/ exists (Next.js pages)${NC}"
else
    echo -e "${RED}❌ apps/frontend/src/app/ missing${NC}"
    ((ERRORS++))
fi

if [ -d "apps/frontend/src/components" ]; then
    echo -e "${GREEN}✅ apps/frontend/src/components/ exists${NC}"
else
    echo -e "${YELLOW}⚠️  apps/frontend/src/components/ missing${NC}"
fi

if [ -f "apps/frontend/next.config.ts" ] || [ -f "apps/frontend/next.config.js" ]; then
    echo -e "${GREEN}✅ apps/frontend/next.config exists${NC}"
else
    echo -e "${RED}❌ apps/frontend/next.config missing${NC}"
    ((ERRORS++))
fi

if [ -f "apps/frontend/tsconfig.json" ]; then
    echo -e "${GREEN}✅ apps/frontend/tsconfig.json exists${NC}"
else
    echo -e "${RED}❌ apps/frontend/tsconfig.json missing${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}📁 Checking apps/backend/:${NC}"

if [ -d "apps/backend" ]; then
    echo -e "${GREEN}✅ apps/backend/ exists${NC}"
else
    echo -e "${RED}❌ apps/backend/ missing${NC}"
    ((ERRORS++))
fi

if [ -f "apps/backend/manage.py" ]; then
    echo -e "${GREEN}✅ apps/backend/manage.py exists (Django)${NC}"
else
    echo -e "${RED}❌ apps/backend/manage.py missing${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}📁 Checking packages/shared/:${NC}"

if [ -d "packages/shared" ]; then
    echo -e "${GREEN}✅ packages/shared/ exists${NC}"
else
    echo -e "${YELLOW}⚠️  packages/shared/ missing${NC}"
fi

if [ -f "packages/shared/package.json" ]; then
    echo -e "${GREEN}✅ packages/shared/package.json exists${NC}"
else
    echo -e "${YELLOW}⚠️  packages/shared/package.json missing${NC}"
fi

if [ -d "packages/shared/src" ]; then
    echo -e "${GREEN}✅ packages/shared/src/ exists${NC}"
else
    echo -e "${YELLOW}⚠️  packages/shared/src/ missing${NC}"
fi

echo ""
echo -e "${BLUE}📁 Checking root configuration:${NC}"

if [ -f "pnpm-workspace.yaml" ]; then
    echo -e "${GREEN}✅ pnpm-workspace.yaml exists${NC}"
else
    echo -e "${RED}❌ pnpm-workspace.yaml missing${NC}"
    ((ERRORS++))
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ root package.json exists${NC}"
else
    echo -e "${RED}❌ root package.json missing${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}📁 Checking old structure (should not exist):${NC}"

if [ -d "dairy-management-system" ]; then
    echo -e "${RED}❌ dairy-management-system/ still exists (should be removed)${NC}"
    echo -e "${YELLOW}   Run: rm -rf dairy-management-system${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ dairy-management-system/ removed${NC}"
fi

echo ""
echo -e "${BLUE}📁 Checking dependencies:${NC}"

if [ -d "apps/frontend/node_modules" ]; then
    echo -e "${GREEN}✅ apps/frontend/node_modules/ exists${NC}"
else
    echo -e "${YELLOW}⚠️  apps/frontend/node_modules/ missing (run: pnpm install)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCESS! Monorepo structure is correct!${NC}"
    echo ""
    echo -e "${BLUE}📝 Next steps:${NC}"
    echo -e "   1. Test frontend: ${YELLOW}pnpm dev:frontend${NC}"
    echo -e "   2. Check for import errors in the console"
    echo -e "   3. Verify frontend loads at http://localhost:3000"
    echo -e "   4. If successful, you can remove the backup:"
    echo -e "      ${YELLOW}rm -rf backup/${NC}"
else
    echo -e "${RED}❌ ERRORS FOUND: $ERRORS issue(s) detected${NC}"
    echo -e "${YELLOW}   Please fix the issues above before proceeding${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
