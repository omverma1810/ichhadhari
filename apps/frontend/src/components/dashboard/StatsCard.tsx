import { type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
  description?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
}: StatsCardProps) {
  return (
    <Card className="border-dairy-cream bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-dairy-charcoal">{value}</div>
        {change ? <p className="text-xs text-dairy-green">{change}</p> : null}
        {description ? (
          <CardDescription className="mt-1">{description}</CardDescription>
        ) : null}
      </CardContent>
    </Card>
  );
}
