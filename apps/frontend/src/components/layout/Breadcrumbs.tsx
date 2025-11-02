"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const getBreadcrumbTitle = (segment: string) =>
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      href,
      title: getBreadcrumbTitle(segment),
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-gray-600 transition-colors hover:text-dairy-blue"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {crumb.isLast ? (
            <span className="font-medium text-dairy-charcoal">
              {crumb.title}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-600 transition-colors hover:text-dairy-blue"
            >
              {crumb.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
