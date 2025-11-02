/**
 * MSW (Mock Service Worker) Handlers for API Testing
 * Mock handlers for all API endpoints
 */

import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:8000/api/v1";

// ============ MOCK DATA ============

const mockDashboardStats = {
  total_milk_collected: 1050.5,
  total_milk_collected_trend: 15.5,
  total_vendors: 45,
  total_vendors_trend: 5.2,
  total_production: 850.0,
  total_production_trend: -3.5,
  total_inventory_value: 125000.0,
  total_inventory_value_trend: 8.7,
  active_employees: 12,
  pending_payments: 8,
  low_stock_items: 3,
  quality_issues: 2,
};

const mockDashboardActivities = [
  {
    id: "MC202510210001",
    type: "Milk Collection",
    status: "success" as const,
    title: "Milk collected from John Farmer",
    description: "15.5L of cow milk collected",
    user: "Admin User",
    timestamp: "2025-10-21T06:30:00Z",
  },
  {
    id: "QC202510210002",
    type: "Quality Control",
    status: "warning" as const,
    title: "Quality alert for Batch #2025-10-20",
    description: "SNF levels slightly below threshold",
    user: "Quality Supervisor",
    timestamp: "2025-10-21T05:45:00Z",
  },
  {
    id: "PR202510210003",
    type: "Production",
    status: "info" as const,
    title: "Production batch completed",
    description: "Paneer batch #P-204 finalized",
    user: "Production Manager",
    timestamp: "2025-10-21T04:20:00Z",
  },
];

const mockMilkCollectionChart = [
  {
    date: "2025-10-01",
    cow_milk: 450.5,
    buffalo_milk: 320,
    total: 770.5,
  },
  {
    date: "2025-10-02",
    cow_milk: 475,
    buffalo_milk: 305,
    total: 780,
  },
  {
    date: "2025-10-03",
    cow_milk: 460,
    buffalo_milk: 315,
    total: 775,
  },
  {
    date: "2025-10-04",
    cow_milk: 490,
    buffalo_milk: 330,
    total: 820,
  },
  {
    date: "2025-10-05",
    cow_milk: 505,
    buffalo_milk: 325,
    total: 830,
  },
  {
    date: "2025-10-06",
    cow_milk: 495,
    buffalo_milk: 310,
    total: 805,
  },
  {
    date: "2025-10-07",
    cow_milk: 510,
    buffalo_milk: 335,
    total: 845,
  },
];

const mockProductionChart = [
  {
    month: "Jan",
    milk: 12000,
    curd: 3200,
    paneer: 1500,
    ghee: 780,
    butter: 640,
  },
  {
    month: "Feb",
    milk: 11850,
    curd: 3050,
    paneer: 1480,
    ghee: 760,
    butter: 610,
  },
  {
    month: "Mar",
    milk: 12200,
    curd: 3150,
    paneer: 1550,
    ghee: 820,
    butter: 660,
  },
  {
    month: "Apr",
    milk: 11900,
    curd: 2980,
    paneer: 1495,
    ghee: 750,
    butter: 605,
  },
  {
    month: "May",
    milk: 12100,
    curd: 3100,
    paneer: 1530,
    ghee: 795,
    butter: 645,
  },
  {
    month: "Jun",
    milk: 11780,
    curd: 2950,
    paneer: 1465,
    ghee: 730,
    butter: 600,
  },
  {
    month: "Jul",
    milk: 12350,
    curd: 3250,
    paneer: 1570,
    ghee: 840,
    butter: 670,
  },
  {
    month: "Aug",
    milk: 12420,
    curd: 3300,
    paneer: 1585,
    ghee: 850,
    butter: 680,
  },
  {
    month: "Sep",
    milk: 12500,
    curd: 3340,
    paneer: 1600,
    ghee: 865,
    butter: 690,
  },
  {
    month: "Oct",
    milk: 12650,
    curd: 3400,
    paneer: 1620,
    ghee: 880,
    butter: 700,
  },
  {
    month: "Nov",
    milk: 12480,
    curd: 3280,
    paneer: 1595,
    ghee: 845,
    butter: 675,
  },
  {
    month: "Dec",
    milk: 12250,
    curd: 3180,
    paneer: 1540,
    ghee: 810,
    butter: 650,
  },
];

