# API Quick Reference

Quick reference for all API endpoints and common patterns.

## Import Statement

```typescript
import {
  authAPI,
  milkAPI,
  productionAPI,
  inventoryAPI,
  vendorsAPI,
  employeesAPI,
  dashboardAPI,
  getAPIErrorMessage,
} from "@/lib/api";
```

## Authentication

```typescript
// Register
await authAPI.register({
  username,
  email,
  password,
  password2,
  first_name,
  last_name,
});

// Login
const { user, tokens } = await authAPI.login("username", "password");

// Get current user
const user = await authAPI.getMe();

// Update profile
await authAPI.updateMe({ first_name, last_name, email });

// Change password
await authAPI.changePassword("oldPassword", "newPassword");

// Logout
await authAPI.logout(refreshToken);
```

## Milk Management

```typescript
// Suppliers
const suppliers = await milkAPI.getSuppliers({ page: 1, status: 'active' });
const supplier = await milkAPI.getSupplier(id);
await milkAPI.createSupplier({ name, code, ... });
await milkAPI.updateSupplier(id, { name, ... });
await milkAPI.deleteSupplier(id);
const stats = await milkAPI.getSupplierStats(id, { start_date, end_date });

// Collections
const collections = await milkAPI.getCollections({ page: 1 });
const collection = await milkAPI.getCollection(id);
await milkAPI.createCollection({ supplier, collection_date, shift, quantity, ... });
await milkAPI.updateCollection(id, { quantity, ... });
await milkAPI.deleteCollection(id);
const stats = await milkAPI.getCollectionStats({ start_date, end_date });

// Payments
const payments = await milkAPI.getPayments({ page: 1 });
await milkAPI.createPayment({ supplier, payment_date, amount, payment_method });
```

## Production

```typescript
// Products
const products = await productionAPI.getProducts({ page: 1 });
const product = await productionAPI.getProduct(id);
await productionAPI.createProduct({ name, code, category, unit, shelf_life_days });
await productionAPI.updateProduct(id, { name, ... });
await productionAPI.deleteProduct(id);
const stats = await productionAPI.getProductStats(id);

// Batches
const batches = await productionAPI.getBatches({ status: 'in_progress' });
const batch = await productionAPI.getBatch(id);
await productionAPI.createBatch({ product, planned_quantity, supervisor });
await productionAPI.startBatch(id);
await productionAPI.completeBatch(id, actual_quantity);
const stats = await productionAPI.getBatchStats({ start_date, end_date });

// Schedules
const schedules = await productionAPI.getSchedules({ page: 1 });
await productionAPI.createSchedule({ product, scheduled_date, shift, quantity });
```

## Inventory

```typescript
// Items
const items = await inventoryAPI.getItems({ category: "raw_material" });
const item = await inventoryAPI.getItem(id);
await inventoryAPI.createItem({
  name,
  code,
  category,
  unit,
  min_stock_level,
  max_stock_level,
});
const lowStock = await inventoryAPI.getLowStock();
const history = await inventoryAPI.getTransactionHistory(id);

// Transactions
const transactions = await inventoryAPI.getTransactions({ page: 1 });
await inventoryAPI.createTransaction({
  item,
  transaction_type,
  quantity,
  unit_price,
});
const stats = await inventoryAPI.getStats({ start_date, end_date });

// Alerts
const alerts = await inventoryAPI.getAlerts({ status: "active" });
await inventoryAPI.acknowledge(alertId);
await inventoryAPI.resolve(alertId);

// Raw Materials & Finished Goods
const rawMaterials = await inventoryAPI.getRawMaterials();
const finishedGoods = await inventoryAPI.getFinishedGoods();
```

## Vendors

