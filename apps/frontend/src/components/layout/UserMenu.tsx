"use client";

import { User, Settings, LogOut, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMe, useLogout } from "@/hooks/api/useAuth";

export function UserMenu() {
  // Use React Query hooks for user data and logout
  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Show loading state or fallback if user data is not available
  if (isLoading || !user) {
    return (
      <Button variant="ghost" className="flex h-10 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dairy-blue">
          <span className="text-sm font-semibold text-white">...</span>
        </div>
      </Button>
    );
  }

  // Get user initials (first letter of username or first_name)
  const initials = (user.first_name || user.username || "U")
    .charAt(0)
    .toUpperCase();
  const displayName =
    user.full_name ||
    `${user.first_name} ${user.last_name}`.trim() ||
    user.username;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-10 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dairy-blue">
            <span className="text-sm font-semibold text-white">{initials}</span>
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-dairy-charcoal">
              {displayName}
            </p>
            <p className="text-xs capitalize text-gray-500">
              {user.role_display || user.role}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-xs font-normal text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help &amp; Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
