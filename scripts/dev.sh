#!/bin/bash

# ============================================================================
# Development Script for Ichhadhari Dairy Management Monorepo
# ============================================================================
# This script starts both the frontend and backend development servers
# concurrently with proper logging and error handling.
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# ============================================================================
# Cleanup function
# ============================================================================

cleanup() {
    print_info "\nShutting down servers..."
    # Kill all background jobs
    jobs -p | xargs -r kill 2>/dev/null || true
    print_success "Servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# ============================================================================
# Main
# ============================================================================

print_header "Starting Ichhadhari Dairy Management Development Servers"

# Check if running from project root
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# ============================================================================
# Pre-flight Checks
# ============================================================================

print_info "Checking prerequisites..."

# Check if frontend app exists
if [ ! -d "apps/frontend" ]; then
    print_error "Frontend app directory not found at apps/frontend"
    exit 1
fi

# Check if backend app exists
if [ ! -d "apps/backend" ]; then
    print_error "Backend app directory not found at apps/backend"
    exit 1
fi

print_success "All directories present"

# ============================================================================
# Start Frontend Server
# ============================================================================

print_info "Starting Next.js frontend server on http://localhost:3000..."

# Check if package.json exists in frontend
if [ ! -f "apps/frontend/package.json" ]; then
    print_error "Frontend package.json not found. Please move your Next.js app to apps/frontend first."
    exit 1
fi

# Start frontend in background
(
    cd apps/frontend
    pnpm dev 2>&1 | sed "s/^/[${GREEN}FRONTEND${NC}] /"
) &

FRONTEND_PID=$!
print_success "Frontend server started (PID: $FRONTEND_PID)"

# ============================================================================
# Start Backend Server
# ============================================================================

print_info "Starting Django backend server on http://localhost:8000..."

# Check if Django project exists
if [ ! -f "apps/backend/manage.py" ]; then
    print_error "Django manage.py not found. Please set up your Django project in apps/backend first."
    print_info "You can create a new Django project with: django-admin startproject dairy_management apps/backend"
    kill $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

# Activate virtual environment and start backend
(
    cd apps/backend
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    python manage.py runserver 2>&1 | sed "s/^/[${YELLOW}BACKEND${NC}] /"
) &

BACKEND_PID=$!
print_success "Backend server started (PID: $BACKEND_PID)"

# ============================================================================
# Monitor Servers
# ============================================================================

print_header "Development Servers Running"

echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}Backend:${NC}  http://localhost:8000"
echo -e "${CYAN}API:${NC}      http://localhost:8000/api"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID

# If we reach here, one of the processes exited
print_error "One of the servers stopped unexpectedly"
cleanup
