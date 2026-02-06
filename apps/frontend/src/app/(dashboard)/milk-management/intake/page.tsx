"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Droplet, Scale, Milk } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/cards/StatsCard";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MilkIntakeForm } from "@/components/forms/MilkIntakeForm";
import {
  useCollections,
  useTodayCollections,
  useCollectionStats,
} from "@/hooks/api/useMilkManagement";
import { formatNumber, formatDateTime } from "@/lib/utils/formatters";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { MilkCollection, QualityStatus } from "@/types/api";

export default function MilkIntakePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: collectionsData, isLoading } = useCollections({
    page,
    search,
    page_size: 20,
  });

  const { data: todayData } = useTodayCollections();
  const { data: statsData } = useCollectionStats(1); // Today's stats

  // Use today's data for stats display
  const displayStats = {
    totalLiters: todayData?.total_quantity ?? 0,
    avgFat: statsData?.average_fat ?? 0,
    count:
      (todayData?.morning?.total_suppliers ?? 0) +
      (todayData?.evening?.total_suppliers ?? 0),
  };

  const getQualityBadge = (status: QualityStatus | string) => {
    const config: Record<QualityStatus, { label: string; className: string }> =
      {
        excellent: {
          label: "Excellent",
          className: "bg-emerald-100 text-emerald-800",
        },
        good: { label: "Good", className: "bg-green-100 text-green-800" },
        average: {
          label: "Average",
          className: "bg-yellow-100 text-yellow-800",
        },
        poor: { label: "Poor", className: "bg-orange-100 text-orange-800" },
        rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
        pending: { label: "Pending", className: "bg-blue-100 text-blue-800" },
        accepted: { label: "Accepted", className: "bg-teal-100 text-teal-800" },
      };
    const { label, className } =
      config[status as QualityStatus] ?? config.average;
    return <Badge className={className}>{label}</Badge>;
  };

  type TableRow = Omit<MilkCollection, "id"> & { id: string };

  const columns: Column<TableRow>[] = [
    {
      key: "collection_date",
      label: "Date",
      render: (val) => new Date(String(val)).toLocaleDateString(),
    },
    {
      key: "collection_id",
      label: "Collection ID",
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-dairy-blue">
          {String(val)}
        </span>
      ),
    },
    {
      key: "supplier_name",
      label: "Supplier",
      render: (val) => (
        <span className="font-medium">{String(val) || "—"}</span>
      ),
    },
    {
      key: "collection_time",
      label: "Time",
      render: (val) => (
        <Badge variant="outline" className="capitalize">
          {String(val).substring(0, 5)}
        </Badge>
      ),
    },
    {
      key: "quantity",
      label: "Quantity (L)",
      render: (val) => (
        <span className="font-semibold">{formatNumber(Number(val))}</span>
      ),
    },
    {
      key: "fat_percentage",
      label: "Fat %",
      render: (val) => (
        <div className="flex items-center gap-1">
          <Droplet className="h-3 w-3 text-dairy-orange" />
          <span>{Number(val).toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: "snf_percentage",
      label: "SNF %",
      render: (val) => <span>{Number(val).toFixed(1)}%</span>,
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (val) => `₹${formatNumber(Number(val))}`,
    },
    {
      key: "quality_status",
      label: "Quality",
      render: (val) => getQualityBadge(String(val)),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-dairy-charcoal sm:gap-3 sm:text-3xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Milk className="h-6 w-6 text-dairy-blue sm:h-8 sm:w-8" />
            </motion.div>
            Milk Intake & Recording
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage daily milk procurement
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-10 w-full bg-gradient-to-r from-dairy-blue to-dairy-darkBlue hover:from-dairy-darkBlue hover:to-dairy-blue sm:h-11 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Record new intake
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <StatsCard
            title="Today's total intake"
            value={displayStats.totalLiters}
            icon={Scale}
            color="blue"
            change={12.5}
            changeLabel="vs yesterday"
            valueSuffix="L"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Average fat %"
            value={displayStats.avgFat}
            icon={Droplet}
            color="orange"
            change={2.3}
            changeLabel="vs last week"
            valueSuffix="%"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Collections count"
            value={displayStats.count}
            icon={Milk}
            color="green"
            valueSuffix=""
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Average per collection"
            value={
              displayStats.count > 0
                ? Number(
                    (displayStats.totalLiters / displayStats.count).toFixed(1),
                  )
                : 0
            }
            icon={Scale}
            color="purple"
            valueSuffix="L"
          />
        </motion.div>
      </motion.div>

      <DataTable
        columns={columns}
        data={
          collectionsData?.results.map((c) => ({ ...c, id: String(c.id) })) ??
          []
        }
        isLoading={isLoading}
        pagination={
          collectionsData
            ? {
                page,
                totalPages: Math.ceil(
                  collectionsData.count / (collectionsData.results.length || 1),
                ),
                onPageChange: setPage,
              }
            : undefined
        }
        onSearch={setSearch}
        onExport={() => {
          console.log("Export");
        }}
        searchPlaceholder="Search by collection ID, vendor..."
        emptyIcon={Milk}
        emptyTitle="No milk collection records found"
        emptyDescription="Start by recording your first milk collection"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Droplet className="h-6 w-6 text-dairy-blue" />
              Record milk intake
            </DialogTitle>
          </DialogHeader>
          <MilkIntakeForm
            onSuccess={() => {
              setIsModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
