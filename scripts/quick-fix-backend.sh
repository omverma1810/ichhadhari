#!/bin/bash
# ============================================================================
# Quick Fix: Rebuild and Deploy Backend with Correct Platform
# ============================================================================

set -e

echo "🔧 Quick Fix: Rebuilding backend for Cloud Run..."
echo ""

# Configuration
PROJECT_ID="ichhadhari-dairy"
SERVICE_NAME="ichhadhari-backend"
REGION="asia-south1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Navigate to backend directory
cd "$(dirname "$0")/../apps/backend"

echo "Step 1: Building for linux/amd64 platform..."
docker buildx build \
    --platform linux/amd64 \
    -t "${IMAGE_NAME}:latest" \
    -f ../../docker/backend.Dockerfile \
    --load \
    .

echo ""
echo "Step 2: Configuring Docker authentication..."
gcloud auth configure-docker

echo ""
echo "Step 3: Pushing to GCR..."
docker push "${IMAGE_NAME}:latest"

echo ""
echo "Step 4: Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
    --image "${IMAGE_NAME}:latest" \
    --platform managed \
    --region "${REGION}" \
    --project "${PROJECT_ID}"

echo ""
echo "✅ Done! Your backend should be running now."
echo ""
echo "Test it: curl https://${SERVICE_NAME}-162541991773.${REGION}.run.app/admin/"
