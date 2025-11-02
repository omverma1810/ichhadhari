"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, User } from "@/lib/services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication on mount and route changes
  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    const interval = setInterval(() => {
      if (authService.isTokenExpiringSoon() && authService.isAuthenticated()) {
        authService.refreshAccessToken().catch(() => {
          logout();
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);

    try {
      const isAuthenticated = authService.isAuthenticated();
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      if (isAuthenticated) {
        // User is authenticated
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // If on login page, redirect to dashboard
        if (pathname === "/login") {
          router.replace("/dashboard");
        }
      } else {
        // User is not authenticated
        setUser(null);

        // If on protected route, redirect to login
        if (!isPublicRoute) {
          router.replace("/login");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.replace("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
