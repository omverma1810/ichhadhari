# API Integration Layer

Complete API integration layer for connecting the Next.js frontend with the Django REST Framework backend.

## Overview

This API layer provides a fully typed, production-ready interface for all backend operations with features including:

- ✅ Automatic JWT token management
- ✅ Token refresh on 401 errors
- ✅ Request/response interceptors
- ✅ TypeScript type safety
- ✅ Error handling and logging
- ✅ Pagination support
- ✅ Filtering and search capabilities

## Architecture

```
lib/api/
├── client.ts         # APIClient class with axios configuration
├── auth.ts           # Authentication endpoints
├── milk.ts           # Milk management (suppliers, collections, payments)
├── production.ts     # Production management (products, batches, schedules)
├── inventory.ts      # Inventory management (items, transactions, alerts)
├── vendors.ts        # Vendor management (vendors, POs, payments, GRNs)
├── employees.ts      # Employee management (employees, attendance, payroll)
├── dashboard.ts      # Dashboard statistics and analytics
└── index.ts          # Central export point
```

## Configuration

Set the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Usage Examples

### Authentication

```typescript
import { authAPI } from "@/lib/api";

// Register new user
const registerResponse = await authAPI.register({
  username: "john_doe",
  email: "john@example.com",
  password: "securePassword123",
  password2: "securePassword123",
  first_name: "John",
  last_name: "Doe",
});

// Login
const loginResponse = await authAPI.login("john_doe", "securePassword123");
// Tokens are automatically stored in localStorage

// Get current user
const user = await authAPI.getMe();

// Update profile
const updatedUser = await authAPI.updateMe({
  first_name: "Johnny",
  phone_number: "+1234567890",
});

// Change password
await authAPI.changePassword("oldPassword", "newPassword");

// Logout
await authAPI.logout(refreshToken);
```

### Milk Management

```typescript
import { milkAPI } from "@/lib/api";

// Get suppliers with pagination and filters
const suppliers = await milkAPI.getSuppliers({
  page: 1,
  page_size: 10,
  search: "Farm",
  status: "active",
});

// Create new supplier
const newSupplier = await milkAPI.createSupplier({
  name: "Green Valley Farms",
  code: "GVF001",
  contact_person: "John Smith",
  phone_number: "+1234567890",
  status: "active",
});

// Get supplier collections
const collections = await milkAPI.getSupplierCollections(supplierId, {
  page: 1,
  page_size: 20,
});

// Create milk collection
const collection = await milkAPI.createCollection({
  supplier: supplierId,
  collection_date: "2025-10-22",
  shift: "morning",
  quantity: 100,
  fat_percentage: 6.5,
  snf_percentage: 8.5,
  temperature: 4,
  rate_per_liter: 45,
});

// Get collection statistics
const stats = await milkAPI.getCollectionStats({
  start_date: "2025-10-01",
  end_date: "2025-10-31",
  supplier: supplierId,
});

// Create payment
const payment = await milkAPI.createPayment({
  supplier: supplierId,
  payment_date: "2025-10-22",
  amount: 45000,
  payment_method: "bank_transfer",
  reference_number: "TXN123456",
});
```

### Production Management

```typescript
import { productionAPI } from "@/lib/api";

// Get products
const products = await productionAPI.getProducts({
  page: 1,
  search: "milk",
  is_active: true,
});

// Create product
const product = await productionAPI.createProduct({
  name: "Full Cream Milk",
  code: "FCM001",
  category: "Dairy",
  unit: "Liters",
  shelf_life_days: 7,
  storage_temperature: 4,
});

// Get production batches
const batches = await productionAPI.getBatches({
  status: "in_progress",
  ordering: "-created_at",
});

// Create batch
const batch = await productionAPI.createBatch({
  product: productId,
  planned_quantity: 1000,
  start_date: "2025-10-23",
  supervisor: userId,
});

// Start batch
await productionAPI.startBatch(batchId);

// Complete batch
await productionAPI.completeBatch(batchId, 980); // actual quantity

// Get batch statistics
const batchStats = await productionAPI.getBatchStats({
  start_date: "2025-10-01",
  end_date: "2025-10-31",
  product: productId,
});
```

### Inventory Management

