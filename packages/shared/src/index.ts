/**
 * Main entry point for @ichhadhari/shared package
 *
 * This file exports all shared types, utilities, and constants
 * that can be used across the frontend and backend.
 */

// Export all types
export * from "./types";

// Package version
export const PACKAGE_VERSION = "1.0.0";

// API Configuration constants
export const API_CONFIG = {
  VERSION: "v1",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Date format constants
export const DATE_FORMATS = {
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
  DATE_ONLY: "YYYY-MM-DD",
  TIME_ONLY: "HH:mm:ss",
  DISPLAY: "DD/MM/YYYY",
  DISPLAY_TIME: "DD/MM/YYYY HH:mm",
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
