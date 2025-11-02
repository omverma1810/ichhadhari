import {
  LayoutDashboard,
  Milk,
  Factory,
  Package,
  Users,
  TrendingUp,
  UserCog,
  Droplet,
  Split,
  BoxIcon,
  FolderKanban,
  Activity,
  Warehouse,
  Snowflake,
  Store,
  ShoppingCart,
  Receipt,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavigationItem[];
  roles?: string[];
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Milk Management",
    icon: Milk,
    children: [
      {
        title: "Milk Intake",
        href: "/milk-management/intake",
        icon: Droplet,
      },
      {
        title: "Segregation",
        href: "/milk-management/segregation",
        icon: Split,
      },
    ],
  },
  {
    title: "Production",
    icon: Factory,
    children: [
      {
        title: "Products",
        href: "/production/products",
        icon: BoxIcon,
      },
      {
        title: "Batches",
        href: "/production/batches",
        icon: FolderKanban,
      },
      {
        title: "Tracking",
        href: "/production/tracking",
        icon: Activity,
      },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    children: [
      {
        title: "Stock Overview",
        href: "/inventory/stock",
        icon: Warehouse,
      },
      {
        title: "Cold Storage",
        href: "/inventory/cold-storage",
        icon: Snowflake,
      },
    ],
  },
  {
    title: "Vendors",
    icon: Store,
    children: [
      {
        title: "Vendor Management",
        href: "/vendors",
        icon: Users,
      },
      {
        title: "Purchase Orders",
        href: "/vendors/orders",
        icon: ShoppingCart,
      },
      {
        title: "Payments",
        href: "/vendors/payments",
        icon: DollarSign,
      },
      {
        title: "Invoices",
        href: "/vendors/invoices",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Employees",
    href: "/employees",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
  },
];

export function filterNavigationByRole(
  items: NavigationItem[],
  userRole: string
): NavigationItem[] {
  return items
    .map((item) => ({ ...item }))
    .filter((item) => {
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      if (item.children) {
        item.children = filterNavigationByRole(item.children, userRole);
      }
      return true;
    });
}
