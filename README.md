# Ichhadhari Dairy Management System - Monorepo

A comprehensive dairy management system built with a modern monorepo architecture, featuring a Next.js frontend and Django backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Scripts](#scripts)
- [Shared Package](#shared-package)
- [Docker Support](#docker-support)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Ichhadhari Dairy Management System is a full-stack solution for managing dairy operations including:

- 🥛 Milk intake and quality management
- 👥 Vendor management and payments
- 🏭 Production batch tracking
- 📦 Inventory management
- 👨‍💼 Employee management
- 📊 Analytics and reporting

## 🏗️ Architecture

This project uses a **monorepo architecture** with the following key features:

- **Frontend**: Next.js 14 with TypeScript, React, and Tailwind CSS
- **Backend**: Django (Python) with REST API
- **Shared Package**: TypeScript types shared between frontend and backend
- **Workspace Manager**: pnpm workspaces for efficient dependency management
- **Containerization**: Docker support for easy deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    Monorepo Root                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Frontend   │  │   Backend    │  │     Shared      │  │
│  │   Next.js    │  │   Django     │  │  TS Types/Utils │  │
│  │ (TypeScript) │  │   (Python)   │  │  (TypeScript)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│         │                  │                   │            │
│         └──────────────────┴───────────────────┘            │
│                           │                                 │
│                    pnpm Workspace                           │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Python** >= 3.8
- **pip** (Python package manager)
- **Git**

### Installing Prerequisites

**Node.js and pnpm:**

```bash
# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install pnpm
npm install -g pnpm
```

**Python:**

```bash
# macOS
brew install python@3.11

# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ichhadhari-dairy-management
```

### 2. Run the Setup Script

The automated setup script will:

- Install all frontend dependencies
- Create Python virtual environment
- Install backend dependencies
- Create environment files

```bash
bash scripts/setup.sh
```

### 3. Move Your Existing Next.js App

```bash
# Move your existing Next.js project to apps/frontend
# Make sure to move all files including:
# - src/
# - public/
# - package.json
# - next.config.ts
# - tsconfig.json
# - etc.
```

### 4. Set Up Django Backend

```bash
cd apps/backend

# Activate virtual environment
source venv/bin/activate

# Create Django project (if not already created)
django-admin startproject dairy_management .

# Create initial migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

cd ../..
```

### 5. Start Development Servers

```bash
# Option 1: Start both servers with the dev script
bash scripts/dev.sh

# Option 2: Start servers individually
pnpm dev:frontend    # Frontend on http://localhost:3000
pnpm dev:backend     # Backend on http://localhost:8000

# Option 3: Use the workspace script
pnpm dev:all
```

## 📁 Project Structure

```
ichhadhari-dairy-management/
├── apps/
│   ├── frontend/              # Next.js Frontend Application
│   │   ├── src/
│   │   │   ├── app/          # Next.js 14 App Router
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities and API clients
│   │   │   ├── store/        # State management
│   │   │   └── types/        # TypeScript type definitions
│   │   ├── public/           # Static assets
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── backend/              # Django Backend Application
│       ├── dairy_management/ # Django project settings
│       ├── apps/             # Django apps (vendors, milk, production, etc.)
│       ├── api/              # REST API endpoints
│       ├── manage.py
│       ├── requirements.txt
│       └── venv/             # Python virtual environment
│
├── packages/
│   └── shared/               # Shared TypeScript Package
│       ├── src/
│       │   ├── types/        # Shared TypeScript types
│       │   │   └── index.ts  # Type definitions (User, Vendor, Product, etc.)
│       │   └── index.ts      # Package entry point
│       ├── package.json
│       └── tsconfig.json
│
├── docker/                   # Docker Configuration
│   ├── docker-compose.yml
│   ├── frontend.Dockerfile
│   └── backend.Dockerfile
│
├── scripts/                  # Utility Scripts
│   ├── setup.sh             # Initial setup script
│   └── dev.sh               # Development server script
│
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── package.json             # Root package.json with workspace scripts
├── .gitignore               # Git ignore patterns
└── README.md                # This file
```

## 💻 Development

### Frontend Development

The frontend is built with Next.js 14 and uses the App Router:

```bash
cd apps/frontend

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Type checking
pnpm type-check
```

**Key Technologies:**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios
- **Forms**: React Hook Form
- **Date Handling**: date-fns

### Backend Development

The backend is built with Django:

```bash
cd apps/backend

# Activate virtual environment
source venv/bin/activate

# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create Django app
python manage.py startapp <app_name>

# Run tests
python manage.py test

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell
```

**Key Technologies:**

- **Framework**: Django 5.0
- **API**: Django REST Framework
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **CORS**: django-cors-headers
- **Environment**: python-decouple

### Using Shared Types

The shared package contains TypeScript types that can be used in both frontend and backend (for type definitions):

```typescript
// In your frontend code
import { User, Vendor, MilkIntake, ProductionBatch } from "@ichhadhari/shared";

// Use the types
const vendor: Vendor = {
  id: "1",
  name: "ABC Dairy Farm",
  code: "VEN001",
  // ... other properties
};

// API response types
const response: ApiResponse<User> = await api.login(credentials);
```

**Available Types:**

- Base types: `BaseEntity`, `PaginatedResponse`, `ApiResponse`
- Auth: `User`, `UserRole`, `AuthTokens`, `LoginCredentials`
- Vendor: `Vendor`, `VendorStatus`
- Milk: `MilkIntake`, `MilkShift`, `MilkQuality`
- Production: `ProductionBatch`, `Product`, `ProductCategory`, `BatchStatus`
- Inventory: `InventoryItem`, `InventoryStatus`
- Employee: `Employee`, `Department`, `EmployeeStatus`
- Analytics: `DashboardStats`, `MilkIntakeReport`, `ProductionReport`

## 📜 Scripts

### Root Level Scripts

Run these from the project root:

| Script                  | Description                                   |
| ----------------------- | --------------------------------------------- |
| `pnpm install:all`      | Install all dependencies (frontend + backend) |
| `pnpm dev:frontend`     | Start Next.js development server              |
| `pnpm dev:backend`      | Start Django development server               |
| `pnpm dev:all`          | Start both servers concurrently               |
| `pnpm build:frontend`   | Build frontend for production                 |
| `pnpm build:all`        | Build all apps                                |
| `pnpm test:frontend`    | Run frontend tests                            |
| `pnpm test:backend`     | Run backend tests                             |
| `pnpm test:all`         | Run all tests                                 |
| `pnpm lint:all`         | Lint all code                                 |
| `pnpm type-check`       | Type check TypeScript code                    |
| `pnpm clean`            | Clean all build artifacts and node_modules    |
| `pnpm clean:backend`    | Clean Python cache files                      |
| `bash scripts/setup.sh` | Run initial setup                             |
| `bash scripts/dev.sh`   | Start development servers with logging        |

### Package-Specific Scripts

```bash
# Frontend only
pnpm --filter @ichhadhari/frontend <script>

# Shared package only
pnpm --filter @ichhadhari/shared <script>
```

## 📦 Shared Package

The `@ichhadhari/shared` package contains:

1. **TypeScript Types**: All shared type definitions
2. **Constants**: API configuration, date formats, pagination defaults
3. **Utilities**: (can be added as needed)

### Adding New Shared Types

1. Edit `packages/shared/src/types/index.ts`
2. Add your new types/interfaces
3. Export them at the bottom
4. The types are automatically available in the frontend

### Type Safety Between Frontend and Backend

While the backend is Python and doesn't use TypeScript directly, the shared types serve as:

1. **API Contract Documentation**: Clear definition of data structures
2. **Frontend Type Safety**: Full TypeScript support in Next.js
3. **API Client Types**: Type-safe API calls from frontend to backend
4. **Validation Reference**: What the backend should validate and return

## 🐳 Docker Support

Docker configuration files are provided for containerized deployment:

```bash
# Build containers
pnpm docker:build

# Start containers
pnpm docker:up

# Stop containers
pnpm docker:down
```

_(Docker configuration files need to be created based on your specific requirements)_

## 🔧 Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Ichhadhari Dairy Management
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Backend (.env)

```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing

### Frontend Tests

```bash
cd apps/frontend
pnpm test
```

### Backend Tests

```bash
cd apps/backend
source venv/bin/activate
python manage.py test
```

### All Tests

```bash
pnpm test:all
```

## 🚢 Deployment

### Frontend Deployment (Vercel)

```bash
cd apps/frontend
pnpm build
# Deploy to Vercel or your hosting platform
```

### Backend Deployment

```bash
cd apps/backend
# Set up production environment variables
# Configure PostgreSQL database
# Set DEBUG=False
# Collect static files
python manage.py collectstatic --noinput
# Run with gunicorn or uWSGI
gunicorn dairy_management.wsgi:application
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Best Practices

### Code Organization

- Keep components small and focused
- Use TypeScript strictly (no `any` types)
- Follow Django best practices for backend
- Write tests for critical functionality
- Document complex logic

### Git Workflow

- Use conventional commits
- Keep commits atomic and focused
- Write descriptive commit messages
- Review your own PR before requesting review

### Type Safety

- Always use shared types from `@ichhadhari/shared`
- Don't duplicate type definitions
- Update shared types when API changes
- Run type-check before committing

## 🐛 Troubleshooting

### pnpm installation fails

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Python dependencies fail

```bash
# Make sure virtual environment is activated
source apps/backend/venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Port already in use

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Ichhadhari Development Team

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using Next.js, Django, and pnpm workspaces**
