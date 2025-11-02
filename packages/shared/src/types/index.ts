/**
 * Shared TypeScript Types for Ichhadhari Dairy Management System
 *
 * This file serves as the main entry point for all shared types used across
 * the frontend and backend (type definitions for API contracts).
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

/**
 * Base interface for all entities with timestamp tracking
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================================================
// USER & AUTHENTICATION
// =============================================================================

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  OPERATOR = "operator",
  VIEWER = "viewer",
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse
  extends ApiResponse<{
    user: User;
    tokens: AuthTokens;
  }> {}

// =============================================================================
// VENDOR MANAGEMENT
// =============================================================================

export interface Vendor extends BaseEntity {
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: VendorStatus;
  rating?: number;
}

export enum VendorStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

// =============================================================================
// MILK MANAGEMENT
// =============================================================================

export interface MilkIntake extends BaseEntity {
  vendorId: string;
  vendor?: Vendor;
  date: string;
  shift: MilkShift;
  quantity: number; // in liters
  fat: number; // percentage
  snf: number; // Solid Not Fat percentage
  clr: number; // Combined Lactometer Reading
  temperature: number; // in Celsius
  quality: MilkQuality;
  price: number;
  amount: number;
  notes?: string;
}

export enum MilkShift {
  MORNING = "morning",
  EVENING = "evening",
}

export enum MilkQuality {
  EXCELLENT = "excellent",
  GOOD = "good",
  AVERAGE = "average",
  POOR = "poor",
  REJECTED = "rejected",
}

// =============================================================================
// PRODUCTION MANAGEMENT
// =============================================================================

export interface ProductionBatch extends BaseEntity {
  batchNumber: string;
  productId: string;
  product?: Product;
  startDate: string;
  endDate?: string;
  status: BatchStatus;
  milkUsed: number; // in liters
  quantityProduced: number;
  unit: string;
  ingredients?: BatchIngredient[];
  notes?: string;
}

export interface Product extends BaseEntity {
  name: string;
  code: string;
  category: ProductCategory;
  unit: string;
  shelfLife: number; // in days
  storageTemperature: string;
  description?: string;
  isActive: boolean;
}

export enum ProductCategory {
  MILK = "milk",
  YOGURT = "yogurt",
  CHEESE = "cheese",
  BUTTER = "butter",
  PANEER = "paneer",
  GHEE = "ghee",
  CREAM = "cream",
  OTHER = "other",
}

export enum BatchStatus {
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  QUALITY_CHECK = "quality_check",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface BatchIngredient {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

// =============================================================================
// INVENTORY MANAGEMENT
// =============================================================================

export interface InventoryItem extends BaseEntity {
  productId: string;
  product?: Product;
  batchId?: string;
  batch?: ProductionBatch;
  quantity: number;
  unit: string;
  location: string;
  expiryDate: string;
  status: InventoryStatus;
}

export enum InventoryStatus {
  IN_STOCK = "in_stock",
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  EXPIRED = "expired",
  RESERVED = "reserved",
}

// =============================================================================
// EMPLOYEE MANAGEMENT
// =============================================================================

export interface Employee extends BaseEntity {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  joinDate: string;
  salary: number;
  status: EmployeeStatus;
  address?: string;
}

export enum Department {
  PRODUCTION = "production",
  QUALITY_CONTROL = "quality_control",
  WAREHOUSE = "warehouse",
  SALES = "sales",
  ADMINISTRATION = "administration",
  MAINTENANCE = "maintenance",
}

export enum EmployeeStatus {
  ACTIVE = "active",
  ON_LEAVE = "on_leave",
  RESIGNED = "resigned",
  TERMINATED = "terminated",
}

// =============================================================================
// ANALYTICS & REPORTS
// =============================================================================

export interface DashboardStats {
  totalMilkIntake: number;
  totalProduction: number;
  activeVendors: number;
  totalRevenue: number;
  lowStockItems: number;
  pendingOrders: number;
}

export interface MilkIntakeReport {
  period: string;
  totalQuantity: number;
  averageFat: number;
  averageSnf: number;
  totalAmount: number;
  byVendor: VendorMilkStats[];
}

export interface VendorMilkStats {
  vendorId: string;
  vendorName: string;
  quantity: number;
  amount: number;
}

export interface ProductionReport {
  period: string;
  batches: number;
  milkUsed: number;
  productionByCategory: CategoryProduction[];
}

export interface CategoryProduction {
  category: ProductCategory;
  quantity: number;
  batches: number;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export all types for easy imports
export * from "./index";