```typescript
import { inventoryAPI } from "@/lib/api";

// Get inventory items
const items = await inventoryAPI.getItems({
  category: "raw_material",
  is_active: true,
});

// Get low stock items
const lowStock = await inventoryAPI.getLowStock();

// Create inventory item
const item = await inventoryAPI.createItem({
  name: "Milk Powder",
  code: "MP001",
  category: "raw_material",
  unit: "Kg",
  min_stock_level: 100,
  max_stock_level: 1000,
  reorder_point: 200,
});

// Create transaction
const transaction = await inventoryAPI.createTransaction({
  item: itemId,
  transaction_type: "in",
  quantity: 500,
  unit_price: 450,
  notes: "Stock received from vendor",
});

// Get transaction history
const history = await inventoryAPI.getTransactionHistory(itemId, {
  page: 1,
});

// Get alerts
const alerts = await inventoryAPI.getAlerts({
  status: "active",
  severity: "high",
});

// Acknowledge alert
await inventoryAPI.acknowledge(alertId);

// Resolve alert
await inventoryAPI.resolve(alertId);
```

### Vendor Management

```typescript
import { vendorsAPI } from "@/lib/api";

// Get vendors
const vendors = await vendorsAPI.getVendors({
  vendor_type: "supplier",
  status: "active",
});

// Create vendor
const vendor = await vendorsAPI.createVendor({
  name: "ABC Suppliers",
  code: "ABC001",
  vendor_type: "supplier",
  email: "contact@abc.com",
  phone_number: "+1234567890",
  payment_terms: "Net 30",
});

// Create purchase order
const po = await vendorsAPI.createPurchaseOrder({
  vendor: vendorId,
  order_date: "2025-10-22",
  expected_delivery_date: "2025-10-30",
  items: [
    {
      item: itemId,
      quantity: 100,
      unit: "Kg",
      unit_price: 450,
    },
  ],
  payment_terms: "Net 30",
});

// Approve purchase order
await vendorsAPI.approvePurchaseOrder(poId);

// Send to vendor
await vendorsAPI.sendPurchaseOrder(poId);

// Create GRN (Goods Receipt Note)
const grn = await vendorsAPI.createGRN({
  purchase_order: poId,
  receipt_date: "2025-10-30",
  items: [
    {
      po_item: poItemId,
      received_quantity: 95,
      status: "partial",
      notes: "5 units damaged",
    },
  ],
});

// Create vendor payment
const payment = await vendorsAPI.createPayment({
  vendor: vendorId,
  purchase_order: poId,
  payment_date: "2025-10-31",
  amount: 42750,
  payment_method: "bank_transfer",
  reference_number: "REF123",
});
```

### Employee Management

```typescript
import { employeesAPI } from "@/lib/api";

// Get employees
const employees = await employeesAPI.getEmployees({
  status: "active",
  department: departmentId,
});

// Create employee
const employee = await employeesAPI.createEmployee({
  employee_code: "EMP001",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@company.com",
  phone_number: "+1234567890",
  department: departmentId,
  designation: "Manager",
  date_of_joining: "2025-01-01",
  employment_type: "full_time",
});

// Get attendance summary
const attendanceSummary = await employeesAPI.getAttendanceSummary(employeeId, {
  start_date: "2025-10-01",
  end_date: "2025-10-31",
});

// Mark attendance
const attendance = await employeesAPI.createAttendance({
  employee: employeeId,
  date: "2025-10-22",
  status: "present",
  check_in_time: "09:00:00",
  check_out_time: "18:00:00",
});

// Mark bulk attendance
const bulkAttendance = await employeesAPI.markBulkAttendance({
  date: "2025-10-22",
  attendances: [
    { employee: 1, status: "present", check_in_time: "09:00:00" },
    { employee: 2, status: "present", check_in_time: "09:15:00" },
    { employee: 3, status: "absent" },
  ],
});

// Create leave request
const leaveRequest = await employeesAPI.createLeaveRequest({
  leave_type: leaveTypeId,
  start_date: "2025-11-01",
  end_date: "2025-11-05",
  reason: "Vacation",
});

// Approve leave request
await employeesAPI.approveLeaveRequest(leaveRequestId);

// Create payroll
const payroll = await employeesAPI.createPayroll({
  employee: employeeId,
  month: "October",
  year: 2025,
  working_days: 26,
  present_days: 24,
});

// Approve payroll
await employeesAPI.approvePayroll(payrollId);
```

