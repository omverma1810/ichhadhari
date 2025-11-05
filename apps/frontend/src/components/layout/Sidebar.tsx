"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Milk, LogOut } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  navigationItems,
  type NavigationItem,
  filterNavigationByRole,
} from "@/lib/utils/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredNav = user
    ? filterNavigationByRole(navigationItems, user.role)
    : navigationItems;

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.href));
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white",
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dairy-blue to-dairy-darkBlue transition-transform group-hover:scale-105">
            <Milk className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-dairy-charcoal">
              Ichhadhari
            </h1>
            <p className="text-xs text-gray-500">Dairy Management System</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredNav.map((item) => (
            <NavItem
              key={item.title}
              item={item}
              isExpanded={expandedItems.includes(item.title)}
              onToggle={() => toggleExpand(item.title)}
              isActive={isActive(item.href)}
              hasActiveChild={hasActiveChild(item.children)}
            />
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-dairy-cream px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dairy-blue">
            <span className="text-sm font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-dairy-charcoal">
              {user?.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: NavigationItem;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: boolean;
  hasActiveChild: boolean;
}

function NavItem({
  item,
  isExpanded,
  onToggle,
  isActive,
  hasActiveChild,
}: NavItemProps) {
  const pathname = usePathname();

  if (item.children) {
    return (
      <motion.li
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={onToggle}
          style={
            hasActiveChild
              ? {
                  backgroundColor: "rgba(74, 144, 226, 0.1)",
                  color: "#4A90E2",
                }
              : undefined
          }
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            !hasActiveChild && "text-gray-700 hover:bg-gray-100"
          )}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={hasActiveChild ? { rotate: [0, 5, -5, 0] } : undefined}
              transition={{ duration: 0.5 }}
            >
              <item.icon className="h-5 w-5" />
            </motion.div>
            <span>{item.title}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" as const }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded ? (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" as const }}
              className="ml-8 mt-1 space-y-1 overflow-hidden"
            >
              {item.children.map((child, index) => {
                const childActive = pathname === child.href;
                return (
                  <motion.li
                    key={child.href ?? `${item.title}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={child.href ?? "#"}
                      style={
                        childActive
                          ? {
                              backgroundColor: "#4A90E2",
                              color: "#FFFFFF",
                            }
                          : undefined
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        childActive
                          ? "shadow-lg shadow-dairy-blue/30"
                          : "text-gray-600 hover:translate-x-1 hover:bg-gray-100"
                      )}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <child.icon
                          className="h-4 w-4"
                          style={childActive ? { color: "#FFFFFF" } : undefined}
                        />
                      </motion.div>
                      <span
                        style={childActive ? { color: "#FFFFFF" } : undefined}
                      >
                        {child.title}
                      </span>
                      {child.badge ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto rounded-full bg-dairy-orange px-2 py-0.5 text-xs text-white"
                        >
                          {child.badge}
                        </motion.span>
                      ) : null}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </motion.li>
    );
  }

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={item.href ?? "#"}
        style={
          isActive
            ? {
                backgroundColor: "#4A90E2",
                color: "#FFFFFF",
              }
            : undefined
        }
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "shadow-lg shadow-dairy-blue/30"
            : "text-gray-700 hover:translate-x-1 hover:bg-gray-100"
        )}
      >
        <motion.div
          whileHover={{ scale: 1.2, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <item.icon
            className="h-5 w-5"
            style={isActive ? { color: "#FFFFFF" } : undefined}
          />
        </motion.div>
        <span style={isActive ? { color: "#FFFFFF" } : undefined}>
          {item.title}
        </span>
        {item.badge ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="ml-auto rounded-full bg-dairy-orange px-2 py-0.5 text-xs text-white"
          >
            {item.badge}
          </motion.span>
        ) : null}
      </Link>
    </motion.li>
  );
}
