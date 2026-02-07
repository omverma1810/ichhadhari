#!/bin/bash
# ============================================================================
# Deploy Backend to Google Cloud Run
# ============================================================================

set -e  # Exit on error

echo "🚀 Deploying Ichhadhari Backend to Google Cloud Run"
echo "=================================================="

# Configuration
PROJECT_ID="ichhadhari-dairy"
SERVICE_NAME="ichhadhari-backend"
REGION="asia-south1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Navigate to backend directory
cd "$(dirname "$0")/../apps/backend"

echo ""
echo "📦 Step 1: Building Docker image for Cloud Run (amd64/linux)..."
echo "================================================================"

# Build for amd64 platform explicitly
docker buildx build \
    --platform linux/amd64 \
    --tag "${IMAGE_NAME}:latest" \
    --file ../../docker/backend.Dockerfile \
    --load \
    .

echo ""
echo "✅ Image built successfully!"
echo ""

echo "📤 Step 2: Pushing image to Google Container Registry..."
echo "========================================================="

# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker

# Push the image
docker push "${IMAGE_NAME}:latest"

echo ""
echo "✅ Image pushed successfully!"
echo ""

echo "🚀 Step 3: Deploying to Cloud Run..."
echo "====================================="

gcloud run deploy "${SERVICE_NAME}" \
    --image "${IMAGE_NAME}:latest" \
    --platform managed \
    --region "${REGION}" \
    --allow-unauthenticated \
    --port 8000 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 600 \
    --max-instances 10 \
    --min-instances 0 \
    --set-env-vars "DJANGO_SETTINGS_MODULE=dairy.settings.production,ENVIRONMENT=production" \
    --project "${PROJECT_ID}"

echo ""
echo "✅ Deployment complete!"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --platform managed \
    --region "${REGION}" \
    --format 'value(status.url)' \
    --project "${PROJECT_ID}")

echo "🎉 Backend deployed successfully!"
echo "=================================="
echo ""
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "📝 Next steps:"
echo "1. Set your DATABASE_URL secret:"
echo "   gcloud run services update ${SERVICE_NAME} --update-secrets=DATABASE_URL=DATABASE_URL:latest --region=${REGION}"
echo ""
echo "2. Test the deployment:"
echo "   curl ${SERVICE_URL}/admin/"
echo ""
