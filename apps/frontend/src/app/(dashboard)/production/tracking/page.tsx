"use client";

import { motion } from "framer-motion";
import { Activity, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useBatches } from "@/lib/hooks/useProduction";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { BatchCard } from "@/components/cards/BatchCard";
import { Factory } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

const columns = [
  {
    id: "not_started",
    title: "Not Started",
    icon: Clock,
    color: "bg-gray-100",
  },
  {
    id: "in_progress",
    title: "In Progress",
    icon: Activity,
    color: "bg-blue-100",
  },
  {
    id: "on_hold",
    title: "On Hold",
    icon: AlertCircle,
    color: "bg-orange-100",
  },
  {
    id: "completed",
    title: "Completed",
    icon: CheckCircle,
    color: "bg-green-100",
  },
] as const;

export default function ProductionTrackingPage() {
  const { data: batchesData, isLoading } = useBatches();

  const getBatchesByStatus = (status: string) =>
    batchesData?.results.filter((batch) => batch.status === status) ?? [];

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner
          size="lg"
          withText
          text="Loading production tracking..."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-dairy-charcoal flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Factory className="w-8 h-8 text-dairy-blue" />
          </motion.div>
          Production Tracking
        </h1>
        <p className="text-gray-600 mt-1">
          Real-time production workflow monitoring
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {columns.map((column, columnIndex) => {
          const batches = getBatchesByStatus(column.id);
          const ColumnIcon = column.icon;

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: columnIndex * 0.1 }}
              className="bg-gray-50 rounded-xl p-4 min-h-[400px] sm:min-h-[600px]"
            >
              <div className={`${column.color} rounded-lg p-3 mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ColumnIcon className="w-5 h-5" />
                    <h3 className="font-semibold">{column.title}</h3>
                  </div>
                  <span className="px-2 py-1 bg-white rounded-full text-sm font-semibold">
                    {batches.length}
                  </span>
                </div>
              </div>

              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {batches.map((batch) => (
                  <motion.div key={batch.id} variants={staggerItem}>
                    <BatchCard batch={batch} />
                  </motion.div>
                ))}

                {batches.length === 0 && (
                  <div className="p-8 text-center">
                    <ColumnIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No batches</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
