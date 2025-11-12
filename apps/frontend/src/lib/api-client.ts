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
      this.accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      // Store in same location as authService does
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      if (rememberMe) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
      } else {
        sessionStorage.setItem('access_token', access);
        sessionStorage.setItem('refresh_token', refresh);
      }
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
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user_data');
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
        const rememberMe = localStorage.getItem('remember_me') === 'true';
        if (rememberMe) {
          localStorage.setItem('access_token', data.access);
        } else {
          sessionStorage.setItem('access_token', data.access);
        }
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
    // Reload tokens from storage to ensure we have the latest
    this.loadTokensFromStorage();

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
    // Reload tokens from storage
    this.loadTokensFromStorage();

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

// Helper function to show toast notifications
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // Dynamically import toast to avoid SSR issues
  if (typeof window !== 'undefined') {
    import('react-hot-toast').then(({ default: toast }) => {
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
    });
  }
}
