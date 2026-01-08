import { apiClient } from "./client";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: string;
  department?: string;
  is_active: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/auth/register/",
      data
    );

    // Store tokens
    if (response.tokens) {
      apiClient.setTokens(response.tokens.access, response.tokens.refresh);
    }

    return response;
  },

  /**
   * Login with username and password
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login/", {
      username,
      password,
    });

    // Store tokens
    if (response.tokens) {
      apiClient.setTokens(response.tokens.access, response.tokens.refresh);
    }

    return response;
  },

  /**
   * Logout - blacklist the refresh token
   */
  logout: async (refreshToken: string): Promise<void> => {
    try {
      await apiClient.post("/auth/logout/", { refresh: refreshToken });
    } finally {
      // Clear tokens from localStorage even if the request fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>(
      "/auth/token/refresh/",
      {
        refresh: refreshToken,
      }
    );

    // Update access token
    if (response.access) {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", response.access);
      }
    }

    return response;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    return await apiClient.get<User>("/auth/me/");
  },

  /**
   * Update current user profile
   */
  updateMe: async (data: UpdateProfileData): Promise<User> => {
    return await apiClient.patch<User>("/auth/me/", data);
  },

  /**
   * Change password
   */
  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(
      "/auth/change-password/",
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword,
      }
    );
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(
      "/auth/forgot-password/",
      {
        email,
      }
    );
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(
      "/auth/reset-password/",
      {
        token,
        password,
        password2: password,
      }
    );
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(
      "/auth/verify-email/",
      {
        token,
      }
    );
  },
};
