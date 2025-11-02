"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  User,
  Edit,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useBatch,
  useUpdateBatch,
  useDeleteBatch,
} from "@/lib/hooks/api/useProduction";
import Link from "next/link";

// Status configuration
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

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = parseInt(params.batch_id as string);

  const { data: batch, isLoading, error } = useBatch(batchId);
  const updateBatch = useUpdateBatch();
  const deleteBatch = useDeleteBatch();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A3C]"></div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Batch Not Found
            </CardTitle>
            <CardDescription>
              The batch you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/production/batches">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Batches
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[batch.batch_status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  // Status transition logic
  const canTransitionTo = (newStatus: string) => {
    const transitions: Record<string, string[]> = {
      in_progress: ["completed", "quality_check"],
      completed: ["quality_check"],
      quality_check: ["approved", "rejected"],
      approved: [],
      rejected: [],
    };
    return transitions[batch.batch_status]?.includes(newStatus) || false;
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateBatch.mutate({
      id: batchId,
      data: { batch_status: newStatus as any },
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteBatch.mutate(batchId, {
      onSuccess: () => {
        router.push("/production/batches");
      },
      onSettled: () => {
        setIsDeleting(false);
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link href="/production/batches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#5D4037] flex items-center gap-3">
              <Package className="w-8 h-8 text-[#8B5A3C]" />
              {batch.batch_number}
            </h1>
            <p className="text-gray-600 mt-1">{batch.product_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${status.color} text-sm`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {status.label}
          </Badge>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Production Batch?</DialogTitle>
                <DialogDescription>
                  This will permanently delete batch {batch.batch_number}. This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Batch"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Production Status Timeline</CardTitle>
                <CardDescription>
                  Track the batch through its lifecycle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {Object.entries(statusConfig).map(([key, config], index) => {
                    const Icon = config.icon;
                    const isActive = key === batch.batch_status;
                    const isPast =
                      Object.keys(statusConfig).indexOf(key) <
                      Object.keys(statusConfig).indexOf(batch.batch_status);

                    return (
                      <div key={key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                              isActive
                                ? config.color
                                : isPast
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-400 border-gray-200"
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-medium mt-2 text-center">
                            {config.label}
                          </p>
                          {isActive && (
                            <p className="text-xs text-gray-500 mt-1">
                              Current
                            </p>
                          )}
                          {isPast && (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                          )}
                        </div>
                        {index < Object.keys(statusConfig).length - 1 && (
                          <ArrowRight
                            className={`w-5 h-5 ${
                              isPast ? "text-green-400" : "text-gray-300"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Transition Actions */}
          {(canTransitionTo("completed") ||
            canTransitionTo("quality_check") ||
            canTransitionTo("approved") ||
            canTransitionTo("rejected")) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Available Actions
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Update the batch status to the next stage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {canTransitionTo("completed") && (
                      <Button
                        onClick={() => handleStatusUpdate("completed")}
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={updateBatch.isPending}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
                    {canTransitionTo("quality_check") && (
                      <Button
                        onClick={() => handleStatusUpdate("quality_check")}
                        className="bg-yellow-600 hover:bg-yellow-700"
                        disabled={updateBatch.isPending}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Move to Quality Check
                      </Button>
                    )}
                    {canTransitionTo("approved") && (
                      <Button
                        onClick={() => handleStatusUpdate("approved")}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updateBatch.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Batch
                      </Button>
                    )}
                    {canTransitionTo("rejected") && (
                      <Button
                        onClick={() => handleStatusUpdate("rejected")}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        disabled={updateBatch.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Batch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Batch Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
                <CardDescription>
                  Production details and specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Batch Number</p>
                    <p className="font-mono font-semibold text-[#5D4037]">
                      {batch.batch_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Product</p>
                    <p className="font-medium">{batch.product_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Production Date
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {format(new Date(batch.production_date), "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {format(new Date(batch.expiry_date), "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Quantity Produced
                    </p>
                    <p className="font-semibold text-lg">
                      {batch.quantity_produced.toLocaleString()} {batch.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Raw Material Used
                    </p>
                    <p className="font-semibold text-lg">
                      {batch.raw_material_used.toLocaleString()} Liters
                    </p>
                  </div>
                </div>

                {batch.remarks && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Remarks</p>
                    <p className="text-gray-700">{batch.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quality Information */}
          {batch.quality_rating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Quality Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">
                        Quality Rating
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-600 h-3 rounded-full"
                            style={{
                              width: `${(batch.quality_rating / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {batch.quality_rating}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Cost Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost per Unit</span>
                  <span className="font-medium">
                    ₹{batch.cost_per_unit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <span className="font-medium">
                    {batch.quantity_produced.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Cost</span>
                    <span className="text-xl font-bold text-[#8B5A3C]">
                      ₹{batch.total_cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Supervisor Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {batch.supervisor_name || "Not assigned"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supervisor ID: {batch.supervisor}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timestamps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm">
                    {format(new Date(batch.created_at), "PPp")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm">
                    {format(new Date(batch.updated_at), "PPp")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
