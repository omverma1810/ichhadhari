"use client";

import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/store/authStore";

interface DashboardLayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({
  sidebar,
  header,
  children,
}: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const role = user?.role ?? "manager";

  const renderedSidebar = sidebar ?? <Sidebar className="hidden lg:flex" />;
  const renderedHeader = header ?? <Header role={role} />;

  return (
    <div className="min-h-screen bg-dairy-background overflow-x-hidden">
      {renderedSidebar}
      <div className="flex min-h-screen flex-col lg:pl-64 overflow-x-hidden">
        {renderedHeader}
        <main className="flex-1 px-4 py-6 md:px-8 lg:py-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