### Dashboard & Analytics

```typescript
import { dashboardAPI } from "@/lib/api";

// Get dashboard statistics
const stats = await dashboardAPI.getStats({
  start_date: "2025-10-01",
  end_date: "2025-10-31",
});

// Get recent activity
const activity = await dashboardAPI.getRecentActivity({
  limit: 10,
  type: "milk_collection",
});

// Get milk collection chart
const milkChart = await dashboardAPI.getMilkCollectionChart({
  start_date: "2025-10-01",
  end_date: "2025-10-31",
});

// Get production chart
const productionChart = await dashboardAPI.getProductionChart();

// Get inventory chart
const inventoryChart = await dashboardAPI.getInventoryChart();

// Get attendance chart
const attendanceChart = await dashboardAPI.getAttendanceChart();

// Get financial chart
const financialChart = await dashboardAPI.getFinancialChart();

// Get quick stats
const quickStats = await dashboardAPI.getQuickStats();

// Get alerts summary
const alertsSummary = await dashboardAPI.getAlertsSummary();
```

## Error Handling

All API calls throw errors that can be caught and handled:

```typescript
import { getAPIErrorMessage } from "@/lib/api";

try {
  const suppliers = await milkAPI.getSuppliers();
} catch (error) {
  const errorMessage = getAPIErrorMessage(error);
  console.error("Failed to fetch suppliers:", errorMessage);
  // Show error to user
  toast.error(errorMessage);
}
```

## Token Management

The API client automatically handles JWT tokens:

1. **Request Interceptor**: Attaches access token to all requests
2. **Response Interceptor**: Detects 401 errors and attempts token refresh
3. **Token Refresh**: Automatically refreshes expired tokens using refresh token
4. **Logout on Failure**: Clears tokens and redirects to login if refresh fails

Tokens are stored in localStorage:

- `access_token`: JWT access token
- `refresh_token`: JWT refresh token

## Pagination

All list endpoints support pagination:

```typescript
interface PaginationParams {
  page?: number; // Page number (default: 1)
  page_size?: number; // Items per page (default: varies by endpoint)
  search?: string; // Search query
  ordering?: string; // Sort field (prefix with '-' for descending)
  [key: string]: any; // Additional filters
}

interface PaginatedResponse<T> {
  count: number; // Total number of items
  next: string | null; // Next page URL
  previous: string | null; // Previous page URL
  results: T[]; // Array of items
}
```

## Development

### Logging

In development mode, all API requests and responses are logged to the console:

```
[API Request] GET /milk/suppliers/
[API Response] GET /milk/suppliers/ { status: 200, data: {...} }
```

### Error Responses

API errors follow this structure:

```typescript
{
  detail?: string;        // Error detail message
  message?: string;       // Error message
  error?: string;         // Error description
  [key: string]: any;     // Field-specific errors
}
```

## Best Practices

1. **Use TypeScript types**: Import and use the exported types for type safety
2. **Handle errors**: Always wrap API calls in try-catch blocks
3. **Show loading states**: Use loading indicators while API calls are in progress
4. **Debounce search**: Debounce search input to avoid excessive API calls
5. **Cache when appropriate**: Consider using React Query or SWR for data fetching
6. **Validate before submit**: Validate forms before making API calls

## Testing

Example test using Jest:

```typescript
import { milkAPI } from '@/lib/api';

jest.mock('@/lib/api/client');

describe('Milk API', () => {
  it('should fetch suppliers', async () => {
    const mockSuppliers = { count: 10, results: [...] };
    (apiClient.get as jest.Mock).mockResolvedValue(mockSuppliers);

    const result = await milkAPI.getSuppliers({ page: 1 });

    expect(result).toEqual(mockSuppliers);
    expect(apiClient.get).toHaveBeenCalledWith('/milk/suppliers/', {
      params: { page: 1 }
    });
  });
});
```

## Contributing

When adding new endpoints:

1. Add types to the appropriate API file
2. Add the API method with proper JSDoc comments
3. Export types from `index.ts`
4. Update this README with usage examples
5. Add tests for new endpoints

## Support

For issues or questions:

- Check the Django backend API documentation
- Review the TypeScript types for expected data structures
- Check browser console for API request/response logs
