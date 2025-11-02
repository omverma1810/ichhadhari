# 🔧 Scripts Directory - Monorepo Restructure Tools

This directory contains automation scripts for restructuring the Ichhadhari Dairy Management monorepo.

## 📜 Scripts Overview

### 🌟 Master Script (Use This!)

**`restructure.sh`** - Master orchestration script

- Runs all 6 steps automatically
- Interactive with user confirmation
- Colored progress indicators
- Comprehensive next-steps guide

```bash
bash scripts/restructure.sh
```

---

### 📦 Individual Scripts (For Manual Control)

#### 1. **`backup-before-restructure.sh`**

Creates timestamped backup of current structure before making changes.

**What it does:**

- Creates `backup/restructure-backup-TIMESTAMP/` directory
- Backs up `dairy-management-system/`
- Backs up `apps/frontend/` (if exists)
- Creates `BACKUP_INFO.txt` with restore instructions

**Usage:**

```bash
bash scripts/backup-before-restructure.sh
```

**Output:**

```
backup/restructure-backup-20251022_123456/
├── dairy-management-system-original/
├── apps-frontend-original/
├── pnpm-workspace.yaml
├── root-package.json
└── BACKUP_INFO.txt
```

---

#### 2. **`move-frontend.sh`**

Moves frontend from `dairy-management-system/` to `apps/frontend/`.

**What it does:**

- Counts files in source directory
- Removes existing `apps/frontend/` (if empty)
- Moves entire `dairy-management-system/` → `apps/frontend/`
- Verifies file counts match
- Checks for critical files

**Usage:**

```bash
bash scripts/move-frontend.sh
```

**Safety checks:**

- Verifies backup exists
- Validates source exists
- Confirms file counts match
- Checks for key files (package.json, src/, etc.)

---

#### 3. **`update-frontend-config.sh`**

Updates configuration files for monorepo compatibility.

**What it does:**

- Updates `apps/frontend/package.json`:
  - Changes name to `@ichhadhari/frontend`
  - Adds `@ichhadhari/shared` workspace dependency
- Updates `apps/frontend/tsconfig.json`:
  - Adds workspace path mappings
  - Configures shared types path

**Usage:**

```bash
bash scripts/update-frontend-config.sh
```

**Changes made:**

```json
// package.json
{
  "name": "@ichhadhari/frontend",
  "dependencies": {
    "@ichhadhari/shared": "workspace:*"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@ichhadhari/shared/*": ["../../packages/shared/src/*"]
    }
  }
}
```

---

#### 4. **`update-frontend-imports.sh`**

Analyzes and helps update import statements to use shared workspace.

**What it does:**

- Creates `packages/shared/src/types/` if missing
- Creates `index.ts` in types directory
- Searches for imports from `@/types`
- Finds relative type imports
- Provides commands for automatic replacement

**Usage:**

```bash
bash scripts/update-frontend-imports.sh
```

**Manual import update (if needed):**

```bash
find apps/frontend/src -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -exec sed -i '' "s|from '@/types'|from '@ichhadhari/shared/types'|g" {} +
```

---

#### 5. **`reinstall-dependencies.sh`**

Removes old dependencies and reinstalls via pnpm workspace.

**What it does:**

- Removes all `node_modules/` directories
- Removes `pnpm-lock.yaml`
- Removes `package-lock.json` (if exists)
- Removes `.next/` build folder
- Removes `*.tsbuildinfo` files
- Runs `pnpm install` from root
- Verifies key packages installed

**Usage:**

```bash
bash scripts/reinstall-dependencies.sh
```

**Verification checks:**

- Next.js installed
- React installed
- Workspace packages linked

---

#### 6. **`verify-structure.sh`**

Comprehensive verification of monorepo structure.

**What it does:**

- Checks all required directories exist
- Validates package.json configurations
- Verifies package names
- Confirms old structure removed
- Checks dependencies installed
- Reports errors with details

**Usage:**

```bash
bash scripts/verify-structure.sh
```

**Checks performed:**

```
✅ apps/frontend/ structure
✅ apps/backend/ structure
✅ packages/shared/ structure
✅ Root configuration files
✅ Old directory removed
✅ Dependencies installed
```

