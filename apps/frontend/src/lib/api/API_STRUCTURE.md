# API Integration Layer - Visual Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   React Components                            │  │
│  │  (Pages, Forms, Tables, Dashboards, etc.)                    │  │
│  └────────────────────┬─────────────────────────────────────────┘  │
│                       │ Import API                                  │
│                       ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   lib/api/index.ts                            │  │
│  │  Export { authAPI, milkAPI, productionAPI, ... }             │  │
│  └────────────────────┬─────────────────────────────────────────┘  │
│                       │ Uses                                         │
│                       ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   lib/api/client.ts                           │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ APIClient Class                                         │  │  │
│  │  │ - axios instance with base URL                         │  │  │
│  │  │ - Request Interceptor: Attach JWT token               │  │  │
│  │  │ - Response Interceptor: Auto-refresh on 401           │  │  │
│  │  │ - Methods: get, post, patch, put, delete              │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └────────────────────┬─────────────────────────────────────────┘  │
│                       │ HTTP Requests                                │
└───────────────────────┼──────────────────────────────────────────────┘
                        │
                        │ JWT Bearer Token
                        │ Authorization: Bearer <access_token>
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Django REST API                                 │
│                   http://localhost:8000/api/v1/                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /auth/                                                       │  │
│  │  ├─ POST /register/         - Register new user             │  │
│  │  ├─ POST /login/            - Login & get tokens            │  │
│  │  ├─ POST /logout/           - Blacklist refresh token       │  │
│  │  ├─ POST /token/refresh/    - Refresh access token          │  │
│  │  ├─ GET  /me/               - Get current user              │  │
│  │  ├─ PATCH /me/              - Update profile                │  │
│  │  └─ POST /change-password/  - Change password               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /milk/                                                       │  │
│  │  ├─ /suppliers/             - Supplier CRUD + stats         │  │
│  │  ├─ /collections/           - Milk collection CRUD          │  │
│  │  └─ /payments/              - Payment CRUD                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /production/                                                 │  │
│  │  ├─ /products/              - Product CRUD + batches        │  │
│  │  ├─ /batches/               - Batch CRUD + start/complete   │  │
│  │  └─ /schedules/             - Production schedule CRUD      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /inventory/                                                  │  │
│  │  ├─ /items/                 - Inventory item CRUD           │  │
│  │  ├─ /transactions/          - Transaction CRUD + stats      │  │
│  │  ├─ /alerts/                - Alert CRUD + actions          │  │
│  │  ├─ /raw-materials/         - Raw materials list            │  │
│  │  └─ /finished-goods/        - Finished goods list           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /vendors/                                                    │  │
│  │  ├─ /vendors/               - Vendor CRUD + stats           │  │
│  │  ├─ /purchase-orders/       - PO CRUD + workflow            │  │
│  │  ├─ /payments/              - Vendor payment CRUD           │  │
│  │  └─ /grns/                  - GRN CRUD + items              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /employees/                                                  │  │
│  │  ├─ /employees/             - Employee CRUD + details       │  │
│  │  ├─ /departments/           - Department CRUD                │  │
│  │  ├─ /attendance/            - Attendance CRUD + bulk        │  │
│  │  ├─ /leave-requests/        - Leave request CRUD + approve  │  │
│  │  ├─ /leave-types/           - Leave type CRUD               │  │
│  │  ├─ /performance-reviews/   - Review CRUD                   │  │
│  │  ├─ /salary-structures/     - Salary structure CRUD         │  │
│  │  └─ /payroll/               - Payroll CRUD + approve        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /dashboard/                                                  │  │
│  │  ├─ /stats/                 - Dashboard statistics          │  │
│  │  ├─ /recent-activity/       - Recent activities             │  │
│  │  ├─ /charts/                - Chart data                    │  │
│  │  ├─ /alerts-summary/        - Alert counts                  │  │
│  │  └─ /quick-stats/           - Quick stats widgets           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Token Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        Token Lifecycle                              │
└────────────────────────────────────────────────────────────────────┘

1. LOGIN
   ┌──────────┐                           ┌──────────┐
   │  Client  │─── POST /auth/login/ ────>│  Server  │
   │          │<─── { access, refresh } ───│          │
   └──────────┘                           └──────────┘
        │
        │ Store in localStorage:
        │ - access_token
        │ - refresh_token
        ▼

2. AUTHENTICATED REQUEST
   ┌──────────┐                           ┌──────────┐
   │  Client  │─── GET /milk/suppliers/ ─>│  Server  │
   │          │    Header: Authorization  │          │
   │          │    Bearer <access_token>  │          │
   │          │<─── { results: [...] } ───│          │
   └──────────┘                           └──────────┘

