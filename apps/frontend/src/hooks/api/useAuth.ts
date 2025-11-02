/**
 * Authentication React Query Hooks
 * Phase 1: Complete API Integration
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  authService,
  type LoginCredentials,
  type RegisterCredentials,
  type User,
  type UserUpdateData,
  type ChangePasswordData,
  type PermissionCheckResponse,
} from "@/lib/services/auth.service";

// Query keys for React Query
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  permission: (permission: string) =>
    [...authKeys.all, "permission", permission] as const,
};

/**
 * Hook to get current authenticated user
 */
export function useMe(enabled = true) {
  return useQuery<User>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      // First try to get from storage
      const cachedUser = authService.getCurrentUser();
      if (cachedUser && authService.isAuthenticated()) {
        // Optionally refresh from backend
        try {
          const freshUser = await authService.getMe();
          return freshUser;
        } catch {
          // If refresh fails, return cached user
          return cachedUser;
        }
      }
      // If no cached user, fetch from backend
      return await authService.getMe();
    },
    enabled: enabled && authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to check if user has a specific permission
 */
export function useCheckPermission(permission: string, enabled = true) {
  return useQuery<PermissionCheckResponse>({
    queryKey: authKeys.permission(permission),
    queryFn: () => authService.checkPermission(permission),
    enabled: Boolean(permission) && enabled && authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook for user login mutation
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.me(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success(data.message || "Login successful!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for user registration mutation
 */
export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      authService.register(credentials),
    onSuccess: (data) => {
      // Set user data in query cache
      queryClient.setQueryData(authKeys.me(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success(data.message || "Registration successful!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Registration failed. Please check your information.";
      
      // Show field-specific errors if available
      if (error?.errors && typeof error.errors === "object") {
        const errorFields = Object.keys(error.errors);
        if (errorFields.length > 0) {
          const firstError = error.errors[errorFields[0]];
          if (Array.isArray(firstError) && firstError.length > 0) {
            toast.error(firstError[0]);
            return;
          }
        }
      }
      
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for user logout mutation
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: (error: any) => {
      // Even if backend logout fails, clear local data
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
      console.error("Logout error:", error);
      router.push("/login");
    },
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdateData) => authService.updateMe(data),
    onSuccess: (user) => {
      // Update user in cache
      queryClient.setQueryData(authKeys.me(), user);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to update profile.";
      
      // Show field-specific errors if available
      if (error?.errors && typeof error.errors === "object") {
        const errorFields = Object.keys(error.errors);
        if (errorFields.length > 0) {
          const firstError = error.errors[errorFields[0]];
          if (Array.isArray(firstError) && firstError.length > 0) {
            toast.error(firstError[0]);
            return;
          }
        }
      }
      
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) =>
      authService.changePassword(data),
    onSuccess: (data) => {
      toast.success(data.message || "Password changed successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to change password.";
      
      // Show field-specific errors if available
      if (error?.errors && typeof error.errors === "object") {
        const errorFields = Object.keys(error.errors);
        if (errorFields.length > 0) {
          const firstError = error.errors[errorFields[0]];
          if (Array.isArray(firstError) && firstError.length > 0) {
            toast.error(firstError[0]);
            return;
          }
        }
      }
      
      toast.error(errorMessage);
    },
  });
}
