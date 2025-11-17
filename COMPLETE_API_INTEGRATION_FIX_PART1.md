# 🚨 CRITICAL: Complete API Integration & POST Operations Fix

## 🎯 MISSION CRITICAL OBJECTIVES

**CURRENT CRITICAL ISSUES:**
1. ❌ POST requests failing with "unexpected error occurred"
2. ❌ Buttons not visible on white modal backgrounds
3. ❌ Cannot create/record milk intake
4. ❌ Cannot post data in ANY module
5. ❌ API endpoints not properly integrated
6. ❌ CRUD operations completely broken

**YOUR MISSION:**
Fix ALL API integration issues, implement proper POST/PUT/DELETE operations, fix button visibility, and ensure complete end-to-end data flow from frontend → Django backend → database → frontend display.

---

## 📋 PROJECT CONTEXT

### Backend (Django REST Framework)
**URL:** `https://ichhadhari-backend-162541991773.asia-south1.run.app`
**Authentication:** JWT tokens (Bearer authentication)

### Frontend (Next.js 14)
**URL:** `https://ichhadhari-dairy.vercel.app`
**State:** Currently broken - cannot POST any data

### Database
**Type:** PostgreSQL (Supabase)
**Access:** Via Django ORM through REST API

---

## 🔴 CRITICAL ISSUES BREAKDOWN

### Issue 1: Button Visibility Problem
**Problem:** Buttons have white/light color on white modal background
**Location:** All modals (Record Milk Intake, Create Product, Create Batch, etc.)
**Impact:** Cannot submit forms because can't see submit button

**Root Cause:**
```typescript
// Button has light color that blends with white modal background
<button className="text-white bg-white">Record milk intake</button>
```

### Issue 2: POST API Not Working
**Problem:** "Unexpected error occurred" when trying to create records
**Location:** All modules - Milk Management, Production, Inventory, etc.
**Impact:** Cannot add any new data

**Root Cause:**
- API client not sending correct headers
- Authentication tokens not included
- Request body format incorrect
- CORS issues
- Missing CSRF tokens

### Issue 3: Incomplete API Integration
**Problem:** Only GET requests work, POST/PUT/DELETE don't work
**Impact:** Can view data but cannot create/edit/delete

---

## 🛠️ COMPLETE SOLUTION IMPLEMENTATION

### PART 1: FIX BUTTON VISIBILITY (CRITICAL)

#### Fix 1: Update Button Component

**File:** `apps/frontend/src/components/ui/Button.tsx`

