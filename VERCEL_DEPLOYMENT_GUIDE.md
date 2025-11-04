# Vercel Deployment Guide for Ichhadhari Monorepo

## Problem
The build was failing with:
```
Module not found: Can't resolve '@/components/ui/button'
```

This happened because Vercel was building from the repository root instead of the frontend directory.

## Solution

### Method 1: Vercel Dashboard (Recommended)

1. **Go to your Vercel project settings:**
   - Visit: https://vercel.com/dashboard
   - Select your project (or import `omverma1810/ichhadhari` if starting fresh)

2. **General Settings:**
   - **Root Directory:** `apps/frontend` ← **CRITICAL SETTING**
   - **Framework Preset:** Next.js
   - **Node.js Version:** 20.x

3. **Build & Development Settings:**
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next` (default)
   - **Install Command:** `pnpm install --no-frozen-lockfile`
   - **Development Command:** `pnpm dev`

4. **Environment Variables:**
   Add these in Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://ichhadhari-backend-2ljhubczcq-el.a.run.app/api
   ```

5. **Save and trigger a new deployment**

### Method 2: Vercel CLI

If you prefer CLI deployment:

```bash
# Login to Vercel
npx vercel login

# Deploy from the repository root
cd /Users/apple/Desktop/ichhadhari
npx vercel --prod

# When prompted:
# - Root Directory: apps/frontend
# - Framework: Next.js
# - Build Command: pnpm build
# - Output Directory: .next
```

## Files Updated

1. **`/vercel.json`** - Root configuration for monorepo
2. **`/apps/frontend/vercel.json`** - Frontend-specific configuration

## Verification

After deployment:
1. Check build logs for successful compilation
2. Verify all routes are accessible
3. Test API connectivity
4. Check that UI components load correctly

## Repository Information

- **GitHub Repo:** `https://github.com/omverma1810/ichhadhari.git`
- **Branch:** `master`
- **Frontend Directory:** `apps/frontend`
- **Backend Directory:** `apps/backend`

## Common Issues

### Issue: "Module not found" errors
**Solution:** Ensure "Root Directory" is set to `apps/frontend` in Vercel dashboard

### Issue: Build fails with workspace errors
**Solution:** Use `pnpm install --no-frozen-lockfile` as install command

### Issue: Environment variables not working
**Solution:** Add variables in Vercel dashboard under Settings → Environment Variables

## Support

For issues, check:
1. Build logs at https://vercel.com/dashboard
2. Project settings → General → Root Directory
3. tsconfig.json paths configuration
