# 🚨 COMPLETE API INTEGRATION FIX - PART 2

## Continuation from PART 1...

### PART 6: INVENTORY SERVICE (COMPLETE CRUD)

**File:** `apps/frontend/src/services/inventoryService.ts`

```typescript
import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, InventoryItem, StockTransaction } from '@/types/api';

export const inventoryService = {
  // ==================== INVENTORY ITEMS ====================
  
  /**
   * Get all inventory items
   */
  getItems: async (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    low_stock?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<InventoryItem>> => {
    try {
      return await apiClient.get<PaginatedResponse<InventoryItem>>(
        '/api/inventory/items/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single item
   */
  getItem: async (id: number): Promise<InventoryItem> => {
    try {
      return await apiClient.get<InventoryItem>(`/api/inventory/items/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create inventory item
   */
  createItem: async (data: {
    name: string;
    category: string;
    unit: string;
    current_stock: string | number;
    minimum_stock: string | number;
    reorder_level: string | number;
    unit_cost: string | number;
    location?: string;
  }): Promise<InventoryItem> => {
    try {
      const formattedData = {
        name: data.name,
        category: data.category,
        unit: data.unit,
        current_stock: String(data.current_stock),
        minimum_stock: String(data.minimum_stock),
        maximum_stock: String(parseFloat(String(data.minimum_stock)) * 3),
        reorder_level: String(data.reorder_level),
        unit_cost: String(data.unit_cost),
        location: data.location || '',
        is_active: true,
      };

      console.log('📤 Creating inventory item:', formattedData);
      const response = await apiClient.post<InventoryItem>('/api/inventory/items/', formattedData);
      console.log('✅ Inventory item created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create inventory item:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update inventory item
   */
  updateItem: async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
      const formattedData: any = {};
      if (data.name !== undefined) formattedData.name = data.name;
      if (data.category !== undefined) formattedData.category = data.category;
      if (data.current_stock !== undefined) formattedData.current_stock = String(data.current_stock);
      if (data.minimum_stock !== undefined) formattedData.minimum_stock = String(data.minimum_stock);
      if (data.unit_cost !== undefined) formattedData.unit_cost = String(data.unit_cost);
      if (data.location !== undefined) formattedData.location = data.location;
      if (data.is_active !== undefined) formattedData.is_active = data.is_active;

      console.log('📤 Updating inventory item:', formattedData);
      const response = await apiClient.put<InventoryItem>(`/api/inventory/items/${id}/`, formattedData);
      console.log('✅ Inventory item updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update inventory item:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete inventory item
   */
  deleteItem: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting inventory item:', id);
      await apiClient.delete(`/api/inventory/items/${id}/`);
      console.log('✅ Inventory item deleted');
    } catch (error) {
      console.error('❌ Failed to delete inventory item:', error);
      throw new Error(handleApiError(error));
    }
  },

  // ==================== TRANSACTIONS ====================

  /**
   * Get stock transactions
   */
  getTransactions: async (params?: {
    page?: number;
    page_size?: number;
    item?: number;
    transaction_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<StockTransaction>> => {
    try {
      return await apiClient.get<PaginatedResponse<StockTransaction>>(
        '/api/inventory/transactions/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create stock transaction
   */
  createTransaction: async (data: {
    item: number;
    transaction_type: 'purchase' | 'production' | 'sale' | 'adjustment' | 'transfer';
    quantity: string | number;
    unit_price: string | number;
    transaction_date: string;
    reference_number?: string;
    notes?: string;
  }): Promise<StockTransaction> => {
    try {
      const formattedData = {
        item: data.item,
        transaction_type: data.transaction_type,
        quantity: String(data.quantity),
        unit_price: String(data.unit_price),
        total_amount: String(parseFloat(String(data.quantity)) * parseFloat(String(data.unit_price))),
        transaction_date: data.transaction_date,
        reference_number: data.reference_number || '',
        notes: data.notes || '',
      };

      console.log('📤 Creating stock transaction:', formattedData);
      const response = await apiClient.post<StockTransaction>('/api/inventory/transactions/', formattedData);
      console.log('✅ Stock transaction created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create stock transaction:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get stock alerts (low stock items)
   */
  getStockAlerts: async (): Promise<InventoryItem[]> => {
    try {
      return await apiClient.get<InventoryItem[]>('/api/inventory/stock-alerts/');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
```

---

### PART 7: VENDOR SERVICE (COMPLETE CRUD)

**File:** `apps/frontend/src/services/vendorService.ts`

```typescript
import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, Vendor } from '@/types/api';

export const vendorService = {
  /**
   * Get all vendors
   */
  getVendors: async (params?: {
    page?: number;
    page_size?: number;
    vendor_type?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Vendor>> => {
    try {
      return await apiClient.get<PaginatedResponse<Vendor>>(
        '/api/vendors/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single vendor
   */
  getVendor: async (id: number): Promise<Vendor> => {
    try {
      return await apiClient.get<Vendor>(`/api/vendors/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create vendor
   */
  createVendor: async (data: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gst_number?: string;
    pan_number?: string;
    vendor_type: 'supplier' | 'service_provider' | 'both';
    payment_terms?: string;
    credit_limit?: string | number;
  }): Promise<Vendor> => {
    try {
      const formattedData = {
        name: data.name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        gst_number: data.gst_number || '',
        pan_number: data.pan_number || '',
        vendor_type: data.vendor_type,
        payment_terms: data.payment_terms || '30',
        credit_limit: data.credit_limit ? String(data.credit_limit) : '0.00',
        current_balance: '0.00',
        status: 'active',
        rating: 5,
        is_active: true,
      };

      console.log('📤 Creating vendor:', formattedData);
      const response = await apiClient.post<Vendor>('/api/vendors/', formattedData);
      console.log('✅ Vendor created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create vendor:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update vendor
   */
  updateVendor: async (id: number, data: Partial<Vendor>): Promise<Vendor> => {
    try {
      const formattedData: any = {};
      if (data.name !== undefined) formattedData.name = data.name;
      if (data.contact_person !== undefined) formattedData.contact_person = data.contact_person;
      if (data.email !== undefined) formattedData.email = data.email;
      if (data.phone !== undefined) formattedData.phone = data.phone;
      if (data.address !== undefined) formattedData.address = data.address;
      if (data.city !== undefined) formattedData.city = data.city;
      if (data.state !== undefined) formattedData.state = data.state;
      if (data.pincode !== undefined) formattedData.pincode = data.pincode;
      if (data.vendor_type !== undefined) formattedData.vendor_type = data.vendor_type;
      if (data.status !== undefined) formattedData.status = data.status;
      if (data.is_active !== undefined) formattedData.is_active = data.is_active;

      console.log('📤 Updating vendor:', formattedData);
      const response = await apiClient.put<Vendor>(`/api/vendors/${id}/`, formattedData);
      console.log('✅ Vendor updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update vendor:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete vendor
   */
  deleteVendor: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting vendor:', id);
      await apiClient.delete(`/api/vendors/${id}/`);
      console.log('✅ Vendor deleted');
    } catch (error) {
      console.error('❌ Failed to delete vendor:', error);
      throw new Error(handleApiError(error));
    }
  },
};
```

---

### PART 8: EMPLOYEE SERVICE (COMPLETE CRUD)

**File:** `apps/frontend/src/services/employeeService.ts`

```typescript
import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, Employee, Attendance } from '@/types/api';

export const employeeService = {
  /**
   * Get all employees
   */
  getEmployees: async (params?: {
    page?: number;
    page_size?: number;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Employee>> => {
    try {
      return await apiClient.get<PaginatedResponse<Employee>>(
        '/api/employees/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single employee
   */
  getEmployee: async (id: number): Promise<Employee> => {
    try {
      return await apiClient.get<Employee>(`/api/employees/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create employee
   */
  createEmployee: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    address: string;
    city: string;
    state: string;
    pincode: string;
    department: string;
    designation: string;
    date_of_joining: string;
    employment_type: 'permanent' | 'contract' | 'temporary';
    salary: string | number;
    bank_account_number?: string;
    bank_ifsc_code?: string;
  }): Promise<Employee> => {
    try {
      const formattedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        department: data.department,
        designation: data.designation,
        date_of_joining: data.date_of_joining,
        employment_type: data.employment_type,
        salary: String(data.salary),
        bank_account_number: data.bank_account_number || '',
        bank_ifsc_code: data.bank_ifsc_code || '',
        status: 'active',
        is_active: true,
      };

      console.log('📤 Creating employee:', formattedData);
      const response = await apiClient.post<Employee>('/api/employees/', formattedData);
      console.log('✅ Employee created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create employee:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update employee
   */
  updateEmployee: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    try {
      const formattedData: any = {};
      if (data.first_name !== undefined) formattedData.first_name = data.first_name;
      if (data.last_name !== undefined) formattedData.last_name = data.last_name;
      if (data.email !== undefined) formattedData.email = data.email;
      if (data.phone !== undefined) formattedData.phone = data.phone;
      if (data.department !== undefined) formattedData.department = data.department;
      if (data.designation !== undefined) formattedData.designation = data.designation;
      if (data.salary !== undefined) formattedData.salary = String(data.salary);
      if (data.status !== undefined) formattedData.status = data.status;
      if (data.is_active !== undefined) formattedData.is_active = data.is_active;

      console.log('📤 Updating employee:', formattedData);
      const response = await apiClient.put<Employee>(`/api/employees/${id}/`, formattedData);
      console.log('✅ Employee updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update employee:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete employee
   */
  deleteEmployee: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting employee:', id);
      await apiClient.delete(`/api/employees/${id}/`);
      console.log('✅ Employee deleted');
    } catch (error) {
      console.error('❌ Failed to delete employee:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get attendance records
   */
  getAttendance: async (params?: {
    page?: number;
    page_size?: number;
    employee?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Attendance>> => {
    try {
      return await apiClient.get<PaginatedResponse<Attendance>>(
        '/api/employees/attendance/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark attendance
   */
  markAttendance: async (data: {
    employee: number;
    date: string;
    check_in_time: string;
    check_out_time?: string;
    status: 'present' | 'absent' | 'half_day' | 'leave';
    notes?: string;
  }): Promise<Attendance> => {
    try {
      console.log('📤 Marking attendance:', data);
      const response = await apiClient.post<Attendance>('/api/employees/attendance/', data);
      console.log('✅ Attendance marked:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to mark attendance:', error);
      throw new Error(handleApiError(error));
    }
  },
};
```

---

### PART 9: DASHBOARD SERVICE (READ ONLY)

**File:** `apps/frontend/src/services/dashboardService.ts`

```typescript
import { apiClient, handleApiError } from '@/lib/api-client';
import type { DashboardStats, MilkTrend } from '@/types/api';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      return await apiClient.get<DashboardStats>('/api/v1/dashboard/stats/');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get milk collection trends
   */
  getMilkTrends: async (params?: { 
    period?: 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
  }): Promise<MilkTrend[]> => {
    try {
      return await apiClient.get<MilkTrend[]>('/api/v1/dashboard/milk-trends/', params);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit?: number): Promise<any[]> => {
    try {
      return await apiClient.get<any[]>('/api/v1/dashboard/recent-activity/', { limit });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
```

---

### PART 10: INSTALL TOAST NOTIFICATION LIBRARY

For better user feedback, install a toast library:

```bash
cd apps/frontend
npm install react-hot-toast
```

**Create Toast Wrapper:**

**File:** `apps/frontend/src/components/ui/Toast.tsx`

```typescript
'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
```

**Add to Layout:**

**File:** `apps/frontend/src/app/layout.tsx`

```typescript
import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
```

**Update API Client to use Toast:**

Replace the `showToast` function in `api-client.ts`:

```typescript
import toast from 'react-hot-toast';

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
      toast(message);
      break;
  }
}
```

**Update Modal Component to use Toast:**

In `RecordMilkIntakeModal.tsx`, replace `alert()` with `toast`:

```typescript
import toast from 'react-hot-toast';

// Replace alert with toast
toast.success('✅ Milk collection recorded successfully!');
toast.error(`❌ Error: ${errorMessage}`);
```

---

### PART 11: UPDATE ALL PAGES TO USE REAL APIs

Now update each page to use the services instead of mock data.

**Example: Milk Collections Page**

**File:** `apps/frontend/src/app/(dashboard)/milk-management/collections/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RecordMilkIntakeModal } from '@/components/milk-management/RecordMilkIntakeModal';
import { milkService } from '@/services/milkService';
import { MilkCollection } from '@/types/api';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MilkCollectionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await milkService.getCollections({ page_size: 100 });
      setCollections(response.results || []);
      console.log('✅ Loaded collections:', response.results.length);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load collections';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('❌ Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Reload collections after successful creation
    loadCollections();
    toast.success('Collection recorded successfully!');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      await milkService.deleteCollection(id);
      toast.success('Collection deleted successfully');
      loadCollections();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete collection');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button onClick={loadCollections} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milk Collections</h1>
          <p className="text-gray-600 mt-1">
            Total: {collections.length} collections
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadCollections}
            variant="outline"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          >
            Record Collection
          </Button>
        </div>
      </div>

      {/* Collections List */}
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No collections found</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          >
            Record First Collection
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fat %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SNF %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collections.map((collection) => (
                <tr key={collection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {collection.collection_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(collection.collection_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {collection.milk_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parseFloat(collection.quantity).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parseFloat(collection.fat_percentage).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parseFloat(collection.snf_percentage).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      collection.quality_status === 'accepted' 
                        ? 'bg-green-100 text-green-800'
                        : collection.quality_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {collection.quality_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Modal */}
      <RecordMilkIntakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

---

### PART 12: CRITICAL - FIX BUTTON COLORS IN ALL MODALS

Update ALL modal forms to use the new Button component with proper colors:

**Search and Replace in ALL modal files:**

❌ **Old (invisible buttons):**
```typescript
<button className="bg-white text-white">Submit</button>
```

✅ **New (visible buttons):**
```typescript
<Button variant="primary" type="submit">Submit</Button>
```

**Files to update:**
- `RecordMilkIntakeModal.tsx` ✅ (already done above)
- `CreateProductModal.tsx`
- `CreateBatchModal.tsx`
- `CreateInventoryItemModal.tsx`
- `CreateVendorModal.tsx`
- `CreateEmployeeModal.tsx`
- All other modals

---

### PART 13: VERIFICATION & TESTING

After implementing everything, test each module:

#### Test Milk Collections:
```bash
# 1. Open http://localhost:3000/milk-management/collections
# 2. Click "Record Collection"
# 3. Fill form and submit
# 4. Should see success toast
# 5. Collection should appear in table
# 6. Check Django admin - collection should be there
```

#### Test Products:
```bash
# 1. Open http://localhost:3000/production/products
# 2. Click "Create Product"
# 3. Fill form and submit
# 4. Should see success toast
# 5. Product should appear in list
# 6. Check Django admin - product should be there
```

#### Repeat for ALL modules:
- ✅ Milk Collections
- ✅ Products
- ✅ Production Batches
- ✅ Inventory Items
- ✅ Vendors
- ✅ Employees

---

### PART 14: DEPLOYMENT

```bash
cd apps/frontend

# Install new dependencies
npm install react-hot-toast lucide-react

# Test locally
npm run dev

# Commit and push
git add .
git commit -m "Fix complete API integration, POST operations, and button visibility"
git push origin main

# Vercel will auto-deploy
```

---

## ✅ SUCCESS CRITERIA

After implementation, you should be able to:

### CREATE (POST):
- ✅ Record new milk collections
- ✅ Create new products
- ✅ Create production batches
- ✅ Add inventory items
- ✅ Add vendors
- ✅ Add employees

### READ (GET):
- ✅ View all collections
- ✅ View all products
- ✅ View all inventory items
- ✅ View all vendors
- ✅ View all employees

### UPDATE (PUT):
- ✅ Edit milk collections
- ✅ Edit products
- ✅ Edit inventory items
- ✅ Edit vendors
- ✅ Edit employees

### DELETE:
- ✅ Delete milk collections
- ✅ Delete products
- ✅ Delete inventory items
- ✅ Delete vendors
- ✅ Delete employees

### UI:
- ✅ All buttons are visible
- ✅ Forms submit successfully
- ✅ Toast notifications show
- ✅ Loading states work
- ✅ Error messages display

---

## 🎯 CRITICAL FIXES SUMMARY

1. **Button Component** - Proper colors that are visible on white backgrounds
2. **API Client** - Complete error handling and token management
3. **All Services** - Full CRUD operations for all modules
4. **RecordMilkIntakeModal** - Complete with proper button visibility
5. **Toast Notifications** - User-friendly feedback
6. **All Pages** - Updated to use real APIs instead of mock data

---

## 🆘 IF STILL HAVING ISSUES

### Button not visible?
```typescript
// Check Button component has proper variant classes
<Button variant="primary"> // Should be blue background, white text
<Button variant="outline"> // Should have border
```

### POST still failing?
```bash
# Check browser console for errors
# Check Network tab for request/response
# Verify Django backend is accessible
curl -X POST https://ichhadhari-backend-162541991773.asia-south1.run.app/api/milk/collections/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"milk_type":"cow","quantity":"10","fat_percentage":"4.5","snf_percentage":"8.5","collection_date":"2025-11-05"}'
```

### Token issues?
```typescript
// Check localStorage has tokens
console.log('Access token:', localStorage.getItem('access_token'));

// If null, login again at /login
```

---

This completes the FULL API integration fix! Every module should now be able to POST, GET, PUT, and DELETE data successfully! 🚀
