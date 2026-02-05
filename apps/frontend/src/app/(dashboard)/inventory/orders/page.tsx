"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

export default function InventoryOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // TODO: Replace with actual API data
  const orders = [
    {
      id: 1,
      poNumber: "PO-20260205-0001",
      vendor: "ABC Suppliers",
      date: "2026-02-05",
      items: 5,
      total: 25000,
      status: "approved",
    },
    {
      id: 2,
      poNumber: "PO-20260204-0012",
      vendor: "XYZ Traders",
      date: "2026-02-04",
      items: 3,
      total: 15000,
      status: "pending_approval",
    },
    {
      id: 3,
      poNumber: "PO-20260203-0008",
      vendor: "Fresh Supplies Co.",
      date: "2026-02-03",
      items: 8,
      total: 42000,
      status: "fully_received",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      pending_approval: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      sent: "bg-purple-100 text-purple-800",
      confirmed: "bg-indigo-100 text-indigo-800",
      partially_received: "bg-orange-100 text-orange-800",
      fully_received: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#5D4037] flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-[#8B5A3C]" />
            Purchase Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage purchase orders from suppliers
          </p>
        </div>
        <Button className="w-full sm:w-auto bg-[#8B5A3C] hover:bg-[#5D4037]">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="partially_received">Partially Received</SelectItem>
                  <SelectItem value="fully_received">Fully Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table - Desktop */}
      <motion.div
        className="hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.poNumber}</TableCell>
                  <TableCell>{order.vendor}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>₹{order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Orders Cards - Mobile/Tablet */}
      <motion.div
        className="lg:hidden space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {orders.map((order) => (
          <motion.div key={order.id} variants={staggerItem}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{order.poNumber}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{order.vendor}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{order.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <p className="font-medium">{order.items}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Total:</span>
                    <p className="text-lg font-bold text-[#5D4037]">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