3. TOKEN EXPIRED (401)
   ┌──────────┐                           ┌──────────┐
   │  Client  │─── GET /milk/suppliers/ ─>│  Server  │
   │          │<─── 401 Unauthorized ──────│          │
   └──────────┘                           └──────────┘
        │
        │ Interceptor detects 401
        │ Queues original request
        ▼
   ┌──────────┐                           ┌──────────┐
   │  Client  │─ POST /auth/token/refresh/ │  Server  │
   │          │   { refresh: <token> }    │          │
   │          │<─── { access: <new> } ─────│          │
   └──────────┘                           └──────────┘
        │
        │ Update access_token
        │ Retry queued requests
        ▼
   ┌──────────┐                           ┌──────────┐
   │  Client  │─ GET /milk/suppliers/ ───>│  Server  │
   │          │   New access token        │          │
   │          │<─── { results: [...] } ───│          │
   └──────────┘                           └──────────┘

4. REFRESH FAILED
   ┌──────────┐                           ┌──────────┐
   │  Client  │─ POST /auth/token/refresh/ │  Server  │
   │          │<─── 401 Unauthorized ──────│          │
   └──────────┘                           └──────────┘
        │
        │ Clear all tokens
        │ Redirect to /auth/login
        ▼
   ┌──────────┐
   │  Login   │
   │   Page   │
   └──────────┘
```

## Data Flow Example: Create Milk Collection

```
┌────────────────────────────────────────────────────────────────────┐
│              Create Milk Collection Flow                            │
└────────────────────────────────────────────────────────────────────┘

1. USER INTERACTION
   ┌──────────────────┐
   │  Collection Form │
   │  - Supplier      │
   │  - Date          │
   │  - Shift         │
   │  - Quantity      │
   │  - Fat %         │
   │  - SNF %         │
   └────────┬─────────┘
            │ User clicks "Submit"
            ▼

2. COMPONENT LOGIC
   ┌──────────────────────────────────────┐
   │  const handleSubmit = async () => {  │
   │    setLoading(true);                 │
   │    try {                             │
   │      const data = {                  │
   │        supplier: selectedSupplier,   │
   │        collection_date: date,        │
   │        shift: 'morning',             │
   │        quantity: 100,                │
   │        fat_percentage: 6.5,          │
   │        snf_percentage: 8.5,          │
   │        temperature: 4                │
   │      };                              │
   │                                      │
   │      const result =                  │
   │        await milkAPI.createCollection(data);
   │                                      │
   │      toast.success('Created!');      │
   │      router.push('/collections');    │
   │    } catch (error) {                 │
   │      toast.error(getAPIErrorMessage(error));
   │    } finally {                       │
   │      setLoading(false);              │
   │    }                                 │
   │  };                                  │
   └────────┬─────────────────────────────┘
            │ API call
            ▼

3. API LAYER
   ┌──────────────────────────────────────┐
   │  milkAPI.createCollection(data)      │
   │    ↓                                 │
   │  apiClient.post(                     │
   │    '/milk/collections/',             │
   │    data                              │
   │  )                                   │
   └────────┬─────────────────────────────┘
            │ HTTP Request
            ▼

4. REQUEST INTERCEPTOR
   ┌──────────────────────────────────────┐
   │  - Attach Authorization header       │
   │  - Log request in dev mode           │
   └────────┬─────────────────────────────┘
            │
            ▼

5. DJANGO API
   ┌──────────────────────────────────────┐
   │  POST /api/v1/milk/collections/      │
   │  - Validate data                     │
   │  - Calculate rate                    │
   │  - Save to database                  │
   │  - Return created object             │
   └────────┬─────────────────────────────┘
            │ Response
            ▼

6. RESPONSE INTERCEPTOR
   ┌──────────────────────────────────────┐
   │  - Log response in dev mode          │
   │  - Handle errors if any              │
   └────────┬─────────────────────────────┘
            │
            ▼

7. COMPONENT UPDATE
   ┌──────────────────────────────────────┐
   │  - Show success toast                │
   │  - Navigate to list page             │
   │  - Update local state                │
   └──────────────────────────────────────┘
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    API Module Dependencies                   │
└─────────────────────────────────────────────────────────────┘

                        index.ts
                           │
                           │ Exports all
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
     auth.ts          milk.ts          production.ts
        │                  │                  │
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           │ All depend on
                           │
                        client.ts
                           │
                           │ Uses
                           │
                        axios
                           │
                           │ Makes HTTP calls to
                           │
                  Django REST Framework

┌─────────────────────────────────────────────────────────────┐
│                   Type Dependencies                          │
└─────────────────────────────────────────────────────────────┘

All API modules export their own types, which can be imported:

import type {
  Supplier,           // from milk.ts
  Product,            // from production.ts
  Employee,           // from employees.ts
  PaginatedResponse   // from milk.ts (shared)
} from '@/lib/api';
```

## Environment Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                Environment Variables                         │
└─────────────────────────────────────────────────────────────┘

Development (.env.local)
├─ NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
├─ NODE_ENV=development
└─ NEXT_PUBLIC_APP_NAME=Ichhadhari Dairy Management

Production (.env.production)
├─ NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
├─ NODE_ENV=production
└─ NEXT_PUBLIC_APP_NAME=Ichhadhari Dairy Management

Staging (.env.staging)
├─ NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com/api/v1
├─ NODE_ENV=production
└─ NEXT_PUBLIC_APP_NAME=Ichhadhari Dairy Management (Staging)
```
