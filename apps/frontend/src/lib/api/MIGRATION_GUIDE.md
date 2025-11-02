# Migration Guide: From Mock Data to Real API

This guide helps you transition from using mock data to real API calls in your components.

## Quick Start

### Before (Mock Data)

```typescript
import { mockMilkIntakes } from "@/lib/api/mockData";

function CollectionList() {
  const [collections, setCollections] = useState(mockMilkIntakes);

  return (
    <div>
      {collections.map((collection) => (
        <div key={collection.id}>{collection.supplierName}</div>
      ))}
    </div>
  );
}
```

### After (Real API)

```typescript
import { milkAPI } from "@/lib/api";
import { useEffect, useState } from "react";

function CollectionList() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const response = await milkAPI.getCollections({ page: 1 });
        setCollections(response.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {collections.map((collection) => (
        <div key={collection.id}>{collection.supplier_name}</div>
      ))}
    </div>
  );
}
```

## Step-by-Step Migration

### Step 1: Identify Mock Data Usage

Search for imports from mockData:

```bash
grep -r "mockData" apps/frontend/src/
```

### Step 2: Replace Mock Imports

**Before:**

```typescript
import { mockSuppliers } from "@/lib/api/mockData";
```

**After:**

```typescript
import { milkAPI } from "@/lib/api";
```

### Step 3: Update Data Fetching

**Before (Static Mock):**

```typescript
const suppliers = mockSuppliers;
```

**After (API Call):**

```typescript
const [suppliers, setSuppliers] = useState([]);

useEffect(() => {
  const fetchSuppliers = async () => {
    const response = await milkAPI.getSuppliers();
    setSuppliers(response.results);
  };
  fetchSuppliers();
}, []);
```

### Step 4: Add Loading States

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await milkAPI.getSuppliers();
    setSuppliers(response.results);
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Add Error Handling

```typescript
import { getAPIErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await milkAPI.getSuppliers();
    setSuppliers(response.results);
  } catch (err) {
    const message = getAPIErrorMessage(err);
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

## Common Patterns

### Pattern 1: List with Pagination

```typescript
import { milkAPI, type PaginatedResponse, type Supplier } from "@/lib/api";

