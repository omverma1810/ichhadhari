import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";
const REMEMBER_ME_KEY = "remember_me";

// Types
export interface LoginCredentials {
  username?: string; // Can be username or email
  email?: string; // For compatibility
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

export interface PermissionCheckResponse {
  permission: string;
  has_permission: boolean;
  user_role: string;
}

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

export interface DecodedToken {
  exp: number;
  iat: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  permissions: Record<string, any> | string[];
}

class AuthService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - Add access token to requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              await this.refreshAccessToken();
              // Retry the original request with new token
              const newToken = this.getAccessToken();
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.axiosInstance(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await axios.post<RegisterResponse>(
        `${API_BASE_URL}/api/auth/register/`,
        credentials
      );

      const { tokens, user } = response.data;
      const { access, refresh } = tokens;

      // Store tokens and user data
      this.setTokens(access, refresh, true);
      this.setUserData(user);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Registration failed. Please check your information.";
        throw {
          message: errorMessage,
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
          response: error.response,
        };
      }
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Django API expects 'username' field (can be email or username)
      const username = credentials.username || credentials.email || "";
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/login/`,
        {
          username,
          password: credentials.password,
        }
      );

      // Django returns: { message, user, tokens: { access, refresh } }
      const { tokens, user } = response.data;
      const { access, refresh } = tokens;

      // Store tokens and user data
      this.setTokens(access, refresh, credentials.rememberMe);
      this.setUserData(user);

      // Store remember me preference
      if (credentials.rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            error.response?.data?.detail ||
            "Login failed. Please check your credentials.",
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
          response: error.response,
        };
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        // Call backend logout endpoint to blacklist token
        try {
          await this.axiosInstance.post(`/api/auth/logout/`, {
            refresh: refreshToken,
          });
        } catch (error) {
          // Continue with local logout even if backend call fails
          console.warn("Backend logout failed, clearing local tokens");
        }
      }
    } catch (error) {
      // Continue with local logout even if there's an error
      console.warn("Logout error:", error);
    } finally {
      // Clear all stored data
      if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        localStorage.removeItem(REMEMBER_ME_KEY);
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(USER_DATA_KEY);
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      // Django REST Framework SimpleJWT expects refresh token in request body
      const response = await axios.post<{ access: string }>(
        `${API_BASE_URL}/api/auth/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const { access } = response.data;
      const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";

      // Update access token
      if (rememberMe) {
        localStorage.setItem(ACCESS_TOKEN_KEY, access);
      } else {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, access);
      }

      return access;
    } catch (error) {
      // If refresh fails, clear tokens and logout
      if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(USER_DATA_KEY);
      }
      throw error;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    if (typeof window === "undefined") {
      return null;
    }

    const userDataStr =
      localStorage.getItem(USER_DATA_KEY) ||
      sessionStorage.getItem(USER_DATA_KEY);

    if (!userDataStr) {
      return null;
    }

    try {
      return JSON.parse(userDataStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60;
      return decoded.exp - currentTime < fiveMinutes;
    } catch {
      return true;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
  }

  /**
   * Get refresh token
   */
  private getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return (
      localStorage.getItem(REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(REFRESH_TOKEN_KEY)
    );
  }

  /**
   * Store tokens
   */
  private setTokens(
    accessToken: string,
    refreshToken: string,
    rememberMe?: boolean
  ): void {
    if (typeof window === "undefined") {
      return;
    }

    if (rememberMe) {
      // Store in localStorage for persistent login
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      // Store in sessionStorage for session-only login
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Store user data
   */
  private setUserData(user: User): void {
    if (typeof window === "undefined") {
      return;
    }

    const userDataStr = JSON.stringify(user);
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";

    if (rememberMe) {
      localStorage.setItem(USER_DATA_KEY, userDataStr);
    } else {
      sessionStorage.setItem(USER_DATA_KEY, userDataStr);
    }
  }

  /**
   * Verify email (for registration)
   */
  async verifyEmail(token: string): Promise<void> {
    await this.axiosInstance.post("/api/auth/verify-email/", { token });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.axiosInstance.post("/api/auth/password-reset/", { email });
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(
    token: string,
    newPassword: string
  ): Promise<void> {
    await this.axiosInstance.post("/api/auth/password-reset/confirm/", {
      token,
      new_password: newPassword,
    });
  }

  /**
   * Get current user profile from backend
   */
  async getMe(): Promise<User> {
    try {
      const response = await this.axiosInstance.get<{ user: User }>(
        "/api/auth/me/"
      );
      const user = response.data.user;
      this.setUserData(user);
      return user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            error.response?.data?.detail ||
            "Failed to fetch user profile.",
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
          response: error.response,
        };
      }
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateMe(data: UserUpdateData): Promise<User> {
    try {
      const response = await this.axiosInstance.patch<{
        user: User;
        message: string;
      }>("/api/auth/me/", data);
      const user = response.data.user;
      this.setUserData(user);
      return user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            error.response?.data?.detail ||
            "Failed to update profile.",
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
          response: error.response,
        };
      }
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.post<{ message: string }>(
        "/api/auth/change-password/",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            error.response?.data?.detail ||
            "Failed to change password.",
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
          response: error.response,
        };
      }
      throw error;
    }
  }

  /**
   * Check whether the current user has a specific permission
   */
  async checkPermission(permission: string): Promise<PermissionCheckResponse> {
    try {
      const response = await this.axiosInstance.get<PermissionCheckResponse>(
        "/api/auth/check-permission/",
        { params: { permission } }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            error.response?.data?.detail ||
            "Failed to check permission.",
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
          response: error.response,
        };
      }
      throw error;
    }
  }

  /**
   * Get axios instance for making authenticated requests
   */
  getAxiosInstance() {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