const mockDashboardAlerts = [
  {
    id: "stock-1",
    type: "warning" as const,
    message: "Low stock alert: Whole Milk Powder is below reorder level",
    timestamp: "2025-10-21T10:00:00Z",
  },
  {
    id: "quality-1",
    type: "error" as const,
    message: "Quality issue detected in Batch #P-204",
    timestamp: "2025-10-21T09:15:00Z",
  },
  {
    id: "payment-1",
    type: "info" as const,
    message: "Payment reminder: Supplier payouts due tomorrow",
    timestamp: "2025-10-21T08:00:00Z",
  },
];

const mockSuppliers = {
  count: 150,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      supplier_id: "SUP001",
      name: "Ramesh Kumar",
      supplier_type: "farmer" as const,
      status: "active" as const,
      phone: "+91-9876543210",
      email: "ramesh@example.com",
      address: "123 Village Road",
      route_name: "Route A",
      collection_time: "06:00",
      payment_cycle: "weekly" as const,
      avg_quality_score: 92.5,
      total_collections: 250,
      total_quantity: 12500,
      outstanding_balance: 5000,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    },
  ],
};

const mockCollections = {
  count: 500,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      collection_id: "COL001",
      supplier: { id: 1, supplier_id: "SUP001", name: "Ramesh Kumar" },
      collection_date: "2024-01-15",
      shift: "morning" as const,
      milk_type: "cow" as const,
      quantity: 50,
      fat_percentage: 4.5,
      snf_percentage: 8.5,
      temperature: 4,
      quality_status: "excellent" as const,
      quality_score: 95,
      rate_per_liter: 40,
      total_amount: 2000,
      created_at: "2024-01-15T06:00:00Z",
      updated_at: "2024-01-15T06:00:00Z",
    },
  ],
};

// ============ HANDLERS ============

export const handlers = [
  // Dashboard
  http.get(`${API_BASE_URL}/dashboard/stats/`, () => {
    return HttpResponse.json(mockDashboardStats);
  }),

  http.get(`${API_BASE_URL}/dashboard/activities/`, () => {
    return HttpResponse.json(mockDashboardActivities);
  }),

  http.get(`${API_BASE_URL}/dashboard/milk-collection-chart/`, () => {
    return HttpResponse.json(mockMilkCollectionChart);
  }),

  http.get(`${API_BASE_URL}/dashboard/production-chart/`, () => {
    return HttpResponse.json(mockProductionChart);
  }),

  http.get(`${API_BASE_URL}/dashboard/alerts/`, () => {
    return HttpResponse.json(mockDashboardAlerts);
  }),

  // Suppliers
  http.get(`${API_BASE_URL}/milk/suppliers/`, () => {
    return HttpResponse.json(mockSuppliers);
  }),

  http.get(`${API_BASE_URL}/milk/suppliers/:id/`, ({ params }) => {
    return HttpResponse.json(mockSuppliers.results[0]);
  }),

  http.post(`${API_BASE_URL}/milk/suppliers/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...body, id: 999 }, { status: 201 });
  }),

  http.patch(
    `${API_BASE_URL}/milk/suppliers/:id/`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ ...mockSuppliers.results[0], ...body });
    }
  ),

  http.delete(`${API_BASE_URL}/milk/suppliers/:id/`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Collections
  http.get(`${API_BASE_URL}/milk/collections/`, () => {
    return HttpResponse.json(mockCollections);
  }),

  http.get(`${API_BASE_URL}/milk/collections/:id/`, () => {
    return HttpResponse.json(mockCollections.results[0]);
  }),

  http.post(`${API_BASE_URL}/milk/collections/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { ...body, id: 999, collection_id: "COL999" },
      { status: 201 }
    );
  }),

  // Payments
  http.get(`${API_BASE_URL}/milk/payments/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  http.post(`${API_BASE_URL}/milk/payments/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { ...body, id: 999, payment_id: "PAY999" },
      { status: 201 }
    );
  }),

  // Products
  http.get(`${API_BASE_URL}/production/products/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  // Production Batches
  http.get(`${API_BASE_URL}/production/batches/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  // Quality Control
  http.get(`${API_BASE_URL}/production/quality-control/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  // Inventory Items
  http.get(`${API_BASE_URL}/inventory/items/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  // Stock Transactions
  http.get(`${API_BASE_URL}/inventory/transactions/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  // Stock Alerts
  http.get(`${API_BASE_URL}/inventory/alerts/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  // Vendors
  http.get(`${API_BASE_URL}/vendors/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),

  // Employees
  http.get(`${API_BASE_URL}/employees/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  }),
];

export default handlers;
