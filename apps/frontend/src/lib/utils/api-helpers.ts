/**
 * API Helper Utilities
 * Common utility functions for API operations
 */

import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";

// ============ ERROR HANDLING ============

/**
 * Extract error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;

    // Try different error message fields
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;

    // Handle validation errors
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const firstError = data.errors[firstKey]?.[0];
      if (firstError) return `${firstKey}: ${firstError}`;
    }

    // Handle network errors
    if (error.code === "ECONNABORTED")
      return "Request timeout. Please try again.";
    if (error.code === "ERR_NETWORK")
      return "Network error. Please check your connection.";

    // Default error message based on status code
    if (error.response?.status === 404) return "Resource not found";
    if (error.response?.status === 403) return "Access denied";
    if (error.response?.status === 401) return "Unauthorized";
    if (error.response?.status === 500)
      return "Server error. Please try again later.";
  }

  return "An unexpected error occurred";
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 422 || error.response?.status === 400;
  }
  return false;
};

/**
 * Get validation errors as object
 */
export const getValidationErrors = (
  error: unknown
): Record<string, string[]> | null => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;
    return data?.errors || null;
  }
  return null;
};

// ============ DATE FORMATTING ============

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

/**
 * Format datetime for API (ISO 8601)
 */
export const formatDateTimeForAPI = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
};

/**
 * Parse date from API
 */
export const parseDateFromAPI = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Get date range for common periods
 */
export const getDateRange = (
  period:
    | "today"
    | "yesterday"
    | "last_7_days"
    | "last_30_days"
    | "this_month"
    | "last_month"
): { start_date: string; end_date: string } => {
  const today = new Date();
  const endDate = formatDateForAPI(today);
  let startDate: string;

  switch (period) {
    case "today":
      startDate = endDate;
      break;
    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = formatDateForAPI(yesterday);
      break;
    case "last_7_days":
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 7);
      startDate = formatDateForAPI(last7Days);
      break;
    case "last_30_days":
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 30);
      startDate = formatDateForAPI(last30Days);
      break;
    case "this_month":
      const firstDayThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      startDate = formatDateForAPI(firstDayThisMonth);
      break;
    case "last_month":
      const firstDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const lastDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );
      startDate = formatDateForAPI(firstDayLastMonth);
      return {
        start_date: startDate,
        end_date: formatDateForAPI(lastDayLastMonth),
      };
    default:
      startDate = endDate;
  }

  return { start_date: startDate, end_date: endDate };
};

// ============ QUERY STRING BUILDERS ============

/**
 * Build query string from params object
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const filtered = Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          .join("&");
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  return filtered ? `?${filtered}` : "";
};

/**
 * Parse query string to params object
 */
export const parseQueryString = (
  queryString: string
): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlParams = new URLSearchParams(queryString);

  urlParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
};

// ============ RESPONSE TRANSFORMERS ============

/**
 * Transform paginated response for easier consumption
 */
export const transformPaginatedResponse = <T>(response: any) => {
  return {
    items: response.results || [],
    total: response.count || 0,
    hasNext: !!response.next,
    hasPrevious: !!response.previous,
    nextUrl: response.next,
    previousUrl: response.previous,
  };
};

/**
 * Flatten nested object for form submission
 */
export const flattenObject = (
  obj: Record<string, any>,
  prefix = ""
): Record<string, any> => {
  return Object.keys(obj).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(acc, flattenObject(value, fullKey));
    } else {
      acc[fullKey] = value;
    }

    return acc;
  }, {} as Record<string, any>);
};

// ============ FILE OPERATIONS ============

/**
 * Convert file to base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export data as CSV
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
};

/**
 * Export data as JSON
 */
export const exportToJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  downloadBlob(blob, filename);
};

// ============ NUMBER FORMATTING ============

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (
  num: number,
  decimals: number = 2,
  locale: string = "en-IN"
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

// ============ DEBOUNCE & THROTTLE ============

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============ RETRY LOGIC ============

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};