```typescript
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    disabled,
    icon,
    className = '',
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
      outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800',
    };
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### Fix 2: Add lucide-react Icons (if not installed)

```bash
cd apps/frontend
npm install lucide-react
```

---

### PART 2: FIX API CLIENT (CRITICAL)

#### Fix 1: Complete API Client with Proper Error Handling

**File:** `apps/frontend/src/lib/api-client.ts`

```typescript
/**
 * PRODUCTION-READY API CLIENT
 * Handles authentication, token refresh, error handling, and all HTTP methods
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ichhadhari-backend-162541991773.asia-south1.run.app';

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    try {
      console.log('🔄 Refreshing access token...');
      const response = await fetch(`${this.baseURL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken,
        }),
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access);
      }
      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Make authenticated API request with proper error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.accessToken && !endpoint.includes('/auth/login')) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Log request for debugging
    console.log(`🌐 ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('📦 Request body:', JSON.parse(options.body as string));
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for CORS with credentials
      });

      // If unauthorized, try to refresh token
      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
        console.log('🔐 Unauthorized, attempting token refresh...');
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          // Retry request with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          // Redirect to login if refresh failed
          if (typeof window !== 'undefined') {
            console.error('❌ Token refresh failed, redirecting to login');
            window.location.href = '/login';
          }
          throw new Error('Authentication failed');
        }
      }

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `API Error: ${response.statusText}`;
        let errorDetails: any = null;

        try {
          const errorData = await response.json();
          errorDetails = errorData;
          errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
          
          // Handle Django REST Framework error format
          if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          }
          
          // Handle field-specific errors
          if (typeof errorData === 'object' && !errorData.message && !errorData.detail) {
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            }
          }
        } catch (e) {
          // Response is not JSON
          console.error('Error parsing error response:', e);
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          details: errorDetails,
        };

        console.error('❌ API Error:', error);
        throw error;
      }

      // Handle empty responses (204 No Content, DELETE operations)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.log('✅ Request successful (no content)');
        return {} as T;
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ Response:', data);
        return data;
      } else {
        console.log('✅ Request successful (non-JSON response)');
        return {} as T;
      }
    } catch (error: any) {
      // Network errors, timeout, etc.
      if (error.message && error.status) {
        // Already an ApiError
        throw error;
      }
      
      // Generic error
      console.error('❌ Request failed:', error);
      const apiError: ApiError = {
        message: error.message || 'Network error occurred',
        status: 0,
        details: error,
      };
      throw apiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : '';
    
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'Upload failed',
        status: response.status,
        details: errorData,
      };
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export API base URL
export const API_URL = API_BASE_URL;

// Helper function to handle API errors in components
export function handleApiError(error: any): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

// Helper function to show toast notifications (you'll need to install a toast library)
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // For now, just console.log
  // Later, integrate with react-hot-toast or sonner
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Temporary alert for critical errors
  if (type === 'error') {
    alert(message);
  }
}
```

---

### PART 3: FIX MILK COLLECTION POST API

#### Complete Milk Service Implementation

**File:** `apps/frontend/src/services/milkService.ts`

```typescript
import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, MilkCollection } from '@/types/api';

export const milkService = {
  /**
   * Get all milk collections
   */
  getCollections: async (params?: {
    page?: number;
    page_size?: number;
    supplier?: number;
    date_from?: string;
    date_to?: string;
    milk_type?: string;
  }): Promise<PaginatedResponse<MilkCollection>> => {
    try {
      return await apiClient.get<PaginatedResponse<MilkCollection>>(
        '/api/milk/collections/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single collection
   */
  getCollection: async (id: number): Promise<MilkCollection> => {
    try {
      return await apiClient.get<MilkCollection>(`/api/milk/collections/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new milk collection
   */
  createCollection: async (data: {
    supplier?: number;
    collection_date: string;
    collection_time?: string;
    milk_type: 'cow' | 'buffalo' | 'mixed';
    quantity: string | number;
    fat_percentage: string | number;
    snf_percentage: string | number;
    temperature?: string | number;
    source?: string;
    notes?: string;
  }): Promise<MilkCollection> => {
    try {
      // Format data for Django backend
      const formattedData = {
        supplier: data.supplier || null,
        collection_date: data.collection_date,
        collection_time: data.collection_time || new Date().toTimeString().split(' ')[0],
        milk_type: data.milk_type,
        quantity: String(data.quantity),
        fat_percentage: String(data.fat_percentage),
        snf_percentage: String(data.snf_percentage),
        temperature: data.temperature ? String(data.temperature) : '4.0',
        source: data.source || '',
        notes: data.notes || '',
      };

      console.log('📤 Creating milk collection:', formattedData);

      const response = await apiClient.post<MilkCollection>(
        '/api/milk/collections/',
        formattedData
      );

      console.log('✅ Milk collection created:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to create milk collection:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update collection
   */
  updateCollection: async (
    id: number,
    data: Partial<MilkCollection>
  ): Promise<MilkCollection> => {
    try {
      // Format data for Django backend
      const formattedData: any = {};
      
      if (data.quantity !== undefined) formattedData.quantity = String(data.quantity);
      if (data.fat_percentage !== undefined) formattedData.fat_percentage = String(data.fat_percentage);
      if (data.snf_percentage !== undefined) formattedData.snf_percentage = String(data.snf_percentage);
      if (data.temperature !== undefined) formattedData.temperature = String(data.temperature);
      if (data.milk_type !== undefined) formattedData.milk_type = data.milk_type;
      if (data.collection_date !== undefined) formattedData.collection_date = data.collection_date;
      if (data.source !== undefined) formattedData.source = data.source;
      if (data.notes !== undefined) formattedData.notes = data.notes;

      console.log('📤 Updating milk collection:', formattedData);

      const response = await apiClient.put<MilkCollection>(
        `/api/milk/collections/${id}/`,
        formattedData
      );

      console.log('✅ Milk collection updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update milk collection:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete collection
   */
  deleteCollection: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting milk collection:', id);
      await apiClient.delete(`/api/milk/collections/${id}/`);
      console.log('✅ Milk collection deleted');
    } catch (error) {
      console.error('❌ Failed to delete milk collection:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get today's collections
   */
  getTodaysCollections: async (): Promise<MilkCollection[]> => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await apiClient.get<PaginatedResponse<MilkCollection>>(
        '/api/milk/collections/',
        {
          date_from: today,
          date_to: today,
          page_size: 100,
        }
      );
      return response.results || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get collection statistics
   */
  getCollectionStats: async (dateFrom?: string, dateTo?: string): Promise<any> => {
    try {
      return await apiClient.get('/api/milk/collections/stats/', {
        date_from: dateFrom,
        date_to: dateTo,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
```

---

### PART 4: FIX RECORD MILK INTAKE MODAL (COMPLETE)

**File:** `apps/frontend/src/components/milk-management/RecordMilkIntakeModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Droplet, Thermometer, MapPin, User, Calendar, FileText } from 'lucide-react';
import { milkService } from '@/services/milkService';
import { handleApiError } from '@/lib/api-client';

interface RecordMilkIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MILK_TYPES = [
  { value: 'cow', label: 'Cow Milk' },
  { value: 'buffalo', label: 'Buffalo Milk' },
  { value: 'mixed', label: 'Mixed Milk' },
];

export function RecordMilkIntakeModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: RecordMilkIntakeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    quantity: '',
    fatPercentage: '',
    snfPercentage: '',
    temperature: '',
    milkType: 'cow' as 'cow' | 'buffalo' | 'mixed',
    source: '',
    supplierName: '',
    collectionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      if (!formData.fatPercentage || parseFloat(formData.fatPercentage) <= 0) {
        throw new Error('Please enter a valid fat percentage');
      }
      if (!formData.snfPercentage || parseFloat(formData.snfPercentage) <= 0) {
        throw new Error('Please enter a valid SNF percentage');
      }

      console.log('📝 Submitting milk collection form:', formData);

      // Create collection via API
      const result = await milkService.createCollection({
        milk_type: formData.milkType,
        quantity: formData.quantity,
        fat_percentage: formData.fatPercentage,
        snf_percentage: formData.snfPercentage,
        temperature: formData.temperature || '4.0',
        collection_date: formData.collectionDate,
        source: formData.source,
        notes: formData.notes,
      });

      console.log('✅ Milk collection created successfully:', result);

      // Show success message
      alert('✅ Milk collection recorded successfully!');

      // Reset form
      setFormData({
        quantity: '',
        fatPercentage: '',
        snfPercentage: '',
        temperature: '',
        milkType: 'cow',
        source: '',
        supplierName: '',
        collectionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err: any) {
      console.error('❌ Failed to create milk collection:', err);
      const errorMessage = err.message || 'Failed to record milk collection. Please try again.';
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Record milk intake"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Milk Type Selection */}
        <Select
          label="Milk Type"
          options={MILK_TYPES}
          value={formData.milkType}
          onChange={(value) => setFormData({ ...formData, milkType: value as any })}
          required
        />

        {/* Row 1: Quantity and Fat Percentage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quantity (liters)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 15.50"
            icon={<Droplet className="h-5 w-5" />}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
          
          <Input
            label="Fat percentage (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g., 4.50"
            icon={<Droplet className="h-5 w-5" />}
            value={formData.fatPercentage}
            onChange={(e) => setFormData({ ...formData, fatPercentage: e.target.value })}
            required
          />
        </div>

        {/* Row 2: SNF and Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="SNF percentage (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g., 8.50"
            value={formData.snfPercentage}
            onChange={(e) => setFormData({ ...formData, snfPercentage: e.target.value })}
            required
          />
          
          <Input
            label="Temperature (°C)"
            type="number"
            step="0.1"
            placeholder="e.g., 4.0"
            icon={<Thermometer className="h-5 w-5" />}
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            helperText="Leave empty to use default (4°C)"
          />
        </div>

        {/* Row 3: Source/Location */}
        <Input
          label="Source / Location"
          type="text"
          placeholder="e.g., Farm A, Route 1"
          icon={<MapPin className="h-5 w-5" />}
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          helperText="Optional: Specify collection source or location"
        />

        {/* Row 4: Collection Date */}
        <Input
          label="Collection Date"
          type="date"
          icon={<Calendar className="h-5 w-5" />}
          value={formData.collectionDate}
          onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
          required
        />

        {/* Row 5: Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline h-4 w-4 mr-1" />
            Notes (optional)
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Any additional information about this collection..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            icon={<Droplet className="h-5 w-5" />}
          >
            {isSubmitting ? 'Recording...' : 'Record milk intake'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

---

### PART 5: IMPLEMENT ALL OTHER SERVICES WITH COMPLETE CRUD

I'll provide the complete services for ALL modules. Each service will have full CRUD operations.

#### Production Service (Complete)

**File:** `apps/frontend/src/services/productionService.ts`

```typescript
import { apiClient, handleApiError } from '@/lib/api-client';
import type { PaginatedResponse, Product, ProductionBatch } from '@/types/api';

export const productionService = {
  // ==================== PRODUCTS ====================
  
  /**
   * Get all products
   */
  getProducts: async (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    try {
      return await apiClient.get<PaginatedResponse<Product>>(
        '/api/production/products/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single product
   */
  getProduct: async (id: number): Promise<Product> => {
    try {
      return await apiClient.get<Product>(`/api/production/products/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create product
   */
  createProduct: async (data: {
    name: string;
    category: string;
    description?: string;
    unit: string;
    standard_cost: string | number;
    selling_price: string | number;
    min_fat_percentage?: string | number;
    min_snf_percentage?: string | number;
    shelf_life_days: number;
    storage_temperature?: string | number;
    packaging_type: string;
    packaging_size: string | number;
  }): Promise<Product> => {
    try {
      // Format data for Django
      const formattedData = {
        name: data.name,
        category: data.category,
        description: data.description || '',
        unit: data.unit,
        standard_cost: String(data.standard_cost),
        selling_price: String(data.selling_price),
        min_fat_percentage: data.min_fat_percentage ? String(data.min_fat_percentage) : null,
        min_snf_percentage: data.min_snf_percentage ? String(data.min_snf_percentage) : null,
        shelf_life_days: data.shelf_life_days,
        storage_temperature: data.storage_temperature ? String(data.storage_temperature) : '4.0',
        packaging_type: data.packaging_type,
        packaging_size: String(data.packaging_size),
        is_active: true,
      };

      console.log('📤 Creating product:', formattedData);
      const response = await apiClient.post<Product>('/api/production/products/', formattedData);
      console.log('✅ Product created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update product
   */
  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    try {
      // Format data for Django
      const formattedData: any = {};
      if (data.name !== undefined) formattedData.name = data.name;
      if (data.category !== undefined) formattedData.category = data.category;
      if (data.description !== undefined) formattedData.description = data.description;
      if (data.unit !== undefined) formattedData.unit = data.unit;
      if (data.standard_cost !== undefined) formattedData.standard_cost = String(data.standard_cost);
      if (data.selling_price !== undefined) formattedData.selling_price = String(data.selling_price);
      if (data.shelf_life_days !== undefined) formattedData.shelf_life_days = data.shelf_life_days;
      if (data.is_active !== undefined) formattedData.is_active = data.is_active;

      console.log('📤 Updating product:', formattedData);
      const response = await apiClient.put<Product>(`/api/production/products/${id}/`, formattedData);
      console.log('✅ Product updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting product:', id);
      await apiClient.delete(`/api/production/products/${id}/`);
      console.log('✅ Product deleted');
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      throw new Error(handleApiError(error));
    }
  },

  // ==================== BATCHES ====================

  /**
   * Get all batches
   */
  getBatches: async (params?: {
    page?: number;
    page_size?: number;
    product?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<ProductionBatch>> => {
    try {
      return await apiClient.get<PaginatedResponse<ProductionBatch>>(
        '/api/production/batches/',
        params
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single batch
   */
  getBatch: async (id: number): Promise<ProductionBatch> => {
    try {
      return await apiClient.get<ProductionBatch>(`/api/production/batches/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create batch
   */
  createBatch: async (data: {
    product: number;
    production_date: string;
    quantity_produced: string | number;
    status?: string;
    notes?: string;
  }): Promise<ProductionBatch> => {
    try {
      const formattedData = {
        product: data.product,
        production_date: data.production_date,
        quantity_produced: String(data.quantity_produced),
        status: data.status || 'planned',
        notes: data.notes || '',
      };

      console.log('📤 Creating batch:', formattedData);
      const response = await apiClient.post<ProductionBatch>('/api/production/batches/', formattedData);
      console.log('✅ Batch created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create batch:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update batch
   */
  updateBatch: async (id: number, data: Partial<ProductionBatch>): Promise<ProductionBatch> => {
    try {
      const formattedData: any = {};
      if (data.quantity_produced !== undefined) formattedData.quantity_produced = String(data.quantity_produced);
      if (data.status !== undefined) formattedData.status = data.status;
      if (data.notes !== undefined) formattedData.notes = data.notes;

      console.log('📤 Updating batch:', formattedData);
      const response = await apiClient.put<ProductionBatch>(`/api/production/batches/${id}/`, formattedData);
      console.log('✅ Batch updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update batch:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete batch
   */
  deleteBatch: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting batch:', id);
      await apiClient.delete(`/api/production/batches/${id}/`);
      console.log('✅ Batch deleted');
    } catch (error) {
      console.error('❌ Failed to delete batch:', error);
      throw new Error(handleApiError(error));
    }
  },
};
```

---

Due to character limits, I'll continue with the remaining services in the next section. Let me create a continuation file:
