"use client";

import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "./UserMenu";
import { Breadcrumbs } from "./Breadcrumbs";
import { MobileNav } from "./MobileNav";

interface HeaderProps {
  role?: string;
}

export function Header({ role = "manager" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <MobileNav role={role} />
        <Breadcrumbs />
      </div>
      <div className="mx-8 hidden max-w-md flex-1 items-center md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="bg-gray-50 pl-10 focus:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
