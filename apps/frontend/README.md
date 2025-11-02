# 🥛 Dairy Management System Frontend

A comprehensive dairy operations management platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📦 Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Create a `.env.local` file (copy from `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Dairy Management System
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Implemented Features

### Phase 1

- Authentication flows (login, forgot password, token persistence)
- Protected routes and middleware
- Dairy-themed design system with Tailwind + shadcn/ui
- React Query + Zustand integrations
- API client with Axios interceptors
- Toast notifications and loading states

### Phase 2

- Responsive dashboard layout with fixed sidebar and top header
- Breadcrumb navigation with automatic title formatting
- Mobile navigation drawer with role-based filtering
- Dashboard overview page featuring KPI cards, recent activity, and quick actions
- Placeholder pages scaffolding for all navigation destinations
- Expanded README with setup details and implemented feature tracking
- Custom dairy-themed SVG icon set integrated into auth experiences
- Premium animation utilities with micro-interactions for auth, navigation, and analytics cards

### Phase 3: Milk Management Module

- **Milk Intake System**: Record milk collection with validation, fat percentage categorization, and quality tracking
- **Auto-Categorization**: Automatic classification (Premium 8-9%, Standard 4-5%, Other) based on fat content
- **Segregation Dashboard**: Visual analytics with pie charts and 7-day trend analysis using Recharts
- **Data Management**: Paginated data tables with search, filtering, and export capabilities
- **Real-time Stats**: Live segregation statistics with category breakdowns and batch tracking
- **Form Validation**: Comprehensive input validation with React Hook Form + Zod schemas
- **Premium Animations**: Framer Motion page transitions, hover effects, and loading states
- **Mock Data Layer**: Testing infrastructure with realistic sample data for development

## 🎨 Features Implemented (Phase 4)

### ✅ Production Management Module

- Product management with recipe builder
- Multi-step recipe creation with drag-and-drop
- Production batch creation and tracking
- Worker assignment system
- Real-time batch progress monitoring
- Kanban board for production tracking
- Milk requirement calculator
- Yield tracking
- Priority-based scheduling
- Status-based filtering (Not Started, In Progress, On Hold, Completed)

### ✅ Custom Components

- Product cards with detailed stats
- Batch cards with progress indicators
- Dynamic recipe step builder
- Worker selection interface
- Milk calculation preview
- Animated Kanban columns
- Status badges with icons

### ✅ Custom Icons

- Factory icon
- Recipe book icon
- Batch icon
- Timer icon
- All with animations

### ✅ Advanced Features

- Multi-step form validation
- Dynamic form fields (add/remove steps)
- Real-time stock availability checks
- Worker availability tracking
- Automated milk allocation
- Production statistics dashboard
- Tab-based filtering
- Search and filter capabilities

### ✅ PHASE 4 CHECKLIST

- All custom production icons created
- Production types defined
- API service implemented with mock data
- React Query hooks working
- Product form with step builder functional
- Batch form with milk calculator working
- Product card displays correctly
- Batch card shows progress bar
- Products page renders product grid
- Batches page with tabs working
- Kanban board displays columns
- All CRUD operations functional
- Worker selection working
- Priority selection working
- Status badges with correct colors
- Progress bars animate correctly
- All modals open/close smoothly
- Toast notifications appear
- All animations smooth (60fps)
- Responsive on mobile/tablet/desktop
- No TypeScript errors
- No console errors

### 🎨 Visual Checklist

- Factory icons animate (rotate/scale)
- Product cards have gradient backgrounds
- Batch cards show progress bars
- Kanban columns have colored headers
- Step builder has drag handles
- Milk calculator shows in blue gradient box
- Worker checkboxes styled correctly
- Priority radio buttons highlighted on selection
- Status badges have icons
- All hover effects working
- Card shadows and elevation correct
- Tabs have count badges
- Loading spinners display
- Empty states show icons
- Form validations show errors
- Success toasts appear green
- Modal animations smooth

### 🚀 Testing Instructions

**Test Product Creation**

- Go to Production > Products
- Click "Add New Product"
- Fill in basic information
- Add multiple production steps
- Try removing a step
- Try reordering steps (drag)
- Submit form
- Verify product appears in grid

**Test Batch Creation**

- Click "Create Batch" on a product card
- Select product
- Enter quantity
- Verify milk calculation appears
- Select workers
- Set start date
- Choose priority
- Submit form
- Verify batch appears in list

**Test Batch Tracking**

- Go to Production > Batches
- Verify tabs show correct counts
- Click through different tabs
- Verify batches filter correctly
- Click on a batch card
- Verify progress percentage displays

**Test Kanban Board**

- Go to Production > Tracking
- Verify 4 columns display
- Verify batches sorted by status
- Verify count badges on columns
- Test drag-and-drop (if implemented)

**Test Responsive Design**

- Test on mobile (375px)
- Test on tablet (768px)
- Test on desktop (1440px)
- Verify product grid adjusts
- Verify batch grid adjusts
- Verify forms are usable
- Verify Kanban on mobile

### 📝 Notes for Developer

- Remove mock data imports from `production.ts` when backend is ready
- Update API endpoints to point to real backend
- Handle real-time updates with WebSockets if needed
- Implement drag-and-drop for Kanban board
- Add batch details modal with step-by-step tracking
- Implement step parameter recording
- Add worker performance tracking
- Implement yield variance reporting

**Future Enhancements**

- Drag-and-drop step reordering in recipe builder
- Drag-and-drop batches in Kanban board
- Real-time batch status updates via WebSockets
- Batch details modal with step tracking
- Step parameter recording (temperature, pH, etc.)
- Photo upload for quality checks
- Worker performance analytics
- Production efficiency reports
- Cost analysis per batch
- Waste tracking per batch
- Equipment maintenance tracking

🎉 **Phase 4 Complete!**

You now have a fully functional Production Management Module with:

- ✅ Product Management – Create products with multi-step recipes
- ✅ Batch Management – Create and track production batches
- ✅ Worker Assignment – Assign workers to batches
- ✅ Progress Tracking – Visual progress bars and percentages
- ✅ Kanban Board – Real-time production workflow view
- ✅ Statistics Dashboard – Production KPIs and metrics
- ✅ Custom Icons – Factory, Recipe, Batch, Timer with animations
- ✅ Premium Animations – Smooth transitions and micro-interactions
- ✅ Responsive Design – Works on all devices
- ✅ Mock Data – Ready for testing

### Phase 5: Inventory Management Module

- **Stock Intelligence**: Animated overview page with inventory KPIs, expiry alerts, tabbed data tables, and CSV export
- **Cold Storage Monitoring**: Zone cards highlighting live temperature, capacity, humidity, and alert statuses
- **Domain Typings**: Strongly-typed inventory entities covering locations, stock items, movements, adjustments, transfers, and alerts
- **Mock API Service**: In-memory API with pagination, mutations, and derived analytics for rapid prototyping
- **React Query Hooks**: Query and mutation hooks with toast feedback for stock, transfers, adjustments, cold storage, and alerts
- **Custom Icons**: Warehouse, Thermometer, Box Stack, Alert, Transfer, and Cold Storage illustrations for the module

### ✅ PHASE 5 CHECKLIST

- Inventory icon set created and exported
- Inventory domain types defined in `src/types/inventory.ts`
- Mock data and API service implemented under `src/lib/api`
- React Query hooks added in `src/lib/hooks/useInventory.ts`
- Stock dashboard at `src/app/(dashboard)/inventory/stock/page.tsx` implemented
- Cold storage management page at `src/app/(dashboard)/inventory/cold-storage/page.tsx` implemented
- Export handling and toast alerts wired into UI flows
- Animations applied to dashboard metrics and cold storage zones
- Responsive layouts confirmed across breakpoints
- No TypeScript or console errors during local development

### 🚀 Testing Instructions (Inventory Module)

- Navigate to Inventory > Stock to verify KPI cards, expiry alert banner, and tab filtering
- Toggle between All/Low Stock/Expiring tabs and confirm table filters adjust
- Use the Export button to trigger CSV download feedback
- Navigate to Inventory > Cold Storage to review zone cards, capacity bars, and temperature indicators
- Confirm alerts display with severity coloring and hover animation effects
- Resize browser to tablet and mobile widths to ensure responsive stacking and padding

### 📝 Notes for Developer (Inventory Module)

- Replace mock inventory API with real endpoints when backend is available
- Wire mutations (adjustments, transfers) to backend once API contract is finalized
- Add historical trend charts for inventory turnover and temperature deviations
- Introduce alert acknowledgement workflow and audit trail logging

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Dashboard routes
│   ├── layout.tsx          # Root layout
│   └── providers.tsx       # Global providers
├── components/             # React components
│   ├── dashboard/          # Dashboard-specific UI
│   ├── layout/             # Layout primitives
│   ├── ui/                 # shadcn/ui exports
│   └── common/             # Shared components
├── lib/                    # Utilities and configurations
│   ├── api/                # API client and services
│   ├── hooks/              # Custom hooks
│   └── utils/              # Helpers (navigation, formatting, etc.)
├── store/                  # Zustand stores
├── types/                  # TypeScript definitions
└── middleware.ts           # Route protection
```

## 🔐 Demo Accounts

- **Admin**: `admin@dairy.com` / `Admin@123`
- **Manager**: `manager@dairy.com` / `Manager@123`

## 📝 Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
- `npm run type-check` – Type-check the project

## 📚 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Deployment Guidance](https://nextjs.org/docs/app/building-your-application/deploying)

## 🤝 Contributing

This is a private project. For access or contributions, contact the project maintainer.

## 📄 License

Proprietary — All rights reserved.
