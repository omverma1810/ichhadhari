#!/bin/bash

# 🚀 MASTER RESTRUCTURE SCRIPT - Runs all steps in sequence
# This script orchestrates the entire monorepo restructure process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║       🔧 ICHHADHARI MONOREPO RESTRUCTURE SCRIPT 🔧        ║"
echo "║                                                            ║"
echo "║  This script will move your Next.js frontend to the       ║"
echo "║  correct monorepo location: apps/frontend/                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Get the root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${CYAN}📍 Working directory: $ROOT_DIR${NC}"
echo ""

# Confirm with user
echo -e "${YELLOW}⚠️  WARNING: This will make significant changes to your directory structure!${NC}"
echo ""
echo -e "${BLUE}What will happen:${NC}"
echo -e "  1. Create backup of current structure"
echo -e "  2. Move dairy-management-system/ → apps/frontend/"
echo -e "  3. Update package.json and tsconfig.json"
echo -e "  4. Update import statements"
echo -e "  5. Reinstall dependencies"
echo -e "  6. Verify the new structure"
echo ""
echo -e "${GREEN}Press Enter to continue or Ctrl+C to cancel...${NC}"
read -r

echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 STEP 1/6: Creating Backup${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
bash scripts/backup-before-restructure.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backup failed! Aborting.${NC}"
    exit 1
fi

echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📦 STEP 2/6: Moving Frontend${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
bash scripts/move-frontend.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Move failed! Check backup in backup/ directory${NC}"
    exit 1
fi

echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔧 STEP 3/6: Updating Configuration Files${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
bash scripts/update-frontend-config.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Config update failed!${NC}"
    exit 1
fi

echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔄 STEP 4/6: Analyzing Import Statements${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
bash scripts/update-frontend-imports.sh
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Import analysis completed with warnings${NC}"
fi

echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📦 STEP 5/6: Reinstalling Dependencies${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
bash scripts/reinstall-dependencies.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dependency installation failed!${NC}"
    exit 1
fi

echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}✅ STEP 6/6: Verifying Structure${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
bash scripts/verify-structure.sh

echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ RESTRUCTURE COMPLETE!${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📝 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Test the frontend:${NC}"
echo -e "   ${BLUE}pnpm dev:frontend${NC}"
echo ""
echo -e "${YELLOW}2. Open in browser:${NC}"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}3. Check for errors in the console${NC}"
echo ""
echo -e "${YELLOW}4. If everything works, remove old directory:${NC}"
echo -e "   ${BLUE}rm -rf dairy-management-system${NC}"
echo ""
echo -e "${YELLOW}5. Commit changes:${NC}"
echo -e "   ${BLUE}git add .${NC}"
echo -e "   ${BLUE}git commit -m 'refactor: move frontend to monorepo structure'${NC}"
echo ""
echo -e "${CYAN}📚 See RESTRUCTURE_CHECKLIST.md for detailed verification${NC}"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"
echo ""
