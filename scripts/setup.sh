#!/bin/bash

# ============================================================================
# Setup Script for Ichhadhari Dairy Management Monorepo
# ============================================================================
# This script performs the initial setup for the development environment
# including installing dependencies for both frontend and backend.
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# Main Setup
# ============================================================================

print_header "Ichhadhari Dairy Management - Initial Setup"

# Check if running from project root
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_success "Running from project root"

# ============================================================================
# Check Prerequisites
# ============================================================================

print_header "Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js installed: $NODE_VERSION"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
else
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm installed: $PNPM_VERSION"
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
print_success "Python installed: $PYTHON_VERSION"

# Check pip
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3 first."
    exit 1
fi
PIP_VERSION=$(pip3 --version)
print_success "pip3 installed: $PIP_VERSION"

# ============================================================================
# Install Frontend Dependencies
# ============================================================================

print_header "Installing Frontend Dependencies"

print_info "Installing pnpm workspace dependencies..."
pnpm install

print_success "Frontend dependencies installed successfully"

# ============================================================================
# Setup Backend Environment
# ============================================================================

print_header "Setting Up Backend Environment"

# Create Python virtual environment if it doesn't exist
if [ ! -d "apps/backend/venv" ]; then
    print_info "Creating Python virtual environment..."
    cd apps/backend
    python3 -m venv venv
    cd ../..
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Install Python dependencies if requirements.txt exists
if [ -f "apps/backend/requirements.txt" ]; then
    print_info "Installing Python dependencies..."
    source apps/backend/venv/bin/activate
    pip install -r apps/backend/requirements.txt
    deactivate
    print_success "Backend dependencies installed successfully"
else
    print_warning "requirements.txt not found. Skipping Python dependencies installation."
    print_info "You'll need to create requirements.txt and install Django dependencies later."
fi

# ============================================================================
# Setup Environment Files
# ============================================================================

print_header "Setting Up Environment Files"

# Frontend environment file
if [ ! -f "apps/frontend/.env.local" ]; then
    print_info "Creating frontend .env.local file..."
    cat > apps/frontend/.env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Ichhadhari Dairy Management
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
    print_success "Frontend .env.local created"
else
    print_info "Frontend .env.local already exists"
fi

# Backend environment file
if [ ! -f "apps/backend/.env" ]; then
    print_info "Creating backend .env file..."
    cat > apps/backend/.env << EOF
# Django Environment Variables
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:3000
EOF
    print_success "Backend .env created"
    print_warning "Remember to change SECRET_KEY before deploying to production!"
else
    print_info "Backend .env already exists"
fi

# ============================================================================
# Final Instructions
# ============================================================================

print_header "Setup Complete! 🎉"

echo -e "Your monorepo is ready for development.\n"

print_info "Next Steps:"
echo "  1. Move your existing Next.js app to apps/frontend/"
echo "  2. Set up your Django backend in apps/backend/"
echo "  3. Run 'pnpm dev:frontend' to start the frontend"
echo "  4. Run 'pnpm dev:backend' to start the backend"
echo "  5. Or run 'pnpm dev:all' to start both together"

echo ""
print_info "Useful Commands:"
echo "  pnpm dev:frontend    - Start Next.js development server"
echo "  pnpm dev:backend     - Start Django development server"
echo "  pnpm dev:all         - Start both servers concurrently"
echo "  pnpm build:all       - Build all apps"
echo "  pnpm test:all        - Run all tests"
echo "  pnpm clean           - Clean all build artifacts"

echo ""
print_success "Happy coding! 🚀"
