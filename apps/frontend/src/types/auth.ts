/**
 * Auth Types - Phase 1: Complete API Integration
 * Matches Django backend response structure
 */

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  role: string;
  role_display?: string;
  permissions: Record<string, any> | string[];
  department?: string;
  employee_id?: string;
  profile_picture?: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  last_login?: string;
  last_login_ip?: string;
  date_joined: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  department?: string;
  employee_id?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  profile_picture?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PermissionCheckResponse {
  permission: string;
  has_permission: boolean;
  user_role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