```typescript
// Vendors
const vendors = await vendorsAPI.getVendors({ vendor_type: 'supplier' });
const vendor = await vendorsAPI.getVendor(id);
await vendorsAPI.createVendor({ name, code, vendor_type, email, phone_number });
const stats = await vendorsAPI.getVendorStats(id);

// Purchase Orders
const pos = await vendorsAPI.getPurchaseOrders({ status: 'approved' });
const po = await vendorsAPI.getPurchaseOrder(id);
await vendorsAPI.createPurchaseOrder({ vendor, order_date, items: [...] });
await vendorsAPI.approvePurchaseOrder(id);
await vendorsAPI.sendPurchaseOrder(id);
const items = await vendorsAPI.getPurchaseOrderItems(id);

// Payments
const payments = await vendorsAPI.getPayments({ page: 1 });
await vendorsAPI.createPayment({ vendor, payment_date, amount, payment_method });

// GRNs
const grns = await vendorsAPI.getGRNs({ page: 1 });
await vendorsAPI.createGRN({ purchase_order, receipt_date, items: [...] });
```

## Employees

```typescript
// Employees
const employees = await employeesAPI.getEmployees({ status: 'active' });
const employee = await employeesAPI.getEmployee(id);
await employeesAPI.createEmployee({ employee_code, first_name, last_name, department, ... });
const attendanceSummary = await employeesAPI.getAttendanceSummary(id);
const performance = await employeesAPI.getPerformanceHistory(id);
const salary = await employeesAPI.getSalaryDetails(id);

// Departments
const departments = await employeesAPI.getDepartments();
await employeesAPI.createDepartment({ name, code, manager });

// Attendance
const attendance = await employeesAPI.getAttendance({ date: '2025-10-22' });
await employeesAPI.createAttendance({ employee, date, status, check_in_time });
await employeesAPI.markBulkAttendance({ date, attendances: [...] });

// Leave Requests
const leaves = await employeesAPI.getLeaveRequests({ status: 'pending' });
await employeesAPI.createLeaveRequest({ leave_type, start_date, end_date, reason });
await employeesAPI.approveLeaveRequest(id);
await employeesAPI.rejectLeaveRequest(id, 'reason');

// Leave Types
const leaveTypes = await employeesAPI.getLeaveTypes();

// Performance Reviews
const reviews = await employeesAPI.getPerformanceReviews({ employee: id });
await employeesAPI.createPerformanceReview({ employee, review_period_start, review_period_end, rating });

// Salary Structures
const salaryStructures = await employeesAPI.getSalaryStructures({ employee: id });
await employeesAPI.createSalaryStructure({ employee, basic_salary, hra, ... });

// Payroll
const payroll = await employeesAPI.getPayroll({ month: 'October', year: 2025 });
await employeesAPI.createPayroll({ employee, month, year, working_days, present_days });
await employeesAPI.approvePayroll(id);
```

## Dashboard

```typescript
// Stats
const stats = await dashboardAPI.getStats({ start_date, end_date });
const quickStats = await dashboardAPI.getQuickStats();
const alertsSummary = await dashboardAPI.getAlertsSummary();

// Activity
const activity = await dashboardAPI.getRecentActivity({ limit: 10 });

// Charts
const milkChart = await dashboardAPI.getMilkCollectionChart({
  start_date,
  end_date,
});
const productionChart = await dashboardAPI.getProductionChart();
const inventoryChart = await dashboardAPI.getInventoryChart();
const attendanceChart = await dashboardAPI.getAttendanceChart();
const financialChart = await dashboardAPI.getFinancialChart();
```

## Common Patterns

### Basic Fetch

```typescript
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await milkAPI.getSuppliers({ page: 1 });
    setData(response.results);
  } catch (error) {
    toast.error(getAPIErrorMessage(error));
  } finally {
    setLoading(false);
  }
};
```

### Create

```typescript
const handleCreate = async (formData) => {
  setLoading(true);
  try {
    await milkAPI.createSupplier(formData);
    toast.success("Created successfully");
    router.push("/suppliers");
  } catch (error) {
    toast.error(getAPIErrorMessage(error));
  } finally {
    setLoading(false);
  }
};
```

### Update

