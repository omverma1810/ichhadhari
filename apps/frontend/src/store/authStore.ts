"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
          const secureFlag =
            window.location.protocol === "https:" ? "; secure" : "";
          document.cookie = `authToken=${token}; path=/; max-age=${
            60 * 60 * 24 * 7
          }${secureFlag}`; // 7 days
        }
        set({ user, token, isAuthenticated: true });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("auth-storage");
          const secureFlag =
            window.location.protocol === "https:" ? "; secure" : "";
          document.cookie = `authToken=; path=/; max-age=0${secureFlag}`;
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
