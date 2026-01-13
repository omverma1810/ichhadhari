"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useMemo } from "react";

import {
  navigationItems,
  filterNavigationByRole,
  type NavigationItem,
} from "@/lib/utils/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavProps {
  role?: string;
}

export function MobileNav({ role = "manager" }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const filteredNavigation = useMemo(
    () => filterNavigationByRole(navigationItems, role),
    [role]
  );

  const renderNavLink = (item: NavigationItem, isChild = false) => {
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href ?? item.title}
        href={item.href ?? "#"}
        onClick={handleClose}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-dairy-blue/10 font-medium text-dairy-blue"
            : "text-gray-600 hover:bg-gray-100 hover:text-dairy-blue"
        } ${isChild ? "ml-6" : ""}`}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
        {item.badge ? (
          <span className="ml-auto rounded-full bg-dairy-orange px-2 py-0.5 text-xs text-white">
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-white p-0">
        <SheetHeader className="border-b border-gray-200 bg-white p-6 pb-4 text-left">
          <SheetTitle className="text-lg font-bold text-dairy-charcoal">
            Dairy Dashboard
          </SheetTitle>
        </SheetHeader>
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-dairy-blue"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close menu</span>
        </button>
        <nav className="flex flex-col gap-4 overflow-y-auto bg-white p-6">
          {filteredNavigation.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.children && section.children.length > 0
                  ? section.children.map((child) => renderNavLink(child, true))
                  : renderNavLink(section)}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
