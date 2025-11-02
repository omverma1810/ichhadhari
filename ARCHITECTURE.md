# Monorepo Architecture Diagram

## 📊 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ICHHADHARI DAIRY MANAGEMENT                         │
│                           MONOREPO                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         ┌──────────▼─────────┐        ┌───────────▼──────────┐
         │    APPS            │        │    PACKAGES          │
         │                    │        │                      │
         │  ┌──────────────┐  │        │  ┌────────────────┐ │
         │  │   FRONTEND   │  │        │  │     SHARED     │ │
         │  │   Next.js    │  │◄───────┼──┤  TS Types      │ │
         │  │  TypeScript  │  │        │  │  & Utils       │ │
         │  └──────────────┘  │        │  └────────────────┘ │
         │                    │        │                      │
         │  ┌──────────────┐  │        └──────────────────────┘
         │  │   BACKEND    │  │
         │  │   Django     │  │◄───────────── Uses types as
         │  │   Python     │  │               API contract
         │  └──────────────┘  │
         │                    │
         └────────────────────┘
```

## 🔄 Data Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │         │   Next.js   │         │   Django    │
│  (Client)   │◄───────►│  Frontend   │◄───────►│   Backend   │
│             │  HTTP   │  Port 3000  │   API   │  Port 8000  │
└─────────────┘         └─────────────┘         └─────────────┘
                               │                       │
                               │                       │
                               ▼                       ▼
                        ┌─────────────┐        ┌─────────────┐
                        │   Shared    │        │  PostgreSQL │
                        │   Types     │        │  Database   │
                        └─────────────┘        └─────────────┘
```

## 📁 Detailed Structure

```
ichhadhari-dairy-management/
│
├── apps/                              # Applications
│   ├── frontend/                      # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # Next.js 14 App Router
│   │   │   │   ├── (auth)/          # Auth pages group
│   │   │   │   ├── (dashboard)/     # Dashboard pages group
│   │   │   │   ├── layout.tsx       # Root layout
│   │   │   │   └── page.tsx         # Home page
│   │   │   │
│   │   │   ├── components/          # React Components
│   │   │   │   ├── cards/
│   │   │   │   ├── common/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── forms/
│   │   │   │   ├── icons/
│   │   │   │   ├── layout/
│   │   │   │   ├── tables/
│   │   │   │   └── ui/              # shadcn/ui components
│   │   │   │
│   │   │   ├── lib/                 # Utilities & API
│   │   │   │   ├── api/             # API client functions
│   │   │   │   ├── hooks/           # Custom React hooks
│   │   │   │   └── utils/           # Helper functions
│   │   │   │
│   │   │   ├── store/               # State Management
│   │   │   │   └── authStore.ts
│   │   │   │
│   │   │   └── types/               # Frontend-specific types
│   │   │
│   │   ├── public/                  # Static assets
│   │   ├── package.json             # Frontend dependencies
│   │   ├── next.config.ts           # Next.js config
│   │   ├── tsconfig.json            # TypeScript config
│   │   └── .env.local               # Environment variables
│   │
│   └── backend/                      # Django Backend
│       ├── dairy_management/         # Django project
│       │   ├── settings.py          # Django settings
│       │   ├── urls.py              # URL routing
│       │   └── wsgi.py              # WSGI config
│       │
│       ├── apps/                    # Django apps
│       │   ├── vendors/             # Vendor management
│       │   │   ├── models.py
│       │   │   ├── views.py
│       │   │   └── admin.py
│       │   ├── milk/                # Milk intake
│       │   ├── production/          # Production batches
│       │   ├── inventory/           # Inventory tracking
│       │   ├── employees/           # Employee management
│       │   └── analytics/           # Reports & analytics
│       │
│       ├── api/                     # REST API
│       │   ├── v1/                  # API version 1
│       │   │   ├── vendors/
│       │   │   ├── milk/
│       │   │   └── ...
│       │   └── serializers/         # DRF serializers
│       │
│       ├── manage.py                # Django CLI
│       ├── requirements.txt         # Python dependencies
│       ├── venv/                    # Virtual environment
│       └── .env                     # Environment variables
│
├── packages/                         # Shared Packages
│   └── shared/                      # Shared TypeScript package
│       ├── src/
│       │   ├── types/               # Type definitions
│       │   │   └── index.ts        # All shared types
│       │   └── index.ts            # Package entry
│       ├── package.json             # Package config
│       └── tsconfig.json            # TypeScript config
│
├── docker/                           # Docker Configuration
│   ├── docker-compose.yml           # Multi-container setup
│   ├── frontend.Dockerfile          # Frontend container
│   └── backend.Dockerfile           # Backend container
│
├── scripts/                          # Utility Scripts
│   ├── setup.sh                     # Initial setup
│   └── dev.sh                       # Development server
│
├── Configuration Files
│   ├── pnpm-workspace.yaml          # Workspace definition
│   ├── package.json                 # Root package
│   ├── .gitignore                   # Git ignore patterns
│   └── .env.example                 # Environment template
│
└── Documentation
    ├── README.md                    # Main documentation
    ├── MIGRATION_GUIDE.md           # Frontend migration
    ├── DJANGO_SETUP_GUIDE.md        # Backend setup
    ├── SETUP_COMPLETE.md            # Quick start guide
    └── ARCHITECTURE.md              # This file
```

