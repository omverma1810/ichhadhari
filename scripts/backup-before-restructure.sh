#!/bin/bash

# 🔒 BACKUP SCRIPT - Creates backup before restructuring
# Run this BEFORE moving any files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔒 Creating backup before restructuring...${NC}"

# Get the root directory (parent of scripts/)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Create backup directory with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/restructure-backup-$TIMESTAMP"

echo -e "${YELLOW}📦 Backup location: $BACKUP_DIR${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup the current frontend location
if [ -d "dairy-management-system" ]; then
    echo -e "${YELLOW}📋 Backing up dairy-management-system/...${NC}"
    cp -r dairy-management-system "$BACKUP_DIR/dairy-management-system-original"
    echo -e "${GREEN}✅ Backed up dairy-management-system/${NC}"
else
    echo -e "${RED}❌ dairy-management-system/ directory not found!${NC}"
    exit 1
fi

# Backup apps/frontend if it exists and has content
if [ -d "apps/frontend" ]; then
    echo -e "${YELLOW}📋 Backing up apps/frontend/...${NC}"
    cp -r apps/frontend "$BACKUP_DIR/apps-frontend-original"
    echo -e "${GREEN}✅ Backed up apps/frontend/${NC}"
fi

# Backup workspace config files
echo -e "${YELLOW}📋 Backing up workspace config files...${NC}"
cp pnpm-workspace.yaml "$BACKUP_DIR/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/root-package.json" 2>/dev/null || true

# Create backup manifest
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
MONOREPO RESTRUCTURE BACKUP
==========================
Created: $TIMESTAMP
Location: $BACKUP_DIR

Backed up:
- dairy-management-system/ (original frontend location)
- apps/frontend/ (if existed)
- pnpm-workspace.yaml
- package.json (root)

To restore:
1. cd $(pwd)
2. rm -rf dairy-management-system
3. rm -rf apps/frontend
4. cp -r $BACKUP_DIR/dairy-management-system-original dairy-management-system
5. cp -r $BACKUP_DIR/apps-frontend-original apps/frontend (if existed)
EOF

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "${GREEN}📁 Backup saved to: $BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}⚠️  Keep this backup until you verify the restructure works!${NC}"
echo ""
