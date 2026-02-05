"use client";

import { useState } from "react";
import { useVendors, useDeleteVendor } from "@/lib/hooks/api/useProcurement";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VendorsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch vendors with filters
  const { data, isLoading, error } = useVendors({
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Delete mutation
  const deleteVendor = useDeleteVendor();

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    deleteVendor.mutate(id);
  };

  if (error) {
    toast.error("Failed to load vendors");
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">Manage your milk suppliers</p>
        </div>
        <Link href="/vendors/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[170px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 w-full sm:w-auto">
            Total:{" "}
            <span className="font-semibold ml-1">{data?.count || 0}</span>{" "}
            vendors
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data && data.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.results.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No vendors found</p>
          <Link href="/vendors/new">
            <Button className="mt-4">Add Your First Vendor</Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {data && data.count > 10 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" disabled={!data.previous}>
            Previous
          </Button>
          <Button variant="outline" disabled={!data.next}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Vendor Card Component
function VendorCard({ vendor, onDelete }: any) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {vendor.company_name}
          </h3>
          <p className="text-sm text-gray-600">{vendor.vendor_id}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            statusColors[vendor.status as keyof typeof statusColors]
          }`}
        >
          {vendor.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{vendor.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{vendor.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="capitalize">{vendor.category}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="text-lg font-bold text-gray-900">
            ₹{vendor.outstanding_balance || "0.00"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Purchases</p>
          <p className="text-sm font-semibold text-gray-700">
            ₹{vendor.total_purchases || "0.00"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold">
            {vendor.rating || "N/A"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/vendors/${vendor.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(vendor.id, vendor.company_name)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
