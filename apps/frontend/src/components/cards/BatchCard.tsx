"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Calendar,
  Play,
  Pause,
  Check,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BatchIcon } from "@/components/icons";
import { formatDateTime, formatNumber } from "@/lib/utils/formatters";
import type { ProductionBatch } from "@/types/production";

interface BatchCardProps {
  batch: ProductionBatch;
  onView?: (batch: ProductionBatch) => void;
  onUpdateStatus?: (
    batch: ProductionBatch,
    status: "in_progress" | "on_hold" | "completed" | "cancelled"
  ) => void;
}

const statusConfig: Record<
  ProductionBatch["status"],
  {
    label: string;
    color: string;
    icon: typeof Play;
  }
> = {
  not_started: {
    label: "Not Started",
    color: "bg-gray-100 text-gray-800",
    icon: Calendar,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: Play,
  },
  on_hold: {
    label: "On Hold",
    color: "bg-orange-100 text-orange-800",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: Check,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: Pause,
  },
};

const priorityConfig: Record<
  ProductionBatch["priority"],
  { color: string; label: string }
> = {
  low: { color: "bg-gray-100 text-gray-700", label: "Low" },
  medium: { color: "bg-blue-100 text-blue-700", label: "Medium" },
  high: { color: "bg-red-100 text-red-700", label: "High" },
};

export function BatchCard({ batch, onView, onUpdateStatus }: BatchCardProps) {
  const StatusIcon = statusConfig[batch.status].icon;

  const handleCardClick = () => {
    if (onView) {
      onView(batch);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl p-5 border border-gray-100 shadow-dairy cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-dairy-green to-green-600 rounded-lg flex items-center justify-center">
            <BatchIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-dairy-blue">
              {batch.batchId}
            </p>
            <h3 className="font-semibold text-dairy-charcoal">
              {batch.productName}
            </h3>
          </div>
        </div>
        <Badge className={priorityConfig[batch.priority].color}>
          {priorityConfig[batch.priority].label}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold text-dairy-blue">
            {batch.progressPercentage}%
          </span>
        </div>
        <Progress value={batch.progressPercentage} className="h-2" />
        <p className="text-xs text-gray-500 mt-1">
          Step {batch.currentStep} of {batch.totalSteps}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Quantity</p>
            <p className="font-semibold text-gray-900">
              {formatNumber(batch.quantity)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Workers</p>
            <p className="font-semibold text-gray-900">
              {batch.assignedWorkers.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm col-span-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Started</p>
            <p className="font-semibold text-gray-900">
              {formatDateTime(batch.startDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge className={statusConfig[batch.status].color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig[batch.status].label}
        </Badge>

        {batch.status === "in_progress" && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
        )}
      </div>

      {onUpdateStatus &&
        batch.status !== "completed" &&
        batch.status !== "cancelled" && (
          <div className="mt-4 flex gap-2">
            {(["in_progress", "on_hold", "completed"] as const)
              .filter((status) => status !== batch.status)
              .map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    onUpdateStatus(batch, status);
                  }}
                >
                  {statusConfig[status].label}
                </Button>
              ))}
          </div>
        )}
    </motion.div>
  );
}
