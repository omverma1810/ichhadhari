#!/bin/bash

# 🔧 CONFIG UPDATE SCRIPT - Updates package.json and tsconfig.json
# Run this AFTER moving frontend

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Updating frontend configuration files...${NC}"

# Get the root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Verify apps/frontend exists
if [ ! -d "apps/frontend" ]; then
    echo -e "${RED}❌ apps/frontend/ not found! Run move-frontend.sh first!${NC}"
    exit 1
fi

# Update package.json name
echo -e "${YELLOW}📝 Updating apps/frontend/package.json...${NC}"
if [ -f "apps/frontend/package.json" ]; then
    # Use Node.js to update the package.json properly
    node -e "
    const fs = require('fs');
    const path = 'apps/frontend/package.json';
    const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
    pkg.name = '@ichhadhari/frontend';
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['@ichhadhari/shared'] = 'workspace:*';
    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
    console.log('✅ Updated package.json');
    "
    echo -e "${GREEN}✅ Updated package.json with @ichhadhari/frontend name${NC}"
else
    echo -e "${RED}❌ apps/frontend/package.json not found!${NC}"
    exit 1
fi

# Update tsconfig.json paths
echo -e "${YELLOW}📝 Updating apps/frontend/tsconfig.json...${NC}"
if [ -f "apps/frontend/tsconfig.json" ]; then
    # Use Node.js to update tsconfig.json
    node -e "
    const fs = require('fs');
    const path = 'apps/frontend/tsconfig.json';
    const tsconfig = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
    if (!tsconfig.compilerOptions.paths) tsconfig.compilerOptions.paths = {};
    tsconfig.compilerOptions.paths['@/*'] = ['./src/*'];
    tsconfig.compilerOptions.paths['@ichhadhari/shared/*'] = ['../../packages/shared/src/*'];
    fs.writeFileSync(path, JSON.stringify(tsconfig, null, 2) + '\n');
    console.log('✅ Updated tsconfig.json');
    "
    echo -e "${GREEN}✅ Updated tsconfig.json with workspace paths${NC}"
else
    echo -e "${RED}❌ apps/frontend/tsconfig.json not found!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Configuration files updated!${NC}"
echo -e "${YELLOW}📝 Next step: Run ${BLUE}bash scripts/update-frontend-imports.sh${NC}"
echo ""