## 🔄 Development Workflow

```
1. Developer makes changes
   ↓
2. Frontend (TypeScript)
   │
   ├─→ Uses @ichhadhari/shared types
   ├─→ Type-safe API calls
   └─→ Components use shared types
   ↓
3. Backend (Python/Django)
   │
   ├─→ Implements API matching shared types
   ├─→ Validates data according to types
   └─→ Returns data matching type contracts
   ↓
4. Everything is type-safe!
```

## 🔌 API Communication Flow

```
Frontend Component
      │
      ├─ import { Vendor } from '@ichhadhari/shared'
      │
      ▼
API Client Function
      │
      ├─ Makes HTTP request to Django
      │
      ▼
Django REST API
      │
      ├─ Validates request
      ├─ Processes data
      ├─ Returns JSON response
      │
      ▼
Frontend receives typed response
      │
      └─ Type-safe data usage
```

## 🛠️ Technology Stack Breakdown

### Frontend Stack

```
┌──────────────────────────────────────┐
│          PRESENTATION LAYER          │
│  ┌────────────────────────────────┐  │
│  │     React Components           │  │
│  │     (TypeScript + Tailwind)    │  │
│  └────────────────────────────────┘  │
│                 │                     │
│  ┌─────────────▼──────────────────┐  │
│  │     State Management           │  │
│  │     (Zustand Stores)           │  │
│  └────────────────────────────────┘  │
│                 │                     │
│  ┌─────────────▼──────────────────┐  │
│  │     API Client Layer           │  │
│  │     (Axios + Shared Types)     │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Backend Stack

```
┌──────────────────────────────────────┐
│           API LAYER                  │
│  ┌────────────────────────────────┐  │
│  │     Django REST Framework      │  │
│  │     (ViewSets + Serializers)   │  │
│  └────────────────────────────────┘  │
│                 │                     │
│  ┌─────────────▼──────────────────┐  │
│  │     Business Logic Layer       │  │
│  │     (Django Models + Services) │  │
│  └────────────────────────────────┘  │
│                 │                     │
│  ┌─────────────▼──────────────────┐  │
│  │     Database Layer             │  │
│  │     (PostgreSQL + ORM)         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
1. User Login
   │
   ├─→ POST /api/auth/login
   │   Body: { email, password }
   ↓
2. Django authenticates
   │
   ├─→ Returns JWT tokens
   │   { accessToken, refreshToken }
   ↓
3. Frontend stores tokens
   │
   ├─→ In auth store (Zustand)
   ├─→ In localStorage
   ↓
4. Subsequent requests
   │
   ├─→ Include Authorization header
   │   Bearer <accessToken>
   ↓
5. Django validates token
   │
   └─→ Returns protected data
```

## 📦 Package Dependencies

```
Root (package.json)
├── pnpm workspace manager
└── concurrently (run multiple servers)

Frontend (@ichhadhari/frontend)
├── next
├── react
├── typescript
├── @ichhadhari/shared  ←─┐
├── tailwindcss             │
└── zustand                 │
                           │
Shared (@ichhadhari/shared)│
├── typescript             │
└── type definitions       ─┘

Backend (requirements.txt)
├── Django
├── djangorestframework
├── djangorestframework-simplejwt
├── django-cors-headers
└── psycopg2-binary
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   PRODUCTION                        │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │         Nginx Reverse Proxy                │   │
│  │         (Port 80/443)                      │   │
│  └────────┬───────────────────────┬───────────┘   │
│           │                       │                │
│  ┌────────▼────────┐    ┌────────▼────────┐      │
│  │   Next.js       │    │   Django        │      │
│  │   Frontend      │    │   Backend       │      │
│  │   (Port 3000)   │    │   (Port 8000)   │      │
│  └─────────────────┘    └────────┬────────┘      │
│                                   │                │
│                         ┌─────────▼─────────┐     │
│                         │   PostgreSQL      │     │
│                         │   Database        │     │
│                         └───────────────────┘     │
└─────────────────────────────────────────────────────┘
```

## 🎯 Benefits of This Architecture

1. **Type Safety**: Shared types ensure consistency
2. **Code Reuse**: Common types in one place
3. **Scalability**: Easy to add new apps/packages
4. **Maintainability**: Clear separation of concerns
5. **Developer Experience**: Fast development with hot reload
6. **Production Ready**: Docker support for deployment

---

This architecture provides a solid foundation for building and scaling the Ichhadhari Dairy Management System.
