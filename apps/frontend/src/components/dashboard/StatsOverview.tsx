"use client";

import { Droplet, Package, TrendingUp, Users } from "lucide-react";

import { StatsCard, type StatsCardProps } from "@/components/cards/StatsCard";
import { cn } from "@/lib/utils/cn";

const stats = [
  {
    title: "Daily Milk Intake",
    value: 12_480,
    change: 5.3,
    changeLabel: "vs yesterday",
    icon: Droplet,
    color: "blue" as const,
    valueSuffix: "L",
  },
  {
    title: "Active Suppliers",
    value: 86,
    change: 6.8,
    changeLabel: "growth this quarter",
    icon: Users,
    color: "green" as const,
  },
  {
    title: "Inventory Health",
    value: 96,
    change: 0.4,
    changeLabel: "uptime this week",
    icon: Package,
    color: "orange" as const,
    valueSuffix: "%",
  },
  {
    title: "Revenue Forecast",
    value: 482,
    change: 12.4,
    changeLabel: "MoM",
    icon: TrendingUp,
    color: "purple" as const,
    valuePrefix: "₹",
    valueSuffix: "K",
  },
] satisfies StatsCardProps[];

interface StatsOverviewProps {
  className?: string;
}

export function StatsOverview({ className }: StatsOverviewProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
