"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  Factory,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBatches, useProducts } from "@/lib/hooks/api/useProduction";
import type { ProductionBatch } from "@/lib/services/production.service";

// Status configuration with 5 states
const statusConfig = {
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
    description: "Currently being produced",
  },
  completed: {
    label: "Completed",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Package,
    description: "Production finished",
  },
  quality_check: {
    label: "Quality Check",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
    description: "Under quality inspection",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    description: "Quality approved",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    description: "Quality rejected",
  },
};

export default function BatchesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: batchesData, isLoading } = useBatches();
  const { data: productsData } = useProducts();

  const batches = batchesData?.results || [];

  // Filter batches
  const filteredBatches = batches.filter((batch: ProductionBatch) => {
    const matchesSearch =
      batch.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      batch.product_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || batch.batch_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: batches.length,
    in_progress: batches.filter(
      (b: ProductionBatch) => b.batch_status === "in_progress",
    ).length,
    quality_check: batches.filter(
      (b: ProductionBatch) => b.batch_status === "quality_check",
    ).length,
    approved: batches.filter(
      (b: ProductionBatch) => b.batch_status === "approved",
    ).length,
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#5D4037] flex items-center gap-3">
            <Factory className="w-8 h-8 text-[#8B5A3C]" />
            Production Batches
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage production batches with quality tracking
          </p>
        </div>
        <Link href="/production/batches/create">
          <Button className="bg-[#8B5A3C] hover:bg-[#5D4037] h-11">
            <Plus className="w-4 h-4 mr-2" />
            Create New Batch
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Batches
            </CardTitle>
            <Package className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#5D4037]">
              {stats.total}
            </div>
            <p className="text-xs text-gray-500 mt-1">All production batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Progress
            </CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.in_progress}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently producing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Quality Check
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.quality_check}
            </div>
            <p className="text-xs text-gray-500 mt-1">Under inspection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <p className="text-xs text-gray-500 mt-1">Quality approved</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Production Workflow</CardTitle>
            <CardDescription>5-stage batch status progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-2">
              {Object.entries(statusConfig).map(([key, config], index) => {
                const Icon = config.icon;
                const count = batches.filter(
                  (b: ProductionBatch) => b.batch_status === key,
                ).length;

                return (
                  <div key={key} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color} border-2`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-medium mt-2 text-center">
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-500">{count} batches</p>
                    </div>
                    {index < Object.keys(statusConfig).length - 1 && (
                      <ArrowRight className="w-5 h-5 text-gray-300 -mt-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by batch number or product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Production Batches</CardTitle>
            <CardDescription>
              {filteredBatches.length} of {batches.length} batches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5A3C]"></div>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No batches found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {search || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first production batch"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Production Date</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Quality Rating</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBatches.map((batch: ProductionBatch) => {
                        const status =
                          statusConfig[
                            batch.batch_status as keyof typeof statusConfig
                          ];
                        const StatusIcon = status.icon;

                        return (
                          <TableRow key={batch.id}>
                            <TableCell>
                              <div className="font-mono text-sm font-semibold text-[#5D4037]">
                                {batch.batch_number}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {batch.product_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(batch.production_date), "PPP")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {batch.quantity_produced.toLocaleString()}{" "}
                                {batch.unit}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={status.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {batch.quality_rating ? (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium">
                                    {batch.quality_rating}/10
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                ₹{batch.total_cost.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/production/batches/${batch.id}`}>
                                <Button variant="ghost" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card Layout */}
                <div className="lg:hidden space-y-4">
                  {filteredBatches.map((batch: ProductionBatch) => {
                    const status =
                      statusConfig[
                        batch.batch_status as keyof typeof statusConfig
                      ];
                    const StatusIcon = status.icon;

                    return (
                      <Card key={batch.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Batch Number
                              </p>
                              <p className="font-mono text-sm font-semibold text-[#5D4037]">
                                {batch.batch_number}
                              </p>
                            </div>
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Product
                              </p>
                              <p className="font-medium text-sm">
                                {batch.product_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Quantity
                              </p>
                              <p className="text-sm">
                                {batch.quantity_produced.toLocaleString()}{" "}
                                {batch.unit}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Production Date
                              </p>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                {format(new Date(batch.production_date), "PP")}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Quality Rating
                              </p>
                              {batch.quality_rating ? (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-green-600" />
                                  <span className="text-sm font-medium">
                                    {batch.quality_rating}/10
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  N/A
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Total Cost
                              </p>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <DollarSign className="w-3 h-3 text-gray-400" />
                                ₹{batch.total_cost.toLocaleString()}
                              </div>
                            </div>
                            <Link href={`/production/batches/${batch.id}`}>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {batchesData && batchesData.count > 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-gray-600">
            Showing {filteredBatches.length} of {batchesData.count} batches
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