```typescript
const handleUpdate = async (id, formData) => {
  setLoading(true);
  try {
    await milkAPI.updateSupplier(id, formData);
    toast.success("Updated successfully");
    router.push("/suppliers");
  } catch (error) {
    toast.error(getAPIErrorMessage(error));
  } finally {
    setLoading(false);
  }
};
```

### Delete

```typescript
const handleDelete = async (id) => {
  if (!confirm("Are you sure?")) return;

  setLoading(true);
  try {
    await milkAPI.deleteSupplier(id);
    toast.success("Deleted successfully");
    router.push("/suppliers");
  } catch (error) {
    toast.error(getAPIErrorMessage(error));
  } finally {
    setLoading(false);
  }
};
```

### Pagination

```typescript
const [page, setPage] = useState(1);
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    const response = await milkAPI.getSuppliers({ page, page_size: 10 });
    setData(response);
  };
  fetchData();
}, [page]);

return (
  <Pagination
    currentPage={page}
    totalPages={Math.ceil((data?.count || 0) / 10)}
    onPageChange={setPage}
  />
);
```

### Search

```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  const fetchData = async () => {
    const response = await milkAPI.getSuppliers({ search: debouncedSearch });
    setData(response.results);
  };
  if (debouncedSearch) fetchData();
}, [debouncedSearch]);
```

### Filter

```typescript
const [filters, setFilters] = useState({
  status: "active",
  vendor_type: "supplier",
});

useEffect(() => {
  const fetchData = async () => {
    const response = await vendorsAPI.getVendors(filters);
    setData(response.results);
  };
  fetchData();
}, [filters]);
```

## TypeScript Types

```typescript
import type {
  // Common
  PaginationParams,
  PaginatedResponse,

  // Auth
  User,
  LoginCredentials,
  AuthTokens,

  // Milk
  Supplier,
  MilkCollection,
  Payment,

  // Production
  Product,
  ProductionBatch,
  ProductionSchedule,

  // Inventory
  InventoryItem,
  InventoryTransaction,
  InventoryAlert,

  // Vendors
  Vendor,
  PurchaseOrder,
  VendorPayment,
  GoodsReceiptNote,

  // Employees
  Employee,
  Department,
  Attendance,
  LeaveRequest,
  Payroll,

  // Dashboard
  DashboardStats,
  ChartDataPoint,
} from "@/lib/api";
```

## HTTP Methods

| Method | Usage          | Example                            |
| ------ | -------------- | ---------------------------------- |
| GET    | Fetch data     | `milkAPI.getSuppliers()`           |
| POST   | Create new     | `milkAPI.createSupplier(data)`     |
| PATCH  | Partial update | `milkAPI.updateSupplier(id, data)` |
| PUT    | Full update    | Not commonly used                  |
| DELETE | Remove         | `milkAPI.deleteSupplier(id)`       |

## Status Codes

| Code | Meaning      | Action                      |
| ---- | ------------ | --------------------------- |
| 200  | OK           | Success                     |
| 201  | Created      | Resource created            |
| 204  | No Content   | Delete success              |
| 400  | Bad Request  | Validation error            |
| 401  | Unauthorized | Auto-refresh token or login |
| 403  | Forbidden    | No permission               |
| 404  | Not Found    | Resource not found          |
| 500  | Server Error | Backend error               |

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

## Debugging

```typescript
// Check if logged in
console.log(localStorage.getItem("access_token"));

// Log API errors
try {
  await milkAPI.getSuppliers();
} catch (error) {
  console.error("API Error:", error);
  console.error("Response:", error.response?.data);
}
```

## Best Practices

1. ✅ Always use try-catch for API calls
2. ✅ Show loading states during API calls
3. ✅ Display user-friendly error messages
4. ✅ Import TypeScript types for type safety
5. ✅ Use pagination for large lists
6. ✅ Debounce search inputs
7. ✅ Handle 401 errors (auto-handled by client)
8. ✅ Validate forms before API submission
9. ✅ Show success feedback after mutations
10. ✅ Refresh data after create/update/delete

## Resources

- [Full API Documentation](./README.md)
- [API Structure](./API_STRUCTURE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