function SupplierList() {
  const [data, setData] = useState<PaginatedResponse<Supplier> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await milkAPI.getSuppliers({
          page,
          page_size: 10,
        });
        setData(response);
      } catch (error) {
        toast.error(getAPIErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  return (
    <div>
      {data?.results.map((supplier) => (
        <div key={supplier.id}>{supplier.name}</div>
      ))}

      <Pagination
        currentPage={page}
        totalPages={Math.ceil((data?.count || 0) / 10)}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Pattern 2: Form Submission

```typescript
import { milkAPI, type SupplierCreateData } from "@/lib/api";

function CreateSupplierForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: SupplierCreateData) => {
    setLoading(true);
    try {
      await milkAPI.createSupplier(values);
      toast.success("Supplier created successfully");
      router.push("/suppliers");
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Supplier"}
      </button>
    </form>
  );
}
```

### Pattern 3: Detail View

```typescript
import { milkAPI, type Supplier } from "@/lib/api";

function SupplierDetail({ id }: { id: number }) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await milkAPI.getSupplier(id);
        setSupplier(data);
      } catch (error) {
        toast.error(getAPIErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  if (loading) return <Skeleton />;
  if (!supplier) return <div>Not found</div>;

  return (
    <div>
      <h1>{supplier.name}</h1>
      <p>{supplier.contact_person}</p>
      <p>{supplier.phone_number}</p>
    </div>
  );
}
```

### Pattern 4: Update/Edit

```typescript
function EditSupplierForm({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const router = useRouter();

  // Fetch initial data
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await milkAPI.getSupplier(id);
        setInitialData(data);
      } catch (error) {
        toast.error(getAPIErrorMessage(error));
      }
    };
    fetchSupplier();
  }, [id]);

  // Handle update
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await milkAPI.updateSupplier(id, values);
      toast.success("Supplier updated successfully");
      router.push("/suppliers");
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) return <Skeleton />;

  return (
    <form onSubmit={handleSubmit} defaultValues={initialData}>
      {/* Form fields */}
    </form>
  );
}
```

### Pattern 5: Delete

```typescript
function DeleteSupplierButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    setLoading(true);
    try {
      await milkAPI.deleteSupplier(id);
      toast.success("Supplier deleted successfully");
      router.push("/suppliers");
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
```

### Pattern 6: Search with Debounce

```typescript
import { useDebounce } from "@/hooks/useDebounce";

function SupplierSearch() {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (debouncedSearch.length < 2) {
        setSuppliers([]);
        return;
      }

      try {
        const response = await milkAPI.getSuppliers({
          search: debouncedSearch,
        });
        setSuppliers(response.results);
      } catch (error) {
        toast.error(getAPIErrorMessage(error));
      }
    };

    fetchSuppliers();
  }, [debouncedSearch]);

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search suppliers..."
      />
      {suppliers.map((supplier) => (
        <div key={supplier.id}>{supplier.name}</div>
      ))}
    </div>
  );
}
```

## Using React Query (Recommended)

For better data fetching, caching, and synchronization, use React Query:

### Installation

```bash
npm install @tanstack/react-query
# or
pnpm add @tanstack/react-query
```

### Setup Provider

```typescript
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### Usage with React Query

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { milkAPI } from "@/lib/api";

// Query Hook
function useSuppliers(params) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => milkAPI.getSuppliers(params),
  });
}

// Mutation Hook
function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: milkAPI.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created");
    },
    onError: (error) => {
      toast.error(getAPIErrorMessage(error));
    },
  });
}

// Component
function SupplierList() {
  const { data, isLoading, error } = useSuppliers({ page: 1 });
  const createSupplier = useCreateSupplier();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.results.map((supplier) => (
        <div key={supplier.id}>{supplier.name}</div>
      ))}

      <button onClick={() => createSupplier.mutate(newSupplierData)}>
        Create Supplier
      </button>
    </div>
  );
}
```

## Type Safety Tips

### Import Types

```typescript
import type {
  Supplier,
  SupplierCreateData,
  PaginatedResponse,
} from "@/lib/api";
```

### Type Your State

```typescript
const [supplier, setSupplier] = useState<Supplier | null>(null);
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [response, setResponse] = useState<PaginatedResponse<Supplier> | null>(
  null
);
```

### Type Your Props

```typescript
interface SupplierListProps {
  filters?: {
    status?: "active" | "inactive";
    search?: string;
  };
}

function SupplierList({ filters }: SupplierListProps) {
  // ...
}
```

## Testing

### Mock API Calls in Tests

```typescript
import { milkAPI } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  milkAPI: {
    getSuppliers: jest.fn(),
    createSupplier: jest.fn(),
  },
}));

describe("SupplierList", () => {
  it("should fetch and display suppliers", async () => {
    const mockSuppliers = {
      count: 2,
      results: [
        { id: 1, name: "Supplier 1" },
        { id: 2, name: "Supplier 2" },
      ],
    };

    (milkAPI.getSuppliers as jest.Mock).mockResolvedValue(mockSuppliers);

    render(<SupplierList />);

    await waitFor(() => {
      expect(screen.getByText("Supplier 1")).toBeInTheDocument();
      expect(screen.getByText("Supplier 2")).toBeInTheDocument();
    });
  });
});
```

## Checklist

- [ ] Replace mock data imports with API imports
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success feedback (toasts)
- [ ] Update type imports
- [ ] Add pagination support
- [ ] Add search/filter support
- [ ] Test API endpoints with backend
- [ ] Update tests to mock API calls
- [ ] Consider using React Query for data fetching

## Troubleshooting

### Issue: CORS Error

**Solution:** Ensure Django backend has CORS configured:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Issue: 401 Unauthorized

**Solution:** Check if user is logged in and token is stored:

```typescript
// Check localStorage
console.log(localStorage.getItem("access_token"));

// Login first
await authAPI.login("username", "password");
```

### Issue: Network Error

**Solution:** Verify API URL is correct:

```bash
# Check .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Verify Django is running
curl http://localhost:8000/api/v1/milk/suppliers/
```

### Issue: Type Errors

**Solution:** Import types from API module:

```typescript
import type { Supplier } from "@/lib/api";
```

## Next Steps

1. Start with one module (e.g., Milk Management)
2. Migrate components one by one
3. Test thoroughly after each migration
4. Remove unused mock data files
5. Update documentation
6. Deploy to staging for testing

## Resources

- [API Documentation](./README.md)
- [API Structure](./API_STRUCTURE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [React Query Docs](https://tanstack.com/query/latest)