---

## 🚀 Quick Start

### Automated (Recommended)

```bash
cd /Users/apple/Desktop/ichhadhari
bash scripts/restructure.sh
```

### Manual (Step-by-Step)

```bash
cd /Users/apple/Desktop/ichhadhari

# Run each script in order
bash scripts/backup-before-restructure.sh
bash scripts/move-frontend.sh
bash scripts/update-frontend-config.sh
bash scripts/update-frontend-imports.sh
bash scripts/reinstall-dependencies.sh
bash scripts/verify-structure.sh

# Test
pnpm dev:frontend
```

---

## 🔍 Script Dependencies

```
restructure.sh (master)
├── backup-before-restructure.sh
├── move-frontend.sh
├── update-frontend-config.sh
├── update-frontend-imports.sh
├── reinstall-dependencies.sh
└── verify-structure.sh
```

---

## 🛡️ Safety Features

### All scripts include:

- ✅ Error handling (`set -e`)
- ✅ Color-coded output
- ✅ Clear progress messages
- ✅ Validation checks
- ✅ Safe to re-run

### Backup protection:

- ✅ Automatic backup creation
- ✅ Timestamped backups
- ✅ Restore instructions included
- ✅ Original files preserved

---

## 📊 Script Execution Flow

```
START
  ↓
[backup-before-restructure.sh]
  ↓
[move-frontend.sh]
  ↓
[update-frontend-config.sh]
  ↓
[update-frontend-imports.sh]
  ↓
[reinstall-dependencies.sh]
  ↓
[verify-structure.sh]
  ↓
COMPLETE → Test with: pnpm dev:frontend
```

---

## 🆘 Troubleshooting

### Script fails or errors?

1. Check error message (color-coded in red)
2. Verify prerequisites:
   - pnpm installed: `npm install -g pnpm`
   - Node.js ≥18: `node --version`
3. Check backup exists: `ls backup/`
4. Re-run specific step that failed

### Need to rollback?

```bash
rm -rf apps/frontend
BACKUP_DIR=$(ls -t backup/ | head -1)
cp -r backup/$BACKUP_DIR/dairy-management-system-original \
      dairy-management-system
```

### Common issues:

**"pnpm: command not found"**

```bash
npm install -g pnpm
```

**"Permission denied"**

```bash
chmod +x scripts/*.sh
```

**"Directory not found"**

```bash
# Ensure you're in the correct directory
cd /Users/apple/Desktop/ichhadhari
pwd  # Should show: /Users/apple/Desktop/ichhadhari
```

---

## 📚 Additional Documentation

- **RESTRUCTURE_QUICKSTART.md** - Quick reference guide
- **RESTRUCTURE_CHECKLIST.md** - Detailed checklist
- **RESTRUCTURE_SUMMARY.md** - Implementation details
- **RESTRUCTURE_VISUAL.md** - Visual diagrams

---

## ✅ Success Criteria

Scripts are successful when:

1. ✅ All scripts complete without errors
2. ✅ `verify-structure.sh` passes all checks
3. ✅ `pnpm dev:frontend` starts successfully
4. ✅ Frontend loads at http://localhost:3000
5. ✅ No import errors in console

---

## 🎯 What These Scripts Change

### File System:

- **Move:** `dairy-management-system/` → `apps/frontend/`
- **Create:** `backup/restructure-backup-TIMESTAMP/`
- **Create:** `packages/shared/src/types/` (if missing)

### Configuration:

- **Modify:** `apps/frontend/package.json` (name + deps)
- **Modify:** `apps/frontend/tsconfig.json` (paths)

### Dependencies:

- **Remove:** Old `node_modules/` and lock files
- **Install:** Fresh workspace dependencies via pnpm

### What's Preserved:

- ✅ All code logic unchanged
- ✅ All components intact
- ✅ All configurations preserved (except paths)
- ✅ Backend untouched
- ✅ Git history maintained

---

## 📞 Support

If you encounter issues:

1. Check script output for specific errors
2. Review backup files in `backup/` directory
3. Consult documentation in root directory
4. Verify environment (Node.js, pnpm versions)

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** Ready for use
