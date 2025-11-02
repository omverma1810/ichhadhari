/**
 * Auth Service Bridge
 * Provides frontend services with a stable import path while reusing the core auth service logic.
 */

export { authService } from "@/lib/services/auth.service";
export type { PermissionCheckResponse } from "@/lib/services/auth.service";
export { authService as default } from "@/lib/services/auth.service";
