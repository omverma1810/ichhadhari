"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";

/**
 * Client-side authentication guard
 * Redirects to login if user is not authenticated
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isLoading && !isAuthenticated) {
      const redirectUrl = `${pathname}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [hasMounted, isAuthenticated, isLoading, router, pathname]);

  // Show loading spinner while checking authentication
  if (!hasMounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
